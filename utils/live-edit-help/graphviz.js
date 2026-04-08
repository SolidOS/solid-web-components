export const graphvizHelp = {
  title: 'Graphviz DOT Reference',
  sections: [
    {
      heading: 'Graph Types',
      items: [
        { title: 'Directed graph', description: 'Arrows show direction.', code: `digraph {\n  Amara -> Kenji;\n  Kenji -> Priya;\n}` },
        { title: 'Undirected graph', description: 'Lines with no direction.', code: `graph {\n  Lagos -- Nairobi;\n  Nairobi -- Addis_Ababa;\n}` }
      ]
    },
    {
      heading: 'Node Attributes',
      items: [
        { title: 'Label and shape', description: 'Custom text and shape per node.', code: `digraph {\n  A [label="Amara\\nLagos", shape=ellipse];\n  B [label="Kenji\\nOsaka", shape=box];\n  A -> B;\n}` },
        { title: 'Common shapes', description: 'box, circle, ellipse, diamond, triangle, plaintext.', code: `A [shape=box];\nB [shape=diamond];\nC [shape=circle];` }
      ]
    },
    {
      heading: 'Edge Attributes',
      items: [
        { title: 'Labels and styles', description: 'Annotate and style edges.', code: `Amara -> Diego [label="mentors", style=dashed];\nDiego -> Nadia [label="reports to", color=blue];` }
      ]
    },
    {
      heading: 'Graph Attributes',
      items: [
        { title: 'Global defaults', description: 'Set style for all nodes or edges at once.', code: `digraph {\n  graph [rankdir=LR, bgcolor=transparent];\n  node  [shape=ellipse, style=filled, fillcolor=lightyellow];\n  edge  [fontsize=10];\n  Lagos -> Mumbai -> Seoul;\n}` }
      ]
    },
    {
      heading: 'Subgraphs',
      items: [
        {
          title: 'Clusters',
          description: 'Group nodes with a named subgraph (prefix "cluster_").',
          code: `digraph {\n  subgraph cluster_africa {\n    label="Africa";\n    Lagos; Nairobi; Addis_Ababa;\n  }\n  subgraph cluster_asia {\n    label="Asia";\n    Mumbai; Seoul; Jakarta;\n  }\n  Lagos -> Mumbai;\n}`
        }
      ]
    }
  ]
};
