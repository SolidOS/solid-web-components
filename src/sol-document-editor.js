import {rel2absIRI} from './utils.js';
import {putNonRdfData,fetchNonRdfData} from './model.js';
import { registerView,processCustomElement } from './controller.js';

registerView({
  actions : {documentSave},
});

export class SolDocumentEditor extends HTMLElement {
  constructor() { 
    super(); 
  }
  async connectedCallback(){ 
    let orgType = this.getAttribute('type');
    this.type = 'raw';
    let name = this.source || rel2absIRI(this.getAttribute('source'));
    let content = await fetchNonRdfData(this);
    this.type = orgType;
    this.setAttribute('type',orgType);
    this.classList.add("sol-document");
    this.style="display:inline-block;width:44rem;height:25rem";
    let saveButton = `<button onclick="solrun(event,'documentSave')">save</button>`;
    this.innerHTML = `
  <textarea style="width:calc( 100% - 2px );  margin-top:1px; margin-left:1px; height: calc( 100% - 3rem );  border-radius:0.3rem; margin-bottom:0.3rem; padding:1rem;">${content}</textarea>
  <div style="text-align:right;"><span class="sol-document-name">${name}</span> ${saveButton}</div>
`
  }
}
customElements.define("sol-document-editor",SolDocumentEditor);

async function documentSave(clickedElement){
  let top = clickedElement.closest('.sol-document');
  let type = 'text/'+top.getAttribute('type');
  let source = top.querySelector('.sol-document-name').innerHTML;
  let content = top.querySelector('textarea').value;
  await putNonRdfData({source,content,type,contentType:type});
}
