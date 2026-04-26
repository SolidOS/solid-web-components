import { sheetFrom } from '@solid-components/core/adopt.js';
import { BTN_CSS } from './buttons-css.js';

export const CSS = BTN_CSS + `
  :host {
    display: block;
    font-family: var(--font-ui, system-ui, sans-serif);
    font-size: var(--font-size, 1rem);
    color: var(--text, #212121);
  }
  .container { overflow-x: auto; }

  /* ── table ── */
  table { border-collapse: collapse; margin: 0 0 .5rem; font-size: 1rem; }
  th, td {
    padding: 0.4rem 0.65rem;
    text-align: left;
    border: 1px solid var(--border, #ddd);
    overflow-wrap: break-word;
    word-break: break-word;
  }
  th {
    background-color: var(--th-color, var(--accent-dark, #2C3E51));
    color: var(--th-text-color, #fff);
    font-weight: 600;
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
  }
  th::after { content: '⇅'; margin-left: 5px; font-size: .75em; opacity: .55; }
  th[data-sort="asc"]::after  { content: '▲'; opacity: 1; }
  th[data-sort="desc"]::after { content: '▼'; opacity: 1; }
  tr:nth-child(even) { background-color: var(--even-color, var(--hover, #fafafa)); }

  /* ── dl ── */
  dl { margin: 0 0 .5rem; }
  dt { font-weight: 600; margin-top: .75rem; color: var(--text, #000); }
  dt:first-child { margin-top: 0; }
  dd { margin: .1rem 0 .2rem 1rem; }
  dd .dl-field { font-size: .85em; color: var(--text-muted, #666); font-weight: 600; }
  .dl-value { color: var(--text, #000); }

  /* ── list ── */
  ul.result-list { margin: .5rem 0 .5rem 1.5rem; }
  ul.result-list li { margin: .2rem 0; }

  /* ── meta ── */
  .single-value { display: block; padding: 1rem; font-size: 1.1em; }
  .sol-subject-header {
    margin: 0 0 .5rem;
    padding: 0 0 .35rem;
    font-size: 1.4em;
    color: var(--text, #222);
    border-bottom: 1px solid var(--border, #e4e4e4);
  }
  .loading { padding: 1rem; color: var(--text-muted, #666); }
  .error {
    padding: 1rem;
    color: var(--error, #c00);
    background-color: color-mix(in srgb, var(--error, #e74c3c) 12%, transparent);
    border: 1px solid var(--error, #fcc);
    border-radius: 4px;
  }
  a { color: var(--accent, #0066cc); text-decoration: none; }
  a:hover { text-decoration: underline; }
  a.bnode-link { font-style: italic; color: var(--text-muted, #777); }
  a.bnode-link:hover { color: var(--accent, #0066cc); }

  /* ── subject nav + sections (multi-subject pivot) ── */
  .subject-nav {
    display: flex; flex-wrap: wrap; gap: 6px;
    padding: .5rem 0 .75rem;
    border-bottom: 1px solid var(--border, #ddd);
    margin-bottom: .75rem;
  }
  .subject-nav a {
    display: inline-block;
    padding: .25rem .6rem;
    border-radius: 4px;
    border: 1px solid var(--border, #ccc);
    font-size: .82em;
    background: var(--surface, #f5f5f5);
  }
  .subject-nav a:hover {
    background: var(--hover, #e8f0fe);
    border-color: var(--accent, #4a9eff);
  }
  .subject-section { margin-bottom: 1.5rem; }
  .subject-heading {
    font-size: .95em; font-weight: 600; margin: 0 0 .35rem;
    padding-bottom: .25rem;
    border-bottom: 1px solid var(--border, #eee);
  }

  /* ── blank-node modal ── */
  .bnode-modal {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: 9999;
    align-items: center;
    justify-content: center;
  }
  .bnode-modal.active { display: flex; }
  .bnode-modal-inner {
    background: var(--surface, #fff);
    color: var(--text, #212121);
    border-radius: 6px;
    padding: 1.25rem 1.5rem 1.5rem;
    max-width: min(90vw, 700px);
    max-height: 80vh;
    overflow: auto;
    position: relative;
    box-shadow: 0 8px 24px var(--shadow, rgba(0,0,0,0.25));
  }
  .bnode-modal-body { overflow-x: auto; margin-top: .5rem; }
  .bnode-modal-close {
    position: absolute;
    top: .5rem; right: .5rem;
    border-radius: 50%;
    width: 1.6rem; height: 1.6rem;
    padding: 0;
    font-size: 1rem; line-height: 1;
  }
`;

export const sheet = sheetFrom(CSS);
export default sheet;
