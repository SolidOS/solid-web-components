(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('rdflib')) :
  typeof define === 'function' && define.amd ? define(['exports', 'rdflib'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.SolQuery = {}, global.$rdf));
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

  // ─── CSS selector query over an HTML document ────────────────────────────────
  // `html` is already sanitized. Returns {vars, results} suitable for the renderer.
  function queryHtmlWithSelector(html, baseUrl, selector) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('base').forEach(b => b.remove()); // drop any existing <base>
    const base = doc.createElement('base');
    base.href = baseUrl;
    doc.head.appendChild(base);

    const els = Array.from(doc.querySelectorAll(selector));
    if (!els.length) return { vars: ['text'], results: [] };

    const hasHref = els.some(el => el.href || el.getAttribute('href'));
    const hasSrc  = els.some(el => el.src  || el.getAttribute('src'));
    const vars = ['tag', 'text'];
    if (hasHref) vars.push('href');
    if (hasSrc)  vars.push('src');

    const results = els.map(el => {
      const row = {
        tag:  { type: 'literal', value: el.tagName.toLowerCase() },
        text: { type: 'literal', value: el.textContent.trim() },
      };
      if (hasHref) {
        const v = el.href || el.getAttribute('href') || '';
        row.href = v ? { type: 'uri', value: el.href || v } : { type: 'literal', value: '' };
      }
      if (hasSrc) {
        const v = el.src || el.getAttribute('src') || '';
        row.src = v ? { type: 'uri', value: el.src || v } : { type: 'literal', value: '' };
      }
      return row;
    });

    return { vars, results };
  }

  // ─── Plain results transformation ────────────────────────────────────────────
  // Converts renderer-format data ({vars, results}) to plain JS objects/scalars.
  function toPlainResults(data, wantedVars) {
    const cols = wantedVars ? data.vars.filter(v => wantedVars.includes(v)) : data.vars;
    if (!data.results.length) return [];
    // 1 row × 1 column → return scalar value directly
    if (cols.length === 1 && data.results.length === 1) {
      const cell = data.results[0][cols[0]];
      return cell ? cell.value : null;
    }
    return data.results.map(row => {
      const obj = {};
      for (const col of cols) {
        const cell = row[col];
        obj[col] = cell ? cell.value : null;
      }
      return obj;
    });
  }

  // ─── SPARQL adapters (non-rdflib) ────────────────────────────────────────────

  // Extract the projected variable names from a SPARQL SELECT clause, preserving
  // author order. Returns null for `SELECT *` or non-SELECT queries — callers
  // should fall back to whatever order the engine produced.
  function parseSelectVars(queryText) {
    const stripped = queryText.replace(/#[^\n]*/g, '');
    const m = stripped.match(/\bSELECT\s+(?:DISTINCT\s+|REDUCED\s+)?(.*?)\s+WHERE\b/is);
    if (!m) return null;
    const clause = m[1].trim();
    if (clause === '*') return null;
    const vars = clause.match(/\?(\w+)/g);
    return vars ? vars.map(v => v.slice(1)) : null;
  }

  class ComunicaSparqlAdapter {
    constructor(engineFactory) {
      this.engineFactory = engineFactory;
    }

    static getComunicaEngine() {
      if (typeof newEngine === 'function') return newEngine;
      if (window.newEngine && typeof window.newEngine === 'function') return window.newEngine;
      if (window.Comunica?.QueryEngine) return () => new window.Comunica.QueryEngine();
      if (window.Comunica?.newEngine) return window.Comunica.newEngine;
      return null;
    }

    async executeQuery(query, endpoint) {
      const engine = await this.engineFactory();
      const stream = await engine.queryBindings(query, { sources: [endpoint], lenient: true });
      const bindings = await stream.toArray();
      if (!bindings.length) return { vars: [], results: [] };

      // Prefer the explicit SELECT order from the query text; fall back to the
      // engine's binding order for SELECT * / non-SELECT.
      const selectVars = parseSelectVars(query);
      const vars = selectVars ?? Array.from(bindings[0].keys()).map(v => v.value);

      const results = bindings.map(binding => {
        const row = {};
        vars.forEach(v => {
          const term = binding.get(v);
          row[v] = term
            ? { type: (term.termType === 'NamedNode' || term.uri) ? 'uri' : 'literal', value: term.value || term.uri || String(term) }
            : { type: 'literal', value: '' };
        });
        return row;
      });
      return { vars, results };
    }
  }

  class NativeSparqlAdapter {
    async executeQuery(query, endpoint, fetchFn = fetch) {
      const params = new URLSearchParams({ query, format: 'json' });
      const resp = await fetchFn(`${endpoint}?${params}`, {
        headers: { Accept: 'application/sparql-results+json' },
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const data = await resp.json();
      const vars = data.head.vars;
      const results = data.results.bindings.map(binding => {
        const row = {};
        vars.forEach(v => {
          row[v] = binding[v]
            ? { type: binding[v].type, value: binding[v].value }
            : { type: 'literal', value: '' };
        });
        return row;
      });
      return { vars, results };
    }
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

  // Pure RDF utility functions shared between browser (rdf-utils.js) and
  // Node (sol-query-node.js). All rdflib-dependent functions accept an
  // rdflib-like object ({ sym, literal }) as a parameter.

  // ─── Namespace prefixes ──────────────────────────────────────────────────────
  const KNOWN_PREFIXES = {
    acl: 'http://www.w3.org/ns/auth/acl#',
    arg: 'http://www.w3.org/ns/pim/arg#',
    as: 'https://www.w3.org/ns/activitystreams#',
    bookmark: 'http://www.w3.org/2002/01/bookmark#',
    cal: 'http://www.w3.org/2002/12/cal/ical#',
    cco: 'http://www.ontologyrepository.com/CommonCoreOntologies/',
    cert: 'http://www.w3.org/ns/auth/cert#',
    contact: 'http://www.w3.org/2000/10/swap/pim/contact#',
    dc: 'http://purl.org/dc/elements/1.1/',
    dct: 'http://purl.org/dc/terms/',
    doap: 'http://usefulinc.com/ns/doap#',
    foaf: 'http://xmlns.com/foaf/0.1/',
    geo: 'http://www.w3.org/2003/01/geo/wgs84_pos#',
    gpx: 'http://www.w3.org/ns/pim/gpx#',
    gr: 'http://purl.org/goodrelations/v1#',
    http: 'http://www.w3.org/2007/ont/http#',
    httph: 'http://www.w3.org/2007/ont/httph#',
    icalTZ: 'http://www.w3.org/2002/12/cal/icaltzd#',
    ldp: 'http://www.w3.org/ns/ldp#',
    link: 'http://www.w3.org/2007/ont/link#',
    log: 'http://www.w3.org/2000/10/swap/log#',
    meeting: 'http://www.w3.org/ns/pim/meeting#',
    mo: 'http://purl.org/ontology/mo/',
    org: 'http://www.w3.org/ns/org#',
    owl: 'http://www.w3.org/2002/07/owl#',
    pad: 'http://www.w3.org/ns/pim/pad#',
    patch: 'http://www.w3.org/ns/pim/patch#',
    prov: 'http://www.w3.org/ns/prov#',
    pto: 'http://www.productontology.org/id/',
    qu: 'http://www.w3.org/2000/10/swap/pim/qif#',
    trip: 'http://www.w3.org/ns/pim/trip#',
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    rss: 'http://purl.org/rss/1.0/',
    sched: 'http://www.w3.org/ns/pim/schedule#',
    schema: 'http://schema.org/',
    sioc: 'http://rdfs.org/sioc/ns#',
    skos: 'http://www.w3.org/2004/02/skos/core#',
    solid: 'http://www.w3.org/ns/solid/terms#',
    space: 'http://www.w3.org/ns/pim/space#',
    stat: 'http://www.w3.org/ns/posix/stat#',
    ui: 'http://www.w3.org/ns/ui#',
    vann: 'http://purl.org/vocab/vann/',
    vcard: 'http://www.w3.org/2006/vcard/ns#',
    wf: 'http://www.w3.org/2005/01/wf/flow#',
    xsd: 'http://www.w3.org/2001/XMLSchema#',
  };

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

  function termToCell(term) {
    if (!term) return { type: 'literal', value: '' };
    if (term.termType === 'NamedNode')  return { type: 'uri',   value: term.value };
    if (term.termType === 'BlankNode')  return { type: 'bnode', value: term.value, _term: term };
    return { type: 'literal', value: term.value ?? String(term) };
  }

  // ─── CURIE expansion ─────────────────────────────────────────────────────────
  function expandCurie(curie, extraPrefixes = {}) {
    const colon = curie.indexOf(':');
    if (colon < 0) return null;
    const prefix = curie.slice(0, colon);
    const local  = curie.slice(colon + 1);
    const ns = extraPrefixes[prefix] || KNOWN_PREFIXES[prefix];
    return ns ? ns + local : null;
  }

  function _isCurie$1(token) {
    return /^[a-zA-Z][a-zA-Z0-9]*:[^/\s]/.test(token);
  }

  function _resolveUri(raw, baseUri) {
    if (!baseUri) return raw;
    const docBase = baseUri.split('#')[0];
    if (raw.startsWith('#'))  return docBase + raw;
    try { return new URL(raw, baseUri).href; } catch { return raw; }
  }

  const _NAMED_VAR_RE = /^\?[A-Za-z_][A-Za-z0-9_]*$/;

  // ─── Triple-pattern term parser ──────────────────────────────────────────────
  // rdflib: object with sym(uri) and literal(value, langOrType) methods.
  function triplePatternTermToNode(term, rdflib, extraPrefixes = {}, baseUri = '') {
    if (!term) throw new Error('Triple-pattern term is empty');
    if (term === '?') {
      throw new Error('Bare "?" is not allowed — use a named variable like "?x"');
    }
    if (term.startsWith('?')) {
      if (!_NAMED_VAR_RE.test(term)) {
        throw new Error(`Invalid variable "${term}" — must match ?[A-Za-z_][A-Za-z0-9_]*`);
      }
      return null;
    }
    if (term.startsWith('<') && term.endsWith('>')) {
      const inner = term.slice(1, -1);
      const resolved = (inner.startsWith('#') || inner.startsWith('.') || !/^[a-z][a-z0-9+\-.]*:/i.test(inner))
        ? _resolveUri(inner, baseUri)
        : inner;
      return rdflib.sym(resolved);
    }
    if (term.startsWith('"')) {
      const m = term.match(/^"([^"]*)"(?:\^\^<([^>]+)>|@([a-z-]+))?$/i);
      if (!m) throw new Error(`Malformed literal "${term}" — must be "value" with optional @lang or ^^<datatype>`);
      return rdflib.literal(m[1], m[3] || (m[2] ? rdflib.sym(m[2]) : undefined));
    }
    if (term.startsWith('#')) {
      if (!baseUri) throw new Error(`Fragment "${term}" requires a baseUri to resolve`);
      return rdflib.sym(_resolveUri(term, baseUri));
    }
    if (_isCurie$1(term)) {
      const expanded = expandCurie(term, extraPrefixes);
      return rdflib.sym(expanded || term);
    }
    throw new Error(
      `Unrecognized term "${term}" — must be a named variable (?x), <uri>, prefix:local, #fragment, or quoted "literal"`
    );
  }

  // ─── Tokenize a triple pattern ───────────────────────────────────────────────
  function tokenizeTriplePattern(input) {
    const out = [];
    const s = input.trim();
    let i = 0;
    while (i < s.length) {
      while (i < s.length && /\s/.test(s[i])) i++;
      if (i >= s.length) break;
      if (s[i] === '"') {
        let j = i + 1;
        while (j < s.length && s[j] !== '"') {
          if (s[j] === '\\' && j + 1 < s.length) j += 2;
          else j++;
        }
        if (j >= s.length) throw new Error(`Unterminated literal starting at position ${i}`);
        j++;
        if (s[j] === '@') {
          j++;
          while (j < s.length && /[A-Za-z-]/.test(s[j])) j++;
        } else if (s[j] === '^' && s[j + 1] === '^' && s[j + 2] === '<') {
          j += 3;
          while (j < s.length && s[j] !== '>') j++;
          if (j >= s.length) throw new Error(`Unterminated datatype IRI`);
          j++;
        }
        out.push(s.slice(i, j));
        i = j;
      } else {
        let j = i;
        while (j < s.length && !/\s/.test(s[j])) j++;
        out.push(s.slice(i, j));
        i = j;
      }
    }
    return out;
  }

  // ─── Parse a triple-pattern string into [sNode, pNode, oNode] ───────────────
  function parsePatternParts(pattern, rdflib, extraPrefixes = {}, baseUri = '') {
    const tokens = tokenizeTriplePattern(pattern);
    if (tokens.length !== 3) {
      throw new Error(`Triple pattern must have exactly 3 parts (subject predicate object) — got ${tokens.length}`);
    }
    const s = triplePatternTermToNode(tokens[0], rdflib, extraPrefixes, baseUri);
    const p = triplePatternTermToNode(tokens[1], rdflib, extraPrefixes, baseUri);
    const o = triplePatternTermToNode(tokens[2], rdflib, extraPrefixes, baseUri);
    return [s, p, o];
  }

  // ─── Extract variable names from a triple pattern ───────────────────────────
  function patternVarNames(pattern) {
    const tokens = tokenizeTriplePattern(pattern);
    if (tokens.length !== 3) return {};
    const out = {};
    const slots = ['s', 'p', 'o'];
    tokens.forEach((tok, i) => {
      if (_NAMED_VAR_RE.test(tok)) out[slots[i]] = tok.slice(1);
    });
    return out;
  }

  // ─── store.match → renderer {vars, results} ─────────────────────────────────
  function matchStore(store, s, p, o, names = {}) {
    const stmts = store.match(s, p, o, null);
    const slots = [];
    if (!s) slots.push('s');
    if (!p) slots.push('p');
    if (!o) slots.push('o');
    if (!slots.length) slots.push('s', 'p', 'o');

    const cols = slots.map(slot => names[slot] || slot);
    const results = stmts.map(st => {
      const row = {};
      slots.forEach((slot, i) => {
        const node = slot === 's' ? st.subject : slot === 'p' ? st.predicate : st.object;
        row[cols[i]] = termToCell(node);
      });
      return row;
    });
    return { vars: cols, results };
  }

  // ─── SPARQL helpers ──────────────────────────────────────────────────────────
  function selectVars(queryText) {
    const stripped = queryText.replace(/#[^\n]*/g, '');
    const m = stripped.match(/\bSELECT\s+(?:DISTINCT\s+|REDUCED\s+)?(.*?)\s+WHERE\b/is);
    if (!m) return null;
    const clause = m[1].trim();
    if (clause === '*') return null;
    const vars = clause.match(/\?\w+/g);
    return vars ? vars.map(v => v.slice(1)) : null;
  }

  function isRdfDoc(url) {
    return /\.(ttl|rdf|n3|jsonld|nt|nq|owl|trig)(\?|#|$)/i.test(url);
  }

  function bindingsToResults(bindings, queryText) {
    const selectVarsResult = selectVars(queryText);
    const allKeys = bindings.length
      ? Object.keys(bindings[0]).map(k => k.replace(/^\?/, ''))
      : [];
    const vars = selectVarsResult ?? allKeys;
    const results = bindings.map(b => {
      const row = {};
      for (const v of vars) {
        const node = b[`?${v}`];
        row[v] = node ? termToCell(node) : { type: 'literal', value: '' };
      }
      return row;
    });
    return { vars, results };
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

  // ─── Blank-node processing ───────────────────────────────────────────────────
  function expandBnodes(store, data) {
    let { vars, results } = data;

    if (results.length > 0) {
      const allBnodeCols = vars.filter(v => results.every(r => r[v]?.type === 'bnode'));
      if (allBnodeCols.length) {
        vars = vars.filter(v => !allBnodeCols.includes(v));
        results = results.map(r => {
          const nr = { ...r };
          allBnodeCols.forEach(v => delete nr[v]);
          return nr;
        });
      }
    }

    const objVars = vars.filter(v => v !== 's' && v !== 'p');
    const hasBnode = results.some(row => objVars.some(v => row[v]?.type === 'bnode'));
    if (!hasBnode) return { vars, results };

    results = results.map(row => {
      const newRow = {};
      for (const [k, cell] of Object.entries(row)) {
        newRow[k] = (objVars.includes(k) && cell?.type === 'bnode')
          ? _bnodeToModal(store, cell._term)
          : cell;
      }
      return newRow;
    });
    return { vars, results };
  }

  function _bnodeToModal(store, bnodeTerm) {
    const stmts = (store.match(bnodeTerm, null, null, null) || [])
      .filter(st => st.object.termType !== 'BlankNode');
    const results = stmts.map(st => ({
      p: termToCell(st.predicate),
      o: termToCell(st.object),
    }));
    return { type: 'bnode', value: '[…]', _data: { vars: ['p', 'o'], results } };
  }

  // ─── Widen subjects into rows-of-properties ──────────────────────────────────
  function pivotSubjectsToRows(store, subjects, subjectName = 's') {
    const shortName = uri => (uri || '').replace(/.*[/#]([^/#]+)\/?$/, '$1') || uri;
    const cols = [subjectName];
    const seen = new Set([subjectName]);
    const rows = [];

    for (const subj of subjects) {
      const row = { [subjectName]: termToCell(subj) };
      const stmts = store.match(subj, null, null, null) || [];
      for (const st of stmts) {
        const col = shortName(st.predicate.value);
        const cell = termToCell(st.object);
        if (!seen.has(col)) { cols.push(col); seen.add(col); }
        if (row[col] === undefined) row[col] = cell;
        else if (row[col].type === 'multi') row[col].values.push(cell);
        else row[col] = { type: 'multi', values: [row[col], cell] };
      }
      rows.push(row);
    }
    return { vars: cols, results: rows };
  }

  function promoteDisplayColumns({ vars, results }, subjectCol) {
    let cols = vars.filter(v => v !== subjectCol);
    const lead = cols.find(v => /^(name|label|title)$/i.test(v));
    if (lead) cols = [lead, ...cols.filter(v => v !== lead)];
    return { vars: cols, results };
  }

  // ─── Fetch SPARQL query text from an RDF file ────────────────────────────────
  async function fetchQueryFromRdf(queryUrl, fetchFn = fetch) {
    if (!rdf.isReady()) throw new Error('rdflib not available');
    const rdflib = rdf;

    try { queryUrl = new URL(queryUrl, document.baseURI).href; } catch {}

    const docUrl = queryUrl.split('#')[0];
    const store  = await loadRdfStore(docUrl, fetchFn, { shared: true });

    const subject = rdflib.sym(queryUrl);
    const q = store.any(subject, rdflib.sym('http://www.w3.org/ns/sparql#query'))
           || store.any(subject, rdflib.sym('http://www.w3.org/2000/01/rdf-schema#comment'))
           || store.any(subject, rdflib.sym('http://purl.org/dc/terms/description'));

    if (!q) throw new Error(`No query found at ${queryUrl}`);
    return q.value;
  }

  // ─── runQuery: call from a script, returns plain JS values ───────────────────
  async function runQuery({ endpoint, sparql, pattern, wanted, vars: patternVars } = {}) {
    const pat = pattern || wanted;
    if (!endpoint) throw new Error('endpoint is required');
    if (!sparql && !pat) throw new Error('sparql or pattern is required');

    let data;

    if (sparql) {
      let queryText = sparql;
      const isStoredRef = !/\s/.test(sparql) && /^https?:\/\/|^\/|^\.\.?\//.test(sparql.trim());
      if (isStoredRef) queryText = await fetchQueryFromRdf(sparql);
      data = await execSparql(queryText, endpoint);
    } else {
      const store  = await loadRdfStore(endpoint);
      const [s, p, o] = parsePatternParts(pat, rdf, {}, endpoint);
      data = matchStore(store, s, p, o);
    }

    return toPlainResults(data, patternVars);
  }

  // ─── Run SPARQL against a pre-loaded rdflib store ────────────────────────────
  async function _localSparql(queryText, endpoint) {
    if (!rdf.hasSparqlEngine()) throw new Error('rdflib SPARQL engine not available');

    const store  = await loadRdfStore(endpoint);
    const parsed = rdf.sparqlToQuery(queryText, false, store);
    if (!parsed) throw new Error('Could not parse SPARQL query');

    return new Promise((resolve, reject) => {
      const bindings = [];
      try {
        store.query(
          parsed,
          b  => bindings.push(b),
          rdf.fetcher(store),
          () => resolve(bindingsToResults(bindings, queryText)),
        );
      } catch (err) {
        reject(err);
      }
    });
  }

  // ─── SPARQL execution ────────────────────────────────────────────────────────
  async function execSparql(query, endpoint) {
    try { endpoint = new URL(endpoint, document.baseURI).href; } catch {}

    const isRdf = isRdfDoc(endpoint);

    const comunicaFactory = ComunicaSparqlAdapter.getComunicaEngine();
    if (comunicaFactory) {
      try { return await new ComunicaSparqlAdapter(comunicaFactory).executeQuery(query, endpoint); } catch {}
    }

    console.log('using rdflib');

    if (isRdf) {
      return await _localSparql(query, endpoint);
    }

    const rdflibAdapter = new RdflibSparqlAdapter();
    if (rdflibAdapter.isAvailable()) {
      try { return await rdflibAdapter.executeQuery(query, endpoint, true); } catch {
        try { return await rdflibAdapter.executeQuery(query, endpoint, false); } catch {}
      }
    }
    return await new NativeSparqlAdapter().executeQuery(query, endpoint);
  }

  // ─── SPARQL adapter (rdflib-based) ───────────────────────────────────────────

  class RdflibSparqlAdapter {
    isAvailable() {
      return rdf.hasRemoteSparql();
    }

    async executeQuery(query, endpoint, withCredentials = true) {
      if (!rdf.isReady()) throw new Error('rdflib not available');
      try {
        return await this._attempt(query, endpoint, withCredentials);
      } catch (err) {
        if (withCredentials) {
          return await this._attempt(query, endpoint, false);
        }
        throw err;
      }
    }

    async _attempt(query, endpoint, withCredentials) {
      const results = await rdf.sparqlQuery(query, { endpoint, withCredentials });
      const selectVarsResult = selectVars(query);
      const vars = selectVarsResult
        ?? (results.length ? Object.keys(results[0]).filter(k => !k.startsWith('?')) : []);
      const formatted = results.map(binding => {
        const row = {};
        vars.forEach(v => {
          const val = binding[v];
          row[v] = {
            type: val ? (val.termType || 'literal').toLowerCase() : 'literal',
            value: val ? (val.value || String(val)) : '',
          };
        });
        return row;
      });
      return { vars, results: formatted };
    }
  }

  function assertSafeQuery(query) {
    const m = query.match(/\b(INSERT|DELETE|DROP|CREATE|CLEAR|LOAD|COPY|MOVE|ADD)\b/i);
    if (m) throw new Error(`Blocked SPARQL operation: ${m[0].toUpperCase()}`);
  }

  function sanitizeVarValue(value) {
    if (/[{}]/.test(value)) throw new Error(`Variable value contains disallowed characters: { }`);
    if (/\b(INSERT|DELETE|DROP|CREATE|CLEAR|LOAD|COPY|MOVE|ADD)\b/i.test(value))
      throw new Error(`Variable value contains blocked keyword`);
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/'/g, "\\'");
  }

  function substituteVariables(query, vars = {}) {
    let q = query;
    for (const [key, value] of Object.entries(vars)) {
      const safe = sanitizeVarValue(value);
      q = q.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), safe);
    }
    return q;
  }

  // Cell-rendering helpers shared across view renderers.

  function mkLink(val) {
    const a = document.createElement('a');
    a.href = val.value;
    a.textContent = val.value.replace(/.*[/#]([^/#]+)\/?$/, '$1') || val.value;
    a.title = val.value;
    a.dataset.uri = val.value;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    return a;
  }

  function termText(val) {
    if (!val) return '';
    if (val.type === 'uri') return val.value.replace(/.*[/#]([^/#]+)\/?$/, '$1') || val.value;
    return val.value;
  }

  function appendCell(parent, cell, mkBnodeLink) {
    if (!cell) { parent.appendChild(document.createTextNode('')); return; }
    if (cell.type === 'multi') {
      cell.values.forEach((v, i) => {
        if (i > 0) parent.appendChild(document.createTextNode(', '));
        appendCell(parent, v, mkBnodeLink);
      });
    } else if (cell.type === 'bnode' && mkBnodeLink) {
      parent.appendChild(mkBnodeLink(cell));
    } else if (cell.type === 'uri') {
      parent.appendChild(mkLink(cell));
    } else {
      parent.appendChild(document.createTextNode(cell.value ?? ''));
    }
  }

  function render$9(container, data, host, options = {}) {
    const { hideHeader, mkBnodeLink } = options;
    const table = document.createElement('table');
    table.setAttribute('role', 'table');

    if (!hideHeader) {
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');
      tr.setAttribute('role', 'row');
      data.vars.forEach(v => {
        const th = document.createElement('th');
        th.setAttribute('role', 'columnheader');
        th.textContent = v;
        tr.appendChild(th);
      });
      thead.appendChild(tr);
      table.appendChild(thead);
    }

    const tbody = document.createElement('tbody');
    tbody.setAttribute('role', 'rowgroup');
    data.results.forEach(row => {
      const tr = document.createElement('tr');
      tr.setAttribute('role', 'row');
      data.vars.forEach(v => {
        const td = document.createElement('td');
        td.setAttribute('role', 'cell');
        appendCell(td, row[v], mkBnodeLink);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    if (!hideHeader) addSort(table);
    container.appendChild(table);
  }

  function addSort(table) {
    const ths = table.querySelectorAll('th');
    let col = -1, dir = 1;
    ths.forEach((th, i) => {
      th.addEventListener('click', () => {
        dir = col === i ? -dir : 1;
        col = i;
        ths.forEach((h, j) => h.setAttribute('data-sort', j === i ? (dir > 0 ? 'asc' : 'desc') : ''));
        const tbody = table.querySelector('tbody');
        Array.from(tbody.querySelectorAll('tr'))
          .sort((a, b) => dir * (a.cells[i]?.textContent || '')
            .localeCompare(b.cells[i]?.textContent || '', undefined, { numeric: true, sensitivity: 'base' }))
          .forEach(r => tbody.appendChild(r));
      });
    });
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

  // Shared button + form-control rules used across all sol-* components.
  // Each component's *-css.js string prepends BTN_CSS so the rules reach
  // the component's shadow scope (or light-DOM root, via ensureDocStyle).
  //
  // Base class:  .sol-btn      — default (medium) button
  // Sizes:       .sol-btn-sm   — compact (used in headers, auth, chips)
  //              .sol-btn-icon — square icon/nav button (prev/next arrows)
  // Variants:    .sol-btn-primary, .sol-btn-danger, .sol-btn-ghost
  // Inputs:      .sol-input, .sol-select-control
  //
  // All colors resolve from root.css vars with sensible fallbacks.


  const BTN_CSS = `
  .sol-btn {
    font: inherit;
    font-family: var(--font-ui, inherit);
    background: var(--surface, #fff);
    color: var(--text, #212121);
    border: 1px solid var(--border, #d0d0d0);
    border-radius: 4px;
    padding: 0.35em 0.8em;
    line-height: 1.2;
    cursor: pointer;
    white-space: nowrap;
    box-sizing: border-box;
  }
  .sol-btn:hover {
    background: var(--hover, #eaf2fb);
    border-color: var(--accent, #3498db);
    color: var(--text, #212121);
  }
  .sol-btn:focus-visible {
    outline: 2px solid var(--accent, #3498db);
    outline-offset: 1px;
  }
  .sol-btn[disabled],
  .sol-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .sol-btn-sm {
    padding: 3px 10px;
    font-size: 0.82em;
    border-radius: 4px;
  }

  .sol-btn-icon {
    padding: 0.25rem 0.6rem;
    font-size: 1.15em;
    line-height: 1;
  }

  .sol-btn-primary {
    background: var(--accent, #3498db);
    color: #fff;
    border-color: var(--accent, #3498db);
  }
  .sol-btn-primary:hover {
    background: var(--accent-dark, #2980b9);
    border-color: var(--accent-dark, #2980b9);
    color: #fff;
  }
  .sol-btn-primary:disabled,
  .sol-btn-primary[disabled] { background: #ccc; border-color: #ccc; color: #fff; }

  .sol-btn-danger {
    background: var(--error, #e74c3c);
    color: #fff;
    border-color: var(--error, #e74c3c);
  }
  .sol-btn-danger:hover {
    background: color-mix(in srgb, var(--error, #e74c3c) 85%, #000);
    border-color: color-mix(in srgb, var(--error, #e74c3c) 85%, #000);
    color: #fff;
  }

  .sol-btn-ghost {
    background: transparent;
    border-color: transparent;
    color: var(--text-muted, #666);
  }
  .sol-btn-ghost:hover {
    background: var(--hover, #f0f0f0);
    color: var(--text, #212121);
    border-color: transparent;
  }

  .sol-input, .sol-select-control {
    font: inherit;
    background: var(--surface, #fff);
    color: var(--text, #212121);
    border: 1px solid var(--border, #d0d0d0);
    border-radius: 4px;
    padding: 0.35em 0.55em;
    box-sizing: border-box;
  }
  .sol-input:focus, .sol-select-control:focus {
    outline: 2px solid var(--accent, #3498db);
    outline-offset: 1px;
    border-color: var(--accent, #3498db);
  }
`;

  sheetFrom(BTN_CSS);

  const CSS$5 = BTN_CSS + `
  :host {
    display: block;
    font-family: var(--font-ui, system-ui, sans-serif);
    font-size: var(--font-size, 1rem);
    color: var(--text, #212121);
  }
  .container { overflow-x: auto; }

  /* ── table ── */
  table { border-collapse: collapse; margin: 0 0 .5rem; font-size: 1rem; }
  th, td {
    padding: 0.4rem 0.65rem;
    text-align: left;
    border: 1px solid var(--border, #ddd);
    overflow-wrap: break-word;
    word-break: break-word;
  }
  th {
    background-color: var(--th-color, var(--accent-dark, #2C3E51));
    color: var(--th-text-color, #fff);
    font-weight: 600;
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
  }
  th::after { content: '⇅'; margin-left: 5px; font-size: .75em; opacity: .55; }
  th[data-sort="asc"]::after  { content: '▲'; opacity: 1; }
  th[data-sort="desc"]::after { content: '▼'; opacity: 1; }
  tr:nth-child(even) { background-color: var(--even-color, var(--hover, #fafafa)); }

  /* ── dl ── */
  dl { margin: 0 0 .5rem; }
  dt { font-weight: 600; margin-top: .75rem; color: var(--text, #000); }
  dt:first-child { margin-top: 0; }
  dd { margin: .1rem 0 .2rem 1rem; }
  dd .dl-field { font-size: .85em; color: var(--text-muted, #666); font-weight: 600; }
  .dl-value { color: var(--text, #000); }

  /* ── list ── */
  ul.result-list { margin: .5rem 0 .5rem 1.5rem; }
  ul.result-list li { margin: .2rem 0; }

  /* ── meta ── */
  .single-value { display: block; padding: 1rem; font-size: 1.1em; }
  .sol-subject-header {
    margin: 0 0 .5rem;
    padding: 0 0 .35rem;
    font-size: 1.4em;
    color: var(--text, #222);
    border-bottom: 1px solid var(--border, #e4e4e4);
  }
  .loading { padding: 1rem; color: var(--text-muted, #666); }
  .error {
    padding: 1rem;
    color: var(--error, #c00);
    background-color: color-mix(in srgb, var(--error, #e74c3c) 12%, transparent);
    border: 1px solid var(--error, #fcc);
    border-radius: 4px;
  }
  a { color: var(--accent, #0066cc); text-decoration: none; }
  a:hover { text-decoration: underline; }
  a.bnode-link { font-style: italic; color: var(--text-muted, #777); }
  a.bnode-link:hover { color: var(--accent, #0066cc); }

  /* ── subject nav + sections (multi-subject pivot) ── */
  .subject-nav {
    display: flex; flex-wrap: wrap; gap: 6px;
    padding: .5rem 0 .75rem;
    border-bottom: 1px solid var(--border, #ddd);
    margin-bottom: .75rem;
  }
  .subject-nav a {
    display: inline-block;
    padding: .25rem .6rem;
    border-radius: 4px;
    border: 1px solid var(--border, #ccc);
    font-size: .82em;
    background: var(--surface, #f5f5f5);
  }
  .subject-nav a:hover {
    background: var(--hover, #e8f0fe);
    border-color: var(--accent, #4a9eff);
  }
  .subject-section { margin-bottom: 1.5rem; }
  .subject-heading {
    font-size: .95em; font-weight: 600; margin: 0 0 .35rem;
    padding-bottom: .25rem;
    border-bottom: 1px solid var(--border, #eee);
  }

  /* ── blank-node modal ── */
  .bnode-modal {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: 9999;
    align-items: center;
    justify-content: center;
  }
  .bnode-modal.active { display: flex; }
  .bnode-modal-inner {
    background: var(--surface, #fff);
    color: var(--text, #212121);
    border-radius: 6px;
    padding: 1.25rem 1.5rem 1.5rem;
    max-width: min(90vw, 700px);
    max-height: 80vh;
    overflow: auto;
    position: relative;
    box-shadow: 0 8px 24px var(--shadow, rgba(0,0,0,0.25));
  }
  .bnode-modal-body { overflow-x: auto; margin-top: .5rem; }
  .bnode-modal-close {
    position: absolute;
    top: .5rem; right: .5rem;
    border-radius: 50%;
    width: 1.6rem; height: 1.6rem;
    padding: 0;
    font-size: 1rem; line-height: 1;
  }
`;

  const sheet$5 = sheetFrom(CSS$5);

  class SparqlResultsRenderer {
    constructor(container) {
      this.container = container;
      this._bnodeData = new Map();
      this._modal     = null;

      // Bnode-link clicks: open modal with the node's properties
      container.addEventListener('click', e => {
        const a = e.target.closest('a.bnode-link');
        if (!a) return;
        e.preventDefault();
        const idx  = parseInt(a.dataset.bnodeIdx, 10);
        const data = this._bnodeData.get(idx);
        if (data) this._showBnodeModal(data);
      });
    }

    showLoading(message = 'Loading results...') {
      this.container.innerHTML = `<div class="loading">${message}</div>`;
    }

    showError(message) {
      this.container.innerHTML = `<div class="error" role="alert">${message}</div>`;
    }

    showNoResults() {
      this.container.innerHTML = '<div class="loading">No results found</div>';
    }

    // ── Main entry point ────────────────────────────────────────────────────────
    // viewFn: a free function with signature render(container, data, host, options)
    renderResults(data, viewFn, options = {}) {
      this._bnodeData.clear();

      if (!data.results || data.results.length === 0) {
        this.showNoResults();
        return;
      }

      // 1 row × 1 column → scalar value, no table
      if (data.vars.length === 1 && data.results.length === 1) {
        const val = data.results[0][data.vars[0]];
        this.container.innerHTML = '';
        if (val && val.type === 'uri') {
          this.container.appendChild(mkLink(val));
        } else {
          const span = document.createElement('span');
          span.className = 'single-value';
          span.textContent = val ? val.value : '';
          this.container.appendChild(span);
        }
        return;
      }

      const pivoted = this._pivotSPO(data);
      if (pivoted) {
        this.container.innerHTML = '';
        this._renderView(pivoted, viewFn, options);
        return;
      }

      const grouped = this._groupByPredicate(data);

      this.container.innerHTML = '';
      this._renderView(grouped, viewFn, options);
    }

    _renderView(data, viewFn, options) {
      const mkBnodeLink = v => this._mkBnodeLink(v);
      viewFn(this.container, data, null, { ...options, mkBnodeLink });
    }

    // ── Pivot s,p,o → predicates as columns, subjects as rows ─────────────────
    _pivotSPO(data) {
      const v = data.vars;
      const hasSPO = v.length === 3 && v[0]==='s' && v[1]==='p' && v[2]==='o';
      const hasPO  = v.length === 2 && v[0]==='p' && v[1]==='o';
      if (!hasSPO && !hasPO) return null;

      const subjectOrder = [];
      const subjects     = new Map();
      const predOrder    = [];
      const predSet      = new Set();

      for (const row of data.results) {
        const sKey = hasSPO ? (row.s?.value ?? '') : '';
        const pURI = row.p?.value ?? '';

        if (!subjects.has(sKey)) {
          subjectOrder.push(sKey);
          subjects.set(sKey, new Map());
        }
        if (!predSet.has(pURI)) { predSet.add(pURI); predOrder.push(pURI); }

        const predMap = subjects.get(sKey);
        if (!predMap.has(pURI)) predMap.set(pURI, []);
        if (row.o) predMap.get(pURI).push(row.o);
      }

      const _short = uri => uri.replace(/.*[/#]([^/#]+)\/?$/, '$1') || uri;
      const names  = predOrder.map(_short);
      const seen   = {};
      for (let i = 0; i < names.length; i++) {
        const n = names[i];
        if (seen[n] !== undefined) {
          names[seen[n]] = predOrder[seen[n]];
          names[i]       = predOrder[i];
        } else { seen[n] = i; }
      }

      const results = subjectOrder.map(sKey => {
        const predMap = subjects.get(sKey);
        const row = {};
        for (let i = 0; i < predOrder.length; i++) {
          const vals = predMap.get(predOrder[i]);
          if (!vals || vals.length === 0) {
            row[names[i]] = { type: 'literal', value: '' };
          } else if (vals.length === 1) {
            row[names[i]] = vals[0];
          } else {
            row[names[i]] = { type: 'multi', values: vals };
          }
        }
        return row;
      });

      return { vars: names, results };
    }

    // ── Group rows by non-object columns, collect 'o' values ──────────────────
    _groupByPredicate(data) {
      if (!data.vars.includes('o')) return data;

      const keyVars = data.vars.filter(v => v !== 'o');
      const order   = [];
      const map     = new Map();

      for (const row of data.results) {
        const key = keyVars.map(v => row[v]?.value ?? '').join('\x00');
        if (!map.has(key)) {
          order.push(key);
          const newRow = {};
          keyVars.forEach(v => newRow[v] = row[v]);
          newRow._oVals = row.o ? [row.o] : [];
          map.set(key, newRow);
        } else if (row.o) {
          map.get(key)._oVals.push(row.o);
        }
      }

      const results = order.map(key => {
        const row  = map.get(key);
        const vals = row._oVals;
        delete row._oVals;
        row.o = vals.length === 0 ? { type: 'literal', value: '' }
              : vals.length === 1 ? vals[0]
              : { type: 'multi', values: vals };
        return row;
      });

      return { vars: data.vars, results };
    }

    // ── Blank-node link + modal ────────────────────────────────────────────────
    _mkBnodeLink(value) {
      const a = document.createElement('a');
      a.href        = '#';
      a.className   = 'bnode-link';
      a.textContent = '[…]';
      a.title       = 'Click to view blank node properties';
      const idx = this._bnodeData.size;
      this._bnodeData.set(idx, value._data);
      a.dataset.bnodeIdx = String(idx);
      return a;
    }

    _showBnodeModal(data) {
      const modal = this._getOrCreateModal();
      const body  = modal.querySelector('.bnode-modal-body');
      body.innerHTML = '';
      const sub = new SparqlResultsRenderer(body);
      sub.renderResults(data, render$9, { hideHeader: true });
      modal.classList.add('active');
    }

    _closeModal() {
      if (this._modal) this._modal.classList.remove('active');
    }

    _getOrCreateModal() {
      if (this._modal) return this._modal;
      const modal = document.createElement('div');
      modal.className = 'bnode-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.innerHTML = `
      <div class="bnode-modal-inner">
        <button class="sol-btn sol-btn-danger bnode-modal-close" aria-label="Close">×</button>
        <div class="bnode-modal-body"></div>
      </div>`;
      modal.querySelector('.bnode-modal-close')
           .addEventListener('click', () => this._closeModal());
      modal.addEventListener('click', e => { if (e.target === modal) this._closeModal(); });
      (this.container.parentNode ?? this.container).appendChild(modal);
      this._modal = modal;
      this._escHandler = e => { if (e.key === 'Escape') this._closeModal(); };
      document.addEventListener('keydown', this._escHandler);
      return modal;
    }
  }

  /**
   * Triple-pattern parser and SPARQL converter.
   * Converts a strict 3-part triple pattern (subject predicate object) to SPARQL.
   *
   * Grammar (strict — matches the W3C triple-pattern spec):
   *   subject:   named-var (?x) | <uri> | prefix:local
   *   predicate: named-var | <uri> | prefix:local
   *   object:    named-var | <uri> | prefix:local | "literal"[@lang|^^<datatype>]
   *
   * Rejected: bare `?` (all variables must be named), bare words, unquoted
   * literals, numeric literals without quotes.
   */

  const NAMED_VAR_RE = /^\?[A-Za-z_][A-Za-z0-9_]*$/;

  class TriplePatternParser {
    constructor(endpoint) {
      this.endpoint = endpoint;
    }

    /**
     * Parse a triple-pattern string into a SPARQL SELECT query.
     * @param {string} pattern - "subject predicate object"
     * @returns {string} A valid SPARQL SELECT query
     * @throws {Error} If the pattern is invalid
     */
    parse(pattern) {
      const tokens = _tokenizeTriplePattern(pattern);
      if (tokens.length !== 3) {
        throw new Error(`Triple pattern must have exactly 3 parts: subject predicate object (got ${tokens.length})`);
      }
      const [s, p, o] = tokens.map(t => this.expandTerm(t));
      return `SELECT * WHERE { ${s} ${p} ${o} }`;
    }

    expandTerm(term) {
      if (term === '?') {
        throw new Error('Bare "?" is not allowed — use a named variable like "?x"');
      }
      if (term.startsWith('?')) {
        if (!NAMED_VAR_RE.test(term)) {
          throw new Error(`Invalid variable "${term}" — must match ?[A-Za-z_][A-Za-z0-9_]*`);
        }
        return term;
      }
      if (term.startsWith('<') && term.endsWith('>')) return term;
      if (term.startsWith('"')) {
        if (!/^"([^"\\]|\\.)*"(@[A-Za-z-]+|\^\^<[^>]+>)?$/.test(term)) {
          throw new Error(`Malformed literal "${term}" — must be "value" with optional @lang or ^^<datatype>`);
        }
        return term;
      }
      if (_isCurie(term)) return term;
      throw new Error(
        `Unrecognized term "${term}" — must be a named variable (?x), <uri>, prefix:local, or quoted "literal"`
      );
    }
  }

  /** Validator for triple-pattern syntax. */
  class TriplePatternValidator {
    static validate(input) {
      if (!input || typeof input !== 'string') {
        return { valid: false, error: 'Input must be a non-empty string' };
      }
      let tokens;
      try { tokens = _tokenizeTriplePattern(input); }
      catch (e) { return { valid: false, error: e.message }; }

      if (tokens.length !== 3) {
        return { valid: false, error: `Triple pattern needs exactly 3 parts — got ${tokens.length}` };
      }
      const p = new TriplePatternParser('');
      try {
        p.expandTerm(tokens[0]);
        p.expandTerm(tokens[1]);
        p.expandTerm(tokens[2]);
      } catch (e) {
        return { valid: false, error: e.message };
      }
      return { valid: true };
    }

    static getHelpMessage() {
      return `
Triple-pattern format: subject predicate object

Examples:
  ?person foaf:name "Alice"         — People named Alice
  <http://example.org/me> ?p ?o     — All properties of a subject
  ?s ?p ?o                          — All triples
  ex:alice ex:knows ?friend         — Alice's friends

Term types:
  ?name          — Named variable (bare "?" is NOT allowed)
  <uri>          — Full URI
  prefix:local   — Prefixed URI (CURIE)
  "literal"      — String literal (bare words and numbers are NOT accepted)
  "x"@en         — Literal with language tag
  "1"^^<http://www.w3.org/2001/XMLSchema#integer>  — Typed literal
    `.trim();
    }
  }

  // ── Internal helpers ─────────────────────────────────────────────────────────
  function _isCurie(term) {
    const m = term.match(/^([A-Za-z_][A-Za-z0-9_-]*):([^\s]*)$/);
    if (!m) return false;
    if (/^(https?|ftp|file|urn|mailto|data|tel|news|gopher|ldap|about):/i.test(term)) return false;
    return true;
  }

  function _tokenizeTriplePattern(input) {
    const out = [];
    const s = String(input).trim();
    let i = 0;
    while (i < s.length) {
      while (i < s.length && /\s/.test(s[i])) i++;
      if (i >= s.length) break;
      if (s[i] === '"') {
        let j = i + 1;
        while (j < s.length && s[j] !== '"') {
          if (s[j] === '\\' && j + 1 < s.length) j += 2;
          else j++;
        }
        if (j >= s.length) throw new Error(`Unterminated literal starting at position ${i}`);
        j++;
        if (s[j] === '@') {
          j++;
          while (j < s.length && /[A-Za-z-]/.test(s[j])) j++;
        } else if (s[j] === '^' && s[j + 1] === '^' && s[j + 2] === '<') {
          j += 3;
          while (j < s.length && s[j] !== '>') j++;
          if (j >= s.length) throw new Error('Unterminated datatype IRI');
          j++;
        }
        out.push(s.slice(i, j));
        i = j;
      } else {
        let j = i;
        while (j < s.length && !/\s/.test(s[j])) j++;
        out.push(s.slice(i, j));
        i = j;
      }
    }
    return out;
  }

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

  function render$8(container, data, host, options = {}) {
    const { hideHeader, mkBnodeLink } = options;
    const dl       = document.createElement('dl');
    const flat     = !!hideHeader;
    const nameVar  = flat ? null : data.vars[0];
    const restVars = flat ? data.vars : data.vars.slice(1);

    data.results.forEach(row => {
      if (nameVar) {
        const dt = document.createElement('dt');
        const nameCell = row[nameVar];
        dt.textContent = termText(nameCell);
        if (nameCell?.type === 'uri') dt.title = nameCell.value;
        dl.appendChild(dt);
      }

      restVars.forEach(v => {
        const dd = document.createElement('dd');
        const label = document.createElement('span');
        label.className = 'dl-field';
        label.textContent = `${v} `;
        dd.appendChild(label);

        const valueSpan = document.createElement('span');
        valueSpan.className = 'dl-value';
        appendCell(valueSpan, row[v], mkBnodeLink);
        dd.appendChild(valueSpan);

        dl.appendChild(dd);
      });
    });

    container.appendChild(dl);
  }

  function render$7(container, data, host, options = {}) {
    if (data.vars.length > 1) return render$9(container, data, host, options);

    const { mkBnodeLink } = options;
    const col = data.vars[0];
    const ul = document.createElement('ul');
    ul.className = 'result-list';
    data.results.forEach(row => {
      const li = document.createElement('li');
      appendCell(li, row[col], mkBnodeLink);
      ul.appendChild(li);
    });
    container.appendChild(ul);
  }

  const CSS$4 = `
  .sol-view-accordion {
    font-family: var(--font-ui, system-ui, sans-serif);
    color: var(--text, #212121);
  }
  .sol-view-accordion details {
    border: 1px solid var(--border, #e0e0e0);
    border-radius: 4px;
    margin-bottom: .35rem;
    background: var(--surface, #fff);
  }
  .sol-view-accordion summary {
    padding: .5rem .75rem;
    cursor: pointer;
    font-weight: 600;
    background: var(--hover, #f7f7f7);
    border-radius: 4px;
    list-style: none;
  }
  .sol-view-accordion details[open] summary {
    border-bottom: 1px solid var(--border, #e0e0e0);
    border-radius: 4px 4px 0 0;
  }
  .sol-view-accordion summary::-webkit-details-marker { display: none; }
  .sol-view-accordion summary::before {
    content: '▸';
    display: inline-block;
    width: 1em;
    transition: transform .15s;
  }
  .sol-view-accordion details[open] > summary::before {
    transform: rotate(90deg);
  }
  .sol-view-accordion dl {
    margin: 0;
    padding: .6rem .85rem;
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: .25rem .75rem;
  }
  .sol-view-accordion dt {
    font-size: .85em;
    color: var(--text-muted, #666);
    font-weight: 600;
  }
  .sol-view-accordion dd {
    margin: 0;
    word-break: break-word;
  }
  .sol-view-accordion .accordion-body {
    padding: .6rem .85rem;
  }
  .sol-view-accordion a {
    color: var(--accent, #0066cc);
    text-decoration: none;
  }
  .sol-view-accordion a:hover { text-decoration: underline; }
`;
  const sheet$4 = sheetFrom(CSS$4);

  /**
   * Built-in view renderer for sol-query — "accordion".
   *
   * Panel mode — query-driven (default): one <details> per result row. Summary
   * = first column; body = remaining columns as key/value pairs.
   *
   * Panel mode — author-supplied: if the <sol-query> host element has child
   * <div>s in its light DOM, each div becomes one panel instead. Summary is
   * the div's `data-summary` attribute, or its first heading child, or
   * "Panel N". The div's HTML becomes the panel body.
   *
   * Mutually-exclusive: opening one panel closes all the others.
   *
   * Usage: <sol-query view="accordion" endpoint="…"></sol-query>
   */
  function render$6(container, data, host) {
    const shortUri = v => v.replace(/.*[/#]([^/#]+)\/?$/, '$1') || v;

    const renderCellInto = (parent, cell) => {
      if (!cell) return;
      if (cell.type === 'multi') {
        cell.values.forEach((v, i) => {
          if (i > 0) parent.appendChild(document.createTextNode(', '));
          renderCellInto(parent, v);
        });
        return;
      }
      if (cell.type === 'uri') {
        const a = document.createElement('a');
        a.href = cell.value;
        a.textContent = shortUri(cell.value);
        a.title = cell.value;
        a.dataset.uri = cell.value;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        parent.appendChild(a);
      } else {
        parent.appendChild(document.createTextNode(cell.value ?? ''));
      }
    };

    // Native single-open behavior via <details name="...">. Each renderer
    // instance gets a unique group name so multiple accordions on a page
    // don't interfere with each other.
    const groupName = `sol-accordion-${Math.random().toString(36).slice(2, 9)}`;

    const wrapper = document.createElement('div');
    wrapper.className = 'sol-view-accordion';

    // ── Author-supplied panels: light-DOM <div> children of the host ──────────
    const authorDivs = host
      ? Array.from(host.children).filter(el => el.tagName === 'DIV')
      : [];

    if (authorDivs.length) {
      authorDivs.forEach((srcDiv, i) => {
        const det = document.createElement('details');
        det.name = groupName;
        if (i === 0) det.open = true;

        const sum = document.createElement('summary');
        const explicit = srcDiv.getAttribute('data-summary');
        const heading  = srcDiv.querySelector('h1,h2,h3,h4,h5,h6');
        sum.textContent = explicit ?? heading?.textContent?.trim() ?? `Panel ${i + 1}`;
        det.appendChild(sum);

        const body = document.createElement('div');
        body.className = 'accordion-body';
        // Clone so the light-DOM source stays untouched; also drops the heading
        // we just lifted into the summary (if any).
        const clone = srcDiv.cloneNode(true);
        if (!explicit && heading) {
          const h = clone.querySelector('h1,h2,h3,h4,h5,h6');
          h?.remove();
        }
        while (clone.firstChild) body.appendChild(clone.firstChild);
        det.appendChild(body);
        wrapper.appendChild(det);
      });
      attachWrapperAndStyle(container, wrapper);
      return;
    }

    // ── Query-driven panels ───────────────────────────────────────────────────
    const { vars, results } = data;
    if (!results?.length) {
      container.textContent = 'No results';
      return;
    }

    const summaryText = row => {
      const firstCell = row[vars[0]];
      if (!firstCell) return '(row)';
      if (firstCell.type === 'uri') return shortUri(firstCell.value);
      return firstCell.value ?? '';
    };

    results.forEach((row, i) => {
      const det = document.createElement('details');
      det.name = groupName;
      if (i === 0) det.open = true;

      const sum = document.createElement('summary');
      sum.textContent = summaryText(row);
      det.appendChild(sum);

      const body = document.createElement('dl');
      const restVars = vars.length > 1 ? vars.slice(1) : vars;
      restVars.forEach(v => {
        const cell = row[v];
        if (!cell) return;
        const dt = document.createElement('dt');
        dt.textContent = v;
        const dd = document.createElement('dd');
        renderCellInto(dd, cell);
        body.appendChild(dt);
        body.appendChild(dd);
      });
      det.appendChild(body);
      wrapper.appendChild(det);
    });

    attachWrapperAndStyle(container, wrapper);
  }

  function attachWrapperAndStyle(container, wrapper) {
    adopt(container.getRootNode(), { sheet: sheet$4, css: CSS$4 });
    container.appendChild(wrapper);
  }

  const CSS$3 = `
  .sol-view-anchorlist {
    list-style: none;
    padding: 0;
    margin: 0;
    font-family: var(--font-ui, system-ui, sans-serif);
    color: var(--text, #212121);
  }
  .sol-view-anchorlist li {
    padding: .3rem .5rem;
    border-bottom: 1px solid var(--border, #eee);
  }
  .sol-view-anchorlist li:last-child { border-bottom: none; }
  .sol-view-anchorlist a {
    color: var(--accent, #0066cc);
    text-decoration: none;
  }
  .sol-view-anchorlist a:hover { text-decoration: underline; }
`;
  const sheet$3 = sheetFrom(CSS$3);

  /**
   * Built-in view renderer for sol-query — "anchorlist".
   * Renders results as a flat unordered list of anchor links.
   *
   * Display rules per row:
   *   - Picks the first URI cell as the href.
   *   - Label = first non-URI literal cell, else the shortened form of the URI.
   *   - If no URI cell exists, renders a plain <li> with the first cell's value.
   *
   * Usage: <sol-query view="anchorlist" endpoint="…"></sol-query>
   */
  function render$5(container, data) {
    const { vars, results } = data;
    if (!results?.length) {
      container.textContent = 'No results';
      return;
    }

    const shortUri = v => v.replace(/.*[/#]([^/#]+)\/?$/, '$1') || v;

    const pickFirst = (row, predicate) => {
      for (const v of vars) {
        const cell = row[v];
        if (cell && predicate(cell)) return cell;
      }
      return null;
    };

    const ul = document.createElement('ul');
    ul.className = 'sol-view-anchorlist';

    results.forEach(row => {
      const li = document.createElement('li');
      const uriCell     = pickFirst(row, c => c.type === 'uri');
      const literalCell = pickFirst(row, c => c.type !== 'uri' && c.type !== 'multi' && c.value);

      if (uriCell) {
        const a = document.createElement('a');
        a.href = uriCell.value;
        a.textContent = literalCell?.value ?? shortUri(uriCell.value);
        a.title = uriCell.value;
        a.dataset.uri = uriCell.value;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        li.appendChild(a);
      } else {
        const first = row[vars[0]];
        li.textContent = first?.value ?? '';
      }
      ul.appendChild(li);
    });

    adopt(container.getRootNode(), { sheet: sheet$3, css: CSS$3 });
    container.appendChild(ul);
  }

  const CSS$2 = BTN_CSS + `
  .sol-view-autocomplete {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
    max-width: 100%;
    font-family: var(--font-ui, system-ui, sans-serif);
    color: var(--text, #212121);
  }
  .ac-input-wrapper {
    width: 100%;
    display: flex;
    gap: 0.5rem;
  }
  .sol-view-autocomplete input {
    flex: 1;
    padding: .5rem .65rem;
    font: inherit;
    background: var(--surface, #fff);
    color: var(--text, #212121);
    border: 1px solid var(--border, #ccc);
    border-radius: 4px;
    box-sizing: border-box;
  }
  .sol-view-autocomplete input:focus {
    outline: 2px solid var(--accent, #4a9eff);
    outline-offset: 1px;
    border-color: var(--accent, #4a9eff);
  }
  .ac-go-button { padding: .5rem 1rem; }
  .ac-list-wrapper {
    width: 100%;
    background: var(--surface, #fff);
    border: 1px solid var(--border, #ccc);
    border-radius: 4px;
    max-height: 220px;
    overflow-y: auto;
    box-shadow: 0 4px 12px var(--shadow, rgba(0,0,0,.08));
  }
  .sol-view-autocomplete .ac-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .sol-view-autocomplete .ac-list li {
    padding: .4rem .65rem;
    cursor: pointer;
    color: var(--text, #000);
  }
  .sol-view-autocomplete .ac-list li.active,
  .sol-view-autocomplete .ac-list li:hover {
    background: var(--hover, #eaf2fb);
  }
`;
  const sheet$2 = sheetFrom(CSS$2);

  function render$4(container, data, host) {
    const { vars, results } = data;
    if (!results?.length) {
      container.textContent = 'No results';
      return;
    }

    const shortUri = v => v.replace(/.*[/#]([^/#]+)\/?$/, '$1') || v;
    const cellText = cell => {
      if (!cell) return '';
      if (cell.type === 'uri') return shortUri(cell.value);
      return cell.value ?? '';
    };
    const cellValue = cell => (cell ? cell.value ?? '' : '');

    const items = results.map((row, i) => {
      const cells = vars.map(v => row[v]);
      return {
        value: cellValue(cells[0]),
        label: vars.length > 1 ? cellText(cells[1]) : cellText(cells[0]),
        row,
        index: i,
      };
    });

    const wrapper = document.createElement('div');
    wrapper.className = 'sol-view-autocomplete';

    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'ac-input-wrapper';

    const input = document.createElement('input');
    input.type = 'text';
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-expanded', 'false');
    input.placeholder = host?.getAttribute('placeholder') ?? 'type to search...';

    const goButton = document.createElement('button');
    goButton.type = 'button';
    goButton.textContent = host?.getAttribute('go-label') ?? 'Go';
    goButton.className = 'sol-btn sol-btn-primary ac-go-button';

    inputWrapper.appendChild(input);
    inputWrapper.appendChild(goButton);

    const listWrapper = document.createElement('div');
    listWrapper.className = 'ac-list-wrapper';
    listWrapper.hidden = true;

    const list = document.createElement('ul');
    list.className = 'ac-list';
    list.setAttribute('role', 'listbox');

    listWrapper.appendChild(list);

    let activeIndex = -1;
    let visible = items;
    let selectedItem = null;

    const fire = item => {
      input.value = item.label;
      input.setAttribute('aria-expanded', 'false');
      listWrapper.hidden = true;
      selectedItem = item;
      host?.dispatchEvent(new CustomEvent('sol-select', {
        bubbles: true, composed: true,
        detail: { value: item.value, row: item.row, index: item.index },
      }));
    };

    const handleAutoComplete = () => {
      if (!selectedItem) {
        alert('No item selected');
        return;
      }

      const callbackName = host?.getAttribute('callback');
      if (callbackName && typeof window[callbackName] === 'function') {
        window[callbackName](selectedItem.value, selectedItem.label);
      } else {
        alert(`ID: ${selectedItem.value}\nLabel: ${selectedItem.label}`);
      }
    };

    goButton.addEventListener('click', handleAutoComplete);

    const renderList = () => {
      list.innerHTML = '';
      visible.forEach((item, i) => {
        const li = document.createElement('li');
        li.textContent = item.label;
        li.setAttribute('role', 'option');
        li.dataset.index = String(i);
        if (i === activeIndex) {
          li.classList.add('active');
          li.scrollIntoView({ block: 'nearest' });
        }
        list.appendChild(li);
      });
      const hasItems = visible.length > 0;
      listWrapper.hidden = !hasItems;
      input.setAttribute('aria-expanded', hasItems ? 'true' : 'false');
    };

    list.addEventListener('mousedown', e => {
      const li = e.target.closest('li');
      if (!li) return;
      e.preventDefault();
      const idx = parseInt(li.dataset.index, 10);
      if (!isNaN(idx) && visible[idx]) {
        fire(visible[idx]);
      }
    });

    list.addEventListener('mousemove', e => {
      const li = e.target.closest('li');
      if (!li) return;
      const idx = parseInt(li.dataset.index, 10);
      if (!isNaN(idx) && idx !== activeIndex) {
        activeIndex = idx;
        renderList();
      }
    });

    const filter = () => {
      const q = input.value.trim().toLowerCase();
      visible = q
        ? items.filter(it => it.label.toLowerCase().startsWith(q))
        : items.slice();
      activeIndex = -1;
      renderList();
    };

    input.addEventListener('input', filter);
    input.addEventListener('click', () => {
      if (!listWrapper.hidden) return;
      input.value = '';
      selectedItem = null;
      filter();
    });
    input.addEventListener('keydown', e => {
      if (listWrapper.hidden && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { 
        filter(); 
        return; 
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (activeIndex === -1) {
          activeIndex = 0;
        } else {
          activeIndex = Math.min(activeIndex + 1, visible.length - 1);
        }
        renderList();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (activeIndex === -1) {
          activeIndex = visible.length - 1;
        } else {
          activeIndex = Math.max(activeIndex - 1, 0);
        }
        renderList();
      } else if (e.key === 'Enter') {
        if (activeIndex >= 0 && visible[activeIndex]) { 
          e.preventDefault(); 
          fire(visible[activeIndex]); 
        }
      } else if (e.key === 'Escape') {
        listWrapper.hidden = true;
        input.setAttribute('aria-expanded', 'false');
      }
    });

    wrapper.appendChild(inputWrapper);
    wrapper.appendChild(listWrapper);

    adopt(container.getRootNode(), { sheet: sheet$2, css: CSS$2 });
    container.appendChild(wrapper);
  }

  /**
   * Built-in view renderer for sol-query — "menu".
   * Turns a result set of URIs + labels into a <sol-menu>. Each row becomes
   * one menu item; clicking loads the URL into the content panel.
   *
   * Column selection: uses vars named `link` + `label` when present,
   * otherwise falls back to the first two columns in order (1st = link,
   * 2nd = label). If only one column is returned, it's used for both.
   *
   * Any additional result columns are forwarded as attributes on the anchor,
   * so <sol-menu> can pass them through to the panel component.
   *
   * A `handler` attribute on the host <sol-query> is forwarded to the
   * <sol-menu> element so authors can choose the component each item wraps:
   *   <sol-query view="menu" handler="sol-live-edit" …>
   *
   * Usage: <sol-query view="menu" endpoint="…" sparql="SELECT ?link ?label …">
   */

  async function render$3(container, data, host) {
    const { vars, results } = data;
    if (!results?.length) { container.textContent = 'No results'; return; }

    const hasNamed = vars.includes('link') && vars.includes('label');
    const linkVar  = hasNamed ? 'link'  : vars[0];
    const labelVar = hasNamed ? 'label' : (vars[1] ?? vars[0]);
    const extraVars = vars.filter(v => v !== linkVar && v !== labelVar);

    await import(new URL('../sol-menu.js', (typeof document === 'undefined' && typeof location === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : typeof document === 'undefined' ? location.href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('sol-query.umd.js', document.baseURI).href))).href);

    const menu = document.createElement('sol-menu');

    const handler = host?.getAttribute?.('handler');
    if (handler) menu.setAttribute('handler', handler);
    const orientation = host?.getAttribute?.('orientation');
    if (orientation) menu.setAttribute('orientation', orientation);

    for (const row of results) {
      const url   = row[linkVar]?.value;
      const label = row[labelVar]?.value || url || '';
      if (!url) continue;
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.textContent = label;
      for (const v of extraVars) {
        const cell = row[v];
        if (cell?.value != null) a.setAttribute(v, cell.value);
      }
      menu.appendChild(a);
    }

    container.appendChild(menu);
  }

  const CSS$1 = BTN_CSS + `
  .sol-view-rolodex {
    display: inline-block;
    min-width: 260px;
    max-width: 100%;
    outline: none;
    font-family: var(--font-ui, system-ui, sans-serif);
    color: var(--text, #212121);
  }
  .sol-view-rolodex:focus-visible .rolodex-card {
    box-shadow: 0 0 0 2px var(--accent, #4a9eff);
  }
  .rolodex-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: .5rem;
    margin-bottom: .4rem;
  }
  /* Rolodex nav buttons use .sol-btn .sol-btn-icon. */
  .rolodex-counter {
    font-size: .85em;
    color: var(--text-muted, #666);
  }
  .rolodex-card {
    border: 1px solid var(--border, #e0e0e0);
    border-radius: 6px;
    background: var(--surface, #fff);
    padding: .85rem 1rem;
    box-shadow: 0 1px 3px var(--shadow, rgba(0,0,0,.05));
    cursor: pointer;
    transition: box-shadow .15s;
  }
  .rolodex-card:hover { box-shadow: 0 2px 8px var(--shadow, rgba(0,0,0,.1)); }
  .rolodex-card dl {
    margin: 0;
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: .3rem .85rem;
  }
  .rolodex-card dt {
    font-size: .8em;
    text-transform: uppercase;
    letter-spacing: .03em;
    color: var(--text-muted, #888);
    font-weight: 600;
  }
  .rolodex-card dd {
    margin: 0;
    word-break: break-word;
  }
  .rolodex-card a { color: var(--accent, #0066cc); text-decoration: none; }
  .rolodex-card a:hover { text-decoration: underline; }
`;
  const sheet$1 = sheetFrom(CSS$1);

  /**
   * Built-in view renderer for sol-query — "rolodex".
   * Shows one result row at a time as a card, with prev/next buttons and an
   * "N of M" counter. Each field (column) becomes a labelled line inside the
   * card. Arrow keys navigate when the card has focus.
   *
   * Navigation wraps around at both ends. Clicking a card dispatches a
   * 'sol-select' event with { value, row, index } on the host element.
   *
   * Usage: <sol-query view="rolodex" endpoint="…"></sol-query>
   */
  async function render$2(container, data, host) {
    const { vars, results } = data;
    if (!results?.length) {
      container.textContent = 'No results';
      return;
    }

    const shortUri = v => v.replace(/.*[/#]([^/#]+)\/?$/, '$1') || v;

    const renderCellInto = (parent, cell) => {
      if (!cell) return;
      if (cell.type === 'multi') {
        cell.values.forEach((v, i) => {
          if (i > 0) parent.appendChild(document.createTextNode(', '));
          renderCellInto(parent, v);
        });
        return;
      }
      if (cell.type === 'uri') {
        const a = document.createElement('a');
        a.href = cell.value;
        a.textContent = shortUri(cell.value);
        a.title = cell.value;
        a.dataset.uri = cell.value;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        parent.appendChild(a);
      } else {
        parent.appendChild(document.createTextNode(cell.value ?? ''));
      }
    };

    const wrapper = document.createElement('div');
    wrapper.className = 'sol-view-rolodex';
    wrapper.tabIndex = 0;

    const nav = document.createElement('div');
    nav.className = 'rolodex-nav';

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'sol-btn sol-btn-icon rolodex-btn';
    prevBtn.setAttribute('aria-label', 'Previous record');
    prevBtn.textContent = '‹';

    const counter = document.createElement('span');
    counter.className = 'rolodex-counter';
    counter.setAttribute('aria-live', 'polite');

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'sol-btn sol-btn-icon rolodex-btn';
    nextBtn.setAttribute('aria-label', 'Next record');
    nextBtn.textContent = '›';

    nav.appendChild(prevBtn);
    nav.appendChild(counter);
    nav.appendChild(nextBtn);

    const card = document.createElement('div');
    card.className = 'rolodex-card';

    wrapper.appendChild(nav);
    wrapper.appendChild(card);

    let index = 0;

    const show = i => {
      index = ((i % results.length) + results.length) % results.length;
      const row = results[index];

      card.innerHTML = '';
      const dl = document.createElement('dl');
      vars.forEach(v => {
        const cell = row[v];
        if (!cell) return;
        const dt = document.createElement('dt');
        dt.textContent = v;
        const dd = document.createElement('dd');
        renderCellInto(dd, cell);
        dl.appendChild(dt);
        dl.appendChild(dd);
      });
      card.appendChild(dl);
      counter.textContent = `${index + 1} of ${results.length}`;
    };

    prevBtn.addEventListener('click', () => show(index - 1));
    nextBtn.addEventListener('click', () => show(index + 1));

    wrapper.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); show(index - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
    });

    card.addEventListener('click', e => {
      if (e.target.closest('a')) return;
      const row = results[index];
      const lastVar = vars[vars.length - 1];
      const cell = row[lastVar];
      host?.dispatchEvent(new CustomEvent('sol-select', {
        bubbles: true, composed: true,
        detail: { value: cell?.value ?? '', row, index },
      }));
    });

    show(0);

    adopt(container.getRootNode(), { sheet: sheet$1, css: CSS$1 });
    container.appendChild(wrapper);
  }

  const CSS = `
  .sol-view-select {
    padding: .45rem .6rem;
    font: inherit;
    font-family: var(--font-ui, system-ui, sans-serif);
    color: var(--text, #212121);
    background: var(--surface, #fff);
    border: 1px solid var(--border, #ccc);
    border-radius: 4px;
    min-width: 240px;
    max-width: 100%;
  }
  .sol-view-select:focus {
    outline: 2px solid var(--accent, #4a9eff);
    outline-offset: 1px;
    border-color: var(--accent, #4a9eff);
  }
`;
  const sheet = sheetFrom(CSS);

  /**
   * Built-in view renderer for sol-query — "select".
   * Renders results as a <select> dropdown. Each row becomes one <option>.
   *
   * Display rules:
   *   - 1 column  → option text = that value (URIs are shortened for readability,
   *                 full URI stored in option.value).
   *   - 2 columns → option text = col[0], option.value = col[1].
   *   - 3+ cols   → option text = "col0 — col1", value = last column.
   *
   * Selection dispatches 'sol-select' with { value, row, index } on the host element
   * so pages can react (filter another query, navigate, etc.). URI values also
   * re-fire the sol-query's own dereference pathway by setting host endpoint, if
   * the host element looks like a <sol-query>.
   *
   * Usage: <sol-query view="select" endpoint="…" wanted="…"></sol-query>
   */
  function render$1(container, data, host) {
    const { vars, results } = data;
    if (!results?.length) {
      container.textContent = 'No results';
      return;
    }

    const shortUri = v =>
      v.replace(/.*[/#]([^/#]+)\/?$/, '$1') || v;

    const cellText = cell => {
      if (!cell) return '';
      if (cell.type === 'uri') return shortUri(cell.value);
      return cell.value ?? '';
    };
    const cellValue = cell => (cell ? cell.value ?? '' : '');

    const select = document.createElement('select');
    select.className = 'sol-view-select';

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = `— ${results.length} result${results.length === 1 ? '' : 's'} —`;
    placeholder.disabled = true;
    placeholder.selected = true;
    select.appendChild(placeholder);

    results.forEach((row, i) => {
      const opt = document.createElement('option');
      const cells = vars.map(v => row[v]);

      if (vars.length === 1) {
        opt.textContent = cellText(cells[0]);
        opt.value = cellValue(cells[0]);
      } else if (vars.length === 2) {
        opt.textContent = cellText(cells[0]);
        opt.value = cellValue(cells[1]);
      } else {
        opt.textContent = `${cellText(cells[0])} — ${cellText(cells[1])}`;
        opt.value = cellValue(cells[cells.length - 1]);
      }
      opt.dataset.rowIndex = String(i);
      select.appendChild(opt);
    });

    select.addEventListener('change', () => {
      const i = parseInt(select.options[select.selectedIndex].dataset.rowIndex, 10);
      const row = results[i];
      const value = select.value;
      host?.dispatchEvent(new CustomEvent('sol-select', {
        bubbles: true, composed: true,
        detail: { value, row, index: i },
      }));
    });

    adopt(container.getRootNode(), { sheet: sheet, css: CSS });
    container.appendChild(select);
  }

  /**
   * Built-in view renderer for sol-query — "tabs".
   * Turns a result set of URIs + labels into a <sol-tabs> element. Each row
   * becomes one tab: anchor href = link column, anchor text = label column.
   *
   * Column selection: uses vars named `link` + `label` when present,
   * otherwise falls back to the first two columns in order (1st = link,
   * 2nd = label). If only one column is returned, it's used for both.
   *
   * Any additional result columns are forwarded as attributes on the anchor,
   * so <sol-tabs> can pass them through to the panel component. e.g. a query
   * with `?link ?label ?view` lets the `view` value land on the panel element.
   *
   * The handler attribute on <sol-query view="tabs"> is forwarded onto the
   * <sol-tabs> element, so authors can choose the component each tab wraps
   * around:
   *   <sol-query view="tabs" handler="sol-live-edit" …>
   *
   * Usage: <sol-query view="tabs" endpoint="…" sparql="SELECT ?link ?label …">
   */

  async function render(container, data, host) {
    const { vars, results } = data;
    if (!results?.length) { container.textContent = 'No results'; return; }

    const hasNamed = vars.includes('link') && vars.includes('label');
    const linkVar  = hasNamed ? 'link'  : vars[0];
    const labelVar = hasNamed ? 'label' : (vars[1] ?? vars[0]);
    const extraVars = vars.filter(v => v !== linkVar && v !== labelVar);

    await import(new URL('../sol-tabs.js', (typeof document === 'undefined' && typeof location === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : typeof document === 'undefined' ? location.href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('sol-query.umd.js', document.baseURI).href))).href);

    const tabs = document.createElement('sol-tabs');

    // Forward a handler from the host sol-query (if any) to the new tabs.
    const handler = host?.getAttribute?.('handler');
    if (handler) tabs.setAttribute('handler', handler);

    for (const row of results) {
      const url   = row[linkVar]?.value;
      const label = row[labelVar]?.value || url || '';
      if (!url) continue;
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.textContent = label;
      for (const v of extraVars) {
        const cell = row[v];
        if (cell?.value != null) a.setAttribute(v, cell.value);
      }
      tabs.appendChild(a);
    }

    container.appendChild(tabs);
  }

  /**
   * <sol-query> — Query and display RDF / Linked Data from plain HTML.
   *
   * Supports triple patterns, inline SPARQL, stored SPARQL queries, and
   * CSS-selector extraction from RDFa documents. Results render via
   * pluggable views (table, dl, list, accordion, anchorlist, auto-complete,
   * menu, rolodex, select, tabs).
   *
   * @element sol-query
   * @attr {string} endpoint - URL of the RDF document or SPARQL endpoint
   * @attr {string} pattern - triple pattern (e.g. "?s ?p ?o") or CSS selector
   * @attr {string} sparql - inline SPARQL string or URL of a stored SPARQL query
   * @attr {string} query - alias for sparql
   * @attr {string} view - result view: table (default), dl, list, accordion,
   *   anchorlist, auto-complete, menu, rolodex, select, tabs
   * @attr {string} var-* - bind SPARQL variables (e.g. var-name="Alice")
   *
   * @fires sol-deref — detail: { uri }; cancelable, default navigates endpoint
   * @fires sol-select — detail: { value, row, index }; from select/auto-complete/rolodex views
   *
   * @example
   * <sol-query endpoint="https://example.org/data.ttl"></sol-query>
   * <sol-query endpoint="data.ttl" pattern="?s foaf:name ?name"></sol-query>
   * <sol-query endpoint="https://dbpedia.org/sparql"
   *            sparql="SELECT ?s ?label WHERE { ?s a dbo:City; rdfs:label ?label } LIMIT 10"
   *            view="table"></sol-query>
   */

  const BUILTIN_VIEWS = {
    table:           render$9,
    dl:              render$8,
    list:            render$7,
    accordion:       render$6,
    anchorlist:      render$5,
    'auto-complete': render$4,
    menu:            render$3,
    rolodex:         render$2,
    select:          render$1,
    tabs:            render,
  };

  /**
   * Query and display RDF / Linked Data from plain HTML.
   *
   * Supports triple patterns, inline/stored SPARQL, and CSS-selector
   * extraction from RDFa documents. Results render via pluggable views.
   *
   * @class SolQuery
   * @extends HTMLElement
   * @attr {string} endpoint - URL of the RDF document or SPARQL endpoint
   * @attr {string} pattern - triple pattern or CSS selector (alias: wanted)
   * @attr {string} sparql - inline SPARQL string or URL of a stored query
   * @attr {string} query - alias for sparql
   * @attr {string} view - result view: table|dl|list|accordion|anchorlist|auto-complete|menu|rolodex|select|tabs
   * @fires sol-deref - detail: { uri }; cancelable, default navigates endpoint
   * @fires sol-select - detail: { value, row, index }; from select/auto-complete/rolodex views
   */
  class SolQuery extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.render();
    }

    static get observedAttributes() {
      return ['endpoint', 'pattern', 'wanted', 'sparql', 'query', 'view'];
    }

    connectedCallback() {
      if (this.isConnected) this.initializeQuery();
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue !== newValue && this.isConnected) {
        if (['endpoint', 'pattern', 'wanted', 'sparql', 'query'].includes(name) || name.startsWith('var-')) {
          this.initializeQuery();
        }
      }
    }

    // `query` is accepted as an alias for `sparql` so authors can write either.
    _sparqlAttr() {
      return this.getAttribute('sparql') ?? this.getAttribute('query');
    }

    // `wanted` is accepted as an alias for `pattern`.
    _patternAttr() {
      return this.getAttribute('pattern') ?? this.getAttribute('wanted');
    }

    render() {
      this.shadowRoot.innerHTML = `
      <div class="container" role="region" aria-live="polite" aria-label="Query results">
        <div class="loading">Ready to execute query...</div>
      </div>
    `;
      adopt(this.shadowRoot, { sheet: sheet$5, css: CSS$5 });
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
          this.removeAttribute('sparql');
          this.removeAttribute('pattern');
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
      } else if (this.hasAttribute('pattern') || this.hasAttribute('wanted')) {
        await this.handleTriplePattern();
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
            try { assertSafeQuery(query); } catch (err) { this.renderer.showError(err.message); return; }
            this.executeQuery(query);
          } else this.renderer.showError('No query found in RDF file');
        } catch (err) {
          this.renderer.showError(`Failed to load query: ${err.message}`);
        }
      }
    }

    // ─── Triple pattern / CSS selector ───────────────────────────────────────────
    async handleTriplePattern() {
      const pattern  = this._patternAttr();
      const endpoint = this.getAttribute('endpoint');

      this.renderer.showLoading('Loading…');
      try {
        const store = await loadRdfStore(endpoint);

        if (store._isHtml) {
          const validation = TriplePatternValidator.validate(pattern);
          if (!validation.valid) {
            const results = queryHtmlWithSelector(store._rawHtml, endpoint, pattern);
            if (!results.results.length) { this.renderer.showError('No elements matched selector'); return; }
            return this._dispatchResults(results);
          }
        } else {
          const validation = TriplePatternValidator.validate(pattern);
          if (!validation.valid) { this.renderer.showError(validation.error); return; }
        }

        const rdflib = rdf;
        const [s, p, o] = parsePatternParts(pattern, rdflib, {}, endpoint);
        const names = patternVarNames(pattern);

        // When only the subject is a variable (e.g. `?person schema:gender "female"`),
        // widen each matched subject into a row with one column per predicate so
        // authors get a useful property table instead of a single-column list.
        let results;
        if (!s && p && o) {
          const stmts = store.match(null, p, o, null) || [];
          const seen = new Set();
          const subjects = [];
          for (const st of stmts) {
            if (!seen.has(st.subject.value)) {
              seen.add(st.subject.value);
              subjects.push(st.subject);
            }
          }
          results = pivotSubjectsToRows(store, subjects, names.s || 's');
        } else {
          results = expandBnodes(store, matchStore(store, s, p, o, names));
        }
        results = promoteDisplayColumns(results, names.s || 's');
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
          const rdflib = rdf;
          results = matchStore(store, rdflib.sym(endpoint), null, null);
        } else {
          // Pivot by subject: one row per subject, columns per predicate —
          // reads as a property table rather than a flat list of triples.
          const stmts = typeof store.match === 'function' ? store.match(null, null, null) : [];
          const seen = new Set();
          const subjects = [];
          for (const st of stmts) {
            if (!seen.has(st.subject.value)) {
              seen.add(st.subject.value);
              subjects.push(st.subject);
            }
          }
          results = pivotSubjectsToRows(store, subjects, 's');
        }
        results = expandBnodes(store, results);
        if (!results.results.length) {
          this.renderer.showError(store._isHtml ? 'No RDFa found in HTML page' : 'No RDF data found at endpoint');
          return;
        }
        if (isSubjectQuery) {
          this._renderSubject(results);
        } else {
          this._dispatchResults(promoteDisplayColumns(results, 's'));
        }
      } catch (err) {
        this.showDiagnostics(err);
      }
    }

    // Single-subject view: H2 banner with name/label/title, then one row per
    // predicate ("field value") — rdf:type first, other properties after.
    // Rendered inline so every row is styled the same — no table header,
    // no promoted <dt>, no special treatment for the type row.
    _renderSubject(results) {
      const NAME_PREDS = [
        'http://xmlns.com/foaf/0.1/name',
        'https://schema.org/name',
        'http://schema.org/name',
        'http://purl.org/dc/terms/title',
        'http://purl.org/dc/elements/1.1/title',
        'http://www.w3.org/2000/01/rdf-schema#label',
      ];
      const TYPE_PRED = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
      const shortName = uri => (uri || '').replace(/.*[/#]([^/#]+)\/?$/, '$1') || uri;

      const nameRow  = results.results.find(r => NAME_PREDS.includes(r.p?.value));
      const rest     = nameRow ? results.results.filter(r => r !== nameRow) : results.results;
      const typeRows = rest.filter(r => r.p?.value === TYPE_PRED);
      const others   = rest.filter(r => r.p?.value !== TYPE_PRED);
      const ordered  = [...typeRows, ...others];

      const container = this.shadowRoot.querySelector('.container');
      container.innerHTML = '';

      if (nameRow?.o?.value) {
        const h2 = document.createElement('h2');
        h2.className = 'sol-subject-header';
        h2.textContent = nameRow.o.value;
        container.appendChild(h2);
      }

      const dl = document.createElement('dl');
      for (const row of ordered) {
        const dd = document.createElement('dd');
        const label = document.createElement('span');
        label.className = 'dl-field';
        label.textContent = `${shortName(row.p?.value)} `;
        dd.appendChild(label);

        const value = document.createElement('span');
        value.className = 'dl-value';
        this._appendCell(value, row.o);
        dd.appendChild(value);
        dl.appendChild(dd);
      }
      container.appendChild(dl);
    }

    _appendCell(parent, cell) {
      if (!cell) return;
      if (cell.type === 'uri') {
        const shortName = uri => (uri || '').replace(/.*[/#]([^/#]+)\/?$/, '$1') || uri;
        const a = document.createElement('a');
        a.href = cell.value;
        a.title = cell.value;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.dataset.uri = cell.value;
        a.textContent = shortName(cell.value);
        parent.appendChild(a);
      } else if (cell.type === 'multi') {
        cell.values.forEach((v, i) => {
          if (i > 0) parent.appendChild(document.createTextNode(', '));
          this._appendCell(parent, v);
        });
      } else {
        parent.appendChild(document.createTextNode(cell.value ?? ''));
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

      // Built-in view modules are statically imported (so the all-in-one IIFE
      // bundle inlines them and doesn't try to resolve ./views/<name>.js against
      // the host page URL at runtime).
      const fn = BUILTIN_VIEWS[view];
      if (!fn) {
        this.renderer.showError(`Unknown view: ${view}`);
        return;
      }

      // Table, dl, list get preprocessing (pivot s/p/o, group predicates, scalar display)
      if (view === 'table' || view === 'dl' || view === 'list') {
        this.renderer.renderResults(results, fn, options);
        return;
      }

      const container = this.shadowRoot.querySelector('.container');
      container.innerHTML = '';
      try { await fn(container, results, this); }
      catch (err) { this.renderer.showError(`View "${view}" error: ${err.message}`); }
    }

    async _loadAndRenderView(url, results, byUrl, viewName = null) {
      const container = this.shadowRoot.querySelector('.container');
      container.innerHTML = '<div class="loading">Loading view…</div>';
      try {
        const mod = await import(/* @vite-ignore */ url);
        const fn  = mod.render ?? mod.default;
        if (typeof fn !== 'function')
          throw new Error(`Module must export render(container, data)`);
        container.innerHTML = '';
        fn(container, results, this);
      } catch (err) {
        const label = byUrl ? 'Custom view' : `View "${viewName}"`;
        this.renderer.showError(`${label} error: ${err.message}`);
      }
    }

    // ─── SPARQL execution (with adapter fallback chain) ────────────────────────
    getVariables() {
      const vars = {};
      for (const attr of this.attributes) {
        if (attr.name.startsWith('var-')) vars[attr.name.slice(4)] = attr.value;
      }
      return vars;
    }

    substituteVariables(query) {
      return substituteVariables(query, this.getVariables());
    }

    async executeQuery(query) {
      if (!query) { this.renderer.showError('No query provided'); return; }
      let processed;
      try {
        processed = this.substituteVariables(query);
        assertSafeQuery(processed);
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
    setPattern(triplePattern) { this.setAttribute('pattern', triplePattern); }
    setWanted(triplePattern) { this.setPattern(triplePattern); }
    setSparql(sparql)      { this.setAttribute('sparql', sparql); }
    setVariable(n, v)      { this.setAttribute(`var-${n}`, v); }
    setVariables(obj)      { for (const [k, v] of Object.entries(obj)) this.setVariable(k, v); }

    // ─── Static API ────────────────────────────────────────────────────────────
    // Returns a plain JS array of objects, or a scalar for 1×1 results.
    // Example:
    //   const rows = await SolQuery.run({ endpoint, pattern: '?s foaf:name ?name' });
    //   const name = await SolQuery.run({ endpoint, sparql: 'SELECT ?n WHERE{...}', vars: ['n'] });
    static run(opts) { return runQuery(opts); }

    // ─── Diagnostics ───────────────────────────────────────────────────────────
    showDiagnostics(err) {
      this.renderer.showError(`Failed to load RDF: ${err.message}`);
    }
  }

  define('sol-query', SolQuery);

  exports.SolQuery = SolQuery;

}));
