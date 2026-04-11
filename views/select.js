/**
 * Built-in view renderer for sol-query — "select".
 * Renders results as a <select> dropdown. Each row becomes one <option>.
 *
 * Display rules:
 *   - 1 column  → option text = that value (URIs are shortened for readability,
 *                 full URI stored in option.value).
 *   - 2 columns → option text = col[0], option.value = col[1].
 *   - 3+ cols   → option text = "col0 — col1", value = last column.
 *
 * Selection dispatches 'sol-select' with { value, row, index } on the host element
 * so pages can react (filter another query, navigate, etc.). URI values also
 * re-fire the sol-query's own dereference pathway by setting host endpoint, if
 * the host element looks like a <sol-query>.
 *
 * Usage: <sol-query view="select" endpoint="…" wanted="…"></sol-query>
 */
export function render(container, data, host) {
  const { vars, results } = data;
  if (!results?.length) {
    container.textContent = 'No results';
    return;
  }

  const shortUri = v =>
    v.replace(/.*[/#]([^/#]+)\/?$/, '$1') || v;

  const cellText = cell => {
    if (!cell) return '';
    if (cell.type === 'uri') return shortUri(cell.value);
    return cell.value ?? '';
  };
  const cellValue = cell => (cell ? cell.value ?? '' : '');

  const select = document.createElement('select');
  select.className = 'sol-view-select';

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = `— ${results.length} result${results.length === 1 ? '' : 's'} —`;
  placeholder.disabled = true;
  placeholder.selected = true;
  select.appendChild(placeholder);

  results.forEach((row, i) => {
    const opt = document.createElement('option');
    const cells = vars.map(v => row[v]);

    if (vars.length === 1) {
      opt.textContent = cellText(cells[0]);
      opt.value = cellValue(cells[0]);
    } else if (vars.length === 2) {
      opt.textContent = cellText(cells[0]);
      opt.value = cellValue(cells[1]);
    } else {
      opt.textContent = `${cellText(cells[0])} — ${cellText(cells[1])}`;
      opt.value = cellValue(cells[cells.length - 1]);
    }
    opt.dataset.rowIndex = String(i);
    select.appendChild(opt);
  });

  select.addEventListener('change', () => {
    const i = parseInt(select.options[select.selectedIndex].dataset.rowIndex, 10);
    const row = results[i];
    const value = select.value;
    host?.dispatchEvent(new CustomEvent('sol-select', {
      bubbles: true, composed: true,
      detail: { value, row, index: i },
    }));
  });

  const style = document.createElement('style');
  style.textContent = `
    .sol-view-select {
      padding: .45rem .6rem;
      font: inherit;
      border: 1px solid #ccc;
      border-radius: 4px;
      background: #fff;
      min-width: 240px;
      max-width: 100%;
    }
    .sol-view-select:focus { outline: 2px solid #4a9eff; outline-offset: 1px; }
  `;
  container.appendChild(style);
  container.appendChild(select);
}
