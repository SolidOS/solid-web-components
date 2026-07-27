/**
 * <sol-pod-ops> — standalone pod file/folder operations panel.
 * Renders the same tabbed interface as the sol-pod gear-icon modal,
 * but inline (no modal wrapper).
 *
 * Attributes:
 *   source  — URL of the file or container to manage
 *   login   — CSS selector for a <sol-login> element (authenticated fetch)
 *
 * Properties:
 *   item     — { url, name, isContainer, contentType } override (optional)
 *   fetchFn  — custom fetch function
 *
 * Events:
 *   sol-status({ message, type })  — operation feedback
 *   sol-navigate({ url })          — after delete/rename, signals container reload
 */

import { CSS as POD_MODAL_CSS, sheet as POD_MODAL_SHEET } from './styles/sol-pod-modal-css.js';
import { BTN_CSS } from './styles/buttons-css.js';
import { adopt, sheetFrom, ensureDocStyle } from '../core/adopt.js';
import { define } from '../core/define.js';
import { siblingUrl } from '../core/here.js';
import { sanitizeHtml, escapeHtml } from '../core/utils.js';
import {
  extOf, contentTypeFor,
  fetchContainer, copyFolder, deleteFolder,
  liveFormatFor, isLiveFormat,
  isEditable, isViewable, isRdf, isImage, isVideo, isAudio, isPDF,
  CT_TO_EXT,
} from '../core/pod-ops.js';

const HOST_CSS = BTN_CSS + `
  :host { display: block; }
  .pod-ops-wrap {
    display: flex; flex-direction: column; height: 100%; overflow: hidden;
  }
  .pod-ops-body {
    flex: 1; min-height: 0; overflow: auto; padding: 12px;
    display: flex; flex-direction: column;
  }
  .pod-ops-footer { padding: 6px 12px; font-size: max(16px, 0.85em); color: var(--text-muted, #666); }
`;

const hostSheet = sheetFrom(HOST_CSS);

/* ── HTML preview + floating page viewer ─────────────────────────────
 * The view tab renders .html files as an inert srcdoc iframe:
 * sandbox="allow-same-origin" WITHOUT allow-scripts, so the previewed
 * document runs nothing (a host page CSP would block injected inline
 * script anyway — dk's is script-src 'self') while the parent can reach
 * its DOM to wire link handling, and its assets fetch with credentials.
 * prepareHtmlPreview injects a <base> so the document's relative links
 * and assets resolve against its pod URL (srcdoc alone resolves them
 * against about:srcdoc). Clicked links: same-pod targets open in the
 * floating page viewer below; external targets go to window.open (which
 * dk routes to its native reader view). */
export function prepareHtmlPreview(html, docUrl) {
  const inject = `<base href="${escapeHtml(docUrl)}">`;
  if (/<head[^>]*>/i.test(html)) return html.replace(/<head[^>]*>/i, (m) => m + inject);
  return inject + html;
}

/* Attach the capture-phase link interceptor to a preview iframe's document
 * (reattached on every load — each srcdoc assignment mints a new document).
 * onLink gets the clicked absolute href. */
function wirePreviewLinks(iframe, onLink) {
  const wire = () => {
    const doc = iframe.contentDocument;
    if (!doc) return;                       // sandbox denied us — nothing to wire
    doc.addEventListener('click', (e) => {
      const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a || !a.href) return;
      e.preventDefault(); e.stopPropagation();
      if (/^https?:/i.test(a.href)) onLink(a.href);
    }, true);
  };
  iframe.addEventListener('load', wire);
  if (iframe.contentDocument?.readyState === 'complete') wire();
}

/* A large draggable, resizable floating window hosting one iframe. Links
 * clicked inside it navigate it in place (same mini-viewer treatment), so
 * it acts as a small page browser riding the pod's authed fetch. One
 * window is shared — repeated clicks re-aim it. */
const VIEWER_CSS = `
  .sol-page-viewer {
    position: fixed; z-index: 1200;
    top: 8vh; left: 12vw;
    width: min(72vw, 1100px); height: min(78vh, 850px);
    min-width: 320px; min-height: 240px;
    display: flex; flex-direction: column;
    background: var(--color-surface, #fff);
    border: 1px solid var(--color-border, #d0d7de);
    border-radius: 8px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
    resize: both; overflow: hidden;   /* native resize handle, bottom-right */
  }
  .sol-page-viewer[hidden] { display: none; }  /* our flex beats the UA hidden rule */
  .sol-page-viewer header {
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.35rem 0.6rem;
    background: var(--color-header, #f6f8fa);
    border-bottom: 1px solid var(--color-border, #d0d7de);
    cursor: move; user-select: none;
  }
  .sol-page-viewer .viewer-url {
    flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    font: 1rem/1.4 system-ui, sans-serif;
    color: var(--color-text, #24292f);
  }
  .sol-page-viewer .viewer-btn {
    border: 1px solid var(--color-border, #d0d7de); background: var(--color-surface, #fff);
    border-radius: 4px; padding: 0.1rem 0.5rem; cursor: pointer;
    font: 1rem/1.4 system-ui, sans-serif; min-width: 2rem;
  }
  .sol-page-viewer iframe { flex: 1; border: 0; width: 100%; }
  /* − collapses to the title bar (position kept); + fills the app window.
     Both beat the dragged/resized inline geometry, hence the importants. */
  .sol-page-viewer.minimized { height: auto !important; min-height: 0; resize: none; }
  .sol-page-viewer.minimized iframe { display: none; }
  .sol-page-viewer.maximized {
    top: 0 !important; left: 0 !important;
    width: 100vw !important; height: 100vh !important;
    border-radius: 0; resize: none;
  }
`;

