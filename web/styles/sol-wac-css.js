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
  .acl-mode-tag { display: none; }
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

  /* Phone (coarse pointer): the 5-column table is ~680px wide — unusable at
     360px. Re-lay the SAME DOM as one stacked card per who-row; each mode
     cell's hidden tag becomes a full-width 44px toggle chip (the invisible
     checkbox stretches over the chip, so the whole chip is the tap target).
     Desktop is untouched: every rule here is coarse-gated. */
  @media (hover: none) and (pointer: coarse) {
    .acl-matrix, .acl-matrix tbody { display: block; width: 100%; }
    .acl-matrix thead { display: none; }
    .acl-matrix tr {
      display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
      border: 1px solid var(--border, #e0e0e0); border-radius: 10px;
      padding: 12px; margin-bottom: 10px;
    }
    .acl-matrix td { border: none; padding: 0; }
    .acl-matrix td.acl-who {
      grid-column: 1 / -1; background: none;
      white-space: normal; word-break: break-word;
      padding-bottom: 2px;
    }
    .acl-matrix td.acl-mode-cell { display: block; }
    .acl-mode-chip {
      position: relative; display: block; width: 100%; cursor: pointer;
    }
    .acl-mode-chip input[type="checkbox"] {
      position: absolute; inset: 0; width: 100%; height: 100%;
      margin: 0; opacity: 0;
    }
    .acl-mode-tag {
      display: flex; align-items: center; justify-content: center;
      min-height: 44px; padding: 0 10px; border-radius: 999px;
      border: 1px solid var(--input-border, #9aa0a8);
      background: var(--surface-2, #f9f9f9); color: var(--text, #212121);
      font-size: 16px; text-align: center;
    }
    .acl-mode-chip input:checked + .acl-mode-tag {
      background: var(--accent, #2196f3);
      border-color: var(--accent, #2196f3);
      color: #fff;
    }
    .acl-mode-chip input:checked + .acl-mode-tag::before { content: '✓ '; }
    .acl-mode-chip input:focus-visible + .acl-mode-tag {
      outline: 2px solid var(--accent, #2196f3); outline-offset: 2px;
    }
    .acl-agent-cell { flex-direction: column; align-items: stretch; }
    .acl-webid-input { min-width: 0; min-height: 44px; }
    .acl-kind-select { min-height: 44px; }
    .acl-add-agent { min-height: 44px; }
    .acl-default-wrap { white-space: normal; }
    .acl-default-wrap input { width: 24px; height: 24px; flex-shrink: 0; }
    .acl-default-global { min-height: 44px; align-items: center; }
  }
`;

export const sheet = sheetFrom(CSS);
export default sheet;
