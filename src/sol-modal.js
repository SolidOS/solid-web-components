import {fetchNonRdfData} from './model.js';
/*
modal({
  label    // button label/icon
  source   // URL of popup-box content
  title    // button title
  width    // popup-box width
  height   // popup-box height
  iframe   // set true if iframe needed
});
*/
export class SolModal extends HTMLElement {
 
  constructor() {
    super(); 
  }
  async connectedCallback(){
    let element = this;
    let modal = document.createElement('SPAN');
    const label = element.innerHTML||"::";
    const title = element.title || element.getAttribute('title')||"";
    const s = _getCSS({height:element.getAttribute('height'),width:element.getAttribute('width')});
    let content;
    if(element.iframe){
      let iframe = document.createElement("IFRAME");
      content = `<iframe src="${element.source}" style="width:100%;height:90%;border:none"></iframe>`;
    }
    else {
      element.type='component'
      element.setAttribute('type','component');
      content = await fetchNonRdfData(element);
    }
    modal.innerHTML = `
      <button title="${title}" onclick="window.openModal(this)">
        ${label}
      </button>
      <div style="${s['.modal']}">
        <div class="sol-modal-content" style="${s['.modal-content']}">
          <div style="${s['.close']}" onclick="window.closeModal(this)">
            &times;
          </div>
          ${content}
        </div>
      </div>
    `;
    let button = modal.querySelector('BUTTON')
    button.style = element.getAttribute('style');
    element.innerHTML="";
    element.appendChild( modal );
  }
}
customElements.define("sol-modal",SolModal);

  window.openModal = function (element,action){
    element.parentElement.children[1].style.display = "block" ;
  }
  window.closeModal = function (element,action){
    element.parentElement.parentElement.style.display = "none" ;
  }

  function _getCSS(current){
    let height = current.height || "85vw";
    let width = current.width || "80vw";
    return {
    "button": `
      background-color:${current.darkBackground};
      color:${current.unselColor};
      cursor:pointer;
    `,
    ".modal": `
      display: none; /* Hidden by default */
      position: fixed; /* Stay in place */
      left: 0;
      top: 0;
      overflow: auto; /* Enable scroll if needed */
      background-color: rgb(0,0,0); /* Fallback color */
      background-color: rgba(0,0,0,0.8); /* Black w/ opacity */
      width: 100%; /* Full width */
      height: 100%; /* Full height */
      z-index:20000;
      text-align:center;
    `,
    ".modal-content": `
      background-color: #fefefe;
      color:black;
//      background-color: ${current.lightBackground};
      margin: 5% auto; /* 15% from the top and centered */
      width:${width};
      height:${height};
      padding: 1rem;
      border: 1px solid #888;
      border-radius:0.5rem;
    `,
    ".close": `
      color:red;
      text-align:right;
      margin-bottom: 0.25rem;
      font-size: 2rem;
      font-weight: bold;
      cursor:pointer;
    `
    }
  }
/* END */
