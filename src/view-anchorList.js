import { isoDoc } from './isomorphic.js';
import { registerView } from './controller.js';
import { getOptions,getAnchors } from './utils.js';

registerView({ 
  templates: {selector,links}
});

export async function selector(element,data){
    let wrapper = isoDoc.createElement('DIV');
    let select = isoDoc.createElement('SELECT');
    let display = isoDoc.createElement('DIV');
    wrapper.classList.add('sol-selector-wrapper')
    select.classList.add('sol-selector')
    display.classList.add('sol-selector-display')
    select.style.width = "100%";
    select.innerHTML = getOptions(data);
    select.style.padding = "0.75rem";
    wrapper.appendChild(select);
    wrapper.appendChild(display);
    return wrapper;
}

export async function links(element,data){
  let div = isoDoc.createElement('DIV')
  div.classList.add('sol-links')
  div.setAttribute('role','navigation');
  if(typeof data != "string") data = getAnchors(data); // extract anchors from RDF
  div.innerHTML = data;                                // else use anchors in HTML/Markdown
  const viewIn = element.viewIn || "popup";
  for(let anchor of div.querySelectorAll('A')){
    anchor.setAttribute('role','link');
    anchor.style.padding="0.3rem";
//    anchor.style.color="black";
    anchor.style['font-size']="1rem";
    if(element.scrollable){
      anchor.style.display="block";
      anchor.style['text-decoration']="none";
      anchor.style['border-bottom']="1px solid gray";
    }
    else {
      anchor.style.display="inline-block";
      anchor.style['text-decoration']="none";
      anchor.style.border="1px solid black";
      anchor.style['border-radius']="0.2rem";
      anchor.style['margin-right']="0.2rem";
//      anchor.style.background="lightgray";
    }
    if( viewIn=="popup" ){
       const href=anchor.href;
       anchor.href="#";
       const onclick=`event.preventDefault();window.open( '${href}','sol-win', "top=200px,left=4000px,height=768px,width=1366px")`;
       anchor.setAttribute('onclick',onclick);                      // POPUP WINDOW
    }
    else if( viewIn=="modal" ){
                                                                    // POPUP MODAL IFRAME
                                                                    // POPUP MODAL 
    }
    else {
      let iframe = document.querySelector(viewIn);
      if(iframe && iframe.tagName=="iframe") iframe.src=anchor.href // IFRAME
      else anchor.setAttribute('target',viewIn);                    // NAMED TARGET
    }
   }
  return div;
}
