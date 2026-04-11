/**
 * <sol-pod> — Solid pod file browser web component.
 * Attributes: source (pod storage URL — if omitted, discovers from current origin)
 * Properties: login (SolLogin element ref), currentPath, items
 * Events: sol-navigate({url}), sol-drag-start({item}), sol-status({message,type})
 *
 * Usage:
 *   <sol-login id="auth"></sol-login>
 *   <sol-pod source="https://pod.example/" login="#auth"></sol-pod>
 */

import { CSS } from './utils/sol-pod-css.js';
import {
  extOf, contentTypeFor, withTimeout,
  fetchContainer, copyFile, copyFolder, deleteFolder,
  getAclUrl, getPermissions,
  discoverOwnerWebIds, getStoragesFromWebIds,
  ROLES, GRANT_OPTIONS, parseAcl, authsToRoleModel, roleModelToTurtle, adaptInheritedAcl,
} from './shared/pod-ops.js';

// ── File type helpers ─────────────────────────────────────────────────

const TEXT_VIEWABLE = ['txt','md','csv','json','jsonld','ttl','n3','html','xml','svg','js','css'];
const EDITABLE      = ['txt','md','csv','json','jsonld','ttl','n3','html','htm','xml','svg','js','css'];
const IMAGE_TYPES   = ['png','jpg','jpeg','gif','webp','svg','bmp','ico','avif'];
const VIDEO_TYPES   = ['mp4','webm','ogg','mov','m4v'];
const AUDIO_TYPES   = ['mp3','ogg','wav','flac','aac','m4a','opus'];
const PDF_TYPES     = ['pdf'];
const RDF_EXTS      = ['ttl','n3','trig','nq','nt','rdf','jsonld'];

const isTextViewable = n => TEXT_VIEWABLE.includes(extOf(n));
const isEditable     = n => EDITABLE.includes(extOf(n));
const isImage        = n => IMAGE_TYPES.includes(extOf(n));
const isVideo        = n => VIDEO_TYPES.includes(extOf(n));
const isAudio        = n => AUDIO_TYPES.includes(extOf(n));
const isPDF          = n => PDF_TYPES.includes(extOf(n));
const isViewable     = n => isTextViewable(n) || isImage(n) || isVideo(n) || isAudio(n) || isPDF(n);
const isRdf          = n => RDF_EXTS.includes(extOf(n));

function fileIcon(name) {
  const ext = extOf(name);
  if (!ext && name.endsWith('$')) return '\u{1F517}';
  if (['ttl','n3','trig','nq','nt','rdf','jsonld'].includes(ext)) return '\u{1F537}';
  if (ext === 'json') return '\u{1F4CB}';
  if (['csv','tsv'].includes(ext)) return '\u{1F4CA}';
  if (['md','markdown'].includes(ext)) return '\u{1F4DD}';
  if (ext === 'txt') return '\u{1F4C4}';
  if (ext === 'pdf') return '\u{1F4D5}';
  if (['html','htm'].includes(ext)) return '\u{1F310}';
  if (['js','mjs','cjs','ts'].includes(ext)) return '\u26A1';
  if (['css','scss'].includes(ext)) return '\u{1F3A8}';
  if (['png','jpg','jpeg','gif','webp','avif','bmp','ico'].includes(ext)) return '\u{1F5BC}';
  if (ext === 'svg') return '\u{1F3AD}';
  if (['mp3','ogg','wav','flac','aac','m4a','opus'].includes(ext)) return '\u{1F3B5}';
  if (['mp4','webm','mov','m4v'].includes(ext)) return '\u{1F3AC}';
  if (['zip','tar','gz','bz2','xz','7z'].includes(ext)) return '\u{1F4E6}';
  if (['yaml','yml','toml','ini','env'].includes(ext)) return '\u2699';
  if (ext === 'acl') return '\u{1F512}';
  if (name.startsWith('.')) return '\u{1F527}';
  return '\u{1F4C4}';
}

// ── Live format detection ─────────────────────────────────────────────

const EXT_TO_FORMAT = {
  ttl:'turtle', n3:'turtle', jsonld:'jsonld', csv:'csv', tsv:'csv',
  md:'markdown', mmd:'mermaid', html:'html', htm:'html',
  dot:'graphviz', gv:'graphviz',
};
const MIME_TO_FORMAT = {
  'text/turtle':'turtle', 'text/n3':'turtle', 'application/ld+json':'jsonld',
  'text/csv':'csv', 'text/tab-separated-values':'csv',
  'text/markdown':'markdown', 'text/x-markdown':'markdown', 'text/html':'html',
  'text/x-mermaid':'mermaid', 'text/vnd.graphviz':'graphviz', 'text/x-dot':'graphviz',
};

