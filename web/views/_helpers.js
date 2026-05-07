// Cell-rendering helpers shared across view renderers.

export function mkLink(val) {
  const a = document.createElement('a');
  a.href = val.value;
  a.textContent = val.value.replace(/.*[/#]([^/#]+)\/?$/, '$1') || val.value;
  a.title = val.value;
  a.dataset.uri = val.value;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  return a;
}

export function termText(val) {
  if (!val) return '';
  if (val.type === 'uri') return val.value.replace(/.*[/#]([^/#]+)\/?$/, '$1') || val.value;
  return val.value;
}

export function appendCell(parent, cell, mkBnodeLink) {
  if (!cell) { parent.appendChild(document.createTextNode('')); return; }
  if (cell.type === 'multi') {
    cell.values.forEach((v, i) => {
      if (i > 0) parent.appendChild(document.createTextNode(', '));
      appendCell(parent, v, mkBnodeLink);
    });
  } else if (cell.type === 'bnode' && mkBnodeLink) {
    parent.appendChild(mkBnodeLink(cell));
  } else if (cell.type === 'uri') {
    parent.appendChild(mkLink(cell));
  } else {
    parent.appendChild(document.createTextNode(cell.value ?? ''));
  }
}
