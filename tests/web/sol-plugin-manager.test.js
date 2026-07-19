/**
 * @jest-environment jsdom
 *
 * Tests for <sol-plugin-manager> — the editable, draggable catalog list
 * (the "Plugins to Use" / "Plugins Available" palette of sol-menu-manager).
 *
 * Strategy mirrors sol-button-bar-manager.test.js: drive the real component
 * with a manually-stubbed global.fetch and the jest rdflib mock. For loaded
 * paths the mock store gets a `statementsMatching` alias (= its `match`) so
 * the collection/tag/find-existing helpers run — that is the only rdflib
 * method the bare mock lacks. Where a full RDF round-trip isn't the thing
 * under test we seed `_items` / `_topics` directly and call `_render()`
 * (same seam the bar test uses), or call an instance helper against a
 * hand-built store.
 *
 * Deliberately NOT covered (see note at end of file): the live save path
 * (_putDoc → serializeMenuDocument → solFetch PUT) and _importManifest, both
 * of which depend on rdflib's serializer / store mutation methods the jest
 * mock does not implement.
 */

import { SolPluginManager } from '../../web/sol-plugin-manager.js';
import { PLUGIN_MIME } from '../../web/sol-menu-manager.js';
import rdflib from '../__mocks__/rdflib-esm.js';

window.__SolSuppressDefineWarn = true;

const UI   = 'http://www.w3.org/ns/ui#';
const RDF  = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const RDFS = 'http://www.w3.org/2000/01/rdf-schema#';
const SKOS = 'http://www.w3.org/2004/02/skos/core#';
const SCHEMA = 'http://schema.org/';
const DCT  = 'http://purl.org/dc/terms/';

// ── fetch stubs ──────────────────────────────────────────────────────────────

// 404s every request → loadRdfStore throws → the manager lands on its
// documented "new document" empty path. Deterministic and network-free.
function mock404() {
  global.fetch = () => Promise.resolve({
    ok: false, status: 404,
    headers: new Map(),
    text: () => Promise.resolve(''),
  });
}

function flush() { return new Promise(r => setTimeout(r, 0)); }
async function settle() { await new Promise(r => setTimeout(r, 20)); }

// ── store helpers ────────────────────────────────────────────────────────────

// A mock store with `statementsMatching` (the one rdflib method the bare jest
// mock lacks, aliased to its `match`) so _collections/_tagsInDoc/_findExisting
// /_listsContaining run.
function store() {
  const g = rdflib.graph();
  g.statementsMatching = g.match.bind(g);
  return g;
}
const S = (v) => rdflib.sym(v);
const L = (v) => rdflib.literal(v);

// ── mount helpers ────────────────────────────────────────────────────────────

async function mount(attrs = '') {
  document.body.innerHTML =
    `<sol-plugin-manager id="pm" source="catalog.ttl#InUse" ${attrs}></sol-plugin-manager>`;
  const el = document.getElementById('pm');
  await settle();
  return el;
}

const builder = (el) => el.shadowRoot.querySelector('.builder');
const cardEls = (el) => [...el.shadowRoot.querySelectorAll('.card')];

beforeEach(() => { mock404(); delete window.ComponentInterop; });
afterEach(() => { document.body.innerHTML = ''; delete window.ComponentInterop; });

// ── registration ─────────────────────────────────────────────────────────────

describe('SolPluginManager — registration', () => {
  test('the custom element is registered under its tag', () => {
    expect(customElements.get('sol-plugin-manager')).toBe(SolPluginManager);
  });

  test('createElement yields an upgraded instance with a shadow root', () => {
    const el = document.createElement('sol-plugin-manager');
    expect(el).toBeInstanceOf(SolPluginManager);
    expect(el.shadowRoot).toBeTruthy();
  });
});

// ── source / IRI plumbing ────────────────────────────────────────────────────

