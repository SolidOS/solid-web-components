import { sheetFrom } from '../../core/adopt.js';
import { BTN_CSS } from './buttons-css.js';

export const CSS = BTN_CSS + `
  :host {
    display: block;
    font-family: var(--font-ui, system-ui, sans-serif);
    font-size: var(--font-size, var(--medium-font, 20px));
    color: var(--text, #212121);
  }
  .container { overflow-x: auto; }

  /* ── table ── */
  table { border-collapse: collapse; margin: 0 0 .5rem; font-size: var(--medium-font, 20px); }
  th, td {
    padding: var(--query-cell-padding, var(--space-md, 8px) var(--space-lg, 12px));
    text-align: left;
    border: 1px solid var(--border, #ddd);
    overflow-wrap: break-word;
    word-break: break-word;
  }
  th {
    background-color: var(--query-th-bg, var(--th-color, var(--accent-dark, #2C3E51)));
    color: var(--query-th-color, var(--th-text-color, #fff));
    font-weight: var(--font-weight-bold, 600);
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
  }
  th::after { content: '⇅'; margin-left: var(--space-sm, 4px); font-size: var(--small-font, 16px); opacity: .55; }
  th:focus-visible {
    outline: 2px solid var(--accent, #4a9eff);
    outline-offset: -2px;
  }
  a:focus-visible,
  .bnode-modal-close:focus-visible {
    outline: 2px solid var(--accent, #4a9eff);
    outline-offset: 2px;
  }
  th[data-sort="asc"]::after  { content: '▲'; opacity: 1; }
  th[data-sort="desc"]::after { content: '▼'; opacity: 1; }
  tr:nth-child(even) { background-color: var(--query-row-alt-bg, var(--even-color, var(--hover, #fafafa))); }

  /* ── dl ── */
  dl { margin: 0 0 .5rem; }
  dt { font-weight: var(--font-weight-bold, 600); margin-top: .75rem; color: var(--text, #000); }
  dt:first-child { margin-top: 0; }
  dd { margin: .1rem 0 .2rem 1rem; }
  dd .dl-field { font-size: var(--small-font, 16px); color: var(--text-muted, #666); font-weight: var(--font-weight-bold, 600); }
  .dl-value { color: var(--text, #000); }

  /* ── list ── */
  ul.result-list { margin: .5rem 0 .5rem 1.5rem; }
  ul.result-list li { margin: .2rem 0; }

  /* ── meta ── */
  .single-value { display: block; padding: var(--space-xl, 16px); font-size: var(--medium-font, 20px); }
  .sol-subject-header {
    margin: 0 0 .5rem;
    padding: 0 0 .35rem;
    font-size: var(--large-font, 24px);
    color: var(--text, #222);
    border-bottom: 1px solid var(--border, #e4e4e4);
  }
  .loading { padding: var(--space-xl, 16px); color: var(--text-muted, #666); }
  .error {
    padding: var(--space-xl, 16px);
    color: var(--error, #c00);
    background-color: color-mix(in srgb, var(--error, #e74c3c) 12%, transparent);
    border: 1px solid var(--error, #fcc);
    border-radius: var(--radius-sm, 4px);
  }
  a { color: var(--query-link-color, var(--accent, #0066cc)); text-decoration: none; }
  a:hover { text-decoration: underline; }
  a.bnode-link { font-style: italic; color: var(--query-bnode-link-color, var(--text-muted, #777)); }
  a.bnode-link:hover { color: var(--query-link-color, var(--accent, #0066cc)); }

  /* ── subject nav + sections (multi-subject pivot) ── */
  .subject-nav {
    display: flex; flex-wrap: wrap; gap: var(--space-md, 8px);
    padding: var(--space-md, 8px) 0 var(--space-lg, 12px);
    border-bottom: 1px solid var(--border, #ddd);
    margin-bottom: var(--space-lg, 12px);
  }
  .subject-nav a {
    display: inline-block;
    padding: var(--space-sm, 4px) var(--space-md, 8px);
    border-radius: var(--radius-sm, 4px);
    border: 1px solid var(--border, #ccc);
    font-size: var(--small-font, 16px);
    background: var(--surface, #f5f5f5);
  }
  .subject-nav a:hover {
    background: var(--hover, #e8f0fe);
    border-color: var(--accent, #4a9eff);
  }
  .subject-section { margin-bottom: 1.5rem; }
  .subject-heading {
    font-size: var(--medium-font, 20px);
    font-weight: var(--font-weight-bold, 600);
    margin: 0 0 .35rem;
    padding-bottom: .25rem;
    border-bottom: 1px solid var(--border, #eee);
  }

  /* ── blank-node modal ── */
  .bnode-modal {
    display: none;
    position: fixed;
    inset: 0;
    background: var(--scrim, rgba(0,0,0,0.4));
    z-index: 9999;
    align-items: center;
    justify-content: center;
  }
  .bnode-modal.active { display: flex; }
  .bnode-modal-inner {
    background: var(--surface, #fff);
    color: var(--text, #212121);
    border-radius: var(--radius-md, 6px);
    padding: var(--space-xl, 16px) var(--space-2xl, 24px) var(--space-2xl, 24px);
    max-width: var(--bnode-modal-max-width, min(90vw, 700px));
    max-height: var(--bnode-modal-max-height, 80vh);
    overflow: auto;
    position: relative;
    box-shadow: var(--shadow-modal, 0 8px 24px rgba(0,0,0,0.25));
  }
  .bnode-modal-body { overflow-x: auto; margin-top: var(--space-md, 8px); }
  .bnode-modal-close {
    position: absolute;
    top: var(--space-md, 8px); right: var(--space-md, 8px);
    border-radius: 50%;
    width: 1.6rem; height: 1.6rem;
    padding: 0;
    font-size: var(--small-font, 16px); line-height: 1;
  }
`;

export const sheet = sheetFrom(CSS);
export default sheet;
