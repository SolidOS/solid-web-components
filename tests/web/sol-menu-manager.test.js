/**
 * @jest-environment jsdom
 *
 * Tests for <sol-menu-manager> — the BASE menu editor. Its flat (depth-1,
 * no-submenu) subclass <sol-button-bar-manager> already has its own suite, so
 * here we cover what is SPECIFIC to the base class — the non-flat / submenu
 * paths the bar variant deliberately omits:
 *   - `static flat === false` / `static title === 'Menu'`,
 *   - the adder makes a submenu by name (Enter) and reads the non-flat
 *     "type the name of a submenu" placeholder,
 *   - dropping a SECOND plugin on an assigned row turns it into a SUBMENU of
 *     both (the bar keeps replace-on-drop),
 *   - dropping on a submenu row ADDS to it,
 *   - submenu children render as draggable chips, and dropping a chip on
 *     another reorders within the submenu,
 *   - the inherited pure helpers (_itemFromPlugin, _normalize, _docUrl/_menuIri).
 *
 * Deterministic seams only: fetch is 404'd so _load() lands on the documented
 * empty-tree path (no live RDF), then populated trees are seeded straight into
 * el._items and re-rendered — sidestepping the mock parser's lack of Turtle
 * list/bracket sugar. getBoundingClientRect is stubbed because jsdom returns an
 * all-zero box (→ divide-by-zero in the drop-position math).
 */

import { SolMenuManager, PLUGIN_MIME } from '../../web/sol-menu-manager.js';
import { SolButtonBarManager } from '../../web/sol-button-bar-manager.js';

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
async function mountMenu(attrs = '') {
  document.body.innerHTML =
    `<sol-menu-manager id="m" source="menu.ttl#Menu" ${attrs}></sol-menu-manager>`;
  const el = document.getElementById('m');
  await settle();
  return el;
}

const root = (el) => el.shadowRoot.querySelector('.builder');
const addInput = (el) => el.shadowRoot.querySelector('.add-input');
const rows = (el) => root(el).querySelectorAll('li.item');

// ── static shape ─────────────────────────────────────────────────────────────

describe('SolMenuManager — static shape', () => {
  test('flat is false (non-flat: submenus allowed)', () => {
    expect(SolMenuManager.flat).toBe(false);
  });

  test('title is "Menu"', () => {
    expect(SolMenuManager.title).toBe('Menu');
  });

  test('the bar variant is a subclass that flips flat → true', () => {
    expect(SolButtonBarManager.prototype instanceof SolMenuManager).toBe(true);
    expect(SolButtonBarManager.flat).toBe(true);
  });
});

// ── registration ─────────────────────────────────────────────────────────────

describe('SolMenuManager — registration', () => {
  test('the custom element is registered under its tag', () => {
    expect(customElements.get('sol-menu-manager')).toBe(SolMenuManager);
  });

  test('createElement yields an upgraded instance with a shadow root', () => {
    const el = document.createElement('sol-menu-manager');
    expect(el).toBeInstanceOf(SolMenuManager);
    expect(el.shadowRoot).toBeTruthy();
  });
});

// ── source / IRI plumbing ─────────────────────────────────────────────────────

describe('SolMenuManager — source plumbing', () => {
  test('source getter reflects the attribute (empty string when absent)', () => {
    const el = document.createElement('sol-menu-manager');
    expect(el.source).toBe('');
    el.setAttribute('source', 'menu.ttl#Menu');
    expect(el.source).toBe('menu.ttl#Menu');
  });

  test('_docUrl / _menuIri resolve against the document base', () => {
    const el = document.createElement('sol-menu-manager');
    el.setAttribute('source', 'menu.ttl#Menu');
    const base = new URL('menu.ttl', document.baseURI).href;
    expect(el._docUrl()).toBe(base);
    expect(el._menuIri()).toBe(`${base}#Menu`);
  });

  test('_menuIri is null when the source carries no fragment', () => {
    const el = document.createElement('sol-menu-manager');
    el.setAttribute('source', 'menu.ttl');
    expect(el._menuIri()).toBe(null);
  });
});

// ── empty-source guidance ────────────────────────────────────────────────────

describe('SolMenuManager — no source', () => {
  test('renders the "set source" hint instead of an editor', async () => {
    document.body.innerHTML = '<sol-menu-manager id="m"></sol-menu-manager>';
    const el = document.getElementById('m');
    await settle();
    const hint = root(el).querySelector('.hint');
    expect(hint).not.toBeNull();
    expect(hint.textContent).toMatch(/Set source=/);
    // No editor chrome when there is nothing to edit.
    expect(addInput(el)).toBeNull();
  });
});

