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
export function expandBnodes(store, data) {
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
  return { vars: cols, results: rows };
}

export function promoteDisplayColumns({ vars, results }, subjectCol) {
  let cols = vars.filter(v => v !== subjectCol);
  const lead = cols.find(v => /^(name|label|title)$/i.test(v));
  if (lead) cols = [lead, ...cols.filter(v => v !== lead)];
  return { vars: cols, results };
}

// ─── Full store → flat renderer results ──────────────────────────────────────
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

  const store  = await loadRdfStore(endpoint);
  const parsed = rdf.sparqlToQuery(queryText, false, store);
  if (!parsed) throw new Error('Could not parse SPARQL query');

  const selectVarsResult = _selectVars(queryText);

  return new Promise((resolve, reject) => {
    const bindings = [];
    try {
      store.query(
        parsed,
        b  => bindings.push(b),
        rdf.fetcher(store),
        () => {
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
          resolve({ vars, results });
        },
      );
    } catch (err) {
      reject(err);
    }
  });
}

// ─── SPARQL execution ────────────────────────────────────────────────────────
export async function execSparql(query, endpoint) {
  try { endpoint = new URL(endpoint, document.baseURI).href; } catch {}

  const isRdf = _isRdfDoc(endpoint);

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
    const results = await rdf.sparqlQuery(query, { endpoint, withCredentials });
    const selectVarsResult = _selectVars(query);
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
