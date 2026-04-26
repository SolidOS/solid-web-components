import { drawForceGraph } from './d3-force.js';

const LABEL_KEYS = new Set([
  'http://xmlns.com/foaf/0.1/name', 'https://schema.org/name',
  'http://www.w3.org/2000/01/rdf-schema#label',
  'http://purl.org/dc/elements/1.1/title',
  'name', 'label', 'title',
]);

export async function renderJsonLd(content, outputEl) {
  let data;
  try { data = JSON.parse(content); } catch (e) { throw new Error(`JSON parse error: ${e.message}`); }

  const resources = data['@graph'] || (data['@id'] ? [data] : [data]);
  const nodes = new Map();
  const links = [];
  const shortKey = k => k.split(/[/#:]/).pop() || k;

  // All declared subject IRIs — used to detect plain-string IRI references
  // (valid in JSON-LD when @type:@id is set in @context)
  const allIds = new Set(resources.map(r => r['@id']).filter(Boolean));

  resources.forEach(res => {
    const id = res['@id'] || ('_:' + Math.random().toString(36).slice(2));
    if (!nodes.has(id)) nodes.set(id, { id, label: shortKey(id) || 'blank', displayLabel: null, properties: [] });
    const node = nodes.get(id);

    Object.entries(res).forEach(([key, val]) => {
      if (key.startsWith('@')) return;
      const isLabel = LABEL_KEYS.has(key);
      const vals = Array.isArray(val) ? val : [val];

      vals.forEach(item => {
        if (typeof item === 'object' && item !== null && item['@id']) {
          const tid = item['@id'];
          if (!nodes.has(tid)) nodes.set(tid, { id: tid, label: shortKey(tid), displayLabel: null, properties: [] });
          links.push({ source: id, target: tid, label: shortKey(key) });
        } else if (typeof item === 'string') {
          if (!isLabel && allIds.has(item)) {
            // String value is an IRI referencing another resource in the graph
            if (!nodes.has(item)) nodes.set(item, { id: item, label: shortKey(item), displayLabel: null, properties: [] });
            links.push({ source: id, target: item, label: shortKey(key) });
          } else if (isLabel && !node.displayLabel) {
            node.displayLabel = item;
          } else {
            node.properties.push(`${shortKey(key)}: ${item}`);
          }
        } else if (typeof item === 'object' && item !== null && item['@value']) {
          const v = String(item['@value']);
          if (isLabel && !node.displayLabel) node.displayLabel = v;
          else node.properties.push(`${shortKey(key)}: ${v}`);
        }
      });
    });
  });

  if (nodes.size === 0) {
    outputEl.innerHTML = '<p style="padding:1rem;color:#888">No resources found. Document needs @graph or @id.</p>';
    return;
  }

  await drawForceGraph(outputEl, { nodes: [...nodes.values()], links });
}
