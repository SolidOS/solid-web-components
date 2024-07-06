/*
isomorphic routines to handle
   dom creation - domFromContent(content);
   markdown - markdownString2HTML(content,dom)
   sanitize - 
   err
*/
// import {renderCustomElements} from './controller.js';

export const inBrowser = typeof global==='undefined' || typeof global.sol==='undefined';
export const isoWin = inBrowser ?window :global.sol.dom.window;
export const isoDoc = inBrowser ?document :global.sol.dom.window.document;

export async function domFromContent(content){
  let tmpDom;
  if(inBrowser) tmpDom=(new DOMParser()).parseFromString( content,"text/html");
  else {
    tmpDom = (new JSDOM(content)).window.document;
  }
  return tmpDom
}

export async function markdownString2HTML(markdownString,dom){
  let htmlString="";
  if(!isoWin.marked && !inBrowser){
    isoWin.marked = await import('marked');
  }
  if(!isoWin.marked && inBrowser){  
    try { 
      await import("../node_modules/marked/marked.min.js");
//      await import("https://cdn.jsdelivr.net/npm/marked/marked.min.js");
    }
    catch(e){ console.log("Could not load marked.js.",e);}
  }
  if(typeof isoWin.marked !="undefined"){
    try {
      htmlString = await isoWin.marked.parse(markdownString)
    }
    catch(e){ console.log("Could not parse ",e);}
  }
  return htmlString;
}

export async function sanitize(content) {
  isoWin.sanitize ||= (typeof DOMPurify != "undefined") ?DOMPurify.sanitize :null;
  if(!isoWin.sanitize && !inBrowser){
    let pkg = await import('dompurify');
    let DOMPurify = pkg.default(isoWin);
    isoWin.sanitize =typeof DOMPurify!="undefined" ?DOMPurify.sanitize :null;
  }
  if(typeof isoWin.sanitize=="function") return isoWin.sanitize(content);
}
export function err(...args){
  if(typeof window==="undefined") console.log(args);
  else alert(args.join(','));
}
export async function defineRdfObject(){
  let handler = {};
  if(typeof document==="undefined"){
    const $rdf = global.sol.$rdf;
    handler.store = global.sol.store;
    handler.fetcher = global.sol.fetcher;
    handler.sym = $rdf.sym;
    handler.rdf = $rdf;
  }
  else {
    handler.store = UI.store;
    handler.fetcher = UI.store.fetcher;
    handler.sym = UI.rdf.sym;
    handler.rdf = UI.rdf;
  }
  return handler;
}
//export async function getAbsPath(rel){
export function getAbsPath(rel){
  if(!inBrowser){
    // const pkg = await import('./file-io.js');
    // TBD - import in main file instead
    let path = 'file://' + pkg.curDir().replace(/src/,'');
    //    let path = 'file://' + pkg.getScriptPath().replace(/src\/libs/,'');
    return path + "/" + isoWin.inputPath + rel.replace(/^\.\//,'');
  }
  else {
    let loc = isoWin.location.href;
    return loc.replace(/\/[^\/]*$/,'') + rel.replace(/^\./,'');
  }
}

/* ADD CONTENT TO ELEMENT
  If in Browser just add content as customElement innerHTML. We can't do that
  in command-line since the resulting static document won't recognize customElements
  so instead we create a span, give it the customElement's attributes,
  add the content as innerHTML, and replace the customElement
  with the span. <sol-rdf... becomes <span class="sol-rdf"...
*/
export async function addContentToElement(element,content){
  if(inBrowser){
    element.innerHTML = content; 
    return element;  
  }
  const document = isoDoc;
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
/*
export async function fetchNonRdfContent(element,url,ctype,webOp){
  let content;
  try {
   if(!inBrowser){
      element.source = element.source.replace(/^file:\/\//,'');
      const pkg = await import('./file-io.js');
      content = await pkg.readFileAsync(element.source,'utf8');
    }
    else {
      content =  await webOp('GET',element.source);
    }
    return content;
  }
  catch(e){console.log(e);return ""}
}
*/
