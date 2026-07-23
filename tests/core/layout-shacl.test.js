/**
 * shapes/layout.shacl validation contract. Component leaves in a layout are
 * ordinary ui:Component nodes, so full validation composes layout.shacl with
 * menu.shacl into one shapes graph (the documented cross-file pattern).
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
`;

function parse(text, base = 'http://layout-shacl.test/doc') {
  return new Store(new Parser({ baseIRI: base }).parse(text));
}

// layout.shacl + menu.shacl composed into one shapes graph.
const shapes = new Store();
for (const f of ['layout.shacl', 'menu.shacl']) {
  const quads = new Parser({ baseIRI: `http://layout-shacl.test/${f}` })
    .parse(readFileSync(join(root, 'shapes', f), 'utf8'));
  for (const q of quads) shapes.add(q);
}

async function validate(dataText) {
  return await new SHACLValidator(shapes).validate(parse(PREFIXES + dataText));
}

test('every shipped preset conforms (layout.shacl + menu.shacl composed)', async () => {
  const files = readdirSync(layoutsDir).filter((f) => f.endsWith('.ttl'));
  expect(files.length).toBeGreaterThanOrEqual(5); // 4 presets + index
  for (const f of files) {
    const data = parse(
      readFileSync(join(layoutsDir, f), 'utf8'),
      `http://layout-shacl.test/layouts/${f}`,
    );
    const report = await new SHACLValidator(shapes).validate(data);
    const messages = report.results.map((r) => `${f}: ${r.message.map((m) => m.value).join('; ')}`);
    expect(messages).toEqual([]);
    expect(report.conforms).toBe(true);
  }
});

test('ui:columns outside 1..6 fails', async () => {
  const report = await validate(`
<#Layout> a ui:Layout ; ui:columns 9 .
`);
  expect(report.conforms).toBe(false);
});

test('a ui:Link in layout members CONFORMS — links are now first-class members', async () => {
  const report = await validate(`
<#Layout> a ui:Layout ; schema:itemListElement <#Layout-L> .
<#Layout-L> a schema:ListItem ; schema:item <#L> ; schema:position 1 .
<#L> a ui:Link ; ui:label "Docs" ; schema:url <https://example.org/> .
`);
  expect(report.conforms).toBe(true);
});

test('a ui:Menu layout member conforms', async () => {
  const report = await validate(`
<#Layout> a ui:Layout ; schema:itemListElement <#M> .
<#M> a ui:Menu ; ui:label "Nav" .
`);
  expect(report.conforms).toBe(true);
});

test('a wrapper WITHOUT `a schema:ListItem` still conforms (type now optional)', async () => {
  const report = await validate(`
<#Layout> a ui:Layout ; schema:itemListElement <#W> .
<#W> schema:item <#Sub> ; schema:position 1 .
<#Sub> a ui:Layout .
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
<#Layout> a ui:Layout ; schema:itemListElement <#Only> .
<#Only> a ui:Component ; schema:url <https://example.org/sol-tabs.js> .
`);
  const messages = report.results.map((r) => r.message.map((m) => m.value).join('; '));
  expect(messages).toEqual([]);
  expect(report.conforms).toBe(true);
});

test('an unordered (direct) nested ui:Layout member conforms', async () => {
  const report = await validate(`
<#Layout> a ui:Layout ; schema:itemListElement <#Sub> .
<#Sub> a ui:Layout .
`);
  expect(report.conforms).toBe(true);
});

test('ordered and unordered members mix in one region', async () => {
  const report = await validate(`
<#Layout> a ui:Layout ;
  schema:itemListElement <#Sub> , <#W> .
<#Sub> a ui:Layout .
<#W> a schema:ListItem ; schema:item <#Leaf> ; schema:position 1 .
<#Leaf> a ui:Component ; schema:url <https://example.org/sol-tabs.js> .
`);
  expect(report.conforms).toBe(true);
});

test('a direct ui:Link member conforms — unordered links are allowed', async () => {
  const report = await validate(`
<#Layout> a ui:Layout ; schema:itemListElement <#L> .
<#L> a ui:Link ; ui:label "Docs" ; schema:url <https://example.org/> .
`);
  expect(report.conforms).toBe(true);
});

test('a member of a non-layout type still fails (e.g. bare ui:Command)', async () => {
  const report = await validate(`
<#Layout> a ui:Layout ; schema:itemListElement <#Bad> .
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
