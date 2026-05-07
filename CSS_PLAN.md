# CSS Customization Plan — sol-menu, sol-query, sol-include

Goal: every "magic value" in these three stylesheets resolves to `var(--token, fallback)` so a host page can theme without forking CSS.

## 0. Fonts (DONE)

- `--small-font: 16px; --medium-font: 20px; --large-font: 24px;`
- `--font-size: var(--medium-font, 20px)` is the default base.
- `:host` of each component declares `font-size` so the chain works in shadow scope.
- No size resolves below 16px (the lone offender, `th::after` at .75em → 15px, now uses `--small-font`).

## 1. Spacing, sizing, radius tokens

Add to `root.css`:
```css
--space-xs: 2px;
--space-sm: 4px;
--space-md: 8px;
--space-lg: 12px;
--space-xl: 16px;
--space-2xl: 24px;
--radius-sm: 4px;
--radius-md: 6px;
```

Component-specific size knobs:
- sol-menu: `--menu-nav-min-width: 140px; --menu-nav-max-width: 260px; --menu-popup-min-width: 160px;`
- sol-query: `--bnode-modal-max-width: min(90vw, 700px); --bnode-modal-max-height: 80vh;`

Sweep raw `px` paddings/gaps/radii in the three component stylesheets and route them through these vars.

## 2. Colors / shadows / scrim

`root.css` already declares `--shadow`. Sweep remaining hex / rgba:
- sol-menu popup `box-shadow: 0 4px 12px rgba(0,0,0,0.12)` → `var(--shadow-popup, 0 4px 12px rgba(0,0,0,0.12))`.
- sol-query bnode modal `0 8px 24px var(--shadow, rgba(0,0,0,0.25))` → `var(--shadow-modal, 0 8px 24px rgba(0,0,0,0.25))`.
- sol-query backdrop `rgba(0,0,0,0.4)` → `var(--scrim, rgba(0,0,0,0.4))`.
- Audit anchor / link colors — already use `--accent`; nothing to change unless we want a `--link` alias.

## 3. Font-weight & line-height tokens

```css
--font-weight-normal: 400;
--font-weight-bold: 600;
--line-height-tight: 1.25;
--line-height-base: 1.5;
```

Replace literal `600` (sol-menu group/active, sol-query th/dt/.subject-heading/.dl-field) and the `1.25` line-height in sol-include headings.

## 4. Per-component theming knobs

Prefix-scoped vars so a page can target one component without leaking to others.

sol-menu:
- `--menu-button-padding`, `--menu-button-radius`, `--menu-active-bg`, `--menu-active-color`, `--menu-hover-bg`, `--menu-hover-color`.

sol-query:
- `--query-th-bg` (alias of existing `--th-color`), `--query-th-color` (alias of `--th-text-color`), `--query-row-alt-bg` (alias of `--even-color`), `--query-link-color`, `--query-bnode-link-color`, `--query-cell-padding`.

sol-include:
- `--include-code-bg`, `--include-code-padding`, `--include-blockquote-border`, `--include-blockquote-color`.

These layer on top of the global tokens — global vars stay the source of truth, prefix vars allow narrow overrides.

## 5. Cleanup / audit

- `root.css` declares `--text-muted` twice (lines 6 & 7); drop the first.
- Decide whether `[data-theme="dark"]` should redefine the new font / spacing scales (probably not, but document).
- Verify nothing else in the three stylesheets resolves below 16px after the spacing pass.
- After each step: `npm run bundle` and spot-check in browser.
