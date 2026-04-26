/**
 * Triple-pattern parser and SPARQL converter.
 * Converts a strict 3-part triple pattern (subject predicate object) to SPARQL.
 *
 * Grammar (strict — matches the W3C triple-pattern spec):
 *   subject:   named-var (?x) | <uri> | prefix:local
 *   predicate: named-var | <uri> | prefix:local
 *   object:    named-var | <uri> | prefix:local | "literal"[@lang|^^<datatype>]
 *
 * Rejected: bare `?` (all variables must be named), bare words, unquoted
 * literals, numeric literals without quotes.
 */

const NAMED_VAR_RE = /^\?[A-Za-z_][A-Za-z0-9_]*$/;

export class TriplePatternParser {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  /**
   * Parse a triple-pattern string into a SPARQL SELECT query.
   * @param {string} pattern - "subject predicate object"
   * @returns {string} A valid SPARQL SELECT query
   * @throws {Error} If the pattern is invalid
   */
  parse(pattern) {
    const tokens = _tokenizeTriplePattern(pattern);
    if (tokens.length !== 3) {
      throw new Error(`Triple pattern must have exactly 3 parts: subject predicate object (got ${tokens.length})`);
    }
    const [s, p, o] = tokens.map(t => this.expandTerm(t));
    return `SELECT * WHERE { ${s} ${p} ${o} }`;
  }

  expandTerm(term) {
    if (term === '?') {
      throw new Error('Bare "?" is not allowed — use a named variable like "?x"');
    }
    if (term.startsWith('?')) {
      if (!NAMED_VAR_RE.test(term)) {
        throw new Error(`Invalid variable "${term}" — must match ?[A-Za-z_][A-Za-z0-9_]*`);
      }
      return term;
    }
    if (term.startsWith('<') && term.endsWith('>')) return term;
    if (term.startsWith('"')) {
      if (!/^"([^"\\]|\\.)*"(@[A-Za-z-]+|\^\^<[^>]+>)?$/.test(term)) {
        throw new Error(`Malformed literal "${term}" — must be "value" with optional @lang or ^^<datatype>`);
      }
      return term;
    }
    if (_isCurie(term)) return term;
    throw new Error(
      `Unrecognized term "${term}" — must be a named variable (?x), <uri>, prefix:local, or quoted "literal"`
    );
  }
}

/** Validator for triple-pattern syntax. */
export class TriplePatternValidator {
  static validate(input) {
    if (!input || typeof input !== 'string') {
      return { valid: false, error: 'Input must be a non-empty string' };
    }
    let tokens;
    try { tokens = _tokenizeTriplePattern(input); }
    catch (e) { return { valid: false, error: e.message }; }

    if (tokens.length !== 3) {
      return { valid: false, error: `Triple pattern needs exactly 3 parts — got ${tokens.length}` };
    }
    const p = new TriplePatternParser('');
    try {
      p.expandTerm(tokens[0]);
      p.expandTerm(tokens[1]);
      p.expandTerm(tokens[2]);
    } catch (e) {
      return { valid: false, error: e.message };
    }
    return { valid: true };
  }

  static getHelpMessage() {
    return `
Triple-pattern format: subject predicate object

Examples:
  ?person foaf:name "Alice"         — People named Alice
  <http://example.org/me> ?p ?o     — All properties of a subject
  ?s ?p ?o                          — All triples
  ex:alice ex:knows ?friend         — Alice's friends

Term types:
  ?name          — Named variable (bare "?" is NOT allowed)
  <uri>          — Full URI
  prefix:local   — Prefixed URI (CURIE)
  "literal"      — String literal (bare words and numbers are NOT accepted)
  "x"@en         — Literal with language tag
  "1"^^<http://www.w3.org/2001/XMLSchema#integer>  — Typed literal
    `.trim();
  }
}

// ── Internal helpers ─────────────────────────────────────────────────────────
function _isCurie(term) {
  const m = term.match(/^([A-Za-z_][A-Za-z0-9_-]*):([^\s]*)$/);
  if (!m) return false;
  if (/^(https?|ftp|file|urn|mailto|data|tel|news|gopher|ldap|about):/i.test(term)) return false;
  return true;
}

function _tokenizeTriplePattern(input) {
  const out = [];
  const s = String(input).trim();
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
        if (j >= s.length) throw new Error('Unterminated datatype IRI');
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

// Back-compat aliases (deprecated — prefer the new names).
export const MiniQueryParser = TriplePatternParser;
export const MiniQueryValidator = TriplePatternValidator;
