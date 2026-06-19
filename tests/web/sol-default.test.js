/**
 * @jest-environment jsdom
 *
 * Tests for <sol-default> — the singleton holder for shared programmatic
 * defaults (web/sol-default.js) and its backing helpers in core/defaults.js:
 *   - registration + invisible (renders nothing) element
 *   - getDefault() reading attributes off the first <sol-default>
 *   - the `sol-default-change` event contract (name/newValue/oldValue,
 *     bubbling + composed) as built by _fire (the MutationObserver payload)
 *   - onDefaultChange() subscribe/unsubscribe wrapping that event
 *   - the `defaults` host-service (get/onChange) registered by core/defaults.js
 *   - the RDF `source` path (_applySource / reload): predicate → kebab attr,
 *     multi-value joining, explicit-HTML-override protection, fetch failure
 *
 * jsdom note: jsdom 26's MutationObserver only supports childList/
 * characterData/subtree — it throws NotSupportedError on the
 * { attributes: true } observer that connectedCallback installs. So
 * `createElement` + appendChild cannot exercise the *live* attribute-change
 * reactivity here. We therefore drive the same code paths directly:
 * `_fire` (the exact payload the observer dispatches) and `_applySource`
 * (the exact work connectedCallback does for a `source`). Construction via
 * innerHTML and `new SolDefault()` both upgrade cleanly.
 */

import { jest } from '@jest/globals';

window.__SolSuppressDefineWarn = true;

// sol-default's `source` path reads the RDF doc through loadConfig. The shared
// rdflib mock has no statementsMatching, so (matching tests/web/sol-pod.test.js)
// mock loadConfig itself — tests stage the predicate→value map directly and we
// exercise sol-default's own attribute-mapping logic (_applySource).
let mockLoadConfig = async () => ({});
jest.unstable_mockModule('../../web/utils/rdf-config.js', () => ({
  loadConfig: (...a) => mockLoadConfig(...a),
  default:    (...a) => mockLoadConfig(...a),
}));

const { SolDefault } = await import('../../web/sol-default.js');
const { getDefault, onDefaultChange } = await import('../../core/defaults.js');

afterEach(() => { document.body.innerHTML = ''; mockLoadConfig = async () => ({}); });

// ── registration ─────────────────────────────────────────────────────────────

describe('registration', () => {
  test('<sol-default> is defined under its tag name', () => {
    expect(customElements.get('sol-default')).toBe(SolDefault);
  });

  test('observedAttributes is intentionally empty (a MutationObserver watches all)', () => {
    expect(SolDefault.observedAttributes).toEqual([]);
  });

  test('renders nothing and hides itself', () => {
    document.body.innerHTML = '<sol-default></sol-default>';
    const el = document.querySelector('sol-default');
    expect(el).toBeInstanceOf(SolDefault);
    expect(el.style.display).toBe('none');
    expect(el.shadowRoot).toBeNull();
    expect(el.childNodes.length).toBe(0);
  });
});

// ── getDefault ───────────────────────────────────────────────────────────────

describe('getDefault', () => {
  test('returns null when no <sol-default> exists', () => {
    expect(getDefault('proxy')).toBeNull();
  });

  test('reads a named attribute off the element', () => {
    document.body.innerHTML =
      '<sol-default proxy="http://localhost:3002/proxy?uri="></sol-default>';
    expect(getDefault('proxy')).toBe('http://localhost:3002/proxy?uri=');
  });

  test('returns null for an attribute that is not set', () => {
    document.body.innerHTML = '<sol-default proxy="x"></sol-default>';
    expect(getDefault('missing')).toBeNull();
  });

  test('reads from the FIRST <sol-default> when several exist', () => {
    document.body.innerHTML =
      '<sol-default proxy="first"></sol-default>' +
      '<sol-default proxy="second"></sol-default>';
    expect(getDefault('proxy')).toBe('first');
  });
});

// ── sol-default-change event contract (via _fire) ────────────────────────────

describe('sol-default-change (the payload _fire dispatches)', () => {
  test('carries { name, newValue, oldValue } and bubbles + is composed', () => {
    document.body.innerHTML = '<sol-default></sol-default>';
    const el = document.querySelector('sol-default');

    let evt = null;
    document.addEventListener('sol-default-change', (e) => { evt = e; }, { once: true });
    el._fire('proxy', 'http://a/', null);

    expect(evt).not.toBeNull();                       // reached document → bubbles + composed
    expect(evt.bubbles).toBe(true);
    expect(evt.composed).toBe(true);
    expect(evt.detail).toEqual({ name: 'proxy', newValue: 'http://a/', oldValue: null });
  });

  test('reports an oldValue on a subsequent change', () => {
    document.body.innerHTML = '<sol-default></sol-default>';
    const el = document.querySelector('sol-default');
    const seen = [];
    el.addEventListener('sol-default-change', (e) => seen.push(e.detail));

    el._fire('theme', 'dark', null);
    el._fire('theme', 'light', 'dark');
    expect(seen).toEqual([
      { name: 'theme', newValue: 'dark', oldValue: null },
      { name: 'theme', newValue: 'light', oldValue: 'dark' },
    ]);
  });
});

// ── onDefaultChange ──────────────────────────────────────────────────────────

