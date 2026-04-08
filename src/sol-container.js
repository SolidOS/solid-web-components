import { getDefaults } from './utils.js';
import { isoDoc } from './isomorphic.js';
import { insertSolidosOutliner,solidosShow } from './view-solidos.js';
import { makePage } from './sol-page.js';
import { fetchNonRdfData } from './model.js';
import { bestLabel } from './model-rdf.js';
import { registerView } from './controller.js';
import { sidebarLeftTheme } from '../themes/sidebar-left.js';

registerView({ 
  actions: {fileClick,folderClick,toggleHiddenClick}
});

export class SolContainer extends HTMLElement {
  constructor() { 
    super(); 
  }
  async connectedCallback(){ 
    await getDefaults(this)
    await prepContainerWrapper(this);
  }
}
customElements.define("sol-container",SolContainer);


async function prepContainerWrapper(element){
  element.themeString = sidebarLeftTheme ;
  await makePage(element)
  let header = element.querySelector('.sol-header');
  header.innerHTML += `<a href="#" onclick="solrun(event,'toggleHiddenClick')" class="sol-icon">H</a>`;
  insertSolidosOutliner(element.querySelector('.sol-display'));
  await fillContainerWrapper(element);
}
async function fillContainerWrapper(element){
  let showHidden = element.classList.contains('showHidden');
  let url = element.source || element.getAttribute('source');
  let results = {
     files : "",
     folders : "",
  };
  const node = UI.rdf.sym(url);
  let parentDir = url.replace(/[^\/]+\/$/,'/').replace(/\/\/$/,'/');
  if( (parentDir.split('/').length)==3 ) parentDir=null;
  try {
    await UI.store.fetcher.load(node.doc(),{headers:{Accept:"text/turtle"}});
  }
  catch(e){console.log(e)}
  let s = "display:block; text-decoration:none;height:1rem;"
  let resources = UI.store.match( node, UI.ns.ldp('contains') );
  let folderIcon = `<img src="./assets/folder.png" style="height:1rem;">`;
  for(let resource of resources){
    let link = resource.object.value;
    let label = bestLabel(resource.object);
    if( !showHidden ){
      if(label.startsWith('.')) continue;
      if(label.startsWith('#')) continue;
      if(label.endsWith('#')) continue;
      if(label.endsWith('~')) continue;
      if(label.endsWith('.part')) continue;
    }
    let isContainer = link.endsWith('/');
    if(isContainer) {
      label = label.replace(/^.*\//,'').replace(/\/$/,'');
      label = `${folderIcon} ${label}`
      results.folders += `<a href="${link}" onclick="solrun(event,'folderClick')" style="${s}">${label}</a>`;
       
    }
    else{
      let types = UI.store.match(resource.subject,UI.ns.rdf('type'));
      let type=getMimeType(link);
      label = `<span style="white-space:nowrap" title="${label}"><img src="./assets/document.png" style="height:1rem;"> ${label}</span>`
      results.files += `<a href="${link}" onclick="solrun(event,'fileClick')" data-type="${type}" style="${s}">${label}</a>`;
    }
  }
  let headerArea = isoDoc.createElement('DIV');
  let folderArea = isoDoc.createElement('DIV');
  let fileArea = isoDoc.createElement('DIV');
  let displayArea = isoDoc.createElement('DIV');
  let sidebar = element.querySelector('.sol-sidebar') || element.closest('.sol-container').querySelector('.sol-sidebar');

  if(parentDir) results.folders =`<a href="${parentDir}" onclick="solrun(event,'folderClick')" style="${s}">${folderIcon} ..</a>` + results.folders;

  headerArea.innerHTML = element.source;
  folderArea.innerHTML = results.folders;
  fileArea.innerHTML = results.files;
  sidebar.innerHTML = "";
  sidebar.classList.add('sol-container-sidebar');
  sidebar.appendChild(headerArea);
  sidebar.appendChild(folderArea);
  sidebar.appendChild(fileArea);

  sidebar.style.width = "17rem";  
  sidebar.style.display = "block";  
  sidebar.style['overflow-y']="hidden"
  folderArea.style['margin-bottom']="1rem"
  folderArea.style.height="30%"
  fileArea.style.height="calc( 70% - 2rem )"
  fileArea.style.overflow="auto"
  folderArea.style.overflow="auto"
  folderArea.style.backgroundColor="#eeeeee"
  fileArea.style.backgroundColor="#eeeeee"
  folderArea.style['border-radius']="0.3rem"
  fileArea.style['border-radius']="0.3rem"
}

async function fileClick(clickedElement){
  const display = clickedElement.closest('.sol-container').querySelector('.sol-display');
  let source = clickedElement.href || clickedElement.parentNode.href;
  solidosShow(source,display);
}
async function folderClick(clickedElement){
  const element = clickedElement.closest('.sol-container');
  element.source = clickedElement.getAttribute('href');
  fillContainerWrapper(element);
}
async function toggleHiddenClick(clickedElement){
  const element = clickedElement.closest('.sol-container');
  element.classList.toggle('showHidden');
  fillContainerWrapper(element);
}

function getMimeType(link){
  // TBD use mime library
  let ext = link.replace(/[^\.]+\./,'');
  if(ext=='ttl') return 'text/turtle';
  if(ext=='html') return 'text/html';
  if(ext=='txt') return 'text/plain';
  return ext;
}

function mostSpecificClassURI(x) {                                        
  var kb = UI.store;                                                         
  var ft = kb.findTypeURIs(x);                                            
  var bot = kb.bottomTypeURIs(ft); // most specific                       
                                                                          
  var bots = [];                                                          
                                                                          
  for (var b in bot) {                                                    
    bots.push(b);                                                         
  } // if (bots.length > 1) throw "Didn't expect "+x+" to have multiple bottom types: "+bots                                                       
  return bots[0];  
}
