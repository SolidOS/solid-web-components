import {rel2absIRI} from './utils.js';
import {fetchNonRdfData} from './model.js';
import { isoDoc,domFromContent } from "./isomorphic.js";

export class SolPage extends HTMLElement {
  constructor() { 
    super(); 
  }
  async connectedCallback(){ 
    await attrs2props(this);
    let themeString = await fetchNonRdfData({source:this.theme,type:'component'});
    let themeDom = await domFromContent(themeString);
    let components = themeDom.querySelectorAll('[class^="sol-"]')
    for(let component of components){
      let areaClass = component.getAttribute('class')
      let area = themeDom.querySelector('.'+areaClass);      
      areaClass = component.getAttribute('class').replace(/^sol-/,'');
      if( area && this[areaClass] ){
        area.innerHTML = await fetchNonRdfData({ source:this[areaClass], type:'component' });
      }
    }
    this.innerHTML = themeDom.body.innerHTML;
  }
}
/*
<sol-page
  theme = "./themes/single-sidebar.html"
  header = "./snippets/dashboard-header.html"
  sidebar = "./snippets/dashboard-sidebar.html"
  display = "./snippets/dashboard-welcome.html"
  footer = "./snippets/dashboard-footer.html"
></sol-page>
*/
async function attrs2props(element){
  for (let attr of element.attributes) {
    element[attr.name] = await rel2absIRI(attr.value);
  }
  return element;
}
customElements.define("sol-page",SolPage);
