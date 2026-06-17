import { define } from '../core/define.js';
import { ensureDocStyle } from '../core/adopt.js';
import { getAuthFetch } from '../core/auth-fetch.js';

function getMashlib() {
  const w = typeof window !== 'undefined' ? window : {};
  const g = typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : w);
  const Mashlib = w.Mashlib || g.Mashlib;
  const SolidLogic = w.SolidLogic || g.SolidLogic;
  const $rdf = w.$rdf || g.$rdf;
  const panes = w.panes || g.panes;
  if (!Mashlib || !panes) return null;
  // mashlib 2.x exposes initMainPage/getOutliner on `panes`, not on the Mashlib
  // global (which is only { versionInfo }). Fall back to panes.* for compat.
  const initMainPage = Mashlib.initMainPage || Mashlib.default?.initMainPage
    || Mashlib.default || panes.initMainPage;
  if (!initMainPage) return null;
  return { Mashlib, initMainPage, SolidLogic, $rdf, panes };
}

// Show mashlib's full SolidOS banner (header) so the embedded data browser looks
// and behaves like SolidOS; only the page footer is suppressed. Mashlib's reads/
// writes go through the page's authenticated fetch (shared in via component-interop;
// see _init), so the banner's own actions inherit the session.
const HOST_CSS = `
  sol-solidos { display: block; width: 100%; height: 100%; }
  sol-solidos > #PageFooter { display: none; }
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

    // Build the DOM structure mashlib 2.x expects (matches its databrowser.html:
    // initMainPage fills #mainSolidUiHeader / #MainContent / #OutlineView /
    // #GlobalDashboard / #NavMenu / #PageFooter by id).
    this.innerHTML = `
      <solid-ui-header id="mainSolidUiHeader" theme="" layout="" brand-link="/"><span slot="title"></span></solid-ui-header>
      <main id="MainContent" role="main" tabindex="-1" aria-live="polite">
        <div class="app-shell">
          <aside id="NavMenu" class="app-nav" aria-label="Application menu" hidden><div id="NavMenuContent" class="menu-content"></div></aside>
          <div class="app-view">
            <table id="OutlineView" class="outline-view" aria-label="Resource browser"></table>
            <section id="GlobalDashboard" class="global-dashboard" aria-label="Dashboard" hidden></section>
          </div>
        </div>
        <div id="MenuOverlay" class="menu-overlay" hidden aria-hidden="true"></div>
      </main>
      <footer id="PageFooter" role="contentinfo"></footer>
    `;

    const SL = m.SolidLogic?.solidLogicSingleton || m.SolidLogic?.default?.solidLogicSingleton;
    const store = SL?.store;
    const uri = this.getAttribute('source') || window.location.href;

    // Route mashlib's reads/writes through the page's authenticated fetch. A host
    // shares its fetch via component-interop (SolidWebComponents.adoptFetch), which
    // getAuthFetch() returns; solid-logic's boundFetch resolves the global fetch at
    // call time, so overriding it here makes every pane request inherit the session.
    // Resolved per-call so a fetch adopted after init is still honoured.
    if (!window.__solSolidosFetchPatched) {
      window.__solSolidosFetchPatched = true;
      const nativeFetch = window.fetch.bind(window);
      window.fetch = (input, init) => {
        const u = typeof input === 'string' ? input
          : (input && (input.url || input.href)) || uri;
        try {
          const f = getAuthFetch(u);
          if (typeof f === 'function') return f(input, init);
        } catch (_) { /* fall through to native */ }
        return nativeFetch(input, init);
      };
    }

    this._outliner = m.panes.getOutliner(document);
    m.initMainPage(store, uri);

    this._ready = true;
  }
}

define('sol-solidos', SolSolidos);
export default SolSolidos;
