import {getDefaults} from './utils/utils.js';
//import {getSingletonStore} from './utils/rdf-utils.js';
import {SolBase} from './sol-base.js';
import {solidosShow } from './utils/solidos-utils.js';

export class SolSolidos extends SolBase {
  constructor() { 
    super(); 
  }
  async connectedCallback(){ 
    getDefaults(this);
    await solidosShow(this.source,this,this,this);
  }
}
customElements.define("sol-solidos",SolSolidos);
