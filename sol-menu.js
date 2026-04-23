/**
 * <sol-menu> — Sidebar navigation + content panel.
 *
 * Light-DOM element so host styles reach the content area. Shares the
 * same declarative API as <sol-tabs>: fill with <a href="…">Label</a>
 * children, each anchor becomes a menu entry; clicking loads its URL
 * into the content panel.
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
 *     <a href="data.ttl" handler="sol-query" wanted="? ? ?">Triples</a>
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

import { define } from './shared/define.js';
import { ensureDocStyle } from './shared/adopt.js';
import { CSS as MENU_CSS } from './styles/sol-menu-css.js';

/**
 * Sidebar navigation + content panel.
 *
 * Light-DOM element so host styles reach the content area. Same declarative
 * API as sol-tabs: fill with anchor children, each becomes a menu entry.
 *
 * @class SolMenu
 * @extends HTMLElement
 * @attr {string} orientation - "horizontal" to lay nav on top (default: sidebar)
 * @attr {string} handler - default sol-* component tag for anchors
 * @fires sol-menu-change - detail: { name }
 */
class SolMenu extends HTMLElement {
  constructor() {
    super();
    this._items = [];
    this._btns = {};
    this._active = null;
    this._cleanup = null;
    this._rendered = false;
  }

  connectedCallback() {
    ensureDocStyle(this.getRootNode(), 'sol-menu-styles', MENU_CSS);
    if (this._rendered) return;

    const declared = this._items.length === 0 ? this._harvestItems(this) : null;

    this.innerHTML = `
      <div class="sol-menu-nav" role="tablist"></div>
      <div class="sol-menu-content"></div>`;
    this._rendered = true;

    if (declared?.length) this._items = declared;
    this._renderNav();

    this._onDocClick = (e) => { if (!this.contains(e.target)) this._closeAllPopups(); };
    document.addEventListener('click', this._onDocClick);

    const firstLeaf = this._firstLeaf(this._items);
    if (firstLeaf) this.select(firstLeaf.name);
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
  get body() { return this.querySelector(':scope > .sol-menu-content'); }

  _renderNav() {
    const nav = this.querySelector(':scope > .sol-menu-nav');
    if (!nav) return;
    nav.innerHTML = '';
    this._btns = {};
    const leafCount = this._flatLeaves(this._items).length;
    if (leafCount <= 1 && !this._items.some(i => i.children)) {
      nav.style.display = 'none';
      return;
    }
    nav.style.display = '';
    this._renderNavLevel(nav, this._items, 0);
  }

  _renderNavLevel(parent, items, depth) {
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
        this._renderNavLevel(popup, item.children, depth + 1);
        btn.onclick = (e) => {
          e.stopPropagation();
          const wasOpen = wrap.classList.contains('open');
          this._closeSiblingPopups(wrap);
          wrap.classList.toggle('open', !wasOpen);
          btn.setAttribute('aria-expanded', String(!wasOpen));
          if (!wasOpen) this._positionPopup(btn, popup, depth);
        };
        wrap.appendChild(btn);
        wrap.appendChild(popup);
        parent.appendChild(wrap);
      } else {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.setAttribute('role', 'tab');
        btn.textContent = item.name;
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
    this.querySelectorAll('.sol-menu-group.open').forEach(g => {
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

    Object.values(this._btns).forEach(b => b.classList.remove('active'));
    if (this._btns[item.name]) this._btns[item.name].classList.add('active');

    const body = this.body;
    body.innerHTML = '';
    body.style.padding = ''; body.style.overflow = ''; body.style.height = '';

    const cleanup = item.render(body);
    if (typeof cleanup === 'function') this._cleanup = cleanup;

    this.dispatchEvent(new CustomEvent('sol-menu-change', {
      bubbles: true, composed: true, detail: { name: item.name },
    }));
  }

  disconnectedCallback() {
    if (typeof this._cleanup === 'function') { this._cleanup(); this._cleanup = null; }
    if (this._onDocClick) { document.removeEventListener('click', this._onDocClick); this._onDocClick = null; }
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
