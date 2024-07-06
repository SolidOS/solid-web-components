import {getDefaults,rel2absIRI} from './utils/utils.js';
import {fetchRdfData} from './utils/rdf-utils.js';
import {menuCSS} from './utils/view-menu-template.js';

export class SolMenu extends HTMLElement {
  constructor() { 
    super(); 
  }
  async connectedCallback(){ 
    await getDefaults(this);
    // let data = await getMenuDataFromRdf(this.source);
    let data = await this.getMenuDataFromElement(this);
    this.createMenu(data,this);
  }

async getMenuDataFromElement(el){
  let items = el.childNodes;
  const data = [];
  for(let item of items){
    if(!item.tagName) continue;
    let label = item.getAttribute('label')
    let link = rel2absIRI( item.getAttribute('source')||"" );
    if(item.tagName=='SUBMENU'){
      let source = rel2absIRI( item.getAttribute('source') );
      let wanted = item.getAttribute('wanted');
      let linkType = item.getAttribute('linkType');
      let fromRdf = await fetchRdfData({source,wanted});
      let parts = [];
      for(let row of fromRdf){
        parts.push({label:row.label.trim(),link:row.recalls.trim(),linkType});
      }
      data.push({label,parts});
    }
    else if(item.tagName=='SUBMENU-MANUAL'){
      let components = item.childNodes;
      let iparts = [];
      for(let component of components){
        if(!component.tagName) continue;
        let ilabel = component.getAttribute('label');
        iparts.push({label:ilabel,link:component.getAttribute('source')});
      }
      data.push({label,parts:iparts});
    }
    else {
      let linkType = item.getAttribute('linkType');
      let wanted = item.getAttribute('wanted');
      let limit = item.getAttribute('limit');
      let view = item.getAttribute('view');
      let compact = item.getAttribute('compact');
      data.push({label,link,linkType,wanted,limit,view});
    }
  }
  return data;
}

async  getMenuDataFromRdf(uri){
  const data = [];
  let node = UI.rdf.sym(uri);
  await UI.store.fetcher.load(node);
  let parts = UI.store.match(node,UI.ns.ui('parts'));
  if(parts) {
    parts=parts[0].object.elements;
    for(let part of parts){
      let row = {};
      let link = (UI.store.any(part,UI.ns.ui('link'))||{}).value;
      let label = (UI.store.any(part,UI.ns.ui('label'))||{}).value;
      if(link) row.link = link;
      if(label) row.label = label;
      let submenu = UI.store.any(part,UI.ns.ui('parts'));
      if(submenu){
        submenu=submenu.elements;
        row.parts = [];
        for(let sub of submenu){
          let subRow = {};
          let slink = (UI.store.any(sub,UI.ns.ui('link'))||{}).value;
          let slabel = (UI.store.any(sub,UI.ns.ui('label'))||{}).value;
          if(slink) subRow.link = slink;
          if(slabel) subRow.label = slabel;
          row.parts.push(subRow);
        }
      }
      data.push(row);
    }
  }
  else alert(`No menu items found for '${uri}'!`);
  return data;
}

  async  createVerticalMenu( data, element ){
    let doc = element.ownerDocument;
    let win = doc.defaultView;
    let topUL = doc.createElement('UL')
    element.classList.add('sol-vertical-menu');
    for(var row of data){
      topUL.appendChild( await this.renderVerticalMenuItem(row,doc) )
    }
    element.appendChild(topUL);
  }

  async  renderVerticalMenuItem(row,doc){
    const li = doc.createElement('LI')
    const span =  doc.createElement('SPAN')
    span.innerHTML = row.label
    span.classList.add('unclickable-item');
    li.appendChild(span)
    li.style.cursor="pointer"
    li.style.padding = "0.5em";
    if(!row.parts){
      li.classList.add('item');
      li.name = row.link;
      const self = this
      li.addEventListener('click',(event,data)=>{
        event.preventDefault();
        data||=row;
        self.showMenuLink(event,data);
      });
    }
    else {
      li.classList.add('caret')
      let ul2 = document.createElement('UL')
      li.appendChild(ul2)
      ul2.classList.add('nested')     
      ul2.setAttribute('linkType',row.component)     
      for(var m in row.parts){
        let newItem = row.parts[m]
        ul2.appendChild( await this.renderVerticalMenuItem(newItem,doc) )
      }
    }
    return li
  }
  async  createMenu( data, element ){
    let doc = element.ownerDocument;
    let win = doc.defaultView;
    let direction = element.getAttribute('direction');
    direction = element.getAttribute('direction') || 'horizontal';
    if(direction=="vertical") return createVerticalMenu(data,element);
    let topUL = doc.createElement('UL')
    element.classList.add('sol-dropdown-menu');
    for(var row of data){
      topUL.appendChild( await this.renderMenuItem(row,doc) )
    }
    element.appendChild(topUL);
    let style = doc.createElement('style');
    style.innerHTML = menuCSS;
    document.head.appendChild(style);
  }

  async  renderMenuItem(row,doc){
    const li = doc.createElement('LI')
    const span =  doc.createElement('SPAN')
    span.innerHTML = row.label
    li.appendChild(span)
    li.style.cursor="pointer"
    li.style.display = "inline-block";
    li.style.padding = "0.5em";
    if(!row.parts){
      if(!row.link){
        li.classList.add('unclickable-item');
        return li;
      }
      li.classList.add('item');
      li.name = row.link;
      const self = this
      li.addEventListener('click',(event,data)=>{
        event.preventDefault();
        data||=row;
        self.showMenuLink(event,data);
      });
    }
    else {
      li.classList.add('caret')
      let ul2 = document.createElement('UL')
      li.appendChild(ul2)
      ul2.classList.add('nested')     
      ul2.setAttribute('linkType',row.component)     
      for(var m in row.parts){
        let newItem = row.parts[m]
        ul2.appendChild( await this.renderMenuItem(newItem,doc) )
      }
    }
    return li
  }

  showMenuLink = (event,data)=>{
      let defaults=document.body.querySelector('sol-defaults') || {};
      let menu = event.target.closest('.sol-menu');
      let display = event.target.closest('.sol-wrapper').querySelector('.sol-display');
      let label = data.label;
      let wanted = data.wanted || "";
      let limit = data.limit || "";
      let view = data.view || defaults.getAttribute('view') || "";
      let compact = data.compact || "";
      let source  = defaults.getAttribute('source') || data.link;
      let linkType = data.linkType || defaults.getAttribute('linkType') || 'component';
      display.innerHTML = `
<sol-${linkType}
  label = "${label}"
  source = "${source}"
  wanted = "${wanted}"
  view = "${view}"
  compact = "${compact}"
/></sol-${linkType}>
      `;
    }
}
customElements.define("sol-menu",SolMenu);
