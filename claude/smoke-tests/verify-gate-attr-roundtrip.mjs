// Round-trip check for the if-logged-in gate migration (2026-07-17):
// parse a menu whose item is gated by an EMPTY if-logged-in ui:attribute,
// serialize it back, and assert (1) requiresWrite was surfaced, (2) NO
// acl:mode triple got emitted (the attribute itself round-trips), (3) a
// legacy acl-only item still round-trips its triple. Run from sc root:
//   node claude/smoke-tests/verify-gate-attr-roundtrip.mjs
import { rdf } from '../../core/rdf.js';
import { parseMenuItems, gatedByParams } from '../../core/menu-rdf.js';
import { updateMenuInStore, serializeMenuDocument } from '../../core/menu-serialize.js';

const DOC = 'https://pod.example/menu.ttl';
const TTL = `
@prefix ui:     <http://www.w3.org/ns/ui#> .
@prefix schema: <http://schema.org/> .
@prefix acl:    <http://www.w3.org/ns/auth/acl#> .

<#Main> a ui:Menu ; ui:label "m" ; ui:parts ( <#Customize> <#Legacy> <#Help> <#Ext> ) .

<#Customize> a ui:Component ; ui:label "Customize" ; schema:url <https://pod.example/web/sol-include.js> ;
  ui:attribute
    [ schema:name "if-logged-in" ; schema:value "" ] ,
    [ schema:name "region" ; schema:value "dropdown" ] ,
    [ schema:name "source" ; schema:value "pages/customize.html" ] .

<#Legacy> a ui:Component ; ui:label "Old" ; schema:url <https://pod.example/web/x-old.js> ;
  ui:region ui:Modal ;
  acl:mode acl:Write .

<#Ext> a ui:Link ; ui:label "Ext" ; schema:url "https://example.org/app" ;
  ui:region ui:Window .

<#Help> a ui:Component ; ui:label "Help" ; schema:url <https://pod.example/web/sol-include.js> ;
  ui:attribute
    [ schema:name "if-logged-in" ; schema:value "help/owner.html" ] ,
    [ schema:name "source" ; schema:value "help/guest.html" ] .
`;

const store = rdf.graph();
rdf.parse(TTL, store, DOC, 'text/turtle');
const items = parseMenuItems(store, rdf.sym(DOC + '#Main'));
const byId = Object.fromEntries(items.map(i => [i.id, i]));

let fails = 0;
const check = (label, ok) => { console.log(`${ok ? '✔' : '✘'} ${label}`); if (!ok) fails++; };

check('boolean if-logged-in → requiresWrite', byId.Customize.requiresWrite === true);
check('legacy acl:mode → requiresWrite', byId.Legacy.requiresWrite === true);
check('valued if-logged-in → NOT gated', byId.Help.requiresWrite === false);
check('gatedByParams true for Customize', gatedByParams(byId.Customize.params) === true);

updateMenuInStore(store, DOC, DOC + '#Main', { label: 'm', items });
const out = await serializeMenuDocument(store, DOC);
const gateAttrCount = (out.match(/if-logged-in/g) || []).length;
check('serialized attribute round-trips (both forms)', gateAttrCount >= 2);
const aclLines = out.split('\n').filter(l => /acl.*mode|mode.*Write/.test(l));
check('acl:mode emitted ONLY for the legacy item (1 line)', aclLines.length === 1 && /Write/.test(aclLines[0]));

// region checks (2026-07-17 attribute migration):
check('region attr lifts to field', byId.Customize.region === 'dropdown');
check('region NOT left in params', !byId.Customize.params.some(([k]) => k === 'region'));
check('legacy component ui:region still reads', byId.Legacy.region === 'modal');
check('link ui:region still reads', byId.Ext.region === 'window');
// serialized doc: components carry region only as an attribute; the Legacy
// component's triple CONVERTS to the attribute on save; the link keeps its
// triple (links have no attribute channel).
const regionTripleLines = out.split('\n').filter(l => /ui:region/.test(l));
check('ui:region triple survives ONLY on the link (1 line)', regionTripleLines.length === 1,
  JSON.stringify(regionTripleLines));

// second round trip: reparse the serialized doc — gating + region survive
const store2 = rdf.graph();
rdf.parse(out, store2, DOC, 'text/turtle');
const items2 = parseMenuItems(store2, rdf.sym(DOC + '#Main'));
const byId2 = Object.fromEntries(items2.map(i => [i.id, i]));
check('round-trip 2: Customize still gated', byId2.Customize.requiresWrite === true);
check('round-trip 2: Help still ungated', byId2.Help.requiresWrite === false);
check('round-trip 2: Customize region survives as attribute', byId2.Customize.region === 'dropdown');
check('round-trip 2: Legacy region converted + survives', byId2.Legacy.region === 'modal');
check('round-trip 2: link region survives as triple', byId2.Ext.region === 'window');

console.log(fails ? `FAILED ${fails}` : 'ALL OK');
process.exit(fails ? 1 : 0);
