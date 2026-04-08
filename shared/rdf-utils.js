// All RDF operations for sol-query.
// Adapters (SPARQL execution), store loading, mini-query matching.

import {
  sanitizeHtml,
  toPlainResults,
  ComunicaSparqlAdapter,
  NativeSparqlAdapter,
} from './utils.js';

// Re-export sanitizeHtml so downstream (sol-include) can import from here or utils
export { sanitizeHtml };
// Re-export queryHtmlWithSelector for sol-query.js
export { queryHtmlWithSelector } from './utils.js';

// ─── Namespace prefixes ───────────────────────────────────────────────────────
export const KNOWN_PREFIXES = {
  rdf:    'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  rdfs:   'http://www.w3.org/2000/01/rdf-schema#',
  owl:    'http://www.w3.org/2002/07/owl#',
  xsd:    'http://www.w3.org/2001/XMLSchema#',
  foaf:   'http://xmlns.com/foaf/0.1/',
  schema: 'https://schema.org/',
  dc:     'http://purl.org/dc/elements/1.1/',
  dct:    'http://purl.org/dc/terms/',
  skos:   'http://www.w3.org/2004/02/skos/core#',
  pim:    'http://www.w3.org/ns/pim/space#',
  acl:    'http://www.w3.org/ns/auth/acl#',
  ldp:    'http://www.w3.org/ns/ldp#',
  solid:  'http://www.w3.org/ns/solid/terms#',
  vcard:  'http://www.w3.org/2006/vcard/ns#',
  sioc:   'http://rdfs.org/sioc/ns#',
  cert:   'http://www.w3.org/ns/auth/cert#',
  geo:    'http://www.w3.org/2003/01/geo/wgs84_pos#',
  wot:    'http://xmlns.com/wot/0.1/',
  bio:    'http://purl.org/vocab/bio/0.1/',
  dbo:    'http://dbpedia.org/ontology/',
  dbr:    'http://dbpedia.org/resource/',
  dbp:    'http://dbpedia.org/property/',
};

// ─── rdflib import (lazy, cached) ────────────────────────────────────────────
// Resolution order:
//   1. window.$rdf  — set by host page (e.g. import * as $rdf from 'rdflib'; window.$rdf = $rdf)
//   2. window.rdflib — set by UMD bundle
//   3. dynamic import('rdflib') — resolved by importmap or bundler
let _rdflib = null;

function _unwrapRdflib(candidate) {
  if (!candidate) return null;
  // Named exports directly on the object (import * as $rdf)
  if (typeof candidate.graph === 'function' || typeof candidate.sym === 'function') return candidate;
  // Default export wrapping (some bundlers)
  if (candidate.default && typeof candidate.default.graph === 'function') return candidate.default;
  // Trust it anyway if caller explicitly set window.$rdf
  return candidate;
}

export async function getRdflib() {
  if (_rdflib) return _rdflib;
  // 1. Explicit globals
  const win = typeof window !== 'undefined' ? window : {};
  const g = _unwrapRdflib(win.$rdf) || _unwrapRdflib(win.rdflib);
  if (g) { _rdflib = g; return g; }
  // 2. Dynamic import (importmap / bundler)
  try {
    const mod = await import('rdflib');
    const lib = _unwrapRdflib(mod);
    if (lib) { _rdflib = lib; return lib; }
  } catch {}
  return null;
}

// ─── Store loading ────────────────────────────────────────────────────────────
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

