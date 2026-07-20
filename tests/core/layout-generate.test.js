/**
 * core/layout-generate.js — compile a ui:Layout tree into the standalone
 * app page (readable index.html + app.css). Covered here:
 *   - classic-shell preset → nav/main structure, visible from-rdf/module
 *     attributes, sol-load data-components derivation
 *   - componentsBase override reaches both links and the loader tag
 *   - dashboard-grid → app-grid-N class + generated grid CSS
 *   - foreign (non sol-*) leaf → its own <script type="module"> and no
 *     data-components token
 *   - attribute escaping
 *   - menuSourcesIn / seedAppMenu helpers
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Parser } from 'n3';
import { rdf } from '../../core/rdf.js';
import {
  generateAppHtml,
  generateAppCss,
  parseLayoutTree,
  menuSourcesIn,
  seedAppMenu,
} from '../../core/layout-generate.js';

const here = dirname(fileURLToPath(import.meta.url));
const layoutsDir = join(here, '..', '..', 'data', 'layouts');

const BASE = 'http://layout.test/layout.ttl';

// Jest maps rdflib to a minimal mock whose turtle tokenizer has no blank
// nodes, so parse real Turtle with n3 and feed the quads into the mock store
// (term matching is by .value; membership arrives as plain
// schema:itemListElement wrapper triples, the walk path menuMembers handles).
function parseInto(text, base) {
  const g = rdf.graph();
  const conv = (t) =>
    t.termType === 'Literal' ? rdf.literal(t.value)
      : rdf.sym(t.termType === 'BlankNode' ? `_:${t.value}` : t.value);
  for (const q of new Parser({ baseIRI: base }).parse(text)) {
    g.add(conv(q.subject), conv(q.predicate), conv(q.object));
  }
  return g;
}

function loadLayout(file, base = BASE) {
  const store = parseInto(readFileSync(join(layoutsDir, file), 'utf8'), base);
  return { store, layoutNode: rdf.sym(`${base}#Layout`) };
}

test('classic shell emits the nav + main skeleton with visible sources', () => {
  const { store, layoutNode } = loadLayout('classic-shell.ttl');
  const html = generateAppHtml({ store, layoutNode, app: { title: 'My App', icon: '🍳' } });

  expect(html).toContain('<nav class="app-chrome-bar app-row" aria-label="Controls">');
  expect(html).toMatch(/<sol-login[\s\S]*?><\/sol-login>/);
  expect(html).toContain('<main class="app-panels app-col">');
  expect(html).toMatch(/<sol-tabs[\s\S]*?keep-alive[\s\S]*?from-rdf="app-menu\.ttl#Tabs"[\s\S]*?><\/sol-tabs>/);
  // the leaf's rdfs:comment round-trips as an HTML comment
  expect(html).toContain('<!-- The whole app body: a tabset built from the app\'s own menu doc -->');
  expect(html).toContain('<title>My App</title>');
  // one loader tag; sol-tabs/sol-include are sol-basic, sol-login is extra
  expect(html).toMatch(/sol-load\.js"\n\s+data-components="sol-basic sol-login">/);
  expect(html).toContain('href="/node_modules/sol-components/web/styles/root.css"');
  expect(html).toContain('<link rel="stylesheet" href="app.css">');
  // emoji icon → svg data-URL favicon
  expect(html).toMatch(/<link rel="icon" href="data:image\/svg\+xml,/);
  // body carries the root's structural class
  expect(html).toContain('<body class="app-col">');
});

test('componentsBase override reaches stylesheet and loader', () => {
  const { store, layoutNode } = loadLayout('classic-shell.ttl');
  const cdn = 'https://cdn.jsdelivr.net/npm/sol-components@2';
  const html = generateAppHtml({ store, layoutNode, componentsBase: cdn });
  expect(html).toContain(`href="${cdn}/web/styles/root.css"`);
  expect(html).toContain(`src="${cdn}/web/sol-load.js"`);
});

test('dashboard grid emits app-grid-2 markup and CSS', () => {
  const { store, layoutNode } = loadLayout('dashboard-grid.ttl');
  const html = generateAppHtml({ store, layoutNode });
  // :Main is the root's first unmarked layout child → <main>, grid class
  expect(html).toContain('<main class="app-widgets app-grid-2">');
  expect(html).toContain('<header class="app-header app-row">');
  expect(html).toMatch(/data-components="sol-basic sol-time sol-calendar"/);

  const css = generateAppCss(store, layoutNode);
  expect(css).toContain('.app-grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));');
  // scaffolding: page never scrolls, the pane does
  expect(css).toContain('body { margin: 0; min-height: 100dvh; overflow: hidden; }');
  expect(css).toContain('main { flex: 1 1 auto; min-height: 0; overflow: auto; }');
});

test('sidebar: aside emits, empty main is a placeholder pane', () => {
  const { store, layoutNode } = loadLayout('sidebar.ttl');
  const html = generateAppHtml({ store, layoutNode });
  expect(html).toContain('<aside class="app-side app-col">');
  expect(html).toMatch(/<sol-menu[\s\S]*?from-rdf="app-menu\.ttl#Menu"[\s\S]*?region="\.app-main"/);
  expect(html).toMatch(/<main class="app-main app-col">\s*<\/main>/);
});

test('a foreign (non sol-*) leaf loads via its own visible module script', () => {
  const g = parseInto(`
@prefix : <#> .
@prefix ui: <http://www.w3.org/ns/ui#> .
@prefix schema: <http://schema.org/> .
:Layout a ui:Layout ; schema:itemListElement :Layout-Main .
:Layout-Main a schema:ListItem ; schema:item :Main ; schema:position 1 .
:Main a ui:Layout ; schema:itemListElement :Main-player .
:Main-player a schema:ListItem ; schema:item :player ; schema:position 1 .
:player a ui:Component ; ui:label "Player" ;
  schema:url <https://example.org/dist/ia-player.esm.js> ;
  ui:attribute [ schema:name "source" ; schema:value "lib.ttl" ] .
`, BASE);
  const html = generateAppHtml({ store: g, layoutNode: rdf.sym(`${BASE}#Layout`) });
  expect(html).toContain('<script type="module" src="https://example.org/dist/ia-player.esm.js"></script>');
  expect(html).toMatch(/<ia-player[\s\S]*?source="lib\.ttl"[\s\S]*?><\/ia-player>/);
  expect(html).toMatch(/data-components="sol-basic">/);
});

test('attribute values are escaped in emitted markup', () => {
  const g = parseInto(`
@prefix : <#> .
@prefix ui: <http://www.w3.org/ns/ui#> .
@prefix schema: <http://schema.org/> .
:Layout a ui:Layout ; schema:itemListElement :Layout-Main .
:Layout-Main a schema:ListItem ; schema:item :Main ; schema:position 1 .
:Main a ui:Layout ;
  ui:attribute [ schema:name "aria-label" ; schema:value "Tom & \\"Jerry\\" <3" ] .
`, BASE);
  const html = generateAppHtml({ store: g, layoutNode: rdf.sym(`${BASE}#Layout`) });
  expect(html).toContain('aria-label="Tom &amp; &quot;Jerry&quot; &lt;3"');
});

test('menuSourcesIn finds every from-rdf the layout consumes', () => {
  const classic = loadLayout('classic-shell.ttl');
  expect(menuSourcesIn(parseLayoutTree(classic.store, classic.layoutNode)))
    .toEqual(['app-menu.ttl#Tabs']);
  const sidebar = loadLayout('sidebar.ttl');
  expect(menuSourcesIn(parseLayoutTree(sidebar.store, sidebar.layoutNode)))
    .toEqual(['app-menu.ttl#Menu']);
});

test('seedAppMenu emits a parseable newborn menu doc', () => {
  const ttl = seedAppMenu({ label: 'Menu', fragment: 'Menu', orientation: 'Vertical' });
  const g = parseInto(ttl, 'http://layout.test/app-menu.ttl');
  const menu = rdf.sym('http://layout.test/app-menu.ttl#Menu');
  const UI = 'http://www.w3.org/ns/ui#';
  expect(g.any(menu, rdf.sym(`${UI}label`)).value).toBe('Menu');
  expect(g.any(menu, rdf.sym(`${UI}orientation`)).value).toBe(`${UI}Vertical`);
  // a newborn menu has NO membership triples yet — members arrive as
  // positioned wrappers when the managers add them
  expect(g.any(menu, rdf.sym('http://schema.org/itemListElement'))).toBeFalsy();
});