/* Off-pod link targets get the same interface as the floating viewer, but as
 * a REAL window (external sites can't be iframed): window.open with popup
 * features at the viewer's size. dk's main process turns popup-featured opens
 * into an isolated floating window; a plain browser opens a comparable popup. */
function openExternalWindow(href) {
  const w = Math.min(Math.round((window.outerWidth || 1280) * 0.72), 1100);
  const h = Math.min(Math.round((window.outerHeight || 900) * 0.78), 850);
  window.open(href, '_blank', `popup=yes,noopener=yes,width=${w},height=${h}`);
}

let _pageViewer = null;

export function openPageViewer(url, fetchFor) {
  if (!_pageViewer) _pageViewer = createPageViewer();
  _pageViewer.show();
  _pageViewer.navigate(url, fetchFor);
  return _pageViewer;
}

function createPageViewer() {
  ensureDocStyle(document, 'sol-page-viewer-style', VIEWER_CSS);
  const root = document.createElement('div');
  root.className = 'sol-page-viewer';
  root.hidden = true;

  const header = document.createElement('header');
  const urlEl = document.createElement('span');
  urlEl.className = 'viewer-url';
  const mkBtn = (text, label, extraClass) => {
    const b = document.createElement('button');
    b.className = 'viewer-btn' + (extraClass ? ' ' + extraClass : '');
    b.type = 'button';
    b.textContent = text;
    b.setAttribute('aria-label', label);
    b.title = label;
    return b;
  };
  const minBtn = mkBtn('−', 'Minimize', 'viewer-min');
  const maxBtn = mkBtn('+', 'Maximize', 'viewer-max');
  const closeBtn = mkBtn('✕', 'Close', 'viewer-close');
  header.append(urlEl, minBtn, maxBtn, closeBtn);

  const iframe = document.createElement('iframe');
  iframe.setAttribute('sandbox', 'allow-same-origin');   // inert content, reachable DOM
  root.append(header, iframe);
  document.body.appendChild(root);

  const viewer = {
    _url: null,
    _fetchFor: null,
    _blobUrl: null,
    show() {
      if (!root.isConnected) document.body.appendChild(root);  // survive a cleared body
      root.hidden = false;
    },
    close() {
      root.hidden = true;
      root.classList.remove('minimized', 'maximized');
      iframe.removeAttribute('src'); iframe.removeAttribute('srcdoc');
      if (this._blobUrl) { URL.revokeObjectURL(this._blobUrl); this._blobUrl = null; }
    },
    async navigate(url, fetchFor) {
      this._url = url;
      if (fetchFor) this._fetchFor = fetchFor;
      urlEl.textContent = url;
      urlEl.title = url;
      if (this._blobUrl) { URL.revokeObjectURL(this._blobUrl); this._blobUrl = null; }
      try {
        const f = (this._fetchFor && this._fetchFor(url)) || fetch;
        const resp = await f(url);
        const ct = resp.headers.get('content-type') || '';
        if (!resp.ok) {
          iframe.removeAttribute('src');
          iframe.srcdoc = `<p style="font:1rem system-ui;padding:1rem">${resp.status} ${escapeHtml(resp.statusText || '')} — ${escapeHtml(url)}</p>`;
        } else if (/text\/html/i.test(ct)) {
          iframe.removeAttribute('src');
          iframe.srcdoc = prepareHtmlPreview(await resp.text(), url);
        } else if (/^(image|video|audio)\/|\/pdf\b/i.test(ct)) {
          // Renderable binaries ride a blob URL (the frame's own requests
          // would be unauthenticated); everything else shows as text below —
          // a blob of e.g. text/markdown would trigger a (sandbox-blocked)
          // download and render nothing.
          const blob = await resp.blob();
          this._blobUrl = URL.createObjectURL(blob);
          iframe.removeAttribute('srcdoc');
          iframe.src = this._blobUrl;
        } else {
          const text = await resp.text();
          iframe.removeAttribute('src');
          iframe.srcdoc = `<pre style="font-size:1rem;margin:1rem;white-space:pre-wrap">${escapeHtml(text)}</pre>`;
        }
      } catch (e) {
        iframe.removeAttribute('src');
        iframe.srcdoc = `<p style="font:1rem system-ui;padding:1rem">Failed to load ${escapeHtml(url)}: ${escapeHtml(e.message)}</p>`;
      }
    },
  };

  closeBtn.addEventListener('click', () => viewer.close());
  // − / + behave like regular window controls: − collapses to the title bar,
  // + fills the app window; each re-click (or the other button) restores.
  minBtn.addEventListener('click', () => {
    root.classList.remove('maximized');
    root.classList.toggle('minimized');
  });
  maxBtn.addEventListener('click', () => {
    root.classList.remove('minimized');
    root.classList.toggle('maximized');
  });
  header.addEventListener('dblclick', (e) => {
    if (e.target.closest('button')) return;
    root.classList.remove('minimized');
    root.classList.toggle('maximized');
  });

  // Drag by the header. Pointer capture keeps the moves flowing even when
  // the pointer crosses the iframe (which would otherwise swallow them).
  header.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button') || root.classList.contains('maximized')) return;
    const r = root.getBoundingClientRect();
    const dx = e.clientX - r.left, dy = e.clientY - r.top;
    const move = (ev) => {
      root.style.left = `${Math.max(0, ev.clientX - dx)}px`;
      root.style.top = `${Math.max(0, ev.clientY - dy)}px`;
    };
    const up = () => {
      header.removeEventListener('pointermove', move);
      header.removeEventListener('pointerup', up);
    };
    try { header.setPointerCapture(e.pointerId); } catch (_) { /* jsdom */ }
    header.addEventListener('pointermove', move);
    header.addEventListener('pointerup', up);
  });

  // Links clicked inside the window: same-origin targets navigate it in
  // place; anything else goes to window.open (dk's native reader).
  wirePreviewLinks(iframe, (href) => {
    let sameOrigin = false;
    try { sameOrigin = new URL(href).origin === new URL(viewer._url).origin; } catch (_) { return; }
    if (sameOrigin) viewer.navigate(href);
    else openExternalWindow(href);
  });

  return viewer;
}
let _liveEditLoaded = false;

