// Light-DOM styles for <sol-accordion>. Injected into the element's
// ownerDocument once per page (see ensureDocStyle in shared/adopt.js).
// Includes design tokens plus accordion rules.

export const CSS = `
:root {
  --bg: #f5f5f5;
  --surface: #ffffff;
  --border: #d0d0d0;
  --text: #2c3e50;
  --text-muted: #7f8c8d;
  --accent: #3498db;
  --accent-dark: #2980b9;
  --hover: #eaf2fb;
  --focus-bg: #ebf5fb;
  --code-bg: #f4f4f4;
  --error: #e74c3c;
  --success: #27ae60;
  --shadow: rgba(0,0,0,0.08);
  --font-size: 105%;
  --font-ui: 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #1a1a1a;
    --surface: #252525;
    --border: #3e3e3e;
    --text: #e0e0e0;
    --text-muted: #909090;
    --hover: #2e2e2e;
    --focus-bg: #2a2e34;
    --code-bg: #1e1e1e;
    --accent: #4dabf7;
    --accent-dark: #339af0;
  }
}
[data-theme="dark"] {
  --bg: #1a1a1a;
  --surface: #252525;
  --border: #3e3e3e;
  --text: #e0e0e0;
  --text-muted: #909090;
  --hover: #2e2e2e;
  --focus-bg: #2a2e34;
  --code-bg: #1e1e1e;
  --accent: #4dabf7;
  --accent-dark: #339af0;
}

.sol-accordion-wrapper details {
  border: 1px solid var(--border, #e0e0e0);
  border-radius: 4px;
  margin-bottom: .35rem;
  background: var(--surface, #fff);
}
.sol-accordion-wrapper summary {
  padding: .5rem .75rem;
  cursor: pointer;
  font-weight: 600;
  background: var(--hover, #f7f7f7);
  border-radius: 4px;
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.sol-accordion-wrapper details[open] summary {
  border-bottom: 1px solid var(--border, #e0e0e0);
  border-radius: 4px 4px 0 0;
}
.sol-accordion-wrapper summary::-webkit-details-marker { display: none; }
.sol-accordion-wrapper summary::after {
  content: '\\25BC';
  flex-shrink: 0;
  margin-left: 1em;
  transition: transform .15s;
}
.sol-accordion-wrapper details[open] > summary::after {
  transform: rotate(180deg);
}
.sol-accordion-wrapper .accordion-body {
  padding: .6rem .85rem;
}
.sol-accordion-wrapper .accordion-content-section {
  display: block;
  margin-bottom: .5rem;
}
.sol-accordion-wrapper .accordion-content-section:last-child {
  margin-bottom: 0;
}
.sol-accordion-wrapper a {
  color: var(--accent, #0066cc);
  text-decoration: none;
}
.sol-accordion-wrapper a:hover { text-decoration: underline; }
`;
