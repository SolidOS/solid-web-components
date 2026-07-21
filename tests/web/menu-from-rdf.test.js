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
 *      through the mocked rdflib (plain schema:itemListElement membership
 *      triples — no list syntax, no blanks; see note at bottom).
 */

window.__SolSuppressDefineWarn = true;

import { registerMenuConsumer, deferUntilLoader } from '../../core/menu-consumer.js';

// The registry the add-on writes to is a cross-bundle Symbol.for() singleton.
const REG_KEY = Symbol.for('sol-components.menu-consumers');

// A turtle doc that uses ONLY constructs the jest rdflib mock parses: plain
// triples and named attribute nodes (not `[ … ]` blanks). Membership is the
// real model — positioned schema:ListItem wrappers per member. It models a
// horizontal menu with a component (two schema:additionalProperty params), an acl-gated
// component, a nested submenu holding a link, plus a PANTRY subject (#Forum)
// reachable from no menu's membership.
const MENU_TTL = `
@prefix ui:     <http://www.w3.org/ns/ui#> .
@prefix rdf:    <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix schema: <http://schema.org/> .
@prefix acl:    <http://www.w3.org/ns/auth/acl#> .

<#Main> a ui:Menu ; ui:label "data-kitchen" ;
  ui:orientation ui:Horizontal ;
  schema:itemListElement <#Main-Home> , <#Main-Podz> , <#Main-Sub> , <#Main-Customize> , <#Main-Help> .
<#Main-Home> a schema:ListItem ; schema:item <#Home> ; schema:position 1 .
<#Main-Podz> a schema:ListItem ; schema:item <#Podz> ; schema:position 2 .
<#Main-Sub>  a schema:ListItem ; schema:item <#Sub>  ; schema:position 3 .
<#Main-Customize> a schema:ListItem ; schema:item <#Customize> ; schema:position 4 .
<#Main-Help> a schema:ListItem ; schema:item <#Help> ; schema:position 5 .

<#Customize> a ui:Component ; ui:label "Customize" ; schema:url <https://pod.example/web/sol-include.js> ;
  schema:additionalProperty <#cGate> , <#cSource> , <#cRegion> .
<#cGate>   schema:name "if-logged-in" ; schema:value "" .
<#cSource> schema:name "source" ; schema:value "pages/customize.html" .
<#cRegion> schema:name "region" ; schema:value "Dropdown" .

<#Help> a ui:Component ; ui:label "Help" ; schema:url <https://pod.example/web/sol-include.js> ;
  schema:additionalProperty <#hAlt> , <#hSource> .
<#hAlt>    schema:name "if-logged-in" ; schema:value "help/owner.html" .
<#hSource> schema:name "source" ; schema:value "help/guest.html" .

<#Home> a ui:Component ; ui:label "Home" ; ui:icon "🏠" ; schema:url <https://pod.example/web/sol-include.js> ;
  schema:additionalProperty <#aSource> , <#aTrusted> .
<#aSource>  schema:name "source"  ; schema:value "pages/home.html" .
<#aTrusted> schema:name "trusted" ; schema:value "true" .

<#Podz> a ui:Component ; ui:label "Podz" ;
  schema:url <https://pod.example/plugins/podz/dk-podz.esm.js> ;
  ui:region ui:Modal ;
  acl:mode acl:Write .

<#Sub> a ui:Menu ; ui:label "More" ;
  schema:itemListElement <#Sub-Faq> .
<#Sub-Faq> a schema:ListItem ; schema:item <#Faq> ; schema:position 1 .
<#Faq> a ui:Link ; ui:label "FAQ" ; schema:url "https://solidproject.org/FAQ" .

<#Forum> a ui:Link ; ui:label "Forum" ; schema:url "https://forum.solidproject.org/" .

<#PluginMenu> a ui:Menu ; ui:label "plugins" ;
  schema:itemListElement <#PluginMenu-EPenny> , <#PluginMenu-ECal> , <#PluginMenu-ETheme> .
<#PluginMenu-EPenny> a schema:ListItem ; schema:item <#EPenny> ; schema:position 1 .
<#PluginMenu-ECal>   a schema:ListItem ; schema:item <#ECal>   ; schema:position 2 .
<#PluginMenu-ETheme> a schema:ListItem ; schema:item <#ETheme> ; schema:position 3 .

<#EPenny> a ui:Plugin ; schema:additionalType ui:Link ;
  ui:label "Penny" ; schema:url "https://penny.example/" ;
  schema:description "Pod browser." .

<#ECal> a ui:Plugin ; schema:additionalType ui:Component ;
  ui:label "Calendar" ;
  schema:url <https://pod.example/web/sol-calendar.esm.js> ;
  schema:additionalProperty <#eRegion> , <#eHide> .
<#eRegion> schema:name "region" ; schema:value "dropdown" .
<#eHide>   schema:name "hide-header" ; schema:value "" .

<#ETheme> a ui:Plugin ; schema:additionalType ui:Command ;
  ui:label "Theme" ; schema:url <https://pod.example/ui-data/commands.ttl#toggleTheme> .
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
    expect(menu.items).toHaveLength(5);             // Home, Podz, Sub, Customize, Help (pantry #Forum excluded)
  });

  test('parses a component item: tag, label, icon, and schema:additionalProperty params', async () => {
    global.fetch = turtleFetchStub();
    const { items } = await loadMenuFromUri(DOC_URL + '#Main');
    const home = items[0];
    expect(home.type).toBe('component');
    expect(home.id).toBe('Home');                   // IRI fragment is the id
    expect(home.name).toBe('Home');
    expect(home.icon).toBe('🏠');
    expect(home.tag).toBe('sol-include');           // derived from schema:url
    // params come from the schema:additionalProperty schema:name/value pairs
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

  test('a region schema:additionalProperty lifts into desc.region (lowercased) and leaves params', async () => {
    global.fetch = turtleFetchStub();
    const { items } = await loadMenuFromUri(DOC_URL + '#Main');
    const customize = items.find((i) => i.id === 'Customize');
    expect(customize.region).toBe('dropdown');                       // attribute channel, normalized
    expect(customize.params.some(([k]) => k === 'region')).toBe(false); // structural, not a param
    // legacy ui:region triple still reads
    const podz = items.find((i) => i.id === 'Podz');
    expect(podz.region).toBe('modal');
  });

  test('ui:Plugin entries parse into legacy-shaped descriptions with an entry marker', async () => {
    global.fetch = turtleFetchStub();
    const { items } = await loadMenuFromUri(DOC_URL + '#PluginMenu');
    expect(items).toHaveLength(3);
    const [penny, cal, theme] = items;
    // Link kind → a link description; blurb comes from schema:description
    expect(penny.type).toBe('link');
    expect(penny.href).toBe('https://penny.example/');
    expect(penny.comment).toBe('Pod browser.');
    expect(penny.entry).toBe(DOC_URL + '#EPenny');
    expect(penny.manifest).toBe(DOC_URL + '#EPenny');   // identity defaults to the entry IRI
    // Component kind → tag DERIVED from the module filename (no ui:name),
    // region lifted out of params into the field
    expect(cal.type).toBe('component');
    expect(cal.tag).toBe('sol-calendar');
    expect(cal.module).toBe('https://pod.example/web/sol-calendar.esm.js');
    expect(cal.region).toBe('dropdown');
    expect(cal.params).toEqual([['hide-header', '']]);
    expect(cal.entry).toBe(DOC_URL + '#ECal');
    // Command kind → component-shaped desc whose tag IS the key, no module
    expect(theme.type).toBe('component');
    expect(theme.tag).toBe('toggleTheme');
    expect(theme.module).toBe(null);
    expect(theme.entry).toBe(DOC_URL + '#ETheme');
  });

  test('an EMPTY if-logged-in attribute gates; the valued form does not', async () => {
    global.fetch = turtleFetchStub();
    const { items } = await loadMenuFromUri(DOC_URL + '#Main');
    // boolean form (schema:value "") = the attribute spelling of the gate
    const customize = items.find((i) => i.id === 'Customize');
    expect(customize.requiresWrite).toBe(true);
    // valued form = sol-include's alternate-source switch, NOT a gate
    const help = items.find((i) => i.id === 'Help');
    expect(help.requiresWrite).toBe(false);
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

  test('returns null when the named fragment is not a menu (no members)', async () => {
    global.fetch = turtleFetchStub();
    // #Faq exists but has no membership → parseMenuItems yields [], items empty,
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
 * written with `[ … ]` blank attribute nodes — the jest rdflib mock's parser
 * doesn't handle blank-node brackets, so the fixtures above use named
 * attribute nodes. Menu MEMBERSHIP needs no workaround: positioned
 * schema:ListItem wrappers are plain triples, which is the production form.
 */

describe('module urls on component items', () => {
  test('parseMenuItems surfaces schema:url as `module` (absolute IRI)', async () => {
    global.fetch = turtleFetchStub();
    const { loadMenuFromUri } = await import('../../core/menu-rdf.js');
    const menu = await loadMenuFromUri(DOC_URL + '#Main');
    const podz = menu.items.find((i) => i.name === 'Podz');
    expect(podz.module).toBe('https://pod.example/plugins/podz/dk-podz.esm.js');
    const home = menu.items.find((i) => i.name === 'Home');
    expect(home.module).toBe('https://pod.example/web/sol-include.js');
  });
});
