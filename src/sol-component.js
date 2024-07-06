import {getDefaults} from './utils.js'
import {fetchNonRdfData} from './model.js'
import './sol-browser-base.js';

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

