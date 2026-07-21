/**
 * Menu-level ui:region default (2026-07-20): a ui:region ON THE MENU is the
 * fallback placement for members that carry none of their own. An item's own
 * region (entry triple or `region` attribute pair) always wins; submenus
 * inherit the default until one sets its own. Inherited regions are flagged
 * (regionInherited) so serialization never materializes them onto items.
 *
 * The jest rdflib mock's turtle parser is too naive for these fixtures, so
 * they're parsed with n3 and fed into the mock store term-by-term.
 */
import { Parser } from 'n3';
import { graph, sym, literal, blankNode } from '../__mocks__/rdflib-esm.js';
import { parseMenuItems } from '../../core/menu-rdf.js';

const BASE = 'http://region.test/menu.ttl';

function storeFrom(ttl) {
  const store = graph();
  for (const q of new Parser({ baseIRI: BASE }).parse(ttl)) {
    const term = (t) => t.termType === 'Literal' ? literal(t.value)
      : t.termType === 'BlankNode' ? blankNode(t.value) : sym(t.value);
    store.add(term(q.subject), term(q.predicate), term(q.object));
  }
  return store;
}

const PREFIXES = `
@prefix : <#> .
@prefix ui: <http://www.w3.org/ns/ui#> .
@prefix schema: <http://schema.org/> .
`;

test('members without a region inherit the menu ui:region (flagged inherited)', () => {
  const store = storeFrom(`${PREFIXES}
:Menu a ui:Menu ; ui:label "M" ; ui:region ui:Modal ;
  schema:itemListElement :A .
:A a ui:Link ; ui:label "A" ; schema:url "https://a.example/" .
`);
  const [a] = parseMenuItems(store, sym(BASE + '#Menu'));
  expect(a.region).toBe('modal');
  expect(a.regionInherited).toBe(true);
});

test("an item's own ui:region beats the menu default (not flagged)", () => {
  const store = storeFrom(`${PREFIXES}
:Menu a ui:Menu ; ui:label "M" ; ui:region ui:Modal ;
  schema:itemListElement :A .
:A a ui:Link ; ui:label "A" ; ui:region ui:Tab ; schema:url "https://a.example/" .
`);
  const [a] = parseMenuItems(store, sym(BASE + '#Menu'));
  expect(a.region).toBe('tab');
  expect(a.regionInherited).toBe(false);
});

test('a region attribute pair beats the menu default', () => {
  const store = storeFrom(`${PREFIXES}
:Menu a ui:Menu ; ui:label "M" ; ui:region ui:Modal ;
  schema:itemListElement :C .
:C a ui:Plugin ; schema:additionalType ui:Component ; ui:label "C" ;
  schema:url <http://region.test/web/sol-thing.js> ;
  schema:additionalProperty [ schema:name "region" ; schema:value "dropdown" ] .
`);
  const [c] = parseMenuItems(store, sym(BASE + '#Menu'));
  expect(c.region).toBe('dropdown');
  expect(c.regionInherited).toBe(false);
});

test('submenus inherit the default until one sets its own', () => {
  const store = storeFrom(`${PREFIXES}
:Menu a ui:Menu ; ui:label "M" ; ui:region ui:Modal ;
  schema:itemListElement :Sub, :Own .
:Sub a ui:Menu ; ui:label "Sub" ; schema:itemListElement :A .
:A a ui:Link ; ui:label "A" ; schema:url "https://a.example/" .
:Own a ui:Menu ; ui:label "Own" ; ui:region ui:Dropdown ; schema:itemListElement :B .
:B a ui:Link ; ui:label "B" ; schema:url "https://b.example/" .
`);
  const items = parseMenuItems(store, sym(BASE + '#Menu'));
  const sub = items.find((i) => i.name === 'Sub');
  const own = items.find((i) => i.name === 'Own');
  expect(sub.children[0].region).toBe('modal');      // inherited through
  expect(sub.children[0].regionInherited).toBe(true);
  expect(own.children[0].region).toBe('dropdown');   // submenu override
  expect(own.children[0].regionInherited).toBe(true); // still a menu default
});

test('no menu default → region stays null', () => {
  const store = storeFrom(`${PREFIXES}
:Menu a ui:Menu ; ui:label "M" ; schema:itemListElement :A .
:A a ui:Link ; ui:label "A" ; schema:url "https://a.example/" .
`);
  const [a] = parseMenuItems(store, sym(BASE + '#Menu'));
  expect(a.region).toBe(null);
  expect(a.regionInherited).toBe(false);
});
