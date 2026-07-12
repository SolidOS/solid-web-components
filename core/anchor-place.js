// Position a fixed panel just under an anchor (a trigger/launcher), left-aligned to
// it, flipping to right-aligned only if a left drop would overflow the viewport — so
// a far-right trigger (e.g. the ☰ menu) still opens leftward and stays on-screen.
// Fixed positioning lets the panel escape any ancestor that clips overflow.
//
// Shared by the two anchored-dropdown surfaces: sol-dropdown (the conjured region
// surface) and sol-dropdown-button (the menu launcher's popup).
//
//   anchor   — the element to sit under (its getBoundingClientRect drives placement)
//   panel    — the element whose top/left/right are set
//   widthEl  — element measured for the overflow flip (defaults to panel)
//   minWidth — width assumed when widthEl isn't laid out yet (0 = left-align until
//              measured; a menu passes ~200 so it flips sensibly before first paint)
export function placeAnchored(anchor, panel, widthEl = panel, minWidth = 0) {
  if (!anchor || typeof anchor.getBoundingClientRect !== 'function' || !panel) return;
  const r = anchor.getBoundingClientRect();
  const w = (widthEl && widthEl.offsetWidth) || minWidth;
  panel.style.position = 'fixed';
  // Drop below the anchor; if that would overflow the bottom AND there is
  // more room above (a trigger in a fixed bottom dock — the phone chrome),
  // open upward instead. Height reads 0 before first layout; callers re-run
  // placement on rAF/ResizeObserver, so the flip self-corrects once measured.
  const h = (widthEl && widthEl.offsetHeight) || 0;
  const roomBelow = window.innerHeight - r.bottom - 8;
  const roomAbove = r.top - 8;
  if (h && h > roomBelow && roomAbove > roomBelow) {
    panel.style.top = `${Math.max(4, Math.round(r.top - 4 - h))}px`;
  } else {
    panel.style.top = `${Math.round(r.bottom + 4)}px`;
  }
  let left = Math.round(r.left);
  if (left + w > window.innerWidth - 4) left = Math.round(r.right) - w;   // flip: right-align to the anchor
  // Clamp BOTH viewport edges regardless of branch: the right edge (a panel
  // that grew after its first placement — the ☰ menu's popup — or one
  // right-aligned to a far-right trigger must never overhang the viewport),
  // then the left (a panel wider than the room left of the anchor — the
  // calendar over a phone's bottom dock — must never hang off-screen at x<0).
  left = Math.min(left, window.innerWidth - 4 - w);
  left = Math.max(4, left);
  panel.style.left = `${left}px`;
  panel.style.right = 'auto';
}
