import {getDefaults,attrs2props,domFromContent} from './utils/utils.js';
import {fetchNonRdfData} from './utils/model.js';
import {SolBase} from './sol-base.js';

/*
<sol-page
  theme = "./themes/single-sidebar.html"
  header = "./snippets/dashboard-header.html"
  sidebar = "./snippets/dashboard-sidebar.html"
  display = "./snippets/dashboard-welcome.html"
  footer = "./snippets/dashboard-footer.html"
></sol-page>
*/

export class SolPage extends SolBase {
  constructor() { 
    super(); 
  }
  async fetchData(){ 
    await page(this);
  }
  async filterData() {}
  async showData() {}
}
export async function page(element){ 
  getDefaults(element);     
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
  element.classList.add('sol-wrapper');
  element.innerHTML = themeDom.body.innerHTML;
  return element;
}
customElements.define("sol-page",SolPage);
