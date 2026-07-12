/**
 * @jest-environment jsdom
 *
 * Tests for <sol-dropdown> — the conjured anchored-panel surface (sibling of
 * sol-modal / sol-window). Authors never write it directly; the region cascade
 * conjures one, sets `_anchor`, and mounts content into ::part(body). These
 * tests drive it imperatively:
 *   - registration
 *   - shadow-DOM render on connect (panel / body parts, the `body` getter)
 *   - placement under its anchor + the right-edge flip
 *   - outside-click / anchor-click / Escape dismissal (removes itself)
 *   - listener teardown on disconnect
 */

import { SolDropdown } from '../../web/sol-dropdown.js';

window.__SolSuppressDefineWarn = true;

function press(key) {
  document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

// jsdom doesn't lay out, so anchor rects are all zero by default. Stub the rect
// so _place() has something real to compute from.
function anchorAt({ left, right, bottom }) {
  const a = document.createElement('button');
  a.getBoundingClientRect = () => ({ left, right, bottom, top: 0, width: right - left, height: bottom });
  document.body.appendChild(a);
  return a;
}

// Conjure a dropdown the way the region cascade does: create, set _anchor,
// append (which fires connectedCallback → render + place + listeners).
function conjure(anchor) {
  const d = document.createElement('sol-dropdown');
  if (anchor) d._anchor = anchor;
  document.body.appendChild(d);
  return d;
}

afterEach(() => { document.body.innerHTML = ''; });

// ── registration ────────────────────────────────────────────────────────────

describe('SolDropdown — registration', () => {
  test('is registered as <sol-dropdown>', () => {
    expect(customElements.get('sol-dropdown')).toBe(SolDropdown);
  });

  test('createElement yields a shadow root', () => {
    const d = document.createElement('sol-dropdown');
    expect(d.shadowRoot).toBeTruthy();
  });
});

// ── render ──────────────────────────────────────────────────────────────────

describe('SolDropdown — render', () => {
  test('connecting renders panel + body parts into the shadow root', () => {
    const d = conjure();
    const panel = d.shadowRoot.querySelector('.panel');
    const body = d.shadowRoot.querySelector('.body');
    expect(panel).toBeTruthy();
    expect(panel.getAttribute('part')).toBe('panel');
    expect(body).toBeTruthy();
    expect(body.getAttribute('part')).toBe('body');
    // body is nested inside the panel
    expect(panel.contains(body)).toBe(true);
  });

  test('the body getter returns the mount-target .body element', () => {
    const d = conjure();
    expect(d.body).toBe(d.shadowRoot.querySelector('.body'));
  });

  test('content mounted into body survives (conjure contract)', () => {
    const d = conjure();
    const widget = document.createElement('div');
    widget.textContent = 'hosted';
    d.body.appendChild(widget);
    expect(d.body.textContent).toBe('hosted');
  });

  test('re-rendering is guarded — a second connect does not duplicate the panel', () => {
    const d = conjure();
    document.body.removeChild(d);   // disconnect
    document.body.appendChild(d);   // reconnect → _rendered guard
    expect(d.shadowRoot.querySelectorAll('.panel')).toHaveLength(1);
  });
});

// ── placement ─────────────────────────────────────────────────────────────────

describe('SolDropdown — placement', () => {
  test('positions itself just under the anchor, left-aligned by default', () => {
    const a = anchorAt({ left: 30, right: 80, bottom: 50 });
    const d = conjure(a);
    expect(d.style.top).toBe('54px');     // bottom + 4
    expect(d.style.left).toBe('30px');
    // The opposite side is set to 'auto', which jsdom's CSSOM normalises away.
    expect(d.style.right).toBe('');
  });

  test('flips to right-aligned when a left drop would overflow the viewport', () => {
    window.innerWidth = 1000;
    // Anchor hard against the right edge + a wide panel ⇒ left drop overflows.
    const a = anchorAt({ left: 990, right: 998, bottom: 20 });
    const d = conjure(a);
    Object.defineProperty(d.shadowRoot.querySelector('.panel'), 'offsetWidth', {
      configurable: true, value: 300,
    });
    d._place();                            // re-place now that the panel has width
    // Right-aligned to the anchor AND clamped to the right viewport edge
    // (innerWidth − 4 − width), so the panel can never overhang the screen.
    expect(d.style.left).toBe(`${1000 - 4 - 300}px`);
  });

  test('the panel never extends past the RIGHT viewport edge', () => {
    window.innerWidth = 1000;
    // A far-right anchor whose panel is wider than the gap to the edge —
    // pure anchor-alignment would overhang (the ☰-menu bug: the popup grew
    // after its first placement and hung off screen).
    const a = anchorAt({ left: 940, right: 970, bottom: 20 });
    const d = conjure(a);
    Object.defineProperty(d.shadowRoot.querySelector('.panel'), 'offsetWidth', {
      configurable: true, value: 200,
    });
    d._place();
    const left = parseInt(d.style.left, 10);
    expect(left + 200).toBeLessThanOrEqual(1000 - 4);
  });

  test('a right-aligned panel wider than the room clamps to the left edge, not x<0', () => {
    window.innerWidth = 360;
    // Phone-dock case: anchor near the left, panel wider than the space
    // left of its right edge — the old right-pin put the panel at x<0.
    const a = anchorAt({ left: 10, right: 160, bottom: 700 });
    const d = conjure(a);
    Object.defineProperty(d.shadowRoot.querySelector('.panel'), 'offsetWidth', {
      configurable: true, value: 356,
    });
    d._place();
    expect(d.style.left).toBe('4px');      // clamped fully on-screen
  });

  test('_place is a no-op without a usable anchor', () => {
    const d = conjure();                   // no _anchor
    expect(() => d._place()).not.toThrow();
    expect(d.style.top).toBe('');
  });
});

// ── dismissal ─────────────────────────────────────────────────────────────────

describe('SolDropdown — dismissal', () => {
  test('Escape closes it (removes itself from the document)', () => {
    const d = conjure(anchorAt({ left: 0, right: 10, bottom: 10 }));
    expect(d.parentNode).toBe(document.body);
    press('Escape');
    expect(d.parentNode).toBe(null);
  });

  test('a non-Escape key does not close it', () => {
    const d = conjure(anchorAt({ left: 0, right: 10, bottom: 10 }));
    press('Enter');
    expect(d.parentNode).toBe(document.body);
  });

  test('an outside click closes it', () => {
    const d = conjure(anchorAt({ left: 0, right: 10, bottom: 10 }));
    const outside = document.createElement('div');
    document.body.appendChild(outside);
    outside.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(d.parentNode).toBe(null);
  });

  test('a click inside the dropdown does NOT close it', () => {
    const d = conjure(anchorAt({ left: 0, right: 10, bottom: 10 }));
    const inner = document.createElement('span');
    d.appendChild(inner);
    inner.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(d.parentNode).toBe(document.body);
  });

  test('a click on the anchor does NOT close it (the opening click is excluded)', () => {
    const a = anchorAt({ left: 0, right: 10, bottom: 10 });
    const d = conjure(a);
    a.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(d.parentNode).toBe(document.body);
  });

  test('_close() removes the element', () => {
    const d = conjure(anchorAt({ left: 0, right: 10, bottom: 10 }));
    d._close();
    expect(d.parentNode).toBe(null);
  });
});

// ── teardown ──────────────────────────────────────────────────────────────────

describe('SolDropdown — teardown', () => {
  test('after dismissal, document listeners are gone (no more closes fire)', () => {
    const d = conjure(anchorAt({ left: 0, right: 10, bottom: 10 }));
    d._close();
    // A fresh, still-attached dropdown should be unaffected by stale listeners
    // from the removed one. Pressing Escape now must only affect the live one.
    const d2 = conjure(anchorAt({ left: 0, right: 10, bottom: 10 }));
    press('Escape');
    expect(d2.parentNode).toBe(null);
    // The already-removed d stays removed; no error from its torn-down handlers.
    expect(d.parentNode).toBe(null);
  });
});
