/**
 * @jest-environment jsdom
 *
 * Tests for shared/rdf.js — the singleton Rdf wrapper around rdflib.
 */

import rdflib from './__mocks__/rdflib-esm.js';
window.$rdf = rdflib;

let rdf;
beforeAll(async () => {
  ({ rdf } = await import('../shared/rdf.js'));
});

beforeEach(() => {
  rdf._store = null;
  rdf._fetcher = null;
  rdf._loaded.clear();
});

// ── Term constructors ─────────────────────────────────────────────────────

describe('term constructors', () => {
  test('sym creates a NamedNode', () => {
    const n = rdf.sym('http://example.org/x');
    expect(n.termType).toBe('NamedNode');
    expect(n.value).toBe('http://example.org/x');
  });

  test('literal creates a Literal', () => {
    const l = rdf.literal('hello');
    expect(l.termType).toBe('Literal');
    expect(l.value).toBe('hello');
  });

  test('literal with language tag', () => {
    const l = rdf.literal('bonjour', 'fr');
    expect(l.value).toBe('bonjour');
    expect(l.language).toBe('fr');
  });

  test('blankNode creates a BlankNode', () => {
    const b = rdf.blankNode('b1');
    expect(b.termType).toBe('BlankNode');
    expect(b.value).toBe('b1');
  });

  test('blankNode without id still creates a BlankNode', () => {
    const b = rdf.blankNode();
    expect(b.termType).toBe('BlankNode');
    expect(b.value).toBeTruthy();
  });
});

// ── graph / parse ─────────────────────────────────────────────────────────

describe('graph and parse', () => {
  test('graph returns an empty store', () => {
    const g = rdf.graph();
    expect(g.statements).toHaveLength(0);
  });

  test('parse populates a store', () => {
    const g = rdf.graph();
    rdf.parse('<http://ex/s> <http://ex/p> "val" .', g, 'http://ex/', 'text/turtle');
    expect(g.statements.length).toBeGreaterThan(0);
    expect(g.statements[0].object.value).toBe('val');
  });

  test('multiple parses accumulate in the same store', () => {
    const g = rdf.graph();
    rdf.parse('<http://ex/a> <http://ex/p> "1" .', g, 'http://ex/', 'text/turtle');
    rdf.parse('<http://ex/b> <http://ex/p> "2" .', g, 'http://ex/', 'text/turtle');
    expect(g.statements.length).toBe(2);
  });
});

// ── markLoaded / isLoaded ─────────────────────────────────────────────────

describe('markLoaded / isLoaded', () => {
  test('unknown URL is not loaded', () => {
    expect(rdf.isLoaded('http://ex/unknown')).toBe(false);
  });

  test('marked URL is loaded', () => {
    rdf.markLoaded('http://ex/data');
    expect(rdf.isLoaded('http://ex/data')).toBe(true);
  });

  test('different URLs are independent', () => {
    rdf.markLoaded('http://ex/a');
    expect(rdf.isLoaded('http://ex/b')).toBe(false);
  });

  test('clear resets loaded set', () => {
    rdf.markLoaded('http://ex/x');
    rdf._loaded.clear();
    expect(rdf.isLoaded('http://ex/x')).toBe(false);
  });
});

// ── Shared singleton store ────────────────────────────────────────────────

describe('singleton store', () => {
  test('store is lazily created', () => {
    expect(rdf._store).toBeNull();
    const s = rdf.store;
    expect(s).toBeTruthy();
    expect(s.statements).toBeDefined();
  });

  test('store returns same instance on repeated access', () => {
    const s1 = rdf.store;
    const s2 = rdf.store;
    expect(s1).toBe(s2);
  });

  test('useStore replaces the singleton', () => {
    const external = rdf.graph();
    external.add(rdf.sym('http://ex/s'), rdf.sym('http://ex/p'), rdf.literal('v'));
    const ok = rdf.useStore(external);
    expect(ok).toBe(true);
    expect(rdf.store).toBe(external);
    expect(rdf.store.statements.length).toBe(1);
  });

  test('useStore clears loaded cache', () => {
    rdf.markLoaded('http://ex/old');
    rdf.useStore(rdf.graph());
    expect(rdf.isLoaded('http://ex/old')).toBe(false);
  });

  test('useStore rejects invalid store (no match method)', () => {
    const ok = rdf.useStore({ foo: 'bar' });
    expect(ok).toBe(false);
  });

  test('useStore rejects null', () => {
    const ok = rdf.useStore(null);
    expect(ok).toBe(false);
  });

  test('useStore picks up fetcher from external store', () => {
    const external = rdf.graph();
    const fakeFetcher = { fetch: () => {} };
    external.fetcher = fakeFetcher;
    rdf.useStore(external);
    expect(rdf._fetcher).toBe(fakeFetcher);
  });

  test('useStore clears fetcher when external has none', () => {
    rdf._fetcher = { fake: true };
    rdf.useStore(rdf.graph());
    expect(rdf._fetcher).toBeNull();
  });
});

// ── Capability probes ─────────────────────────────────────────────────────

describe('capability probes', () => {
  test('isReady returns true (mock provides graph)', () => {
    expect(rdf.isReady()).toBe(true);
  });

  test('hasSparqlEngine returns false (mock has no SPARQLToQuery)', () => {
    // The mock rdflib doesn't export SPARQLToQuery
    expect(rdf.hasSparqlEngine()).toBe(false);
  });

  test('hasRemoteSparql returns false (mock has no sparqlQuery)', () => {
    expect(rdf.hasRemoteSparql()).toBe(false);
  });
});

// ── Escape-hatch accessors ────────────────────────────────────────────────

describe('escape-hatch accessors', () => {
  test('NamedNode returns the class', () => {
    expect(rdf.NamedNode).toBeTruthy();
    const n = new rdf.NamedNode('http://ex/x');
    expect(n.termType).toBe('NamedNode');
  });

  test('BlankNode returns the class', () => {
    expect(rdf.BlankNode).toBeTruthy();
    const b = new rdf.BlankNode('b0');
    expect(b.termType).toBe('BlankNode');
  });

  test('Literal returns the class', () => {
    expect(rdf.Literal).toBeTruthy();
    const l = new rdf.Literal('v');
    expect(l.termType).toBe('Literal');
  });
});
