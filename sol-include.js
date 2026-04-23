/**
 * <sol-include> — Fetch and display remote content inline.
 *
 * Supports HTML, Markdown, and plain text. Content is sanitized with
 * DOMPurify by default. An optional CSS selector filters to a section
 * of the fetched document.
 *
 * @element sol-include
 * @attr {string} source - URL of the resource to fetch (required)
 * @attr {string} wanted - CSS selector — show only matching elements
 * @attr {boolean} raw - show source text verbatim without rendering
 * @attr {boolean} trusted - skip DOMPurify sanitization
 *
 * @example
 * <sol-include source="https://example.org/readme.md"></sol-include>
 * <sol-include source="page.html" wanted="article"></sol-include>
 */
import { sanitizeHtml } from './shared/utils.js';
import { define } from './shared/define.js';
import { adopt } from './shared/adopt.js';
import { CSS as INCLUDE_CSS, sheet as includeSheet } from './styles/sol-include-css.js';

// ─── Lazy marked loader ────────────────────────────────────────────────────────
let _marked = null;
async function getMarked() {
  if (_marked) return _marked;
  const win = typeof window !== 'undefined' ? window : {};
  if (win.marked?.parse) { _marked = win.marked; return _marked; }
  try {
    const mod = await import('marked');
    _marked = mod.marked ?? mod.default ?? mod;
    return _marked;
  } catch {}
  return null;
}

// ─── SolInclude component ──────────────────────────────────────────────────────
// Attributes:
//   source   {string}  URL to fetch (required)
//   wanted   {string}  CSS selector — show only matching elements (HTML / rendered MD)
//   raw      {bool}    show source text without rendering
//   trusted  {bool}    skip DOMPurify sanitization
/**
 * Fetch and display remote content inline.
 *
 * Supports HTML, Markdown, and plain text. Content is sanitized with
 * DOMPurify by default.
 *
 * @class SolInclude
 * @extends HTMLElement
 * @attr {string} source - URL to fetch (required)
 * @attr {string} wanted - CSS selector — show only matching elements
 * @attr {boolean} raw - show source text verbatim
 * @attr {boolean} trusted - skip DOMPurify sanitization
 */
class SolInclude extends HTMLElement {
  static get observedAttributes() {
    return ['source', 'wanted', 'raw', 'trusted'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback()                         { if (this.isConnected) this._load(); }
  attributeChangedCallback(n, oldV, newV)     { if (oldV !== newV && this.isConnected) this._load(); }

  // ── Main load ─────────────────────────────────────────────────────────────────
  async _load() {
    const source  = this.getAttribute('source');
    const wanted  = this.getAttribute('wanted') || '';
    const raw     = this.hasAttribute('raw');
    const trusted = this.hasAttribute('trusted');

    if (!source) { this._show('error', 'No source provided'); return; }

    this._show('loading', 'Loading…');

    try {
      const resp = await fetch(source);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const ct   = (resp.headers.get('content-type') || '').split(';')[0].trim();
      const text = await resp.text();
      const ext  = source.split('?')[0].split('#')[0].split('.').pop().toLowerCase();

      const isMarkdown = ct.includes('markdown') || ct.includes('text/x-markdown')
                      || ['md', 'markdown'].includes(ext);
      const isHtml     = ct.includes('html') || ext === 'html' || ext === 'htm';

      if (raw) {
        this._showRaw(text);
        return;
      }

      if (isMarkdown) {
        const markedLib = await getMarked();
        if (!markedLib) throw new Error('marked library not available — add to importmap');
        let html = typeof markedLib.parse === 'function'
          ? markedLib.parse(text)
          : markedLib(text);
        if (!trusted) html = await sanitizeHtml(html);
        this._showHtml(html, wanted);
      } else if (isHtml) {
        const html = trusted ? text : await sanitizeHtml(text);
        this._showHtml(html, wanted);
      } else {
        // Plain text / unknown
        this._showRaw(text);
      }
    } catch (err) {
      this._show('error', err.message);
    }
  }

  // ── Display helpers ───────────────────────────────────────────────────────────
  _showHtml(html, selector) {
    this._initShadow();
    const div = document.createElement('div');
    div.className = 'si-content';

    if (selector) {
      // Parse into a temp DOM, extract matching nodes
      const tmp = document.createElement('div');
      tmp.innerHTML = html;  // already sanitized at this point
      const els = Array.from(tmp.querySelectorAll(selector));
      if (!els.length) {
        this._show('loading', 'No elements matched selector');
        return;
      }
      els.forEach(el => div.appendChild(document.importNode(el, true)));
    } else {
      div.innerHTML = html;
    }

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
    adopt(this.shadowRoot, { sheet: includeSheet, css: INCLUDE_CSS });
  }
}

define('sol-include', SolInclude);
export { SolInclude };
