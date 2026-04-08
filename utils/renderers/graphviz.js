export async function renderGraphviz(content, outputEl) {
  const resp = await fetch('https://kroki.io/graphviz/svg', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ diagram_source: content }),
  });
  if (!resp.ok) throw new Error(`Graphviz render failed: ${resp.statusText}`);
  const svg = await resp.text();
  outputEl.innerHTML = svg;
  // Ensure SVG fills the container
  const svgEl = outputEl.querySelector('svg');
  if (svgEl) { svgEl.style.maxWidth = '100%'; svgEl.style.height = 'auto'; }
}
