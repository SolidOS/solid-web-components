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
import {loadStyleRules} from '../shared/utils.js';

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
  prevBtn.className = 'rolodex-btn';
  prevBtn.setAttribute('aria-label', 'Previous record');
  prevBtn.textContent = '‹';

  const counter = document.createElement('span');
  counter.className = 'rolodex-counter';
  counter.setAttribute('aria-live', 'polite');

  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'rolodex-btn';
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

  const cssString = `
    .sol-view-rolodex {
      display: inline-block;
      min-width: 260px;
      max-width: 100%;
      outline: none;
    }
    .sol-view-rolodex:focus-visible .rolodex-card {
      box-shadow: 0 0 0 2px #4a9eff;
    }
    .rolodex-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: .5rem;
      margin-bottom: .4rem;
    }
    .rolodex-btn {
      padding: .25rem .6rem;
      font: inherit;
      font-size: 1.15em;
      line-height: 1;
      border: 1px solid #ccc;
      border-radius: 4px;
      background: #f7f7f7;
      cursor: pointer;
    }
    .rolodex-btn:hover { background: #eaf2fb; border-color: #4a9eff; }
    .rolodex-counter {
      font-size: .85em;
      color: #666;
    }
    .rolodex-card {
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      background: #fff;
      padding: .85rem 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,.05);
      cursor: pointer;
      transition: box-shadow .15s;
    }
    .rolodex-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,.1); }
    .rolodex-card dl {
      margin: 0;
      display: grid;
      grid-template-columns: max-content 1fr;
      gap: .3rem .85rem;
    }
    .rolodex-card dt {
      font-size: .8em;
      text-transform: uppercase;
      letter-spacing: .03em;
      color: #888;
      font-weight: 600;
    }
    .rolodex-card dd {
      margin: 0;
      word-break: break-word;
    }
    .rolodex-card a { color: #0066cc; text-decoration: none; }
    .rolodex-card a:hover { text-decoration: underline; }
`;
  const style = document.createElement('style');
  style.textContent = cssString;
  container.appendChild(style);
//  container.appendChild(await loadStyleRules('root','sol-rolodex'));
  container.appendChild(wrapper);
}
