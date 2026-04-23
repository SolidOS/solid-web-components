/**
 * Style helpers for Constructable Stylesheets + adoptedStyleSheets.
 *
 * `sheetFrom(css)` returns a `CSSStyleSheet` on evergreen browsers, or
 * `null` when the constructor is unavailable (e.g. Jest/node env). Callers
 * should keep the raw `CSS` string export alongside the sheet so they can
 * fall back to a `<style>` tag when `sheet` is null.
 *
 * `adopt(root, { sheet, css, extra })` wires a shadow root (or document)
 * with the baseline module sheet (+ any extras). If no sheet is available
 * it appends `<style>${css}</style>` into the root instead.
 */

let _supports = null;
function supports() {
  if (_supports !== null) return _supports;
  try {
    const s = new CSSStyleSheet();
    _supports = typeof s.replaceSync === 'function';
  } catch {
    _supports = false;
  }
  return _supports;
}

export function sheetFrom(css) {
  if (!supports()) return null;
  const s = new CSSStyleSheet();
  s.replaceSync(css);
  return s;
}

// Adopt a CSSStyleSheet into `root` (ShadowRoot or Document). When sheets
// aren't supported, falls back to inserting a <style> with the given css.
export function adopt(root, { sheet, css, extra = [] } = {}) {
  const host = root.adoptedStyleSheets !== undefined ? root : null;
  if (host && sheet) {
    const sheets = [sheet];
    const strings = [];
    for (const e of extra) {
      if (e instanceof CSSStyleSheet) sheets.push(e);
      else if (typeof e === 'string') strings.push(e);
    }
    host.adoptedStyleSheets = [...host.adoptedStyleSheets, ...sheets];
    for (const s of strings) appendStyle(root, s);
    return;
  }
  // Fallback path: inline <style> for baseline + extras.
  if (css) appendStyle(root, css);
  for (const e of extra) {
    if (typeof e === 'string') appendStyle(root, e);
  }
}

function appendStyle(root, css) {
  const el = document.createElement('style');
  el.textContent = css;
  root.appendChild(el);
}

// Ensure a named stylesheet exists in the given document/shadow-root head
// exactly once. Useful for light-DOM components.
export function ensureDocStyle(root, id, css) {
  const target = root.nodeType === 11 ? root : (root.ownerDocument || document);
  if (!target) return;
  if (target.getElementById?.(id)) return;
  const el = document.createElement('style');
  el.id = id;
  el.textContent = css;
  (target.head || target).appendChild(el);
}
