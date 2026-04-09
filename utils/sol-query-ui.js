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
  renderResults(data, format = 'table', options = {}) {
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
        this.container.appendChild(this._mkLink(val));
      } else {
        const span = document.createElement('span');
        span.className = 'single-value';
        span.textContent = val ? val.value : '';
        this.container.appendChild(span);
      }
      return;
    }

    // Pivot s,p,o results: predicates become column headers, objects become cells.
    // Multiple subjects → one table per subject with a jump menu at the top.
    const pivoted = this._pivotSPO(data);
    if (pivoted) {
      this.container.innerHTML = '';
      if (pivoted.length === 1) {
        this._renderOnePivot(pivoted[0], format, options);
      } else {
        // Jump menu
        const nav = document.createElement('nav');
        nav.className = 'subject-nav';
        pivoted.forEach((p, i) => {
          const a = document.createElement('a');
          a.href = `#spo-subj-${i}`;
          a.textContent = p.label;
          a.title = p.uri || p.label;
          nav.appendChild(a);
        });
        this.container.appendChild(nav);
        // One section per subject
        pivoted.forEach((p, i) => {
          const section = document.createElement('div');
          section.className = 'subject-section';
          section.id = `spo-subj-${i}`;
          const heading = document.createElement('h3');
          heading.className = 'subject-heading';
          if (p.uri) {
            const link = document.createElement('a');
            link.href = p.uri;
            link.textContent = p.label;
            link.title = p.uri;
            link.dataset.uri = p.uri;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            heading.appendChild(link);
          } else {
            heading.textContent = p.label;
          }
          section.appendChild(heading);
          const sub = document.createElement('div');
          section.appendChild(sub);
          this.container.appendChild(section);
          // Render the table into the sub-container
          const subRenderer = new SparqlResultsRenderer(sub);
          subRenderer._bnodeData = this._bnodeData;
          subRenderer._renderOnePivot(p.data, format, options);
        });
      }
      return;
    }

    // Group rows that share the same predicate (when 'o' column present)
    const grouped = this._groupByPredicate(data);

    this.container.innerHTML = '';
    if (format === 'dl') {
      this.container.appendChild(this._mkDl(grouped));
    } else if (format === 'list') {
      this.container.appendChild(this._mkList(grouped));
    } else {
      const table = this._mkTable(grouped, options);
      this.container.appendChild(table);
      if (!options.hideHeader) this._addSort(table);
    }
  }

  // ── Render a single pivoted dataset ──────────────────────────────────────────
  _renderOnePivot(data, format, options) {
    if (format === 'dl') {
      this.container.appendChild(this._mkDl(data));
    } else if (format === 'list') {
      this.container.appendChild(this._mkList(data));
    } else {
      const table = this._mkTable(data, options);
      this.container.appendChild(table);
      if (!options.hideHeader) this._addSort(table);
    }
  }

  // ── Pivot s,p,o → predicates as columns ─────────────────────────────────────
  // Returns null if not an s,p,o pattern.
  // Returns an array of { label, uri, data: {vars, results} } — one per subject.
  _pivotSPO(data) {
    const v = data.vars;
    const hasSPO = v.length === 3 && v[0]==='s' && v[1]==='p' && v[2]==='o';
    const hasPO  = v.length === 2 && v[0]==='p' && v[1]==='o';
    if (!hasSPO && !hasPO) return null;

    // Group rows by subject, collect predicates per subject
    const subjectOrder = [];
    const subjects     = new Map();

    for (const row of data.results) {
      const sKey = hasSPO ? (row.s?.value ?? '') : '';
      const pURI = row.p?.value ?? '';

      if (!subjects.has(sKey)) {
        subjectOrder.push(sKey);
        subjects.set(sKey, { s: row.s, predOrder: [], predSet: new Set(), preds: new Map() });
      }
      const subj = subjects.get(sKey);
      if (!subj.predSet.has(pURI)) { subj.predSet.add(pURI); subj.predOrder.push(pURI); }
      if (!subj.preds.has(pURI)) subj.preds.set(pURI, []);
      if (row.o) subj.preds.get(pURI).push(row.o);
    }

    const _short = uri => uri.replace(/.*[/#]([^/#]+)\/?$/, '$1') || uri;

    // Build one pivoted dataset per subject
    return subjectOrder.map(sKey => {
      const subj = subjects.get(sKey);

      // Short column names with collision resolution
      const names = subj.predOrder.map(_short);
      const seen  = {};
      for (let i = 0; i < names.length; i++) {
        const n = names[i];
        if (seen[n] !== undefined) {
          names[seen[n]] = subj.predOrder[seen[n]];
          names[i] = subj.predOrder[i];
        } else { seen[n] = i; }
      }

      const row = {};
      for (let i = 0; i < subj.predOrder.length; i++) {
        const vals = subj.preds.get(subj.predOrder[i]);
        if (!vals || vals.length === 0) {
          row[names[i]] = { type: 'literal', value: '' };
        } else if (vals.length === 1) {
          row[names[i]] = vals[0];
        } else {
          row[names[i]] = { type: 'multi', values: vals };
        }
      }

      return {
        label: subj.s ? _short(subj.s.value) : 'Result',
        uri:   subj.s?.type === 'uri' ? subj.s.value : null,
        data:  { vars: names, results: [row] },
      };
    });
  }

  // ── Group rows by non-object columns, collect 'o' values ───────────────────
  // Only activates when the data has an 'o' variable (RDF triple results).
  // Rows with the same predicate (and subject, if present) are merged into one
  // row with a { type:'multi', values:[...] } cell in the 'o' column.
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

  // ── Table ───────────────────────────────────────────────────────────────────
  _mkTable(data, options = {}) {
    const table = document.createElement('table');
    table.setAttribute('role', 'table');
    if (!options.hideHeader) table.appendChild(this.createTableHeader(data.vars));
    table.appendChild(this.createTableBody(data.vars, data.results));
    return table;
  }

  createTableHeader(vars) {
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    tr.setAttribute('role', 'row');
    vars.forEach(v => {
      const th = document.createElement('th');
      th.setAttribute('role', 'columnheader');
      th.textContent = v;
      tr.appendChild(th);
    });
    thead.appendChild(tr);
    return thead;
  }

  createTableBody(vars, results) {
    const tbody = document.createElement('tbody');
    tbody.setAttribute('role', 'rowgroup');
    results.forEach(row => {
      const tr = document.createElement('tr');
      tr.setAttribute('role', 'row');
      vars.forEach(v => tr.appendChild(this.createTableCell(row[v])));
      tbody.appendChild(tr);
    });
    return tbody;
  }

  createTableCell(value) {
    const td = document.createElement('td');
    td.setAttribute('role', 'cell');
    if (value?.type === 'multi') {
      value.values.forEach((v, i) => {
        if (i > 0) td.appendChild(document.createTextNode(',  '));
        if (v.type === 'uri')   td.appendChild(this._mkLink(v));
        else if (v.type === 'bnode') td.appendChild(this._mkBnodeLink(v));
        else td.appendChild(document.createTextNode(v.value ?? ''));
      });
    } else if (value?.type === 'bnode') {
      td.appendChild(this._mkBnodeLink(value));
    } else if (value?.type === 'uri') {
      td.appendChild(this._mkLink(value));
    } else {
      td.textContent = value ? value.value : '';
    }
    return td;
  }

  // ── Sort (click header to sort asc/desc) ────────────────────────────────────
  _addSort(table) {
    const ths = table.querySelectorAll('th');
    let col = -1, dir = 1;
    ths.forEach((th, i) => {
      th.addEventListener('click', () => {
        dir = col === i ? -dir : 1;
        col = i;
        ths.forEach((h, j) => h.setAttribute('data-sort', j === i ? (dir > 0 ? 'asc' : 'desc') : ''));
        const tbody = table.querySelector('tbody');
        Array.from(tbody.querySelectorAll('tr'))
          .sort((a, b) => dir * (a.cells[i]?.textContent || '')
            .localeCompare(b.cells[i]?.textContent || '', undefined, { numeric: true, sensitivity: 'base' }))
          .forEach(r => tbody.appendChild(r));
      });
    });
  }

  // ── Definition list ─────────────────────────────────────────────────────────
  // Uses col[0] as <dt>, col[1] as <dd>.  Falls back to table if < 2 columns.
  _mkDl(data) {
    if (data.vars.length < 2) return this._mkTable(data);
    const [kc, vc] = data.vars;
    const dl = document.createElement('dl');
    data.results.forEach(row => {
      const dt = document.createElement('dt');
      dt.textContent = this._termText(row[kc]);
      if (row[kc]?.type === 'uri') dt.title = row[kc].value;
      dl.appendChild(dt);
      const dd = document.createElement('dd');
      const vv = row[vc];
      if (vv?.type === 'multi') {
        vv.values.forEach((v, i) => {
          if (i > 0) dd.appendChild(document.createTextNode(',  '));
          if (v.type === 'uri')   dd.appendChild(this._mkLink(v));
          else if (v.type === 'bnode') dd.appendChild(this._mkBnodeLink(v));
          else dd.appendChild(document.createTextNode(v.value ?? ''));
        });
      } else if (vv?.type === 'bnode') {
        dd.appendChild(this._mkBnodeLink(vv));
      } else if (vv?.type === 'uri') {
        dd.appendChild(this._mkLink(vv));
      } else {
        dd.textContent = vv ? vv.value : '';
      }
      dl.appendChild(dd);
    });
    return dl;
  }

  // ── List ────────────────────────────────────────────────────────────────────
  // Single-column results rendered as <ul>.  Falls back to table if > 1 column.
  _mkList(data) {
    if (data.vars.length > 1) return this._mkTable(data);
    const col = data.vars[0];
    const ul = document.createElement('ul');
    ul.className = 'result-list';
    data.results.forEach(row => {
      const li = document.createElement('li');
      if (row[col]?.type === 'uri')   li.appendChild(this._mkLink(row[col]));
      else if (row[col]?.type === 'bnode') li.appendChild(this._mkBnodeLink(row[col]));
      else li.textContent = row[col] ? row[col].value : '';
      ul.appendChild(li);
    });
    return ul;
  }

  // ── Blank-node link + modal ─────────────────────────────────────────────────
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
    // Render using a sub-renderer; hideHeader mirrors subject-query style
    const sub = new SparqlResultsRenderer(body);
    sub.renderResults(data, 'table', { hideHeader: true });
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
        <button class="bnode-modal-close" aria-label="Close">×</button>
        <div class="bnode-modal-body"></div>
      </div>`;
    modal.querySelector('.bnode-modal-close')
         .addEventListener('click', () => this._closeModal());
    modal.addEventListener('click', e => { if (e.target === modal) this._closeModal(); });
    // Append outside .container so it isn't cleared by innerHTML resets
    (this.container.parentNode ?? this.container).appendChild(modal);
    this._modal = modal;
    // Global Escape key — one listener per renderer instance
    this._escHandler = e => { if (e.key === 'Escape') this._closeModal(); };
    document.addEventListener('keydown', this._escHandler);
    return modal;
  }

  // ── Shared helpers ──────────────────────────────────────────────────────────
  // Create a URI link; data-uri enables dereference clicks in the component.
  _mkLink(val) {
    const a = document.createElement('a');
    a.href = val.value;
    a.textContent = val.value.replace(/.*[/#]([^/#]+)\/?$/, '$1') || val.value;
    a.title = val.value;
    a.dataset.uri = val.value;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    return a;
  }

  _termText(val) {
    if (!val) return '';
    if (val.type === 'uri') return val.value.replace(/.*[/#]([^/#]+)\/?$/, '$1') || val.value;
    return val.value;
  }
}

export function getDefaultStyles() {
  return `
    :host {
      display: block;
      font-family: var(--font-family, system-ui, sans-serif);
      font-size: var(--font-size, 18px);
      color: var(--text);
    }
    .container { overflow-x: auto; }

    /* ── table ── */
    table { border-collapse: collapse; margin: 0 0 .5rem; }
    th, td {
      padding: 0.4rem 0.65rem; text-align: left; border: 1px solid #ddd;
      overflow-wrap: break-word; word-break: break-word;
    }
    th {
      background-color: var(--th-color, #f5f5f5);
      font-weight: 600;
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
    }
    th::after { content: '⇅'; margin-left: 5px; font-size: .75em; opacity: .35; }
    th[data-sort="asc"]::after  { content: '▲'; opacity: 1; }
    th[data-sort="desc"]::after { content: '▼'; opacity: 1; }
    tr:nth-child(even) { background-color: var(--even-color, #fafafa); }

    /* ── dl ── */
    dl { margin: 0 0 .5rem; }
    dt { font-weight: 600; font-size: .85em; color: var(--muted, #777); margin-top: .6rem; }
    dd { margin: .1rem 0 .2rem 1rem; }

    /* ── list ── */
    ul.result-list { margin: .5rem 0 .5rem 1.5rem; }
    ul.result-list li { margin: .2rem 0; }

    /* ── meta ── */
    .single-value { display: block; padding: 1rem; font-size: 1.1em; }
    .loading { padding: 1rem; color: var(--muted, #666); }
    .error {
      padding: 1rem; color: #c00;
      background-color: #fee; border: 1px solid #fcc; border-radius: 4px;
    }
    a { color: var(--link-color, #0066cc); text-decoration: none; }
    a:hover { text-decoration: underline; }
    a.bnode-link { font-style: italic; color: var(--muted, #777); }
    a.bnode-link:hover { color: var(--link-color, #0066cc); }

    /* ── subject nav + sections (multi-subject pivot) ── */
    .subject-nav {
      display: flex; flex-wrap: wrap; gap: 6px; padding: .5rem 0 .75rem;
      border-bottom: 1px solid #ddd; margin-bottom: .75rem;
    }
    .subject-nav a {
      display: inline-block; padding: .25rem .6rem; border-radius: 4px;
      border: 1px solid #ccc; font-size: .82em; background: #f5f5f5;
    }
    .subject-nav a:hover { background: #e8f0fe; border-color: #4a9eff; }
    .subject-section { margin-bottom: 1.5rem; }
    .subject-heading {
      font-size: .95em; font-weight: 600; margin: 0 0 .35rem;
      padding-bottom: .25rem; border-bottom: 1px solid #eee;
    }

    /* ── blank-node modal ── */
    .bnode-modal {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      z-index: 9999;
      align-items: center;
      justify-content: center;
    }
    .bnode-modal.active { display: flex; }
    .bnode-modal-inner {
      background: white;
      border-radius: 6px;
      padding: 1.25rem 1.5rem 1.5rem;
      max-width: min(90vw, 700px);
      max-height: 80vh;
      overflow: auto;
      position: relative;
      box-shadow: 0 8px 24px rgba(0,0,0,0.25);
    }
    .bnode-modal-body { overflow-x: auto; }
    .bnode-modal-close {
      position: absolute;
      top: .5rem; right: .5rem;
      background: #e74c3c; color: white;
      border: none; border-radius: 50%;
      width: 1.6rem; height: 1.6rem;
      cursor: pointer; font-size: 1rem; line-height: 1;
    }
    .bnode-modal-close:hover { background: #c0392b; }
    .bnode-modal-body { margin-top: .5rem; }
  `;
}
