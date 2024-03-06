import {isoWindow,isoDocument} from './isomorphic.js';

const closed = `<span class="sol-closed">+ </span>`;
const open = `<span class="sol-open">- </span>`;
const link = `<span class="sol-open">> </span>`;

export function accordion(element,data,dom){
  const doc = isoDocument(dom);
  if(element.type==="rdf") return aoh2accordion(data,dom);
  else {
    let wrapper = doc.createElement('SPAN');
    wrapper.innerHTML = data;
    html2accordion(wrapper,'h2',dom);
    return wrapper;
  }
}

function aoh2accordion(dataAOH,dom){
  const doc = isoDocument(dom);
  let resultsString = "";
  let ac = doc.createElement('DIV');
  for(let row of dataAOH){
    let header = row.label || row.prefLabel || row.title || row.name || row.id;
    let record = row.id;
    let headerEl = doc.createElement('H2');
    headerEl.innerHTML = header;
    let recordEl = doc.createElement('DIV');
    recordEl.innerHTML = record;
    recordEl.style.display="none";
    headerEl.style.cursor="pointer";
    headerEl.innerHTML = closed + headerEl.innerHTML;
    ac.appendChild(headerEl);
    ac.appendChild(recordEl);
    headerEl.setAttribute('onclick',"javascript:solrun(event,'accordion')")
  }
  return ac;
}
export function html2accordion(element,headerSelector,dom){
  document ||= dom.window.document
  let headers = element.querySelectorAll(headerSelector);
  console.log(element.outerHTML,headers.length)
  for(let header of headers){
    let nextEl = header.nextElementSibling;
    header.style.cursor="pointer";
    let nextLevel = 'H' + (Number(header.tagName.replace(/H/,'')) + 1).toString();
    const subHeaders = nextEl.querySelectorAll(nextLevel);
    header.innerHTML = closed + header.innerHTML;
    nextEl.style.display="none";
    header.style.display="inline-bock";
    nextEl.style.display="inline-bock";
    if(subHeaders.length>0){
      header.setAttribute('onclick',"javascript:solrun(event,'accordion',this)")
      html2accordion(nextEl,nextLevel);
    }
    else {
      header.setAttribute('onclick',"javascript:solrun(event,'accordion',this)")
//      header.setAttribute('onclick',"javascript:solrun(event,'display')")
      header.innerHTML = header.innerHTML.replace(closed,link)
    }
  }
}

export function accordionAction(event,flag){
  const currentEl = event.target;
  const closed = `<span class="sol-closed">+ </span>`;
  const open = `<span class="sol-open">- </span>`;
  const link = `<span class="sol-open">> </span>`;  
  const headerEl = currentEl;
  const recordEl = headerEl.nextElementSibling;
  if(recordEl.style.display === "none") {
    hideOthers(currentEl);
    headerEl.innerHTML = headerEl.innerHTML.replace(closed,open)
    recordEl.style.display = "inline-block";
  } else {
    headerEl.innerHTML = headerEl.innerHTML.replace(open,closed)
    recordEl.style.display = "none";
  }
  function hideOthers(currentEl){
    let headers = currentEl.parentNode.childNodes;
    if(!headers) return;
    for(let header of headers){
      if(!header.tagName) continue;
      if(header.tagName=="H1") continue;
      if(!header.tagName.startsWith('H')) continue;
      header.innerHTML = header.innerHTML.replace(open,closed)
      let nextEl = header.nextElementSibling;
      nextEl.style.display="none";
    }
  }
}
