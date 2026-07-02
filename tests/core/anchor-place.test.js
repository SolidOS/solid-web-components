/**
 * @jest-environment jsdom
 */

import { placeAnchored } from '../../core/anchor-place.js';

const anchorAt = (rect) => ({ getBoundingClientRect: () => rect });

beforeEach(() => { window.innerWidth = 1000; });

describe('placeAnchored', () => {
  // NB: jsdom's CSSOM drops `left/right: auto` (valid in real browsers), so the
  // tests assert the numeric side that gets set, not the 'auto' on the other side.
  test('left-aligns the panel under the anchor when it fits', () => {
    const panel = document.createElement('div');
    // offsetWidth is 0 under jsdom, so minWidth (40) drives the flip check.
    placeAnchored(anchorAt({ bottom: 50, left: 100, right: 160 }), panel, panel, 40);
    expect(panel.style.position).toBe('fixed');
    expect(panel.style.top).toBe('54px');          // rect.bottom + 4
    expect(panel.style.left).toBe('100px');        // left-aligned under the anchor
  });

  test('flips to right-aligned when a left drop would overflow', () => {
    const panel = document.createElement('div');
    // left 900 + width 300 = 1200 > innerWidth-4 (996) → flip to right
    placeAnchored(anchorAt({ bottom: 20, left: 900, right: 980 }), panel, panel, 300);
    expect(panel.style.right).toBe('20px');        // innerWidth - rect.right
  });

  test('is a no-op on a null / invalid anchor', () => {
    const panel = document.createElement('div');
    expect(() => placeAnchored(null, panel)).not.toThrow();
    expect(() => placeAnchored({}, panel)).not.toThrow();
    expect(panel.style.top).toBe('');
  });
});