// ── non-flat rendering ───────────────────────────────────────────────────────

describe('SolMenuManager — rendering', () => {
  test('header title uses the "Menu:" prefix', async () => {
    const el = await mountMenu();
    const title = root(el).querySelector('.builder-title');
    expect(title.textContent.startsWith('Menu:')).toBe(true);
  });

  test('heading attribute overrides the built-in title', async () => {
    const el = await mountMenu('heading="Edit navigation"');
    const title = root(el).querySelector('.builder-title');
    expect(title.textContent).toBe('Edit navigation');
  });

  test('adder placeholder mentions the submenu-by-name affordance', async () => {
    const el = await mountMenu();
    const input = addInput(el);
    expect(input.placeholder).toMatch(/submenu/);
    // The flat bar's placeholder is the bare "Drop a plugin here".
    expect(input.placeholder).not.toBe('Drop a plugin here');
  });

  test('an empty menu renders the adder but no rows', async () => {
    const el = await mountMenu();
    expect(rows(el)).toHaveLength(0);
    expect(addInput(el)).not.toBeNull();
  });
});

// ── accordion header ─────────────────────────────────────────────────────────

describe('SolMenuManager — accordion header', () => {
  test('an accordion header is a toggle button reflecting open state', async () => {
    const el = await mountMenu('accordion="grp" open');
    const head = root(el).querySelector('.builder-head');
    expect(head.getAttribute('role')).toBe('button');
    expect(head.getAttribute('aria-expanded')).toBe('true');
    expect(head.querySelector('.builder-disclosure')).not.toBeNull();
  });

  test('a peer opening the group closes this manager (aria-expanded → false)', async () => {
    const el = await mountMenu('accordion="grp" open');
    const head = root(el).querySelector('.builder-head');
    expect(head.getAttribute('aria-expanded')).toBe('true');

    // Simulate another member of the same group announcing it opened.
    document.dispatchEvent(new CustomEvent('sol-accordion-open', {
      bubbles: true, detail: { group: 'grp' },
    }));
    expect(el.hasAttribute('open')).toBe(false);
    expect(head.getAttribute('aria-expanded')).toBe('false');
  });
});

// ── adder: Enter creates a submenu (non-flat) ────────────────────────────────

describe('SolMenuManager — adder makes a submenu by name', () => {
  test('pressing Enter in the adder appends an empty submenu item', async () => {
    const el = await mountMenu();
    const input = addInput(el);
    input.value = 'Tools';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await flush();

    expect(el._items).toHaveLength(1);
    expect(el._items[0]).toMatchObject({ type: 'submenu', name: 'Tools' });
    expect(el._items[0].children).toEqual([]);
    // The input is cleared after creating the submenu.
    expect(input.value).toBe('');
    // A row appears for the new submenu, carrying its drop hint.
    expect(rows(el)).toHaveLength(1);
    const hint = rows(el)[0].querySelector('.chip.empty');
    expect(hint).not.toBeNull();
    expect(hint.textContent).toBe('drag plugins here');
  });

  test('Enter with a blank name does nothing', async () => {
    const el = await mountMenu();
    const input = addInput(el);
    input.value = '   ';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await flush();
    expect(el._items).toHaveLength(0);
  });
});

// ── pure helper: _itemFromPlugin ──────────────────────────────────────────────

describe('SolMenuManager — _itemFromPlugin', () => {
  test('builds a component item from a tag plugin (params copied)', () => {
    const el = document.createElement('sol-menu-manager');
    const params = [['scope', 'pod']];
    const it = el._itemFromPlugin({ label: 'Search', tag: 'sol-search', params, icon: '🔍' });
    expect(it).toMatchObject({
      type: 'component', id: null, name: 'Search', tag: 'sol-search',
      icon: '🔍', params: [['scope', 'pod']],
    });
    // pairs are copied, not aliased to the plugin's own array
    expect(it.params).not.toBe(params);
    expect(it.params[0]).not.toBe(params[0]);
  });

  test('builds a link item from an href plugin', () => {
    const el = document.createElement('sol-menu-manager');
    const it = el._itemFromPlugin({ label: 'Docs', href: 'https://example.org/docs', region: 'main' });
    expect(it).toMatchObject({
      type: 'link', id: null, name: 'Docs',
      href: 'https://example.org/docs', region: 'main',
    });
  });

  test('carries the chip identity (manifest) through', () => {
    const el = document.createElement('sol-menu-manager');
    const it = el._itemFromPlugin({ tag: 'sol-music', manifest: 'plugins/music.ttl' });
    expect(it.manifest).toBe('plugins/music.ttl');
  });

  test('falls back to tag/href for the name when no label', () => {
    const el = document.createElement('sol-menu-manager');
    expect(el._itemFromPlugin({ tag: 'sol-clock' }).name).toBe('sol-clock');
    expect(el._itemFromPlugin({ href: 'u' }).name).toBe('u');
  });
});

