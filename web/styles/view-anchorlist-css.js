import { sheetFrom } from '../../core/adopt.js';

export const CSS = `
  .sol-view-anchorlist {
    list-style: none;
    padding: 0;
    margin: 0;
    font-family: var(--font-ui, system-ui, sans-serif);
    color: var(--text, #212121);
  }
  .sol-view-anchorlist li {
    padding: .3rem .5rem;
    border-bottom: 1px solid var(--border, #eee);
  }
  .sol-view-anchorlist li:last-child { border-bottom: none; }
  .sol-view-anchorlist a {
    color: var(--accent, #0066cc);
    text-decoration: none;
  }
  .sol-view-anchorlist a:hover { text-decoration: underline; }
`;
export const sheet = sheetFrom(CSS);
