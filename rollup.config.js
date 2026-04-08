import resolve  from '@rollup/plugin-node-resolve';
import terser   from '@rollup/plugin-terser';

const minify = !!process.env.MINIFY;

// External dependencies — never bundled; supplied by the host page.
const external = ['rdflib', 'dompurify', 'marked'];

const plugins = [resolve()];
if (minify) plugins.push(terser());

export default [
  // ── sol-query (component + RDF engine + UI + mini) ─────────────────────────
  {
    input:    'sol-query.js',
    external,
    plugins,
    output: {
      file:    minify ? 'dist/sol-query.umd.min.js' : 'dist/sol-query.umd.js',
      format:  'umd',
      name:    'SolQuery',
      exports: 'named',
      globals: { rdflib: '$rdf', dompurify: 'DOMPurify', marked: 'marked' },
    },
  },
  // ── rdf-utils (engine only — for script-API consumers) ─────────────────────
  {
    input:    'shared/rdf-utils.js',
    external,
    plugins,
    output: {
      file:    minify ? 'dist/rdf-utils.umd.min.js' : 'dist/rdf-utils.umd.js',
      format:  'umd',
      name:    'SolQueryRdf',
      exports: 'named',
      globals: { rdflib: '$rdf', dompurify: 'DOMPurify' },
    },
  },
  // ── sol-include ─────────────────────────────────────────────────────────────
  {
    input:    'sol-include.js',
    external,
    plugins,
    output: {
      file:    minify ? 'dist/sol-include.umd.min.js' : 'dist/sol-include.umd.js',
      format:  'umd',
      name:    'SolInclude',
      exports: 'named',
      globals: { rdflib: '$rdf', dompurify: 'DOMPurify', marked: 'marked' },
    },
  },
  // ── sol-live-edit (core only — renderers/help/data are lazy-loaded) ────────
  {
    input:    'sol-live-edit.js',
    external,
    plugins,
    output: {
      file:    minify ? 'dist/sol-live-edit.umd.min.js' : 'dist/sol-live-edit.umd.js',
      format:  'umd',
      name:    'SolLiveEdit',
      exports: 'named',
      globals: { rdflib: '$rdf', dompurify: 'DOMPurify', marked: 'marked' },
    },
  },
];
