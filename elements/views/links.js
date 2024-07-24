import { getOptions,getAnchors } from '../utils/utils.js';
import { showLink } from '../utils/view.js';

export async function links(data,element){
  const isoDoc = element.ownerDocument;
  let div = isoDoc.createElement('DIV')
  div.classList.add('sol-links')
  div.setAttribute('role','navigation');
  if(typeof data != "string") data = getAnchors(data); // extract anchors from RDF
  div.innerHTML = data;                                // else use anchors in HTML/Markdown
  const viewIn = element.viewIn || element.getAttribute('viewIn') || ".sol-display";
  for(let anchor of div.querySelectorAll('A')){
    anchor.style.padding="0.3rem";
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
    }
    let link=anchor.href;
    anchor.href="#";
    anchor.addEventListener('click',(event)=>{
      event.preventDefault();
      const clickedElement = event.target;
      element.linkUrl = link;
      element.linkTarget ||= 'popup';
      showLink(clickedElement,element);
    });
  }
  return div;
}
