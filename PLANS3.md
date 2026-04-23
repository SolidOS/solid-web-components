## 1 — Extract shared file-type helpers from sol-pod-ops *(completed)*

### Problem

`sol-pod-ops.js` duplicates ~25 lines of file-type constants and
predicate functions (`TEXT_VIEWABLE`, `EDITABLE`, `IMAGE_TYPES`, …,
`isViewable`, `isRdf`) that also exist in `sol-pod.js` (only `fileIcon`
there). `CT_TO_EXT` is duplicated too. If a new format is added, both
files must be updated.

### Fix

Move the file-type arrays, predicates, `CT_TO_EXT`, and `fileIcon` into
`shared/pod-ops.js` (which already exports `extOf`, `contentTypeFor`,
`isLiveFormat`, etc.). Then import from both `sol-pod.js` and
`sol-pod-ops.js`.

Estimated: ~30 min, ~50 lines removed.

---

## 2 — Deduplicate sol-query-node.js *(completed)*

### Problem

`sol-query-node.js` re-implements ~150 lines that already exist in
`shared/rdf-utils.js` and `shared/utils.js`:

- `KNOWN_PREFIXES` (identical)
- `termToCell`, `toPlainResults` (identical)
- `triplePatternTermToNode`, `tokenizeTriplePattern`, `parseWantedParts`,
  `wantedVarNames` (near-identical, minus the `rdflib` parameter)
- `matchStore`, `loadRdfStore`, `detectFormat`, `ACCEPT_TYPES`
- `_selectVars`, `_isRdfDoc`, `execSparql`

The only reason for the duplication is that `shared/rdf-utils.js` imports
`rdf` from `shared/rdf.js`, which pulls rdflib from `esm.sh` and uses
`document.baseURI`. The Node version needs `import * as rdflib from
'rdflib'` (npm) and no `document` references.

### Fix

Option A (recommended): factor the pure-logic functions out of
`shared/rdf-utils.js` into a new `shared/rdf-core.js` that accepts
rdflib as an injected parameter. Both `shared/rdf-utils.js` (browser)
and `sol-query-node.js` import from `shared/rdf-core.js`, each passing
their own rdflib instance. `sol-query-node.js` shrinks to ~40 lines.

Option B (simpler): keep the duplication but add a comment noting the
relationship. Accept the sync risk.

Estimated (option A): ~2 hours.

---

## 3 — Add missing rollup UMD builds **BUNDLES - SKIP FOR NOW**

### Problem

Five components have no entry in `rollup.config.js`:

- `sol-accordion.js`
- `sol-login.js`
- `sol-modal.js`
- `sol-pod.js` / `sol-pod-ops.js`
- `sol-rolodex.js`

`npm run bundle` builds only the all-in-one IIFE and per-component UMDs
for sol-query, sol-include, sol-live-edit, sol-tabs, sol-menu, sol-wac.
Authors who want a standalone `<sol-pod>` UMD build get nothing.

### Fix

Add a rollup entry block for each missing component following the
existing pattern (external rdflib/dompurify/marked, UMD output, named
globals). `sol-pod-ops` should be a separate entry since it's
independently usable.

Estimated: ~30 min.

---

## 4 — Implement views consolidation (PLANS.md Plan 2) *(completed)*

### Problem

`views/` has three module shapes: free `render(container, data, host)`
functions (accordion, anchorlist, auto-complete, rolodex, select), `this`-
bound methods (table, list, dl), and a custom element (sol-tabs). Shape B
couples three views to `SparqlResultsRenderer` internals (`_mkLink`,
`_mkBnodeLink`, `_termText`).

### Fix

As designed in PLANS.md Plan 2:

1. Create `views/_helpers.js` with extracted cell-rendering helpers.
2. Rewrite table.js, list.js, dl.js to the free-function signature.
3. Simplify `SparqlResultsRenderer` — all views dispatched uniformly.
4. sol-tabs.js already lives at the root as `sol-tabs.js`; the `views/`
   copy (if any) can be removed.

Estimated: ~3 hours.

---

## 5 — View stylesheet scoping *(completed)*

