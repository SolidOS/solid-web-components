import { adopt } from '../shared/adopt.js';
import { CSS as ROLODEX_CSS, sheet as ROLODEX_SHEET } from '../styles/view-rolodex-css.js';

/**
 * Built-in view renderer for sol-query — "rolodex".
 * Shows one result row at a time as a card, with prev/next buttons and an
 * "N of M" counter. Each field (column) becomes a labelled line inside the
 * card. Arrow keys navigate when the card has focus.
 *
 * Navigation wraps around at both ends. Clicking a card dispatches a
 * 'sol-select' event with { value, row, index } on the host element.
 *
 * Usage: <sol-query view="rolodex" endpoint="…"></sol-query>
 */
export async function render(container, data, host) {
  const { vars, results } = data;
  if (!results?.length) {
    container.textContent = 'No results';
    return;
  }

  const shortUri = v => v.replace(/.*[/#]([^/#]+)\/?$/, '$1') || v;

  const renderCellInto = (parent, cell) => {
    if (!cell) return;
    if (cell.type === 'multi') {
      cell.values.forEach((v, i) => {
        if (i > 0) parent.appendChild(document.createTextNode(', '));
        renderCellInto(parent, v);
      });
      return;
    }
    if (cell.type === 'uri') {
      const a = document.createElement('a');
      a.href = cell.value;
      a.textContent = shortUri(cell.value);
      a.title = cell.value;
      a.dataset.uri = cell.value;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      parent.appendChild(a);
    } else {
      parent.appendChild(document.createTextNode(cell.value ?? ''));
    }
  };

  const wrapper = document.createElement('div');
  wrapper.className = 'sol-view-rolodex';
  wrapper.tabIndex = 0;

  const nav = document.createElement('div');
  nav.className = 'rolodex-nav';

  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'sol-btn sol-btn-icon rolodex-btn';
  prevBtn.setAttribute('aria-label', 'Previous record');
  prevBtn.textContent = '‹';

  const counter = document.createElement('span');
  counter.className = 'rolodex-counter';
  counter.setAttribute('aria-live', 'polite');

  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'sol-btn sol-btn-icon rolodex-btn';
  nextBtn.setAttribute('aria-label', 'Next record');
  nextBtn.textContent = '›';

  nav.appendChild(prevBtn);
  nav.appendChild(counter);
  nav.appendChild(nextBtn);

  const card = document.createElement('div');
  card.className = 'rolodex-card';

  wrapper.appendChild(nav);
  wrapper.appendChild(card);

  let index = 0;

  const show = i => {
    index = ((i % results.length) + results.length) % results.length;
    const row = results[index];

    card.innerHTML = '';
    const dl = document.createElement('dl');
    vars.forEach(v => {
      const cell = row[v];
      if (!cell) return;
      const dt = document.createElement('dt');
      dt.textContent = v;
      const dd = document.createElement('dd');
      renderCellInto(dd, cell);
      dl.appendChild(dt);
      dl.appendChild(dd);
    });
    card.appendChild(dl);
    counter.textContent = `${index + 1} of ${results.length}`;
  };

  prevBtn.addEventListener('click', () => show(index - 1));
  nextBtn.addEventListener('click', () => show(index + 1));

  wrapper.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); show(index - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
  });

  card.addEventListener('click', e => {
    if (e.target.closest('a')) return;
    const row = results[index];
    const lastVar = vars[vars.length - 1];
    const cell = row[lastVar];
    host?.dispatchEvent(new CustomEvent('sol-select', {
      bubbles: true, composed: true,
      detail: { value: cell?.value ?? '', row, index },
    }));
  });

  show(0);

  adopt(container.getRootNode(), { sheet: ROLODEX_SHEET, css: ROLODEX_CSS });
  container.appendChild(wrapper);
}