describe('SolPluginManager — source plumbing', () => {
  test('source getter reflects the attribute, empty when absent', () => {
    const el = document.createElement('sol-plugin-manager');
    expect(el.source).toBe('');
    el.setAttribute('source', 'catalog.ttl#InUse');
    expect(el.source).toBe('catalog.ttl#InUse');
  });

  test('_docUrl strips the fragment and resolves against the base', () => {
    const el = document.createElement('sol-plugin-manager');
    el.setAttribute('source', 'catalog.ttl#InUse');
    expect(el._docUrl()).toBe(new URL('catalog.ttl', document.baseURI).href);
  });

  test('_menuIri keeps the fragment, null when the source has none', () => {
    const el = document.createElement('sol-plugin-manager');
    el.setAttribute('source', 'catalog.ttl#InUse');
    expect(el._menuIri()).toBe(`${new URL('catalog.ttl', document.baseURI).href}#InUse`);
    el.setAttribute('source', 'catalog.ttl');
    expect(el._menuIri()).toBe(null);
  });
});

// ── no source ────────────────────────────────────────────────────────────────

describe('SolPluginManager — no source', () => {
  test('renders the "Set source=" hint instead of a list', async () => {
    document.body.innerHTML = '<sol-plugin-manager id="x"></sol-plugin-manager>';
    const el = document.getElementById('x');
    await settle();
    const hint = builder(el).querySelector('.hint');
    expect(hint).not.toBeNull();
    expect(hint.textContent).toMatch(/Set source=/);
  });
});

// ── empty / 404 list ─────────────────────────────────────────────────────────

describe('SolPluginManager — empty list (404 source)', () => {
  test('renders the header + url row + the empty hint, no cards', async () => {
    const el = await mount();
    expect(cardEls(el)).toHaveLength(0);
    expect(builder(el).querySelector('.url-row')).not.toBeNull();
    const hint = builder(el).querySelector('.cards .hint');
    expect(hint).not.toBeNull();
    expect(hint.textContent).toMatch(/empty — drag a plugin here/);
  });

  test('the title falls back to the fragment name', async () => {
    const el = await mount();
    expect(builder(el).querySelector('.builder-title').textContent).toBe('InUse');
  });

  test('the URL input carries its manifest-URL placeholder + aria-label', async () => {
    const el = await mount();
    const input = builder(el).querySelector('.url-input');
    expect(input.placeholder).toMatch(/manifest URL/);
    expect(input.getAttribute('aria-label')).toBe('Manifest URL');
  });
});

// ── rendering seeded component / link cards ──────────────────────────────────

describe('SolPluginManager — card rendering (seeded _items)', () => {
  test('renders one card per component / link entry, sorted by name', async () => {
    const el = await mount();
    el._items = [
      { type: 'component', id: 'b', name: 'Beta', tag: 'sol-beta', params: [] },
      { type: 'component', id: 'a', name: 'Alpha', tag: 'sol-alpha', params: [] },
      { type: 'link', id: 'c', name: 'Cee', href: 'https://c.example/' },
    ];
    el._render();
    const labels = cardEls(el).map((c) => c.querySelector('.card-label').textContent);
    expect(labels).toEqual(['Alpha', 'Beta', 'Cee']);
  });

  test('a component with no href and a link with no href are dropped', async () => {
    const el = await mount();
    el._items = [
      { type: 'component', id: 'a', name: 'Has tag', tag: 'sol-a', params: [] },
      { type: 'component', id: 'b', name: 'No tag', params: [] },       // no tag → dropped
      { type: 'link', id: 'c', name: 'No href' },                       // no href → dropped
    ];
    el._render();
    expect(cardEls(el).map((c) => c.querySelector('.card-label').textContent))
      .toEqual(['Has tag']);
  });

  test('cards are draggable and carry role=listitem; the list has role=list', async () => {
    const el = await mount();
    el._items = [{ type: 'component', id: 'a', name: 'Alpha', tag: 'sol-a', params: [] }];
    el._render();
    expect(el.shadowRoot.querySelector('.cards').getAttribute('role')).toBe('list');
    const card = cardEls(el)[0];
    expect(card.draggable).toBe(true);
    expect(card.getAttribute('role')).toBe('listitem');
  });

  test('an emoji icon paints as text, a URL icon paints as <img>', async () => {
    const el = await mount();
    el._items = [
      { type: 'component', id: 'a', name: 'Emoji', tag: 'sol-a', params: [], icon: '🎵' },
      { type: 'component', id: 'b', name: 'Img', tag: 'sol-b', params: [], icon: 'https://x.example/i.png' },
    ];
    el._render();
    const cards = cardEls(el);
    expect(cards[0].querySelector('.card-icon').textContent).toBe('🎵');
    const img = cards[1].querySelector('.card-icon img');
    expect(img).not.toBeNull();
    expect(img.src).toBe('https://x.example/i.png');
  });

  test('a description renders as .card-desc and seeds the hover title', async () => {
    const el = await mount();
    el._items = [{ type: 'component', id: 'a', name: 'Alpha', tag: 'sol-a', params: [], comment: 'does things' }];
    el._render();
    const card = cardEls(el)[0];
    expect(card.querySelector('.card-desc').textContent).toBe('does things');
    expect(card.title).toBe('does things');
  });

  test('a publisher byline shows in italics at the foot of the card', async () => {
    const el = await mount();
    el._items = [{ type: 'component', id: 'a', name: 'Alpha', tag: 'sol-a', params: [], publisher: 'Ada' }];
    el._render();
    expect(cardEls(el)[0].querySelector('.card-byline').textContent).toBe('Ada');
  });
});

