/**
 * Tests for sol-query-node.js — the Node.js query API.
 * Pure JS, no DOM. Mock fetch to control network responses.
 */

import { jest } from '@jest/globals';
import {
  solQuery,
  assertSafeQuery,
  sanitizeVarValue,
  substituteVariables,
} from '../../node/sol-query.js';

// ── SPARQL safety ──────────────────────────────────────────────────────────

describe('assertSafeQuery', () => {
  test('allows SELECT queries', () => {
    expect(() => assertSafeQuery('SELECT ?x WHERE { ?x ?y ?z }')).not.toThrow();
  });

  test('blocks INSERT DATA', () => {
    expect(() => assertSafeQuery('INSERT DATA { <a> <b> <c> }')).toThrow(/Blocked/);
  });

  test('blocks DELETE WHERE', () => {
    expect(() => assertSafeQuery('DELETE WHERE { ?x ?y ?z }')).toThrow(/Blocked/);
  });

  test('blocks DROP', () => {
    expect(() => assertSafeQuery('DROP GRAPH <x>')).toThrow(/Blocked/);
  });

  test('blocks CLEAR', () => {
    expect(() => assertSafeQuery('CLEAR ALL')).toThrow(/Blocked/);
  });
});

describe('sanitizeVarValue', () => {
  test('passes safe values through', () => {
    expect(sanitizeVarValue('Alice')).toBe('Alice');
  });

  test('escapes backslashes and quotes', () => {
    expect(sanitizeVarValue('O"Brien')).toBe('O\\"Brien');
    expect(sanitizeVarValue("it's")).toBe("it\\'s");
    expect(sanitizeVarValue('back\\slash')).toBe('back\\\\slash');
  });

  test('rejects values with braces', () => {
    expect(() => sanitizeVarValue('{ bad }')).toThrow(/disallowed/);
  });

  test('rejects values with blocked keywords', () => {
    expect(() => sanitizeVarValue('DROP table')).toThrow(/blocked keyword/);
    expect(() => sanitizeVarValue('INSERT stuff')).toThrow(/blocked keyword/);
  });
});

describe('substituteVariables', () => {
  test('replaces {{var}} placeholders', () => {
    const q = 'SELECT ?x WHERE { ?x foaf:name "{{name}}" }';
    expect(substituteVariables(q, { name: 'Alice' }))
      .toBe('SELECT ?x WHERE { ?x foaf:name "Alice" }');
  });

  test('replaces multiple occurrences', () => {
    const q = '{{x}} and {{x}}';
    expect(substituteVariables(q, { x: 'hi' })).toBe('hi and hi');
  });

  test('no vars → unchanged', () => {
    const q = 'SELECT ?x WHERE { ?x ?y ?z }';
    expect(substituteVariables(q)).toBe(q);
  });
});

// ── solQuery integration ────────────────────────────────────────────────────

function mockFetchTurtle(turtle, contentType = 'text/turtle') {
  return jest.fn(async (url, opts) => ({
    ok: true,
    status: 200,
    headers: new Map([['content-type', contentType]]),
    text: async () => turtle,
  }));
}

function mockFetchSparqlJson(vars, bindings) {
  return jest.fn(async (url, opts) => ({
    ok: true,
    status: 200,
    headers: new Map([['content-type', 'application/sparql-results+json']]),
    json: async () => ({
      head: { vars },
      results: { bindings },
    }),
    text: async () => JSON.stringify({ head: { vars }, results: { bindings } }),
  }));
}

