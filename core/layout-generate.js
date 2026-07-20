// layout-generate — compile a ui:Layout tree (+ app metadata) into a full,
// readable standalone app page: index.html + app.css text (app-builder,
// 2026-07-19). Sibling of core/menu-generate.js one level up: that module
// emits the <sol-tabs> fragment from a menu model; this one emits the page
// shell from a layout model, rendering ui:Component leaves through the same
// emitBarItem() so what the page declares is exactly what menus declare.
//
// The RDF is the model; the EMITTED HTML is the artifact. Every element
// names its module / source / from-rdf in visible attributes — regions are
// never conjured from RDF at runtime. Menus stay runtime-rendered
// (sol-tabs/sol-menu from-rdf), so menu edits need no regeneration; only a
// LAYOUT change does.
//
// Tree semantics (see data/ui-vocab.ttl + shapes/layout.shacl):
//   ui:Layout  — a region whose members (positioned schema:itemListElement
//                wrappers, same idiom as menus) render SIMULTANEOUSLY; nested
//                layouts split it, ui:Component leaves are the content.
//                Absent ui:orientation defaults to VERTICAL (a page stacks;
//                menus default horizontal — different medium, different
//                natural axis). ui:columns N renders the parts as a grid.
//   semantic tag — schema:additionalType maps to the emitted element:
//                SiteNavigationElement→nav, WPHeader→header, WPFooter→
//                footer, WPSideBar→aside; the root's first unmarked
//                ui:Layout child emits <main>; everything else <div>.
//   ui:attribute — pairs emitted verbatim on the region's element (class
//                merges with the structural app-row/app-col/app-grid-N).

import { rdf } from './rdf.js';
import { menuMembers, rdfVal, rdfComponent, deriveTagFromModule } from './menu-rdf.js';
import { emitBarItem, esc } from './menu-generate.js';

const UI     = 'http://www.w3.org/ns/ui#';
const RDF    = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const RDFS   = 'http://www.w3.org/2000/01/rdf-schema#';
const SCHEMA = 'http://schema.org/';

const SEMANTIC_TAGS = new Map([
  [SCHEMA + 'SiteNavigationElement', 'nav'],
  [SCHEMA + 'WPHeader', 'header'],
  [SCHEMA + 'WPFooter', 'footer'],
  [SCHEMA + 'WPSideBar', 'aside'],
]);

// Tags sol-basic already registers — kept in sync with web/sol-basic.js so
// data-components stays minimal (a stale entry only costs one redundant
// token; sol-load imports are idempotent).
const SOL_BASIC_TAGS = new Set([
  'sol-include', 'sol-button', 'sol-dropdown-button', 'sol-menu', 'sol-tabs',
  'sol-accordion', 'sol-rolodex', 'sol-settings-nav',
  'sol-default', 'sol-modal', 'sol-window',
]);

const sym = (iri) => rdf.sym(iri);
const val = (store, subj, iri) => (store.any(subj, sym(iri)) || {}).value || null;

function isType(store, node, typeIri) {
  return store.each(node, sym(RDF + 'type'), null).some((t) => t.value === typeIri);
}

/**
 * Parse a ui:Layout node (and its subtree) into a plain description:
 *   { kind:'region', node, label, comment, orientation, columns, params,
 *     semantic, parts: [region|leaf …] }
 *   { kind:'leaf', item:{type:'component', tag, params, name, comment}, url }
 */
