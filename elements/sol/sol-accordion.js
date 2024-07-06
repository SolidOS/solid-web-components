import {isoWin} from './isomorphic.js';

export class SolAccordion extends HTMLElement {
  constructor() { 
    super(); 
  }
  connectedCallback(){ 
    let wantedHeader = this.getAttribute('header');
    let nodes = this.querySelectorAll(wantedHeader);
    for(let node of nodes){
      let inner = node.nextSibling;
      inner.className = "hidden";
      inner.classList.add('sol-modal');
      let closeButton = document.createElement('DIV');
      closeButton.style = "color:red;font-size: 2rem;font-weight:bold;cursor:pointer;position:relative;right:0; top:0;text-align:right";
      closeButton.setAttribute('onclick',"this.parentNode.classList.toggle('hidden')");
      closeButton.innerHTML = "&times;";
      inner.innerHTML = closeButton.outerHTML+inner.innerHTML;
      node.style.cursor="pointer";
      node.style.display="inline-block !important";
      node.style.float="left";
      node.onclick = (event)=> {
        // node.scrollIntoView(true);
        for(let n of nodes){
         let inner2 = n.nextSibling;
         if(inner2 !=inner) inner2.className = "hidden";
         n.className = "hidden";
        }
        inner.classList.toggle("hidden");        
        node.classList.toggle("hidden");
      }
    }
  }
}
customElements.define("sol-accordion",SolAccordion);
