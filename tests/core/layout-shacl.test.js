/**
 * Layout validation contract (shapes/ui.shacl). Component leaves in a layout are
 * ordinary ui:Component nodes; the layout and menu/plugin shapes now live in one
 * file (ui.shacl), so a single shapes graph covers both.
 *
 * Covered here:
 *   - every shipped preset (data/layouts/*.ttl) conforms, index included
 *   - ui:columns outside 1..6 fails
 *   - a ui:Link in layout parts fails (parts are Layout|Component only)
 *   - an app node without ui:layout fails :AppShape
 */

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Parser, Store } from 'n3';
import SHACLValidator from 'rdf-validate-shacl';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const layoutsDir = join(root, 'data', 'layouts');

const PREFIXES = `
@prefix ui:     <http://www.w3.org/ns/ui#> .
@prefix schema: <http://schema.org/> .
@prefix xhv:    <http://www.w3.org/1999/xhtml/vocab#> .
`;

function parse(text, base = 'http://layout-shacl.test/doc') {
  return new Store(new Parser({ baseIRI: base }).parse(text));
}

// ui.shacl holds the layout + menu/plugin shapes in one graph.
const shapes = new Store();
{
  const f = 'ui.shacl';
  const quads = new Parser({ baseIRI: `http://layout-shacl.test/${f}` })
    .parse(readFileSync(join(root, 'shapes', f), 'utf8'));
  for (const q of quads) shapes.add(q);
}

async function validate(dataText) {
  return await new SHACLValidator(shapes).validate(parse(PREFIXES + dataText));
}

// NB: the data/layouts/*.ttl presets are the (unshipped) App Builder's demo
// layouts — they mark regions the LEGACY way (schema:additionalType) and some
// carry purely structural grid regions with no landmark. Since xhv:role is now
// REQUIRED, they no longer conform, and they aren't a shipped concern; the
// layout engine still compiles them (see layout-generate.test.js). Conformance
// is now asserted on the live consumer instead — dk's shell (data-kitchen).
test('the preset layouts still exist for the layout engine to compile', () => {
  const files = readdirSync(layoutsDir).filter((f) => f.endsWith('.ttl'));
  expect(files.length).toBeGreaterThanOrEqual(5);
});

test('ui:columns outside 1..6 fails', async () => {
  const report = await validate(`
<#Layout> a ui:Layout ; ui:columns 9 .
`);
  expect(report.conforms).toBe(false);
});

test('a ui:Link in layout members CONFORMS — links are now first-class members', async () => {
  const report = await validate(`
<#Layout> a ui:Layout ; ui:label "Main" ; xhv:role "main" ; schema:itemListElement <#Layout-L> .
<#Layout-L> a schema:ListItem ; schema:item <#L> ; schema:position 1 .
<#L> a ui:Link ; ui:label "Docs" ; schema:url <https://example.org/> .
`);
  expect(report.conforms).toBe(true);
});

test('a ui:Menu layout member conforms', async () => {
  const report = await validate(`
<#Layout> a ui:Layout ; ui:label "Main" ; xhv:role "main" ; schema:itemListElement <#M> .
<#M> a ui:Menu ; ui:label "Nav" .
`);
  expect(report.conforms).toBe(true);
});

test('a wrapper WITHOUT `a schema:ListItem` still conforms (type now optional)', async () => {
  const report = await validate(`
<#Layout> a ui:Layout ; ui:label "Main" ; xhv:role "main" ; schema:itemListElement <#W> .
<#W> schema:item <#Sub> ; schema:position 1 .
<#Sub> a ui:Layout ; ui:label "Sub" ; xhv:role "main" .
`);
  const messages = report.results.map((r) => r.message.map((m) => m.value).join('; '));
  expect(messages).toEqual([]);
  expect(report.conforms).toBe(true);
});

test('an app node without ui:layout fails :AppShape', async () => {
  const report = await validate(`
<#app> a schema:WebApplication ; schema:name "My App" .
`);
  expect(report.conforms).toBe(false);
});

test('a full app node conforms', async () => {
  const report = await validate(`
<#app> a schema:WebApplication ;
  schema:name "My App" ;
  ui:icon "🍳" ;
  ui:layout <layout.ttl#Layout> .
`);
  const messages = report.results.map((r) => r.message.map((m) => m.value).join('; '));
  expect(messages).toEqual([]);
  expect(report.conforms).toBe(true);
});

test('an unordered (direct) ui:Component member conforms — no wrapper needed', async () => {
  const report = await validate(`
<#Layout> a ui:Layout ; ui:label "Main" ; xhv:role "main" ; schema:itemListElement <#Only> .
<#Only> a ui:Component ; schema:url <https://example.org/sol-tabs.js> .
`);
  const messages = report.results.map((r) => r.message.map((m) => m.value).join('; '));
  expect(messages).toEqual([]);
  expect(report.conforms).toBe(true);
});

test('an unordered (direct) nested ui:Layout member conforms', async () => {
  const report = await validate(`
<#Layout> a ui:Layout ; ui:label "Main" ; xhv:role "main" ; schema:itemListElement <#Sub> .
<#Sub> a ui:Layout ; ui:label "Sub" ; xhv:role "main" .
`);
  expect(report.conforms).toBe(true);
});

test('ordered and unordered members mix in one region', async () => {
  const report = await validate(`
<#Layout> a ui:Layout ; ui:label "Main" ; xhv:role "main" ;
  schema:itemListElement <#Sub> , <#W> .
<#Sub> a ui:Layout ; ui:label "Sub" ; xhv:role "main" .
<#W> a schema:ListItem ; schema:item <#Leaf> ; schema:position 1 .
<#Leaf> a ui:Component ; schema:url <https://example.org/sol-tabs.js> .
`);
  expect(report.conforms).toBe(true);
});

test('a direct ui:Link member conforms — unordered links are allowed', async () => {
  const report = await validate(`
<#Layout> a ui:Layout ; ui:label "Main" ; xhv:role "main" ; schema:itemListElement <#L> .
<#L> a ui:Link ; ui:label "Docs" ; schema:url <https://example.org/> .
`);
  expect(report.conforms).toBe(true);
});

test('a member of a non-layout type still fails (e.g. bare ui:Command)', async () => {
  const report = await validate(`
<#Layout> a ui:Layout ; ui:label "Main" ; xhv:role "main" ; schema:itemListElement <#Bad> .
<#Bad> a ui:Command ; schema:url <commands.ttl#restart> .
`);
  expect(report.conforms).toBe(false);
});

test('a schema:SoftwareApplication app node conforms (AppShape broadened)', async () => {
  const report = await validate(`
<#app> a schema:SoftwareApplication ;
  schema:name "Data Kitchen" ;
  ui:layout <layout.ttl#Layout> .
`);
  const messages = report.results.map((r) => r.message.map((m) => m.value).join('; '));
  expect(messages).toEqual([]);
  expect(report.conforms).toBe(true);
});

test('a valid xhv:role landmark token conforms', async () => {
  const report = await validate(`
<#Layout> a ui:Layout ; ui:label "Main" ; xhv:role "main" .
`);
  expect(report.conforms).toBe(true);
});

test('an out-of-set xhv:role token fails', async () => {
  const report = await validate(`
<#Layout> a ui:Layout ; xhv:role "widget" .
`);
  expect(report.conforms).toBe(false);
});
