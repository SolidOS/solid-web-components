# Architecture plans

Design sketches for two changes. See `PLANS3.md` for the current
improvement roadmap.

---

## Plan 1 — All-in-one bundle entry (`solid-web-components.bundle.js`) *(completed)*

### Context

`rollup.config.js:97-118` already defines an `iife` build named
`SolidWebComponents` that reads from `solid-web-components.bundle.js`,
inlines dynamic imports, and externalises only `marked`, `dompurify`, and
`https://esm.sh/*`. `package.json:20-22` exposes `npm run bundle` /
`bundle:all` for this build. The **entry file itself doesn't exist**, so
those scripts fail.

The intent is a single drop-in `<script>` that a plain HTML page can
include to get every `<sol-*>` element registered, with rdflib / Comunica
/ Inrupt auth inlined.

### Goals

1. Registering `<sol-query>`, `<sol-include>`, `<sol-live-edit>`,
   `<sol-login>`, `<sol-modal>`, `<sol-pod>`, `<sol-accordion>`,
   `<sol-rolodex>`, and `<sol-tabs>` by the time the bundle script tag
   finishes executing.
2. A single optional export namespace (`window.SolidWebComponents`)
   for the few classes authors sometimes need imperatively
   (`SolModal`, `SolLogin`, `SolPod`).
3. No regressions for the per-component UMD builds that ship alongside —
   callers who only want `sol-query.umd.min.js` should keep working with
   their existing importmap / `<script>` for rdflib.
4. Work around the existing rollup externals contract (`rdflib`,
   `dompurify`, `marked` as globals for per-component builds; inlined
   here).

### Non-goals

- Tree-shaking per component. If you want one component, use the UMD
  build. This bundle is explicitly "everything."
- Replacing the per-component UMD builds.
- Shipping a lighter "core only" variant. Out of scope for this pass.

### Proposed entry file

`solid-web-components.bundle.js` at the repo root (rollup already points
there). Purely side-effecting imports plus a small named-export block:

```js
// Register every custom element.
import './sol-query.js';
import './sol-include.js';
import './sol-live-edit.js';
import './sol-login.js';
import './sol-modal.js';
import './sol-pod.js';
import './sol-accordion.js';
import './sol-rolodex.js';
import './views/sol-tabs.js';

// Re-export the small set of classes callers sometimes grab imperatively.
export { SolModal }    from './sol-modal.js';
export { SolLogin }    from './sol-login.js';
export { SolPod }      from './sol-pod.js';
export { SolTabs }     from './views/sol-tabs.js';
export { SparqlResultsRenderer } from './utils/sol-query-ui.js';
```

Views that are lazy-loaded by `<sol-query>` (accordion, anchorlist,
auto-complete, rolodex, select) **intentionally stay dynamic** so the
bundle picks them up via `inlineDynamicImports: true`. Same for the
live-edit renderers under `utils/renderers/` and the help/data modules —
rollup's dynamic-import inlining already handles these.

### Externals contract for the bundle

The bundle's `external` function in `rollup.config.js:103-106` currently
passes for:
- `https://esm.sh/*` — CDN imports (used by graphviz/mermaid renderers).
- `marked`, `dompurify` — expected as `window.marked` / `window.DOMPurify`.

**Everything else becomes inline**, including rdflib, Comunica, and
`@inrupt/solid-client-authn-browser`. The `stubMissingDynamic` plugin
continues to externalise `../src/podz-editor.js` (podz-specific dynamic
import) and stub `node:*` built-ins.

### Consumer story

```html
<!-- Host page -->
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dompurify/dist/purify.min.js"></script>
<script src="dist/solid-web-components.bundle.min.js"></script>

<sol-query endpoint="https://example/data.ttl" sparql="…"></sol-query>
```

Document the two `<script>` prerequisites (`marked`, `dompurify`) in the
README and in each help page that currently relies on an importmap.

### Step-by-step

1. Create `solid-web-components.bundle.js` with the imports above.
2. Run `npm run bundle` and verify `dist/solid-web-components.bundle.min.js`
   builds without errors. Expect warnings from Comunica's CJS → ESM
   conversion; silence only the known ones.
3. Smoke-test with a minimal HTML page that includes only the bundle +
   `marked`/`dompurify`: exercise each of the nine components in a
   browser. Inrupt auth requires a real pod — defer to a separate
   manual pass.
4. Add a "Browser / CDN" section to `README.md` showing the two-tag
   setup.
5. Add `solid-web-components.bundle.js` to the `package.json` `exports`
   map as `./bundle` for npm consumers who want to re-bundle it.
6. **Optional**: publish `dist/solid-web-components.bundle.min.js` to
   `unpkg` / `jsdelivr` automatically via a release workflow. Out of
   scope for this change.

### Risks / tradeoffs

- **Bundle size**: rdflib + Comunica + Inrupt auth is ~1–2 MB minified.
  Acceptable for the "drop in a script tag" use case, but should be
  documented so authors know to prefer UMD builds for production SPAs.
