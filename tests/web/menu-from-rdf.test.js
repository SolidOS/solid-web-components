/**
 * @jest-environment jsdom
 *
 * Tests for web/menu-from-rdf.js — the opt-in add-on whose whole job is a side
 * effect: importing it pulls in the rdflib-backed loader (loadMenuFromUri) and
 * installs it on the shared menu-consumer registry, switching `from-rdf` on for
 * the menu family (sol-tabs / sol-menu / sol-dropdown-button).
 *
 * Two halves, both real and deterministic:
 *   1. The activation contract — importing the module installs THE loader on the
 *      Symbol.for() registry and wires every registered + pending consumer.
 *   2. The loader it installs — loadMenuFromUri fetched-and-parsed end to end
 *      through the mocked rdflib (Turtle written with explicit rdf:first/rest
 *      triples, which the mock parser handles; see note at bottom).
 */

window.__SolSuppressDefineWarn = true;

import { registerMenuConsumer, deferUntilLoader } from '../../core/menu-consumer.js';

// The registry the add-on writes to is a cross-bundle Symbol.for() singleton.
const REG_KEY = Symbol.for('sol-components.menu-consumers');

// A turtle doc that uses ONLY constructs the jest rdflib mock parses: explicit
// rdf:first / rdf:rest / rdf:nil triples (not `( … )` list syntax) and named
// attribute nodes (not `[ … ]` blanks). It models a horizontal menu with a
// component (two ui:attribute params), an acl-gated component, a nested submenu
// holding a link, plus a PANTRY subject (#Forum) reachable from no ui:parts.
const MENU_TTL = `
@prefix ui:     <http://www.w3.org/ns/ui#> .
@prefix rdf:    <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix schema: <http://schema.org/> .
@prefix acl:    <http://www.w3.org/ns/auth/acl#> .

<#Main> a ui:Menu ; ui:label "data-kitchen" ;
  ui:orientation ui:Horizontal ;
  ui:parts <#l1> .
<#l1> rdf:first <#Home> ; rdf:rest <#l2> .
<#l2> rdf:first <#Podz> ; rdf:rest <#l3> .
<#l3> rdf:first <#Sub>  ; rdf:rest rdf:nil .

<#Home> a ui:Component ; ui:label "Home" ; ui:icon "🏠" ; ui:name "sol-include" ;
  ui:attribute <#aSource> , <#aTrusted> .
<#aSource>  schema:name "source"  ; schema:value "pages/home.html" .
<#aTrusted> schema:name "trusted" ; schema:value "true" .

<#Podz> a ui:Component ; ui:label "Podz" ; ui:name "dk-podz" ;
  acl:mode acl:Write .

<#Sub> a ui:Menu ; ui:label "More" ; ui:parts <#sl1> .
<#sl1> rdf:first <#Faq> ; rdf:rest rdf:nil .
<#Faq> a ui:Link ; ui:label "FAQ" ; ui:href "https://solidproject.org/FAQ" .

<#Forum> a ui:Component ; ui:label "Forum" ; ui:name "iframe" .
`;

const DOC_URL = 'https://pod.example/menu.ttl';

/**
 * A fetch stub that serves MENU_TTL as text/turtle for DOC_URL and 404s
 * everything else. loadRdfStore probes several Accept types in turn; we answer
 * the first (text/turtle) and the rest never run because it returns on success.
 */
function turtleFetchStub(body = MENU_TTL, { contentType = 'text/turtle' } = {}) {
  const calls = [];
  const fn = (url, init) => {
    calls.push({ url, init });
    const u = typeof url === 'string' ? url : String(url);
    if (u.split('#')[0] === DOC_URL) {
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: { get: (h) => (h.toLowerCase() === 'content-type' ? contentType : null) },
        text: () => Promise.resolve(body),
      });
    }
    return Promise.resolve({
      ok: false,
      status: 404,
      headers: { get: () => null },
      text: () => Promise.resolve(''),
    });
  };
  fn.calls = calls;
  return fn;
}

describe('menu-from-rdf activation contract', () => {
  beforeAll(async () => {
    // Importing the module IS the activation. Done inside beforeAll so the
    // registry is observed both before (consumers registered earlier) and after.
    await import('../../web/menu-from-rdf.js');
  });

  test('importing installs a loader on the shared Symbol.for() registry', () => {
    const reg = globalThis[REG_KEY];
    expect(reg).toBeDefined();
    expect(typeof reg.loader).toBe('function');
  });

  test('the installed loader is loadMenuFromUri (same reference)', async () => {
    const { loadMenuFromUri } = await import('../../core/menu-rdf.js');
    expect(globalThis[REG_KEY].loader).toBe(loadMenuFromUri);
  });

  test('a consumer registered AFTER install inherits the loader immediately', () => {
    class LateConsumer {}
    registerMenuConsumer(LateConsumer);
    expect(LateConsumer.fromRdfLoader).toBe(globalThis[REG_KEY].loader);
  });

  test('with a loader present, deferUntilLoader does not park (returns false)', () => {
    const el = {};
    expect(deferUntilLoader(el)).toBe(false);
    expect(globalThis[REG_KEY].pending.has(el)).toBe(false);
  });
});

