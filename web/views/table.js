import { appendCell } from './_helpers.js';

export function render(container, data, host, options = {}) {
  const { hideHeader, mkBnodeLink } = options;
  const table = document.createElement('table');
  table.setAttribute('role', 'table');

  if (!hideHeader) {
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    tr.setAttribute('role', 'row');
    data.vars.forEach(v => {
      const th = document.createElement('th');
      th.setAttribute('role', 'columnheader');
      th.setAttribute('tabindex', '0');
      th.setAttribute('aria-sort', 'none');
      th.setAttribute('aria-label', `${v}, sortable column`);
      th.textContent = v;
      tr.appendChild(th);
    });
    thead.appendChild(tr);
    table.appendChild(thead);
  }

  const tbody = document.createElement('tbody');
  tbody.setAttribute('role', 'rowgroup');
  data.results.forEach(row => {
    const tr = document.createElement('tr');
    tr.setAttribute('role', 'row');
    data.vars.forEach(v => {
      const td = document.createElement('td');
      td.setAttribute('role', 'cell');
      appendCell(td, row[v], mkBnodeLink);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  if (!hideHeader) addSort(table);
  container.appendChild(table);
}

function addSort(table) {
  const ths = table.querySelectorAll('th');
  let col = -1, dir = 1;
  const doSort = (i) => {
    dir = col === i ? -dir : 1;
    col = i;
    ths.forEach((h, j) => {
      const active = j === i;
      const order  = active ? (dir > 0 ? 'asc' : 'desc') : '';
      h.setAttribute('data-sort', order);
      h.setAttribute('aria-sort', active ? (dir > 0 ? 'ascending' : 'descending') : 'none');
    });
    const tbody = table.querySelector('tbody');
    Array.from(tbody.querySelectorAll('tr'))
      .sort((a, b) => dir * (a.cells[i]?.textContent || '')
        .localeCompare(b.cells[i]?.textContent || '', undefined, { numeric: true, sensitivity: 'base' }))
      .forEach(r => tbody.appendChild(r));
  };
  ths.forEach((th, i) => {
    th.addEventListener('click', () => doSort(i));
    th.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        doSort(i);
      }
    });
  });
}
