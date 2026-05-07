import { termText, appendCell } from './_helpers.js';

export function render(container, data, host, options = {}) {
  const { hideHeader, mkBnodeLink } = options;
  const vars     = data.head.vars;
  const bindings = data.results.bindings;
  const dl       = document.createElement('dl');
  const flat     = !!hideHeader;
  const nameVar  = flat ? null : vars[0];
  const restVars = flat ? vars : vars.slice(1);

  bindings.forEach(row => {
    if (nameVar) {
      const dt = document.createElement('dt');
      const nameCell = row[nameVar];
      dt.textContent = termText(nameCell);
      if (nameCell?.type === 'uri') dt.title = nameCell.value;
      dl.appendChild(dt);
    }

    restVars.forEach(v => {
      const dd = document.createElement('dd');
      const label = document.createElement('span');
      label.className = 'dl-field';
      label.textContent = `${v} `;
      dd.appendChild(label);

      const valueSpan = document.createElement('span');
      valueSpan.className = 'dl-value';
      appendCell(valueSpan, row[v], mkBnodeLink);
      dd.appendChild(valueSpan);

      dl.appendChild(dd);
    });
  });

  container.appendChild(dl);
}
