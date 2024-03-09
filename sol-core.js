/*
  all components use the same constructor & connectedCallback
  see the processCustomElement in libs/controller.js
  for how the callback behaves.
*/
import { processCustomElement } from './src/controller.js';
export class SolBase extends HTMLElement {
    constructor() { super(); }
    async connectedCallback(){ processCustomElement(this); }
}
export class SolComponent extends SolBase {}customElements.define("sol-component",SolComponent);
export class SolRdf extends SolBase {}customElements.define("sol-rdf",SolRdf);
export class SolHtml extends SolBase {}customElements.define("sol-html",SolHtml);
export class SolMarkdown extends SolBase {}customElements.define("sol-markdown",SolMarkdown);
export class SolText extends SolBase {}customElements.define("sol-text",SolText);
export class SolInclude extends SolBase {}customElements.define("sol-include",SolInclude);
export class SolDemo extends SolBase{}customElements.define("sol-demo",SolDemo);
export class SolSparql extends SolBase {}customElements.define("sol-sparql",SolSparql);

/* 
  THE END export class SolSparql extends SolBase {}
customElements.define("sol-sparql",SolSparql);


*/