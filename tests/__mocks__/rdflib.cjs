// Minimal rdflib mock for Jest — covers what sol-query-rdf.js needs.

class NamedNode { constructor(v) { this.value = v; this.termType = 'NamedNode'; } }
class BlankNode  { constructor(v) { this.value = v; this.termType = 'BlankNode'; } }
class Literal    {
  constructor(v, langOrDt) {
    this.value    = String(v);
    this.termType = 'Literal';
    if (typeof langOrDt === 'string') this.language = langOrDt;
    else if (langOrDt)                this.datatype  = langOrDt;
  }
}

class Statement {
  constructor(s, p, o, g) { this.subject = s; this.predicate = p; this.object = o; this.graph = g; }
}

class MockStore {
  constructor() { this.statements = []; }

  add(s, p, o, g = null) { this.statements.push(new Statement(s, p, o, g)); }

  match(s, p, o, g) {
    return this.statements.filter(st =>
      (!s || st.subject.value   === s.value) &&
      (!p || st.predicate.value === p.value) &&
      (!o || st.object.value    === o.value)
    );
  }

  any(s, p, o) {
    const r = this.match(s, p, o);
    return r.length ? r[0].object : null;
  }

  each(s, p, o) {
    return this.match(s, p, o).map(st => {
      if (!s) return st.subject;
      if (!p) return st.predicate;
      return st.object;
    });
  }
}

function graph()    { return new MockStore(); }
function sym(v)     { return new NamedNode(v); }
function literal(v, langOrDt) { return new Literal(v, langOrDt); }
function blankNode(v) { return new BlankNode(v || `b${Math.random()}`); }

function parse(text, store, base, format) {
  const prefixes = {};
  // Tokenize: URIs, strings, prefixed names, punctuation (. ; ,), 'a' keyword
  // Prefixed names must not end with '.' (that's a statement terminator).
  const TOKEN_RE = /<[^>]+>|"[^"]*"|@prefix|[A-Za-z_][\w.-]*:[A-Za-z_][\w#/-]*(?:\.[\w#/-]+)*|[A-Za-z_][\w.-]*:|[.;,]|\ba\b/g;
  const tokens = [];
  for (const m of text.matchAll(TOKEN_RE)) tokens.push(m[0]);

  // First pass: collect @prefix declarations
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === '@prefix' && i + 2 < tokens.length) {
      const pname = tokens[i + 1]; // e.g. "acl:"
      const uri = tokens[i + 2];   // e.g. "<http://...>"
      if (pname.endsWith(':') && uri.startsWith('<')) {
        prefixes[pname.slice(0, -1)] = uri.slice(1, -1);
      }
      // skip past the '.'
      i += 3;
      if (i < tokens.length && tokens[i] === '.') i++;
      i--; // loop will increment
    }
  }

  const resolve = (tok) => {
    if (tok.startsWith('<') && tok.endsWith('>')) {
      const uri = tok.slice(1, -1);
      if (uri.startsWith('#') && base) return base + uri;
      return uri;
    }
    if (tok === 'a') return 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
    const ci = tok.indexOf(':');
    if (ci >= 0) {
      const pre = tok.slice(0, ci);
      if (prefixes[pre] !== undefined) return prefixes[pre] + tok.slice(ci + 1);
    }
    return tok;
  };
  const toNode = (tok) =>
    tok.startsWith('"') ? literal(tok.slice(1, -1)) : sym(resolve(tok));

  // Second pass: parse triples (skip @prefix tokens)
  let subject = null, predicate = null;
  let pos = 0;
  // Skip to after prefix declarations
  while (pos < tokens.length) {
    const t = tokens[pos];
    if (t === '@prefix') {
      pos += 4; // @prefix name: <uri> .
      continue;
    }
    if (t === '.') { subject = null; predicate = null; pos++; continue; }
    if (t === ';') { predicate = null; pos++; continue; }
    if (t === ',') { pos++; continue; }

    if (!subject) { subject = resolve(t); pos++; continue; }
    if (!predicate) { predicate = resolve(t); pos++; continue; }
    // object
    store.add(sym(subject), sym(predicate), toNode(t));
    pos++;
  }
}

class Fetcher {
  constructor(store, opts) { this.store = store; this.opts = opts; }
  async fetch(uri, opts) { return globalThis.fetch(uri, opts); }
  async load(uri) {
    const resp = await globalThis.fetch(uri, { headers: { Accept: 'text/turtle' } });
    if (!resp.ok) throw new Error(`${resp.status} fetching ${uri}`);
    const text = await resp.text();
    const ct = (resp.headers && resp.headers.get && resp.headers.get('Content-Type')) || 'text/turtle';
    parse(text, this.store, uri, ct.split(';')[0].trim());
    return resp;
  }
}

module.exports = { graph, sym, literal, blankNode, parse, NamedNode, BlankNode, Literal, Statement, Fetcher };
