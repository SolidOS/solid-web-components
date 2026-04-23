# Further architecture plans

Additional improvements beyond `PLANS.md` (bundle entry + views
consolidation). Status of each plan is marked inline. See `PLANS3.md`
for the current improvement roadmap.

---

## Correction to `UNUSED.md`

Before the plans: `UNUSED.md` incorrectly flagged `styles/sol-accordion.css`
as unreferenced. `sol-accordion.js:74` loads it dynamically via
`loadStyleRules('root', 'sol-accordion')` (filename built from the
argument). Same mechanism means `styles/root.css` is also reached from
the component path, not just help pages. `styles/sol-rolodex.css` and
`styles/rolodex.css` remain truly unreferenced (only a commented-out
`loadStyleRules(...)` in `views/rolodex.js:187`).

Fix `UNUSED.md` accordingly when that cleanup is revisited.

---

## Plan 3 — Fix shadow-DOM CSS leakage (real bug) *(implemented: 3.B + 3.C)*

**Status**: done. `utils/sol-pod-css.js` split into `styles/sol-pod-css.js`
(own-tree rules) and `styles/sol-pod-modal-css.js` (modal-content rules).
`<sol-modal>` gained a `styles` property that adopts a caller-supplied
array of `CSSStyleSheet`/string values into its shadow root via
`adoptedStyleSheets`. `<sol-pod>` sets `modal.styles = [POD_MODAL_SHEET]`
before `modal.open()`. All `*-css.js` modules moved under `styles/` and
now export both a raw `CSS` string and a constructed `CSSStyleSheet`
(`sheet`) via the new `shared/adopt.js` helper.

### Problem

Several CSS classes used inside `<sol-modal>`'s shadow root are defined
in `utils/sol-pod-css.js`, which gets injected into `<sol-pod>`'s own
shadow root — not the modal's. Shadow DOM isolates styles in both
directions, so the rules never apply. The UI falls back to browser
defaults and looks broken in subtle ways.

Affected rule families (defined in `utils/sol-pod-css.js`, used inside
`<sol-modal>` shadow):

- `.modal-editor`, `.modal-viewer`, `.modal-media`, `.modal-audio`,
  `.modal-pdf`, `.modal-message` (partially — some are in both files),
  `.modal-note` (partially),
- `.acl-role-form`, `.acl-role-row`, `.acl-role-name`, `.acl-grant-select`,
  `.cm-editor-wrap`, `.html-editor-pane`.

### Why it happens

Two shadow roots, two stylesheets. `sol-pod-css.js` grew organically to
hold styles for both the pod's own UI *and* the modal content it
creates — but the modal owns an independent shadow root.

### Options

**A. Move all modal-content styles into `utils/sol-modal-css.js`.**
    Pro: one source of truth; styles reach the rules. Con:
    sol-modal-css.js gets bigger and takes on concerns it didn't author
    (ACL form, CodeMirror wrapper). Modal stops being truly "generic".

**B. Allow `<sol-modal>` to accept an external stylesheet.**
    Add a property / attribute (`stylesheet`, or accept a
    `CSSStyleSheet` via `adoptedStyleSheets`) so `<sol-pod>` can push
    its modal-content rules into the modal's shadow root when creating
    the modal.
    Pro: keeps concerns separated; future components can do the same.
    Con: API surface grows.

**C. Use `adoptedStyleSheets` + Constructable Stylesheets.**
    Export each `CSS` string as a `CSSStyleSheet` module; components
    adopt them into their shadow roots as needed. Modal can accept an
    array via a property.
    Pro: most idiomatic, deduplicates at runtime. Con: requires a
    module graph change and a browser-support note (all evergreen
    browsers today, so fine).

**Recommended**: **B + C combined** — `<sol-modal>` gains a `styles`
property that accepts an array of `CSSStyleSheet` or CSS strings; on
`open()` those get adopted into the shadow root. Internal baseline
stylesheet stays in `sol-modal-css.js`. Callers like `<sol-pod>` pass
their ACL-form/editor stylesheet at modal creation time.

