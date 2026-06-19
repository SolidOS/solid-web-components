/**
 * @jest-environment jsdom
 *
 * Tests for <sol-time>:
 *   - registration + observedAttributes / static shape
 *   - rendered structure (local · gmt, with parts) for a FIXED instant
 *   - the optional third timezone (time-label + time-offset) and its
 *     deterministic offset-from-UTC math
 *   - the once-a-minute interval: set on connect, cleared on disconnect
 *   - attributeChangedCallback + reload() re-render
 *   - source as a clean no-op when absent
 *
 * Time is made deterministic by stubbing the global `Date` to a fixed
 * UTC instant for the render-output assertions — the component reads
 * `new Date()` internally, so the stub is the only seam. UTC-derived
 * output (gmt + the offset timezone) is asserted exactly; the local
 * field is asserted only structurally (HH:MM) since it depends on the
 * host machine's zone.
 */

import { SolTime } from '../../web/sol-time.js';

window.__SolSuppressDefineWarn = true;

/** Let connectedCallback's async tail (await _applySource) settle. */
function flush() { return new Promise(r => setTimeout(r, 0)); }

/**
 * Install a Date that always reads as `utcMs` for the no-arg form while
 * leaving explicit `new Date(ms)` construction intact (the component
 * needs the latter for its offset math). Returns a restore function.
 */
function stubNow(utcMs) {
  const RealDate = Date;
  class FakeDate extends RealDate {
    constructor(...args) {
      if (args.length === 0) super(utcMs);
      else super(...args);
    }
    static now() { return utcMs; }
  }
  global.Date = FakeDate;
  return () => { global.Date = RealDate; };
}

afterEach(() => { document.body.innerHTML = ''; });

// ── registration / static surface ────────────────────────────────────────────

describe('SolTime — registration', () => {
  test('defines the <sol-time> custom element', () => {
    expect(customElements.get('sol-time')).toBe(SolTime);
  });

  test('observes time-label, time-offset and source', () => {
    expect(SolTime.observedAttributes).toEqual(['time-label', 'time-offset', 'source']);
  });

  test('static shape points at the time-settings SHACL file', () => {
    expect(SolTime.shape).toMatch(/shapes\/time-settings\.shacl$/);
  });
});

// ── rendered structure for a fixed instant ───────────────────────────────────

describe('SolTime — render output', () => {
  test('always shows a local and a gmt pair', () => {
    const restore = stubNow(Date.UTC(2025, 5, 10, 7, 5, 0)); // 07:05 UTC
    try {
      const t = document.createElement('sol-time');
      document.body.appendChild(t);
      const root = t.shadowRoot.querySelector('.sol-time');

      expect(root.querySelector('[part="local-label"]').textContent).toBe('local');
      expect(root.querySelector('[part="utc-label"]').textContent).toBe('gmt');

      // gmt is UTC, so the fixed instant pins it exactly.
      expect(root.querySelector('[part="utc-time"]').textContent).toBe('07:05');
      // local depends on the host zone — assert only the HH:MM shape.
      expect(root.querySelector('[part="local-time"]').textContent).toMatch(/^\d{2}:\d{2}$/);

      // No third timezone unless an extra label is configured.
      expect(root.querySelector('[part="extra-time"]')).toBeNull();
    } finally { restore(); }
  });

  test('zero-pads single-digit hours and minutes', () => {
    const restore = stubNow(Date.UTC(2025, 0, 1, 3, 4, 0)); // 03:04 UTC
    try {
      const t = document.createElement('sol-time');
      document.body.appendChild(t);
      expect(t.shadowRoot.querySelector('[part="utc-time"]').textContent).toBe('03:04');
    } finally { restore(); }
  });
});

// ── optional third timezone ──────────────────────────────────────────────────

