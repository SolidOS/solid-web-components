/**
 * @jest-environment jsdom
 *
 * Tests for <sol-button-bar-manager> — the flat (depth-1, no-submenu) variant
 * of <sol-menu-manager>. Most behaviour is inherited; what is SPECIFIC to the
 * bar is `static flat === true` and `static title === 'Button bar'`, which the
 * parent reads to:
 *   - render an "drop only" adder placeholder (no submenu-by-name),
 *   - ignore Enter on the adder (no submenu maker),
 *   - keep replace-on-drop (a 2nd plugin replaces, never makes a submenu),
 *   - title the header "Button bar: <label>".
 *
 * We drive it with a 404 source so _load() lands on the empty-tree path
 * deterministically (no live RDF), then exercise the rendered editor.
 */

import { SolButtonBarManager } from '../../web/sol-button-bar-manager.js';
import { SolMenuManager, PLUGIN_MIME } from '../../web/sol-menu-manager.js';

window.__SolSuppressDefineWarn = true;

// A fetch that 404s every request → loadRdfStore throws → the manager starts
// with an empty tree (its documented "new document" path). Deterministic and
// network-free.
function mock404() {
  global.fetch = () => Promise.resolve({
    ok: false, status: 404,
    headers: new Map(),
    text: () => Promise.resolve(''),
  });
}

function flush() { return new Promise(r => setTimeout(r, 0)); }
async function settle() { await new Promise(r => setTimeout(r, 20)); }

beforeEach(() => { mock404(); });
afterEach(() => { document.body.innerHTML = ''; });

// Mount with a source so the editor renders rows/adders (empty tree).
async function mountBar(attrs = '') {
  document.body.innerHTML =
    `<sol-button-bar-manager id="bar" source="bar.ttl#Bar" ${attrs}></sol-button-bar-manager>`;
  const el = document.getElementById('bar');
  await settle();
  return el;
}

const root = (el) => el.shadowRoot.querySelector('.builder');
const addInput = (el) => el.shadowRoot.querySelector('.add-input');

// ── static shape ─────────────────────────────────────────────────────────────

describe('SolButtonBarManager — static shape', () => {
  test('flat is true (the menu manager defaults it to false)', () => {
    expect(SolButtonBarManager.flat).toBe(true);
    expect(SolMenuManager.flat).toBe(false);
  });

  test('title is "Button bar"', () => {
    expect(SolButtonBarManager.title).toBe('Button bar');
    expect(SolMenuManager.title).toBe('Menu');
  });

  test('is a subclass of SolMenuManager (inherits the editing model)', () => {
    expect(SolButtonBarManager.prototype instanceof SolMenuManager).toBe(true);
    const el = document.createElement('sol-button-bar-manager');
    expect(el instanceof SolMenuManager).toBe(true);
  });
});

// ── registration ─────────────────────────────────────────────────────────────

describe('SolButtonBarManager — registration', () => {
  test('the custom element is registered under its tag', () => {
    expect(customElements.get('sol-button-bar-manager')).toBe(SolButtonBarManager);
  });

  test('createElement yields an upgraded instance with a shadow root', () => {
    const el = document.createElement('sol-button-bar-manager');
    expect(el).toBeInstanceOf(SolButtonBarManager);
    expect(el.shadowRoot).toBeTruthy();
  });
});

// ── source / IRI plumbing (inherited, exercised on the subclass) ─────────────

describe('SolButtonBarManager — source plumbing', () => {
  test('source getter reflects the attribute', () => {
    const el = document.createElement('sol-button-bar-manager');
    el.setAttribute('source', 'bar.ttl#Bar');
    expect(el.source).toBe('bar.ttl#Bar');
  });

  test('_docUrl / _menuIri resolve against the document base', () => {
    const el = document.createElement('sol-button-bar-manager');
    el.setAttribute('source', 'bar.ttl#Bar');
    const base = new URL('bar.ttl', document.baseURI).href;
    expect(el._docUrl()).toBe(base);
    expect(el._menuIri()).toBe(`${base}#Bar`);
  });

  test('_menuIri is null when the source carries no fragment', () => {
    const el = document.createElement('sol-button-bar-manager');
    el.setAttribute('source', 'bar.ttl');
    expect(el._menuIri()).toBe(null);
  });
});

// ── empty-source guidance ────────────────────────────────────────────────────

describe('SolButtonBarManager — no source', () => {
  test('renders the "set source" hint instead of an editor', async () => {
    document.body.innerHTML = '<sol-button-bar-manager id="b"></sol-button-bar-manager>';
    const el = document.getElementById('b');
    await settle();
    const hint = root(el).querySelector('.hint');
    expect(hint).not.toBeNull();
    expect(hint.textContent).toMatch(/Set source=/);
  });
});

// ── flat rendering ───────────────────────────────────────────────────────────

