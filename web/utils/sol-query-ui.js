import { mkLink } from '../views/_helpers.js';
import { render as renderTable } from '../views/table.js';

export class SparqlResultsRenderer {
  constructor(container) {
    this.container = container;
    this._bnodeData = new Map();
    this._modal     = null;

    // Bnode-link clicks: open modal with the node's properties
    container.addEventListener('click', e => {
      const a = e.target.closest('a.bnode-link');
      if (!a) return;
      e.preventDefault();
      const idx  = parseInt(a.dataset.bnodeIdx, 10);
      const data = this._bnodeData.get(idx);
      if (data) this._showBnodeModal(data);
    });
  }

  showLoading(message = 'Loading results...') {
    this.container.innerHTML = `<div class="loading">${message}</div>`;
  }

  showError(message) {
    this.container.innerHTML = `<div class="error" role="alert">${message}</div>`;
  }

  showNoResults() {
    this.container.innerHTML = '<div class="loading">No results found</div>';
  }

  // ── Main entry point ────────────────────────────────────────────────────────
  // viewFn: a free function with signature render(container, data, host, options)
  renderResults(data, viewFn, options = {}) {
    this._bnodeData.clear();

    if (!data.results || data.results.length === 0) {
      this.showNoResults();
      return;
    }

    // 1 row × 1 column → scalar value, no table
    if (data.vars.length === 1 && data.results.length === 1) {
      const val = data.results[0][data.vars[0]];
      this.container.innerHTML = '';
      if (val && val.type === 'uri') {
        this.container.appendChild(mkLink(val));
      } else {
        const span = document.createElement('span');
        span.className = 'single-value';
        span.textContent = val ? val.value : '';
        this.container.appendChild(span);
      }
      return;
    }

    const pivoted = this._pivotSPO(data);
    if (pivoted) {
      this.container.innerHTML = '';
      this._renderView(pivoted, viewFn, options);
      return;
    }

    const grouped = this._groupByPredicate(data);

    this.container.innerHTML = '';
    this._renderView(grouped, viewFn, options);
  }

  _renderView(data, viewFn, options) {
    const mkBnodeLink = v => this._mkBnodeLink(v);
    viewFn(this.container, data, null, { ...options, mkBnodeLink });
  }

  // ── Pivot s,p,o → predicates as columns, subjects as rows ─────────────────
  _pivotSPO(data) {
    const v = data.vars;
    const hasSPO = v.length === 3 && v[0]==='s' && v[1]==='p' && v[2]==='o';
    const hasPO  = v.length === 2 && v[0]==='p' && v[1]==='o';
    if (!hasSPO && !hasPO) return null;

    const subjectOrder = [];
    const subjects     = new Map();
    const predOrder    = [];
    const predSet      = new Set();

    for (const row of data.results) {
      const sKey = hasSPO ? (row.s?.value ?? '') : '';
      const pURI = row.p?.value ?? '';

      if (!subjects.has(sKey)) {
        subjectOrder.push(sKey);
        subjects.set(sKey, new Map());
      }
      if (!predSet.has(pURI)) { predSet.add(pURI); predOrder.push(pURI); }

      const predMap = subjects.get(sKey);
      if (!predMap.has(pURI)) predMap.set(pURI, []);
      if (row.o) predMap.get(pURI).push(row.o);
    }

    const _short = uri => uri.replace(/.*[/#]([^/#]+)\/?$/, '$1') || uri;
    const names  = predOrder.map(_short);
    const seen   = {};
    for (let i = 0; i < names.length; i++) {
      const n = names[i];
      if (seen[n] !== undefined) {
        names[seen[n]] = predOrder[seen[n]];
        names[i]       = predOrder[i];
      } else { seen[n] = i; }
    }

    const results = subjectOrder.map(sKey => {
      const predMap = subjects.get(sKey);
      const row = {};
      for (let i = 0; i < predOrder.length; i++) {
        const vals = predMap.get(predOrder[i]);
        if (!vals || vals.length === 0) {
          row[names[i]] = { type: 'literal', value: '' };
        } else if (vals.length === 1) {
          row[names[i]] = vals[0];
        } else {
          row[names[i]] = { type: 'multi', values: vals };
        }
      }
      return row;
    });

    return { vars: names, results };
  }

  // ── Group rows by non-object columns, collect 'o' values ──────────────────
  _groupByPredicate(data) {
    if (!data.vars.includes('o')) return data;

    const keyVars = data.vars.filter(v => v !== 'o');
    const order   = [];
    const map     = new Map();

    for (const row of data.results) {
      const key = keyVars.map(v => row[v]?.value ?? '').join('\x00');
      if (!map.has(key)) {
        order.push(key);
        const newRow = {};
        keyVars.forEach(v => newRow[v] = row[v]);
        newRow._oVals = row.o ? [row.o] : [];
        map.set(key, newRow);
      } else if (row.o) {
        map.get(key)._oVals.push(row.o);
      }
    }

    const results = order.map(key => {
      const row  = map.get(key);
      const vals = row._oVals;
      delete row._oVals;
      row.o = vals.length === 0 ? { type: 'literal', value: '' }
            : vals.length === 1 ? vals[0]
            : { type: 'multi', values: vals };
      return row;
    });

    return { vars: data.vars, results };
  }

  // ── Blank-node link + modal ────────────────────────────────────────────────
  _mkBnodeLink(value) {
    const a = document.createElement('a');
    a.href        = '#';
    a.className   = 'bnode-link';
    a.textContent = '[…]';
    a.title       = 'Click to view blank node properties';
    const idx = this._bnodeData.size;
    this._bnodeData.set(idx, value._data);
    a.dataset.bnodeIdx = String(idx);
    return a;
  }

  _showBnodeModal(data) {
    const modal = this._getOrCreateModal();
    const body  = modal.querySelector('.bnode-modal-body');
    body.innerHTML = '';
    const sub = new SparqlResultsRenderer(body);
    sub.renderResults(data, renderTable, { hideHeader: true });
    modal.classList.add('active');
  }

  _closeModal() {
    if (this._modal) this._modal.classList.remove('active');
  }

  _getOrCreateModal() {
    if (this._modal) return this._modal;
    const modal = document.createElement('div');
    modal.className = 'bnode-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `
      <div class="bnode-modal-inner">
        <button class="sol-btn sol-btn-danger bnode-modal-close" aria-label="Close">×</button>
        <div class="bnode-modal-body"></div>
      </div>`;
    modal.querySelector('.bnode-modal-close')
         .addEventListener('click', () => this._closeModal());
    modal.addEventListener('click', e => { if (e.target === modal) this._closeModal(); });
    (this.container.parentNode ?? this.container).appendChild(modal);
    this._modal = modal;
    this._escHandler = e => { if (e.key === 'Escape') this._closeModal(); };
    document.addEventListener('keydown', this._escHandler);
    return modal;
  }
}

// CSS now lives in ../styles/sol-query-css.js — import { CSS, sheet } from there.
export { CSS as getDefaultStylesCSS, sheet as defaultStylesSheet } from '../styles/sol-query-css.js';
