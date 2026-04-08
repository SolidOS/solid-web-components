import {rel2absIRI} from './utils.js';
import {fetchNonRdfData} from './model.js';
import { isoDoc,domFromContent } from "./isomorphic.js";

/*
<sol-page
  theme = "./themes/single-sidebar.html"
  header = "./snippets/dashboard-header.html"
  sidebar = "./snippets/dashboard-sidebar.html"
  display = "./snippets/dashboard-welcome.html"
  footer = "./snippets/dashboard-footer.html"
></sol-page>
*/

export class SolPage extends HTMLElement {
  constructor() { 
    super(); 
  }
  async connectedCallback(){ 
    await makePage(this);
  }
}
export async function makePage(element){ 
  await attrs2props(element);
  let themeString = element.themeString || await fetchNonRdfData({source:element.theme,type:'component'});
  let themeDom = await domFromContent(themeString);
  let components = themeDom.querySelectorAll('[class^="sol-"]')
  for(let component of components){
    let areaClass = component.getAttribute('class')
    let area = themeDom.querySelector('.'+areaClass);      
    areaClass = component.getAttribute('class').replace(/^sol-/,'');
    if( area && element[areaClass] ){
      area.innerHTML = await fetchNonRdfData({ source:element[areaClass], type:'component' });
    }
  }
  element.innerHTML = themeDom.body.innerHTML;
  return element;
}
async function attrs2props(element){
  for (let attr of element.attributes) {
    element[attr.name] = await rel2absIRI(attr.value);
  }
  return element;
}
customElements.define("sol-page",SolPage);
