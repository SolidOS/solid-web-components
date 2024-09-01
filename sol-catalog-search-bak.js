import {getDefaults} from './utils/utils.js';

export class SolCatalogSearch extends HTMLElement {
  constructor() { 
    super(); 
  }
  async connectedCallback(){ 
    await getDefaults(this);    
    this.innerHTML = `
      <input type="text" />
      <button onclick="window.sol.catalogSearch(event)">search</button>
    `;
    this.querySelector('button').addEventListener('click',(event)=>{runSearch(event,this)});
    this.querySelector('input').addEventListener('keypress',(event)=>{checkEnter(event,this)});
  }
}
customElements.define("sol-catalog-search",SolCatalogSearch);

function checkEnter(event,element){
  if(event.key==="Enter") return runSearch(event,element);
}
function runSearch(event,element){
  event.preventDefault();
  let source = element.source;
  let view = element.view;
  const currentLink = event.target;
  const display = currentLink.closest('.sol-wrapper').querySelector('.sol-display');
  const input = currentLink.parentNode.querySelector('input');
  display.innerHTML=`<sol-catalog source="${source}" view="${view}" wanted="${input.value}"></sol-rdf>`;
}



  
