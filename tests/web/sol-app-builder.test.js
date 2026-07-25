/**
 * @jest-environment jsdom
 *
 * <sol-app-builder> — the wizard that builds a standalone app folder on the
 * pod. Network is fully mocked at the module seams (auth-fetch, rdf-utils,
 * pod-ops): a `docs` route table serves GETs, PUT/PATCH bodies are recorded,
 * and loadRdfStore parses route-table Turtle with n3 into the rdflib mock
 * store (the mock's own tokenizer has no lists/blank nodes). Layouts are
 * COMPOSED (core/layout-compose.js) from the Step-2 answers — no preset files.
 *
 * Covered:
 *   - the five-step rail renders; app-dependent steps disabled until an app
 *     exists
 *   - Create app → PUT app.ttl (schema:WebApplication + name) → the
 *     configurator (arrangement cards + footer/menu/hamburger choices)
 *   - Create this layout → composes layout.ttl (xhv:role, theme chrome) and
 *     seeds app-menu.ttl (#Menu AND #More), app-commands.ttl, help.html
 *   - the Elements step lists regions with the theme chrome as removable
 *     rows; Add / Remove rewrite layout.ttl via the serializer
 *   - Generate PUTs index.html (header/aside/main structure, chrome scripts,
 *     visible from-rdf) + app.css
 *   - Add to catalog PATCHes an INSERT DATA ui:Plugin (kind ui:Link), with
 *     whole-doc PUT fallback on lock expiry
 *   - the Plugins step mounts one manager per menu doc + the pantry
 */

import { jest } from '@jest/globals';
import { Parser } from 'n3';
import rdflib from '../__mocks__/rdflib-esm.js';

window.__SolSuppressDefineWarn = true;

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
const CATALOG = 'http://pod.test/catalog.ttl#Available';

function settle(ms = 30) { return new Promise((r) => setTimeout(r, ms)); }

beforeEach(() => {
  docs = {};
  writes = [];
  patchFails = false;
  docs['http://pod.test/catalog.ttl'] = `@prefix ui: <http://www.w3.org/ns/ui#> .
<#Available> a ui:Menu ; ui:label "Available" .
`;
});
afterEach(() => { document.body.innerHTML = ''; });

async function mount(attrs = '') {
  document.body.innerHTML = `<sol-app-builder id="b" apps-root="${APPS}"
    catalog="${CATALOG}" ${attrs}></sol-app-builder>`;
  const el = document.getElementById('b');
  await settle();
  return el;
}

async function createHello(el) {
  el.querySelector('[data-mode="new"]').click();   // top-row: Create new app
  await settle(1);
  el.querySelector('[name=app-name]').value = 'Hello World';
  el.querySelector('[name=app-icon]').value = '🍳';
  el.querySelector('form.sab-new button[type=submit]').click();
  await settle();
}

// Drive the Edit-Layout step: click the answer buttons (each re-renders, so
// query fresh each time — the arrangement must be set first, both to reveal the
// questions and before a sidebar menu / bar location exists), then Create.
async function createLayout(el, cfg = {}) {
  if (cfg.sidebars) { el.querySelector(`[data-cfg-sidebars="${cfg.sidebars}"]`).click(); await settle(1); }
  if (cfg.menuLocation) { el.querySelector(`[data-cfg-menu="${cfg.menuLocation}"]`).click(); await settle(1); }
  if (cfg.buttonBar) { el.querySelector(`[data-cfg-bar="${cfg.buttonBar}"]`).click(); await settle(1); }
  if ('footer' in cfg) { el.querySelector(`[data-cfg-footer="${cfg.footer}"]`).click(); await settle(1); }
  if ('hamburger' in cfg) { el.querySelector(`[data-cfg-hamburger="${cfg.hamburger}"]`).click(); await settle(1); }
  el.querySelector('[data-action="create-layout"]').click();
  await settle();
}

test('nothing shows below the mode buttons until one is chosen; then the rail greys until an app', async () => {
  const el = await mount();
  // only the two mode buttons — no rail, no body yet
  expect(el.querySelector('[data-mode="new"]')).toBeTruthy();
  expect(el.querySelector('[data-mode="edit"]')).toBeTruthy();
  expect(el.querySelectorAll('.sab-steps [data-step]').length).toBe(0);
  // choosing a mode reveals the rail, greyed until an app exists
  el.querySelector('[data-mode="new"]').click();
  await settle(1);
  const steps = [...el.querySelectorAll('.sab-steps [data-step]')];
  expect(steps.map((b) => b.dataset.step)).toEqual(['layout', 'elements', 'plugins', 'publish']);
  expect(steps.every((b) => b.disabled)).toBe(true);
});

