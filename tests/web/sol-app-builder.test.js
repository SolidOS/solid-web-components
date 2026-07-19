/**
 * @jest-environment jsdom
 *
 * <sol-app-builder> — the wizard that builds a standalone app folder on the
 * pod. Network is fully mocked at the module seams (auth-fetch, rdf-utils,
 * pod-ops): a `docs` route table serves GETs, PUT/PATCH bodies are recorded,
 * and loadRdfStore parses route-table Turtle with n3 into the rdflib mock
 * store (the mock's own tokenizer has no lists/blank nodes). The REAL
 * shipped presets from data/layouts/ are served, so preset→layout→generate
 * exercises the true artifacts.
 *
 * Covered:
 *   - steps rail renders; app-dependent steps disabled until an app exists
 *   - Create app → PUT app.ttl (schema:WebApplication + name) → Layout step
 *   - preset cards render from the shipped index.ttl; picking classic-shell
 *     PUTs layout.ttl AND seeds app-menu.ttl (a newborn ui:Menu)
 *   - Generate PUTs index.html (visible from-rdf, sol-load boot) + app.css
 *   - Add to catalog PATCHes an INSERT DATA ui:Plugin (kind ui:Link)
 */

import { jest } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Parser } from 'n3';
import rdflib from '../__mocks__/rdflib-esm.js';

window.__SolSuppressDefineWarn = true;

const here = dirname(fileURLToPath(import.meta.url));
const layoutsDir = join(here, '..', '..', 'data', 'layouts');

let docs = {};       // url → text (GET routes; PUTs land here too)
let writes = [];     // recorded {url, method, body, type}
let patchFails = false; // simulate CSS "Lock expired" 500 on PATCH

function parseInto(text, base) {
  const g = rdflib.graph();
  const conv = (t) =>
    t.termType === 'Literal' ? rdflib.literal(t.value)
      : rdflib.sym(t.termType === 'BlankNode' ? `_:${t.value}` : t.value);
  for (const q of new Parser({ baseIRI: base }).parse(text)) {
    g.add(conv(q.subject), conv(q.predicate), conv(q.object));
  }
  return g;
}

jest.unstable_mockModule('../../core/auth-fetch.js', () => ({
  solFetch: jest.fn(async (url, opts = {}) => {
    const method = (opts.method || 'GET').toUpperCase();
    if (method === 'GET' || method === 'HEAD') {
      const body = docs[String(url).split('#')[0]];
      return { ok: body != null, status: body != null ? 200 : 404, text: async () => body || '' };
    }
    writes.push({
      url: String(url), method, body: opts.body,
      type: opts.headers && opts.headers['Content-Type'],
    });
    if (method === 'PATCH' && patchFails) {
      return { ok: false, status: 500, text: async () => 'Lock expired' };
    }
    if (method === 'PUT') docs[String(url)] = opts.body;
    return { ok: true, status: 201, text: async () => '' };
  }),
}));

jest.unstable_mockModule('../../core/rdf-utils.js', () => ({
  loadRdfStore: jest.fn(async (url) => {
    const doc = String(url).split('#')[0];
    if (docs[doc] == null) throw new Error(`404 ${doc}`);
    return parseInto(docs[doc], doc);
  }),
}));

jest.unstable_mockModule('../../core/pod-ops.js', () => ({
  fetchContainer: jest.fn(async () => []),
}));

await import('../../web/sol-app-builder.js');

const APPS = 'http://pod.test/apps/';
const PRESETS = 'http://pod.test/layouts/index.ttl';
const CATALOG = 'http://pod.test/catalog.ttl#Available';

function settle(ms = 30) { return new Promise((r) => setTimeout(r, ms)); }

beforeEach(() => {
  docs = {};
  writes = [];
  patchFails = false;
  // the shipped presets, served at PRESETS' folder
  docs[PRESETS] = readFileSync(join(layoutsDir, 'index.ttl'), 'utf8');
  for (const f of ['classic-shell.ttl', 'single-page.ttl', 'sidebar.ttl', 'dashboard-grid.ttl']) {
    docs[`http://pod.test/layouts/${f}`] = readFileSync(join(layoutsDir, f), 'utf8');
  }
  docs['http://pod.test/catalog.ttl'] = `@prefix ui: <http://www.w3.org/ns/ui#> .
<#Available> a ui:Menu ; ui:label "Available" ; ui:parts ( ) .
`;
});
afterEach(() => { document.body.innerHTML = ''; });

async function mount(attrs = '') {
  document.body.innerHTML = `<sol-app-builder id="b" apps-root="${APPS}"
    presets="${PRESETS}" catalog="${CATALOG}" ${attrs}></sol-app-builder>`;
  const el = document.getElementById('b');
  await settle();
  return el;
}

async function createHello(el) {
  el.querySelector('[name=app-name]').value = 'Hello World';
  el.querySelector('[name=app-icon]').value = '🍳';
  el.querySelector('form.sab-new button[type=submit]').click();
  await settle();
}