// ── delete button (owned entries only) ───────────────────────────────────────

describe('SolPluginManager — delete affordance', () => {
  test('an owned entry (has id) gets a ✕ delete button', async () => {
    const el = await mount();
    el._items = [{ type: 'component', id: 'a', name: 'Alpha', tag: 'sol-a', params: [] }];
    el._render();
    const del = cardEls(el)[0].querySelector('.card-del');
    expect(del).not.toBeNull();
    expect(del.textContent).toBe('✕');
    expect(del.title).toMatch(/Remove .*from the catalog/);
  });

  test('clicking ✕ confirms then enqueues a delete (no confirm → no enqueue)', async () => {
    const el = await mount();
    el._items = [{ type: 'component', id: 'a', name: 'Alpha', tag: 'sol-a', params: [] }];
    el._render();

    // Record enqueue calls instead of letting the real save run.
    const enq = [];
    el._enqueue = (fn) => { enq.push(fn); };

    const realConfirm = window.confirm;
    window.confirm = () => false;
    cardEls(el)[0].querySelector('.card-del').click();
    expect(enq).toHaveLength(0);

    window.confirm = () => true;
    cardEls(el)[0].querySelector('.card-del').click();
    expect(enq).toHaveLength(1);
    window.confirm = realConfirm;
  });
});

// ── ghost cards from the loader manifest ─────────────────────────────────────

describe('SolPluginManager — ghost cards (_ghosts)', () => {
  test('a manifest entry with a label and an unused tag becomes a ghost card', async () => {
    window.ComponentInterop = { manifest: { meta: {
      'sol-ghost': { label: 'Ghosty', icon: '👻', description: 'on offer' },
      'sol-nolabel': { icon: '🚫' },                 // no label → not a ghost
    } } };
    const el = await mount();
    el._docTags = new Set();      // no tag is in the doc → both eligible by tag
    el._render();
    const cards = cardEls(el);
    expect(cards).toHaveLength(1);
    const card = cards[0];
    expect(card.classList.contains('ghost')).toBe(true);
    expect(card.querySelector('.card-label').textContent).toBe('Ghosty');
    expect(card.querySelector('.card-ghost-note').textContent).toMatch(/drag into a list/);
    expect(card.querySelector('.card-del')).toBeNull();      // ghosts can't be deleted
  });

  test('a manifest tag already used in the document is NOT a ghost', async () => {
    window.ComponentInterop = { manifest: { meta: {
      'sol-ghost': { label: 'Ghosty' },
    } } };
    const el = await mount();
    el._docTags = new Set(['sol-ghost']);     // already in the doc
    el._render();
    expect(cardEls(el)).toHaveLength(0);
  });
});

