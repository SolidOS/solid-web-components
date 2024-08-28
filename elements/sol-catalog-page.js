import {SolBase} from './sol-base.js';
import {getLinkFromAttr} from './utils/utils.js';
import {catalog} from './utils/rdf-utils.js';

export class SolCatalogPage extends SolBase {
  constructor() { super(); this.type="rdf"; this.isCatalog=true}
  async fetchData(element) {
    let cat = element.closest('sol-catalog');
    return await catalog(element,null,cat.wantedProperties,cat.wantedTypes);    
  }
  async filterData(data,element) {
    return data;
  }
  async showData(data,element) {
    if(data.length<1) return;
    let isIndex = element.getAttribute('wanted');
    if(isIndex && isIndex=="keywordsIndex") return;
    await super.showData(data,element);
    let anchors = element.querySelectorAll('a');
    let source = `source="${element.source}" `;
    let view = getLinkFromAttr(element,'view');
    view = view ?`view="${element.view}" ` :"";
    for(let anchor of anchors){
      let href = anchor.getAttribute('href') ;
      if( href.match(element.source)) {
        anchor.addEventListener('click',async(event)=>{
          event.preventDefault();
          let clickedElement=event.target;
          let displayArea = element.closest('.sol-wrapper').querySelector('.sol-display');
          if(anchor.hasAttribute('isKeyword')){
            displayArea.innerHTML = `<sol-catalog-page wanted="keywords ${anchor.textContent}" ${source} ${view}></sol-catalog-page>`;
          }
          else displayArea.innerHTML = `<sol-catalog-page ${source} ${view} wanted="id ${href}"></sol-catalog-page>`;
        });
      }
    }
  }
}
customElements.define("sol-catalog-page",SolCatalogPage);

/*
  THE END 
*/

