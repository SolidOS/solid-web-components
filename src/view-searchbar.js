import {isoDoc} from './isomorphic.js';
import {getLinks} from './utils.js';
import { registerView } from './controller.js';

registerView({ clicks:{searchbarClick}, templates:{searchbar} });

export function searchbar(element,data) {
  let newEl = isoDoc.createElement('DIV');
  newEl.classList.add('sol-searchbar');
  newEl.innerHTML = `
      <input type="text" placeholder="search">
      <button>go</button>
      <fieldset> </fieldset>
  `;    
  let fields = "";
  let anchors = getLinks(data);
  for(let a of anchors){ fields+=`
    <label style="white-space:nowrap">
      <input type="radio" name="searchEngine" title="${a.comment}" value="${a.link}" /> ${a.label}
    </label>
    `;
  }
  let clickAction = "javascript:solrun(event,'searchbarClick')";
  newEl.querySelector('fieldset').innerHTML=fields;
  newEl.querySelector('fieldset').style.border="none";
  newEl.querySelector('fieldset').style['padding-left']="0";
  newEl.querySelector('input').style.padding="0.5rem";
  newEl.querySelector('input').style.width="40ch";
  newEl.querySelector('input[type=radio]').setAttribute('checked',true);
  newEl.querySelector('button').setAttribute('onclick',"solrun(event,'searchbarClick')");
  newEl.querySelector('button').style.padding="0.5rem";
  newEl.style.padding="1rem";
  newEl.style.border="1px solid grey";
  newEl.style['border-radius']="0.3rem";
  newEl.style.width = "44ch";
  return newEl;
}

function searchbarClick(element,flag){
  let engine = element.parentNode.querySelector('input[name="searchEngine"]:checked').value;
  let query = element.parentNode.querySelector('input[type="text"]').value;
  let uri = engine + query;
  window.open(uri,"oneWin","top=200px,left=100px,height=640px,width=1024px,");
}
/*
  THE END 
*/