test('editing an app derives its Edit-Layout answers from the existing layout', async () => {
  const el = await mount();
  await createHello(el);
  const cfg = { sidebars: 'both', menuLocation: 'left-sidebar', buttonBar: 'header', footer: true, hamburger: true };
  await createLayout(el, cfg);
  // re-derive from the saved layout.ttl: compose → layout.ttl → derive round-trips
  await el._deriveCfg(el._app);
  expect(el._cfg).toEqual(cfg);
});

test('Create app PUTs app.ttl and advances to the configurator', async () => {
  const el = await mount();
  await createHello(el);
  const put = writes.find((w) => w.url === `${APPS}hello-world/app.ttl`);
  expect(put).toBeTruthy();
  expect(put.method).toBe('PUT');
  expect(put.body).toContain('a schema:WebApplication');
  expect(put.body).toContain('schema:name "Hello World"');
  expect(put.body).toContain('ui:layout <layout.ttl#Layout>');
  expect(el.querySelector('[aria-current="step"]').dataset.step).toBe('layout');
  // four arrangement cards, each with a derived schematic
  const cards = [...el.querySelectorAll('[data-cfg-sidebars]')];
  expect(cards.map((c) => c.dataset.cfgSidebars)).toEqual(['none', 'left', 'right', 'both']);
  expect(cards.every((c) => c.querySelector('.sab-schem'))).toBe(true);
  // the two-sidebar card's schematic shows two aside blocks
  const both = el.querySelector('[data-cfg-sidebars="both"]');
  expect(both.querySelectorAll('.sab-schem-r.aside-r').length).toBe(2);
  // a sidebar menu-location only appears once a sidebar arrangement is chosen
  expect(el.querySelector('[data-cfg-menu="left-sidebar"]')).toBeFalsy();
});

test('the left-sidebar option appears only after choosing a left sidebar', async () => {
  const el = await mount();
  await createHello(el);
  el.querySelector('[data-cfg-sidebars="left"]').click();
  await settle(1);
  expect(el.querySelector('[data-cfg-menu="left-sidebar"]')).toBeTruthy();
  expect(el.querySelector('[data-cfg-menu="right-sidebar"]')).toBeFalsy();
});

test('composing a left-sidebar layout writes xhv:role layout.ttl and seeds its docs', async () => {
  const el = await mount();
  await createHello(el);
  await createLayout(el, { sidebars: 'left', menuLocation: 'left-sidebar' });
  const layoutPut = writes.find((w) => w.url === `${APPS}hello-world/layout.ttl`);
  expect(layoutPut).toBeTruthy();
  expect(layoutPut.body).toContain('a ui:Layout');
  expect(layoutPut.body).toContain('xhv:role "complementary"');   // sidebar landmark
  expect(layoutPut.body).not.toMatch(/schema:additionalType|WPSideBar/);
  expect(layoutPut.body).toContain('sol-dropdown-button.js');      // ☰ ships (hamburger default)
  // preset ui:Link content: site-title.html is seeded; layout names it
  expect(layoutPut.body).toContain('a ui:Link');
  expect(layoutPut.body).toContain('schema:url <site-title.html>');
  expect(docs[`${APPS}hello-world/site-title.html`]).toBeTruthy();
  // app-menu.ttl holds BOTH the sidebar #MainMenu (vertical) and the ☰ #MainHamburgerMenu
  const menuDoc = docs[`${APPS}hello-world/app-menu.ttl`];
  expect(menuDoc).toContain(':MainMenu a ui:Menu');
  expect(menuDoc).toContain('ui:Vertical');
  expect(menuDoc).toContain(':MainHamburgerMenu a ui:Menu');
  expect(menuDoc).toContain('app-commands.ttl#toggleTheme');
  expect(docs[`${APPS}hello-world/app-commands.ttl`]).toContain(':cycleFontSize a ui:Command');
  expect(docs[`${APPS}hello-world/help.html`]).toContain('<title>Help</title>');
});

test('choosing a header button bar seeds MainButtonBar and places it in the header', async () => {
  const el = await mount();
  await createHello(el);
  await createLayout(el, { sidebars: 'none', menuLocation: 'header', buttonBar: 'header' });
  const layoutPut = writes.find((w) => w.url === `${APPS}hello-world/layout.ttl`);
  expect(layoutPut.body).toContain('app-menu.ttl#MainButtonBar');
  expect(docs[`${APPS}hello-world/app-menu.ttl`]).toContain(':MainButtonBar a ui:Menu');
});

