/**
 * <sol-app-builder> — build a standalone app on your pod (app-builder,
 * 2026-07-19). A built app is a pod folder holding readable artifacts:
 *
 *   app.ttl      the app node (schema:WebApplication; name, icon, ui:layout)
 *   layout.ttl   the ui:Layout tree (copied from a preset, then editable)
 *   app-menu.ttl the app's menu doc(s) the layout's from-rdf names
 *   index.html   GENERATED from the layout (core/layout-generate.js) — every
 *                element names its module / source / from-rdf visibly
 *   app.css      generated structural CSS (hand-editable)
 *
 *   <sol-app-builder apps-root="/dk-pod/apps/"
 *       catalog="…/plugins-catalog.ttl#Available"></sol-app-builder>
 *
 * Attributes:
 *   apps-root       — container the app folders live in (required). The
 *                     folder IS the registry: a child container holding an
 *                     app.ttl with a schema:WebApplication is an app.
 *   catalog         — plugin catalog (ui:Menu of ui:Plugin entries). Powers
 *                     the plugins pantry and the "Add to catalog" publish
 *                     action. Optional; without it those affordances hide.
 *   presets         — preset index doc (a ui:Menu of ui:Link entries naming
 *                     layout docs). Default: the shipped data/layouts/index.ttl.
 *   components-base — where generated pages load sol-components from.
 *                     Default /node_modules/sol-components (same-origin);
 *                     set a pinned CDN base for portable app folders.
 *
 * Wizard steps with free jump-in — the POD DOCS are the wizard state, so any
 * step runs against whatever exists: Apps (create/pick) → Layout (preset
 * cards) → Menus & plugins (embedded sol-menu-manager per menu doc + the
 * pantry, the same editors Customize uses) → Publish (generate + preview +
 * catalog entry). Renders in LIGHT DOM: the embedded managers pair with the
 * pantry via its `for` selector, which only sees the page DOM.
 *
 * All writes go through solFetch (gate token). No new RDF terms here —
 * layout vocabulary in data/ui-vocab.ttl, shapes in shapes/layout.shacl.
 */

import { define } from '../core/define.js';
import { ensureDocStyle } from '../core/adopt.js';
import { rdf } from '../core/rdf.js';
import { loadRdfStore } from '../core/rdf-utils.js';
import { rdfVal, menuMembers } from '../core/menu-rdf.js';
import { mintFragment } from '../core/menu-serialize.js';
import { solFetch } from '../core/auth-fetch.js';
import { fetchContainer } from '../core/pod-ops.js';
import {
  parseLayoutTree, generateAppHtml, generateAppCss, seedAppMenu,
} from '../core/layout-generate.js';

const freshFetch = (url, opts) => solFetch(url, { ...(opts || {}), cache: 'no-store' });

const UI     = 'http://www.w3.org/ns/ui#';
const SCHEMA = 'http://schema.org/';

const escHtml = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

const slugify = (name) =>
  String(name).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'app';

const STARTER_CONTENT = `<h1>Hello</h1>
<p>This is your app's content.html — edit it (e.g. with Live Edit in the pod
browser) to change this page.</p>
`;

