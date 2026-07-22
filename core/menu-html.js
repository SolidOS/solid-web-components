// menu-html — harvest a declarative <sol-tabs> shell back into the menu model
// (the inverse of core/menu-generate.js). Used by the in-app tabs sync to fold a
// hand-edited html-first.html into the RDF: parse the file's <sol-tabs>, extract
// the #Tabs and #Bar items, then merge them into data/tabs.ttl with
// updateMenuInStore (which preserves pantry items + metadata).
//
// NOTE this reads the SOURCE markup (e.g. DOMParser'd file text), not the live
// rendered <sol-tabs> — sol-tabs harvests its anchors and resets its innerHTML on
// render, so the live element no longer holds the original children.
//
// Round-trip fidelity:
//   - Tabs are lossless: id, label (text), tag (data-handler), region, and every
//     attribute survive (source←href, id←id, data-*→param, plain attrs captured).
//   - Bar items are best-effort: emitBarItem does not write a non-button item's
//     label or its RDF fragment to HTML, so the label is recovered from `title`
//     and the fragment is re-minted from the label by updateMenuInStore. Editing
//     a non-button bar label by hand (diverging from its title) won't round-trip;
//     edit bar labels via the builder instead.

// `target` is the HTML spelling of a subset of ui:region (see display-target.js).
// Normalize the two that map cleanly; richer regions are written as region= and
// harvested by the `region` branch below.
function targetToRegion(v) {
  const t = (v || '').toLowerCase();
  if (t === '_blank') return 'tab';
  if (t === '_self') return 'inline';
  return null;
}

// Anchor attributes consumed structurally, not captured as a schema:additionalProperty param.
const TAB_SKIP = new Set(['href', 'id', 'data-handler', 'region', 'target', 'data-tab-id']);

// Exported singly (besides extractShell) so sol-tabs can normalize a live
// anchor / <submenu> child into the same item shape the RDF parse produces —
// the basis of applyTabs' change detection.
// href doc-part match against the caller-supplied entry docs (absolute or
// exactly-as-written relative forms). References are recognized ONLY when the
// caller names the catalog doc(s) — a plain hand-authored link can never be
// mistaken for one.
function entryRef(el, opts) {
  const docs = (opts && opts.entryDocs) || [];
  if (!docs.length || el.getAttribute('data-handler')) return null;
  const href = el.getAttribute('href') || '';
  return docs.includes(href.split('#')[0]) ? href : null;
}

export function extractTab(a, opts = {}) {
  // A ui:Plugin REFERENCE (a bare anchor whose href is the entry IRI): the
  // desc carries ONLY the entry marker — menu-serialize re-emits the bare
  // reference; the entry body lives in the catalog doc, never in the menu.
  const ref = entryRef(a, opts);
  if (ref) return { entry: ref, id: a.getAttribute('id') || undefined };
  // A LINK tab (ui:Link): emitTab's no-data-handler anchor — target (or a
  // region= for richer placements) marks it; href IS the link, not a
  // source to include. ui:icon has no HTML spelling, so it survives only
  // in the RDF (a hand-edited link imports without one).
  if (!a.getAttribute('data-handler') && (a.hasAttribute('target') || a.hasAttribute('region'))) {
    const region = a.hasAttribute('target')
      ? targetToRegion(a.getAttribute('target'))
      : ((a.getAttribute('region') || '').toLowerCase() || null);
    // Remaining attributes are the link's params (its URL search params) —
    // same data-/plain split components use, same TAB_SKIP structural set.
    const params = [];
    for (const attr of a.attributes) {
      if (TAB_SKIP.has(attr.name)) continue;
      params.push([attr.name.startsWith('data-') ? attr.name.slice(5) : attr.name, attr.value]);
    }
    return {
      type: 'link',
      id: a.getAttribute('id') || undefined,
      name: (a.textContent || '').trim(),
      region,
      href: a.getAttribute('href'),
      params,
    };
  }
  const params = [];
  let tag = null;
  let region = null;
  for (const attr of a.attributes) {
    const n = attr.name;
    const v = attr.value;
    if (n === 'href') { params.push(['source', v]); continue; }
    if (n === 'id') { params.push(['id', v]); continue; }
    if (n === 'data-handler') { tag = v; continue; }
    if (n === 'region') { region = v.toLowerCase(); continue; }
    if (n === 'target') { const r = targetToRegion(v); if (r) region = r; continue; }
    if (TAB_SKIP.has(n)) continue;
    if (n.startsWith('data-')) { params.push([n.slice(5), v]); continue; }
    params.push([n, v]);                       // plain attr (rel, download, …) captured as-is
  }
  return {
    type: 'component',
    id: a.getAttribute('id') || undefined,
    name: (a.textContent || '').trim(),
    tag,
    region,
    params,
  };
}

