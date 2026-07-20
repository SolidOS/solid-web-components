/**
 * @jest-environment jsdom
 *
 * Tests for <sol-tree-edit> — the drill-down editor for tree-shaped data.
 * It composes <sol-breadcrumb> + <sol-accordion> + shape-to-form's record
 * forms, navigating a container's head fields plus its positioned
 * schema:itemListElement membership.
 *
 * What's exercised here (the deterministic seams):
 *   - custom-element registration
 *   - a missing `root` attribute renders the inline error path
 *   - building the level from RDF: head accordion always; an Items divider
 *     + items accordion only when the membership has members
 *   - item rows label from label-property + a ▸ marker on drillable types,
 *     with an "Open →" affordance present for drillable items
 *   - a drilled level (depth > 1) renders a breadcrumb of the stack labels,
 *     paints the deeper subject's own items, and the breadcrumb's
 *     sol-breadcrumb-navigate pops the stack + fires sol-tree-navigate
 *   - attributeChangedCallback resets the stack and re-renders
 *
 * Note on the drill seam: the painted item panels are handed to <sol-accordion>,
 * whose connectedCallback CLONES panel-body markup into its own <details> — so
 * the live "Open →" button's click listener does not survive into the accordion
 * DOM (a known v0 limitation; the component's own source flags add/remove/reorder
 * as still-TODO). We therefore drive the deeper level through the supported public
 * surface (push the stack + _paint, as the Open handler itself does) and assert the
 * breadcrumb + navigate behaviour, which is wired on the breadcrumb element that
 * sol-tree-edit appends directly (outside any accordion, so its listener is intact).
 *
 * The data graph is seeded straight into rdf.store — positioned
 * schema:ListItem wrapper triples, the production membership form, which
 * needs no parser sugar at all. The two SHACL files
 * are served through a stubbed global.fetch. solid-ui is absent, so the inner
 * renderRecordForm falls back to its "solid-ui is not loaded" notice rather
 * than mounting real widgets — exactly the seam we want: we assert structure,
 * not solid-ui's field internals.
 */

import { rdf } from '../../core/rdf.js';

window.__SolSuppressDefineWarn = true;

// ── mock-store augmentation ──────────────────────────────────────────────────
// The shared rdflib mock's MockStore covers add/match/any/each but not the
// few read helpers sol-tree-edit + parseShape reach for. Teach the prototype
// those two (test-only; the production rdflib has them natively).
const ProtoStore = Object.getPrototypeOf(rdf.graph());
if (!ProtoStore.anyValue) {
  ProtoStore.anyValue = function (s, p, o) {
    const r = this.any(s, p, o);
    return r ? r.value : null;
  };
}
if (!ProtoStore.statementsMatching) {
  ProtoStore.statementsMatching = function (s, p, o) {
    return this.match(s, p, o);
  };
}

// ── fixtures ─────────────────────────────────────────────────────────────────

const RDF_TYPE  = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const SCHEMA_ELEM = 'http://schema.org/itemListElement';
const SCHEMA_ITEM = 'http://schema.org/item';
const SCHEMA_POS  = 'http://schema.org/position';
const UI_LABEL  = 'http://www.w3.org/ns/ui#label';
const UI_MENU   = 'http://www.w3.org/ns/ui#Menu';
const UI_LINK   = 'http://www.w3.org/ns/ui#Link';

const DOC  = 'https://pod.example/menu.ttl';
const ROOT = `${DOC}#root`;

// A head shape for the container (ui:Menu): one editable label field.
const HEAD_SHAPE = `
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix ui: <http://www.w3.org/ns/ui#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

<#MenuShape> a sh:NodeShape ;
  sh:targetClass ui:Menu ;
  sh:property <#labelProp> .

<#labelProp> a sh:PropertyShape ;
  sh:path ui:label ;
  sh:name "Label" ;
  sh:datatype xsd:string .
`;

