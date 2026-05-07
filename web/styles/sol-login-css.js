import { sheetFrom } from '../../core/adopt.js';
import { BTN_CSS } from './buttons-css.js';

export const CSS = BTN_CSS + `
  :host {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .auth-status {
    font-size: 0.7em;
    color: var(--text-muted, #666);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 220px;
  }
  .auth-status.logged-in { color: var(--success, #388e3c); }

  /* Login/logout buttons use .sol-btn .sol-btn-sm with .sol-btn-primary / .sol-btn-danger. */

  .dropdown {
    position: fixed; z-index: 9999;
    background: var(--surface, #fff);
    border: 1px solid var(--border, #e0e0e0);
    border-radius: 6px;
    box-shadow: 0 6px 18px var(--shadow, rgba(0,0,0,0.1));
    padding: 8px;
    min-width: 240px; max-width: 340px;
    display: none;
  }
  .dropdown.open { display: block; }

  .issuer-list { display: flex; flex-direction: column; gap: 2px; margin-bottom: 8px; }
  .issuer-list:empty { display: none; }

  .issuer-item {
    text-align: left; background: none; border: none;
    padding: 5px 8px; border-radius: 4px;
    cursor: pointer; font-size: 0.84em;
    color: var(--text, #212121);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    font-family: inherit;
  }
  .issuer-item:hover { background: var(--hover, #f0f0f0); color: var(--accent, #2196f3); }

  .custom-row { display: flex; gap: 4px; }
  .custom-row .sol-btn { padding: 3px 8px; font-size: 0.82em; }
  .custom-row .issuer-input {
    flex: 1; min-width: 0; font-size: 0.82em; padding: 3px 6px;
    background: var(--bg, #f5f5f5);
  }
`;

export const sheet = sheetFrom(CSS);
export default sheet;