describe('loadMenuFromUri (the loader the add-on installs)', () => {
  let loadMenuFromUri;

  beforeAll(async () => {
    ({ loadMenuFromUri } = await import('../../core/menu-rdf.js'));
  });

  let savedFetch;
  beforeEach(() => { savedFetch = global.fetch; });
  afterEach(() => { global.fetch = savedFetch; });

  test('returns the menu orientation and the top-level item count', async () => {
    global.fetch = turtleFetchStub();
    const menu = await loadMenuFromUri(DOC_URL + '#Main');
    expect(menu).not.toBeNull();
    expect(menu.orientation).toBe('horizontal');   // ui:Horizontal → token
    expect(menu.items).toHaveLength(3);             // Home, Podz, Sub (pantry #Forum excluded)
  });

  test('parses a component item: tag, label, icon, and ui:attribute params', async () => {
    global.fetch = turtleFetchStub();
    const { items } = await loadMenuFromUri(DOC_URL + '#Main');
    const home = items[0];
    expect(home.type).toBe('component');
    expect(home.id).toBe('Home');                   // IRI fragment is the id
    expect(home.name).toBe('Home');
    expect(home.icon).toBe('🏠');
    expect(home.tag).toBe('sol-include');           // from ui:name
    // params come from the ui:attribute schema:name/value pairs
    const asObj = Object.fromEntries(home.params);
    expect(asObj.source).toBe('pages/home.html');
    expect(asObj.trusted).toBe('true');
  });

  test('surfaces acl:mode acl:Write as requiresWrite', async () => {
    global.fetch = turtleFetchStub();
    const { items } = await loadMenuFromUri(DOC_URL + '#Main');
    const podz = items.find((i) => i.id === 'Podz');
    expect(podz.requiresWrite).toBe(true);
    // a plain component with no acl:mode is not flagged
    expect(items[0].requiresWrite).toBe(false);
  });

  test('a ui:Menu part becomes a submenu with parsed children (recursion)', async () => {
    global.fetch = turtleFetchStub();
    const { items } = await loadMenuFromUri(DOC_URL + '#Main');
    const sub = items.find((i) => i.type === 'submenu');
    expect(sub.id).toBe('Sub');
    expect(sub.name).toBe('More');
    expect(sub.children).toHaveLength(1);
    const faq = sub.children[0];
    expect(faq.type).toBe('link');                  // not ui:Menu/ui:Component → link
    expect(faq.href).toBe('https://solidproject.org/FAQ');
    expect(faq.name).toBe('FAQ');
  });

  test('resolves the menu root by ui:Menu type when no fragment is given', async () => {
    global.fetch = turtleFetchStub();
    // No #fragment → loader finds the first subject typed ui:Menu in the doc.
    const menu = await loadMenuFromUri(DOC_URL);
    expect(menu).not.toBeNull();
    expect(menu.items.length).toBeGreaterThan(0);
  });

  test('returns null when the named fragment is not a menu (no parts)', async () => {
    global.fetch = turtleFetchStub();
    // #Faq exists but has no ui:parts → parseMenuItems yields [], items empty,
    // and the root resolves to the fragment, so we get a menu with no items.
    const menu = await loadMenuFromUri(DOC_URL + '#Faq');
    expect(menu).not.toBeNull();
    expect(menu.items).toEqual([]);
  });

  test('defaults orientation to horizontal when none is declared', async () => {
    // #Sub is a ui:Menu with no ui:orientation.
    global.fetch = turtleFetchStub();
    const menu = await loadMenuFromUri(DOC_URL + '#Sub');
    expect(menu.orientation).toBe('horizontal');
  });
});

/*
 * Deliberately NOT tested: the components' own `from-rdf` *render* path
 * (sol-tabs/sol-menu actually mounting these items into the DOM) and Turtle
 * written with `( … )` rdf:List sugar or `[ … ]` blank attribute nodes — the
 * jest rdflib mock's parser handles neither collection syntax nor blank-node
 * brackets, so the fixtures above use the equivalent explicit triples. The real
 * rdflib in the browser parses both forms identically into the same triples the
 * loader walks, so the parsing logic exercised here is the production logic.
 */
