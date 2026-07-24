/**
 * shapes/ui.shacl validation contract.
 *
 * These are the shared item shapes (ui:Menu / ui:Link / ui:Component) that
 * menus, palette cards, and component-interop manifest entries all validate
 * against. Uses the same engine component-interop's manifest tests use:
 * n3 + rdf-validate-shacl.
 *
 * Covered here:
 *   - the real-world menu fixture conforms
 *   - a menu member without ui:label fails (:MenuItemShape via the parts path)
 *   - a free-standing ui:Component without ui:label conforms (labels are only
 *     required in menu context)
 *   - a ui:Link with neither schema:url nor ui:contents fails (the sh:xone)
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Parser, Store } from 'n3';
import SHACLValidator from 'rdf-validate-shacl';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');

const PREFIXES = `
@prefix ui:     <http://www.w3.org/ns/ui#> .
@prefix schema: <http://schema.org/> .
@prefix acl:    <http://www.w3.org/ns/auth/acl#> .
`;

function parse(text, base = 'http://menu-shacl.test/doc') {
  return new Store(new Parser({ baseIRI: base }).parse(text));
}

const shapes = parse(
  readFileSync(join(root, 'shapes', 'ui.shacl'), 'utf8'),
  'http://menu-shacl.test/shapes',
);

async function validate(dataText) {
  return await new SHACLValidator(shapes).validate(parse(PREFIXES + dataText));
}

test('the menu fixture conforms', async () => {
  const data = parse(
    readFileSync(join(here, '..', 'fixtures', 'menu-pantry.ttl'), 'utf8'),
  );
  const report = await new SHACLValidator(shapes).validate(data);
  const messages = report.results.map((r) => r.message.map((m) => m.value).join('; '));
  expect(messages).toEqual([]);
  expect(report.conforms).toBe(true);
});

test('a menu with a ui:region default conforms', async () => {
  const report = await validate(`
<#Menu> a ui:Menu ; ui:label "m" ; ui:region ui:Modal ;
  schema:itemListElement <#A> .
<#A> a ui:Link ; ui:label "A" ; schema:url "https://a.example/" .
`);
  const messages = report.results.map((r) => r.message.map((m) => m.value).join('; '));
  expect(messages).toEqual([]);
  expect(report.conforms).toBe(true);
});

test('a menu with an unknown ui:region fails (sh:in)', async () => {
  const report = await validate(`
<#Menu> a ui:Menu ; ui:label "m" ; ui:region ui:Sidebar ;
  schema:itemListElement <#A> .
<#A> a ui:Link ; ui:label "A" ; schema:url "https://a.example/" .
`);
  expect(report.conforms).toBe(false);
});

test('a menu member without ui:label fails', async () => {
  const report = await validate(`
<#Menu> a ui:Menu ; ui:label "m" ;
  schema:itemListElement <#Menu-NoLabel> .
<#Menu-NoLabel> a schema:ListItem ; schema:item <#NoLabel> ; schema:position 1 .
<#NoLabel> a ui:Component ; schema:url <https://example.org/web/sol-thing.js> .
`);
  expect(report.conforms).toBe(false);
  // The engine surfaces the outer sh:or violation on the membership property
  // (message-less — sh:or has no default text); the nested label sh:message
  // stays inside the shape. Paired with the free-standing-conforms test
  // below, this proves labels bind via menus only.
  const paths = report.results.map((r) => r.path && r.path.value).filter(Boolean);
  expect(paths).toContain('http://schema.org/itemListElement');
});

test('a free-standing ui:Component without ui:label conforms', async () => {
  // The manifest-entry case: labels are optional outside menu context.
  const report = await validate(`
<#Card> a ui:Component ; schema:url <https://example.org/web/sol-feed.js> ; ui:icon "📰" .
`);
  expect(report.conforms).toBe(true);
});

test('a ui:Link with neither schema:url nor ui:contents fails the xone', async () => {
  const report = await validate(`
<#Menu> a ui:Menu ; ui:label "m" ;
  schema:itemListElement <#Menu-Bad> .
<#Menu-Bad> a schema:ListItem ; schema:item <#Bad> ; schema:position 1 .
<#Bad> a ui:Link ; ui:label "dangling" .
`);
  expect(report.conforms).toBe(false);
});

// ── plugin surface (single schema:url payload since 2026-07-19; settings
//    pointers on both item kinds; dct:creator collapsed into publisher) ────

test('a full plugin doc — Component with a module url + settings pointers — conforms', async () => {
  const report = await validate(`
@prefix dcterms: <http://purl.org/dc/terms/> .
<#Plug> a ui:Component ;
  ui:label "Star Charts" ;
  schema:url <https://example.org/starcharts/star-charts.esm.js> ;
  ui:icon "✨" ;
  dcterms:publisher "Someone" ;
  dcterms:conformsTo <https://example.org/starcharts/settings.shacl> ;
  dcterms:references <https://example.org/starcharts/settings.ttl> ;
  schema:softwareHelp <https://example.org/starcharts/help.html> .
`);
  expect(report.results.map((r) => r.message.map((m) => m.value).join('; '))).toEqual([]);
  expect(report.conforms).toBe(true);
});

test('a ui:Link carrying the settings pointers conforms too', async () => {
  const report = await validate(`
@prefix dcterms: <http://purl.org/dc/terms/> .
<#App> a ui:Link ;
  ui:label "Some app" ;
  schema:url <https://app.example.org/> ;
  dcterms:publisher "Org" ;
  dcterms:conformsTo <https://app.example.org/settings.shacl> ;
  dcterms:references <https://app.example.org/settings.ttl> ;
  schema:softwareHelp <https://app.example.org/help.html> .
`);
  expect(report.conforms).toBe(true);
});

test("a Component's schema:url must be an IRI with a tag-shaped filename", async () => {
  for (const bad of ['"not-an-iri"', '<https://example.org/dist/bundle.js>']) {
    const report = await validate(`
<#Plug> a ui:Component ; schema:url ${bad} .
`);
    expect(report.conforms).toBe(false);
  }
});
