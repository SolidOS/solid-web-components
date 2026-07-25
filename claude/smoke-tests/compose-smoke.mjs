// Smoke: composeLayoutTurtle → parse → generateAppHtml for representative
// combos. Verifies the composed layout parses and compiles to the expected
// landmark elements with no stale schema:WP* marks.
//   node claude/smoke-tests/compose-smoke.mjs   (from the sol-components root)
import { Parser } from 'n3';
import { rdf } from '../../core/rdf.js';
import { generateAppHtml, parseLayoutTree } from '../../core/layout-generate.js';
import { composeLayoutTurtle } from '../../core/layout-compose.js';

const BASE = 'http://compose.test/layout.ttl';
function storeOf(text) {
  const g = rdf.graph();
  const conv = (t) => t.termType === 'Literal' ? rdf.literal(t.value)
    : rdf.sym(t.termType === 'BlankNode' ? `_:${t.value}` : t.value);
  for (const q of new Parser({ baseIRI: BASE }).parse(text)) g.add(conv(q.subject), conv(q.predicate), conv(q.object));
  return g;
}

const combos = [
  { name: 'none + header menu + hamburger', o: { sidebars: 'none', menuLocation: 'header', hamburger: true }, want: ['<header', '<main'], notWant: ['<aside', '<footer'] },
  { name: 'left content + under-header menu', o: { sidebars: 'left', menuLocation: 'under-header', hamburger: false }, want: ['<header', '<nav', '<aside', '<main'], notWant: ['<footer'] },
  { name: 'both + footer + hamburger + left-sidebar menu', o: { sidebars: 'both', footer: true, menuLocation: 'left-sidebar', hamburger: true }, want: ['<header', '<aside', '<main', '<footer'], notWant: [] },
  { name: 'right-sidebar menu, no content sidebars', o: { sidebars: 'none', menuLocation: 'right-sidebar', hamburger: true }, want: ['<header', '<aside', '<main'], notWant: [] },
];

let fail = 0;
for (const c of combos) {
  const ttl = composeLayoutTurtle(c.o);
  if (/schema:WP|WPHeader|WPSideBar|WPFooter/.test(ttl)) { console.log(`✗ ${c.name}: stale WP* in TTL`); fail++; continue; }
  const store = storeOf(ttl);
  let html;
  try {
    html = generateAppHtml({ store, layoutNode: rdf.sym(`${BASE}#Layout`), app: { title: 'T' }, warn: () => {} });
  } catch (e) { console.log(`✗ ${c.name}: compile threw ${e.message}`); fail++; continue; }
  const miss = c.want.filter((t) => !html.includes(t));
  const bad = c.notWant.filter((t) => html.includes(t));
  const menuTargetsMain = html.includes('region=".app-main"');
  if (miss.length || bad.length || !menuTargetsMain) {
    console.log(`✗ ${c.name}: missing ${miss} unexpected ${bad} menu→main=${menuTargetsMain}`);
    fail++;
  } else {
    console.log(`✓ ${c.name}`);
  }
  // parse sanity: every region node resolves and has a role
  const tree = parseLayoutTree(store, rdf.sym(`${BASE}#Layout`));
  (function walk(n) { if (n.kind === 'region') { if (!n.role) { console.log(`  ! region ${n.node.value} has no role`); fail++; } n.parts.forEach(walk); } })(tree);
}
console.log(fail ? `\n${fail} FAILURES` : '\nAll compose smoke checks passed');
process.exit(fail ? 1 : 0);
