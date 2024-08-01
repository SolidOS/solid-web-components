export function getLinkFromAttr(element, attr){
  let  value = element.atttr || element.getAttribute(attr);
  return rel2absIRI( value )
}

export function attrs2props(element){
  for (let attr of element.attributes) {
    element[attr.name] = rel2absIRI(attr.value);
  }
  return element;
}
export async function sanitize(content) {
    if(typeof DOMPurify != "undefined") return DOMPurify.sanitize(content);
}
export async function domFromContent(content){
  let tmpDom;
  if(typeof window != "undefined") tmpDom=(new DOMParser()).parseFromString( 
    content,"text/html"
  );
  else {
    tmpDom = (new JSDOM(content)).window.document;
  }
  return tmpDom
}

export async function webOp(method,uri,options) {
  options ||= {};
  return new Promise( (resolve, reject) => {
    try {
      UI.store.fetcher.webOperation(method, uri,options).then( async(response) => {
        if (response.ok) {
          resolve(response.responseText);
        }
        else {
          resolve(response.status + response.statusText);
        }
      });
    }
    catch(err){ console.log(method,uri,options,err);
resolve(err.status+err.statusText); }
  });
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
  let resultsString = "";
  for(let row of dataAOH){
    resultsString += template.interpolate(row);
  }
  const el = document.createElement('SPAN');
  el.innerHTML = resultsString;
  return el;
}


String.prototype.interpolate = function(params) {
  const names = Object.keys(params);
  for(let n of names){
    params[n] ||= ""; // MISSING VALUES DO NOT ERROR
  };
  const vals =  Object.values(params);
  return new Function(...names, `return \`${this}\`;`)(...vals);
}   

export async function getDefaults(element){
  const domDocument = element.ownerDocument;
  const domWindow   = domDocument.defaultView;
  element.className=element.tagName.toLowerCase();
  let defaults = {};
  let el = domDocument.querySelector('sol-defaults');
  if(el && el.hasAttribute('demo')) element.demo=true;
  if(el && el.hasAttribute('defer')) element.defer=true;
  if(el){
    for(let attr of el.attributes) {
      if(!element.getAttribute(attr.name)) element.setAttribute(attr.name,attr.value);
    }
  }
  const tag = element.tagName.toLowerCase();
  if(element.hasAttribute('demo')) element.demo=true;
  if(element.hasAttribute('nodemo')) element.demo=false;
  if(element.hasAttribute('defer')) element.defer=true;
  element.classList.add(tag);
  element.action ||= tag.replace(/^sol-/,'');
  element.source = element.getAttribute('source') || element.source;
  element.form = element.getAttribute('form') || element.form;
  element.type       = element.getAttribute('type') || element.type;
  element.template   = element.getAttribute('template') || element.template;
  element.view       = element.getAttribute('view') || element.view;
  element.shape      = element.getAttribute('shape') || element.shape;
  element.linkType   = element.getAttribute('linkType') || element.linkType;
  element.openLinkIn = element.getAttribute('openLinkIn') || element.openLinkIn;
  element.proxy      = element.getAttribute('proxy') || element.proxy;
  element.winprefs   = element.getAttribute('winprefs') || "height=640,width=1024,top=200,left=2024";
  element.trusted    = element.hasAttribute('trusted')
  element.label      = element.getAttribute('label') || element.label || "";
  element.wanted     = element.getAttribute('wanted') || element.waneted;
  let container = element.closest('sol-settings');
  if(container){
    if(!element.source) element.source = container.getAttribute('source');
    if(!element.type) element.type = container.getAttribute('type');
    if(!element.template) element.template = container.getAttribute('template');
    if(!element.showAs) element.showAs = container.getAttribute('showAs');
  }
    if(element.source) element.source = rel2absIRI(element.source,domWindow);
  if(element.form) element.form = rel2absIRI(element.form,domWindow);
  if(element.template && element.template.startsWith('./') ){
    element.template = rel2absIRI(element.template,domWindow);
  }
  if(element.view && !element.view.startsWith('http') ){
    element.view = rel2absIRI(element.view,domWindow);
  }
  if(element.shape && !element.shape.startsWith('http') ){
    element.shape = rel2absIRI(element.shape,domWindow);
  }
  return element;
}

/* 
   rel2absIRI() - convert relative URL to absolute
   if we are running in JSDOM, must pass the dom.windowbject
*/
export function rel2absIRI(rel,domWindow){
  if(!rel || typeof window=="undefined") return rel;
  domWindow ||= window;
// ABSOLUTE
  let abs = rel;
// RELATIVE TO HOST ROOT
  if( rel.startsWith('/') ){
    abs = domWindow.origin + rel;
  }
// RELATIVE TO CURRENT DOCUMENT
  else if( rel.startsWith('#') ){
    let loc = domWindow.location.href;
    abs = loc.replace(/\/[^\/]*$/,'') + rel.replace(/^\./,'');
  }
// RELATIVE TO SPECIFIED CURRENT DIRECTORY
  else if( rel.startsWith('./') ){
    abs = getAbsPath(rel,domWindow);
  }
// RELATIVE TO UNSPECIFIED CURRENT DIRECTORY
  else if( !rel.match(/:\/\//) ){
    let loc = domWindow.location.href;
    abs = loc.replace(/\/[^\/]*$/,'/') + rel;
  }
  return abs;
}
export function getAbsPath(rel){
  if(typeof window == "undefined"){
    // const pkg = await import('./file-io.js');
    // TBD - import in main file instead
    let path = 'file://' + pkg.curDir().replace(/src/,'');
    //    let path = 'file://' + pkg.getScriptPath().replace(/src\/libs/,'');
    return path + "/" + isoWin.inputPath + rel.replace(/^\.\//,'');
  }
  else {
    let loc = window.location.href;
    return loc.replace(/\/[^\/]*$/,'') + rel.replace(/^\./,'');
  }
}

export function getAnchors(data,dom){
  let anchors = "";
  let links = getLinks(data,dom);
  for(let l of links){
    l.comment ||= "";
    //l.comment = l.comment.replace(/"/g,'\\"').replace(/\n/g,' ').replace(/</g,'&lt;');
    anchors += `<a href="${l.link}" title="${l.comment}" role="link">${l.label}</a>`;
  }
  return anchors;
}
export function getOptions(data,dom){
  let options = "";
  let links = getLinks(data,dom);
  for(let l of links){
    options += `<option value="${l.link}" title="${l.comment}">${l.label}</option>`;
  }
  return options;
}
export function getLinks(data,dom){
  let anchors=[];
  if(typeof data=="string"){
    // html/markdown need work
    domFromContent(data,dom).then((tmpDom)=>{
      for(let a of tmpDom.querySelectorAll('A')){
        anchors.push({link:a.getAttribute('href')||"#",label:a.innerHTML||"",comment:a.getAttribute('title')||""}); 
      } 
      return anchors;
    })
  }
  for(let row of data){
    let link = row.href || row.link || row.url || row.recalls || row.website || row.id;
    let label = row.label || row.prefLabel || row.title || row.name || row.id;
    let comment = row.description || row.comment || row.shortdesc || "";
    anchors.push({link,label,comment})
  }
  return anchors;
}
