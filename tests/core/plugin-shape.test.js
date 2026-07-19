/**
 * :PluginShape validation contract (plugin-manifest-unification stage 1;
 * single-payload revision 2026-07-19).
 *
 * A ui:Plugin entry is the unified manifest/card/mounted-item node. The
 * REQUIRED schema:additionalType picks the kind, and every kind carries the
 * SAME single payload predicate — schema:url — which the sh:xone branches
 * constrain per kind:
 *   ui:Link → the URL to open · ui:Component → an ES module with a
 *   tag-shaped filename · ui:Command → a registry fragment IRI with a
 *   hyphen-free key.
 * Same engine as menu-shacl.test.js: n3 + rdf-validate-shacl.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Parser, Store } from 'n3';
import SHACLValidator from 'rdf-validate-shacl';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');

const PREFIXES = `
@prefix ui:      <http://www.w3.org/ns/ui#> .
@prefix schema:  <http://schema.org/> .
@prefix dcterms: <http://purl.org/dc/terms/> .
`;

function parse(text, base = 'http://plugin-shape.test/doc') {
  return new Store(new Parser({ baseIRI: base }).parse(text));
}

const shapes = parse(
  readFileSync(join(root, 'shapes', 'menu.shacl'), 'utf8'),
  'http://plugin-shape.test/shapes',
);

async function validate(dataText) {
  return await new SHACLValidator(shapes).validate(parse(PREFIXES + dataText));
}

// ---- conforming entries, one per kind -----------------------------------

test('a Link entry conforms: additionalType + label + schema:url', async () => {
  const report = await validate(`
<#Penny> a ui:Plugin ;
  schema:additionalType ui:Link ;
  ui:label "Penny" ;
  schema:url <https://penny.vincenttunru.com/> ;
  schema:description "Browse and manage everything in your pod." ;
  dcterms:publisher "Vincent Tunru" ;
  dcterms:subject "Pods" .
`);
  expect(report.results.map((r) => r.message.map((m) => m.value).join('; '))).toEqual([]);
  expect(report.conforms).toBe(true);
});

test('a Component entry conforms: schema:url is the module (tag derives from the filename)', async () => {
  const report = await validate(`
<#Calendar> a ui:Plugin ;
  schema:additionalType ui:Component ;
  ui:label "Calendar" ;
  schema:url </node_modules/sol-components/web/sol-calendar.js> ;
  ui:attribute
    [ schema:name "region" ; schema:value "dropdown" ] ,
    [ schema:name "hide-header" ; schema:value "" ] ;
  dcterms:conformsTo </shapes/calendar-settings.shacl> .
`);
  expect(report.results.map((r) => r.message.map((m) => m.value).join('; '))).toEqual([]);
  expect(report.conforms).toBe(true);
});

test('a Component entry accepts .esm.js and .min.js module filenames', async () => {
  for (const mod of ['/dist/ia-player.esm.js', '/dist/ia-player.min.js', '/dist/ia-player.js']) {
    const report = await validate(`
<#Music> a ui:Plugin ;
  schema:additionalType ui:Component ;
  ui:label "Music" ;
  schema:url <${mod}> .
`);
    expect(report.conforms).toBe(true);
  }
});

test('a Command entry conforms: schema:url is a registry fragment with a hyphen-free key', async () => {
  const report = await validate(`
<#Theme> a ui:Plugin ;
  schema:additionalType ui:Command ;
  ui:label "Theme" ;
  schema:url </ui-data/data-kitchen-commands.ttl#toggleTheme> .
`);
  expect(report.results.map((r) => r.message.map((m) => m.value).join('; '))).toEqual([]);
  expect(report.conforms).toBe(true);
});

// ---- the discriminator is required and single ---------------------------

test('an entry without schema:additionalType fails', async () => {
  const report = await validate(`
<#X> a ui:Plugin ; ui:label "X" ; schema:url <https://example.org/> .
`);
  expect(report.conforms).toBe(false);
});

test('an unknown additionalType fails (sh:in)', async () => {
  const report = await validate(`
<#X> a ui:Plugin ; schema:additionalType ui:Menu ; ui:label "X" ; schema:url <https://example.org/> .
`);
  expect(report.conforms).toBe(false);
});

// ---- label is required everywhere ---------------------------------------

test('an entry without ui:label fails', async () => {
  const report = await validate(`
<#X> a ui:Plugin ; schema:additionalType ui:Link ; schema:url <https://example.org/> .
`);
  expect(report.conforms).toBe(false);
});

// ---- one payload, constrained per kind (the sh:xone) --------------------

test('a Component whose module filename is not tag-shaped fails (no hyphen)', async () => {
  const report = await validate(`
<#X> a ui:Plugin ;
  schema:additionalType ui:Component ;
  ui:label "X" ;
  schema:url </dist/bundle.js> .
`);
  expect(report.conforms).toBe(false);
});

test('a Component whose url is a plain app URL fails (not a module filename)', async () => {
  const report = await validate(`
<#X> a ui:Plugin ;
  schema:additionalType ui:Component ;
  ui:label "X" ;
  schema:url <https://example.org/app> .
`);
  expect(report.conforms).toBe(false);
});

test('a Command with a hyphenated fragment key fails (that spelling means a component tag)', async () => {
  const report = await validate(`
<#X> a ui:Plugin ;
  schema:additionalType ui:Command ;
  ui:label "X" ;
  schema:url </ui-data/data-kitchen-commands.ttl#toggle-theme> .
`);
  expect(report.conforms).toBe(false);
});

test('a Command whose url has no fragment fails (no key to dispatch)', async () => {
  const report = await validate(`
<#X> a ui:Plugin ;
  schema:additionalType ui:Command ;
  ui:label "X" ;
  schema:url </ui-data/data-kitchen-commands.ttl> .
`);
  expect(report.conforms).toBe(false);
});

test('two schema:url values fail (one payload)', async () => {
  const report = await validate(`
<#X> a ui:Plugin ;
  schema:additionalType ui:Link ;
  ui:label "X" ;
  schema:url <https://example.org/> , <https://other.example/> .
`);
  expect(report.conforms).toBe(false);
});

test('a Link without schema:url fails', async () => {
  const report = await validate(`
<#X> a ui:Plugin ; schema:additionalType ui:Link ; ui:label "X" .
`);
  expect(report.conforms).toBe(false);
});
