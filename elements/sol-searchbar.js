import {SolBase} from './sol-base.js';
import {getLinks} from './utils/utils.js';
import { showLink } from './utils/view.js';

class SolSearchbar extends SolBase {
  constructor() { super(); this.type="rdf"; }
  async showData(data,element) {
    self=this;
    const isoDoc = element.ownerDocument;
    let newEl = isoDoc.createElement('DIV');
    newEl.classList.add('sol-searchbar');
    newEl.setAttribute('role',"search");
    newEl.innerHTML = `
      <input type="text" placeholder="search" aria-label="Search Input">
      <button>go</button>
      <fieldset aria-label="Search Engines"> </fieldset>
    `;    
    let fields = "";
    let anchors = getLinks(data);
      for(let a of anchors){ fields+=`
      <label style="white-space:nowrap">
        <input type="radio" name="searchEngine" title="${a.comment}" value="${a.link}" /> ${a.label}
      </label>
      `;
    }
    newEl.querySelector('fieldset').innerHTML=fields;
    newEl.querySelector('fieldset').querySelector('input[type="radio"]').setAttribute('checked',true);
    newEl.querySelector('fieldset').style.border="none";
    newEl.querySelector('fieldset').style.color="black";
    newEl.querySelector('fieldset').style['font-size']="99%";
    newEl.querySelector('fieldset').style['padding-left']="0";
    newEl.querySelector('input').style['border-radius']="0.3rem";
    newEl.querySelector('input').style.padding="0.5rem";
    newEl.querySelector('input').style.width="15rem";
    newEl.style.display= "table-cell";
    newEl.style['box-sizing'] = "box-model";
    newEl.querySelector('input').addEventListener("keypress", (event)=>{
      if (event.key === "Enter") {
        event.preventDefault();
        self.searchbarClick(self);
      }
    }); 
//    newEl.style.border="1px solid grey";
    newEl.style['border-radius']="0.3rem";
    newEl.style['padding-top']="0.75rem";
    newEl.style['padding-left']="0.3rem";
//    newEl.style.margin="0.5rem";
    newEl.style.display="inline-block";
    const button = newEl.querySelector('button');
    button.style["border-radius"] = "0.3rem";
    button.style["padding"] = "0.4rem";
    button.addEventListener('click',(event)=>{
      event.preventDefault();
      self.searchbarClick(event.target,self);
    });
    if(typeof window !="undefined") element.appendChild(newEl);
    return newEl;
  }
  
  searchbarClick(clickedElement,element){
    let engine = element.querySelector('input[type="radio"]:checked').value;
    let query = element.querySelector('input[type="text"]').value;
    element.linkUrl = engine + query;
    element.linkTarget ||= "popup";
    showLink(clickedElement,element);
  }

} 
customElements.define("sol-searchbar",SolSearchbar);

/*
  THE END 
*/

