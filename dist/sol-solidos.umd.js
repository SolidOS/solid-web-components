(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.SolSolidos = {}));
})(this, (function (exports) { 'use strict';

  // Idempotent wrapper around customElements.define. Prevents a throw when the
  // same tag is registered twice — e.g. when a page loads both the all-in-one
  // bundle and a per-component UMD build, or when a module is re-evaluated by
  // a hot-reloader.
  function define(name, klass) {
    if (typeof customElements === 'undefined') return;
    const existing = customElements.get(name);
    if (existing) {
      if (existing !== klass && !window.__SolSuppressDefineWarn) {
        console.warn(`[solid-web-components] <${name}> already registered; keeping the existing definition.`);
      }
      return;
    }
    customElements.define(name, klass);
  }

  /**
   * Style helpers for Constructable Stylesheets + adoptedStyleSheets.
   *
   * `sheetFrom(css)` returns a `CSSStyleSheet` on evergreen browsers, or
   * `null` when the constructor is unavailable (e.g. Jest/node env). Callers
   * should keep the raw `CSS` string export alongside the sheet so they can
   * fall back to a `<style>` tag when `sheet` is null.
   *
   * `adopt(root, { sheet, css, extra })` wires a shadow root (or document)
   * with the baseline module sheet (+ any extras). If no sheet is available
   * it appends `<style>${css}</style>` into the root instead.
   */


  // Ensure a named stylesheet exists in the given document/shadow-root head
  // exactly once. Useful for light-DOM components.
  function ensureDocStyle(root, id, css) {
    const target = root.nodeType === 11 ? root : (root.ownerDocument || document);
    if (!target) return;
    if (target.getElementById?.(id)) return;
    const el = document.createElement('style');
    el.id = id;
    el.textContent = css;
    (target.head || target).appendChild(el);
  }

  function getMashlib() {
    const w = typeof window !== 'undefined' ? window : {};
    const g = typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : w);
    const Mashlib = w.Mashlib || g.Mashlib;
    const SolidLogic = w.SolidLogic || g.SolidLogic;
    const $rdf = w.$rdf || g.$rdf;
    const panes = w.panes || g.panes;
    if (!Mashlib || !panes) return null;
    const initMainPage = Mashlib.initMainPage || Mashlib.default?.initMainPage || Mashlib.default;
    if (!initMainPage) return null;
    return { Mashlib, initMainPage, SolidLogic, $rdf, panes };
  }

  const HOST_CSS = `
  sol-solidos { display: block; width: 100%; height: 100%; }
`;

  class SolSolidos extends HTMLElement {
    static get observedAttributes() { return ['source']; }

    constructor() {
      super();
      this._ready = false;
      this._m = null;
      this._outliner = null;
    }

    connectedCallback() {
      if (this.isConnected && !this._ready) this._init();
    }

    attributeChangedCallback(name, oldV, newV) {
      if (name === 'source' && oldV !== newV && this._ready) {
        this._goTo(newV);
      }
    }

    _goTo(uri) {
      if (!uri || !this._outliner) return;
      const subject = this._m.$rdf.sym(uri);
      this._outliner.GotoSubject(subject, true, undefined, true, undefined);
    }

    _init() {
      const m = getMashlib();
      if (!m) {
        const w = typeof window !== 'undefined' ? window : {};
        const g = typeof globalThis !== 'undefined' ? globalThis : {};
        console.error('[sol-solidos] getMashlib() returned null. window.Mashlib:', w.Mashlib,
          'globalThis.Mashlib:', g.Mashlib, 'window.panes:', w.panes, 'globalThis.panes:', g.panes);
        this.textContent = 'mashlib not loaded \u2014 add <script src="mashlib.js"> to the page';
        return;
      }
      this._m = m;
      ensureDocStyle(document, 'sol-solidos-style', HOST_CSS);

      // Build the DOM structure mashlib expects
      this.innerHTML = `
      <header id="PageHeader" role="banner"></header>
      <main id="mainContent" tabindex="-1">
        <div class="TabulatorOutline" id="DummyUUID">
          <table id="outline"></table>
          <div id="GlobalDashboard"></div>
        </div>
      </main>
      <footer id="PageFooter" role="contentinfo"></footer>
    `;

      const SL = m.SolidLogic?.solidLogicSingleton || m.SolidLogic?.default?.solidLogicSingleton;
      const store = SL?.store;
      const uri = this.getAttribute('source') || window.location.href;

      this._outliner = m.panes.getOutliner(document);
      m.initMainPage(store, uri);

      this._ready = true;
    }
  }

  define('sol-solidos', SolSolidos);

  exports.default = SolSolidos;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
