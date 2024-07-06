import {getDefaults} from './utils/utils.js'
import {fetchNonRdfData} from './utils/model.js'
import './utils/sol-browser-base.js';

export class SolComponent extends HTMLElement {
  constructor() {
    super(); 
  }
  async connectedCallback(){
     getDefaults(this);
     this.type='component';
     this.innerHTML=await fetchNonRdfData(this);
  }
}
customElements.define("sol-component",SolComponent);