function liveFormatFor(url, mime) {
  if (mime) { const f = MIME_TO_FORMAT[mime.split(';')[0].trim()]; if (f) return f; }
  if (url) { const f = EXT_TO_FORMAT[url.split('?')[0].split('.').pop().toLowerCase()]; if (f) return f; }
  return null;
}
function isLiveFormat(url, mime) { return !!liveFormatFor(url, mime); }

// CT_TO_EXT for extensionless file detection
const CT_TO_EXT = {
  'text/turtle':'ttl','text/n3':'n3','application/ld+json':'jsonld',
  'application/json':'json','text/html':'html','text/plain':'txt',
  'text/markdown':'md','text/csv':'csv','application/xml':'xml',
  'text/xml':'xml','application/javascript':'js','text/css':'css',
  'image/png':'png','image/jpeg':'jpg','image/svg+xml':'svg',
  'audio/mpeg':'mp3','video/mp4':'mp4','application/pdf':'pdf',
};

// ── SolPod component ──────────────────────────────────────────────────

let _liveEditLoaded = false;

class SolPod extends HTMLElement {
  static get observedAttributes() { return ['source', 'login']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._login = null;
    this._currentPath = '';
    this._rootUrl = '';
    this._items = [];
    this._storages = [];
    this._initialized = false;
    this._modal = null;
    this._blobUrl = null;
    this._toastTimer = null;
    this._draggedItem = null;
    this._prefs = { hideDot: true, hideHash: true, hideTilde: true };
  }

  get login() { return this._login; }
  set login(el) {
    if (typeof el === 'string') el = document.querySelector(el);
    this._login = el;
  }

  get currentPath() { return this._currentPath; }
  get items() { return this._items; }

  get prefs() { return this._prefs; }
  set prefs(p) { this._prefs = { ...this._prefs, ...p }; }

  get source() { return this.getAttribute('source') || ''; }
  set source(v) { this.setAttribute('source', v); }

  connectedCallback() {
    if (!this._initialized) {
      this._initialized = true;
      this._render();
    }
  }

  attributeChangedCallback(name, oldV, newV) {
    if (oldV === newV) return;
    if (name === 'source' && this._initialized) {
      this._setSource(newV);
    }
    if (name === 'login' && this._initialized) {
      this.login = newV;
    }
  }

  /** Initialize the component — discovers pods and loads initial view. */
  async initialize() {
    const source = this.source;
    if (source) {
      this._rootUrl = source.endsWith('/') ? source : source + '/';
      this._storages = [this._rootUrl];
      this._populateSelect(this._storages);
      await this.loadContainer(this._rootUrl);
    } else {
      // Discover from current origin
      try {
        const webIds = await discoverOwnerWebIds();
        this._storages = await getStoragesFromWebIds(webIds);
      } catch (e) {
        console.warn('[sol-pod] Discovery failed:', e);
        // Fall back to current origin root
        this._storages = [window.location.origin + '/'];
      }
      this._populateSelect(this._storages);
      if (this._storages.length > 0) {
        this._rootUrl = this._storages[0];
        const sel = this.shadowRoot.querySelector('.pod-select');
        if (sel) sel.value = this._rootUrl;
        await this.loadContainer(this._rootUrl);
      }
    }
  }

  _fetchFor(url) {
    if (this._login?.fetchFor) return this._login.fetchFor(url);
    return fetch;
  }

  async _setSource(url) {
    if (!url) return;
    this._rootUrl = url.endsWith('/') ? url : url + '/';
    if (!this._storages.includes(this._rootUrl)) {
      this._storages.push(this._rootUrl);
      this._populateSelect(this._storages);
    }
    const sel = this.shadowRoot.querySelector('.pod-select');
    if (sel) sel.value = this._rootUrl;
    await this.loadContainer(this._rootUrl);
  }

  async loadContainer(url) {
    this._showLoading();
    try {
      const fetchFn = this._fetchFor(url);
      const items = await fetchContainer(url, fetchFn);
      this._currentPath = url;
      this._items = this._filterItems(items);
      this._renderTree(this._items);
      this._updateBreadcrumb(url);
      this._emitStatus('', '');

      this.dispatchEvent(new CustomEvent('sol-navigate', {
        bubbles: true, composed: true, detail: { url }
      }));
    } catch (e) {
      if (e.message?.includes('401') || e.message?.includes('403') || e.needsAuth) {
        this._showMessage('Authentication required \u2014 please log in.', true);
        this._currentPath = url;
        this._updateBreadcrumb(url);
        this.dispatchEvent(new CustomEvent('sol-auth-needed', {
          bubbles: true, composed: true, detail: { url }
        }));
      } else {
        this._showMessage(`Failed to load: ${e.message}`, true);
      }
    }
  }

  _filterItems(items) {
    return items.filter(item => {
      const n = item.name;
      if (this._prefs.hideDot && n.startsWith('.')) return false;
      if (this._prefs.hideHash && n.startsWith('#')) return false;
      if (this._prefs.hideTilde && n.endsWith('~')) return false;
      return true;
    });
  }

