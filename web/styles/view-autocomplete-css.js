import { sheetFrom } from '../../core/adopt.js';
import { BTN_CSS } from './buttons-css.js';

export const CSS = BTN_CSS + `
  .sol-view-autocomplete {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
    max-width: 100%;
    font-family: var(--font-ui, system-ui, sans-serif);
    color: var(--text, #212121);
  }
  .ac-input-wrapper {
    width: 100%;
    display: flex;
    gap: 0.5rem;
  }
  .sol-view-autocomplete input {
    flex: 1;
    padding: .5rem .65rem;
    font: inherit;
    background: var(--surface, #fff);
    color: var(--text, #212121);
    border: 1px solid var(--border, #ccc);
    border-radius: 4px;
    box-sizing: border-box;
  }
  .sol-view-autocomplete input:focus {
    outline: 2px solid var(--accent, #4a9eff);
    outline-offset: 1px;
    border-color: var(--accent, #4a9eff);
  }
  .ac-go-button { padding: .5rem 1rem; }
  .ac-list-wrapper {
    width: 100%;
    background: var(--surface, #fff);
    border: 1px solid var(--border, #ccc);
    border-radius: 4px;
    max-height: 220px;
    overflow-y: auto;
    box-shadow: 0 4px 12px var(--shadow, rgba(0,0,0,.08));
  }
  .sol-view-autocomplete .ac-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .sol-view-autocomplete .ac-list li {
    padding: .4rem .65rem;
    cursor: pointer;
    color: var(--text, #000);
  }
  .sol-view-autocomplete .ac-list li.active,
  .sol-view-autocomplete .ac-list li:hover {
    background: var(--hover, #eaf2fb);
  }
`;
export const sheet = sheetFrom(CSS);
