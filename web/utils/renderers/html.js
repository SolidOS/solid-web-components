export function renderHtml(content, outputEl) {
  outputEl.innerHTML = '';
  const iframe = document.createElement('iframe');
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
  iframe.setAttribute('title', 'HTML preview');
  iframe.style.cssText = 'width:100%;height:100%;border:0;display:block';
  outputEl.appendChild(iframe);
  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open(); doc.write(content); doc.close();
}
