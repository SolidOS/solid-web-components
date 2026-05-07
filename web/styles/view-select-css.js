import { sheetFrom } from '../../core/adopt.js';

export const CSS = `
  .sol-view-select {
    padding: .45rem .6rem;
    font: inherit;
    font-family: var(--font-ui, system-ui, sans-serif);
    color: var(--text, #212121);
    background: var(--surface, #fff);
    border: 1px solid var(--border, #ccc);
    border-radius: 4px;
    min-width: 240px;
    max-width: 100%;
  }
  .sol-view-select:focus {
    outline: 2px solid var(--accent, #4a9eff);
    outline-offset: 1px;
    border-color: var(--accent, #4a9eff);
  }
`;
export const sheet = sheetFrom(CSS);
