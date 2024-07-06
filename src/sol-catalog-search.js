export class SolCatalogSearch extends HTMLElement {
  constructor() { 
    super(); 
  }
  connectedCallback(){ 
    this.innerHTML = `
      <input type="text" />
      <button onclick="window.sol.catalogSearch(event)">search</button>
    `;
  }
}
customElements.define("sol-catalog-search",SolCatalogSearch);

window.sol ||= {};
window.sol.catalogSearch = function(event){
  let source = "";
  let view = "";
  let defaults = document.body.querySelector('sol-defaults') || {};
  if(defaults){
    source = defaults.getAttribute('source') || "";
    view = defaults.getAttribute('view') || "";
  }
  const currentLink = event.target;
  const display = currentLink.closest('.sol-wrapper').querySelector('.sol-display');
  const input = currentLink.parentNode.querySelector('input');
  display.innerHTML=`<sol-rdf source="${source}" view="${view}" wanted="${input.value}"></sol-rdf>`;
}



  
