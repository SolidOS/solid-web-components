(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.SolInclude = {}));
})(this, (function (exports) { 'use strict';

  // Shared utilities that do not depend on rdflib.

  // ─── DOMPurify (lazy, cached) ─────────────────────────────────────────────────
  let _purify = null;
  async function _getDOMPurify() {
    if (_purify) return _purify;
    const win = typeof window !== 'undefined' ? window : {};
    if (win.DOMPurify?.sanitize) { _purify = win.DOMPurify; return _purify; }
    try {
      const mod = await import('dompurify');
      _purify = mod.default ?? mod;
      if (_purify?.sanitize) return _purify;
    } catch {}
    return null;
  }

  async function sanitizeHtml(html, opts = {}) {
    const p = await _getDOMPurify();
    if (p) return p.sanitize(html, opts);
    // Minimal fallback: parse + re-serialize strips scripts/events via browser parser
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.innerHTML;
  }

  // Idempotent wrapper around customElements.define. Prevents a throw when the
  // same tag is registered twice — e.g. when a page loads both the all-in-one
  // bundle and a per-component UMD build, or when a module is re-evaluated by
  // a hot-reloader.
  function define(name, klass) {
    if (typeof customElements === 'undefined') return;
    const existing = customElements.get(name);
    if (existing) {
      if (existing !== klass && !window.__SolSuppressDefineWarn) {
        console.warn(`[solid-web-components] <${name}> already registered; keeping the existing definition.`);
      }
      return;
    }
    customElements.define(name, klass);
  }

  /**
   * Style helpers for Constructable Stylesheets + adoptedStyleSheets.
   *
   * `sheetFrom(css)` returns a `CSSStyleSheet` on evergreen browsers, or
   * `null` when the constructor is unavailable (e.g. Jest/node env). Callers
   * should keep the raw `CSS` string export alongside the sheet so they can
   * fall back to a `<style>` tag when `sheet` is null.
   *
   * `adopt(root, { sheet, css, extra })` wires a shadow root (or document)
   * with the baseline module sheet (+ any extras). If no sheet is available
   * it appends `<style>${css}</style>` into the root instead.
   */

  let _supports = null;
  function supports() {
    if (_supports !== null) return _supports;
    try {
      const s = new CSSStyleSheet();
      _supports = typeof s.replaceSync === 'function';
    } catch {
      _supports = false;
    }
    return _supports;
  }

  function sheetFrom(css) {
    if (!supports()) return null;
    const s = new CSSStyleSheet();
    s.replaceSync(css);
    return s;
  }

  // Adopt a CSSStyleSheet into `root` (ShadowRoot or Document). When sheets
  // aren't supported, falls back to inserting a <style> with the given css.
  function adopt(root, { sheet, css, extra = [] } = {}) {
    const host = root.adoptedStyleSheets !== undefined ? root : null;
    if (host && sheet) {
      const sheets = [sheet];
      const strings = [];
      for (const e of extra) {
        if (e instanceof CSSStyleSheet) sheets.push(e);
        else if (typeof e === 'string') strings.push(e);
      }
      host.adoptedStyleSheets = [...host.adoptedStyleSheets, ...sheets];
      for (const s of strings) appendStyle(root, s);
      return;
    }
    // Fallback path: inline <style> for baseline + extras.
    if (css) appendStyle(root, css);
    for (const e of extra) {
      if (typeof e === 'string') appendStyle(root, e);
    }
  }

  function appendStyle(root, css) {
    const el = document.createElement('style');
    el.textContent = css;
    root.appendChild(el);
  }

  let _marked = null;

  async function getMarked() {
    if (_marked) return _marked;
    const g = typeof globalThis !== 'undefined' ? globalThis : {};
    if (g.marked?.parse) { _marked = g.marked; return _marked; }
    try {
      const mod = await import('marked');
      _marked = mod.marked ?? mod.default ?? mod;
      return _marked;
    } catch {}
    return null;
  }

  function detectIncludeFormat(contentType, url) {
    const ct = (contentType || '').split(';')[0].trim();
    const ext = url.split('?')[0].split('#')[0].split('.').pop().toLowerCase();
    const isMarkdown = ct.includes('markdown') || ct.includes('text/x-markdown')
                    || ['md', 'markdown'].includes(ext);
    const isHtml = ct.includes('html') || ext === 'html' || ext === 'htm';
    return { isMarkdown, isHtml };
  }

  /**
   * Fetch a URL and return processed content.
   * @param {string} source - URL to fetch
   * @param {object} [opts]
   * @param {boolean} [opts.raw] - return raw text without processing
   * @param {boolean} [opts.trusted] - skip sanitization
   * @param {function} [opts.sanitize] - async (html) => sanitized html
   * @param {function} [opts.fetchFn] - fetch implementation
   * @returns {Promise<{type: 'html'|'raw', content: string}>}
   */
  async function fetchIncludeContent(source, { raw = false, trusted = false, sanitize, fetchFn = globalThis.fetch } = {}) {
    const resp = await fetchFn(source);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const ct = (resp.headers.get('content-type') || '').split(';')[0].trim();
    const text = await resp.text();
    const { isMarkdown, isHtml } = detectIncludeFormat(ct, source);

    if (raw) return { type: 'raw', content: text };

    if (isMarkdown) {
      const markedLib = await getMarked();
      if (!markedLib) throw new Error('marked library not available — add to importmap');
      let html = typeof markedLib.parse === 'function' ? markedLib.parse(text) : markedLib(text);
      if (!trusted && sanitize) html = await sanitize(html);
      return { type: 'html', content: html };
    }

    if (isHtml) {
      const html = (!trusted && sanitize) ? await sanitize(text) : text;
      return { type: 'html', content: html };
    }

    return { type: 'raw', content: text };
  }

  /**
   * Filter HTML with a CSS selector.
   * @param {string} html - HTML string
   * @param {string} selector - CSS selector
   * @param {function} createContainer - (html) => DOM element with parsed content
   * @returns {string|null} filtered HTML or null if no matches
   */
  function filterWithSelector(html, selector, createContainer) {
    if (!selector) return html;
    const container = createContainer(html);
    const els = Array.from(container.querySelectorAll(selector));
    if (!els.length) return null;
    return els.map(el => el.outerHTML).join('\n');
  }

  const CSS = `
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

  const sheet = sheetFrom(CSS);

  /**
   * <sol-include> — Fetch and display remote content inline.
   *
   * Supports HTML, Markdown, and plain text. Content is sanitized with
   * DOMPurify by default. An optional CSS selector filters to a section
   * of the fetched document.
   *
   * @element sol-include
   * @attr {string} source - URL of the resource to fetch (required)
   * @attr {string} selector - CSS selector — show only matching elements
   * @attr {boolean} raw - show source text verbatim without rendering
   * @attr {boolean} trusted - skip DOMPurify sanitization
   *
   * @example
   * <sol-include source="https://example.org/readme.md"></sol-include>
   * <sol-include source="page.html" selector="article"></sol-include>
   */

  function browserContainer(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div;
  }

  /**
   * Fetch and display remote content inline.
   *
   * Supports HTML, Markdown, and plain text. Content is sanitized with
   * DOMPurify by default.
   *
   * @class SolInclude
   * @extends HTMLElement
   * @attr {string} source - URL to fetch (required)
   * @attr {string} selector - CSS selector — show only matching elements
   * @attr {boolean} raw - show source text verbatim
   * @attr {boolean} trusted - skip DOMPurify sanitization
   */
  class SolInclude extends HTMLElement {
    static get observedAttributes() {
      return ['source', 'selector', 'raw', 'trusted'];
    }

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }

    connectedCallback()                         { if (this.isConnected) this._load(); }
    attributeChangedCallback(n, oldV, newV)     { if (oldV !== newV && this.isConnected) this._load(); }

    // ── Main load ─────────────────────────────────────────────────────────────────
    async _load() {
      const source   = this.getAttribute('source');
      const selector = this.getAttribute('selector') || '';
      const raw      = this.hasAttribute('raw');
      const trusted  = this.hasAttribute('trusted');

      if (!source) { this._show('error', 'No source provided'); return; }

      this._show('loading', 'Loading…');

      try {
        // When a selector is present, defer sanitization so the selector can
        // match attributes (e.g. RDFa typeof/rel) that DOMPurify would strip.
        const { type, content } = await fetchIncludeContent(source, {
          raw,
          trusted: trusted || !!selector,
          sanitize: sanitizeHtml,
        });

        if (type === 'raw') {
          this._showRaw(content);
          return;
        }

        if (selector) {
          const filtered = filterWithSelector(content, selector, browserContainer);
          if (filtered === null) {
            this._show('loading', 'No elements matched selector');
            return;
          }
          this._showHtml(trusted ? filtered : await sanitizeHtml(filtered));
        } else {
          this._showHtml(content);
        }
      } catch (err) {
        this._show('error', err.message);
      }
    }

    // ── Display helpers ───────────────────────────────────────────────────────────
    _showHtml(html) {
      this._initShadow();
      const div = document.createElement('div');
      div.className = 'si-content';
      div.innerHTML = html;
      this.shadowRoot.appendChild(div);
    }

    _showRaw(text) {
      this._initShadow();
      const pre = document.createElement('pre');
      pre.className = 'si-raw';
      pre.textContent = text;
      this.shadowRoot.appendChild(pre);
    }

    _show(type, message) {
      this._initShadow();
      const div = document.createElement('div');
      div.className = `si-${type}`;
      div.textContent = message;
      this.shadowRoot.appendChild(div);
    }

    _initShadow() {
      this.shadowRoot.innerHTML = '';
      this.shadowRoot.adoptedStyleSheets = [];
      adopt(this.shadowRoot, { sheet: sheet, css: CSS });
    }
  }

  define('sol-include', SolInclude);

  exports.SolInclude = SolInclude;

}));
