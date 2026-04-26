#!/usr/bin/env node

import * as $rdf from 'rdflib';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import readline from 'node:readline';

const UI  = 'http://www.w3.org/ns/ui#';
const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const SCH = 'http://schema.org/';

// ─── RDF parsing (mirrors sol-menu.js) ───────────────────────────

function loadStoreLocal(filePath) {
  const abs = resolve(filePath);
  const text = readFileSync(abs, 'utf-8');
  const store = $rdf.graph();
  const base = pathToFileURL(abs).href;
  $rdf.parse(text, store, base, 'text/turtle');
  return { store, base };
}

async function loadStoreRemote(url) {
  const resp = await fetch(url, { headers: { Accept: 'text/turtle, application/rdf+xml;q=0.9, */*;q=0.1' } });
  if (!resp.ok) throw new Error(`HTTP ${resp.status} fetching ${url}`);
  const text = await resp.text();
  const store = $rdf.graph();
  const ct = (resp.headers.get('content-type') || '').split(';')[0].trim();
  const mime = ct === 'application/rdf+xml' ? 'application/rdf+xml' : 'text/turtle';
  $rdf.parse(text, store, url, mime);
  return { store, base: url };
}

function val(store, s, local) {
  const n = store.any(s, $rdf.sym(UI + local));
  return n ? n.value : null;
}

function listEls(store, node) {
  if (node.elements) return node.elements;
  const out = [];
  const nil = $rdf.sym(RDF + 'nil');
  const first = $rdf.sym(RDF + 'first');
  const rest = $rdf.sym(RDF + 'rest');
  let cur = node;
  while (cur && cur.value !== nil.value) {
    const el = store.any(cur, first);
    if (el) out.push(el);
    cur = store.any(cur, rest);
  }
  return out;
}

function rdfComponent(store, node) {
  if (!node) return { tag: null, attrs: [] };
  const tag = val(store, node, 'name') || val(store, node, 'label');
  const an = store.each(node, $rdf.sym(UI + 'attribute'));
  const pn = store.each(node, $rdf.sym(UI + 'parameter'));
  const attrs = [...an, ...pn].map(p => [
    (store.any(p, $rdf.sym(SCH + 'name'))  || {}).value || '',
    (store.any(p, $rdf.sym(SCH + 'value')) || {}).value || '',
  ]).filter(([k]) => k);
  return { tag, attrs };
}

function parseItems(store, menuNode) {
  const pn = store.any(menuNode, $rdf.sym(UI + 'parts'));
  if (!pn) return [];
  const parts = listEls(store, pn);
  const menuT = $rdf.sym(UI + 'Menu');
  const compT = $rdf.sym(UI + 'Component');
  const typeP = $rdf.sym(RDF + 'type');
  const items = [];
  for (const part of parts) {
    const t = store.any(part, typeP);
    const label = val(store, part, 'label') || part.value;
    if (t?.value === menuT.value) {
      items.push({ kind: 'menu', name: label, children: parseItems(store, part) });
    } else if (t?.value === compT.value) {
      const c = rdfComponent(store, part);
      items.push({ kind: 'component', name: label, tag: c.tag, attrs: c.attrs });
    } else {
      items.push({
        kind: 'link',
        name: label,
        href: val(store, part, 'href'),
        contents: val(store, part, 'contents'),
      });
    }
  }
  return items;
}

async function loadMenu(uri) {
  const hi = uri.indexOf('#');
  const docPart = hi >= 0 ? uri.slice(0, hi) : uri;
  const fragment = hi >= 0 ? uri.slice(hi + 1) : '';
  const isRemote = /^https?:\/\//i.test(docPart);
  const { store, base } = isRemote
    ? await loadStoreRemote(docPart)
    : loadStoreLocal(docPart);
  let root;
  if (fragment) {
    root = $rdf.sym(base + '#' + fragment);
  } else {
    root = store.each(null, $rdf.sym(RDF + 'type'), $rdf.sym(UI + 'Menu'))[0];
  }
  if (!root) { process.stderr.write('No ui:Menu found.\n'); process.exit(1); }
  return {
    title: val(store, root, 'label') || 'Menu',
    items: parseItems(store, root),
    base,
  };
}

