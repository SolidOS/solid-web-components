import { render as renderTable } from './table.js';
import { appendCell } from './_helpers.js';

export function render(container, data, host, options = {}) {
  const vars     = data.head.vars;
  const bindings = data.results.bindings;
  if (vars.length > 1) return renderTable(container, data, host, options);

  const { mkBnodeLink } = options;
  const col = vars[0];
  const ul = document.createElement('ul');
  ul.className = 'result-list';
  bindings.forEach(row => {
    const li = document.createElement('li');
    appendCell(li, row[col], mkBnodeLink);
    ul.appendChild(li);
  });
  container.appendChild(ul);
}
