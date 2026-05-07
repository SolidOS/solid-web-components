/**
 * <sol-tabs> — Tabbed content container.
 *
 * Light-DOM element so the hosting context's styles (e.g. the modal's
 * shadow-scoped `.modal-*` classes) reach the tab content.
 *
 * Imperative usage:
 *   const t = document.createElement('sol-tabs');
 *   t.tabs = [
 *     { name: 'View', render(body, footer, actions) { ... } },
 *     { name: 'Edit', render(body, footer, actions) { ... } },
 *   ];
 *   t.footerEl  = someFooterEl;
 *   t.actionsEl = someActionsEl;
 *   parent.appendChild(t);
 *   t.switchTab('View');
 *
 * Declarative usage: fill the element with <a href="...">Label</a> anchors.
 * Each anchor becomes a tab — label = text, content URL = href. Contents
 * render lazily on first switch. Set `handler="sol-*"` on the anchor (or
 * on <sol-tabs> as a default) to wrap the URL in that component; otherwise
 * <sol-include> is used. The href is forwarded as both `source` and
 * `endpoint`, and all other anchor attributes pass through — so e.g.
 * `wanted="? ? ?"` on an anchor with `handler="sol-query"` just works.
 *
 *   <sol-tabs>
 *     <a href="notes.md">Notes</a>
 *     <a href="data.ttl" handler="sol-query" wanted="? ? ?">Table</a>
 *   </sol-tabs>
 *
 *   <sol-tabs handler="sol-live-edit">
 *     <a href="readme.md">Readme</a>
 *   </sol-tabs>
 *
 * The tab bar is hidden when only one tab is supplied. Set attribute
 * `variant="sub"` for the slimmer nested subtab styling.
 *
 * Events (bubbling, composed):
 *   sol-tab-change — detail: { name }
 */

import { define } from '../core/define.js';
import { ensureDocStyle } from '../core/adopt.js';
import { CSS as TABS_CSS } from './styles/sol-tabs-css.js';

/**
 * Tabbed content container.
 *
 * Light-DOM element. Fill with anchor children (declarative) or set
 * the `.tabs` property (imperative). Tab bar is hidden for a single tab.
 *
 * @class SolTabs
 * @extends HTMLElement
 * @attr {string} orientation - "horizontal" (default) or "vertical"
 * @attr {string} handler - default sol-* component tag for all tabs
 * @attr {string} variant - "sub" for slimmer nested subtab styling
 * @fires sol-tab-change - detail: { name }
 */
class SolTabs extends HTMLElement {
  constructor() {
    super();
    this._tabs = [];
    this._btns = {};
    this._active = null;
    this._cleanup = null;
    this._footerEl = null;
    this._actionsEl = null;
    this._rendered = false;
  }

  connectedCallback() {
    ensureDocStyle(this.getRootNode(), 'sol-tabs-styles', TABS_CSS);
    if (this._rendered) return;

    // Harvest declarative anchors before we overwrite innerHTML.
    const declared = this._tabs.length === 0 ? this._harvestAnchors() : null;

    this.innerHTML = `
      <div class="sol-tabs-bar" role="tablist"></div>
      <div class="sol-tabs-content"></div>`;
    this._rendered = true;

    if (declared?.length) {
      this._tabs = declared;
    }
    this._renderBar();

    if (declared?.length) this.switchTab(declared[0].name);
  }

  // Parse <a href="url" [handler="tag"] [attr=val ...]>Label</a> children
  // into tab descriptors. Each tab's render() creates the component named
  // by the anchor's `handler` attribute (falling back to the sol-tabs-level
  // `handler` attribute, finally to <sol-include>). The href is passed to
  // the created element as both `source` and `endpoint` so components that
  // use either convention (sol-include / sol-live-edit use source, sol-query
  // uses endpoint) pick it up. All other anchor attributes are forwarded.
  _harvestAnchors() {
    const anchors = Array.from(this.querySelectorAll(':scope > a[href]'));
    if (!anchors.length) return [];
    const parentHandler = (this.getAttribute('handler') || '').trim();
    const SKIP = new Set(['href', 'handler', 'target', 'rel', 'download', 'hreflang', 'type', 'referrerpolicy']);
    return anchors.map((a, i) => {
      const label = (a.textContent || '').trim() || `Tab ${i + 1}`;
      const url = a.getAttribute('href');
      const handlerTag = (a.getAttribute('handler') || parentHandler || 'sol-include').trim();
      return {
        name: label,
        render: (body) => {
          _ensureHandler(handlerTag);
          const el = document.createElement(handlerTag);
          el.setAttribute('source', url);
          el.setAttribute('endpoint', url);
          for (const attr of a.attributes) {
            if (SKIP.has(attr.name)) continue;
            el.setAttribute(attr.name, attr.value);
          }
          el.classList.add('sol-tab-embed');
          body.appendChild(el);
        },
      };
    });
  }

  get tabs() { return this._tabs; }
  set tabs(arr) {
    this._tabs = arr || [];
    if (this._rendered) this._renderBar();
  }

  get footerEl() { return this._footerEl; }
  set footerEl(el) { this._footerEl = el; }

  get actionsEl() { return this._actionsEl; }
  set actionsEl(el) { this._actionsEl = el; }

  get activeTab() { return this._active; }
  get body() { return this.querySelector(':scope > .sol-tabs-content'); }

  _renderBar() {
    const bar = this.querySelector(':scope > .sol-tabs-bar');
    if (!bar) return;
    bar.innerHTML = '';
    this._btns = {};
    if (this._tabs.length <= 1) { bar.style.display = 'none'; return; }
    bar.style.display = '';
    this._tabs.forEach(tab => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('role', 'tab');
      btn.textContent = tab.name;
      btn.onclick = () => this.switchTab(tab.name);
      bar.appendChild(btn);
      this._btns[tab.name] = btn;
    });
  }

  switchTab(name) {
    const tab = this._tabs.find(t => t.name.toLowerCase() === name.toLowerCase());
    if (!tab) return;
    this._active = tab.name;

    if (typeof this._cleanup === 'function') { this._cleanup(); this._cleanup = null; }

    Object.values(this._btns).forEach(b => b.classList.remove('active'));
    if (this._btns[tab.name]) this._btns[tab.name].classList.add('active');

    const body = this.body;
    body.innerHTML = '';
    body.style.padding = ''; body.style.overflow = ''; body.style.height = '';
    if (this._footerEl)  this._footerEl.innerHTML = '';
    if (this._actionsEl) this._actionsEl.innerHTML = '';

    const cleanup = tab.render(body, this._footerEl, this._actionsEl);
    if (typeof cleanup === 'function') this._cleanup = cleanup;

    this.dispatchEvent(new CustomEvent('sol-tab-change', {
      bubbles: true, composed: true, detail: { name: tab.name },
    }));
  }

  disconnectedCallback() {
    if (typeof this._cleanup === 'function') { this._cleanup(); this._cleanup = null; }
  }
}

// Lazy-import a sibling sol-* handler module on first use so authors don't
// have to manually <script> every component used by a declared tab.
function _ensureHandler(tag) {
  if (!/^sol-[a-z-]+$/.test(tag)) return;
  if (customElements.get(tag)) return;
  import(new URL(`./${tag}.js`, import.meta.url).href).catch(() => {});
}

define('sol-tabs', SolTabs);
export { SolTabs };
export default SolTabs;
