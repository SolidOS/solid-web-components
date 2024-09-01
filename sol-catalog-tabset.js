import {getLinkFromAttr} from './utils/utils.js';
import {getTerm} from './utils/rdf-utils.js';

export class SolCatalogTabset extends HTMLElement {
  constructor() { 
    super(); 
  }
  async connectedCallback() {
    let cat = this.closest('sol-catalog');
    let display = cat.querySelector('.sol-display');
    let str = "<sol-tabset>";
    let type = this.getAttribute('wanted').replace(/^a /,'');
    let source = getLinkFromAttr(this,'source');
    let view = getLinkFromAttr(this,'view');
    let subs = cat.wantedTypes[getTerm(type)].subtypes;
    for(let sub of Object.keys(subs)){
      let label = subs[sub].label;
      let subtype = subs[sub].type;
      if(label){
        str+=`  <link label="${label}" source="${source}" view="${view}" wanted="a ${subtype}" linktype="catalog-page" />`;
      }
    }
    str += "</sol-tabset>";
    this.innerHTML = str;
  }
}
customElements.define("sol-catalog-tabset",SolCatalogTabset);

/*
  THE END 
*/

