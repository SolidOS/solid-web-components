/**
 * Mini-query parser and SPARQL converter
 * Converts simple 3-part queries (subject predicate object) to SPARQL
 */

export class MiniQueryParser {
  constructor(endpoint) {
    this.endpoint = endpoint;
    this._varCounter = 0;
  }

  /**
   * Parse a mini-query string into a SPARQL SELECT query
   * @param {string} miniQuery - Three space-separated terms: "subject predicate object"
   * @returns {string} A valid SPARQL SELECT query
   * @throws {Error} If mini-query format is invalid
   */
  parse(miniQuery) {
    const parts = miniQuery.trim().split(/\s+/);

    if (parts.length !== 3) {
      throw new Error(
        'Mini-query must have exactly 3 parts: subject predicate object'
      );
    }

    const [s, p, o] = parts;

    const expandedS = this.expandTerm(s);
    const expandedP = this.expandTerm(p);
    const expandedO = this.expandTerm(o);

    return `SELECT * WHERE { ${expandedS} ${expandedP} ${expandedO} }`;
  }

  /**
   * Expand a term to its full form
   * Handles: variables (?x), URIs (<...>), prefixes (ex:term), literals ("..."), numbers, and bare terms
   * @param {string} term - The term to expand
   * @returns {string} The expanded term
   */
  expandTerm(term) {
    // Variable placeholder: ? becomes ?v0, ?v1, etc.
    if (term === '?') {
      return `?${this.generateVarName()}`;
    }

    // Already a variable: ?name
    if (term.startsWith('?')) {
      return term;
    }

    // Already a full URI: <http://example.com>
    if (term.startsWith('<') && term.endsWith('>')) {
      return term;
    }

    // Prefixed term: ex:property
    if (term.includes(':')) {
      return term;
    }

    // Literal string: "value" or 'value'
    if (term.startsWith('"') || term.startsWith("'")) {
      return term;
    }

    // Numeric literal
    if (!isNaN(term)) {
      return term;
    }

    // Bare term: expand relative to endpoint base
    const baseUri = this.getBaseUri();
    return `<${baseUri}#${term}>`;
  }

  /**
   * Extract the base URI from the endpoint
   * Removes fragment (#) and query string (?)
   * @returns {string} The base URI
   */
  getBaseUri() {
    return this.endpoint.split('#')[0].split('?')[0];
  }

  /**
   * Generate a unique variable name for anonymous variables
   * @returns {string} A variable name like "v0", "v1", etc.
   */
  generateVarName() {
    return `v${this._varCounter++}`;
  }

  /**
   * Reset the variable counter
   * Useful if parsing multiple independent queries
   */
  resetVarCounter() {
    this._varCounter = 0;
  }
}

/**
 * Validator for mini-query syntax
 */
export class MiniQueryValidator {
  /**
   * Check if a string is a valid mini-query
   * @param {string} input - The input to validate
   * @returns {object} { valid: boolean, error?: string }
   */
  static validate(input) {
    if (!input || typeof input !== 'string') {
      return { valid: false, error: 'Input must be a non-empty string' };
    }

    const parts = input.trim().split(/\s+/);

    if (parts.length < 3) {
      return {
        valid: false,
        error: `Mini-query needs 3 parts (subject predicate object) — got ${parts.length}`,
      };
    }

    return { valid: true };
  }

  /**
   * Explain what each position in a mini-query represents
   * @returns {string} A help message
   */
  static getHelpMessage() {
    return `
Mini-query format: subject predicate object

Examples:
  ?person foaf:name "Alice"        — Find all people named Alice
  <http://example.org> ? ?o        — Find all properties and values
  ? ? ?                             — Find all triples
  ex:alice ex:knows ?friend        — Find all of Alice's friends

Term types:
  ?var          — Variable (matches anything)
  ?             — Anonymous variable (auto-numbered)
  <uri>         — Full URI
  prefix:local  — Prefixed URI
  "literal"     — String literal
  123           — Numeric literal
  bare          — Relative to endpoint base (becomes <base#bare>)
    `.trim();
  }
}
