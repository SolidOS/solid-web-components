/**
 * @jest-environment jsdom
 *
 * Tests for web/sol-full.js — the side-effect aggregator that loads every
 * "covered" component in one tag. Importing it should register each child
 * component's custom element (sol-menu / sol-include / sol-query / sol-login /
 * sol-feed) and activate the menu `from-rdf` loader (menu-from-rdf.js, which
 * carries no element of its own).
 */

window.__SolSuppressDefineWarn = true;

// Components imported by sol-full each define exactly one element on import.
const EXPECTED = ['sol-menu', 'sol-include', 'sol-query', 'sol-login', 'sol-feed'];

// Deliberately left OUT of sol-full (per its own header comment) — assert they
// are NOT pulled in as a side effect.
const NOT_INCLUDED = ['sol-weather', 'sol-time', 'sol-calendar'];

beforeAll(async () => {
  await import('../../web/sol-full.js');
});

describe('sol-full aggregator', () => {
  test('imports without throwing (beforeAll completed)', () => {
    // Reaching this test at all means the bundle imported cleanly.
    expect(typeof customElements.get).toBe('function');
  });

  test.each(EXPECTED)('registers <%s>', (tag) => {
    const cls = customElements.get(tag);
    expect(cls).toBeDefined();
    expect(typeof cls).toBe('function');
    expect(cls.prototype).toBeInstanceOf(HTMLElement);
  });

  test('registers every expected element and no fewer', () => {
    const defined = EXPECTED.filter((t) => customElements.get(t));
    expect(defined).toEqual(EXPECTED);
  });

  test.each(NOT_INCLUDED)('does not pull in the excluded widget <%s>', (tag) => {
    expect(customElements.get(tag)).toBeUndefined();
  });
});
