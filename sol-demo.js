export class SolDemo extends HTMLElement {
  constructor() { 
    super(); 
  }
  async connectedCallback(){
    let nodes = Array.from(this.querySelectorAll('*'))
    nodes = nodes.filter(n => n.tagName.toLowerCase().startsWith('sol-'));
    this.innerHTML="";
    for(let node of nodes){
      const data  = demo(node);    
      this.innerHTML += data;    
    }
  }
}
customElements.define("sol-demo",SolDemo);



function demo(element){
  let codeView = "";
  let tagName = element.tagName || element.getAttribute('tagName');
      codeView += `&lt;<b>${tagName.toLowerCase()}</b>\n`;
      for(let attr of element.attributes){
        if(attr.name==='demo') continue;
        if(attr.name==='class') continue;
        if(attr.name==='style') continue;
        codeView += `    <b>${attr.name}</b>="${attr.value}"\n`;
      }
      codeView += `>&lt;/${tagName.toLowerCase()}>\n`;
      codeView = codeView.replace(/=""/,'');
      codeView  = `
      <div class="sol-codeview" style="margin-left:1.4rem;">
        <pre style="background:#eef;padding:0.5rem;"><code>${codeView}</code></pre>
        <div class="sol-codeResults" style="width:fit-content">${element.outerHTML}</div>
      </div>
    `;
  return codeView;
}