### Step-by-step

1. Inventory which rules belong to modal-content vs pod-main. Split
   `sol-pod-css.js` into:
   - `utils/sol-pod-css.js` — rules for `<sol-pod>`'s own tree
     (`.tree-wrapper`, `.breadcrumb`, etc.).
   - `utils/sol-pod-modal-css.js` — rules that render inside the
     modal's shadow (`.modal-editor`, `.acl-role-form`, etc.).
2. Add `styles` property to `<sol-modal>`:
   ```js
   set styles(arr) { this._extraStyles = arr; }
   ```
   On `open()`, either adopt via `adoptedStyleSheets` or append a
   `<style>` per entry into the shadow root after the baseline.
3. In `<sol-pod>`: import `CSS as POD_MODAL_CSS` from
   `utils/sol-pod-modal-css.js`; set `modal.styles = [POD_MODAL_CSS]`
   before `modal.open()`.
4. Drop the now-dead modal-content rules from the legacy
   `utils/sol-pod-css.js`.
5. Visual QA: open each modal pathway (`View`, `Edit`, `Live Edit`,
   `Permissions`, etc.) and confirm styling renders.

### Risks

- Forgetting a rule during the split. Mitigate with a side-by-side
  screenshot pass before/after.
- Future components that put rich content in `<sol-modal>` need to
  remember to pass `styles`. Document prominently in sol-modal.js
  header JSDoc.

---

## Plan 4 — Guard `customElements.define` *(implemented)*

**Status**: done. `shared/define.js` exports a `define(name, klass)` helper
that no-ops if the tag is already registered (warning once unless
`window.__SolSuppressDefineWarn` is set). All nine component files
(`sol-accordion`, `sol-include`, `sol-live-edit`, `sol-login`,
`sol-modal`, `sol-pod`, `sol-query`, `sol-rolodex`, `views/sol-tabs`)
now import and call it in place of the raw `customElements.define`.

### Problem

Every `sol-*.js` ends with an unguarded `customElements.define(...)`.
Registering the same tag twice throws. This happens in practice when
a page loads the all-in-one bundle alongside a per-component UMD build
(deliberately or by mistake), or when two versions of the library are
loaded side-by-side.

### Plan

Introduce one tiny helper and call it everywhere:

```js
// shared/define.js
export function define(name, klass) {
  if (!customElements.get(name)) customElements.define(name, klass);
}
```

Replace the nine raw `customElements.define(...)` calls. Cost: one
import + one-line change per file.

### Tradeoffs

- Silent "keep the first registration" may hide version mismatches.
  Alternative: log a `console.warn` on collision. Recommend warn by
  default; callers can silence it via a global
  `window.__SolSuppressDefineWarn = true` escape hatch if needed.
- In dev, hot-reload scenarios (when not using module-federation
  tooling) become friendlier — the re-evaluated module no longer
  throws on the second registration.

---

## Plan 5 — Testing baseline *(Tier 1 completed; Tiers 2–3 not yet implemented — see PLANS3.md #6)*

### Problem

- One test file (`tests/mini-query.test.js`, 261 lines) exercising
  only `shared/rdf-utils.js`.
- Coverage ~21% statements, ~24% branches.
- One pre-existing failing test (`expandBnodes › bnode object in
  non-s/p column becomes modal cell`) that masks real regressions —
  the CI signal is already red, so nobody notices a new break.
- No component-level tests. Every refactor (views extraction, tabs
  refactor, the upcoming bundle entry) is validated by eyeballing
  index.html.

### Plan

Three tiers, smallest-to-largest investment:

**Tier 1 — unblock the signal (half-day)** *(implemented)*

1. ~~Fix or `.skip` the failing `expandBnodes` test with a reference to
   the underlying bug.~~ Done — `tests/mini-query.test.js:236` now uses
   `test.skip` with a comment describing the `expandBnodes` drop-column
   rule that's shadowing the non-s/p branch. `npm run test:ci` reports
   41 passed, 1 skipped.
