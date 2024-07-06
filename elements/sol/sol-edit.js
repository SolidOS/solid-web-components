import {SolBase} from '../sol-core.js';
import {selector,links} from './view-anchorList.js';
import {registerView} from './controller.js';

registerView({
    actions : {showFeedItems},
  templates : {rss}
});

export class SolManageButton extends SolBase {
  constructor(){
    super(); 
  }
}
customElements.define('sol-manage-button', SolManageButton);

function getCustom(){
  var customElements = [];
  document.querySelectorAll('*').forEach(element => {
    let form = element.form;
    if (form && element.tagName.startsWith('SOL-') ) {
      let name = element.getAttribute('template');
      let source = element.source;
      customElements.push({name,form,source});
    }
  });
  console.log(customElements);
  return(customElements);
}

function createManageButton(element){
  element.innerHTML = `
    <a href="#"
       style="color:white;font-size:200%;text-decoration:none"
       onclick="javascript:getCustom()"
    >
      &#9881 <!-- gear -->
    </a>
  `;
}

