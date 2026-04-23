// Node.js version of sol-query — same options as the web component,
// returns plain JS data instead of rendering HTML.
//
// Usage:
//   import { solQuery } from 'solid-web-components/node';
//   const data = await solQuery({ endpoint, sparql: 'SELECT ...' });
//   const data = await solQuery({ endpoint, wanted: '?s foaf:name ?o' });
//   const data = await solQuery({ endpoint, sparql: 'SELECT ...', vars: { name: 'Alice' } });

import * as rdflib from 'rdflib';
import { toPlainResults } from './shared/utils.js';
import {
  ACCEPT_TYPES,
  detectFormat,
  termToCell,
  parseWantedParts,
  wantedVarNames,
  matchStore,
  selectVars,
  isRdfDoc,
} from './shared/rdf-core.js';

// ─── Load & parse RDF from a URL ────────────────────────────────────────────
async function loadRdfStore(endpoint, fetchFn = globalThis.fetch) {
  const store = rdflib.graph();
  let lastError = null;

  for (const accept of ACCEPT_TYPES) {
    try {
      const resp = await fetchFn(endpoint, { headers: { Accept: accept } });
      if (!resp.ok) { lastError = new Error(`HTTP ${resp.status}`); if (resp.status === 405) break; continue; }
      const text = await resp.text();
      const ct = (resp.headers.get('content-type') || '').split(';')[0].trim();
      if (ct.includes('html') || /<html/i.test(text)) { lastError = new Error('Server returned HTML'); continue; }
      try {
        rdflib.parse(text, store, endpoint, detectFormat(ct, accept));
        return store;
      } catch (parseErr) { lastError = parseErr; }
    } catch (err) { lastError = err; }
  }

  // Last resort: no Accept header
  try {
    const resp = await fetchFn(endpoint);
    if (resp.ok) {
      const text = await resp.text();
      const ct = (resp.headers.get('content-type') || '').split(';')[0].trim();
      if (!ct.includes('html') && !/<html/i.test(text)) {
        rdflib.parse(text, store, endpoint, detectFormat(ct, ''));
        return store;
      }
    }
  } catch (err) { lastError = err; }

  throw lastError || new Error('Failed to load or parse RDF');
}

// ─── SPARQL execution (Node) ────────────────────────────────────────────────
async function _localSparql(queryText, endpoint, fetchFn) {
  const store  = await loadRdfStore(endpoint, fetchFn);
  const parsed = rdflib.SPARQLToQuery(queryText, false, store);
  if (!parsed) throw new Error('Could not parse SPARQL query');

  const selectVarsResult = selectVars(queryText);

  return new Promise((resolve, reject) => {
    const bindings = [];
    try {
      store.query(
        parsed,
        b => bindings.push(b),
        new rdflib.Fetcher(store),
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
    } catch (err) { reject(err); }
  });
}

async function execSparql(query, endpoint, fetchFn = globalThis.fetch) {
  if (isRdfDoc(endpoint)) {
    return _localSparql(query, endpoint, fetchFn);
  }
  // Remote SPARQL endpoint: HTTP query
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

// ─── SPARQL safety ──────────────────────────────────────────────────────────
export function assertSafeQuery(query) {
  const m = query.match(/\b(INSERT\s+DATA|INSERT\s+INTO|DELETE\s+DATA|DELETE\s+WHERE|DELETE\s+FROM|DROP|CREATE|CLEAR|LOAD|COPY|MOVE|ADD)\b/i);
  if (m) throw new Error(`Blocked SPARQL operation: ${m[0].toUpperCase()}`);
}

export function sanitizeVarValue(value) {
  if (/[{}]/.test(value)) throw new Error(`Variable value contains disallowed characters: { }`);
  if (/\b(INSERT|DELETE|DROP|CREATE|CLEAR|LOAD|COPY|MOVE|ADD)\b/i.test(value))
    throw new Error(`Variable value contains blocked keyword`);
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/'/g, "\\'");
}

export function substituteVariables(query, vars = {}) {
  let q = query;
  for (const [key, value] of Object.entries(vars)) {
    const safe = sanitizeVarValue(value);
    q = q.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), safe);
  }
  return q;
}

// ─── Main entry point ───────────────────────────────────────────────────────
export async function solQuery(opts = {}) {
  const { endpoint, sparql, query, wanted, vars, columns, fetch: fetchFn } = opts;
  const queryText = sparql ?? query;
  if (!endpoint) throw new Error('endpoint is required');
  if (!queryText && !wanted) throw new Error('sparql or wanted is required');

  const _fetch = fetchFn || globalThis.fetch;
  let data;

  if (queryText) {
    const processed = substituteVariables(queryText, vars);
    assertSafeQuery(processed);
    data = await execSparql(processed, endpoint, _fetch);
  } else {
    const store = await loadRdfStore(endpoint, _fetch);
    const names = wantedVarNames(wanted);
    const [s, p, o] = parseWantedParts(wanted, rdflib, {}, endpoint);
    data = matchStore(store, s, p, o, names);
  }

  return toPlainResults(data, columns);
}

export default solQuery;