describe('solQuery', () => {
  test('requires endpoint', async () => {
    await expect(solQuery({})).rejects.toThrow('endpoint is required');
  });

  test('requires sparql or pattern', async () => {
    await expect(solQuery({ endpoint: 'http://ex/data.ttl' }))
      .rejects.toThrow('sparql or pattern is required');
  });

  test('triple-pattern (pattern) returns plain objects', async () => {
    const turtle = `
      <http://ex/alice> <http://xmlns.com/foaf/0.1/name> "Alice" .
      <http://ex/bob> <http://xmlns.com/foaf/0.1/name> "Bob" .
    `;
    const fetchFn = mockFetchTurtle(turtle);
    const result = await solQuery({
      endpoint: 'http://ex/data.ttl',
      pattern: '?person foaf:name ?name',
      fetch: fetchFn,
    });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    const names = result.map(r => r.name).sort();
    expect(names).toEqual(['Alice', 'Bob']);
  });

  test('scalar result: 1 row × 1 col returns string', async () => {
    const turtle = `<http://ex/alice> <http://xmlns.com/foaf/0.1/name> "Alice" .`;
    const fetchFn = mockFetchTurtle(turtle);
    const result = await solQuery({
      endpoint: 'http://ex/data.ttl',
      pattern: '<http://ex/alice> foaf:name ?name',
      fetch: fetchFn,
    });

    expect(typeof result).toBe('string');
    expect(result).toBe('Alice');
  });

  test('empty results return empty array', async () => {
    const turtle = `<http://ex/alice> <http://xmlns.com/foaf/0.1/name> "Alice" .`;
    const fetchFn = mockFetchTurtle(turtle);
    const result = await solQuery({
      endpoint: 'http://ex/data.ttl',
      pattern: '?s <http://example.org/nonexistent> ?o',
      fetch: fetchFn,
    });
    expect(result).toEqual([]);
  });

  test('SPARQL against remote endpoint returns plain objects', async () => {
    const fetchFn = mockFetchSparqlJson(['name', 'age'], [
      { name: { type: 'literal', value: 'Alice' }, age: { type: 'literal', value: '30' } },
      { name: { type: 'literal', value: 'Bob' },   age: { type: 'literal', value: '25' } },
    ]);

    const result = await solQuery({
      endpoint: 'http://ex/sparql',
      sparql: 'SELECT ?name ?age WHERE { ?x foaf:name ?name; foaf:age ?age }',
      fetch: fetchFn,
    });

    expect(result).toEqual([
      { name: 'Alice', age: '30' },
      { name: 'Bob',   age: '25' },
    ]);
  });

  test('columns option restricts output', async () => {
    const fetchFn = mockFetchSparqlJson(['name', 'age'], [
      { name: { type: 'literal', value: 'Alice' }, age: { type: 'literal', value: '30' } },
    ]);

    const result = await solQuery({
      endpoint: 'http://ex/sparql',
      sparql: 'SELECT ?name ?age WHERE { ?x foaf:name ?name; foaf:age ?age }',
      columns: ['name'],
      fetch: fetchFn,
    });

    expect(result).toBe('Alice');
  });

  test('variable substitution works', async () => {
    const fetchFn = mockFetchSparqlJson(['x'], [
      { x: { type: 'literal', value: 'found' } },
    ]);

    await solQuery({
      endpoint: 'http://ex/sparql',
      sparql: 'SELECT ?x WHERE { ?x foaf:name "{{who}}" }',
      vars: { who: 'Alice' },
      fetch: fetchFn,
    });

    const calledUrl = fetchFn.mock.calls[0][0];
    expect(calledUrl).toContain('Alice');
    expect(calledUrl).not.toContain('{{who}}');
  });

  test('blocks unsafe SPARQL', async () => {
    await expect(solQuery({
      endpoint: 'http://ex/sparql',
      sparql: 'INSERT DATA { <a> <b> <c> }',
    })).rejects.toThrow(/Blocked/);
  });

  test('query alias works same as sparql', async () => {
    const fetchFn = mockFetchSparqlJson(['x'], [
      { x: { type: 'literal', value: 'ok' } },
    ]);

    const result = await solQuery({
      endpoint: 'http://ex/sparql',
      query: 'SELECT ?x WHERE { ?x ?y ?z }',
      fetch: fetchFn,
    });

    expect(result).toBe('ok');
  });

  test('remote SPARQL with missing binding fills empty string', async () => {
    const fetchFn = mockFetchSparqlJson(['name', 'email'], [
      { name: { type: 'literal', value: 'Alice' } },
    ]);
    const result = await solQuery({
      endpoint: 'http://ex/sparql',
      sparql: 'SELECT ?name ?email WHERE { ?x foaf:name ?name }',
      fetch: fetchFn,
    });
    expect(result).toEqual([{ name: 'Alice', email: '' }]);
  });

  test('remote SPARQL endpoint HTTP error throws', async () => {
    const fetchFn = jest.fn(async () => ({
      ok: false, status: 500,
      headers: new Map([['content-type', 'text/plain']]),
    }));
    await expect(solQuery({
      endpoint: 'http://ex/sparql',
      sparql: 'SELECT ?x WHERE { ?x ?y ?z }',
      fetch: fetchFn,
    })).rejects.toThrow('HTTP 500');
  });

  test('multi-row multi-column returns array of objects', async () => {
    const fetchFn = mockFetchSparqlJson(['a', 'b'], [
      { a: { type: 'literal', value: '1' }, b: { type: 'literal', value: '2' } },
      { a: { type: 'literal', value: '3' }, b: { type: 'literal', value: '4' } },
    ]);
    const result = await solQuery({
      endpoint: 'http://ex/sparql',
      sparql: 'SELECT ?a ?b WHERE { ?x ?a ?b }',
      fetch: fetchFn,
    });
    expect(result).toEqual([{ a: '1', b: '2' }, { a: '3', b: '4' }]);
  });

  test('URI results return the URI string', async () => {
    const fetchFn = mockFetchSparqlJson(['s'], [
      { s: { type: 'uri', value: 'http://example.org/alice' } },
    ]);
    const result = await solQuery({
      endpoint: 'http://ex/sparql',
      sparql: 'SELECT ?s WHERE { ?s a foaf:Person }',
      fetch: fetchFn,
    });
    expect(result).toBe('http://example.org/alice');
  });

  test('pattern with all three variables returns s, p, o', async () => {
    const turtle = '<http://ex/a> <http://ex/p> "val" .';
    const fetchFn = mockFetchTurtle(turtle);
    const result = await solQuery({
      endpoint: 'http://ex/data.ttl',
      pattern: '?s ?p ?o',
      fetch: fetchFn,
    });
    expect(result).toEqual([{
      s: 'http://ex/a',
      p: 'http://ex/p',
      o: 'val',
    }]);
  });

  test('pattern with bound subject returns p and o', async () => {
    const turtle = `
      <http://ex/a> <http://ex/name> "Alice" .
      <http://ex/a> <http://ex/age> "30" .
    `;
    const fetchFn = mockFetchTurtle(turtle);
    const result = await solQuery({
      endpoint: 'http://ex/data.ttl',
      pattern: '<http://ex/a> ?p ?o',
      fetch: fetchFn,
    });
    expect(result.length).toBe(2);
    expect(result[0]).toHaveProperty('p');
    expect(result[0]).toHaveProperty('o');
    expect(result[0]).not.toHaveProperty('s');
  });

  test('loadRdfStore skips HTML responses', async () => {
    let calls = 0;
    const fetchFn = jest.fn(async (url, opts) => {
      calls++;
      if (calls <= 5) {
        return {
          ok: true, status: 200,
          headers: new Map([['content-type', 'text/html']]),
          text: async () => '<html><body>Not RDF</body></html>',
        };
      }
      // Last resort also returns HTML
      return {
        ok: true, status: 200,
        headers: new Map([['content-type', 'text/html']]),
        text: async () => '<html></html>',
      };
    });
    await expect(solQuery({
      endpoint: 'http://ex/data.ttl',
      pattern: '?s ?p ?o',
      fetch: fetchFn,
    })).rejects.toThrow(/HTML/);
  });

  test('loadRdfStore handles 404', async () => {
    const fetchFn = jest.fn(async () => ({
      ok: false, status: 404,
      headers: new Map([['content-type', 'text/plain']]),
    }));
    await expect(solQuery({
      endpoint: 'http://ex/missing.ttl',
      pattern: '?s ?p ?o',
      fetch: fetchFn,
    })).rejects.toThrow();
  });

  test('loadRdfStore stops on 405', async () => {
    const fetchFn = jest.fn(async () => ({
      ok: false, status: 405,
      headers: new Map([['content-type', 'text/plain']]),
    }));
    await expect(solQuery({
      endpoint: 'http://ex/data.ttl',
      pattern: '?s ?p ?o',
      fetch: fetchFn,
    })).rejects.toThrow();
    // 405 breaks the loop early + one last-resort attempt
    expect(fetchFn.mock.calls.length).toBeLessThanOrEqual(2);
  });
});

