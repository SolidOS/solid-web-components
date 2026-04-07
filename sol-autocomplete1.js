import {getDefaults} from './utils/utils.js';
import {miniQuery} from './utils/miniQuery.js';
let selected;

export class SolAutoComplete extends HTMLElement {
    constructor() {
	super();
    }
    async connectedCallback(){
	getDefaults(this);
        let limit = this.limit || this.getAttribute('limit');
        let wanted = this.wanted || this.getAttribute('wanted');
        let placeholder = this.placeholder || this.getAttribute('placeholder') || "Type to search...";
        selected = this.selected || this.getAttribute('selected');
        let data = await miniQuery(this,{wanted,limit});
        this.showAutocomplete(this,{ options:data, placeholder });
    }
    showAutocomplete(container, opts = {}) {
    // opts.options: array of { label, value }
    // opts.onSelect: function(selectedValue) optional callback
      container.classList.add('autocomplete');
      container.innerHTML  = `
  <style>
    .autocomplete { position: relative; width: 20em; }
    .ac-list {
      position: absolute; top: 10; left: 0; right: 0;
      border: 1px solid #ccc; background: #fff; max-height: 200px;
      overflow: auto; z-index: 1000;
    }
    .autocomplete input { padding:0.5em; width:inherit; }
    .ac-item { padding: 8px; cursor: pointer; }
    .ac-item:hover, .ac-item.active { background: #eee; }
    .hidden { display: none !important; }
  </style>
`;

    const root = typeof container === 'string' ? document.querySelector(container) : container;
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = opts.placeholder || 'Type to search…';
    input.style.width = "calc( 100% - 1.2em  )";
    input.autocomplete = 'off';
    const list = document.createElement('div');
    list.className = 'ac-list hidden';
    root.appendChild(input);
    root.appendChild(list);

  const options = Array.isArray(opts.options) ? opts.options.slice() : [];
  let filtered = [];
  let activeIndex = -1;

  function showList(){ list.classList.remove('hidden'); }
  function hideList(){ list.classList.add('hidden'); activeIndex = -1; }
  function render(){
    list.innerHTML = '';
    if (!filtered.length) { hideList(); return; }
    filtered.forEach((opt, i) => {
      const div = document.createElement('div');
      div.className = 'ac-item'
        if(selected && selected == opt.value){
            activeIndex=i;
            input.value = opt.label;
        }

/*  
    if(selected && selected==opt.value){
        activeIndex=i;
      }
      div.className += (i === activeIndex ? ' active' : '');
*/
      div.textContent = opt.label;
      div.setAttribute('value',opt.value);
      div.setAttribute('role','option');
      div.dataset.index = String(i);
      div.addEventListener('mousedown', (e) => {
        e.preventDefault();
        select(i);
      });
      list.appendChild(div);
    });
    showList();
  }

  function updateFilter(){
    const q = input.value.trim().toLowerCase();
    if (!q) filtered = options.slice();
    else filtered = options.filter(o => o.label.toLowerCase().includes(q));
    activeIndex = filtered.length ? 0 : -1;
    render();
  }

  function select(index){
    if (index < 0 || index >= filtered.length) return;
    const chosen = filtered[index];
    input.value = chosen.label; // show label to user
    hideList();
    // callback
    if (typeof opts.onSelect === 'function') opts.onSelect(chosen.value);
    input.dispatchEvent(new CustomEvent('ac-select', { detail: chosen.value }));
  }
/*
   if(selected) {
      const defaultIndex = filtered.findIndex(option => option.value == selected);
      if (defaultIndex !== -1) {
        select(defaultIndex);
      }
    }
*/

  input.addEventListener('click', ()=>{input.value=""; input.placeholder=opts.placeholder; updateFilter; showList(); });
  input.addEventListener('input', updateFilter);
  input.addEventListener('focus', updateFilter);
  input.addEventListener('blur', () => setTimeout(hideList, 150));

  input.addEventListener('keydown', (e) => {
    if (list.classList.contains('hidden')) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = (activeIndex + 1) % filtered.length;
      render(); scrollActiveIntoView();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = (activeIndex - 1 + filtered.length) % filtered.length;
      render(); scrollActiveIntoView();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      select(activeIndex);
    } else if (e.key === 'Escape') {
      hideList();
    }
  });
  function scrollActiveIntoView(){
    const active = list.querySelector('.ac-item.active');
    if (active) active.scrollIntoView({ block: 'nearest' });
  }
  return {
    setOptions(newOptions){
      if (!Array.isArray(newOptions)) return;
      options.length = 0;
      newOptions.forEach(o => options.push({ label: String(o.label), value: o.value }));
      updateFilter();
    },
    getInput(){ return input; },
    destroy(){ root.innerHTML = ''; }
  };
}


}
customElements.define("sol-autocomplete",SolAutoComplete);

export function insertAutoComplete(container,opts){
    let limit = opts.limit ?`limit="${opts.limit}"` : "";
    let wanted = opts.wanted ?`wanted="${opts.wanted}"` : "";
    let placeholder = opts.placeholder || "Type to search...";
    container.innerHTML += `
        <sol-autocomplete
            source = "${opts.source}"
            placeholder = "${placeholder}"
            ${wanted}
            ${limit}
        ></sol-autocomplete>
    `;   
}

/* END */
