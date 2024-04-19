/*
  all components use the same constructor & connectedCallback
  see the processCustomElement in libs/controller.js
  for how the callback behaves.
*/
import { processCustomElement } from './src/controller.js';
import { SolLogin } from './src/sol-login.js';
import { SolTime } from './src/sol-time.js';
import { SolModal } from './src/sol-modal.js';
import { SolPage } from './src/sol-page.js';
import { SolContainer } from './src/sol-container.js';
import { SolDocumentEditor } from './src/sol-document-editor.js';
//import { SolManageButton } from './src/sol-edit.js';

export class SolBase extends HTMLElement {
  constructor() { super(); }
  async connectedCallback(){ processCustomElement(this); }
}
export class SolComponent extends SolBase {}
export class SolRdf extends SolBase {}
export class SolHtml extends SolBase {}
export class SolMarkdown extends SolBase {}
export class SolText extends SolBase {}
export class SolInclude extends SolBase {}
export class SolCustom extends SolBase {}
export class SolDemo extends SolBase{}
export class SolSparql extends SolBase{}

if( typeof document != "undefined" ){
  document.addEventListener('DOMContentLoaded', async ()=> {
    let hasLogin = document.querySelector('SOL-LOGIN');
    if(!hasLogin) await defineElements();
    // else call defineElements after login check
  });
}

export async function defineElements(){
  if( customElements.get("sol-component") !== undefined ) return;
  customElements.define("sol-component",SolComponent);
  customElements.define("sol-rdf",SolRdf);
  customElements.define("sol-html",SolHtml);
  customElements.define("sol-markdown",SolMarkdown);
  customElements.define("sol-text",SolText);
  customElements.define("sol-include",SolInclude);
  customElements.define("sol-demo",SolDemo);
  customElements.define("sol-sparql",SolSparql);
  customElements.define("sol-custom",SolCustom);
}

/* END */
