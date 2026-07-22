/**
 * @jest-environment jsdom
 *
 * A ui:Link plugin's schema:additionalProperty pairs become SEARCH PARAMS on
 * the URL it opens (2026-07-22). Structural params (placement + gating) are
 * filtered at the URL builder, not at parse — gatedByParams still has to see
 * `if-logged-in`, it just must never leak to a third-party site.
 *
 * Commands keep their params as an ARGS OBJECT (detail.params) — a command's
 * schema:url is a registry fragment IRI, never a fetched URL.
 *
 * The jest rdflib mock's turtle parser is too naive for these fixtures, so
 * they're parsed with n3 and fed into the mock store term-by-term.
 */
import { Parser } from 'n3';
import { graph, sym, literal, blankNode } from '../__mocks__/rdflib-esm.js';
import { parseMenuItems } from '../../core/menu-rdf.js';
import { hrefWithParams, renderLinkItem, dispatchCommand, paramsToObject } from '../../core/rdf-render.js';
import { generateShell } from '../../core/menu-generate.js';
import { extractFromHtml } from '../../core/menu-html.js';

const BASE = 'http://link.test/menu.ttl';

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

describe('hrefWithParams', () => {
  test('appends params to a bare URL', () => {
    expect(hrefWithParams('https://example.org/a', [['time', 'local']]))
      .toBe('https://example.org/a?time=local');
  });

  test('no params → href returned untouched', () => {
    expect(hrefWithParams('https://example.org/a', [])).toBe('https://example.org/a');
    expect(hrefWithParams('https://example.org/a')).toBe('https://example.org/a');
  });

  test('structural params never reach the URL', () => {
    expect(hrefWithParams('https://example.org/a', [
      ['region', 'modal'], ['if-logged-in', ''], ['requires-write', ''],
    ])).toBe('https://example.org/a');
  });

  test('a structural param does not suppress a real one', () => {
    expect(hrefWithParams('https://example.org/a', [['if-logged-in', ''], ['time', 'local']]))
      .toBe('https://example.org/a?time=local');
  });

  test('empty value emits a bare flag, not key=', () => {
    expect(hrefWithParams('https://example.org/a', [['defer', '']]))
      .toBe('https://example.org/a?defer');
  });

  test('existing query is kept; a same-named key is replaced, not duplicated', () => {
    expect(hrefWithParams('https://example.org/a?keep=1&time=utc', [['time', 'local']]))
      .toBe('https://example.org/a?keep=1&time=local');
  });

  test('fragment is preserved after the query', () => {
    expect(hrefWithParams('https://example.org/a#frag', [['time', 'local']]))
      .toBe('https://example.org/a?time=local#frag');
  });

  test('relative hrefs (same-origin sol-include sources) survive', () => {
    expect(hrefWithParams('./dk-pod/dk/pages/x.html', [['view', 'wide']]))
      .toBe('./dk-pod/dk/pages/x.html?view=wide');
  });

  test('values are percent-encoded', () => {
    expect(hrefWithParams('https://example.org/a', [['q', 'a b&c']]))
      .toBe('https://example.org/a?q=a%20b%26c');
  });
});

describe('a ui:Link entry carries its params through the parse', () => {
  const store = storeFrom(`${PREFIXES}
:Menu a ui:Menu ; ui:label "M" ; schema:itemListElement :W .
:W a schema:ListItem ; schema:item :L ; schema:position 1 .
:L a ui:Plugin ; schema:additionalType ui:Link ; ui:label "L" ;
   schema:url <https://example.org/a> ;
   schema:additionalProperty [ schema:name "time" ; schema:value "local" ] ,
                             [ schema:name "region" ; schema:value "modal" ] .
`);
  const [item] = parseMenuItems(store, sym(`${BASE}#Menu`));

  test('params survive, region is lifted to the structural field', () => {
    expect(item.type).toBe('link');
    expect(item.href).toBe('https://example.org/a');
    expect(item.region).toBe('modal');
    expect(item.params).toEqual([['time', 'local']]);
  });

  test('the parsed item renders to the merged URL', () => {
    expect(hrefWithParams(item.href, item.params)).toBe('https://example.org/a?time=local');
  });
});

