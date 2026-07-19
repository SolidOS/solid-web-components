// menu-generate — render the declarative <sol-tabs> shell HTML from parsed menu
// models (the inverse of core/menu-html.js). Shared by the node tool
// (data-kitchen tools/conversion/generate-html-first.mjs) and the in-app tabs
// sync, so what regenerates is exactly what the parser/harvester round-trips.
//
//   #Tabs → <a> anchors: href=source, id=id, data-handler=the item's tag,
//           region=ui:region, other params data-prefixed (standard <a> attrs
//           in ANCHOR_ATTRS emitted plain so the anchor stays HTML-valid).
//   #Bar  → the element whose tag derives from schema:url, params verbatim; a sol-button
//           shows its ui:label as text.
//
// The opening `<sol-tabs …>` tag and the chrome block (between
// `<!-- chrome:begin -->` and `<!-- chrome:end -->`) are preserved VERBATIM from
// the current HTML: they are hand-editable shell, not modeled in RDF.

// Standard <a> attributes emitted as-is (NOT data-prefixed), so a hand-authored
// anchor stays HTML-valid and the value harvests straight back. menu-html.js
// imports this same set to invert the mapping. `target` is handled separately
// (it normalizes to ui:region), so it is intentionally NOT listed here.
export const ANCHOR_ATTRS = new Set([
  'rel', 'download', 'hreflang', 'type', 'referrerpolicy', 'ping',
]);

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const attrPairs = (item) => new Map((item.params || []).map(([k, v]) => [k, v]));

// A leading documentary comment (item.comment / rdfs:comment), emitted before the
// element so the prose round-trips with the data.
const emitComment = (c) => (c ? `  <!-- ${String(c)} -->\n` : '');

// Relativize an entry IRI against the menu doc for readable emitted HTML —
// same directory collapses to basename#frag; anything else stays absolute.
function entryHref(entry, docUrl) {
  const e = String(entry);
  if (!docUrl) return e;
  const dir = docUrl.slice(0, docUrl.lastIndexOf('/') + 1);
  return e.startsWith(dir) ? e.slice(dir.length) : e;
}

export function emitTab(item, warn = () => {}, docUrl = null) {
  // A ui:Plugin REFERENCE (plugin-manifest-unification): a bare anchor whose
  // href is the entry IRI — no data-handler, no target/region, nothing else.
  // The harvester maps it back only when told the entry doc(s), so plain
  // hand-authored links can never be mistaken for references.
  if (item.entry) {
    let out = emitComment(item.comment);
    out += `  <a href="${esc(entryHref(item.entry, docUrl))}"\n  >${item.name ?? ''}</a>\n`;
    return out;
  }
  // A submenu tab (several plugins on one menu item) emits as a <submenu>
  // block — a <label> plus its child anchors — which sol-tabs harvests back
  // into a nested sub-tabset and menu-html.js extracts back into the model.
  if (item.type === 'submenu') {
    const children = (item.children || []).map((c) => emitTab(c, warn)).filter(Boolean)
      .map((s) => s.replace(/^ {2}/gm, '    '));
    let out = emitComment(item.comment);
    out += `  <submenu${item.id ? ` id="${esc(item.id)}"` : ''}>\n`;
    out += `    <label>${esc(item.name)}</label>\n`;
    out += children.join('\n');
    out += `  </submenu>\n`;
    return out;
  }
  // A LINK tab/child (ui:Link) — a plain anchor with NO data-handler; that
  // absence is what marks it as a link (not an include/component tab) on
  // harvest. ui:region round-trips through the standard target attribute
  // where it maps cleanly (tab ↔ _blank, inline ↔ _self; menu-html inverts
  // both) and as region= otherwise; a region-less link normalizes to
  // target="_blank", a link tab's default. ui:icon has no HTML spelling and
  // is carried by the RDF only.
  if (item.type === 'link' && item.href) {
    let out = emitComment(item.comment);
    const r = (item.region || 'tab').toLowerCase();
    const t = r === 'tab' ? '_blank' : r === 'inline' ? '_self' : null;
    out += `  <a href="${esc(item.href)}"${item.id ? ` id="${esc(item.id)}"` : ''}\n`;
    out += t ? `     target="${esc(t)}"\n` : `     region="${esc(r)}"\n`;
    out += `  >${item.name}</a>\n`;
    return out;
  }
  if (item.type !== 'component' || !item.tag) {
    warn(`skipping unassigned tab item "${item.name}" — drop a plugin on it first`);
    return '';
  }
  const attrs = attrPairs(item);
  const href = attrs.get('source') ?? '#';
  const id = attrs.get('id') ?? '';
  let out = emitComment(item.comment);
  out += `  <a href="${esc(href)}"${id ? ` id="${esc(id)}"` : ''}\n`;
  out += `     data-handler="${esc(item.tag)}"\n`;
  if (item.region) out += `     region="${esc(item.region)}"\n`;
  for (const [k, v] of attrs) {
    if (k === 'source' || k === 'id') continue;
    const name = ANCHOR_ATTRS.has(k) ? k : `data-${k}`;
    out += v === '' ? `     ${name}\n` : `     ${name}="${esc(v)}"\n`;
  }
  out += `  >${item.name}</a>\n`;
  return out;
}

