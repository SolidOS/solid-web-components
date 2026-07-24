/**
 * loadReferencedDocs scoping (2026-07-21): the store may be the app-wide
 * singleton, so the sweep must only follow membership stated in THIS call's
 * documents (root doc + docs the call itself fetched). Lists from other docs
 * — e.g. the settings doc's #Issuers, whose members are login endpoints —
 * must never be dereferenced. Docs that fail to load are fetched once, not
 * once per round.
 *
 * The shared MockStore has no statementsMatching (the loader deliberately
 * no-ops on it), so these tests use a tiny graph-aware store of their own.
 */
import { jest } from '@jest/globals';
import { sym } from '../__mocks__/rdflib-esm.js';
import { loadReferencedDocs } from '../../core/menu-rdf.js';

const SCHEMA = 'http://schema.org/';
const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';

const MENU_DOC = 'http://pod.test/menu.ttl';
const CATALOG_DOC = 'http://pod.test/catalog.ttl';
const SETTINGS_DOC = 'http://pod.test/settings.ttl';
const ISSUER = 'https://issuer.test';

function graphStore() {
  const statements = [];
  return {
    statements,
    add(s, p, o, g = null) { statements.push({ subject: s, predicate: p, object: o, why: g }); },
    statementsMatching(s, p, o) {
      return statements.filter((st) =>
        (!s || st.subject.value === s.value) &&
        (!p || st.predicate.value === p.value) &&
        (!o || st.object.value === o.value));
    },
    any(s, p, o) {
      const r = this.statementsMatching(s, p, o);
      return r.length ? r[0].object : null;
    },
  };
}

// Membership in the root menu doc + an issuer list in the settings doc.
function seededStore() {
  const store = graphStore();
  const elem = sym(SCHEMA + 'itemListElement');
  const item = sym(SCHEMA + 'item');
  store.add(sym(MENU_DOC + '#Menu'), elem, sym(CATALOG_DOC + '#Entry'), sym(MENU_DOC));
  store.add(sym(SETTINGS_DOC + '#iss1'), item, sym(ISSUER), sym(SETTINGS_DOC));
  store.add(sym(SETTINGS_DOC + '#Issuers'), elem, sym(SETTINGS_DOC + '#iss1'), sym(SETTINGS_DOC));
  return store;
}

test('only membership stated in the root doc is resolved — issuers never fetched', async () => {
  const store = seededStore();
  const fetched = [];
  const fetchFn = async (url) => {
    fetched.push(url);
    return { ok: true, text: async () => `<${CATALOG_DOC}#Entry> <${RDF}type> <http://www.w3.org/ns/ui#Plugin> .` };
  };
  await loadReferencedDocs(store, MENU_DOC, fetchFn);
  expect(fetched).toEqual([CATALOG_DOC]);
});

test('a doc that fails to load is fetched once, not once per round', async () => {
  const store = seededStore();
  const fetched = [];
  const fetchFn = async (url) => { fetched.push(url); throw new Error('dead'); };
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  await loadReferencedDocs(store, MENU_DOC, fetchFn);
  warn.mockRestore();
  expect(fetched).toEqual([CATALOG_DOC]);
});

test('membership without a graph term counts as the root doc (mock-parser compat)', async () => {
  const store = graphStore();
  store.add(sym(MENU_DOC + '#Menu'), sym(SCHEMA + 'itemListElement'), sym(CATALOG_DOC + '#Entry'));
  const fetched = [];
  const fetchFn = async (url) => {
    fetched.push(url);
    return { ok: true, text: async () => `<${CATALOG_DOC}#Entry> <${RDF}type> <http://www.w3.org/ns/ui#Plugin> .` };
  };
  await loadReferencedDocs(store, MENU_DOC, fetchFn);
  expect(fetched).toEqual([CATALOG_DOC]);
});

const UI = 'http://www.w3.org/ns/ui#';
const SHELL_DOC = 'http://pod.test/shell.ttl';

// A ui:region whose object is a TARGET region NODE in another doc is followed
// like a member so regionToken can read the target's declared id — but a ui:Region
// KIND (ui:Modal) resolves from its fragment alone and must NOT drag in the ui: vocab.
test('a ui:region target node is fetched; a ui:Region KIND is not', async () => {
  const store = graphStore();
  const region = sym(UI + 'region');
  store.add(sym(MENU_DOC + '#Menu'),  region, sym(SHELL_DOC + '#MenuPane'), sym(MENU_DOC));
  store.add(sym(MENU_DOC + '#Menu2'), region, sym(UI + 'Modal'),           sym(MENU_DOC));
  const fetched = [];
  const fetchFn = async (url) => {
    fetched.push(url);
    return { ok: true, text: async () => `<${SHELL_DOC}#MenuPane> <${RDF}type> <${UI}Layout> .` };
  };
  await loadReferencedDocs(store, MENU_DOC, fetchFn);
  expect(fetched).toEqual([SHELL_DOC]);   // the ui: vocab (Modal) is never dereferenced
});

// The same scoping guard as membership: a region target stated in a FOREIGN doc
// (not the root or a doc this call fetched) is never dereferenced.
test('a ui:region target in a foreign doc is not fetched', async () => {
  const store = seededStore();
  store.add(sym(SETTINGS_DOC + '#Menu'), sym(UI + 'region'), sym(SHELL_DOC + '#MenuPane'), sym(SETTINGS_DOC));
  const fetched = [];
  const fetchFn = async (url) => {
    fetched.push(url);
    return { ok: true, text: async () => `<${CATALOG_DOC}#Entry> <${RDF}type> <${UI}Plugin> .` };
  };
  await loadReferencedDocs(store, MENU_DOC, fetchFn);
  expect(fetched).toEqual([CATALOG_DOC]);   // shell target lives in the settings doc → skipped
});
