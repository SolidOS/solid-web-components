// All RDF operations for sol-query.
// Adapters (SPARQL execution), store loading, triple-pattern matching.

import {
  sanitizeHtml,
  toPlainResults,
  ComunicaSparqlAdapter,
  NativeSparqlAdapter,
} from './utils.js';
import { rdf } from './rdf.js';

// Re-export pure-logic functions from rdf-core so existing importers
// (sol-query.js, views, tests) continue to work unchanged.
export {
  KNOWN_PREFIXES,
  ACCEPT_TYPES,
  detectFormat,
  termToString,
  termToCell,
  expandCurie,
  knownPrefixesAsSparql,
  w3cResults,
  _NAMED_VAR_RE,
  triplePatternTermToNode,
  tokenizeTriplePattern,
  parsePatternParts,
  patternVarNames,
  matchStore,
  selectVars as _selectVars,
  isRdfDoc as _isRdfDoc,
} from './rdf-core.js';

import {
  ACCEPT_TYPES,
  detectFormat,
  termToCell,
  parsePatternParts,
  matchStore,
  patternVarNames,
  selectVars as _selectVars,
  isRdfDoc as _isRdfDoc,
  bindingsToResults,
  w3cResults,
} from './rdf-core.js';

// Re-export the rdf singleton so downstream can import either symbol
export { rdf };

// Re-export sanitizeHtml so downstream (sol-include) can import from here or utils
export { sanitizeHtml };
// Re-export queryHtmlWithSelector for sol-query.js
export { queryHtmlWithSelector } from './utils.js';

// Backwards-compatible alias (deprecated — prefer triplePatternTermToNode).
export { triplePatternTermToNode as miniTermToNode } from './rdf-core.js';

// ─── Store loading ───────────────────────────────────────────────────────────

