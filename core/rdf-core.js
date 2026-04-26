// Pure RDF utility functions shared between browser (rdf-utils.js) and
// Node (sol-query-node.js). All rdflib-dependent functions accept an
// rdflib-like object ({ sym, literal }) as a parameter.

// ─── Namespace prefixes ──────────────────────────────────────────────────────
export const KNOWN_PREFIXES = {
  acl: 'http://www.w3.org/ns/auth/acl#',
  arg: 'http://www.w3.org/ns/pim/arg#',
  as: 'https://www.w3.org/ns/activitystreams#',
  bookmark: 'http://www.w3.org/2002/01/bookmark#',
  cal: 'http://www.w3.org/2002/12/cal/ical#',
  cco: 'http://www.ontologyrepository.com/CommonCoreOntologies/',
  cert: 'http://www.w3.org/ns/auth/cert#',
  contact: 'http://www.w3.org/2000/10/swap/pim/contact#',
  dc: 'http://purl.org/dc/elements/1.1/',
  dct: 'http://purl.org/dc/terms/',
  doap: 'http://usefulinc.com/ns/doap#',
  foaf: 'http://xmlns.com/foaf/0.1/',
  geo: 'http://www.w3.org/2003/01/geo/wgs84_pos#',
  gpx: 'http://www.w3.org/ns/pim/gpx#',
  gr: 'http://purl.org/goodrelations/v1#',
  http: 'http://www.w3.org/2007/ont/http#',
  httph: 'http://www.w3.org/2007/ont/httph#',
  icalTZ: 'http://www.w3.org/2002/12/cal/icaltzd#',
  ldp: 'http://www.w3.org/ns/ldp#',
  link: 'http://www.w3.org/2007/ont/link#',
  log: 'http://www.w3.org/2000/10/swap/log#',
  meeting: 'http://www.w3.org/ns/pim/meeting#',
  mo: 'http://purl.org/ontology/mo/',
  org: 'http://www.w3.org/ns/org#',
  owl: 'http://www.w3.org/2002/07/owl#',
  pad: 'http://www.w3.org/ns/pim/pad#',
  patch: 'http://www.w3.org/ns/pim/patch#',
  prov: 'http://www.w3.org/ns/prov#',
  pto: 'http://www.productontology.org/id/',
  qu: 'http://www.w3.org/2000/10/swap/pim/qif#',
  trip: 'http://www.w3.org/ns/pim/trip#',
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  rss: 'http://purl.org/rss/1.0/',
  sched: 'http://www.w3.org/ns/pim/schedule#',
  schema: 'http://schema.org/',
  sioc: 'http://rdfs.org/sioc/ns#',
  skos: 'http://www.w3.org/2004/02/skos/core#',
  solid: 'http://www.w3.org/ns/solid/terms#',
  space: 'http://www.w3.org/ns/pim/space#',
  stat: 'http://www.w3.org/ns/posix/stat#',
  ui: 'http://www.w3.org/ns/ui#',
  vann: 'http://purl.org/vocab/vann/',
  vcard: 'http://www.w3.org/2006/vcard/ns#',
  wf: 'http://www.w3.org/2005/01/wf/flow#',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
};

// ─── Accept types & format detection ─────────────────────────────────────────
export const ACCEPT_TYPES = [
  'text/turtle',
  'application/ld+json',
  'application/rdf+xml',
  'text/n3',
  'application/n-triples',
];

export function detectFormat(ct, accept) {
  if (ct.includes('turtle')    || accept.includes('turtle'))    return 'text/turtle';
  if (ct.includes('ld+json')   || accept.includes('ld+json'))   return 'application/ld+json';
  if (ct.includes('rdf+xml'))                                   return 'application/rdf+xml';
  if (ct.includes('n-triples') || accept.includes('n-triples')) return 'application/n-triples';
  if (ct.includes('n3')        || accept.includes('n3'))        return 'text/n3';
  return ct || 'text/turtle';
}