describe('onDefaultChange', () => {
  test('invokes the handler with (name, newValue, oldValue) and returns an unsubscribe', () => {
    document.body.innerHTML = '<sol-default></sol-default>';
    const el = document.querySelector('sol-default');
    const calls = [];
    const off = onDefaultChange((name, nv, ov) => calls.push([name, nv, ov]));

    el._fire('proxy', 'http://a/', null);
    expect(calls).toEqual([['proxy', 'http://a/', null]]);

    off();
    el._fire('proxy', 'http://b/', 'http://a/');
    expect(calls).toHaveLength(1);   // no further calls after unsubscribe
  });

  test('listens at the document, so it works regardless of where the element sits', () => {
    document.body.innerHTML = '<section><sol-default></sol-default></section>';
    const el = document.querySelector('sol-default');
    let got = null;
    const off = onDefaultChange((name, nv) => { got = [name, nv]; });
    el._fire('proxy', 'deep', null);
    expect(got).toEqual(['proxy', 'deep']);
    off();
  });
});

// ── defaults host-service ────────────────────────────────────────────────────

describe('defaults host-service', () => {
  test('core/defaults.js registers "defaults" with get/onChange', async () => {
    const { get } = await import('../../core/services.js');
    const svc = get('defaults');
    expect(typeof svc.get).toBe('function');
    expect(typeof svc.onChange).toBe('function');

    document.body.innerHTML = '<sol-default proxy="svc"></sol-default>';
    expect(svc.get('proxy')).toBe('svc');
  });
});

// ── RDF source (_applySource / reload) ───────────────────────────────────────

describe('RDF source', () => {
  const UI = 'http://www.w3.org/ns/ui#';

  // A bare instance lets us call _applySource directly — the exact work
  // connectedCallback does for a `source`, minus the jsdom-incompatible
  // attribute MutationObserver. loadConfig is mocked, so the argument is
  // immaterial; tests stage `mockLoadConfig` with the predicate→value map.
  function freshInstance() {
    document.body.innerHTML = '<sol-default></sol-default>';
    return document.querySelector('sol-default');
  }

  test('maps each predicate local-name to a kebab-case attribute', async () => {
    // ui:proxy → proxy ; ui:defaultIssuers → default-issuers.
    mockLoadConfig = async () => ({
      [`${UI}proxy`]: 'http://proxied/',
      [`${UI}defaultIssuers`]: ['https://a.example', 'https://b.example'],
    });
    const el = freshInstance();
    await el._applySource('config.ttl#Settings');

    expect(el.getAttribute('proxy')).toBe('http://proxied/');
    // array values are space-joined into a single attribute string.
    expect(el.getAttribute('default-issuers'))
      .toBe('https://a.example https://b.example');
  });

  test('skips rdf:type (the loader already drops it; a "type" local-name is ignored too)', async () => {
    mockLoadConfig = async () => ({
      [`${UI}proxy`]: 'http://proxied/',
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'http://www.w3.org/ns/ui#Thing',
    });
    const el = freshInstance();
    await el._applySource('config.ttl#Settings');
    expect(el.getAttribute('proxy')).toBe('http://proxied/');
    expect(el.hasAttribute('type')).toBe(false);
  });

  test('an explicit inline HTML attribute is never clobbered by the source', async () => {
    mockLoadConfig = async () => ({
      [`${UI}proxy`]: 'http://proxied/',
      [`${UI}defaultIssuers`]: ['https://a.example', 'https://b.example'],
    });
    document.body.innerHTML = '<sol-default proxy="http://inline/"></sol-default>';
    const el = document.querySelector('sol-default');
    // Mirror connectedCallback: snapshot the pre-source attributes as overrides.
    el._htmlOverrides = new Set(el.getAttributeNames());
    await el._applySource('config.ttl#Settings');

    expect(el.getAttribute('proxy')).toBe('http://inline/');     // inline wins
    expect(el.getAttribute('default-issuers'))                    // others still applied
      .toBe('https://a.example https://b.example');
  });

  test('reload() re-reads the source, picking up a changed value', async () => {
    mockLoadConfig = async () => ({ [`${UI}proxy`]: 'http://proxied/' });
    document.body.innerHTML = '<sol-default source="config.ttl#Settings"></sol-default>';
    const el = document.querySelector('sol-default');
    await el.reload();
    expect(el.getAttribute('proxy')).toBe('http://proxied/');

    // Re-stage the loader and reload; the attribute updates.
    mockLoadConfig = async () => ({ [`${UI}proxy`]: 'http://changed/' });
    await el.reload();
    expect(el.getAttribute('proxy')).toBe('http://changed/');
  });

  test('reload() with no source attribute is a no-op (loadConfig never called)', async () => {
    let called = 0;
    mockLoadConfig = async () => { called++; return {}; };
    const el = freshInstance();
    await el.reload();
    expect(called).toBe(0);
  });

  test('a loadConfig failure is swallowed (warns, does not throw, leaves attrs untouched)', async () => {
    mockLoadConfig = async () => { throw new Error('HTTP 404 fetching missing.ttl'); };
    const warn = console.warn;
    const warnings = [];
    console.warn = (...a) => warnings.push(a.join(' '));
    try {
      const el = freshInstance();
      await expect(el._applySource('missing.ttl#Settings')).resolves.toBeUndefined();
      expect(el.hasAttribute('proxy')).toBe(false);
      expect(warnings.some(w => w.includes('[sol-default]'))).toBe(true);
    } finally {
      console.warn = warn;
    }
  });
});
