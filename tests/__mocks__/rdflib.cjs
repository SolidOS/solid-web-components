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
  for (const m of text.matchAll(/@prefix\s+(\w*):\s*<([^>]+)>\s*\./g)) {
    prefixes[m[1]] = m[2];
  }
  const resolve = (tok) => {
    if (tok.startsWith('<') && tok.endsWith('>')) return tok.slice(1, -1);
    const ci = tok.indexOf(':');
    if (ci >= 0) {
      const pre = tok.slice(0, ci);
      if (prefixes[pre] !== undefined) return prefixes[pre] + tok.slice(ci + 1);
    }
    return tok;
  };
  const toNode = (tok) =>
    tok.startsWith('"') ? literal(tok.slice(1, -1)) : sym(resolve(tok));
  // Tokenize: full URIs, quoted literals, prefixed names, 'a' keyword
  const TOKEN = /<[^>]+>|"[^"]*"|[\w][\w./-]*:[\w#./-]*|\ba\b/g;
  const body = text.replace(/@prefix\s+\w*:\s*<[^>]+>\s*\.\s*/g, '').replace(/#[^\n]*/g, '');
  // Split on statement-ending '.' (after > or " or prefixed name, before whitespace/end)
  for (const block of body.split(/\.\s*(?=\s*(?:$|<|[A-Za-z_]))/m)) {
    const t = block.trim();
    if (!t) continue;
    // Split on ';' for predicate-object lists sharing a subject
    const groups = t.split(/\s*;\s*/);
    let subject = null;
    for (const g of groups) {
      const tokens = g.trim().match(TOKEN);
      if (!tokens) continue;
      // Expand 'a' to rdf:type
      const expanded = tokens.map(tk =>
        tk === 'a' ? '<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>' : tk);
      if (!subject) {
        subject = resolve(expanded[0]);
        // Handle comma-separated objects: s p o1, o2
        for (let i = 2; i < expanded.length; i++) {
          if (expanded[i] === ',') continue;
          store.add(sym(subject), sym(resolve(expanded[1])), toNode(expanded[i]));
        }
      } else if (expanded.length >= 2) {
        for (let i = 1; i < expanded.length; i++) {
          if (expanded[i] === ',') continue;
          store.add(sym(subject), sym(resolve(expanded[0])), toNode(expanded[i]));
        }
      }
    }
  }
}

module.exports = { graph, sym, literal, blankNode, parse, NamedNode, BlankNode, Literal, Statement };