describe('SolButtonBarManager — flat rendering', () => {
  test('header title uses the "Button bar:" prefix', async () => {
    const el = await mountBar();
    const title = root(el).querySelector('.builder-title');
    expect(title.textContent.startsWith('Button bar:')).toBe(true);
  });

  test('heading attribute overrides the built-in title', async () => {
    const el = await mountBar('heading="Tabset actions"');
    const title = root(el).querySelector('.builder-title');
    expect(title.textContent).toBe('Tabset actions');
  });

  test('adder placeholder is the flat "Drop a plugin here" wording', async () => {
    const el = await mountBar();
    const input = addInput(el);
    expect(input.placeholder).toBe('Drop a plugin here');
    // the non-flat menu manager would mention "type the name of a submenu"
    expect(input.placeholder).not.toMatch(/submenu/);
  });

  test('an empty bar renders the adder but no rows', async () => {
    const el = await mountBar();
    expect(root(el).querySelectorAll('li.item')).toHaveLength(0);
    expect(addInput(el)).not.toBeNull();
  });
});

// ── flat adder: Enter does NOT make a submenu ────────────────────────────────

describe('SolButtonBarManager — adder is drop-only (flat)', () => {
  test('pressing Enter in the adder does not create a submenu item', async () => {
    const el = await mountBar();
    const input = addInput(el);
    input.value = 'Tools';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await flush();
    // No item appears, and the typed text is left in place (no submenu maker).
    expect(root(el).querySelectorAll('li.item')).toHaveLength(0);
    expect(el._items).toHaveLength(0);
    expect(input.value).toBe('Tools');
  });
});

// ── inherited pure helper: _itemFromPlugin ───────────────────────────────────

describe('SolButtonBarManager — _itemFromPlugin (inherited helper)', () => {
  test('builds a component item from a tag plugin', () => {
    const el = document.createElement('sol-button-bar-manager');
    const it = el._itemFromPlugin({
      label: 'Search', tag: 'sol-search', params: [['scope', 'pod']], icon: '🔍',
    });
    expect(it).toMatchObject({
      type: 'component', id: null, name: 'Search', tag: 'sol-search',
      icon: '🔍', params: [['scope', 'pod']],
    });
    // params are copied, not shared by reference
    expect(it.params).not.toBe(undefined);
  });

  test('builds a link item from an href plugin', () => {
    const el = document.createElement('sol-button-bar-manager');
    const it = el._itemFromPlugin({
      label: 'Docs', href: 'https://example.org/docs', region: 'main',
    });
    expect(it).toMatchObject({
      type: 'link', id: null, name: 'Docs',
      href: 'https://example.org/docs', region: 'main',
    });
  });

  test('falls back to tag/href for the name when no label', () => {
    const el = document.createElement('sol-button-bar-manager');
    expect(el._itemFromPlugin({ tag: 'sol-clock' }).name).toBe('sol-clock');
    expect(el._itemFromPlugin({ href: 'u' }).name).toBe('u');
  });
});

// ── inherited normalize: bar never collapses real submenus differently ───────

describe('SolButtonBarManager — _normalize (inherited)', () => {
  test('a submenu of one assigned plugin collapses to a direct item', () => {
    const el = document.createElement('sol-button-bar-manager');
    const items = [{
      type: 'submenu', name: 'X', children: [
        { type: 'component', name: 'Clock', tag: 'sol-clock', params: [] },
      ],
    }];
    el._normalize(items);
    expect(items[0].type).toBe('component');
    expect(items[0].tag).toBe('sol-clock');
    expect(items[0].children).toBeUndefined();
  });
});

// ── flat drop: replace-on-drop (no submenu creation) ─────────────────────────

describe('SolButtonBarManager — drop on an assigned row replaces (flat)', () => {
  // Build a DataTransfer-like object carrying a plugin payload.
  function pluginDrop(plugin) {
    const data = { [PLUGIN_MIME]: JSON.stringify(plugin), 'text/plain': '' };
    return {
      types: [PLUGIN_MIME],
      getData: (k) => data[k] || '',
      setData() {}, effectAllowed: '', dropEffect: '',
    };
  }
  function fireDropOnRow(row, plugin) {
    // jsdom returns an all-zero getBoundingClientRect, which makes _overCentre()
    // divide by a zero height (→ NaN → "between rows"). Give the row a real box
    // and aim clientY at its centre so the drop lands ON the row.
    row.getBoundingClientRect = () => ({ top: 0, height: 20, left: 0, width: 100 });
    const e = new Event('drop', { bubbles: true, cancelable: true });
    Object.defineProperty(e, 'dataTransfer', { value: pluginDrop(plugin) });
    Object.defineProperty(e, 'clientY', { value: 10 });   // centre of 0..20
    row.dispatchEvent(e);
  }

  test('dropping a 2nd plugin on an assigned bar button REPLACES it (stays flat)', async () => {
    const el = await mountBar();
    // Seed one assigned component item directly into the model and re-render.
    el._items = [{ type: 'component', name: 'Clock', tag: 'sol-clock', params: [] }];
    el._render();
    const row = root(el).querySelector('li.item .row');
    expect(row).not.toBeNull();

    fireDropOnRow(row, { label: 'Search', tag: 'sol-search', params: [] });
    await flush();

    // Flat: the single item is replaced, NOT turned into a submenu.
    expect(el._items).toHaveLength(1);
    expect(el._items[0].type).toBe('component');
    expect(el._items[0].tag).toBe('sol-search');
    expect(el._items[0].type).not.toBe('submenu');
  });
});
