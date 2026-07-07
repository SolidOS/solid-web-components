/**
 * @jest-environment jsdom
 *
 * Tests for <sol-pod-extras> — the drop-in combiner that bundles sol-pod's
 * two "document with pod" companions (sol-pod-ops + sol-wac) into one file.
 * Loading it must:
 *   - register both <sol-pod-ops> and <sol-wac> custom elements, and
 *   - re-export the SolPodOps and SolWac classes on the module's API.
 *
 * We also exercise meaningful, deterministic behaviour reachable through the
 * combiner: sol-wac's exported pure ACL helpers (parse → matrix model →
 * turtle, plus ACL-URL discovery) and sol-pod-ops's observable DOM/event
 * behaviour (default-item derivation, status/navigate events, rendered output).
 */

window.__SolSuppressDefineWarn = true;

import { SolPodOps, SolWac } from '../../web/sol-pod-extras.js';
import * as Extras from '../../web/sol-pod-extras.js';
import {
  MODES, AGENT_KINDS,
  getAclUrl, parseAcl, authsToMatrix, matrixToTurtle,
} from '../../web/sol-wac.js';

async function settle() { await new Promise(r => setTimeout(r, 20)); }
afterEach(() => { document.body.innerHTML = ''; });

// ── the combiner's own contract ──────────────────────────────────────────────

describe('sol-pod-extras — combiner', () => {
  test('re-exports the SolPodOps and SolWac classes', () => {
    expect(typeof SolPodOps).toBe('function');
    expect(typeof SolWac).toBe('function');
    expect(Extras.SolPodOps).toBe(SolPodOps);
    expect(Extras.SolWac).toBe(SolWac);
  });

  test('loading it registers both companion custom elements', () => {
    expect(customElements.get('sol-pod-ops')).toBe(SolPodOps);
    expect(customElements.get('sol-wac')).toBe(SolWac);
  });

  test('the registered classes are the re-exported ones', () => {
    const ops = document.createElement('sol-pod-ops');
    const wac = document.createElement('sol-wac');
    expect(ops).toBeInstanceOf(SolPodOps);
    expect(wac).toBeInstanceOf(SolWac);
  });
});

// ── sol-wac: exported pure ACL helpers ───────────────────────────────────────

describe('sol-wac vocab tables', () => {
  test('MODES cover read / append / write / control in matrix-column order', () => {
    expect(MODES.map(m => m.key)).toEqual(['read', 'append', 'write', 'control']);
    expect(MODES.map(m => m.uri)).toEqual([
      'http://www.w3.org/ns/auth/acl#Read',
      'http://www.w3.org/ns/auth/acl#Append',
      'http://www.w3.org/ns/auth/acl#Write',
      'http://www.w3.org/ns/auth/acl#Control',
    ]);
  });

  test('AGENT_KINDS offer user (acl:agent) and group (acl:agentGroup)', () => {
    expect(AGENT_KINDS.map(k => k.value)).toEqual(['agent', 'group']);
  });
});

describe('getAclUrl', () => {
  function headStub(linkHeader) {
    return (url, init) => Promise.resolve({
      ok: true, status: 200,
      headers: new Map([['Link', linkHeader]]),
    });
  }

  test('resolves the acl link relation against the resource URL', async () => {
    const url = await getAclUrl(
      'https://pod.example/doc.ttl',
      headStub('<doc.ttl.acl>; rel="acl"'),
    );
    expect(url).toBe('https://pod.example/doc.ttl.acl');
  });

  test('falls back to <url>.acl when no acl link is advertised', async () => {
    const url = await getAclUrl('https://pod.example/doc.ttl', headStub(''));
    expect(url).toBe('https://pod.example/doc.ttl.acl');
  });

  test('falls back to <url>.acl when the HEAD probe throws', async () => {
    const fail = () => Promise.reject(new Error('offline'));
    const url = await getAclUrl('https://pod.example/x', fail);
    expect(url).toBe('https://pod.example/x.acl');
  });
});

