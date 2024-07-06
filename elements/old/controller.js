import { fetchRdfData } from './model-rdf.js';
import { fetchNonRdfData } from './model.js';
import { fetchSparqlData } from './model-sparql.js';
import { fetchForm } from './view-form.js';
import { isoWin,addContentToElement,domFromContent } from './isomorphic.js';
import { getDefaults } from './utils.js';

export async function processCustomElement(element){
  element = await getDefaults(element);
  element.type ||= element.tagName.toLowerCase().replace(/^sol-/,'');

  let data;
  if(element.template==='form'){
    data = await fetchForm(element,data);
    element.appendChild(data);
    return;
  }
  if (element.type ==='sparql')    data = await fetchSparqlData(element);
  else if(element.type ==='rdf')   data = await fetchRdfData(element);
  else if(element.type !='custom') data = await fetchNonRdfData(element);
  // sol-custom expects data to be fetched in the view

  const pkg = await import('./view.js');
  let content = await pkg.showData(element,data);
  content = typeof content==="string" ?content :content.outerHTML;
  if(element.demo) content = await demo(element,content);
  await addContentToElement(element,content);
}

export async function renderCustomElements(element) {
  const customElements = element.querySelectorAll('*');
  for(let el of customElements){
    if( el.tagName.match(/^sol-/i) ) await processCustomElement(el);
  }
}

async function demo(element,content){
  let tmpDom = await domFromContent(content);
  let codeView = "";
    codeView += `&lt;<b>${element.tagName.toLowerCase()}</b>\n`;
    for(let attr of element.attributes){
      if(attr.name==='demo') continue;
      if(attr.name==='class') continue;
      if(attr.name==='style') continue;
      codeView += `    <b>${attr.name}</b>="${attr.value}"\n`;
    }
    codeView += `>&lt;/${element.tagName.toLowerCase()}>\n`;
    codeView = codeView.replace(/=""/,'');
    codeView  = `
    <div class="sol-codeview">
      <pre><code>${codeView}</code></pre>
      <div class="sol-codeResults">${content}</div>
    </div>
  `;
  return codeView;
}

function solrun(event,actionName,additionalFlag){
  event.preventDefault();
  const currentEl = event.target;
  const function2run = sol.action[actionName]
  if(function2run) function2run(currentEl,additionalFlag);
};
export function solInit(){
  if( (typeof isoWin != undefined) && isoWin.sol) return;
  isoWin.solrun = solrun;
  isoWin.sol = { 
    action:{},
    template:{},
  };
}
export function registerView(options){
  solInit();
  options.actions ||= {};
  options.templates ||= {};  options.templates ||= {};
  for(let clickName of Object.keys(options.actions)){
    isoWin.sol.action[clickName] = options.actions[clickName];
  }
  for(let templateName of Object.keys(options.templates)){
    isoWin.sol.template[templateName] = options.templates[templateName];
  }
}
export function registerModel(name,fetchFunction){
  solInit();
  isoWin.sol.model[name] = fetchFunction;
}