// A <submenu> block (emitted by menu-generate for a multi-plugin menu item):
// <label> = the item's name, child anchors = its plugins.
export function extractSubmenu(el, opts = {}) {
  const label = el.querySelector(':scope > label');
  const children = Array.from(el.querySelectorAll(':scope > a[href]')).map((a) => extractTab(a, opts));
  return {
    type: 'submenu',
    id: el.getAttribute('id') || undefined,
    name: (label ? label.textContent : '').trim(),
    children,
  };
}

function extractBarItem(el) {
  const params = [];
  let region = null;
  for (const attr of el.attributes) {
    const n = attr.name;
    const v = attr.value;
    if (n === 'region') { region = v.toLowerCase(); continue; }
    params.push([n, v]);                       // bar attrs are emitted/harvested verbatim
  }
  // emitBarItem only writes a sol-button's label as text; recover others from title.
  const name = (el.textContent || '').trim() || el.getAttribute('title') || '';
  return {
    type: 'component',
    id: undefined,                             // no id in bar HTML → updateMenuInStore mints one
    name,
    tag: el.tagName.toLowerCase(),
    region,
    params,
  };
}

/**
 * Harvest a <sol-tabs> element into `{ tabs, bar }` model arrays. Walks the
 * element's children up to the `<!-- chrome:begin -->` comment: `<a href>`
 * children (not slot="actions") are tabs, other elements before the chrome
 * marker are bar items. The chrome block and anything after it is left to the
 * generator to preserve verbatim.
 *
 * @param {Element} tabsEl a <sol-tabs> element (from parsed source markup)
 * @returns {{ tabs: object[], bar: object[] }}
 */
export function extractShell(tabsEl, opts = {}) {
  const tabs = [];
  const bar = [];
  if (!tabsEl) return { tabs, bar };
  let pendingComment = null;   // a leading comment documents the element after it
  for (const node of tabsEl.childNodes) {
    if (node.nodeType === 8) {                                  // comment node
      const text = (node.textContent || '').trim();
      if (/chrome:begin/.test(text)) break;                     // chrome block handled separately
      pendingComment = pendingComment ? `${pendingComment}\n${text}` : text;
      continue;
    }
    if (node.nodeType !== 1) continue;                          // element only
    const el = /** @type {Element} */ (node);
    let item = null;
    if (el.tagName.toLowerCase() === 'a' && el.hasAttribute('href')
        && el.getAttribute('slot') !== 'actions') {
      item = extractTab(el, opts); tabs.push(item);
    } else if (el.tagName.toLowerCase() === 'submenu') {
      item = extractSubmenu(el, opts); tabs.push(item);
    } else if (el.tagName.toLowerCase() === 'a') {
      // slot="actions" anchor: a BAR-side ui:Plugin reference (emitBarItem's
      // spelling); non-reference actions anchors stay ignored as before.
      const ref = entryRef(el, opts);
      if (ref) { item = { entry: ref }; bar.push(item); }
    } else {
      item = extractBarItem(el); bar.push(item);
    }
    if (item && pendingComment) item.comment = pendingComment;
    pendingComment = null;
  }
  return { tabs, bar };
}

/**
 * Convenience: parse an html-first.html string and harvest its <sol-tabs>.
 * Browser/jsdom only (uses DOMParser). Returns `{ tabs, bar }` (empty if no
 * <sol-tabs> is found).
 *
 * @param {string} html
 * @returns {{ tabs: object[], bar: object[] }}
 */
export function extractFromHtml(html, opts = {}) {
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  const tabsEl = doc.querySelector('sol-tabs');
  return extractShell(tabsEl, opts);
}
