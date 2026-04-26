/**
 * <sol-wac> — Web Access Control (WAC) editor.
 *
 * Displays and edits the ACL for a Solid resource. Renders two subtabs:
 *   - Form: one row per role (viewer/poster/editor/owner) with a grant
 *     select (nobody / specific / authenticated / public) and an inline
 *     WebID+group panel for the "specific" case. A container-only checkbox
 *     toggles acl:default (apply to contents).
 *   - RDF: raw Turtle in a textarea.
 *
 * Attributes:
 *   source       — resource URL whose ACL should be loaded
 *
 * Properties:
 *   fetchFn      — authenticated fetch (defaults to window.fetch)
 *   source       — mirror of the `source` attribute
 *
 * Methods:
 *   load()       — (re)load the ACL from the server
 *   save()       — PUT the current Turtle to the resolved ACL URL
 *
 * Events (bubbling, composed):
 *   sol-wac-save   — ACL saved successfully ({ aclUrl })
 *   sol-wac-error  — load or save failed ({ phase, error })
 *   sol-status     — human-readable status ({ message, type })
 */

import { define } from '@solid-components/core/define.js';
import { ensureDocStyle } from '@solid-components/core/adopt.js';
import { CSS as WAC_CSS } from './styles/sol-wac-css.js';
import { rdf } from '@solid-components/core/rdf.js';
import './sol-tabs.js';

// ── ACL constants ─────────────────────────────────────────────────────

const ACL = 'http://www.w3.org/ns/auth/acl#';
const FOAF = 'http://xmlns.com/foaf/0.1/';
const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';

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

// ── ACL parsing ───────────────────────────────────────────────────────

export function parseAcl(turtleText, baseUrl) {
  const store = rdf.graph();
  try {
    rdf.parse(turtleText, store, baseUrl, 'text/turtle');
  } catch (e) {
    return [];
  }

  const authSubjects = store
    .each(null, rdf.sym(RDF_TYPE), rdf.sym(ACL + 'Authorization'), null)
    .map(s => s.value);

  const vals = (subject, pred) =>
    store.each(rdf.sym(subject), rdf.sym(pred), null, null).map(n => n.value);

  const auths = [];
  for (const subject of new Set(authSubjects)) {
    const auth = {
      subject,
      modes:        vals(subject, ACL + 'mode'),
      agents:       vals(subject, ACL + 'agent'),
      agentClasses: vals(subject, ACL + 'agentClass'),
      agentGroups:  vals(subject, ACL + 'agentGroup'),
      accessTo:     vals(subject, ACL + 'accessTo'),
      default:      vals(subject, ACL + 'default'),
    };
    if (auth.modes.length > 0) auths.push(auth);
  }
  return auths;
}

function _bestRoleForModes(modes) {
  const has = m => modes.includes(ACL + m);
  if (has('Control')) return 'owner';
  if (has('Write'))   return 'editor';
  if (has('Append'))  return 'poster';
  if (has('Read'))    return 'viewer';
  return null;
}