// ── rdf-core: detectFormat ───────────────────────────────────────────────────

import {
  detectFormat,
  termToString,
  termToCell,
  expandCurie,
  triplePatternTermToNode,
  tokenizeTriplePattern,
  parsePatternParts,
  patternVarNames,
  matchStore,
  selectVars,
  isRdfDoc,
  KNOWN_PREFIXES,
  ACCEPT_TYPES,
  _NAMED_VAR_RE,
} from '../../core/rdf-core.js';

import rdflib from '../__mocks__/rdflib-esm.js';

describe('detectFormat', () => {
  test('detects turtle from content-type', () => {
    expect(detectFormat('text/turtle', '')).toBe('text/turtle');
  });
  test('detects turtle from accept', () => {
    expect(detectFormat('application/octet-stream', 'text/turtle')).toBe('text/turtle');
  });
  test('detects JSON-LD', () => {
    expect(detectFormat('application/ld+json', '')).toBe('application/ld+json');
  });
  test('detects RDF/XML', () => {
    expect(detectFormat('application/rdf+xml', '')).toBe('application/rdf+xml');
  });
  test('detects N-Triples', () => {
    expect(detectFormat('application/n-triples', '')).toBe('application/n-triples');
  });
  test('detects N3', () => {
    expect(detectFormat('text/n3', '')).toBe('text/n3');
  });
  test('falls back to content-type', () => {
    expect(detectFormat('application/octet-stream', '')).toBe('application/octet-stream');
  });
  test('falls back to turtle when both empty', () => {
    expect(detectFormat('', '')).toBe('text/turtle');
  });
});

