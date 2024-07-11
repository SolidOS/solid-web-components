const isBuiltInView = {
    table:1,
    card:1,
};

export async function showData(data,element){
    let content;
    const view = element.getAttribute('view');
    const viewDoc = element.view; // this one makes relative refs absolute
    if(!view){
	content = data;
    }
    if(isBuiltInView[view]){
	content = await interpolateBuiltInView(data,element,view,viewDoc);
    }
    if(typeof window !="undefined"){
	if(typeof content=="string") element.innerHTML = content;
	else element.appendChild(content);
    }
    else return content;
}

/* DYNAMICALLY IMPORT BUILT-IN VIEWS
*/
async function interpolateBuiltInView(data,element,viewName,viewDoc){
  const pkg = await import(`../views/${viewName}.js`);
  return await pkg[viewName](data,element);
}

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
  if(tmp=="card") return showCard(element,dataAOH);
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
       resultsString += template.interpolate(row);
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
  return new Function(...names, `return \`${this}\`;`)(...vals);
}   

