import { sheetFrom } from '../../core/adopt.js';

export const CSS = `
  :host {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    font-family: var(--font-ui, system-ui, -apple-system, sans-serif);
    box-sizing: border-box;
  }

  .sol-form-loading,
  .sol-form-error {
    padding: 1em;
  }
  .sol-form-error {
    color: #c00;
    white-space: pre-wrap;
  }

  /* ── form body rendered by solid-ui ── */
  .sol-form-body {
    flex: 1;
    overflow: auto;
    padding: 0.75em;
  }
  .sol-form-body input[type="text"],
  .sol-form-body input[type="url"],
  .sol-form-body select,
  .sol-form-body textarea {
    font-family: inherit;
    font-size: 0.95em;
    padding: 4px 6px;
    border: 1px solid var(--border, #ccc);
    border-radius: 3px;
    box-sizing: border-box;
  }
  .sol-form-body input:focus,
  .sol-form-body select:focus,
  .sol-form-body textarea:focus {
    outline: 2px solid var(--accent, #3b82f6);
    outline-offset: -1px;
  }

  /* ── fallback form renderer ── */
  .sf-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .sf-field {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .sf-label {
    font-weight: 500;
    font-size: 0.9em;
    color: var(--text-muted, #374151);
  }
  .sf-multiple {
    border: 1px solid var(--border, #e0e0e0);
    border-radius: 4px;
    padding: 8px;
    background: var(--bg-subtle, rgba(0,0,0,.02));
  }
  .sf-multiple .sf-multiple {
    background: var(--bg-subtle2, rgba(0,0,0,.03));
  }
  .sf-multiple-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  .sf-multiple-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .sf-multiple-item {
    border: 1px solid var(--border, #d1d5db);
    border-radius: 4px;
    padding: 8px;
    background: var(--bg, #fff);
  }
  .sf-item-actions {
    display: flex;
    gap: 4px;
    justify-content: flex-end;
    margin-bottom: 6px;
  }
  .sf-btn {
    padding: 2px 8px;
    border: 1px solid var(--border, #d1d5db);
    border-radius: 3px;
    background: var(--bg, #fff);
    cursor: pointer;
    font-size: 0.8em;
    font-family: inherit;
  }
  .sf-btn:hover { background: var(--bg-hover, #f3f4f6); }
  .sf-btn-add {
    background: var(--accent, #3b82f6);
    color: #fff;
    border-color: var(--accent, #3b82f6);
    padding: 3px 12px;
    font-size: 0.85em;
  }
  .sf-btn-add:hover { background: var(--accent-hover, #2563eb); }
  .sf-btn-remove {
    color: #dc2626;
    border-color: #fca5a5;
  }
  .sf-btn-remove:hover { background: #fef2f2; }
  .sf-btn-move {
    font-size: 0.75em;
    padding: 2px 6px;
  }
  .sf-options { margin-top: 4px; }
  .sf-depth-cap {
    color: var(--text-muted, #6b7280);
    font-style: italic;
    font-size: 0.85em;
    padding: 4px;
  }

  /* ── validation errors ── */
  .sol-form-field-error {
    color: #c00;
    font-size: 0.85em;
    margin-top: 2px;
  }
  .sol-form-validation-summary {
    background: #fef2f2;
    border: 1px solid #fca5a5;
    border-radius: 4px;
    padding: 0.5em 0.75em;
    margin-bottom: 0.75em;
    color: #991b1b;
    font-size: 0.9em;
  }
  .sol-form-validation-summary ul {
    margin: 0.25em 0 0 1.25em;
    padding: 0;
  }

  /* ── save bar ── */
  .sol-form-save-bar {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0.75em;
    border-top: 1px solid var(--border, #e0e0e0);
    background: var(--bg-muted, #f9fafb);
  }
  .sol-form-save-options {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.9em;
  }
  .sol-form-save-options label {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
  }
  .sol-form-pod-url {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .sol-form-pod-url input {
    flex: 1;
    font-family: inherit;
    font-size: 0.9em;
    padding: 4px 6px;
    border: 1px solid var(--border, #ccc);
    border-radius: 3px;
  }
  .sol-form-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .sol-form-btn {
    padding: 6px 16px;
    border: none;
    border-radius: 4px;
    font-size: 0.9em;
    cursor: pointer;
    font-family: inherit;
  }
  .sol-form-btn-primary {
    background: var(--accent, #3b82f6);
    color: #fff;
  }
  .sol-form-btn-primary:hover {
    background: var(--accent-hover, #2563eb);
  }
  .sol-form-btn-primary:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
  .sol-form-save-status {
    font-size: 0.85em;
    margin-left: 8px;
  }
  .sol-form-save-status.ok { color: #16a34a; }
  .sol-form-save-status.err { color: #c00; }
`;

export const sheet = sheetFrom(CSS);