// ── _withManifestMeta enrichment ─────────────────────────────────────────────

describe('SolPluginManager — _withManifestMeta', () => {
  test('manifest icon/title/description fill gaps; entry icon + comment win', () => {
    window.ComponentInterop = { manifest: { meta: {
      'sol-a': { icon: '📦', title: 'manifest hover', description: 'manifest blurb' },
    } } };
    const el = document.createElement('sol-plugin-manager');
    const enriched = el._withManifestMeta(
      { type: 'component', tag: 'sol-a', icon: '🎵', comment: 'curated blurb' });
    expect(enriched.icon).toBe('🎵');                 // entry icon wins
    expect(enriched.description).toBe('curated blurb'); // entry comment wins
    expect(enriched.title).toBe('manifest hover');      // title only from manifest
  });

  test('falls back to manifest icon/description when the entry has none', () => {
    window.ComponentInterop = { manifest: { meta: {
      'sol-a': { icon: '📦', description: 'manifest blurb' },
    } } };
    const el = document.createElement('sol-plugin-manager');
    const enriched = el._withManifestMeta({ type: 'component', tag: 'sol-a' });
    expect(enriched.icon).toBe('📦');
    expect(enriched.description).toBe('manifest blurb');
  });
});

// ── drag payload ─────────────────────────────────────────────────────────────

describe('SolPluginManager — drag payload', () => {
  // Minimal DataTransfer that records setData calls.
  function makeDT() {
    const data = {};
    return {
      data, effectAllowed: '',
      setData: (k, v) => { data[k] = v; },
      getData: (k) => data[k] || '',
    };
  }
  function fireDragStart(card) {
    const dt = makeDT();
    const e = new Event('dragstart', { bubbles: true });
    Object.defineProperty(e, 'dataTransfer', { value: dt });
    card.dispatchEvent(e);
    return dt;
  }

  test('an owned component card carries subject + list + copyMove', async () => {
    const el = await mount();
    el._items = [{ type: 'component', id: 'alpha', name: 'Alpha', tag: 'sol-a', params: [['source', 'x.ttl']], manifest: 'plugins/a.ttl' }];
    el._render();
    const dt = fireDragStart(cardEls(el)[0]);
    const payload = JSON.parse(dt.data[PLUGIN_MIME]);
    expect(payload).toMatchObject({ label: 'Alpha', tag: 'sol-a', manifest: 'plugins/a.ttl' });
    expect(payload.params).toEqual([['source', 'x.ttl']]);
    expect(payload.subject).toBe(`${el._docUrl()}#alpha`);
    expect(payload.list).toBe(el._menuIri());
    expect(dt.effectAllowed).toBe('copyMove');
  });

  test('a link card carries href + region, no params', async () => {
    const el = await mount();
    el._items = [{ type: 'link', id: 'docs', name: 'Docs', href: 'https://x.example/d', region: 'tab' }];
    el._render();
    const dt = fireDragStart(cardEls(el)[0]);
    const payload = JSON.parse(dt.data[PLUGIN_MIME]);
    expect(payload).toMatchObject({ label: 'Docs', href: 'https://x.example/d', region: 'tab' });
    expect(payload.tag).toBeUndefined();
    expect(payload.subject).toBe(`${el._docUrl()}#docs`);
  });

  test('a ghost card (no id) is copy-only and carries no subject/list', async () => {
    window.ComponentInterop = { manifest: { meta: { 'sol-g': { label: 'G', icon: '👻' } } } };
    const el = await mount();
    el._docTags = new Set();
    el._render();
    const dt = fireDragStart(cardEls(el)[0]);
    const payload = JSON.parse(dt.data[PLUGIN_MIME]);
    expect(payload.subject).toBeUndefined();
    expect(payload.list).toBeUndefined();
    expect(dt.effectAllowed).toBe('copy');
  });
});

// ── drop routing (_onDrop) ───────────────────────────────────────────────────

