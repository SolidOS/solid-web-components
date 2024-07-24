import { getDefaults } from './utils/utils.js';
import { showLink } from './utils/view.js';
import { page } from './sol-page.js';
import { showMarkdown,fetchNonRdfData } from './utils/model.js';
import { containerTheme } from './utils/sol-container-template.js';
import { getMimeType } from './utils/mimeTypes.js';
import { SolBase } from './sol-base.js';
import { getSingletonStore,bestLabel } from './utils/rdf-utils.js';

export class SolContainer extends SolBase {
  constructor() { 
    super(); 
  }
  async connectedCallback(){ 
    await getDefaults(this)
    this.solidosMode = false;
    await prepContainerWrapper(this);
  }
}
customElements.define("sol-container",SolContainer);


async function prepContainerWrapper(element){
  element.themeString = containerTheme ;
  await page(element)
  let header = element.querySelector('.sol-container-header');
  let display = element.querySelector('.sol-container-display');
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
  setHeader(currentFile,element);
  showLink(files[0],element);
}

function setHeader(currentFile,element){
  let header = element.querySelector('.sol-container-header');
  header.innerHTML = `
    <button title="toggle Hidden"class="toggle-hidden sol-icon">H</button>
    <button title="classic Solidos" class="show-folder sol-icon">S</button>
    <span class="sol-currentFile">${currentFile}</span>
  `;
  for(let b of header.querySelectorAll('BUTTON')){
    b.addEventListener('click',()=>{
      if(b.classList.contains('toggle-hidden')) toggleHiddenClick(element);
      else showSolidosFolder(b,element);
    });
  }
}

async function fillContainerWrapper(element){
  let showHidden = element.classList.contains('showHidden');
  let url = element.source || element.getAttribute('source');
  let results = {
     files : "",
     folders : "",
  };
  const config = await getSingletonStore();
  const node = config.sym(url);
  let parentDir = url.replace(/[^\/]+\/$/,'/').replace(/\/\/$/,'/');
  if( (parentDir.split('/').length)==3 ) parentDir=null;
  try {
    await config.fetcher.load(node.doc(),{headers:{Accept:"text/turtle"}});
  }
  catch(e){console.log(e)}
  let s = "display:block; text-decoration:none;height:1rem;"
  let resources = config.store.match( node, config.ns.ldp('contains') );
  let folderIcon = `<img src="./ui/assets/folder.png" style="height:1rem;">`;
  for(let resource of resources){
    let link = resource.object.value;
    let label = bestLabel(resource.object) || link;
    let isContainer = link.endsWith('/');
    if(isContainer)  label = label.replace(/\/$/,'').replace(/^.*\//,'')
    label = decodeURIComponent(label);
    if( !showHidden ){
      if(label.startsWith('.')) continue;
      if(label.startsWith('#')) continue;
      if(label.endsWith('#')) continue;
      if(label.endsWith('~')) continue;
      if(label.endsWith('.part')) continue;
    }
    if(isContainer) {
      label = `${folderIcon} ${label}`
//      results.folders += `<a href="${link}" onclick="solrun(event,'folderClick')" style="${s}">${label}</a>`;
       
      results.folders += `<a href="${link}" contentType="text/turtle" style="${s}">${label}</a>`;
    }
    else{
      let types = config.store.match(resource.subject,config.ns.rdf('type'));
      let type=getMimeType(link);
      label = `<span style="white-space:nowrap" title="${label}"><img src="./ui/assets/document.png" style="height:1rem;"> ${label}</span>`
//      results.files += `<a href="${link}" onclick="solrun(event,'fileClick')" data-type="${type}" style="${s}">${label}</a>`;
      results.files += `<a href="${link}" linkType="solidos" contentType="${type}" style="${s}">${label}</a>`;
    }
  }
  let isoDoc = element.ownerDocument;
  let sidebarHeaderArea = isoDoc.createElement('DIV');
  let folderArea = isoDoc.createElement('DIV');
  let fileArea = isoDoc.createElement('DIV');
  fileArea.classList.add('sol-files');
  folderArea.classList.add('sol-folders');

  let displayArea = element.querySelector('.sol-container-display') || element.closest('.sol-container').querySelector('.sol-container-display');
  let sidebar = element.querySelector('.sol-container-sidebar') || element.closest('.sol-container').querySelector('.sol-container-sidebar');

  if(parentDir)  results.folders = `<a href="${parentDir}" linkType="solidos" contentType="text/turtle" style="${s}">${folderIcon} ..</a>` + results.folders;

//    `<a href="${parentDir}" onclick="solrun(event,'folderClick')" style="${s}">${folderIcon} ..</a>` 
//  sidebarHeaderArea.innerHTML = element.source;
  folderArea.innerHTML = results.folders;
  fileArea.innerHTML = results.files;

  /* add listeners
  */
  for(let fo of folderArea.querySelectorAll('A')){
    fo.addEventListener('click',(event)=>{
      event.preventDefault();
      let clicked = event.target;
      if(clicked.tagName != 'A') clicked = clicked.closest('A');
      folderClick(clicked,element);
    });
  }

  for(let fi of fileArea.querySelectorAll('A')){
    fi.addEventListener('click',(event)=>{
      event.preventDefault();
      let clicked = event.target;
      if(clicked.tagName != 'A') clicked = clicked.closest('A');
      fileClick(clicked,element);
    });
  }




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

async function fileClick(clicked,element){
  let source = clicked.href;
  element.currentFile = element.linkUrl = source;
  setHeader(source,element);
  showLink(clicked,element);
}
async function folderClick(clicked,element){
  let source = element.source = clicked.getAttribute('href');
  element.currentFile = element.linkUrl = source;
  await fillContainerWrapper(element);
  let files = element.querySelectorAll('.sol-files a');
  if(files.length > 0) {
    let currentFile = files[0].href;
    element.setAttribute('currentFile',currentFile);
    setHeader(currentFile,element);
    showLink(clicked,element);
  }
}
async function toggleHiddenClick(element){
//  const element = clickedElement.closest('.sol-container');
  element.classList.toggle('showHidden');
  fillContainerWrapper(element);
}

async function showSolidosFolder(clicked,element){
  const currentFile = element.currentFile || element.getAttribute('currentFile');
  const currentFolder = currentFile.replace(/[^\/]+$/,'');
  element.currentFile = element.linkUrl = currentFolder;
  clicked.setAttribute('linkType','solidos');
  setHeader(element.currentFile,element);
  showLink(clicked,element);
}
