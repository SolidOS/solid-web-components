/**
 * @jest-environment jsdom
 *
 * Tests for rdf-utils.js functions not already covered by
 * tests/triple-patterns.test.js:
 *   - termToString
 *   - storeToResults
 *   - expandBnodes (deeper cases)
 *   - matchStore (deeper cases)
 *   - expandCurie (deeper cases)
 *   - loadRdfStore (with mocked fetch)
 *   - fetchQueryFromRdf (with mocked fetch)
 *   - runQuery (pattern-path + sparql-path via stubbed fetch/loader)
 *
 * Uses the rdflib mock in tests/__mocks__/rdflib-esm.js.
 */

import { jest } from '@jest/globals';
import rdflib from './__mocks__/rdflib-esm.js';

// Make sure rdf-utils picks up our mock rdflib as the global.
window.$rdf = rdflib;

import {
  termToString,
  termToCell,
  storeToResults,
  expandBnodes,
  matchStore,
  expandCurie,
  loadRdfStore,
  fetchQueryFromRdf,
  runQuery,
  pivotSubjectsToRows,
  promoteDisplayColumns,
  _selectVars,
  _isRdfDoc,
  KNOWN_PREFIXES,
  ACCEPT_TYPES,
  detectFormat,
} from '../shared/rdf-utils.js';
import { toPlainResults, parseSelectVars } from '../shared/utils.js';

// ── termToString ────────────────────────────────────────────────────────────

describe('termToString', () => {
  test('null/undefined → ""', () => {
    expect(termToString(null)).toBe('');
    expect(termToString(undefined)).toBe('');
  });

  test('string → string', () => {
    expect(termToString('hello')).toBe('hello');
  });

  test('term with toNT → toNT()', () => {
    const term = { toNT: () => '<http://ex/x>', value: 'http://ex/x' };
    expect(termToString(term)).toBe('<http://ex/x>');
  });

  test('term without toNT but with .value → value', () => {
    expect(termToString({ value: 'foo' })).toBe('foo');
  });

  test('falls back to String()', () => {
    const t = { toString() { return 'T()'; } };
    expect(termToString(t)).toBe('T()');
  });
});

// ── expandCurie: extra edges ────────────────────────────────────────────────

describe('expandCurie — extra edges', () => {
  test('empty local part expands to namespace', () => {
    expect(expandCurie('foaf:')).toBe('http://xmlns.com/foaf/0.1/');
  });

  test('multiple colons — only first colon splits', () => {
    // `urn:isbn:123` → prefix="urn" (not known) → null
    expect(expandCurie('urn:isbn:123')).toBeNull();
  });

  test('trailing chars preserved after prefix', () => {
    expect(expandCurie('schema:Person#nested'))
      .toBe('http://schema.org/Person#nested');
  });
});

// ── storeToResults ──────────────────────────────────────────────────────────

describe('storeToResults', () => {
  test('empty store → 0 results, vars [s,p,o]', () => {
    const store = rdflib.graph();
    const r = storeToResults(store);
    expect(r.vars).toEqual(['s', 'p', 'o']);
    expect(r.results).toEqual([]);
  });

  test('populated store → one row per statement', () => {
    const store = rdflib.graph();
    store.add(rdflib.sym('http://ex/a'), rdflib.sym('http://ex/p1'), rdflib.literal('1'));
    store.add(rdflib.sym('http://ex/b'), rdflib.sym('http://ex/p2'), rdflib.sym('http://ex/c'));
    const r = storeToResults(store);
    expect(r.results).toHaveLength(2);
    expect(r.results[0].s.value).toBe('http://ex/a');
    expect(r.results[0].o.type).toBe('literal');
    expect(r.results[1].o.type).toBe('uri');
    expect(r.results[1].o.value).toBe('http://ex/c');
  });

  test('blank-node subject becomes bnode cell', () => {
    const store = rdflib.graph();
    store.add(rdflib.blankNode('b1'), rdflib.sym('http://ex/p'), rdflib.literal('x'));
    const r = storeToResults(store);
    expect(r.results[0].s.type).toBe('bnode');
  });
});

// ── matchStore: extra edges ─────────────────────────────────────────────────

