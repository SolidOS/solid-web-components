import {showData} from './utils/view.js';
import {fetchRdfData,getSingletonStore,filterRdf} from './utils/rdf-utils.js';
import {fetchSparqlData} from './utils/sparql-utils.js';
import {fetchNonRdfData,filterByQuerySelector} from './utils/model.js';
import {getDefaults} from './utils/utils.js';

export class SolBase extends HTMLElement {
    constructor() {
	super();
    }
    async connectedCallback(){
	this.processComponent(this);
    }
    async processComponent(element){
	getDefaults(element);
        await getSingletonStore();
	element.type ||= element.tagName.toLowerCase().replace(/^sol-/,'');
	let data = await this.fetchData(element);
	data = await this.filterData(data,element);
	return await this.showData(data,element);
    }
    async fetchData(element){
	if(element.type==='rdf') return await fetchRdfData(element);
        if(element.type==='sparql') return await fetchSparqlData(element);
	else return await fetchNonRdfData(element);
    }
    async filterData(data,element){
	if(element.type.match(/(rdf|sparql)/)) return filterRdf(data,element);
        else if(element.type.match(/(html|component|markdown)/)) return await filterByQuerySelector(data,element);
	else return data;
    }
    async showData(data,element){
	return showData(data,element);
    }
}
class SolRdf extends SolBase { constructor() { super(); } }
class SolHTML extends SolBase { constructor() { super(); } }
class SolMarkdown extends SolBase { constructor() { super(); } }
class SolText extends SolBase { constructor() { super(); } }
class SolComponent extends SolBase { constructor() { super(); } }
class SolSparql extends SolBase { constructor() { super(); } }

customElements.define("sol-base",SolBase);
customElements.define("sol-rdf",SolRdf);
customElements.define("sol-html",SolHTML);
customElements.define("sol-markdown",SolMarkdown);
customElements.define("sol-text",SolText);
customElements.define("sol-component",SolComponent);
customElements.define("sol-sparql",SolSparql);

/* END */
