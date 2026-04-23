# Plan: sol-solidos component + handler preference on sol-pod

## Overview

Add mashlib/SolidOS integration via a new `sol-solidos` component with a persistent outliner instance, and a `handler` attribute on `sol-pod` that switches between podz (sol-pod-ops) and solidos (sol-solidos) in the gear menu modal.

## Core design

`sol-solidos` is a **long-lived element** that creates the mashlib outliner once and navigates it via `outliner.GotoSubject()` on `source` changes. `sol-pod` keeps a single `sol-solidos` instance and reuses it across modal opens — no teardown/rebuild per click.

## Steps

### 1. Create `sol-solidos.js` (~2-3 hours)

New custom element:

```html
<sol-solidos source="https://alice.pod/file.ttl" login="main"></sol-solidos>
```

Lifecycle:
- `connectedCallback`: create container div in shadow DOM
- First `source` set: lazy `import('mashlib')`, get `solidLogicSingleton` from `SolidLogic`, create outliner, mount into container, store as `this._outliner`
- Subsequent `source` changes: `this._outliner.GotoSubject(store.sym(url), true, null, false, null, {})` — no reinit
- `disconnectedCallback`: optional cleanup, but element is designed to persist

Auth bridging: pass authenticated fetch from sol-login into the singleton's store fetcher before first load. On login changes, update the fetcher.

Shadow DOM vs light DOM: try shadow DOM first (outliner renders into a target div we provide). Fall back to light DOM with scoped CSS if mashlib injects globals that break.

### 2. Create `styles/sol-solidos-css.js` (~15 min)

Minimal styles — container sizing to fill the modal body, overflow handling.

### 3. Modify `sol-pod.js` — handler attribute + persistent element (~1 hour)

Add `handler` to `observedAttributes`. Values: `'podz'` (default), `'solidos'`.

Keep a single `sol-solidos` instance on the `sol-pod` element:

```js
this._solidosEl = null;

_getSolidosEl() {
  if (!this._solidosEl) {
    this._solidosEl = document.createElement('sol-solidos');
    if (this._loginTag) this._solidosEl.setAttribute('login', this._loginTag);
  }
  return this._solidosEl;
}
```

Branch in `_openItemModal(item)`:

```js
if (this._handler === 'solidos') {
  await import('./sol-solidos.js');
  const solidos = this._getSolidosEl();
  modal.handler = (body) => {
    body.appendChild(solidos);             // move into modal body
    solidos.setAttribute('source', item.url);  // navigate outliner
  };
} else {
  // existing podz path — creates new sol-pod-ops each time
}
```

On modal close, `sol-solidos` detaches from modal body but stays on `this._solidosEl`. Next open moves it back in and updates `source`.

### 4. Package/config updates (~30 min)

| File | Change |
|------|--------|
| `package.json` exports | Add `"./solidos": "./sol-solidos.js"` |
| `package.json` peerDeps | Add `mashlib` as optional peer dependency |
| `rollup.config.js` | Add `sol-solidos` entry, mark `mashlib` external |
| `solid-web-components.bundle.js` | Import `./sol-solidos.js` |
| `CLAUDE.md` | Update component list, exports, architecture, events |

### 5. Manual browser testing (~1-2 hours)

Test against a real Solid pod:
- Gear menu opens outliner for a file
- Gear menu on a different file navigates the same outliner (no reinit)
- Switching handler attribute between podz and solidos
- Auth works through the outliner
- Modal close/reopen preserves outliner state

### 6. Unit tests for handler branching (~1 hour)

Test the `sol-pod` handler attribute logic and `_getSolidosEl` persistence. mashlib itself can't be unit-tested without a real store, but the branching and element reuse can be verified with mocks.

## Total estimate: ~6-8 hours

## Resolved questions

1. **mashlib import path** — `import mashlib from 'mashlib'` gives `$rdf`, `UI`, and `SolidLogic` which has `authn`, `authSession`, `store`, and `solidLogicSingleton`. Use the singleton.
2. **Outliner navigation API** — `outliner.GotoSubject(subject, expand, pane, solo, referrer, options)` (full signature).
3. **Bundle inclusion** — confirmed: keep mashlib external, not bundled.
4. **Shadow DOM feasibility** — confirmed: try shadow DOM first, fall back to light DOM with scoped CSS if needed.

## Dependencies

- `mashlib` npm package (or CDN)
- `@inrupt/solid-client-authn-browser` (already a dependency, used by mashlib internally)
- `rdflib` (already a dependency, shared with mashlib's `UI.store`)
