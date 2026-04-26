let mermaidReady = false;
let _mermaid = null;

async function ensureMermaid() {
  if (mermaidReady) return _mermaid;
  const m = await import('https://esm.sh/mermaid@10');
  const mermaid = m.default || m.mermaid || m;
  mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });
  _mermaid = mermaid;
  mermaidReady = true;
  return mermaid;
}

export async function renderMermaid(content, outputEl) {
  const trimmed = content.trim();
  if (!trimmed) {
    outputEl.innerHTML = '<p style="padding:1rem;color:#888">Enter a Mermaid diagram above.</p>';
    return;
  }

  let mermaid;
  try {
    mermaid = await ensureMermaid();
  } catch (e) {
    outputEl.innerHTML = '<p style="padding:1rem;color:#c0392b">Failed to load Mermaid library.</p>';
    return;
  }

  const id = 'mmd-' + Date.now();
  try {
    const { svg } = await mermaid.render(id, trimmed);
    outputEl.innerHTML = svg;
  } catch (e) {
    // Mermaid leaves orphan elements on parse errors — clean up
    const orphan = document.getElementById('d' + id);
    if (orphan) orphan.remove();
    outputEl.innerHTML = `<pre style="padding:1rem;color:#c0392b;white-space:pre-wrap;font-size:.85em">Diagram error: ${
      (e.message || String(e)).replace(/<[^>]*>/g, '')
    }</pre>`;
  }
}
