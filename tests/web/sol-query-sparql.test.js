/**
 * @jest-environment jsdom
 *
 * Tests for <sol-query> SPARQL-handling code paths:
 *   - _assertSafeQuery: blocks destructive SPARQL keywords
 *   - _sanitizeVarValue: rejects structural/keyword values, escapes quotes
 *   - substituteVariables: {{name}} placeholders from var-* attributes
 *   - getVariables: reads var-* attributes
 *   - _sparqlAttr: treats `query` as alias for `sparql`
 *
 * The full query execution path (Comunica/rdflib adapters, DOM rendering)
 * is out of scope — exercised by integration use. Here we isolate the
 * deterministic bits that the element owns.
 */

import { SolQuery } from '../../web/sol-query.js';
import { assertSafeQuery, sanitizeVarValue } from '@solid-components/core/sparql-safety.js';

// ── _assertSafeQuery ─────────────────────────────────────────────────────────

describe('assertSafeQuery', () => {
  const SAFE = [
    'SELECT * WHERE { ?s ?p ?o }',
    'SELECT ?name WHERE { ?s foaf:name ?name } LIMIT 10',
    'ASK { ?s a foaf:Person }',
    'CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }',
    'DESCRIBE <http://example.org/alice>',
  ];
  SAFE.forEach(q => {
    test(`allows: ${q.slice(0, 40)}…`, () => {
      expect(() => assertSafeQuery(q)).not.toThrow();
    });
  });

  const UNSAFE = [
    ['INSERT DATA { <a> <b> <c> }',      'INSERT'],
    ['INSERT INTO <g> { <a> <b> <c> }',  'INSERT'],
    ['DELETE DATA { <a> <b> <c> }',      'DELETE'],
    ['DELETE WHERE { ?s ?p ?o }',        'DELETE'],
    ['DELETE FROM <g> WHERE { ?s ?p ?o }', 'DELETE'],
    ['DROP GRAPH <g>',                   'DROP'],
    ['CREATE GRAPH <g>',                 'CREATE'],
    ['CLEAR GRAPH <g>',                  'CLEAR'],
    ['LOAD <http://example.org/data>',   'LOAD'],
    ['COPY <a> TO <b>',                  'COPY'],
    ['MOVE <a> TO <b>',                  'MOVE'],
    ['ADD <a> TO <b>',                   'ADD'],
  ];
  UNSAFE.forEach(([q, kw]) => {
    test(`blocks ${kw}`, () => {
      expect(() => assertSafeQuery(q)).toThrow(new RegExp(kw, 'i'));
    });
  });

  test('case-insensitive match (lowercase drop)', () => {
    expect(() => assertSafeQuery('drop graph <g>')).toThrow(/DROP/);
  });

  test('keyword must be at word boundary — DROPPED is allowed as literal text',
    () => {
      // Only the bare DROP keyword should trip; a longer word containing it
      // in a literal/IRI should not. This documents the current regex behaviour.
      const q = 'SELECT * WHERE { ?s ?p "was DROPPED" }';
      // "DROPPED" is not a word-boundary match for DROP (PED follows), so safe.
      expect(() => assertSafeQuery(q)).not.toThrow();
    });
});

// ── _sanitizeVarValue ────────────────────────────────────────────────────────

describe('sanitizeVarValue', () => {
  test('passes plain string through', () => {
    expect(sanitizeVarValue('alice')).toBe('alice');
  });

  test('escapes double quote', () => {
    expect(sanitizeVarValue('say "hi"')).toBe('say \\"hi\\"');
  });

  test('escapes single quote', () => {
    expect(sanitizeVarValue("it's")).toBe("it\\'s");
  });

  test('escapes backslash before quotes', () => {
    expect(sanitizeVarValue('a\\b')).toBe('a\\\\b');
  });

  test('rejects "{"', () => {
    expect(() => sanitizeVarValue('foo{bar}')).toThrow(/\{ \}/);
  });

  test('rejects "}"', () => {
    expect(() => sanitizeVarValue('bar}')).toThrow(/\{ \}/);
  });

  test.each(['INSERT', 'DELETE', 'DROP', 'CREATE', 'CLEAR', 'LOAD', 'COPY', 'MOVE', 'ADD'])(
    'rejects value containing %s', (kw) => {
      expect(() => sanitizeVarValue(`xx ${kw} yy`)).toThrow(/blocked keyword/);
    });

  test('rejects keyword case-insensitively', () => {
    expect(() => sanitizeVarValue('plz drop tables')).toThrow(/blocked keyword/);
  });

  test('allows substrings of keywords (e.g. "dropped" → contains DROP at start)', () => {
    // "dropped" contains DROP followed by PED — still matched by \bDROP\b? No,
    // \b requires transition at end too. "dropped" has no word boundary after
    // DROP, so it passes. Document this.
    expect(() => sanitizeVarValue('dropped')).not.toThrow();
  });
});

