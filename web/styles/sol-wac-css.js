// Styles for <sol-wac>. Injected via ensureDocStyle into whichever root
// hosts the element (document body for light-DOM, shadow root when sol-wac
// is rendered inside <sol-modal>).
import { sheetFrom } from '../../core/adopt.js';

export const CSS = `
  .acl-matrix-form { display: flex; flex-direction: column; gap: 8px; padding: 6px 2px; }
  .acl-matrix { border-collapse: collapse; width: 100%; }
  .acl-matrix th, .acl-matrix td {
    border: 1px solid var(--border, #e0e0e0);
    padding: 6px 10px; font-size: max(16px, 0.85em);
  }
  .acl-matrix thead th {
    background: var(--th-color, var(--accent-dark, #2C3E51));
    color: #fff; font-weight: 600; text-align: center;
  }
  .acl-matrix td.acl-mode-cell { text-align: center; }
  .acl-matrix td.acl-who {
    background: var(--surface-2, #f9f9f9);
    color: var(--text, #212121); font-weight: 600; white-space: nowrap;
  }
  .acl-matrix input[type="checkbox"] {
    cursor: pointer; accent-color: var(--accent, #2196f3);
    width: 18px; height: 18px;
  }
  .acl-agent-cell { display: flex; align-items: center; gap: 6px; }
  .acl-webid-input {
    font-family: 'Fira Mono', monospace; font-size: max(16px, 0.82em);
    width: 100%; min-width: 220px;
    border: 1px solid var(--input-border, #9aa0a8); border-radius: 4px;
    padding: 4px 8px;
    background: var(--input-bg, #eef); color: var(--input-text, #1a1a1a);
  }
  .acl-kind-select {
    font-size: max(16px, 0.82em); padding: 4px 6px;
    border: 1px solid var(--input-border, #9aa0a8); border-radius: 4px;
    background: var(--input-bg, #eef); color: var(--input-text, #1a1a1a);
    cursor: pointer; font-family: inherit;
  }
  .acl-add-agent { align-self: flex-start; }
  .acl-save-btn { margin-left: auto; flex-shrink: 0; }
  .acl-default-wrap {
    display: flex; align-items: center; gap: 4px;
    font-size: max(16px, 0.78em); color: var(--text-muted, #666);
    cursor: pointer; white-space: nowrap; flex-shrink: 0;
  }
  .acl-default-wrap input { cursor: pointer; accent-color: var(--accent, #2196f3); }
  .acl-default-global { margin-top: 6px; padding: 6px 10px; font-size: max(16px, 0.85em); color: var(--text, #212121); }
  .acl-banner {
    padding: 8px 12px; margin-bottom: 6px;
    font-size: max(16px, 0.85em); color: var(--text, #212121);
    background: var(--focus-bg, #e3f2fd);
    border-left: 3px solid var(--accent, #2196f3);
    border-radius: 4px;
  }
  .acl-rdf-editor {
    font-family: 'Fira Mono', 'Consolas', monospace;
    font-size: max(16px, 0.85em); min-height: 200px;
    width: 100%; resize: none; overflow-y: hidden;
    border: 1px solid var(--input-border, #9aa0a8);
    border-radius: 4px; padding: 10px;
    background: var(--input-bg, #eef); color: var(--input-text, #1a1a1a);
  }
  .acl-rdf-editor:focus { outline: none; border-color: var(--accent, #2196f3); }
  .acl-error {
    padding: 8px 12px; color: var(--error, #c62828);
    background: var(--error-bg, #ffebee); border-radius: 4px;
    font-size: max(16px, 0.9em);
  }
`;

export const sheet = sheetFrom(CSS);
export default sheet;