// Simulate a native drop carrying the Add-Features MIME payload.
function dropFeature(target, payload) {
  const dt = { types: ['application/x-sab-feature'], getData: () => JSON.stringify(payload), dropEffect: '' };
  target.dispatchEvent(Object.assign(new Event('drop', { bubbles: true }), { dataTransfer: dt }));
}

test('Add Features: layout areas show chips; dropping a Page adds a ui:Link; removing a chip rewrites layout.ttl', async () => {
  const el = await mount();
  await createHello(el);
  await createLayout(el, { sidebars: 'left', menuLocation: 'left-sidebar' });
  // creating a layout lands on the Add-Features step
  expect(el.querySelector('[aria-current="step"]').dataset.step).toBe('elements');
  await settle();
  // fillable areas only (wrapper regions — root, Middle — render transparently)
  const areas = [...el.querySelectorAll('.sab-area')];
  expect(areas.length).toBeGreaterThanOrEqual(3); // header, left, main
  // each area names itself on its border (a legend), not as a chip
  expect(areas.every((a) => a.querySelector(':scope > legend'))).toBe(true);
  const chipText = [...el.querySelectorAll('.sab-chip')].map((c) => c.textContent).join(' ');
  expect(chipText).toContain('☰');            // hamburger chip
  expect(chipText).toContain('Site title');   // the site-title link chip
  // three accordions on the right
  expect([...el.querySelectorAll('.sab-acc-head')].map((b) => b.textContent))
    .toEqual(['UI elements', 'HTML Content']);
  // UI elements is the default-open section
  expect(el.querySelector('[data-acc="ui"]').getAttribute('aria-expanded')).toBe('true');

  // drop a Page onto the Main area → a new ui:Link + seeded html
  const mainDrop = el.querySelector('.sab-drop[data-region$="#Main"]');
  writes = [];
  dropFeature(mainDrop, { op: 'page' });
  await settle();
  let layoutPut = writes.find((w) => w.url === `${APPS}hello-world/layout.ttl`);
  expect(layoutPut).toBeTruthy();
  expect(layoutPut.body).toContain('a ui:Link');
  expect(layoutPut.body).toMatch(/schema:url <[^>]*page\.html>/);
  expect(docs[`${APPS}hello-world/page.html`]).toBeTruthy();

  // remove the hamburger chip → layout.ttl no longer names sol-dropdown-button
  await settle();
  writes = [];
  const hamChip = [...el.querySelectorAll('.sab-chip')].find((c) => c.textContent.includes('☰'));
  hamChip.querySelector('[data-el-action="remove"]').click();
  await settle();
  layoutPut = writes.find((w) => w.url === `${APPS}hello-world/layout.ttl`);
  expect(layoutPut).toBeTruthy();
  expect(layoutPut.body).not.toContain('sol-dropdown-button');
});

test('plugin components in the layout do NOT render chips on this step', async () => {
  const el = await mount();
  await createHello(el);
  await createLayout(el, { sidebars: 'none', menuLocation: 'header' });
  await settle();
  // a plugin leaf (a plain component, not menu-consuming chrome) in Main
  const main = (function find(r) {
    if (r.kind === 'region' && r.node.value.endsWith('#Main')) return r;
    if (r.kind !== 'region') return null;
    for (const p of r.parts) { const hit = find(p); if (hit) return hit; }
    return null;
  })(el._tree);
  main.parts.push({
    kind: 'leaf', node: { value: `${APPS}hello-world/layout.ttl#Clock` },
    url: '/node_modules/sol-components/web/sol-time.js',
    item: { type: 'component', tag: 'sol-time', params: [], name: 'Clock', comment: null },
  });
  el._renderLayoutAreas();
  // menus/links still show; the plugin does not
  const chipText = [...el.querySelectorAll('.sab-chip')].map((c) => c.textContent).join(' ');
  expect(chipText).toContain('Site title');
  expect(chipText).not.toContain('Clock');
});

test('removing a chip offers it back in its accordion; restoring re-adds it', async () => {
  const el = await mount();
  await createHello(el);
  await createLayout(el, { sidebars: 'none', menuLocation: 'header' });
  await settle();
  // remove the site-title link chip
  const siteChip = [...el.querySelectorAll('.sab-chip')].find((c) => c.textContent.includes('Site title'));
  siteChip.querySelector('[data-el-action="remove"]').click();
  await settle();
  // it now shows in the Pages accordion as a restore feature
  el.querySelector('[data-acc="pages"]').click();
  const restore = [...el.querySelectorAll('.sab-acc-body .sab-feat')].find((f) => f.textContent.includes('Site title'));
  expect(restore).toBeTruthy();
  const payload = JSON.parse(restore.dataset.feature);
  expect(payload.op).toBe('restore');
  // drop it back onto the Main area → the ui:Link returns
  writes = [];
  dropFeature(el.querySelector('.sab-drop[data-region$="#Main"]'), payload);
  await settle();
  const layoutPut = writes.find((w) => w.url === `${APPS}hello-world/layout.ttl`);
  expect(layoutPut.body).toContain('a ui:Link');
  expect(layoutPut.body).toContain('site-title.html');
  // and it's gone from the pantry
  expect([...el.querySelectorAll('.sab-acc-body .sab-feat')].some((f) => f.textContent.includes('Site title'))).toBe(false);
});