// ── Instance-level: attributes, variables, substitution ──────────────────────

describe('SolQuery instance SPARQL handling', () => {
  let el;
  beforeEach(() => {
    el = document.createElement('sol-query');
    // Avoid the async query path — we don't need the renderer to run.
    el.renderer = { showError() {}, showLoading() {}, renderResults() {} };
    document.body.appendChild(el);
  });
  afterEach(() => { el.remove(); });

  test('_sparqlAttr returns sparql attribute', () => {
    el.setAttribute('sparql', 'SELECT * WHERE { ?s ?p ?o }');
    expect(el._sparqlAttr()).toBe('SELECT * WHERE { ?s ?p ?o }');
  });

  test('_sparqlAttr falls back to query attribute', () => {
    el.setAttribute('query', 'SELECT ?x WHERE { ?x a ?t }');
    expect(el._sparqlAttr()).toBe('SELECT ?x WHERE { ?x a ?t }');
  });

  test('_sparqlAttr prefers sparql over query', () => {
    el.setAttribute('sparql', 'A');
    el.setAttribute('query',  'B');
    expect(el._sparqlAttr()).toBe('A');
  });

  test('getVariables collects var-* attributes', () => {
    el.setAttribute('var-name',  'Alice');
    el.setAttribute('var-age',   '30');
    el.setAttribute('endpoint',  'http://example.org'); // ignored
    expect(el.getVariables()).toEqual({ name: 'Alice', age: '30' });
  });

  test('getVariables returns empty object when none set', () => {
    expect(el.getVariables()).toEqual({});
  });

  test('substituteVariables replaces {{name}} placeholders', () => {
    el.setAttribute('var-name', 'Alice');
    const q = 'SELECT * WHERE { ?s foaf:name "{{name}}" }';
    expect(el.substituteVariables(q))
      .toBe('SELECT * WHERE { ?s foaf:name "Alice" }');
  });

  test('substituteVariables replaces multiple occurrences', () => {
    el.setAttribute('var-x', 'X');
    const q = '{{x}} and {{x}} and {{x}}';
    expect(el.substituteVariables(q)).toBe('X and X and X');
  });

  test('substituteVariables handles multiple vars', () => {
    el.setAttribute('var-a', 'alpha');
    el.setAttribute('var-b', 'beta');
    expect(el.substituteVariables('{{a}}-{{b}}')).toBe('alpha-beta');
  });

  test('substituteVariables escapes quotes in value', () => {
    el.setAttribute('var-name', 'say "hi"');
    expect(el.substituteVariables('"{{name}}"')).toBe('"say \\"hi\\""');
  });

  test('substituteVariables throws when value contains braces', () => {
    el.setAttribute('var-bad', 'evil{DROP}');
    expect(() => el.substituteVariables('{{bad}}')).toThrow();
  });

  test('substituteVariables throws when value contains blocked keyword', () => {
    el.setAttribute('var-bad', 'alice DROP bob');
    expect(() => el.substituteVariables('{{bad}}')).toThrow(/blocked keyword/);
  });

  test('substituteVariables leaves unknown placeholders in place', () => {
    const q = 'SELECT {{missing}} WHERE {}';
    expect(el.substituteVariables(q)).toBe(q);
  });

  test('setVariable sets var-* attribute', () => {
    el.setVariable('foo', 'bar');
    expect(el.getAttribute('var-foo')).toBe('bar');
  });

  test('setVariables sets multiple var-* attributes', () => {
    el.setVariables({ a: '1', b: '2' });
    expect(el.getAttribute('var-a')).toBe('1');
    expect(el.getAttribute('var-b')).toBe('2');
  });
});

// ── Stored-query reference detection (via handleSparqlQuery branch) ─────────

describe('SolQuery stored-query reference detection', () => {
  // handleSparqlQuery internally uses this regex:
  //   !/\s/.test(v) && /^https?:\/\/|^\/|^\.\.?\//.test(v.trim())
  // Reproduce the predicate here to guard intent.
  const isStoredRef = (v) =>
    !/\s/.test(v) && /^https?:\/\/|^\/|^\.\.?\//.test(v.trim());

  test.each([
    'http://example.org/queries.ttl#Q1',
    'https://example.org/q.sparql',
    '/local/query.rq',
    './query.rq',
    '../queries/q.rq',
  ])('treats %s as stored-query ref', (v) => {
    expect(isStoredRef(v)).toBe(true);
  });

  test.each([
    'SELECT * WHERE { ?s ?p ?o }',
    'ASK { ?s a foaf:Person }',
    'bare-word',                      // no scheme/path prefix
    'query with spaces but no scheme',
  ])('treats %s as inline SPARQL', (v) => {
    expect(isStoredRef(v)).toBe(false);
  });
});
