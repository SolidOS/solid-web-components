/**
 * core/layout-serialize.js — the write half of parseLayoutTree. Covered:
 *   - round-trip: every shipped preset parses → serializes → re-parses to a
 *     deep-equal tree (labels, orientation, columns, semantic type,
 *     attribute pairs, membership order)
 *   - determinism: serialize(parse(serialize(x))) is byte-identical
 *   - addLeaf mints a fragment and lands in the right region
 *   - removeLeaf / moveLeaf edit membership
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Parser } from 'n3';
import { rdf } from '../../core/rdf.js';
import { parseLayoutTree } from '../../core/layout-generate.js';
import {
  serializeLayout, addLeaf, removeLeaf, moveLeaf, findRegion,
} from '../../core/layout-serialize.js';

const here = dirname(fileURLToPath(import.meta.url));
const layoutsDir = join(here, '..', '..', 'data', 'layouts');

const BASE = 'http://layout.test/app/layout.ttl';

function parseInto(text, base) {
  const g = rdf.graph();
  const conv = (t) =>
    t.termType === 'Literal' ? rdf.literal(t.value)
      : rdf.sym(t.termType === 'BlankNode' ? `_:${t.value}` : t.value);
  for (const q of new Parser({ baseIRI: base }).parse(text)) {
    g.add(conv(q.subject), conv(q.predicate), conv(q.object));
  }
  return g;
}

const treeOf = (text) =>
  parseLayoutTree(parseInto(text, BASE), rdf.sym(`${BASE}#Layout`));

// Node identity → fragment; drop the raw rdflib terms so trees deep-compare.
function norm(t) {
  if (t.kind === 'leaf') {
    return {
      kind: 'leaf',
      frag: t.node.value.split('#')[1],
      url: t.url,
      name: t.item.name,
      comment: t.item.comment || null,
      params: t.item.params,
    };
  }
  return {
    kind: 'region',
    frag: t.node.value.split('#')[1],
    label: t.label || null,
    comment: t.comment || null,
    orientation: t.orientation,
    columns: t.columns,
    additionalTypeIri: t.additionalTypeIri || null,
    params: t.params,
    parts: t.parts.map(norm),
  };
}

const PRESETS = [
  'banner-main.ttl', 'banner-left-sidebar.ttl', 'banner-right-sidebar.ttl',
  'banner-two-sidebars.ttl', 'banner-main-footer.ttl',
  'classic-shell.ttl', 'single-page.ttl', 'sidebar.ttl', 'dashboard-grid.ttl',
];

for (const file of PRESETS) {
  test(`${file} round-trips through serializeLayout`, () => {
    const original = treeOf(readFileSync(join(layoutsDir, file), 'utf8'));
    const ttl = serializeLayout(original, { docUrl: BASE });
    const reparsed = treeOf(ttl);
    expect(norm(reparsed)).toEqual(norm(original));
  });
}

test('serialization is deterministic across a round trip', () => {
  const tree = treeOf(readFileSync(join(layoutsDir, 'banner-left-sidebar.ttl'), 'utf8'));
  const once = serializeLayout(tree, { docUrl: BASE });
  const twice = serializeLayout(treeOf(once), { docUrl: BASE });
  expect(twice).toBe(once);
});

test('same-origin module URLs relativize to path form', () => {
  const tree = treeOf(readFileSync(join(layoutsDir, 'banner-main.ttl'), 'utf8'));
  const ttl = serializeLayout(tree, { docUrl: BASE });
  expect(ttl).toContain('schema:url </node_modules/sol-components/web/sol-include.js>');
  expect(ttl).not.toContain('http://layout.test/node_modules');
});

test('addLeaf mints a fragment inside the chosen region', () => {
  const tree = treeOf(readFileSync(join(layoutsDir, 'banner-left-sidebar.ttl'), 'utf8'));
  const main = findRegion(tree, `${BASE}#Main`);
  expect(main).toBeTruthy();
  const leaf = addLeaf(tree, `${BASE}#Main`, {
    label: 'Page content',
    module: 'http://layout.test/node_modules/sol-components/web/sol-include.js',
    params: [['source', 'content.html'], ['trusted', '']],
  }, BASE);
  expect(leaf.item.tag).toBe('sol-include');
  const ttl = serializeLayout(tree, { docUrl: BASE });
  expect(ttl).toContain(':Page-content a ui:Component');
  expect(ttl).toContain(':Main-Page-content a schema:ListItem; schema:item :Page-content; schema:position 1.');
  // and it round-trips
  expect(norm(treeOf(ttl))).toEqual(norm(tree));
});

test('removeLeaf drops the element; moveLeaf reorders siblings', () => {
  const tree = treeOf(readFileSync(join(layoutsDir, 'banner-two-sidebars.ttl'), 'utf8'));
  expect(removeLeaf(tree, `${BASE}#more`)).toBe(true);
  expect(serializeLayout(tree, { docUrl: BASE })).not.toContain('sol-dropdown-button');

  const middle = findRegion(tree, `${BASE}#Middle`);
  const order = () => middle.parts.map((p) => p.node.value.split('#')[1]);
  expect(order()).toEqual(['Left', 'Main', 'Right']);
  expect(moveLeaf(tree, `${BASE}#Right`, -1)).toBe(true);
  expect(order()).toEqual(['Left', 'Right', 'Main']);
  expect(moveLeaf(tree, `${BASE}#Left`, -1)).toBe(false); // already first
});