### Problem

`views/accordion.js` and `views/rolodex.js` use `ensureDocStyle()` to
inject CSS into the host document rather than the `<sol-query>` shadow
root. This leaks styles into the page and fails if the component is
inside a nested shadow tree.

### Fix

Have `sol-query.js` pass its shadow root to view `render()` calls. Views
adopt their stylesheet into that shadow root via `adopt()` instead of
`ensureDocStyle()`. This aligns with how component-level styles already
work.

Estimated: ~1 hour (part of Plan 2 if done together).

---

## 6 — Test coverage for newer components *(completed)*

### Problem

Only three test files exist (`tests/`): focused on sol-query internals
(rdf-utils, triple-pattern validator, mini-query). No tests for:

- sol-pod, sol-pod-ops, sol-modal, sol-login, sol-include, sol-live-edit,
  sol-accordion, sol-rolodex, sol-tabs, sol-menu, sol-wac
- sol-query-node.js (Node.js query API)

### Fix

Priority order:

1. **sol-query-node.js** — *(done)* 22 tests: SPARQL safety, variable
   sanitization/substitution, solQuery integration with mock fetch.
2. **sol-login.js** — *(done)* 27 tests: AuthManager pure logic
   (originOf, isNoAuth, _baseDomain, _sessionCoversOrigin, sessionFor,
   getSessionFor, isLoggedIn, getWebId, getFirstLoggedIn, fetchFor).
3. **sol-wac / shared/pod-ops.js** — *(done)* 30 tests: WAC functions
   (parseAcl, authsToRoleModel, roleModelToTurtle, adaptInheritedAcl,
   ROLES, GRANT_OPTIONS constants).
4. **sol-pod-ops.js** — *(done)* 57 tests: file-type helpers (extOf,
   contentTypeFor, isEditable, isViewable, isRdf, isImage, isVideo,
   isAudio, isPDF, liveFormatFor, isLiveFormat, CT_TO_EXT, fileIcon),
   tab selection logic, default tab computation, navigate URL computation,
   item inference from source URL.
5. **sol-include.js** — *(done)* 17 tests: HTML/Markdown/plain-text
   rendering, raw mode, wanted selector, trusted mode, fetch errors,
   attribute changes, loading state (jsdom with mocked fetch).
6. Remaining components as capacity allows.

---

## 7 — Event and status API consistency *(completed)*

### Problem

Components emit events with varying conventions:

- `sol-query`: `sol-deref` (custom, cancelable)
- `sol-pod`: `sol-navigate`, `sol-drag-start`, `sol-auth-needed`,
  `sol-status`
- `sol-pod-ops`: `sol-status`, `sol-navigate`
- `sol-live-edit`: `sol-change`, `sol-save`, `sol-load`, `sol-zoom`
- `sol-modal`: `sol-modal-open`, `sol-modal-close`
- `sol-tabs`: `sol-tab-switch`

No shared documentation of the event catalog. Some events bubble +
compose, others don't.

### Fix

1. Document all events in CLAUDE.md (name, detail shape, bubbles/composed).
2. Audit that all cross-shadow events use `composed: true`.
3. Consider a shared `emit(el, name, detail)` helper for consistency,
   though this is low priority since the current `new CustomEvent` calls
   work fine.

Estimated: ~1 hour for documentation, ~30 min for the audit.

---

## 8 — Lint and format baseline *(completed)*

### Problem

No ESLint or Prettier configuration. Dead imports, unused variables, and
style drift are caught only by manual review.

### Fix

1. Add `.eslintrc.json` with a minimal ESM-friendly config (no-unused-vars,
   no-undef, prefer-const).
2. Add `npm run lint` script.
3. Optionally add Prettier with defaults.
4. Fix any lint errors surfaced by the initial run.

Estimated: ~1 hour.

---

## 9 — package.json exports audit *(completed)*

### Current state

