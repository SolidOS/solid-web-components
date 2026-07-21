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
 * step runs against whatever exists:
 *   1. Create/Choose App    — create or pick an app folder
 *   2. Select Layout        — a VISUAL choice among structural arrangements
 *                             (cards show a schematic derived from each
 *                             preset's actual RDF); picking copies the
 *                             layout WITH its theme chrome (banner ☰,
 *                             sidebar menu, content include)
 *   3. Add Menus and Content— every region of the layout with its elements
 *                             in place (theme chrome included, removable
 *                             like anything else); add a menu / tabs / page
 *                             content / widgets per region; menus expand to
 *                             the same sol-menu-manager Customize uses.
 *                             Saves rewrite layout.ttl via
 *                             core/layout-serialize.js.
 *   4. Add Plugins          — the catalog pantry beside the app's menu
 *                             managers (drag/add plugin cards into menus)
 *   5. Publish              — generate + preview + catalog entry
 * Renders in LIGHT DOM: the embedded managers pair with the
 * pantry via its `for` selector, which only sees the page DOM.
 *
 * All writes go through solFetch (gate token). No new RDF terms here —
 * layout vocabulary in data/ui-vocab.ttl, shapes in shapes/layout.shacl.
 */

import { define } from '../core/define.js';
import { ensureDocStyle } from '../core/adopt.js';
import { rdf } from '../core/rdf.js';
import { loadRdfStore } from '../core/rdf-utils.js';
import { rdfVal, menuMembers, rdfComponent } from '../core/menu-rdf.js';
import { mintFragment } from '../core/menu-serialize.js';
import { solFetch } from '../core/auth-fetch.js';
import { fetchContainer } from '../core/pod-ops.js';
import {
  parseLayoutTree, generateAppHtml, generateAppCss, seedAppMenu,
} from '../core/layout-generate.js';
import {
  serializeLayout, addLeaf, removeLeaf, moveLeaf,
} from '../core/layout-serialize.js';

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

const STARTER_FOOTER = `<p>Built with the Solid App Builder.</p>
`;

// help.html is opened as a PAGE (the ☰ Help link), so it's a whole document.
const starterHelp = (componentsBase) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Help</title>
  <link rel="stylesheet" href="${componentsBase}/web/styles/root.css">
  <style>
    html { background: var(--bg); color: var(--text); }
    body { font-family: var(--font-ui); font-size: var(--font-size);
           margin: 1rem auto; max-width: 60rem; padding: 0 1rem; }
  </style>
</head>
<body>
<h1>Help</h1>
<p>This is your app's help page — edit help.html to describe your app.</p>
<p><a href="index.html">← Back to the app</a></p>
</body>
</html>
`;

// The theme chrome's ☰ menu — Help plus the two standard appearance
// commands (implemented by web/scripts/app-commands.js, which
// layout-generate emits in every generated head).
const MORE_MENU_TTL = `@prefix : <#> .
@prefix ui: <http://www.w3.org/ns/ui#> .
@prefix schema: <http://schema.org/> .

# The app's ☰ menu — edit via the builder (or any sol-menu-manager).
:More a ui:Menu ;
  ui:label "☰" ;
  ui:orientation ui:Vertical ;
  schema:itemListElement :More-Help, :More-Theme, :More-Text-size .

:Help a ui:Link ;
  ui:label "Help" ;
  schema:url "help.html" .

:Theme a ui:Command ;
  ui:label "Theme" ;
  schema:url <app-commands.ttl#toggleTheme> .

:Text-size a ui:Command ;
  ui:label "Text size" ;
  schema:url <app-commands.ttl#cycleFontSize> .

:More-Help a schema:ListItem; schema:item :Help; schema:position 1.
:More-Theme a schema:ListItem; schema:item :Theme; schema:position 2.
:More-Text-size a schema:ListItem; schema:item :Text-size; schema:position 3.
`;

// The app's command registry document — a ui:Command menu item's schema:url
// names a fragment here; the fragment is the registry key.
const APP_COMMANDS_TTL = `@prefix : <#> .
@prefix ui: <http://www.w3.org/ns/ui#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

# The app's command registry. Implementations live in sol-components
# web/scripts/app-commands.js (emitted in the generated head); a command
# with no implementation is a no-op.
:toggleTheme a ui:Command ;
  rdfs:comment "Cycle the app between light and dark theme." .
:cycleFontSize a ui:Command ;
  rdfs:comment "Cycle the app text size (16 / 20 / 24 px)." .
`;

// The Add-element palette's built-in entries (beyond menu/tabs/content,
// which need per-app seeding): plain widgets with no params — exactly the
// spellings the shipped presets use.
const WIDGETS = [
  { kind: 'login', label: 'Sign in', module: 'web/sol-login.js' },
  { kind: 'clock', label: 'Clock', module: 'web/sol-time.js' },
  { kind: 'calendar', label: 'Calendar', module: 'web/sol-calendar.js' },
];

const CSS = `
sol-app-builder { display: block; font-size: 1rem; }
sol-app-builder .sab-steps { display: flex; flex-wrap: wrap; gap: .5rem; margin: 0 0 1rem; }
sol-app-builder .sab-steps button {
  font-size: 1rem; padding: .4rem .9rem; border-radius: 999px;
  border: 1px solid var(--border, #9e9e9e); background: transparent;
  color: inherit; cursor: pointer;
}
sol-app-builder .sab-steps button[aria-current="step"] {
  background: var(--accent, #1F618D); color: #fff;
  border-color: transparent;
}
sol-app-builder .sab-steps button:disabled {
  color: var(--text-muted, #4d4d4d); cursor: default;
}
sol-app-builder .sab-hint { color: var(--text-muted, #4d4d4d); margin: .5rem 0; }
sol-app-builder .sab-error { color: #b00020; margin: .5rem 0; }
sol-app-builder .sab-cards { display: flex; flex-wrap: wrap; gap: .75rem; margin: .75rem 0; }
sol-app-builder .sab-card {
  border: 1px solid var(--border, #9e9e9e); border-radius: .5rem;
  padding: .75rem 1rem; min-width: 12rem; max-width: 18rem; cursor: pointer;
  background: var(--surface, #fff); text-align: left; font-size: 1rem;
  color: var(--text, #000);
}
sol-app-builder .sab-card[aria-pressed="true"] { outline: 2px solid var(--accent, #1F618D); }
sol-app-builder .sab-card .sab-card-title { font-weight: 600; }
sol-app-builder .sab-card .sab-card-desc {
  color: var(--text-muted, #4d4d4d); margin-top: .25rem;
}
sol-app-builder form.sab-new { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; margin: .75rem 0; }
sol-app-builder input {
  font-size: 1rem; padding: .4rem .6rem; border-radius: .3rem;
  border: 1px solid var(--input-border, #9aa0a8);
  background: var(--input-bg, #eef); color: var(--input-text, #1a1a1a);
}
sol-app-builder .sab-actions { display: flex; flex-wrap: wrap; gap: .5rem; margin: .75rem 0; }
sol-app-builder .sab-actions button, sol-app-builder form.sab-new button {
  font-size: 1rem; padding: .45rem .9rem; border-radius: .3rem;
  border: 1px solid transparent; background: var(--accent, #1F618D);
  color: #fff; cursor: pointer;
}
sol-app-builder button.sab-quiet {
  background: transparent; color: inherit; border-color: var(--border, #9e9e9e);
}
sol-app-builder .sab-preview {
  width: 100%; height: 24rem; border: 1px solid var(--border, #9e9e9e);
  border-radius: .5rem; margin: .75rem 0;
}
sol-app-builder .sab-files { margin: .5rem 0; padding-left: 1.25rem; }
sol-app-builder .sab-managers > * { display: block; margin: 1rem 0; }
/* Layout schematic — a mini block diagram derived from the preset's RDF
   (decorative; the card's title/description carry the accessible text). */
sol-app-builder .sab-schem {
  display: flex; height: 5.5rem; margin-bottom: .6rem;
  border: 1px solid var(--border, #9e9e9e); border-radius: .3rem;
  background: var(--bg, #f5f5f5); padding: .25rem; gap: .25rem;
}
sol-app-builder .sab-schem-r {
  display: flex; flex: 1 1 auto; min-width: 0; min-height: 0; gap: .25rem;
  border: 1px solid var(--border, #9e9e9e); border-radius: .2rem;
  background: var(--surface, #fff); padding: .2rem;
  font-size: .7rem; color: var(--text-muted, #4d4d4d);
  overflow: hidden; justify-content: center; align-items: center;
}
sol-app-builder .sab-schem-r.col { flex-direction: column; }
/* A wrapper region (nested regions inside) stretches its children so
   sidebar and main fill the same height. */
sol-app-builder .sab-schem:has(.sab-schem-r) { align-items: stretch; }
sol-app-builder .sab-schem-r:has(.sab-schem-r) { align-items: stretch; }
sol-app-builder .sab-schem-r.aside-r { flex: 0 0 26%; }
sol-app-builder .sab-schem-r.bar-r { flex: 0 0 1.4rem; }
sol-app-builder .sab-schem-el {
  flex: 0 0 auto; width: .9rem; height: .6rem; border-radius: .15rem;
  background: var(--accent, #1F618D); opacity: .55;
}
/* Region panels (the Add Menus and Content step). */
sol-app-builder .sab-region {
  border: 1px solid var(--border, #9e9e9e); border-radius: .5rem;
  padding: .6rem .8rem; margin: .75rem 0; background: var(--surface, #fff);
  color: var(--text, #000);
}
sol-app-builder .sab-region .sab-region { background: var(--bg, #f5f5f5); }
sol-app-builder .sab-region .sab-region .sab-region { background: var(--surface, #fff); }
sol-app-builder .sab-region-head {
  display: flex; align-items: center; gap: .5rem; margin-bottom: .25rem;
}
sol-app-builder .sab-badge {
  font-size: 1rem; color: var(--text-muted, #4d4d4d);
  border: 1px solid var(--border, #9e9e9e); border-radius: 999px;
  padding: 0 .6rem;
}
sol-app-builder .sab-el {
  display: flex; align-items: center; flex-wrap: wrap; gap: .5rem;
  padding: .35rem 0; border-top: 1px solid var(--border, #9e9e9e);
}
sol-app-builder .sab-el-name { flex: 1 1 auto; min-width: 12rem; }
sol-app-builder .sab-el-name code { font-family: var(--font-mono, monospace); font-size: 1rem; }
sol-app-builder .sab-el-params { color: var(--text-muted, #4d4d4d); }
sol-app-builder .sab-el button, sol-app-builder .sab-add button {
  font-size: 1rem; padding: .25rem .7rem; border-radius: .3rem;
  border: 1px solid var(--border, #9e9e9e); background: transparent;
  color: inherit; cursor: pointer;
}
sol-app-builder .sab-add { margin-top: .5rem; }
sol-app-builder .sab-add summary { cursor: pointer; font-size: 1rem; }
sol-app-builder .sab-add-body {
  display: flex; flex-wrap: wrap; gap: .5rem; align-items: center;
  padding: .5rem 0 .25rem;
}
sol-app-builder .sab-add select {
  font-size: 1rem; padding: .25rem .4rem; border-radius: .3rem;
  border: 1px solid var(--input-border, #9aa0a8);
  background: var(--input-bg, #eef); color: var(--input-text, #1a1a1a);
}
sol-app-builder .sab-el sol-menu-manager { flex: 1 1 100%; }
/* Dark theme: the dark --accent (#4dabf7) is light — white-on-accent and
   dark-red error text would both fail contrast there. */
[data-theme="dark"] sol-app-builder .sab-steps button[aria-current="step"],
[data-theme="dark"] sol-app-builder .sab-actions button,
[data-theme="dark"] sol-app-builder form.sab-new button {
  color: #0f1115;
}
[data-theme="dark"] sol-app-builder button.sab-quiet { color: inherit; }
[data-theme="dark"] sol-app-builder .sab-error { color: #ff8a80; }
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
      // Each card's schematic derives from the preset's ACTUAL RDF — fetch
      // and parse every layout doc (tolerating individual failures: a card
      // without a tree falls back to its text form).
      await Promise.all(this._presets.map(async (p) => {
        try {
          const docUrl = new URL(p.url, this.presetsUrl).href;
          const pstore = await loadRdfStore(docUrl, freshFetch);
          p.tree = parseLayoutTree(pstore, rdf.sym(`${docUrl}#Layout`));
        } catch { p.tree = null; }
      }));
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
    this._step = 'elements';   // WordPress flow: layout chosen → place elements
    this._render();
  }

  // Seed the docs the layout consumes and doesn't have yet — called for the
  // whole tree on preset pick (theme chrome) and for the single new leaf on
  // element add.
  async _seedLayoutDocs(layoutUrl) {
    const store = await loadRdfStore(layoutUrl, freshFetch);
    const tree = parseLayoutTree(store, rdf.sym(`${layoutUrl}#Layout`));
    const leaves = [];
    (function walk(n) {
      if (n.kind === 'leaf') leaves.push(n);
      else n.parts.forEach(walk);
    })(tree);
    for (const leaf of leaves) await this._seedDocsForLeaf(leaf, layoutUrl);
  }

  // One leaf's consumed docs: its from-rdf menu fragment (orientation by
  // consumer — a sidebar sol-menu / dropdown stacks, a sol-tabs bar runs
  // across; the theme's #More fragment seeds with Help + the standard
  // appearance commands, plus the command registry doc and help.html), and
  // any *.html a sol-include names.
  async _seedDocsForLeaf(leaf, layoutUrl) {
    const params = new Map(leaf.item.params);
    const fromRdf = params.get('from-rdf');
    if (fromRdf) {
      const docUrl = new URL(fromRdf.split('#')[0], layoutUrl).href;
      const fragment = fromRdf.split('#')[1] || 'Tabs';
      if (fragment === 'More') {
        await this._ensureMenuFragment(docUrl, fragment, MORE_MENU_TTL);
        await this._seedIfAbsent(new URL('app-commands.ttl', layoutUrl).href,
          APP_COMMANDS_TTL, 'text/turtle');
        await this._seedIfAbsent(new URL('help.html', layoutUrl).href,
          starterHelp(this.componentsBase), 'text/html');
      } else {
        const vertical = leaf.item.tag === 'sol-menu' || leaf.item.tag === 'sol-dropdown-button';
        await this._ensureMenuFragment(docUrl, fragment, seedAppMenu({
          label: fragment, fragment,
          orientation: vertical ? 'Vertical' : 'Horizontal',
        }));
      }
    }
    const src = params.get('source');
    if (src && /\.html?$/.test(src) && leaf.item.tag === 'sol-include') {
      await this._seedIfAbsent(new URL(src, layoutUrl).href,
        src === 'footer.html' ? STARTER_FOOTER : STARTER_CONTENT, 'text/html');
    }
  }

  async _seedIfAbsent(url, body, type) {
    const there = await freshFetch(url).catch(() => null);
    if (there && there.ok) return;
    await solFetch(url, { method: 'PUT', headers: { 'Content-Type': type }, body });
  }

  // A menu DOC can hold several menu fragments (app-menu.ttl#Menu and
  // #More): create the doc when absent, APPEND the fragment's block when the
  // doc exists without it (Turtle allows re-declaring prefixes mid-doc).
  async _ensureMenuFragment(docUrl, fragment, block) {
    const there = await freshFetch(docUrl).catch(() => null);
    if (!there || !there.ok) {
      await solFetch(docUrl, { method: 'PUT', headers: { 'Content-Type': 'text/turtle' }, body: block });
      return;
    }
    const text = await there.text();
    if (text.includes(`:${fragment} a ui:Menu`) || text.includes(`#${fragment}>`)) return;
    await solFetch(docUrl, {
      method: 'PUT', headers: { 'Content-Type': 'text/turtle' },
      body: `${text}\n${block}`,
    });
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
    const add = e.target.closest('[data-add]');
    if (add) { this._addElement(add); return; }
    const elAction = e.target.closest('[data-el-action]');
    if (elAction) { this._elementAction(elAction); return; }
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
      ['apps', '1. Create/Choose App'],
      ['layout', '2. Select Layout'],
      ['elements', '3. Add Menus and Content'],
      ['plugins', '4. Add Plugins'],
      ['publish', '5. Publish'],
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

  // A mini block diagram derived from the preset's parsed tree — regions
  // become nested boxes (labels included), leaves become chips. Decorative:
  // the card's title/description carry the accessible text.
  _schematicHtml(tree) {
    const box = (r) => {
      const cls = ['sab-schem-r'];
      if (r.columns || r.orientation === 'horizontal') { /* row is default */ } else cls.push('col');
      if (r.semantic === 'aside') cls.push('aside-r');
      if (r.semantic === 'header' || r.semantic === 'nav' || r.semantic === 'footer') cls.push('bar-r');
      const inner = r.parts.map((p) => (p.kind === 'region' ? box(p) : `<div class="sab-schem-el"></div>`)).join('');
      // A wrapper region (only nested regions inside) shows no label of its
      // own — its children label themselves.
      const showLabel = r.label && !r.parts.some((p) => p.kind === 'region');
      const label = showLabel ? `<span>${escHtml(r.label)}</span>` : '';
      return `<div class="${cls.join(' ')}">${label}${inner}</div>`;
    };
    const rootCls = tree.orientation === 'horizontal' ? '' : ' style="flex-direction:column"';
    const inner = tree.parts.map((p) => (p.kind === 'region' ? box(p) : `<div class="sab-schem-el"></div>`)).join('');
    return `<div class="sab-schem" aria-hidden="true"${rootCls}>${inner}</div>`;
  }

  _render_layout() {
    let html = `<h3>Select a layout</h3>`;
    if (this._app?.preset) html += `<p class="sab-hint">Current layout: ${escHtml(this._app.preset)} (saved as layout.ttl — pick another to replace it).</p>`;
    if (!this._presets) html += `<p class="sab-hint">Loading presets…</p>`;
    else {
      html += `<div class="sab-cards">`;
      for (const p of this._presets) {
        html += `<button type="button" class="sab-card" data-preset="${escHtml(p.url)}"
          ${this._app?.preset === p.label ? 'aria-pressed="true"' : ''}>
          ${p.tree ? this._schematicHtml(p.tree) : ''}
          <div class="sab-card-title">${escHtml(p.icon ? p.icon + ' ' : '')}${escHtml(p.label)}</div>
          <div class="sab-card-desc">${escHtml(p.description)}</div></button>`;
      }
      html += `</div>`;
    }
    html += `<p class="sab-hint">Picking a layout copies it to your app as layout.ttl — complete with its
      theme chrome (banner ☰ menu, sidebar menu, content) — and seeds the menu / content docs it
      names. Every piece is removable on the next step; the layout file itself is plain Turtle.</p>`;
    return html;
  }

  // ── step 3: Add Menus and Content (the layout's regions + elements) ───

  _render_elements() {
    const app = this._app;
    if (!app) return '';
    queueMicrotask(() => this._mountElements());
    return `<h3>Add menus and content</h3>
<p class="sab-hint">Every region of the layout, with its elements in place — the theme's own
  chrome included. Remove or reorder anything; add a menu, tabs, page content, or a widget
  per region. A menu's contents expand in place for editing.</p>
<div id="sab-elements"><p class="sab-hint">Loading the layout…</p></div>`;
  }

  async _mountElements() {
    const box = this.querySelector('#sab-elements');
    const app = this._app;
    if (!box || !app) return;
    try {
      this._layoutUrl = `${app.folder}layout.ttl`;
      const store = await loadRdfStore(this._layoutUrl, freshFetch);
      this._tree = parseLayoutTree(store, rdf.sym(`${this._layoutUrl}#Layout`));
      await this._loadCatalogComponents();
      box.innerHTML = this._regionPanelHtml(this._tree);
    } catch {
      box.innerHTML = `<p class="sab-hint">No layout yet — pick one on the Select Layout step first.</p>`;
    }
  }

  // Catalog entries of kind ui:Component become palette chips (same payload
  // shape the pantry drags: label / module / params / icon).
  async _loadCatalogComponents() {
    this._catalogComponents = [];
    if (!this.catalog) return;
    try {
      const catDoc = new URL(this.catalog.split('#')[0], document.baseURI).href;
      const store = await loadRdfStore(catDoc, freshFetch);
      for (const e of menuMembers(store, rdf.sym(new URL(this.catalog, document.baseURI).href))) {
        const kind = (store.any(e, rdf.sym(SCHEMA + 'additionalType')) || {}).value;
        if (kind !== UI + 'Component') continue;
        const module = (store.any(e, rdf.sym(SCHEMA + 'url')) || {}).value;
        if (!module) continue;
        const { params } = rdfComponent(store, e);
        this._catalogComponents.push({
          label: rdfVal(store, e, 'label') || module.split('/').pop(),
          icon: rdfVal(store, e, 'icon') || '',
          module, params,
        });
      }
    } catch { /* palette simply omits catalog chips */ }
  }

  // Empty class-bearing regions — the panes a menu can open items into
  // (the sidebar preset's `region=".app-main"` pattern).
  _paneTargets() {
    const out = [];
    (function walk(r) {
      if (r.kind !== 'region') return;
      const cls = new Map(r.params).get('class');
      if (cls && !r.parts.length) out.push({ selector: `.${cls.split(/\s+/)[0]}`, label: r.label || cls });
      r.parts.forEach(walk);
    })(this._tree);
    return out;
  }

  _regionPanelHtml(region) {
    const iri = region.node.value;
    const badge = region.semantic
      ? `<span class="sab-badge">${escHtml(region.semantic)}</span>` : '';
    let html = `<div class="sab-region" data-region="${escHtml(iri)}">
      <div class="sab-region-head"><strong>${escHtml(region.label || 'Region')}</strong>${badge}</div>`;
    if (region.comment) html += `<p class="sab-hint">${escHtml(region.comment)}</p>`;
    for (const part of region.parts) {
      if (part.kind === 'leaf') html += this._elementRowHtml(part);
      else html += this._regionPanelHtml(part);
    }
    html += this._paletteHtml();
    html += `</div>`;
    return html;
  }

  _elementRowHtml(leaf) {
    const params = new Map(leaf.item.params);
    const fromRdf = params.get('from-rdf');
    const src = params.get('source');
    const detail = fromRdf ? `from-rdf ${fromRdf}` : src ? `source ${src}` : '';
    return `<div class="sab-el" data-node="${escHtml(leaf.node.value)}"
      ${fromRdf ? `data-menu-src="${escHtml(fromRdf)}"` : ''}>
      <span class="sab-el-name">${escHtml(leaf.item.name || leaf.item.tag || '?')}
        <code>${escHtml(leaf.item.tag || '')}</code>
        ${detail ? `<span class="sab-el-params">${escHtml(detail)}</span>` : ''}</span>
      <button type="button" data-el-action="up" aria-label="Move up">↑</button>
      <button type="button" data-el-action="down" aria-label="Move down">↓</button>
      ${fromRdf ? `<button type="button" data-el-action="edit">Edit menu</button>` : ''}
      <button type="button" data-el-action="remove">Remove</button>
    </div>`;
  }

  _paletteHtml() {
    const targets = this._paneTargets();
    let html = `<details class="sab-add"><summary>Add element…</summary><div class="sab-add-body">
      <button type="button" data-add="menu">Menu</button>`;
    if (targets.length) {
      html += `<label>items open into
        <select class="sab-menu-target">
          <option value="">(this menu's own popups)</option>
          ${targets.map((t) => `<option value="${escHtml(t.selector)}">${escHtml(t.label)}</option>`).join('')}
        </select></label>`;
    }
    html += `<button type="button" data-add="tabs">Tabs</button>
      <button type="button" data-add="content">Page content</button>`;
    for (const w of WIDGETS) {
      html += `<button type="button" data-add="${w.kind}">${escHtml(w.label)}</button>`;
    }
    for (const c of this._catalogComponents || []) {
      html += `<button type="button" data-add="catalog"
        data-module="${escHtml(c.module)}" data-label="${escHtml(c.label)}"
        data-params="${escHtml(JSON.stringify(c.params || []))}">${escHtml(c.icon ? c.icon + ' ' : '')}${escHtml(c.label)}</button>`;
    }
    html += `</div></details>`;
    return html;
  }

  async _saveLayout() {
    const body = serializeLayout(this._tree, {
      docUrl: this._layoutUrl,
      comment: 'App layout — owned by the app builder; regenerate index.html after changes.',
    });
    const r = await solFetch(this._layoutUrl, {
      method: 'PUT', headers: { 'Content-Type': 'text/turtle' }, body,
    });
    if (!r.ok) this._error = `Couldn't save layout.ttl — ${r.status}`;
  }

  async _addElement(btn) {
    const regionIri = btn.closest('.sab-region')?.dataset.region;
    if (!regionIri || !this._tree) return;
    const kind = btn.dataset.add;
    let item = null;
    const mod = (file) => `${this.componentsBase}/web/${file}`;
    if (kind === 'menu') {
      const frag = await this._mintMenuFragment('Menu');
      const params = [['from-rdf', `app-menu.ttl#${frag}`]];
      const target = btn.closest('.sab-add-body')?.querySelector('.sab-menu-target')?.value;
      if (target) params.push(['region', target]);
      item = { label: 'Menu', module: mod('sol-menu.js'), params };
    } else if (kind === 'tabs') {
      const frag = await this._mintMenuFragment('Tabs');
      item = {
        label: 'Tabs', module: mod('sol-tabs.js'),
        params: [['keep-alive', ''], ['from-rdf', `app-menu.ttl#${frag}`]],
      };
    } else if (kind === 'content') {
      const name = await this._freeHtmlName('content');
      item = {
        label: 'Page content', module: mod('sol-include.js'),
        params: [['source', name], ['trusted', '']],
      };
    } else if (kind === 'catalog') {
      let params = [];
      try { params = JSON.parse(btn.dataset.params || '[]'); } catch { /* none */ }
      item = { label: btn.dataset.label || 'Component', module: btn.dataset.module, params };
    } else {
      const w = WIDGETS.find((x) => x.kind === kind);
      if (w) item = { label: w.label, module: mod(w.module.split('/').pop()), params: [] };
    }
    if (!item) return;
    const leaf = addLeaf(this._tree, regionIri, item, this._layoutUrl);
    if (!leaf) return;
    await this._saveLayout();
    await this._seedDocsForLeaf(leaf, this._layoutUrl);
    this._mountElements();
  }

  async _elementAction(btn) {
    const row = btn.closest('[data-node]');
    if (!row || !this._tree) return;
    const iri = row.dataset.node;
    const action = btn.dataset.elAction;
    if (action === 'edit') {
      const open = row.querySelector('sol-menu-manager');
      if (open) { open.remove(); return; }
      const el = document.createElement('sol-menu-manager');
      el.setAttribute('source', new URL(row.dataset.menuSrc, this._layoutUrl).href);
      if (this.catalog) el.setAttribute('catalog', this.catalog);
      row.appendChild(el);
      return;
    }
    if (action === 'remove') removeLeaf(this._tree, iri);
    else if (action === 'up') moveLeaf(this._tree, iri, -1);
    else if (action === 'down') moveLeaf(this._tree, iri, +1);
    else return;
    await this._saveLayout();
    this._mountElements();
  }

  // Next free fragment in the app's menu doc (app-menu.ttl may hold several
  // menus — #Menu, #More, #Tabs…).
  async _mintMenuFragment(base) {
    const docUrl = new URL('app-menu.ttl', this._layoutUrl).href;
    const taken = new Set();
    try {
      const store = await loadRdfStore(docUrl, freshFetch);
      for (const st of store.statementsMatching(null, null, null)) {
        for (const t of [st.subject, st.object]) {
          const v = t && t.value;
          if (typeof v === 'string' && v.startsWith(docUrl + '#')) taken.add(v.slice(docUrl.length + 1));
        }
      }
    } catch { /* newborn doc */ }
    return mintFragment(base, taken);
  }

  async _freeHtmlName(base) {
    for (let n = 0; n < 20; n++) {
      const name = `${base}${n ? `-${n + 1}` : ''}.html`;
      const there = await freshFetch(new URL(name, this._layoutUrl).href).catch(() => null);
      if (!there || !there.ok) return name;
    }
    return `${base}-${Date.now()}.html`;
  }

  // ── step 4: Add Plugins (catalog pantry + the app's menu managers) ────

  _render_plugins() {
    const app = this._app;
    if (!app) return '';
    // The layout's menu docs are discovered at render: one manager per doc.
    // Rendered async into the placeholder (light DOM, so the pantry's `for`
    // selector below can see the managers).
    queueMicrotask(() => this._mountManagers());
    let html = `<h3>Add plugins</h3>
<p class="sab-hint">Add plugin cards from the catalog into the app's menus — drag a card onto a
  menu, or use its Add-to button.</p>
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
