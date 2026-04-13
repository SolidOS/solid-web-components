import {
  fetchQueryFromRdf,
  loadRdfStore,
  matchStore,
  parseWantedParts,
  storeToResults,
  expandBnodes,
  getRdflib,
  runQuery,
  execSparql,
  queryHtmlWithSelector,
} from './shared/rdf-utils.js';
import { SparqlResultsRenderer, getDefaultStyles } from './utils/sol-query-ui.js';
import { MiniQueryValidator } from './utils/sol-query-mini.js';

class SolQuery extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
  }

  static get observedAttributes() {
    return ['endpoint', 'wanted', 'sparql', 'query', 'view'];
  }

  connectedCallback() {
    if (this.isConnected) this.initializeQuery();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this.isConnected) {
      if (['endpoint', 'wanted', 'sparql', 'query'].includes(name) || name.startsWith('var-')) {
        this.initializeQuery();
      }
    }
  }

  // `query` is accepted as an alias for `sparql` so authors can write either.
  _sparqlAttr() {
    return this.getAttribute('sparql') ?? this.getAttribute('query');
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>${getDefaultStyles()}</style>
      <div class="container" role="region" aria-live="polite" aria-label="Query results">
        <div class="loading">Ready to execute query...</div>
      </div>
    `;
    const container = this.shadowRoot.querySelector('.container');
    this.renderer = new SparqlResultsRenderer(container);

    // ── Dereference: click a URI cell to load it as a new query (13) ──────────
    // Ctrl/Cmd/Shift+click still opens the link in a new tab normally.
    container.addEventListener('click', e => {
      const a = e.target.closest('a[data-uri]');
      if (!a || e.ctrlKey || e.metaKey || e.shiftKey) return;
      e.preventDefault();
      const uri = a.dataset.uri;
      const ev = new CustomEvent('sol-deref', {
        bubbles: true, composed: true, cancelable: true, detail: { uri },
      });
      if (this.dispatchEvent(ev)) {
        // Default behaviour: load URI, drop any sparql/wanted filter
        this.removeAttribute('sparql');
        this.removeAttribute('wanted');
        this.setAttribute('endpoint', uri);
      }
    });
  }

  async initializeQuery() {
    const endpoint = this.getAttribute('endpoint');
    if (!endpoint) { this.renderer.showError('No endpoint provided'); return; }

    if (this.hasAttribute('sparql') || this.hasAttribute('query')) {
      await this.handleSparqlQuery();
    } else if (this.hasAttribute('wanted')) {
      await this.handleMiniQuery();
    } else {
      await this.handleDefaultQuery();
    }
  }

  // ─── SPARQL query (inline text or URL pointing to RDF file) ────────────────
  async handleSparqlQuery() {
    const sparqlAttr = this._sparqlAttr();
    // A stored-query reference is a bare URL: no whitespace, starts with http(s):// or a path.
    // Everything else — including all valid SPARQL text — is treated as inline.
    const isStoredRef = !/\s/.test(sparqlAttr) && /^https?:\/\/|^\/|^\.\.?\//.test(sparqlAttr.trim());
    if (!isStoredRef) {
      this.executeQuery(sparqlAttr);
    } else {
      this.renderer.showLoading('Loading query from RDF file...');
      try {
        const query = await fetchQueryFromRdf(sparqlAttr);
        if (query) {
          try { SolQuery._assertSafeQuery(query); } catch (err) { this.renderer.showError(err.message); return; }
          this.executeQuery(query);
        } else this.renderer.showError('No query found in RDF file');
      } catch (err) {
        this.renderer.showError(`Failed to load query: ${err.message}`);
      }
    }
  }

  // ─── Mini-query / CSS selector ───────────────────────────────────────────────
  async handleMiniQuery() {
    const wanted   = this.getAttribute('wanted');
    const endpoint = this.getAttribute('endpoint');

    this.renderer.showLoading('Loading…');
    try {
      const store = await loadRdfStore(endpoint);

      // HTML endpoint: if wanted isn't a valid mini-query, treat as CSS selector
      if (store._isHtml) {
        const validation = MiniQueryValidator.validate(wanted);
        if (!validation.valid) {
          const results = queryHtmlWithSelector(store._rawHtml, endpoint, wanted);
          if (!results.results.length) { this.renderer.showError('No elements matched selector'); return; }
          return this._dispatchResults(results);
        }
      } else {
        const validation = MiniQueryValidator.validate(wanted);
        if (!validation.valid) { this.renderer.showError(validation.error); return; }
      }

      const rdflib = await getRdflib();
      const [s, p, o] = parseWantedParts(wanted, rdflib, {}, endpoint);
      const results = expandBnodes(store, matchStore(store, s, p, o));
      if (!results.results.length) { this.renderer.showError('No matching triples found'); return; }
      this._dispatchResults(results);
    } catch (err) {
      this.renderer.showError(err.message);
    }
  }

  // ─── Default: load store; if endpoint has a #fragment filter to that subject ──
  async handleDefaultQuery() {
    const endpoint = this.getAttribute('endpoint');
    this.renderer.showLoading('Loading RDF data…');
    try {
      const docUrl = endpoint.includes('#') ? endpoint.split('#')[0] : endpoint;
      const store   = await loadRdfStore(docUrl);
      let results;
      const isSubjectQuery = endpoint.includes('#');
      if (isSubjectQuery) {
        const rdflib = await getRdflib();
        results = matchStore(store, rdflib.sym(endpoint), null, null);
      } else {
        results = storeToResults(store);
      }
      results = expandBnodes(store, results);
      if (!results.results.length) {
        this.renderer.showError(store._isHtml ? 'No RDFa found in HTML page' : 'No RDF data found at endpoint');
        return;
      }
      this._dispatchResults(results, isSubjectQuery ? { hideHeader: true } : {});
    } catch (err) {
      this.showDiagnostics(err);
    }
  }

  // ─── Dispatch results through built-in renderer or custom view module ──────
  async _dispatchResults(results, options = {}) {
    const view = this.getAttribute('view') || 'table';

    // Custom view by URL: dynamic import, call render(container, data)
    if (/^https?:\/\/|^\.\/|^\.\.\/|^\//.test(view)) {
      await this._loadAndRenderView(view, results, /* byUrl */ true);
      return;
    }

    // Legacy built-in views live inside the renderer class.
    if (view === 'table' || view === 'dl' || view === 'list') {
//    if (view === 'table' || view === 'list') {
      this.renderer.renderResults(results, view, options);
      return;
    }

    // Built-in view module under ./views/<name>.js next to this file.
    const builtinUrl = new URL(`./views/${view}.js`, import.meta.url).href;
    await this._loadAndRenderView(builtinUrl, results, /* byUrl */ false, view);
  }

  async _loadAndRenderView(url, results, byUrl, viewName = null) {
    const container = this.shadowRoot.querySelector('.container');
    container.innerHTML = '<div class="loading">Loading view…</div>';
    try {
      const mod = await import(/* @vite-ignore */ url);
      let fn  = mod.render ?? mod.default;
      if (typeof fn !== 'function')
        throw new Error(`Module must export render(container, data)`);
      container.innerHTML = '';
      fn(container, results, this);
    } catch (err) {
      const label = byUrl ? 'Custom view' : `View "${viewName}"`;
      this.renderer.showError(`${label} error: ${err.message}`);
    }
  }

  // ─── SPARQL safety ────────────────────────────────────────────────────────
  // Rejects queries containing destructive/modifying SPARQL keywords.
  static _assertSafeQuery(query) {
    const m = query.match(/\b(INSERT\s+DATA|INSERT\s+INTO|DELETE\s+DATA|DELETE\s+WHERE|DELETE\s+FROM|DROP|CREATE|CLEAR|LOAD|COPY|MOVE|ADD)\b/i);
    if (m) throw new Error(`Blocked SPARQL operation: ${m[0].toUpperCase()}`);
  }

  // ─── SPARQL execution (with adapter fallback chain) ────────────────────────
  getVariables() {
    const vars = {};
    for (const attr of this.attributes) {
      if (attr.name.startsWith('var-')) vars[attr.name.slice(4)] = attr.value;
    }
    return vars;
  }

  // Sanitize a single variable value to prevent SPARQL injection.
  // Blocks structural characters and escapes string-context special chars.
  static _sanitizeVarValue(value) {
    if (/[{}]/.test(value))
      throw new Error(`Variable value contains disallowed characters: { }`);
    if (/\b(INSERT|DELETE|DROP|CREATE|CLEAR|LOAD|COPY|MOVE|ADD)\b/i.test(value))
      throw new Error(`Variable value contains blocked keyword`);
    // Escape backslash then quotes to prevent string-literal breakout
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/'/g, "\\'");
  }

  substituteVariables(query) {
    let q = query;
    for (const [key, value] of Object.entries(this.getVariables())) {
      const safe = SolQuery._sanitizeVarValue(value);
      q = q.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), safe);
    }
    return q;
  }

  async executeQuery(query) {
    if (!query) { this.renderer.showError('No query provided'); return; }
    let processed;
    try {
      processed = this.substituteVariables(query);
      SolQuery._assertSafeQuery(processed);
    } catch (err) {
      this.renderer.showError(err.message);
      return;
    }
    const endpoint = this.getAttribute('endpoint');
    if (!endpoint) { this.renderer.showError('No endpoint provided'); return; }
    this.renderer.showLoading();
    try {
      const results = await this.fetchResults(processed, endpoint);
      await this._dispatchResults(results);
    } catch (err) {
      this.renderer.showError(`Error: ${err.message}`);
    }
  }

  fetchResults(query, endpoint) {
    return execSparql(query, endpoint);
  }

  // ─── Instance API ──────────────────────────────────────────────────────────
  setEndpoint(endpoint)  { this.setAttribute('endpoint', endpoint); }
  setWanted(miniQuery)   { this.setAttribute('wanted', miniQuery); }
  setSparql(sparql)      { this.setAttribute('sparql', sparql); }
  setVariable(n, v)      { this.setAttribute(`var-${n}`, v); }
  setVariables(obj)      { for (const [k, v] of Object.entries(obj)) this.setVariable(k, v); }

  // ─── Static API ────────────────────────────────────────────────────────────
  // Returns a plain JS array of objects, or a scalar for 1×1 results.
  // Example:
  //   const rows = await SolQuery.run({ endpoint, wanted: '? foaf:name ?' });
  //   const name = await SolQuery.run({ endpoint, sparql: 'SELECT ?n WHERE{...}', vars: ['n'] });
  static run(opts) { return runQuery(opts); }

  // ─── Diagnostics ───────────────────────────────────────────────────────────
  showDiagnostics(err) {
    this.renderer.showError(`Failed to load RDF: ${err.message}`);
  }
}

customElements.define('sol-query', SolQuery);
export { SolQuery };