// ─── Content rendering ──────────────────────────────────────────

function stripHtml(s) {
  return s.replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").trim();
}

function shorten(uri) {
  if (!uri) return uri;
  const h = uri.lastIndexOf('#');
  if (h >= 0 && h < uri.length - 1) return uri.slice(h + 1);
  if (uri.includes('://')) {
    const s = uri.lastIndexOf('/');
    if (s >= 0 && s < uri.length - 1) return uri.slice(s + 1);
  }
  return uri;
}

function parseSelectVars(sparql) {
  const m = sparql.replace(/#[^\n]*/g, '')
    .match(/SELECT\s+(?:DISTINCT\s+|REDUCED\s+)?(.*?)\s+WHERE/is);
  if (!m) return null;
  const clause = m[1].trim();
  if (clause === '*') return null;
  const vars = clause.match(/\?\w+/g);
  return vars ? vars.map(v => v.slice(1)) : null;
}

function resolveEndpoint(endpoint, base) {
  try {
    const url = new URL(endpoint, base);
    if (url.protocol === 'file:') return { type: 'file', path: fileURLToPath(url) };
    if (url.protocol === 'http:' || url.protocol === 'https:') return { type: 'remote', url: url.href };
  } catch { /* fall through */ }
  try { return { type: 'file', path: resolve(endpoint) }; } catch { return null; }
}

async function loadStoreFrom(endpoint, base) {
  const target = resolveEndpoint(endpoint, base);
  if (!target) throw new Error('Cannot resolve endpoint');

  const store = $rdf.graph();
  let storeBase;

  if (target.type === 'file') {
    const text = readFileSync(target.path, 'utf-8');
    storeBase = pathToFileURL(resolve(target.path)).href;
    $rdf.parse(text, store, storeBase, 'text/turtle');
  } else {
    const resp = await fetch(target.url, { headers: { Accept: 'text/turtle, application/rdf+xml;q=0.9, */*;q=0.1' } });
    if (!resp.ok) throw new Error(`HTTP ${resp.status} fetching ${target.url}`);
    const text = await resp.text();
    storeBase = target.url;
    const ct = (resp.headers.get('content-type') || '').split(';')[0].trim();
    const mime = ct === 'application/rdf+xml' ? 'application/rdf+xml' : 'text/turtle';
    $rdf.parse(text, store, storeBase, mime);
  }

  return { store, base: storeBase };
}

function runPatternQuery(store, pattern, storeBase) {
  const tokens = pattern.trim().split(/\s+/);
  if (tokens.length !== 3) throw new Error('Pattern must have exactly 3 parts');

  function toNode(tok) {
    if (tok === '?' || tok.startsWith('?')) return undefined;
    if (tok.startsWith('<') && tok.endsWith('>')) return $rdf.sym(tok.slice(1, -1));
    if (tok.startsWith('"')) return $rdf.lit(tok.replace(/^"|"$/g, ''));
    return $rdf.sym(new URL(tok, storeBase).href);
  }

  const s = toNode(tokens[0]), p = toNode(tokens[1]), o = toNode(tokens[2]);
  const stmts = store.match(s, p, o, null);

  const varNames = [];
  const slots = ['s', 'p', 'o'];
  tokens.forEach((tok, i) => {
    if (tok === '?' || tok.startsWith('?')) varNames.push(tok === '?' ? slots[i] : tok.slice(1));
  });

  const rows = stmts.map(st => {
    const row = {};
    let vi = 0;
    if (s === undefined) row[varNames[vi++]] = st.subject.value;
    if (p === undefined) row[varNames[vi++]] = st.predicate.value;
    if (o === undefined) row[varNames[vi++]] = st.object.value;
    return row;
  });

  return { vars: varNames, rows };
}

async function runQuery(endpoint, sparql, pattern, base) {
  const { store, base: storeBase } = await loadStoreFrom(endpoint, base);

  if (pattern) return runPatternQuery(store, pattern, storeBase);

  const parsed = $rdf.SPARQLToQuery(sparql, false, store);
  if (!parsed) throw new Error('Cannot parse SPARQL');

  const declaredVars = parseSelectVars(sparql);
  const fetcher = new $rdf.Fetcher(store);

  return new Promise((res) => {
    const bindings = [];
    store.query(parsed, b => bindings.push(b), fetcher, () => {
      const vars = declaredVars
        || (bindings.length
          ? Object.keys(bindings[0]).filter(k => k.startsWith('?')).map(k => k.slice(1))
          : []);
      const rows = bindings.map(b => {
        const row = {};
        for (const v of vars) {
          const node = b[`?${v}`];
          row[v] = node ? node.value : '';
        }
        return row;
      });
      res({ vars, rows });
    });
  });
}

async function preloadQueries(items, base) {
  for (const item of items) {
    if (item.kind === 'menu' && item.children) {
      await preloadQueries(item.children, base);
    } else if (item.kind === 'component' && item.tag === 'sol-query') {
      const a = Object.fromEntries(item.attrs);
      const endpoint = a.endpoint || a.source;
      const sparql = a.sparql || a.query;
      const pattern = a.pattern || a.wanted;
      if (endpoint && (sparql || pattern)) {
        try {
          item._queryResult = await runQuery(endpoint, sparql, pattern, base);
        } catch (e) { item._queryError = e.message; }
      }
    } else if (item.kind === 'link' && item.href) {
      try {
        const url = new URL(item.href, base);
        if (url.protocol === 'http:' || url.protocol === 'https:') {
          const resp = await fetch(url.href);
          if (resp.ok) item._remoteContent = await resp.text();
          else item._remoteContent = `[HTTP ${resp.status}]`;
        }
      } catch { /* local files handled synchronously in contentFor */ }
    }
  }
}

function pivotTriples(data) {
  const { vars, rows } = data;
  const hasSPO = vars.length === 3 && vars[0] === 's' && vars[1] === 'p' && vars[2] === 'o';
  const hasPO  = vars.length === 2 && vars[0] === 'p' && vars[1] === 'o';
  if (!hasSPO && !hasPO) return null;

  const subjectOrder = [];
  const subjects = new Map();
  const predOrder = [];
  const predSet = new Set();

  for (const row of rows) {
    const sKey = hasSPO ? (row.s || '') : '';
    const pURI = row.p || '';
    if (!subjects.has(sKey)) { subjectOrder.push(sKey); subjects.set(sKey, new Map()); }
    if (!predSet.has(pURI)) { predSet.add(pURI); predOrder.push(pURI); }
    const predMap = subjects.get(sKey);
    if (!predMap.has(pURI)) predMap.set(pURI, []);
    predMap.get(pURI).push(row.o || '');
  }

  const names = predOrder.map(shorten);
  const seen = {};
  for (let i = 0; i < names.length; i++) {
    if (seen[names[i]] !== undefined) {
      names[seen[names[i]]] = predOrder[seen[names[i]]];
      names[i] = predOrder[i];
    } else { seen[names[i]] = i; }
  }

  const INDEX = ['name', 'label', 'title'];
  const ii = names.findIndex(n => INDEX.includes(n.toLowerCase()));
  if (ii > 0) {
    const [n] = names.splice(ii, 1);
    const [p] = predOrder.splice(ii, 1);
    names.unshift(n);
    predOrder.unshift(p);
  }

  const pivotedRows = subjectOrder.map(sKey => {
    const predMap = subjects.get(sKey);
    const row = {};
    for (let i = 0; i < predOrder.length; i++) {
      const vals = predMap.get(predOrder[i]);
      row[names[i]] = vals?.length ? vals.join(', ') : '';
    }
    return row;
  });

  return { vars: names, rows: pivotedRows };
}

function reorderColumns(data) {
  const INDEX = ['name', 'label', 'title'];
  const idx = data.vars.findIndex(v => INDEX.includes(v.toLowerCase()));
  if (idx <= 0) return data;
  const vars = [data.vars[idx], ...data.vars.filter((_, i) => i !== idx)];
  return { vars, rows: data.rows };
}

function formatTable(data, maxW) {
  if (!data || !data.vars.length) return 'No results.';

  const src = pivotTriples(data) || reorderColumns(data);
  const { vars, rows } = src;
  if (!rows.length) return `Columns: ${vars.join(', ')}\n\nNo rows.`;

  const display = rows.map(row => {
    const r = {};
    for (const v of vars) r[v] = shorten(row[v] || '');
    return r;
  });

  const colW = {};
  for (const v of vars) {
    colW[v] = v.length;
    for (const r of display) colW[v] = Math.max(colW[v], r[v].length);
  }

  const borders = vars.length + 1;
  const padding = vars.length * 2;
  const totalW = Object.values(colW).reduce((a, b) => a + b, 0) + borders + padding;
  if (totalW > maxW) {
    const available = maxW - borders - padding;
    const fair = Math.max(3, Math.floor(available / vars.length));
    for (const v of vars) colW[v] = Math.min(colW[v], fair);
  }

  const cell = (s, w) => ' ' + (s.length > w ? s.slice(0, w - 1) + '…' : s + ' '.repeat(w - s.length)) + ' ';
  const top = '┌' + vars.map(v => '─'.repeat(colW[v] + 2)).join('┬') + '┐';
  const hdr = '│' + vars.map(v => cell(v, colW[v])).join('│') + '│';
  const mid = '├' + vars.map(v => '─'.repeat(colW[v] + 2)).join('┼') + '┤';
  const body = display.map(r =>
    '│' + vars.map(v => cell(r[v], colW[v])).join('│') + '│'
  );
  const bot = '└' + vars.map(v => '─'.repeat(colW[v] + 2)).join('┴') + '┘';

  return [top, hdr, mid, ...body, bot].join('\n');
}

function formatDl(data, maxW) {
  if (!data || !data.vars.length) return 'No results.';

  const src = pivotTriples(data) || reorderColumns(data);
  const { vars, rows } = src;
  if (!rows.length) return 'No rows.';

  const nameVar = vars[0];
  const restVars = vars.slice(1);
  const lines = [];

  for (const row of rows) {
    const term = shorten(row[nameVar] || '');
    lines.push(term);
    lines.push('─'.repeat(Math.min(term.length, maxW)));
    for (const v of restVars) {
      const val = shorten(row[v] || '');
      lines.push(`  ${v}: ${val}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

function formatList(data, maxW) {
  if (!data || !data.vars.length) return 'No results.';

  const src = pivotTriples(data) || reorderColumns(data);
  const { vars, rows } = src;
  if (!rows.length) return 'No rows.';

  if (vars.length === 1) {
    return rows.map(r => `  • ${shorten(r[vars[0]] || '')}`).join('\n');
  }

  return formatTable(data, maxW);
}

function formatQuery(data, view, maxW) {
  if (!data) return 'No results.';
  if (view === 'dl')   return formatDl(data, maxW);
  if (view === 'list') return formatList(data, maxW);
  return formatTable(data, maxW);
}

function contentFor(item, base, maxW) {
  if (item.kind === 'component' && item.tag === 'sol-query') {
    if (item._queryError) return `[Query error: ${item._queryError}]`;
    if (item._queryResult) {
      const view = (Object.fromEntries(item.attrs).view || '').toLowerCase();
      return formatQuery(item._queryResult, view, maxW);
    }
  }
  if (item.kind === 'component') {
    const lines = [`<${item.tag}>`];
    for (const [k, v] of item.attrs) lines.push(`  ${k}="${v}"`);
    return lines.join('\n');
  }
  if (item.contents) return stripHtml(item.contents);
  if (item.href) {
    try {
      const url = new URL(item.href, base);
      if (url.protocol === 'file:') return readFileSync(fileURLToPath(url), 'utf-8');
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        return item._remoteContent || `[Loading: ${item.href}]`;
      }
    } catch { return `[Could not load: ${item.href}]`; }
  }
  return '';
}

// ─── Terminal UI ────────────────────────────────────────────────

const CSI = '\x1b[';
const CLEAR   = CSI + '2J' + CSI + 'H';
const HIDE    = CSI + '?25l';
const SHOW    = CSI + '?25h';
const RESET   = CSI + '0m';
const BOLD    = CSI + '1m';
const DIM     = CSI + '2m';
const REV     = CSI + '7m';
const CYAN    = CSI + '36m';
const YELLOW  = CSI + '33m';

function pad(s, w) {
  return s.length >= w ? s.slice(0, w) : s + ' '.repeat(w - s.length);
}

function wordWrap(text, w) {
  const out = [];
  for (const raw of text.split('\n')) {
    if (raw.length <= w) { out.push(raw); continue; }
    let rem = raw;
    while (rem.length > w) {
      let br = rem.lastIndexOf(' ', w);
      if (br <= 0) br = w;
      out.push(rem.slice(0, br));
      rem = rem.slice(br).trimStart();
    }
    if (rem) out.push(rem);
  }
  return out;
}

function buildVisible(items, expanded, depth = 0) {
  const out = [];
  for (const item of items) {
    if (item.kind === 'menu') {
      const exp = expanded.has(item);
      out.push({ item, depth, group: true, expanded: exp });
      if (exp) out.push(...buildVisible(item.children, expanded, depth + 1));
    } else {
      out.push({ item, depth, group: false });
    }
  }
  return out;
}

function draw(title, vis, sel, lines, navScr, cScr) {
  const W = process.stdout.columns || 80;
  const H = process.stdout.rows    || 24;
  const navW = Math.max(18, Math.min(36, Math.floor(W * 0.32)));
  const cW   = W - navW - 4;
  const bodyH = H - 5;

  let buf = CLEAR;

  // top border
  const tLabel = `─ ${title} `;
  const tFill  = Math.max(0, navW - tLabel.length);
  buf += `${BOLD}┌${tLabel}${'─'.repeat(tFill)}┬${'─'.repeat(cW + 1)}┐${RESET}\n`;

  // body
  for (let r = 0; r < bodyH; r++) {
    const vi = r + navScr;
    let navTxt = '';
    if (vi < vis.length) {
      const e = vis[vi];
      const indent = '  '.repeat(e.depth);
      let mark = '  ';
      if (e.group) mark = e.expanded ? '▼ ' : '▶ ';
      else if (vi === sel) mark = '► ';
      navTxt = indent + mark + e.item.name;
    }
    const navPlain = pad(navTxt, navW);
    let navStyled;
    if (vi === sel)                            navStyled = `${REV}${CYAN}${navPlain}${RESET}`;
    else if (vi < vis.length && vis[vi].group) navStyled = `${YELLOW}${navPlain}${RESET}`;
    else                                       navStyled = navPlain;

    const ci = r + cScr;
    const cTxt = ci < lines.length ? pad(lines[ci], cW) : ' '.repeat(cW);

    buf += `│${navStyled}│ ${cTxt}│\n`;
  }

  // divider + status + bottom
  const bW = navW + cW + 2;
  const help = ' ↑↓ navigate  Enter/→ expand  ← collapse  PgUp/Dn scroll  q quit ';
  const hPad = Math.max(0, bW - help.length);
  const hL = Math.floor(hPad / 2);
  const hR = hPad - hL;
  buf += `├${'─'.repeat(navW)}┴${'─'.repeat(cW + 1)}┤\n`;
  buf += `│${'─'.repeat(hL)}${DIM}${help}${RESET}${'─'.repeat(hR)}│\n`;
  buf += `└${'─'.repeat(bW)}┘`;

  process.stdout.write(buf);
}

// ─── Interactive loop ───────────────────────────────────────────

async function run(uri) {
  const { title, items, base } = await loadMenu(uri);
  if (!items.length) { console.log('Empty menu.'); return; }

  process.stdout.write('Loading data...\r');
  await preloadQueries(items, base);

  const expanded = new Set();
  let sel = 0, navScr = 0, cScr = 0;

  function refresh() {
    const vis = buildVisible(items, expanded);
    if (sel >= vis.length) sel = vis.length - 1;
    if (sel < 0) sel = 0;

    const H = process.stdout.rows || 24;
    const W = process.stdout.columns || 80;
    const navW = Math.max(18, Math.min(36, Math.floor(W * 0.32)));
    const cW = W - navW - 4;
    const bodyH = H - 5;

    if (sel < navScr) navScr = sel;
    if (sel >= navScr + bodyH) navScr = sel - bodyH + 1;

    const entry = vis[sel];
    let text = '';
    if (entry && !entry.group) text = contentFor(entry.item, base, cW - 1);
    else if (entry?.group) text = `Submenu: ${entry.item.name}\n\nPress Enter or → to expand.`;

    const lines = wordWrap(text, Math.max(1, cW - 1));
    const maxCS = Math.max(0, lines.length - bodyH);
    if (cScr > maxCS) cScr = maxCS;

    draw(title, vis, sel, lines, navScr, cScr);
    return vis;
  }

  process.stdout.write(HIDE);
  if (process.stdin.isTTY) process.stdin.setRawMode(true);
  readline.emitKeypressEvents(process.stdin);

  let vis = refresh();
  const fl = vis.findIndex(v => !v.group);
  if (fl >= 0) { sel = fl; vis = refresh(); }

  function cleanup() {
    process.stdout.write(SHOW + '\n');
    if (process.stdin.isTTY) process.stdin.setRawMode(false);
  }

  process.stdin.on('keypress', (_str, key) => {
    if (!key) return;
    const bodyH = (process.stdout.rows || 24) - 5;

    if (key.name === 'q' || (key.ctrl && key.name === 'c')) {
      cleanup();
      process.exit(0);
    }

    if (key.name === 'up' && sel > 0)                  { sel--; cScr = 0; }
    else if (key.name === 'down' && sel < vis.length-1) { sel++; cScr = 0; }
    else if (key.name === 'right' || key.name === 'return') {
      const e = vis[sel];
      if (e?.group && !expanded.has(e.item)) expanded.add(e.item);
    }
    else if (key.name === 'left') {
      const e = vis[sel];
      if (e?.group && expanded.has(e.item)) {
        expanded.delete(e.item);
      } else if (e && e.depth > 0) {
        for (let i = sel - 1; i >= 0; i--) {
          if (vis[i].group && vis[i].depth < e.depth) { sel = i; break; }
        }
      }
    }
    else if (key.name === 'pagedown') { cScr += (process.stdout.rows || 24) - 5; }
    else if (key.name === 'pageup')   { cScr = Math.max(0, cScr - ((process.stdout.rows || 24) - 5)); }

    vis = refresh();
  });

  process.on('SIGWINCH', () => { vis = refresh(); });
  process.on('exit', cleanup);
}

// ─── Entry ──────────────────────────────────────────────────────

export { loadMenu, parseItems };

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === __filename) {
  const uri = process.argv[2];
  if (!uri) {
    console.error('Usage: node sol-menu-cli.js <menu.ttl[#MenuId]>');
    process.exit(1);
  }
  run(uri);
}
