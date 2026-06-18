/**
 * <sol-plugin-manager> — an editable plugin list backed by a ui:Menu whose
 * entries are ui:Components (mountable plugins) or ui:Links (external apps:
 * ui:href + a ui:region like ui:Tab saying how they open — e.g. a new
 * browser tab). Renders the entries as draggable cards AND accepts
 * drops, so two instances side by side ("Plugins to Use" / "Plugins
 * Available") let the user drag plugins between the lists. Every change
 * auto-saves (whole-document rewrite, pantry preserved — see
 * core/menu-serialize).
 *
 *   <sol-plugin-manager source="./data/plugins-catalog.ttl#InUse"
 *                       for="sol-menu-manager, sol-button-bar-manager">
 *   </sol-plugin-manager>
 *
 * Attributes:
 *   source  — Turtle document + #fragment of the ui:Menu this box edits
 *             (required). The box title is the list's ui:label.
 *   for     — selector naming the manager(s) this palette feeds. Drag data
 *             is set globally (any manager accepts it). The pairing also
 *             SUBTRACTS what's in use: entries mounted by the paired
 *             managers' menus (links matched by href, components by tag —
 *             a plugin is in use once mounted, whatever attributes the menu
 *             gives it) are hidden from this box, and reappear the moment
 *             they're dragged off a menu. A box without `for` shows everything.
 *   grouped — boolean: render this box's topics as TABS — pick a topic, see
 *             only that topic's cards. The topics are skos:Collections in
 *             the source document (skos:prefLabel = tab label, skos:member =
 *             the entries); cards whose entry is in no collection appear
 *             under an "Other" tab.
 *
 * The cards are the union of two catalogs:
 *   1. the `source` list's entries — owned cards: draggable to the menu/bar
 *      managers (copy) or to the sibling box (move).
 *   2. the loader manifests — every ComponentInterop.manifest.meta entry
 *      that declares a `label` and whose tag no list in the document uses
 *      yet: a "ghost" card the user drags into a box to adopt it.
 *
 * Drops accepted by a box:
 *   - a card from the OTHER list in the same document → MOVE: one atomic
 *     rewrite of both lists (rewriteMenuDocument), one PUT.
 *   - a ghost card (no subject in its payload) → adopt into this list.
 *   - a manifest URL (`text/uri-list` / URL-shaped `text/plain`, e.g. a link
 *     dragged from another window) → import: the manifest must offer
 *     `<> a ui:Component ; ui:name "tag"`; its ui:label / ui:icon /
 *     ui:attribute defaults become the entry, and its dct:subject literal
 *     (the plugin's CATEGORY) files the entry into the matching
 *     skos:Collection — created on the fly for a new category. Typing the
 *     URL in the box's input row does the same.
 *
 * Drag payload: `application/x-sol-plugin` JSON {label, tag, params, icon}
 * plus, on owned cards, {subject, list} — the entry's and origin list's IRIs.
 * The menu/bar managers ignore the extra fields, so dropping a card on them
 * still copies.
 *
 * Events: `sol-menu-built` (detail {source}) after each auto-save. Instances
 * watching the same document re-load on it, so the sibling box refreshes
 * after a move.
 */

import { define } from '../core/define.js';
import { adopt, sheetFrom } from '../core/adopt.js';
import { CSS } from './styles/sol-builders-css.js';
import { rdf } from '../core/rdf.js';
import { loadRdfStore } from '../core/rdf-utils.js';
import { parseMenuItems, rdfVal, rdfComponent } from '../core/menu-rdf.js';
import { updateMenuInStore, serializeMenuDocument } from '../core/menu-serialize.js';
import { solFetch } from '../core/auth-fetch.js';
import { PLUGIN_MIME } from './sol-menu-manager.js';

// The catalog/menu docs are editable, so read them past the renderer's HTTP
// cache (no-store) — the same reason feed-fetch reads its source list fresh.
// Otherwise an edit (or an external sync) keeps showing the stale grouping.
const freshFetch = (url, opts) => solFetch(url, { ...(opts || {}), cache: 'no-store' });

const SHEET = sheetFrom(CSS);

const UI   = 'http://www.w3.org/ns/ui#';
const RDF  = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const RDFS = 'http://www.w3.org/2000/01/rdf-schema#';
const SKOS = 'http://www.w3.org/2004/02/skos/core#';
const DCT  = 'http://purl.org/dc/terms/';