  // ── DOM rendering ───────────────────────────────────────────────────

  _render() {
    const s = this.shadowRoot;
    s.innerHTML = `<style>${CSS}</style>
      <div class="pod-header">
        <div class="pod-header-row">
          <select class="pod-select" aria-label="Pod storage">
            <option value="">Loading pods...</option>
          </select>
        </div>
      </div>
      <div class="breadcrumb"></div>
      <div class="tree-wrapper">
        <div class="empty">Loading...</div>
      </div>`;

    const sel = s.querySelector('.pod-select');
    sel.addEventListener('change', () => {
      if (sel.value === '__add__') {
        this._promptAddPod();
      } else if (sel.value) {
        this._rootUrl = sel.value;
        this.loadContainer(sel.value);
      }
    });
  }

  _populateSelect(storages) {
    const sel = this.shadowRoot.querySelector('.pod-select');
    if (!sel) return;
    sel.innerHTML = '';
    if (storages.length === 0) {
      sel.innerHTML = '<option value="">No pods found</option>';
    } else {
      storages.forEach(url => {
        const opt = document.createElement('option');
        opt.value = url; opt.textContent = url;
        sel.appendChild(opt);
      });
    }
    const addOpt = document.createElement('option');
    addOpt.value = '__add__'; addOpt.textContent = '\uFF0B Add a Pod...';
    sel.appendChild(addOpt);
  }

  async _promptAddPod() {
    const sel = this.shadowRoot.querySelector('.pod-select');
    const prev = this._currentPath || sel.options[0]?.value;
    if (prev && prev !== '__add__') sel.value = prev;

    // Use sol-modal prompt if available, else native prompt
    let url;
    if (customElements.get('sol-modal')) {
      const { SolModal } = await import('./sol-modal.js');
      url = await SolModal.prompt('Enter pod URL:', 'https://example.solidcommunity.net/');
    } else {
      url = prompt('Enter pod URL:', 'https://example.solidcommunity.net/');
    }

    if (!url || !url.startsWith('http')) {
      if (prev && prev !== '__add__') sel.value = prev;
      return;
    }
    const normalized = url.endsWith('/') ? url : url + '/';
    if (!this._storages.includes(normalized)) {
      this._storages.push(normalized);
      this._populateSelect(this._storages);
    }
    sel.value = normalized;
    this._rootUrl = normalized;
    await this.loadContainer(normalized);
  }

  _showLoading() {
    const tw = this.shadowRoot.querySelector('.tree-wrapper');
    if (tw) tw.innerHTML = '<div class="loading">Loading...</div>';
  }

  _showMessage(msg, isError) {
    const tw = this.shadowRoot.querySelector('.tree-wrapper');
    if (tw) tw.innerHTML = `<div class="empty${isError ? ' error' : ''}">${msg}</div>`;
  }

  _updateBreadcrumb(url) {
    const el = this.shadowRoot.querySelector('.breadcrumb');
    if (!el || !this._rootUrl) return;
    el.innerHTML = '';
    const home = document.createElement('button');
    home.textContent = '\u{1F3E0}'; home.className = 'btn-secondary';
    home.onclick = () => this.loadContainer(this._rootUrl);
    el.appendChild(home);
    if (url !== this._rootUrl) {
      const parts = url.replace(this._rootUrl, '').split('/').filter(Boolean);
      let cur = this._rootUrl;
      parts.forEach(part => {
        cur += part + '/'; const pathUrl = cur;
        el.appendChild(document.createTextNode(' / '));
        const btn = document.createElement('button');
        btn.textContent = part; btn.className = 'btn-secondary';
        btn.onclick = () => this.loadContainer(pathUrl);
        el.appendChild(btn);
      });
    }
  }