// An item shape file: one NodeShape for ui:Link items (sh:targetClass).
const ITEM_SHAPE = `
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix ui: <http://www.w3.org/ns/ui#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

<#LinkShape> a sh:NodeShape ;
  sh:targetClass ui:Link ;
  sh:property <#hrefProp> .

<#hrefProp> a sh:PropertyShape ;
  sh:path ui:label ;
  sh:name "Label" ;
  sh:datatype xsd:string .
`;

// ── store + fetch seeding ────────────────────────────────────────────────────

/** Seed positioned schema:ListItem wrapper triples linking `container` to
 *  each member in order — the production membership form. */
function seedMembers(store, container, members) {
  members.forEach((m, i) => {
    const wrap = rdf.sym(`${container}-entry-${i + 1}`);
    store.add(rdf.sym(container), rdf.sym(SCHEMA_ELEM), wrap);
    store.add(wrap, rdf.sym(SCHEMA_ITEM), m);
    store.add(wrap, rdf.sym(SCHEMA_POS), rdf.literal(String(i + 1)));
  });
}

/** Seed a ui:Menu root whose membership holds the given item subjects, each
 *  of the given rdf:type with a ui:label. Returns nothing; mutates rdf.store. */
function seedMenu({ items = [] } = {}) {
  const store = rdf.store;
  store.add(rdf.sym(ROOT), rdf.sym(RDF_TYPE), rdf.sym(UI_MENU));
  store.add(rdf.sym(ROOT), rdf.sym(UI_LABEL), rdf.literal('Main Menu'));
  for (const it of items) {
    store.add(rdf.sym(it.uri), rdf.sym(RDF_TYPE), rdf.sym(it.type));
    store.add(rdf.sym(it.uri), rdf.sym(UI_LABEL), rdf.literal(it.label));
    if (it.parts) {
      seedMembers(store, it.uri, it.parts.map(u => rdf.sym(u)));
    }
  }
  seedMembers(store, ROOT, items.map(it => rdf.sym(it.uri)));
}

/** A fetch stub: serves the two shape URLs by suffix, an empty body for the
 *  data doc (it's seeded directly into the store, not parsed from the wire),
 *  404 for anything else. Records the URLs requested. */
function installFetch() {
  const calls = [];
  global.fetch = (url) => {
    calls.push(String(url));
    const u = String(url);
    let body = '';
    if (u.includes('head-shape'))      body = HEAD_SHAPE;
    else if (u.includes('item-shape')) body = ITEM_SHAPE;
    else if (u.split('#')[0] === DOC)  body = '';   // data doc — store pre-seeded
    else return Promise.resolve({ ok: false, status: 404, headers: new Map(),
                                  text: () => Promise.resolve('') });
    return Promise.resolve({
      ok: true, status: 200,
      headers: new Map([['Content-Type', 'text/turtle']]),
      text: () => Promise.resolve(body),
    });
  };
  global.fetch.calls = calls;
}

/** Give the mock store the fetcher sol-tree-edit reaches via rdf.store.fetcher.
 *  The mock Fetcher.load() pulls from global.fetch (already installed). */
function installFetcher() {
  rdf.store.fetcher = rdf.fetcher(rdf.store);
}

// ── harness ──────────────────────────────────────────────────────────────────

async function settle() { await new Promise(r => setTimeout(r, 0)); }

