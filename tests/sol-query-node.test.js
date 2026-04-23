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
} from '../sol-query-node.js';

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

  test('requires sparql or wanted', async () => {
    await expect(solQuery({ endpoint: 'http://ex/data.ttl' }))
      .rejects.toThrow('sparql or wanted is required');
  });

  test('triple-pattern (wanted) returns plain objects', async () => {
    const turtle = `
      <http://ex/alice> <http://xmlns.com/foaf/0.1/name> "Alice" .
      <http://ex/bob> <http://xmlns.com/foaf/0.1/name> "Bob" .
    `;
    const fetchFn = mockFetchTurtle(turtle);
    const result = await solQuery({
      endpoint: 'http://ex/data.ttl',
      wanted: '?person foaf:name ?name',
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
      wanted: '<http://ex/alice> foaf:name ?name',
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
      wanted: '?s <http://example.org/nonexistent> ?o',
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
});
