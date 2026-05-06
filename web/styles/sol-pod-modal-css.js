// Styles that <sol-pod> renders *inside* <sol-modal>'s shadow root.
// Passed to a modal instance via `modal.styles = [sheet]` so the rules
// reach the modal's shadow scope — sol-pod's own sheet can't cross the
// boundary.
import { sheetFrom } from '../../core/adopt.js';
import { BTN_CSS } from './buttons-css.js';
import { CSS as WAC_CSS } from './sol-wac-css.js';

export const CSS = BTN_CSS + WAC_CSS + `
  .modal-preview {
    font-family: 'Fira Mono', 'Consolas', monospace;
    font-size: 0.85em; white-space: pre-wrap; word-break: break-all;
    background: var(--surface-2, #f9f9f9);
    border: 1px solid var(--border, #e0e0e0);
    border-radius: 4px; padding: 12px; flex: 1;
  }
  .modal-editor {
    font-family: 'Fira Mono', 'Consolas', monospace;
    font-size: 0.85em; flex: 1; min-height: 300px;
    border: 1px solid var(--border, #e0e0e0);
    border-radius: 4px; padding: 10px;
    resize: vertical; width: 100%;
    background: var(--surface, #fff); color: var(--text, #212121);
  }
  .modal-editor:focus { outline: none; border-color: var(--accent, #2196f3); }

  .modal-media { max-width: 100%; max-height: 55vh; display: block; margin: 0 auto; border-radius: 4px; }
  .modal-audio { width: 100%; margin-top: 12px; }
  .modal-pdf { width: 100%; height: 55vh; border: none; border-radius: 4px; flex: 1; }

  .upload-progress { font-size: 0.88em; color: var(--text-muted, #666); min-height: 1.4em; padding: 4px 0; }

  .cm-editor-wrap {
    flex: 1; min-height: 0; overflow: hidden;
    border: 1px solid var(--border, #e0e0e0); border-radius: 4px;
    display: flex; flex-direction: column; position: relative;
  }
  .cm-editor-wrap .cm-editor { flex: 1; height: 100%; font-size: 0.85em; }
  .cm-editor-wrap .cm-scroller { font-family: 'Fira Mono', 'Consolas', monospace; overflow: auto; }

  .graph-wrap {
    width: 100%; flex: 1; min-height: 0; overflow: hidden;
    border-radius: 6px; border: 1px solid var(--border, #e0e0e0);
    cursor: grab;
  }
  .graph-wrap:active { cursor: grabbing; }
  .graph-legend { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; padding: 8px 4px 0; font-size: 0.8em; }
  .graph-legend-item { font-weight: 600; }
  .graph-legend-note { color: var(--text-muted, #666); margin-left: auto; }

  .markdown-preview { padding: 16px 24px; line-height: 1.7; font-size: 0.95em; overflow-y: auto; flex: 1; }
  .markdown-preview h1,.markdown-preview h2,.markdown-preview h3,.markdown-preview h4 {
    margin: 1em 0 0.4em; font-weight: 700; border-bottom: 1px solid var(--border, #e0e0e0); padding-bottom: 4px;
  }
  .markdown-preview p { margin: 0.6em 0; }
  .markdown-preview code {
    font-family: 'Fira Mono', monospace; font-size: 0.88em;
    background: var(--surface-2, #f9f9f9); border: 1px solid var(--border, #e0e0e0);
    border-radius: 3px; padding: 1px 5px;
  }
  .markdown-preview pre {
    background: var(--surface-2, #f9f9f9); border: 1px solid var(--border, #e0e0e0);
    border-radius: 6px; padding: 12px 16px; overflow-x: auto; margin: 0.8em 0;
  }
  .markdown-preview pre code { background: none; border: none; padding: 0; }
  .markdown-preview a { color: var(--accent, #2196f3); text-decoration: underline; }
  .markdown-preview table { border-collapse: collapse; width: 100%; margin: 0.8em 0; }
  .markdown-preview th,.markdown-preview td { border: 1px solid var(--border, #e0e0e0); padding: 6px 12px; text-align: left; }
  .markdown-preview th { background: var(--surface-2, #f9f9f9); font-weight: 600; }

  .html-preview-pane { flex: 1; min-height: 0; border: 1px solid var(--border, #e0e0e0); border-radius: 6px 6px 0 0; overflow: hidden; }
  .html-preview-iframe { width: 100%; height: 100%; border: none; background: #fff; }
  .html-preview-divider {
    flex-shrink: 0; padding: 4px 12px; font-size: 0.75em;
    color: var(--text-muted, #666); text-align: center;
    background: var(--surface-2, #f9f9f9);
    border-left: 1px solid var(--border, #e0e0e0);
    border-right: 1px solid var(--border, #e0e0e0);
  }
  .html-editor-pane {
    flex: 1; min-height: 0; display: flex; flex-direction: column;
    border: 1px solid var(--border, #e0e0e0); border-radius: 0 0 6px 6px; overflow: hidden;
  }
  .html-editor-pane .cm-editor-wrap { flex: 1; border: none; border-radius: 0; }

  /* Triple table (raw-view) */
  .triple-table { width: 100%; border-collapse: collapse; font-size: 0.85em; }
  .triple-table th {
    text-align: left; padding: 6px;
    border-bottom: 2px solid var(--border, #e0e0e0);
  }
  .triple-table td {
    padding: 4px 6px;
    border-bottom: 1px solid var(--border, #e0e0e0);
    word-break: break-all;
  }

  /* Modal separator line */
  .modal-hr {
    border: none;
    border-top: 1px solid var(--border, #e0e0e0);
    margin: 8px 0;
  }

  /* Inline input+button row inside modal body */
  .modal-row {
    display: flex; align-items: center; gap: 8px;
  }
  .modal-row > .modal-input,
  .modal-row > input[type="text"] { flex: 1; min-width: 0; }
  .modal-row > input[type="file"] { flex: 1; min-width: 0; }
  .modal-row > .sol-btn { flex-shrink: 0; }

  /* Embedded sol-live-edit inside the pod modal */
  .pod-live-edit {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
  }
`;

export const sheet = sheetFrom(CSS);
export default sheet;
