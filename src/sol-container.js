import {getDefaults} from './utils.js';
import {isoDoc} from './isomorphic.js';
import {bestLabel} from './model-rdf.js';
import { registerView } from './controller.js';
import {fetchNonRdfData} from './model.js';

registerView({ 
  actions: {containerClick}
});

export class SolContainer extends HTMLElement {
  constructor() { 
    super(); 
  }
  async connectedCallback(){ 
    let element = await getDefaults(this)
    await container(element);
  }
}
customElements.define("sol-container",SolContainer);


async function container(element){
//  let themeString = await fetchNonRdfData({source:'this.theme,type:'component'});
  let url = element.source;
  let results = {
     files : "",
     folders : "",
  };
  const node = UI.rdf.sym(url);
  try {
    await UI.store.fetcher.load(node.doc(),{headers:{Accept:"text/turtle"}});
  }
  catch(e){console.log(e)}
  let resources = UI.store.match( node, UI.ns.ldp('contains') );
  let s = "display:block; text-decoration:none;height:1rem;"
  for(let resource of resources){
    let label = bestLabel(resource.object);
    let link = resource.object.value;
    let isContainer = link.endsWith('/');
    if(isContainer) {
      label = label.replace(/^.*\//,'').replace(/\/$/,'');
      label = `<img src="./assets/folder.png" style="height:1rem;"> ${label}`
      results.folders += `<a href="${link}" onclick="solrun(event,'containerClick')" style="${s}">${label}</a>`;
       
    }
    else{
      let types = UI.store.match(resource.subject,UI.ns.rdf('type'));
      let type=getMimeType(link);
      label = `<img src="./assets/document.png" style="height:1rem;"> ${label}`
      results.files += `<a href="${link}" onclick="solRun(event,'fileClick')" data-type="${type}" style="${s}">${label}</a>`;
    }
  }
  let headerArea = isoDoc.createElement('DIV');
  let folderArea = isoDoc.createElement('DIV');
  let fileArea = isoDoc.createElement('DIV');
  let displayArea = isoDoc.createElement('DIV');
  element.classList.add('sol-container');
  element.appendChild(headerArea);
  element.appendChild(folderArea);
  element.appendChild(fileArea);
  headerArea.innerHTML = element.source;
  folderArea.innerHTML = results.folders;
  fileArea.innerHTML = results.files;
  /* styles */
  element.style.width = "17rem";  
  folderArea.style['margin-bottom']="1rem"
  folderArea.style.height="30%"
  fileArea.style.height="calc( 70% - 3rem )"
  fileArea.style.overflow="auto"
  folderArea.style.overflow="auto"
  folderArea.style.backgroundColor="#eeeeee"
  fileArea.style.backgroundColor="#eeeeee"
  folderArea.style['border-radius']="0.3rem"
  fileArea.style['border-radius']="0.3rem"
  element.style.display = "block";  
}

async function containerClick(clickedElement){
}

function getMimeType(link){
  // TBD use mime library
  let ext = link.replace(/[^\.]+\./,'');
  if(ext=='ttl') return 'text/turtle';
  if(ext=='html') return 'text/html';
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