const CSS = `
sol-app-builder { display: block; font-size: 1rem; }
sol-app-builder .sab-steps { display: flex; flex-wrap: wrap; gap: .5rem; margin: 0 0 1rem; }
sol-app-builder .sab-steps button {
  font-size: 1rem; padding: .4rem .9rem; border-radius: 999px;
  border: 1px solid var(--border-color, #8884); background: transparent;
  color: inherit; cursor: pointer;
}
sol-app-builder .sab-steps button[aria-current="step"] {
  background: var(--accent-color, #369); color: var(--accent-contrast, #fff);
  border-color: transparent;
}
sol-app-builder .sab-steps button:disabled { opacity: .45; cursor: default; }
sol-app-builder .sab-hint { opacity: .75; margin: .5rem 0; }
sol-app-builder .sab-error { color: #b00020; margin: .5rem 0; }
sol-app-builder .sab-cards { display: flex; flex-wrap: wrap; gap: .75rem; margin: .75rem 0; }
sol-app-builder .sab-card {
  border: 1px solid var(--border-color, #8884); border-radius: .5rem;
  padding: .75rem 1rem; min-width: 12rem; max-width: 18rem; cursor: pointer;
  background: var(--card-bg, transparent); text-align: left; font-size: 1rem; color: inherit;
}
sol-app-builder .sab-card[aria-pressed="true"] { outline: 2px solid var(--accent-color, #369); }
sol-app-builder .sab-card .sab-card-title { font-weight: 600; }
sol-app-builder .sab-card .sab-card-desc { opacity: .8; margin-top: .25rem; }
sol-app-builder form.sab-new { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; margin: .75rem 0; }
sol-app-builder input {
  font-size: 1rem; padding: .4rem .6rem; border-radius: .3rem;
  border: 1px solid var(--input-border, #8886);
  background: var(--input-bg, #eef); color: var(--input-fg, inherit);
}
sol-app-builder .sab-actions { display: flex; flex-wrap: wrap; gap: .5rem; margin: .75rem 0; }
sol-app-builder .sab-actions button, sol-app-builder form.sab-new button {
  font-size: 1rem; padding: .45rem .9rem; border-radius: .3rem;
  border: 1px solid var(--border-color, #8884); background: var(--accent-color, #369);
  color: var(--accent-contrast, #fff); cursor: pointer;
}
sol-app-builder button.sab-quiet { background: transparent; color: inherit; }
sol-app-builder .sab-preview {
  width: 100%; height: 24rem; border: 1px solid var(--border-color, #8884);
  border-radius: .5rem; margin: .75rem 0;
}
sol-app-builder .sab-files { margin: .5rem 0; padding-left: 1.25rem; }
sol-app-builder .sab-managers > * { display: block; margin: 1rem 0; }
`;

class SolAppBuilder extends HTMLElement {
  constructor() {
    super();
    this._step = 'apps';
    this._apps = null;    // [{slug, folder, name, icon}]
    this._app = null;     // the selected one
    this._presets = null; // [{label, icon, url, description}]
    this._error = null;
  }

  connectedCallback() {
    ensureDocStyle(this, 'sol-app-builder-css', CSS);
    // The heavy editors load lazily; the Menus step renders them by tag.
    import('./sol-menu-manager.js').catch(() => {});
    import('./sol-plugin-manager.js').catch(() => {});
    this.addEventListener('click', (e) => this._onClick(e));
    this.addEventListener('submit', (e) => this._onSubmit(e));
    this._load();
  }

  get appsRoot() {
    const v = this.getAttribute('apps-root') || '';
    if (!v) return null;
    const url = new URL(v, document.baseURI).href;
    return url.endsWith('/') ? url : url + '/';
  }

  get presetsUrl() {
    return new URL(
      this.getAttribute('presets') || new URL('../data/layouts/index.ttl', import.meta.url).href,
      document.baseURI,
    ).href;
  }

  get catalog() { return this.getAttribute('catalog') || null; }

  get componentsBase() {
    return this.getAttribute('components-base') || '/node_modules/sol-components';
  }

  // ── data loading ─────────────────────────────────────────────────────

  async _load() {
    this._error = null;
    await Promise.all([this._loadApps(), this._loadPresets()]);
    this._render();
  }