describe('SolPluginManager — drop routing', () => {
  // DataTransfer carrying a plugin payload (and a fixed type list).
  function pluginDT(payload, types = [PLUGIN_MIME]) {
    const data = { [PLUGIN_MIME]: JSON.stringify(payload) };
    return { types, getData: (k) => data[k] || '' };
  }
  function uriDT(uri) {
    const data = { 'text/uri-list': uri };
    return { types: ['text/uri-list'], getData: (k) => data[k] || '' };
  }
  function drop(el, dt) {
    const e = new Event('drop', { bubbles: true });
    Object.defineProperty(e, 'dataTransfer', { value: dt });
    el._onDrop(e);
  }

  test('a card from THIS list (own card) is ignored — no enqueue', async () => {
    const el = await mount();
    const enq = []; el._enqueue = (fn) => { enq.push(fn); return Promise.resolve(); };
    drop(el, pluginDT({ tag: 'sol-a', subject: `${el._docUrl()}#a`, list: el._menuIri() }));
    expect(enq).toHaveLength(0);
  });

  test('a card from the OTHER list in the same document → move (one enqueue)', async () => {
    const el = await mount();
    const enq = []; el._enqueue = (fn) => { enq.push(fn); return Promise.resolve(); };
    drop(el, pluginDT({ tag: 'sol-a', subject: `${el._docUrl()}#a`, list: `${el._docUrl()}#Available` }));
    expect(enq).toHaveLength(1);
  });

  test('a ghost card (no subject) → add a copy (one enqueue)', async () => {
    const el = await mount();
    const enq = []; el._enqueue = (fn) => { enq.push(fn); return Promise.resolve(); };
    drop(el, pluginDT({ tag: 'sol-a', label: 'Alpha' }));
    expect(enq).toHaveLength(1);
  });

  test('a payload with neither tag nor href is rejected', async () => {
    const el = await mount();
    const enq = []; el._enqueue = (fn) => { enq.push(fn); return Promise.resolve(); };
    drop(el, pluginDT({ label: 'nothing' }));
    expect(enq).toHaveLength(0);
  });

  test('a dropped manifest URL (text/uri-list) → import (one enqueue)', async () => {
    const el = await mount();
    const enq = []; el._enqueue = (fn) => { enq.push(fn); return Promise.resolve(); };
    drop(el, uriDT('plugins/news/manifest.jsonld'));
    expect(enq).toHaveLength(1);
  });
});

// ── url-row submit ───────────────────────────────────────────────────────────

describe('SolPluginManager — manifest URL input row', () => {
  test('＋ add with a non-empty URL enqueues an import and clears the input', async () => {
    const el = await mount();
    const enq = []; el._enqueue = (fn) => { enq.push(fn); return Promise.resolve(); };
    // Re-render so the url-row closes over the patched _enqueue.
    el._render();
    const input = builder(el).querySelector('.url-input');
    const add = builder(el).querySelector('.add-btn');
    input.value = '  plugins/x/manifest.jsonld  ';
    add.click();
    expect(enq).toHaveLength(1);
    expect(input.value).toBe('');
  });

  test('an empty URL does nothing', async () => {
    const el = await mount();
    const enq = []; el._enqueue = (fn) => { enq.push(fn); return Promise.resolve(); };
    el._render();
    builder(el).querySelector('.url-input').value = '   ';
    builder(el).querySelector('.add-btn').click();
    expect(enq).toHaveLength(0);
  });

  test('Enter in the input submits like the button', async () => {
    const el = await mount();
    const enq = []; el._enqueue = (fn) => { enq.push(fn); return Promise.resolve(); };
    el._render();
    const input = builder(el).querySelector('.url-input');
    input.value = 'plugins/y/manifest.jsonld';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(enq).toHaveLength(1);
  });
});

// ── grouped (topic tabs) ─────────────────────────────────────────────────────

