/**
 * Pod operations — container listing, file operations, discovery.
 * Shared utility used by <sol-pod>.
 * Uses rdflib via the lazy-load pattern from shared/rdf-utils.js.
 */

import { getRdflib } from './rdf-utils.js';

const LDP_CONTAINS = 'http://www.w3.org/ns/ldp#contains';
const OWL_SAME_AS  = 'http://www.w3.org/2002/07/owl#sameAs';
const PIM_STORAGE  = 'http://www.w3.org/ns/pim/space#storage';

// ── MIME types ────────────────────────────────────────────────────────

export const MIME_TYPES = {
  ttl:'text/turtle', n3:'text/n3', jsonld:'application/ld+json',
  json:'application/json', html:'text/html', xml:'application/xml',
  txt:'text/plain', md:'text/markdown', csv:'text/csv',
  png:'image/png', jpg:'image/jpeg', jpeg:'image/jpeg', gif:'image/gif',
  svg:'image/svg+xml', pdf:'application/pdf',
  js:'application/javascript', css:'text/css',
};

/** Extension extraction supporting $.ext convention. */
export function extOf(name) {
  const m = name.match(/\$\.([^.]+)$/);
  if (m) return m[1].toLowerCase();
  return name.includes('.') ? name.split('.').pop().toLowerCase() : '';
}

export function contentTypeFor(name, blobType) {
  if (blobType) return blobType;
  return MIME_TYPES[extOf(name)] || 'application/octet-stream';
}

// ── Fetch with timeout ────────────────────────────────────────────────

export function withTimeout(fetchFn, ms = 30000) {
  return async (url, options = {}) => {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), ms);
    try {
      return await fetchFn(url, { ...options, signal: ctrl.signal });
    } catch (e) {
      if (e.name === 'AbortError') throw new Error(`Request timed out after ${ms / 1000}s: ${url}`);
      throw e;
    } finally { clearTimeout(id); }
  };
}

// ── Container listing ─────────────────────────────────────────────────

