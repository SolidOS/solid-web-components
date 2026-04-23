import { adopt } from '../shared/adopt.js';
import { CSS as ANCHORLIST_CSS, sheet as ANCHORLIST_SHEET } from '../styles/view-anchorlist-css.js';

/**
 * Built-in view renderer for sol-query — "anchorlist".
 * Renders results as a flat unordered list of anchor links.
 *
 * Display rules per row:
 *   - Picks the first URI cell as the href.
 *   - Label = first non-URI literal cell, else the shortened form of the URI.
 *   - If no URI cell exists, renders a plain <li> with the first cell's value.
 *
 * Usage: <sol-query view="anchorlist" endpoint="…"></sol-query>
 */
export function render(container, data) {
  const { vars, results } = data;
  if (!results?.length) {
    container.textContent = 'No results';
    return;
  }

  const shortUri = v => v.replace(/.*[/#]([^/#]+)\/?$/, '$1') || v;

  const pickFirst = (row, predicate) => {
    for (const v of vars) {
      const cell = row[v];
      if (cell && predicate(cell)) return cell;
    }
    return null;
  };

  const ul = document.createElement('ul');
  ul.className = 'sol-view-anchorlist';

  results.forEach(row => {
    const li = document.createElement('li');
    const uriCell     = pickFirst(row, c => c.type === 'uri');
    const literalCell = pickFirst(row, c => c.type !== 'uri' && c.type !== 'multi' && c.value);

    if (uriCell) {
      const a = document.createElement('a');
      a.href = uriCell.value;
      a.textContent = literalCell?.value ?? shortUri(uriCell.value);
      a.title = uriCell.value;
      a.dataset.uri = uriCell.value;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      li.appendChild(a);
    } else {
      const first = row[vars[0]];
      li.textContent = first?.value ?? '';
    }
    ul.appendChild(li);
  });

  adopt(container.getRootNode(), { sheet: ANCHORLIST_SHEET, css: ANCHORLIST_CSS });
  container.appendChild(ul);
}
