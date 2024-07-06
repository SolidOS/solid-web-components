import { getDefaults } from './utils.js';
import { isoDoc } from './isomorphic.js';
import { insertSolidosOutliner,solidosShow } from './view-solidos.js';
import { makePage } from './sol-page.js';
import { showMarkdown,fetchNonRdfData } from './model.js';
import { bestLabel } from './model-rdf.js';
import { containerTheme } from './sol-container-template.js';
import { getMimeType } from './mimeTypes.js';

import { registerView } from './controller.js';
registerView({ 
  actions: {fileClick,folderClick,toggleHiddenClick,showFolderClick}
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
  element.themeString = containerTheme ;
  await makePage(element)
  let header = element.querySelector('.sol-container-header');
  let display = element.querySelector('.sol-container-display');
  insertSolidosOutliner(display);
  await fillContainerWrapper(element);
  let files = element.querySelectorAll('.sol-files a')
  let currentFile = files[0].href;
  element.setAttribute('maxFiles',files.length);
  element.setAttribute('currentFile',currentFile);
  let fileHeader = document.createElement('span');
  header.appendChild(fileHeader);
  fileHeader.classList.add('sol-container-header')
  fileHeader.style.display="inline-block";
  fileHeader.style['text-align']="center";
  setHeader(element);
  solidosShow(currentFile,display);
}

function setHeader(element){
  let source = element.source;
  let header = element.querySelector('.sol-container-header');
  let currentFile = element.getAttribute('currentFile');
  header.innerHTML = `
    <button onclick="solrun(event,'toggleHiddenClick')" title="toggle Hidden"class="sol-icon">H</button>
    <button onclick="solrun(event,'showFolderClick')" title="classic Solidos" class="sol-icon">S</button>
    <span class="sol-currentFile">${currentFile}</span>
  `;
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
  let folderIcon = `<img src="./ui/assets/folder.png" style="height:1rem;">`;
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
      label = `<span style="white-space:nowrap" title="${label}"><img src="./ui/assets/document.png" style="height:1rem;"> ${label}</span>`
      results.files += `<a href="${link}" onclick="solrun(event,'fileClick')" data-type="${type}" style="${s}">${label}</a>`;
    }
  }
  let sidebarHeaderArea = isoDoc.createElement('DIV');
  let folderArea = isoDoc.createElement('DIV');
  let fileArea = isoDoc.createElement('DIV');
  fileArea.classList.add('sol-files');
  folderArea.classList.add('sol-folders');
  let displayArea = element.querySelector('.sol-container-display') || element.closest('.sol-container').querySelector('.sol-container-display');
  let sidebar = element.querySelector('.sol-container-sidebar') || element.closest('.sol-container').querySelector('.sol-container-sidebar');

  if(parentDir) results.folders =`<a href="${parentDir}" onclick="solrun(event,'folderClick')" style="${s}">${folderIcon} ..</a>` + results.folders;

//  sidebarHeaderArea.innerHTML = element.source;
  folderArea.innerHTML = results.folders;
  fileArea.innerHTML = results.files;
  sidebar.innerHTML = "";

  sidebar.classList.add('sol-container-sidebar');
  sidebar.appendChild(sidebarHeaderArea);
  sidebar.appendChild(folderArea);
  sidebar.appendChild(fileArea);

  sidebar.style.width = "14rem";  
  sidebar.style.display = "block";  
  sidebar.style['overflow-y']="hidden"
  folderArea.style['margin-bottom']="1rem"
  folderArea.style.height="30%"
  fileArea.style.height="calc( 70% - 2rem )"
  fileArea.style.overflow="auto"
  folderArea.style.padding="0.25rem"
  fileArea.style.padding="0.25rem"
  folderArea.style.overflow="auto"
  folderArea.style.backgroundColor="#eeeeee"
  fileArea.style.backgroundColor="#eeeeee"
  folderArea.style['border-radius']="0.3rem"
  fileArea.style['border-radius']="0.3rem"
/*
  fileArea.innerHTML = `
  ` +  fileArea.innerHTML;
*/
}

async function fileClick(clickedElement){
  const element = clickedElement.closest('.sol-container');
  const display = element.querySelector('.sol-container-display');
  let source = clickedElement.href || clickedElement.parentNode.href;
  element.setAttribute('currentFile', source);
  setHeader(element);
  if(source.endsWith('.md')||source.endsWith('markdown')){
//    showMarkdown(source,display);
  }
  solidosShow(source,display);
}
async function folderClick(clickedElement){
  const element = clickedElement.closest('.sol-container');
  const display = element.querySelector('.sol-container-display');
  element.source = clickedElement.getAttribute('href');
  await fillContainerWrapper(element);
  let files = element.querySelectorAll('.sol-files a');
  if(files.length > 0) {
    let currentFile = files[0].href;
    element.setAttribute('currentFile',currentFile);
    setHeader(element);
    solidosShow(currentFile,display);
  }
}
async function toggleHiddenClick(clickedElement){
  const element = clickedElement.closest('.sol-container');
  element.classList.toggle('showHidden');
  fillContainerWrapper(element);
}
async function showFolderClick(clickedElement){
  const element = clickedElement.closest('.sol-container');
  const display = element.querySelector('.sol-container-display');
  const currentFile = element.getAttribute('currentFile');
  const currentFolder = currentFile.replace(/[^\/]+$/,'');
  element.currentFile=currentFolder;
  setHeader(element);
  solidosShow(currentFolder,display);
}
