export function render(data) {
  const dl       = document.createElement('dl');
  const nameVar  = data.vars[0];
  const restVars = data.vars.slice(1);

  const appendCell = (parent, cell) => {
    if (cell?.type === 'multi') {
      cell.values.forEach((cv, i) => {
        if (i > 0) parent.appendChild(document.createTextNode(', '));
        if (cv.type === 'uri')        parent.appendChild(this._mkLink(cv));
        else if (cv.type === 'bnode') parent.appendChild(this._mkBnodeLink(cv));
        else parent.appendChild(document.createTextNode(cv.value ?? ''));
      });
    } else if (cell?.type === 'bnode') {
      parent.appendChild(this._mkBnodeLink(cell));
    } else if (cell?.type === 'uri') {
      parent.appendChild(this._mkLink(cell));
    } else {
      parent.appendChild(document.createTextNode(cell ? cell.value : ''));
    }
  };

  data.results.forEach(row => {
    const dt = document.createElement('dt');
    const nameCell = row[nameVar];
    dt.textContent = this._termText(nameCell);
    if (nameCell?.type === 'uri') dt.title = nameCell.value;
    dl.appendChild(dt);

    restVars.forEach(v => {
      const dd = document.createElement('dd');
      const label = document.createElement('span');
      label.className = 'dl-field';
      label.textContent = `${v} `;
      dd.appendChild(label);
      
      const valueSpan = document.createElement('span');
      valueSpan.className = 'dl-value';
      appendCell(valueSpan, row[v]);
      dd.appendChild(valueSpan);
      
      dl.appendChild(dd);
    });
  });
  return dl;
}