function mountTree(extraAttrs = {}) {
  const el = document.createElement('sol-tree-edit');
  el.setAttribute('root', ROOT);
  el.setAttribute('head-shape', 'head-shape.ttl');
  el.setAttribute('item-shape', 'item-shape.ttl');
  for (const [k, v] of Object.entries(extraAttrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  return el;
}

beforeAll(async () => {
  // Define the inner primitives first so the painted tree can mount them.
  await import('../../web/sol-breadcrumb.js');
  await import('../../web/sol-accordion.js');
  await import('../../web/sol-tree-edit.js');
});

beforeEach(() => {
  // Fresh, isolated store per test — wipe any seeded statements + loaded cache.
  rdf.store.statements = [];
  rdf._loaded.clear();
  installFetch();
  installFetcher();
});

afterEach(() => { document.body.innerHTML = ''; });

// ── registration ─────────────────────────────────────────────────────────────

describe('sol-tree-edit — registration', () => {
  test('is registered as a custom element', () => {
    expect(customElements.get('sol-tree-edit')).toBeTruthy();
  });

  test('observes the documented attribute set', () => {
    const Klass = customElements.get('sol-tree-edit');
    expect(Klass.observedAttributes).toEqual([
      'root', 'head-shape', 'item-shape', 'parts', 'drill-when-type',
      'label-property', 'root-label', 'head-label', 'items-label',
    ]);
  });
});

// ── error path ───────────────────────────────────────────────────────────────

describe('sol-tree-edit — missing root', () => {
  test('renders the inline error when no root attribute is given', async () => {
    const el = document.createElement('sol-tree-edit');
    document.body.appendChild(el);
    await settle();
    const err = el.querySelector('.sol-tree-edit-error');
    expect(err).not.toBeNull();
    expect(err.textContent).toMatch(/needs a `root`/);
  });
});

// ── building a level from RDF ─────────────────────────────────────────────────

describe('sol-tree-edit — head-only level (no items)', () => {
  test('renders one head accordion and no Items divider / breadcrumb', async () => {
    seedMenu({ items: [] });
    const el = mountTree();
    await settle();

    // Exactly one accordion (the head), no items divider, no breadcrumb at root.
    expect(el.querySelectorAll('sol-accordion')).toHaveLength(1);
    expect(el.querySelector('.sol-tree-edit-items-divider')).toBeNull();
    expect(el.querySelector('sol-breadcrumb')).toBeNull();
  });

  test('the head accordion summary uses the head-label attribute', async () => {
    seedMenu({ items: [] });
    const el = mountTree({ 'head-label': 'Menu Heading' });
    await settle();
    const summary = el.querySelector('sol-accordion summary');
    expect(summary.textContent).toBe('Menu Heading');
  });
});

describe('sol-tree-edit — level with items', () => {
  const ITEMS = [
    { uri: `${DOC}#link-a`, type: UI_LINK, label: 'Alpha' },
    { uri: `${DOC}#sub`,    type: UI_MENU, label: 'Submenu',
      parts: [`${DOC}#deep`] },
    { uri: `${DOC}#deep`,   type: UI_LINK, label: 'Deep Link' },
  ];

  test('renders an Items divider + a second accordion holding one panel per item', async () => {
    seedMenu({ items: ITEMS });
    const el = mountTree();
    await settle();

    expect(el.querySelector('.sol-tree-edit-items-divider')).not.toBeNull();
    // head accordion + items accordion
    const accordions = el.querySelectorAll('sol-accordion');
    expect(accordions).toHaveLength(2);
    // items accordion has a <details> per item row
    const itemsAcc = accordions[1];
    expect(itemsAcc.querySelectorAll('details')).toHaveLength(ITEMS.length);
  });

  test('items-label attribute drives the divider text', async () => {
    seedMenu({ items: ITEMS });
    const el = mountTree({ 'items-label': 'Children' });
    await settle();
    expect(el.querySelector('.sol-tree-edit-items-divider').textContent).toBe('Children');
  });

  test('a drillable item (ui:Menu) shows a ▸ marker and an Open → button', async () => {
    seedMenu({ items: ITEMS });
    const el = mountTree();
    await settle();

    const summaries = [...el.querySelectorAll('sol-accordion')[1].querySelectorAll('summary')];
    const subSummary = summaries.find(s => s.textContent.includes('Submenu'));
    expect(subSummary.textContent).toContain('▸');

    const openBtns = [...el.querySelectorAll('.sol-tree-edit-open-btn')];
    expect(openBtns).toHaveLength(1);            // only the ui:Menu item is drillable
    expect(openBtns[0].textContent).toBe('Open →');
  });

  test('a non-drillable item renders the shape-to-form fallback (solid-ui absent)', async () => {
    seedMenu({ items: ITEMS });
    const el = mountTree();
    await settle();
    // renderRecordForm degrades to its notice when window.UI is missing.
    expect(el.querySelector('.sol-form-error')).not.toBeNull();
  });
});

// ── drilling ─────────────────────────────────────────────────────────────────

describe('sol-tree-edit — drill / breadcrumb navigation', () => {
  const ITEMS = [
    { uri: `${DOC}#sub`,  type: UI_MENU, label: 'Submenu', parts: [`${DOC}#deep`] },
    { uri: `${DOC}#deep`, type: UI_LINK, label: 'Deep Link' },
  ];

  // Mirror what the Open-button handler does (push + repaint) — the handler
  // itself is lost to sol-accordion's clone (see file header). This drives the
  // same code the deeper level depends on.
  function drillInto(el, uri, label) {
    el._stack.push({ subject: rdf.sym(uri), label });
    el._paint();
  }

  test('a drilled level paints a breadcrumb of the stack and the deeper items', async () => {
    seedMenu({ items: ITEMS });
    const el = mountTree({ 'root-label': 'Main Menu' });
    await settle();
    expect(el.querySelector('sol-breadcrumb')).toBeNull();   // depth 1 → no crumb

    drillInto(el, `${DOC}#sub`, 'Submenu');

    // Now at depth 2: a breadcrumb appears with both stack labels.
    const crumb = el.querySelector('sol-breadcrumb');
    expect(crumb).not.toBeNull();
    const segs = [...crumb.querySelectorAll('[data-key]')].map(s => s.textContent);
    expect(segs).toEqual(['Main Menu', 'Submenu']);

    // The deeper level shows the Submenu's own child item (Deep Link), no
    // Open buttons (the only child is a plain ui:Link).
    expect(el.querySelector('.sol-tree-edit-open-btn')).toBeNull();
    const itemSummaries = [...el.querySelectorAll('sol-accordion')[1].querySelectorAll('summary')];
    expect(itemSummaries.some(s => s.textContent.includes('Deep Link'))).toBe(true);
  });

  test('clicking an earlier breadcrumb crumb pops the stack and fires sol-tree-navigate', async () => {
    seedMenu({ items: ITEMS });
    const el = mountTree({ 'root-label': 'Main Menu' });
    await settle();
    drillInto(el, `${DOC}#sub`, 'Submenu');

    let detail = null;
    el.addEventListener('sol-tree-navigate', (e) => { detail = e.detail; });

    // The first crumb ("Main Menu") is the clickable button (the last is inert).
    const rootCrumb = el.querySelector('sol-breadcrumb .sol-breadcrumb-segment');
    expect(rootCrumb.textContent).toBe('Main Menu');
    rootCrumb.click();
    await settle();

    // Back at the root: stack collapsed to one, breadcrumb gone, event carried
    // the collapsed stack.
    expect(detail).not.toBeNull();
    expect(detail.stack).toHaveLength(1);
    expect(el.querySelector('sol-breadcrumb')).toBeNull();
  });
});

// ── attribute reactivity ─────────────────────────────────────────────────────

describe('sol-tree-edit — attributeChangedCallback', () => {
  test('changing an attribute resets the stack and re-renders the root level', async () => {
    seedMenu({
      items: [
        { uri: `${DOC}#sub`,  type: UI_MENU, label: 'Submenu', parts: [`${DOC}#deep`] },
        { uri: `${DOC}#deep`, type: UI_LINK, label: 'Deep Link' },
      ],
    });
    const el = mountTree({ 'root-label': 'Main Menu' });
    await settle();
    // Drill in (push + repaint, as the Open handler would).
    el._stack.push({ subject: rdf.sym(`${DOC}#sub`), label: 'Submenu' });
    el._paint();
    expect(el.querySelector('sol-breadcrumb')).not.toBeNull();   // drilled in

    // Any observed-attribute change collapses back to the root level.
    el.setAttribute('items-label', 'Renamed');
    await settle();
    expect(el.querySelector('sol-breadcrumb')).toBeNull();       // stack reset
    expect(el.querySelector('.sol-tree-edit-items-divider').textContent).toBe('Renamed');
  });
});
