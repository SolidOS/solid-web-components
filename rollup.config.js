import resolve  from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json     from '@rollup/plugin-json';
import terser   from '@rollup/plugin-terser';

const minify = !!process.env.MINIFY;

// External dependencies — never bundled; supplied by the host page.
const external = ['rdflib', 'dompurify', 'marked'];

// Rewrite the bare-browser-ESM URL for rdflib (used in core/rdf.js so that
// consumers loading our ESM directly don't need an importmap) back to the npm
// specifier `rdflib`. Per-component bundles then see it as external; the
// all-in-one bundle resolves it via node_modules.
const aliasRdflibUrl = () => ({
  name: 'alias-rdflib-url',
  resolveId(id, importer, { custom, isEntry } = {}) {
    if (id === 'https://esm.sh/rdflib@2') {
      return this.resolve('rdflib', importer, { skipSelf: true });
    }
    return null;
  },
});

// Resolve @solid-components/core/* workspace imports to local ./core/* paths
// so rollup inlines core code into per-component UMD builds.
const aliasCorePackage = () => ({
  name: 'alias-core-package',
  resolveId(id, importer) {
    if (id.startsWith('@solid-components/core/')) {
      const rest = id.slice('@solid-components/core/'.length);
      return this.resolve('./core/' + rest, undefined, { skipSelf: true });
    }
    if (id === '@solid-components/core') {
      return this.resolve('./core/rdf-utils.js', undefined, { skipSelf: true });
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

const plugins = [aliasCorePackage(), aliasRdflibUrl(), stubMissingDynamic(), resolve()];
if (minify) plugins.push(terser());

// Plugins for the all-in-one bundle (bundles CJS deps like rdflib internals,
// Comunica's many sub-packages, and inrupt auth).
const bundlePlugins = [
  aliasCorePackage(),
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
    input:    'web/sol-query.js',
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
    input:    'core/rdf-utils.js',
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
    input:    'web/sol-include.js',
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
    input:    'web/sol-live-edit.js',
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
    input:    'web/sol-tabs.js',
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
    input:    'web/sol-menu.js',
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
  // ── sol-form (generic RDF form renderer, uses solid-ui) ─────────────────────
  {
    input:    'web/sol-form.js',
    external: [...external, 'n3', 'rdf-validate-shacl'],
    plugins,
    output: {
      file:    minify ? 'dist/sol-form.umd.min.js' : 'dist/sol-form.umd.js',
      format:  'umd',
      name:    'SolForm',
      exports: 'named',
      globals: { rdflib: '$rdf', dompurify: 'DOMPurify', marked: 'marked', n3: 'N3', 'rdf-validate-shacl': 'SHACLValidator' },
    },
  },
  // ── sol-wac (WAC/ACL editor, light-DOM) ────────────────────────────────────
  {
    input:    'web/sol-wac.js',
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
    input:    'web/sol-solidos.js',
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
    input:   'web/solid-web-components.bundle.js',
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