- **Duplicate globals**: if a page loads both the all-in-one bundle and
  a UMD component build, both will call `customElements.define` for the
  same tag. `customElements.define` throws on duplicate names. Mitigate
  by wrapping each `customElements.define` in `if (!customElements.get(name))`
  — this is a small follow-up across every `sol-*.js`, and arguably
  worth doing regardless.
- **Externals drift**: if a new component takes a new peer dependency
  (e.g. `handlebars`), it must either be inlined into the bundle or
  added to the `external` function. There's no lint for this; a CI
  check that ensures `npm run bundle` succeeds on every PR is the
  realistic safety net.
- **`inlineDynamicImports: true`** flattens every dynamic `import()`
  into a single file, so lazy loading in the help pages disappears in
  the bundle. That's the intended behaviour here (one file = everything
  loaded), but it means the `utils/live-edit-help/` and `data/live-edit/`
  modules also ship even though users may never open those formats.
  Accept as part of "all-in-one" semantics.

### Decision points before implementing

- **Should `customElements.define` be guarded globally?** (Recommended
  yes — low cost, prevents the dup-registration footgun.)
- **Namespace name**: `window.SolidWebComponents` vs shorter
  `window.SWC`. Rollup's output.name is already `SolidWebComponents`;
  no reason to shorten unless we want a terser DX.
- **Version gate**: do we want `window.SolidWebComponents.version`
  populated from `package.json`? Cheap to add via `@rollup/plugin-json`
  + an `import pkg from './package.json'`.

---

## Plan 2 — Consolidating `views/` *(not yet implemented — see PLANS3.md #4)*

### Context

`views/` currently holds **three different shapes** of module, all sharing
the same directory:

| Shape                               | Files                                                                                                         | Signature                         | Caller                                  |
|-------------------------------------|---------------------------------------------------------------------------------------------------------------|-----------------------------------|-----------------------------------------|
| A. Free `render` fn for sol-query   | `accordion.js`, `anchorlist.js`, `auto-complete.js`, `rolodex.js`, `select.js`                                | `render(container, data, host)`   | `sol-query.js:_loadAndRenderView`       |
| B. `this`-bound render fn           | `dl.js`, `table.js`, `list.js`                                                                                | `render(data, options)`, `this = SparqlResultsRenderer` | `utils/sol-query-ui.js` (bound in ctor) |
| C. Custom element                   | `sol-tabs.js`                                                                                                 | `<sol-tabs>` HTMLElement          | `sol-modal`, `sol-pod`, user code       |

The mix is confusing — shape B requires `this._mkLink` / `this._mkBnodeLink`
/ `this._termText` from the renderer, which couples three of the view
modules to an internal class. Shape C isn't a query view at all — it's a
generic UI container. A new contributor writing a view has to read
existing files to figure out which pattern to copy.

### Goals

1. One documented contract for **query views** (shapes A + B merged).
2. Decouple dl/table/list from `SparqlResultsRenderer`'s internals so they
   can be authored, tested, and lazy-loaded the same way as the others.
3. Move generic UI elements (`sol-tabs`, and future siblings) out of
   `views/`, since `views/` now clearly means "sol-query result renderer."
4. Keep the public `view="<name>"` attribute surface stable — no
   user-visible breakage.

### Non-goals

- Rewriting the renderers. The rendering logic stays the same; only the
  module shape and import wiring change.
- Changing the `sol-query` attribute API.

### Target structure

```
views/                               # sol-query result renderers only
  accordion.js
  anchorlist.js
  auto-complete.js
  dl.js
  list.js
  rolodex.js
  select.js
  table.js
  _helpers.js                        # new: mkLink, mkBnodeLink, termText,
                                     #      shortUri, cell helpers shared
                                     #      by dl/table/list/etc.

elements/                            # new: generic UI custom elements
  sol-tabs.js                        # moved from views/
```

### Unified view contract

Every module in `views/` exports:

```js
export function render(container, data, host, options = {}) { … }
```

- `container` — where to append output (pre-cleared by the caller).
- `data` — `{ vars: string[], results: Row[] }`.
- `host` — the `<sol-query>` element (for event dispatch, light-DOM
  child inspection, attribute reads). May be `null` if the view is
  being driven outside `<sol-query>` (e.g. `SparqlResultsRenderer` used
  standalone from script).
- `options` — render-time options like `hideHeader` (today only used by
  table/list when rendering inside the bnode modal).

Views that need link/bnode/termText helpers import them from
`views/_helpers.js` instead of reaching through `this`:

```js
// views/table.js
import { mkLink, mkBnodeLink, registerBnode } from './_helpers.js';
```

`registerBnode(host, bnodeValue)` records the bnode data on the host
(or a `WeakMap` keyed by host) and returns the link element, so the
bnode-modal pathway in `SparqlResultsRenderer` still works. This
replaces today's `this._bnodeData` map.

### `SparqlResultsRenderer` simplification

With shape B gone, `utils/sol-query-ui.js` becomes:

1. The orchestrator (`renderResults`): group/pivot logic + view
   dispatch.
2. The bnode-modal overlay (kept here since it owns the overlay and
   escape-key lifecycle).
3. No more `renderTable` / `renderList` / `render` bindings in the
   constructor — the three built-in views get dynamically imported
   the same way accordion/rolodex/etc. do.

`sol-query.js:_dispatchResults` can then drop its
`view === 'table' || view === 'dl' || view === 'list'` special case
(sol-query.js:177) and let all built-in views flow through
`_loadAndRenderView`. **Performance note**: dl/table/list are the
default views, so make sure the new shared `_helpers.js` and at least
`table.js` are statically imported (not dynamic) to avoid a flash on
first render. Simplest: `sol-query.js` top-level imports
`./views/table.js` eagerly, others stay lazy.

### Generic UI elements folder

Move `views/sol-tabs.js` → `elements/sol-tabs.js`. Update importers:

- `sol-modal.js` doesn't import sol-tabs; no change.
- `sol-pod.js:_openItemModal` and `sol-pod.js:_tabPermissions` use
  `await import('./elements/sol-tabs.js')`.

Rationale: `views/` now has a single, clear purpose. `elements/` becomes
the natural home for future non-view elements like a hypothetical
`<sol-toast>` or `<sol-progress>`.

### Step-by-step

1. Create `views/_helpers.js` by extracting `_mkLink`, `_mkBnodeLink`,
   `_termText`, and the bnode registration pattern from
   `utils/sol-query-ui.js`. Take a `host` (or opaque context object)
   argument for bnode registration.
2. Rewrite `views/table.js`, `views/list.js`, `views/dl.js` to use
   `render(container, data, host, options)` and import from `_helpers.js`.
   Delete the `.call(this, …)` wiring and the `this`-bound signature.
3. Update `utils/sol-query-ui.js`:
   - Drop `renderTable`/`renderList`/`render` bindings from the
     constructor.
   - `renderResults` dispatches to a single private
     `_dispatch(data, view, options)` that dynamically imports the view
     module and calls `render(this.container, data, this._host, options)`.
   - `_showBnodeModal` calls the same path for its sub-renderer.
4. Update `sol-query.js`:
   - Remove the `view === 'table' || 'dl' || 'list'` branch — all views
     go through `_loadAndRenderView`.
   - Eagerly import `table.js` (+ `_helpers.js`) to avoid first-paint
     delay on the default view.
5. Move `views/sol-tabs.js` → `elements/sol-tabs.js`. Update the two
   dynamic imports in `sol-pod.js`. No other file imports sol-tabs.
6. Update `CLAUDE.md` to describe the two folders (views = query
   renderers; elements = generic UI).
7. Update `package.json` `exports`: today nothing under `views/` or
   `elements/` is exported. If we want to expose `_helpers.js` for
   third-party view authors (they currently have to re-implement
   `mkLink`), add `"./view-helpers": "./views/_helpers.js"`.

### Decision points before implementing

- **`_helpers.js` naming**: could be `shared.js`, `cells.js`, or
  `view-helpers.js`. Current name avoids clashing with `shared/`
  which is a different concept ("shared between components").
- **Should `_helpers.js` be public API?** Third-party custom views
  (via `view="https://…"`) currently have to reimplement link
  rendering. Exporting helpers is low cost and unblocks richer
  community views. But it's also a commitment to backwards
  compatibility. Recommend publishing under `./view-helpers` with a
  short README note explaining it's stable-but-minimal.
- **Bnode modal location**: the modal overlay logic lives in
  `SparqlResultsRenderer` today. An alternative is to move it to
  `elements/sol-bnode-modal.js` as a sibling of `sol-tabs`, reusing
  `sol-modal`. Probably a follow-up — not blocking this consolidation.
- **Eager vs lazy default view**: eagerly importing `table.js` adds
  ~2 KB to `sol-query.umd.min.js`. Acceptable. Alternative is to keep
  everything lazy and accept a one-frame flash on first render; not
  recommended.
- **sol-rolodex overlap**: `sol-rolodex.js` at the root wraps
  `views/rolodex.js` as a standalone element. That's a fine pattern
  (custom element adopts a view renderer) and should be preserved.
  No change needed — just document the pattern in CLAUDE.md for
  future view/element pairs.

### Risks / tradeoffs

- **Churn in `SparqlResultsRenderer`**: three view methods leave the
  class, plus the bnode bookkeeping changes shape. Medium-sized diff
  but well-contained; tests live only in `tests/mini-query.test.js` and
  don't exercise the rendering path.
- **Third-party view-by-URL users**: anyone currently authoring a
  `view="https://…my-view.js"` module already uses shape A. No change
  for them — this is strictly a cleanup of in-tree views.
- **Module count grows by one** (`_helpers.js`). Acceptable for the
  decoupling it buys.
- **Migration of sol-tabs importers**: only two call sites
  (`sol-pod.js` × 2). Low risk.
