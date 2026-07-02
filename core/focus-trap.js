// Reusable dialog focus management, shared by every overlay surface (sol-modal,
// the sol-tabs bottom-sheet, the sol-query bnode modal, …) so the Tab-trap and
// focus save/restore live in one place instead of being hand-rolled per surface.
// Works across shadow boundaries (deepActiveElement) and light DOM alike.

// Tab-order focusables within a root (skips disabled / tabindex=-1).
export const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), '
  + 'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function focusablesIn(root) {
  return root ? Array.from(root.querySelectorAll(FOCUSABLE)) : [];
}

// The element that actually has focus, descending through open shadow roots — so
// focus can be saved before an overlay opens and restored to it on close, and so
// the Tab-trap can compare against the truly-focused element in either DOM.
export function deepActiveElement() {
  let el = document.activeElement;
  while (el && el.shadowRoot && el.shadowRoot.activeElement) el = el.shadowRoot.activeElement;
  return el;
}

// Handle a Tab keydown to cycle focus within `root`. `getFocusables` (optional)
// returns the current focusable set, letting a caller filter to visible ones;
// it defaults to focusablesIn(root). preventDefault()s when it wraps. Returns true
// if it acted.
export function trapTab(e, root, getFocusables) {
  if (e.key !== 'Tab' || !root) return false;
  const f = getFocusables ? getFocusables() : focusablesIn(root);
  if (!f.length) return false;
  const first = f[0], last = f[f.length - 1];
  const active = deepActiveElement();
  if (e.shiftKey && active === first) { last.focus(); e.preventDefault(); return true; }
  if (!e.shiftKey && active === last) { first.focus(); e.preventDefault(); return true; }
  if (!root.contains(active)) { first.focus(); e.preventDefault(); return true; }
  return false;
}
