/**
 * @jest-environment jsdom
 *
 * <sol-plugin-manager> entry editor (plugin-manifest-unification stage 6):
 * ✎ on an OWNED card opens a modal overlay hosting a shape-driven
 * <sol-form> over the ui:Plugin entry (shape = the shipped :PluginShape,
 * subject = the entry IRI, contract fields guard-railed via readOnlyKeys).
 * Covered:
 *   - owned cards get the ✎ affordance; ghost cards don't
 *   - ✎ opens the overlay with a correctly-wired sol-form
 *   - Escape and the ✕ button close it
 *   - a dirty close reloads the cards and announces the catalog change
 *   - disconnect closes a hanging editor
 * Same harness as sol-plugin-manager.test.js (404-stubbed fetch, seeded
 * _items, jest rdflib mock). sol-form itself is not exercised beyond
 * mounting — its behavior has its own suite.
 */

import { jest } from '@jest/globals';
import { SolPluginManager } from '../../web/sol-plugin-manager.js';

window.__SolSuppressDefineWarn = true;

function mock404() {
  global.fetch = () => Promise.resolve({
    ok: false, status: 404,
    headers: new Map(),
    text: () => Promise.resolve(''),
  });
}

async function settle() { await new Promise(r => setTimeout(r, 20)); }

async function mount(attrs = '') {
  document.body.innerHTML =
    `<sol-plugin-manager id="pm" source="catalog.ttl#InUse" ${attrs}></sol-plugin-manager>`;
  const el = document.getElementById('pm');
  await settle();
  return el;
}

const cardEls = (el) => [...el.shadowRoot.querySelectorAll('.card')];

function seed(el) {
  el._items = [
    { type: 'component', id: 'clock', name: 'Clock', tag: 'sol-clock', params: [] },
  ];
  el._render();
}

beforeEach(() => { mock404(); delete window.ComponentInterop; });
afterEach(() => { document.body.innerHTML = ''; delete window.ComponentInterop; });

test('an owned card gets the ✎ edit affordance', async () => {
  const el = await mount();
  seed(el);
  const card = cardEls(el)[0];
  const edit = card.querySelector('.card-edit');
  expect(edit).not.toBeNull();
  expect(edit.getAttribute('aria-label')).toBe('Edit “Clock”');
});

test('a ghost card (no id) has no ✎', async () => {
  const el = await mount();
  const ghost = el._card({ ghost: true, name: 'Loader thing', tag: 'sol-x' });
  expect(ghost.querySelector('.card-edit')).toBeNull();
});

test('✎ opens the overlay with a shape-driven sol-form over the entry', async () => {
  const el = await mount();
  seed(el);
  cardEls(el)[0].querySelector('.card-edit').click();
  await settle();
  const ov = el.shadowRoot.querySelector('.editor-overlay');
  expect(ov).not.toBeNull();
  const form = ov.querySelector('sol-form');
  expect(form).not.toBeNull();
  expect(form.getAttribute('shape')).toMatch(/shapes\/ui\.shacl$/);
  expect(form.getAttribute('subject')).toBe(`${el._docUrl()}#clock`);
  // guard rails: a Component/Command entry's schema:url is contract — a
  // static row, not an input (a Link's url would be editable: [])
  expect(form.readOnlyKeys).toEqual(['url']);
  // one record — the multi-valued schema:additionalProperty must NOT pivot a rolodex
  expect(form.recordMode).toBe(true);
  expect(ov.querySelector('.editor-head').textContent).toContain('Edit “Clock”');
});

test('✕ and Escape both close the editor', async () => {
  const el = await mount();
  seed(el);
  cardEls(el)[0].querySelector('.card-edit').click();
  await settle();
  el.shadowRoot.querySelector('.editor-close').click();
  expect(el.shadowRoot.querySelector('.editor-overlay')).toBeNull();

  cardEls(el)[0].querySelector('.card-edit').click();
  await settle();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  expect(el.shadowRoot.querySelector('.editor-overlay')).toBeNull();
});

test('a dirty close reloads the cards and announces the catalog change', async () => {
  const el = await mount();
  seed(el);
  cardEls(el)[0].querySelector('.card-edit').click();
  await settle();
  const form = el.shadowRoot.querySelector('.editor-overlay sol-form');
  form.dispatchEvent(new CustomEvent('sol-form-save', { bubbles: false }));

  const loads = jest.spyOn(el, '_load').mockResolvedValue();
  const announced = [];
  el.addEventListener('sol-menu-built', (e) => announced.push(e.detail.source));
  el.shadowRoot.querySelector('.editor-close').click();
  expect(loads).toHaveBeenCalled();
  expect(announced).toEqual([el.source]);
  loads.mockRestore();
});

test('a clean close neither reloads nor announces', async () => {
  const el = await mount();
  seed(el);
  cardEls(el)[0].querySelector('.card-edit').click();
  await settle();
  const loads = jest.spyOn(el, '_load').mockResolvedValue();
  const announced = [];
  el.addEventListener('sol-menu-built', (e) => announced.push(e.detail.source));
  el.shadowRoot.querySelector('.editor-close').click();
  expect(loads).not.toHaveBeenCalled();
  expect(announced).toEqual([]);
  loads.mockRestore();
});

test('disconnect closes a hanging editor without a refresh', async () => {
  const el = await mount();
  seed(el);
  cardEls(el)[0].querySelector('.card-edit').click();
  await settle();
  el.shadowRoot.querySelector('.editor-overlay sol-form')
    .dispatchEvent(new CustomEvent('sol-form-save'));
  const loads = jest.spyOn(el, '_load').mockResolvedValue();
  el.remove();
  expect(loads).not.toHaveBeenCalled();
  loads.mockRestore();
});