// ─── Term utilities ──────────────────────────────────────────────────────────
export function termToString(term) {
  if (!term) return '';
  if (typeof term === 'string') return term;
  if (typeof term.toNT === 'function') return term.toNT();
  if (typeof term.value === 'string') return term.value;
  return String(term);
}

export function termToCell(term) {
  if (!term) return { type: 'literal', value: '' };
  if (term.termType === 'NamedNode')  return { type: 'uri',   value: term.value };
  if (term.termType === 'BlankNode')  return { type: 'bnode', value: term.value, _term: term };
  return { type: 'literal', value: term.value ?? String(term) };
}

// ─── CURIE expansion ─────────────────────────────────────────────────────────
export function expandCurie(curie, extraPrefixes = {}) {
  const colon = curie.indexOf(':');
  if (colon < 0) return null;
  const prefix = curie.slice(0, colon);
  const local  = curie.slice(colon + 1);
  const ns = extraPrefixes[prefix] || KNOWN_PREFIXES[prefix];
  return ns ? ns + local : null;
}

function _isCurie(token) {
  return /^[a-zA-Z][a-zA-Z0-9]*:[^/\s]/.test(token);
}

function _resolveUri(raw, baseUri) {
  if (!baseUri) return raw;
  const docBase = baseUri.split('#')[0];
  if (raw.startsWith('#'))  return docBase + raw;
  try { return new URL(raw, baseUri).href; } catch { return raw; }
}

export const _NAMED_VAR_RE = /^\?[A-Za-z_][A-Za-z0-9_]*$/;

// ─── Triple-pattern term parser ──────────────────────────────────────────────
// rdflib: object with sym(uri) and literal(value, langOrType) methods.
export function triplePatternTermToNode(term, rdflib, extraPrefixes = {}, baseUri = '') {
  if (!term) throw new Error('Triple-pattern term is empty');
  if (term === '?') {
    throw new Error('Bare "?" is not allowed — use a named variable like "?x"');
  }
  if (term.startsWith('?')) {
    if (!_NAMED_VAR_RE.test(term)) {
      throw new Error(`Invalid variable "${term}" — must match ?[A-Za-z_][A-Za-z0-9_]*`);
    }
    return null;
  }
  if (term.startsWith('<') && term.endsWith('>')) {
    const inner = term.slice(1, -1);
    const resolved = (inner.startsWith('#') || inner.startsWith('.') || !/^[a-z][a-z0-9+\-.]*:/i.test(inner))
      ? _resolveUri(inner, baseUri)
      : inner;
    return rdflib.sym(resolved);
  }
  if (term.startsWith('"')) {
    const m = term.match(/^"([^"]*)"(?:\^\^<([^>]+)>|@([a-z-]+))?$/i);
    if (!m) throw new Error(`Malformed literal "${term}" — must be "value" with optional @lang or ^^<datatype>`);
    return rdflib.literal(m[1], m[3] || (m[2] ? rdflib.sym(m[2]) : undefined));
  }
  if (term.startsWith('#')) {
    if (!baseUri) throw new Error(`Fragment "${term}" requires a baseUri to resolve`);
    return rdflib.sym(_resolveUri(term, baseUri));
  }
  if (_isCurie(term)) {
    const expanded = expandCurie(term, extraPrefixes);
    return rdflib.sym(expanded || term);
  }
  throw new Error(
    `Unrecognized term "${term}" — must be a named variable (?x), <uri>, prefix:local, #fragment, or quoted "literal"`
  );
}

