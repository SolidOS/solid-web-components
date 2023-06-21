/* sol-demo

  PURPOSE : 

  USAGE :  <sol-card source="SOURCE" type="TYPE"></sol-card>
           
  AUTHOR : Jeff Zucker
*/
import * as solutils from './sol-utils.js';

export class SolInclude extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  async connectedCallback(){
    let shadow = this.shadowRoot;
    let wrapper = document.createElement('DIV');
    let defaults = solutils.getDefaults();
    let content  = await this.loadSource();
    if(typeof content==="string") wrapper.innerHTML = content;
    else wrapper.appendChild(content);
    shadow.appendChild(wrapper)
  }

  async loadSource(){

    let content = "";
    let queryParam = this.getAttribute('queryParam');
    let wanted = this.getAttribute('wanted');
    let url = this.getAttribute('source');
    let ctype = this.getAttribute('type');
    if(!url || !ctype) return;
    // content comes from a data island
    //
    let reg = new RegExp(window.location.href);
    let tmpUrl = url.replace(reg,'');
    if(tmpUrl.startsWith('#')){
      let element = document.querySelector(tmpUrl);
      content = element.textContent;
    }

    // content comes from a fetch
    //
    else {
      var response = await window.fetch( url,{accept:ctype} );
      content =  await response.text();
    }

    // content is markdown
    //
    if( ctype.match(/markdown/) ){
      if(typeof marked==="undefined"){
        try { 
          await import("/public/s/solid-uix/node_modules/marked/lib/marked.umd.js");
        }
        catch(e){ console.log("Could not load marked.js.",e);}
      }
      if(typeof marked !="undefined"){
        try {
            content = await marked.parse(content)
        }
        catch(e){ console.log("Could not parse "+url,e);}
      }
    }
    if( ctype.match(/text/) ){
      content = `<pre>${content.replace(/</g,'&lt;')}</pre>`;
    }
    if(queryParam) content = content.interpolate({queryParam});
    if(wanted){
      try {
        ctype = "text/html";
        var dom =(new DOMParser()).parseFromString( content,ctype);
        content = document.createElement('DIV');
        for(let anchor of dom.querySelectorAll(wanted)){
          anchor.style.display="block";
          content.appendChild(anchor);
        }
      }
      catch(e){ console.log("Could not load",e); return; }
    }
    return content;
  }
}
customElements.define("sol-include",SolInclude);

