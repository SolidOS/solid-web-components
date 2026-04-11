/**
 * <sol-modal> — Generic modal dialog web component.
 * Attributes: title, size ("small" for compact prompts),
 *             source, content, component (declarative trigger mode)
 * Properties: tabs (array), headerActions (Element[]), onClose (Function)
 * Methods: open(), close(), switchTab(name), prompt(message, placeholder)
 * Events: sol-close
 *
 * Imperative usage:
 *   const m = document.createElement('sol-modal');
 *   m.modalTitle = 'My File';
 *   m.tabs = [
 *     { name: 'View', render(body, footer, actions) { ... } },
 *     { name: 'Edit', render(body, footer, actions) { ... } },
 *   ];
 *   m.open();
 *
 *   // Prompt dialog:
 *   const val = await SolModal.prompt('Enter name:', 'default');
 *
 * Declarative trigger usage (any of source/content/component turns the
 * element into an inline button; clicking it opens a single-tab modal):
 *
 *   <sol-modal source="foo.html">edit foo</sol-modal>
 *   <sol-modal content="<p>hi</p>">show hi</sol-modal>
 *   <sol-modal source="foo.ttl" component="sol-live-edit" format="turtle">
 *     edit foo
 *   </sol-modal>
 *
 * When `component` is set, sol-modal creates that element inside the modal
 * body and forwards all attributes (except title/size/component/content) to
 * it, so e.g. `source` and `format` above both land on the sol-live-edit.
 *
 * The trigger button is exposed as `::part(trigger)` for external styling.
 *
 * Events (bubbling, composed):
 *   sol-ready — fires after the declarative body is populated.
 *     detail: { body, mode: 'source'|'content'|'component', element }
 *     (`element` is the created component in component-mode, else null)
 *   sol-close — fires when the modal closes.
 */

import { CSS } from './utils/sol-modal-css.js';

const OWN_ATTRS = new Set(['title', 'size', 'component', 'content']);

class SolModal extends HTMLElement {
  static get observedAttributes() { return ['title', 'size']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._tabs = [];
    this._tabEls = {};
    this._activeTab = null;
    this._cleanup = null;
    this._onClose = null;
    this._triggerMode = false;
  }

  _isTriggerUsage() {
    return this.hasAttribute('source')
        || this.hasAttribute('content')
        || this.hasAttribute('component');
  }

  get modalTitle() { return this.getAttribute('title') || ''; }
  set modalTitle(v) { this.setAttribute('title', v); }

  get tabs() { return this._tabs; }
  set tabs(arr) {
    this._tabs = arr || [];
    if (this.shadowRoot.querySelector('.modal')) this._renderTabs();
  }

  get onClose() { return this._onClose; }
  set onClose(fn) { this._onClose = fn; }

  get body() { return this.shadowRoot.querySelector('.modal-body'); }
  get footer() { return this.shadowRoot.querySelector('.modal-footer'); }
  get headerActions() { return this.shadowRoot.querySelector('.modal-header-actions'); }

  connectedCallback() {
    // Declarative trigger mode: render inline button if the element has
    // source/content/component and hasn't already been rendered by open().
    if (this._isTriggerUsage() && !this.shadowRoot.firstChild) {
      this._triggerMode = true;
      this._renderTrigger();
    }
  }

  _renderTrigger() {
    const s = this.shadowRoot;
    s.innerHTML = `<style>${CSS}
      .modal-trigger {
        padding: 4px 10px; font: inherit;
        border: 1px solid var(--border, #e0e0e0);
        border-radius: 4px;
        background: var(--surface-2, #f9f9f9);
        color: var(--text, #212121);
        cursor: pointer;
      }
      .modal-trigger:hover { background: var(--hover, #f0f0f0); }
    </style>
    <button class="modal-trigger" part="trigger" type="button"><slot>Open</slot></button>`;
    const btn = s.querySelector('.modal-trigger');
    const a11y = this.getAttribute('aria-label') || this.getAttribute('title');
    if (a11y) btn.setAttribute('aria-label', a11y);
    const tip = this.getAttribute('title');
    if (tip) btn.setAttribute('title', tip);
    btn.addEventListener('click', () => this._openDeclarative());
  }

  _emitReady(body, mode, element = null) {
    this.dispatchEvent(new CustomEvent('sol-ready', {
      bubbles: true, composed: true,
      detail: { body, mode, element }
    }));
  }

  _openDeclarative() {
    const source = this.getAttribute('source');
    const content = this.getAttribute('content');
    const componentName = this.getAttribute('component');
    const host = this;

    this._tabs = [{
      name: '_declarative',
      render: (body) => {
        if (componentName) {
          const el = document.createElement(componentName);
          for (const a of host.attributes) {
            if (!OWN_ATTRS.has(a.name)) el.setAttribute(a.name, a.value);
          }
          el.style.cssText = 'display:flex;flex-direction:column;width:100%;height:100%';
          body.appendChild(el);
          host._emitReady(body, 'component', el);
        } else if (source != null) {
          body.textContent = 'Loading...';
          fetch(source)
            .then(r => r.text())
            .then(html => {
              body.innerHTML = html;
              host._emitReady(body, 'source', null);
            })
            .catch(() => { body.textContent = 'Failed to load ' + source; });
        } else if (content != null) {
          body.innerHTML = content;
          host._emitReady(body, 'content', null);
        }
      }
    }];
    this.open();
  }

