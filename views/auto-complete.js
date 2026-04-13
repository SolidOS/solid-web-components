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
      value: cellValue(cells[0]),
      label: vars.length > 1 ? cellText(cells[1]) : cellText(cells[0]),
      row,
      index: i,
    };
  });

  const wrapper = document.createElement('div');
  wrapper.className = 'sol-view-autocomplete';

  const inputWrapper = document.createElement('div');
  inputWrapper.className = 'ac-input-wrapper';

  const input = document.createElement('input');
  input.type = 'text';
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', 'false');
  input.placeholder = host?.getAttribute('placeholder') ?? 'type to search...';

  const goButton = document.createElement('button');
  goButton.type = 'button';
  goButton.textContent = host?.getAttribute('go-label') ?? 'Go';
  goButton.className = 'ac-go-button';

  inputWrapper.appendChild(input);
  inputWrapper.appendChild(goButton);

  const listWrapper = document.createElement('div');
  listWrapper.className = 'ac-list-wrapper';
  listWrapper.hidden = true;

  const list = document.createElement('ul');
  list.className = 'ac-list';
  list.setAttribute('role', 'listbox');

  listWrapper.appendChild(list);

  let activeIndex = -1;
  let visible = items;
  let selectedItem = null;

  const fire = item => {
    input.value = item.label;
    input.setAttribute('aria-expanded', 'false');
    listWrapper.hidden = true;
    selectedItem = item;
    host?.dispatchEvent(new CustomEvent('sol-select', {
      bubbles: true, composed: true,
      detail: { value: item.value, row: item.row, index: item.index },
    }));
  };

  const handleAutoComplete = () => {
    if (!selectedItem) {
      alert('No item selected');
      return;
    }

    const callbackName = host?.getAttribute('callback');
    if (callbackName && typeof window[callbackName] === 'function') {
      window[callbackName](selectedItem.value, selectedItem.label);
    } else {
      alert(`ID: ${selectedItem.value}\nLabel: ${selectedItem.label}`);
    }
  };

  goButton.addEventListener('click', handleAutoComplete);

  const renderList = () => {
    list.innerHTML = '';
    visible.forEach((item, i) => {
      const li = document.createElement('li');
      li.textContent = item.label;
      li.setAttribute('role', 'option');
      li.dataset.index = String(i);
      if (i === activeIndex) {
        li.classList.add('active');
        li.scrollIntoView({ block: 'nearest' });
      }
      list.appendChild(li);
    });
    const hasItems = visible.length > 0;
    listWrapper.hidden = !hasItems;
    input.setAttribute('aria-expanded', hasItems ? 'true' : 'false');
  };

  list.addEventListener('mousedown', e => {
    const li = e.target.closest('li');
    if (!li) return;
    e.preventDefault();
    const idx = parseInt(li.dataset.index, 10);
    if (!isNaN(idx) && visible[idx]) {
      fire(visible[idx]);
    }
  });

  list.addEventListener('mousemove', e => {
    const li = e.target.closest('li');
    if (!li) return;
    const idx = parseInt(li.dataset.index, 10);
    if (!isNaN(idx) && idx !== activeIndex) {
      activeIndex = idx;
      renderList();
    }
  });

  const filter = () => {
    const q = input.value.trim().toLowerCase();
    visible = q
      ? items.filter(it => it.label.toLowerCase().startsWith(q))
      : items.slice();
    activeIndex = -1;
    renderList();
  };

  input.addEventListener('input', filter);
  input.addEventListener('click', () => {
    if (!listWrapper.hidden) return;
    input.value = '';
    selectedItem = null;
    filter();
  });
  input.addEventListener('keydown', e => {
    if (listWrapper.hidden && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { 
      filter(); 
      return; 
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (activeIndex === -1) {
        activeIndex = 0;
      } else {
        activeIndex = Math.min(activeIndex + 1, visible.length - 1);
      }
      renderList();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (activeIndex === -1) {
        activeIndex = visible.length - 1;
      } else {
        activeIndex = Math.max(activeIndex - 1, 0);
      }
      renderList();
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && visible[activeIndex]) { 
        e.preventDefault(); 
        fire(visible[activeIndex]); 
      }
    } else if (e.key === 'Escape') {
      listWrapper.hidden = true;
      input.setAttribute('aria-expanded', 'false');
    }
  });

  wrapper.appendChild(inputWrapper);
  wrapper.appendChild(listWrapper);

  const style = document.createElement('style');
  style.textContent = `
    .sol-view-autocomplete {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      width: 100%;
      max-width: 100%;
    }
    .ac-input-wrapper {
      width: 100%;
      display: flex;
      gap: 0.5rem;
    }
    .sol-view-autocomplete input {
      flex: 1;
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
    .ac-go-button {
      padding: .5rem 1rem;
      font: inherit;
      background: #4a9eff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      white-space: nowrap;
    }
    .ac-go-button:hover {
      background: #3a8eef;
    }
    .ac-go-button:focus {
      outline: 2px solid #4a9eff;
      outline-offset: 1px;
    }
    .ac-list-wrapper {
      width: 100%;
      background: #fff;
      border: 1px solid #ccc;
      border-radius: 4px;
      max-height: 220px;
      overflow-y: auto;
      box-shadow: 0 4px 12px rgba(0,0,0,.08);
    }
    .sol-view-autocomplete .ac-list {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .sol-view-autocomplete .ac-list li {
      padding: .4rem .65rem;
      cursor: pointer;
      color: #000;
    }
    .sol-view-autocomplete .ac-list li.active,
    .sol-view-autocomplete .ac-list li:hover {
      background: #eaf2fb;
    }
  `;
  container.appendChild(style);
  container.appendChild(wrapper);
}