export async function loadRdfStore(endpoint, fetchFn = fetch, opts = {}) {
  if (!rdf.isReady()) throw new Error('rdflib not available');
  const rdflib = rdf;

  // Parsers (notably JSON-LD) require an absolute base IRI, so resolve relative
  // endpoints against the current document before handing them to rdflib.parse.
  try { endpoint = new URL(endpoint, document.baseURI).href; } catch {}

  // shared=true routes parsing into rdf.store (the singleton shared with
  // solid-logic/solid-ui/mashlib) and dedupes subsequent loads of the same
  // URL. Intended for stored-query RDF libraries where many <sol-query>
  // elements reference the same .ttl file.
  //
  // Cache reads are unconditional: once a URL is in the singleton (because
  // some earlier caller asked for shared), every subsequent load hits the
  // cache regardless of opts. Cache writes still require shared, so callers
  // can't pollute the singleton without opting in.
  const shared = !!opts.shared;
  if (rdf.isLoaded(endpoint)) return rdf.store;

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
export function expandBnodes(store, data) {
  let vars     = data.head.vars;
  let bindings = data.results.bindings;

  if (bindings.length > 0) {
    const allBnodeCols = vars.filter(v => bindings.every(r => r[v]?.type === 'bnode'));
    if (allBnodeCols.length) {
      vars = vars.filter(v => !allBnodeCols.includes(v));
      bindings = bindings.map(r => {
        const nr = { ...r };
        allBnodeCols.forEach(v => delete nr[v]);
        return nr;
      });
    }
  }

  const objVars = vars.filter(v => v !== 's' && v !== 'p');
  const hasBnode = bindings.some(row => objVars.some(v => row[v]?.type === 'bnode'));
  if (!hasBnode) return w3cResults(vars, bindings);

  bindings = bindings.map(row => {
    const newRow = {};
    for (const [k, cell] of Object.entries(row)) {
      newRow[k] = (objVars.includes(k) && cell?.type === 'bnode')
        ? _bnodeToModal(store, cell._term)
        : cell;
    }
    return newRow;
  });
  return w3cResults(vars, bindings);
}

function _bnodeToModal(store, bnodeTerm) {
  const stmts = (store.match(bnodeTerm, null, null, null) || [])
    .filter(st => st.object.termType !== 'BlankNode');
  const bindings = stmts.map(st => ({
    p: termToCell(st.predicate),
    o: termToCell(st.object),
  }));
  return { type: 'bnode', value: '[…]', _data: w3cResults(['p', 'o'], bindings) };
}

// ─── Widen subjects into rows-of-properties ──────────────────────────────────
export function pivotSubjectsToRows(store, subjects, subjectName = 's') {
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
  return w3cResults(cols, rows);
}

export function promoteDisplayColumns(data, subjectCol) {
  let cols = data.head.vars.filter(v => v !== subjectCol);
  const lead = cols.find(v => /^(name|label|title)$/i.test(v));
  if (lead) cols = [lead, ...cols.filter(v => v !== lead)];
  return w3cResults(cols, data.results.bindings);
}

// ─── Full store → flat renderer results ──────────────────────────────────────
export function storeToResults(store) {
  const stmts = Array.isArray(store.statements)
    ? store.statements
    : (typeof store.match === 'function' ? store.match(null, null, null) : []);

  const bindings = stmts.map(st => ({
    s: termToCell(st.subject),
    p: termToCell(st.predicate),
    o: termToCell(st.object),
  }));

  return w3cResults(['s', 'p', 'o'], bindings);
}

// ─── Fetch SPARQL query text from an RDF file ────────────────────────────────
export async function fetchQueryFromRdf(queryUrl, fetchFn = fetch) {
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
export async function runQuery({ endpoint, sparql, pattern, wanted, vars: patternVars } = {}) {
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

  // rdflib's local SPARQL parses LIMIT/OFFSET/ORDER BY but doesn't enforce
  // them, so a query with these clauses silently returns the unbounded /
  // unsorted result set. Surface it instead of letting the user wonder why
  // their LIMIT is being ignored. To honor these clauses, load Comunica
  // (e.g. via the vendored UMD: `<script src=".../@comunica-query-sparql.umd.js">`).
  if (/\b(LIMIT|OFFSET|ORDER\s+BY)\b/i.test(queryText)) {
    console.warn(
      '[sol-query] LIMIT/OFFSET/ORDER BY present but rdflib local SPARQL ignores them. ' +
      'Load @comunica/query-sparql to enforce these clauses against RDF documents.'
    );
  }

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
// `fetchFn` is the authenticated fetch (from getAuthFetch) when one is
// available; passed to Comunica via its query context and to the native
// SPARQL adapter for endpoints that aren't RDF documents.
export async function execSparql(query, endpoint, fetchFn) {
  // Multi-source federation only works through Comunica.
  if (Array.isArray(endpoint)) {
    const factory = ComunicaSparqlAdapter.getComunicaEngine();
    if (!factory) throw new Error('Multiple endpoints require Comunica');
    return await new ComunicaSparqlAdapter(factory).executeQuery(query, endpoint, fetchFn);
  }

  try { endpoint = new URL(endpoint, document.baseURI).href; } catch {}

  const isRdf = _isRdfDoc(endpoint);

  const comunicaFactory = ComunicaSparqlAdapter.getComunicaEngine();
  if (comunicaFactory) {
    try { return await new ComunicaSparqlAdapter(comunicaFactory).executeQuery(query, endpoint, fetchFn); }
    catch (err) {
      console.warn('[sol-query] Comunica failed, falling back to rdflib:', err);
    }
  } else if (typeof window !== 'undefined' && window.Comunica) {
    console.warn('[sol-query] window.Comunica is set but no QueryEngine factory was found.',
      'Top-level keys:', Object.keys(window.Comunica),
      window.Comunica.default ? 'default keys: ' + Object.keys(window.Comunica.default).slice(0, 10).join(', ') : '');
  }

  if (isRdf) {
    return await _localSparql(query, endpoint);
  }

  const rdflibAdapter = new RdflibSparqlAdapter();
  if (rdflibAdapter.isAvailable()) {
    try { return await rdflibAdapter.executeQuery(query, endpoint, true); } catch {
      try { return await rdflibAdapter.executeQuery(query, endpoint, false); } catch {}
    }
  }
  return await new NativeSparqlAdapter().executeQuery(query, endpoint, fetchFn);
}

// ─── SPARQL adapter (rdflib-based) ───────────────────────────────────────────

export class RdflibSparqlAdapter {
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
    const raw = await rdf.sparqlQuery(query, { endpoint, withCredentials });
    const selectVarsResult = _selectVars(query);
    const vars = selectVarsResult
      ?? (raw.length ? Object.keys(raw[0]).filter(k => !k.startsWith('?')) : []);
    const bindings = raw.map(binding => {
      const row = {};
      vars.forEach(v => {
        const val = binding[v];
        const cell = {
          type: val ? (val.termType || 'literal').toLowerCase() : 'literal',
          value: val ? (val.value || String(val)) : '',
        };
        if (val?.language)        cell['xml:lang'] = val.language;
        if (val?.datatype?.value) cell.datatype    = val.datatype.value;
        row[v] = cell;
      });
      return row;
    });
    return w3cResults(vars, bindings);
  }
}
