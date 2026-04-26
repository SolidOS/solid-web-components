/**
 * <sol-form> — Generic RDF form renderer.
 *
 * Loads a ui:Form definition from a Turtle source URI and renders it using
 * solid-ui's form field system. The form's data lives in an rdflib
 * IndexedFormula; on save, the graph is written to a Solid Pod (PUT via
 * fetcher.putBack) or downloaded as a local Turtle file.
 *
 * Attributes:
 *   source   — URI of a Turtle file containing a ui:Form definition (required)
 *   subject  — URI of an existing RDF resource to edit (optional; blank = new)
 *   shape    — URI of a SHACL shapes file for validation before save (optional)
 *   save-to  — Pre-filled Pod URL for saving (optional)
 *
 * Events (bubbling, composed):
 *   sol-form-change — detail: { subject }   — fired on every field edit
 *   sol-form-save   — detail: { subject, turtle, target } — fired after save
 *
 * @class SolForm
 * @extends HTMLElement
 */

import { define } from '@solid-components/core/define.js';
import { adopt }  from '@solid-components/core/adopt.js';
import { rdf }    from '@solid-components/core/rdf.js';
import { loadRdfStore } from '@solid-components/core/rdf-utils.js';
import {
  UI, RDF, MAX_DEPTH, fieldType, readFormParts, readList,
  syncCollection, removeChain, removeItemData, setDefaults, findForm,
} from '@solid-components/core/form-utils.js';
import { CSS as FORM_CSS, sheet as formSheet } from './styles/sol-form-css.js';

const SAVE_MODE_KEY = 'sol-form-save-mode';