// A chip's identity among entries that share a component tag is its DATA SOURCE
// (the `source` ui:attribute — the doc/library the chip opens). Every OTHER
// attribute (id, class, title, defer, storage-ns, view, reader, …) is render
// decoration a menu/bar adds and the catalog entry lacks, so none of them may
// enter the match key — otherwise a mounted chip's signature never equals its
// catalog entry's and it wrongly shows in both lists. This mirrors how
// sol-menu-manager._catalogName already disambiguates (tag + source). When a
// mounted item carries dct:source, that manifest identity wins over this (see
// _isUsed).
const sourceParam = (params) => {
  const s = (params || []).find(([k]) => k === 'source');
  return s ? (s[1] ?? '') : '';
};
const usedKey = (tag, params) => tag + '\n' + sourceParam(params);

// Exact-params key — a STRICTER check than chip identity, used to detect a
// duplicate of the very same entry within a single list (two same-tag items
// with different attributes are distinct list entries). NOT used for in-use.
const paramsKey = (params) =>
  (params || []).map(([k, v]) => `${k}=${v ?? ''}`).sort().join(' ');

class SolPluginManager extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    adopt(this.shadowRoot, { sheet: SHEET, css: CSS });
    this._items = [];                      // this list's entries (parseMenuItems shape)
    this._meta = { label: null, comment: null, orientation: null };
    this._queue = Promise.resolve();       // serializes saves within this box
    this._onMenuBuilt = this._onMenuBuilt.bind(this);
  }

  connectedCallback() {
    document.addEventListener('sol-menu-built', this._onMenuBuilt);
    if (this._built) return;
    this._built = true;
    this._root = document.createElement('div');
    this._root.className = 'builder';
    this.shadowRoot.appendChild(this._root);
    this._wireDrop();
    this._load();
  }

  disconnectedCallback() {
    document.removeEventListener('sol-menu-built', this._onMenuBuilt);
  }

  get source() { return this.getAttribute('source') || ''; }

  _docUrl() { return new URL(this.source.split('#')[0], document.baseURI).href; }
  _menuIri() {
    const frag = (this.source.split('#')[1] || '').trim();
    return frag ? `${this._docUrl()}#${frag}` : null;
  }

  // Another manager saved a document we care about: our own catalog (a
  // move's other half, an import, our own save) — re-load; or one of the
  // PAIRED managers' menus — recompute what's in use, so a plugin dragged
  // onto a menu disappears here and one dragged off reappears.
  _onMenuBuilt(e) {
    const src = (e.detail && e.detail.source) || '';
    if (!src || !this.source || !this._menuIri()) return;
    try {
      const doc = new URL(src.split('#')[0], document.baseURI).href;
      if (doc === this._docUrl()) { this._load(); return; }
      if (this._pairedDocs().has(doc)) this._loadUsed().then(() => this._render());
    } catch { /* unparseable source — not ours */ }
  }

  // The menu documents of the managers this box feeds (its `for` pairing).
  _pairedDocs() {
    const docs = new Set();
    const sel = this.getAttribute('for');
    if (!sel) return docs;
    let els = [];
    try { els = [...document.querySelectorAll(sel)]; } catch { return docs; }
    for (const el of els) {
      const src = el.getAttribute && el.getAttribute('source');
      if (!src) continue;
      try { docs.add(new URL(src.split('#')[0], document.baseURI).href); } catch { /* skip */ }
    }
    return docs;
  }

  // What the paired menus mount, keyed for matching catalog entries:
  // links by href, components by tag — a plugin is "in use" once its
  // component is mounted anywhere, whatever attributes the menu gives it.
  // Submenu children count too.
  async _loadUsed() {
    const sel = this.getAttribute('for');
    if (!sel) { this._used = null; return; }
    const used = { hrefs: new Set(), keys: new Set(), manifests: new Set() };
    const perDoc = new Map();
    let els = [];
    try { els = [...document.querySelectorAll(sel)]; } catch { els = []; }
    for (const el of els) {
      const src = el.getAttribute && el.getAttribute('source');
      if (!src || !src.includes('#')) continue;
      try {
        const docUrl = new URL(src.split('#')[0], document.baseURI).href;
        if (!perDoc.has(docUrl)) perDoc.set(docUrl, new Set());
        perDoc.get(docUrl).add(src.split('#')[1]);
      } catch { /* skip */ }
    }
    for (const [docUrl, frags] of perDoc) {
      try {
        const store = await loadRdfStore(docUrl, freshFetch);
        const walk = (items) => {
          for (const it of items || []) {
            if (it.type === 'submenu') { walk(it.children); continue; }
            // Primary identity: the chip's manifest (dct:source) — record it
            // whenever present so a mounted chip matches its catalog entry
            // regardless of tag/param coincidences.
            if (it.manifest) used.manifests.add(it.manifest);
            // Fallbacks for legacy items mounted before dct:source was carried.
            if (it.href) { used.hrefs.add(it.href); continue; }
            if (it.tag) used.keys.add(usedKey(it.tag, it.params));
          }
        };
        for (const f of frags) walk(parseMenuItems(store, rdf.sym(`${docUrl}#${f}`)));
      } catch { /* a missing menu doc hides nothing */ }
    }
    this._used = used;
  }

  // Is this catalog entry mounted by a paired menu? Links match by href,
  // components by tag — independent of the attributes either side carries.
  _isUsed(p) {
    if (!this._used) return false;
    // A chip is a PLUGIN (a manifest), not a component: match on dct:source
    // identity first. Fall back to href / tag+params only for legacy menu
    // items that predate the dct:source link.
    if (p.manifest && this._used.manifests.has(p.manifest)) return true;
    if (p.type === 'link') return this._used.hrefs.has(p.href);
    return this._used.keys.has(usedKey(p.tag, p.params));
  }

  // ---- loading -----------------------------------------------------------

  async _load() {
    if (!this.source || !this._menuIri()) {
      this._root.innerHTML = '<div class="hint">Set source="plugins-catalog.ttl#InUse" (a ui:Menu of plugins) to manage a list.</div>';
      return;
    }
    this._loadError = null;
    await this._loadUsed();
    try {
      const store = await loadRdfStore(this._docUrl(), freshFetch);
      const menuNode = rdf.sym(this._menuIri());
      const desc = this._menuDesc(store, this._menuIri());
      this._items = desc.items;
      this._meta = { label: desc.label, comment: desc.comment, orientation: desc.orientation };
      this._docTags = this._tagsInDoc(store);
      this._topics = this._collections(store);
      if (!store.statementsMatching(menuNode, null, null).length) {
        this._loadError = new Error(`no #${this.source.split('#')[1]} list in the document`);
      }
    } catch (e) {
      // A 404 just means "new document" — start empty (first save creates it).
      this._items = [];
      this._meta = { label: this.source.split('#')[1] || 'plugins', comment: null, orientation: null };
      this._docTags = new Set();
      this._topics = [];
    }
    this._render();
  }

  // The document's topic categories: skos:Collections, each with a
  // skos:prefLabel heading and skos:member entries (held as fragment names).
  // A collection that is itself a MEMBER of another collection is a
  // SUB-topic: it renders as a headed group inside its parent's tab, not as
  // a tab of its own (one level of nesting). Sorted by label so grouped
  // rendering is deterministic across saves.
  _collections(store) {
    const all = new Map();
    for (const st of store.statementsMatching(null, rdf.sym(RDF + 'type'), rdf.sym(SKOS + 'Collection'))) {
      const node = st.subject;
      const labelNode = store.any(node, rdf.sym(SKOS + 'prefLabel'));
      all.set(node.value, {
        iri: node.value,
        label: labelNode ? labelNode.value : (node.value.split('#')[1] || node.value),
        memberIris: store.each(node, rdf.sym(SKOS + 'member'), null).map((m) => m.value || ''),
        subs: [],
      });
    }
    const isSub = new Set();
    for (const c of all.values()) {
      c.members = new Set(c.memberIris
        .filter((v) => !all.has(v))
        .map((v) => v.split('#')[1] || '')
        .filter(Boolean));
      for (const v of c.memberIris) {
        if (all.has(v)) { c.subs.push(all.get(v)); isSub.add(v); }
      }
      c.subs.sort((a, b) => a.label.localeCompare(b.label));
    }
    const top = [...all.values()].filter((c) => !isSub.has(c.iri));
    top.sort((a, b) => a.label.localeCompare(b.label));
    return top;
  }

  // Every entry fragment any topic (or sub-topic) claims — the complement is
  // the "Other" group.
  _claimedFrags() {
    const out = new Set();
    const walk = (c) => { for (const f of c.members) out.add(f); (c.subs || []).forEach(walk); };
    (this._topics || []).forEach(walk);
    return out;
  }

  // A ui:Menu as the description rewriteMenuDocument takes: {iri, label,
  // comment, orientation, items}.
  _menuDesc(store, iri) {
    const node = rdf.sym(iri);
    const label = rdfVal(store, node, 'label');
    const commentNode = store.any(node, rdf.sym(RDFS + 'comment'));
    const orient = rdfVal(store, node, 'orientation');
    return {
      iri,
      label: label || iri.split('#')[1] || 'plugins',
      comment: commentNode ? commentNode.value : null,
      orientation: orient ? orient.split('#').pop().toLowerCase() : null,
      items: parseMenuItems(store, node),
    };
  }

  // Every element tag any ui:Component in the document declares — used to
  // decide which loader-manifest entries still show as ghost cards.
  _tagsInDoc(store) {
    const tags = new Set();
    for (const st of store.statementsMatching(null, rdf.sym(UI + 'name'), null)) {
      if (st.object && st.object.value) tags.add(st.object.value);
    }
    return tags;
  }

  // Loader-manifest components (label = palette opt-in) no list in the
  // document has adopted yet.
  _ghosts() {
    const meta = (window.ComponentInterop
      && window.ComponentInterop.manifest
      && window.ComponentInterop.manifest.meta) || {};
    const out = [];
    for (const [tag, m] of Object.entries(meta)) {
      if (!m.label || (this._docTags && this._docTags.has(tag))) continue;
      out.push({
        type: 'component', tag,
        name: m.label,
        icon: m.icon,
        title: m.title,
        description: m.description,
        params: (m.params || []).map((pv) => [pv.name, pv.value]),
        ghost: true,
      });
    }
    return out;
  }

  // Enrich an owned entry's card with its tag's manifest meta (icon / hover
  // title / description fill gaps). The entry's own ui:icon and rdfs:comment
  // (the curated icon + card blurb) win over manifest meta. (No help link on
  // cards — plugin help belongs to the app's ? button, not the catalog.)
  _withManifestMeta(item) {
    const meta = (window.ComponentInterop
      && window.ComponentInterop.manifest
      && window.ComponentInterop.manifest.meta) || {};
    const m = meta[item.tag] || {};
    return {
      ...item,
      icon: item.icon || m.icon,
      title: m.title,
      description: item.comment || m.description,
    };
  }

  // ---- rendering ---------------------------------------------------------

  _render() {
    const head = document.createElement('div');
    head.className = 'builder-head';
    const title = document.createElement('span');
    title.className = 'builder-title';
    title.textContent = this._meta.label || '';
    this._status = document.createElement('span');
    this._status.className = 'builder-status';
    head.append(title, this._status);

    // Entries are components (mountable plugins) OR links (external apps —
    // a ui:Link with ui:href; clicking the placed item fires the link).
    // Cards DISPLAY alphabetically by name; the stored list keeps its own
    // order (sorting is presentation only).
    const byName = (a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' });
    const plugins = this._items
      .filter((i) => (i.type === 'component' && i.tag) || (i.type === 'link' && i.href))
      .filter((i) => !this._isUsed(i))
      .map((i) => this._withManifestMeta(i))
      .sort(byName);
    const ghosts = this._ghosts().filter((g) => !this._isUsed(g)).sort(byName);

    if (this.hasAttribute('grouped')) {
      // Topic TABS (skos:Collections): pick a topic, see only its cards. A
      // topic's SUB-collections render as headed groups inside its tab. An
      // entry in several collections shows under each of its topics; entries
      // in none — and ghost cards — sit under "Other".
      const inAny = this._claimedFrags();
      const mine = (members) => plugins.filter((p) => p.id && members.has(p.id));
      const groups = this._topics.map((t) => ({
        label: t.label,
        cards: mine(t.members),
        subs: (t.subs || []).map((sub) => ({ label: sub.label, cards: mine(sub.members) }))
          .filter((sub) => sub.cards.length),
      }));
      groups.push({ label: 'Other', cards: [...plugins.filter((p) => !p.id || !inAny.has(p.id)), ...ghosts], subs: [] });
      const tabs = groups.filter((g) => g.cards.length || g.subs.length);
      if (!tabs.some((g) => g.label === this._topicTab)) this._topicTab = tabs[0]?.label;

      this._cards = document.createElement('div');
      this._cards.className = 'cards';
      this._cards.setAttribute('role', 'list');
      const active = tabs.find((g) => g.label === this._topicTab);
      for (const p of active?.cards || []) this._cards.appendChild(this._card(p));
      for (const sub of active?.subs || []) {
        const head = document.createElement('div');
        head.className = 'cards-subhead';
        head.textContent = sub.label;
        this._cards.appendChild(head);
        for (const p of sub.cards) this._cards.appendChild(this._card(p));
      }

      if (tabs.length) {
        const strip = document.createElement('div');
        strip.className = 'topic-tabs';
        strip.setAttribute('role', 'tablist');
        strip.setAttribute('aria-label', 'Topics');
        for (const g of tabs) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = g.label === this._topicTab ? 'topic-tab active' : 'topic-tab';
          btn.setAttribute('role', 'tab');
          btn.setAttribute('aria-selected', g.label === this._topicTab ? 'true' : 'false');
          btn.textContent = g.label;
          btn.addEventListener('click', () => { this._topicTab = g.label; this._render(); });
          strip.appendChild(btn);
        }
        this._root.replaceChildren(head, strip, this._cards, this._urlRow());
        if (this._flash) { this._note(this._flash, 'saved'); this._flash = null; }
        return;
      }
    } else {
      this._cards = document.createElement('div');
      this._cards.className = 'cards';
      this._cards.setAttribute('role', 'list');
      for (const p of plugins) this._cards.appendChild(this._card(p));
      for (const g of ghosts) this._cards.appendChild(this._card(g));
    }
    if (!this._cards.children.length) {
      const empty = document.createElement('div');
      empty.className = 'hint';
      empty.textContent = this._loadError
        ? `Could not load list: ${this._loadError.message}`
        : 'empty — drag a plugin here, or add one by manifest URL';
      this._cards.appendChild(empty);
    }

    this._root.replaceChildren(head, this._cards, this._urlRow());

    if (this._flash) { this._note(this._flash, 'saved'); this._flash = null; }
  }

  _card(p) {
    const card = document.createElement('div');
    card.className = p.ghost ? 'card ghost' : 'card';
    card.draggable = true;
    card.setAttribute('role', 'listitem');
    const top = document.createElement('span');
    top.className = 'card-top';
    if (p.icon) {
      const icon = document.createElement('span');
      icon.className = 'card-icon';
      icon.setAttribute('aria-hidden', 'true');
      // An emoji icon paints as text; a URL or data: icon (e.g. a site
      // favicon) paints as an <img> — same split sol-menu makes for its icons.
      if (/^(?:https?:\/\/|data:|\.{0,2}\/)/.test(p.icon)) {
        if (p.icon.startsWith('data:image/svg+xml')) {
          try {
            icon.innerHTML = decodeURIComponent(p.icon.replace('data:image/svg+xml,', ''));
            const svg = icon.querySelector('svg');
            if (svg) { svg.setAttribute('width', '1.2em'); svg.setAttribute('height', '1.2em'); }
          } catch { icon.textContent = p.icon; }
        } else {
          const img = document.createElement('img');
          img.src = p.icon;
          img.alt = '';
          icon.appendChild(img);
        }
      } else {
        icon.textContent = p.icon;
      }
      top.appendChild(icon);
    }
    const label = document.createElement('span');
    label.className = 'card-label';
    label.textContent = p.name || p.tag;
    top.appendChild(label);
    // Delete: an owned entry (not a loader-manifest ghost) can be removed from
    // the catalog entirely — entry + its manifest (via dct:source). Confirmed,
    // since it's destructive.
    if (!p.ghost && p.id) {
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'card-del';
      del.textContent = '✕';
      del.title = `Remove “${p.name || p.tag}” from the catalog`;
      del.setAttribute('aria-label', del.title);
      del.draggable = false;
      del.addEventListener('mousedown', (e) => e.stopPropagation());
      del.addEventListener('dragstart', (e) => { e.preventDefault(); e.stopPropagation(); });
      del.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.confirm(`Remove “${p.name || p.tag}” from your catalog?\nThis deletes the plugin (and its manifest).`)) {
          this._enqueue(() => this._deleteEntry(p));
        }
      });
      top.appendChild(del);
    }
    // No tag line — element names mean nothing to the app user; the card is
    // its icon, name and blurb. Tooltips likewise speak to the USER (the
    // manifest's hover text, else the blurb) — never tags or attributes.
    const hover = p.title || p.description;
    if (hover) card.title = hover;
    card.append(top);
    if (p.description) {
      const desc = document.createElement('span');
      desc.className = 'card-desc';
      desc.textContent = p.description;
      card.appendChild(desc);
    }
    if (p.ghost) {
      const note = document.createElement('span');
      note.className = 'card-ghost-note';
      note.textContent = 'also on offer — drag into a list to add it';
      card.appendChild(note);
    }
    // Who made it — dct:creator (else dct:publisher), italic, bottom right.
    const by = p.creator || p.publisher;
    if (by) {
      const byline = document.createElement('span');
      byline.className = 'card-byline';
      byline.textContent = by;
      card.appendChild(byline);
    }
    card.addEventListener('dragstart', (e) => {
      card.classList.add('dragging');
      const payload = p.type === 'link'
        ? { label: p.name || p.href, href: p.href, region: p.region || '', icon: p.icon || '' }
        : { label: p.name || p.tag, tag: p.tag, params: p.params || [], icon: p.icon || '' };
      // Carry the chip's manifest identity (dct:source) so the dropped menu item
      // records which plugin it is — see sol-menu-manager `_itemFromPlugin`.
      if (p.manifest) payload.manifest = p.manifest;
      if (!p.ghost && p.id) {
        payload.subject = `${this._docUrl()}#${p.id}`;
        payload.list = this._menuIri();
        e.dataTransfer.effectAllowed = 'copyMove';
      } else {
        e.dataTransfer.effectAllowed = 'copy';
      }
      e.dataTransfer.setData(PLUGIN_MIME, JSON.stringify(payload));
      e.dataTransfer.setData('text/plain', p.tag || p.href || p.name || '');
    });
    card.addEventListener('dragend', () => card.classList.remove('dragging'));
    return card;
  }

  _urlRow() {
    const row = document.createElement('div');
    row.className = 'url-row';
    const input = document.createElement('input');
    input.className = 'url-input';
    input.type = 'text';
    input.placeholder = 'manifest URL — e.g. plugins/news/manifest.jsonld';
    input.setAttribute('aria-label', 'Manifest URL');
    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'add-btn';
    add.textContent = '＋ add';
    const submit = () => {
      const v = input.value.trim();
      if (!v) return;
      input.value = '';
      this._enqueue(() => this._importManifest(v));
    };
    add.addEventListener('click', submit);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
    row.append(input, add);
    return row;
  }

  // ---- drops -------------------------------------------------------------

  _wireDrop() {
    const accepts = (e) => {
      const types = [...((e.dataTransfer && e.dataTransfer.types) || [])];
      return types.includes(PLUGIN_MIME) || types.includes('text/uri-list') || types.includes('text/plain');
    };
    this._root.addEventListener('dragover', (e) => {
      if (!accepts(e)) return;
      e.preventDefault();
      if (this._cards) this._cards.classList.add('drop-over');
    });
    this._root.addEventListener('dragleave', (e) => {
      if (e.target === this._root && this._cards) this._cards.classList.remove('drop-over');
    });
    this._root.addEventListener('drop', (e) => {
      if (!accepts(e)) return;
      e.preventDefault();
      if (this._cards) this._cards.classList.remove('drop-over');
      this._onDrop(e);
    });
  }

  _onDrop(e) {
    const dt = e.dataTransfer;
    if ([...(dt.types || [])].includes(PLUGIN_MIME)) {
      let p = null;
      try { p = JSON.parse(dt.getData(PLUGIN_MIME)); } catch { /* not ours */ }
      if (!p || (!p.tag && !p.href)) return;
      if (p.subject && p.list && p.list === this._menuIri()) return; // own card
      if (p.subject && p.list && p.list.split('#')[0] === this._docUrl().split('#')[0]) {
        this._enqueue(() => this._moveHere(p));
      } else {
        // ghost card, or a card from some other document — add a copy here
        this._enqueue(() => this._addEntry(p.href
          ? { type: 'link', id: null,
              name: p.label || p.href,
              icon: p.icon || undefined,
              region: p.region || undefined,
              href: p.href }
          : { type: 'component', id: null,
              name: p.label || p.tag,
              icon: p.icon || undefined,
              tag: p.tag,
              params: (p.params || []).map(([k, v]) => [k, v]) }));
      }
      return;
    }
    const text = dt.getData('text/uri-list') || dt.getData('text/plain') || '';
    const url = text.split(/\r?\n/).map((l) => l.trim()).find((l) => l && !l.startsWith('#'));
    if (url) this._enqueue(() => this._importManifest(url));
  }

  // ---- mutations (each = fresh parse → rewrite touched lists → one PUT) ---

  _enqueue(fn) {
    this._queue = this._queue.then(async () => {
      this._note('saving…', '');
      try { await fn(); } catch (err) { this._note(`failed: ${err.message}`, 'error'); }
    });
    return this._queue;
  }

  // Move an entry from its origin list in the same document into this list.
  // One atomic transaction: BOTH lists rewritten, one PUT — never rewrite
  // just one (the serializer clears subjects the new tree references).
  async _moveHere(payload) {
    const docUrl = this._docUrl();
    const store = await loadRdfStore(docUrl, freshFetch);
    const origin = this._menuDesc(store, payload.list);
    const own = this._menuDesc(store, this._menuIri());
    const frag = payload.subject.split('#')[1] || '';
    const at = origin.items.findIndex((it) => it.id === frag);
    if (at < 0) throw new Error(`“${payload.label}” is no longer in its list (already moved?)`);
    const [entry] = origin.items.splice(at, 1);
    if (!own.items.some((it) => it.id === entry.id)) own.items.push(entry);
    await this._putDoc(store, docUrl, [origin, own], `moved “${entry.name}” here ✓`);
  }

  // Add an entry to this list — adopting a ghost card or importing a
  // manifest. Dedup: an identical entry anywhere in the document (components
  // by tag+params, links by href) either reports where it already is, or (if
  // it's only pantry) re-lists it here. entry.categories (a manifest's
  // dct:subject literals) file the entry into the matching skos:Collections
  // — created when a category is new.
  async _addEntry(entry) {
    const docUrl = this._docUrl();
    let store;
    try { store = await loadRdfStore(docUrl, freshFetch); }
    catch { store = rdf.graph(); }

    const categories = entry.categories || (entry.category ? [entry.category] : []);
    const existing = this._findExisting(store, docUrl, entry);
    if (existing) {
      const home = this._listsContaining(store, docUrl, existing.id);
      if (home.length) { this._note(`already listed under “${home[0]}”`, ''); return; }
      // Re-list the existing node (keep its id), but refresh its label + icon to
      // the dropped plugin's current identity — otherwise a node that got a
      // stale/wrong label keeps it forever when re-added.
      entry = { ...existing, name: entry.name || existing.name, icon: entry.icon || existing.icon };
    }
    const own = this._menuDesc(store, this._menuIri());
    const dup = entry.type === 'link'
      ? own.items.some((it) => it.type === 'link' && it.href === entry.href)
      : own.items.some((it) => it.type === 'component' && it.tag === entry.tag
          && paramsKey(it.params) === paramsKey(entry.params));
    if (dup) { this._note('already in this list', ''); return; }
    own.items.push(entry);
    // Membership is written AFTER the menu rewrite: that's when a fresh
    // entry gets its minted fragment id.
    await this._putDoc(store, docUrl, [own], `added “${entry.name}” ✓`,
      () => { if (entry.id) for (const c of categories) this._fileUnderCategory(store, docUrl, entry.id, c); });
  }

  // Delete an entry from the catalog ENTIRELY (not just unlist it): drop it
  // from this list, strip its skos:Collection memberships and its own triples,
  // PUT — then DELETE its manifest (dct:source provenance). The plugin is gone.
  async _deleteEntry(p) {
    const docUrl = this._docUrl();
    const store = await loadRdfStore(docUrl, freshFetch);
    const entry = rdf.sym(`${docUrl.split('#')[0]}#${p.id}`);
    const srcN = store.any(entry, rdf.sym(DCT + 'source'));
    const manifestUrl = srcN ? new URL(srcN.value, docUrl).href : null;
    const own = this._menuDesc(store, this._menuIri());
    own.items = own.items.filter((it) => it.id !== p.id);
    for (const st of [...store.statementsMatching(null, rdf.sym(SKOS + 'member'), entry)]) store.remove(st);
    for (const st of [...store.statementsMatching(entry, null, null)]) store.remove(st);
    await this._putDoc(store, docUrl, [own], `removed “${p.name || p.tag}” ✓`);
    if (manifestUrl) {
      try {
        const r = await solFetch(manifestUrl, { method: 'DELETE' });
        if (r && r.ok === false && r.status !== 404) this._note(`removed; manifest DELETE → ${r.status}`, '');
      } catch (_) { /* manifest already gone / unreachable — the catalog removal stands */ }
    }
  }

  // Ensure a skos:Collection labelled `category` exists and has the entry as
  // a member. Matching is by skos:prefLabel, case-insensitive; a new category
  // becomes a new collection.
  _fileUnderCategory(store, docUrl, frag, category) {
    const doc = rdf.sym(docUrl.split('#')[0]);
    const entryNode = rdf.sym(`${docUrl.split('#')[0]}#${frag}`);
    const want = String(category).trim();
    let col = this._collections(store)
      .find((t) => t.label.toLowerCase() === want.toLowerCase());
    let colNode;
    if (col) {
      colNode = rdf.sym(col.iri);
    } else {
      let base = want.replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '') || 'topic';
      let slug = base, n = 2;
      while (store.statementsMatching(rdf.sym(`${doc.value}#${slug}`), null, null).length) slug = `${base}-${n++}`;
      colNode = rdf.sym(`${doc.value}#${slug}`);
      store.add(colNode, rdf.sym(RDF + 'type'), rdf.sym(SKOS + 'Collection'), doc);
      store.add(colNode, rdf.sym(SKOS + 'prefLabel'), rdf.literal(want), doc);
    }
    if (!store.statementsMatching(colNode, rdf.sym(SKOS + 'member'), entryNode).length) {
      store.add(colNode, rdf.sym(SKOS + 'member'), entryNode, doc);
    }
  }

  // An existing subject in the document describing the same thing —
  // components by tag + identical attribute defaults, links by href — as a
  // re-listable entry.
  _findExisting(store, docUrl, entry) {
    const doc = docUrl.split('#')[0];
    if (entry.type === 'link') {
      for (const st of store.statementsMatching(null, rdf.sym(UI + 'href'), null)) {
        const subj = st.subject;
        if (!subj.value || !subj.value.startsWith(doc + '#')) continue;
        if (st.object.value !== entry.href) continue;
        return {
          type: 'link',
          id: subj.value.slice(doc.length + 1),
          name: rdfVal(store, subj, 'label') || entry.href,
          icon: rdfVal(store, subj, 'icon') || undefined,
          region: (rdfVal(store, subj, 'region') || '').split('#').pop().toLowerCase() || undefined,
          href: entry.href,
        };
      }
      return null;
    }
    const want = paramsKey(entry.params);
    for (const st of store.statementsMatching(null, rdf.sym(UI + 'name'), null)) {
      const subj = st.subject;
      if (!subj.value || !subj.value.startsWith(doc + '#')) continue;
      const { tag, params } = rdfComponent(store, subj);
      if (tag !== entry.tag || paramsKey(params) !== want) continue;
      return {
        type: 'component',
        id: subj.value.slice(doc.length + 1),
        name: rdfVal(store, subj, 'label') || tag,
        icon: rdfVal(store, subj, 'icon') || undefined,
        tag, params,
      };
    }
    return null;
  }

  // Labels of every ui:Menu in the document whose parts include `frag`.
  _listsContaining(store, docUrl, frag) {
    const labels = [];
    const menus = store.each(null, rdf.sym(RDF + 'type'), rdf.sym(UI + 'Menu'));
    for (const menu of menus) {
      if (parseMenuItems(store, menu).some((it) => it.id === frag)) {
        labels.push(rdfVal(store, menu, 'label') || (menu.value.split('#')[1] || menu.value));
      }
    }
    return labels;
  }

  // Fetch + parse a manifest and add it as an entry. Two kinds:
  //   `<> a ui:Component ; ui:name "tag"` — a mountable plugin (ui:label /
  //   ui:icon / ui:attribute defaults flesh out the entry);
  //   `<> a ui:Link ; ui:href <url>`      — an external app (ui:region, e.g.
  //   ui:Tab, says how it opens).
  // dct:subject literals are the categories the entry files under.
  async _importManifest(input) {
    let url;
    try { url = new URL(String(input), document.baseURI); }
    catch { throw new Error(`not a URL: ${input}`); }
    url.hash = '';
    const manifestUrl = url.href;
    const mStore = await loadRdfStore(manifestUrl, freshFetch);
    const subj = rdf.sym(manifestUrl);
    const hasType = (local) => mStore.statementsMatching(
      subj, rdf.sym(RDF + 'type'), rdf.sym(UI + local),
    ).length > 0;
    const categories = mStore.each(subj, rdf.sym(DCT + 'subject'), null).map((n) => n.value);
    const tag = rdfVal(mStore, subj, 'name');
    const href = rdfVal(mStore, subj, 'href');
    const lit = (ns, local) => {
      const n = mStore.any(subj, rdf.sym(ns + local));
      return n ? n.value : undefined;
    };
    if (hasType('Link') && href) {
      await this._addEntry({
        type: 'link', id: null,
        name: rdfVal(mStore, subj, 'label') || href,
        icon: rdfVal(mStore, subj, 'icon') || undefined,
        region: (rdfVal(mStore, subj, 'region') || '').split('#').pop().toLowerCase() || undefined,
        creator: lit(DCT, 'creator'),
        publisher: lit(DCT, 'publisher'),
        href, categories,
      });
      return;
    }
    if (hasType('Component') && tag) {
      await this._addEntry({
        type: 'component', id: null,
        name: rdfVal(mStore, subj, 'label') || tag,
        icon: rdfVal(mStore, subj, 'icon') || undefined,
        tag,
        params: rdfComponent(mStore, subj).params,
        creator: lit(DCT, 'creator'),
        publisher: lit(DCT, 'publisher'),
        categories,
      });
      return;
    }
    throw new Error(`${input} is not a plugin manifest (need <> a ui:Component with ui:name, or a ui:Link with ui:href)`);
  }

  // Rewrite the given menus in the store, run the optional `after` hook
  // (post-rewrite, so freshly minted entry ids exist — used to write
  // skos:member triples), serialize ONCE, PUT.
  async _putDoc(store, docUrl, menus, flash, after) {
    for (const m of menus) updateMenuInStore(store, docUrl, m.iri, m);
    if (after) after();
    const turtle = await serializeMenuDocument(store, docUrl);
    const res = await solFetch(docUrl, {
      method: 'PUT', headers: { 'Content-Type': 'text/turtle' }, body: turtle,
    });
    if (!res || res.ok === false) throw new Error(`PUT ${docUrl} → ${res && res.status}`);
    this._flash = flash || 'saved ✓';
    this.dispatchEvent(new CustomEvent('sol-menu-built', {
      bubbles: true, composed: true, detail: { source: this.source },
    }));
  }

  _note(msg, cls) {
    if (!this._status) return;
    this._status.textContent = msg;
    this._status.className = `builder-status ${cls || ''}`;
  }
}

define('sol-plugin-manager', SolPluginManager);
export { SolPluginManager };
export default SolPluginManager;
