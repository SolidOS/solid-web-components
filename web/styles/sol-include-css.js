import { sheetFrom } from '../../core/adopt.js';

export const CSS = `
  :host {
    display: block;
    color: var(--text, #212121);
    font-family: var(--font-ui, system-ui, sans-serif);
    font-size: var(--font-size, var(--medium-font, 20px));
  }
  .si-content { }
  .si-raw {
    white-space: pre-wrap;
    font-family: var(--font-mono, monospace);
    font-size: var(--small-font, 16px);
    background: var(--code-bg, #f4f4f4);
    color: var(--text, #212121);
    padding: var(--space-xl, 16px);
    border-radius: var(--radius-sm, 4px);
    overflow-x: auto;
  }
  .si-loading { color: var(--text-muted, #666); padding: var(--space-lg, 12px); font-style: italic; }
  .si-empty   { color: var(--text-muted, #888); padding: var(--space-lg, 12px); font-style: italic; }
  .si-error {
    color: var(--error, #c00);
    padding: var(--space-lg, 12px) var(--space-xl, 16px);
    background: color-mix(in srgb, var(--error, #e74c3c) 12%, transparent);
    border: 1px solid var(--error, #fcc);
    border-radius: var(--radius-sm, 4px);
  }

  .si-content h1, .si-content h2, .si-content h3,
  .si-content h4, .si-content h5, .si-content h6 {
    margin: 1.1em 0 .4em; line-height: var(--line-height-tight, 1.25);
  }
  .si-content p { margin: 0 0 .75em; }
  .si-content ul, .si-content ol { margin: 0 0 .75em 1.5em; }
  .si-content li { margin: .2em 0; }
  .si-content pre {
    background: var(--include-code-bg, var(--code-bg, #f4f4f4));
    padding: var(--include-pre-padding, var(--space-lg, 12px));
    border-radius: var(--radius-sm, 4px);
    overflow-x: auto;
  }
  .si-content code {
    background: var(--include-code-bg, var(--code-bg, #f0f0f0));
    padding: var(--include-code-padding, .1em .3em);
    border-radius: var(--radius-sm, 4px);
    font-size: var(--small-font, 16px);
    font-family: var(--font-mono, monospace);
  }
  .si-content pre code { background: none; padding: 0; }
  .si-content blockquote {
    border-left: 3px solid var(--include-blockquote-border, var(--border, #ccc));
    margin: 0 0 .75em 0;
    padding: .25em 1em;
    color: var(--include-blockquote-color, var(--text-muted, #555));
  }
  .si-content a { color: var(--accent, #0066cc); }
  .si-content a:hover { text-decoration: underline; }
  .si-content a:focus-visible {
    outline: 2px solid var(--accent, #4a9eff);
    outline-offset: 2px;
  }
  .si-content img { max-width: 100%; }
  .si-content table { border-collapse: collapse; margin-bottom: .75em; }
  .si-content th, .si-content td {
    border: 1px solid var(--border, #ddd);
    padding: .3em .6em;
  }
  .si-content th { background: var(--hover, #f5f5f5); }
`;

export const sheet = sheetFrom(CSS);
export default sheet;
