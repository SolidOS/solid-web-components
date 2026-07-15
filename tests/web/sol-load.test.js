/**
 * @jest-environment jsdom
 *
 * sol-load.js — the ci-free bootstrap (classic script).
 *
 * Covered here:
 *   • the baked MAP block is IN SYNC with what tools/build-importmaps.mjs
 *     derives from tools/external-deps.json + web/ (fails when a component
 *     or vendor dep is added without `npm run build:importmaps`);
 *   • executing the script injects exactly one inline import map whose
 *     entries are absolutized against the script's own URL;
 *   • an already-present import map that resolves `rdflib` suppresses
 *     injection (component-interop coexistence);
 *   • window.solLoad / window.solLoadReady are exposed.
 *
 * The actual dynamic import() path is exercised by the live example
 * (examples/sol-load.html) — jsdom has no import-map/module machinery.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const loaderSrc = readFileSync(resolve(root, 'web/sol-load.js'), 'utf8');

function bakedMap() {
  const m = /var MAP = (\{[\s\S]*?\});\n\s*\/\* ── end generated map ── \*\//.exec(loaderSrc);
  if (!m) throw new Error('generated-map markers not found in web/sol-load.js');
  return JSON.parse(m[1]);
}

describe('baked MAP stays in sync with the generator inputs', () => {
  const MAP = bakedMap();

  test('every vendor dep from external-deps.json is mapped to dist/vendor', () => {
    const { deps } = JSON.parse(
      readFileSync(resolve(root, 'tools/external-deps.json'), 'utf8'));
    for (const name of Object.keys(deps)) {
      const flat = name.replace(/\//g, '-');
      expect(MAP[name]).toBe(`dist/vendor/${flat}.js`);
    }
  });

  test('every top-level web/ module (except sol-load) is mapped by bare name', () => {
    const components = readdirSync(resolve(root, 'web'))
      .filter((f) => /^[a-z][a-z0-9-]*\.js$/.test(f))
      .map((f) => f.replace(/\.js$/, ''))
      .filter((c) => c !== 'sol-load');
    for (const c of components) expect(MAP[c]).toBe(`web/${c}.js`);
    expect(MAP['sol-load']).toBeUndefined();
  });

  test('package-prefix entries are present', () => {
    expect(MAP['sol-components/core/']).toBe('core/');
    expect(MAP['sol-components/']).toBe('web/');
  });

  test('rdf-bundle (the ci manifest shared-modules name) is aliased', () => {
    expect(MAP['rdf-bundle']).toBe('core/rdf-bundle.js');
  });
});

describe('runtime behavior (jsdom)', () => {
  // Execute the classic script with a faked document.currentScript.
  function run({ existingMap = null, components = '' } = {}) {
    document.head.innerHTML = '';
    if (existingMap != null) {
      const pre = document.createElement('script');
      pre.type = 'importmap';
      pre.textContent = existingMap;
      document.head.appendChild(pre);
    }
    const tag = document.createElement('script');
    tag.setAttribute('src', '/node_modules/sol-components/web/sol-load.js');
    if (components) tag.setAttribute('data-components', components);
    document.head.appendChild(tag);
    // jsdom resolves .src against the test origin (http://localhost/)
    Object.defineProperty(document, 'currentScript', {
      value: tag, configurable: true,
    });
    new Function(loaderSrc)();      // eslint-disable-line no-new-func
    Object.defineProperty(document, 'currentScript', {
      value: null, configurable: true,
    });
    return tag;
  }

  afterEach(() => {
    delete window.solLoad;
    delete window.solLoadReady;
  });

  test('injects one import map, absolutized against the script URL', () => {
    run();
    const maps = document.querySelectorAll('script[type="importmap"]');
    expect(maps).toHaveLength(1);
    const { imports } = JSON.parse(maps[0].textContent);
    expect(imports.rdflib)
      .toBe('http://localhost/node_modules/sol-components/dist/vendor/rdflib.js');
    expect(imports['sol-weather'])
      .toBe('http://localhost/node_modules/sol-components/web/sol-weather.js');
    expect(imports['sol-components/core/'])
      .toBe('http://localhost/node_modules/sol-components/core/');
  });

  test('skips injection when an existing map already resolves rdflib', () => {
    run({ existingMap: '{"imports":{"rdflib":"/elsewhere/rdflib.js"}}' });
    expect(document.querySelectorAll('script[type="importmap"]')).toHaveLength(1);
  });

  test('still injects when the existing map is unrelated', () => {
    run({ existingMap: '{"imports":{"lodash":"/x/lodash.js"}}' });
    expect(document.querySelectorAll('script[type="importmap"]')).toHaveLength(2);
  });

  test('exposes solLoad and a resolved solLoadReady when nothing is named', async () => {
    run();
    expect(typeof window.solLoad).toBe('function');
    await expect(window.solLoadReady).resolves.toEqual([]);
  });
});