class SolForm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._store     = null;
    this._formNode  = null;
    this._subject   = null;
    this._docNode   = null;
    this._rendered  = false;
    this._shapeStore = null;
  }

  static get observedAttributes() { return ['source', 'subject', 'shape', 'save-to']; }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return;
    if (name === 'source' && this._rendered) this._load();
  }

  connectedCallback() {
    if (this._rendered) return;
    this._initShell();
    this._load();
  }

  // ── public API ──

  get store()   { return this._store; }
  get subject() { return this._subject; }

  getTurtle() {
    if (!this._store || !this._docNode) return '';
    return rdf.serialize(this._docNode, this._store, this._docNode.value, 'text/turtle') || '';
  }

  // ── shell ──

  _initShell() {
    const root = this.shadowRoot;
    root.innerHTML = `
      <div class="sol-form-body"></div>
      <div class="sol-form-save-bar">
        <div class="sol-form-validation-summary" style="display:none"></div>
        <div class="sol-form-save-options">
          <label><input type="radio" name="save-mode" value="pod"> Save to Pod</label>
          <label><input type="radio" name="save-mode" value="local"> Download locally</label>
        </div>
        <div class="sol-form-pod-url" style="display:none">
          <input type="url" placeholder="https://you.pod/path/menu.ttl" class="sol-form-pod-input">
        </div>
        <div class="sol-form-actions">
          <button class="sol-form-btn sol-form-btn-primary sol-form-save-btn">Save</button>
          <span class="sol-form-save-status"></span>
        </div>
      </div>`;
    adopt(root, { sheet: formSheet, css: FORM_CSS });
    this._rendered = true;

    const savedMode = localStorage.getItem(SAVE_MODE_KEY) || 'local';
    const radios = root.querySelectorAll('input[name="save-mode"]');
    radios.forEach(r => {
      r.checked = r.value === savedMode;
      r.addEventListener('change', () => this._onModeChange());
    });
    this._onModeChange();

    const saveTo = this.getAttribute('save-to');
    if (saveTo) root.querySelector('.sol-form-pod-input').value = saveTo;

    root.querySelector('.sol-form-save-btn').addEventListener('click', () => this._onSave());
  }

  _onModeChange() {
    const root = this.shadowRoot;
    const mode = this._saveMode();
    localStorage.setItem(SAVE_MODE_KEY, mode);
    root.querySelector('.sol-form-pod-url').style.display = mode === 'pod' ? 'flex' : 'none';
    const btn = root.querySelector('.sol-form-save-btn');
    btn.textContent = mode === 'pod' ? 'Save to Pod' : 'Download';
  }

  _saveMode() {
    const checked = this.shadowRoot.querySelector('input[name="save-mode"]:checked');
    return checked ? checked.value : 'local';
  }

  // ── loading ──

  async _load() {
    const source = this.getAttribute('source');
    if (!source) return;

    const body = this.shadowRoot.querySelector('.sol-form-body');
    body.innerHTML = '<div class="sol-form-loading">Loading form…</div>';
    this._clearStatus();
    this._hideValidation();

    try {
      const formStore = await loadRdfStore(source);
      const formRoot = this._findForm(formStore, source);
      if (!formRoot) throw new Error('No ui:Form found in ' + source);

      const subjectUri = this.getAttribute('subject');
      let dataStore, subjectNode, docNode;

      if (subjectUri) {
        const docUrl = subjectUri.split('#')[0];
        dataStore = await this._initStore(docUrl);
        await dataStore.fetcher.load(docUrl);
        subjectNode = rdf.sym(subjectUri);
        docNode = rdf.sym(docUrl);
      } else {
        const baseDoc = new URL('_new.ttl', new URL(source, document.baseURI)).href;
        dataStore = this._initStore(baseDoc);
        docNode = rdf.sym(baseDoc);
        subjectNode = rdf.blankNode();
      }

      this._store    = dataStore;
      this._formNode = formRoot;
      this._subject  = subjectNode;
      this._docNode  = docNode;

      this._mergeFormDefs(dataStore, formStore);
      this._renderForm(body, dataStore, subjectNode, formRoot, docNode);

      if (this.getAttribute('shape')) {
        this._loadShape(this.getAttribute('shape'));
      }

    } catch (err) {
      body.innerHTML = `<div class="sol-form-error">${err.message}</div>`;
      console.error('<sol-form> load failed:', err);
    }
  }

  _findForm(store, sourceUri) {
    return findForm(store, sourceUri);
  }

  _initStore(docUrl) {
    const store = rdf.graph();
    const fetcher = new (rdf.Fetcher)(store);
    store.fetcher = fetcher;
    const updater = new (rdf.UpdateManager)(store);
    store.updater = updater;

    // Mark the doc as editable locally so solid-ui fields are not read-only
    updater.editable = (uri) => {
      if (typeof uri === 'object') uri = uri.value || uri.uri;
      return true;
    };

    return store;
  }

  _mergeFormDefs(dataStore, formStore) {
    const stmts = formStore.statements || formStore.match(null, null, null) || [];
    for (const st of stmts) {
      if (!dataStore.holds(st.subject, st.predicate, st.object, st.why)) {
        dataStore.add(st.subject, st.predicate, st.object, st.why);
      }
    }
  }

  // ── render via solid-ui ──

  _renderForm(body, store, subject, form, doc) {
    body.innerHTML = '';

    // solid-ui's field system reads from the global solidLogicSingleton.store.
    // We need to make our store accessible. The field functions are keyed by
    // URI in the `field` registry object exported from solid-ui.
    // We render the form using solid-ui's Form/Group field function.
    const fieldRegistry = this._getFieldRegistry();
    if (!fieldRegistry) {
      this._renderFallback(body, store, subject, form, doc);
      return;
    }

    const formUri = UI + 'Form';
    const formFn = fieldRegistry[formUri];
    if (!formFn) {
      this._renderFallback(body, store, subject, form, doc);
      return;
    }

    // solid-ui reads from solidLogicSingleton.store — temporarily point it at ours
    const origStore = this._swapSolidLogicStore(store);
    try {
      const widget = formFn(document, body, {}, subject, form, doc, (ok, msg) => {
        this.dispatchEvent(new CustomEvent('sol-form-change', {
          bubbles: true, composed: true,
          detail: { subject: this._subject, ok, message: msg },
        }));
      });
      if (widget && !body.contains(widget)) body.appendChild(widget);
    } finally {
      this._restoreSolidLogicStore(origStore);
    }
  }

  _getFieldRegistry() {
    // solid-ui registers field functions on the `field` export from fieldFunction.
    // Try multiple paths: global solid-ui, window.UI, direct import.
    try {
      if (window.UI?.widgets?.forms?.fieldFunction?.field) {
        return window.UI.widgets.forms.fieldFunction.field;
      }
      if (window.panes?.fieldFunction?.field) {
        return window.panes.fieldFunction.field;
      }
      // solid-ui ESM bundle exposes field registry on the main export
      if (window.SolidUI?.field) return window.SolidUI.field;
    } catch {}
    return null;
  }

  _swapSolidLogicStore(store) {
    const win = typeof window !== 'undefined' ? window : {};
    const orig = win.SolidLogic?.store || null;
    if (win.SolidLogic) {
      win.SolidLogic.store = store;
    } else {
      win.SolidLogic = { store, fetcher: store.fetcher };
    }
    // solid-ui's solidLogicSingleton caches store in a module-level variable;
    // also set on commonly-used paths
    if (win.UI) win.UI.store = store;
    return orig;
  }

  _restoreSolidLogicStore(orig) {
    const win = typeof window !== 'undefined' ? window : {};
    if (orig) {
      if (win.SolidLogic) win.SolidLogic.store = orig;
      if (win.UI) win.UI.store = orig;
    }
  }

  _renderFallback(body, store, subject, form, doc) {
    body.innerHTML = '';
    body.appendChild(this._fbGroup(store, form, subject, doc, 0));
  }

  _fieldType(store, field) { return fieldType(store, field); }

  // ── fallback form field renderers ──

  _fbParts(store, form) { return readFormParts(store, form); }

  _fbGroup(store, form, subject, doc, depth) {
    const el = document.createElement('div');
    el.className = 'sf-group';
    const fields = this._fbParts(store, form);
    if (!fields.length) { el.textContent = 'No fields defined.'; return el; }
    const optionEls = [];
    for (const f of fields) {
      const child = this._fbField(store, f, subject, doc, depth, optionEls);
      if (child) el.appendChild(child);
    }
    return el;
  }

  _fbField(store, field, subject, doc, depth, optionEls) {
    const type = this._fieldType(store, field);
    switch (type) {
      case UI + 'Form':
      case UI + 'Group':
        return this._fbGroup(store, field, subject, doc, depth);
      case UI + 'Multiple':
        return this._fbMultiple(store, field, subject, doc, depth);
      case UI + 'Options': {
        const el = this._fbOptions(store, field, subject, doc, depth);
        optionEls.push(el);
        return el;
      }
      case UI + 'Choice':
        return this._fbChoice(store, field, subject, doc, optionEls);
      case UI + 'MultiLineTextField':
      case UI + 'TextArea':
        return this._fbInput(store, field, subject, doc, 'textarea');
      case UI + 'EmailField':
        return this._fbInput(store, field, subject, doc, 'email');
      default:
        return this._fbInput(store, field, subject, doc, 'text');
    }
  }

  _fbInput(store, field, subject, doc, type) {
    const label    = store.anyValue(field, rdf.sym(UI + 'label')) || '';
    const property = store.any(field, rdf.sym(UI + 'property'));
    const required = store.anyValue(field, rdf.sym(UI + 'required'));
    const dflt     = store.anyValue(field, rdf.sym(UI + 'default'));

    const row = document.createElement('div');
    row.className = 'sf-field';
    const lbl = document.createElement('label');
    lbl.className = 'sf-label';
    lbl.textContent = label + (required === 'true' ? ' *' : '');
    row.appendChild(lbl);

    let input;
    if (type === 'textarea') {
      input = document.createElement('textarea');
      input.rows = 3;
    } else {
      input = document.createElement('input');
      input.type = type;
    }

    if (property) {
      const cur = store.anyValue(subject, property, null, doc);
      input.value = cur || dflt || '';
      if (!cur && dflt) store.add(subject, property, rdf.literal(dflt), doc);
      input.addEventListener('input', () => {
        for (const s of [...store.statementsMatching(subject, property, null, doc)]) store.remove(s);
        const v = input.value.trim();
        if (v) store.add(subject, property, rdf.literal(v), doc);
        this._fireChange();
      });
    }

    row.appendChild(input);
    return row;
  }

  _fbChoice(store, field, subject, doc, optionEls) {
    const label     = store.anyValue(field, rdf.sym(UI + 'label')) || '';
    const property  = store.any(field, rdf.sym(UI + 'property'));
    const namedNode = store.anyValue(field, rdf.sym(UI + 'namedNode')) === 'true';
    const dflt      = store.any(field, rdf.sym(UI + 'default'));
    const opts      = store.each(field, rdf.sym(UI + 'option'));

    const row = document.createElement('div');
    row.className = 'sf-field';
    const lbl = document.createElement('label');
    lbl.className = 'sf-label';
    lbl.textContent = label;
    row.appendChild(lbl);

    const sel = document.createElement('select');
    for (const opt of opts) {
      const o = document.createElement('option');
      o.value = opt.value;
      o.textContent = namedNode ? opt.value.replace(/.*[/#]/, '') : opt.value;
      sel.appendChild(o);
    }

    if (property) {
      const cur = store.any(subject, property, null, doc);
      if (cur) {
        sel.value = cur.value;
      } else if (dflt) {
        sel.value = dflt.value;
        store.add(subject, property, namedNode ? rdf.sym(dflt.value) : rdf.literal(dflt.value), doc);
      }
      sel.addEventListener('change', () => {
        for (const s of [...store.statementsMatching(subject, property, null, doc)]) store.remove(s);
        const v = sel.value;
        if (v) store.add(subject, property, namedNode ? rdf.sym(v) : rdf.literal(v), doc);
        for (const oel of optionEls) if (oel._refresh) oel._refresh();
        this._fireChange();
      });
    }

    row.appendChild(sel);
    return row;
  }

  _fbMultiple(store, field, subject, doc, depth) {
    const label    = store.anyValue(field, rdf.sym(UI + 'label')) || '';
    const property = store.any(field, rdf.sym(UI + 'property'));
    const partForm = store.any(field, rdf.sym(UI + 'part'));

    const container = document.createElement('div');
    container.className = 'sf-multiple';

    if (depth >= MAX_DEPTH) {
      container.innerHTML = '<span class="sf-depth-cap">Maximum nesting depth reached</span>';
      return container;
    }

    const header = document.createElement('div');
    header.className = 'sf-multiple-header';
    const hLabel = document.createElement('span');
    hLabel.className = 'sf-label';
    hLabel.textContent = label;
    header.appendChild(hLabel);

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'sf-btn sf-btn-add';
    addBtn.textContent = '+ Add';
    header.appendChild(addBtn);
    container.appendChild(header);

    const list = document.createElement('div');
    list.className = 'sf-multiple-list';
    container.appendChild(list);

    let items = property ? this._readList(store, subject, property, doc) : [];

    const render = () => {
      list.innerHTML = '';
      items.forEach((item, i) => {
        list.appendChild(this._fbMultipleItem(store, partForm, item, doc, depth, i, items, () => {
          this._syncCollection(store, subject, property, items, doc);
          render();
          this._fireChange();
        }));
      });
    };

    addBtn.addEventListener('click', () => {
      const node = rdf.blankNode();
      this._setDefaults(store, partForm, node, doc);
      items.push(node);
      this._syncCollection(store, subject, property, items, doc);
      render();
      this._fireChange();
    });

    render();
    return container;
  }

  _fbMultipleItem(store, partForm, item, doc, depth, index, items, onChange) {
    const el = document.createElement('div');
    el.className = 'sf-multiple-item';

    const actions = document.createElement('div');
    actions.className = 'sf-item-actions';
    const btn = (text, cls, title, fn) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'sf-btn ' + cls;
      b.textContent = text;
      b.title = title;
      b.addEventListener('click', fn);
      return b;
    };

    if (index > 0)
      actions.appendChild(btn('▲', 'sf-btn-move', 'Move up', () => {
        [items[index - 1], items[index]] = [items[index], items[index - 1]];
        onChange();
      }));
    if (index < items.length - 1)
      actions.appendChild(btn('▼', 'sf-btn-move', 'Move down', () => {
        [items[index], items[index + 1]] = [items[index + 1], items[index]];
        onChange();
      }));
    actions.appendChild(btn('✕', 'sf-btn-remove', 'Remove', () => {
      this._removeItemData(store, item, doc);
      items.splice(index, 1);
      onChange();
    }));

    el.appendChild(actions);
    el.appendChild(this._fbGroup(store, partForm, item, doc, depth + 1));
    return el;
  }

  _fbOptions(store, field, subject, doc, depth) {
    const dependsOn = store.any(field, rdf.sym(UI + 'dependingOn'));
    const cases     = store.each(field, rdf.sym(UI + 'case'));

    const container = document.createElement('div');
    container.className = 'sf-options';

    const refresh = () => {
      container.innerHTML = '';
      if (!dependsOn) return;
      const cur = store.any(subject, dependsOn, null, doc);
      if (!cur) return;
      for (const c of cases) {
        const forVal = store.any(c, rdf.sym(UI + 'for'));
        if (forVal && forVal.value === cur.value) {
          const useForm = store.any(c, rdf.sym(UI + 'use'));
          if (useForm) container.appendChild(this._fbGroup(store, useForm, subject, doc, depth));
          return;
        }
      }
    };

    container._refresh = refresh;
    refresh();
    return container;
  }

  // ── collection / data helpers (delegated to core/form-utils.js) ──

  _readList(store, subject, property, doc) { return readList(store, subject, property, doc); }
  _syncCollection(store, subject, property, items, doc) { syncCollection(store, subject, property, items, doc); }
  _removeChain(store, node, doc) { removeChain(store, node, doc); }
  _removeItemData(store, item, doc) { removeItemData(store, item, doc); }
  _setDefaults(store, form, subject, doc) { setDefaults(store, form, subject, doc); }

  _fireChange() {
    this.dispatchEvent(new CustomEvent('sol-form-change', {
      bubbles: true, composed: true,
      detail: { subject: this._subject, ok: true },
    }));
  }

  // ── SHACL validation ──

  async _loadShape(shapeUri) {
    try {
      const resp = await fetch(new URL(shapeUri, document.baseURI).href);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      this._shapeText = await resp.text();
    } catch (err) {
      console.warn('<sol-form> could not load shape:', err);
      this._shapeText = null;
    }
  }

  async _validate() {
    if (!this._shapeText) return { conforms: true, results: [] };

    try {
      const { Parser, Store } = await import('n3');
      const SHACLValidator = (await import('rdf-validate-shacl')).default;

      const parseToStore = (text, baseIRI) => {
        const parser = new Parser({ baseIRI });
        const store = new Store();
        store.addQuads(parser.parse(text));
        return store;
      };

      const turtle = this.getTurtle();
      if (!turtle) return { conforms: false, results: [{ message: 'No data to validate' }] };

      const shapesStore = parseToStore(this._shapeText, this.getAttribute('shape') || '');
      const dataStore   = parseToStore(turtle, this._docNode?.value || '');

      const validator = new SHACLValidator(shapesStore);
      const report = validator.validate(dataStore);
      return report;
    } catch (err) {
      console.warn('<sol-form> SHACL validation failed:', err);
      return { conforms: true, results: [] };
    }
  }

  _showValidation(report) {
    const el = this.shadowRoot.querySelector('.sol-form-validation-summary');
    if (!report || report.conforms) {
      el.style.display = 'none';
      return;
    }
    const results = Array.from(report.results || []);
    const msgs = results.map(r => {
      const path = r.path ? r.path.value.replace(/.*[/#]/, '') : '';
      const msg = (Array.isArray(r.message) ? r.message[0]?.value : r.message?.value) || 'Validation error';
      return path ? `${path}: ${msg}` : msg;
    });
    el.innerHTML = `<strong>Validation errors:</strong><ul>${msgs.map(m => `<li>${this._esc(m)}</li>`).join('')}</ul>`;
    el.style.display = 'block';
  }

  _hideValidation() {
    const el = this.shadowRoot.querySelector('.sol-form-validation-summary');
    if (el) el.style.display = 'none';
  }

  _esc(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  // ── save ──

  async _onSave() {
    const btn = this.shadowRoot.querySelector('.sol-form-save-btn');
    btn.disabled = true;
    this._clearStatus();

    try {
      if (this._shapeText) {
        const report = await this._validate();
        this._showValidation(report);
        if (!report.conforms) {
          btn.disabled = false;
          return;
        }
      }

      const mode = this._saveMode();
      if (mode === 'pod') {
        await this._saveToPod();
      } else {
        this._saveLocal();
      }
    } catch (err) {
      this._setStatus('err', err.message);
    } finally {
      btn.disabled = false;
    }
  }

  async _saveToPod() {
    const urlInput = this.shadowRoot.querySelector('.sol-form-pod-input');
    const podUrl = (urlInput?.value || '').trim();
    if (!podUrl) throw new Error('Enter a Pod URL');

    const turtle = this.getTurtle();
    if (!turtle) throw new Error('Nothing to save');

    const docNode = rdf.sym(podUrl);

    // Use fetcher.webOperation for PUT (same as putBack but to arbitrary URL)
    const fetcher = this._store.fetcher || rdf.storeFetcher;
    const resp = await fetcher.webOperation('PUT', podUrl, {
      contentType: 'text/turtle',
      body: turtle,
    });

    if (!resp.ok) throw new Error(`PUT failed: HTTP ${resp.status}`);

    this._setStatus('ok', 'Saved to Pod');
    this.dispatchEvent(new CustomEvent('sol-form-save', {
      bubbles: true, composed: true,
      detail: { subject: this._subject, turtle, target: podUrl },
    }));
  }

  _saveLocal() {
    const turtle = this.getTurtle();
    if (!turtle) throw new Error('Nothing to save');

    const label = this._store.anyValue(this._subject, rdf.sym(UI + 'label')) || 'form-data';
    const filename = label.replace(/[^a-z0-9_-]/gi, '-').toLowerCase() + '.ttl';

    const blob = new Blob([turtle], { type: 'text/turtle' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    this._setStatus('ok', 'Downloaded ' + filename);
    this.dispatchEvent(new CustomEvent('sol-form-save', {
      bubbles: true, composed: true,
      detail: { subject: this._subject, turtle, target: 'local' },
    }));
  }

  _setStatus(cls, msg) {
    const el = this.shadowRoot.querySelector('.sol-form-save-status');
    el.className = 'sol-form-save-status ' + cls;
    el.textContent = msg;
  }

  _clearStatus() {
    const el = this.shadowRoot.querySelector('.sol-form-save-status');
    if (el) { el.className = 'sol-form-save-status'; el.textContent = ''; }
  }
}

define('sol-form', SolForm);
export { SolForm };
export default SolForm;