describe('matchStore — extra edges', () => {
  function store() {
    const s = rdflib.graph();
    s.add(rdflib.sym('http://ex/a'), rdflib.sym('http://ex/p'), rdflib.literal('1'));
    s.add(rdflib.sym('http://ex/b'), rdflib.sym('http://ex/p'), rdflib.literal('2'));
    return s;
  }

  test('all wildcards → three-column result', () => {
    const r = matchStore(store(), null, null, null);
    expect(r.vars).toEqual(['s', 'p', 'o']);
    expect(r.results).toHaveLength(2);
  });

  test('wildcard object populates o column with literal cells', () => {
    const r = matchStore(store(), rdflib.sym('http://ex/a'), null, null);
    expect(r.vars).toEqual(['p', 'o']);
    expect(r.results[0].o.type).toBe('literal');
    expect(r.results[0].o.value).toBe('1');
  });

  test('literal-valued object match is exact (non-matching literal → 0 rows)',
    () => {
      const r = matchStore(store(), null, null, rdflib.literal('missing'));
      expect(r.results).toHaveLength(0);
    });

  test('returned cell for NamedNode is type uri', () => {
    const s = rdflib.graph();
    s.add(rdflib.sym('http://ex/a'), rdflib.sym('http://ex/p'), rdflib.sym('http://ex/o'));
    const r = matchStore(s, null, null, null);
    expect(r.results[0].o.type).toBe('uri');
    expect(r.results[0].o.value).toBe('http://ex/o');
  });
});

// ── expandBnodes: extra edges ───────────────────────────────────────────────

describe('expandBnodes — extra edges', () => {
  test('empty results passed through unchanged', () => {
    const store = rdflib.graph();
    const r = expandBnodes(store, { vars: ['s', 'p', 'o'], results: [] });
    expect(r).toEqual({ vars: ['s', 'p', 'o'], results: [] });
  });

  test('no bnodes anywhere → data returned unchanged', () => {
    const store = rdflib.graph();
    const data = {
      vars: ['s', 'p', 'o'],
      results: [
        { s: { type: 'uri', value: 'http://ex/a' },
          p: { type: 'uri', value: 'http://ex/p' },
          o: { type: 'literal', value: 'x' } },
      ],
    };
    expect(expandBnodes(store, data)).toEqual(data);
  });

  test('drops multiple all-bnode columns simultaneously', () => {
    const store = rdflib.graph();
    const data = {
      vars: ['s', 'p', 'o'],
      results: [
        { s: { type: 'bnode', value: 'b0', _term: rdflib.blankNode('b0') },
          p: { type: 'bnode', value: 'b1', _term: rdflib.blankNode('b1') },
          o: { type: 'uri',   value: 'http://ex/x' } },
      ],
    };
    const r = expandBnodes(store, data);
    expect(r.vars).toEqual(['o']);
    expect(r.results[0]).not.toHaveProperty('s');
    expect(r.results[0]).not.toHaveProperty('p');
  });
});

// ── loadRdfStore ────────────────────────────────────────────────────────────

