import { isoDoc } from './isomorphic.js';
import { registerView } from './controller.js';
import { getOptions,getAnchors } from './utils.js';

registerView({ 
  templates: {selector,links}
});

export async function selector(element,data){
    let div = isoDoc.createElement('SELECT')
    div.classList.add('sol-selector')
    div.innerHTML = getOptions(data);
    return div;
}
export async function links(element,data){
  let div = isoDoc.createElement('DIV')
  div.classList.add('sol-links')
  if(typeof data != "string") data = getAnchors(data); // extract anchors from RDF
  div.innerHTML = data;                                // else use anchors in HTML/Markdown
  const viewIn = element.getAttribute('viewIn') || "popup";
  for(let anchor of div.querySelectorAll('A')){
    if( viewIn=="popup" ){
       const href=anchor.href;
       anchor.href="#";
       const onclick=`event.preventDefault();window.open( '${href}','sol-win', "top=200px,left=4000px,height=768px,width=1024px")`;
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
    console.log(anchor)
   }
  return div;
}
