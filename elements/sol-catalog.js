import {SolCatalogPage} from './sol-catalog-page.js';
import {SolCatalogTabset} from './sol-catalog-tabset.js';
import {SolCatalogSearch} from './sol-catalog-search.js';
import {SolMenu} from './sol-menu.js';
import {SolTabset} from './sol-tabset.js';
import {getLinkFromAttr} from './utils/utils.js';
import {getShacl,catalogMenu} from './utils/catalog-utils.js';

class SolCatalog extends HTMLElement {
  constructor() {
     super();
     this.type="rdf"; 
     this.isCatalog=true
  }
  async connectedCallback() {
    const shape = getLinkFromAttr(this,'shape');
    [this.wantedProperties,this.wantedTypes] = await getShacl(shape);
    let menu = await catalogMenu(this,this.wantedProperties,this.wantedTypes);
    let title = this.getAttribute('title') || "Catalog";
    let logo = getLinkFromAttr(this,'logo');
    logo = logo ?`<img src="${logo}" class="logo" />`   :"";
    this.innerHTML = `
<div class="sol-wrapper">
  <div class="sol-header">
    ${logo}
    <span class="sol-header-content">
    <span style="display:inline-block;padding-left:1rem;padding-right:1rem;">
      ${title}
    </span>
    <sol-catalog-search></sol-catalog-search>
    <button class="sol-keywords">keyword index</button>
    <button class="about-link" source="./catalog-about.html">about</button>
    </span>
  </div>
  <div class="sol-main">
    <div class="left-column">
      ${menu}
    </div>
    <div class="sol-display" style="width:100%;"></div>
  </div>
</div>
    `;
    let button = this.querySelector('.sol-keywords');
    let self = this;
    button.addEventListener('click',(event)=>{
      let clicked = event.target;
      let element = clicked.closest('.sol-catalog-page');
      element.setAttribute('isIndex',true);
      let source = getLinkFromAttr(element,'source');
      let displayArea = clicked.closest('.sol-wrapper').querySelector('.sol-display');
      let view = getLinkFromAttr(element,'view');
      view = view ?`view="${element.view}" ` :"";
      displayArea.innerHTML = `<sol-catalog-page wanted="keywordsIndex" ${view} source="${source}"></sol-catalog-page>`;
    });  
    return(true)
  }
}
customElements.define("sol-catalog",SolCatalog);

/*
  THE END 
*/

