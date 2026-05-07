// Styles for <sol-wac>. Injected via ensureDocStyle into whichever root
// hosts the element (document body for light-DOM, shadow root when sol-wac
// is rendered inside <sol-modal>).
import { sheetFrom } from '../../core/adopt.js';

export const CSS = `
  .acl-role-form { display: flex; flex-direction: column; gap: 6px; padding: 6px 2px; }
  .acl-role-row {
    display: flex; align-items: center; gap: 8px;
    padding: 7px 10px; border-radius: 6px;
    background: var(--surface-2, #f9f9f9);
  }
  .acl-role-row:hover { background: var(--focus-bg, #e3f2fd); }
  .acl-role-name { font-size: 0.88em; font-weight: 600; color: var(--text, #212121); width: 68px; flex-shrink: 0; }
  .acl-grant-select {
    font-size: 0.88em; padding: 4px 8px;
    border: 1px solid var(--border, #e0e0e0); border-radius: 4px;
    background: var(--surface, #fff); color: var(--text, #212121);
    cursor: pointer; font-family: inherit;
  }
  .acl-save-btn { margin-left: auto; flex-shrink: 0; }
  .acl-specific-count {
    font-size: 0.72em; font-weight: 700;
    background: var(--accent, #2196f3); color: #fff;
    border-radius: 10px; padding: 1px 7px; min-width: 18px;
    text-align: center; flex-shrink: 0;
  }
  .acl-default-wrap {
    display: flex; align-items: center; gap: 4px;
    font-size: 0.78em; color: var(--text-muted, #666);
    cursor: pointer; white-space: nowrap; flex-shrink: 0;
  }
  .acl-default-wrap input { cursor: pointer; accent-color: var(--accent, #2196f3); }
  .acl-default-global { margin-top: 6px; padding: 6px 10px; font-size: 0.85em; color: var(--text, #212121); }
  .acl-section-label { font-size: 0.82em; font-weight: 600; color: var(--text-muted, #666); text-transform: uppercase; letter-spacing: 0.04em; }
  .acl-agents-input {
    font-family: 'Fira Mono', monospace; font-size: 0.82em;
    width: 100%; border: 1px solid var(--border, #e0e0e0);
    border-radius: 4px; padding: 6px 8px; resize: vertical;
    background: var(--surface, #fff); color: var(--text, #212121);
  }
  .acl-specific-panel {
    display: flex; flex-direction: column; gap: 6px;
    padding: 8px 10px 10px 78px;
    background: var(--surface, #fff);
    border-top: 1px solid var(--border, #e0e0e0);
    margin-top: -1px;
  }
  .acl-banner {
    padding: 8px 12px; margin-bottom: 6px;
    font-size: 0.85em; color: var(--text, #212121);
    background: var(--focus-bg, #e3f2fd);
    border-left: 3px solid var(--accent, #2196f3);
    border-radius: 4px;
  }
  .acl-rdf-editor {
    font-family: 'Fira Mono', 'Consolas', monospace;
    font-size: 0.85em; flex: 1; min-height: 200px;
    width: 100%; resize: vertical;
    border: 1px solid var(--border, #e0e0e0);
    border-radius: 4px; padding: 10px;
    background: var(--surface, #fff); color: var(--text, #212121);
  }
  .acl-rdf-editor:focus { outline: none; border-color: var(--accent, #2196f3); }
  .acl-error {
    padding: 8px 12px; color: var(--error, #c62828);
    background: var(--error-bg, #ffebee); border-radius: 4px;
    font-size: 0.9em;
  }
`;

export const sheet = sheetFrom(CSS);
export default sheet;
