/**
 * core/layout-serialize.js — the write half of parseLayoutTree. Covered:
 *   - round-trip: a composed layout parses → serializes → re-parses to a
 *     deep-equal tree (labels, orientation, columns, xhv:role, attribute
 *     pairs, membership order)
 *   - xhv:role is emitted (not schema:additionalType)
 *   - determinism: serialize(parse(serialize(x))) is byte-identical
 *   - addLeaf mints a fragment and lands in the right region
 *   - removeLeaf / moveLeaf edit membership
 *   - removeRegion detaches a whole region; insertPart puts it back
 *
 * Fixtures are composed by core/layout-compose.js — the App Builder no longer
 * ships static preset files, so the layouts under test are the ones the
 * configurator actually produces.
 */

import { Parser } from 'n3';
import { rdf } from '../../core/rdf.js';
import { parseLayoutTree } from '../../core/layout-generate.js';
import {
  serializeLayout, addLeaf, removeLeaf, moveLeaf, findRegion,
  removeRegion, insertPart,
} from '../../core/layout-serialize.js';
import { composeLayoutTurtle } from '../../core/layout-compose.js';

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
  if (t.kind === 'link') {
    return {
      kind: 'link',
      frag: t.node.value.split('#')[1],
      url: t.url,
      label: t.label || null,
      comment: t.comment || null,
    };
  }
  return {
    kind: 'region',
    frag: t.node.value.split('#')[1],
    label: t.label || null,
    comment: t.comment || null,
    orientation: t.orientation,
    columns: t.columns,
    role: t.role || null,
    params: t.params,
    parts: t.parts.map(norm),
  };
}

// Representative structures the configurator can emit.
const FIXTURES = {
  'header + main': { sidebars: 'none', menuLocation: 'header', hamburger: true },
  'left sidebar (menu in it)': { sidebars: 'left', menuLocation: 'left-sidebar', hamburger: true },
  'right sidebar + under-header menu': { sidebars: 'right', menuLocation: 'under-header', hamburger: false },
  'two sidebars + footer': { sidebars: 'both', footer: true, menuLocation: 'left-sidebar', hamburger: true },
};

for (const [name, cfg] of Object.entries(FIXTURES)) {
  test(`${name} round-trips through serializeLayout`, () => {
    const original = treeOf(composeLayoutTurtle(cfg));
    const ttl = serializeLayout(original, { docUrl: BASE });
    const reparsed = treeOf(ttl);
    expect(norm(reparsed)).toEqual(norm(original));
  });
}

test('regions serialize with xhv:role, not schema:additionalType', () => {
  const tree = treeOf(composeLayoutTurtle({ sidebars: 'both', footer: true, menuLocation: 'left-sidebar' }));
  const ttl = serializeLayout(tree, { docUrl: BASE });
  expect(ttl).toContain('xhv:role "banner"');
  expect(ttl).toContain('xhv:role "complementary"');
  expect(ttl).toContain('xhv:role "main"');
  expect(ttl).toContain('xhv:role "contentinfo"');
  expect(ttl).not.toMatch(/schema:additionalType|WPHeader|WPSideBar|WPFooter/);
});

test('serialization is deterministic across a round trip', () => {
  const tree = treeOf(composeLayoutTurtle({ sidebars: 'left', menuLocation: 'left-sidebar' }));
  const once = serializeLayout(tree, { docUrl: BASE });
  const twice = serializeLayout(treeOf(once), { docUrl: BASE });
  expect(twice).toBe(once);
});

test('same-origin module URLs relativize to path form', () => {
  const tree = treeOf(composeLayoutTurtle({ sidebars: 'none', menuLocation: 'header' }));
  const ttl = serializeLayout(tree, { docUrl: BASE });
  expect(ttl).toContain('schema:url </node_modules/sol-components/web/sol-menu.js>');
  expect(ttl).not.toContain('http://layout.test/node_modules');
});

test('addLeaf mints a fragment inside the chosen region', () => {
  const tree = treeOf(composeLayoutTurtle({ sidebars: 'left', menuLocation: 'left-sidebar' }));
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
  // Main already holds its start-page link, so the added leaf is second
  expect(ttl).toContain(':Main-Page-content a schema:ListItem; schema:item :Page-content; schema:position 2.');
  // and it round-trips
  expect(norm(treeOf(ttl))).toEqual(norm(tree));
});

test('removeLeaf drops the element; moveLeaf reorders siblings', () => {
  const tree = treeOf(composeLayoutTurtle({ sidebars: 'both', menuLocation: 'left-sidebar', hamburger: true }));
  expect(removeLeaf(tree, `${BASE}#Hamburger`)).toBe(true);
  expect(serializeLayout(tree, { docUrl: BASE })).not.toContain('sol-dropdown-button');

  const middle = findRegion(tree, `${BASE}#Middle`);
  const order = () => middle.parts.map((p) => p.node.value.split('#')[1]);
  expect(order()).toEqual(['Left', 'Main', 'Right']);
  expect(moveLeaf(tree, `${BASE}#Right`, -1)).toBe(true);
  expect(order()).toEqual(['Left', 'Right', 'Main']);
  expect(moveLeaf(tree, `${BASE}#Left`, -1)).toBe(false); // already first
});

test('removeRegion detaches a region with its contents; insertPart restores it', () => {
  const tree = treeOf(composeLayoutTurtle({ sidebars: 'both', footer: true }));
  const middle = findRegion(tree, `${BASE}#Middle`);
  const order = () => middle.parts.map((p) => p.node.value.split('#')[1]);
  expect(order()).toEqual(['Left', 'Main', 'Right']);

  const cut = removeRegion(tree, `${BASE}#Left`);
  expect(cut.parentIri).toBe(`${BASE}#Middle`);
  expect(cut.index).toBe(0);
  expect(order()).toEqual(['Main', 'Right']);
  expect(serializeLayout(tree, { docUrl: BASE })).not.toContain('app-side-left');

  expect(insertPart(tree, cut.parentIri, cut.region, cut.index)).toBe(true);
  expect(order()).toEqual(['Left', 'Main', 'Right']);
  expect(serializeLayout(tree, { docUrl: BASE })).toContain('app-side-left');
});

test('removeRegion takes the region\'s elements with it', () => {
  const tree = treeOf(composeLayoutTurtle({ sidebars: 'none', menuLocation: 'header' }));
  const cut = removeRegion(tree, `${BASE}#Header`);
  const ttl = serializeLayout(tree, { docUrl: BASE });
  expect(ttl).not.toContain('site-title.html');
  expect(ttl).not.toContain('MainMenu');
  insertPart(tree, cut.parentIri, cut.region, cut.index);
  expect(serializeLayout(tree, { docUrl: BASE })).toContain('site-title.html');
});

test('removeRegion refuses the root and non-regions', () => {
  const tree = treeOf(composeLayoutTurtle({ sidebars: 'none' }));
  expect(removeRegion(tree, `${BASE}#Layout`)).toBe(null);   // no parent
  expect(removeRegion(tree, `${BASE}#SiteTitle`)).toBe(null); // a link, not a region
});
