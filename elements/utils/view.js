import {webOp} from './rdf-utils.js';
import {solidosShow} from './solidos-utils.js';


export async function showData(data,element){
    let content;
    const view = element.getAttribute('view');
    const viewDoc = element.view;
    if(!view){
        content = data;
    }
    else if(isBuiltInView[view]){
	content = await interpolateBuiltInView(data,element,view,viewDoc);
    }   
    else {
	content = await fillTemplate(element,data);
    }   
    if(typeof window !="undefined"){
        content ||= "";
	if(typeof content=="string") { element.innerHTML = content; }
	else { element.appendChild(content); }
    }
    return content ;
}

const isBuiltInView = {
    table:1,
    card:1,
    links:1,
    selector:1,
};


/* DYNAMICALLY IMPORT BUILT-IN VIEWS
*/
async function interpolateBuiltInView(data,element,viewName,viewDoc){
  const pkg = await import(`../views/${viewName}.js`);
  return await pkg[viewName](data,element);
}

export async function showLink(clicked,element){
  const linkUrl = element.linkUrl || clicked.getAttribute('href') || element.source ;
  const linkTarget = element.linkTarget 
                  || element.querySelector('.sol-display')
                  || element.querySelector('.sol-container-display')
                  || clicked.closest('.sol-wrapper').querySelector('.sol-display')
                  || clicked.closest('.sol-wrapper').querySelector('.sol-container-display');
  const linkPane = element.plane || clicked.plane || clicked.getAttribute('pane');
  const linkContentType = clicked.getAttribute('contentType');
  const linkType = clicked.getAttribute('linkType') || element.type || 'component';
//  console.log(linkUrl,linkTarget,linkPane);
  if(linkType == 'solidos'){
    return solidosShow(linkUrl,linkTarget,linkPane,clicked,element);
  }
  else if(linkTarget=="popup") {
    window.open(linkUrl,"sol-win","top=200px,left=4000px,height=768px,width=1366px,");
  }
  else {
    let isDemo = element.hasAttribute('demo');
    linkTarget.innerHTML = element.hasAttribute('demo') ?demo(element.linkContent,element) :element.linkContent;
  }
}
/*
    if( viewIn=="popup" ){
       const href=anchor.href;
       anchor.href="#";
       const onclick=`event.preventDefault();window.open( '${href}','sol-win', "top=200px,left=4000px,height=768px,width=1366px")`;
       anchor.setAttribute('onclick',onclick);                      // POPUP WINDOW
    }
    else if( viewIn=="modal" ){
                                                                    // POPUP MODAL IFRAME
                                                                    // POPUP MODAL 
    }
    else {
      let iframe = document.querySelector(viewIn);
      if(iframe && iframe.tagName=="iframe") iframe.src=anchor.href // IFRAME
      else {
        anchor.setAttribute('target',viewIn);
        if(viewIn==".sol-display"){                                 // SOL-DISPLAY
          const aclick=`solrun(event,'showInSolDisplay')`;
          anchor.setAttribute('onclick',aclick);                      // POPUP WINDOW
        }
        anchor.setAttribute('target',viewIn);                    // NAMED TARGET
      }
    }
*/

/* ADD CONTENT TO ELEMENT
  If in Browser just add content as customElement innerHTML. We can't do that
  in command-line since the resulting static document won't recognize customElements
  so instead we create a span, give it the customElement's attributes,
  add the content as innerHTML, and replace the customElement
  with the span. <sol-rdf... becomes <span class="sol-rdf"...
*/
export async function addContentToElement(element,content){
  if(typeof window !="undefined"){
    element.innerHTML = content; 
    return element;  
  }
  const document = element.ownerDocument;
  let s = document.createElement('span');
  s.innerHTML=content;
  if(element.type==="component") await renderCustomElements(s)
  if(element.classList) s.classList=element.classList;
  if(element.id) s.id=element.id;
  try {
    element.replaceWith( s );
   }
  catch(err){console.error(err)}
  return element;
}
export async function renderCustomElements(element) {
  const customElements = element.querySelectorAll('*');
  for(let el of customElements){
    if( el.tagName.match(/^sol-/i) ) await processCustomElement(el);
  }
}


export function getTemplateVariables(templateString){
  const regex = /\${(.*?)}/g;
  let variables = {};
  let match;
  while ((match = regex.exec(templateString)) !== null) {
    variables[match[1]]=1;
  }
  return Object.keys(variables);
}
export async function fillTemplate(element,dataAOH){
  const document = element.ownerDocument;
  let tmp = element.getAttribute('view');
  let template;
  if(tmp.match('#')) {
    template = document.querySelector(tmp).innerHTML;
  }
  else {
    template = await webOp('GET',element.view);
  }
  let properties = getTemplateVariables(template);
  let resultsString = "";
  for(let row of dataAOH){
     for(let key of properties){
       row[key] ||= "";
     }
     try {
/*
resultsString += template.replace(/\${(.*?)(\s*\?\s*(.*?)\s*:\s*(.*?))?}/g, (match, expression, _, trueValue, falseValue) => {
  if (expression.trim() in row) {
    return row[expression.trim()] ? (trueValue ? trueValue.trim() : row[expression.trim()]) : (falseValue ? falseValue.trim() : "");
  } else {
    return match;
  }
});
*/
       resultsString += template.interp(row);
//       resultsString += interpz(template,row);
     } 
     catch(e){console.log(e)}
  }
  const el = document.createElement('DIV');
  el.innerHTML = resultsString;
  return el;
}
String.prototype.interp = function(params) {
  const names = Object.keys(params);
  for(let n of names){
    params[n] ||= ""; // MISSING VALUES DO NOT ERROR
  };
  const vals =  Object.values(params);
  try {
    let results = new Function(...names, `return \`${this}\`;`)(...vals);
    return results;
  }
  catch(e){console.log(e)}
}   

function interpz(template, row) {
  for(let k of row) row[k] ||= "";
  template.replace(/\${(.*?)}/g, (match, variable) => {
  const expr = variable.trim();
  try {
    return eval(`(${expr})`);
  } catch (error) {
    console.error(`Error evaluating expression "${expr}": ${error}`);
    return template;
  }
});


  template = template;
  return template;
  let result = template;
  let match;
  const names = Object.keys(data);
  for(let n of names){
    data[n] ||= ""; // MISSING VALUES DO NOT ERROR
  };

    while ((match = regex.exec(template)) !== null) {
        const expression = match[1];
        let value;
        if(typeof data[expression] !="undefined") value = data[expression];
        else value = Function(`return ${expression}`).call(data);
        result = result.replace(match[0], value);
    }

    return result;
}