describe('link params round-trip through the HTML shell', () => {
  const CURRENT = '<sol-tabs>\n  <!-- chrome:begin --><!-- chrome:end -->\n</sol-tabs>\n';
  const tabs = [
    { type: 'link', id: 'ext', name: 'Ext', region: 'tab',
      href: 'https://example.org/a', params: [['time', 'local'], ['defer', '']] },
  ];
  const { html } = generateShell({ tabs, bar: [], currentHtml: CURRENT });
  const out = extractFromHtml(html);

  test('params are written onto the anchor as data-attributes', () => {
    expect(html).toContain('data-time="local"');
    expect(html).toContain('data-defer');
  });

  test('the href itself stays clean — params merge at render, not at generate', () => {
    expect(html).toContain('href="https://example.org/a"');
  });

  test('harvest reads them back unchanged', () => {
    expect(out.tabs).toHaveLength(1);
    expect(out.tabs[0].type).toBe('link');
    expect(out.tabs[0].href).toBe('https://example.org/a');
    expect(out.tabs[0].region).toBe('tab');
    expect([...out.tabs[0].params].sort()).toEqual([['defer', ''], ['time', 'local']]);
  });
});

describe('renderLinkItem mounts the merged URL', () => {
  afterEach(() => { document.body.innerHTML = ''; });

  const ctx = () => ({ host: document.createElement('div'), baseUrl: 'http://link.test/x.js', sourceName: 'sol-tabs', embedClass: null });

  test('an external link becomes an iframe whose src carries the params', () => {
    const body = document.createElement('div');
    document.body.appendChild(body);
    renderLinkItem({ id: 'ext', name: 'Ext', href: 'https://example.org/a', contents: null,
      params: [['time', 'local']] }, ctx())(body);

    const frame = body.querySelector('iframe');
    expect(frame).not.toBeNull();
    expect(frame.getAttribute('src')).toBe('https://example.org/a?time=local');
  });

  test('a same-origin link becomes a sol-include whose source carries the params', () => {
    const body = document.createElement('div');
    document.body.appendChild(body);
    renderLinkItem({ id: 'loc', name: 'Loc', href: 'pages/x.html', contents: null,
      params: [['view', 'wide']] }, ctx())(body);

    const inc = body.querySelector('sol-include');
    expect(inc).not.toBeNull();
    expect(inc.getAttribute('source')).toBe('pages/x.html?view=wide');
  });

  test('a tab-region link opens the merged URL (window.open, not an embed)', () => {
    // resolveRegion reads region= off the LAUNCHER's closest [region] ancestor.
    const body = document.createElement('div');
    document.body.appendChild(body);
    const launcher = document.createElement('div');
    launcher.setAttribute('region', 'tab');
    document.body.appendChild(launcher);
    const orig = window.open;
    const calls = [];
    window.open = (...args) => { calls.push(args); return null; };
    try {
      renderLinkItem({ id: 'ext2', name: 'Ext2', href: 'https://example.org/a', contents: null,
        params: [['time', 'local'], ['defer', '']] },
      { ...ctx(), host: launcher })(body);
      expect(calls).toEqual([['https://example.org/a?time=local&defer', '_blank', '']]);
      expect(body.querySelector('iframe')).toBeNull();   // opened, not embedded
    } finally { window.open = orig; }
  });

  test('a param-less link is byte-identical to before — existing links unaffected', () => {
    const body = document.createElement('div');
    document.body.appendChild(body);
    renderLinkItem({ id: 'plain', name: 'Plain', href: 'pages/x.html', contents: null }, ctx())(body);
    expect(body.querySelector('sol-include').getAttribute('source')).toBe('pages/x.html');
  });
});

describe('ui:Command params stay an args object', () => {
  const store = storeFrom(`${PREFIXES}
:Menu a ui:Menu ; ui:label "M" ; schema:itemListElement :W .
:W a schema:ListItem ; schema:item :C ; schema:position 1 .
:C a ui:Plugin ; schema:additionalType ui:Command ; ui:label "C" ;
   schema:url <http://link.test/commands.ttl#restart> ;
   schema:additionalProperty [ schema:name "scope" ; schema:value "app" ] ,
                             [ schema:name "force" ; schema:value "" ] .
`);
  const [item] = parseMenuItems(store, sym(`${BASE}#Menu`));

  test('a Command entry parses with its params', () => {
    expect(item.type).toBe('component');
    expect(item.tag).toBe('restart');
    expect([...item.params].sort()).toEqual([['force', ''], ['scope', 'app']]);
  });

  test('dispatchCommand delivers them as detail.params', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    let detail = null;
    document.addEventListener('sol-command', (e) => { detail = e.detail; }, { once: true });

    dispatchCommand(host, item.tag, paramsToObject(item.params), {});

    expect(detail).not.toBeNull();
    expect(detail.command).toBe('restart');
    expect(detail.params).toEqual({ scope: 'app', force: '' });
  });
});
