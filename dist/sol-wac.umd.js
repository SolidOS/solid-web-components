(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('rdflib')) :
  typeof define === 'function' && define.amd ? define(['exports', 'rdflib'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.SolWac = {}, global.$rdf));
})(this, (function (exports, _rdflib) { 'use strict';

  var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
  function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
      Object.keys(e).forEach(function (k) {
        if (k !== 'default') {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function () { return e[k]; }
          });
        }
      });
    }
    n.default = e;
    return Object.freeze(n);
  }

  var _rdflib__namespace = /*#__PURE__*/_interopNamespaceDefault(_rdflib);

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

  let _supports = null;
  function supports() {
    if (_supports !== null) return _supports;
    try {
      const s = new CSSStyleSheet();
      _supports = typeof s.replaceSync === 'function';
    } catch {
      _supports = false;
    }
    return _supports;
  }

  function sheetFrom(css) {
    if (!supports()) return null;
    const s = new CSSStyleSheet();
    s.replaceSync(css);
    return s;
  }

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

  // Styles for <sol-wac>. Injected via ensureDocStyle into whichever root
  // hosts the element (document body for light-DOM, shadow root when sol-wac
  // is rendered inside <sol-modal>).

  const CSS$1 = `
  .acl-role-form { display: flex; flex-direction: column; gap: 6px; padding: 6px 2px; }
  .acl-role-row {
    display: flex; align-items: center; gap: 8px;
    padding: 7px 10px; border-radius: 6px;
    background: var(--surface-2, #f9f9f9);
  }
  .acl-role-row:hover { background: var(--focus-bg, #e3f2fd); }
  .acl-role-name { font-size: 0.88em; font-weight: 600; color: var(--text, #212121); width: 68px; flex-shrink: 0; }
  .acl-grant-select {
    font-size: 0.88em; padding: 4px 8px;
    border: 1px solid var(--border, #e0e0e0); border-radius: 4px;
    background: var(--surface, #fff); color: var(--text, #212121);
    cursor: pointer; font-family: inherit;
  }
  .acl-save-btn { margin-left: auto; flex-shrink: 0; }
  .acl-specific-count {
    font-size: 0.72em; font-weight: 700;
    background: var(--accent, #2196f3); color: #fff;
    border-radius: 10px; padding: 1px 7px; min-width: 18px;
    text-align: center; flex-shrink: 0;
  }
  .acl-default-wrap {
    display: flex; align-items: center; gap: 4px;
    font-size: 0.78em; color: var(--text-muted, #666);
    cursor: pointer; white-space: nowrap; flex-shrink: 0;
  }
  .acl-default-wrap input { cursor: pointer; accent-color: var(--accent, #2196f3); }
  .acl-default-global { margin-top: 6px; padding: 6px 10px; font-size: 0.85em; color: var(--text, #212121); }
  .acl-section-label { font-size: 0.82em; font-weight: 600; color: var(--text-muted, #666); text-transform: uppercase; letter-spacing: 0.04em; }
  .acl-agents-input {
    font-family: 'Fira Mono', monospace; font-size: 0.82em;
    width: 100%; border: 1px solid var(--border, #e0e0e0);
    border-radius: 4px; padding: 6px 8px; resize: vertical;
    background: var(--surface, #fff); color: var(--text, #212121);
  }
  .acl-specific-panel {
    display: flex; flex-direction: column; gap: 6px;
    padding: 8px 10px 10px 78px;
    background: var(--surface, #fff);
    border-top: 1px solid var(--border, #e0e0e0);
    margin-top: -1px;
  }
  .acl-banner {
    padding: 8px 12px; margin-bottom: 6px;
    font-size: 0.85em; color: var(--text, #212121);
    background: var(--focus-bg, #e3f2fd);
    border-left: 3px solid var(--accent, #2196f3);
    border-radius: 4px;
  }
  .acl-rdf-editor {
    font-family: 'Fira Mono', 'Consolas', monospace;
    font-size: 0.85em; flex: 1; min-height: 200px;
    width: 100%; resize: vertical;
    border: 1px solid var(--border, #e0e0e0);
    border-radius: 4px; padding: 10px;
    background: var(--surface, #fff); color: var(--text, #212121);
  }
  .acl-rdf-editor:focus { outline: none; border-color: var(--accent, #2196f3); }
  .acl-error {
    padding: 8px 12px; color: var(--error, #c62828);
    background: var(--error-bg, #ffebee); border-radius: 4px;
    font-size: 0.9em;
  }
`;

  sheetFrom(CSS$1);

  // Singleton wrapper around rdflib. The rest of the codebase goes through this
  // class so rdflib is imported in exactly one place. Rollup treats `rdflib` as
  // external (mapped to the `$rdf` UMD global); jest's moduleNameMapper maps it
  // to a mock; importmaps/bundlers resolve it normally.


  // `import * as _rdflib` exposes rdflib's named exports directly.
  const _lib = _rdflib__namespace;

  class Rdf {
    constructor() {
      this._store = null;    // lazy shared singleton store
      this._fetcher = null;  // fetcher bound to _store
      this._loaded = new Set(); // URLs already parsed into _store (cache key)
    }

    // Record that `url` has been parsed into the shared store.
    markLoaded(url) { this._loaded.add(url); }
    isLoaded(url)   { return this._loaded.has(url); }

    // Term constructors
    sym(uri)                         { return _lib.sym(uri); }
    literal(value, langOrDatatype)   { return _lib.literal(value, langOrDatatype); }
    blankNode(id)                    { return _lib.blankNode(id); }

    // Stores & parsing
    graph()                          { return _lib.graph(); }
    parse(text, store, base, type)   { return _lib.parse(text, store, base, type); }

    // Shared singleton store — interop point with solid-logic / solid-ui / mashlib.
    // If one of those sets its own store first, call `useStore(external)` so we
    // all share the same rdflib graph and cache.
    get store() {
      if (!this._store) this._store = _lib.graph();
      return this._store;
    }
    useStore(externalStore) {
      if (!externalStore || typeof externalStore.match !== 'function') return false;
      this._store = externalStore;
      this._fetcher = externalStore.fetcher || null;
      this._loaded.clear();
      return true;
    }
    get storeFetcher() {
      if (this._fetcher) return this._fetcher;
      if (this.store.fetcher) { this._fetcher = this.store.fetcher; return this._fetcher; }
      this._fetcher = new _lib.Fetcher(this.store);
      this.store.fetcher = this._fetcher;
      return this._fetcher;
    }

    // SPARQL
    fetcher(store, opts)             { return new _lib.Fetcher(store, opts); }
    sparqlToQuery(query, isUpdate, store) { return _lib.SPARQLToQuery(query, isUpdate, store); }
    sparqlQuery(query, opts)         { return _lib.sparqlQuery(query, opts); }

    // Capability probes
    isReady()          { return !!_lib && typeof _lib.graph === 'function'; }
    hasSparqlEngine()  { return typeof _lib.SPARQLToQuery === 'function'; }
    hasRemoteSparql()  { return typeof _lib.sparqlQuery === 'function'; }

    // Serialization
    serialize(doc, store, base, contentType) {
      return _lib.serialize(doc, store, base, contentType);
    }

    // UpdateManager — for PATCH-based edits and putBack
    get UpdateManager() { return _lib.UpdateManager; }

    // Escape hatches for the few places that need rdflib-shaped access
    // (e.g. `new rdflib.Fetcher(...)`). Prefer the methods above.
    get SPARQLToQuery() { return _lib.SPARQLToQuery; }
    get Fetcher()       { return _lib.Fetcher; }
    get NamedNode()     { return _lib.NamedNode; }
    get BlankNode()     { return _lib.BlankNode; }
    get Literal()       { return _lib.Literal; }
    get Collection()    { return _lib.Collection; }
    get Statement()     { return _lib.Statement; }
  }

  const rdf = new Rdf();

  // Light-DOM styles for <sol-tabs>. Injected into the element's root
  // (document or shadow) once per root via ensureDocStyle.

  const CSS = `
  sol-tabs {
    display: flex; flex-direction: column;
    flex: 1; min-height: 0; min-width: 0;
    max-width: 100%;
    overflow: hidden;
    box-sizing: border-box;
  }
  sol-tabs .sol-tab-embed {
    display: flex; flex-direction: column;
    flex: 1; min-height: 0; min-width: 0;
    width: 100%; max-width: 100%;
    overflow: auto;
  }
  sol-tabs[orientation="vertical"] {
    flex-direction: row;
  }
  sol-tabs > .sol-tabs-bar {
    display: flex; flex-shrink: 0;
    border-bottom: 1px solid var(--border, #e0e0e0);
    padding: 0 12px; gap: 2px;
    overflow-x: auto; overflow-y: hidden;
    scrollbar-width: thin;
  }
  sol-tabs[orientation="vertical"] > .sol-tabs-bar {
    flex-direction: column;
    border-bottom: none;
    border-right: 1px solid var(--border, #e0e0e0);
    padding: 8px; gap: 2px;
    min-width: 140px; max-width: 260px;
    overflow-x: hidden; overflow-y: auto;
  }
  sol-tabs[orientation="vertical"] > .sol-tabs-bar > button {
    text-align: left;
    border-bottom: none;
    border-left: 3px solid transparent;
    border-radius: 4px;
    padding: 8px 12px;
    margin-bottom: 0;
    overflow: hidden; text-overflow: ellipsis;
  }
  sol-tabs[orientation="vertical"] > .sol-tabs-bar > button.active {
    border-bottom-color: transparent;
    border-left-color: var(--accent-dark, #1976d2);
    background: var(--focus-bg, #e3f2fd);
  }
  sol-tabs[variant="sub"] > .sol-tabs-bar {
    padding: 0; gap: 0; margin-bottom: 12px;
  }
  sol-tabs > .sol-tabs-bar > button {
    background: none; border: none;
    border-bottom: 3px solid transparent;
    border-radius: 0;
    padding: 1rem;
    font-size: 105%;
    color: var(--text-muted, #666);
    cursor: pointer; margin-bottom: -1px; font-family: inherit;
    white-space: nowrap; flex-shrink: 0;
  }
  sol-tabs[variant="sub"] > .sol-tabs-bar > button {
    padding: 8px 14px; font-size: 18px;
    border-bottom-width: 2px;
  }
  sol-tabs > .sol-tabs-bar > button:hover { color: var(--accent-dark, #1976d2); }
  sol-tabs > .sol-tabs-bar > button.active {
    color: var(--accent-dark, #1976d2);
    border-bottom-color: var(--accent-dark, #1976d2);
    font-weight: 600;
  }
  sol-tabs > .sol-tabs-content {
    flex: 1 1 auto; min-height: 0; min-width: 0;
    max-width: 100%;
    display: flex; flex-direction: column; gap: 12px;
    overflow: auto;
    padding: 16px 20px;
    box-sizing: border-box;
  }
  sol-tabs[variant="sub"] > .sol-tabs-content { padding: 0; }
  sol-tabs > .sol-tabs-content > * {
    min-width: 0; max-width: 100%;
  }
  sol-tabs > .sol-tabs-content img,
  sol-tabs > .sol-tabs-content video,
  sol-tabs > .sol-tabs-content iframe,
  sol-tabs > .sol-tabs-content table,
  sol-tabs > .sol-tabs-content pre {
    max-width: 100%;
  }
`;

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
      ensureDocStyle(this.getRootNode(), 'sol-tabs-styles', CSS);
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
    import(new URL(`./${tag}.js`, (typeof document === 'undefined' && typeof location === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : typeof document === 'undefined' ? location.href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('sol-wac.umd.js', document.baseURI).href))).href).catch(() => {});
  }

  define('sol-tabs', SolTabs);

  /**
   * <sol-wac> — Web Access Control (WAC) editor.
   *
   * Displays and edits the ACL for a Solid resource. Renders two subtabs:
   *   - Form: one row per role (viewer/poster/editor/owner) with a grant
   *     select (nobody / specific / authenticated / public) and an inline
   *     WebID+group panel for the "specific" case. A container-only checkbox
   *     toggles acl:default (apply to contents).
   *   - RDF: raw Turtle in a textarea.
   *
   * Attributes:
   *   source       — resource URL whose ACL should be loaded
   *
   * Properties:
   *   fetchFn      — authenticated fetch (defaults to window.fetch)
   *   source       — mirror of the `source` attribute
   *
   * Methods:
   *   load()       — (re)load the ACL from the server
   *   save()       — PUT the current Turtle to the resolved ACL URL
   *
   * Events (bubbling, composed):
   *   sol-wac-save   — ACL saved successfully ({ aclUrl })
   *   sol-wac-error  — load or save failed ({ phase, error })
   *   sol-status     — human-readable status ({ message, type })
   */


  // ── ACL constants ─────────────────────────────────────────────────────

  const ACL = 'http://www.w3.org/ns/auth/acl#';
  const FOAF = 'http://xmlns.com/foaf/0.1/';
  const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';

  const ROLES = [
    { key: 'viewer',  label: 'Viewer',  modes: [ACL+'Read'] },
    { key: 'poster',  label: 'Poster',  modes: [ACL+'Read', ACL+'Append'] },
    { key: 'editor',  label: 'Editor',  modes: [ACL+'Read', ACL+'Write', ACL+'Append'] },
    { key: 'owner',   label: 'Owner',   modes: [ACL+'Read', ACL+'Write', ACL+'Append', ACL+'Control'] },
  ];

  const GRANT_OPTIONS = [
    { value: 'nobody',        label: 'Nobody' },
    { value: 'specific',      label: 'Specific people/groups' },
    { value: 'authenticated', label: 'Anyone logged in' },
    { value: 'public',        label: 'Everyone (public)' },
  ];

  // ── ACL discovery ─────────────────────────────────────────────────────

  async function getAclUrl(resourceUrl, fetchFn) {
    try {
      const resp = await fetchFn(resourceUrl, { method: 'HEAD', headers: { 'Cache-Control': 'no-cache' } });
      const link = resp.headers.get('Link') || '';
      const match = link.match(/<([^>]+)>\s*;\s*rel="acl"/);
      if (match) return new URL(match[1], resourceUrl).href;
    } catch (e) {}
    return resourceUrl + '.acl';
  }

  async function getPermissions(url, fetchFn) {
    const aclUrl = await getAclUrl(url, fetchFn);
    const ownResp = await fetchFn(aclUrl, { headers: { 'Cache-Control': 'no-cache' } });
    if (ownResp.ok) {
      return { own: await ownResp.text(), aclUrl, inherited: null, inheritedFrom: null };
    }

    const urlObj = new URL(url);
    let parts = urlObj.pathname.replace(/\/$/, '').split('/').filter(Boolean);
    while (parts.length > 0) {
      parts = parts.slice(0, -1);
      const parentUrl = urlObj.origin + '/' + parts.join('/') + (parts.length ? '/' : '');
      const parentAclUrl = await getAclUrl(parentUrl, fetchFn);
      const parentResp = await fetchFn(parentAclUrl, { headers: { 'Cache-Control': 'no-cache' } });
      if (parentResp.ok) {
        return { own: null, aclUrl, inherited: await parentResp.text(), inheritedFrom: parentUrl };
      }
    }
    return { own: null, aclUrl, inherited: null, inheritedFrom: null };
  }

  // ── ACL parsing ───────────────────────────────────────────────────────

  function parseAcl(turtleText, baseUrl) {
    const store = rdf.graph();
    try {
      rdf.parse(turtleText, store, baseUrl, 'text/turtle');
    } catch (e) {
      return [];
    }

    const authSubjects = store
      .each(null, rdf.sym(RDF_TYPE), rdf.sym(ACL + 'Authorization'), null)
      .map(s => s.value);

    const vals = (subject, pred) =>
      store.each(rdf.sym(subject), rdf.sym(pred), null, null).map(n => n.value);

    const auths = [];
    for (const subject of new Set(authSubjects)) {
      const auth = {
        subject,
        modes:        vals(subject, ACL + 'mode'),
        agents:       vals(subject, ACL + 'agent'),
        agentClasses: vals(subject, ACL + 'agentClass'),
        agentGroups:  vals(subject, ACL + 'agentGroup'),
        accessTo:     vals(subject, ACL + 'accessTo'),
        default:      vals(subject, ACL + 'default'),
      };
      if (auth.modes.length > 0) auths.push(auth);
    }
    return auths;
  }

  function _bestRoleForModes(modes) {
    const has = m => modes.includes(ACL + m);
    if (has('Control')) return 'owner';
    if (has('Write'))   return 'editor';
    if (has('Append'))  return 'poster';
    if (has('Read'))    return 'viewer';
    return null;
  }

  function authsToRoleModel(auths) {
    const model = {};
    ROLES.forEach(r => {
      model[r.key] = { grant: 'nobody', webids: [], groups: [], applyToContents: false };
    });

    for (const auth of auths) {
      const roleKey = _bestRoleForModes(auth.modes);
      if (!roleKey) continue;
      const rm = model[roleKey];
      if (auth.agentClasses.includes(FOAF+'Agent')) rm.grant = 'public';
      else if (auth.agentClasses.includes(ACL+'AuthenticatedAgent')) {
        if (rm.grant !== 'public') rm.grant = 'authenticated';
      }
      else if (auth.agents.length > 0 || auth.agentGroups.length > 0) {
        if (rm.grant === 'nobody') rm.grant = 'specific';
        rm.webids = [...new Set([...rm.webids, ...auth.agents])];
        rm.groups = [...new Set([...rm.groups, ...auth.agentGroups])];
      }
      if (auth.default.length > 0) rm.applyToContents = true;
    }
    return model;
  }

  function roleModelToTurtle(model, resourceUrl) {
    let turtle = '@prefix acl: <http://www.w3.org/ns/auth/acl#>.\n@prefix foaf: <http://xmlns.com/foaf/0.1/>.\n\n';
    let idx = 0;
    const isContainer = resourceUrl.endsWith('/');

    for (const role of ROLES) {
      const rm = model[role.key];
      if (rm.grant === 'nobody') continue;
      idx++;
      turtle += `<#auth${idx}>\n    a acl:Authorization;\n`;
      turtle += `    acl:accessTo <${resourceUrl}>;\n`;
      if (isContainer && rm.applyToContents) turtle += `    acl:default <${resourceUrl}>;\n`;
      turtle += `    acl:mode ${role.modes.map(m => 'acl:' + m.split('#')[1]).join(', ')};\n`;

      if (rm.grant === 'public') turtle += '    acl:agentClass foaf:Agent.\n\n';
      else if (rm.grant === 'authenticated') turtle += '    acl:agentClass acl:AuthenticatedAgent.\n\n';
      else {
        const parts = [];
        rm.webids.forEach(w => parts.push(`acl:agent <${w}>`));
        rm.groups.forEach(g => parts.push(`acl:agentGroup <${g}>`));
        turtle += '    ' + parts.join(';\n    ') + '.\n\n';
      }
    }
    return turtle;
  }

  function adaptInheritedAcl(inheritedTurtle, parentUrl, resourceUrl) {
    const blocks = inheritedTurtle.split(/\n\s*\n/);
    const kept = blocks.filter(b => {
      const t = b.trim();
      if (!t) return false;
      if (/^@(prefix|base)\b/.test(t)) return true;
      return /\bacl:default\b/.test(b);
    });
    let out = kept.join('\n\n');
    const escaped = parentUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(`<${escaped}>`, 'g'), `<${resourceUrl}>`);
    return out;
  }

  // ── Component ─────────────────────────────────────────────────────────

  /**
   * Web Access Control (WAC) editor.
   *
   * Displays and edits the ACL for a Solid resource. Renders a form
   * subtab (role-based) and an RDF subtab (raw Turtle).
   *
   * @class SolWac
   * @extends HTMLElement
   * @attr {string} source - resource URL whose ACL should be loaded
   * @property {Function} fetchFn - authenticated fetch (defaults to window.fetch)
   * @fires sol-wac-save - detail: { aclUrl }; ACL saved
   * @fires sol-wac-error - detail: { phase, error }; load or save failed
   * @fires sol-status - detail: { message, type }
   */
  class SolWac extends HTMLElement {
    static get observedAttributes() { return ['source']; }

    constructor() {
      super();
      this._fetchFn = null;
      this._aclUrl = null;
      this._turtle = '';
      this._model = null;
      this._isContainer = false;
      this._inherited = null;
      this._inheritedFrom = null;
      this._rendered = false;
    }

    get source() { return this.getAttribute('source') || ''; }
    set source(v) { if (v) this.setAttribute('source', v); else this.removeAttribute('source'); }

    get fetchFn() { return this._fetchFn || (typeof fetch !== 'undefined' ? fetch.bind(globalThis) : null); }
    set fetchFn(fn) { this._fetchFn = fn; if (this._rendered) this.load(); }

    connectedCallback() {
      ensureDocStyle(this.getRootNode(), 'sol-wac-styles', CSS$1);
      if (this._rendered) return;
      this._rendered = true;
      if (this.source) this.load();
    }

    attributeChangedCallback(name, _old, _new) {
      if (name === 'source' && this._rendered) this.load();
    }

    async load() {
      const url = this.source;
      if (!url) return;
      this._isContainer = url.endsWith('/');
      this.innerHTML = '<div class="acl-banner">Loading permissions…</div>';

      let perms;
      try {
        perms = await getPermissions(url, this.fetchFn);
      } catch (e) {
        this.innerHTML = `<div class="acl-error">Failed to load ACL: ${e.message}</div>`;
        this._emit('sol-wac-error', { phase: 'load', error: e });
        return;
      }

      this._aclUrl = perms.aclUrl;
      this._inherited = perms.inherited || null;
      this._inheritedFrom = perms.inheritedFrom || null;

      if (perms.own) {
        this._turtle = perms.own;
      } else if (perms.inherited) {
        this._turtle = adaptInheritedAcl(perms.inherited, perms.inheritedFrom, url) || perms.inherited;
      } else {
        this._turtle = '';
      }

      this._model = authsToRoleModel(this._turtle ? parseAcl(this._turtle, url) : []);
      this._render();
    }

    async save() {
      if (!this._aclUrl) return;
      if (this._model) this._turtle = roleModelToTurtle(this._model, this.source);
      try {
        const resp = await this.fetchFn(this._aclUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'text/turtle' },
          body: this._turtle,
        });
        if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`);
        this._emit('sol-wac-save', { aclUrl: this._aclUrl });
        this._emit('sol-status', { message: 'ACL saved.', type: 'success' });
        this._inherited = null;
        this._inheritedFrom = null;
        this._renderBanner();
      } catch (e) {
        this._emit('sol-wac-error', { phase: 'save', error: e });
        this._emit('sol-status', { message: `ACL save failed: ${e.message}`, type: 'error' });
      }
    }

    // ── Rendering ───────────────────────────────────────────────────────

    _render() {
      this.innerHTML = '';

      this._bannerEl = document.createElement('div');
      this._renderBanner();
      this.appendChild(this._bannerEl);

      const subtabs = document.createElement('sol-tabs');
      subtabs.setAttribute('variant', 'sub');
      subtabs.tabs = [
        { name: 'Form', render: (body) => this._renderForm(body) },
        { name: 'RDF',  render: (body) => this._renderRdf(body) },
      ];
      this.appendChild(subtabs);

      // sol-tabs renders lazily; dispatch once it's ready
      queueMicrotask(() => {
        subtabs.switchTab('Form');
        const bar = subtabs.querySelector(':scope > .sol-tabs-bar');
        if (bar && !bar.querySelector('.acl-save-btn')) {
          const saveBtn = document.createElement('button');
          saveBtn.className = 'sol-btn sol-btn-sm sol-btn-primary acl-save-btn';
          saveBtn.textContent = 'Save ACL';
          saveBtn.onclick = () => this.save();
          bar.appendChild(saveBtn);
        }
      });

    }

    _renderBanner() {
      if (!this._bannerEl) return;
      if (this._inherited && this._inheritedFrom) {
        this._bannerEl.className = 'acl-banner';
        this._bannerEl.textContent =
          `Inheriting permissions from ${this._inheritedFrom}. Save to create a resource-specific ACL.`;
        this._bannerEl.style.display = '';
      } else {
        this._bannerEl.textContent = '';
        this._bannerEl.style.display = 'none';
      }
    }

    _renderForm(body) {
      body.innerHTML = '';
      body.appendChild(this._buildRoleForm(this._model, this._isContainer, () => {
        this._turtle = roleModelToTurtle(this._model, this.source);
      }));
    }

    _renderRdf(body) {
      body.innerHTML = '';
      const ta = document.createElement('textarea');
      ta.className = 'acl-rdf-editor';
      ta.spellcheck = false;
      ta.value = this._turtle;
      ta.addEventListener('input', () => {
        this._turtle = ta.value;
        // Re-parse so the form view reflects manual edits on next switch.
        try {
          this._model = authsToRoleModel(parseAcl(ta.value, this.source));
        } catch (_) { /* leave model as-is on parse error */ }
      });
      body.appendChild(ta);
    }

    _buildRoleForm(model, isContainer, onChange) {
      const wrap = document.createElement('div');
      wrap.className = 'acl-role-form';

      ROLES.forEach(role => {
        const rm = model[role.key];
        const row = document.createElement('div');
        row.className = 'acl-role-row';

        const nameEl = document.createElement('span');
        nameEl.className = 'acl-role-name';
        nameEl.textContent = role.label;

        const select = document.createElement('select');
        select.className = 'acl-grant-select';
        GRANT_OPTIONS.forEach(opt => {
          const o = document.createElement('option');
          o.value = opt.value; o.textContent = opt.label;
          select.appendChild(o);
        });
        select.value = rm.grant;

        const countBadge = document.createElement('span');
        countBadge.className = 'acl-specific-count';
        const updateCount = () => {
          const c = rm.webids.length + rm.groups.length;
          countBadge.textContent = c;
          countBadge.style.display = c > 0 ? '' : 'none';
        };
        updateCount();

        const panel = this._buildSpecificPanel(rm, onChange, updateCount);
        const showPanel = () => { panel.style.display = ''; };
        const hidePanel = () => { panel.style.display = 'none'; };
        if (rm.grant === 'specific') showPanel(); else hidePanel();

        select.addEventListener('change', () => {
          rm.grant = select.value;
          if (select.value === 'specific') showPanel(); else hidePanel();
          onChange();
        });

        row.append(nameEl, select, countBadge);
        wrap.appendChild(row);
        wrap.appendChild(panel);
      });

      if (isContainer) {
        const cbWrap = document.createElement('label');
        cbWrap.className = 'acl-default-wrap acl-default-global';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = ROLES.some(r => model[r.key].applyToContents);
        cb.onchange = () => {
          ROLES.forEach(r => { model[r.key].applyToContents = cb.checked; });
          onChange();
        };
        cbWrap.appendChild(cb);
        cbWrap.appendChild(document.createTextNode('\u00A0Apply to folder contents (acl:default)'));
        wrap.appendChild(cbWrap);
      }
      return wrap;
    }

    _buildSpecificPanel(rm, onChange, onUpdate) {
      const panel = document.createElement('div');
      panel.className = 'acl-specific-panel';
      panel.innerHTML = `
      <div class="acl-section-label">WebIDs (one per line):</div>
      <textarea class="acl-agents-input" rows="3" placeholder="https://example.solidcommunity.net/profile/card#me"></textarea>
      <div class="acl-section-label">vCard group URLs (one per line):</div>
      <textarea class="acl-agents-input" rows="2" placeholder="https://example.solidcommunity.net/contacts/Group/friends#this"></textarea>`;

      const [webidTA, groupTA] = panel.querySelectorAll('textarea');
      webidTA.value = rm.webids.join('\n');
      groupTA.value = rm.groups.join('\n');

      const sync = () => {
        rm.webids = webidTA.value.split('\n').map(s => s.trim()).filter(Boolean);
        rm.groups = groupTA.value.split('\n').map(s => s.trim()).filter(Boolean);
        onChange();
        if (onUpdate) onUpdate();
      };
      webidTA.addEventListener('input', sync);
      groupTA.addEventListener('input', sync);
      return panel;
    }

    _emit(type, detail) {
      this.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail }));
    }
  }

  define('sol-wac', SolWac);

  exports.GRANT_OPTIONS = GRANT_OPTIONS;
  exports.ROLES = ROLES;
  exports.SolWac = SolWac;
  exports.adaptInheritedAcl = adaptInheritedAcl;
  exports.authsToRoleModel = authsToRoleModel;
  exports.default = SolWac;
  exports.getAclUrl = getAclUrl;
  exports.getPermissions = getPermissions;
  exports.parseAcl = parseAcl;
  exports.roleModelToTurtle = roleModelToTurtle;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
