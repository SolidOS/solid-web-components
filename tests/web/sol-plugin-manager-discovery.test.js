/**
 * @jest-environment jsdom
 *
 * <sol-plugin-manager> UI-slot DISCOVERY (plugin-manifest-unification):
 * with no `for` attribute the palette scans the document's declared menu
 * sources, keeps root ui:Menus whose tree holds a ui:Plugin reference, and
 * emits one manager per slot ("Customize <ui:label>"; ui:Horizontal →
 * sol-button-bar-manager). Covered:
 *   - two qualifying roots emit correctly typed + headed managers
 *   - a plugin-less menu (chrome-style inline furniture) is NOT a slot
 *   - nested submenus don't get their own box (root dedupe)
 *   - the palette's own catalog doc is never a slot
 *   - an explicit `for` suppresses discovery entirely
 *   - a document with no qualifying slots keeps legacy behavior (no
 *     has-targets, no pairing)
 * Same harness recipe as sol-plugin-manager.test.js: real component, stubbed
 * global.fetch, the jest rdflib mock (same-doc references only — the mock
 * can't fetch cross-doc, which is fine: qualification reads types straight
 * off the loaded doc).
 */

import '../../web/sol-plugin-manager.js';
import '../../web/sol-menu-manager.js';
import '../../web/sol-button-bar-manager.js';

window.__SolSuppressDefineWarn = true;

const CAT = 'http://slots.test/catalog.ttl';
const MENUS = 'http://slots.test/menus.ttl';

const CATALOG_TTL = `
@prefix ui:     <http://www.w3.org/ns/ui#> .
@prefix rdf:    <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix schema: <http://schema.org/> .

<#Available> a ui:Menu ; ui:label "Plugins Available" ;
  schema:itemListElement <#Clock> .
<#Clock> a ui:Plugin ; schema:additionalType ui:Component ;
  ui:label "Clock" ; schema:url <http://slots.test/web/sol-time.js> .
`;

// Tabs (HORIZONTAL but a tree — holds a plugin ref via a SUBMENU, so it must
// still get a menu-manager), Bar (horizontal AND flat — bar-manager), Chrome
// (inline furniture only — must not qualify). The referenced entries are
// typed in this same doc (the mock can't cross-fetch).
const MENUS_TTL = `
@prefix ui:     <http://www.w3.org/ns/ui#> .
@prefix rdf:    <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix schema: <http://schema.org/> .

<#Tabs> a ui:Menu ; ui:label "Menu Tabs" ; ui:orientation ui:Horizontal ;
  schema:itemListElement <#Tabs-Media> .
<#Tabs-Media> a schema:ListItem ; schema:item <#Media> ; schema:position 1 .
<#Media> a ui:Menu ; ui:label "Media" ;
  schema:itemListElement <#Media-News> .
<#Media-News> a schema:ListItem ; schema:item <#News> ; schema:position 1 .
<#News> a ui:Plugin ; schema:additionalType ui:Component ;
  ui:label "News" ; schema:url <http://slots.test/web/sol-feed.js> .

<#Bar> a ui:Menu ; ui:label "Top Row Buttons" ; ui:orientation ui:Horizontal ;
  schema:itemListElement <#Bar-Search> .
<#Bar-Search> a schema:ListItem ; schema:item <#Search> ; schema:position 1 .
<#Search> a ui:Plugin ; schema:additionalType ui:Component ;
  ui:label "Search" ; schema:url <http://slots.test/web/sol-search.js> .

<#Chrome> a ui:Menu ; ui:label "chrome" ;
  schema:itemListElement <#Chrome-Help> .
<#Chrome-Help> a schema:ListItem ; schema:item <#Help> ; schema:position 1 .
<#Help> a ui:Component ; ui:label "?" ; schema:url <http://slots.test/web/sol-button.js> .
`;

const LEGACY_TTL = `
@prefix ui:     <http://www.w3.org/ns/ui#> .
@prefix rdf:    <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix schema: <http://schema.org/> .

<#Tabs> a ui:Menu ; ui:label "Old Tabs" ;
  schema:itemListElement <#Tabs-Item> .
<#Tabs-Item> a schema:ListItem ; schema:item <#Item> ; schema:position 1 .
<#Item> a ui:Component ; ui:label "Old" ; schema:url <http://slots.test/web/sol-thing.js> .
`;

