import {SolBase} from './sol-base.js';
import {catalog,catalogMenu} from './utils/rdf-utils.js';
import {wantedTypes,wantedProperties} from './utils/catalog-definition.js';
let menuShown = false;

class SolCatalog extends SolBase {
  constructor() { super(); this.type="rdf"; this.isCatalog=true}
  async fetchData(element) {
    let showingMenu = await this.showMenu(element);
    if(showingMenu)return [];
    return await catalog(element,null,wantedProperties,wantedTypes);    
  }
  async filterData(data,element) {
    return data;
  }
  async showMenu(element) {
    if(menuShown) return 0;
    menuShown=true;
    let menu = await catalogMenu(element,wantedTypes);
    element.innerHTML = `
<div class="sol-wrapper">
  <div class="sol-header">
    <span style="inline-block;padding-left:1rem;padding-right:1rem;">Solid Project Resources</span>
    <sol-catalog-search></sol-catalog-search>
  </div>
  <div class="sol-main">
    <div class="left-column">
      ${menu}
    </div>
    <div class="sol-display" style="width:100%;"></div>
  </div>
</div>
    `;
    return(1)
  }
  async showData(data,element) {
    if(data.length<1) return;
    await super.showData(data,element);
    let anchors = element.querySelectorAll('a');
    let source = `source="${element.source}" `;
    let view   = `view="${element.view}" `;
    for(let anchor of anchors){
      let href = anchor.getAttribute('href') ;
      if( href.match(element.source)) {
        anchor.addEventListener('click',async(event)=>{
          event.preventDefault();
          let clickedElement=event.target;
          let displayArea = element.closest('.sol-wrapper').querySelector('.sol-display');
          if(anchor.hasAttribute('isKeyword')){
            displayArea.innerHTML = `<sol-catalog wanted="keywords ${anchor.textContent}" ${source} ${view}></sol-catalog>`;
          }
          else displayArea.innerHTML = `<sol-catalog ${source} ${view} wanted="id ${href}"></sol-catalog>`;
        });
      }
    }
  }
} 
customElements.define("sol-catalog",SolCatalog);

/*
  THE END 
*/