  // The folder IS the registry: list apps-root, keep children whose app.ttl
  // holds a schema:WebApplication.
  async _loadApps() {
    this._apps = [];
    if (!this.appsRoot) { this._error = 'Set apps-root="…" (the container app folders live in).'; return; }
    let children = [];
    try {
      children = (await fetchContainer(this.appsRoot, freshFetch)).filter((c) => c.isContainer);
    } catch {
      return; // container not there yet — created on the first app save
    }
    for (const c of children) {
      try {
        const store = await loadRdfStore(`${c.url}app.ttl`, freshFetch);
        const node = store.any(null, rdf.sym('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
          rdf.sym(SCHEMA + 'WebApplication'));
        if (!node) continue;
        this._apps.push({
          slug: c.name,
          folder: c.url,
          name: (store.any(node, rdf.sym(SCHEMA + 'name')) || {}).value || c.name,
          icon: (store.any(node, rdf.sym(UI + 'icon')) || {}).value || '',
        });
      } catch { /* not an app folder */ }
    }
  }

  async _loadPresets() {
    try {
      const store = await loadRdfStore(this.presetsUrl, freshFetch);
      const entries = menuMembers(store, rdf.sym(`${this.presetsUrl}#Presets`));
      this._presets = entries.map((e) => ({
        label: rdfVal(store, e, 'label') || e.value.split('#').pop(),
        icon: rdfVal(store, e, 'icon') || '',
        url: (store.any(e, rdf.sym(SCHEMA + 'url')) || {}).value || null,
        description: (store.any(e, rdf.sym(SCHEMA + 'description')) || {}).value || '',
      })).filter((p) => p.url);
    } catch {
      this._presets = [];
      this._error = `Couldn't load layout presets from ${this.presetsUrl}`;
    }
  }

  // ── actions ──────────────────────────────────────────────────────────

  async _createApp(name, icon) {
    const slug = slugify(name);
    const folder = `${this.appsRoot}${slug}/`;
    const probe = await freshFetch(`${folder}app.ttl`).catch(() => null);
    if (probe && probe.ok) { this._error = `An app folder "${slug}" already exists — pick it below instead.`; return; }
    const ttl = `@prefix : <#> .
@prefix ui: <http://www.w3.org/ns/ui#> .
@prefix schema: <http://schema.org/> .

:app a schema:WebApplication ;
  schema:name "${name.replace(/"/g, '\\"')}" ;${icon ? `
  ui:icon "${icon.replace(/"/g, '\\"')}" ;` : ''}
  ui:layout <layout.ttl#Layout> .
`;
    const r = await solFetch(`${folder}app.ttl`, {
      method: 'PUT', headers: { 'Content-Type': 'text/turtle' }, body: ttl,
    });
    if (!r.ok) { this._error = `Couldn't create ${folder}app.ttl — ${r.status}`; return; }
    this._app = { slug, folder, name, icon };
    await this._loadApps();
    this._step = 'layout';
    this._render();
  }

  async _pickPreset(preset) {
    const app = this._app;
    if (!app) return;
    const res = await freshFetch(new URL(preset.url, this.presetsUrl).href);
    if (!res.ok) { this._error = `Couldn't load preset ${preset.label}`; this._render(); return; }
    const layoutUrl = `${app.folder}layout.ttl`;
    const existing = await freshFetch(layoutUrl).catch(() => null);
    if (existing && existing.ok &&
        !window.confirm(`Replace this app's existing layout with "${preset.label}"?`)) return;
    const text = await res.text();
    const put = await solFetch(layoutUrl, {
      method: 'PUT', headers: { 'Content-Type': 'text/turtle' }, body: text,
    });
    if (!put.ok) { this._error = `Couldn't save layout.ttl — ${put.status}`; this._render(); return; }
    await this._seedLayoutDocs(layoutUrl);
    this._app.preset = preset.label;
    this._render();
  }

  // Seed the docs the layout consumes and doesn't have yet: each from-rdf
  // menu doc (orientation by consumer — a sidebar sol-menu stacks, a
  // sol-tabs bar runs across) and any content.html a sol-include names.
  async _seedLayoutDocs(layoutUrl) {
    const store = await loadRdfStore(layoutUrl, freshFetch);
    const tree = parseLayoutTree(store, rdf.sym(`${layoutUrl}#Layout`));
    const leaves = [];
    (function walk(n) {
      if (n.kind === 'leaf') leaves.push(n);
      else n.parts.forEach(walk);
    })(tree);
    for (const leaf of leaves) {
      const params = new Map(leaf.item.params);
      const fromRdf = params.get('from-rdf');
      if (fromRdf) {
        const docUrl = new URL(fromRdf.split('#')[0], layoutUrl).href;
        const fragment = fromRdf.split('#')[1] || 'Tabs';
        const there = await freshFetch(docUrl).catch(() => null);
        if (!there || !there.ok) {
          await solFetch(docUrl, {
            method: 'PUT', headers: { 'Content-Type': 'text/turtle' },
            body: seedAppMenu({
              label: fragment, fragment,
              orientation: leaf.item.tag === 'sol-menu' ? 'Vertical' : 'Horizontal',
            }),
          });
        }
      }
      const src = params.get('source');
      if (src && /\.html?$/.test(src) && leaf.item.tag === 'sol-include') {
        const docUrl = new URL(src, layoutUrl).href;
        const there = await freshFetch(docUrl).catch(() => null);
        if (!there || !there.ok) {
          await solFetch(docUrl, {
            method: 'PUT', headers: { 'Content-Type': 'text/html' }, body: STARTER_CONTENT,
          });
        }
      }
    }
  }

  async _generate() {
    const app = this._app;
    if (!app) return;
    this._error = null;
    try {
      const layoutUrl = `${app.folder}layout.ttl`;
      const store = await loadRdfStore(layoutUrl, freshFetch);
      const html = generateAppHtml({
        store,
        layoutNode: rdf.sym(`${layoutUrl}#Layout`),
        app: { title: app.name, icon: app.icon },
        componentsBase: this.componentsBase,
      });
      const css = generateAppCss(store, rdf.sym(`${layoutUrl}#Layout`));
      for (const [name, body, type] of [
        ['index.html', html, 'text/html'],
        ['app.css', css, 'text/css'],
      ]) {
        const r = await solFetch(app.folder + name, {
          method: 'PUT', headers: { 'Content-Type': type }, body,
        });
        if (!r.ok) throw new Error(`${name} — ${r.status}`);
      }
      this._app.generated = true;
    } catch (e) {
      this._error = `Generate failed: ${e.message}`;
    }
    this._render();
  }

  // Publish = one ui:Plugin entry (kind ui:Link) appended to the catalog
  // doc — catalog only, the owner places it via Customize (no menu write).
  async _register() {
    const app = this._app;
    if (!app || !this.catalog) return;
    this._error = null;
    const catDoc = new URL(this.catalog.split('#')[0], document.baseURI).href;
    const indexUrl = `${app.folder}index.html`;
    try {
      const store = await loadRdfStore(catDoc, freshFetch);
      const already = store.each(null, rdf.sym(SCHEMA + 'url'), rdf.sym(indexUrl));
      if (already.length) { this._error = 'Already in the catalog.'; this._render(); return; }
      const taken = new Set(
        (store.statements || [])
          .map((s) => (String(s.subject.value).startsWith(catDoc + '#')
            ? s.subject.value.split('#')[1] : ''))
          .filter(Boolean),
      );
      const frag = mintFragment(app.name, taken);
      const entryTurtle = `
<${catDoc}#${frag}> a <${UI}Plugin> ;
  <${SCHEMA}additionalType> <${UI}Link> ;
  <${UI}label> "${app.name.replace(/"/g, '\\"')}" ;${app.icon ? `
  <${UI}icon> "${app.icon.replace(/"/g, '\\"')}" ;` : ''}
  <${SCHEMA}url> <${indexUrl}> ;
  <${SCHEMA}description> "Built with the app builder." ;
  <http://purl.org/dc/terms/subject> "My Apps" .
