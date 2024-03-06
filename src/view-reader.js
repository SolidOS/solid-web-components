import {isoDoc,domFromContent} from './isomorphic.js';
import { registerView } from './controller.js';

const closed = `<span class="sol-closed">+ </span>`;
const open = `<span class="sol-open">- </span>`;
const link = `<span class="sol-link">> </span>`;

registerView({
         clicks : {readerClick,readerNavigate,readerDisplay},
      templates : {reader}
});

export function reader(element,data){
  if(element.type==="rdf") return aoh2reader(data);
  let wrapper = isoDoc.createElement('SPAN');
  wrapper.innerHTML = data;
  html2reader(wrapper,'h2');
  return makeReader(wrapper);
}

function makeReader(wrapper,dom){
  let reader = isoDoc.createElement('DIV');
  reader.classList.add('sol-reader-wrapper');
  reader.innerHTML = `
  <div class="sol-reader-header">                                               
    <span class="sol-menu-control">&equiv;</span>                               
    <span class="sol-page-title"></span>                                        
    <span class="navigation-buttons" role="navigation">                         
      <button class="prev-button" role="button">&lt;</button>
      <span class="currentIndex">1</span>/<span class="maxIndex"></span> 
      <button class="next-button" role="button">&gt;</button>
    </span>                                                                     
  </div>                                                                        
  <div class="sol-reader-main">
    <div class="sol-reader-menu"></div>
    <div class="sol-reader-display"></div>
  <div>
  `;
  let title = wrapper.querySelector('H1');
  if(title) {
    reader.querySelector('.sol-page-title').innerHTML = title.innerHTML;
    title.remove();
  }
  reader.querySelector('.sol-reader-menu').appendChild(wrapper);
  return addReaderListeners(reader);
}
function addReaderListeners(reader){
  // MENU LINKS
  let menu = reader.querySelector('.sol-reader-menu');
  let links = menu.querySelectorAll('A');
  reader.querySelector('.maxIndex').innerHTML=links.length;
  let index=0;
  for(let link of links){
    if(!link.parentNode.tagName.match(/^H/i)) continue;
    index = index+1;
    link.classList.add('c'+index);
    link.style['text-decoration'] = "none";
    link.style.color = "black";
  }
  //  PREV/NEXT BUTTONS
  let prev = reader.querySelector('.prev-button');
  let next = reader.querySelector('.next-button');
  prev.setAttribute('onclick',"javascript:solrun(event,'readerNavigate','previous')");
  next.setAttribute('onclick',"javascript:solrun(event,'readerNavigate','next')");
  //  MENU-VISIBILITY-CONTROL
  let main = reader.querySelector('.sol-reader-main');
  let menuButton = reader.querySelector('.sol-menu-control');
  menuButton.setAttribute('onclick', "javascript:solrun(event,'menu-hide')");
  // OPEN FIRST TREE HEADER
  let headers = menu.querySelectorAll('H2');
  headers[0].click();
  // OPEN FIRST LINK
  readerDisplay(links[0]);
  return reader;
}

// READER FROM RDF
//
function aoh2reader(dataAOH,dom){
  let resultsString = "";
  let ac = isoDoc.createElement('DIV');
  for(let row of dataAOH){
    let header = row.label || row.prefLabel || row.title || row.name || row.id;
    let record = row.id;
    let recordEl = isoDoc.createElement('TEMPLATE');
    recordEl.innerHTML = `<sol-rdf source="${record}"></sol-rdf>`;
    let headerEl = isoDoc.createElement('H2');
    headerEl.innerHTML = header;
    headerEl = makeReaderLink(headerEl);
    ac.appendChild(headerEl);
    ac.appendChild(recordEl);
    //headerEl.setAttribute('onclick',"javascript:solrun(event,'reader')")
  }
  return makeReader(ac);
}

function makeReaderLink(el){
  let js = "javascript:solrun(event,'readerDisplay')";
  let ih = el.innerHTML.replace(closed,link);
  el.classList.remove('sol-closed');
  el.classList.add('sol-link');
  el.style.cursor="pointer";
  el.innerHTML = `<a href="#" onclick="${js}">${ih}</a>`;
  return el;
}

