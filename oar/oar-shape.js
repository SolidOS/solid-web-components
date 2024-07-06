import {getDefaults} from '../src/utils.js';
import {fillTemplate} from './src/rdf-utils.js';

import {getUI} from './src/browser-utils.js';
import {fetchShapeFromObject} from './src/shape-fetcher.js';

export class OarShape extends HTMLElement {
  constructor() { 
    super(); 
  }
  async connectedCallback(){ 
    await getDefaults(this)
    const rdfConfig = await getUI();
    let data = await fetchShapeFromObject({
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
customElements.define("oar-shape",OarShape);





















