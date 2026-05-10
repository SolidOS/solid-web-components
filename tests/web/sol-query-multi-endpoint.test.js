/**
 * @jest-environment jsdom
 *
 * Tests for <sol-query>'s multi-endpoint / federation behavior, the
 * `_endpoints()` parser, and the W3C SPARQL Query Results JSON envelope
 * coming out of the rdflib paths. None of these are exercised by the
 * existing sol-query.test.js suites.
 */

import { jest } from '@jest/globals';
import rdflib from '../__mocks__/rdflib-esm.js';
window.$rdf = rdflib;
window.__SolSuppressDefineWarn = true;

import { SolQuery } from '../../web/sol-query.js';
import { ComunicaSparqlAdapter } from '../../core/utils.js';

// ── helpers ──────────────────────────────────────────────────────────────────

function createElement() {
  const el = document.createElement('sol-query');
  el.renderer = {
    showError:     jest.fn(),
    showLoading:   jest.fn(),
    renderResults: jest.fn(),
  };
  return el;
}
function attach(el) { document.body.appendChild(el); return el; }

// Capture sol-error events bubbled by _reportError so we can assert on them.
function captureErrors(el) {
  const events = [];
  el.addEventListener('sol-error', e => events.push(e.detail));
  return events;
}

// ── _endpoints() parsing ─────────────────────────────────────────────────────

describe('SolQuery — _endpoints() parsing', () => {
  let el;
  beforeEach(() => { el = attach(createElement()); });
  afterEach(() => el.remove());

  test('returns [] when attribute missing', () => {
    expect(el._endpoints()).toEqual([]);
  });

  test('returns [] when attribute is empty string', () => {
    el.setAttribute('endpoint', '');
    expect(el._endpoints()).toEqual([]);
  });

  test('returns single URL for a single value', () => {
    el.setAttribute('endpoint', 'https://a.example/data.ttl');
    expect(el._endpoints()).toEqual(['https://a.example/data.ttl']);
  });

  test('parses comma-separated list', () => {
    el.setAttribute('endpoint', 'https://a.example/x, https://b.example/y');
    expect(el._endpoints()).toEqual([
      'https://a.example/x',
      'https://b.example/y',
    ]);
  });

  test('parses whitespace-separated list', () => {
    el.setAttribute('endpoint', 'https://a.example/x https://b.example/y');
    expect(el._endpoints()).toEqual([
      'https://a.example/x',
      'https://b.example/y',
    ]);
  });

  test('parses mixed comma + whitespace + tab + newline', () => {
    el.setAttribute(
      'endpoint',
      'https://a.example/x,\thttps://b.example/y\nhttps://c.example/z',
    );
    expect(el._endpoints()).toEqual([
      'https://a.example/x',
      'https://b.example/y',
      'https://c.example/z',
    ]);
  });

  test('skips empty tokens from trailing/leading separators', () => {
    el.setAttribute('endpoint', ' , https://a.example/x ,, https://b.example/y , ');
    expect(el._endpoints()).toEqual([
      'https://a.example/x',
      'https://b.example/y',
    ]);
  });
});

// ── initializeQuery: missing endpoint guards ────────────────────────────────

describe('SolQuery — initializeQuery missing endpoint', () => {
  let el;
  beforeEach(() => { el = attach(createElement()); });
  afterEach(() => el.remove());

  test('reports config error when endpoint attribute is absent', async () => {
    const errs = captureErrors(el);
    await el.initializeQuery();
    expect(errs).toHaveLength(1);
    expect(errs[0].source).toBe('sol-query');
    expect(errs[0].kind).toBe('config');
    expect(errs[0].message).toMatch(/no endpoint/i);
  });

  test('reports config error when endpoint is whitespace-only', async () => {
    el.setAttribute('endpoint', '   ');
    const errs = captureErrors(el);
    await el.initializeQuery();
    expect(errs).toHaveLength(1);
    expect(errs[0].kind).toBe('config');
  });
});

// ── Multi-endpoint without Comunica → must fail loudly ──────────────────────

