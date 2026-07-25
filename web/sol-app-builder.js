/**
 * <sol-app-builder> — build a standalone app on your pod (app-builder,
 * 2026-07-19). A built app is a pod folder holding readable artifacts:
 *
 *   app.ttl      the app node (schema:WebApplication; name, icon, ui:layout)
 *   layout.ttl   the ui:Layout tree (composed from the Step-2 answers, then editable)
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
 *                     the plugins pantry (steps 3–4), region drops, and the
 *                     "Add to catalog" publish action. Optional; without it
 *                     those affordances hide.
 *   components-base — where generated pages load sol-components from.
 *                     Default /node_modules/sol-components (same-origin);
 *                     set a pinned CDN base for portable app folders.
 *
 * A top row picks the app — Create new app / Edit existing app — and the step
 * rail stays greyed until one is chosen. Steps then run against the POD DOCS,
 * which are the wizard state, so any step works with whatever exists:
 *   1. Edit Layout          — pick a region arrangement (none/left/right/both,
 *                             chosen visually) FIRST; the questions then appear:
 *                             footer y/n, main-menu location, button-bar
 *                             location, hamburger ☰ y/n. The answers COMPOSE
 *                             layout.ttl (core/layout-compose.js) — header with
 *                             a site-title link, menu / button bar / ☰ as
 *                             chosen; sidebars + main as empty drop targets.
 *   2. Add Features         — the layout on the left (each region a drop zone
 *                             holding its elements as draggable chips), three
 *                             accordions on the right (Pages / UI elements /
 *                             Plugins, one open at a time). Drag a feature onto
 *                             a region to add it; drag a chip to reorder or
 *                             move it. Saves rewrite layout.ttl via
 *                             core/layout-serialize.js.
 *   3. Add Plugins          — the catalog pantry beside the app's menu
 *                             managers (drag/add plugin cards into menus)
 *   4. Publish              — generate + preview + catalog entry
 * Renders in LIGHT DOM: the embedded managers pair with the
 * pantry via its `for` selector, which only sees the page DOM.
 *
 * All writes go through solFetch (gate token). No new RDF terms here —
 * layout vocabulary in data/ui-vocab.ttl, shapes in shapes/ui.shacl.
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
  serializeLayout, addLeaf, addLink, removeLeaf, moveNode,
} from '../core/layout-serialize.js';
import { composeLayoutTurtle, menuOrientationFor } from '../core/layout-compose.js';

const freshFetch = (url, opts) => solFetch(url, { ...(opts || {}), cache: 'no-store' });

const UI     = 'http://www.w3.org/ns/ui#';
const SCHEMA = 'http://schema.org/';
// The drag payload MIME for the Add-Features step (accordion feature / chip
// move). The step-4 pantry uses its own PLUGIN_MIME contract separately.
const SAB_MIME = 'application/x-sab-feature';

const escHtml = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

const slugify = (name) =>
  String(name).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'app';

// Reverse of composeLayoutTurtle: infer the Edit-Layout answers from an existing
// layout tree so editing an app shows its current arrangement + questions. The
// region a MainMenu / MainButtonBar leaf sits in gives its location; sidebars
// come from the app-side-left/right regions; footer / hamburger from presence.
function cfgFromTree(tree) {
  const clsOf = (r) => new Map(r.params || []).get('class') || '';
  const slotOf = (r) => {
    if (r.role === 'banner') return 'header';
    if (r.role === 'navigation') return 'under-header';
    if (r.role === 'complementary') return clsOf(r).includes('app-side-right') ? 'right-sidebar' : 'left-sidebar';
    return null;
  };
  let hasLeft = false, hasRight = false, footer = false, hamburger = false;
  let menuLocation = 'header', buttonBar = 'none';
  (function walk(r) {
    if (!r || r.kind !== 'region') return;
    const cls = clsOf(r);
    if (cls.includes('app-side-left')) hasLeft = true;
    if (cls.includes('app-side-right')) hasRight = true;
    if (r.role === 'contentinfo') footer = true;
    const slot = slotOf(r);
    for (const p of r.parts) {
      if (p.kind === 'region') { walk(p); continue; }
      if (p.kind !== 'leaf') continue;
      const from = new Map(p.item.params).get('from-rdf') || '';
      if (from.endsWith('#MainMenu') && slot) menuLocation = slot;
      else if (from.endsWith('#MainButtonBar') && slot) buttonBar = slot;
      else if (from.endsWith('#MainHamburgerMenu')) hamburger = true;
    }
  })(tree);
  const sidebars = hasLeft && hasRight ? 'both' : hasLeft ? 'left' : hasRight ? 'right' : 'none';
  return { sidebars, footer, menuLocation, buttonBar, hamburger };
}

const STARTER_CONTENT = `<h1>Hello</h1>
<p>This is your app's content.html — edit it (e.g. with Live Edit in the pod
browser) to change this page.</p>
`;

const STARTER_FOOTER = `<p>Built with the Solid App Builder.</p>
`;

const STARTER_SITE_TITLE = `<strong>My App</strong>
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

// The theme chrome's ☰ menu — Help (a ui:Link to the app's help.html) plus the
// two standard appearance commands (implemented by web/scripts/app-commands.js,
// which layout-generate emits in every generated head).
const HAMBURGER_MENU_TTL = `@prefix : <#> .
@prefix ui: <http://www.w3.org/ns/ui#> .
@prefix schema: <http://schema.org/> .

# The app's ☰ menu — edit via the builder (or any sol-menu-manager).
:MainHamburgerMenu a ui:Menu ;
  ui:label "☰" ;
  ui:orientation ui:Vertical ;
  schema:itemListElement :Ham-Help, :Ham-Theme, :Ham-Text-size .

:Help a ui:Link ;
  ui:label "Help" ;
  schema:url "help.html" .

:Theme a ui:Command ;
  ui:label "Theme" ;
  schema:url <app-commands.ttl#toggleTheme> .

:Text-size a ui:Command ;
  ui:label "Text size" ;
  schema:url <app-commands.ttl#cycleFontSize> .

:Ham-Help a schema:ListItem; schema:item :Help; schema:position 1.
:Ham-Theme a schema:ListItem; schema:item :Theme; schema:position 2.
:Ham-Text-size a schema:ListItem; schema:item :Text-size; schema:position 3.
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
sol-app-builder .sab-top { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; margin: 0 0 .75rem; }
sol-app-builder .sab-app-title { flex: 1 1 auto; font-size: 1.1rem; color: inherit; text-decoration: none; }
sol-app-builder .sab-app-title:hover { text-decoration: underline; }
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
/* Step-2 configurator: grouped questions with pill choices. */
sol-app-builder .sab-group {
  border: 1px solid var(--border, #9e9e9e); border-radius: .5rem;
  padding: .4rem .8rem .8rem; margin: .75rem 0;
}
sol-app-builder .sab-group legend { font-weight: 600; padding: 0 .4rem; }
sol-app-builder .sab-choices { display: flex; flex-wrap: wrap; gap: .5rem; }
sol-app-builder .sab-choice {
  font-size: 1rem; padding: .4rem .9rem; border-radius: 999px;
  border: 1px solid var(--border, #9e9e9e); background: transparent;
  color: inherit; cursor: pointer;
}
sol-app-builder .sab-choice[aria-pressed="true"] {
  background: var(--accent, #1F618D); color: #fff; border-color: transparent;
}
[data-theme="dark"] sol-app-builder .sab-choice[aria-pressed="true"] { color: #0f1115; }
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
/* Add-Features step: layout areas (left) + accordions (right). */
sol-app-builder .sab-feat-wrap { display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-start; }
sol-app-builder .sab-layout { flex: 1 1 22rem; min-width: 0; }
sol-app-builder .sab-accordions { flex: 0 0 14rem; }
/* Wrapper regions render transparently — just a flex container along the
   region's axis (root stacks; the Middle band runs across, full width). */
sol-app-builder .sab-group { display: flex; gap: .5rem; }
sol-app-builder .sab-group-col { flex-direction: column; }
sol-app-builder .sab-group-row { flex-direction: row; align-items: stretch; }
sol-app-builder .sab-group-row > .sab-area { flex: 1 1 0; min-width: 0; }
/* A fillable area: a bordered box with its name on the border (the legend). */
sol-app-builder .sab-area {
  border: 1px solid var(--border, #9e9e9e); border-radius: .5rem;
  padding: .2rem .6rem .6rem; margin: 0 0 .5rem; min-width: 0;
  background: var(--surface, #fff); color: var(--text, #000);
}
sol-app-builder .sab-area > legend { padding: 0 .4rem; font-size: 1rem; color: var(--text-muted, #4d4d4d); }
sol-app-builder .sab-drop {
  display: flex; flex-wrap: wrap; gap: .4rem; align-items: center;
  min-height: 2rem; padding: .3rem; border-radius: .3rem;
  border: 1px dashed var(--border, #9e9e9e);
}
sol-app-builder .sab-drop-over { border-style: solid; outline: 2px solid var(--accent, #1F618D); }
sol-app-builder .sab-drop-hint { color: var(--text-muted, #4d4d4d); font-size: 1rem; padding: 0 .3rem; }
sol-app-builder .sab-chip {
  display: inline-flex; align-items: center; gap: .3rem; cursor: grab;
  font-size: 1rem; padding: .2rem .3rem .2rem .6rem; border-radius: 999px;
  border: 1px solid var(--border, #9e9e9e); background: var(--bg, #f5f5f5); color: var(--text, #000);
}
sol-app-builder .sab-chip-x {
  font-size: .9rem; line-height: 1; padding: .1rem .3rem; border-radius: 999px;
  border: 0; background: transparent; color: var(--text-muted, #4d4d4d); cursor: pointer;
}
sol-app-builder .sab-acc { border: 1px solid var(--border, #9e9e9e); border-radius: .4rem; margin-bottom: .4rem; overflow: hidden; }
sol-app-builder .sab-acc-head {
  width: 100%; text-align: left; font-size: 1rem; font-weight: 600; cursor: pointer;
  padding: .5rem .7rem; border: 0; background: var(--bg, #f5f5f5); color: inherit;
}
sol-app-builder .sab-acc-head[aria-expanded="true"] { background: var(--accent, #1F618D); color: #fff; }
sol-app-builder .sab-acc-body { display: flex; flex-direction: column; gap: .35rem; padding: .5rem; }
sol-app-builder .sab-feat {
  cursor: grab; font-size: 1rem; padding: .35rem .6rem; border-radius: .3rem;
  border: 1px solid var(--border, #9e9e9e); background: var(--surface, #fff); color: var(--text, #000);
}
[data-theme="dark"] sol-app-builder .sab-acc-head[aria-expanded="true"] { color: #0f1115; }
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
    this._step = 'layout';
    this._apps = null;    // [{slug, folder, name, icon}]
    this._app = null;     // the selected one
    this._mode = null;    // 'new' | 'edit' — which top-row button is active (gates the rail)
    this._openAcc = 'ui'; // which Add-Features accordion is open (one at a time)
    this._removed = [];   // items removed from the layout — offered back in their accordion
    this._removedSeq = 0;
    this._error = null;
    // Edit-Layout answers — a layout is COMPOSED from these (core/layout-compose.js).
    // sidebars=null until an arrangement is picked (then the questions appear);
    // 'none' is itself a valid arrangement, so null ≠ 'none'.
    this._cfg = { sidebars: null, footer: false, menuLocation: 'header', buttonBar: 'none', hamburger: true };
  }

  connectedCallback() {
    ensureDocStyle(this, 'sol-app-builder-css', CSS);
    // The heavy editors load lazily; the Menus step renders them by tag.
    import('./sol-menu-manager.js').catch(() => {});
    import('./sol-plugin-manager.js').catch(() => {});
    this.addEventListener('click', (e) => this._onClick(e));
    this.addEventListener('submit', (e) => this._onSubmit(e));
    // Add-Features (step 2): drag an accordion feature or a chip onto a layout area.
    this.addEventListener('dragstart', (e) => this._onFeatureDragStart(e));
    this.addEventListener('dragover', (e) => this._onFeatureDragOver(e));
    this.addEventListener('drop', (e) => this._onFeatureDrop(e));
    this._load();
  }

  get appsRoot() {
    const v = this.getAttribute('apps-root') || '';
    if (!v) return null;
    const url = new URL(v, document.baseURI).href;
    return url.endsWith('/') ? url : url + '/';
  }

  get catalog() { return this.getAttribute('catalog') || null; }

  get componentsBase() {
    return this.getAttribute('components-base') || '/node_modules/sol-components';
  }

  // ── data loading ─────────────────────────────────────────────────────

  async _load() {
    this._error = null;
    await this._loadApps();
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
    // A brand-new app has no layout yet — arrangement-first (questions hidden
    // until a layout is picked).
    this._cfg = { sidebars: null, footer: false, menuLocation: 'header', buttonBar: 'none', hamburger: true };
    this._removed = [];
    await this._loadApps();
    this._step = 'layout';
    this._render();
  }

  // Compose layout.ttl from the Edit-Layout answers, drop it into the app
  // folder, seed the docs it names, and move to the element step.
  async _createLayout() {
    const app = this._app;
    if (!app || !this._cfg.sidebars) return;   // no arrangement chosen yet
    this._error = null;
    const cfg = this._cfg;
    const layoutUrl = `${app.folder}layout.ttl`;
    const existing = await freshFetch(layoutUrl).catch(() => null);
    if (existing && existing.ok &&
        !window.confirm("Replace this app's existing layout?")) return;
    const ttl = composeLayoutTurtle({
      ...cfg, title: app.name, componentsBase: this.componentsBase,
    });
    const put = await solFetch(layoutUrl, {
      method: 'PUT', headers: { 'Content-Type': 'text/turtle' }, body: ttl,
    });
    if (!put.ok) { this._error = `Couldn't save layout.ttl — ${put.status}`; this._render(); return; }
    await this._seedComposedDocs(layoutUrl, cfg);
    this._app.preset = this._describeCfg(cfg);
    this._step = 'elements';   // layout composed → place elements
    this._render();
  }

  // Seed the docs the composed layout names: the three menu docs (MainMenu with
  // its placement orientation, MainButtonBar, MainHamburgerMenu with its Help +
  // appearance commands), and the preset content htmls (site-title, footer, help).
  async _seedComposedDocs(layoutUrl, cfg) {
    const menuDoc = new URL('app-menu.ttl', layoutUrl).href;
    await this._ensureMenuFragment(menuDoc, 'MainMenu',
      seedAppMenu({ label: 'Main menu', fragment: 'MainMenu', orientation: menuOrientationFor(cfg.menuLocation) }));
    if (cfg.buttonBar !== 'none') {
      await this._ensureMenuFragment(menuDoc, 'MainButtonBar',
        seedAppMenu({ label: 'Button bar', fragment: 'MainButtonBar', orientation: 'Horizontal' }));
    }
    if (cfg.hamburger) {
      await this._ensureMenuFragment(menuDoc, 'MainHamburgerMenu', HAMBURGER_MENU_TTL);
      await this._seedIfAbsent(new URL('app-commands.ttl', layoutUrl).href, APP_COMMANDS_TTL, 'text/turtle');
      await this._seedIfAbsent(new URL('help.html', layoutUrl).href, starterHelp(this.componentsBase), 'text/html');
    }
    await this._seedIfAbsent(new URL('site-title.html', layoutUrl).href, STARTER_SITE_TITLE, 'text/html');
    if (cfg.footer) await this._seedIfAbsent(new URL('footer.html', layoutUrl).href, STARTER_FOOTER, 'text/html');
  }

  _describeCfg(cfg) {
    const sides = { none: 'no sidebar', left: 'left sidebar', right: 'right sidebar', both: 'two sidebars' }[cfg.sidebars];
    const menu = { header: 'header', 'under-header': 'under header', 'left-sidebar': 'left sidebar', 'right-sidebar': 'right sidebar' }[cfg.menuLocation];
    const bar = cfg.buttonBar === 'none' ? ''
      : `, bar in ${{ header: 'header', 'left-sidebar': 'left sidebar', 'right-sidebar': 'right sidebar' }[cfg.buttonBar]}`;
    return `${sides}, menu in ${menu}${bar}${cfg.footer ? ', footer' : ''}${cfg.hamburger ? ', ☰' : ''}`;
  }

  // One added leaf's consumed docs: its from-rdf menu fragment (orientation by
  // consumer — a sidebar sol-menu / dropdown stacks, a bar runs across) and any
  // *.html a sol-include names. Used by the element step's Add.
  async _seedDocsForLeaf(leaf, layoutUrl) {
    const params = new Map(leaf.item.params);
    const fromRdf = params.get('from-rdf');
    if (fromRdf) {
      const docUrl = new URL(fromRdf.split('#')[0], layoutUrl).href;
      const fragment = fromRdf.split('#')[1] || 'Tabs';
      const vertical = leaf.item.tag === 'sol-menu' || leaf.item.tag === 'sol-dropdown-button';
      await this._ensureMenuFragment(docUrl, fragment, seedAppMenu({
        label: fragment, fragment,
        orientation: vertical ? 'Vertical' : 'Horizontal',
      }));
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

  // A menu DOC can hold several menu fragments (app-menu.ttl#MainMenu,
  // #MainButtonBar, #MainHamburgerMenu): create the doc when absent, APPEND the
  // fragment's block when the doc exists without it (Turtle re-declares prefixes).
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
        // The app folder is the base: same-origin ui:Link content (site-title /
        // footer html) transcludes via sol-include rather than framing.
        baseUrl: app.folder,
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
    const mode = e.target.closest('[data-mode]');
    if (mode) { this._setMode(mode.dataset.mode); return; }
    const step = e.target.closest('[data-step]');
    if (step && !step.disabled) { this._step = step.dataset.step; this._render(); return; }
    const app = e.target.closest('[data-app]');
    if (app) { this._pickApp(app.dataset.app); return; }
    const cfg = e.target.closest('[data-cfg-sidebars],[data-cfg-footer],[data-cfg-menu],[data-cfg-bar],[data-cfg-hamburger]');
    if (cfg) { this._setCfg(cfg); return; }
    const acc = e.target.closest('[data-acc]');
    if (acc) { this._openAcc = acc.dataset.acc; this._renderAccordions(); return; }
    const elAction = e.target.closest('[data-el-action]');
    if (elAction) { this._elementAction(elAction); return; }
    const action = e.target.closest('[data-action]');
    if (action) {
      if (action.dataset.action === 'create-layout') this._createLayout();
      if (action.dataset.action === 'generate') this._generate();
      if (action.dataset.action === 'register') this._register();
      if (action.dataset.action === 'reload') this._load();
    }
  }

  // The top-row buttons: choosing new/edit clears the current app (so nothing
  // shows below the buttons) and shows the create form or the existing-app picker.
  async _setMode(mode) {
    this._mode = mode;
    this._app = null;
    this._error = null;
    if (mode === 'edit') this._apps = null;
    this._render();
    if (mode === 'edit') { await this._loadApps(); this._render(); }
  }

  // Pick an existing app to edit: derive its Edit-Layout answers from the
  // existing layout so the arrangement + questions show its current state.
  async _pickApp(slug) {
    this._app = (this._apps || []).find((a) => a.slug === slug) || null;
    this._step = 'layout';
    this._removed = [];
    if (this._app) await this._deriveCfg(this._app);
    this._render();
  }

  // Set _cfg from the app's layout.ttl (questions shown, pre-selected). With no
  // layout yet, fall back to arrangement-first (sidebars=null hides the questions).
  async _deriveCfg(app) {
    const layoutUrl = `${app.folder}layout.ttl`;
    const res = await freshFetch(layoutUrl).catch(() => null);
    if (!res || !res.ok) {
      this._cfg = { sidebars: null, footer: false, menuLocation: 'header', buttonBar: 'none', hamburger: true };
      return;
    }
    try {
      const store = await loadRdfStore(layoutUrl, freshFetch);
      this._cfg = cfgFromTree(parseLayoutTree(store, rdf.sym(`${layoutUrl}#Layout`)));
      this._app.preset = this._describeCfg(this._cfg);
    } catch {
      this._cfg = { sidebars: null, footer: false, menuLocation: 'header', buttonBar: 'none', hamburger: true };
    }
  }

  // Apply one Edit-Layout answer; changing the sidebar arrangement can void a
  // sidebar menu / button-bar location (only offered when that side exists) —
  // fall back to the header / none if so.
  _setCfg(btn) {
    const d = btn.dataset;
    if (d.cfgSidebars) {
      this._cfg.sidebars = d.cfgSidebars;
      const hasLeft = this._cfg.sidebars === 'left' || this._cfg.sidebars === 'both';
      const hasRight = this._cfg.sidebars === 'right' || this._cfg.sidebars === 'both';
      const voided = (loc) => (loc === 'left-sidebar' && !hasLeft) || (loc === 'right-sidebar' && !hasRight);
      if (voided(this._cfg.menuLocation)) this._cfg.menuLocation = 'header';
      if (voided(this._cfg.buttonBar)) this._cfg.buttonBar = 'none';
    } else if (d.cfgFooter) this._cfg.footer = d.cfgFooter === 'true';
    else if (d.cfgMenu) this._cfg.menuLocation = d.cfgMenu;
    else if (d.cfgBar) this._cfg.buttonBar = d.cfgBar;
    else if (d.cfgHamburger) this._cfg.hamburger = d.cfgHamburger === 'true';
    this._render();
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
      ['layout', '1. Edit Layout'],
      ['elements', '2. Place Content and UI'],
      ['plugins', '3. Add Plugins'],
      ['publish', '4. Publish'],
    ];
    // Top row: the two mode buttons (+ the app's name once one is selected).
    // Nothing else shows until a mode is chosen.
    let html = `<div class="sab-top">
      ${app ? `<a class="sab-app-title" href="${escHtml(app.folder)}" target="_blank" rel="noopener"
        ><strong>${escHtml(app.icon ? app.icon + ' ' : '')}${escHtml(app.name)}</strong></a>` : ''}
      <button type="button" class="sab-choice" data-mode="new" ${this._mode === 'new' && !app ? 'aria-pressed="true"' : ''}>Create new app</button>
      <button type="button" class="sab-choice" data-mode="edit" ${this._mode === 'edit' && !app ? 'aria-pressed="true"' : ''}>Edit existing app</button>
    </div>`;
    if (app || this._mode) {
      html += `<nav class="sab-steps" aria-label="Builder steps">`;
      for (const [id, label] of steps) {
        html += `<button type="button" data-step="${id}"
          ${this._step === id ? 'aria-current="step"' : ''}
          ${!app ? 'disabled' : ''}>${escHtml(label)}</button>`;
      }
      html += `</nav>`;
      if (this._error) html += `<p class="sab-error">${escHtml(this._error)}</p>`;
      html += app ? (this[`_render_${this._step}`]?.() || '') : this._render_chooser();
    }
    this.innerHTML = html;
  }

  // Shown when no app is selected: the create form (mode 'new'), the existing-app
  // picker (mode 'edit'), or a prompt to choose one.
  _render_chooser() {
    if (this._mode === 'new') {
      return `<form class="sab-new">
  <input name="app-name" placeholder="App name" required aria-label="App name">
  <input name="app-icon" placeholder="Icon (emoji or URL)" size="14" aria-label="Icon">
  <button type="submit">Create</button>
</form>`;
    }
    if (this._mode === 'edit') {
      let html = '';
      if (this._apps === null) html += `<p class="sab-hint">Loading…</p>`;
      else if (!this._apps.length) html += `<p class="sab-hint">No apps yet under ${escHtml(this.appsRoot || '?')}.</p>`;
      else {
        html += `<div class="sab-cards">`;
        for (const a of this._apps) {
          html += `<button type="button" class="sab-card" data-app="${escHtml(a.slug)}">
            <div class="sab-card-title">${escHtml(a.icon ? a.icon + ' ' : '')}${escHtml(a.name)}</div>
            <div class="sab-card-desc">${escHtml(a.slug)}/</div></button>`;
        }
        html += `</div>`;
      }
      html += `<div class="sab-actions"><button type="button" class="sab-quiet" data-action="reload">Reload list</button></div>`;
      return html;
    }
    return `<p class="sab-hint">Choose <strong>Create new app</strong> or <strong>Edit existing app</strong> above to begin.</p>`;
  }

  // A mini block diagram of one sidebar arrangement — a header bar over a body
  // row of an optional left aside, the main pane, an optional right aside.
  // Decorative (the card title carries the accessible text).
  _arrangementSchematic(kind) {
    const aside = '<div class="sab-schem-r aside-r"></div>';
    const main = '<div class="sab-schem-r"><span>main</span></div>';
    const body = `<div class="sab-schem-r" style="flex:1 1 auto; align-items:stretch; padding:0; gap:.2rem; border:0; background:transparent">${
      (kind === 'left' || kind === 'both') ? aside : ''}${main}${(kind === 'right' || kind === 'both') ? aside : ''}</div>`;
    return `<div class="sab-schem" aria-hidden="true" style="flex-direction:column">
      <div class="sab-schem-r bar-r"></div>${body}</div>`;
  }

  // Step 1: Edit Layout — pick a region arrangement first; the questions
  // (footer, menu location, button-bar location, hamburger) appear only once
  // one is chosen. A layout is COMPOSED from the answers (core/layout-compose.js).
  _render_layout() {
    const cfg = this._cfg;
    const hasLeft = cfg.sidebars === 'left' || cfg.sidebars === 'both';
    const hasRight = cfg.sidebars === 'right' || cfg.sidebars === 'both';
    const arrangements = [
      ['none', 'Header + main'], ['left', 'Left sidebar'],
      ['right', 'Right sidebar'], ['both', 'Two sidebars'],
    ];
    const card = ([kind, label]) => `<button type="button" class="sab-card" data-cfg-sidebars="${kind}"
      ${cfg.sidebars === kind ? 'aria-pressed="true"' : ''}>${this._arrangementSchematic(kind)}
      <div class="sab-card-title">${escHtml(label)}</div></button>`;
    const choice = (attr, val, on, label) => `<button type="button" class="sab-choice"
      data-cfg-${attr}="${val}" ${on ? 'aria-pressed="true"' : ''}>${escHtml(label)}</button>`;
    // Sidebar options for menu / button-bar location — only when that side exists.
    const withSides = (base) => {
      const o = [...base];
      if (hasLeft) o.push(['left-sidebar', 'Left sidebar']);
      if (hasRight) o.push(['right-sidebar', 'Right sidebar']);
      return o;
    };
    const menuOpts = withSides([['header', 'Centre of header'], ['under-header', 'Under the header']]);
    const barOpts = withSides([['none', 'None'], ['header', 'Header']]);

    let html = `<fieldset class="sab-group"><legend>Regions — pick an arrangement to begin</legend>
      <div class="sab-cards">${arrangements.map(card).join('')}</div></fieldset>`;
    if (cfg.sidebars !== null) {
      html += `<fieldset class="sab-group"><legend>Footer</legend><div class="sab-choices">
        ${choice('footer', 'true', cfg.footer, 'Yes')}${choice('footer', 'false', !cfg.footer, 'No')}</div></fieldset>`;
      html += `<fieldset class="sab-group"><legend>Main menu location</legend><div class="sab-choices">
        ${menuOpts.map(([v, l]) => choice('menu', v, cfg.menuLocation === v, l)).join('')}</div></fieldset>`;
      html += `<fieldset class="sab-group"><legend>Button bar location</legend><div class="sab-choices">
        ${barOpts.map(([v, l]) => choice('bar', v, cfg.buttonBar === v, l)).join('')}</div></fieldset>`;
      html += `<fieldset class="sab-group"><legend>Hamburger ☰ menu (top right of header)</legend><div class="sab-choices">
        ${choice('hamburger', 'true', cfg.hamburger, 'Yes')}${choice('hamburger', 'false', !cfg.hamburger, 'No')}</div></fieldset>`;
      html += `<div class="sab-actions"><button type="button" data-action="create-layout">Create this layout →</button></div>`;
    } else {
      html += `<p class="sab-hint">Pick a region arrangement above to set footer, menu, button bar, and hamburger.</p>`;
    }
    if (this._app?.preset) {
      html += `<p class="sab-hint">Current layout: ${escHtml(this._app.preset)} — saved as layout.ttl.
        Create again to replace it. The next step places menus, content, and plugins in each region.</p>`;
    }
    return html;
  }

  // ── step 2: Add Features (layout areas ← drag from the accordions) ────

  _render_elements() {
    const app = this._app;
    if (!app) return '';
    queueMicrotask(() => this._mountFeatures());
    return `<p class="sab-hint">Drag a feature from the right onto a layout area on the left. Drag a chip to
  reorder it, or move it to another area.</p>
<div class="sab-feat-wrap">
  <div class="sab-layout" id="sab-layout"><p class="sab-hint">Loading the layout…</p></div>
  <div class="sab-accordions" id="sab-accordions"></div>
</div>`;
  }

  async _mountFeatures() {
    const box = this.querySelector('#sab-layout');
    const app = this._app;
    if (!box || !app) return;
    try {
      this._layoutUrl = `${app.folder}layout.ttl`;
      const store = await loadRdfStore(this._layoutUrl, freshFetch);
      this._tree = parseLayoutTree(store, rdf.sym(`${this._layoutUrl}#Layout`));
      this._renderLayoutAreas();
      this._renderAccordions();
    } catch {
      box.innerHTML = `<p class="sab-hint">No layout yet — create one on step 1 first.</p>`;
    }
  }

  // Left pane: the layout's regions as drop zones, each holding its elements as
  // draggable chips (nested regions render as nested areas).
  _renderLayoutAreas() {
    const box = this.querySelector('#sab-layout');
    if (box && this._tree) box.innerHTML = this._layoutAreaHtml(this._tree);
  }

  _layoutAreaHtml(region) {
    // A wrapper region (root, or the Middle band) holds only nested regions —
    // it's pure structure, so render it transparently: no border, no name, no
    // drop zone, just lay its children out along its orientation.
    const isWrapper = region.parts.length > 0 && region.parts.every((p) => p.kind === 'region');
    if (isWrapper) {
      const dir = region.orientation === 'horizontal' ? 'sab-group-row' : 'sab-group-col';
      return `<div class="sab-group ${dir}">${region.parts.map((p) => this._layoutAreaHtml(p)).join('')}</div>`;
    }
    // A real, fillable area: a bordered box with its name on the border (so it
    // can't be mistaken for a chip) and a drop zone holding its chips. Only
    // content and UI chrome show here — plugin components stay in the layout
    // but are placed/managed on the Add Plugins step, not this one.
    const iri = region.node.value;
    let inner = '';
    for (const part of region.parts) {
      if (part.kind === 'region') inner += this._layoutAreaHtml(part);
      else if (this._isChrome(part)) inner += this._chipHtml(part);
    }
    return `<fieldset class="sab-area">
      <legend>${escHtml(region.label || 'Region')}</legend>
      <div class="sab-drop" data-region="${escHtml(iri)}">${inner || '<span class="sab-drop-hint">drop a feature here</span>'}</div>
    </fieldset>`;
  }

  // Content / UI chrome vs a plugin: links (html content) and menu-consuming
  // elements (menus, bars, tabs, the ☰) are chrome; any other component is a
  // plugin and does not appear on this step.
  _isChrome(part) {
    if (part.kind === 'link') return true;
    if (part.kind !== 'leaf') return false;
    return ['sol-menu', 'sol-tabs', 'sol-dropdown-button'].includes(part.item.tag);
  }

  _chipHtml(part) {
    const iri = part.node.value;
    const label = part.kind === 'link'
      ? (part.label || 'Link')
      : (part.item.name || part.item.tag || 'Item');
    const icon = this._chipIcon(part);
    return `<span class="sab-chip" draggable="true" data-node="${escHtml(iri)}">${
      icon ? `<span class="sab-chip-icon">${escHtml(icon)}</span>` : ''}${escHtml(label)}<button
      type="button" class="sab-chip-x" data-el-action="remove" aria-label="Remove">✕</button></span>`;
  }

  // The chip's leading emoji, derived from what the element IS (so labels stay
  // clean text): 🔗 a link/page, ☰ the Action (hamburger) menu, 🔘 a button
  // bar, 🗂 tabs; a plain nav menu has none, a plugin keeps its own icon.
  _chipIcon(part) {
    if (part.kind === 'link') return '🔗';
    const tag = part.item.tag;
    const cls = new Map(part.item.params || []).get('class') || '';
    if (tag === 'sol-dropdown-button') return '☰';   // the Action / hamburger menu
    if (tag === 'sol-tabs') return '🗂';
    if (tag === 'sol-menu') return cls.includes('app-bar') ? '🔘' : '';
    return part.item.icon || '';
  }

  // Right pane: three accordions (Pages / UI elements / Plugins), one open at a
  // time; each holds draggable feature sources.
  _renderAccordions() {
    const box = this.querySelector('#sab-accordions');
    if (!box) return;
    const open = this._openAcc || 'ui';
    const feat = (feature, label, icon = '') => `<div class="sab-feat" draggable="true"
      data-feature="${escHtml(JSON.stringify(feature))}">${icon ? escHtml(icon) + ' ' : ''}${escHtml(label)}</div>`;
    const section = (id, title, body) => `<div class="sab-acc">
      <button type="button" class="sab-acc-head" data-acc="${id}" aria-expanded="${open === id}">${escHtml(title)}</button>
      ${open === id ? `<div class="sab-acc-body">${body}</div>` : ''}</div>`;
    // Items removed from the layout are offered back in their matching bin.
    const removedIn = (bin) => (this._removed || []).filter((r) => r.bin === bin)
      .map((r) => feat({ op: 'restore', id: r.id, restore: r.restore }, r.label, r.icon)).join('');
    const pages = feat({ op: 'page' }, 'New HTML Content', '📄') + removedIn('pages');
    const ui = feat({ op: 'menu' }, 'Action Menu', '☰') + feat({ op: 'bar' }, 'Button bar', '🔘')
      + feat({ op: 'tabs' }, 'Tabs', '🗂') + removedIn('ui');
    box.innerHTML = section('ui', 'UI elements', ui)
      + section('pages', 'HTML Content', pages);
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

  // Add a dropped feature to a region: a Page (ui:Link → new html), a Menu /
  // Button bar / Tabs (a menu-consuming component with a fresh from-rdf doc), or
  // a catalog Plugin (component leaf, or ui:Link for a link plugin).
  async _addFeature(payload, regionIri) {
    if (!this._tree || !regionIri) return;
    const mod = (file) => `${this.componentsBase}/web/${file}`;
    if (payload.op === 'page') {
      const name = await this._freeHtmlName('page');
      addLink(this._tree, regionIri, { label: 'Page', url: name, comment: `A page, from the app's own ${name}` }, this._layoutUrl);
      await this._saveLayout();
      await this._seedIfAbsent(new URL(name, this._layoutUrl).href, STARTER_CONTENT, 'text/html');
    } else if (payload.op === 'menu' || payload.op === 'bar' || payload.op === 'tabs') {
      const base = payload.op === 'tabs' ? 'Tabs' : payload.op === 'bar' ? 'Bar' : 'Menu';
      const frag = await this._mintMenuFragment(base);
      let item;
      if (payload.op === 'menu') {           // an Action Menu is a ☰ hamburger dropdown
        item = { label: 'Action Menu', module: mod('sol-dropdown-button.js'),
          params: [['label', '☰'], ['from-rdf', `app-menu.ttl#${frag}`]] };
      } else if (payload.op === 'bar') {
        item = { label: 'Button bar', module: mod('sol-menu.js'),
          params: [['from-rdf', `app-menu.ttl#${frag}`], ['class', 'app-bar']] };
      } else {
        item = { label: 'Tabs', module: mod('sol-tabs.js'),
          params: [['keep-alive', ''], ['from-rdf', `app-menu.ttl#${frag}`]] };
      }
      addLeaf(this._tree, regionIri, item, this._layoutUrl);
      await this._saveLayout();
      await this._ensureMenuFragment(new URL('app-menu.ttl', this._layoutUrl).href, frag,
        seedAppMenu({ label: frag, fragment: frag, orientation: payload.op === 'menu' ? 'Vertical' : 'Horizontal' }));
    } else if (payload.op === 'restore') {
      const rd = payload.restore || {};
      if (rd.type === 'link') addLink(this._tree, regionIri, { label: rd.label, url: rd.url }, this._layoutUrl);
      else addLeaf(this._tree, regionIri, { label: rd.label, module: rd.module, params: rd.params || [] }, this._layoutUrl);
      await this._saveLayout();
      this._removed = this._removed.filter((r) => r.id !== payload.id);   // out of the pantry
    } else return;
    this._renderLayoutAreas();
    this._renderAccordions();
  }

  // The only chip action is Remove (reorder is drag). A removed leaf/link is
  // offered back in its matching accordion (Pages / UI elements / Plugins).
  async _elementAction(btn) {
    const row = btn.closest('[data-node]');
    if (!row || !this._tree || btn.dataset.elAction !== 'remove') return;
    const part = this._findPart(row.dataset.node);
    if (part) this._removed.push(this._descriptorFor(part));
    removeLeaf(this._tree, row.dataset.node);
    await this._saveLayout();
    this._renderLayoutAreas();
    this._renderAccordions();
  }

  // Find a leaf/link part in the tree by its node IRI.
  _findPart(iri) {
    let found = null;
    (function walk(r) {
      if (!r) return;
      if (r.kind === 'region') r.parts.forEach(walk);
      else if (r.node && r.node.value === iri) found = r;
    })(this._tree);
    return found;
  }

  // Describe a removed part so it can be re-offered (and restored) in the right
  // accordion: a ui:Link → Pages; a menu-consuming component (from-rdf) → UI
  // elements; any other component → Plugins.
  _descriptorFor(part) {
    const id = ++this._removedSeq;
    const icon = this._chipIcon(part);
    if (part.kind === 'link') {
      return { id, bin: 'pages', label: part.label || 'Page', icon,
        restore: { type: 'link', label: part.label || 'Page', url: part.url } };
    }
    const params = part.item.params || [];
    return { id, bin: 'ui',
      label: part.item.name || part.item.tag || 'Item', icon,
      restore: { type: 'component', label: part.item.name, module: part.url, params } };
  }

  // Next free fragment in the app's menu doc (app-menu.ttl may hold several
  // menus — #MainMenu, #MainButtonBar, #MainHamburgerMenu, added #Menu/#Tabs…).
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

  // ── step 2 drag & drop: accordion feature / chip → layout area ────────

  // A chip (existing element) or an accordion feature source begins dragging.
  _onFeatureDragStart(e) {
    const chip = e.target.closest && e.target.closest('.sab-chip[data-node]');
    if (chip) {
      e.dataTransfer.setData(SAB_MIME, JSON.stringify({ op: 'move', node: chip.dataset.node }));
      e.dataTransfer.effectAllowed = 'move';
      return;
    }
    const feat = e.target.closest && e.target.closest('.sab-feat[data-feature]');
    if (feat) {
      e.dataTransfer.setData(SAB_MIME, feat.dataset.feature);
      e.dataTransfer.effectAllowed = 'copy';
    }
  }

  _onFeatureDragOver(e) {
    const drop = e.target.closest && e.target.closest('.sab-drop');
    if (!drop) return;
    if (![...((e.dataTransfer && e.dataTransfer.types) || [])].includes(SAB_MIME)) return;
    e.preventDefault();
    this.querySelectorAll('.sab-drop-over').forEach((el) => { if (el !== drop) el.classList.remove('sab-drop-over'); });
    drop.classList.add('sab-drop-over');
  }

  async _onFeatureDrop(e) {
    const drop = e.target.closest && e.target.closest('.sab-drop');
    if (!drop) return;
    let payload;
    try { payload = JSON.parse(e.dataTransfer.getData(SAB_MIME)); } catch { payload = null; }
    this.querySelectorAll('.sab-drop-over').forEach((el) => el.classList.remove('sab-drop-over'));
    if (!payload) return;
    e.preventDefault();
    const regionIri = drop.dataset.region;
    // Drop onto a chip = insert before it (reorder); onto the area = append.
    const beforeChip = e.target.closest('.sab-chip[data-node]');
    const beforeIri = beforeChip ? beforeChip.dataset.node : null;
    if (payload.op === 'move') {
      if (payload.node !== beforeIri && moveNode(this._tree, payload.node, regionIri, beforeIri)) {
        await this._saveLayout();
        this._renderLayoutAreas();
      }
      return;
    }
    await this._addFeature(payload, regionIri);
  }

  // ── step 4: Add Plugins (catalog pantry + the app's menu managers) ────

  _render_plugins() {
    const app = this._app;
    if (!app) return '';
    // The layout's menu docs are discovered at render: one manager per doc.
    // Rendered async into the placeholder (light DOM, so the pantry's `for`
    // selector below can see the managers).
    queueMicrotask(() => this._mountManagers());
    let html = `<p class="sab-hint">Add plugin cards from the catalog into the app's menus — drag a card onto a
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
        if (n.kind === 'region') n.parts.forEach(walk);
        else if (n.kind === 'leaf') {
          const v = new Map(n.item.params).get('from-rdf');
          if (v) sources.push(v);
        }
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
    let html = `<p class="sab-hint">Generate writes the readable page artifacts from layout.ttl. Menus stay live
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