test('the UI-elements accordion offers ☰ Action Menu / Button bar / Tabs', async () => {
  const el = await mount();
  await createHello(el);
  await createLayout(el, { sidebars: 'none', menuLocation: 'header' });
  await settle();
  el.querySelector('[data-acc="ui"]').click();
  const feats = [...el.querySelectorAll('.sab-acc-body .sab-feat')].map((f) => f.textContent.trim());
  expect(feats).toEqual(['☰ Action Menu', '🔘 Button bar', '🗂 Tabs']);
});

test('a composed layout puts a site-title chip in the header by default', async () => {
  const el = await mount();
  await createHello(el);
  await createLayout(el, { sidebars: 'none', menuLocation: 'header' });
  await settle();
  const headerChips = [...el.querySelectorAll('.sab-drop[data-region$="#Header"] .sab-chip')]
    .map((c) => c.textContent);
  expect(headerChips.some((t) => t.includes('Site title'))).toBe(true);
});

test('dragging a chip to another area moves it (moveNode)', async () => {
  const el = await mount();
  await createHello(el);
  await createLayout(el, { sidebars: 'left', menuLocation: 'left-sidebar' });
  await settle();
  // the sidebar nav-menu chip (fragment #Menu) → move it into Main
  const menuChip = [...el.querySelectorAll('.sab-chip')].find((c) => c.dataset.node.endsWith('#Menu'));
  const node = menuChip.dataset.node;
  const mainDrop = el.querySelector('.sab-drop[data-region$="#Main"]');
  writes = [];
  dropFeature(mainDrop, { op: 'move', node });
  await settle();
  const layoutPut = writes.find((w) => w.url === `${APPS}hello-world/layout.ttl`);
  expect(layoutPut).toBeTruthy();
  // the Menu leaf now sits under :Main, not :Left
  expect(layoutPut.body).toMatch(/:Main-Menu a schema:ListItem; schema:item :Menu/);
});

test('Generate writes readable index.html + app.css; Register PATCHes a ui:Plugin', async () => {
  const el = await mount();
  await createHello(el);
  await createLayout(el, { sidebars: 'left', menuLocation: 'left-sidebar' });
  el.querySelector('[data-step="publish"]').click();
  await settle(5);
  el.querySelector('[data-action="generate"]').click();
  await settle();

  const html = writes.find((w) => w.url === `${APPS}hello-world/index.html`);
  expect(html).toBeTruthy();
  expect(html.type).toBe('text/html');
  expect(html.body).toContain('<title>Hello World</title>');
  // structure: header banner (holds the site-title link) + aside + main in the middle row
  expect(html.body).toContain('<header class="app-banner app-row" aria-label="Header">');
  expect(html.body).toContain('<sol-include source="site-title.html"');
  expect(html.body).toMatch(/<section[^>]*class="app-row"[\s\S]*?<aside[\s\S]*?<main class="app-main app-col" aria-label="Main">/);
  // chrome scripts + visible sources
  expect(html.body).toContain('web/scripts/prefs.js');
  expect(html.body).toContain('web/scripts/app-commands.js');
  expect(html.body).toContain('from-rdf="app-menu.ttl#MainHamburgerMenu"');
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
  await createLayout(el, { sidebars: 'none', menuLocation: 'header' });
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
  await createLayout(el, { sidebars: 'left', menuLocation: 'left-sidebar' });
  el.querySelector('[data-step="plugins"]').click();
  await settle();
  const managers = [...el.querySelectorAll('#sab-managers sol-menu-manager')];
  const sources = managers.map((m) => m.getAttribute('source')).sort();
  expect(sources).toEqual([
    `${APPS}hello-world/app-menu.ttl#MainHamburgerMenu`,
    `${APPS}hello-world/app-menu.ttl#MainMenu`,
  ]);
  expect(managers[0].getAttribute('catalog')).toBe(CATALOG);
  const pantry = el.querySelector('#sab-managers ~ sol-plugin-manager, sol-plugin-manager');
  expect(pantry).toBeTruthy();
  expect(pantry.getAttribute('for')).toBe('#sab-managers sol-menu-manager');
});
