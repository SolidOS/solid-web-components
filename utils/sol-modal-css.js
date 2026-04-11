export const CSS = `
  :host { display: contents; }

  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.6);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000;
    font-family: system-ui, -apple-system, sans-serif;
    color: var(--text, #212121);
  }

  .modal {
    background: var(--surface, #fff);
    border-radius: 8px;
    box-shadow: 0 8px 40px var(--shadow-heavy, rgba(0,0,0,0.3));
    width: min(960px, 96vw);
    height: min(96vh, 960px);
    display: flex; flex-direction: column;
    overflow: hidden;
  }
  :host([size="small"]) .modal { max-width: 420px; height: auto; min-height: 0; }

  .modal-header {
    display: flex; align-items: center;
    padding: 14px 20px;
    border-bottom: 1px solid var(--border, #e0e0e0);
    gap: 12px; flex-shrink: 0;
  }

  .modal-title {
    flex: 1; font-weight: 600; font-size: 1em;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  .modal-header-actions {
    display: flex; align-items: center; gap: 6px; margin-right: 4px;
  }

  .modal-close {
    background: none; border: none; font-size: 1.1em;
    color: var(--text-muted, #666); cursor: pointer;
    padding: 4px 8px; border-radius: 4px;
  }
  .modal-close:hover { background: var(--hover, #f0f0f0); color: var(--text, #212121); }

  .modal-tabs {
    display: flex;
    border-bottom: 1px solid var(--border, #e0e0e0);
    padding: 0 12px; gap: 2px; flex-shrink: 0;
  }

  .modal-tab {
    background: none; border: none;
    border-bottom: 3px solid transparent;
    border-radius: 0; padding: 10px 14px;
    font-size: 0.9em; color: var(--text-muted, #666);
    cursor: pointer; margin-bottom: -1px; font-family: inherit;
  }
  .modal-tab:hover { color: var(--accent-dark, #1976d2); }
  .modal-tab.active {
    color: var(--accent-dark, #1976d2);
    border-bottom-color: var(--accent-dark, #1976d2);
    font-weight: 600;
  }

  .modal-body {
    flex: 1; overflow-y: auto; padding: 16px 20px;
    display: flex; flex-direction: column; gap: 12px;
    min-height: 0;
  }

  .modal-footer {
    display: flex; gap: 10px; align-items: center;
    padding: 12px 20px;
    border-top: 1px solid var(--border, #e0e0e0);
    flex-shrink: 0;
    background: var(--surface-2, #f9f9f9);
  }
  .modal-footer:empty { display: none; }

  /* Shared button styles */
  .modal-header-btn {
    padding: 3px 10px; font-size: 0.82em;
    border: 1px solid var(--border, #e0e0e0); border-radius: 4px;
    background: var(--surface-2, #f9f9f9);
    color: var(--text-muted, #666); cursor: pointer; font-family: inherit;
  }
  .modal-header-btn:hover { background: var(--hover, #f0f0f0); color: var(--text, #212121); }
  .modal-header-btn-primary { background: var(--accent, #2196f3); color: #fff; border-color: var(--accent-dark, #1976d2); }
  .modal-header-btn-primary:hover { background: var(--accent-dark, #1976d2); color: #fff; }
  .modal-header-btn-primary:disabled { background: #ccc; border-color: #ccc; }
  .modal-header-btn-danger { background: var(--error, #d32f2f); color: #fff; border-color: var(--error, #d32f2f); }
  .modal-header-btn-danger:hover { opacity: 0.85; }

  .modal-action-btn {
    padding: 2px 9px; font-size: 0.8em;
    border: 1px solid var(--border, #e0e0e0); border-radius: 4px;
    background: none; color: var(--text-muted, #666);
    cursor: pointer; font-family: inherit;
  }
  .modal-action-btn:hover { background: var(--hover, #f0f0f0); color: var(--text, #212121); }
  .modal-action-btn.primary { background: var(--accent, #2196f3); color: #fff; border-color: var(--accent, #2196f3); }
  .modal-action-btn.primary:hover { opacity: 0.88; }

  .modal-zoom-pct { font-size: 0.8em; color: var(--text-muted, #666); min-width: 3em; text-align: center; }

  .modal-input {
    width: 100%; padding: 8px 12px;
    border: 1px solid var(--border, #e0e0e0); border-radius: 4px;
    font-size: 0.95em; font-family: inherit;
    background: var(--surface, #fff); color: var(--text, #212121);
  }
  .modal-input:focus { outline: none; border-color: var(--accent, #2196f3); box-shadow: 0 0 0 2px rgba(33,150,243,0.2); }

  .modal-label { font-size: 0.9em; color: var(--text-muted, #666); }
  .modal-message { padding: 8px 0; color: var(--text-muted, #666); font-size: 0.95em; }
  .modal-message.error { color: var(--error, #d32f2f); }
  .modal-note { font-size: 0.8em; color: var(--text-faint, #999); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .modal-info-banner {
    background: var(--warning-bg, #fff8e1);
    border: 1px solid var(--warning-border, #ffe082);
    border-radius: 4px; padding: 8px 12px;
    font-size: 0.88em; color: var(--warning-text, #5d4037);
    flex-shrink: 0;
  }
`;