// ── pure helper: _normalize (sole-plugin collapse) ───────────────────────────

describe('SolMenuManager — _normalize', () => {
  test('a submenu of one assigned plugin collapses to a direct item', () => {
    const el = document.createElement('sol-menu-manager');
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

  test('a submenu of TWO assigned plugins is left as a submenu', () => {
    const el = document.createElement('sol-menu-manager');
    const items = [{
      type: 'submenu', name: 'X', children: [
        { type: 'component', name: 'A', tag: 'sol-a', params: [] },
        { type: 'component', name: 'B', tag: 'sol-b', params: [] },
      ],
    }];
    el._normalize(items);
    expect(items[0].type).toBe('submenu');
    expect(items[0].children).toHaveLength(2);
  });

  test('an empty submenu (someone building structure) is left alone', () => {
    const el = document.createElement('sol-menu-manager');
    const items = [{ type: 'submenu', name: 'Empty', children: [] }];
    el._normalize(items);
    expect(items[0].type).toBe('submenu');
    expect(items[0].children).toEqual([]);
  });

  test('a submenu whose sole child is itself a submenu does NOT collapse', () => {
    const el = document.createElement('sol-menu-manager');
    const items = [{
      type: 'submenu', name: 'Outer', children: [
        { type: 'submenu', name: 'Inner', children: [] },
      ],
    }];
    el._normalize(items);
    expect(items[0].type).toBe('submenu');
    expect(items[0].children[0].type).toBe('submenu');
  });
});

// ── tree rendering: submenu children render as chips ─────────────────────────

describe('SolMenuManager — submenu children render as chips', () => {
  test('a submenu lists each assigned child as a draggable chip', async () => {
    const el = await mountMenu();
    el._items = [{
      type: 'submenu', name: 'Apps', children: [
        { type: 'component', name: 'Clock', tag: 'sol-clock', params: [] },
        { type: 'component', name: 'Search', tag: 'sol-search', params: [] },
      ],
    }];
    el._render();

    const chips = [...rows(el)[0].querySelectorAll('.chip')].filter(c => !c.classList.contains('empty'));
    expect(chips.map(c => c.textContent)).toEqual(['Clock', 'Search']);
    expect(chips.every(c => c.draggable)).toBe(true);
  });

  test('a child whose name merely echoes the submenu name is suppressed', async () => {
    const el = await mountMenu();
    el._items = [{
      type: 'submenu', name: 'Apps', children: [
        { type: 'component', name: 'Apps', tag: 'sol-apps', params: [] },
        { type: 'component', name: 'Search', tag: 'sol-search', params: [] },
      ],
    }];
    el._render();

    const chips = [...rows(el)[0].querySelectorAll('.chip')].filter(c => !c.classList.contains('empty'));
    expect(chips.map(c => c.textContent)).toEqual(['Search']);
  });

  test('an empty submenu shows the "drag plugins here" hint chip', async () => {
    const el = await mountMenu();
    el._items = [{ type: 'submenu', name: 'Empty', children: [] }];
    el._render();
    const hint = rows(el)[0].querySelector('.chip.empty');
    expect(hint).not.toBeNull();
    expect(hint.textContent).toBe('drag plugins here');
  });

  test('an unassigned (typeless) item shows the drop-a-plugin hint', async () => {
    const el = await mountMenu();
    el._items = [{ type: 'component', name: 'Blank' }];
    el._render();
    const hint = rows(el)[0].querySelector('.chip.empty');
    expect(hint.textContent).toBe('unassigned — drop a plugin here');
  });
});

// ── drop machinery shared by the row tests ───────────────────────────────────

// A DataTransfer-like object carrying a plugin payload.
function pluginDrop(plugin) {
  const data = { [PLUGIN_MIME]: JSON.stringify(plugin), 'text/plain': '' };
  return {
    types: [PLUGIN_MIME],
    getData: (k) => data[k] || '',
    setData() {}, effectAllowed: '', dropEffect: '',
  };
}

// jsdom returns an all-zero getBoundingClientRect, which makes _overCentre()
// divide by a zero height (→ NaN → "between rows"). Give the row a real box and
// aim clientY at its centre so the drop lands ON the row.
function fireDropOnRow(row, plugin) {
  row.getBoundingClientRect = () => ({ top: 0, height: 20, left: 0, width: 100 });
  const e = new Event('drop', { bubbles: true, cancelable: true });
  Object.defineProperty(e, 'dataTransfer', { value: pluginDrop(plugin) });
  Object.defineProperty(e, 'clientY', { value: 10 });   // centre of 0..20
  row.dispatchEvent(e);
}

// ── non-flat drop: a 2nd plugin makes a SUBMENU (the base-class behavior) ─────

describe('SolMenuManager — 2nd plugin on an assigned row makes a submenu', () => {
  // A component carries over only when it HAS a friendly name to carry — its
  // catalog label or a loader-manifest meta label. (A nameless assignment is
  // treated as a stale artifact and replaced, not carried as a phantom chip.)
  // We supply the meta label the component reads via window.ComponentInterop.
  test('a component row with a manifest label + dropped plugin becomes a submenu of BOTH', async () => {
    window.ComponentInterop = { manifest: { meta: { 'sol-clock': { label: 'Clock' } } } };
    const el = await mountMenu();
    el._items = [{ type: 'component', name: 'Times', tag: 'sol-clock', params: [] }];
    el._render();
    const row = rows(el)[0].querySelector('.row');

    fireDropOnRow(row, { label: 'Search', tag: 'sol-search', params: [] });
    await flush();
    delete window.ComponentInterop;

    expect(el._items).toHaveLength(1);
    const it = el._items[0];
    expect(it.type).toBe('submenu');
    expect(it.children).toHaveLength(2);
    // The carried-over child is named by what IT is (its manifest label),
    // never by the menu item's own display name ("Times").
    expect(it.children[0]).toMatchObject({ name: 'Clock', tag: 'sol-clock' });
    expect(it.children[1]).toMatchObject({ name: 'Search', tag: 'sol-search' });
    // The promoted submenu loses its direct mount.
    expect(it.tag).toBeNull();
  });

  test('a NAMELESS component assignment is REPLACED on drop, not carried (artifact)', async () => {
    const el = await mountMenu();
    // No catalog, no manifest meta → no friendly name to carry.
    el._items = [{ type: 'component', name: 'Stale', tag: 'sol-stale', params: [] }];
    el._render();
    const row = rows(el)[0].querySelector('.row');

    fireDropOnRow(row, { label: 'Search', tag: 'sol-search', params: [] });
    await flush();

    const it = el._items[0];
    expect(it.type).toBe('component');
    expect(it.tag).toBe('sol-search');
    expect(it.type).not.toBe('submenu');
  });

  test('a link row + dropped plugin becomes a submenu carrying the link', async () => {
    const el = await mountMenu();
    el._items = [{ type: 'link', name: 'Docs', href: 'https://example.org/docs' }];
    el._render();
    const row = rows(el)[0].querySelector('.row');

    fireDropOnRow(row, { label: 'Search', tag: 'sol-search', params: [] });
    await flush();

    const it = el._items[0];
    expect(it.type).toBe('submenu');
    expect(it.children).toHaveLength(2);
    expect(it.children[0]).toMatchObject({ type: 'link', name: 'Docs', href: 'https://example.org/docs' });
    expect(it.children[1]).toMatchObject({ tag: 'sol-search' });
  });

  test('dropping on an UNASSIGNED row assigns it (no submenu — nothing to carry)', async () => {
    const el = await mountMenu();
    el._items = [{ type: 'component', name: 'Blank' }];   // no tag/href
    el._render();
    const row = rows(el)[0].querySelector('.row');

    fireDropOnRow(row, { label: 'Search', tag: 'sol-search', params: [] });
    await flush();

    const it = el._items[0];
    expect(it.type).toBe('component');
    expect(it.tag).toBe('sol-search');
    expect(it.type).not.toBe('submenu');
  });
});

// ── non-flat drop: dropping on a submenu row ADDS to it ───────────────────────

describe('SolMenuManager — drop on a submenu row adds to it', () => {
  test('a plugin dropped on a submenu row appends a child', async () => {
    const el = await mountMenu();
    el._items = [{
      type: 'submenu', name: 'Apps', children: [
        { type: 'component', name: 'A', tag: 'sol-a', params: [] },
        { type: 'component', name: 'B', tag: 'sol-b', params: [] },
      ],
    }];
    el._render();
    const row = rows(el)[0].querySelector('.row');

    fireDropOnRow(row, { label: 'Clock', tag: 'sol-clock', params: [] });
    await flush();

    const it = el._items[0];
    expect(it.type).toBe('submenu');
    expect(it.children).toHaveLength(3);
    expect(it.children[2]).toMatchObject({ name: 'Clock', tag: 'sol-clock' });
  });
});

// ── non-flat: reorder chips within a submenu ─────────────────────────────────

describe('SolMenuManager — reorder a submenu by dropping one chip on another', () => {
  // Stub a chip's box so the before/after split is deterministic, then drive
  // the chip dragstart → chip drop sequence the component wires up.
  function chipBox(chip) { chip.getBoundingClientRect = () => ({ left: 0, width: 100, top: 0, height: 20 }); }

  test('dropping the 2nd chip on the LEFT half of the 1st moves it before', async () => {
    const el = await mountMenu();
    el._items = [{
      type: 'submenu', name: 'Apps', children: [
        { type: 'component', name: 'A', tag: 'sol-a', params: [] },
        { type: 'component', name: 'B', tag: 'sol-b', params: [] },
      ],
    }];
    el._render();
    const chipEls = [...rows(el)[0].querySelectorAll('.chip')].filter(c => !c.classList.contains('empty'));
    expect(chipEls.map(c => c.textContent)).toEqual(['A', 'B']);

    // Start dragging chip B.
    const dragStart = new Event('dragstart', { bubbles: true });
    Object.defineProperty(dragStart, 'dataTransfer', {
      value: { setData() {}, getData: () => '', effectAllowed: '', types: [] },
    });
    chipEls[1].dispatchEvent(dragStart);

    // Drop it on the LEFT half of chip A (clientX < left + width/2 → "before").
    chipBox(chipEls[0]);
    const drop = new Event('drop', { bubbles: true, cancelable: true });
    Object.defineProperty(drop, 'dataTransfer', { value: pluginDrop({}) });
    Object.defineProperty(drop, 'clientX', { value: 10 });   // left half of 0..100
    chipEls[0].dispatchEvent(drop);
    await flush();

    expect(el._items[0].children.map(c => c.name)).toEqual(['B', 'A']);
  });

  test('dropping on the RIGHT half places after', async () => {
    const el = await mountMenu();
    el._items = [{
      type: 'submenu', name: 'Apps', children: [
        { type: 'component', name: 'A', tag: 'sol-a', params: [] },
        { type: 'component', name: 'B', tag: 'sol-b', params: [] },
        { type: 'component', name: 'C', tag: 'sol-c', params: [] },
      ],
    }];
    el._render();
    const chipEls = [...rows(el)[0].querySelectorAll('.chip')].filter(c => !c.classList.contains('empty'));

    // Drag chip A (index 0) onto the RIGHT half of chip C (index 2) → after C.
    const dragStart = new Event('dragstart', { bubbles: true });
    Object.defineProperty(dragStart, 'dataTransfer', {
      value: { setData() {}, getData: () => '', effectAllowed: '', types: [] },
    });
    chipEls[0].dispatchEvent(dragStart);

    chipEls[2].getBoundingClientRect = () => ({ left: 0, width: 100, top: 0, height: 20 });
    const drop = new Event('drop', { bubbles: true, cancelable: true });
    Object.defineProperty(drop, 'dataTransfer', { value: pluginDrop({}) });
    Object.defineProperty(drop, 'clientX', { value: 90 });   // right half
    chipEls[2].dispatchEvent(drop);
    await flush();

    expect(el._items[0].children.map(c => c.name)).toEqual(['B', 'C', 'A']);
  });
});

// ── row management: ✕ removes the item ────────────────────────────────────────

describe('SolMenuManager — removing a row', () => {
  test('the ✕ button removes the item from its siblings', async () => {
    const el = await mountMenu();
    el._items = [
      { type: 'submenu', name: 'Keep', children: [] },
      { type: 'submenu', name: 'Drop', children: [] },
    ];
    el._render();
    expect(rows(el)).toHaveLength(2);

    const dropBtn = rows(el)[1].querySelector('.row-btn.danger');
    dropBtn.click();
    await flush();

    expect(el._items.map(i => i.name)).toEqual(['Keep']);
  });
});
