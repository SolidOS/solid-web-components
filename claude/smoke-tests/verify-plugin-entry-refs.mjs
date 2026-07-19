// Stage-2 smoke (plugin-manifest-unification; single schema:url payload
// 2026-07-19): reference-style menus over ui:Plugin entries, cross-document,
// with real rdflib.
//   - a menu doc whose parts reference entries in a separate CATALOG doc
//   - parse resolves the three kinds into legacy-shaped descriptions
//   - a menu save re-emits REFERENCES only: no entry bodies leak into the
//     menu doc, and the catalog graph is untouched
//   - second round trip parses identically
// Run from sc root: node claude/smoke-tests/verify-plugin-entry-refs.mjs
import { rdf } from '../../core/rdf.js';
import { parseMenuItems } from '../../core/menu-rdf.js';
import { updateMenuInStore, serializeMenuDocument } from '../../core/menu-serialize.js';

const CAT = 'https://pod.example/ui-data/plugins-catalog.ttl';
const MENU = 'https://pod.example/ui-data/main-menu.ttl';

const CATALOG_TTL = `
@prefix ui:     <http://www.w3.org/ns/ui#> .
@prefix schema: <http://schema.org/> .
@prefix dct:    <http://purl.org/dc/terms/> .

<#Penny> a ui:Plugin ; schema:additionalType ui:Link ;
  ui:label "Penny" ; schema:url <https://penny.example/> ;
  schema:description "Pod browser." ; dct:publisher "Vincent Tunru" .

<#Calendar> a ui:Plugin ; schema:additionalType ui:Component ;
  ui:label "Calendar" ;
  schema:url <https://pod.example/web/sol-calendar.esm.js> ;
  ui:attribute
    [ schema:name "region" ; schema:value "dropdown" ] ,
    [ schema:name "hide-header" ; schema:value "" ] .

<#Theme> a ui:Plugin ; schema:additionalType ui:Command ;
  ui:label "Theme" ; schema:url <https://pod.example/ui-data/commands.ttl#toggleTheme> .

<#Unused> a ui:Plugin ; schema:additionalType ui:Command ;
  ui:label "Restart" ; schema:url <https://pod.example/ui-data/commands.ttl#restartApp> .
`;

const MENU_TTL = `
@prefix ui: <http://www.w3.org/ns/ui#> .
<#Main> a ui:Menu ; ui:label "main" ;
  ui:parts ( <${CAT}#Penny> <${CAT}#Calendar> <${CAT}#Theme> ) .
`;

let fails = 0;
const check = (l, ok, d = '') => { console.log(`${ok ? '✔' : '✘'} ${l}${d ? ' — ' + d : ''}`); if (!ok) fails++; };

function buildStore(menuTtl) {
  const store = rdf.graph();
  rdf.parse(CATALOG_TTL, store, CAT, 'text/turtle');
  rdf.parse(menuTtl, store, MENU, 'text/turtle');
  return store;
}

const store = buildStore(MENU_TTL);
const catCountBefore = store.statementsMatching(null, null, null, rdf.sym(CAT)).length;

const items = parseMenuItems(store, rdf.sym(MENU + '#Main'));
check('three entries parsed', items.length === 3, `got ${items.length}`);
const [penny, cal, theme] = items;
check('Link entry → link desc with href', penny?.type === 'link' && penny.href === 'https://penny.example/');
check('blurb from schema:description', penny?.comment === 'Pod browser.');
check('Component tag derived from module filename', cal?.type === 'component' && cal.tag === 'sol-calendar');
check('region lifted from entry attributes', cal?.region === 'dropdown' && !cal.params.some(([k]) => k === 'region'));
check('Command → component-shaped desc, tag = key', theme?.type === 'component' && theme.tag === 'toggleTheme' && theme.module === null);
check('entry markers carry the entry IRIs', penny?.entry === CAT + '#Penny' && cal?.entry === CAT + '#Calendar');
check('identity defaults to the entry IRI', penny?.manifest === CAT + '#Penny');

// reorder (Theme first) and save the MENU doc
const reordered = [theme, penny, cal];
updateMenuInStore(store, MENU, MENU + '#Main', { label: 'main', items: reordered });
const out = await serializeMenuDocument(store, MENU);

// rdflib may serialize the refs prefixed (cat:Penny) rather than as <…#Penny>
check('saved menu references the entries', /Penny/.test(out) && /Calendar/.test(out) && /Theme/.test(out));
check('no entry BODIES leaked into the menu doc',
  !/additionalType|schema:url|schema:description/.test(out), out.split('\n').filter(l => /additionalType|schema:url/.test(l)).join(' | '));
const catCountAfter = store.statementsMatching(null, null, null, rdf.sym(CAT)).length;
check('catalog graph untouched by the menu save', catCountAfter === catCountBefore, `${catCountBefore} → ${catCountAfter}`);

// round 2: fresh store from the SERIALIZED menu + the original catalog
const store2 = buildStore(out);
const items2 = parseMenuItems(store2, rdf.sym(MENU + '#Main'));
check('round 2: order preserved (Theme first)', items2[0]?.tag === 'toggleTheme');
check('round 2: entries still resolve', items2.length === 3 && items2[2]?.tag === 'sol-calendar');
check('round 2: still reference-marked', !!items2[1]?.entry);

console.log(fails ? `FAILED ${fails}` : 'ALL OK');
process.exit(fails ? 1 : 0);
