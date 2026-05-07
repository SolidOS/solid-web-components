/**
 * @jest-environment jsdom
 *
 * Verifies that ComunicaSparqlAdapter forwards an authenticated fetchFn
 * into the Comunica engine's query context. Without this propagation,
 * authenticated SPARQL endpoints fail even when a sol-login session is
 * active — see core/auth-fetch.js / core/utils.js.
 */

import { jest } from '@jest/globals';
import { ComunicaSparqlAdapter } from '../../core/utils.js';

function fakeEngineFactory(captureCtx) {
  return () => ({
    queryBindings: async (query, ctx) => {
      captureCtx(ctx);
      return { toArray: async () => [] };
    },
  });
}

describe('ComunicaSparqlAdapter — fetch propagation', () => {
  test('passes the fetchFn through as ctx.fetch', async () => {
    const seen = {};
    const fakeFetch = jest.fn();
    const adapter = new ComunicaSparqlAdapter(fakeEngineFactory(ctx => Object.assign(seen, ctx)));

    await adapter.executeQuery(
      'SELECT ?s WHERE { ?s ?p ?o }',
      'https://pod.example.org/sparql',
      fakeFetch,
    );

    expect(seen.fetch).toBe(fakeFetch);
    expect(seen.sources).toEqual(['https://pod.example.org/sparql']);
  });

  test('omits ctx.fetch when no fetchFn is supplied', async () => {
    const seen = {};
    const adapter = new ComunicaSparqlAdapter(fakeEngineFactory(ctx => Object.assign(seen, ctx)));

    await adapter.executeQuery(
      'SELECT ?s WHERE { ?s ?p ?o }',
      'https://example.org/sparql',
    );

    expect('fetch' in seen).toBe(false);
    expect(seen.sources).toEqual(['https://example.org/sparql']);
  });

  test('omits ctx.fetch when fetchFn is not a function', async () => {
    const seen = {};
    const adapter = new ComunicaSparqlAdapter(fakeEngineFactory(ctx => Object.assign(seen, ctx)));

    await adapter.executeQuery(
      'SELECT ?s WHERE { ?s ?p ?o }',
      'https://example.org/sparql',
      undefined,
    );

    expect('fetch' in seen).toBe(false);
  });

  test('keeps lenient: true so endpoints with quirky data still respond', async () => {
    const seen = {};
    const adapter = new ComunicaSparqlAdapter(fakeEngineFactory(ctx => Object.assign(seen, ctx)));

    await adapter.executeQuery('SELECT ?s WHERE { ?s ?p ?o }', 'https://example.org/sparql');
    expect(seen.lenient).toBe(true);
  });
});
