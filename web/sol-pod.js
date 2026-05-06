/**
 * <sol-pod> — Solid pod file browser web component.
 * Attributes: source (pod storage URL — if omitted, discovers from current origin)
 *             gear-action (Function|string — custom callback when gear icon is clicked;
 *                          if omitted, opens the default pod-ops modal)
 * Properties: login (SolLogin element ref), currentPath, items
 * Events: sol-navigate({url}), sol-drag-start({item}), sol-status({message,type})
 *
 * Usage:
 *   <sol-login id="auth"></sol-login>
 *   <sol-pod source="https://pod.example/" login="#auth"></sol-pod>
 */

import { CSS, sheet as POD_SHEET } from './styles/sol-pod-css.js';
import { sheet as POD_MODAL_SHEET, CSS as POD_MODAL_CSS } from './styles/sol-pod-modal-css.js';
import { adopt } from '../core/adopt.js';
import { define } from '../core/define.js';
import {
  fileIcon,
  fetchContainer,
  discoverOwnerWebIds, getStoragesFromWebIds,
} from '../core/pod-ops.js';

// ── SolPod component ──────────────────────────────────────────────────

/**
 * Solid pod file browser web component.
 *
 * Browse containers, view/edit files, manage permissions. Pairs with
 * sol-login for authenticated access. Delegates file operations to sol-pod-ops.
 *
 * @class SolPod
 * @extends HTMLElement
 * @attr {string} source - pod storage URL (discovers from origin if omitted)
 * @attr {string} login - CSS selector for a sol-login element
 * @attr {string} gear-action - custom callback when gear icon is clicked
 * @attr {string} handler - default sol-* component for file viewing
 * @property {Object} login - SolLogin element reference
 * @property {string} currentPath - current container URL
 * @property {Array} items - current directory listing
 * @fires sol-navigate - detail: { url }
 * @fires sol-drag-start - detail: { item, element }
 * @fires sol-auth-needed - detail: { url }
 * @fires sol-status - detail: { message, type }
 */
class SolPod extends HTMLElement {
  static get observedAttributes() { return ['source', 'login', 'gear-action', 'handler']; }

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
    this._toastTimer = null;
    this._draggedItem = null;
    this._gearAction = null;
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

  get gearAction() { return this._gearAction; }
  set gearAction(v) {
    if (typeof v === 'function') { this._gearAction = v; return; }
    if (typeof v === 'string' && v) { this._gearAction = v; return; }
    this._gearAction = null;
  }

  connectedCallback() {
    if (!this._initialized) {
      this._initialized = true;
      this._render();
      const loginAttr = this.getAttribute('login');
      if (loginAttr) this.login = loginAttr;
      const gearAttr = this.getAttribute('gear-action') || this.getAttribute('handler');
      if (gearAttr) this.gearAction = gearAttr;
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
    if (name === 'gear-action' || name === 'handler') {
      this.gearAction = newV;
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
    s.innerHTML = `
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
    s.adoptedStyleSheets = [];
    adopt(s, { sheet: POD_SHEET, css: CSS });

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
    home.textContent = '\u{1F3E0}'; home.className = 'sol-btn sol-btn-sm sol-btn-ghost';
    home.onclick = () => this.loadContainer(this._rootUrl);
    el.appendChild(home);
    if (url !== this._rootUrl) {
      const parts = url.replace(this._rootUrl, '').split('/').filter(Boolean);
      let cur = this._rootUrl;
      parts.forEach(part => {
        cur += part + '/'; const pathUrl = cur;
        el.appendChild(document.createTextNode(' / '));
        const btn = document.createElement('button');
        btn.textContent = part; btn.className = 'sol-btn sol-btn-sm sol-btn-ghost';
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
    gear.onclick = (e) => {
      e.stopPropagation();
      if (typeof this._gearAction === 'function') {
        this._gearAction(item, this);
      } else if (typeof this._gearAction === 'string') {
        this._openNamedHandler(this._gearAction, item);
      } else {
        this._openItemModal(item);
      }
    };
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

  // ── Item modal (delegates to <sol-pod-ops>) ─────────────────────────

  async _openItemModal(item) {
    await import('./sol-modal.js');
    await import('./sol-pod-ops.js');

    const modal = document.createElement('sol-modal');
    modal.modalTitle = item.isContainer ? `Folder: ${item.name}` : item.name;
    modal.styles = [POD_MODAL_SHEET || POD_MODAL_CSS];

    modal.handler = (body) => {
      body.style.padding = '0';
      body.style.overflow = 'hidden';
      const ops = document.createElement('sol-pod-ops');
      ops.item = item;
      ops.fetchFn = this._fetchFor(item.url);
      ops.setAttribute('source', item.url);
      ops.style.height = '100%';
      ops.addEventListener('sol-status', (e) => this._emitStatus(e.detail.message, e.detail.type));
      ops.addEventListener('sol-navigate', async () => {
        modal.close();
        await this.loadContainer(this._currentPath);
      });
      body.appendChild(ops);
    };
    modal.open();
    this._modal = modal;
  }

  // ── Named gear handlers ─────────────────────────────────────────────

  async _openNamedHandler(name, item) {
    switch (name) {
      case 'solidos': return this._openSolidosModal(item);
      default: return this._openItemModal(item);
    }
  }

  async _openSolidosModal(item) {
    await import('./sol-modal.js');
    await import('./sol-solidos.js');

    const modal = document.createElement('sol-modal');
    modal.modalTitle = item.name;
    modal.size = 'large';

    modal.handler = (body) => {
      body.style.padding = '0';
      body.style.overflow = 'hidden';
      const solidos = document.createElement('sol-solidos');
      solidos.setAttribute('source', item.url);
      solidos.style.height = '100%';
      body.appendChild(solidos);
    };
    modal.open();
    this._modal = modal;
  }

  // ── Status emission ─────────────────────────────────────────────────

  _emitStatus(message, type) {
    this.dispatchEvent(new CustomEvent('sol-status', {
      bubbles: true, composed: true,
      detail: { message, type }
    }));
  }
}

define('sol-pod', SolPod);
export { SolPod };
export default SolPod;
