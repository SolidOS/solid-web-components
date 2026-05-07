export async function renderMarkdown(content, outputEl) {
  const { marked } = await import('marked');

  marked.setOptions({ gfm: true, breaks: false });
  const html = marked.parse(content);

  outputEl.innerHTML = '';
  const wrapper = document.createElement('div');
  wrapper.className = 'sle-md-preview';
  wrapper.innerHTML = html;

  // Make links open in a new tab safely
  wrapper.querySelectorAll('a').forEach(a => {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  });

  outputEl.appendChild(wrapper);
}