  _renderTree(items) {
    const tw = this.shadowRoot.querySelector('.tree-wrapper');
    tw.innerHTML = '';
    if (items.length === 0) { tw.innerHTML = '<div class="empty">Empty container</div>'; return; }
    const ul = document.createElement('ul');
    ul.className = 'file-tree';
    items.forEach(item => ul.appendChild(this._createTreeItem(item)));
    tw.appendChild(ul);

    // Drop zone
    tw.ondragover = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; tw.parentElement?.classList.add('drag-over'); };
    tw.ondragleave = (e) => { if (e.target === tw) tw.parentElement?.classList.remove('drag-over'); };
    tw.ondrop = (e) => { e.preventDefault(); tw.parentElement?.classList.remove('drag-over'); };
  }

  _createTreeItem(item) {
    const li = document.createElement('li');
    li.className = item.isContainer ? 'folder' : 'file';
    li.tabIndex = 0;
    li.dataset.url = item.url;

    const label = document.createElement('span');
    label.className = 'item-label';
    label.textContent = `${item.isContainer ? '\u{1F4C1}' : fileIcon(item.name)} ${item.name}`;
    li.appendChild(label);

    const gear = document.createElement('button');
    gear.className = 'item-gear'; gear.textContent = '\u2699';
    gear.title = 'Actions';
    gear.onclick = (e) => { e.stopPropagation(); this._openItemModal(item); };
    li.appendChild(gear);

    // Drag
    li.draggable = true;
    li.ondragstart = (e) => {
      this._draggedItem = item;
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('text/plain', item.url);
      li.classList.add('dragging');
      this.dispatchEvent(new CustomEvent('sol-drag-start', {
        bubbles: true, composed: true, detail: { item, element: this }
      }));
    };
    li.ondragend = () => { li.classList.remove('dragging'); };

    if (item.isContainer) {
      li.onclick = () => { if (!li.classList.contains('dragging')) this.loadContainer(item.url); };
      li.onkeypress = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.loadContainer(item.url); } };
    }

    return li;
  }

  // ── Item modal ──────────────────────────────────────────────────────

  async _openItemModal(item) {
    // Resolve effective name for extensionless files
    let effectiveName = item.name;
    if (!item.isContainer && !extOf(item.name)) {
      try {
        const fetchFn = this._fetchFor(item.url);
        const head = await fetchFn(item.url, { method: 'HEAD' });
        const ct = (head.headers.get('Content-Type') || '').split(';')[0].trim();
        const mapped = CT_TO_EXT[ct];
        if (mapped) effectiveName = item.name + '.' + mapped;
      } catch (e) {}
    }

    const hasLive = !item.isContainer && isLiveFormat(item.url, item.contentType);
    const fileTabs = hasLive
      ? ['Live Edit', 'Download', 'Rename', 'Delete', 'Permissions']
      : ['View', 'Edit', 'Graph', 'Download', 'Rename', 'Delete', 'Permissions'];
    const tabDefs = item.isContainer
      ? ['New File', 'New Folder', 'Download', 'Rename', 'Delete', 'Permissions']
      : fileTabs;

    // Filter tabs by capability
    const tabs = tabDefs.filter(name => {
      if (name === 'Edit' && !isEditable(effectiveName)) return false;
      if (name === 'View' && !isViewable(effectiveName)) return false;
      if (name === 'Graph' && !isRdf(effectiveName)) return false;
      return true;
    }).map(name => ({
      name,
      render: (body, footer, actions) => this._renderTab(name.toLowerCase(), item, effectiveName, body, footer, actions)
    }));

    // Load sol-modal
    const { SolModal } = await import('./sol-modal.js');
    const modal = document.createElement('sol-modal');
    modal.modalTitle = item.isContainer ? `Folder: ${item.name}` : item.name;
    modal.tabs = tabs;
    modal.open();
    this._modal = modal;

    // Default tab
    const defaultTab = item.isContainer ? 'New File'
      : hasLive ? 'Live Edit'
      : isRdf(effectiveName) ? 'Graph'
      : isViewable(effectiveName) ? 'View' : 'Rename';
    modal.switchTab(defaultTab);
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
    const canZoom = ['turtle','jsonld','graphviz'].includes(fmt);
    const canStats = fmt === 'csv';

    // Header action buttons
    actions.innerHTML = '';
    const mkBtn = (text, title, cls = '') => {
      const b = document.createElement('button');
      b.className = 'modal-action-btn' + (cls ? ' ' + cls : '');
      b.textContent = text; if (title) b.title = title;
      actions.appendChild(b); return b;
    };
    let zmOut, zmPct, zmIn;
    if (canZoom) {
      zmOut = mkBtn('\u2212', 'Zoom out');
      zmPct = document.createElement('span');
      zmPct.className = 'modal-zoom-pct'; zmPct.textContent = '100%';
      actions.appendChild(zmPct);
      zmIn = mkBtn('+', 'Zoom in');
    }
    const statsBtn = canStats ? mkBtn('Statistics', '') : null;
    const saveBtn = mkBtn('Save', '', 'primary');
    const cfgBtn = mkBtn('\u2699', 'Settings');
    const hlpBtn = mkBtn('?', 'Help');

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

    // Load sol-live-edit
    await this._ensureLiveEdit();
    body.innerHTML = '';
    body.style.height = '100%';

    const el = document.createElement('sol-live-edit');
    el.setAttribute('source', item.url);
    el.setAttribute('format', fmt);
    el.style.cssText = 'display:flex;flex-direction:column;width:100%;height:100%';
    if (fetchFn !== fetch) el.fetchFn = fetchFn;
    el.addEventListener('sol-save', async (ev) => {
      const { content, url } = ev.detail;
      await onSave(content, url);
    });
    body.appendChild(el);

    if (zmOut) zmOut.onclick = () => el.zoomOut();
    if (zmIn) zmIn.onclick = () => el.zoomIn();
    if (statsBtn) statsBtn.onclick = () => el.toggleStats();
    saveBtn.onclick = () => el.save();
    cfgBtn.onclick = () => el.toggleSettings();
    hlpBtn.onclick = () => el.toggleHelp();
    el.addEventListener('sol-zoom', (e) => { if (zmPct) zmPct.textContent = e.detail.pct + '%'; });

    return () => { body.innerHTML = ''; };
  }

  async _ensureLiveEdit() {
    if (_liveEditLoaded || customElements.get('sol-live-edit')) { _liveEditLoaded = true; return; }
    const url = new URL('sol-live-edit.js', import.meta.url).href;
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
        img.className = 'modal-media'; img.src = url; img.alt = item.name;
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
          div.innerHTML = marked.parse(text);
          body.innerHTML = ''; body.appendChild(div);
        } catch (e) {
          body.innerHTML = ''; const pre = document.createElement('pre');
          pre.className = 'modal-preview'; pre.textContent = text;
          body.appendChild(pre);
        }
      } else if (extOf(effectiveName) === 'html' || extOf(effectiveName) === 'htm') {
        const text = await (await fetchFn(item.url)).text();
        const iframe = document.createElement('iframe');
        iframe.className = 'modal-pdf'; iframe.sandbox = 'allow-scripts';
        iframe.srcdoc = text;
        body.innerHTML = ''; body.appendChild(iframe);
      } else {
        const text = await (await fetchFn(item.url)).text();
        const pre = document.createElement('pre');
        pre.className = 'modal-preview'; pre.textContent = text;
        body.innerHTML = ''; body.appendChild(pre);
      }
    } catch (e) {
      body.innerHTML = `<div class="modal-message error">Failed to load: ${e.message}</div>`;
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
      saveBtn.className = 'modal-header-btn modal-header-btn-primary';
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
        } catch (e) {
          this._emitStatus(`Save failed: ${e.message}`, 'error');
        }
      };
      if (actions) actions.appendChild(saveBtn);
    } catch (e) {
      body.innerHTML = `<div class="modal-message error">Failed to load: ${e.message}</div>`;
    }
  }

  // ── Graph tab ───────────────────────────────────────────────────────

  async _tabGraph(item, effectiveName, body, footer, actions) {
    const fetchFn = this._fetchFor(item.url);
    body.innerHTML = '<div class="modal-message">Loading RDF graph...</div>';

    try {
      const text = await (await fetchFn(item.url)).text();
      const { getRdflib } = await import('./shared/rdf-utils.js');
      const $rdf = await getRdflib();

      const store = $rdf.graph();
      $rdf.parse(text, store, item.url, 'text/turtle');
      const triples = store.statements;

      if (triples.length === 0) {
        body.innerHTML = '<div class="modal-message">No triples found.</div>';
        return;
      }

      // Build simple triple table
      const table = document.createElement('table');
      table.style.cssText = 'width:100%;border-collapse:collapse;font-size:0.85em;';
      const thead = document.createElement('thead');
      thead.innerHTML = '<tr><th style="text-align:left;padding:6px;border-bottom:2px solid var(--border,#e0e0e0)">Subject</th><th style="text-align:left;padding:6px;border-bottom:2px solid var(--border,#e0e0e0)">Predicate</th><th style="text-align:left;padding:6px;border-bottom:2px solid var(--border,#e0e0e0)">Object</th></tr>';
      table.appendChild(thead);
      const tbody = document.createElement('tbody');
      for (const t of triples) {
        const tr = document.createElement('tr');
        const short = (v) => {
          const s = v.value || String(v);
          return s.length > 60 ? s.slice(0, 57) + '...' : s;
        };
        tr.innerHTML = `<td style="padding:4px 6px;border-bottom:1px solid var(--border,#e0e0e0);word-break:break-all">${short(t.subject)}</td><td style="padding:4px 6px;border-bottom:1px solid var(--border,#e0e0e0);word-break:break-all">${short(t.predicate)}</td><td style="padding:4px 6px;border-bottom:1px solid var(--border,#e0e0e0);word-break:break-all">${short(t.object)}</td>`;
        tbody.appendChild(tr);
      }
      table.appendChild(tbody);
      body.innerHTML = '';
      body.appendChild(table);

      footer.innerHTML = `<span class="modal-note">${triples.length} triple(s)</span>`;
    } catch (e) {
      body.innerHTML = `<div class="modal-message error">Parse error: ${e.message}</div>`;
    }
  }

  // ── Download tabs ───────────────────────────────────────────────────

  _tabDownloadFile(item, body, footer, actions) {
    body.innerHTML = `<div class="modal-message">Download <strong>${item.name}</strong></div>`;
    const btn = document.createElement('button');
    btn.className = 'modal-header-btn modal-header-btn-primary';
    btn.textContent = `\u2B07 ${item.name}`;
    btn.onclick = async () => {
      const fetchFn = this._fetchFor(item.url);
      const resp = await fetchFn(item.url);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = item.name; a.click();
      URL.revokeObjectURL(url);
    };
    if (actions) actions.appendChild(btn);
  }

  async _tabDownloadFolder(item, body, footer, actions) {
    body.innerHTML = `<div class="modal-message">Download folder <strong>${item.name}</strong> as ZIP</div>`;
    const btn = document.createElement('button');
    btn.className = 'modal-header-btn modal-header-btn-primary';
    btn.textContent = `\u2B07 ${item.name}.zip`;
    btn.onclick = async () => {
      try {
        const JSZip = (await import('https://esm.sh/jszip@3.10.0')).default;
        const zip = new JSZip();
        const addFolder = async (containerUrl, zipFolder) => {
          const fetchFn = this._fetchFor(containerUrl);
          const items = await fetchContainer(containerUrl, fetchFn);
          for (const child of items) {
            if (child.isContainer) {
              await addFolder(child.url, zipFolder.folder(child.name));
            } else {
              const resp = await fetchFn(child.url);
              zipFolder.file(child.name, await resp.blob());
            }
          }
        };
        btn.disabled = true; btn.textContent = 'Downloading...';
        await addFolder(item.url, zip.folder(item.name));
        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = item.name + '.zip'; a.click();
        URL.revokeObjectURL(url);
        btn.textContent = 'Done!';
      } catch (e) {
        this._emitStatus(`Download failed: ${e.message}`, 'error');
        btn.disabled = false; btn.textContent = `\u2B07 ${item.name}.zip`;
      }
    };
    if (actions) actions.appendChild(btn);
  }

  // ── Rename tab ──────────────────────────────────────────────────────

  _tabRename(item, body, footer, actions) {
    const input = document.createElement('input');
    input.className = 'modal-input'; input.type = 'text';
    input.value = item.name;
    body.innerHTML = ''; body.appendChild(input);

    const btn = document.createElement('button');
    btn.className = 'modal-header-btn modal-header-btn-primary';
    btn.textContent = 'Rename';
    btn.onclick = async () => {
      const newName = input.value.trim();
      if (!newName || newName === item.name) return;
      try {
        const fetchFn = this._fetchFor(item.url);
        if (item.isContainer) {
          const parentUrl = item.url.slice(0, item.url.slice(0, -1).lastIndexOf('/') + 1);
          const fetchFnForUrl = (u) => this._fetchFor(u);
          await copyFolder(item.url, parentUrl, newName, fetchFnForUrl, msg => this._emitStatus(msg, ''));
          await deleteFolder(item.url, fetchFnForUrl);
        } else {
          const containerUrl = item.url.substring(0, item.url.lastIndexOf('/') + 1);
          const newUrl = containerUrl + newName;
          const resp = await fetchFn(item.url);
          if (!resp.ok) throw new Error(`Read failed: ${resp.status}`);
          const blob = await resp.blob();
          await fetchFn(newUrl, { method: 'PUT', headers: { 'Content-Type': contentTypeFor(newName) }, body: blob });
          await fetchFn(item.url, { method: 'DELETE' });
        }
        this._emitStatus('Renamed.', 'success');
        if (this._modal) this._modal.close();
        await this.loadContainer(this._currentPath);
      } catch (e) { this._emitStatus(`Rename failed: ${e.message}`, 'error'); }
    };
    if (actions) actions.appendChild(btn);
  }

  // ── Delete tab ──────────────────────────────────────────────────────

  _tabDelete(item, body, footer, actions) {
    body.innerHTML = `<div class="modal-message">Delete <strong>${item.name}</strong>${item.isContainer ? ' and all its contents' : ''}?</div>`;
    const btn = document.createElement('button');
    btn.className = 'modal-header-btn modal-header-btn-danger';
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
        if (this._modal) this._modal.close();
        await this.loadContainer(this._currentPath);
      } catch (e) { this._emitStatus(`Delete failed: ${e.message}`, 'error'); }
    };
    const cancel = document.createElement('button');
    cancel.className = 'modal-header-btn'; cancel.textContent = 'Cancel';
    cancel.onclick = () => { if (this._modal) this._modal.close(); };
    if (actions) { actions.appendChild(btn); actions.appendChild(cancel); }
  }

  // ── New File tab ────────────────────────────────────────────────────

  _tabNewFile(item, body, footer, actions) {
    body.innerHTML = '';

    // Upload section
    const uploadLabel = document.createElement('div');
    uploadLabel.className = 'modal-label'; uploadLabel.textContent = 'Upload files:';
    const fileInput = document.createElement('input');
    fileInput.type = 'file'; fileInput.multiple = true;
    body.appendChild(uploadLabel); body.appendChild(fileInput);

    const uploadBtn = document.createElement('button');
    uploadBtn.className = 'modal-header-btn modal-header-btn-primary';
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
      if (this._modal) this._modal.close();
      await this.loadContainer(this._currentPath);
    };
    if (actions) actions.appendChild(uploadBtn);

    // Separator
    const hr = document.createElement('hr');
    hr.style.cssText = 'border:none;border-top:1px solid var(--border,#e0e0e0);margin:8px 0';
    body.appendChild(hr);

    // Create section
    const createLabel = document.createElement('div');
    createLabel.className = 'modal-label'; createLabel.textContent = 'Or create a new file:';
    const nameInput = document.createElement('input');
    nameInput.className = 'modal-input'; nameInput.type = 'text';
    nameInput.placeholder = 'filename.ext';
    const contentTA = document.createElement('textarea');
    contentTA.className = 'modal-editor'; contentTA.placeholder = 'File content (optional)';
    contentTA.style.minHeight = '80px';
    body.append(createLabel, nameInput, contentTA);

    const createBtn = document.createElement('button');
    createBtn.className = 'modal-header-btn modal-header-btn-primary';
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
        if (this._modal) this._modal.close();
        await this.loadContainer(this._currentPath);
      } catch (e) { this._emitStatus(`Create failed: ${e.message}`, 'error'); }
    };
    footer.appendChild(createBtn);
  }

  // ── New Folder tab ──────────────────────────────────────────────────

  _tabNewFolder(item, body, footer, actions) {
    const input = document.createElement('input');
    input.className = 'modal-input'; input.type = 'text';
    input.placeholder = 'Folder name';
    body.innerHTML = ''; body.appendChild(input);

    const btn = document.createElement('button');
    btn.className = 'modal-header-btn modal-header-btn-primary';
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
        if (this._modal) this._modal.close();
        await this.loadContainer(this._currentPath);
      } catch (e) { this._emitStatus(`Create failed: ${e.message}`, 'error'); }
    };
    if (actions) actions.appendChild(btn);
  }

  // ── Permissions tab ─────────────────────────────────────────────────

  async _tabPermissions(item, body, footer, actions) {
    body.innerHTML = '<div class="modal-message">Loading permissions...</div>';
    const fetchFn = this._fetchFor(item.url);

    try {
      const perms = await getPermissions(item.url, fetchFn);
      body.innerHTML = '';

      let turtleText = perms.own || (perms.inherited ? adaptInheritedAcl(perms.inherited, perms.inheritedFrom, item.url) : '');
      const auths = turtleText ? parseAcl(turtleText, item.url) : [];
      let model = authsToRoleModel(auths);

      if (perms.inherited && !perms.own) {
        const banner = document.createElement('div');
        banner.className = 'modal-info-banner';
        banner.textContent = `Inheriting permissions from ${perms.inheritedFrom}. Save to create own ACL.`;
        body.appendChild(banner);
      }

      // Subtabs: Form / RDF
      const subtabs = document.createElement('div');
      subtabs.className = 'modal-subtabs';
      const formBtn = document.createElement('button');
      formBtn.className = 'modal-subtab active'; formBtn.textContent = 'Form';
      const rdfBtn = document.createElement('button');
      rdfBtn.className = 'modal-subtab'; rdfBtn.textContent = 'RDF';
      subtabs.append(formBtn, rdfBtn);
      body.appendChild(subtabs);

      const content = document.createElement('div');
      content.style.cssText = 'flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:10px;min-height:0';
      body.appendChild(content);

      const saveAcl = async () => {
        try {
          const resp = await fetchFn(perms.aclUrl, {
            method: 'PUT', headers: { 'Content-Type': 'text/turtle' }, body: turtleText,
          });
          if (!resp.ok) throw new Error(`${resp.status}`);
          this._emitStatus('ACL saved.', 'success');
        } catch (e) { this._emitStatus(`Save failed: ${e.message}`, 'error'); }
      };

      const saveBtn = document.createElement('button');
      saveBtn.className = 'modal-header-btn modal-header-btn-primary';
      saveBtn.textContent = 'Save ACL';
      saveBtn.onclick = saveAcl;
      const note = document.createElement('span');
      note.className = 'modal-note';
      note.textContent = perms.aclUrl;
      if (actions) { actions.appendChild(saveBtn); actions.appendChild(note); }

      const renderForm = () => {
        content.innerHTML = '';
        const form = this._buildRoleForm(model, item.isContainer, () => {
          turtleText = roleModelToTurtle(model, item.url);
        });
        content.appendChild(form);
      };

      const renderRdf = () => {
        content.innerHTML = '';
        const ta = document.createElement('textarea');
        ta.className = 'modal-editor'; ta.value = turtleText;
        ta.style.flex = '1';
        ta.oninput = () => { turtleText = ta.value; };
        content.appendChild(ta);
      };

      formBtn.onclick = () => {
        formBtn.classList.add('active'); rdfBtn.classList.remove('active');
        renderForm();
      };
      rdfBtn.onclick = () => {
        rdfBtn.classList.add('active'); formBtn.classList.remove('active');
        renderRdf();
      };

      renderForm();
    } catch (e) {
      body.innerHTML = `<div class="modal-message error">Failed to load permissions: ${e.message}</div>`;
    }
  }

  _buildRoleForm(model, isContainer, onChange) {
    const wrap = document.createElement('div');
    wrap.className = 'acl-role-form';

    ROLES.forEach(role => {
      const rm = model[role.key];
      const row = document.createElement('div');
      row.className = 'acl-role-row';

      const nameEl = document.createElement('span');
      nameEl.className = 'acl-role-name';
      nameEl.textContent = role.label;

      const select = document.createElement('select');
      select.className = 'acl-grant-select';
      GRANT_OPTIONS.forEach(opt => {
        const o = document.createElement('option');
        o.value = opt.value; o.textContent = opt.label;
        select.appendChild(o);
      });
      select.value = rm.grant;
      select.onchange = () => { rm.grant = select.value; onChange(); };

      const editBtn = document.createElement('button');
      editBtn.className = 'acl-edit-btn'; editBtn.textContent = 'Edit';
      editBtn.style.display = rm.grant === 'specific' ? '' : 'none';

      const countBadge = document.createElement('span');
      countBadge.className = 'acl-specific-count';
      const updateCount = () => {
        const c = rm.webids.length + rm.groups.length;
        countBadge.textContent = c;
        countBadge.style.display = c > 0 ? '' : 'none';
      };
      updateCount();

      editBtn.onclick = () => this._openSpecificModal(rm, onChange, updateCount);

      select.addEventListener('change', () => {
        editBtn.style.display = select.value === 'specific' ? '' : 'none';
        if (select.value === 'specific' && rm.webids.length === 0 && rm.groups.length === 0) {
          this._openSpecificModal(rm, onChange, updateCount);
        }
      });

      row.append(nameEl, select, editBtn, countBadge);
      wrap.appendChild(row);
    });

    if (isContainer) {
      const cbWrap = document.createElement('label');
      cbWrap.className = 'acl-default-wrap acl-default-global';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = ROLES.some(r => model[r.key].applyToContents);
      cb.onchange = () => { ROLES.forEach(r => { model[r.key].applyToContents = cb.checked; }); onChange(); };
      cbWrap.appendChild(cb);
      cbWrap.appendChild(document.createTextNode('\u00A0Apply to folder contents (acl:default)'));
      wrap.appendChild(cbWrap);
    }
    return wrap;
  }

  _openSpecificModal(rm, onChange, onUpdate) {
    const overlay = document.createElement('div');
    overlay.className = 'acl-specific-overlay';
    const dialog = document.createElement('div');
    dialog.className = 'acl-specific-dialog';

    dialog.innerHTML = `
      <div class="acl-specific-title">Specific people and groups</div>
      <div class="acl-section-label">WebIDs (one per line):</div>
      <textarea class="acl-agents-input" rows="4" placeholder="https://example.solidcommunity.net/profile/card#me">${rm.webids.join('\n')}</textarea>
      <div class="acl-section-label">vCard group URLs (one per line):</div>
      <textarea class="acl-agents-input" rows="3" placeholder="https://example.solidcommunity.net/contacts/Group/friends#this">${rm.groups.join('\n')}</textarea>
      <div class="acl-specific-btns">
        <button class="modal-header-btn cancel-btn">Cancel</button>
        <button class="modal-header-btn modal-header-btn-primary ok-btn">OK</button>
      </div>`;

    const [webidTA, groupTA] = dialog.querySelectorAll('textarea');
    dialog.querySelector('.cancel-btn').onclick = () => overlay.remove();
    dialog.querySelector('.ok-btn').onclick = () => {
      rm.webids = webidTA.value.split('\n').map(s => s.trim()).filter(Boolean);
      rm.groups = groupTA.value.split('\n').map(s => s.trim()).filter(Boolean);
      onChange();
      if (onUpdate) onUpdate();
      overlay.remove();
    };

    overlay.appendChild(dialog);
    // Append to shadow root so styles apply
    this.shadowRoot.appendChild(overlay);
    webidTA.focus();
  }

  // ── Status emission ─────────────────────────────────────────────────

  _emitStatus(message, type) {
    this.dispatchEvent(new CustomEvent('sol-status', {
      bubbles: true, composed: true,
      detail: { message, type }
    }));
  }
}

customElements.define('sol-pod', SolPod);
export { SolPod };
export default SolPod;