```
.                 → sol-query.js
./rdf             → shared/rdf-utils.js
./ui              → utils/sol-query-ui.js
./triple-patterns → utils/sol-query-triple-patterns.js
./include         → sol-include.js
./live-edit       → sol-live-edit.js
./login           → sol-login.js
./modal           → sol-modal.js
./pod             → sol-pod.js
./pod-ops-ui      → sol-pod-ops.js
./pod-ops         → shared/pod-ops.js
./tabs            → sol-tabs.js
./menu            → sol-menu.js
./wac             → sol-wac.js
./node            → sol-query-node.js
```

### Missing

- `./accordion` → `sol-accordion.js`
- `./rolodex` → `sol-rolodex.js`
- `./bundle` → `solid-web-components.bundle.js` (for re-bundling)

### Possibly rename

- `./pod-ops-ui` is awkward. `./pod-ops` already points to `shared/pod-ops.js`
  (the utility module). Consider renaming the utility export to
  `./pod-utils` and giving `./pod-ops` to the component, which is the
  more natural consumer-facing name.

Estimated: ~15 min.

---

## 10 — Help-page / component-API drift (from PLANS2.md Plan 9) *(completed)*

### Problem

Help pages hand-write API tables that drift from the actual code. For
example, `help/sol-modal-help.html` still documents `m.tabs = [...]`
after the tabs refactor removed that API. Without a mechanism, drift
accumulates silently.

### Fix

1. **Single source of truth**: keep the canonical API description in each
   component's top-of-file JSDoc.
2. **Generate API docs** via `jsdoc` or `typedoc` into `help/api/`. Add
   a script: `"docs": "typedoc --entryPoints sol-*.js --out help/api"`.
   Run in CI; fail the build on doc errors.
3. **Help pages become demos, not API docs**. Each page has a short
   intro, a live demo, and a link to the generated API reference —
   no hand-written attribute/method tables to maintain.
4. Migrate in order: sol-modal first (already drifted), then sol-pod,
   then the rest.

Estimated: half a day for typedoc setup, then ~30 min per component
migration.

---

## 11 — UNUSED.md correction (from PLANS2.md) *(completed)*

### Problem

`UNUSED.md` (if it still exists) incorrectly flagged
`styles/sol-accordion.css` as unreferenced — it's loaded dynamically via
`loadStyleRules('root', 'sol-accordion')` where the filename is built
from the argument. `styles/root.css` is similarly reachable. Only
`styles/sol-rolodex.css` and `styles/rolodex.css` were truly unreferenced
(only a commented-out call in `views/rolodex.js`).

### Fix

If `UNUSED.md` exists, correct it. If the unreferenced stylesheets
(`sol-rolodex.css`, `rolodex.css`) are confirmed dead, delete them.

Estimated: ~15 min.

---

## 12 — Stale planning documents *(completed)*

### Problem

PLANS.md and PLANS2.md contain a mix of completed and unfinished plans.
Completed items (Plan 1, Plan 3, Plan 4, Plan 6) clutter the files.

### Fix

After implementing the items above, archive PLANS.md/PLANS2.md (move to
a `docs/archive/` folder or delete) and keep only PLANS3.md as the
active plan document, updating it as items are completed.

---

## Priority summary

| # | Item | Effort | Impact |
|---|------|--------|--------|
| 1 | Extract file-type helpers | 30 min | Removes duplication, single source of truth |
| 2 | Deduplicate sol-query-node | 2 hr | Prevents drift between browser/Node APIs |
| 3 | Missing rollup UMD builds | 30 min | Unblocks per-component consumers |
| 4 | Views consolidation | 3 hr | Simplifies contributor onboarding, decouples views |
| 5 | View stylesheet scoping | 1 hr | Fixes shadow-DOM style leak |
| 6 | Test coverage | 1–2 days | Catches regressions in new components |
| 7 | Event API docs | 1.5 hr | Discoverability, cross-component consistency |
| 8 | Lint baseline | 1 hr | Automated code quality |
| 9 | Exports audit | 15 min | Correct npm consumer DX |
| 10 | Help-page / API drift | 0.5 day | Prevents docs from silently going stale |
| 11 | UNUSED.md correction | 15 min | Accuracy of dead-code tracking |
| 12 | Archive old plans | 15 min | Reduce confusion |
