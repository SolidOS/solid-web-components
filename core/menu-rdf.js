// Pure RDF→menu-item parsing helpers used by <sol-menu>'s `from-rdf`
// attribute. No DOM dependencies — `parseMenuItems` and friends return
// plain JS descriptions that the host element wraps with render closures.

import { rdf } from './rdf.js';
import { loadRdfStore } from './rdf-utils.js';

const UI     = 'http://www.w3.org/ns/ui#';
const RDF    = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const RDFS   = 'http://www.w3.org/2000/01/rdf-schema#';
const SCHEMA = 'http://schema.org/';
const ACL    = 'http://www.w3.org/ns/auth/acl#';
const DCT    = 'http://purl.org/dc/terms/';

// Who publishes the thing an item describes (a dct:publisher literal) —
// carried on entries so catalog cards can show a byline; round-tripped by
// the serializer like every other item field. (dct:creator collapsed into
// publisher, 2026-07-14.)
function dctVal(store, subject, localName) {
  const node = store.any(subject, rdf.sym(DCT + localName));
  return node ? node.value : null;
}

// A documentary comment carried on an item as rdfs:comment — used to round-trip
// the HTML comments that document menu/chrome items (generator re-emits them).
function rdfsComment(store, subject) {
  const node = store.any(subject, rdf.sym(RDFS + 'comment'));
  return node ? node.value : null;
}

// An item may declare the access mode it needs via the standard WAC vocab,
// e.g. `acl:mode acl:Write`. We surface a `requiresWrite` flag; the host app
// decides what to do with it (hide / disable / …) — the menu takes no policy.
function requiresWriteMode(store, subject) {
  return store.each(subject, rdf.sym(ACL + 'mode'), null)
    .some(m => m.value === ACL + 'Write');
}

// The attribute spelling of the same gate: a ui:attribute named `if-logged-in`
// (or `requires-write`) with an EMPTY value — the boolean form. Mirrors the
// HTML path's isGated (sol-menu). A NON-empty `if-logged-in` is sol-include's
// alternate-source switch, NOT a gate, so it must not match here.
export function gatedByParams(params) {
  return (params || []).some(([k, v]) =>
    (k === 'if-logged-in' || k === 'requires-write') && !v);
}

// Read a single ui:<localName> property of `subject` from `store`.
export function rdfVal(store, subject, localName) {
  const node = store.any(subject, rdf.sym(UI + localName));
  return node ? node.value : null;
}

// Walk an rdf:List, returning its elements as an array.
export function rdfListElements(store, listNode) {
  if (listNode.elements) return listNode.elements;
  const items = [];
  let cur = listNode;
  const nil   = rdf.sym(RDF + 'nil');
  const first = rdf.sym(RDF + 'first');
  const rest  = rdf.sym(RDF + 'rest');
  while (cur && cur.value !== nil.value) {
    const el = store.any(cur, first);
    if (el) items.push(el);
    cur = store.any(cur, rest);
  }
  return items;
}

// Read a ui:Component (or handler) node into { tag, params } where
// params is [[name, value], ...] from ui:attribute blanks.
export function rdfComponent(store, node) {
  if (!node) return { tag: null, params: [] };
  const tag = rdfVal(store, node, 'name') || rdfVal(store, node, 'label');
  const attrNodes = store.each(node, rdf.sym(UI + 'attribute'), null);
  const params = attrNodes.map(p => [
    (store.any(p, rdf.sym(SCHEMA + 'name'))  || {}).value || '',
    (store.any(p, rdf.sym(SCHEMA + 'value')) || {}).value || '',
  ]).filter(([k]) => k);
  return { tag, params };
}

// The fragment of a subject IRI (e.g. ".../menu.ttl#Settings" → "Settings"),
// used as the item's stable id so an HTML region can claim it via data-for.
function fragmentOf(node) {
  const v = (node && node.value) || '';
  const i = v.indexOf('#');
  return i >= 0 ? v.slice(i + 1) : null;
}

// Normalize a ui:orientation value to the "horizontal"/"vertical" token used
// by the HTML attribute layer. Accepts a ui:Orientation instance IRI
// (ui:Horizontal → "horizontal") or a legacy literal ("horizontal").
function orientationToken(v) {
  if (!v) return null;
  const local = v.includes('#') ? v.slice(v.indexOf('#') + 1) : v;
  return local.toLowerCase();
}

// Normalize a ui:region value to the lowercase token the HTML `region=`
// attribute uses. Accepts a ui:Region instance IRI (ui:Modal → "modal") or a
// literal. region is the ONE display property carried in RDF: it is the stored
// form of placement. At render time placement is still resolved from HTML —
// the generator emits `region=` from this token and display-target.js reads it
// there — so the "display lives in HTML" runtime model is unchanged.
function regionToken(v) {
  if (!v) return null;
  const local = v.includes('#') ? v.slice(v.indexOf('#') + 1) : v;
  return local.toLowerCase();
}