describe('parseAcl → authsToMatrix', () => {
  const RES = 'https://pod.example/doc.ttl';

  test('parses Authorization blocks into mode/agent/agentClass lists', () => {
    const ttl = `
@prefix acl: <http://www.w3.org/ns/auth/acl#>.
@prefix foaf: <http://xmlns.com/foaf/0.1/>.

<#a> a acl:Authorization;
    acl:accessTo <${RES}>;
    acl:mode acl:Read, acl:Write;
    acl:agent <https://alice.example/card#me>.`;
    const auths = parseAcl(ttl, RES);
    expect(auths).toHaveLength(1);
    expect(auths[0].modes).toEqual(expect.arrayContaining([
      'http://www.w3.org/ns/auth/acl#Read',
      'http://www.w3.org/ns/auth/acl#Write',
    ]));
    expect(auths[0].agents).toEqual(['https://alice.example/card#me']);
  });

  test('an authorization with no modes is dropped', () => {
    const ttl = `
@prefix acl: <http://www.w3.org/ns/auth/acl#>.
<#a> a acl:Authorization;
    acl:accessTo <${RES}>.`;
    expect(parseAcl(ttl, RES)).toEqual([]);
  });

  test('public Read checks only the Anyone row\'s read box', () => {
    const ttl = `
@prefix acl: <http://www.w3.org/ns/auth/acl#>.
@prefix foaf: <http://xmlns.com/foaf/0.1/>.
<#a> a acl:Authorization;
    acl:mode acl:Read;
    acl:agentClass foaf:Agent.`;
    const model = authsToMatrix(parseAcl(ttl, RES));
    expect(model.public).toEqual({ read: true, append: false, write: false, control: false });
    expect(model.authenticated).toEqual({ read: false, append: false, write: false, control: false });
    expect(model.agents).toEqual([]);
  });

  test('a specific agent with Control gets its own fully-checked row', () => {
    const ttl = `
@prefix acl: <http://www.w3.org/ns/auth/acl#>.
<#a> a acl:Authorization;
    acl:mode acl:Read, acl:Write, acl:Append, acl:Control;
    acl:agent <https://alice.example/card#me>.`;
    const model = authsToMatrix(parseAcl(ttl, RES));
    expect(model.agents).toEqual([{
      id: 'https://alice.example/card#me', kind: 'agent',
      modes: { read: true, append: true, write: true, control: true },
    }]);
  });

  test('an unparseable document yields no auths (and an empty model)', () => {
    const auths = parseAcl('this is not turtle', RES);
    const model = authsToMatrix(auths);
    expect(model.public).toEqual({ read: false, append: false, write: false, control: false });
    expect(model.authenticated).toEqual({ read: false, append: false, write: false, control: false });
    expect(model.agents).toEqual([]);
  });
});

describe('matrixToTurtle', () => {
  const RES = 'https://pod.example/doc.ttl';
  const CONTAINER = 'https://pod.example/folder/';

  test('emits one Authorization per row with checked modes, with accessTo', () => {
    const m = authsToMatrix([]);
    m.public.read = true;
    const ttl = matrixToTurtle(m, RES);
    expect(ttl).toContain('a acl:Authorization');
    expect(ttl).toContain(`acl:accessTo <${RES}>`);
    expect(ttl).toContain('acl:agentClass foaf:Agent.');
  });

  test('skips rows with nothing checked', () => {
    const ttl = matrixToTurtle(authsToMatrix([]), RES);
    expect(ttl).not.toContain('acl:Authorization');
  });

  test('the logged-in row uses acl:AuthenticatedAgent', () => {
    const m = authsToMatrix([]);
    m.authenticated.read = true;
    m.authenticated.append = true;
    expect(matrixToTurtle(m, RES)).toContain('acl:agentClass acl:AuthenticatedAgent.');
  });

  test('specific rows write acl:agent / acl:agentGroup lines by kind', () => {
    const m = authsToMatrix([]);
    m.agents.push(
      { id: 'https://bob.example/card#me', kind: 'agent',
        modes: { read: true, append: false, write: true, control: false } },
      { id: 'https://pod.example/contacts/Group/team#this', kind: 'group',
        modes: { read: true, append: false, write: false, control: false } },
    );
    const ttl = matrixToTurtle(m, RES);
    expect(ttl).toContain('acl:agent <https://bob.example/card#me>');
    expect(ttl).toContain('acl:agentGroup <https://pod.example/contacts/Group/team#this>');
  });

  test('acl:default is only emitted for a container with applyToContents', () => {
    const m = authsToMatrix([]);
    m.public.read = true;
    m.applyToContents = true;
    // a file URL never gets acl:default even with the flag set
    expect(matrixToTurtle(m, RES)).not.toContain('acl:default');
    // a container does
    expect(matrixToTurtle(m, CONTAINER)).toContain(`acl:default <${CONTAINER}>`);
  });

  test('round-trips: turtle → model → turtle preserves the public read box', () => {
    const m = authsToMatrix([]);
    m.public.read = true;
    const round = authsToMatrix(parseAcl(matrixToTurtle(m, RES), RES));
    expect(round.public).toEqual({ read: true, append: false, write: false, control: false });
  });
});