describe('SolTime — extra timezone', () => {
  test('time-label + time-offset add a third pair offset from UTC', () => {
    const restore = stubNow(Date.UTC(2025, 5, 10, 7, 5, 0)); // 07:05 UTC
    try {
      const t = document.createElement('sol-time');
      t.setAttribute('time-label', 'tokyo');
      t.setAttribute('time-offset', '9');
      document.body.appendChild(t);
      const root = t.shadowRoot.querySelector('.sol-time');

      expect(root.querySelector('[part="extra-label"]').textContent).toBe('tokyo');
      // 07:05 UTC + 9h = 16:05.
      expect(root.querySelector('[part="extra-time"]').textContent).toBe('16:05');
    } finally { restore(); }
  });

  test('a fractional offset is honoured (e.g. +5.5 → +5:30)', () => {
    const restore = stubNow(Date.UTC(2025, 5, 10, 7, 5, 0)); // 07:05 UTC
    try {
      const t = document.createElement('sol-time');
      t.setAttribute('time-label', 'kolkata');
      t.setAttribute('time-offset', '5.5');
      document.body.appendChild(t);
      // 07:05 + 5:30 = 12:35.
      expect(t.shadowRoot.querySelector('[part="extra-time"]').textContent).toBe('12:35');
    } finally { restore(); }
  });

  test('a negative offset wraps the clock correctly', () => {
    const restore = stubNow(Date.UTC(2025, 5, 10, 2, 0, 0)); // 02:00 UTC
    try {
      const t = document.createElement('sol-time');
      t.setAttribute('time-label', 'nyc');
      t.setAttribute('time-offset', '-5');
      document.body.appendChild(t);
      // 02:00 - 5h = 21:00 the day before.
      expect(t.shadowRoot.querySelector('[part="extra-time"]').textContent).toBe('21:00');
    } finally { restore(); }
  });

  test('a label with no numeric offset shows no extra pair', () => {
    const restore = stubNow(Date.UTC(2025, 5, 10, 7, 5, 0));
    try {
      const t = document.createElement('sol-time');
      t.setAttribute('time-label', 'mystery');
      // no time-offset → Number('') is 0; but with no time-offset
      // attribute Number(null) is 0 too, so guard is on a finite value
      // AND a present label. Set an explicitly non-numeric offset:
      t.setAttribute('time-offset', 'not-a-number');
      document.body.appendChild(t);
      expect(t.shadowRoot.querySelector('[part="extra-time"]')).toBeNull();
    } finally { restore(); }
  });
});

// ── attribute changes + reload re-render ─────────────────────────────────────

describe('SolTime — re-render hooks', () => {
  test('changing time-offset while connected updates the extra pair', () => {
    const restore = stubNow(Date.UTC(2025, 5, 10, 7, 5, 0)); // 07:05 UTC
    try {
      const t = document.createElement('sol-time');
      t.setAttribute('time-label', 'shift');
      t.setAttribute('time-offset', '1');
      document.body.appendChild(t);
      const root = t.shadowRoot.querySelector('.sol-time');
      expect(root.querySelector('[part="extra-time"]').textContent).toBe('08:05');

      t.setAttribute('time-offset', '3'); // attributeChangedCallback re-renders
      expect(root.querySelector('[part="extra-time"]').textContent).toBe('10:05');
    } finally { restore(); }
  });

  test('reload() with no source still re-renders without throwing', async () => {
    const restore = stubNow(Date.UTC(2025, 5, 10, 7, 5, 0));
    try {
      const t = document.createElement('sol-time');
      document.body.appendChild(t);
      await expect(t.reload()).resolves.toBeUndefined();
      expect(t.shadowRoot.querySelector('[part="utc-time"]').textContent).toBe('07:05');
    } finally { restore(); }
  });
});

// ── the once-a-minute interval ───────────────────────────────────────────────

describe('SolTime — interval lifecycle', () => {
  test('sets a tick interval after connecting, clears it on disconnect', async () => {
    const t = document.createElement('sol-time');
    // The interval is armed only AFTER the async _applySource tail, so
    // wait for the microtask/macrotask queue to drain before asserting.
    expect(t._timer).toBeNull();
    document.body.appendChild(t);
    await flush();
    expect(t._timer).not.toBeNull();

    t.remove(); // disconnectedCallback clears + nulls the timer
    expect(t._timer).toBeNull();
  });

  test('calling _render directly repaints with the current configuration', () => {
    const restore = stubNow(Date.UTC(2025, 5, 10, 7, 5, 0));
    try {
      const t = document.createElement('sol-time');
      document.body.appendChild(t);
      // A later, direct render (what the interval callback invokes) picks
      // up a freshly-added timezone without any wall-clock advancement.
      t.setAttribute('time-label', 'late');
      t.setAttribute('time-offset', '4');
      t._render();
      expect(t.shadowRoot.querySelector('[part="extra-time"]').textContent).toBe('11:05');
    } finally { restore(); }
  });
});

// ── source as a clean no-op when absent ──────────────────────────────────────

describe('SolTime — source', () => {
  test('_applySource is a no-op (no fetch) when there is no source attribute', async () => {
    let fetched = false;
    const realFetch = global.fetch;
    global.fetch = () => { fetched = true; return Promise.reject(new Error('should not fetch')); };
    try {
      const t = document.createElement('sol-time');
      document.body.appendChild(t);
      await t._applySource();
      expect(fetched).toBe(false);
    } finally { global.fetch = realFetch; }
  });
});
