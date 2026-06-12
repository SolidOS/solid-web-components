/**
 * <sol-menu-manager> — visual editor for a ui:Menu document: build or edit a
 * menu TREE (names of items and submenus; what an item DOES is assigned by
 * dragging a plugin from <sol-plugin-manager> onto it).
 *
 *   <sol-menu-manager source="./data/tabs.ttl#Tabs"></sol-menu-manager>
 *
 * Attributes:
 *   source — Turtle document + #fragment of the ui:Menu to edit (required).
 *
 * Editing model:
 *   - every row: drag-grip (reorder among siblings), an editable name, and —
 *     when the mounted plugin has a friendly name in the loader-manifest
 *     meta — a chip naming it ("unassigned" items show a drop hint; element
 *     tags are never shown, they mean nothing to app users)
 *   - ＋ item / ＋ submenu append at any level; ✕ removes from the menu
 *     (the item's RDF stays in the document as "pantry" — recoverable)
 *   - a card dragged from <sol-plugin-manager> DROPPED ON a row assigns
 *     that row's component (ui:name + ui:attribute set); dropped between
 *     rows it inserts a new, fully-assigned item there
 *   - every change AUTO-SAVES (debounced ~0.8s after the last edit — no
 *     Save button): the WHOLE Turtle document is rewritten via
 *     core/menu-serialize (pantry subjects preserved) and PUT with solFetch
 *
 * Events: `sol-menu-built` (detail {source}) after a successful save.
 * Reads/writes the existing ui:Menu vocabulary only — no new RDF terms.
 */

import { define } from '../core/define.js';
import { adopt, sheetFrom } from '../core/adopt.js';
import { CSS } from './styles/sol-builders-css.js';
import { rdf } from '../core/rdf.js';
import { loadRdfStore } from '../core/rdf-utils.js';
import { parseMenuItems } from '../core/menu-rdf.js';
import { updateMenuInStore, serializeMenuDocument } from '../core/menu-serialize.js';
import { solFetch } from '../core/auth-fetch.js';

const SHEET = sheetFrom(CSS);
const PLUGIN_MIME = 'application/x-sol-plugin';

class SolMenuManager extends HTMLElement {
  // Bar variant (sol-button-bar-manager) flips this: depth-1, no submenus.
  static get flat() { return false; }
  static get title() { return 'Menu'; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    adopt(this.shadowRoot, { sheet: SHEET, css: CSS });
    this._items = [];        // the edited tree (parseMenuItems shape)
    this._meta = { label: null, orientation: 'horizontal' };
    this._dirty = false;
  }

  connectedCallback() {
    // Another manager saved this document (e.g. the same menu edited on a
    // different subtab) — re-load so this instance never auto-saves a stale
    // tree over it. Skipped while THIS instance has unsaved edits (its own
    // pending save is the newer truth).
    if (!this._onMenuBuilt) {
      this._onMenuBuilt = (e) => {
        if (e.target === this || this._dirty || !this.source) return;
        const src = (e.detail && e.detail.source) || '';
        try {
          if (new URL(src.split('#')[0], document.baseURI).href === this._docUrl()) this._load();
        } catch { /* unparseable source — not ours */ }
      };
    }
    document.addEventListener('sol-menu-built', this._onMenuBuilt);
    if (this._built) return;
    this._built = true;
    this._root = document.createElement('div');
    this._root.className = 'builder';
    this.shadowRoot.appendChild(this._root);
    this._load();
  }

  disconnectedCallback() {
    if (this._onMenuBuilt) document.removeEventListener('sol-menu-built', this._onMenuBuilt);
  }

  get source() { return this.getAttribute('source') || ''; }

  _docUrl() { return new URL(this.source.split('#')[0], document.baseURI).href; }
  _menuIri() {
    const frag = (this.source.split('#')[1] || '').trim();
    return frag ? `${this._docUrl()}#${frag}` : null;
  }

  async _load() {
    if (!this.source || !this._menuIri()) {
      this._root.innerHTML = '<div class="hint">Set source="menu.ttl#MenuName" to edit a menu.</div>';
      return;
    }
    try {
      const store = await loadRdfStore(this._docUrl(), solFetch);
      const menuNode = rdf.sym(this._menuIri());
      this._items = parseMenuItems(store, menuNode);
      const label = store.any(menuNode, rdf.sym('http://www.w3.org/ns/ui#label'));
      this._meta.label = label ? label.value : (this.source.split('#')[1] || 'menu');
      const orient = store.any(menuNode, rdf.sym('http://www.w3.org/ns/ui#orientation'));
      if (orient) this._meta.orientation = orient.value.split('#').pop().toLowerCase();
    } catch (e) {
      // A 404 just means "new document" — start empty.
      this._items = [];
      this._meta.label = this.source.split('#')[1] || 'menu';
    }
    this._render();
  }