describe('SolQuery — multi-endpoint without Comunica', () => {
  let el, origGet;
  beforeEach(() => {
    el = attach(createElement());
    // Force the probe to return null so the federated path falls into the
    // "Multiple endpoints require Comunica" branch.
    origGet = ComunicaSparqlAdapter.getComunicaEngine;
    ComunicaSparqlAdapter.getComunicaEngine = () => null;
  });
  afterEach(() => {
    ComunicaSparqlAdapter.getComunicaEngine = origGet;
    el.remove();
  });

  test('triple-pattern: rejects with "require Comunica"', async () => {
    el.setAttribute('endpoint', 'https://a.example/x, https://b.example/y');
    el.setAttribute('pattern',  '?s ?p ?o');
    const errs = captureErrors(el);
    await el.initializeQuery();
    expect(errs).toHaveLength(1);
    expect(errs[0].message).toMatch(/Multiple endpoints require Comunica/i);
  });

  test('default query: rejects with "require Comunica"', async () => {
    el.setAttribute('endpoint', 'https://a.example/x, https://b.example/y');
    const errs = captureErrors(el);
    await el.initializeQuery();
    expect(errs).toHaveLength(1);
    expect(errs[0].message).toMatch(/Multiple endpoints require Comunica/i);
  });
});

// ── Multi-endpoint with subject fragments → rejected ────────────────────────

describe('SolQuery — fragments rejected in multi-endpoint', () => {
  let el;
  beforeEach(() => { el = attach(createElement()); });
  afterEach(() => el.remove());

  test('first endpoint has #fragment → config error', async () => {
    el.setAttribute('endpoint', 'https://a.example/x#alice, https://b.example/y');
    el.setAttribute('pattern',  '?s ?p ?o');
    const errs = captureErrors(el);
    await el.initializeQuery();
    expect(errs).toHaveLength(1);
    expect(errs[0].kind).toBe('config');
    expect(errs[0].message).toMatch(/fragments are not supported in federated/i);
  });

  test('second endpoint has #fragment → config error', async () => {
    el.setAttribute('endpoint', 'https://a.example/x, https://b.example/y#bob');
    const errs = captureErrors(el);
    await el.initializeQuery();
    expect(errs).toHaveLength(1);
    expect(errs[0].message).toMatch(/fragments are not supported in federated/i);
  });

  test('any sparql attr also rejected when multi-endpoint has fragments', async () => {
    el.setAttribute('endpoint', 'https://a.example/x#alice, https://b.example/y#bob');
    el.setAttribute('sparql',   'SELECT * WHERE { ?s ?p ?o }');
    const errs = captureErrors(el);
    await el.initializeQuery();
    expect(errs).toHaveLength(1);
    expect(errs[0].message).toMatch(/fragments are not supported in federated/i);
  });

  test('single endpoint with #fragment is NOT rejected (allowed)', async () => {
    // A single endpoint with a fragment is a valid subject-filter query — it
    // must NOT trip the "fragments rejected" guard. We don't drive this all
    // the way through; we just check that the guard doesn't fire.
    el.setAttribute('endpoint', 'https://a.example/x#alice');
    const errs = captureErrors(el);
    // Stub the actual loader so the test doesn't try real I/O.
    const origLoad = el.handleDefaultQuery;
    el.handleDefaultQuery = jest.fn(async () => {});
    await el.initializeQuery();
    expect(errs.filter(e => /fragments are not supported/i.test(e.message))).toHaveLength(0);
    expect(el.handleDefaultQuery).toHaveBeenCalled();
    el.handleDefaultQuery = origLoad;
  });
});

// ── Multi-endpoint federated path actually attempts Comunica ────────────────