export function parseLayoutTree(store, node) {
  if (isType(store, node, UI + 'Component')) {
    const { tag, params } = rdfComponent(store, node);
    return {
      kind: 'leaf',
      url: val(store, node, SCHEMA + 'url'),
      item: {
        type: 'component',
        tag,
        params,
        name: rdfVal(store, node, 'label') || '',
        comment: val(store, node, RDFS + 'comment'),
      },
    };
  }
  const orientationIri = rdfVal(store, node, 'orientation');
  const columns = rdfVal(store, node, 'columns');
  const attrNodes = store.each(node, sym(UI + 'attribute'), null);
  return {
    kind: 'region',
    node,
    label: rdfVal(store, node, 'label'),
    comment: val(store, node, RDFS + 'comment'),
    orientation:
      orientationIri && orientationIri.endsWith('Horizontal') ? 'horizontal' : 'vertical',
    columns: columns ? parseInt(columns, 10) : null,
    semantic: SEMANTIC_TAGS.get(val(store, node, SCHEMA + 'additionalType')) || null,
    params: attrNodes
      .map((p) => [
        (store.any(p, sym(SCHEMA + 'name')) || {}).value || '',
        (store.any(p, sym(SCHEMA + 'value')) || {}).value || '',
      ])
      .filter(([k]) => k),
    parts: menuMembers(store, node).map((el) => parseLayoutTree(store, el)),
  };
}

const walkLeaves = (tree, out = []) => {
  if (tree.kind === 'leaf') out.push(tree);
  else tree.parts.forEach((p) => walkLeaves(p, out));
  return out;
};

// The structural class carrying a region's flow: grid beats orientation.
const structuralClass = (region) =>
  region.columns ? `app-grid-${region.columns}` : region.orientation === 'horizontal' ? 'app-row' : 'app-col';

// `from-rdf` values of every menu-consuming leaf — the menu docs the app
// needs seeded (builder uses this to know which fragments to create).
export function menuSourcesIn(tree) {
  return [...new Set(
    walkLeaves(tree)
      .flatMap((l) => l.item.params.filter(([k]) => k === 'from-rdf').map(([, v]) => v)),
  )];
}

function emitRegion(region, { depth, isMain, warn }) {
  const pad = '  '.repeat(depth);
  const tag = region.semantic || (isMain ? 'main' : 'div');
  const attrs = new Map(region.params);
  const cls = [attrs.get('class'), structuralClass(region)].filter(Boolean).join(' ');
  attrs.delete('class');
  let open = `${pad}<${tag} class="${esc(cls)}"`;
  for (const [k, v] of attrs) open += v === '' ? ` ${k}` : ` ${k}="${esc(v)}"`;
  open += '>';

  // The root's first unmarked layout child becomes <main>; below the root
  // nothing else claims it.
  let out = region.comment ? `${pad}<!-- ${region.comment} -->\n` : '';
  out += `${open}\n`;
  for (const part of region.parts) {
    if (part.kind === 'region') {
      out += emitRegion(part, { depth: depth + 1, isMain: false, warn });
    } else {
      // Leaves render through menu-generate's emitBarItem so page markup and
      // menu markup declare components identically; its output is 2-space
      // indented, so add depth more levels to sit inside this region.
      const html = emitBarItem(part.item, warn);
      if (html) out += html.replace(/^(?!\s*$)/gm, '  '.repeat(depth));
    }
  }
  out += `${pad}</${tag}>\n`;
  return out;
}

const emojiFavicon = (icon) =>
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">${icon}</text></svg>`,
  );

/**
 * Emit the full standalone index.html for an app.
 *
 * @param {object} o
 * @param {object} o.store       rdflib store holding the layout doc
 * @param {object} o.layoutNode  the root ui:Layout node (rdf.sym)
 * @param {object} [o.app]       { title, icon } — from the app.ttl node
 * @param {string} [o.componentsBase]  where sol-components is served from;
 *                 same-origin /node_modules default, or a pinned CDN base
 * @param {(msg:string)=>void} [o.warn]
 */