export function emitBarItem(item, warn = () => {}, docUrl = null) {
  // Bar-side reference: slot="actions" is what tells the harvester this
  // anchor belongs to the BAR (tab references are plain anchors).
  if (item.entry) {
    let out = emitComment(item.comment);
    out += `  <a slot="actions" href="${esc(entryHref(item.entry, docUrl))}"\n  >${item.name ?? ''}</a>\n`;
    return out;
  }
  if (item.type !== 'component' || !item.tag) {
    warn(`skipping unassigned bar item "${item.name}" — drop a plugin on it first`);
    return '';
  }
  const attrs = attrPairs(item);
  let out = emitComment(item.comment);
  out += `  <${item.tag}`;
  if (item.region) out += `\n     region="${esc(item.region)}"`;
  for (const [k, v] of attrs) out += v === '' ? `\n     ${k}` : `\n     ${k}="${esc(v)}"`;
  const text = item.tag === 'sol-button' ? item.name : '';
  out += `\n  >${text}</${item.tag}>\n`;
  return out;
}

/**
 * Assemble the full `<sol-tabs>…</sol-tabs>` shell. `currentHtml` supplies the
 * opening tag (preserved verbatim). Tabs and bar items are emitted with their
 * leading comments (rdfs:comment). The chrome block is emitted from `chrome`
 * (parsed #Chrome) when given, else preserved verbatim from `currentHtml`.
 * Returns `{ html, chrome }`; `chrome` is null and `html` '' when the opening tag
 * or the marker block is missing, so callers can refuse to clobber a shell.
 *
 * @param {object} o
 * @param {Array}  o.tabs        parsed #Tabs items (from parseMenuItems)
 * @param {Array}  o.bar         parsed #Bar items
 * @param {Array}  [o.chrome]    parsed #Chrome items; omit to keep the block verbatim
 * @param {string} o.currentHtml the existing html-first.html text
 * @param {(msg:string)=>void} [o.warn]
 */
export function generateShell({ tabs, bar, chrome, currentHtml, warn = () => {}, docUrl = null }) {
  const openMatch = currentHtml.match(/<sol-tabs\b[^>]*>/);
  const chromeMatch = currentHtml.match(/([ \t]*<!-- chrome:begin[\s\S]*?<!-- chrome:end -->\n)/);
  if (!openMatch || !chromeMatch) return { html: '', chrome: null };

  // Chrome: emit from #Chrome RDF when modeled (config-editable; comments via
  // rdfs:comment), else preserve the current block verbatim — a safe fallback so
  // the shell never loses its furniture if #Chrome isn't present.
  let chromeBlock;
  if (chrome && chrome.length) {
    const items = chrome.map((c) => emitBarItem(c, warn, docUrl)).filter(Boolean).join('\n');
    chromeBlock = `  <!-- chrome:begin -->\n${items}\n  <!-- chrome:end -->\n`;
  } else {
    chromeBlock = chromeMatch[1];
  }

  const blocks = [
    ...(tabs || []).map((t) => emitTab(t, warn, docUrl)),
    ...(bar || []).map((b) => emitBarItem(b, warn, docUrl)),
  ].filter(Boolean);

  let html = `${openMatch[0]}\n\n`;
  html += blocks.join('\n');
  html += '\n' + chromeBlock;
  html += `\n</sol-tabs>\n`;
  return { html, chrome: chromeBlock };
}
