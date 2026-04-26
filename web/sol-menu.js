/**
 * <sol-menu> — Sidebar navigation + content panel.
 *
 * Shadow-DOM element with the same declarative API as <sol-tabs>: fill
 * with <a href="…">Label</a> children, each anchor becomes a menu entry;
 * clicking loads its URL into the content panel.
 *
 * Imperative usage:
 *   const m = document.createElement('sol-menu');
 *   m.items = [
 *     { name: 'Overview', render(body) { ... } },
 *     { name: 'Details',  render(body) { ... } },
 *   ];
 *   parent.appendChild(m);
 *   m.select('Overview');
 *
 * Declarative usage: like <sol-tabs>. Handler lookup per anchor, falling
 * back to <sol-menu>'s `handler` attribute, then to <sol-include>. The
 * href is forwarded as both `source` and `endpoint`, and other anchor
 * attributes pass through.
 *
 *   <sol-menu>
 *     <a href="intro.md">Intro</a>
 *     <a href="data.ttl" handler="sol-query" pattern="?s ?p ?o">Triples</a>
 *   </sol-menu>
 *
 * Submenus: nest <submenu> elements to create collapsible groups. The
 * <label> text is the group heading; anchors (or further <submenu>s) inside
 * become the group's items. Any depth is supported.
 *
 *   <sol-menu>
 *     <a href="home.md">Home</a>
 *     <submenu>
 *       <label>Docs</label>
 *       <a href="quickstart.md">Quickstart</a>
 *       <submenu>
 *         <label>API</label>
 *         <a href="api/query.md">Query</a>
 *         <a href="api/modal.md">Modal</a>
 *       </submenu>
 *     </submenu>
 *   </sol-menu>
 *
 * Attributes:
 *   orientation="horizontal"  — lay the nav bar on top instead of the side
 *   handler="sol-*"           — default component for rendering each item
 *
 * Events (bubbling, composed):
 *   sol-menu-change — detail: { name }
 */

import { define } from '@solid-components/core/define.js';
import { adopt } from '@solid-components/core/adopt.js';
import { CSS as MENU_CSS, sheet as menuSheet } from './styles/sol-menu-css.js';
import { loadRdfStore } from '@solid-components/core/rdf-utils.js';
import { rdf } from '@solid-components/core/rdf.js';

/**
 * Sidebar navigation + content panel.
 *
 * Shadow-DOM element. Same declarative API as sol-tabs: fill with anchor
 * children, each becomes a menu entry.
 *
 * @class SolMenu
 * @extends HTMLElement
 * @attr {string} orientation - "horizontal" to lay nav on top (default: sidebar)
 * @attr {string} handler - default sol-* component tag for anchors
 * @fires sol-menu-change - detail: { name }
 */
const UI = 'http://www.w3.org/ns/ui#';
const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const SCHEMA = 'http://schema.org/';