  attributeChangedCallback(name, oldV, newV) {
    if (oldV === newV) return;
    if (name === 'title') {
      const el = this.shadowRoot.querySelector('.modal-title');
      if (el) el.textContent = newV || '';
    }
  }

  open() {
    this._render();
    if (!this.parentNode) document.body.appendChild(this);
    if (this._tabs.length > 0) {
      this.switchTab(this._tabs[0].name);
    }
  }

  close() {
    if (typeof this._cleanup === 'function') { this._cleanup(); this._cleanup = null; }
    if (this._escHandler) {
      document.removeEventListener('keydown', this._escHandler);
      this._escHandler = null;
    }
    this.dispatchEvent(new CustomEvent('sol-close', { bubbles: true, composed: true }));
    if (this._onClose) this._onClose();
    if (this._triggerMode) {
      // Keep the element in the DOM, restore the trigger button.
      this._tabs = [];
      this._tabEls = {};
      this._activeTab = null;
      this._renderTrigger();
    } else {
      this.remove();
    }
  }

  switchTab(name) {
    const tab = this._tabs.find(t => t.name.toLowerCase() === name.toLowerCase());
    if (!tab) return;
    this._activeTab = tab.name;

    // Clean up previous
    if (typeof this._cleanup === 'function') { this._cleanup(); this._cleanup = null; }

    // Update tab buttons
    Object.values(this._tabEls).forEach(b => b.classList.remove('active'));
    if (this._tabEls[tab.name]) this._tabEls[tab.name].classList.add('active');

    // Clear body, footer, actions
    const body = this.body;
    const footer = this.footer;
    const actions = this.headerActions;
    body.innerHTML = '';
    body.style.padding = ''; body.style.overflow = ''; body.style.height = '';
    footer.innerHTML = '';
    if (actions) actions.innerHTML = '';

    // Render tab content
    const cleanup = tab.render(body, footer, actions);
    if (typeof cleanup === 'function') this._cleanup = cleanup;
  }

  _render() {
    const s = this.shadowRoot;
    s.innerHTML = `<style>${CSS}</style>
      <div class="modal-overlay">
        <div class="modal" role="dialog" aria-label="${this.modalTitle}">
          <div class="modal-header">
            <span class="modal-title">${this.modalTitle}</span>
            <div class="modal-header-actions"></div>
            <button class="modal-close">\u2715</button>
          </div>
          <div class="modal-tabs"></div>
          <div class="modal-body"></div>
          <div class="modal-footer"></div>
        </div>
      </div>`;

    // Wire close
    s.querySelector('.modal-close').onclick = () => this.close();
    s.querySelector('.modal-overlay').addEventListener('click', (e) => {
      if (e.target === s.querySelector('.modal-overlay')) this.close();
    });

    // Escape to close
    this._escHandler = (e) => { if (e.key === 'Escape') this.close(); };
    document.addEventListener('keydown', this._escHandler);

    this._renderTabs();
  }

  _renderTabs() {
    const bar = this.shadowRoot.querySelector('.modal-tabs');
    bar.innerHTML = '';
    this._tabEls = {};
    if (this._tabs.length <= 1) { bar.style.display = 'none'; return; }
    bar.style.display = '';
    this._tabs.forEach(tab => {
      const btn = document.createElement('button');
      btn.className = 'modal-tab';
      btn.textContent = tab.name;
      btn.onclick = () => this.switchTab(tab.name);
      bar.appendChild(btn);
      this._tabEls[tab.name] = btn;
    });
  }

  disconnectedCallback() {
    if (this._escHandler) {
      document.removeEventListener('keydown', this._escHandler);
      this._escHandler = null;
    }
  }

  /**
   * Static prompt dialog. Returns user input or null.
   * @param {string} message
   * @param {string} placeholder
   * @returns {Promise<string|null>}
   */
  static prompt(message, placeholder = '') {
    return new Promise(resolve => {
      const m = document.createElement('sol-modal');
      m.setAttribute('size', 'small');
      m.modalTitle = message;
      m.tabs = [{
        name: '_prompt',
        render(body, footer) {
          const input = document.createElement('input');
          input.className = 'modal-input';
          input.type = 'text';
          input.placeholder = placeholder;
          body.style.padding = '16px 20px';
          body.appendChild(input);

          const ok = document.createElement('button');
          ok.className = 'modal-header-btn modal-header-btn-primary';
          ok.textContent = 'OK';
          const cancel = document.createElement('button');
          cancel.className = 'modal-header-btn';
          cancel.textContent = 'Cancel';
          footer.appendChild(cancel);
          footer.appendChild(ok);

          const done = (v) => { m.onClose = null; m.close(); resolve(v); };
          ok.onclick = () => done(input.value.trim());
          cancel.onclick = () => done(null);
          input.onkeydown = (e) => {
            if (e.key === 'Enter') done(input.value.trim());
            if (e.key === 'Escape') done(null);
          };
          setTimeout(() => input.focus(), 50);
        }
      }];
      m.onClose = () => resolve(null);
      m.open();
    });
  }
}

customElements.define('sol-modal', SolModal);
export { SolModal };
export default SolModal;