describe('SolPluginManager — grouped topic tabs', () => {
  test('renders one tab per topic plus "Other", showing only the active tab', async () => {
    const el = await mount('grouped');
    el._items = [
      { type: 'component', id: 'pa', name: 'PlayerA', tag: 'sol-a', params: [] },
      { type: 'component', id: 'pb', name: 'PlayerB', tag: 'sol-b', params: [] },
      { type: 'component', id: 'loner', name: 'Loner', tag: 'sol-c', params: [] },
    ];
    el._topics = [{ iri: '#Audio', label: 'Audio', members: new Set(['pa', 'pb']), subs: [] }];
    el._topicTab = null;
    el._render();

    const tabs = [...el.shadowRoot.querySelectorAll('.topic-tab')].map((b) => b.textContent);
    expect(tabs).toEqual(['Audio', 'Other']);
    // First tab (Audio) is active and shows only its two members.
    expect(cardEls(el).map((c) => c.querySelector('.card-label').textContent))
      .toEqual(['PlayerA', 'PlayerB']);
  });

  test('clicking a tab switches the visible cards', async () => {
    const el = await mount('grouped');
    el._items = [
      { type: 'component', id: 'pa', name: 'PlayerA', tag: 'sol-a', params: [] },
      { type: 'component', id: 'loner', name: 'Loner', tag: 'sol-c', params: [] },
    ];
    el._topics = [{ iri: '#Audio', label: 'Audio', members: new Set(['pa']), subs: [] }];
    el._topicTab = null;
    el._render();
    const otherTab = [...el.shadowRoot.querySelectorAll('.topic-tab')].find((b) => b.textContent === 'Other');
    otherTab.click();
    expect(cardEls(el).map((c) => c.querySelector('.card-label').textContent)).toEqual(['Loner']);
  });
});

// ── _isUsed (in-use subtraction) ─────────────────────────────────────────────

describe('SolPluginManager — _isUsed', () => {
  test('nothing is used until _loadUsed populates _used', () => {
    const el = document.createElement('sol-plugin-manager');
    expect(el._isUsed({ type: 'component', tag: 'sol-a', params: [] })).toBe(false);
  });

  test('a component is used when its tag+source key matches', () => {
    const el = document.createElement('sol-plugin-manager');
    el._used = { hrefs: new Set(), keys: new Set(['sol-a\nx.ttl']), manifests: new Set() };
    expect(el._isUsed({ type: 'component', tag: 'sol-a', params: [['source', 'x.ttl']] })).toBe(true);
    expect(el._isUsed({ type: 'component', tag: 'sol-a', params: [['source', 'OTHER.ttl']] })).toBe(false);
  });

  test('a link is used when its href is in the used set', () => {
    const el = document.createElement('sol-plugin-manager');
    el._used = { hrefs: new Set(['https://x.example/']), keys: new Set(), manifests: new Set() };
    expect(el._isUsed({ type: 'link', href: 'https://x.example/' })).toBe(true);
    expect(el._isUsed({ type: 'link', href: 'https://y.example/' })).toBe(false);
  });

  test('a manifest identity wins over tag/href matching', () => {
    const el = document.createElement('sol-plugin-manager');
    el._used = { hrefs: new Set(), keys: new Set(), manifests: new Set(['plugins/a.ttl']) };
    expect(el._isUsed({ type: 'component', tag: 'whatever', params: [], manifest: 'plugins/a.ttl' })).toBe(true);
  });

  test('a used component is subtracted from the rendered cards', async () => {
    const el = await mount();
    el._used = { hrefs: new Set(), keys: new Set(['sol-b\n']), manifests: new Set() };
    el._items = [
      { type: 'component', id: 'a', name: 'Alpha', tag: 'sol-a', params: [] },
      { type: 'component', id: 'b', name: 'Beta', tag: 'sol-b', params: [] },   // used → hidden
    ];
    el._render();
    expect(cardEls(el).map((c) => c.querySelector('.card-label').textContent)).toEqual(['Alpha']);
  });
});

// ── _collections (skos:Collection topic parsing) ─────────────────────────────