`;
      const r = await solFetch(catDoc, {
        method: 'PATCH', headers: { 'Content-Type': 'application/sparql-update' },
        body: `INSERT DATA {${entryTurtle}}`,
      });
      if (!r.ok) {
        // CSS's lock can expire mid-PATCH on a large doc (500 "Lock
        // expired") — same failure sol-form works around: fall back to
        // appending the entry (full IRIs, prefix-independent) and PUTting
        // the whole document back.
        const cur = await freshFetch(catDoc);
        if (!cur.ok) throw new Error(`PATCH ${r.status}, re-read ${cur.status}`);
        const put = await solFetch(catDoc, {
          method: 'PUT', headers: { 'Content-Type': 'text/turtle' },
          body: (await cur.text()) + entryTurtle,
        });
        if (!put.ok) throw new Error(`PATCH ${r.status}, PUT ${put.status}`);
      }
      this._app.registered = true;
    } catch (e) {
      this._error = `Couldn't add to the catalog: ${e.message}`;
    }
    this._render();
  }

  // ── events ───────────────────────────────────────────────────────────

  _onClick(e) {
    const step = e.target.closest('[data-step]');
    if (step && !step.disabled) { this._step = step.dataset.step; this._render(); return; }
    const app = e.target.closest('[data-app]');
    if (app) {
      this._app = this._apps.find((a) => a.slug === app.dataset.app) || null;
      this._step = 'layout';
      this._render();
      return;
    }
    const preset = e.target.closest('[data-preset]');
    if (preset) {
      const p = this._presets.find((x) => x.url === preset.dataset.preset);
      if (p) this._pickPreset(p);
      return;
    }
    const action = e.target.closest('[data-action]');
    if (action) {
      if (action.dataset.action === 'generate') this._generate();
      if (action.dataset.action === 'register') this._register();
      if (action.dataset.action === 'reload') this._load();
    }
  }

  _onSubmit(e) {
    if (!e.target.classList.contains('sab-new')) return;
    e.preventDefault();
    const name = e.target.querySelector('[name=app-name]')?.value?.trim();
    const icon = e.target.querySelector('[name=app-icon]')?.value?.trim() || '';
    if (name) this._createApp(name, icon);
  }

  // ── rendering ────────────────────────────────────────────────────────

  _render() {
    const app = this._app;
    const steps = [
      ['apps', 'Apps'],
      ['layout', 'Layout'],
      ['menus', 'Menus & plugins'],
      ['publish', 'Publish'],
    ];
    let html = `<nav class="sab-steps" aria-label="Builder steps">`;
    for (const [id, label] of steps) {
      const needsApp = id !== 'apps';
      html += `<button type="button" data-step="${id}"
        ${this._step === id ? 'aria-current="step"' : ''}
        ${needsApp && !app ? 'disabled' : ''}>${escHtml(label)}</button>`;
    }
    html += `</nav>`;
    if (app) {
      html += `<p class="sab-hint">App: <strong>${escHtml(app.icon ? app.icon + ' ' : '')}${escHtml(app.name)}</strong>
        — <a href="${escHtml(app.folder)}" target="_blank" rel="noopener">${escHtml(app.folder)}</a></p>`;
    }
    if (this._error) html += `<p class="sab-error">${escHtml(this._error)}</p>`;
    html += this[`_render_${this._step}`]?.() || '';
    this.innerHTML = html;
  }

  _render_apps() {
    let html = `<h3>Create an app</h3>
<form class="sab-new">
  <input name="app-name" placeholder="App name" required aria-label="App name">
  <input name="app-icon" placeholder="Icon (emoji or URL)" size="14" aria-label="Icon">
  <button type="submit">Create</button>
</form>`;
    html += `<h3>Or pick an existing one</h3>`;
    if (this._apps === null) html += `<p class="sab-hint">Loading…</p>`;
    else if (!this._apps.length) html += `<p class="sab-hint">No apps yet under ${escHtml(this.appsRoot || '?')}.</p>`;
    else {
      html += `<div class="sab-cards">`;
      for (const a of this._apps) {
        html += `<button type="button" class="sab-card" data-app="${escHtml(a.slug)}"
          ${this._app && this._app.slug === a.slug ? 'aria-pressed="true"' : ''}>
          <div class="sab-card-title">${escHtml(a.icon ? a.icon + ' ' : '')}${escHtml(a.name)}</div>
          <div class="sab-card-desc">${escHtml(a.slug)}/</div></button>`;
      }
      html += `</div>`;
    }
    html += `<div class="sab-actions"><button type="button" class="sab-quiet" data-action="reload">Reload list</button></div>`;
    return html;
  }

  _render_layout() {
    let html = `<h3>Pick a layout</h3>`;
    if (this._app?.preset) html += `<p class="sab-hint">Current layout: ${escHtml(this._app.preset)} (saved as layout.ttl — pick another to replace it).</p>`;
    if (!this._presets) html += `<p class="sab-hint">Loading presets…</p>`;
    else {
      html += `<div class="sab-cards">`;
      for (const p of this._presets) {
        html += `<button type="button" class="sab-card" data-preset="${escHtml(p.url)}">
          <div class="sab-card-title">${escHtml(p.icon ? p.icon + ' ' : '')}${escHtml(p.label)}</div>
          <div class="sab-card-desc">${escHtml(p.description)}</div></button>`;
      }
      html += `</div>`;
    }
    html += `<p class="sab-hint">Picking a preset copies it to your app as layout.ttl and seeds the
      menu / content docs it names. The layout file itself is plain Turtle — editable any time.</p>`;
    return html;
  }

  _render_menus() {
    const app = this._app;
    if (!app) return '';
    // The layout's menu docs are discovered at render: one manager per doc.
    // Rendered async into the placeholder (light DOM, so the pantry's `for`
    // selector below can see the managers).
    queueMicrotask(() => this._mountManagers());
    let html = `<h3>Menus & plugins</h3>
<div class="sab-managers" id="sab-managers"><p class="sab-hint">Loading the app's menus…</p></div>`;
    if (this.catalog) {
      html += `<sol-plugin-manager grouped source="${escHtml(this.catalog)}"
        for="#sab-managers sol-menu-manager"></sol-plugin-manager>`;
    } else {
      html += `<p class="sab-hint">No catalog attribute set — plugin cards unavailable; menus are still editable above.</p>`;
    }
    return html;
  }

  async _mountManagers() {
    const box = this.querySelector('#sab-managers');
    const app = this._app;
    if (!box || !app) return;
    try {
      const layoutUrl = `${app.folder}layout.ttl`;
      const store = await loadRdfStore(layoutUrl, freshFetch);
      const tree = parseLayoutTree(store, rdf.sym(`${layoutUrl}#Layout`));
      const sources = [];
      (function walk(n) {
        if (n.kind === 'leaf') {
          const v = new Map(n.item.params).get('from-rdf');
          if (v) sources.push(v);
        } else n.parts.forEach(walk);
      })(tree);
      if (!sources.length) {
        box.innerHTML = `<p class="sab-hint">This layout has no menu regions — nothing to edit here.</p>`;
        return;
      }
      box.innerHTML = '';
      for (const src of [...new Set(sources)]) {
        const el = document.createElement('sol-menu-manager');
        el.setAttribute('source', new URL(src, layoutUrl).href);
        el.setAttribute('heading', `Menu: ${src.split('#')[1] || src}`);
        if (this.catalog) el.setAttribute('catalog', this.catalog);
        box.appendChild(el);
      }
    } catch {
      box.innerHTML = `<p class="sab-hint">No layout yet — pick one on the Layout step first.</p>`;
    }
  }

  _render_publish() {
    const app = this._app;
    if (!app) return '';
    const indexUrl = `${app.folder}index.html`;
    let html = `<h3>Publish</h3>
<p class="sab-hint">Generate writes the readable page artifacts from layout.ttl. Menus stay live
  (the page reads them via from-rdf) — regenerate only after a layout change.</p>
<div class="sab-actions">
  <button type="button" data-action="generate">${app.generated ? 'Regenerate' : 'Generate'} index.html + app.css</button>`;
    if (this.catalog) {
      html += `<button type="button" data-action="register" ${app.generated || app.registered ? '' : 'disabled'}>
        ${app.registered ? 'Added to catalog ✓' : 'Add to the plugin catalog'}</button>`;
    }
    html += `</div>`;
    if (app.generated) {
      html += `<ul class="sab-files">
  <li><a href="${escHtml(indexUrl)}" target="_blank" rel="noopener">index.html</a> — open the app standalone</li>
  <li><a href="${escHtml(app.folder)}app.css" target="_blank" rel="noopener">app.css</a></li>
  <li><a href="${escHtml(app.folder)}layout.ttl" target="_blank" rel="noopener">layout.ttl</a></li>
</ul>
<iframe class="sab-preview" src="${escHtml(indexUrl)}" title="Preview of ${escHtml(app.name)}"></iframe>`;
    }
    return html;
  }
}

define('sol-app-builder', SolAppBuilder);
export { SolAppBuilder };
export default SolAppBuilder;
