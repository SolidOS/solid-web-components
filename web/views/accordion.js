import { adopt } from '@solid-components/core/adopt.js';
import { CSS as ACCORDION_VIEW_CSS, sheet as ACCORDION_SHEET } from '../styles/view-accordion-css.js';

/**
 * Built-in view renderer for sol-query — "accordion".
 *
 * Panel mode — query-driven (default): one <details> per result row. Summary
 * = first column; body = remaining columns as key/value pairs.
 *
 * Panel mode — author-supplied: if the <sol-query> host element has child
 * <div>s in its light DOM, each div becomes one panel instead. Summary is
 * the div's `data-summary` attribute, or its first heading child, or
 * "Panel N". The div's HTML becomes the panel body.
 *
 * Mutually-exclusive: opening one panel closes all the others.
 *
 * Usage: <sol-query view="accordion" endpoint="…"></sol-query>
 */
export function render(container, data, host) {
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

  // Native single-open behavior via <details name="...">. Each renderer
  // instance gets a unique group name so multiple accordions on a page
  // don't interfere with each other.
  const groupName = `sol-accordion-${Math.random().toString(36).slice(2, 9)}`;

  const wrapper = document.createElement('div');
  wrapper.className = 'sol-view-accordion';

  // ── Author-supplied panels: light-DOM <div> children of the host ──────────
  const authorDivs = host
    ? Array.from(host.children).filter(el => el.tagName === 'DIV')
    : [];

  if (authorDivs.length) {
    authorDivs.forEach((srcDiv, i) => {
      const det = document.createElement('details');
      det.name = groupName;
      if (i === 0) det.open = true;

      const sum = document.createElement('summary');
      const explicit = srcDiv.getAttribute('data-summary');
      const heading  = srcDiv.querySelector('h1,h2,h3,h4,h5,h6');
      sum.textContent = explicit ?? heading?.textContent?.trim() ?? `Panel ${i + 1}`;
      det.appendChild(sum);

      const body = document.createElement('div');
      body.className = 'accordion-body';
      // Clone so the light-DOM source stays untouched; also drops the heading
      // we just lifted into the summary (if any).
      const clone = srcDiv.cloneNode(true);
      if (!explicit && heading) {
        const h = clone.querySelector('h1,h2,h3,h4,h5,h6');
        h?.remove();
      }
      while (clone.firstChild) body.appendChild(clone.firstChild);
      det.appendChild(body);
      wrapper.appendChild(det);
    });
    attachWrapperAndStyle(container, wrapper);
    return;
  }

  // ── Query-driven panels ───────────────────────────────────────────────────
  const { vars, results } = data;
  if (!results?.length) {
    container.textContent = 'No results';
    return;
  }

  const summaryText = row => {
    const firstCell = row[vars[0]];
    if (!firstCell) return '(row)';
    if (firstCell.type === 'uri') return shortUri(firstCell.value);
    return firstCell.value ?? '';
  };

  results.forEach((row, i) => {
    const det = document.createElement('details');
    det.name = groupName;
    if (i === 0) det.open = true;

    const sum = document.createElement('summary');
    sum.textContent = summaryText(row);
    det.appendChild(sum);

    const body = document.createElement('dl');
    const restVars = vars.length > 1 ? vars.slice(1) : vars;
    restVars.forEach(v => {
      const cell = row[v];
      if (!cell) return;
      const dt = document.createElement('dt');
      dt.textContent = v;
      const dd = document.createElement('dd');
      renderCellInto(dd, cell);
      body.appendChild(dt);
      body.appendChild(dd);
    });
    det.appendChild(body);
    wrapper.appendChild(det);
  });

  attachWrapperAndStyle(container, wrapper);
}

function attachWrapperAndStyle(container, wrapper) {
  adopt(container.getRootNode(), { sheet: ACCORDION_SHEET, css: ACCORDION_VIEW_CSS });
  container.appendChild(wrapper);
}