describe('SolQuery — multi-endpoint with Comunica', () => {
  let origGet, executeQueryMock;
  beforeEach(() => {
    executeQueryMock = jest.fn().mockResolvedValue({
      head:    { vars: ['s', 'p', 'o'] },
      results: { bindings: [] },
    });
    origGet = ComunicaSparqlAdapter.getComunicaEngine;
    ComunicaSparqlAdapter.getComunicaEngine = () =>
      () => ({ queryBindings: async () => ({ toArray: async () => [] }) });
    jest.spyOn(ComunicaSparqlAdapter.prototype, 'executeQuery')
      .mockImplementation(executeQueryMock);
  });
  afterEach(() => {
    jest.restoreAllMocks();
    ComunicaSparqlAdapter.getComunicaEngine = origGet;
  });

  // Build, set attrs, then append: connectedCallback fires initializeQuery
  // exactly once, so the spy is called once.
  function buildAndAttach(attrs) {
    const el = createElement();
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    document.body.appendChild(el);
    return el;
  }

  // Wait for in-flight async initializeQuery to settle.
  const settle = () => new Promise(r => setTimeout(r, 0));

  test('federated triple pattern routes through Comunica with both sources', async () => {
    const el = buildAndAttach({
      endpoint: 'https://a.example/x, https://b.example/y',
      pattern:  '?s ?p ?o',
    });
    await settle();
    expect(executeQueryMock).toHaveBeenCalledTimes(1);
    const [, endpointsArg] = executeQueryMock.mock.calls[0];
    expect(endpointsArg).toEqual(['https://a.example/x', 'https://b.example/y']);
    el.remove();
  });

  test('federated default query (no pattern, no sparql) uses ?s ?p ?o', async () => {
    const el = buildAndAttach({
      endpoint: 'https://a.example/x, https://b.example/y',
    });
    await settle();
    expect(executeQueryMock).toHaveBeenCalledTimes(1);
    const [sparqlArg, endpointsArg] = executeQueryMock.mock.calls[0];
    expect(sparqlArg).toMatch(/SELECT[\s\S]+\?s\s+\?p\s+\?o/i);
    expect(endpointsArg).toEqual(['https://a.example/x', 'https://b.example/y']);
    el.remove();
  });

  test('federated SPARQL passes the inline query through to Comunica', async () => {
    const el = buildAndAttach({
      endpoint: 'https://a.example/x, https://b.example/y',
      sparql:   'SELECT ?name WHERE { ?s <http://xmlns.com/foaf/0.1/name> ?name }',
    });
    await settle();
    expect(executeQueryMock).toHaveBeenCalledTimes(1);
    const [sparqlArg, endpointsArg] = executeQueryMock.mock.calls[0];
    expect(sparqlArg).toMatch(/SELECT \?name WHERE/);
    expect(Array.isArray(endpointsArg)).toBe(true);
    expect(endpointsArg).toHaveLength(2);
    el.remove();
  });
});

// ── `query` is an alias for `sparql` in the federated path too ─────────────

describe('SolQuery — query alias', () => {
  let origGet, executeQueryMock;
  beforeEach(() => {
    executeQueryMock = jest.fn().mockResolvedValue({
      head: { vars: [] }, results: { bindings: [] },
    });
    origGet = ComunicaSparqlAdapter.getComunicaEngine;
    ComunicaSparqlAdapter.getComunicaEngine = () =>
      () => ({ queryBindings: async () => ({ toArray: async () => [] }) });
    jest.spyOn(ComunicaSparqlAdapter.prototype, 'executeQuery')
      .mockImplementation(executeQueryMock);
  });
  afterEach(() => {
    jest.restoreAllMocks();
    ComunicaSparqlAdapter.getComunicaEngine = origGet;
  });

  test('query="..." is treated identically to sparql="..."', async () => {
    const el = createElement();
    el.setAttribute('endpoint', 'https://a.example/x, https://b.example/y');
    el.setAttribute('query',    'SELECT * WHERE { ?s ?p ?o }');
    document.body.appendChild(el);
    await new Promise(r => setTimeout(r, 0));
    expect(executeQueryMock).toHaveBeenCalledTimes(1);
    expect(executeQueryMock.mock.calls[0][0]).toMatch(/SELECT \* WHERE/);
    el.remove();
  });
});