/**
 * Standalone pod file/folder operations panel.
 *
 * Renders the same tabbed interface as the sol-pod gear-icon modal,
 * but inline. Tabs: Live Edit, View, Edit, Graph, Download, Rename,
 * Delete, Permissions (files); New File, New Folder, Download, Rename,
 * Delete, Permissions (containers).
 *
 * @class SolPodOps
 * @extends HTMLElement
 * @attr {string} source - URL of the file or container to manage
 * @attr {string} login - CSS selector for a sol-login element
 * @property {Object} item - { url, name, isContainer, contentType } override
 * @property {Function} fetchFn - custom fetch function
 * @fires sol-status - detail: { message, type }
 * @fires sol-navigate - detail: { url }
 */
class SolPodOps extends HTMLElement {
  static get observedAttributes() { return ['source', 'login']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._login = null;
    this._item = null;
    this._blobUrl = null;
    this._initialized = false;
  }

  get item() { return this._item; }
  set item(v) { this._item = v; if (this.isConnected) this._load(); }

  get fetchFn() { return this._fetchFn || null; }
  set fetchFn(fn) { this._fetchFn = fn; }

  connectedCallback() {
    if (!this._initialized) {
      this._initialized = true;
      this._render();
      this._load();
    }
  }

  attributeChangedCallback(name, oldV, newV) {
    if (oldV === newV) return;
    if (name === 'login') {
      const el = typeof newV === 'string' ? document.querySelector(newV) : newV;
      this._login = el;
    }
    if (name === 'source' && this._initialized) this._load();
  }

  _fetchFor(url) {
    if (this._fetchFn) return this._fetchFn;
    if (this._login?.fetchFor) return this._login.fetchFor(url);
    return fetch;
  }

  _render() {
    const s = this.shadowRoot;
    s.innerHTML = `
      <div class="pod-ops-wrap">
        <div class="pod-ops-body"><div class="modal-message">Loading...</div></div>
        <div class="pod-ops-footer"></div>
      </div>`;
    adopt(s, { sheet: hostSheet, css: HOST_CSS });
    if (POD_MODAL_SHEET) {
      s.adoptedStyleSheets = [...s.adoptedStyleSheets, POD_MODAL_SHEET];
    } else {
      const style = document.createElement('style');
      style.textContent = POD_MODAL_CSS;
      s.appendChild(style);
    }
  }

