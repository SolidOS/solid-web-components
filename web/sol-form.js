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
import { CSS as FORM_CSS, sheet as formSheet } from './styles/sol-form-css.js';

const UI  = 'http://www.w3.org/ns/ui#';
const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';

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
    const formType = rdf.sym(UI + 'Form');
    const typeP    = rdf.sym(RDF + 'type');

    const docUrl = sourceUri.split('#')[0];
    const fragment = sourceUri.includes('#') ? sourceUri.split('#')[1] : null;
    if (fragment) {
      const candidate = rdf.sym(docUrl + '#' + fragment);
      if (store.holds(candidate, typeP, formType)) return candidate;
    }

    const forms = store.each(null, typeP, formType);
    return forms[0] || null;
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

  // Fallback when solid-ui is not loaded: render basic HTML inputs from the
  // form definition. Reads ui:parts, ui:property, ui:label, field types.
  _renderFallback(body, store, subject, form, doc) {
    body.innerHTML = '';
    const formDoc = form.doc ? form.doc() : null;
    const uiParts = rdf.sym(UI + 'parts');
    const uiPart  = rdf.sym(UI + 'part');
    const uiProp  = rdf.sym(UI + 'property');
    const uiLabel = rdf.sym(UI + 'label');
    const uiRequired = rdf.sym(UI + 'required');

    const partsNode = store.any(form, uiParts, null, formDoc);
    let fields;
    if (partsNode && partsNode.elements) {
      fields = partsNode.elements;
    } else {
      fields = store.each(form, uiPart, null, formDoc);
    }
    if (!fields || !fields.length) {
      body.textContent = 'No fields defined in form.';
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '12px';

    for (const field of fields) {
      const label = (store.anyValue(field, uiLabel, null, formDoc) || '').toString();
      const property = store.any(field, uiProp, null, formDoc);
      const required = store.anyValue(field, uiRequired, null, formDoc);

      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.flexDirection = 'column';
      row.style.gap = '2px';

      const lbl = document.createElement('label');
      lbl.textContent = label + (required === 'true' ? ' *' : '');
      lbl.style.fontWeight = '500';
      lbl.style.fontSize = '0.9em';
      row.appendChild(lbl);

      const typeUri = this._fieldType(store, field);
      let input;

      if (typeUri === UI + 'MultiLineTextField' || typeUri === UI + 'TextArea') {
        input = document.createElement('textarea');
        input.rows = 4;
      } else if (typeUri === UI + 'Choice') {
        input = document.createElement('select');
        const opts = store.each(field, rdf.sym(UI + 'option'), null, formDoc);
        for (const opt of opts) {
          const o = document.createElement('option');
          o.value = opt.value;
          o.textContent = opt.value;
          input.appendChild(o);
        }
      } else if (typeUri === UI + 'EmailField') {
        input = document.createElement('input');
        input.type = 'email';
      } else {
        input = document.createElement('input');
        input.type = 'text';
      }

      if (property) {
        const existing = store.anyValue(subject, property, null, doc);
        if (existing) input.value = existing;

        input.addEventListener('change', () => {
          const old = store.statementsMatching(subject, property, null, doc);
          const val = input.value.trim();
          const ins = val ? [new (rdf.Statement)(subject, property, rdf.literal(val), doc)] : [];
          if (store.updater) {
            store.updater.update(old, ins, (_uri, ok, errMsg) => {
              if (!ok) console.error('sol-form update failed:', errMsg);
              this.dispatchEvent(new CustomEvent('sol-form-change', {
                bubbles: true, composed: true,
                detail: { subject: this._subject, ok, message: errMsg },
              }));
            });
          } else {
            old.forEach(s => store.remove(s));
            ins.forEach(s => store.add(s.subject, s.predicate, s.object, s.why));
            this.dispatchEvent(new CustomEvent('sol-form-change', {
              bubbles: true, composed: true,
              detail: { subject: this._subject, ok: true },
            }));
          }
        });
      }

      row.appendChild(input);
      wrapper.appendChild(row);
    }

    body.appendChild(wrapper);
  }

  _fieldType(store, field) {
    const typeP = rdf.sym(RDF + 'type');
    const types = store.each(field, typeP);
    for (const t of types) {
      if (t.value && t.value.startsWith(UI)) return t.value;
    }
    return UI + 'SingleLineTextField';
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
