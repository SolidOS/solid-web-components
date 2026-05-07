(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('rdflib')) :
  typeof define === 'function' && define.amd ? define(['exports', 'rdflib'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.SolQueryRdf = {}, global.$rdf));
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

  // ─── Term utilities ──────────────────────────────────────────────────────────
  function termToString(term) {
    if (!term) return '';
    if (typeof term === 'string') return term;
    if (typeof term.toNT === 'function') return term.toNT();
    if (typeof term.value === 'string') return term.value;
    return String(term);
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

  function _isCurie(token) {
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
    if (_isCurie(term)) {
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

  // ─── Full store → flat renderer results ──────────────────────────────────────
  function storeToResults(store) {
    const stmts = Array.isArray(store.statements)
      ? store.statements
      : (typeof store.match === 'function' ? store.match(null, null, null) : []);

    const results = stmts.map(st => ({
      s: termToCell(st.subject),
      p: termToCell(st.predicate),
      o: termToCell(st.object),
    }));

    return { vars: ['s', 'p', 'o'], results };
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

  exports.ACCEPT_TYPES = ACCEPT_TYPES;
  exports.KNOWN_PREFIXES = KNOWN_PREFIXES;
  exports.RdflibSparqlAdapter = RdflibSparqlAdapter;
  exports._NAMED_VAR_RE = _NAMED_VAR_RE;
  exports._isRdfDoc = isRdfDoc;
  exports._selectVars = selectVars;
  exports.detectFormat = detectFormat;
  exports.execSparql = execSparql;
  exports.expandBnodes = expandBnodes;
  exports.expandCurie = expandCurie;
  exports.fetchQueryFromRdf = fetchQueryFromRdf;
  exports.loadRdfStore = loadRdfStore;
  exports.matchStore = matchStore;
  exports.miniTermToNode = triplePatternTermToNode;
  exports.parsePatternParts = parsePatternParts;
  exports.patternVarNames = patternVarNames;
  exports.pivotSubjectsToRows = pivotSubjectsToRows;
  exports.promoteDisplayColumns = promoteDisplayColumns;
  exports.queryHtmlWithSelector = queryHtmlWithSelector;
  exports.rdf = rdf;
  exports.runQuery = runQuery;
  exports.sanitizeHtml = sanitizeHtml;
  exports.storeToResults = storeToResults;
  exports.termToCell = termToCell;
  exports.termToString = termToString;
  exports.tokenizeTriplePattern = tokenizeTriplePattern;
  exports.triplePatternTermToNode = triplePatternTermToNode;

}));
