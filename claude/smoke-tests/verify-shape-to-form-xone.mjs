// Stage-6 smoke (plugin-manifest-unification): parseShape's sh:xone support
// against the REAL shapes/ui.shacl with real rdflib. The jest rdflib mock
// can't parse nested blank-node lists, so — like verify-plugin-entry-refs —
// this contract runs here instead:
//   - every kind surfaces the SAME single schema:url payload field, with
//     the branch's own sh:pattern carried (module filename / fragment key)
//   - payload fields sit right after the label field and carry fromXone
//   - without subject/dataStore ctx the xone contributes nothing
//   - the top-level kind discriminator (schema:additionalType, sh:in) still
//     parses as an enum field exactly once
// Run from sc root: node claude/smoke-tests/verify-shape-to-form-xone.mjs
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rdf } from '../../core/rdf.js';
import { parseShape } from '../../core/shape-to-form.js';

const here = dirname(fileURLToPath(import.meta.url));
const shapeText = readFileSync(join(here, '..', '..', 'shapes', 'ui.shacl'), 'utf8');
const SHAPE_URI = 'https://pod.example/shapes/ui.shacl';

const CAT = 'https://pod.example/ui-data/catalog.ttl';
const DATA = `
@prefix ui:     <http://www.w3.org/ns/ui#> .
@prefix schema: <http://schema.org/> .

<#Penny> a ui:Plugin ; schema:additionalType ui:Link ;
  ui:label "Penny" ; schema:url <https://penny.example/> .
<#Clock> a ui:Plugin ; schema:additionalType ui:Component ;
  ui:label "Clock" ; schema:url <https://pod.example/web/sol-clock.js> .
<#Restart> a ui:Plugin ; schema:additionalType ui:Command ;
  ui:label "Restart" ; schema:url <https://pod.example/ui-data/commands.ttl#restartApp> .
<#Mystery> a ui:Plugin ; ui:label "No kind yet" .
`;

const dataStore = rdf.graph();
rdf.parse(DATA, dataStore, CAT, 'text/turtle');

let fails = 0;
const check = (label, ok, detail = '') => {
  console.log(`${ok ? '✔' : '✘'} ${label}${detail ? ' — ' + detail : ''}`);
  if (!ok) fails += 1;
};

async function fieldsFor(frag) {
  const { properties } = await parseShape(shapeText, SHAPE_URI, {
    dataStore, subject: rdf.sym(`${CAT}#${frag}`),
  });
  return properties;
}

// Link → href, no module/name
{
  const props = await fieldsFor('Penny');
  const keys = props.map(p => p.key);
  check('Link entry surfaces its schema:url payload', keys.includes('url'), keys.join(','));
  check('exactly ONE url field', keys.filter(k => k === 'url').length === 1);
  const at = keys.indexOf('label');
  check('payload sits right after label', keys[at + 1] === 'url', keys.join(','));
  const link = props.find(p => p.key === 'url');
  check('payload is flagged fromXone', link?.fromXone === true);
  check('Link url carries NO module pattern', !link?.pattern);
}

// Component → module with pattern
{
  const props = await fieldsFor('Clock');
  const keys = props.map(p => p.key);
  check('Component entry surfaces its schema:url payload', keys.includes('url'), keys.join(','));
  check('exactly ONE url field', keys.filter(k => k === 'url').length === 1);
  const mod = props.find(p => p.key === 'url');
  check('Component url carries the module sh:pattern', typeof mod?.pattern === 'string' && mod.pattern.includes('esm|'), mod?.pattern || '(none)');
}

// Command → name
{
  const props = await fieldsFor('Restart');
  const keys = props.map(p => p.key);
  check('Command entry surfaces its schema:url payload', keys.includes('url'), keys.join(','));
  const cmd = props.find(p => p.key === 'url');
  check('Command url carries the fragment-key sh:pattern', typeof cmd?.pattern === 'string' && cmd.pattern.includes('#[A-Za-z]'), cmd?.pattern || '(none)');
}

// An entry with NO kind yet still gets :PluginShape (rdf:type match) but no
// branch matches → no payload fields; the kind enum field is there to pick.
{
  const props = await fieldsFor('Mystery');
  const keys = props.map(p => p.key);
  check('kind-less entry gets no payload field', !keys.includes('url'), keys.join(','));
  const kinds = props.filter(p => p.key === 'additionalType');
  check('kind discriminator parses once as an enum', kinds.length === 1 && !!kinds[0].enumOpts);
}

console.log(fails ? `\nFAILED: ${fails}` : '\nALL CHECKS PASSED');
process.exit(fails ? 1 : 0);