export async function loadRdfStore(endpoint, fetchFn = fetch) {
  const rdflib = await getRdflib();
  if (!rdflib) throw new Error('rdflib not available');

  const store = rdflib.graph();
  const diagnostics = [];
  let lastError = null;

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
          return store;
        } catch (rdfa) {
          lastError = new Error(`Server returned HTML (${ct})`);
          continue;
        }
      }

      try {
        rdflib.parse(text, store, endpoint, detectFormat(ct, accept));
        store._diagnostics = diagnostics;
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
          return store;
        } catch {}
      } else {
        try {
          rdflib.parse(text, store, endpoint, detectFormat(ct, ''));
          store._diagnostics = diagnostics;
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

// ─── Term utilities ───────────────────────────────────────────────────────────
export function termToString(term) {
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

// ─── Blank-node processing ────────────────────────────────────────────────────
// • If every subject is a blank node, drop the 's' column (it adds no info).
// • Convert bnode object cells to modal-detail cells so the renderer can show
//   them as clickable links opening an inline property table.
export function expandBnodes(store, data) {
  let { vars, results } = data;

  // Drop any column where every value is a blank node (adds no display value)
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

  // Expand bnode objects → modal-detail cells (one level deep only)
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

// Build the modal-detail cell for a blank node: fetches its p/o pairs from the
// store (nested bnodes in object position are omitted to avoid infinite depth).
function _bnodeToModal(store, bnodeTerm) {
  const stmts = (store.match(bnodeTerm, null, null, null) || [])
    .filter(st => st.object.termType !== 'BlankNode');
  const results = stmts.map(st => ({
    p: termToCell(st.predicate),
    o: termToCell(st.object),
  }));
  return { type: 'bnode', value: '[…]', _data: { vars: ['p', 'o'], results } };
}

// ─── CURIE expansion ─────────────────────────────────────────────────────────
export function expandCurie(curie, extraPrefixes = {}) {
  const colon = curie.indexOf(':');
  if (colon < 0) return null;
  const prefix = curie.slice(0, colon);
  const local  = curie.slice(colon + 1);
  const ns = extraPrefixes[prefix] || KNOWN_PREFIXES[prefix];
  return ns ? ns + local : null;
}

// ─── Mini-query term → rdflib node (null = wildcard) ─────────────────────────
// '?' or '?varname' → null (wildcard for store.match)
// '<uri>'           → NamedNode
// '"literal"'       → Literal (with optional ^^type or @lang)
// 'prefix:local'    → NamedNode via KNOWN_PREFIXES (or extraPrefixes)
// bare word         → Literal (no baseURI expansion)
function _isCurie(token) {
  // prefix:local — prefix is alphanumeric, local doesn't start with // (avoids http://)
  return /^[a-zA-Z][a-zA-Z0-9]*:[^/\s]/.test(token);
}

// Resolve a term against a base URI:
//   #fragment        → baseDoc + '#fragment'
//   <#fragment>      → baseDoc + '#fragment'
//   relative/path    → new URL(term, base).href
function _resolveUri(raw, baseUri) {
  if (!baseUri) return raw;
  const docBase = baseUri.split('#')[0];
  if (raw.startsWith('#'))  return docBase + raw;
  try { return new URL(raw, baseUri).href; } catch { return raw; }
}

export function miniTermToNode(term, rdflib, extraPrefixes = {}, baseUri = '') {
  if (!term || term === '?' || term.startsWith('?')) return null;
  if (term.startsWith('<') && term.endsWith('>')) {
    const inner = term.slice(1, -1);
    // Resolve relative IRIs inside angle brackets: <#me>, <./foo>
    const resolved = (inner.startsWith('#') || inner.startsWith('.') || !/^[a-z][a-z0-9+\-.]*:/i.test(inner))
      ? _resolveUri(inner, baseUri)
      : inner;
    return rdflib.sym(resolved);
  }
  if (term.startsWith('"')) {
    const m = term.match(/^"([^"]*)"(?:\^\^<([^>]+)>|@([a-z-]+))?$/i);
    if (m) return rdflib.literal(m[1], m[3] || (m[2] ? rdflib.sym(m[2]) : undefined));
    return rdflib.literal(term.slice(1, -1));
  }
  // #fragment shorthand (no angle brackets)
  if (term.startsWith('#') && baseUri) return rdflib.sym(_resolveUri(term, baseUri));
  if (_isCurie(term)) {
    const expanded = expandCurie(term, extraPrefixes);
    return rdflib.sym(expanded || term);
  }
  // Bare word → literal
  return rdflib.literal(term);
}

// ─── Parse a full wanted string into [sNode, pNode, oNode] ───────────────────
// Multi-word object: everything from index 2 joined — if not IRI/CURIE/wildcard,
// the whole remainder is treated as a literal (e.g. "? ex:name john w. smith"
// → null, ex:name node, literal("john w. smith"))
// baseUri: used to resolve relative/fragment URIs like #me or <#profile>
export function parseWantedParts(wanted, rdflib, extraPrefixes = {}, baseUri = '') {
  const tokens = wanted.trim().split(/\s+/);
  if (tokens.length < 3) throw new Error('Mini-query needs 3 parts: subject predicate object');

  const s = miniTermToNode(tokens[0], rdflib, extraPrefixes, baseUri);
  const p = miniTermToNode(tokens[1], rdflib, extraPrefixes, baseUri);
  const o = _parseObjectTerm(tokens.slice(2).join(' '), rdflib, extraPrefixes, baseUri);
  return [s, p, o];
}

function _parseObjectTerm(raw, rdflib, extraPrefixes, baseUri = '') {
  const t = raw.trim();
  if (!t || t === '?' || t.startsWith('?')) return null;
  if (t.startsWith('<') && t.endsWith('>')) {
    const inner = t.slice(1, -1);
    const resolved = (inner.startsWith('#') || inner.startsWith('.') || !/^[a-z][a-z0-9+\-.]*:/i.test(inner))
      ? _resolveUri(inner, baseUri)
      : inner;
    return rdflib.sym(resolved);
  }
  if (t.startsWith('"')) {
    const m = t.match(/^"([^"]*)"(?:\^\^<([^>]+)>|@([a-z-]+))?$/i);
    if (m) return rdflib.literal(m[1], m[3] || (m[2] ? rdflib.sym(m[2]) : undefined));
    return rdflib.literal(t.endsWith('"') ? t.slice(1, -1) : t.slice(1));
  }
  if (t.startsWith('#') && baseUri) return rdflib.sym(_resolveUri(t, baseUri));
  // Single token that looks like a CURIE → NamedNode
  if (!t.includes(' ') && _isCurie(t)) {
    const expanded = expandCurie(t, extraPrefixes);
    return rdflib.sym(expanded || t);
  }
  // Multi-word or bare word → literal
  return rdflib.literal(t);
}

// ─── store.match → renderer {vars, results} ──────────────────────────────────
// Wildcard positions (null nodes) become the returned variable columns.
// If all three are bound, all three columns are shown anyway.
export function matchStore(store, s, p, o) {
  const stmts = store.match(s, p, o, null);

  const cols = [];
  if (!s) cols.push('s');
  if (!p) cols.push('p');
  if (!o) cols.push('o');
  if (!cols.length) cols.push('s', 'p', 'o');

  const results = stmts.map(st => {
    const row = {};
    for (const col of cols) {
      const node = col === 's' ? st.subject : col === 'p' ? st.predicate : st.object;
      row[col] = termToCell(node);
    }
    return row;
  });

  return { vars: cols, results };
}

// ─── Full store → flat renderer results (all-triples display) ────────────────
export function storeToResults(store) {
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

// ─── Fetch SPARQL query text from an RDF file ─────────────────────────────────
// Uses plain fetch (via loadRdfStore) so no query parameters are appended.
export async function fetchQueryFromRdf(queryUrl, fetchFn = fetch) {
  const rdflib = await getRdflib();
  if (!rdflib) throw new Error('rdflib not available');

  const docUrl = queryUrl.split('#')[0];
  const store  = await loadRdfStore(docUrl, fetchFn);

  const subject = rdflib.sym(queryUrl);
  const q = store.any(subject, rdflib.sym('http://www.w3.org/ns/sparql#query'))
         || store.any(subject, rdflib.sym('http://www.w3.org/2000/01/rdf-schema#comment'))
         || store.any(subject, rdflib.sym('http://purl.org/dc/terms/description'));

  if (!q) throw new Error(`No query found at ${queryUrl}`);
  return q.value;
}

// ─── runQuery: call from a script, returns plain JS values ───────────────────
// Returns an array of plain objects [{col: value, ...}],
// or a single scalar string when there is exactly 1 row × 1 column.
//
// Usage:
//   import { runQuery } from './rdf-utils.js';
//   const rows = await runQuery({ endpoint, wanted: '? foaf:name ?' });
//   const name = await runQuery({ endpoint, sparql: 'SELECT ?n WHERE {...}', vars: ['n'] });
//
// Options:
//   endpoint  {string}   required — RDF document URL or SPARQL endpoint
//   sparql    {string}   inline SPARQL text, or URL of an RDF file containing a query
//   wanted    {string}   mini-query pattern (3+ tokens; endpoint must be an RDF doc)
//   vars      {string[]} restrict which columns appear in output (default: all)
export async function runQuery({ endpoint, sparql, wanted, vars: wantedVars } = {}) {
  if (!endpoint) throw new Error('endpoint is required');
  if (!sparql && !wanted) throw new Error('sparql or wanted is required');

  let data;

  if (sparql) {
    let queryText = sparql;
    const isStoredRef = !/\s/.test(sparql) && /^https?:\/\/|^\/|^\.\.?\//.test(sparql.trim());
    if (isStoredRef) queryText = await fetchQueryFromRdf(sparql);
    data = await execSparql(queryText, endpoint);
  } else {
    const store  = await loadRdfStore(endpoint);
    const rdflib = await getRdflib();
    const [s, p, o] = parseWantedParts(wanted, rdflib, {}, endpoint);
    data = matchStore(store, s, p, o);
  }

  return toPlainResults(data, wantedVars);
}

// ─── Detect whether a URL is a static RDF document (not a SPARQL endpoint) ───
function _isRdfDoc(url) {
  return /\.(ttl|rdf|n3|jsonld|nt|nq|owl|trig)(\?|#|$)/i.test(url);
}

// ─── Extract SELECT-clause variable names from SPARQL text ───────────────────
// Captures everything between SELECT [DISTINCT|REDUCED] and WHERE, then picks
// out the ?variable names.  Returns null for SELECT * (use all binding keys).
function _selectVars(queryText) {
  // Strip line comments so '#' inside strings don't confuse the match
  const stripped = queryText.replace(/#[^\n]*/g, '');
  const m = stripped.match(/\bSELECT\s+(?:DISTINCT\s+|REDUCED\s+)?(.*?)\s+WHERE\b/is);
  if (!m) return null;
  const clause = m[1].trim();
  if (clause === '*') return null;
  const vars = clause.match(/\?\w+/g);
  return vars ? vars.map(v => v.slice(1)) : null;
}

// ─── Run SPARQL against a pre-loaded rdflib store (no HTTP query params) ─────
async function _localSparql(queryText, endpoint) {
  const rdflib = await getRdflib();
  if (!rdflib?.SPARQLToQuery) throw new Error('rdflib SPARQL engine not available');

  const store  = await loadRdfStore(endpoint);
  const parsed = rdflib.SPARQLToQuery(queryText, false, store);
  if (!parsed) throw new Error('Could not parse SPARQL query');

  // Only return the variables named in the SELECT clause (rdflib bindings include
  // all pattern variables, not just the projected ones).
  const selectVars = _selectVars(queryText);

  return new Promise((resolve, reject) => {
    const bindings = [];
    try {
      store.query(
        parsed,
        b  => bindings.push(b),
        new rdflib.Fetcher(store),
        () => {
          const allKeys = bindings.length
            ? Object.keys(bindings[0]).map(k => k.replace(/^\?/, ''))
            : [];
          const vars = selectVars
            ? allKeys.filter(v => selectVars.includes(v))
            : allKeys;
          const results = bindings.map(b => {
            const row = {};
            for (const v of vars) {
              const node = b[`?${v}`];
              row[v] = node ? termToCell(node) : { type: 'literal', value: '' };
            }
            return row;
          });
          resolve({ vars, results });
        },
      );
    } catch (err) {
      reject(err);
    }
  });
}

// ─── SPARQL execution: RDF docs run locally; SPARQL endpoints use protocol ───
export async function execSparql(query, endpoint) {
  // Static RDF file → load store, run locally (never appends ?query=… params)
  if (_isRdfDoc(endpoint)) {
    return await _localSparql(query, endpoint);
  }

  // Remote SPARQL endpoint → adapter fallback chain
  const comunicaFactory = ComunicaSparqlAdapter.getComunicaEngine();
  if (comunicaFactory) {
    try { return await new ComunicaSparqlAdapter(comunicaFactory).executeQuery(query, endpoint); } catch {}
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

export class RdflibSparqlAdapter {
  constructor() {
    this.$rdf = null;
    // resolved lazily in isAvailable / executeQuery
  }

  isAvailable() {
    return !!(window.$rdf);
  }

  async executeQuery(query, endpoint, withCredentials = true) {
    const rdflib = await getRdflib();
    if (!rdflib) throw new Error('rdflib not available');
    try {
      return await this._attempt(rdflib, query, endpoint, withCredentials);
    } catch (err) {
      if (withCredentials) {
        return await this._attempt(rdflib, query, endpoint, false);
      }
      throw err;
    }
  }

  async _attempt(rdflib, query, endpoint, withCredentials) {
    const results = await rdflib.sparqlQuery(query, { endpoint, withCredentials });
    const vars = results.length ? Object.keys(results[0]).filter(k => !k.startsWith('?')) : [];
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
