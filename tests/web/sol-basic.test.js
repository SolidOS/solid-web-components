/**
 * @jest-environment jsdom
 *
 * Tests for web/sol-basic.js — the no-RDF, html-first BUNDLE ENTRY.
 *
 * sol-basic.js owns no behaviour of its own: it is an aggregator whose job is
 * to (a) register the everyday UI primitives + their conjured helpers as a
 * side-effect of being imported, and (b) re-export a handful of class symbols
 * for hosts that want the constructors, not just the tags. So these tests
 * cover exactly that contract:
 *   - every primitive + conjured-helper tag is registered after import
 *   - each registration is a real HTMLElement subclass
 *   - the re-exported class symbols ARE the registered constructors
 *   - the RDF-tier tags the docblock excludes are NOT pulled in by this entry
 *   - the import is side-effect-idempotent (define() doesn't throw on re-eval)
 *
 * Not tested here: the per-component behaviour of sol-button / sol-modal /
 * sol-tabs etc. — each has its own dedicated test file; duplicating it here
 * would be testing the wrong unit.
 */

window.__SolSuppressDefineWarn = true;

// The tags this entry is contracted to register.
const PRIMITIVE_TAGS = [
  'sol-button',
  'sol-dropdown-button',
  'sol-include',
  'sol-menu',
  'sol-tabs',
  'sol-accordion',
  'sol-rolodex',
];
const CONJURED_TAGS = ['sol-default', 'sol-modal', 'sol-window'];
const ALL_TAGS = [...PRIMITIVE_TAGS, ...CONJURED_TAGS];

// The RDF / Solid-stack tags the docblock says are deliberately NOT here.
const EXCLUDED_TAGS = ['sol-login', 'sol-form', 'sol-settings', 'sol-query', 'sol-solidos'];

let mod;
beforeAll(async () => {
  mod = await import('../../web/sol-basic.js');
});

// ── custom-element registration (the side-effect) ────────────────────────────

describe('sol-basic — registers the html-first tier', () => {
  test.each(ALL_TAGS)('registers <%s>', (tag) => {
    expect(customElements.get(tag)).toBeDefined();
  });

  test('every registered tag is a real HTMLElement subclass', () => {
    for (const tag of ALL_TAGS) {
      const ctor = customElements.get(tag);
      expect(typeof ctor).toBe('function');
      expect(Object.prototype.isPrototypeOf.call(HTMLElement, ctor)).toBe(true);
    }
  });

  test('does not pull in the RDF-tier tags it deliberately excludes', () => {
    for (const tag of EXCLUDED_TAGS) {
      expect(customElements.get(tag)).toBeUndefined();
    }
  });
});

// ── re-exported class symbols ────────────────────────────────────────────────

describe('sol-basic — re-exported class symbols', () => {
  test('exports the five documented constructors', () => {
    expect(typeof mod.SolButton).toBe('function');
    expect(typeof mod.SolDropdownButton).toBe('function');
    expect(typeof mod.SolInclude).toBe('function');
    expect(typeof mod.SolMenu).toBe('function');
    expect(typeof mod.SolTabs).toBe('function');
  });

  test('each export IS the constructor registered for its tag', () => {
    expect(mod.SolButton).toBe(customElements.get('sol-button'));
    expect(mod.SolDropdownButton).toBe(customElements.get('sol-dropdown-button'));
    expect(mod.SolInclude).toBe(customElements.get('sol-include'));
    expect(mod.SolMenu).toBe(customElements.get('sol-menu'));
    expect(mod.SolTabs).toBe(customElements.get('sol-tabs'));
  });

  test('the named exports carry their expected class names', () => {
    expect(mod.SolButton.name).toBe('SolButton');
    expect(mod.SolDropdownButton.name).toBe('SolDropdownButton');
    expect(mod.SolInclude.name).toBe('SolInclude');
    expect(mod.SolMenu.name).toBe('SolMenu');
    expect(mod.SolTabs.name).toBe('SolTabs');
  });

  test('does not leak the conjured-helper or RDF-tier classes as named exports', () => {
    // Only the five documented symbols are part of the public JS surface.
    expect(mod.SolModal).toBeUndefined();
    expect(mod.SolWindow).toBeUndefined();
    expect(mod.SolDefault).toBeUndefined();
    expect(mod.SolForm).toBeUndefined();
  });
});

// ── the registered constructors actually upgrade in the DOM ──────────────────

describe('sol-basic — registered tags upgrade to their class in the DOM', () => {
  afterEach(() => { document.body.innerHTML = ''; });

  test('createElement(<sol-button>) is an instance of the exported SolButton', () => {
    const el = document.createElement('sol-button');
    document.body.appendChild(el);
    expect(el).toBeInstanceOf(mod.SolButton);
    expect(el).toBeInstanceOf(HTMLElement);
  });

  test('createElement(<sol-tabs>) is an instance of the exported SolTabs', () => {
    const el = document.createElement('sol-tabs');
    document.body.appendChild(el);
    expect(el).toBeInstanceOf(mod.SolTabs);
  });
});

// ── idempotent side-effect ───────────────────────────────────────────────────

describe('sol-basic — re-evaluating the entry is harmless', () => {
  test('importing a second time does not throw and keeps the same constructors', async () => {
    const again = await import('../../web/sol-basic.js');
    // ESM caches modules, but the define() wrapper is also idempotent, so even
    // a fresh evaluation would be a no-op rather than a customElements throw.
    expect(again.SolButton).toBe(mod.SolButton);
    expect(customElements.get('sol-menu')).toBe(mod.SolMenu);
  });
});