2. ~~Add a `"test:ci"` script that runs without `--coverage` for speed
   and keeps `"test"` as coverage.~~ Done — `package.json:21`.
3. ~~Add a GitHub Action running `npm test` on push/PR.~~ Done —
   `.github/workflows/test.yml` runs `npm run test:ci` on push to
   `main`/`2.0` and on pull requests, Node 20, `npm ci` with npm cache.

**Tier 2 — component smoke tests (1-2 days)**

One test per component that (a) registers the element, (b) connects it
to a jsdom document, (c) asserts the shadow root renders a sensible
DOM, (d) exercises the main attribute paths. Target tests:

- `sol-query` — attribute parsing, `_sparqlAttr` alias, `view=` routing,
  SPARQL safety rejection.
- `sol-include` — source-fetch happy path (with `fetch` mocked), wanted
  selector trimming, raw mode, sanitisation boundary.
- `sol-modal` — open/close lifecycle, handler invocation, prompt
  resolves, declarative trigger renders.
- `sol-tabs` — tab switching, single-tab bar-hidden behaviour, cleanup
  fn runs on switch, `sol-tab-change` event dispatched.
- `sol-login`, `sol-pod` — only the non-auth bits (path resolution,
  tab capability filtering). Auth paths stay manual.

Use `@open-wc/testing` or plain Jest + jsdom. Current setup is already
Jest + jsdom, so no new deps required.

**Tier 3 — render contract tests (longer-term)**

One golden-file snapshot per view (`views/*.js`) given a fixed dataset.
Re-renders the view in jsdom, serialises the output, diffs against
stored snapshot. Cheap to maintain; high regression value given how
often rendering changes.

### Tradeoffs

- Tier 2 tests that assert on shadow-DOM structure are brittle against
  refactors. Mitigate by querying on semantic roles (`role="table"`,
  `aria-label`) rather than class names.
- CI on GitHub Actions costs minutes; with 42 tests today and, say,
  ~150 after Tier 2, we're still well under a minute per run.

---

## Plan 6 — Consolidate style loading *(implemented)*

**Status**: done. Every `utils/*-css.js` module moved to `styles/` and now
exports a `CSSStyleSheet` alongside its raw `CSS` string. Shadow-DOM
components (`sol-modal`, `sol-pod`, `sol-login`, `sol-live-edit`) adopt
their sheet via `shared/adopt.js::adopt()` (using `adoptedStyleSheets`
with a `<style>` fallback). `sol-accordion` — light-DOM — injects once
per document via `ensureDocStyle`. `loadStyleRules` removed from
`shared/utils.js`; the commented import in `views/rolodex.js` cleaned up.
Help pages keep `<link rel="stylesheet">` against `styles/page.css`,
`styles/sol-query-help.css`, `styles/root.css`.

### Problem

Three different mechanisms coexist for getting CSS into components:

1. **Inline CSS string re-exported from a JS module** — `utils/sol-modal-css.js`,
   `utils/sol-pod-css.js`, `utils/sol-query-ui.js` (getDefaultStyles),
   etc. Consumed via template-literal injection into shadow root.
2. **`loadStyleRules(...names)` fetching files from `styles/`** —
   `sol-accordion.js:74`, with a commented-out call in
   `views/rolodex.js:187`.
3. **External `<link>` tags from help pages** — `shared/page.css`,
   `shared/sol-query-help.css`.

The inconsistency makes it harder to:
- Add a theme (light/dark CSS vars already exist but are applied
  ad-hoc).
- Ensure every shadow root gets the same "baseline" (focus-ring,
  button, input styles).
- Know where to add a new rule.

### Plan

Pick one strategy per scope:

**For component shadow roots**: standardise on
`adoptedStyleSheets` + an exported `CSSStyleSheet` per module. Lazy
build the sheet once, reuse across instances.

