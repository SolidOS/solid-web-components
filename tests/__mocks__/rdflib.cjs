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
  // Minimal Turtle parser: handles  <s> <p> <o> .  and  <s> <p> "literal" .
  const triples = text.matchAll(/<([^>]+)>\s+<([^>]+)>\s+(?:<([^>]+)>|"([^"]*)")\s*\./g);
  for (const [, s, p, oUri, oLit] of triples) {
    store.add(sym(s), sym(p), oUri ? sym(oUri) : literal(oLit));
  }
}

module.exports = { graph, sym, literal, blankNode, parse, NamedNode, BlankNode, Literal, Statement };
