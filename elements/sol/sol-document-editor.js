import {rel2absIRI} from './utils.js';
import {putNonRdfData,fetchNonRdfData} from './model.js';
import { registerView,processCustomElement } from './controller.js';

registerView({
  actions : {documentSave,documentLoad,documentView},
});

export class SolDocumentEditor extends HTMLElement {
  constructor() { 
    super(); 
  }
  async connectedCallback(){ 
    let orgType = this.getAttribute('type');
    this.type = 'raw';
    let fullname = this.source || rel2absIRI(this.getAttribute('source'));
    let name = fullname.replace(/.*\//,'');
    let content = await fetchNonRdfData(this);
    this.type = orgType;
    this.setAttribute('type',orgType);
    this.classList.add("sol-document");
    this.style="display:inline-block;width:44rem;height:25rem";
    let loadButton = `<button onclick="solrun(event,'documentLoad')">load</button>`;
    let saveButton = `<button onclick="solrun(event,'documentSave')">save</button>`;
    let viewButton = `<button onclick="solrun(event,'documentView')">view</button>`;
    this.innerHTML = `
  <textarea style="width:calc( 100% - 2px );  margin-top:1rem; margin-left:1rem; height: calc( 100% - 3rem );  border-radius:0.3rem; margin-bottom:0.3rem; padding:1rem;">${content}</textarea>
  <div class="sol-document-name" style="text-align:right;"><input style="width:60ch;font-size:85%" value="${fullname}"/> ${saveButton} ${loadButton} ${viewButton} </div>
<style>
.sol-document-name button,.sol-document-name input {
  border-radius:0.3rem;
  padding:0.5rem;
}
</style>
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
async function documentLoad(clickedElement){
  let top = clickedElement.closest('.sol-document');
  let type = 'text/'+top.getAttribute('type');
  let source = top.querySelector('.sol-document-name').innerHTML;
  let content = top.querySelector('textarea').value;
  await putNonRdfData({source,content,type,contentType:type});
}
async function documentView(clickedElement){
  let top = clickedElement.closest('.sol-document');
  let type = 'text/'+top.getAttribute('type');
  let source = top.querySelector('.sol-document-name').innerHTML;
  let content = top.querySelector('textarea').value;
  await putNonRdfData({source,content,type,contentType:type});
}
