// Shared D3 force-directed graph renderer used by turtle and jsonld renderers.

/**
 * Draw a force-directed graph into `container`.
 * @param {Element} container  — DOM element to render into
 * @param {{ nodes: Array, links: Array }} graphData
 *   nodes: [{ id, label, displayLabel?, properties? }]
 *   links: [{ source, target, label }]
 */
export async function drawForceGraph(container, graphData) {
  const d3 = await import('https://esm.sh/d3@7');

  container.innerHTML = '';
  const width  = container.clientWidth  || 700;
  const height = container.clientHeight || 480;

  const svg = d3.select(container)
    .append('svg')
    .attr('width', width).attr('height', height)
    .attr('viewBox', [0, 0, width, height])
    .style('width', '100%').style('height', '100%');

  svg.append('defs').append('marker')
    .attr('id', 'arr').attr('viewBox', '-0 -5 10 10')
    .attr('refX', 26).attr('refY', 0)
    .attr('orient', 'auto').attr('markerWidth', 6).attr('markerHeight', 6)
    .append('path').attr('d', 'M0,-5L10,0L0,5').attr('fill', '#95a5a6');

  // Resolve string ids → node objects for d3 links
  const nodeById = new Map(graphData.nodes.map(n => [n.id, n]));
  const links = graphData.links.map(l => ({
    ...l,
    source: nodeById.get(l.source) || l.source,
    target: nodeById.get(l.target) || l.target,
  }));

  const sim = d3.forceSimulation(graphData.nodes)
    .force('link',      d3.forceLink(links).id(d => d.id).distance(140))
    .force('charge',    d3.forceManyBody().strength(-380))
    .force('center',    d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide(38));

  const linkG = svg.append('g').attr('fill', 'none').attr('stroke', '#95a5a6').attr('stroke-width', 1.5);
  const linkEl = linkG.selectAll('line').data(links).join('line')
    .attr('marker-end', 'url(#arr)');

  const linkLabel = svg.append('g').selectAll('text').data(links).join('text')
    .attr('font-size', 9).attr('fill', '#999').attr('text-anchor', 'middle')
    .text(d => d.label);

  const nodeG = svg.append('g');
  const nodeEl = nodeG.selectAll('g').data(graphData.nodes).join('g')
    .attr('class', 'node')
    .call(d3.drag()
      .on('start', (ev) => { if (!ev.active) sim.alphaTarget(0.3).restart(); ev.subject.fx = ev.subject.x; ev.subject.fy = ev.subject.y; })
      .on('drag',  (ev) => { ev.subject.fx = ev.x; ev.subject.fy = ev.y; })
      .on('end',   (ev) => { if (!ev.active) sim.alphaTarget(0); ev.subject.fx = null; ev.subject.fy = null; }));

  nodeEl.append('circle').attr('r', 20).attr('fill', '#4a9eff').attr('fill-opacity', 0.8).attr('stroke', '#fff').attr('stroke-width', 2);

  nodeEl.append('text').attr('dy', 34).attr('text-anchor', 'middle').attr('font-size', 11)
    .each(function(d) {
      const t = d3.select(this);
      const label = d.displayLabel || d.label;
      t.append('tspan').attr('x', 0).attr('font-weight', d.displayLabel ? 'bold' : 'normal').text(label);
      (d.properties || []).slice(0, 2).forEach((p, i) => {
        t.append('tspan').attr('x', 0).attr('dy', '1.1em').attr('font-size', 9).attr('fill', '#888').text(p);
      });
    });

  sim.on('tick', () => {
    linkEl.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    linkLabel
      .attr('x', d => (d.source.x + d.target.x) / 2)
      .attr('y', d => (d.source.y + d.target.y) / 2);
    nodeEl.attr('transform', d => `translate(${d.x},${d.y})`);
  });

  return () => sim.stop();
}
