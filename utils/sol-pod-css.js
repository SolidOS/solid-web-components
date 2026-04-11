export const CSS = `
  :host {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--surface, #fff);
    border-radius: 8px;
    box-shadow: 0 2px 8px var(--shadow, rgba(0,0,0,0.1));
    font-family: system-ui, -apple-system, sans-serif;
    color: var(--text, #212121);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Pod header ──────────────────────────────────────────────────── */
  .pod-header {
    padding: 10px 14px;
    border-bottom: 1px solid var(--border, #e0e0e0);
    flex-shrink: 0;
    display: flex; flex-direction: column; gap: 6px;
  }
  .pod-header-row {
    display: flex; align-items: center; gap: 6px;
  }
  .pod-header select {
    flex: 1; padding: 6px 10px;
    border: 1px solid var(--border, #e0e0e0); border-radius: 4px;
    font-size: 0.9em;
    background: var(--surface, #fff); color: var(--text, #212121);
    font-family: inherit;
  }

  /* ── Breadcrumb ──────────────────────────────────────────────────── */
  .breadcrumb {
    padding: 10px 20px;
    background: var(--surface-2, #f9f9f9);
    border-bottom: 1px solid var(--border, #e0e0e0);
    font-size: 0.9em; color: var(--text-muted, #666);
    flex-shrink: 0;
  }
  .breadcrumb button {
    padding: 4px 8px; font-size: 0.9em; margin-right: 5px;
    background: var(--surface-2, #f9f9f9); border: none;
    color: var(--text-muted, #666); cursor: pointer;
    border-radius: 4px; font-family: inherit;
  }
  .breadcrumb button:hover { background: var(--hover, #f0f0f0); color: var(--accent, #2196f3); }

  /* ── Tree wrapper ────────────────────────────────────────────────── */
  .tree-wrapper {
    flex: 1; overflow-y: auto; overflow-x: hidden; padding: 10px;
  }
  .file-tree { list-style: none; }
  .file-tree li {
    display: flex; align-items: center;
    padding: 6px 12px; margin: 4px 0;
    border-radius: 4px; cursor: pointer;
    transition: background 0.2s; outline: none;
  }
  .file-tree li:hover { background: var(--hover, #f0f0f0); }
  .file-tree li:focus { background: var(--focus-bg, #e3f2fd); box-shadow: 0 0 0 2px var(--accent, #2196f3); }

  .item-label { flex: 1; word-break: break-word; min-width: 0; }

  .item-gear {
    flex-shrink: 0; background: none; border: none;
    padding: 2px 6px; font-size: 1em;
    color: var(--text-faint, #999); cursor: pointer;
    border-radius: 4px; margin-left: 6px;
    transition: color 0.15s;
  }
  .item-gear:hover { color: var(--accent-dark, #1976d2); background: var(--focus-bg, #e3f2fd); }

  .file-tree .folder { font-weight: 500; color: var(--folder-color, var(--accent-dark, #1976d2)); }
  .file-tree .file   { color: var(--file-color, #424242); }
  .file-tree li[draggable="true"] { cursor: grab; }
  .file-tree li.dragging { opacity: 0.5; cursor: grabbing; }

  .drag-over .tree-wrapper {
    background: var(--focus-bg, #e3f2fd);
    outline: 2px dashed #4caf50; outline-offset: -2px;
  }

  .loading { padding: 20px; text-align: center; color: var(--text-faint, #999); }
  .empty { padding: 20px; text-align: center; color: var(--text-faint, #999); font-style: italic; }

  /* ── Status toast ────────────────────────────────────────────────── */
  .status-toast {
    position: fixed; top: 52px; left: 50%; transform: translateX(-50%);
    z-index: 9998; display: none;
    align-items: center; gap: 10px;
    background: var(--surface, #fff);
    border: 1px solid var(--border, #e0e0e0);
    border-radius: 6px; padding: 8px 10px 8px 14px;
    font-size: 0.85em;
    box-shadow: 0 3px 14px var(--shadow, rgba(0,0,0,0.1));
    max-width: 420px; min-width: 160px;
    transition: opacity 0.4s ease;
  }
  .status-toast.error { background: #fff0f0; border-color: #f5c6cb; color: #c0392b; }
  .status-toast.success { color: var(--success, #388e3c); }
  .status-toast-close {
    background: none; border: none; cursor: pointer;
    font-size: 1.1em; color: inherit; opacity: 0.55;
    padding: 0 4px; line-height: 1; flex-shrink: 0;
  }
  .status-toast-close:hover { opacity: 1; }

  /* ── Modal extras (view/edit/graph/acl) ──────────────────────────── */
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

  /* ── ACL form ────────────────────────────────────────────────────── */
  .modal-subtabs { display: flex; gap: 0; border-bottom: 1px solid var(--border, #e0e0e0); margin-bottom: 12px; flex-shrink: 0; }
  .modal-subtab {
    background: none; border: none;
    border-bottom: 2px solid transparent; border-radius: 0;
    padding: 7px 16px; font-size: 0.85em;
    color: var(--text-muted, #666); cursor: pointer; margin-bottom: -1px;
    font-family: inherit;
  }
  .modal-subtab:hover { color: var(--accent-dark, #1976d2); }
  .modal-subtab.active { color: var(--accent-dark, #1976d2); border-bottom-color: var(--accent-dark, #1976d2); font-weight: 600; }

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
  .acl-edit-btn {
    background: none; border: 1px solid var(--border, #e0e0e0);
    border-radius: 4px; padding: 2px 7px; font-size: 0.88em;
    cursor: pointer; color: var(--text-muted, #666); flex-shrink: 0;
    font-family: inherit;
  }
  .acl-edit-btn:hover { background: var(--surface, #fff); color: var(--accent, #2196f3); border-color: var(--accent, #2196f3); }
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
  .acl-specific-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45);
    display: flex; align-items: center; justify-content: center;
    z-index: 3000;
  }
  .acl-specific-dialog {
    background: var(--surface, #fff); border-radius: 8px;
    padding: 20px; width: 400px; max-width: 92vw;
    display: flex; flex-direction: column; gap: 10px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.22);
  }
  .acl-specific-title { font-size: 1em; font-weight: 600; color: var(--text, #212121); }
  .acl-specific-btns { display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px; }

  /* ── Upload progress ─────────────────────────────────────────────── */
  .upload-progress { font-size: 0.88em; color: var(--text-muted, #666); min-height: 1.4em; padding: 4px 0; }

  /* ── CodeMirror ──────────────────────────────────────────────────── */
  .cm-editor-wrap {
    flex: 1; min-height: 0; overflow: hidden;
    border: 1px solid var(--border, #e0e0e0); border-radius: 4px;
    display: flex; flex-direction: column; position: relative;
  }
  .cm-editor-wrap .cm-editor { flex: 1; height: 100%; font-size: 0.85em; }
  .cm-editor-wrap .cm-scroller { font-family: 'Fira Mono', 'Consolas', monospace; overflow: auto; }

  /* ── Graph viewer ────────────────────────────────────────────────── */
  .graph-wrap {
    width: 100%; flex: 1; min-height: 0; overflow: hidden;
    border-radius: 6px; border: 1px solid var(--border, #e0e0e0);
    cursor: grab;
  }
  .graph-wrap:active { cursor: grabbing; }
  .graph-legend { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; padding: 8px 4px 0; font-size: 0.8em; }
  .graph-legend-item { font-weight: 600; }
  .graph-legend-note { color: var(--text-muted, #666); margin-left: auto; }

  /* ── Markdown preview ────────────────────────────────────────────── */
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

  /* ── HTML split editor ───────────────────────────────────────────── */
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

  /* ── Buttons ─────────────────────────────────────────────────────── */
  button { font-family: inherit; }
  button:focus { outline: 2px solid var(--accent, #2196f3); outline-offset: 2px; }
  .btn-secondary { background: var(--hover, #f0f0f0); color: var(--text, #212121); border: none; border-radius: 4px; cursor: pointer; }
  .btn-secondary:hover { background: var(--border, #e0e0e0); }
`;