test('steps rail renders; app steps disabled until an app exists', async () => {
  const el = await mount();
  const stepButtons = [...el.querySelectorAll('.sab-steps [data-step]')];
  expect(stepButtons.map((b) => b.dataset.step)).toEqual(['apps', 'layout', 'menus', 'publish']);
  expect(stepButtons.find((b) => b.dataset.step === 'apps').disabled).toBe(false);
  expect(stepButtons.find((b) => b.dataset.step === 'layout').disabled).toBe(true);
});

test('Create app PUTs app.ttl and advances to the Layout step', async () => {
  const el = await mount();
  await createHello(el);
  const put = writes.find((w) => w.url === `${APPS}hello-world/app.ttl`);
  expect(put).toBeTruthy();
  expect(put.method).toBe('PUT');
  expect(put.body).toContain('a schema:WebApplication');
  expect(put.body).toContain('schema:name "Hello World"');
  expect(put.body).toContain('ui:layout <layout.ttl#Layout>');
  expect(el.querySelector('[aria-current="step"]').dataset.step).toBe('layout');
  // preset cards from the shipped index
  const cards = [...el.querySelectorAll('[data-preset]')];
  expect(cards.length).toBe(4);
  expect(cards[0].textContent).toContain('Classic shell');
});

test('picking classic-shell copies layout.ttl and seeds app-menu.ttl', async () => {
  const el = await mount();
  await createHello(el);
  el.querySelector('[data-preset$="classic-shell.ttl"]').click();
  await settle();
  const layoutPut = writes.find((w) => w.url === `${APPS}hello-world/layout.ttl`);
  expect(layoutPut).toBeTruthy();
  expect(layoutPut.body).toContain('a ui:Layout');
  const menuPut = writes.find((w) => w.url === `${APPS}hello-world/app-menu.ttl`);
  expect(menuPut).toBeTruthy();
  expect(menuPut.body).toContain(':Tabs a ui:Menu');
  expect(menuPut.body).toContain('ui:Horizontal');
});

test('Generate writes readable index.html + app.css; Register PATCHes a ui:Plugin', async () => {
  const el = await mount();
  await createHello(el);
  el.querySelector('[data-preset$="classic-shell.ttl"]').click();
  await settle();
  el.querySelector('[data-step="publish"]').click();
  await settle(5);
  el.querySelector('[data-action="generate"]').click();
  await settle();

  const html = writes.find((w) => w.url === `${APPS}hello-world/index.html`);
  expect(html).toBeTruthy();
  expect(html.type).toBe('text/html');
  expect(html.body).toContain('from-rdf="app-menu.ttl#Tabs"');
  expect(html.body).toContain('sol-load.js');
  expect(html.body).toContain('<title>Hello World</title>');
  const css = writes.find((w) => w.url === `${APPS}hello-world/app.css`);
  expect(css).toBeTruthy();
  expect(css.body).toContain('.app-row');

  el.querySelector('[data-action="register"]').click();
  await settle();
  const patch = writes.find((w) => w.method === 'PATCH');
  expect(patch).toBeTruthy();
  expect(patch.url).toBe('http://pod.test/catalog.ttl');
  expect(patch.type).toBe('application/sparql-update');
  expect(patch.body).toContain('INSERT DATA');
  expect(patch.body).toContain('a <http://www.w3.org/ns/ui#Plugin>');
  expect(patch.body).toContain('<http://schema.org/additionalType> <http://www.w3.org/ns/ui#Link>');
  expect(patch.body).toContain(`<${APPS}hello-world/index.html>`);
  expect(patch.body).toContain('<http://www.w3.org/ns/ui#label> "Hello World"');
});

test('a failed PATCH (CSS lock expired) falls back to whole-doc PUT', async () => {
  patchFails = true;
  const el = await mount();
  await createHello(el);
  el.querySelector('[data-preset$="classic-shell.ttl"]').click();
  await settle();
  el.querySelector('[data-step="publish"]').click();
  await settle(5);
  el.querySelector('[data-action="generate"]').click();
  await settle();
  el.querySelector('[data-action="register"]').click();
  await settle();
  const put = writes.find((w) => w.method === 'PUT' && w.url === 'http://pod.test/catalog.ttl');
  expect(put).toBeTruthy();
  expect(put.body).toContain('#Available'); // the original doc is preserved
  expect(put.body).toContain(`<${APPS}hello-world/index.html>`);
  expect(put.body).toContain(`<http://www.w3.org/ns/ui#Plugin>`);
  expect(el.querySelector('[data-action="register"]').textContent).toContain('Added to catalog');
});

test('the Menus step mounts one manager per menu doc the layout names', async () => {
  const el = await mount();
  await createHello(el);
  el.querySelector('[data-preset$="classic-shell.ttl"]').click();
  await settle();
  el.querySelector('[data-step="menus"]').click();
  await settle();
  const managers = [...el.querySelectorAll('#sab-managers sol-menu-manager')];
  expect(managers.length).toBe(1);
  expect(managers[0].getAttribute('source')).toBe(`${APPS}hello-world/app-menu.ttl#Tabs`);
  expect(managers[0].getAttribute('catalog')).toBe(CATALOG);
  const pantry = el.querySelector('sol-plugin-manager');
  expect(pantry).toBeTruthy();
  expect(pantry.getAttribute('for')).toBe('#sab-managers sol-menu-manager');
});