/**
 * Parse a ui:Menu's parts into a tree of plain item descriptions.
 *
 * Each description has one of these shapes (no functions, no DOM):
 *
 *   { type: 'submenu',   id, name, children: [...] }
 *   { type: 'component', id, name, icon, region, tag, params }
 *   { type: 'link',      id, name, icon, region, href, contents }
 *
 * The only display info in the RDF is `region` (ui:region, the stored placement
 * token). `how/lifetime` and the resolution of `region` are still done from the
 * HTML at render time (region= cascade, data-for, surface keywords). `id` is the
 * item's IRI fragment, the join key an HTML region uses to claim it.
 */
export function parseMenuItems(store, menuNode) {
  const partsNode = store.any(menuNode, rdf.sym(UI + 'parts'));
  if (!partsNode) return [];
  const parts = rdfListElements(store, partsNode);
  const menuType      = rdf.sym(UI + 'Menu');
  const componentType = rdf.sym(UI + 'Component');
  const typeNode      = rdf.sym(RDF + 'type');
  const items = [];

  for (const part of parts) {
    const partType = store.any(part, typeNode);
    const id       = fragmentOf(part);
    const label    = rdfVal(store, part, 'label') || part.value;
    const icon     = rdfVal(store, part, 'icon');
    const region   = regionToken(rdfVal(store, part, 'region'));
    const comment  = rdfsComment(store, part);
    const publisher = dctVal(store, part, 'publisher');
    // dct:source — the chip's MANIFEST IRI (e.g. plugins/music.ttl). This is the
    // chip's stable identity: a chip is a PLUGIN (one manifest), not a component
    // (one ui:name tag backs many chips). It links a mounted menu item back to
    // its catalog entry. NB: distinct from any ui:attribute `source` PARAM, which
    // is the plugin's data source, not its identity.
    const manifest  = dctVal(store, part, 'source');
    const requiresWrite = requiresWriteMode(store, part);

    if (partType && partType.value === menuType.value) {
      items.push({ type: 'submenu', id, name: label, comment, requiresWrite, children: parseMenuItems(store, part) });
      continue;
    }

    if (partType && partType.value === componentType.value) {
      const { tag, params } = rdfComponent(store, part);
      // ui:module — the ES module that defines the tag; lets a renderer
      // lazy-import an installable component on first mount.
      const moduleUrl = rdfVal(store, part, 'module');
      // Placement rides the attribute channel (a `region` ui:attribute) —
      // lift it into the structural field, exactly as the HTML harvest does
      // with a region= attribute (menu-html TAB_SKIP). The legacy ui:region
      // triple is still READ for third-party data; menu-serialize writes the
      // attribute spelling back for components (never the triple).
      const paramRegion = (params.find(([k]) => k === 'region') || [])[1];
      const itemParams = params.filter(([k]) => k !== 'region');
      items.push({ type: 'component', id, name: label, icon, comment, publisher,
        region: (paramRegion || '').toLowerCase() || region,
        requiresWrite: requiresWrite || gatedByParams(params),
        tag, params: itemParams, module: moduleUrl, manifest });
      continue;
    }

    const href     = rdfVal(store, part, 'href');
    const contents = rdfVal(store, part, 'contents');
    items.push({ type: 'link', id, name: label, icon, region, comment, publisher, requiresWrite, href, contents, manifest });
  }
  return items;
}

/**
 * Resolve `uri` (optionally relative to `baseUri`), fetch the RDF doc,
 * locate the menu root (by fragment or by ui:Menu type), and parse it.
 *
 * @returns {Promise<null | { items, orientation }>}
 *   `null` if no ui:Menu is found in the document.
 */
export async function loadMenuFromUri(uri, baseUri = null) {
  let docUrl, fragment;
  try {
    const parsed = new URL(uri, baseUri || undefined);
    fragment = parsed.hash.slice(1);
    parsed.hash = '';
    docUrl = parsed.href;
  } catch {
    docUrl = uri;
    fragment = '';
  }

  const store = await loadRdfStore(docUrl);
  let root;
  if (fragment) {
    root = rdf.sym(docUrl + '#' + fragment);
  } else {
    const menuType = rdf.sym(UI + 'Menu');
    const typeNode = rdf.sym(RDF + 'type');
    root = store.each(null, typeNode, menuType)[0];
  }
  if (!root) return null;

  const orientation = orientationToken(rdfVal(store, root, 'orientation')) || 'horizontal';
  const items       = parseMenuItems(store, root);
  return { items, orientation };
}
