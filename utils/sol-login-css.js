export const CSS = `
  :host {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .auth-status {
    font-size: 0.7em;
    color: var(--text-muted, #666);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 220px;
  }
  .auth-status.logged-in { color: var(--success, #388e3c); }

  .auth-btn {
    background: none;
    border: 1px solid var(--border, #e0e0e0);
    border-radius: 4px;
    padding: 2px 10px;
    font-size: 0.78em;
    color: var(--text-muted, #666);
    cursor: pointer;
    white-space: nowrap;
    font-family: inherit;
  }
  .auth-btn:hover { background: var(--hover, #f0f0f0); }
  .auth-btn.login  { color: var(--accent, #2196f3); border-color: var(--accent, #2196f3); }
  .auth-btn.logout { color: var(--error, #d32f2f); border-color: var(--error, #d32f2f); }

  .dropdown {
    position: fixed; z-index: 9999;
    background: var(--surface, #fff);
    border: 1px solid var(--border, #e0e0e0);
    border-radius: 6px;
    box-shadow: 0 6px 18px var(--shadow, rgba(0,0,0,0.1));
    padding: 8px;
    min-width: 240px; max-width: 340px;
    display: none;
  }
  .dropdown.open { display: block; }

  .issuer-list { display: flex; flex-direction: column; gap: 2px; margin-bottom: 8px; }
  .issuer-list:empty { display: none; }

  .issuer-item {
    text-align: left; background: none; border: none;
    padding: 5px 8px; border-radius: 4px;
    cursor: pointer; font-size: 0.84em;
    color: var(--text, #212121);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    font-family: inherit;
  }
  .issuer-item:hover { background: var(--hover, #f0f0f0); color: var(--accent, #2196f3); }

  .custom-row { display: flex; gap: 4px; }

  .issuer-input {
    flex: 1; min-width: 0; padding: 3px 6px; font-size: 0.82em;
    border: 1px solid var(--border, #e0e0e0); border-radius: 4px;
    background: var(--bg, #f5f5f5); color: var(--text, #212121);
    font-family: inherit;
  }
  .issuer-input:focus { outline: none; border-color: var(--accent, #2196f3); }
`;