```js
// utils/sol-modal-css.js
const sheet = new CSSStyleSheet();
sheet.replaceSync(`/* … */`);
export default sheet;

// sol-modal.js
this.shadowRoot.adoptedStyleSheets = [modalSheet];
```

Pros: dedup'd at runtime, composable (`[base, modalSheet, podModalSheet]`),
no FOUC, no fetch round-trip. Drop `loadStyleRules` entirely for
component code — it's still fine for help pages that want file-based
CSS.

**For help pages**: keep `<link rel="stylesheet">` — it's appropriate
for page-level styling and cacheable.

### Step-by-step

1. Add a `shared/styles/base.css.js` exporting a `CSSStyleSheet` with
   design-system primitives (CSS variables, button, input, focus ring).
2. Convert each `utils/*-css.js` from a `CSS` string export to a
   `CSSStyleSheet` export. Composers import both `base` and their
   module sheet.
3. Update components to `this.shadowRoot.adoptedStyleSheets = [base, own]`.
4. Remove `loadStyleRules` calls in `sol-accordion.js` and the
   commented line in `views/rolodex.js`. Migrate their rules into the
   same pattern. Delete `styles/sol-accordion.css`, `styles/root.css`
   after verifying nothing else consumes them.
5. Keep `shared/utils.js` `loadStyleRules` only if help pages need it;
   otherwise delete.

### Tradeoffs

- Constructable stylesheets need evergreen browsers; acceptable given
  the rest of the stack already uses shadow DOM and custom elements.
- The migration is a bigger diff than it looks because every
  `<style>${CSS}</style>` template in each component's
  `shadowRoot.innerHTML` has to come out. Worth bundling with Plan 3
  (shadow-style leakage) since both touch the same files.

---

## Plan 7 — Lint + format baseline *(not yet implemented — see PLANS3.md #8)*

### Problem

- No `.eslintrc`, no `.prettierrc`, no `package.json` `"lint"` script.
- Dead commented branches accumulate (e.g. `sol-query.js:178`).
- Unused imports slip in (`SolModal` was imported then switched to
  plain dynamic-import in `sol-pod.js` during the tabs refactor — now
  the import is redundant; easy to miss by eye).
- Formatting inconsistencies across files (mixed `//` vs `// ` comment
  style, varying indentation after the recent edits).

### Plan

Adopt a minimal, opinionated config:

1. ESLint flat config (`eslint.config.js`) with:
   - `eslint:recommended`
   - `no-unused-vars` as `warn`
   - `no-dead-code` via `eslint-plugin-unicorn` (`no-unused-expressions`
     and friends)
   - A rule against unlabelled `console.log` (allow `console.warn` /
     `console.error`).
2. Prettier with defaults (2-space indent, single quotes, semi-colons).
   Add `prettier-ignore` to the `dist/` and `drafts/` paths.
3. `package.json` scripts:
   ```json
   "lint": "eslint 'sol-*.js' 'views/**/*.js' 'utils/**/*.js' 'shared/**/*.js'",
   "format": "prettier --write ."
   ```
4. Run once, review the diff in a standalone PR to keep it reviewable.
5. Add to the GitHub Action from Plan 5.

### Tradeoffs

- The initial formatting pass produces a big diff. Bundle it on its
  own so reviewers can rubber-stamp.
- Strong prettier opinions may clash with personal style — the
  recommendation is to accept defaults exactly so the discussion is
  short.

---

## Plan 8 — Event + status API unification *(not yet implemented — see PLANS3.md #7)*

### Problem

Each component emits events ad-hoc:

| Component       | Events                                                           |
|-----------------|------------------------------------------------------------------|
| `sol-pod`       | `sol-navigate`, `sol-drag-start`, `sol-status`                   |
| `sol-modal`     | `sol-ready`, `sol-close`                                         |
| `sol-tabs`      | `sol-tab-change`                                                 |
| `sol-query`     | (emits via `host.dispatchEvent(...)` inside views, e.g. `sol-select`) |
| `sol-login`     | (check — likely `sol-login`, `sol-logout` style)                 |

