/**
 * <sol-plugin-manager> — an editable plugin list backed by a ui:Menu of
 * ui:Component entries. Renders the entries as draggable cards AND accepts
 * drops, so two instances side by side ("Plugins to Use" / "Plugins
 * Available") let the user drag plugins between the lists. Every change
 * auto-saves (whole-document rewrite, pantry preserved — see
 * core/menu-serialize).
 *
 *   <sol-plugin-manager source="./data/palette.ttl#InUse"
 *                       for="sol-menu-manager, sol-button-bar-manager">
 *   </sol-plugin-manager>
 *
 * Attributes:
 *   source — Turtle document + #fragment of the ui:Menu this box edits
 *            (required). The box title is the list's ui:label.
 *   for    — selector naming the manager(s) this palette feeds. Drag data
 *            is set globally (any manager accepts it); `for` exists so pages
 *            can declare the pairing and styling/tooling can use it.
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
 *     ui:attribute defaults become the entry. Typing the URL in the box's
 *     input row does the same.
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
import { rewriteMenuDocument } from '../core/menu-serialize.js';
import { solFetch } from '../core/auth-fetch.js';
import { PLUGIN_MIME } from './sol-menu-manager.js';

const SHEET = sheetFrom(CSS);

const UI   = 'http://www.w3.org/ns/ui#';
const RDF  = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const RDFS = 'http://www.w3.org/2000/01/rdf-schema#';

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

  // Another manager saved this document (a move's other half, an import in
  // the sibling box, our own save) — re-load from the server.
  _onMenuBuilt(e) {
    const src = (e.detail && e.detail.source) || '';
    if (!src || !this.source || !this._menuIri()) return;
    try {
      const doc = new URL(src.split('#')[0], document.baseURI).href;
      if (doc === this._docUrl()) this._load();
    } catch { /* unparseable source — not ours */ }
  }

  // ---- loading -----------------------------------------------------------

  async _load() {
    if (!this.source || !this._menuIri()) {
      this._root.innerHTML = '<div class="hint">Set source="palette.ttl#InUse" (a ui:Menu of plugins) to manage a list.</div>';
      return;
    }
    this._loadError = null;
    try {
      const store = await loadRdfStore(this._docUrl(), solFetch);
      const menuNode = rdf.sym(this._menuIri());
      const desc = this._menuDesc(store, this._menuIri());
      this._items = desc.items;
      this._meta = { label: desc.label, comment: desc.comment, orientation: desc.orientation };
      this._docTags = this._tagsInDoc(store);
      if (!store.statementsMatching(menuNode, null, null).length) {
        this._loadError = new Error(`no #${this.source.split('#')[1]} list in the document`);
      }
    } catch (e) {
      // A 404 just means "new document" — start empty (first save creates it).
      this._items = [];
      this._meta = { label: this.source.split('#')[1] || 'plugins', comment: null, orientation: null };
      this._docTags = new Set();
    }
    this._render();
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
        help: m.help,
        params: (m.params || []).map((pv) => [pv.name, pv.value]),
        ghost: true,
      });
    }
    return out;
  }

  // Enrich an owned entry's card with its tag's manifest meta (icon / hover
  // title / description / help fill gaps).
  _withManifestMeta(item) {
    const meta = (window.ComponentInterop
      && window.ComponentInterop.manifest
      && window.ComponentInterop.manifest.meta) || {};
    const m = meta[item.tag] || {};
    return {
      ...item,
      icon: item.icon || m.icon,
      title: m.title,
      description: m.description,
      help: m.help,
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

    this._cards = document.createElement('div');
    this._cards.className = 'cards';
    this._cards.setAttribute('role', 'list');
    const plugins = this._items.filter((i) => i.type === 'component' && i.tag)
      .map((i) => this._withManifestMeta(i));
    for (const p of plugins) this._cards.appendChild(this._card(p));
    for (const g of this._ghosts()) this._cards.appendChild(this._card(g));
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
      icon.textContent = p.icon;
      top.appendChild(icon);
    }
    const label = document.createElement('span');
    label.className = 'card-label';
    label.textContent = p.name || p.tag;
    top.appendChild(label);
    if (p.help) {
      const help = document.createElement('a');
      help.className = 'card-help';
      help.href = p.help;
      help.target = '_blank';
      help.rel = 'noopener';
      help.textContent = '?';
      help.setAttribute('aria-label', `Help for ${p.name || p.tag}`);
      help.addEventListener('dragstart', (e) => e.preventDefault());
      top.appendChild(help);
    }
    const tag = document.createElement('span');
    tag.className = 'card-tag';
    tag.textContent = `<${p.tag}>`;
    card.title = p.title
      || (p.params || []).map(([k, v]) => `${k}="${v}"`).join('\n')
      || 'no default attributes';
    card.append(top, tag);
    if (p.description) {
      const desc = document.createElement('span');
      desc.className = 'card-desc';
      desc.textContent = p.description;
      card.appendChild(desc);
    }
    if (p.ghost) {
      const note = document.createElement('span');
      note.className = 'card-ghost-note';
      note.textContent = 'from manifest — drag here to adopt';
      card.appendChild(note);
    }
    card.addEventListener('dragstart', (e) => {
      card.classList.add('dragging');
      const payload = {
        label: p.name || p.tag, tag: p.tag, params: p.params || [], icon: p.icon || '',
      };
      if (!p.ghost && p.id) {
        payload.subject = `${this._docUrl()}#${p.id}`;
        payload.list = this._menuIri();
        e.dataTransfer.effectAllowed = 'copyMove';
      } else {
        e.dataTransfer.effectAllowed = 'copy';
      }
      e.dataTransfer.setData(PLUGIN_MIME, JSON.stringify(payload));
      e.dataTransfer.setData('text/plain', p.tag);
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
    input.placeholder = 'manifest URL — e.g. plugins/news/manifest.ttl';
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
      if (!p || !p.tag) return;
      if (p.subject && p.list && p.list === this._menuIri()) return; // own card
      if (p.subject && p.list && p.list.split('#')[0] === this._docUrl().split('#')[0]) {
        this._enqueue(() => this._moveHere(p));
      } else {
        // ghost card, or a card from some other document — add a copy here
        this._enqueue(() => this._addEntry({
          type: 'component', id: null,
          name: p.label || p.tag,
          icon: p.icon || undefined,
          tag: p.tag,
          params: (p.params || []).map(([k, v]) => [k, v]),
        }));
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
    const store = await loadRdfStore(docUrl, solFetch);
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
  // manifest. Dedup: an identical tag+params anywhere in the document either
  // reports where it already is, or (if it's only pantry) re-lists it here.
  async _addEntry(entry) {
    const docUrl = this._docUrl();
    let store;
    try { store = await loadRdfStore(docUrl, solFetch); }
    catch { store = rdf.graph(); }

    const existing = this._findExisting(store, docUrl, entry);
    if (existing) {
      const home = this._listsContaining(store, docUrl, existing.id);
      if (home.length) { this._note(`already listed under “${home[0]}”`, ''); return; }
      entry = existing; // pantry subject — re-list it rather than duplicate
    }
    const own = this._menuDesc(store, this._menuIri());
    if (own.items.some((it) => it.tag === entry.tag && paramsKey(it.params) === paramsKey(entry.params))) {
      this._note('already in this list', '');
      return;
    }
    own.items.push(entry);
    await this._putDoc(store, docUrl, [own], `added “${entry.name}” ✓`);
  }

  // An existing ui:Component subject in the document with the same tag and
  // the same attribute defaults, as a re-listable entry.
  _findExisting(store, docUrl, entry) {
    const doc = docUrl.split('#')[0];
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

  // Fetch + parse a plugin manifest and add it as an entry. The manifest
  // must offer `<> a ui:Component ; ui:name "tag"`; ui:label / ui:icon /
  // ui:attribute defaults flesh out the entry.
  async _importManifest(input) {
    let url;
    try { url = new URL(String(input), document.baseURI); }
    catch { throw new Error(`not a URL: ${input}`); }
    url.hash = '';
    const manifestUrl = url.href;
    const mStore = await loadRdfStore(manifestUrl, solFetch);
    const subj = rdf.sym(manifestUrl);
    const isComponent = mStore.statementsMatching(
      subj, rdf.sym(RDF + 'type'), rdf.sym(UI + 'Component'),
    ).length > 0;
    const tag = rdfVal(mStore, subj, 'name');
    if (!isComponent || !tag) {
      throw new Error(`${input} is not a plugin manifest (need <> a ui:Component with ui:name)`);
    }
    await this._addEntry({
      type: 'component', id: null,
      name: rdfVal(mStore, subj, 'label') || tag,
      icon: rdfVal(mStore, subj, 'icon') || undefined,
      tag,
      params: rdfComponent(mStore, subj).params,
    });
  }

  async _putDoc(store, docUrl, menus, flash) {
    const turtle = await rewriteMenuDocument(store, docUrl, menus);
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