describe('SolPluginManager — _collections', () => {
  const DOC = 'https://pod.example/catalog.ttl';

  test('parses topics, their members, and nests sub-collections one level', () => {
    const g = store();
    // Audio topic with two members and a sub-collection (Podcasts) holding one.
    g.add(S(`${DOC}#Audio`), S(RDF + 'type'), S(SKOS + 'Collection'));
    g.add(S(`${DOC}#Audio`), S(SKOS + 'prefLabel'), L('Audio'));
    g.add(S(`${DOC}#Audio`), S(SKOS + 'member'), S(`${DOC}#music`));
    g.add(S(`${DOC}#Audio`), S(SKOS + 'member'), S(`${DOC}#Podcasts`));   // a sub-collection
    g.add(S(`${DOC}#Podcasts`), S(RDF + 'type'), S(SKOS + 'Collection'));
    g.add(S(`${DOC}#Podcasts`), S(SKOS + 'prefLabel'), L('Podcasts'));
    g.add(S(`${DOC}#Podcasts`), S(SKOS + 'member'), S(`${DOC}#podz`));

    const el = document.createElement('sol-plugin-manager');
    el.setAttribute('source', `${DOC}#InUse`);
    const tops = el._collections(g);

    expect(tops).toHaveLength(1);                  // Podcasts is a SUB, not a top
    expect(tops[0].label).toBe('Audio');
    expect([...tops[0].members]).toEqual(['music']);   // the sub-collection iri is not a member frag
    expect(tops[0].subs).toHaveLength(1);
    expect(tops[0].subs[0].label).toBe('Podcasts');
    expect([...tops[0].subs[0].members]).toEqual(['podz']);
  });

  test('top topics are sorted by label', () => {
    const g = store();
    g.add(S(`${DOC}#Z`), S(RDF + 'type'), S(SKOS + 'Collection'));
    g.add(S(`${DOC}#Z`), S(SKOS + 'prefLabel'), L('Zed'));
    g.add(S(`${DOC}#A`), S(RDF + 'type'), S(SKOS + 'Collection'));
    g.add(S(`${DOC}#A`), S(SKOS + 'prefLabel'), L('Aye'));
    const el = document.createElement('sol-plugin-manager');
    expect(el._collections(g).map((t) => t.label)).toEqual(['Aye', 'Zed']);
  });
});

// ── _tagsInDoc ───────────────────────────────────────────────────────────────

describe('SolPluginManager — _tagsInDoc', () => {
  test('collects every schema:url-derived tag', () => {
    const DOC = 'https://pod.example/catalog.ttl';
    const g = store();
    g.add(S(`${DOC}#a`), S(SCHEMA + 'url'), S('https://pod.example/web/sol-a.js'));
    g.add(S(`${DOC}#b`), S(SCHEMA + 'url'), S('https://pod.example/web/sol-b.js'));
    const el = document.createElement('sol-plugin-manager');
    const tags = el._tagsInDoc(g);
    expect(tags.has('sol-a')).toBe(true);
    expect(tags.has('sol-b')).toBe(true);
    expect(tags.has('sol-z')).toBe(false);
  });
});

// ── _findExisting / _listsContaining ─────────────────────────────────────────

describe('SolPluginManager — _findExisting', () => {
  const DOC = 'https://pod.example/catalog.ttl';

  test('finds a component subject by tag + identical params', () => {
    const g = store();
    g.add(S(`${DOC}#node1`), S(SCHEMA + 'url'), S('https://pod.example/web/sol-a.js'));
    g.add(S(`${DOC}#node1`), S(UI + 'label'), L('Alpha'));
    const attr = S(`${DOC}#_p1`);
    g.add(S(`${DOC}#node1`), S(UI + 'attribute'), attr);
    g.add(attr, S(SCHEMA + 'name'), L('source'));
    g.add(attr, S(SCHEMA + 'value'), L('x.ttl'));

    const el = document.createElement('sol-plugin-manager');
    const found = el._findExisting(g, DOC, { type: 'component', tag: 'sol-a', params: [['source', 'x.ttl']] });
    expect(found).not.toBeNull();
    expect(found.id).toBe('node1');
    expect(found.name).toBe('Alpha');
    expect(found.tag).toBe('sol-a');
  });

  test('returns null when params differ', () => {
    const g = store();
    g.add(S(`${DOC}#node1`), S(SCHEMA + 'url'), S('https://pod.example/web/sol-a.js'));
    const el = document.createElement('sol-plugin-manager');
    const found = el._findExisting(g, DOC, { type: 'component', tag: 'sol-a', params: [['source', 'x.ttl']] });
    expect(found).toBeNull();   // node1 has no params, the query wants source=x.ttl
  });

  test('finds a link subject by href', () => {
    const g = store();
    g.add(S(`${DOC}#L`), S(SCHEMA + 'url'), L('https://x.example/'));
    g.add(S(`${DOC}#L`), S(UI + 'label'), L('Ex'));
    const el = document.createElement('sol-plugin-manager');
    const found = el._findExisting(g, DOC, { type: 'link', href: 'https://x.example/' });
    expect(found).not.toBeNull();
    expect(found.id).toBe('L');
    expect(found.name).toBe('Ex');
  });
});

