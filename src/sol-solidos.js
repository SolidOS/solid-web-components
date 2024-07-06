import {getDefaults} from './utils.js';

export class SolSolidos extends HTMLElement {
  constructor() { 
    super(); 
  }
  async connectedCallback(){ 
    await getDefaults(this);
    let uri = this.source;
    let label = this.getAttribute('label')||"";
    insertSolidosOutliner(this);
    await solidosShow(uri,this,label);
  }
}
customElements.define("sol-solidos",SolSolidos);

export async function solidosShow(url,displayArea,pane){
  let base = location.href.replace(/\?uri=.*/,'');
  let subject = url.uri ?url :UI.rdf.sym(url);
  const outliner = panes.getOutliner(document);
  if(pane.match(/Profile Editor/)) pane = "editProfile";
  if(pane.match(/Preferences Editor/)) pane = "basicPreferences";
  pane = pane ?panes.byName(pane) :null;
  let tableArea = displayArea.querySelector('table');
  await outliner.GotoSubject(subject,true,pane,true,null,tableArea);
  const params = new URLSearchParams(location.search)        
  params.set('uri', subject.uri);                                    
  window.history.replaceState({}, '', `${base}?${params}`);  
}

export function insertSolidosOutliner(displayArea){
  displayArea.innerHTML = `
      <div class="TabulatorOutline" role="main">
         <table></table>
         <div id="GlobalDashboard"></div>
      </div>
  `;
}


  /*
    <div id="solidOSdatabrowser">
      <header id="PageHeader"></header>
      <div class="TabulatorOutline" role="main" id="suicTabulator">
         <table id="outline"></table>
         <div id="GlobalDashboard"></div>
      </div>
      <footer id="PageFooter"></footer>
    </div>

async showSolidOSLink(subject,element,self){
  if(!subject) return console.log("No subject supplied for SolidOSLink!");

  let pluginsArea = document.getElementById('pluginArea');  
  let plugins = pluginsArea.querySelectorAll('#pluginArea > DIV');  
  let solidArea = pluginsArea.querySelector('[data-uix=solidOSbrowser]');  
  for(let pArea of plugins){
    pArea.classList.add('hidden')
  }
  solidArea.classList.remove('hidden')

  const opt = element.dataset || {};
  subject = subject.uri ?subject :util.sym(subject);
  const params = new URLSearchParams(location.search)        
  params.set('uri', subject.uri);                                    
  let base = util.currentContainer() + "index.html";
  const o = panes.getOutliner(opt.dom || document);
  await refreshProfileOwner(subject.uri,element,self);
  let currentPage = document.body.querySelector("[data-uix=currentPage]");
  if(currentPage) currentPage.innerHTML = subject.uri;
  let pane = opt.pane ?panes.byName(opt.pane) :null;
  await o.GotoSubject(subject,true,pane,true,null,opt.outlineElement);
  window.history.replaceState({}, '', `${base}?${params}`);  
}
 */
