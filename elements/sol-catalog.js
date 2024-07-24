import {SolBase} from './sol-base.js';
import {catalog} from './utils/catalog-utils.js';

class SolCatalog extends SolBase {
  constructor() { super(); this.type="rdf"; }
  async fetchData(element) {
    return await catalog(element);    
  }
//  async filterData(data,element) {
//    return data;
//  }
} 
customElements.define("sol-catalog",SolCatalog);

/*
  THE END 
*/