  // ---- rendering ---------------------------------------------------------

  _render() {
    this._root.replaceChildren(this._head(), this._tree(this._items, this._items), this._adders(this._items));
  }

  _head() {
    const head = document.createElement('div');
    head.className = 'builder-head';
    const title = document.createElement('span');
    title.className = 'builder-title';
    title.textContent = `${this.constructor.title}: ${this._meta.label || ''}`;
    this._status = document.createElement('span');
    this._status.className = 'builder-status';
    head.append(title, this._status);
    return head;
  }

  _tree(items, siblings) {
    const ul = document.createElement('ul');
    ul.className = 'tree';
    for (const item of items) ul.appendChild(this._row(item, siblings));
    // Dropping a palette card on the list's empty space appends a new item.
    ul.addEventListener('dragover', (e) => {
      if (e.target === ul && this._dragPayload(e)) { e.preventDefault(); }
    });
    ul.addEventListener('drop', (e) => {
      if (e.target !== ul) return;
      const plugin = this._dragPayload(e, true);
      if (plugin) { e.preventDefault(); siblings.push(this._itemFromPlugin(plugin)); this._touch(); }
    });
    return ul;
  }

  _row(item, siblings) {
    const li = document.createElement('li');
    li.className = 'item';
    const row = document.createElement('div');
    row.className = 'row';
    row.draggable = true;

    const grip = document.createElement('span');
    grip.className = 'grip';
    grip.textContent = '≡';
    grip.title = 'Drag to reorder';

    const label = document.createElement('input');
    label.className = 'label';
    label.value = item.name || '';
    label.placeholder = item.type === 'submenu' ? 'submenu name' : 'item name';
    label.setAttribute('aria-label', 'Item name');
    label.addEventListener('input', () => { item.name = label.value; this._markDirty(); });

    // The chip speaks to the app USER: a plugin's friendly name (from the
    // loader-manifest meta) when one is known — never the element tag, which
    // means nothing to users. An assigned item with no friendly name shows
    // no chip at all; "unassigned" keeps its drop hint.
    let chip = document.createElement('span');
    if (item.type === 'submenu') { chip.className = 'chip'; chip.textContent = 'submenu'; }
    else if (item.type === 'link') { chip.className = 'chip'; chip.textContent = item.href ? `link → ${item.href}` : 'link'; }
    else if (item.tag) {
      const meta = (window.ComponentInterop?.manifest?.meta || {})[item.tag];
      if (meta?.label) { chip.className = 'chip'; chip.textContent = meta.label; }
      else chip = null;
    }
    else { chip.className = 'chip empty'; chip.textContent = 'unassigned — drop a plugin here'; }

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'row-btn danger';
    del.textContent = '✕';
    del.title = 'Remove from this menu (you can drag it back in later)';
    del.setAttribute('aria-label', `Remove ${item.name || 'item'}`);
    del.addEventListener('click', () => {
      siblings.splice(siblings.indexOf(item), 1);
      this._touch();
    });

    if (chip) row.append(grip, label, chip, del);
    else row.append(grip, label, del);
    li.appendChild(row);

    // submenu children + their adders
    if (item.type === 'submenu') {
      if (!item.children) item.children = [];
      li.appendChild(this._tree(item.children, item.children));
      li.appendChild(this._adders(item.children));
    }

    this._wireRowDnd(row, item, siblings);
    return li;
  }

  _adders(siblings) {
    const div = document.createElement('div');
    div.className = 'adders';
    const addItem = document.createElement('button');
    addItem.type = 'button';
    addItem.className = 'add-btn';
    addItem.textContent = '＋ item';
    addItem.addEventListener('click', () => {
      siblings.push({ type: 'component', id: null, name: '', tag: null, params: [] });
      this._touch();
    });
    div.appendChild(addItem);
    if (!this.constructor.flat) {
      const addSub = document.createElement('button');
      addSub.type = 'button';
      addSub.className = 'add-btn';
      addSub.textContent = '＋ submenu';
      addSub.addEventListener('click', () => {
        siblings.push({ type: 'submenu', id: null, name: '', children: [] });
        this._touch();
      });
      div.appendChild(addSub);
    }
    return div;
  }

  // ---- drag & drop -------------------------------------------------------
  // Two flows share the row targets: reordering rows among their siblings
  // (internal drag) and accepting plugin cards from <sol-plugin-manager>.

