import resolve  from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json     from '@rollup/plugin-json';
import terser   from '@rollup/plugin-terser';

const minify = !!process.env.MINIFY;

// External dependencies — never bundled; supplied by the host page.
const external = ['rdflib', 'dompurify', 'marked'];

// Rewrite the bare-browser-ESM URL for rdflib (used in shared/rdf.js so that
// consumers loading our ESM directly don't need an importmap) back to the npm
// specifier `rdflib`. Per-component bundles then see it as external; the
// all-in-one bundle resolves it via node_modules.
// `external` in the build config handles externality; here we just rewrite
// the URL → bare specifier and let rollup follow its normal rules.
const aliasRdflibUrl = () => ({
  name: 'alias-rdflib-url',
  resolveId(id, importer, { custom, isEntry } = {}) {
    if (id === 'https://esm.sh/rdflib@2') {
      return this.resolve('rdflib', importer, { skipSelf: true });
    }
    return null;
  },
});

// Runtime-optional dynamic imports that live outside this repo
// (e.g. `../src/podz-editor.js`, which only resolves when sol-live-edit is
// consumed from within podz). Mark them external so rollup emits the bare
// `import()` call; the host wraps it in try/catch, so runtime failure is fine.
const stubMissingDynamic = () => ({
  name: 'externalize-missing-dynamic',
  resolveId(id) {
    if (id.includes('podz-editor')) return { id, external: true };
    // Stub Node built-ins pulled in transitively (e.g. `node:diagnostics_channel`
    // from Comunica's HTTP stack). They're never executed in the browser.
    if (id.startsWith('node:')) return { id: '\0stub:node-builtin', external: false };
    return null;
  },
  load(id) {
    if (id === '\0stub:node-builtin') return 'export default {}; export const channel = () => ({ publish: () => {}, hasSubscribers: false });';
    return null;
  },
});

const plugins = [aliasRdflibUrl(), stubMissingDynamic(), resolve()];
if (minify) plugins.push(terser());

// Plugins for the all-in-one bundle (bundles CJS deps like rdflib internals,
// Comunica's many sub-packages, and inrupt auth).
const bundlePlugins = [
  aliasRdflibUrl(),
  stubMissingDynamic(),
  resolve({ browser: true, preferBuiltins: false }),
  commonjs({ transformMixedEsModules: true, ignoreDynamicRequires: true }),
  json(),
];
if (minify) bundlePlugins.push(terser());

export default [
  // ── sol-query (component + RDF engine + UI + triple-pattern parser) ────────
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
  // ── sol-tabs (light-DOM, zero deps) ────────────────────────────────────────
  {
    input:    'sol-tabs.js',
    external,
    plugins,
    output: {
      file:    minify ? 'dist/sol-tabs.umd.min.js' : 'dist/sol-tabs.umd.js',
      format:  'umd',
      name:    'SolTabs',
      exports: 'named',
      globals: { rdflib: '$rdf', dompurify: 'DOMPurify', marked: 'marked' },
    },
  },
  // ── sol-menu (light-DOM, zero deps) ────────────────────────────────────────
  {
    input:    'sol-menu.js',
    external,
    plugins,
    output: {
      file:    minify ? 'dist/sol-menu.umd.min.js' : 'dist/sol-menu.umd.js',
      format:  'umd',
      name:    'SolMenu',
      exports: 'named',
      globals: { rdflib: '$rdf', dompurify: 'DOMPurify', marked: 'marked' },
    },
  },
  // ── sol-wac (WAC/ACL editor, light-DOM) ────────────────────────────────────
  {
    input:    'sol-wac.js',
    external,
    plugins,
    output: {
      file:    minify ? 'dist/sol-wac.umd.min.js' : 'dist/sol-wac.umd.js',
      format:  'umd',
      name:    'SolWac',
      exports: 'named',
      globals: { rdflib: '$rdf', dompurify: 'DOMPurify', marked: 'marked' },
    },
  },
  // ── sol-solidos (mashlib/SolidOS wrapper — mashlib loaded externally) ──────
  {
    input:    'sol-solidos.js',
    external: [...external, 'mashlib'],
    plugins,
    output: {
      file:    minify ? 'dist/sol-solidos.umd.min.js' : 'dist/sol-solidos.umd.js',
      format:  'umd',
      name:    'SolSolidos',
      exports: 'named',
      globals: { rdflib: '$rdf', dompurify: 'DOMPurify', marked: 'marked', mashlib: 'Mashlib' },
    },
  },
  // ── all-in-one bundle: every component + rdflib + inrupt auth + Comunica ───
  {
    input:   'solid-web-components.bundle.js',
    // Runtime-only dynamic imports (esm.sh CDN, importmap-provided globals,
    // node built-ins pulled in by transitive deps that the browser never
    // actually executes) must stay external so rollup doesn't try to bundle
    // them.
    // Only runtime-loaded CDN URLs stay external (graphviz/mermaid/d3/JSZip
    // are fetched lazily from esm.sh and not worth inlining). rdflib@2 must
    // be inlined — the aliasRdflibUrl plugin rewrites its URL to the npm
    // specifier so resolve() can pick it up.
    external: (id) => id.startsWith('https://esm.sh/') && id !== 'https://esm.sh/rdflib@2',
    plugins: bundlePlugins,
    output: {
      file:      minify
        ? 'dist/solid-web-components.bundle.min.js'
        : 'dist/solid-web-components.bundle.js',
      format:    'iife',
      name:      'SolidWebComponents',
      exports:   'named',
      inlineDynamicImports: true,
    },
  },
];