describe('inherited ACLs (parse + acl:default filter)', () => {
  test('only the parent\'s acl:default blocks reach the child\'s model', () => {
    const parent = 'https://pod.example/folder/';
    const inherited = `@prefix acl: <http://www.w3.org/ns/auth/acl#>.

<#a> a acl:Authorization;
    acl:agent <https://alice.example/card#me>;
    acl:accessTo <${parent}>;
    acl:default <${parent}>;
    acl:mode acl:Read.

<#b> a acl:Authorization;
    acl:agent <https://bob.example/card#me>;
    acl:accessTo <${parent}>;
    acl:mode acl:Write.`;
    const model = authsToMatrix(parseAcl(inherited, parent).filter(a => a.default.length > 0));
    // the acl:default block (alice) is inherited; the accessTo-only block (bob) is not
    expect(model.agents).toEqual([{
      id: 'https://alice.example/card#me', kind: 'agent',
      modes: { read: true, append: false, write: false, control: false },
    }]);
  });
});

// ── sol-pod-ops: observable component behaviour ──────────────────────────────

describe('sol-pod-ops — observedAttributes', () => {
  test('observes source and login', () => {
    expect(SolPodOps.observedAttributes).toEqual(['source', 'login']);
  });
});

describe('sol-pod-ops — rendering & item derivation', () => {
  test('renders a wrap/body/footer shell on connect', () => {
    const el = document.createElement('sol-pod-ops');
    document.body.appendChild(el);
    expect(el.shadowRoot.querySelector('.pod-ops-wrap')).not.toBeNull();
    expect(el.shadowRoot.querySelector('.pod-ops-body')).not.toBeNull();
    expect(el.shadowRoot.querySelector('.pod-ops-footer')).not.toBeNull();
  });

  test('a trailing-slash source is treated as a container', async () => {
    // No HEAD probe happens for containers, so this is deterministic.
    let tabsKind = null;
    const el = document.createElement('sol-pod-ops');
    // intercept tab building to capture the derived item without touching the network
    el._buildTabs = (item) => { tabsKind = item; };
    el.setAttribute('source', 'https://pod.example/stuff/');
    document.body.appendChild(el);
    await settle();
    expect(tabsKind.isContainer).toBe(true);
    expect(tabsKind.name).toBe('stuff');
  });

  test('a non-slash source is a file; HEAD content-type fills item.contentType', async () => {
    let captured = null;
    const calls = [];
    const el = document.createElement('sol-pod-ops');
    el.fetchFn = (url, init) => {
      calls.push({ url, init });
      return Promise.resolve({
        ok: true, status: 200,
        headers: new Map([['Content-Type', 'text/turtle; charset=utf-8']]),
      });
    };
    el._buildTabs = (item, effectiveName) => { captured = { item, effectiveName }; };
    el.setAttribute('source', 'https://pod.example/notes');
    document.body.appendChild(el);
    await settle();
    expect(calls[0].init.method).toBe('HEAD');
    expect(captured.item.isContainer).toBe(false);
    expect(captured.item.contentType).toBe('text/turtle');
    // no extension on the name → it gets the mapped extension appended for tab gating
    expect(captured.effectiveName).toBe('notes.ttl');
  });
});

describe('sol-pod-ops — events', () => {
  test('_emitStatus dispatches a bubbling, composed sol-status', () => {
    const el = document.createElement('sol-pod-ops');
    document.body.appendChild(el);
    let detail = null, bubbles = null;
    el.addEventListener('sol-status', (e) => { detail = e.detail; bubbles = e.bubbles; });
    el._emitStatus('Saved.', 'success');
    expect(detail).toEqual({ message: 'Saved.', type: 'success' });
    expect(bubbles).toBe(true);
  });

  test('_emitNavigate points a file back at its containing folder', () => {
    const el = document.createElement('sol-pod-ops');
    document.body.appendChild(el);
    let detail = null;
    el.addEventListener('sol-navigate', (e) => { detail = e.detail; });
    el._emitNavigate({ url: 'https://pod.example/dir/file.ttl', isContainer: false });
    expect(detail.url).toBe('https://pod.example/dir/');
  });

  test('_emitNavigate points a container back at its parent', () => {
    const el = document.createElement('sol-pod-ops');
    document.body.appendChild(el);
    let detail = null;
    el.addEventListener('sol-navigate', (e) => { detail = e.detail; });
    el._emitNavigate({ url: 'https://pod.example/dir/sub/', isContainer: true });
    expect(detail.url).toBe('https://pod.example/dir/');
  });
});

describe('sol-pod-ops — fetch selection', () => {
  test('_fetchFor prefers an explicit fetchFn over login and global fetch', () => {
    const el = document.createElement('sol-pod-ops');
    const mine = () => {};
    el.fetchFn = mine;
    expect(el._fetchFor('https://pod.example/x')).toBe(mine);
  });

  test('_fetchFor delegates to a login element\'s fetchFor when present', () => {
    const el = document.createElement('sol-pod-ops');
    let askedFor = null;
    el._login = { fetchFor: (u) => { askedFor = u; return 'login-fetch'; } };
    expect(el._fetchFor('https://pod.example/y')).toBe('login-fetch');
    expect(askedFor).toBe('https://pod.example/y');
  });
});
