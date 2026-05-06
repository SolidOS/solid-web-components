// Shared utilities that do not depend on rdflib.

// ─── DOMPurify (lazy, cached) ─────────────────────────────────────────────────
let _purify = null;
async function _getDOMPurify() {
  if (_purify) return _purify;
  const win = typeof window !== 'undefined' ? window : {};
  if (win.DOMPurify?.sanitize) { _purify = win.DOMPurify; return _purify; }
  try {
    const mod = await import('dompurify');
    _purify = mod.default ?? mod;
    if (_purify?.sanitize) return _purify;
  } catch {}
  return null;
}

export async function sanitizeHtml(html, opts = {}) {
  const p = await _getDOMPurify();
  if (p) return p.sanitize(html, opts);
  // Minimal fallback: parse + re-serialize strips scripts/events via browser parser
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.innerHTML;
}

// ─── CSS selector query over an HTML document ────────────────────────────────
// `html` is already sanitized. Returns {vars, results} suitable for the renderer.
export function queryHtmlWithSelector(html, baseUrl, selector) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('base').forEach(b => b.remove()); // drop any existing <base>
  const base = doc.createElement('base');
  base.href = baseUrl;
  doc.head.appendChild(base);

  const els = Array.from(doc.querySelectorAll(selector));
  if (!els.length) return { vars: ['text'], results: [] };

  const hasHref = els.some(el => el.href || el.getAttribute('href'));
  const hasSrc  = els.some(el => el.src  || el.getAttribute('src'));
  const vars = ['tag', 'text'];
  if (hasHref) vars.push('href');
  if (hasSrc)  vars.push('src');

  const results = els.map(el => {
    const row = {
      tag:  { type: 'literal', value: el.tagName.toLowerCase() },
      text: { type: 'literal', value: el.textContent.trim() },
    };
    if (hasHref) {
      const v = el.href || el.getAttribute('href') || '';
      row.href = v ? { type: 'uri', value: el.href || v } : { type: 'literal', value: '' };
    }
    if (hasSrc) {
      const v = el.src || el.getAttribute('src') || '';
      row.src = v ? { type: 'uri', value: el.src || v } : { type: 'literal', value: '' };
    }
    return row;
  });

  return { vars, results };
}

// ─── Plain results transformation ────────────────────────────────────────────
// Converts renderer-format data ({vars, results}) to plain JS objects/scalars.
export function toPlainResults(data, wantedVars) {
  const cols = wantedVars ? data.vars.filter(v => wantedVars.includes(v)) : data.vars;
  if (!data.results.length) return [];
  // 1 row × 1 column → return scalar value directly
  if (cols.length === 1 && data.results.length === 1) {
    const cell = data.results[0][cols[0]];
    return cell ? cell.value : null;
  }
  return data.results.map(row => {
    const obj = {};
    for (const col of cols) {
      const cell = row[col];
      obj[col] = cell ? cell.value : null;
    }
    return obj;
  });
}

// ─── SPARQL adapters (non-rdflib) ────────────────────────────────────────────

// Extract the projected variable names from a SPARQL SELECT clause, preserving
// author order. Returns null for `SELECT *` or non-SELECT queries — callers
// should fall back to whatever order the engine produced.
export function parseSelectVars(queryText) {
  const stripped = queryText.replace(/#[^\n]*/g, '');
  const m = stripped.match(/\bSELECT\s+(?:DISTINCT\s+|REDUCED\s+)?(.*?)\s+WHERE\b/is);
  if (!m) return null;
  const clause = m[1].trim();
  if (clause === '*') return null;
  const vars = clause.match(/\?(\w+)/g);
  return vars ? vars.map(v => v.slice(1)) : null;
}

export class ComunicaSparqlAdapter {
  constructor(engineFactory) {
    this.engineFactory = engineFactory;
  }

  static getComunicaEngine() {
    if (typeof newEngine === 'function') return newEngine;
    if (window.newEngine && typeof window.newEngine === 'function') return window.newEngine;
    if (window.Comunica?.QueryEngine) return () => new window.Comunica.QueryEngine();
    if (window.Comunica?.newEngine) return window.Comunica.newEngine;
    return null;
  }

  async executeQuery(query, endpoint, fetchFn) {
    const engine = await this.engineFactory();
    const ctx = { sources: [endpoint], lenient: true };
    if (typeof fetchFn === 'function') ctx.fetch = fetchFn;
    const stream = await engine.queryBindings(query, ctx);
    const bindings = await stream.toArray();
    if (!bindings.length) return { vars: [], results: [] };

    // Prefer the explicit SELECT order from the query text; fall back to the
    // engine's binding order for SELECT * / non-SELECT.
    const selectVars = parseSelectVars(query);
    const vars = selectVars ?? Array.from(bindings[0].keys()).map(v => v.value);

    const results = bindings.map(binding => {
      const row = {};
      vars.forEach(v => {
        const term = binding.get(v);
        row[v] = term
          ? { type: (term.termType === 'NamedNode' || term.uri) ? 'uri' : 'literal', value: term.value || term.uri || String(term) }
          : { type: 'literal', value: '' };
      });
      return row;
    });
    return { vars, results };
  }
}

export class NativeSparqlAdapter {
  async executeQuery(query, endpoint, fetchFn = fetch) {
    const params = new URLSearchParams({ query, format: 'json' });
    const resp = await fetchFn(`${endpoint}?${params}`, {
      headers: { Accept: 'application/sparql-results+json' },
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const data = await resp.json();
    const vars = data.head.vars;
    const results = data.results.bindings.map(binding => {
      const row = {};
      vars.forEach(v => {
        row[v] = binding[v]
          ? { type: binding[v].type, value: binding[v].value }
          : { type: 'literal', value: '' };
      });
      return row;
    });
    return { vars, results };
  }
}
