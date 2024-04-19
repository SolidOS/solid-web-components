/*
  getDefaults
  rel2absIRI
  getAnchors
  getOptions
*/
import {isoDoc,isoWin,getAbsPath,domFromContent} from './isomorphic.js'

export async function getDefaults(element,dom){
//  const domWindow = typeof dom !="undefined" ?dom.window :window;
//  const domDocument = typeof dom != "undefined" ?dom.window.document :document;
  const domWindow = isoWin;
  const domDocument = isoDoc;
  let defaults = {};
  let el = domDocument.querySelector('sol-defaults');
  if(el && el.hasAttribute('demo')) element.demo=true;
  if(el && el.hasAttribute('defer')) element.defer=true;
  if(el){
    for(let attr of el.attributes) {
      if(Object.keys(attr).length===0) continue;
      this[attr.name] ||= attr.value;
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
  if(element.source) element.source = await rel2absIRI(element.source,domWindow);
  if(element.form) element.form = await rel2absIRI(element.form,domWindow);
  if(element.template && element.template.startsWith('./') ){
    element.template = await rel2absIRI(element.template,domWindow);
  }
  return element;
}

/* 
   rel2absIRI() - convert relative URL to absolute
   if we are running in JSDOM, must pass the dom.windowbject
*/
export function rel2absIRI(rel,domWindow){
  domWindow ||= window;
  if(!domWindow) return rel;
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
