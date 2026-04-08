import { sanitizeHtml } from './shared/utils.js';

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
    this.shadowRoot.innerHTML = `<style>${SolInclude._styles()}</style>`;
  }

  static _styles() {
    return `
      :host { display: block; }
      .si-content { }
      .si-raw {
        white-space: pre-wrap; font-family: monospace; font-size: .9em;
        background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto;
      }
      .si-loading { color: #888; padding: .75rem; font-style: italic; }
      .si-error {
        color: #c00; padding: .75rem 1rem;
        background: #fee; border: 1px solid #fcc; border-radius: 4px;
      }
      /* Basic prose styles for rendered markdown / HTML */
      .si-content h1,.si-content h2,.si-content h3,
      .si-content h4,.si-content h5,.si-content h6 {
        margin: 1.1em 0 .4em; line-height: 1.25;
      }
      .si-content p    { margin: 0 0 .75em; }
      .si-content ul,.si-content ol { margin: 0 0 .75em 1.5em; }
      .si-content li   { margin: .2em 0; }
      .si-content pre  { background:#f5f5f5; padding:.75rem; border-radius:4px; overflow-x:auto; }
      .si-content code { background:#f0f0f0; padding:.1em .3em; border-radius:3px; font-size:.9em; }
      .si-content pre code { background:none; padding:0; }
      .si-content blockquote {
        border-left: 3px solid #ccc; margin: 0 0 .75em 0; padding: .25em 1em; color: #555;
      }
      .si-content a { color: #0066cc; }
      .si-content img { max-width: 100%; }
      .si-content table { border-collapse: collapse; margin-bottom: .75em; }
      .si-content th,.si-content td { border: 1px solid #ddd; padding: .3em .6em; }
      .si-content th { background: #f5f5f5; }
    `;
  }
}

customElements.define('sol-include', SolInclude);
export { SolInclude };
