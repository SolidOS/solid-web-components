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
 *   - the five-step rail renders; app-dependent steps disabled until an app
 *     exists
 *   - Create app → PUT app.ttl (schema:WebApplication + name) → Layout step
 *     with schematic cards derived from each preset's RDF
 *   - picking banner-left-sidebar PUTs layout.ttl (theme chrome included)
 *     and seeds app-menu.ttl (#Menu AND #More), app-commands.ttl, help.html
 *   - the Elements step lists regions with the theme chrome as removable
 *     rows; Add / Remove rewrite layout.ttl via the serializer
 *   - Generate PUTs index.html (header/aside/main structure, chrome scripts,
 *     visible from-rdf) + app.css
 *   - Add to catalog PATCHes an INSERT DATA ui:Plugin (kind ui:Link), with
 *     whole-doc PUT fallback on lock expiry
 *   - the Plugins step mounts one manager per menu doc + the pantry
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

const PRESET_FILES = [
  'banner-main.ttl', 'banner-left-sidebar.ttl', 'banner-right-sidebar.ttl',
  'banner-two-sidebars.ttl', 'banner-main-footer.ttl',
];

beforeEach(() => {
  docs = {};
  writes = [];
  patchFails = false;
  // the shipped presets, served at PRESETS' folder
  docs[PRESETS] = readFileSync(join(layoutsDir, 'index.ttl'), 'utf8');
  for (const f of PRESET_FILES) {
    docs[`http://pod.test/layouts/${f}`] = readFileSync(join(layoutsDir, f), 'utf8');
  }
  docs['http://pod.test/catalog.ttl'] = `@prefix ui: <http://www.w3.org/ns/ui#> .
<#Available> a ui:Menu ; ui:label "Available" .
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

async function pickPreset(el, file) {
  el.querySelector(`[data-preset$="${file}"]`).click();
  await settle();
}

test('the five-step rail renders; app steps disabled until an app exists', async () => {
  const el = await mount();
  const stepButtons = [...el.querySelectorAll('.sab-steps [data-step]')];
  expect(stepButtons.map((b) => b.dataset.step))
    .toEqual(['apps', 'layout', 'elements', 'plugins', 'publish']);
  expect(stepButtons.find((b) => b.dataset.step === 'apps').disabled).toBe(false);
  expect(stepButtons.find((b) => b.dataset.step === 'layout').disabled).toBe(true);
});

test('Create app PUTs app.ttl and advances to Layout with schematic cards', async () => {
  const el = await mount();
  await createHello(el);
  const put = writes.find((w) => w.url === `${APPS}hello-world/app.ttl`);
  expect(put).toBeTruthy();
  expect(put.method).toBe('PUT');
  expect(put.body).toContain('a schema:WebApplication');
  expect(put.body).toContain('schema:name "Hello World"');
  expect(put.body).toContain('ui:layout <layout.ttl#Layout>');
  expect(el.querySelector('[aria-current="step"]').dataset.step).toBe('layout');
  // structural cards from the shipped index, each with a derived schematic
  const cards = [...el.querySelectorAll('[data-preset]')];
  expect(cards.length).toBe(5);
  expect(cards[0].textContent).toContain('Banner + main');
  expect(cards.every((c) => c.querySelector('.sab-schem'))).toBe(true);
  // the sidebar card's schematic shows the aside block
  const sidebarCard = el.querySelector('[data-preset$="banner-left-sidebar.ttl"]');
  expect(sidebarCard.querySelector('.sab-schem-r.aside-r')).toBeTruthy();
});

test('picking banner-left-sidebar copies the themed layout and seeds its docs', async () => {
  const el = await mount();
  await createHello(el);
  await pickPreset(el, 'banner-left-sidebar.ttl');
  const layoutPut = writes.find((w) => w.url === `${APPS}hello-world/layout.ttl`);
  expect(layoutPut).toBeTruthy();
  expect(layoutPut.body).toContain('a ui:Layout');
  expect(layoutPut.body).toContain('schema:additionalType schema:WPSideBar');
  expect(layoutPut.body).toContain('sol-dropdown-button.js');   // theme chrome ships in the copy
  // app-menu.ttl holds BOTH the sidebar #Menu and the theme's #More
  const menuDoc = docs[`${APPS}hello-world/app-menu.ttl`];
  expect(menuDoc).toContain(':Menu a ui:Menu');
  expect(menuDoc).toContain('ui:Vertical');
  expect(menuDoc).toContain(':More a ui:Menu');
  expect(menuDoc).toContain('app-commands.ttl#toggleTheme');
  expect(docs[`${APPS}hello-world/app-commands.ttl`]).toContain(':cycleFontSize a ui:Command');
  expect(docs[`${APPS}hello-world/help.html`]).toContain('<title>Help</title>');
});

test('the Elements step lists regions with removable theme chrome; add and remove rewrite layout.ttl', async () => {
  const el = await mount();
  await createHello(el);
  await pickPreset(el, 'banner-left-sidebar.ttl');
  // preset pick lands on the Elements step
  expect(el.querySelector('[aria-current="step"]').dataset.step).toBe('elements');
  await settle();
  const panels = [...el.querySelectorAll('.sab-region')];
  expect(panels.length).toBeGreaterThanOrEqual(4); // root, Banner, Middle, Side, Main
  const rows = [...el.querySelectorAll('.sab-el')];
  const rowText = rows.map((r) => r.textContent).join(' ');
  expect(rowText).toContain('sol-dropdown-button');   // banner ☰ present as a row
  expect(rowText).toContain('sol-menu');              // sidebar menu present as a row

  // Add page content into the empty Main pane
  const mainPanel = el.querySelector(`[data-region$="#Main"]`);
  writes = [];
  mainPanel.querySelector('[data-add="content"]').click();
  await settle();
  let layoutPut = writes.find((w) => w.url === `${APPS}hello-world/layout.ttl`);
  expect(layoutPut).toBeTruthy();
  expect(layoutPut.body).toContain(':Page-content a ui:Component');
  expect(layoutPut.body).toContain('schema:value "content.html"');
  expect(docs[`${APPS}hello-world/content.html`]).toContain('content.html');

  // Remove the banner ☰ — theme chrome is an ordinary removable element
  await settle();
  writes = [];
  const moreRow = [...el.querySelectorAll('.sab-el')]
    .find((r) => r.textContent.includes('sol-dropdown-button'));
  moreRow.querySelector('[data-el-action="remove"]').click();
  await settle();
  layoutPut = writes.find((w) => w.url === `${APPS}hello-world/layout.ttl`);
  expect(layoutPut).toBeTruthy();
  expect(layoutPut.body).not.toContain('sol-dropdown-button');
});

test('Generate writes readable index.html + app.css; Register PATCHes a ui:Plugin', async () => {
  const el = await mount();
  await createHello(el);
  await pickPreset(el, 'banner-left-sidebar.ttl');
  el.querySelector('[data-step="publish"]').click();
  await settle(5);
  el.querySelector('[data-action="generate"]').click();
  await settle();

  const html = writes.find((w) => w.url === `${APPS}hello-world/index.html`);
  expect(html).toBeTruthy();
  expect(html.type).toBe('text/html');
  expect(html.body).toContain('<title>Hello World</title>');
  // structure: header banner; aside + main INSIDE the middle row
  expect(html.body).toContain('<header class="app-banner app-row" aria-label="Banner">');
  expect(html.body).toMatch(/<div class="app-row">[\s\S]*<aside[\s\S]*<main class="app-main app-col" aria-label="Content">/);
  // chrome scripts + visible sources
  expect(html.body).toContain('web/scripts/prefs.js');
  expect(html.body).toContain('web/scripts/app-commands.js');
  expect(html.body).toContain('from-rdf="app-menu.ttl#More"');
  expect(html.body).toContain('sol-load.js');
  const css = writes.find((w) => w.url === `${APPS}hello-world/app.css`);
  expect(css).toBeTruthy();
  expect(css.body).toContain('.app-row');
  expect(css.body).toContain('body.app-col > .app-row');

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
  await pickPreset(el, 'banner-main.ttl');
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

test('the Plugins step mounts one manager per menu doc the layout names', async () => {
  const el = await mount();
  await createHello(el);
  await pickPreset(el, 'banner-left-sidebar.ttl');
  el.querySelector('[data-step="plugins"]').click();
  await settle();
  const managers = [...el.querySelectorAll('#sab-managers sol-menu-manager')];
  const sources = managers.map((m) => m.getAttribute('source')).sort();
  expect(sources).toEqual([
    `${APPS}hello-world/app-menu.ttl#Menu`,
    `${APPS}hello-world/app-menu.ttl#More`,
  ]);
  expect(managers[0].getAttribute('catalog')).toBe(CATALOG);
  const pantry = el.querySelector('sol-plugin-manager');
  expect(pantry).toBeTruthy();
  expect(pantry.getAttribute('for')).toBe('#sab-managers sol-menu-manager');
});
