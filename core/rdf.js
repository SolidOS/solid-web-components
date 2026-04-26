// Singleton wrapper around rdflib. The rest of the codebase goes through this
// class so rdflib is imported in exactly one place. Rollup treats `rdflib` as
// external (mapped to the `$rdf` UMD global); jest's moduleNameMapper maps it
// to a mock; importmaps/bundlers resolve it normally.

// Full URL so browser ESM consumers don't need an importmap. Rollup treats
// this URL as external (see rollup.config.js) so UMD builds don't try to
// bundle it. Jest maps it to the mock via moduleNameMapper (see package.json).
import * as _rdflib from 'https://esm.sh/rdflib@2';

// `import * as _rdflib` exposes rdflib's named exports directly.
const _lib = _rdflib;

class Rdf {
  constructor() {
    this._store = null;    // lazy shared singleton store
    this._fetcher = null;  // fetcher bound to _store
    this._loaded = new Set(); // URLs already parsed into _store (cache key)
  }

  // Record that `url` has been parsed into the shared store.
  markLoaded(url) { this._loaded.add(url); }
  isLoaded(url)   { return this._loaded.has(url); }

  // Term constructors
  sym(uri)                         { return _lib.sym(uri); }
  literal(value, langOrDatatype)   { return _lib.literal(value, langOrDatatype); }
  blankNode(id)                    { return _lib.blankNode(id); }

  // Stores & parsing
  graph()                          { return _lib.graph(); }
  parse(text, store, base, type)   { return _lib.parse(text, store, base, type); }

  // Shared singleton store — interop point with solid-logic / solid-ui / mashlib.
  // If one of those sets its own store first, call `useStore(external)` so we
  // all share the same rdflib graph and cache.
  get store() {
    if (!this._store) this._store = _lib.graph();
    return this._store;
  }
  useStore(externalStore) {
    if (!externalStore || typeof externalStore.match !== 'function') return false;
    this._store = externalStore;
    this._fetcher = externalStore.fetcher || null;
    this._loaded.clear();
    return true;
  }
  get storeFetcher() {
    if (this._fetcher) return this._fetcher;
    if (this.store.fetcher) { this._fetcher = this.store.fetcher; return this._fetcher; }
    this._fetcher = new _lib.Fetcher(this.store);
    this.store.fetcher = this._fetcher;
    return this._fetcher;
  }

  // SPARQL
  fetcher(store, opts)             { return new _lib.Fetcher(store, opts); }
  sparqlToQuery(query, isUpdate, store) { return _lib.SPARQLToQuery(query, isUpdate, store); }
  sparqlQuery(query, opts)         { return _lib.sparqlQuery(query, opts); }

  // Capability probes
  isReady()          { return !!_lib && typeof _lib.graph === 'function'; }
  hasSparqlEngine()  { return typeof _lib.SPARQLToQuery === 'function'; }
  hasRemoteSparql()  { return typeof _lib.sparqlQuery === 'function'; }

  // Serialization
  serialize(doc, store, base, contentType) {
    return _lib.serialize(doc, store, base, contentType);
  }

  // UpdateManager — for PATCH-based edits and putBack
  get UpdateManager() { return _lib.UpdateManager; }

  // Escape hatches for the few places that need rdflib-shaped access
  // (e.g. `new rdflib.Fetcher(...)`). Prefer the methods above.
  get SPARQLToQuery() { return _lib.SPARQLToQuery; }
  get Fetcher()       { return _lib.Fetcher; }
  get NamedNode()     { return _lib.NamedNode; }
  get BlankNode()     { return _lib.BlankNode; }
  get Literal()       { return _lib.Literal; }
  get Collection()    { return _lib.Collection; }
  get Statement()     { return _lib.Statement; }
}

export const rdf = new Rdf();
export default rdf;
