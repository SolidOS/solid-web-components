import { render as renderTable } from './table.js';
import { appendCell } from './_helpers.js';

export function render(container, data, host, options = {}) {
  if (data.vars.length > 1) return renderTable(container, data, host, options);

  const { mkBnodeLink } = options;
  const col = data.vars[0];
  const ul = document.createElement('ul');
  ul.className = 'result-list';
  data.results.forEach(row => {
    const li = document.createElement('li');
    appendCell(li, row[col], mkBnodeLink);
    ul.appendChild(li);
  });
  container.appendChild(ul);
}