// ─── Tokenize a triple pattern ───────────────────────────────────────────────
export function tokenizeTriplePattern(input) {
  const out = [];
  const s = input.trim();
  let i = 0;
  while (i < s.length) {
    while (i < s.length && /\s/.test(s[i])) i++;
    if (i >= s.length) break;
    if (s[i] === '"') {
      let j = i + 1;
      while (j < s.length && s[j] !== '"') {
        if (s[j] === '\\' && j + 1 < s.length) j += 2;
        else j++;
      }
      if (j >= s.length) throw new Error(`Unterminated literal starting at position ${i}`);
      j++;
      if (s[j] === '@') {
        j++;
        while (j < s.length && /[A-Za-z-]/.test(s[j])) j++;
      } else if (s[j] === '^' && s[j + 1] === '^' && s[j + 2] === '<') {
        j += 3;
        while (j < s.length && s[j] !== '>') j++;
        if (j >= s.length) throw new Error(`Unterminated datatype IRI`);
        j++;
      }
      out.push(s.slice(i, j));
      i = j;
    } else {
      let j = i;
      while (j < s.length && !/\s/.test(s[j])) j++;
      out.push(s.slice(i, j));
      i = j;
    }
  }
  return out;
}

// ─── Parse a triple-pattern string into [sNode, pNode, oNode] ───────────────
export function parsePatternParts(pattern, rdflib, extraPrefixes = {}, baseUri = '') {
  const tokens = tokenizeTriplePattern(pattern);
  if (tokens.length !== 3) {
    throw new Error(`Triple pattern must have exactly 3 parts (subject predicate object) — got ${tokens.length}`);
  }
  const s = triplePatternTermToNode(tokens[0], rdflib, extraPrefixes, baseUri);
  const p = triplePatternTermToNode(tokens[1], rdflib, extraPrefixes, baseUri);
  const o = triplePatternTermToNode(tokens[2], rdflib, extraPrefixes, baseUri);
  return [s, p, o];
}

// ─── Extract variable names from a triple pattern ───────────────────────────
export function patternVarNames(pattern) {
  const tokens = tokenizeTriplePattern(pattern);
  if (tokens.length !== 3) return {};
  const out = {};
  const slots = ['s', 'p', 'o'];
  tokens.forEach((tok, i) => {
    if (_NAMED_VAR_RE.test(tok)) out[slots[i]] = tok.slice(1);
  });
  return out;
}

// ─── store.match → renderer {vars, results} ─────────────────────────────────
export function matchStore(store, s, p, o, names = {}) {
  const stmts = store.match(s, p, o, null);
  const slots = [];
  if (!s) slots.push('s');
  if (!p) slots.push('p');
  if (!o) slots.push('o');
  if (!slots.length) slots.push('s', 'p', 'o');

  const cols = slots.map(slot => names[slot] || slot);
  const results = stmts.map(st => {
    const row = {};
    slots.forEach((slot, i) => {
      const node = slot === 's' ? st.subject : slot === 'p' ? st.predicate : st.object;
      row[cols[i]] = termToCell(node);
    });
    return row;
  });
  return { vars: cols, results };
}

// ─── SPARQL helpers ──────────────────────────────────────────────────────────
export function selectVars(queryText) {
  const stripped = queryText.replace(/#[^\n]*/g, '');
  const m = stripped.match(/\bSELECT\s+(?:DISTINCT\s+|REDUCED\s+)?(.*?)\s+WHERE\b/is);
  if (!m) return null;
  const clause = m[1].trim();
  if (clause === '*') return null;
  const vars = clause.match(/\?\w+/g);
  return vars ? vars.map(v => v.slice(1)) : null;
}

export function isRdfDoc(url) {
  return /\.(ttl|rdf|n3|jsonld|nt|nq|owl|trig)(\?|#|$)/i.test(url);
}

export function bindingsToResults(bindings, queryText) {
  const selectVarsResult = selectVars(queryText);
  const allKeys = bindings.length
    ? Object.keys(bindings[0]).map(k => k.replace(/^\?/, ''))
    : [];
  const vars = selectVarsResult ?? allKeys;
  const results = bindings.map(b => {
    const row = {};
    for (const v of vars) {
      const node = b[`?${v}`];
      row[v] = node ? termToCell(node) : { type: 'literal', value: '' };
    }
    return row;
  });
  return { vars, results };
}
