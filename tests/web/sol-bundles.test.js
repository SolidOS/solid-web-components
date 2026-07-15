/**
 * @jest-environment jsdom
 *
 * Bundle entries (2026-07-14 reorganization; replaces sol-full.test.js —
 * sol-full is REMOVED):
 *   sol-basic       — everyday UI + menu-from-rdf (from-rdf works out of the box)
 *   sol-pod-bundle  — sol-pod + sol-pod-extras (ops, wac) + sol-live-edit
 *   sol-form-bundle — the editing stack via core/rdf-bundle.js
 * Each is a side-effect aggregator: importing it registers the elements.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

window.__SolSuppressDefineWarn = true;

const here = dirname(fileURLToPath(import.meta.url));
const REG_KEY = Symbol.for('sol-components.menu-consumers');

test('sol-basic registers the everyday UI AND activates from-rdf', async () => {
  await import('../../web/sol-basic.js');
  for (const tag of ['sol-button', 'sol-dropdown-button', 'sol-include', 'sol-menu',
                     'sol-tabs', 'sol-accordion', 'sol-rolodex', 'sol-settings-nav',
                     'sol-default', 'sol-modal', 'sol-window']) {
    expect(customElements.get(tag)).toBeDefined();
  }
  // menu-from-rdf came along: the shared registry has a loader installed
  expect(typeof globalThis[REG_KEY]?.loader).toBe('function');
});

test('sol-pod-bundle registers the pod stack', async () => {
  await import('../../web/sol-pod-bundle.js');
  for (const tag of ['sol-pod', 'sol-pod-ops', 'sol-wac', 'sol-live-edit']) {
    expect(customElements.get(tag)).toBeDefined();
  }
});

test('sol-form-bundle is the web-tier name for core/rdf-bundle.js', () => {
  // Executing it in jest would need the whole solid-ui stack; assert the
  // wiring statically — the bundle is a single re-import of rdf-bundle,
  // whose own imports (sol-form, sol-tree-edit, sol-modal, sol-settings)
  // register the elements at runtime through the importmap.
  const src = readFileSync(join(here, '../../web/sol-form-bundle.js'), 'utf8');
  expect(src).toMatch(/import '\.\.\/core\/rdf-bundle\.js';/);
  const core = readFileSync(join(here, '../../core/rdf-bundle.js'), 'utf8');
  for (const dep of ['sol-form', 'sol-tree-edit', 'sol-modal', 'sol-settings']) {
    expect(core).toContain(`import '${dep}'`);
  }
});

test('sol-full is gone', () => {
  expect(existsSync(join(here, '../../web/sol-full.js'))).toBe(false);
});
