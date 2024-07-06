import {getDefaults} from './utils.js';
import {fillTemplate,fetchRDFdata} from './rdf-utils.js';
import {getUI} from './browser-utils.js';

export class SolRdf extends HTMLElement {
  constructor() { 
    super(); 
  }
  async connectedCallback(){ 
    await getDefaults(this)
    const rdfConfig = await getUI();
    let data = await fetchRDFdata({
       config: rdfConfig,
       source: this.source,
        shape: this.shape,
  targetClass: this.getAttribute('targetClass'),
         view: this.view,
        limit: this.limit,
       wanted: this.wanted,
       asHtml: true,
    })
    this.appendChild( await fillTemplate(this,data) );
  }
}
customElements.define("sol-rdf",SolRdf);





















