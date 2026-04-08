/**
 * Tests for mini-query parsing, term resolution, and store matching.
 * Uses the mock rdflib in __mocks__/rdflib.js.
 */

import rdflib from './__mocks__/rdflib-esm.js';
import {
  miniTermToNode,
  parseWantedParts,
  expandCurie,
  KNOWN_PREFIXES,
  matchStore,
  expandBnodes,
} from '../shared/rdf-utils.js';

// ── expandCurie ───────────────────────────────────────────────────────────────

describe('expandCurie', () => {
  test('expands known prefix', () => {
    expect(expandCurie('foaf:name')).toBe('http://xmlns.com/foaf/0.1/name');
  });

  test('expands schema prefix', () => {
    expect(expandCurie('schema:Person')).toBe('https://schema.org/Person');
  });

  test('returns null for unknown prefix', () => {
    expect(expandCurie('unknown:term')).toBeNull();
  });

  test('returns null with no colon', () => {
    expect(expandCurie('nocolon')).toBeNull();
  });

  test('expands with extraPrefixes', () => {
    expect(expandCurie('ex:alice', { ex: 'http://example.org/' }))
      .toBe('http://example.org/alice');
  });

  test('extraPrefixes override built-ins', () => {
    expect(expandCurie('foaf:name', { foaf: 'http://override/' }))
      .toBe('http://override/name');
  });
});

// ── miniTermToNode ────────────────────────────────────────────────────────────

describe('miniTermToNode', () => {
  test('? returns null (wildcard)', () => {
    expect(miniTermToNode('?', rdflib)).toBeNull();
  });

  test('?var returns null (named wildcard)', () => {
    expect(miniTermToNode('?subject', rdflib)).toBeNull();
  });

  test('<uri> returns NamedNode', () => {
    const node = miniTermToNode('<http://example.org/foo>', rdflib);
    expect(node.termType).toBe('NamedNode');
    expect(node.value).toBe('http://example.org/foo');
  });

  test('CURIE expands to NamedNode', () => {
    const node = miniTermToNode('foaf:name', rdflib);
    expect(node.termType).toBe('NamedNode');
    expect(node.value).toBe('http://xmlns.com/foaf/0.1/name');
  });

  test('"literal" returns Literal', () => {
    const node = miniTermToNode('"hello"', rdflib);
    expect(node.termType).toBe('Literal');
    expect(node.value).toBe('hello');
  });

  test('"literal"@lang returns Literal with language', () => {
    const node = miniTermToNode('"hello"@en', rdflib);
    expect(node.termType).toBe('Literal');
    expect(node.language).toBe('en');
  });

  test('bare word returns Literal', () => {
    const node = miniTermToNode('alice', rdflib);
    expect(node.termType).toBe('Literal');
    expect(node.value).toBe('alice');
  });

  test('#fragment resolves against baseUri', () => {
    const node = miniTermToNode('#me', rdflib, {}, 'http://example.org/profile');
    expect(node.termType).toBe('NamedNode');
    expect(node.value).toBe('http://example.org/profile#me');
  });

  test('#fragment strips existing fragment from baseUri', () => {
    const node = miniTermToNode('#me', rdflib, {}, 'http://example.org/profile#other');
    expect(node.value).toBe('http://example.org/profile#me');
  });

  test('<#fragment> inside angle brackets resolves', () => {
    const node = miniTermToNode('<#me>', rdflib, {}, 'http://example.org/card');
    expect(node.value).toBe('http://example.org/card#me');
  });

  test('http:// URI is not treated as CURIE', () => {
    const node = miniTermToNode('<http://example.org/test>', rdflib);
    expect(node.value).toBe('http://example.org/test');
  });
});

// ── parseWantedParts ─────────────────────────────────────────────────────────

describe('parseWantedParts', () => {
  test('all wildcards → [null, null, null]', () => {
    const [s, p, o] = parseWantedParts('? ? ?', rdflib);
    expect(s).toBeNull();
    expect(p).toBeNull();
    expect(o).toBeNull();
  });

  test('subject CURIE, wildcard predicate, wildcard object', () => {
    const [s, p, o] = parseWantedParts('foaf:Person ? ?', rdflib);
    expect(s.value).toBe('http://xmlns.com/foaf/0.1/Person');
    expect(p).toBeNull();
    expect(o).toBeNull();
  });

  test('multi-word object becomes literal', () => {
    const [s, p, o] = parseWantedParts('? foaf:name john w. smith', rdflib);
    expect(o.termType).toBe('Literal');
    expect(o.value).toBe('john w. smith');
  });

  test('quoted literal object', () => {
    const [, , o] = parseWantedParts('? foaf:name "Alice"', rdflib);
    expect(o.termType).toBe('Literal');
    expect(o.value).toBe('Alice');
  });

  test('<uri> object', () => {
    const [, , o] = parseWantedParts('? ? <http://example.org/x>', rdflib);
    expect(o.value).toBe('http://example.org/x');
  });

  test('#fragment subject uses baseUri', () => {
    const [s] = parseWantedParts('#me ? ?', rdflib, {}, 'http://example.org/card');
    expect(s.value).toBe('http://example.org/card#me');
  });

  test('throws with < 3 parts', () => {
    expect(() => parseWantedParts('? foaf:name', rdflib)).toThrow();
  });
});