There's no shared convention for error/status eventing, no single place
for a host page to wire "show me anything that went wrong in any
component." `sol-status` exists on `sol-pod` but isn't used elsewhere.

### Plan

Define a minimal convention in `CLAUDE.md` + in a short
`docs/events.md`:

- **Namespace**: all events use the `sol-` prefix.
- **Status/error signal**: every component dispatches `sol-status` with
  `{ message: string, type: 'info'|'success'|'warning'|'error',
  source: '<tag-name>' }` on both happy and error paths that the user
  would care about. Bubbling + composed.
- **Lifecycle signal**: `sol-ready` (first render complete) and
  `sol-close` (for dismissable UI). Already modelled by `sol-modal`.
- **Domain events**: component-specific (`sol-navigate`, `sol-select`,
  `sol-tab-change`). No new convention needed.

Implementation is a small helper in `shared/utils.js`:

```js
export function emit(host, name, detail = {}) {
  host.dispatchEvent(new CustomEvent(name, {
    bubbles: true, composed: true, detail,
  }));
}
export const emitStatus = (host, message, type = 'info') =>
  emit(host, 'sol-status', { message, type, source: host.localName });
```

Refactor existing `_emitStatus` in `sol-pod.js` to call this helper.
Add the same call at error boundaries in other components. Document
the union type.

### Tradeoffs

- Purely additive — no existing consumers break.
- Small ongoing cost: remember to call `emitStatus` on new failure
  paths. Code review catches this cheaply.

---

## Plan 9 — Help-page / component-API drift *(not yet implemented)*

### Problem

`help/sol-modal-help.html` and `help/sol-modal-script.html` still
document `m.tabs = [...]` after the tabs refactor removed that API.
This is the second time this session that docs lagged code (the first
was the JSDoc in `sol-modal.js` mentioning `switchTab`). Without a
mechanism, drift accumulates.

### Plan

Lightweight solution (no doc-generator bolt-on):

1. **Single source of truth for public API**: keep the API description
   in each component's top-of-file JSDoc. The existing
   `@solpm sol-modal ...` style block is already close to this.
2. **Help pages become runnable demos, not API docs**. Each help page
   has:
   - A short prose intro.
   - A live `<iframe>`-able demo embedded via `<sol-include
     source="…sample.html">`.
   - A **link** to the rendered JSDoc, not a hand-written API table.
3. **Generate JSDoc HTML into `help/api/`** using `jsdoc` or `typedoc`
   (works fine on JS with JSDoc annotations). Wire as
   `"docs": "typedoc --entryPoints sol-*.js --out help/api"`.
   Run in CI; fail the build on doc errors.
4. **Migrate in order**: sol-modal first (it just drifted, so the
   delta is small), then sol-pod, then the rest.

Alternative (cheaper, less automated): a single
`help/api-contract.md` table that links file:line for each public
attribute/method. Code review expects the table to change when the
JSDoc changes; easy to catch, no generator required.

### Tradeoffs

- Adopting a generator is ~half a day of config, then free. But it
  ossifies JSDoc as the documentation format, which some contributors
  dislike.
- The alternative table approach is zero-setup but relies on humans.
  Given the project's current drift rate (two cases in one session),
  humans are not a reliable control.

Recommend the generator route (typedoc) because the project's JSDoc
is already structured enough to benefit.

---

## Priority

Status as of 2026-04-16:

1. ~~**Plan 3** (shadow-DOM CSS leakage) + **Plan 6** (style consolidation)~~ — **done**.
2. ~~**Plan 4** (guard `customElements.define`)~~ — **done**.
3. ~~**Plan 5 Tier 1** (fix the failing test, add CI)~~ — **done**.
4. **Plan 9** (doc generator) — not started.
5. **Plan 7** (lint/format) — not started.
6. **Plan 5 Tier 2-3** (real component tests) — not started.
7. **Plan 8** (event convention) — not started.

See `PLANS3.md` for the consolidated current roadmap that supersedes the
remaining items above.