  async _load() {
    const source = this.getAttribute('source');
    if (!source) return;

    let item = this._item;
    if (!item) {
      const isContainer = source.endsWith('/');
      const name = isContainer
        ? source.slice(0, -1).split('/').pop()
        : source.split('/').pop();
      item = { url: source, name, isContainer, contentType: '' };
    }

    // Probe content-type for files
    const displayBase = item.displayName || item.name;
    let effectiveName = displayBase;
    if (!item.isContainer) {
      try {
        const fetchFn = this._fetchFor(item.url);
        const head = await fetchFn(item.url, { method: 'HEAD' });
        const ct = (head.headers.get('Content-Type') || '').split(';')[0].trim();
        if (ct) {
          item.contentType = ct;
          if (!extOf(item.name)) {
            const mapped = CT_TO_EXT[ct];
            if (mapped) effectiveName = displayBase + '.' + mapped;
          }
        }
      } catch {}
    }

    this._buildTabs(item, effectiveName);
  }

  async _buildTabs(item, effectiveName) {
    const liveFmt = item.isContainer ? null : liveFormatFor(item.url, item.contentType);
    const hasLive = !!liveFmt;
    // Renderable live formats open on a code-free VIEW tab first (the same
    // preview live-edit shows, without the editor); Live Edit sits one tab
    // over. Source-ish live formats (csv, turtle, …) keep Live Edit first.
    const viewFirst = hasLive && ['html', 'markdown', 'mermaid'].includes(liveFmt);
    const fileTabs = hasLive
      ? (viewFirst
          ? ['View', 'Live Edit', 'Download', 'Rename', 'Delete', 'Permissions']
          : ['Live Edit', 'Download', 'Rename', 'Delete', 'Permissions'])
      : ['View', 'Edit', 'Graph', 'Download', 'Rename', 'Delete', 'Permissions'];
    const tabDefs = item.isContainer
      ? ['New File', 'New Folder', 'Download', 'Rename', 'Delete', 'Permissions']
      : fileTabs;

    const tabs = tabDefs.filter(name => {
      if (name === 'Edit' && !isEditable(effectiveName)) return false;
      if (name === 'View' && !isViewable(effectiveName)) return false;
      if (name === 'Graph' && !isRdf(effectiveName)) return false;
      return true;
    }).map(name => ({
      name,
      render: (body, footer, actions) => this._renderTab(name.toLowerCase(), item, effectiveName, body, footer, actions)
    }));

    const defaultTab = item.isContainer ? 'New File'
      : viewFirst ? 'View'
      : hasLive ? 'Live Edit'
      : isRdf(effectiveName) ? 'Graph'
      : isViewable(effectiveName) ? 'View' : 'Rename';

    await import('./sol-tabs.js');
    const body = this.shadowRoot.querySelector('.pod-ops-body');
    const footer = this.shadowRoot.querySelector('.pod-ops-footer');
    body.innerHTML = '';
    body.style.padding = '0';

    // sol-tabs provides its own actions slot between the bar and content;
    // we don't pass actionsEl so toolbar buttons appear flush right at
    // the top of the tab content area.
    const tabsEl = document.createElement('sol-tabs');
    tabsEl.footerEl = footer;
    tabsEl.tabs = tabs;
    body.appendChild(tabsEl);
    tabsEl.switchTab(defaultTab);
  }

  _renderTab(tabName, item, effectiveName, body, footer, actions) {
    switch (tabName) {
      case 'live edit':   return this._tabLive(item, effectiveName, body, footer, actions);
      case 'view':        return this._tabView(item, effectiveName, body, footer, actions);
      case 'edit':        return this._tabEdit(item, effectiveName, body, footer, actions);
      case 'graph':       return this._tabGraph(item, effectiveName, body, footer, actions);
      case 'download':    return item.isContainer ? this._tabDownloadFolder(item, body, footer, actions) : this._tabDownloadFile(item, body, footer, actions);
      case 'rename':      return this._tabRename(item, body, footer, actions);
      case 'delete':      return this._tabDelete(item, body, footer, actions);
      case 'permissions': return this._tabPermissions(item, body, footer, actions);
      case 'new file':    return this._tabNewFile(item, body, footer, actions);
      case 'new folder':  return this._tabNewFolder(item, body, footer, actions);
    }
  }

  // ── Live edit tab ───────────────────────────────────────────────────

