/**
 * Built-in view renderer for sol-query — "auto-complete".
 * A text input with a filtered suggestion list below it. Typing narrows the
 * list by substring match (case-insensitive) against the first column. Clicking
 * or pressing Enter on a suggestion dispatches a 'sol-select' event with
 * { value, row, index } on the host element.
 *
 * Display rules:
 *   - Suggestion label  = first column's value (URIs shortened).
 *   - Suggestion value  = last column's value (full URI if present).
 *
 * Usage: <sol-query view="auto-complete" endpoint="…"></sol-query>
 */
export function render(container, data, host) {
  const { vars, results } = data;
  if (!results?.length) {
    container.textContent = 'No results';
    return;
  }

  const shortUri = v => v.replace(/.*[/#]([^/#]+)\/?$/, '$1') || v;
  const cellText = cell => {
    if (!cell) return '';
    if (cell.type === 'uri') return shortUri(cell.value);
    return cell.value ?? '';
  };
  const cellValue = cell => (cell ? cell.value ?? '' : '');

  const items = results.map((row, i) => {
    const cells = vars.map(v => row[v]);
    return {
      label: cellText(cells[0]),
      value: cellValue(cells[cells.length - 1]),
      row,
      index: i,
    };
  });

  const wrapper = document.createElement('div');
  wrapper.className = 'sol-view-autocomplete';

  const input = document.createElement('input');
  input.type = 'text';
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', 'false');
  input.placeholder = host?.getAttribute('placeholder')
    ?? `Search ${items.length} item${items.length === 1 ? '' : 's'}…`;

  const list = document.createElement('ul');
  list.className = 'ac-list';
  list.setAttribute('role', 'listbox');
  list.hidden = true;

  let activeIndex = -1;
  let visible = items;

  const fire = item => {
    input.value = item.label;
    input.setAttribute('aria-expanded', 'false');
    list.hidden = true;
    host?.dispatchEvent(new CustomEvent('sol-select', {
      bubbles: true, composed: true,
      detail: { value: item.value, row: item.row, index: item.index },
    }));
  };

  const renderList = () => {
    list.innerHTML = '';
    visible.forEach((item, i) => {
      const li = document.createElement('li');
      li.textContent = item.label;
      li.setAttribute('role', 'option');
      li.dataset.i = String(i);
      if (i === activeIndex) li.classList.add('active');
      li.addEventListener('mousedown', e => {
        e.preventDefault();
        fire(item);
      });
      list.appendChild(li);
    });
    const hasItems = visible.length > 0;
    list.hidden = !hasItems;
    input.setAttribute('aria-expanded', hasItems ? 'true' : 'false');
  };

  const filter = () => {
    const q = input.value.trim().toLowerCase();
    visible = q
      ? items.filter(it => it.label.toLowerCase().includes(q))
      : items.slice();
    activeIndex = visible.length ? 0 : -1;
    renderList();
  };

  input.addEventListener('input', filter);
  input.addEventListener('focus', filter);
  input.addEventListener('blur', () => {
    // Delay so mousedown on a suggestion still fires select
    setTimeout(() => { list.hidden = true; input.setAttribute('aria-expanded', 'false'); }, 120);
  });
  input.addEventListener('keydown', e => {
    if (list.hidden && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { filter(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, visible.length - 1);
      renderList();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      renderList();
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && visible[activeIndex]) { e.preventDefault(); fire(visible[activeIndex]); }
    } else if (e.key === 'Escape') {
      list.hidden = true;
      input.setAttribute('aria-expanded', 'false');
    }
  });

  wrapper.appendChild(input);
  wrapper.appendChild(list);

  const style = document.createElement('style');
  style.textContent = `
    .sol-view-autocomplete {
      position: relative;
      display: inline-block;
      min-width: 260px;
      max-width: 100%;
    }
    .sol-view-autocomplete input {
      width: 100%;
      padding: .5rem .65rem;
      font: inherit;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-sizing: border-box;
    }
    .sol-view-autocomplete input:focus {
      outline: 2px solid #4a9eff;
      outline-offset: 1px;
    }
    .sol-view-autocomplete .ac-list {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      margin: 2px 0 0;
      padding: 0;
      list-style: none;
      background: #fff;
      border: 1px solid #ccc;
      border-radius: 4px;
      max-height: 220px;
      overflow-y: auto;
      z-index: 10;
      box-shadow: 0 4px 12px rgba(0,0,0,.08);
    }
    .sol-view-autocomplete .ac-list li {
      padding: .4rem .65rem;
      cursor: pointer;
    }
    .sol-view-autocomplete .ac-list li.active,
    .sol-view-autocomplete .ac-list li:hover {
      background: #eaf2fb;
    }
  `;
  container.appendChild(style);
  container.appendChild(wrapper);
}
