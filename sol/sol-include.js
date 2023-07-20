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
    let content  = await this.loadSource(defaults);
    if(typeof content==="string") wrapper.innerHTML = content;
    else wrapper.appendChild(content);
    shadow.appendChild(wrapper)
  }

  async loadSource(defaults){

    let content = "";
    let queryParam = this.getAttribute('queryParam');
    let wanted = this.getAttribute('wanted');
    let url = this.getAttribute('source');
    let ctype = this.getAttribute('type');
    if(!url || !ctype) return;
    if(ctype==='rss') url = ((solutils.getDefaults())||{}).proxy + url;

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
      if(ctype==='rss'){
        content = await solutils.fetchAnchorArray(this,'rss',url,{proxy:defaults.proxy});
        let newContent="";
        for(let c of content){
          newContent += `<a style="display:block" href="${c.link}">${c.label}</a>`;
        }
        content = newContent;
      }
      else {
        var response = await window.fetch( url,{accept:ctype} );
        content =  await response.text();
      }
    }

    // content is markdown
    //
    if( ctype.match(/markdown/) ){
      if(typeof marked==="undefined"){
        try { 
          await import("https://cdn.jsdelivr.net/npm/marked/marked.min.js");
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

    // content requested as text
    //
    if( ctype.match(/text/) ){
      content = `<pre>${content.replace(/</g,'&lt;')}</pre>`;
    }


    // content selected by queryParam or wanted value
    //
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
        content = content.innerHTML;
      }
      catch(e){ console.log("Could not load",e); return; }
    }

    // sanitize content except for components
    //
    if(ctype != "htmlComponent") {
      content = await solutils.sanitize(content);
    }

    return content;
  }
}
customElements.define("sol-include",SolInclude);

