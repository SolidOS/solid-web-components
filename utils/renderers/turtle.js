import { drawForceGraph } from './d3-force.js';
import { getRdflib } from '../../shared/rdf-utils.js';

export async function renderTurtle(content, outputEl) {
  let $rdf = await getRdflib();
  if (!$rdf) $rdf = await import('https://esm.sh/rdflib@2');

  const store = $rdf.graph();
  try {
    $rdf.parse(content, store, 'http://example.org/', 'text/turtle');
  } catch (e) {
    throw new Error(`Turtle parse error: ${e.message}`);
  }

  const labelPredicates = new Set([
    'http://www.w3.org/2000/01/rdf-schema#label',
    'http://xmlns.com/foaf/0.1/name',
    'http://www.w3.org/2004/02/skos/core#prefLabel',
    'http://purl.org/dc/elements/1.1/title',
    'http://purl.org/dc/terms/title',
    'https://schema.org/name',
  ]);

  const nodes = new Map();
  const links = [];

  const shortId = uri => uri.split(/[/#]/).pop() || uri;

  store.statements.forEach(({ subject: s, predicate: p, object: o }) => {
    if (!nodes.has(s.value)) nodes.set(s.value, { id: s.value, label: shortId(s.value), displayLabel: null, properties: [] });

    if (o.termType === 'NamedNode') {
      if (!nodes.has(o.value)) nodes.set(o.value, { id: o.value, label: shortId(o.value), displayLabel: null, properties: [] });
      links.push({ source: s.value, target: o.value, label: shortId(p.value) });
    } else if (o.termType === 'Literal') {
      const node = nodes.get(s.value);
      if (labelPredicates.has(p.value)) {
        node.displayLabel = o.value;
      } else {
        node.properties.push(`${shortId(p.value)}: ${o.value}`);
      }
    }
  });

  if (nodes.size === 0) {
    outputEl.innerHTML = '<p style="padding:1rem;color:#888">No triples to display.</p>';
    return;
  }

  await drawForceGraph(outputEl, { nodes: [...nodes.values()], links });
}
