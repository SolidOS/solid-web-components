(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('rdflib')) :
  typeof define === 'function' && define.amd ? define(['exports', 'rdflib'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.SolForm = {}, global.$rdf));
})(this, (function (exports, _rdflib) { 'use strict';

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

  // Adopt a CSSStyleSheet into `root` (ShadowRoot or Document). When sheets
  // aren't supported, falls back to inserting a <style> with the given css.
  function adopt(root, { sheet, css, extra = [] } = {}) {
    const host = root.adoptedStyleSheets !== undefined ? root : null;
    if (host && sheet) {
      const sheets = [sheet];
      const strings = [];
      for (const e of extra) {
        if (e instanceof CSSStyleSheet) sheets.push(e);
        else if (typeof e === 'string') strings.push(e);
      }
      host.adoptedStyleSheets = [...host.adoptedStyleSheets, ...sheets];
      for (const s of strings) appendStyle(root, s);
      return;
    }
    // Fallback path: inline <style> for baseline + extras.
    if (css) appendStyle(root, css);
    for (const e of extra) {
      if (typeof e === 'string') appendStyle(root, e);
    }
  }

  function appendStyle(root, css) {
    const el = document.createElement('style');
    el.textContent = css;
    root.appendChild(el);
  }

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

  // Shared utilities that do not depend on rdflib.

  // ─── DOMPurify (lazy, cached) ─────────────────────────────────────────────────
  let _purify = null;
  async function _getDOMPurify() {
    if (_purify) return _purify;
    const win = typeof window !== 'undefined' ? window : {};
    if (win.DOMPurify?.sanitize) { _purify = win.DOMPurify; return _purify; }
    try {
      const mod = await import('dompurify');
      _purify = mod.default ?? mod;
      if (_purify?.sanitize) return _purify;
    } catch {}
    return null;
  }

  async function sanitizeHtml(html, opts = {}) {
    const p = await _getDOMPurify();
    if (p) return p.sanitize(html, opts);
    // Minimal fallback: parse + re-serialize strips scripts/events via browser parser
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.innerHTML;
  }

  // Pure RDF utility functions shared between browser (rdf-utils.js) and
  // Node (sol-query-node.js). All rdflib-dependent functions accept an
  // rdflib-like object ({ sym, literal }) as a parameter.


  // ─── Accept types & format detection ─────────────────────────────────────────
  const ACCEPT_TYPES = [
    'text/turtle',
    'application/ld+json',
    'application/rdf+xml',
    'text/n3',
    'application/n-triples',
  ];

  function detectFormat(ct, accept) {
    if (ct.includes('turtle')    || accept.includes('turtle'))    return 'text/turtle';
    if (ct.includes('ld+json')   || accept.includes('ld+json'))   return 'application/ld+json';
    if (ct.includes('rdf+xml'))                                   return 'application/rdf+xml';
    if (ct.includes('n-triples') || accept.includes('n-triples')) return 'application/n-triples';
    if (ct.includes('n3')        || accept.includes('n3'))        return 'text/n3';
    return ct || 'text/turtle';
  }

  // All RDF operations for sol-query.
  // Adapters (SPARQL execution), store loading, triple-pattern matching.


  // ─── Store loading ───────────────────────────────────────────────────────────

  async function loadRdfStore(endpoint, fetchFn = fetch, opts = {}) {
    if (!rdf.isReady()) throw new Error('rdflib not available');
    const rdflib = rdf;

    // Parsers (notably JSON-LD) require an absolute base IRI, so resolve relative
    // endpoints against the current document before handing them to rdflib.parse.
    try { endpoint = new URL(endpoint, document.baseURI).href; } catch {}

    // shared=true routes parsing into rdf.store (the singleton shared with
    // solid-logic/solid-ui/mashlib) and dedupes subsequent loads of the same
    // URL. Intended for stored-query RDF libraries where many <sol-query>
    // elements reference the same .ttl file.
    const shared = !!opts.shared;
    if (shared && rdf.isLoaded(endpoint)) return rdf.store;

    const store = shared ? rdf.store : rdflib.graph();
    const diagnostics = [];
    let lastError = null;
    const markOk = () => { if (shared) rdf.markLoaded(endpoint); };

    // Attempt each Accept type; 405 Method-Not-Allowed is fatal (wrong HTTP method),
    // everything else (including 501) just moves on to the next type.
    for (const accept of ACCEPT_TYPES) {
      try {
        const resp = await fetchFn(endpoint, { headers: { Accept: accept } });
        diagnostics.push({ accept, status: resp.status, contentType: resp.headers.get('content-type') });

        if (!resp.ok) {
          lastError = new Error(`HTTP ${resp.status}`);
          if (resp.status === 405) break;   // method not supported — no point retrying
          continue;
        }

        const text = await resp.text();
        const ct = (resp.headers.get('content-type') || '').split(';')[0].trim();
        if (ct.includes('html') || /<html/i.test(text)) {
          // Try RDFa parsing; tag store so callers know it came from HTML
          try {
            const clean = await sanitizeHtml(text, { WHOLE_DOCUMENT: true, FORCE_BODY: false });
            rdflib.parse(clean, store, endpoint, 'text/html');
            store._isHtml   = true;
            store._rawHtml  = clean;
            store._diagnostics = diagnostics;
            markOk();
            return store;
          } catch (rdfa) {
            lastError = new Error(`Server returned HTML (${ct})`);
            continue;
          }
        }

        try {
          rdflib.parse(text, store, endpoint, detectFormat(ct, accept));
          store._diagnostics = diagnostics;
          markOk();
          return store;
        } catch (parseErr) {
          lastError = parseErr;
          diagnostics.push({ accept, parseError: parseErr.message });
        }
      } catch (err) {
        diagnostics.push({ accept, error: err.message });
        lastError = err;
      }
    }

    // Last resort: no Accept header (plain fetch, let server decide content-type)
    try {
      const resp = await fetchFn(endpoint);
      if (resp.ok) {
        const text = await resp.text();
        const ct = (resp.headers.get('content-type') || '').split(';')[0].trim();
        if (ct.includes('html') || /<html/i.test(text)) {
          try {
            const clean = await sanitizeHtml(text, { WHOLE_DOCUMENT: true, FORCE_BODY: false });
            rdflib.parse(clean, store, endpoint, 'text/html');
            store._isHtml  = true;
            store._rawHtml = clean;
            store._diagnostics = diagnostics;
            markOk();
            return store;
          } catch {}
        } else {
          try {
            rdflib.parse(text, store, endpoint, detectFormat(ct, ''));
            store._diagnostics = diagnostics;
            markOk();
            return store;
          } catch (parseErr) {
            lastError = parseErr;
          }
        }
      }
    } catch (err) {
      lastError = err;
    }

    const err = lastError || new Error('Failed to load or parse RDF');
    err.diagnostics = diagnostics;
    throw err;
  }

  const CSS = `
  :host {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    font-family: var(--font-ui, system-ui, -apple-system, sans-serif);
    box-sizing: border-box;
  }

  .sol-form-loading,
  .sol-form-error {
    padding: 1em;
  }
  .sol-form-error {
    color: #c00;
    white-space: pre-wrap;
  }

  /* ── form body rendered by solid-ui ── */
  .sol-form-body {
    flex: 1;
    overflow: auto;
    padding: 0.75em;
  }
  .sol-form-body input[type="text"],
  .sol-form-body input[type="url"],
  .sol-form-body select,
  .sol-form-body textarea {
    font-family: inherit;
    font-size: 0.95em;
    padding: 4px 6px;
    border: 1px solid var(--border, #ccc);
    border-radius: 3px;
    box-sizing: border-box;
  }
  .sol-form-body input:focus,
  .sol-form-body select:focus,
  .sol-form-body textarea:focus {
    outline: 2px solid var(--accent, #3b82f6);
    outline-offset: -1px;
  }

  /* ── validation errors ── */
  .sol-form-field-error {
    color: #c00;
    font-size: 0.85em;
    margin-top: 2px;
  }
  .sol-form-validation-summary {
    background: #fef2f2;
    border: 1px solid #fca5a5;
    border-radius: 4px;
    padding: 0.5em 0.75em;
    margin-bottom: 0.75em;
    color: #991b1b;
    font-size: 0.9em;
  }
  .sol-form-validation-summary ul {
    margin: 0.25em 0 0 1.25em;
    padding: 0;
  }

  /* ── save bar ── */
  .sol-form-save-bar {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0.75em;
    border-top: 1px solid var(--border, #e0e0e0);
    background: var(--bg-muted, #f9fafb);
  }
  .sol-form-save-options {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.9em;
  }
  .sol-form-save-options label {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
  }
  .sol-form-pod-url {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .sol-form-pod-url input {
    flex: 1;
    font-family: inherit;
    font-size: 0.9em;
    padding: 4px 6px;
    border: 1px solid var(--border, #ccc);
    border-radius: 3px;
  }
  .sol-form-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .sol-form-btn {
    padding: 6px 16px;
    border: none;
    border-radius: 4px;
    font-size: 0.9em;
    cursor: pointer;
    font-family: inherit;
  }
  .sol-form-btn-primary {
    background: var(--accent, #3b82f6);
    color: #fff;
  }
  .sol-form-btn-primary:hover {
    background: var(--accent-hover, #2563eb);
  }
  .sol-form-btn-primary:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
  .sol-form-save-status {
    font-size: 0.85em;
    margin-left: 8px;
  }
  .sol-form-save-status.ok { color: #16a34a; }
  .sol-form-save-status.err { color: #c00; }
`;

  const sheet = sheetFrom(CSS);

  /**
   * <sol-form> — Generic RDF form renderer.
   *
   * Loads a ui:Form definition from a Turtle source URI and renders it using
   * solid-ui's form field system. The form's data lives in an rdflib
   * IndexedFormula; on save, the graph is written to a Solid Pod (PUT via
   * fetcher.putBack) or downloaded as a local Turtle file.
   *
   * Attributes:
   *   source   — URI of a Turtle file containing a ui:Form definition (required)
   *   subject  — URI of an existing RDF resource to edit (optional; blank = new)
   *   shape    — URI of a SHACL shapes file for validation before save (optional)
   *   save-to  — Pre-filled Pod URL for saving (optional)
   *
   * Events (bubbling, composed):
   *   sol-form-change — detail: { subject }   — fired on every field edit
   *   sol-form-save   — detail: { subject, turtle, target } — fired after save
   *
   * @class SolForm
   * @extends HTMLElement
   */


  const UI  = 'http://www.w3.org/ns/ui#';
  const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';

  const SAVE_MODE_KEY = 'sol-form-save-mode';

  class SolForm extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._store     = null;
      this._formNode  = null;
      this._subject   = null;
      this._docNode   = null;
      this._rendered  = false;
      this._shapeStore = null;
    }

    static get observedAttributes() { return ['source', 'subject', 'shape', 'save-to']; }

    attributeChangedCallback(name, oldVal, newVal) {
      if (oldVal === newVal) return;
      if (name === 'source' && this._rendered) this._load();
    }

    connectedCallback() {
      if (this._rendered) return;
      this._initShell();
      this._load();
    }

    // ── public API ──

    get store()   { return this._store; }
    get subject() { return this._subject; }

    getTurtle() {
      if (!this._store || !this._docNode) return '';
      return rdf.serialize(this._docNode, this._store, this._docNode.value, 'text/turtle') || '';
    }

    // ── shell ──

    _initShell() {
      const root = this.shadowRoot;
      root.innerHTML = `
      <div class="sol-form-body"></div>
      <div class="sol-form-save-bar">
        <div class="sol-form-validation-summary" style="display:none"></div>
        <div class="sol-form-save-options">
          <label><input type="radio" name="save-mode" value="pod"> Save to Pod</label>
          <label><input type="radio" name="save-mode" value="local"> Download locally</label>
        </div>
        <div class="sol-form-pod-url" style="display:none">
          <input type="url" placeholder="https://you.pod/path/menu.ttl" class="sol-form-pod-input">
        </div>
        <div class="sol-form-actions">
          <button class="sol-form-btn sol-form-btn-primary sol-form-save-btn">Save</button>
          <span class="sol-form-save-status"></span>
        </div>
      </div>`;
      adopt(root, { sheet: sheet, css: CSS });
      this._rendered = true;

      const savedMode = localStorage.getItem(SAVE_MODE_KEY) || 'local';
      const radios = root.querySelectorAll('input[name="save-mode"]');
      radios.forEach(r => {
        r.checked = r.value === savedMode;
        r.addEventListener('change', () => this._onModeChange());
      });
      this._onModeChange();

      const saveTo = this.getAttribute('save-to');
      if (saveTo) root.querySelector('.sol-form-pod-input').value = saveTo;

      root.querySelector('.sol-form-save-btn').addEventListener('click', () => this._onSave());
    }

    _onModeChange() {
      const root = this.shadowRoot;
      const mode = this._saveMode();
      localStorage.setItem(SAVE_MODE_KEY, mode);
      root.querySelector('.sol-form-pod-url').style.display = mode === 'pod' ? 'flex' : 'none';
      const btn = root.querySelector('.sol-form-save-btn');
      btn.textContent = mode === 'pod' ? 'Save to Pod' : 'Download';
    }

    _saveMode() {
      const checked = this.shadowRoot.querySelector('input[name="save-mode"]:checked');
      return checked ? checked.value : 'local';
    }

    // ── loading ──

    async _load() {
      const source = this.getAttribute('source');
      if (!source) return;

      const body = this.shadowRoot.querySelector('.sol-form-body');
      body.innerHTML = '<div class="sol-form-loading">Loading form…</div>';
      this._clearStatus();
      this._hideValidation();

      try {
        const formStore = await loadRdfStore(source);
        const formRoot = this._findForm(formStore, source);
        if (!formRoot) throw new Error('No ui:Form found in ' + source);

        const subjectUri = this.getAttribute('subject');
        let dataStore, subjectNode, docNode;

        if (subjectUri) {
          const docUrl = subjectUri.split('#')[0];
          dataStore = await this._initStore(docUrl);
          await dataStore.fetcher.load(docUrl);
          subjectNode = rdf.sym(subjectUri);
          docNode = rdf.sym(docUrl);
        } else {
          const baseDoc = new URL('_new.ttl', new URL(source, document.baseURI)).href;
          dataStore = this._initStore(baseDoc);
          docNode = rdf.sym(baseDoc);
          subjectNode = rdf.blankNode();
        }

        this._store    = dataStore;
        this._formNode = formRoot;
        this._subject  = subjectNode;
        this._docNode  = docNode;

        this._mergeFormDefs(dataStore, formStore);
        this._renderForm(body, dataStore, subjectNode, formRoot, docNode);

        if (this.getAttribute('shape')) {
          this._loadShape(this.getAttribute('shape'));
        }

      } catch (err) {
        body.innerHTML = `<div class="sol-form-error">${err.message}</div>`;
        console.error('<sol-form> load failed:', err);
      }
    }

    _findForm(store, sourceUri) {
      const formType = rdf.sym(UI + 'Form');
      const typeP    = rdf.sym(RDF + 'type');

      const docUrl = sourceUri.split('#')[0];
      const fragment = sourceUri.includes('#') ? sourceUri.split('#')[1] : null;
      if (fragment) {
        const candidate = rdf.sym(docUrl + '#' + fragment);
        if (store.holds(candidate, typeP, formType)) return candidate;
      }

      const forms = store.each(null, typeP, formType);
      return forms[0] || null;
    }

    _initStore(docUrl) {
      const store = rdf.graph();
      const fetcher = new (rdf.Fetcher)(store);
      store.fetcher = fetcher;
      const updater = new (rdf.UpdateManager)(store);
      store.updater = updater;

      // Mark the doc as editable locally so solid-ui fields are not read-only
      updater.editable = (uri) => {
        if (typeof uri === 'object') uri = uri.value || uri.uri;
        return true;
      };

      return store;
    }

    _mergeFormDefs(dataStore, formStore) {
      const stmts = formStore.statements || formStore.match(null, null, null) || [];
      for (const st of stmts) {
        if (!dataStore.holds(st.subject, st.predicate, st.object, st.why)) {
          dataStore.add(st.subject, st.predicate, st.object, st.why);
        }
      }
    }

    // ── render via solid-ui ──

    _renderForm(body, store, subject, form, doc) {
      body.innerHTML = '';

      // solid-ui's field system reads from the global solidLogicSingleton.store.
      // We need to make our store accessible. The field functions are keyed by
      // URI in the `field` registry object exported from solid-ui.
      // We render the form using solid-ui's Form/Group field function.
      const fieldRegistry = this._getFieldRegistry();
      if (!fieldRegistry) {
        this._renderFallback(body, store, subject, form, doc);
        return;
      }

      const formUri = UI + 'Form';
      const formFn = fieldRegistry[formUri];
      if (!formFn) {
        this._renderFallback(body, store, subject, form, doc);
        return;
      }

      // solid-ui reads from solidLogicSingleton.store — temporarily point it at ours
      const origStore = this._swapSolidLogicStore(store);
      try {
        const widget = formFn(document, body, {}, subject, form, doc, (ok, msg) => {
          this.dispatchEvent(new CustomEvent('sol-form-change', {
            bubbles: true, composed: true,
            detail: { subject: this._subject, ok, message: msg },
          }));
        });
        if (widget && !body.contains(widget)) body.appendChild(widget);
      } finally {
        this._restoreSolidLogicStore(origStore);
      }
    }

    _getFieldRegistry() {
      // solid-ui registers field functions on the `field` export from fieldFunction.
      // Try multiple paths: global solid-ui, window.UI, direct import.
      try {
        if (window.UI?.widgets?.forms?.fieldFunction?.field) {
          return window.UI.widgets.forms.fieldFunction.field;
        }
        if (window.panes?.fieldFunction?.field) {
          return window.panes.fieldFunction.field;
        }
        // solid-ui ESM bundle exposes field registry on the main export
        if (window.SolidUI?.field) return window.SolidUI.field;
      } catch {}
      return null;
    }

    _swapSolidLogicStore(store) {
      const win = typeof window !== 'undefined' ? window : {};
      const orig = win.SolidLogic?.store || null;
      if (win.SolidLogic) {
        win.SolidLogic.store = store;
      } else {
        win.SolidLogic = { store, fetcher: store.fetcher };
      }
      // solid-ui's solidLogicSingleton caches store in a module-level variable;
      // also set on commonly-used paths
      if (win.UI) win.UI.store = store;
      return orig;
    }

    _restoreSolidLogicStore(orig) {
      const win = typeof window !== 'undefined' ? window : {};
      if (orig) {
        if (win.SolidLogic) win.SolidLogic.store = orig;
        if (win.UI) win.UI.store = orig;
      }
    }

    // Fallback when solid-ui is not loaded: render basic HTML inputs from the
    // form definition. Reads ui:parts, ui:property, ui:label, field types.
    _renderFallback(body, store, subject, form, doc) {
      body.innerHTML = '';
      const formDoc = form.doc ? form.doc() : null;
      const uiParts = rdf.sym(UI + 'parts');
      const uiPart  = rdf.sym(UI + 'part');
      const uiProp  = rdf.sym(UI + 'property');
      const uiLabel = rdf.sym(UI + 'label');
      const uiRequired = rdf.sym(UI + 'required');

      const partsNode = store.any(form, uiParts, null, formDoc);
      let fields;
      if (partsNode && partsNode.elements) {
        fields = partsNode.elements;
      } else {
        fields = store.each(form, uiPart, null, formDoc);
      }
      if (!fields || !fields.length) {
        body.textContent = 'No fields defined in form.';
        return;
      }

      const wrapper = document.createElement('div');
      wrapper.style.display = 'flex';
      wrapper.style.flexDirection = 'column';
      wrapper.style.gap = '12px';

      for (const field of fields) {
        const label = (store.anyValue(field, uiLabel, null, formDoc) || '').toString();
        const property = store.any(field, uiProp, null, formDoc);
        const required = store.anyValue(field, uiRequired, null, formDoc);

        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.flexDirection = 'column';
        row.style.gap = '2px';

        const lbl = document.createElement('label');
        lbl.textContent = label + (required === 'true' ? ' *' : '');
        lbl.style.fontWeight = '500';
        lbl.style.fontSize = '0.9em';
        row.appendChild(lbl);

        const typeUri = this._fieldType(store, field);
        let input;

        if (typeUri === UI + 'MultiLineTextField' || typeUri === UI + 'TextArea') {
          input = document.createElement('textarea');
          input.rows = 4;
        } else if (typeUri === UI + 'Choice') {
          input = document.createElement('select');
          const opts = store.each(field, rdf.sym(UI + 'option'), null, formDoc);
          for (const opt of opts) {
            const o = document.createElement('option');
            o.value = opt.value;
            o.textContent = opt.value;
            input.appendChild(o);
          }
        } else if (typeUri === UI + 'EmailField') {
          input = document.createElement('input');
          input.type = 'email';
        } else {
          input = document.createElement('input');
          input.type = 'text';
        }

        if (property) {
          const existing = store.anyValue(subject, property, null, doc);
          if (existing) input.value = existing;

          input.addEventListener('change', () => {
            const old = store.statementsMatching(subject, property, null, doc);
            const val = input.value.trim();
            const ins = val ? [new (rdf.Statement)(subject, property, rdf.literal(val), doc)] : [];
            if (store.updater) {
              store.updater.update(old, ins, (_uri, ok, errMsg) => {
                if (!ok) console.error('sol-form update failed:', errMsg);
                this.dispatchEvent(new CustomEvent('sol-form-change', {
                  bubbles: true, composed: true,
                  detail: { subject: this._subject, ok, message: errMsg },
                }));
              });
            } else {
              old.forEach(s => store.remove(s));
              ins.forEach(s => store.add(s.subject, s.predicate, s.object, s.why));
              this.dispatchEvent(new CustomEvent('sol-form-change', {
                bubbles: true, composed: true,
                detail: { subject: this._subject, ok: true },
              }));
            }
          });
        }

        row.appendChild(input);
        wrapper.appendChild(row);
      }

      body.appendChild(wrapper);
    }

    _fieldType(store, field) {
      const typeP = rdf.sym(RDF + 'type');
      const types = store.each(field, typeP);
      for (const t of types) {
        if (t.value && t.value.startsWith(UI)) return t.value;
      }
      return UI + 'SingleLineTextField';
    }

    // ── SHACL validation ──

    async _loadShape(shapeUri) {
      try {
        const resp = await fetch(new URL(shapeUri, document.baseURI).href);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        this._shapeText = await resp.text();
      } catch (err) {
        console.warn('<sol-form> could not load shape:', err);
        this._shapeText = null;
      }
    }

    async _validate() {
      if (!this._shapeText) return { conforms: true, results: [] };

      try {
        const { Parser, Store } = await import('n3');
        const SHACLValidator = (await import('rdf-validate-shacl')).default;

        const parseToStore = (text, baseIRI) => {
          const parser = new Parser({ baseIRI });
          const store = new Store();
          store.addQuads(parser.parse(text));
          return store;
        };

        const turtle = this.getTurtle();
        if (!turtle) return { conforms: false, results: [{ message: 'No data to validate' }] };

        const shapesStore = parseToStore(this._shapeText, this.getAttribute('shape') || '');
        const dataStore   = parseToStore(turtle, this._docNode?.value || '');

        const validator = new SHACLValidator(shapesStore);
        const report = validator.validate(dataStore);
        return report;
      } catch (err) {
        console.warn('<sol-form> SHACL validation failed:', err);
        return { conforms: true, results: [] };
      }
    }

    _showValidation(report) {
      const el = this.shadowRoot.querySelector('.sol-form-validation-summary');
      if (!report || report.conforms) {
        el.style.display = 'none';
        return;
      }
      const results = Array.from(report.results || []);
      const msgs = results.map(r => {
        const path = r.path ? r.path.value.replace(/.*[/#]/, '') : '';
        const msg = (Array.isArray(r.message) ? r.message[0]?.value : r.message?.value) || 'Validation error';
        return path ? `${path}: ${msg}` : msg;
      });
      el.innerHTML = `<strong>Validation errors:</strong><ul>${msgs.map(m => `<li>${this._esc(m)}</li>`).join('')}</ul>`;
      el.style.display = 'block';
    }

    _hideValidation() {
      const el = this.shadowRoot.querySelector('.sol-form-validation-summary');
      if (el) el.style.display = 'none';
    }

    _esc(s) {
      const d = document.createElement('div');
      d.textContent = s;
      return d.innerHTML;
    }

    // ── save ──

    async _onSave() {
      const btn = this.shadowRoot.querySelector('.sol-form-save-btn');
      btn.disabled = true;
      this._clearStatus();

      try {
        if (this._shapeText) {
          const report = await this._validate();
          this._showValidation(report);
          if (!report.conforms) {
            btn.disabled = false;
            return;
          }
        }

        const mode = this._saveMode();
        if (mode === 'pod') {
          await this._saveToPod();
        } else {
          this._saveLocal();
        }
      } catch (err) {
        this._setStatus('err', err.message);
      } finally {
        btn.disabled = false;
      }
    }

    async _saveToPod() {
      const urlInput = this.shadowRoot.querySelector('.sol-form-pod-input');
      const podUrl = (urlInput?.value || '').trim();
      if (!podUrl) throw new Error('Enter a Pod URL');

      const turtle = this.getTurtle();
      if (!turtle) throw new Error('Nothing to save');

      rdf.sym(podUrl);

      // Use fetcher.webOperation for PUT (same as putBack but to arbitrary URL)
      const fetcher = this._store.fetcher || rdf.storeFetcher;
      const resp = await fetcher.webOperation('PUT', podUrl, {
        contentType: 'text/turtle',
        body: turtle,
      });

      if (!resp.ok) throw new Error(`PUT failed: HTTP ${resp.status}`);

      this._setStatus('ok', 'Saved to Pod');
      this.dispatchEvent(new CustomEvent('sol-form-save', {
        bubbles: true, composed: true,
        detail: { subject: this._subject, turtle, target: podUrl },
      }));
    }

    _saveLocal() {
      const turtle = this.getTurtle();
      if (!turtle) throw new Error('Nothing to save');

      const label = this._store.anyValue(this._subject, rdf.sym(UI + 'label')) || 'form-data';
      const filename = label.replace(/[^a-z0-9_-]/gi, '-').toLowerCase() + '.ttl';

      const blob = new Blob([turtle], { type: 'text/turtle' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      this._setStatus('ok', 'Downloaded ' + filename);
      this.dispatchEvent(new CustomEvent('sol-form-save', {
        bubbles: true, composed: true,
        detail: { subject: this._subject, turtle, target: 'local' },
      }));
    }

    _setStatus(cls, msg) {
      const el = this.shadowRoot.querySelector('.sol-form-save-status');
      el.className = 'sol-form-save-status ' + cls;
      el.textContent = msg;
    }

    _clearStatus() {
      const el = this.shadowRoot.querySelector('.sol-form-save-status');
      if (el) { el.className = 'sol-form-save-status'; el.textContent = ''; }
    }
  }

  define('sol-form', SolForm);

  exports.SolForm = SolForm;
  exports.default = SolForm;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