  _wireRowDnd(row, item, siblings) {
    row.addEventListener('dragstart', (e) => {
      this._dragItem = { item, siblings };
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', item.name || '');
      e.stopPropagation();
    });
    row.addEventListener('dragend', () => { this._dragItem = null; });

    row.addEventListener('dragover', (e) => {
      const plugin = this._dragPayload(e);
      const internal = this._dragItem && this._dragItem.item !== item;
      if (!plugin && !internal) return;
      e.preventDefault();
      e.stopPropagation();
      row.classList.remove('drop-target', 'drop-before', 'drop-after');
      if (plugin && this._overCentre(row, e)) row.classList.add('drop-target');
      else row.classList.add(this._inUpperHalf(row, e) ? 'drop-before' : 'drop-after');
    });
    row.addEventListener('dragleave', () => row.classList.remove('drop-target', 'drop-before', 'drop-after'));

    row.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const before = this._inUpperHalf(row, e);
      const onRow = this._overCentre(row, e);
      row.classList.remove('drop-target', 'drop-before', 'drop-after');

      const plugin = this._dragPayload(e, true);
      if (plugin) {
        if (onRow && item.type !== 'submenu') {
          // assign this row's content — a component (tag) or a link (href)
          if (plugin.href) {
            item.type = 'link';
            item.href = plugin.href;
            if (plugin.region) item.region = plugin.region;
            item.tag = null;
            item.params = [];
          } else {
            item.type = 'component';
            item.tag = plugin.tag;
            item.params = (plugin.params || []).map(([k, v]) => [k, v]);
            delete item.href;
          }
          if (!item.name) item.name = plugin.label || plugin.tag || plugin.href;
          if (!item.icon && plugin.icon) item.icon = plugin.icon;
        } else {
          const at = siblings.indexOf(item) + (before ? 0 : 1);
          siblings.splice(at, 0, this._itemFromPlugin(plugin));
        }
        this._touch();
        return;
      }
      if (this._dragItem && this._dragItem.item !== item) {
        const { item: moved, siblings: from } = this._dragItem;
        from.splice(from.indexOf(moved), 1);
        const at = siblings.indexOf(item) + (before ? 0 : 1);
        siblings.splice(at, 0, moved);
        this._touch();
      }
    });
  }

  _dragPayload(e, read = false) {
    if (![...(e.dataTransfer?.types || [])].includes(PLUGIN_MIME)) return null;
    if (!read) return true;
    try { return JSON.parse(e.dataTransfer.getData(PLUGIN_MIME)); } catch { return null; }
  }
  _inUpperHalf(row, e) {
    const r = row.getBoundingClientRect();
    return e.clientY < r.top + r.height / 2;
  }
  _overCentre(row, e) {
    const r = row.getBoundingClientRect();
    const y = (e.clientY - r.top) / r.height;
    return y > 0.3 && y < 0.7;
  }

  _itemFromPlugin(plugin) {
    if (plugin.href) {
      return {
        type: 'link', id: null,
        name: plugin.label || plugin.href,
        icon: plugin.icon || undefined,
        region: plugin.region || undefined,
        href: plugin.href,
      };
    }
    return {
      type: 'component', id: null,
      name: plugin.label || plugin.tag || '',
      icon: plugin.icon || undefined,
      tag: plugin.tag || null,
      params: (plugin.params || []).map(([k, v]) => [k, v]),
    };
  }

  // ---- state + save ------------------------------------------------------
  // Auto-save: every edit schedules a save ~0.8s after the LAST edit, so a
  // typing burst in a name field becomes one PUT.

  _markDirty() {
    this._dirty = true;
    this._note('saving…', '');
    clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => this._save(), 800);
  }
  _touch() { this._markDirty(); this._render(); }
  _note(msg, cls) {
    if (!this._status) return;
    this._status.textContent = msg;
    this._status.className = `builder-status ${cls || ''}`;
  }

  async _save() {
    if (!this._menuIri()) return;
    this._note('saving…', '');
    try {
      // Rewrite over a FRESH parse so concurrent pantry edits aren't lost.
      let store;
      try { store = await loadRdfStore(this._docUrl(), solFetch); }
      catch { store = rdf.graph(); }
      updateMenuInStore(store, this._docUrl(), this._menuIri(), {
        label: this._meta.label, orientation: this._meta.orientation, items: this._items,
      });
      const turtle = await serializeMenuDocument(store, this._docUrl());
      const res = await solFetch(this._docUrl(), {
        method: 'PUT', headers: { 'Content-Type': 'text/turtle' }, body: turtle,
      });
      if (!res || res.ok === false) throw new Error(`PUT ${this._docUrl()} → ${res && res.status}`);
      this._dirty = false;
      this._note('saved ✓', 'saved');
      this.dispatchEvent(new CustomEvent('sol-menu-built', {
        bubbles: true, composed: true, detail: { source: this.source },
      }));
    } catch (e) {
      this._note(`save failed: ${e.message}`, 'error');
    }
  }
}

define('sol-menu-manager', SolMenuManager);
export { SolMenuManager, PLUGIN_MIME };
export default SolMenuManager;
