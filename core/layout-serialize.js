// layout-serialize — the write half of core/layout-generate.js's
// parseLayoutTree: turn a (possibly edited) layout tree back into a complete
// layout.ttl Turtle document, plus the pure tree editors the builder's
// element step uses (add / remove / move a ui:Component leaf).
//
// Emission is a string template in the exact idiom of the authored presets
// (data/layouts/*.ttl): prefixed Turtle, positioned schema:ListItem wrappers
// with DETERMINISTIC `<parentFrag>-<childFrag>` fragments (menu-serialize's
// wrapper convention), ui:attribute blank-node pairs. Same-origin module
// URLs relativize to path form (</node_modules/…>) so a saved layout stays
// portable across hosts.
//
// LIMITATION (by design): this round-trips exactly what parseLayoutTree
// reads — a hand-added triple outside that model is dropped on the next
// builder save. layout.ttl is builder-owned; hand-edit freely, but know a
// save rewrites the whole document. Saves go by whole-doc PUT: ui:attribute
// pairs are blank nodes, which a SPARQL DELETE can't address cleanly.

import { mintFragment } from './menu-serialize.js';
import { deriveTagFromModule } from './menu-rdf.js';

const SCHEMA = 'http://schema.org/';

const fragOf = (node) => {
  const v = (node && node.value) || '';
  const i = v.indexOf('#');
  return i >= 0 ? v.slice(i + 1) : null;
};

const lit = (s) => `"${String(s)
  .replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;

// schema.org IRIs shorten to schema:Local; anything else stays a full IRI.
const typeTerm = (iri) =>
  iri.startsWith(SCHEMA) ? `schema:${iri.slice(SCHEMA.length)}` : `<${iri}>`;

// Same-origin absolute URL → path-absolute (</node_modules/…>); relative or
// foreign values pass through.
function relativizeUrl(url, docUrl) {
  try {
    const u = new URL(url, docUrl);
    const d = new URL(docUrl);
    if (u.origin === d.origin) return u.pathname + u.search + u.hash;
  } catch { /* not URL-shaped — emit as-is */ }
  return url;
}

const attrList = (params) => params
  .map(([k, v]) => `[ schema:name ${lit(k)} ; schema:value ${lit(v)} ]`)
  .join(' ,\n               ');

/** Every region/leaf fragment used in the tree (wrappers are regenerated). */
export function usedTreeFragments(tree, out = new Set()) {
  const f = fragOf(tree.node);
  if (f) out.add(f);
  if (tree.kind === 'region') tree.parts.forEach((p) => usedTreeFragments(p, out));
  return out;
}

function emitLeaf(leaf, docUrl) {
  const frag = fragOf(leaf.node) || 'item';
  const lines = [`:${frag} a ui:Component`];
  if (leaf.item.name) lines.push(`  ui:label ${lit(leaf.item.name)}`);
  if (leaf.item.comment) lines.push(`  rdfs:comment ${lit(leaf.item.comment)}`);
  if (leaf.url) lines.push(`  schema:url <${relativizeUrl(leaf.url, docUrl)}>`);
  const params = (leaf.item.params || []).filter(([k]) => k);
  if (params.length) lines.push(`  ui:attribute ${attrList(params)}`);
  return lines.join(' ;\n') + ' .\n';
}

function emitRegion(region, docUrl, blocks, wrappers, wrapperTaken, isRoot = false) {
  const frag = fragOf(region.node) || 'Layout';
  const lines = [`:${frag} a ui:Layout`];
  if (region.label) lines.push(`  ui:label ${lit(region.label)}`);
  if (region.comment) lines.push(`  rdfs:comment ${lit(region.comment)}`);
  if (region.additionalTypeIri) {
    lines.push(`  schema:additionalType ${typeTerm(region.additionalTypeIri)}`);
  }
  if (region.orientation === 'horizontal') lines.push('  ui:orientation ui:Horizontal');
  else if (isRoot) lines.push('  ui:orientation ui:Vertical'); // root declares its axis
  if (region.columns) lines.push(`  ui:columns ${region.columns}`);
  const params = (region.params || []).filter(([k]) => k);
  if (params.length) lines.push(`  ui:attribute ${attrList(params)}`);

  if (region.parts.length) {
    const memberFrags = [];
    const lineGroup = [];
    region.parts.forEach((part, i) => {
      const childFrag = fragOf(part.node) || `item-${i + 1}`;
      const base = `${frag}-${childFrag}`;
      let wrap = base, n = 2;
      while (wrapperTaken.has(wrap)) wrap = `${base}-${n++}`;
      wrapperTaken.add(wrap);
      memberFrags.push(`:${wrap}`);
      lineGroup.push(`:${wrap} a schema:ListItem; schema:item :${childFrag}; schema:position ${i + 1}.`);
    });
    lines.push(
      '  schema:itemListOrder schema:ItemListOrderAscending;\n'
      + `    schema:itemListElement ${memberFrags.join(', ')}`,
    );
    wrappers.push(lineGroup.join('\n'));
  }
  blocks.push(lines.join(' ;\n') + ' .\n');

  // Children: leaves directly after their region, child regions after that —
  // the authored presets' reading order.
  for (const part of region.parts) {
    if (part.kind === 'leaf') blocks.push(emitLeaf(part, docUrl));
  }
  for (const part of region.parts) {
    if (part.kind === 'region') emitRegion(part, docUrl, blocks, wrappers, wrapperTaken);
  }
}

/**
 * Serialize a layout tree (from parseLayoutTree, possibly edited) into a
 * complete Turtle document.
 *
 * @param {object} tree    root region (kind 'region')
 * @param {object} o
 * @param {string} o.docUrl  the layout doc URL (for URL relativizing)
 * @param {string} [o.comment] leading document comment (without "# ")
 */
export function serializeLayout(tree, { docUrl, comment } = {}) {
  const blocks = [];
  const wrappers = [];
  emitRegion(tree, docUrl || '', blocks, wrappers, new Set(), true);
  let out = `@prefix : <#> .
