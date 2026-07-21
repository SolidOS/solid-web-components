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