// ── re-list reaction (_onMenuBuilt) ──────────────────────────────────────────

describe('SolPluginManager — _onMenuBuilt reaction', () => {
  test('a save of OUR OWN document triggers a reload', async () => {
    const el = await mount();
    let reloaded = 0;
    el._load = () => { reloaded++; };       // patch after mount (mount already loaded once)
    el._onMenuBuilt({ detail: { source: 'catalog.ttl#InUse' } });
    expect(reloaded).toBe(1);
  });

  test('a save of an UNRELATED document is ignored', async () => {
    const el = await mount();
    let reloaded = 0, used = 0;
    el._load = () => { reloaded++; };
    el._loadUsed = () => { used++; return Promise.resolve(); };
    el._onMenuBuilt({ detail: { source: 'https://other.example/elsewhere.ttl#Whatever' } });
    expect(reloaded).toBe(0);
    expect(used).toBe(0);
  });

  test('a save of a PAIRED menu doc recomputes in-use without a full reload', async () => {
    document.body.innerHTML =
      `<sol-menu-manager id="mm" source="tabs.ttl#Tabs"></sol-menu-manager>
       <sol-plugin-manager id="pm" source="catalog.ttl#InUse" for="#mm"></sol-plugin-manager>`;
    const el = document.getElementById('pm');
    await settle();

    let reloaded = 0, used = 0;
    el._load = () => { reloaded++; };
    el._loadUsed = () => { used++; return Promise.resolve(); };
    el._render = () => {};
    el._onMenuBuilt({ detail: { source: 'tabs.ttl#Tabs' } });
    await flush();
    expect(reloaded).toBe(0);      // not a full reload
    expect(used).toBe(1);          // but the in-use set is recomputed
  });
});

// ── _pairedDocs ──────────────────────────────────────────────────────────────

describe('SolPluginManager — _pairedDocs', () => {
  test('returns the resolved doc URLs of the managers named by for=', async () => {
    document.body.innerHTML =
      `<sol-menu-manager id="mm" source="tabs.ttl#Tabs"></sol-menu-manager>
       <sol-plugin-manager id="pm" source="catalog.ttl#InUse" for="#mm"></sol-plugin-manager>`;
    const el = document.getElementById('pm');
    await settle();
    const docs = el._pairedDocs();
    expect(docs.has(new URL('tabs.ttl', document.baseURI).href)).toBe(true);
  });

  test('empty set when there is no for= pairing', async () => {
    const el = await mount();
    expect(el._pairedDocs().size).toBe(0);
  });
});

// ── disconnectedCallback cleanup ─────────────────────────────────────────────

describe('SolPluginManager — disconnectedCallback', () => {
  test('after removal a sol-menu-built event no longer reloads the box', async () => {
    const el = await mount();
    let reloaded = 0;
    el._load = () => { reloaded++; };
    el.remove();
    document.dispatchEvent(new CustomEvent('sol-menu-built', { detail: { source: 'catalog.ttl#InUse' } }));
    expect(reloaded).toBe(0);
  });
});
