import {SolBase} from './sol-base.js';
import {getLinks} from './utils/utils.js';

class SolSearchbar extends SolBase {
  constructor() { super(); }
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
    newEl.style.border="1px solid grey";
    newEl.style['border-radius']="0.3rem";
    newEl.style['padding-top']="0.5rem";
    newEl.style['padding-left']="0.5rem";
    newEl.style.margin="0.5rem";
    newEl.style.display="inline-block";
    newEl.style.width="18em";
    const button = newEl.querySelector('button');
    button.addEventListener('click',(event)=>{
      event.preventDefault();
      self.searchbarClick(self);
    });
    if(typeof window !="undefined") element.appendChild(newEl);
    return newEl;
  }
  
  searchbarClick(element,flag){
    let engine = element.querySelector('input[type="radio"]:checked').value;
    let query = element.querySelector('input[type="text"]').value;
    let uri = engine + query;
    window.open(uri,"oneWin","top=200px,left=100px,height=640px,width=1024px,");
  }

} 
customElements.define("sol-searchbar",SolSearchbar);

/*
  THE END 
*/