export function generateAppHtml({
  store,
  layoutNode,
  app = {},
  componentsBase = '/node_modules/sol-components',
  warn = () => {},
}) {
  const tree = parseLayoutTree(store, layoutNode);
  const leaves = walkLeaves(tree);

  // sol-* tags boot via sol-load's data-components; anything else names its
  // module in a visible <script type="module"> of its own.
  const solTags = [...new Set(
    leaves.map((l) => l.item.tag).filter((t) => t && t.startsWith('sol-') && !SOL_BASIC_TAGS.has(t)),
  )];
  const foreign = leaves.filter((l) => l.item.tag && !l.item.tag.startsWith('sol-') && l.url);

  const title = app.title || 'App';
  const icon = app.icon || null;
  const iconHref = icon
    ? /^(https?:)?\//.test(icon) ? icon : emojiFavicon(icon)
    : null;

  let head = `  <meta charset="utf-8">\n`;
  head += `  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n`;
  head += `  <title>${esc(title)}</title>\n`;
  if (iconHref) head += `  <link rel="icon" href="${esc(iconHref)}">\n`;
  head += `  <link rel="stylesheet" href="${esc(componentsBase)}/web/styles/root.css">\n`;
  head += `  <link rel="stylesheet" href="app.css">\n`;
  head += `  <script src="${esc(componentsBase)}/web/sol-load.js"\n`;
  head += `          data-components="${esc(['sol-basic', ...solTags].join(' '))}"></script>\n`;
  for (const f of foreign) {
    head += `  <script type="module" src="${esc(f.url)}"></script>\n`;
  }

  // The root layout IS the body: its structural class goes on <body>, its
  // children emit directly. The first unmarked layout child is the page's
  // primary content and emits <main>.
  const rootCls = [new Map(tree.params).get('class'), structuralClass(tree)]
    .filter(Boolean).join(' ');
  let mainClaimed = false;
  let body = '';
  for (const part of tree.parts) {
    if (part.kind === 'region') {
      const isMain = !part.semantic && !mainClaimed;
      if (isMain) mainClaimed = true;
      body += '\n' + emitRegion(part, { depth: 1, isMain, warn });
    } else {
      const html = emitBarItem(part.item, warn);
      if (html) body += '\n' + html;
    }
  }

  return `<!doctype html>
<html lang="en">
<head>
${head}</head>
<body class="${esc(rootCls)}">
${body}
</body>
</html>
`;
}

/**
 * Emit the app's stylesheet: structural flow classes actually used by the
 * tree plus minimal scaffolding. Arrangement CSS lives HERE (hand-editable),
 * not in RDF — the vocabulary carries only orientation and columns.
 */
export function generateAppCss(storeOrTree, layoutNode = null) {
  const tree = layoutNode ? parseLayoutTree(storeOrTree, layoutNode) : storeOrTree;
  const grids = new Set();
  (function walk(r) {
    if (r.kind === 'leaf') return;
    if (r.columns) grids.add(r.columns);
    r.parts.forEach(walk);
  })(tree);

  let css = `/* Generated by sol-components layout-generate — hand-editable. */
html, body { height: 100%; }
body { margin: 0; min-height: 100dvh; overflow: hidden; }
.app-row { display: flex; flex-direction: row; align-items: center; gap: .5rem; }
.app-col { display: flex; flex-direction: column; }
/* Scroll lives on the content pane, never the page. */
main { flex: 1 1 auto; min-height: 0; overflow: auto; }
nav, header, footer, aside { padding: .5rem 1rem; }
`;
  for (const n of [...grids].sort()) {
    css += `.app-grid-${n} { display: grid; grid-template-columns: repeat(${n}, minmax(0, 1fr)); gap: 1rem; }\n`;
  }
  return css;
}

/**
 * Seed Turtle for an app menu doc fragment (the doc a layout's `from-rdf`
 * names). The managers rewrite it from here on; this is only the newborn
 * form. Turtle template rather than the serializer: seeding predates any
 * store/doc to rewrite, and presets ship as authored TTL the same way.
 */
export function seedAppMenu({ label = 'Tabs', fragment = 'Tabs', orientation = 'Horizontal' } = {}) {
  return `@prefix : <#> .
@prefix ui: <http://www.w3.org/ns/ui#> .

# The app's menu — edit via the builder's menu step (or any sol-menu-manager).
# Members arrive as positioned schema:ListItem wrappers (schema:itemListElement);
# a newborn menu simply has none yet.
:${fragment} a ui:Menu ;
  ui:label "${label.replace(/"/g, '\\"')}" ;
  ui:orientation ui:${orientation} .
`;
}

export { deriveTagFromModule };