class SolMenu extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._items = [];
    this._btns = {};
    this._active = null;
    this._cleanup = null;
    this._rendered = false;
  }

  static get observedAttributes() { return ['from-rdf']; }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'from-rdf' && oldValue !== newValue && this._rendered) {
      this._loadFromRdf(newValue);
    }
  }

  connectedCallback() {
    if (this._rendered) return;

    const fromRdf = this.getAttribute('from-rdf');
    if (fromRdf) {
      this._initShell();
      this._loadFromRdf(fromRdf);
      return;
    }

    const declared = this._items.length === 0 ? this._harvestItems(this) : null;
    this._initShell();
    if (declared?.length) this._items = declared;
    this._renderNav();

    const firstLeaf = this._firstLeaf(this._items);
    if (firstLeaf) this.select(firstLeaf.name);
  }

  _initShell() {
    const orient = this.getAttribute('orientation') === 'horizontal' ? 'horizontal' : 'vertical';
    const root = this.shadowRoot;
    root.innerHTML = `
      <div class="sol-menu-nav" role="tablist" aria-orientation="${orient}"></div>
      <div class="sol-menu-content" role="tabpanel" id="${this._panelId()}"></div>`;
    adopt(root, { sheet: menuSheet, css: MENU_CSS });
    this._rendered = true;
    this._onDocClick = (e) => {
      if (!this.contains(e.target) && !root.contains(e.target)) this._closeAllPopups();
    };
    document.addEventListener('click', this._onDocClick);
    this._onKeyDown = (e) => this._handleKeyDown(e);
    root.addEventListener('keydown', this._onKeyDown);
  }

  _panelId() {
    if (!this._pid) this._pid = 'sol-menu-panel-' + Math.random().toString(36).slice(2, 8);
    return this._pid;
  }

  _handleKeyDown(e) {
    const root = this.shadowRoot;
    const nav = root.querySelector('.sol-menu-nav');
    if (!nav) return;
    const horizontal = this.getAttribute('orientation') === 'horizontal';

    // Escape closes any open popup
    if (e.key === 'Escape') {
      const openGroup = root.querySelector('.sol-menu-group.open');
      if (openGroup) {
        this._closeAllPopups();
        const groupBtn = openGroup.querySelector(':scope > .sol-menu-group-btn');
        if (groupBtn) groupBtn.focus();
        e.preventDefault();
        return;
      }
    }

    // Arrow / Home / End navigation among focusable buttons in the nav
    const nextKey = horizontal ? 'ArrowRight' : 'ArrowDown';
    const prevKey = horizontal ? 'ArrowLeft' : 'ArrowUp';
    if (![nextKey, prevKey, 'Home', 'End'].includes(e.key)) return;
    if (!nav.contains(e.target) || e.target.tagName !== 'BUTTON') return;

    // Collect focusable buttons visible at the current level
    const focusable = this._focusableButtons(nav, e.target);
    if (!focusable.length) return;
    const idx = focusable.indexOf(e.target);
    let next;
    if (e.key === nextKey)  next = focusable[(idx + 1) % focusable.length];
    if (e.key === prevKey)  next = focusable[(idx - 1 + focusable.length) % focusable.length];
    if (e.key === 'Home')   next = focusable[0];
    if (e.key === 'End')    next = focusable[focusable.length - 1];
    if (next && next !== e.target) {
      this._setRovingFocus(next);
      e.preventDefault();
    }
  }

  _focusableButtons(container, target) {
    // If target is inside an open popup, scope to that popup; otherwise top-level nav
    const popup = target.closest('.sol-menu-popup');
    const scope = popup || container;
    return Array.from(scope.querySelectorAll(':scope > button, :scope > .sol-menu-group > .sol-menu-group-btn'));
  }

  _setRovingFocus(btn) {
    const nav = this.shadowRoot.querySelector('.sol-menu-nav');
    if (!nav) return;
    nav.querySelectorAll('button').forEach(b => b.setAttribute('tabindex', '-1'));
    btn.setAttribute('tabindex', '0');
    btn.focus();
  }

  async _loadFromRdf(uri) {
    try {
      let docUrl, fragment;
      try {
        const parsed = new URL(uri, document.baseURI);
        fragment = parsed.hash.slice(1);
        parsed.hash = '';
        docUrl = parsed.href;
      } catch {
        docUrl = uri;
        fragment = '';
      }
      const store = await loadRdfStore(docUrl);
      let root;
      if (fragment) {
        root = rdf.sym(docUrl + '#' + fragment);
      } else {
        const menuType = rdf.sym(UI + 'Menu');
        const typeNode = rdf.sym(RDF + 'type');
        root = store.each(null, typeNode, menuType)[0];
      }
      if (!root) return;
      const linkTarget = this._rdfVal(store, root, 'linkTarget');
      this._rdfLinkTarget = linkTarget || null;
      const orientation = this._rdfVal(store, root, 'orientation') || 'horizontal';
      if (!this.hasAttribute('orientation')) this.setAttribute('orientation', orientation);
      this._items = this._rdfMenuItems(store, root);
      this._renderNav();
      const firstLeaf = this._firstLeaf(this._items);
      if (firstLeaf) this.select(firstLeaf.name);
    } catch (err) {
      console.error('<sol-menu> from-rdf load failed:', err);
    }
  }

  _rdfVal(store, subject, localName) {
    const node = store.any(subject, rdf.sym(UI + localName));
    return node ? node.value : null;
  }

  _rdfComponent(store, node) {
    if (!node) return { tag: null, params: [] };
    const tag = this._rdfVal(store, node, 'name') || this._rdfVal(store, node, 'label');
    const attrNodes = store.each(node, rdf.sym(UI + 'attribute'), null);
    const paramNodes = store.each(node, rdf.sym(UI + 'parameter'), null);
    const params = [...attrNodes, ...paramNodes].map(p => [
      (store.any(p, rdf.sym(SCHEMA + 'name')) || {}).value || '',
      (store.any(p, rdf.sym(SCHEMA + 'value')) || {}).value || '',
    ]).filter(([k]) => k);
    return { tag, params };
  }

  _rdfListElements(store, listNode) {
    if (listNode.elements) return listNode.elements;
    const items = [];
    let cur = listNode;
    const nil = rdf.sym(RDF + 'nil');
    const first = rdf.sym(RDF + 'first');
    const rest = rdf.sym(RDF + 'rest');
    while (cur && cur.value !== nil.value) {
      const el = store.any(cur, first);
      if (el) items.push(el);
      cur = store.any(cur, rest);
    }
    return items;
  }

  _rdfMenuItems(store, menuNode) {
    const partsNode = store.any(menuNode, rdf.sym(UI + 'parts'));
    if (!partsNode) return [];
    const parts = this._rdfListElements(store, partsNode);
    const menuType = rdf.sym(UI + 'Menu');
    const componentType = rdf.sym(UI + 'Component');
    const typeNode = rdf.sym(RDF + 'type');
    const items = [];
    for (const part of parts) {
      const partType = store.any(part, typeNode);
      const label = this._rdfVal(store, part, 'label') || part.value;
      const icon = this._rdfVal(store, part, 'icon');
      if (partType && partType.value === menuType.value) {
        items.push({
          name: label,
          children: this._rdfMenuItems(store, part),
        });
      } else if (partType && partType.value === componentType.value) {
        const { tag, params } = this._rdfComponent(store, part);
        const linkTarget = this._rdfLinkTarget;
        items.push({
          name: label,
          icon,
          render: (body) => {
            if (!tag) return;
            _ensureHandler(tag);
            const el = document.createElement(tag);
            for (const [k, v] of params) el.setAttribute(k, v);
            el.classList.add('sol-menu-embed');
            const target = linkTarget
              ? document.querySelector(linkTarget)
              : body;
            target.innerHTML = '';
            target.appendChild(el);
          },
        });
      } else {
        const href = this._rdfVal(store, part, 'href');
        const handlerNode = store.any(part, rdf.sym(UI + 'handler'));
        const { tag: handlerTag, params: handlerParams } = this._rdfComponent(store, handlerNode);
        const contents = this._rdfVal(store, part, 'contents');
        const linkTarget = this._rdfLinkTarget;
        items.push({
          name: label,
          icon,
          render: (body) => {
            if (contents) {
              const target = linkTarget
                ? document.querySelector(linkTarget)
                : body;
              target.innerHTML = contents;
              return;
            }
            if (!href) return;
            const tag = handlerTag || this.getAttribute('handler') || 'sol-include';
            _ensureHandler(tag);
            const el = document.createElement(tag);
            el.setAttribute('source', href);
            el.setAttribute('endpoint', href);
            for (const [k, v] of handlerParams) el.setAttribute(k, v);
            el.classList.add('sol-menu-embed');
            const target = linkTarget
              ? document.querySelector(linkTarget)
              : body;
            target.innerHTML = '';
            target.appendChild(el);
          },
        });
      }
    }
    return items;
  }

  _harvestItems(root) {
    const parentHandler = (this.getAttribute('handler') || '').trim();
    const SKIP = new Set(['href', 'handler', 'target', 'rel', 'download', 'hreflang', 'type', 'referrerpolicy']);
    const out = [];
    let i = 0;
    for (const node of Array.from(root.children)) {
      if (node.tagName === 'A' && node.hasAttribute('href')) {
        const label = (node.textContent || '').trim() || `Item ${++i}`;
        const url = node.getAttribute('href');
        const handlerTag = (node.getAttribute('handler') || parentHandler || 'sol-include').trim();
        out.push({
          name: label,
          render: (body) => {
            _ensureHandler(handlerTag);
            const el = document.createElement(handlerTag);
            el.setAttribute('source', url);
            el.setAttribute('endpoint', url);
            for (const attr of node.attributes) {
              if (SKIP.has(attr.name)) continue;
              el.setAttribute(attr.name, attr.value);
            }
            el.classList.add('sol-menu-embed');
            body.appendChild(el);
          },
        });
      } else if (node.tagName === 'SUBMENU') {
        const labelEl = node.querySelector(':scope > label');
        const label = (labelEl?.textContent || '').trim() || `Group ${++i}`;
        const inner = document.createElement('div');
        for (const c of Array.from(node.children)) {
          if (c.tagName === 'LABEL') continue;
          inner.appendChild(c);
        }
        const children = this._harvestItems(inner);
        out.push({ name: label, open: node.hasAttribute('open'), children });
      }
    }
    return out;
  }

  _firstLeaf(items) {
    for (const it of items) {
      if (it.children) {
        const leaf = this._firstLeaf(it.children);
        if (leaf) return leaf;
      } else if (typeof it.render === 'function') {
        return it;
      }
    }
    return null;
  }

  _flatLeaves(items, acc = []) {
    for (const it of items) {
      if (it.children) this._flatLeaves(it.children, acc);
      else if (typeof it.render === 'function') acc.push(it);
    }
    return acc;
  }

  get items() { return this._items; }
  set items(arr) {
    this._items = arr || [];
    if (this._rendered) this._renderNav();
  }

  get activeItem() { return this._active; }
  get body() { return this.shadowRoot.querySelector('.sol-menu-content'); }

  _renderNav() {
    const root = this.shadowRoot;
    const nav = root.querySelector('.sol-menu-nav');
    if (!nav) return;
    nav.innerHTML = '';
    this._btns = {};
    const orient = this.getAttribute('orientation') === 'horizontal' ? 'horizontal' : 'vertical';
    nav.setAttribute('aria-orientation', orient);
    const panel = root.querySelector('.sol-menu-content');
    if (panel) panel.id = this._panelId();
    const leafCount = this._flatLeaves(this._items).length;
    if (leafCount <= 1 && !this._items.some(i => i.children)) {
      nav.style.display = 'none';
      return;
    }
    nav.style.display = '';
    this._renderNavLevel(nav, this._items, 0);
    // Roving tabindex: only the first focusable button is in tab order
    const allBtns = nav.querySelectorAll('button');
    allBtns.forEach((b, i) => b.setAttribute('tabindex', i === 0 ? '0' : '-1'));
  }

  _renderNavLevel(parent, items, depth) {
    const isPopup = depth > 0;
    items.forEach(item => {
      if (item.children) {
        const wrap = document.createElement('div');
        wrap.className = 'sol-menu-group';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'sol-menu-group-btn';
        btn.textContent = item.name;
        btn.setAttribute('aria-haspopup', 'true');
        btn.setAttribute('aria-expanded', 'false');
        const popup = document.createElement('div');
        popup.className = 'sol-menu-popup';
        popup.setAttribute('role', 'menu');
        popup.setAttribute('aria-label', item.name);
        this._renderNavLevel(popup, item.children, depth + 1);
        btn.onclick = (e) => {
          e.stopPropagation();
          const wasOpen = wrap.classList.contains('open');
          this._closeSiblingPopups(wrap);
          wrap.classList.toggle('open', !wasOpen);
          btn.setAttribute('aria-expanded', String(!wasOpen));
          if (!wasOpen) {
            this._positionPopup(btn, popup, depth);
            const first = popup.querySelector('button');
            if (first) { first.setAttribute('tabindex', '0'); first.focus(); }
          }
        };
        wrap.appendChild(btn);
        wrap.appendChild(popup);
        parent.appendChild(wrap);
      } else {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.setAttribute('role', isPopup ? 'menuitem' : 'tab');
        if (!isPopup) {
          btn.setAttribute('aria-selected', 'false');
          btn.setAttribute('aria-controls', this._panelId());
        }
        if (item.icon) {
          btn.title = item.name;
          btn.setAttribute('aria-label', item.name);
          const span = document.createElement('span');
          span.className = 'sol-menu-icon';
          span.setAttribute('aria-hidden', 'true');
          btn.appendChild(span);
          if (item.icon.startsWith('data:image/svg+xml')) {
            try {
              const raw = decodeURIComponent(item.icon.replace('data:image/svg+xml,', ''));
              span.innerHTML = raw;
              const svg = span.querySelector('svg');
              if (svg) { svg.setAttribute('width', '1.2em'); svg.setAttribute('height', '1.2em'); }
            } catch { span.textContent = item.name; }
          } else {
            const img = document.createElement('img');
            img.src = item.icon;
            img.alt = '';
            span.appendChild(img);
          }
        } else {
          btn.textContent = item.name;
        }
        btn.onclick = () => { this.select(item.name); this._closeAllPopups(); };
        parent.appendChild(btn);
        this._btns[item.name] = btn;
      }
    });
  }

  _positionPopup(btn, popup, depth) {
    const r = btn.getBoundingClientRect();
    const horizontal = this.getAttribute('orientation') === 'horizontal';
    const flyBelow = horizontal && depth === 0;
    popup.style.top  = (flyBelow ? r.bottom + 2 : r.top) + 'px';
    popup.style.left = (flyBelow ? r.left : r.right + 2) + 'px';
  }

  _closeSiblingPopups(keep) {
    const parent = keep.parentElement;
    if (!parent) return;
    parent.querySelectorAll(':scope > .sol-menu-group.open').forEach(g => {
      if (g !== keep) {
        g.classList.remove('open');
        const b = g.querySelector(':scope > .sol-menu-group-btn');
        if (b) b.setAttribute('aria-expanded', 'false');
      }
    });
  }

  _closeAllPopups() {
    this.shadowRoot.querySelectorAll('.sol-menu-group.open').forEach(g => {
      g.classList.remove('open');
      const b = g.querySelector(':scope > .sol-menu-group-btn');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  }

  select(name) {
    const item = this._flatLeaves(this._items).find(t => t.name.toLowerCase() === name.toLowerCase());
    if (!item) return;
    this._active = item.name;

    if (typeof this._cleanup === 'function') { this._cleanup(); this._cleanup = null; }

    Object.values(this._btns).forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
      b.setAttribute('tabindex', '-1');
    });
    const activeBtn = this._btns[item.name];
    if (activeBtn) {
      activeBtn.classList.add('active');
      activeBtn.setAttribute('aria-selected', 'true');
      activeBtn.setAttribute('tabindex', '0');
    }

    const body = this.body;
    body.innerHTML = '';
    body.style.padding = ''; body.style.overflow = ''; body.style.height = '';
    if (activeBtn) {
      const btnId = activeBtn.id || ('sol-menu-tab-' + item.name.replace(/\s+/g, '-').toLowerCase());
      activeBtn.id = btnId;
      body.setAttribute('aria-labelledby', btnId);
    }

    const cleanup = item.render(body);
    if (typeof cleanup === 'function') this._cleanup = cleanup;

    this.dispatchEvent(new CustomEvent('sol-menu-change', {
      bubbles: true, composed: true, detail: { name: item.name },
    }));
  }

  disconnectedCallback() {
    if (typeof this._cleanup === 'function') { this._cleanup(); this._cleanup = null; }
    if (this._onDocClick) { document.removeEventListener('click', this._onDocClick); this._onDocClick = null; }
    if (this._onKeyDown) { this.shadowRoot.removeEventListener('keydown', this._onKeyDown); this._onKeyDown = null; }
  }
}

function _ensureHandler(tag) {
  if (!/^sol-[a-z-]+$/.test(tag)) return;
  if (customElements.get(tag)) return;
  import(new URL(`./${tag}.js`, import.meta.url).href).catch(() => {});
}

define('sol-menu', SolMenu);
export { SolMenu };
export default SolMenu;