function stubFetch(docs) {
  global.fetch = (url) => {
    const u = String(url).split('#')[0];
    const body = docs[u];
    if (body === undefined) {
      return Promise.resolve({ ok: false, status: 404, headers: new Map(), text: () => Promise.resolve('') });
    }
    return Promise.resolve({
      ok: true, status: 200,
      headers: { get: (h) => (h.toLowerCase() === 'content-type' ? 'text/turtle' : null) },
      text: () => Promise.resolve(body),
    });
  };
}

const settle = () => new Promise((r) => setTimeout(r, 30));

function mount(menuDocUrl, { withFor = false } = {}) {
  document.body.innerHTML = '';
  const declarer = document.createElement('div');
  declarer.setAttribute('source', menuDocUrl + '#Tabs');
  document.body.appendChild(declarer);
  const pm = document.createElement('sol-plugin-manager');
  pm.setAttribute('source', CAT + '#Available');
  if (withFor) pm.setAttribute('for', 'sol-menu-manager');
  document.body.appendChild(pm);
  return pm;
}

afterEach(() => { document.body.innerHTML = ''; });

test('discovers qualifying roots and emits typed, headed managers', async () => {
  stubFetch({ [CAT]: CATALOG_TTL, [MENUS]: MENUS_TTL });
  const pm = mount(MENUS);
  await settle(); await settle();
  const region = pm.shadowRoot.querySelector('.targets');
  expect(region).not.toBeNull();
  expect(pm.hasAttribute('has-targets')).toBe(true);
  const kids = [...region.children];
  const byHeading = Object.fromEntries(kids.map((k) => [k.getAttribute('heading'), k.tagName.toLowerCase()]));
  expect(byHeading['Customize Menu Tabs']).toBe('sol-menu-manager');
  expect(byHeading['Customize Top Row Buttons']).toBe('sol-button-bar-manager');
  // chrome holds no plugin → not a slot; Media is nested → no own box
  expect(kids).toHaveLength(2);
  for (const k of kids) expect(k.getAttribute('catalog')).toBe(CAT + '#Available');
});

test('the nested submenu does not get its own manager', async () => {
  stubFetch({ [CAT]: CATALOG_TTL, [MENUS]: MENUS_TTL });
  const pm = mount(MENUS);
  await settle(); await settle();
  const headings = [...pm.shadowRoot.querySelectorAll('.targets > *')].map((k) => k.getAttribute('heading'));
  expect(headings).not.toContain('Customize Media');
});

test('an explicit for= suppresses discovery', async () => {
  stubFetch({ [CAT]: CATALOG_TTL, [MENUS]: MENUS_TTL });
  const pm = mount(MENUS, { withFor: true });
  await settle(); await settle();
  expect(pm.shadowRoot.querySelector('.targets')).toBeNull();
  expect(pm.hasAttribute('has-targets')).toBe(false);
});

test('legacy (no ui:Plugin references) keeps the old no-pairing behavior', async () => {
  stubFetch({ [CAT]: CATALOG_TTL, [MENUS]: LEGACY_TTL });
  const pm = mount(MENUS);
  await settle(); await settle();
  expect(pm.shadowRoot.querySelector('.targets')).toBeNull();
  expect(pm.hasAttribute('has-targets')).toBe(false);
  expect(pm._used).toBeNull();   // no pairing → every card shown
});

test('the palette\'s own catalog doc is never a slot', async () => {
  // the catalog itself holds ui:Plugin entries under #Available — if the
  // exclusion regressed, a "Customize Plugins Available" box would appear
  stubFetch({ [CAT]: CATALOG_TTL, [MENUS]: MENUS_TTL });
  const pm = mount(MENUS);
  await settle(); await settle();
  const headings = [...pm.shadowRoot.querySelectorAll('.targets > *')].map((k) => k.getAttribute('heading'));
  expect(headings).not.toContain('Customize Plugins Available');
});
