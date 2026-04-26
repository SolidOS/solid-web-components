import { sheetFrom } from '@solid-components/core/adopt.js';

export const CSS = `
  :host {
    display: flex; flex-direction: row;
    flex: 1; min-height: 0; min-width: 0;
    max-width: 100%; height: 100%;
    overflow: hidden;
    box-sizing: border-box;
    font-family:var(--font-ui) !important;
  }
  :host([orientation="horizontal"]) {
    flex-direction: column;
  }
  .sol-menu-embed {
    display: flex; flex-direction: column;
    flex: 1; min-height: 0; min-width: 0;
    width: 100%; max-width: 100%;
    overflow: auto;
  }

  .sol-menu-nav {
    display: flex; flex-direction: column;
    flex-shrink: 0;
    min-width: 140px; max-width: 260px;
    padding: 8px;
    gap: 2px;
    border-right: 1px solid var(--border, #e0e0e0);
    overflow-y: auto; overflow-x: hidden;
    scrollbar-width: thin;
    box-sizing: border-box;
  }
  :host([orientation="horizontal"]) > .sol-menu-nav {
    flex-direction: row;
    min-width: 0; max-width: 100%;
    padding: 6px 10px; gap: 4px;
    border-right: none;
    border-bottom: 1px solid var(--border, #e0e0e0);
    overflow-x: auto; overflow-y: hidden;
  }

  .sol-menu-nav button {
    background: none; border: none;
    text-align: left;
    padding: 8px 12px;
    border-radius: 4px;
    color: var(--text, black) !important;
    cursor: pointer; font-family: inherit;
    white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis;
    font-size:var(--font-size,16px) !important;
  }
  :host([orientation="horizontal"]) > .sol-menu-nav > button,
  :host([orientation="horizontal"]) > .sol-menu-nav > .sol-menu-group {
    flex-shrink: 0;
  }
  .sol-menu-nav button .sol-menu-icon {
    display: inline-flex; align-items: center;
    vertical-align: middle;
    pointer-events: none;
  }
  .sol-menu-nav button .sol-menu-icon svg {
    fill: currentColor;
  }
  .sol-menu-nav button .sol-menu-icon img {
    height: 1.2em; width: auto;
  }
  .sol-menu-nav button:hover {
    background: var(--hover, #f0f0f0);
    color: var(--accent-dark, #1976d2);
  }
  .sol-menu-nav button.active {
    background: var(--focus-bg, #e3f2fd);
    color: var(--accent-dark, #1976d2);
    font-weight: 600;
  }

  .sol-menu-group {
    position: relative;
    display: block;
  }
  .sol-menu-group-btn {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 600;
  }
  .sol-menu-group-btn::after {
    content: '▸';
    margin-left: auto;
    font-size: 0.8em;
    opacity: 0.7;
  }
  :host([orientation="horizontal"]) .sol-menu-nav > .sol-menu-group > .sol-menu-group-btn::after {
    content: '▾';
    margin-left: 4px;
  }
  .sol-menu-popup {
    display: none;
    position: fixed;
    min-width: 160px;
    padding: 6px;
    background: var(--surface, #fff);
    border: 1px solid var(--border, #e0e0e0);
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    z-index: 1000;
    flex-direction: column;
    gap: 2px;
  }
  .sol-menu-group.open > .sol-menu-popup {
    display: flex;
  }

  .sol-menu-content {
    flex: 1 1 0; min-height: 0; min-width: 0;
    max-width: 100%;
    display: flex; flex-direction: column;
    overflow: auto;
    padding: 16px 20px;
    box-sizing: border-box;
  }
  .sol-menu-content > * {
    min-width: 0; max-width: 100%;
  }
  .sol-menu-content img,
  .sol-menu-content video,
  .sol-menu-content iframe,
  .sol-menu-content table,
  .sol-menu-content pre {
    max-width: 100%;
  }
`;

export const sheet = sheetFrom(CSS);
export default sheet;