// ── rdf-core: termToString ───────────────────────────────────────────────────

describe('termToString', () => {
  test('null returns empty string', () => {
    expect(termToString(null)).toBe('');
  });
  test('plain string passes through', () => {
    expect(termToString('hello')).toBe('hello');
  });
  test('object with value returns value', () => {
    expect(termToString({ value: 'http://ex/a' })).toBe('http://ex/a');
  });
  test('object with toNT uses toNT', () => {
    expect(termToString({ toNT: () => '<http://ex/a>' })).toBe('<http://ex/a>');
  });
  test('falls back to String()', () => {
    expect(termToString(42)).toBe('42');
  });
});

// ── rdf-core: termToCell ─────────────────────────────────────────────────────

describe('termToCell', () => {
  test('null returns empty literal', () => {
    expect(termToCell(null)).toEqual({ type: 'literal', value: '' });
  });
  test('NamedNode returns uri cell', () => {
    expect(termToCell(rdflib.sym('http://ex/a'))).toEqual({ type: 'uri', value: 'http://ex/a' });
  });
  test('BlankNode returns bnode cell with _term', () => {
    const bn = rdflib.blankNode('b0');
    const cell = termToCell(bn);
    expect(cell.type).toBe('bnode');
    expect(cell.value).toBe('b0');
    expect(cell._term).toBe(bn);
  });
  test('Literal returns literal cell', () => {
    expect(termToCell(rdflib.literal('hello'))).toEqual({ type: 'literal', value: 'hello' });
  });
  test('object without termType returns literal with value', () => {
    expect(termToCell({ value: 'x' })).toEqual({ type: 'literal', value: 'x' });
  });
  test('object without value uses String()', () => {
    const cell = termToCell({ toString: () => 'custom' });
    expect(cell.type).toBe('literal');
  });
});

// ── rdf-core: expandCurie ────────────────────────────────────────────────────