// READER FROM HTML
//
function html2reader(element,headerSelector,dom){
  let headers = element.querySelectorAll(headerSelector);
  for(let header of headers){
    let nextEl = header.nextElementSibling || null;
    if(!nextEl) continue;
    header.style.cursor="pointer";
    let nextLevel = 'H' + (Number(header.tagName.replace(/H/,'')) + 1).toString();
    const subHeaders = nextEl.querySelectorAll(nextLevel);
    header.innerHTML = closed + header.innerHTML;
    header.classList.add('sol-closed');
    nextEl.style.display="none";
    header.style.display="block";
    if(subHeaders.length>0){
      header.setAttribute('onclick',"javascript:solrun(event,'readerClick')")
      html2reader(nextEl,nextLevel);
    }
    else {
      header = makeReaderLink(header);
    }
  }
  return element;
}

// HANDE USER INPUT
//
function readerClick(currentEl,flag){
  const closed = `<span class="sol-closed">+ </span>`;
  const open = `<span class="sol-open">- </span>`;
  const link = `<span class="sol-open">> </span>`;  
  const headerEl = currentEl;
  const recordEl = headerEl.nextElementSibling||null;
  if(!recordEl) return;
  if(recordEl.style.display === "none") {
    hideOthers(currentEl);
    headerEl.innerHTML = headerEl.innerHTML.replace(closed,open)
    headerEl.classList.remove('sol-closed');
    headerEl.classList.add('sol-open');
    recordEl.style.display = "block";
  } else {
    headerEl.innerHTML = headerEl.innerHTML.replace(open,closed)
    headerEl.classList.remove('sol-open');
    headerEl.classList.add('sol-closed');
    recordEl.style.display = "none";
  }
  function hideOthers(currentEl){
    if(!currentEl) return;  if(!currentEl) return;
    let headers = currentEl.parentNode.childNodes;
    if(!headers) return;
    for(let header of headers){
      if(!header.tagName) continue;
      if(header.tagName=="H1") continue;
      if(!header.tagName.startsWith('H')) continue;
      header.innerHTML = header.innerHTML.replace(open,closed)
      header.classList.remove('sol-open');
      header.classList.add('sol-closed');    header.classList.add('sol-closed');
  /*    let js = "javascript:solrun(event,'readerDisplay')";/*    let js = "javascript:solrun(event,'readerDisplay')";
      let ih = header.innerHTML.replace(closed,link);
      header.innerHTML = `<a href="#" onclick="${js}">${ih}</a>`;
  */
      let nextEl = header.nextElementSibling;
      nextEl.style.display="none";
    }
  }
  
}

async function readerDisplay(currentEl){
  let wrapper = currentEl.closest('.sol-reader-wrapper');
  let main = currentEl.closest('.sol-reader-main');
  let display = main.querySelector('.sol-reader-display');
  let currentIndex = currentEl.classList.toString().replace(/c/,'');
  if(currentIndex) wrapper.querySelector('.currentIndex').innerHTML = currentIndex;
  let nextEl = currentEl.parentNode.nextElementSibling;
  let content = nextEl.innerHTML
  let header = currentEl.parentNode.cloneNode(true);
  if(header.querySelector('SPAN')) header.querySelector('SPAN').remove()
  header.style['border-bottom'] = "2px solid gray";
  header.style['margin-top'] = "0";
  header.style['padding-top'] = "0";
  header.querySelector('A').setAttribute('onclick','javascript:event.preventDefault()');
  header.querySelector('A').style.cursor = "default";
  display.innerHTML = `${header.outerHTML}`+content;
}

async function readerNavigate(currentEl,direction){
  let wrapper = currentEl.closest('.sol-reader-wrapper');
  let menu = wrapper.querySelector('.sol-reader-menu');
  let indexArea = wrapper.querySelector('.currentIndex');
  let maxIndex = wrapper.querySelector('.maxIndex').innerHTML;
  let currentIndex = parseInt(indexArea.innerHTML);
  if(direction=="next") currentIndex = currentIndex+1;
  else currentIndex = currentIndex-1;
  if(currentIndex < 1 ) currentIndex = maxIndex;
  if(currentIndex > maxIndex ) currentIndex = 1;
  indexArea.innerHTML = currentIndex;
  let el2show = menu.querySelector(`.c${currentIndex}`);
  readerDisplay(el2show)
}
