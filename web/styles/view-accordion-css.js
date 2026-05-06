import { sheetFrom } from '../../core/adopt.js';

export const CSS = `
  .sol-view-accordion {
    font-family: var(--font-ui, system-ui, sans-serif);
    color: var(--text, #212121);
  }
  .sol-view-accordion details {
    border: 1px solid var(--border, #e0e0e0);
    border-radius: 4px;
    margin-bottom: .35rem;
    background: var(--surface, #fff);
  }
  .sol-view-accordion summary {
    padding: .5rem .75rem;
    cursor: pointer;
    font-weight: 600;
    background: var(--hover, #f7f7f7);
    border-radius: 4px;
    list-style: none;
  }
  .sol-view-accordion details[open] summary {
    border-bottom: 1px solid var(--border, #e0e0e0);
    border-radius: 4px 4px 0 0;
  }
  .sol-view-accordion summary::-webkit-details-marker { display: none; }
  .sol-view-accordion summary::before {
    content: '▸';
    display: inline-block;
    width: 1em;
    transition: transform .15s;
  }
  .sol-view-accordion details[open] > summary::before {
    transform: rotate(90deg);
  }
  .sol-view-accordion dl {
    margin: 0;
    padding: .6rem .85rem;
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: .25rem .75rem;
    align-items: baseline;
  }
  .sol-view-accordion dt,
  .sol-view-accordion dd {
    font-size: var(--small-font, 16px);
    line-height: var(--line-height-base, 1.5);
  }
  .sol-view-accordion dt {
    color: var(--text-muted, #666);
    font-weight: var(--font-weight-bold, 600);
  }
  .sol-view-accordion dd {
    margin: 0;
    word-break: break-word;
  }
  .sol-view-accordion .accordion-body {
    padding: .6rem .85rem;
  }
  .sol-view-accordion a {
    color: var(--accent, #0066cc);
    text-decoration: none;
  }
  .sol-view-accordion a:hover { text-decoration: underline; }
`;
export const sheet = sheetFrom(CSS);