describe('expandCurie', () => {
  test('expands known prefix', () => {
    expect(expandCurie('foaf:name')).toBe('http://xmlns.com/foaf/0.1/name');
  });
  test('expands rdf:type', () => {
    expect(expandCurie('rdf:type')).toBe('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
  });
  test('expands schema:Person', () => {
    expect(expandCurie('schema:Person')).toBe('http://schema.org/Person');
  });
  test('returns null for unknown prefix', () => {
    expect(expandCurie('zzz:thing')).toBeNull();
  });
  test('returns null for no colon', () => {
    expect(expandCurie('nocolon')).toBeNull();
  });
  test('extra prefixes override known', () => {
    expect(expandCurie('foaf:name', { foaf: 'http://custom/' })).toBe('http://custom/name');
  });
  test('extra prefixes for unknown prefix', () => {
    expect(expandCurie('myns:term', { myns: 'http://my.ns/' })).toBe('http://my.ns/term');
  });
});

// ── rdf-core: triplePatternTermToNode ────────────────────────────────────────

describe('triplePatternTermToNode', () => {
  test('named variable returns null', () => {
    expect(triplePatternTermToNode('?x', rdflib)).toBeNull();
  });
  test('bare ? throws', () => {
    expect(() => triplePatternTermToNode('?', rdflib)).toThrow(/Bare/);
  });
  test('invalid variable name throws', () => {
    expect(() => triplePatternTermToNode('?123', rdflib)).toThrow(/Invalid variable/);
  });
  test('full URI in angle brackets', () => {
    const n = triplePatternTermToNode('<http://ex/a>', rdflib);
    expect(n.value).toBe('http://ex/a');
    expect(n.termType).toBe('NamedNode');
  });
  test('fragment URI resolved against base', () => {
    const n = triplePatternTermToNode('<#me>', rdflib, {}, 'http://ex/doc');
    expect(n.value).toBe('http://ex/doc#me');
  });
  test('standalone fragment resolves against base', () => {
    const n = triplePatternTermToNode('#section', rdflib, {}, 'http://ex/page');
    expect(n.value).toBe('http://ex/page#section');
  });
  test('fragment without base throws', () => {
    expect(() => triplePatternTermToNode('#x', rdflib)).toThrow(/baseUri/);
  });
  test('plain literal', () => {
    const n = triplePatternTermToNode('"hello"', rdflib);
    expect(n.value).toBe('hello');
    expect(n.termType).toBe('Literal');
  });
  test('literal with language tag', () => {
    const n = triplePatternTermToNode('"bonjour"@fr', rdflib);
    expect(n.value).toBe('bonjour');
    expect(n.language).toBe('fr');
  });
  test('literal with datatype', () => {
    const n = triplePatternTermToNode('"42"^^<http://www.w3.org/2001/XMLSchema#integer>', rdflib);
    expect(n.value).toBe('42');
  });
  test('malformed literal throws', () => {
    expect(() => triplePatternTermToNode('"unclosed', rdflib)).toThrow(/Malformed/);
  });
  test('CURIE expansion', () => {
    const n = triplePatternTermToNode('foaf:name', rdflib);
    expect(n.value).toBe('http://xmlns.com/foaf/0.1/name');
  });
  test('empty term throws', () => {
    expect(() => triplePatternTermToNode('', rdflib)).toThrow(/empty/);
  });
  test('unrecognized term throws', () => {
    expect(() => triplePatternTermToNode('$$bad', rdflib)).toThrow(/Unrecognized/);
  });
});

// ── rdf-core: tokenizeTriplePattern ──────────────────────────────────────────

describe('tokenizeTriplePattern', () => {
  test('splits three simple tokens', () => {
    expect(tokenizeTriplePattern('?s ?p ?o')).toEqual(['?s', '?p', '?o']);
  });
  test('handles quoted literal with spaces', () => {
    const tokens = tokenizeTriplePattern('?s foaf:name "John Doe"');
    expect(tokens).toEqual(['?s', 'foaf:name', '"John Doe"']);
  });
  test('handles literal with language tag', () => {
    const tokens = tokenizeTriplePattern('?s rdfs:label "chat"@fr');
    expect(tokens).toEqual(['?s', 'rdfs:label', '"chat"@fr']);
  });
  test('handles literal with datatype', () => {
    const tokens = tokenizeTriplePattern('?s ex:age "42"^^<http://www.w3.org/2001/XMLSchema#integer>');
    expect(tokens).toEqual(['?s', 'ex:age', '"42"^^<http://www.w3.org/2001/XMLSchema#integer>']);
  });
  test('handles escaped quote in literal', () => {
    const tokens = tokenizeTriplePattern('?s ?p "say \\"hi\\""');
    expect(tokens).toEqual(['?s', '?p', '"say \\"hi\\""']);
  });
  test('trims whitespace', () => {
    expect(tokenizeTriplePattern('  ?s   ?p   ?o  ')).toEqual(['?s', '?p', '?o']);
  });
  test('unterminated literal throws', () => {
    expect(() => tokenizeTriplePattern('?s ?p "unclosed')).toThrow(/Unterminated/);
  });
  test('empty input returns empty array', () => {
    expect(tokenizeTriplePattern('')).toEqual([]);
  });
});

// ── rdf-core: parsePatternParts ──────────────────────────────────────────────

describe('parsePatternParts', () => {
  test('three variables return [null, null, null]', () => {
    const [s, p, o] = parsePatternParts('?s ?p ?o', rdflib);
    expect(s).toBeNull();
    expect(p).toBeNull();
    expect(o).toBeNull();
  });
  test('bound predicate returns NamedNode for p', () => {
    const [s, p, o] = parsePatternParts('?s foaf:name ?o', rdflib);
    expect(s).toBeNull();
    expect(p.value).toBe('http://xmlns.com/foaf/0.1/name');
    expect(o).toBeNull();
  });
  test('wrong number of tokens throws', () => {
    expect(() => parsePatternParts('?s ?p', rdflib)).toThrow(/exactly 3/);
    expect(() => parsePatternParts('?s ?p ?o ?extra', rdflib)).toThrow(/exactly 3/);
  });
});

// ── rdf-core: patternVarNames ────────────────────────────────────────────────

describe('patternVarNames', () => {
  test('all variables', () => {
    expect(patternVarNames('?sub ?pred ?obj')).toEqual({ s: 'sub', p: 'pred', o: 'obj' });
  });
  test('partial variables', () => {
    expect(patternVarNames('?person foaf:name ?name')).toEqual({ s: 'person', o: 'name' });
  });
  test('no variables', () => {
    expect(patternVarNames('<http://ex/a> foaf:name "Alice"')).toEqual({});
  });
  test('wrong token count returns empty', () => {
    expect(patternVarNames('?s ?p')).toEqual({});
  });
});

// ── rdf-core: matchStore ─────────────────────────────────────────────────────

describe('matchStore', () => {
  let store;
  beforeEach(() => {
    store = rdflib.graph();
    rdflib.parse(
      '<http://ex/a> <http://ex/name> "Alice" . <http://ex/b> <http://ex/name> "Bob" .',
      store, 'http://ex/', 'text/turtle'
    );
  });

  test('all null returns s, p, o columns', () => {
    const r = matchStore(store, null, null, null);
    expect(r.vars).toEqual(['s', 'p', 'o']);
    expect(r.results.length).toBe(2);
  });
  test('bound subject returns p, o columns', () => {
    const r = matchStore(store, rdflib.sym('http://ex/a'), null, null);
    expect(r.vars).toEqual(['p', 'o']);
    expect(r.results.length).toBe(1);
    expect(r.results[0].o.value).toBe('Alice');
  });
  test('bound predicate returns s, o columns', () => {
    const r = matchStore(store, null, rdflib.sym('http://ex/name'), null);
    expect(r.vars).toEqual(['s', 'o']);
    expect(r.results.length).toBe(2);
  });
  test('all bound returns s, p, o', () => {
    const r = matchStore(store, rdflib.sym('http://ex/a'), rdflib.sym('http://ex/name'), rdflib.literal('Alice'));
    expect(r.vars).toEqual(['s', 'p', 'o']);
  });
  test('custom names via names param', () => {
    const r = matchStore(store, null, rdflib.sym('http://ex/name'), null, { s: 'person', o: 'label' });
    expect(r.vars).toEqual(['person', 'label']);
    expect(r.results[0]).toHaveProperty('person');
    expect(r.results[0]).toHaveProperty('label');
  });
  test('no matches returns empty results', () => {
    const r = matchStore(store, rdflib.sym('http://ex/nonexistent'), null, null);
    expect(r.results).toEqual([]);
  });
});

// ── rdf-core: selectVars ─────────────────────────────────────────────────────

describe('selectVars', () => {
  test('extracts named variables', () => {
    expect(selectVars('SELECT ?name ?age WHERE { ?x ?p ?o }')).toEqual(['name', 'age']);
  });
  test('SELECT * returns null', () => {
    expect(selectVars('SELECT * WHERE { ?s ?p ?o }')).toBeNull();
  });
  test('handles DISTINCT', () => {
    expect(selectVars('SELECT DISTINCT ?x WHERE { ?x ?p ?o }')).toEqual(['x']);
  });
  test('handles REDUCED', () => {
    expect(selectVars('SELECT REDUCED ?x ?y WHERE { ?x ?p ?y }')).toEqual(['x', 'y']);
  });
  test('strips comments before parsing', () => {
    expect(selectVars('SELECT ?x # comment\nWHERE { ?x ?p ?o }')).toEqual(['x']);
  });
  test('returns null for non-SELECT', () => {
    expect(selectVars('CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }')).toBeNull();
  });
  test('case insensitive', () => {
    expect(selectVars('select ?x where { ?x ?p ?o }')).toEqual(['x']);
  });
});

// ── rdf-core: isRdfDoc ───────────────────────────────────────────────────────

describe('isRdfDoc', () => {
  test.each([
    'http://ex/data.ttl',
    'http://ex/data.rdf',
    'http://ex/data.n3',
    'http://ex/data.jsonld',
    'http://ex/data.nt',
    'http://ex/data.nq',
    'http://ex/data.owl',
    'http://ex/data.trig',
  ])('recognizes %s', (url) => {
    expect(isRdfDoc(url)).toBe(true);
  });

  test('recognizes with query string', () => {
    expect(isRdfDoc('http://ex/data.ttl?v=2')).toBe(true);
  });
  test('recognizes with fragment', () => {
    expect(isRdfDoc('http://ex/data.ttl#Q1')).toBe(true);
  });
  test('case insensitive', () => {
    expect(isRdfDoc('http://ex/data.TTL')).toBe(true);
  });
  test('rejects non-RDF extension', () => {
    expect(isRdfDoc('http://ex/data.html')).toBe(false);
  });
  test('rejects SPARQL endpoint', () => {
    expect(isRdfDoc('http://ex/sparql')).toBe(false);
  });
  test('rejects no extension', () => {
    expect(isRdfDoc('http://ex/resource')).toBe(false);
  });
});

// ── rdf-core: KNOWN_PREFIXES & ACCEPT_TYPES ─────────────────────────────────

describe('KNOWN_PREFIXES', () => {
  test('contains common namespaces', () => {
    expect(KNOWN_PREFIXES.foaf).toBe('http://xmlns.com/foaf/0.1/');
    expect(KNOWN_PREFIXES.rdf).toBe('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
    expect(KNOWN_PREFIXES.rdfs).toBe('http://www.w3.org/2000/01/rdf-schema#');
    expect(KNOWN_PREFIXES.schema).toBe('http://schema.org/');
    expect(KNOWN_PREFIXES.dc).toBe('http://purl.org/dc/elements/1.1/');
    expect(KNOWN_PREFIXES.dct).toBe('http://purl.org/dc/terms/');
    expect(KNOWN_PREFIXES.owl).toBe('http://www.w3.org/2002/07/owl#');
    expect(KNOWN_PREFIXES.skos).toBe('http://www.w3.org/2004/02/skos/core#');
  });
  test('all values are URIs', () => {
    for (const [, uri] of Object.entries(KNOWN_PREFIXES)) {
      expect(uri).toMatch(/^https?:\/\//);
    }
  });
});

describe('ACCEPT_TYPES', () => {
  test('includes the standard RDF media types', () => {
    expect(ACCEPT_TYPES).toContain('text/turtle');
    expect(ACCEPT_TYPES).toContain('application/ld+json');
    expect(ACCEPT_TYPES).toContain('application/rdf+xml');
  });
});

// ── _NAMED_VAR_RE ────────────────────────────────────────────────────────────

describe('_NAMED_VAR_RE', () => {
  test.each(['?x', '?name', '?_private', '?camelCase', '?x1'])
    ('matches valid variable %s', (v) => { expect(_NAMED_VAR_RE.test(v)).toBe(true); });
  test.each(['?', '?1bad', '?-dash', 'noQuestion', ''])
    ('rejects invalid %s', (v) => { expect(_NAMED_VAR_RE.test(v)).toBe(false); });
});