// ── matchStore ────────────────────────────────────────────────────────────────

describe('matchStore', () => {
  function makeStore() {
    const store = rdflib.graph();
    store.add(rdflib.sym('http://ex/Alice'), rdflib.sym('http://xmlns.com/foaf/0.1/name'), rdflib.literal('Alice'));
    store.add(rdflib.sym('http://ex/Alice'), rdflib.sym('http://xmlns.com/foaf/0.1/age'),  rdflib.literal('30'));
    store.add(rdflib.sym('http://ex/Bob'),   rdflib.sym('http://xmlns.com/foaf/0.1/name'), rdflib.literal('Bob'));
    return store;
  }

  test('wildcard subject returns all rows with s column', () => {
    const store = makeStore();
    const result = matchStore(store, null, rdflib.sym('http://xmlns.com/foaf/0.1/name'), null);
    expect(result.vars).toContain('s');
    expect(result.vars).toContain('o');
    expect(result.results).toHaveLength(2);
  });

  test('bound subject returns only its triples', () => {
    const store = makeStore();
    const result = matchStore(store, rdflib.sym('http://ex/Alice'), null, null);
    expect(result.results).toHaveLength(2);
    expect(result.vars).toContain('p');
    expect(result.vars).toContain('o');
  });

  test('bound predicate and object returns matching subject', () => {
    const store = makeStore();
    const result = matchStore(store, null, rdflib.sym('http://xmlns.com/foaf/0.1/name'), rdflib.literal('Bob'));
    expect(result.results).toHaveLength(1);
    expect(result.results[0].s.value).toBe('http://ex/Bob');
  });

  test('no matches returns empty results', () => {
    const store = makeStore();
    const result = matchStore(store, rdflib.sym('http://ex/Nobody'), null, null);
    expect(result.results).toHaveLength(0);
  });

  test('all bound → all three columns returned', () => {
    const store = makeStore();
    const result = matchStore(
      store,
      rdflib.sym('http://ex/Alice'),
      rdflib.sym('http://xmlns.com/foaf/0.1/name'),
      rdflib.literal('Alice')
    );
    expect(result.results).toHaveLength(1);
    expect(result.vars).toEqual(expect.arrayContaining(['s', 'p', 'o']));
  });
});

// ── expandBnodes column-drop ──────────────────────────────────────────────────

describe('expandBnodes', () => {
  test('drops column where every value is a blank node', () => {
    const store = rdflib.graph();
    const data = {
      vars: ['s', 'p'],
      results: [
        { s: { type: 'bnode', value: 'b0', _term: rdflib.blankNode('b0') }, p: { type: 'uri', value: 'http://ex/p' } },
        { s: { type: 'bnode', value: 'b1', _term: rdflib.blankNode('b1') }, p: { type: 'uri', value: 'http://ex/q' } },
      ],
    };
    const result = expandBnodes(store, data);
    expect(result.vars).not.toContain('s');
    expect(result.vars).toContain('p');
  });

  test('keeps column when only some values are blank nodes', () => {
    const store = rdflib.graph();
    const data = {
      vars: ['s'],
      results: [
        { s: { type: 'bnode', value: 'b0', _term: rdflib.blankNode('b0') } },
        { s: { type: 'uri',   value: 'http://ex/x' } },
      ],
    };
    const result = expandBnodes(store, data);
    expect(result.vars).toContain('s');
  });

  test('bnode object in non-s/p column becomes modal cell', () => {
    const store = rdflib.graph();
    const bn = rdflib.blankNode('b0');
    store.add(bn, rdflib.sym('http://ex/p'), rdflib.literal('val'));
    const data = {
      vars: ['o'],
      results: [{ o: { type: 'bnode', value: 'b0', _term: bn } }],
    };
    const result = expandBnodes(store, data);
    expect(result.results[0].o.type).toBe('bnode');
    expect(result.results[0].o._data).toBeDefined();
    expect(result.results[0].o._data.vars).toEqual(['p', 'o']);
  });
});

// ── KNOWN_PREFIXES ────────────────────────────────────────────────────────────

describe('KNOWN_PREFIXES', () => {
  const required = ['rdf','rdfs','owl','foaf','schema','skos','ldp','solid','vcard','dct'];
  required.forEach(prefix => {
    test(`includes ${prefix}`, () => {
      expect(KNOWN_PREFIXES[prefix]).toBeDefined();
      expect(KNOWN_PREFIXES[prefix]).toMatch(/^https?:\/\//);
    });
  });
});