  async _tabLive(item, effectiveName, body, footer, actions) {
    body.innerHTML = '<div class="modal-message">Loading...</div>';
    body.style.padding = '0'; body.style.overflow = 'hidden';

    const fmt = liveFormatFor(item.url, item.contentType);

    // Save / Settings / Help / Zoom / Statistics are <sol-live-edit>'s
    // own toolbar now \u2014 the modal tab adds nothing here.
    actions.innerHTML = '';

    const fetchFn = this._fetchFor(item.url);
    const onSave = async (content, url) => {
      try {
        const resp = await fetchFn(url, {
          method: 'PUT', headers: { 'Content-Type': contentTypeFor(effectiveName) },
          body: content,
        });
        if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`);
        this._emitStatus('Saved.', 'success');
      } catch (e) { this._emitStatus(`Save failed: ${e.message}`, 'error'); }
    };

    await this._ensureLiveEdit();
    body.innerHTML = '';
    body.style.height = '100%';

    const el = document.createElement('sol-live-edit');
    el.setAttribute('source', item.url);
    el.setAttribute('format', fmt);
    // Inherit the keybinding mode from the host pod's settings (sol-pod sets
    // `editorKeys` on this ops element). Changes bubble back up via
    // sol-editor-keys-change for sol-pod to persist.
    if (this.editorKeys) el.setAttribute('keys', this.editorKeys);
    el.className = 'pod-live-edit';
    if (fetchFn !== fetch) el.fetchFn = fetchFn;
    el.addEventListener('sol-save', async (ev) => {
      await onSave(ev.detail.content, ev.detail.url);
    });
    body.appendChild(el);

    return () => { body.innerHTML = ''; };
  }

  async _ensureLiveEdit() {
    if (_liveEditLoaded || customElements.get('sol-live-edit')) { _liveEditLoaded = true; return; }
    const url = siblingUrl('sol-live-edit.js', import.meta.url);
    await import(url);
    _liveEditLoaded = true;
  }

  // ── View tab ────────────────────────────────────────────────────────

  async _tabView(item, effectiveName, body, footer, actions) {
    const fetchFn = this._fetchFor(item.url);
    body.innerHTML = '<div class="modal-message">Loading...</div>';

    try {
      if (isImage(effectiveName)) {
        const blob = await (await fetchFn(item.url)).blob();
        const url = URL.createObjectURL(blob);
        this._blobUrl = url;
        const img = document.createElement('img');
        img.className = 'modal-media'; img.src = url; img.alt = item.displayName || item.name;
        body.innerHTML = ''; body.appendChild(img);
      } else if (isVideo(effectiveName)) {
        const blob = await (await fetchFn(item.url)).blob();
        const url = URL.createObjectURL(blob);
        this._blobUrl = url;
        const vid = document.createElement('video');
        vid.className = 'modal-media'; vid.src = url; vid.controls = true;
        body.innerHTML = ''; body.appendChild(vid);
      } else if (isAudio(effectiveName)) {
        const blob = await (await fetchFn(item.url)).blob();
        const url = URL.createObjectURL(blob);
        this._blobUrl = url;
        const aud = document.createElement('audio');
        aud.className = 'modal-audio'; aud.src = url; aud.controls = true;
        body.innerHTML = ''; body.appendChild(aud);
      } else if (isPDF(effectiveName)) {
        const blob = await (await fetchFn(item.url)).blob();
        const url = URL.createObjectURL(blob);
        this._blobUrl = url;
        const iframe = document.createElement('iframe');
        iframe.className = 'modal-pdf'; iframe.src = url;
        body.innerHTML = ''; body.appendChild(iframe);
      } else if (extOf(effectiveName) === 'md') {
        const text = await (await fetchFn(item.url)).text();
        try {
          const { marked } = await import('https://esm.sh/marked@9');
          const div = document.createElement('div');
          div.className = 'markdown-preview';
          // marked does not sanitize; the .md comes from the pod being browsed.
          div.innerHTML = await sanitizeHtml(marked.parse(text));
          body.innerHTML = ''; body.appendChild(div);
        } catch {
          body.innerHTML = ''; const pre = document.createElement('pre');
          pre.className = 'modal-preview'; pre.textContent = text;
          body.appendChild(pre);
        }
      } else if (extOf(effectiveName) === 'html' || extOf(effectiveName) === 'htm') {
        const text = await (await fetchFn(item.url)).text();
        const iframe = document.createElement('iframe');
        iframe.className = 'modal-pdf';
        iframe.setAttribute('sandbox', 'allow-same-origin');  // inert content, reachable DOM
        // Same-pod links open in the floating page viewer; external ones go
        // to window.open (dk routes those to its native reader view).
        wirePreviewLinks(iframe, (href) => {
          let sameOrigin = false;
          try { sameOrigin = new URL(href).origin === new URL(item.url).origin; } catch (_) { return; }
          if (sameOrigin) openPageViewer(href, (u) => this._fetchFor(u));
          else openExternalWindow(href);
        });
        iframe.srcdoc = prepareHtmlPreview(text, item.url);
        body.innerHTML = ''; body.appendChild(iframe);
      } else if (extOf(effectiveName) === 'mmd' || extOf(effectiveName) === 'mermaid') {
        const text = await (await fetchFn(item.url)).text();
        // The same renderer sol-live-edit's preview pane uses.
        const { renderMermaid } = await import('./utils/renderers/mermaid.js');
        const div = document.createElement('div');
        div.className = 'mermaid-preview';
        body.innerHTML = ''; body.appendChild(div);
        await renderMermaid(text, div);
      } else {
        const text = await (await fetchFn(item.url)).text();
        const pre = document.createElement('pre');
        pre.className = 'modal-preview'; pre.textContent = text;
        body.innerHTML = ''; body.appendChild(pre);
      }
    } catch (e) {
      body.innerHTML = `<div class="modal-message error">Failed to load: ${escapeHtml(e.message)}</div>`;
    }
  }

  // ── Edit tab ────────────────────────────────────────────────────────

  async _tabEdit(item, effectiveName, body, footer, actions) {
    const fetchFn = this._fetchFor(item.url);
    body.innerHTML = '<div class="modal-message">Loading...</div>';

    try {
      const text = await (await fetchFn(item.url)).text();
      const ta = document.createElement('textarea');
      ta.className = 'modal-editor'; ta.value = text;
      body.innerHTML = ''; body.appendChild(ta);

      const saveBtn = document.createElement('button');
      saveBtn.className = 'sol-btn sol-btn-sm sol-btn-primary';
      saveBtn.textContent = 'Save';
      saveBtn.onclick = async () => {
        try {
          const resp = await fetchFn(item.url, {
            method: 'PUT',
            headers: { 'Content-Type': contentTypeFor(effectiveName) },
            body: ta.value,
          });
          if (!resp.ok) throw new Error(`${resp.status}`);
          this._emitStatus('Saved.', 'success');
        } catch (e) { this._emitStatus(`Save failed: ${e.message}`, 'error'); }
      };
      if (actions) actions.appendChild(saveBtn);
    } catch (e) {
      body.innerHTML = `<div class="modal-message error">Failed to load: ${escapeHtml(e.message)}</div>`;
    }
  }

  // ── Graph tab ───────────────────────────────────────────────────────

  async _tabGraph(item, effectiveName, body, footer, actions) {
    const fetchFn = this._fetchFor(item.url);
    body.innerHTML = '<div class="modal-message">Loading RDF graph...</div>';

    try {
      const text = await (await fetchFn(item.url)).text();
      const { rdf } = await import('../core/rdf.js');
      const store = rdf.graph();
      rdf.parse(text, store, item.url, 'text/turtle');
      const triples = store.statements;

      if (triples.length === 0) {
        body.innerHTML = '<div class="modal-message">No triples found.</div>';
        return;
      }

      const table = document.createElement('table');
      table.className = 'triple-table';
      const thead = document.createElement('thead');
      thead.innerHTML = '<tr><th>Subject</th><th>Predicate</th><th>Object</th></tr>';
      table.appendChild(thead);
      const tbody = document.createElement('tbody');
      for (const t of triples) {
        const tr = document.createElement('tr');
        const short = (v) => {
          const s = v.value || String(v);
          return s.length > 60 ? s.slice(0, 57) + '...' : s;
        };
        tr.innerHTML = `<td>${escapeHtml(short(t.subject))}</td><td>${escapeHtml(short(t.predicate))}</td><td>${escapeHtml(short(t.object))}</td>`;
        tbody.appendChild(tr);
      }
      table.appendChild(tbody);
      body.innerHTML = '';
      body.appendChild(table);
      footer.innerHTML = `<span class="modal-note">${triples.length} triple(s)</span>`;
    } catch (e) {
      body.innerHTML = `<div class="modal-message error">Parse error: ${escapeHtml(e.message)}</div>`;
    }
  }

  // ── Download tabs ───────────────────────────────────────────────────

  _tabDownloadFile(item, body, footer, actions) {
    body.innerHTML = '';
    const row = document.createElement('div');
    row.className = 'modal-row';
    const display = item.displayName || item.name;
    const msg = document.createElement('div');
    msg.className = 'modal-message';
    msg.append(document.createTextNode('Download '));
    const strong = document.createElement('strong'); strong.textContent = display;
    msg.append(strong);
    const btn = document.createElement('button');
    btn.className = 'sol-btn sol-btn-sm sol-btn-primary';
    btn.textContent = `\u2B07 ${display}`;
    btn.onclick = async () => {
      const fetchFn = this._fetchFor(item.url);
      const resp = await fetchFn(item.url);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = display; a.click();
      URL.revokeObjectURL(url);
    };
    row.append(msg, btn);
    body.appendChild(row);
  }

  async _tabDownloadFolder(item, body, footer, actions) {
    body.innerHTML = '';
    const row = document.createElement('div');
    row.className = 'modal-row';
    const display = item.displayName || item.name;
    const msg = document.createElement('div');
    msg.className = 'modal-message';
    msg.append(document.createTextNode('Download folder '));
    const strong = document.createElement('strong'); strong.textContent = display;
    msg.append(strong, document.createTextNode(' as ZIP'));
    const btn = document.createElement('button');
    btn.className = 'sol-btn sol-btn-sm sol-btn-primary';
    btn.textContent = `\u2B07 ${display}.zip`;
    btn.onclick = async () => {
      try {
        const JSZip = (await import('https://esm.sh/jszip@3.10.0')).default;
        const zip = new JSZip();
        const addFolder = async (containerUrl, zipFolder) => {
          const fetchFn = this._fetchFor(containerUrl);
          const items = await fetchContainer(containerUrl, fetchFn);
          for (const child of items) {
            const childDisplay = child.displayName || child.name;
            if (child.isContainer) {
              await addFolder(child.url, zipFolder.folder(childDisplay));
            } else {
              const resp = await fetchFn(child.url);
              zipFolder.file(childDisplay, await resp.blob());
            }
          }
        };
        btn.disabled = true; btn.textContent = 'Downloading...';
        await addFolder(item.url, zip.folder(display));
        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = display + '.zip'; a.click();
        URL.revokeObjectURL(url);
        btn.textContent = 'Done!';
      } catch (e) {
        this._emitStatus(`Download failed: ${e.message}`, 'error');
        btn.disabled = false; btn.textContent = `\u2B07 ${display}.zip`;
      }
    };
    row.append(msg, btn);
    body.appendChild(row);
  }

  // ── Rename tab ──────────────────────────────────────────────────────

  _tabRename(item, body, footer, actions) {
    const currentDisplay = item.displayName || item.name;
    const input = document.createElement('input');
    input.className = 'modal-input'; input.type = 'text';
    input.value = currentDisplay;

    const btn = document.createElement('button');
    btn.className = 'sol-btn sol-btn-sm sol-btn-primary';
    btn.textContent = 'Rename';
    btn.onclick = async () => {
      const newName = input.value.trim();
      if (!newName || newName === currentDisplay) return;
      // User typed the decoded form; URL-encode for the request path so
      // names with spaces / unicode / reserved chars produce valid URLs.
      const encodedNew = encodeURIComponent(newName);
      try {
        const fetchFn = this._fetchFor(item.url);
        if (item.isContainer) {
          const parentUrl = item.url.slice(0, item.url.slice(0, -1).lastIndexOf('/') + 1);
          const fetchFnForUrl = (u) => this._fetchFor(u);
          await copyFolder(item.url, parentUrl, encodedNew, fetchFnForUrl, msg => this._emitStatus(msg, ''));
          await deleteFolder(item.url, fetchFnForUrl);
        } else {
          const containerUrl = item.url.substring(0, item.url.lastIndexOf('/') + 1);
          const newUrl = containerUrl + encodedNew;
          const resp = await fetchFn(item.url);
          if (!resp.ok) throw new Error(`Read failed: ${resp.status}`);
          const blob = await resp.blob();
          await fetchFn(newUrl, { method: 'PUT', headers: { 'Content-Type': contentTypeFor(newName) }, body: blob });
          await fetchFn(item.url, { method: 'DELETE' });
        }
        this._emitStatus('Renamed.', 'success');
        this._emitNavigate(item);
      } catch (e) { this._emitStatus(`Rename failed: ${e.message}`, 'error'); }
    };
    const row = document.createElement('div');
    row.className = 'modal-row';
    row.append(input, btn);
    body.innerHTML = ''; body.appendChild(row);
  }

  // ── Delete tab ──────────────────────────────────────────────────────

  _tabDelete(item, body, footer, actions) {
    body.innerHTML = '';
    const row = document.createElement('div');
    row.className = 'modal-row';
    const display = item.displayName || item.name;
    const msg = document.createElement('div');
    msg.className = 'modal-message';
    msg.append(document.createTextNode('Delete '));
    const strong = document.createElement('strong'); strong.textContent = display;
    msg.append(strong, document.createTextNode((item.isContainer ? ' and all its contents' : '') + '?'));
    const btn = document.createElement('button');
    btn.className = 'sol-btn sol-btn-sm sol-btn-danger';
    btn.textContent = 'Delete';
    btn.onclick = async () => {
      try {
        if (item.isContainer) {
          await deleteFolder(item.url, (u) => this._fetchFor(u));
        } else {
          const fetchFn = this._fetchFor(item.url);
          const resp = await fetchFn(item.url, { method: 'DELETE' });
          if (!resp.ok) throw new Error(`${resp.status}`);
        }
        this._emitStatus('Deleted.', 'success');
        this._emitNavigate(item);
      } catch (e) { this._emitStatus(`Delete failed: ${e.message}`, 'error'); }
    };
    row.append(msg, btn);
    body.appendChild(row);
  }

  // ── New File tab ────────────────────────────────────────────────────

  _tabNewFile(item, body, footer, actions) {
    body.innerHTML = '';

    const uploadLabel = document.createElement('div');
    uploadLabel.className = 'modal-label'; uploadLabel.textContent = 'Upload files:';
    const fileInput = document.createElement('input');
    fileInput.type = 'file'; fileInput.multiple = true;

    const uploadBtn = document.createElement('button');
    uploadBtn.className = 'sol-btn sol-btn-sm sol-btn-primary';
    uploadBtn.textContent = 'Upload';
    uploadBtn.onclick = async () => {
      const files = fileInput.files;
      if (!files.length) return;
      for (const file of files) {
        try {
          const fetchFn = this._fetchFor(item.url);
          await fetchFn(item.url + file.name, {
            method: 'PUT',
            headers: { 'Content-Type': file.type || contentTypeFor(file.name) },
            body: file,
          });
        } catch (e) { this._emitStatus(`Upload failed: ${e.message}`, 'error'); return; }
      }
      this._emitStatus('Uploaded.', 'success');
      this._emitNavigate(item);
    };
    const uploadRow = document.createElement('div');
    uploadRow.className = 'modal-row';
    uploadRow.append(fileInput, uploadBtn);
    body.append(uploadLabel, uploadRow);

    const hr = document.createElement('hr');
    hr.className = 'modal-hr';
    body.appendChild(hr);

    const createLabel = document.createElement('div');
    createLabel.className = 'modal-label'; createLabel.textContent = 'Or create a new file:';
    const nameInput = document.createElement('input');
    nameInput.className = 'modal-input'; nameInput.type = 'text';
    nameInput.placeholder = 'filename.ext';
    const contentTA = document.createElement('textarea');
    contentTA.className = 'modal-editor'; contentTA.placeholder = 'File content (optional)';
    contentTA.style.minHeight = '80px';

    const createBtn = document.createElement('button');
    createBtn.className = 'sol-btn sol-btn-sm sol-btn-primary';
    createBtn.textContent = 'Create File';
    createBtn.onclick = async () => {
      const name = nameInput.value.trim();
      if (!name) return;
      try {
        const fetchFn = this._fetchFor(item.url);
        await fetchFn(item.url + name, {
          method: 'PUT',
          headers: { 'Content-Type': contentTypeFor(name) },
          body: contentTA.value,
        });
        this._emitStatus('Created.', 'success');
        this._emitNavigate(item);
      } catch (e) { this._emitStatus(`Create failed: ${e.message}`, 'error'); }
    };
    const createRow = document.createElement('div');
    createRow.className = 'modal-row';
    createRow.append(nameInput, createBtn);
    body.append(createLabel, createRow, contentTA);
  }

  // ── New Folder tab ──────────────────────────────────────────────────

  _tabNewFolder(item, body, footer, actions) {
    const input = document.createElement('input');
    input.className = 'modal-input'; input.type = 'text';
    input.placeholder = 'Folder name';

    const btn = document.createElement('button');
    btn.className = 'sol-btn sol-btn-sm sol-btn-primary';
    btn.textContent = 'Create Folder';
    btn.onclick = async () => {
      const name = input.value.trim();
      if (!name) return;
      try {
        const fetchFn = this._fetchFor(item.url);
        const url = item.url + name + '/';
        const resp = await fetchFn(url, {
          method: 'PUT', headers: { 'Content-Type': 'text/turtle' }, body: ''
        });
        if (!resp.ok && resp.status !== 409) throw new Error(`${resp.status}`);
        this._emitStatus('Created.', 'success');
        this._emitNavigate(item);
      } catch (e) { this._emitStatus(`Create failed: ${e.message}`, 'error'); }
    };
    const row = document.createElement('div');
    row.className = 'modal-row';
    row.append(input, btn);
    body.innerHTML = ''; body.appendChild(row);
  }

  // ── Permissions tab ─────────────────────────────────────────────────

  async _tabPermissions(item, body, footer, actions) {
    body.innerHTML = '';
    await import('./sol-wac.js');
    const wac = document.createElement('sol-wac');
    wac.fetchFn = this._fetchFor(item.url);
    wac.isContainer = !!item.isContainer;   // authoritative — not the URL shape
    wac.setAttribute('source', item.url);
    wac.addEventListener('sol-status', (e) => this._emitStatus(e.detail.message, e.detail.type));
    body.appendChild(wac);
  }

  // ── Events ──────────────────────────────────────────────────────────

  _emitStatus(message, type) {
    this.dispatchEvent(new CustomEvent('sol-status', {
      bubbles: true, composed: true, detail: { message, type }
    }));
  }

  _emitNavigate(item) {
    const containerUrl = item.isContainer
      ? item.url.slice(0, item.url.slice(0, -1).lastIndexOf('/') + 1)
      : item.url.substring(0, item.url.lastIndexOf('/') + 1);
    this.dispatchEvent(new CustomEvent('sol-navigate', {
      bubbles: true, composed: true, detail: { url: containerUrl }
    }));
  }
}

define('sol-pod-ops', SolPodOps);
export { SolPodOps };
export default SolPodOps;
