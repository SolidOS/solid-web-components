import { sheetFrom } from '../shared/adopt.js';
import { BTN_CSS } from './buttons-css.js';

export const CSS = BTN_CSS + `
  .sol-view-rolodex {
    display: inline-block;
    min-width: 260px;
    max-width: 100%;
    outline: none;
    font-family: var(--font-ui, system-ui, sans-serif);
    color: var(--text, #212121);
  }
  .sol-view-rolodex:focus-visible .rolodex-card {
    box-shadow: 0 0 0 2px var(--accent, #4a9eff);
  }
  .rolodex-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: .5rem;
    margin-bottom: .4rem;
  }
  /* Rolodex nav buttons use .sol-btn .sol-btn-icon. */
  .rolodex-counter {
    font-size: .85em;
    color: var(--text-muted, #666);
  }
  .rolodex-card {
    border: 1px solid var(--border, #e0e0e0);
    border-radius: 6px;
    background: var(--surface, #fff);
    padding: .85rem 1rem;
    box-shadow: 0 1px 3px var(--shadow, rgba(0,0,0,.05));
    cursor: pointer;
    transition: box-shadow .15s;
  }
  .rolodex-card:hover { box-shadow: 0 2px 8px var(--shadow, rgba(0,0,0,.1)); }
  .rolodex-card dl {
    margin: 0;
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: .3rem .85rem;
  }
  .rolodex-card dt {
    font-size: .8em;
    text-transform: uppercase;
    letter-spacing: .03em;
    color: var(--text-muted, #888);
    font-weight: 600;
  }
  .rolodex-card dd {
    margin: 0;
    word-break: break-word;
  }
  .rolodex-card a { color: var(--accent, #0066cc); text-decoration: none; }
  .rolodex-card a:hover { text-decoration: underline; }
`;
export const sheet = sheetFrom(CSS);