export function authsToRoleModel(auths) {
  const model = {};
  ROLES.forEach(r => {
    model[r.key] = { grant: 'nobody', webids: [], groups: [], applyToContents: false };
  });

  for (const auth of auths) {
    const roleKey = _bestRoleForModes(auth.modes);
    if (!roleKey) continue;
    const rm = model[roleKey];
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
  const blocks = inheritedTurtle.split(/\n\s*\n/);
  const kept = blocks.filter(b => {
    const t = b.trim();
    if (!t) return false;
    if (/^@(prefix|base)\b/.test(t)) return true;
    return /\bacl:default\b/.test(b);
  });
  let out = kept.join('\n\n');
  const escaped = parentUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  out = out.replace(new RegExp(`<${escaped}>`, 'g'), `<${resourceUrl}>`);
  return out;
}

// ── Component ─────────────────────────────────────────────────────────

/**
 * Web Access Control (WAC) editor.
 *
 * Displays and edits the ACL for a Solid resource. Renders a form
 * subtab (role-based) and an RDF subtab (raw Turtle).
 *
 * @class SolWac
 * @extends HTMLElement
 * @attr {string} source - resource URL whose ACL should be loaded
 * @property {Function} fetchFn - authenticated fetch (defaults to window.fetch)
 * @fires sol-wac-save - detail: { aclUrl }; ACL saved
 * @fires sol-wac-error - detail: { phase, error }; load or save failed
 * @fires sol-status - detail: { message, type }
 */
class SolWac extends HTMLElement {
  static get observedAttributes() { return ['source']; }

  constructor() {
    super();
    this._fetchFn = null;
    this._aclUrl = null;
    this._turtle = '';
    this._model = null;
    this._isContainer = false;
    this._inherited = null;
    this._inheritedFrom = null;
    this._rendered = false;
  }

  get source() { return this.getAttribute('source') || ''; }
  set source(v) { if (v) this.setAttribute('source', v); else this.removeAttribute('source'); }

  get fetchFn() { return this._fetchFn || (typeof fetch !== 'undefined' ? fetch.bind(globalThis) : null); }
  set fetchFn(fn) { this._fetchFn = fn; if (this._rendered) this.load(); }

  connectedCallback() {
    ensureDocStyle(this.getRootNode(), 'sol-wac-styles', WAC_CSS);
    if (this._rendered) return;
    this._rendered = true;
    if (this.source) this.load();
  }

  attributeChangedCallback(name, _old, _new) {
    if (name === 'source' && this._rendered) this.load();
  }

  async load() {
    const url = this.source;
    if (!url) return;
    this._isContainer = url.endsWith('/');
    this.innerHTML = '<div class="acl-banner">Loading permissions…</div>';

    let perms;
    try {
      perms = await getPermissions(url, this.fetchFn);
    } catch (e) {
      this.innerHTML = `<div class="acl-error">Failed to load ACL: ${e.message}</div>`;
      this._emit('sol-wac-error', { phase: 'load', error: e });
      return;
    }

    this._aclUrl = perms.aclUrl;
    this._inherited = perms.inherited || null;
    this._inheritedFrom = perms.inheritedFrom || null;

    if (perms.own) {
      this._turtle = perms.own;
    } else if (perms.inherited) {
      this._turtle = adaptInheritedAcl(perms.inherited, perms.inheritedFrom, url) || perms.inherited;
    } else {
      this._turtle = '';
    }

    this._model = authsToRoleModel(this._turtle ? parseAcl(this._turtle, url) : []);
    this._render();
  }

  async save() {
    if (!this._aclUrl) return;
    if (this._model) this._turtle = roleModelToTurtle(this._model, this.source);
    try {
      const resp = await this.fetchFn(this._aclUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'text/turtle' },
        body: this._turtle,
      });
      if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`);
      this._emit('sol-wac-save', { aclUrl: this._aclUrl });
      this._emit('sol-status', { message: 'ACL saved.', type: 'success' });
      this._inherited = null;
      this._inheritedFrom = null;
      this._renderBanner();
    } catch (e) {
      this._emit('sol-wac-error', { phase: 'save', error: e });
      this._emit('sol-status', { message: `ACL save failed: ${e.message}`, type: 'error' });
    }
  }

  // ── Rendering ───────────────────────────────────────────────────────

  _render() {
    this.innerHTML = '';

    this._bannerEl = document.createElement('div');
    this._renderBanner();
    this.appendChild(this._bannerEl);

    const subtabs = document.createElement('sol-tabs');
    subtabs.setAttribute('variant', 'sub');
    subtabs.tabs = [
      { name: 'Form', render: (body) => this._renderForm(body) },
      { name: 'RDF',  render: (body) => this._renderRdf(body) },
    ];
    this.appendChild(subtabs);

    // sol-tabs renders lazily; dispatch once it's ready
    queueMicrotask(() => {
      subtabs.switchTab('Form');
      const bar = subtabs.querySelector(':scope > .sol-tabs-bar');
      if (bar && !bar.querySelector('.acl-save-btn')) {
        const saveBtn = document.createElement('button');
        saveBtn.className = 'sol-btn sol-btn-sm sol-btn-primary acl-save-btn';
        saveBtn.textContent = 'Save ACL';
        saveBtn.onclick = () => this.save();
        bar.appendChild(saveBtn);
      }
    });

  }

  _renderBanner() {
    if (!this._bannerEl) return;
    if (this._inherited && this._inheritedFrom) {
      this._bannerEl.className = 'acl-banner';
      this._bannerEl.textContent =
        `Inheriting permissions from ${this._inheritedFrom}. Save to create a resource-specific ACL.`;
      this._bannerEl.style.display = '';
    } else {
      this._bannerEl.textContent = '';
      this._bannerEl.style.display = 'none';
    }
  }

  _renderForm(body) {
    body.innerHTML = '';
    body.appendChild(this._buildRoleForm(this._model, this._isContainer, () => {
      this._turtle = roleModelToTurtle(this._model, this.source);
    }));
  }

  _renderRdf(body) {
    body.innerHTML = '';
    const ta = document.createElement('textarea');
    ta.className = 'acl-rdf-editor';
    ta.spellcheck = false;
    ta.value = this._turtle;
    ta.addEventListener('input', () => {
      this._turtle = ta.value;
      // Re-parse so the form view reflects manual edits on next switch.
      try {
        this._model = authsToRoleModel(parseAcl(ta.value, this.source));
      } catch (_) { /* leave model as-is on parse error */ }
    });
    body.appendChild(ta);
  }

  _buildRoleForm(model, isContainer, onChange) {
    const wrap = document.createElement('div');
    wrap.className = 'acl-role-form';

    ROLES.forEach(role => {
      const rm = model[role.key];
      const row = document.createElement('div');
      row.className = 'acl-role-row';

      const nameEl = document.createElement('span');
      nameEl.className = 'acl-role-name';
      nameEl.textContent = role.label;

      const select = document.createElement('select');
      select.className = 'acl-grant-select';
      GRANT_OPTIONS.forEach(opt => {
        const o = document.createElement('option');
        o.value = opt.value; o.textContent = opt.label;
        select.appendChild(o);
      });
      select.value = rm.grant;

      const countBadge = document.createElement('span');
      countBadge.className = 'acl-specific-count';
      const updateCount = () => {
        const c = rm.webids.length + rm.groups.length;
        countBadge.textContent = c;
        countBadge.style.display = c > 0 ? '' : 'none';
      };
      updateCount();

      const panel = this._buildSpecificPanel(rm, onChange, updateCount);
      const showPanel = () => { panel.style.display = ''; };
      const hidePanel = () => { panel.style.display = 'none'; };
      if (rm.grant === 'specific') showPanel(); else hidePanel();

      select.addEventListener('change', () => {
        rm.grant = select.value;
        if (select.value === 'specific') showPanel(); else hidePanel();
        onChange();
      });

      row.append(nameEl, select, countBadge);
      wrap.appendChild(row);
      wrap.appendChild(panel);
    });

    if (isContainer) {
      const cbWrap = document.createElement('label');
      cbWrap.className = 'acl-default-wrap acl-default-global';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = ROLES.some(r => model[r.key].applyToContents);
      cb.onchange = () => {
        ROLES.forEach(r => { model[r.key].applyToContents = cb.checked; });
        onChange();
      };
      cbWrap.appendChild(cb);
      cbWrap.appendChild(document.createTextNode('\u00A0Apply to folder contents (acl:default)'));
      wrap.appendChild(cbWrap);
    }
    return wrap;
  }

  _buildSpecificPanel(rm, onChange, onUpdate) {
    const panel = document.createElement('div');
    panel.className = 'acl-specific-panel';
    panel.innerHTML = `
      <div class="acl-section-label">WebIDs (one per line):</div>
      <textarea class="acl-agents-input" rows="3" placeholder="https://example.solidcommunity.net/profile/card#me"></textarea>
      <div class="acl-section-label">vCard group URLs (one per line):</div>
      <textarea class="acl-agents-input" rows="2" placeholder="https://example.solidcommunity.net/contacts/Group/friends#this"></textarea>`;

    const [webidTA, groupTA] = panel.querySelectorAll('textarea');
    webidTA.value = rm.webids.join('\n');
    groupTA.value = rm.groups.join('\n');

    const sync = () => {
      rm.webids = webidTA.value.split('\n').map(s => s.trim()).filter(Boolean);
      rm.groups = groupTA.value.split('\n').map(s => s.trim()).filter(Boolean);
      onChange();
      if (onUpdate) onUpdate();
    };
    webidTA.addEventListener('input', sync);
    groupTA.addEventListener('input', sync);
    return panel;
  }

  _emit(type, detail) {
    this.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail }));
  }
}

define('sol-wac', SolWac);
export { SolWac };
export default SolWac;
