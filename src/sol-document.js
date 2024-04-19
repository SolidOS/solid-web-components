import {rel2absIRI} from './utils.js';
import {fetchNonRdfData} from './model.js';
import { isoDoc,domFromContent } from "./isomorphic.js";

export class SolDocumentEditor extends HTMLElement {
  constructor() { 
    super(); 
  }
  async connectedCallback(){ 
    let content = await fetchNonRdfData({source:this.source,type:this.type});
    let name = "";
    let saveButton = "";
    this.innerHTML = `
<div class="sol-document"style="width:44rem;height:25rem">
  <textarea style="width:calc( 100% - 2px );  margin-top:1px; margin-left:1px; height: calc( 100% - 3rem );  border-radius:0.3rem; margin-bottom:0.3rem; padding:1rem;">${content}</textarea>
  <div style="text-align:right;padding:0.5rem;">${name} ${saveButton}</div>
</div>`
  }
}
customElements.define("sol-document-editor",SolDocumentEditor);
