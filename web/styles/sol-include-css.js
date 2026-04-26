import { sheetFrom } from '@solid-components/core/adopt.js';

export const CSS = `
  :host { display: block; color: var(--text, #212121); font-family: var(--font-ui, system-ui, sans-serif); }
  .si-content { }
  .si-raw {
    white-space: pre-wrap;
    font-family: var(--font-mono, monospace);
    font-size: .9em;
    background: var(--code-bg, #f4f4f4);
    color: var(--text, #212121);
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
  }
  .si-loading { color: var(--text-muted, #666); padding: .75rem; font-style: italic; }
  .si-error {
    color: var(--error, #c00);
    padding: .75rem 1rem;
    background: color-mix(in srgb, var(--error, #e74c3c) 12%, transparent);
    border: 1px solid var(--error, #fcc);
    border-radius: 4px;
  }

  .si-content h1, .si-content h2, .si-content h3,
  .si-content h4, .si-content h5, .si-content h6 {
    margin: 1.1em 0 .4em; line-height: 1.25;
  }
  .si-content p { margin: 0 0 .75em; }
  .si-content ul, .si-content ol { margin: 0 0 .75em 1.5em; }
  .si-content li { margin: .2em 0; }
  .si-content pre {
    background: var(--code-bg, #f4f4f4);
    padding: .75rem;
    border-radius: 4px;
    overflow-x: auto;
  }
  .si-content code {
    background: var(--code-bg, #f0f0f0);
    padding: .1em .3em;
    border-radius: 3px;
    font-size: .9em;
    font-family: var(--font-mono, monospace);
  }
  .si-content pre code { background: none; padding: 0; }
  .si-content blockquote {
    border-left: 3px solid var(--border, #ccc);
    margin: 0 0 .75em 0;
    padding: .25em 1em;
    color: var(--text-muted, #555);
  }
  .si-content a { color: var(--accent, #0066cc); }
  .si-content a:hover { text-decoration: underline; }
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