@prefix ui: <http://www.w3.org/ns/ui#> .
@prefix schema: <http://schema.org/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
`;
  if (comment) out += '\n' + comment.split('\n').map((l) => `# ${l}`.trimEnd()).join('\n') + '\n';
  out += '\n' + blocks.join('\n');
  if (wrappers.length) out += '\n' + wrappers.join('\n\n') + '\n';
  return out;
}

/** Find a region node in the tree by its IRI. */
export function findRegion(tree, regionIri) {
  if (tree.kind !== 'region') return null;
  if (tree.node && tree.node.value === regionIri) return tree;
  for (const part of tree.parts) {
    const hit = findRegion(part, regionIri);
    if (hit) return hit;
  }
  return null;
}

/** The region whose parts contain the node with `iri` (leaf or region). */
export function findParentOf(tree, iri) {
  if (tree.kind !== 'region') return null;
  if (tree.parts.some((p) => p.node && p.node.value === iri)) return tree;
  for (const part of tree.parts) {
    const hit = findParentOf(part, iri);
    if (hit) return hit;
  }
  return null;
}

/**
 * Add a ui:Component leaf to a region. Mutates the tree; returns the leaf.
 *
 * @param {object} tree      root region
 * @param {string} regionIri IRI of the region to add into
 * @param {object} item      { label, module, params?, comment? } — module is
 *                           the component's ES-module URL (tag derives from
 *                           its filename)
 * @param {string} docUrl    the layout doc URL (new fragments live here)
 */
export function addLeaf(tree, regionIri, item, docUrl) {
  const region = findRegion(tree, regionIri);
  if (!region) return null;
  const taken = usedTreeFragments(tree);
  const frag = mintFragment(item.label || 'item', taken);
  const leaf = {
    kind: 'leaf',
    node: { value: `${String(docUrl).split('#')[0]}#${frag}` },
    url: item.module || null,
    item: {
      type: 'component',
      tag: deriveTagFromModule(item.module || ''),
      params: item.params || [],
      name: item.label || '',
      comment: item.comment || null,
    },
  };
  region.parts.push(leaf);
  return leaf;
}

/** Remove the leaf with `leafIri` from wherever it sits. Returns true if found. */
export function removeLeaf(tree, leafIri) {
  const parent = findParentOf(tree, leafIri);
  if (!parent) return false;
  const i = parent.parts.findIndex((p) => p.node && p.node.value === leafIri);
  if (i < 0 || parent.parts[i].kind !== 'leaf') return false;
  parent.parts.splice(i, 1);
  return true;
}

/** Move the part with `iri` by delta (−1 up / +1 down) within its region. */
export function moveLeaf(tree, iri, delta) {
  const parent = findParentOf(tree, iri);
  if (!parent) return false;
  const i = parent.parts.findIndex((p) => p.node && p.node.value === iri);
  const j = i + delta;
  if (i < 0 || j < 0 || j >= parent.parts.length) return false;
  const [part] = parent.parts.splice(i, 1);
  parent.parts.splice(j, 0, part);
  return true;
}