describe('loadRdfStore', () => {
  function makeFetch(responder) {
    return jest.fn(async (url, opts) => responder(url, opts));
  }

  test('returns store when first Accept succeeds with turtle', async () => {
    const fetchFn = makeFetch(async () => ({
      ok: true,
      status: 200,
      headers: { get: (h) => h === 'content-type' ? 'text/turtle' : null },
      text: async () => '<http://ex/a> <http://ex/p> <http://ex/b> .',
    }));
    const store = await loadRdfStore('http://example.org/data.ttl', fetchFn);
    expect(store.statements).toHaveLength(1);
    expect(store._diagnostics.length).toBeGreaterThan(0);
  });

  test('throws on total failure (all Accepts 404)', async () => {
    const fetchFn = makeFetch(async () => ({
      ok: false,
      status: 404,
      headers: { get: () => null },
      text: async () => '',
    }));
    await expect(loadRdfStore('http://example.org/missing.ttl', fetchFn))
      .rejects.toThrow();
  });

  test('stops retrying after 405 Method Not Allowed', async () => {
    const fetchFn = makeFetch(async () => ({
      ok: false,
      status: 405,
      headers: { get: () => null },
      text: async () => '',
    }));
    await expect(loadRdfStore('http://example.org/x.ttl', fetchFn))
      .rejects.toThrow();
    // One call for the 405, then one more no-Accept fallback → 2 total.
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  test('falls back to no-Accept fetch after all Accepts fail', async () => {
    let call = 0;
    const fetchFn = jest.fn(async (_url, opts) => {
      call++;
      if (opts && opts.headers && opts.headers.Accept) {
        return { ok: false, status: 406, headers: { get: () => null }, text: async () => '' };
      }
      return {
        ok: true, status: 200,
        headers: { get: (h) => h === 'content-type' ? 'text/turtle' : null },
        text: async () => '<http://ex/a> <http://ex/p> "ok" .',
      };
    });
    const store = await loadRdfStore('http://example.org/x.ttl', fetchFn);
    expect(store.statements).toHaveLength(1);
    expect(call).toBeGreaterThan(1);
  });
});

// ── fetchQueryFromRdf ───────────────────────────────────────────────────────

describe('fetchQueryFromRdf', () => {
  test('returns the query literal bound via rdfs:comment', async () => {
    const ttl = `<http://example.org/q#MyQ> <http://www.w3.org/2000/01/rdf-schema#comment> "SELECT ?s WHERE { ?s ?p ?o }" .`;
    const fetchFn = jest.fn(async () => ({
      ok: true, status: 200,
      headers: { get: (h) => h === 'content-type' ? 'text/turtle' : null },
      text: async () => ttl,
    }));
    const q = await fetchQueryFromRdf('http://example.org/q#MyQ', fetchFn);
    expect(q).toBe('SELECT ?s WHERE { ?s ?p ?o }');
  });

  test('throws when subject has no query predicate', async () => {
    const ttl = `<http://example.org/q#Other> <http://example.org/p> "x" .`;
    const fetchFn = jest.fn(async () => ({
      ok: true, status: 200,
      headers: { get: (h) => h === 'content-type' ? 'text/turtle' : null },
      text: async () => ttl,
    }));
    await expect(fetchQueryFromRdf('http://example.org/q#Missing', fetchFn))
      .rejects.toThrow(/No query found/);
  });
});

// ── runQuery: pattern path ──────────────────────────────────────────────────

describe('runQuery (pattern path)', () => {
  const ttl = `
<http://example.org/alice> <http://xmlns.com/foaf/0.1/name> "Alice" .
<http://example.org/bob>   <http://xmlns.com/foaf/0.1/name> "Bob" .
`;

  function makeFetch() {
    return jest.fn(async () => ({
      ok: true, status: 200,
      headers: { get: (h) => h === 'content-type' ? 'text/turtle' : null },
      text: async () => ttl,
    }));
  }

  beforeEach(() => { global.fetch = makeFetch(); });
  afterEach(() => { delete global.fetch; });

  test('throws without endpoint', async () => {
    await expect(runQuery({ pattern: '?s ?p ?o' })).rejects.toThrow(/endpoint/);
  });

  test('throws without sparql or pattern', async () => {
    await expect(runQuery({ endpoint: 'http://x' })).rejects.toThrow(/sparql or pattern/);
  });

  test('pattern → all rows', async () => {
    const rows = await runQuery({
      endpoint: 'http://example.org/data.ttl',
      pattern:  '?s foaf:name ?o',
    });
    expect(Array.isArray(rows) || typeof rows === 'string').toBe(true);
    expect(rows).toHaveLength(2);
  });

  test('pattern with bound literal returns single row', async () => {
    const rows = await runQuery({
      endpoint: 'http://example.org/data.ttl',
      pattern:  '?s foaf:name "Alice"',
    });
    expect(typeof rows).toBe('string');
    expect(rows).toBe('http://example.org/alice');
  });

  test('pattern with malformed pattern throws', async () => {
    await expect(runQuery({
      endpoint: 'http://example.org/data.ttl',
      pattern:  '? ? ?',
    })).rejects.toThrow(/named variable/);
  });
});

// ── Shared store: dedupe + external-store adoption ──────────────────────────

describe('shared store via fetchQueryFromRdf', () => {
  const ttl = `<http://example.org/q#MyQ> <http://www.w3.org/2000/01/rdf-schema#comment> "SELECT ?s WHERE { ?s ?p ?o }" .`;
  function makeFetch() {
    return jest.fn(async () => ({
      ok: true, status: 200,
      headers: { get: (h) => h === 'content-type' ? 'text/turtle' : null },
      text: async () => ttl,
    }));
  }

  // Import rdf singleton lazily so the top-of-file rdf-utils import has
  // already wired up the mock rdflib.
  let rdf;
  beforeAll(async () => { ({ rdf } = await import('../shared/rdf.js')); });

  beforeEach(() => {
    // Reset shared state between tests — each test picks its own store.
    rdf._store = null;
    rdf._fetcher = null;
    rdf._loaded.clear();
  });

  test('second fetchQueryFromRdf for same URL hits cache (one fetch)', async () => {
    const fetchFn = makeFetch();
    const q1 = await fetchQueryFromRdf('http://example.org/q#MyQ', fetchFn);
    const q2 = await fetchQueryFromRdf('http://example.org/q#MyQ', fetchFn);
    expect(q1).toBe(q2);
    // Two queries, one URL → only one load (first call). Accept-fallback
    // may fire multiple fetches for a single load; assert dedupe by comparing
    // the count after the second call to the count after the first.
    const afterFirst = fetchFn.mock.calls.length;
    expect(afterFirst).toBeGreaterThan(0);
    await fetchQueryFromRdf('http://example.org/q#MyQ', fetchFn);
    expect(fetchFn.mock.calls.length).toBe(afterFirst);
  });

  test('useStore(external) routes subsequent shared loads into external graph', async () => {
    const external = rdflib.graph();
    rdf.useStore(external);

    const fetchFn = makeFetch();
    await fetchQueryFromRdf('http://example.org/q#MyQ', fetchFn);

    // The parsed triple should now live in the external store, not a
    // throwaway graph.
    expect(external.statements.length).toBeGreaterThan(0);
    expect(external.statements[0].subject.value).toBe('http://example.org/q#MyQ');
  });
});

// ── termToCell ─────────────────────────────────────────────────────────────

describe('termToCell', () => {
  test('null → literal empty', () => {
    expect(termToCell(null)).toEqual({ type: 'literal', value: '' });
  });

  test('NamedNode → uri cell', () => {
    const cell = termToCell(rdflib.sym('http://ex/a'));
    expect(cell.type).toBe('uri');
    expect(cell.value).toBe('http://ex/a');
  });

  test('BlankNode → bnode cell with _term', () => {
    const bn = rdflib.blankNode('b1');
    const cell = termToCell(bn);
    expect(cell.type).toBe('bnode');
    expect(cell._term).toBe(bn);
  });

  test('Literal → literal cell', () => {
    const cell = termToCell(rdflib.literal('hello'));
    expect(cell.type).toBe('literal');
    expect(cell.value).toBe('hello');
  });
});

// ── detectFormat ───────────────────────────────────────────────────────────

describe('detectFormat', () => {
  test('turtle content-type', () => {
    expect(detectFormat('text/turtle', '')).toBe('text/turtle');
  });

  test('turtle from accept header', () => {
    expect(detectFormat('', 'text/turtle')).toBe('text/turtle');
  });

  test('JSON-LD content-type', () => {
    expect(detectFormat('application/ld+json', '')).toBe('application/ld+json');
  });

  test('RDF/XML content-type', () => {
    expect(detectFormat('application/rdf+xml', '')).toBe('application/rdf+xml');
  });

  test('N-Triples content-type', () => {
    expect(detectFormat('application/n-triples', '')).toBe('application/n-triples');
  });

  test('N3 content-type', () => {
    expect(detectFormat('text/n3', '')).toBe('text/n3');
  });

  test('unknown content-type falls back to ct itself', () => {
    expect(detectFormat('application/octet-stream', '')).toBe('application/octet-stream');
  });

  test('empty ct and accept falls back to text/turtle', () => {
    expect(detectFormat('', '')).toBe('text/turtle');
  });
});

// ── ACCEPT_TYPES / KNOWN_PREFIXES ──────────────────────────────────────────

describe('ACCEPT_TYPES', () => {
  test('includes turtle as first type', () => {
    expect(ACCEPT_TYPES[0]).toBe('text/turtle');
  });

  test('includes JSON-LD', () => {
    expect(ACCEPT_TYPES).toContain('application/ld+json');
  });
});

describe('KNOWN_PREFIXES', () => {
  test('foaf expands correctly', () => {
    expect(KNOWN_PREFIXES.foaf).toBe('http://xmlns.com/foaf/0.1/');
  });

  test('schema expands correctly', () => {
    expect(KNOWN_PREFIXES.schema).toBe('http://schema.org/');
  });
});

// ── _selectVars / _isRdfDoc ────────────────────────────────────────────────

describe('_selectVars', () => {
  test('extracts named vars from SELECT', () => {
    expect(_selectVars('SELECT ?name ?age WHERE { ?s ?p ?o }')).toEqual(['name', 'age']);
  });

  test('returns null for SELECT *', () => {
    expect(_selectVars('SELECT * WHERE { ?s ?p ?o }')).toBeNull();
  });

  test('returns null for non-SELECT queries', () => {
    expect(_selectVars('ASK { ?s ?p ?o }')).toBeNull();
  });

  test('handles DISTINCT', () => {
    expect(_selectVars('SELECT DISTINCT ?x WHERE { ?x ?y ?z }')).toEqual(['x']);
  });

  test('strips comments before parsing', () => {
    expect(_selectVars('SELECT ?x # comment\nWHERE { ?x ?y ?z }')).toEqual(['x']);
  });
});

describe('_isRdfDoc', () => {
  test('recognises .ttl', () => {
    expect(_isRdfDoc('http://ex/data.ttl')).toBeTruthy();
  });

  test('recognises .jsonld', () => {
    expect(_isRdfDoc('http://ex/data.jsonld')).toBeTruthy();
  });

  test('recognises .rdf', () => {
    expect(_isRdfDoc('http://ex/data.rdf')).toBeTruthy();
  });

  test('recognises .n3', () => {
    expect(_isRdfDoc('http://ex/data.n3')).toBeTruthy();
  });

  test('recognises .nt', () => {
    expect(_isRdfDoc('http://ex/data.nt')).toBeTruthy();
  });

  test('recognises .owl', () => {
    expect(_isRdfDoc('http://ex/onto.owl')).toBeTruthy();
  });

  test('recognises .trig', () => {
    expect(_isRdfDoc('http://ex/data.trig')).toBeTruthy();
  });

  test('rejects .html', () => {
    expect(_isRdfDoc('http://ex/page.html')).toBeFalsy();
  });

  test('rejects bare SPARQL endpoint URL', () => {
    expect(_isRdfDoc('http://ex/sparql')).toBeFalsy();
  });

  test('handles query string after extension', () => {
    expect(_isRdfDoc('http://ex/data.ttl?v=2')).toBeTruthy();
  });

  test('handles fragment after extension', () => {
    expect(_isRdfDoc('http://ex/data.ttl#sec')).toBeTruthy();
  });
});

// ── toPlainResults ────────────────────────────────────────────────────────

describe('toPlainResults', () => {
  test('empty results → empty array', () => {
    expect(toPlainResults({ vars: ['x'], results: [] })).toEqual([]);
  });

  test('1 row × 1 col → scalar', () => {
    const data = {
      vars: ['name'],
      results: [{ name: { type: 'literal', value: 'Alice' } }],
    };
    expect(toPlainResults(data)).toBe('Alice');
  });

  test('multiple rows → array of objects', () => {
    const data = {
      vars: ['name', 'age'],
      results: [
        { name: { type: 'literal', value: 'Alice' }, age: { type: 'literal', value: '30' } },
        { name: { type: 'literal', value: 'Bob' },   age: { type: 'literal', value: '25' } },
      ],
    };
    expect(toPlainResults(data)).toEqual([
      { name: 'Alice', age: '30' },
      { name: 'Bob',   age: '25' },
    ]);
  });

  test('vars filters columns', () => {
    const data = {
      vars: ['name', 'age'],
      results: [
        { name: { type: 'literal', value: 'Alice' }, age: { type: 'literal', value: '30' } },
      ],
    };
    expect(toPlainResults(data, ['name'])).toBe('Alice');
  });

  test('null cell → null value', () => {
    const data = {
      vars: ['x', 'y'],
      results: [{ x: { type: 'literal', value: 'a' }, y: null }],
    };
    expect(toPlainResults(data)).toEqual([{ x: 'a', y: null }]);
  });
});

// ── parseSelectVars ───────────────────────────────────────────────────────

describe('parseSelectVars', () => {
  test('extracts vars from SELECT clause', () => {
    expect(parseSelectVars('SELECT ?name ?age WHERE { ?s ?p ?o }')).toEqual(['name', 'age']);
  });

  test('returns null for SELECT *', () => {
    expect(parseSelectVars('SELECT * WHERE { ?s ?p ?o }')).toBeNull();
  });

  test('returns null for ASK query', () => {
    expect(parseSelectVars('ASK { ?s ?p ?o }')).toBeNull();
  });

  test('handles DISTINCT modifier', () => {
    expect(parseSelectVars('SELECT DISTINCT ?x ?y WHERE { ?x ?p ?y }')).toEqual(['x', 'y']);
  });

  test('handles REDUCED modifier', () => {
    expect(parseSelectVars('SELECT REDUCED ?x WHERE { ?x ?p ?o }')).toEqual(['x']);
  });

  test('ignores comments in query', () => {
    expect(parseSelectVars('SELECT ?x # my var\nWHERE { ?x ?p ?o }')).toEqual(['x']);
  });
});

// ── pivotSubjectsToRows ───────────────────────────────────────────────────

describe('pivotSubjectsToRows', () => {
  test('single subject, two predicates', () => {
    const store = rdflib.graph();
    const alice = rdflib.sym('http://ex/alice');
    store.add(alice, rdflib.sym('http://xmlns.com/foaf/0.1/name'), rdflib.literal('Alice'));
    store.add(alice, rdflib.sym('http://xmlns.com/foaf/0.1/age'), rdflib.literal('30'));

    const result = pivotSubjectsToRows(store, [alice]);
    expect(result.vars).toContain('s');
    expect(result.vars).toContain('name');
    expect(result.vars).toContain('age');
    expect(result.results).toHaveLength(1);
    expect(result.results[0].name.value).toBe('Alice');
    expect(result.results[0].age.value).toBe('30');
  });

  test('two subjects with overlapping predicates', () => {
    const store = rdflib.graph();
    const alice = rdflib.sym('http://ex/alice');
    const bob = rdflib.sym('http://ex/bob');
    store.add(alice, rdflib.sym('http://xmlns.com/foaf/0.1/name'), rdflib.literal('Alice'));
    store.add(bob,   rdflib.sym('http://xmlns.com/foaf/0.1/name'), rdflib.literal('Bob'));

    const result = pivotSubjectsToRows(store, [alice, bob]);
    expect(result.results).toHaveLength(2);
    expect(result.results[0].name.value).toBe('Alice');
    expect(result.results[1].name.value).toBe('Bob');
  });

  test('custom subject column name', () => {
    const store = rdflib.graph();
    const alice = rdflib.sym('http://ex/alice');
    store.add(alice, rdflib.sym('http://xmlns.com/foaf/0.1/name'), rdflib.literal('Alice'));

    const result = pivotSubjectsToRows(store, [alice], 'person');
    expect(result.vars[0]).toBe('person');
    expect(result.results[0].person.type).toBe('uri');
  });

  test('multi-valued predicate creates multi cell', () => {
    const store = rdflib.graph();
    const alice = rdflib.sym('http://ex/alice');
    store.add(alice, rdflib.sym('http://xmlns.com/foaf/0.1/nick'), rdflib.literal('A'));
    store.add(alice, rdflib.sym('http://xmlns.com/foaf/0.1/nick'), rdflib.literal('Al'));

    const result = pivotSubjectsToRows(store, [alice]);
    expect(result.results[0].nick.type).toBe('multi');
    expect(result.results[0].nick.values).toHaveLength(2);
  });

  test('empty subjects list → empty results', () => {
    const store = rdflib.graph();
    const result = pivotSubjectsToRows(store, []);
    expect(result.results).toEqual([]);
    expect(result.vars).toEqual(['s']);
  });
});

// ── promoteDisplayColumns ─────────────────────────────────────────────────

describe('promoteDisplayColumns', () => {
  test('promotes name column to front', () => {
    const data = { vars: ['s', 'age', 'name'], results: [] };
    const result = promoteDisplayColumns(data, 's');
    expect(result.vars[0]).toBe('name');
  });

  test('promotes label column to front', () => {
    const data = { vars: ['s', 'label', 'type'], results: [] };
    const result = promoteDisplayColumns(data, 's');
    expect(result.vars[0]).toBe('label');
  });

  test('promotes title column to front', () => {
    const data = { vars: ['s', 'title', 'date'], results: [] };
    const result = promoteDisplayColumns(data, 's');
    expect(result.vars[0]).toBe('title');
  });

  test('excludes subject column from output', () => {
    const data = { vars: ['s', 'name', 'age'], results: [] };
    const result = promoteDisplayColumns(data, 's');
    expect(result.vars).not.toContain('s');
  });

  test('no display column → original order minus subject', () => {
    const data = { vars: ['s', 'foo', 'bar'], results: [] };
    const result = promoteDisplayColumns(data, 's');
    expect(result.vars).toEqual(['foo', 'bar']);
  });
});

// ── expandBnodes: bnode-to-modal path ─────────────────────────────────────

describe('expandBnodes — bnode in object column', () => {
  test('converts bnode in obj column to modal cell with _data', () => {
    const store = rdflib.graph();
    const bn = rdflib.blankNode('b99');
    store.add(bn, rdflib.sym('http://ex/p'), rdflib.literal('inner'));

    const data = {
      vars: ['s', 'o'],
      results: [
        {
          s: { type: 'uri', value: 'http://ex/a' },
          o: { type: 'bnode', value: 'b99', _term: bn },
        },
        {
          s: { type: 'uri', value: 'http://ex/b' },
          o: { type: 'literal', value: 'plain' },
        },
      ],
    };
    const r = expandBnodes(store, data);
    expect(r.results[0].o.type).toBe('bnode');
    expect(r.results[0].o.value).toBe('[…]');
    expect(r.results[0].o._data.vars).toEqual(['p', 'o']);
    expect(r.results[0].o._data.results).toHaveLength(1);
    expect(r.results[0].o._data.results[0].o.value).toBe('inner');
    expect(r.results[1].o.value).toBe('plain');
  });

  test('skips nested bnodes in modal expansion', () => {
    const store = rdflib.graph();
    const bn = rdflib.blankNode('b1');
    const nested = rdflib.blankNode('b2');
    store.add(bn, rdflib.sym('http://ex/p'), nested);
    store.add(bn, rdflib.sym('http://ex/q'), rdflib.literal('val'));

    const data = {
      vars: ['s', 'o'],
      results: [
        {
          s: { type: 'uri', value: 'http://ex/a' },
          o: { type: 'bnode', value: 'b1', _term: bn },
        },
        {
          s: { type: 'uri', value: 'http://ex/c' },
          o: { type: 'uri', value: 'http://ex/d' },
        },
      ],
    };
    const r = expandBnodes(store, data);
    expect(r.results[0].o._data.results).toHaveLength(1);
    expect(r.results[0].o._data.results[0].o.value).toBe('val');
  });
});

// ── loadRdfStore: additional paths ────────────────────────────────────────

describe('loadRdfStore — additional paths', () => {
  test('first accept returns valid turtle → store is returned', async () => {
    const fetchFn = jest.fn(async () => ({
      ok: true, status: 200,
      headers: { get: (h) => h === 'content-type' ? 'text/turtle' : null },
      text: async () => '<http://ex/a> <http://ex/p> <http://ex/b> .',
    }));
    const store = await loadRdfStore('http://example.org/data.ttl', fetchFn);
    expect(store.statements.length).toBe(1);
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  test('network error on first accept → tries next accept', async () => {
    let callCount = 0;
    const fetchFn = jest.fn(async () => {
      callCount++;
      if (callCount === 1) throw new Error('DNS resolution failed');
      return {
        ok: true, status: 200,
        headers: { get: (h) => h === 'content-type' ? 'text/turtle' : null },
        text: async () => '<http://ex/a> <http://ex/p> <http://ex/b> .',
      };
    });
    const store = await loadRdfStore('http://example.org/data.ttl', fetchFn);
    expect(store.statements.length).toBe(1);
    expect(callCount).toBeGreaterThan(1);
  });

  test('diagnostics are attached to returned store', async () => {
    const fetchFn = jest.fn(async () => ({
      ok: true, status: 200,
      headers: { get: (h) => h === 'content-type' ? 'text/turtle' : null },
      text: async () => '<http://ex/a> <http://ex/p> <http://ex/b> .',
    }));
    const store = await loadRdfStore('http://example.org/data.ttl', fetchFn);
    expect(store._diagnostics).toBeDefined();
    expect(store._diagnostics.length).toBeGreaterThan(0);
    expect(store._diagnostics[0].accept).toBe('text/turtle');
    expect(store._diagnostics[0].status).toBe(200);
  });
});

// ── fetchQueryFromRdf: additional tests ───────────────────────────────────

describe('fetchQueryFromRdf — additional', () => {
  let rdf;
  beforeAll(async () => { ({ rdf } = await import('../shared/rdf.js')); });
  beforeEach(() => {
    rdf._store = null;
    rdf._fetcher = null;
    rdf._loaded.clear();
  });

  test('finds query via sparql:query predicate', async () => {
    const ttl = `<http://ex/q#Q1> <http://www.w3.org/ns/sparql#query> "SELECT ?s WHERE { ?s ?p ?o }" .`;
    const fetchFn = jest.fn(async () => ({
      ok: true, status: 200,
      headers: { get: (h) => h === 'content-type' ? 'text/turtle' : null },
      text: async () => ttl,
    }));
    const q = await fetchQueryFromRdf('http://ex/q#Q1', fetchFn);
    expect(q).toBe('SELECT ?s WHERE { ?s ?p ?o }');
  });

  test('finds query via dct:description predicate', async () => {
    const ttl = `<http://ex/q#Q1> <http://purl.org/dc/terms/description> "ASK { ?s ?p ?o }" .`;
    const fetchFn = jest.fn(async () => ({
      ok: true, status: 200,
      headers: { get: (h) => h === 'content-type' ? 'text/turtle' : null },
      text: async () => ttl,
    }));
    const q = await fetchQueryFromRdf('http://ex/q#Q1', fetchFn);
    expect(q).toBe('ASK { ?s ?p ?o }');
  });
});

// ── runQuery: additional paths ────────────────────────────────────────────

describe('runQuery — additional', () => {
  const ttl = `
    <http://example.org/alice> <http://xmlns.com/foaf/0.1/name> "Alice" .
    <http://example.org/bob>   <http://xmlns.com/foaf/0.1/name> "Bob" .
  `;

  beforeEach(() => {
    global.fetch = jest.fn(async () => ({
      ok: true, status: 200,
      headers: { get: (h) => h === 'content-type' ? 'text/turtle' : null },
      text: async () => ttl,
    }));
  });
  afterEach(() => { delete global.fetch; });

  test('pattern with no matches → empty array', async () => {
    const result = await runQuery({
      endpoint: 'http://example.org/data.ttl',
      pattern: '?s <http://example.org/nonexistent> ?o',
    });
    expect(result).toEqual([]);
  });

  test('pattern with all wildcards → full triple rows', async () => {
    const result = await runQuery({
      endpoint: 'http://example.org/data.ttl',
      pattern: '?s ?p ?o',
    });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect(result[0]).toHaveProperty('s');
    expect(result[0]).toHaveProperty('p');
    expect(result[0]).toHaveProperty('o');
  });

  test('vars filters columns', async () => {
    const result = await runQuery({
      endpoint: 'http://example.org/data.ttl',
      pattern: '?s foaf:name ?name',
      vars: ['name'],
    });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
  });
});
