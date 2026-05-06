// Shared button + form-control rules used across all sol-* components.
// Each component's *-css.js string prepends BTN_CSS so the rules reach
// the component's shadow scope (or light-DOM root, via ensureDocStyle).
//
// Base class:  .sol-btn      — default (medium) button
// Sizes:       .sol-btn-sm   — compact (used in headers, auth, chips)
//              .sol-btn-icon — square icon/nav button (prev/next arrows)
// Variants:    .sol-btn-primary, .sol-btn-danger, .sol-btn-ghost
// Inputs:      .sol-input, .sol-select-control
//
// All colors resolve from root.css vars with sensible fallbacks.

import { sheetFrom } from '../../core/adopt.js';

export const BTN_CSS = `
  .sol-btn {
    font: inherit;
    font-family: var(--font-ui, inherit);
    background: var(--surface, #fff);
    color: var(--text, #212121);
    border: 1px solid var(--border, #d0d0d0);
    border-radius: 4px;
    padding: 0.35em 0.8em;
    line-height: 1.2;
    cursor: pointer;
    white-space: nowrap;
    box-sizing: border-box;
  }
  .sol-btn:hover {
    background: var(--hover, #eaf2fb);
    border-color: var(--accent, #3498db);
    color: var(--text, #212121);
  }
  .sol-btn:focus-visible {
    outline: 2px solid var(--accent, #3498db);
    outline-offset: 1px;
  }
  .sol-btn[disabled],
  .sol-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .sol-btn-sm {
    padding: 3px 10px;
    font-size: 0.82em;
    border-radius: 4px;
  }

  .sol-btn-icon {
    padding: 0.25rem 0.6rem;
    font-size: 1.15em;
    line-height: 1;
  }

  .sol-btn-primary {
    background: var(--accent, #3498db);
    color: #fff;
    border-color: var(--accent, #3498db);
  }
  .sol-btn-primary:hover {
    background: var(--accent-dark, #2980b9);
    border-color: var(--accent-dark, #2980b9);
    color: #fff;
  }
  .sol-btn-primary:disabled,
  .sol-btn-primary[disabled] { background: #ccc; border-color: #ccc; color: #fff; }

  .sol-btn-danger {
    background: var(--error, #e74c3c);
    color: #fff;
    border-color: var(--error, #e74c3c);
  }
  .sol-btn-danger:hover {
    background: color-mix(in srgb, var(--error, #e74c3c) 85%, #000);
    border-color: color-mix(in srgb, var(--error, #e74c3c) 85%, #000);
    color: #fff;
  }

  .sol-btn-ghost {
    background: transparent;
    border-color: transparent;
    color: var(--text-muted, #666);
  }
  .sol-btn-ghost:hover {
    background: var(--hover, #f0f0f0);
    color: var(--text, #212121);
    border-color: transparent;
  }

  .sol-input, .sol-select-control {
    font: inherit;
    background: var(--surface, #fff);
    color: var(--text, #212121);
    border: 1px solid var(--border, #d0d0d0);
    border-radius: 4px;
    padding: 0.35em 0.55em;
    box-sizing: border-box;
  }
  .sol-input:focus, .sol-select-control:focus {
    outline: 2px solid var(--accent, #3498db);
    outline-offset: 1px;
    border-color: var(--accent, #3498db);
  }
`;

export const sheet = sheetFrom(BTN_CSS);
export default sheet;