async function fetchContainerRaw(url, fetchFn) {
  const $rdf = await getRdflib();
  const timedFetch = withTimeout(fetchFn, 30000);
  const resp = await timedFetch(url, { headers: { Accept: 'text/turtle' } });
  if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`);
  const text = await resp.text();

  const store = $rdf.graph();
  $rdf.parse(text, store, url, 'text/turtle');
  return store.each($rdf.sym(url), $rdf.sym(LDP_CONTAINS), null, null).map(n => n.value);
}

function mapResources(resourceUrls) {
  return resourceUrls.map(url => {
    const isContainer = url.endsWith('/');
    const name = isContainer ? url.split('/').slice(-2)[0] : url.split('/').pop();
    return { url, name, isContainer };
  }).sort((a, b) => {
    if (a.isContainer === b.isContainer) return a.name.localeCompare(b.name);
    return a.isContainer ? -1 : 1;
  });
}

export async function fetchContainer(url, fetchFn) {
  const urls = await fetchContainerRaw(url, fetchFn);
  return mapResources(urls);
}

// ── File operations ───────────────────────────────────────────────────

export async function copyFile(sourceUrl, targetContainerUrl, fileName, sourceFetchFn, targetFetchFn) {
  const sf = withTimeout(sourceFetchFn, 60000);
  const resp = await sf(sourceUrl);
  if (!resp.ok) throw new Error(`GET ${sourceUrl} failed: ${resp.status}`);
  const blob = await resp.blob();

  const targetUrl = targetContainerUrl + fileName;
  const tf = withTimeout(targetFetchFn, 60000);
  const put = await tf(targetUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentTypeFor(fileName, blob.type) },
    body: blob
  });
  if (!put.ok) {
    const err = new Error(`PUT failed: ${put.status}`);
    err.needsAuth = put.status === 401 || put.status === 403;
    throw err;
  }
  return { success: true };
}

export async function copyFolder(sourceUrl, targetContainerUrl, folderName, fetchFnForUrl, onProgress) {
  const targetFolderUrl = targetContainerUrl + folderName + '/';
  if (onProgress) onProgress(`Copying folder ${folderName}...`);

  const sourceFetch = fetchFnForUrl(sourceUrl);
  let childUrls;
  try {
    childUrls = await fetchContainerRaw(sourceUrl, sourceFetch);
  } catch (e) {
    return { success: false, error: e.message };
  }

  // Create target folder
  const tf = withTimeout(fetchFnForUrl(targetContainerUrl), 30000);
  const mkdir = await tf(targetFolderUrl, {
    method: 'PUT', headers: { 'Content-Type': 'text/turtle' }, body: ''
  });
  if (!mkdir.ok && mkdir.status !== 409) {
    return { success: false, error: `Failed to create folder: ${mkdir.status}` };
  }

  let failed = 0;
  for (const childUrl of childUrls) {
    const isContainer = childUrl.endsWith('/');
    const name = isContainer ? childUrl.split('/').slice(-2)[0] : childUrl.split('/').pop();
    if (isContainer) {
      const r = await copyFolder(childUrl, targetFolderUrl, name, fetchFnForUrl, onProgress);
      if (!r.success) failed++;
    } else {
      if (onProgress) onProgress(`Copying ${name}...`);
      try {
        await copyFile(childUrl, targetFolderUrl, name, fetchFnForUrl(childUrl), fetchFnForUrl(targetFolderUrl));
      } catch (e) { failed++; }
    }
  }
  return { success: failed === 0, failed };
}

export async function deleteFolder(url, fetchFnForUrl) {
  let children = [];
  try { children = await fetchContainer(url, fetchFnForUrl(url)); } catch (e) {}
  for (const child of children) {
    if (child.isContainer) {
      await deleteFolder(child.url, fetchFnForUrl);
    } else {
      await fetchFnForUrl(child.url)(child.url, { method: 'DELETE' });
    }
  }
  await fetchFnForUrl(url)(url, { method: 'DELETE' });
}

// ── ACL discovery ─────────────────────────────────────────────────────

export async function getAclUrl(resourceUrl, fetchFn) {
  try {
    const resp = await fetchFn(resourceUrl, { method: 'HEAD', headers: { 'Cache-Control': 'no-cache' } });
    const link = resp.headers.get('Link') || '';
    const match = link.match(/<([^>]+)>\s*;\s*rel="acl"/);
    if (match) return new URL(match[1], resourceUrl).href;
  } catch (e) {}
  return resourceUrl + '.acl';
}

export async function getPermissions(url, fetchFn) {
  const aclUrl = await getAclUrl(url, fetchFn);
  const ownResp = await fetchFn(aclUrl, { headers: { 'Cache-Control': 'no-cache' } });
  if (ownResp.ok) {
    return { own: await ownResp.text(), aclUrl, inherited: null, inheritedFrom: null };
  }

  // Walk up to find inherited ACL
  const urlObj = new URL(url);
  let parts = urlObj.pathname.replace(/\/$/, '').split('/').filter(Boolean);
  while (parts.length > 0) {
    parts = parts.slice(0, -1);
    const parentUrl = urlObj.origin + '/' + parts.join('/') + (parts.length ? '/' : '');
    const parentAclUrl = await getAclUrl(parentUrl, fetchFn);
    const parentResp = await fetchFn(parentAclUrl, { headers: { 'Cache-Control': 'no-cache' } });
    if (parentResp.ok) {
      return { own: null, aclUrl, inherited: await parentResp.text(), inheritedFrom: parentUrl };
    }
  }
  return { own: null, aclUrl, inherited: null, inheritedFrom: null };
}

// ── WebID / storage discovery ─────────────────────────────────────────

export async function discoverOwnerWebIds(origin) {
  origin = origin || window.location.origin;
  const webIds = new Set();

  const addFromTurtle = (text, base) => {
    let m, re;
    re = /<([^>]+)>\s+(?:solid:account|<[^>]*solid[^>]*#account>)\s+<[^>]+>/g;
    while ((m = re.exec(text)) !== null) webIds.add(new URL(m[1], base).href);
    re = /(?:solid:owner|<[^>]*solid[^>]*#owner>)\s+<([^>]+)>/g;
    while ((m = re.exec(text)) !== null) webIds.add(new URL(m[1], base).href);
  };

  const addFromAcl = (text, base) => {
    const blocks = text.split(/\n\s*\n/);
    for (const block of blocks) {
      if (/acl:Control/.test(block)) {
        const re = /acl:agent\s+<([^>]+)>/g;
        let m;
        while ((m = re.exec(block)) !== null) webIds.add(new URL(m[1], base).href);
      }
    }
  };

  let metaUrl = origin + '/.meta';
  let aclUrl  = origin + '/.acl';
  try {
    const resp = await fetch(origin + '/');
    const link = resp.headers.get('Link') || '';
    const mm = link.match(/<([^>]+)>\s*;\s*rel="describedby"/);
    if (mm) metaUrl = new URL(mm[1], origin).href;
    const am = link.match(/<([^>]+)>\s*;\s*rel="acl"/);
    if (am) aclUrl = new URL(am[1], origin).href;
  } catch (e) {}

  if (webIds.size === 0) {
    try {
      const resp = await fetch(metaUrl, { headers: { Accept: 'text/turtle' } });
      if (resp.ok) addFromTurtle(await resp.text(), metaUrl);
    } catch (e) {}
  }

  if (webIds.size === 0) {
    try {
      const resp = await fetch(origin + '/.well-known/solid', {
        headers: { Accept: 'text/turtle, application/ld+json' }
      });
      if (resp.ok) {
        const text = await resp.text();
        addFromTurtle(text, origin + '/.well-known/solid');
        if (webIds.size === 0) {
          try {
            const json = JSON.parse(text);
            for (const key of ['http://www.w3.org/ns/solid/terms#owner', 'http://www.w3.org/ns/solid/terms#account']) {
              const val = json[key];
              if (Array.isArray(val)) val.forEach(v => webIds.add(v['@id'] || v));
              else if (val) webIds.add(val['@id'] || val);
            }
          } catch (e) {}
        }
      }
    } catch (e) {}
  }

  if (webIds.size === 0) {
    try {
      const resp = await fetch(aclUrl, { headers: { Accept: 'text/turtle' } });
      if (resp.ok) addFromAcl(await resp.text(), aclUrl);
    } catch (e) {}
  }

  return [...webIds];
}

export async function getStoragesFromWebIds(webIds) {
  const $rdf = await getRdflib();
  const storages = new Set();
  const visited = new Set();

  async function processWebId(webId) {
    if (visited.has(webId)) return;
    visited.add(webId);
    try {
      const profileDoc = webId.split('#')[0];
      const store = $rdf.graph();
      const fetcher = new $rdf.Fetcher(store);
      await fetcher.load(profileDoc);
      const subj = $rdf.sym(webId);
      store.each(subj, $rdf.sym(PIM_STORAGE), null, null).forEach(n => storages.add(n.value));
      const sameAs = store.each(subj, $rdf.sym(OWL_SAME_AS), null, null);
      for (const linked of sameAs) {
        await processWebId(linked.value);
      }
    } catch (e) {
      console.warn(`[pod-ops] Failed to fetch storages for ${webId}:`, e);
    }
  }

  for (const webId of webIds) await processWebId(webId);
  return [...storages].sort();
}

// ── ACL parsing ───────────────────────────────────────────────────────

const ACL = 'http://www.w3.org/ns/auth/acl#';
const FOAF = 'http://xmlns.com/foaf/0.1/';

export const ROLES = [
  { key: 'viewer',  label: 'Viewer',  modes: [ACL+'Read'] },
  { key: 'poster',  label: 'Poster',  modes: [ACL+'Read', ACL+'Append'] },
  { key: 'editor',  label: 'Editor',  modes: [ACL+'Read', ACL+'Write', ACL+'Append'] },
  { key: 'owner',   label: 'Owner',   modes: [ACL+'Read', ACL+'Write', ACL+'Append', ACL+'Control'] },
];

export const GRANT_OPTIONS = [
  { value: 'nobody',        label: 'Nobody' },
  { value: 'specific',      label: 'Specific people/groups' },
  { value: 'authenticated', label: 'Anyone logged in' },
  { value: 'public',        label: 'Everyone (public)' },
];

export function parseAcl(turtleText, baseUrl) {
  const auths = [];
  const blocks = turtleText.split(/\.\s*\n/).filter(b => b.trim());
  const ns = { acl: ACL, foaf: FOAF };

  const expand = (curie) => {
    if (curie.startsWith('<') && curie.endsWith('>')) return curie.slice(1, -1);
    const [prefix, local] = curie.split(':');
    return (ns[prefix] || '') + (local || '');
  };

  for (const block of blocks) {
    const auth = { modes: [], agents: [], agentClasses: [], agentGroups: [], accessTo: [], default: [] };
    const lines = block.split(';').map(l => l.trim());
    for (const line of lines) {
      const m = line.match(/^\s*([\w:]+|<[^>]+>)\s+(.*)/s);
      if (!m) continue;
      const pred = expand(m[1]);
      const vals = m[2].split(',').map(v => v.trim().replace(/\s*\.$/, ''));
      for (const v of vals) {
        const expanded = expand(v);
        if (pred === ACL+'mode') auth.modes.push(expanded);
        else if (pred === ACL+'agent') auth.agents.push(expanded.startsWith('http') ? expanded : new URL(expanded, baseUrl).href);
        else if (pred === ACL+'agentClass') auth.agentClasses.push(expanded);
        else if (pred === ACL+'agentGroup') auth.agentGroups.push(expanded);
        else if (pred === ACL+'accessTo') auth.accessTo.push(expanded);
        else if (pred === ACL+'default') auth.default.push(expanded);
      }
    }
    if (auth.modes.length > 0) auths.push(auth);
  }
  return auths;
}

export function authsToRoleModel(auths) {
  const model = {};
  ROLES.forEach(r => {
    model[r.key] = { grant: 'nobody', webids: [], groups: [], applyToContents: false };
  });

  for (const auth of auths) {
    const role = ROLES.slice().reverse().find(r =>
      r.modes.every(m => auth.modes.includes(m))
    );
    if (!role) continue;
    const rm = model[role.key];
    if (auth.agentClasses.includes(FOAF+'Agent')) rm.grant = 'public';
    else if (auth.agentClasses.includes(ACL+'AuthenticatedAgent')) {
      if (rm.grant !== 'public') rm.grant = 'authenticated';
    }
    else if (auth.agents.length > 0 || auth.agentGroups.length > 0) {
      if (rm.grant === 'nobody') rm.grant = 'specific';
      rm.webids = [...new Set([...rm.webids, ...auth.agents])];
      rm.groups = [...new Set([...rm.groups, ...auth.agentGroups])];
    }
    if (auth.default.length > 0) rm.applyToContents = true;
  }
  return model;
}

export function roleModelToTurtle(model, resourceUrl) {
  let turtle = '@prefix acl: <http://www.w3.org/ns/auth/acl#>.\n@prefix foaf: <http://xmlns.com/foaf/0.1/>.\n\n';
  let idx = 0;
  const isContainer = resourceUrl.endsWith('/');

  for (const role of ROLES) {
    const rm = model[role.key];
    if (rm.grant === 'nobody') continue;
    idx++;
    turtle += `<#auth${idx}>\n    a acl:Authorization;\n`;
    turtle += `    acl:accessTo <${resourceUrl}>;\n`;
    if (isContainer && rm.applyToContents) turtle += `    acl:default <${resourceUrl}>;\n`;
    turtle += `    acl:mode ${role.modes.map(m => 'acl:' + m.split('#')[1]).join(', ')};\n`;

    if (rm.grant === 'public') turtle += '    acl:agentClass foaf:Agent.\n\n';
    else if (rm.grant === 'authenticated') turtle += '    acl:agentClass acl:AuthenticatedAgent.\n\n';
    else {
      const parts = [];
      rm.webids.forEach(w => parts.push(`acl:agent <${w}>`));
      rm.groups.forEach(g => parts.push(`acl:agentGroup <${g}>`));
      turtle += '    ' + parts.join(';\n    ') + '.\n\n';
    }
  }
  return turtle;
}

export function adaptInheritedAcl(inheritedTurtle, parentUrl, resourceUrl) {
  return inheritedTurtle
    .replace(new RegExp(`<${parentUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}>`, 'g'), `<${resourceUrl}>`)
    .replace(/acl:default\s+[^;.]+[;.]\s*/g, '');
}
