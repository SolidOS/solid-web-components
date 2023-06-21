/*
  rel2absIRI(url)
*/

import {sparqlQuery} from './sol-sparql.js';

export async function getContent(subject,queryParam){
  subject = subject.uri ?subject :UI.rdf.sym(subject);
  await UI.store.fetcher.load(subject.doc());
  let content = (UI.store.any(subject,UI.ns.ui('content'))||{}).value;
  if(queryParam) content = content.interpolate({queryParam})
  return content;
}

export function string2node(string){
  return UI.rdf.sym( rel2absIRI(string) );
}
export function rel2absIRI(rel){
// ABSOLUTE
  let abs = rel;
// RELATIVE TO HOST ROOT
  if( rel.startsWith('/') ){
    abs = window.origin + rel;
  }
// RELATIVE TO CURRENT DOCUMENT
  else if( rel.startsWith('#') ){
    let loc = window.location.href;
    abs = loc.replace(/\/[^\/]*$/,'') + rel.replace(/^\./,'');
  }
// RELATIVE TO SPECIFIED CURRENT DIRECTORY
  else if( rel.startsWith('./') ){
    let loc = window.location.href;
    abs = loc.replace(/\/[^\/]*$/,'') + rel.replace(/^\./,'');
  }
// RELATIVE TO UNSPECIFIED CURRENT DIRECTORY
  else if( !rel.match(/:\/\//) ){
    let loc = window.location.href;
    abs = loc.replace(/\/[^\/]*$/,'/') + rel;
  }
  return abs;
}

/* THE CORE FETCHERS
   these are the methods that decide how to fetch and parse data
   based on the declard type attribute of the component
*/
const _fetchAnchorArray = {
  profile,
  container,
  sparql,
  html,  // also handles markdown
  rss,
}

async function profile(element,url,options){
}

async function sparql(element,url,options){
  let resultsString = "";
  try {
    let dom = await _getContent(element,element.source,'sparql' );
    if(typeof dom==="string") dom=(new DOMParser()).parseFromString(dom,'text/html');
    let endpoint = dom.querySelector('endpoint').innerText.trim();
    let template = dom.querySelector('template').innerHTML
    let sparql = dom.querySelector('script').innerText.trim();
    endpoint =_getLocalContainer(endpoint);
    let results = await sparqlQuery( endpoint, sparql );
    for(let row of results){
      for(let k of Object.keys(row)){
        row[k]=row[k].replace(/^"/,'').replace(/"$/,'').replace(/"@en$/,'') || "";
      }
      resultsString += template.interpolate(row);
    }
  }
  catch(e) { console.log(e); }
  return resultsString;
}

/* Web Component methods
   ----------------------
   create(shadow,'DIV','hello world!','test','{color:red}')
   resuls2anchorList(results,ulElement,anchorEvent)

*/
export async function fetchAnchorArray(self,fetchType,url,options) {
  fetchType = fetchType==="markdown" ?"html" :fetchType;
  if(!url && _fetchAnchorArray[fetchType]) return true;
  if(!_fetchAnchorArray[fetchType]) return false;
  let fetchAction = _fetchAnchorArray[fetchType];
  return await fetchAction(self,url,options);
  
}
async function container(self,url,options){
  options ||= {};
  let results = [];
  await UI.store.fetcher.load(url);
  let resources = UI.store.match( UI.rdf.sym(url), UI.ns.ldp('contains') );
  for(let resource of resources){
    let link = resource.object.value;
    results.push({link,label:decodeURI(link)});
  }
  return results;
}

function mostSpecificClassURI(x) {                                        
  var kb = UI.store;                                                         
  var ft = kb.findTypeURIs(x);                                            
  var bot = kb.bottomTypeURIs(ft); // most specific                       
                                                                          
  var bots = [];                                                          
                                                                          
  for (var b in bot) {                                                    
    bots.push(b);                                                         
  } // if (bots.length > 1) throw "Didn't expect "+x+" to have multiple bottom types: "+bots                                                       
  return bots[0];  
}

async function html(self,url,options){
    options ||= {};
    const wantedSelector = options.wanted;     
    var ctype = options.type==="markdown" ?"text/markdown" :"text/html";
    let parts = [];
    let content = await _getContent(self,url,ctype);
/*
    let content = "";
    let reg = new RegExp(window.location.href);
    url = url.replace(reg,'');
    if(url.startsWith('#')){
      let element = self.querySelector(url);
      content = element.textContent;
    }
    else {
      var response = await window.fetch( url,{accept:ctype} );
      content =  await response.text();
    }
    if( ctype.match(/markdown/) ){
      if(typeof marked==="undefined"){
        try { 
          await import("/public/s/solid-uix/node_modules/marked/lib/marked.umd.js");
        }
        catch(e){ console.log("Could not load marked.js.",e);}
      }
      if(typeof marked !="undefined"){
        content = await marked.parse(content)
      }
    }
p*/
    try {
      ctype = "text/html";
      var dom =(new DOMParser()).parseFromString( content,ctype);
      let anchors = wantedSelector ?dom.querySelectorAll(wantedSelector) :dom.querySelectorAll('A');
      for(let one of anchors){
         parts.push({link:one.href,label:one.innerHTML});
      }
    }
    catch(e){ console.log("Could not parse markdown:",e); return; }
    return parts;
  }//,  // END OF fetchAnchorArray.html

async function rss(self,feedUri,options){
//  rss: async (feedUri,options)=>{
    options ||= {};
    const isVideoFeed = options.isVideoFeed;
    let proxy = options.proxy;

    // fetch feed URI & load it into a DOM structure
    //
    feedUri = proxy + encodeURI( feedUri );
    let feedDom;
    try {
      let response = await fetch( feedUri );
      let feedContent = await response.text();
      const domParser = new window.DOMParser();
      feedDom = domParser.parseFromString(feedContent, "text/xml")
    }
    catch(e) { alert(e) };

    // find items (RSS) or entries (Atom)
    //
    let items = feedDom.querySelectorAll("item") || null;
    let thumbnail;
    if(isVideoFeed){
       thumbnail = feedDom.querySelector("channel").querySelector("title").innerHTML;
    }
    items = items.length<1 ?feedDom.querySelectorAll("entry") :items;

    //
    // parse items
    //
    let parsedItems=[];
    items.forEach( el => {

      // find item link, account for specific kinds of quirks
      //
      let link = el.querySelector("link").innerHTML;
      // vox
      if(!link) link = el.querySelector('link').getAttribute('href');
      // reddit
      if(!link || link.match(/ /)){
        link = el.querySelector('content').innerHTML.replace(/.*\[link\]/ ,'').replace(/a href="/,'').replace(/"&gt;.*/,'').replace(/.*&lt;/,'');
      }
      // engadget
      if(!link.match(/^http/))link=link.replace(/.*\[CDATA\[/,'').replace(/\]\]\>$/,'');

      // always use https, not http
      link = link.replace(/^http:/,'https:');

      // get the title
      let label = el.querySelector("title").innerHTML;
      label = label.replace(/^\<\!\[CDATA\[/,'');
      label = label.replace(/\]\].*\>/,'').trim();

      if(isVideoFeed){
        link = el.querySelector('enclosure').getAttribute('url');  
        label= thumbnail;
      }

      parsedItems.push({label,link});
    });
    return parsedItems;
  }  // END OF fetchAnchorArray.rss

export function getDefaults(key){
    let el = document.querySelector('sol-defaults');
    let defaults = {};
    if(!el) return defaults;
    for(let attr of el.attributes) {
      defaults[attr.name] = attr.value;
    }
    if(key) return defaults[key];
    return defaults;
}
export function create(shadow,elType,elContent,elClass,elStyle){
  let el = document.createElement(elType);
  el.setAttribute('class',elClass); 
  el.textContent = elContent;
  const style = document.createElement('style');
  style.textContent = "."+elClass+elStyle;
  if(shadow){
    shadow.appendChild(style);
    shadow.appendChild(el);
  }
  return el;
}
export function  results2anchorList(results,ul,element){
  if(typeof results==="string"){
    var dom =(new DOMParser()).parseFromString(results,'text/html');
    let anchors = dom.querySelectorAll('A');
    results = [];
    for(let anchor of anchors){
      results.push({link:anchor.href,label:anchor.innerHTML});
    }
  }
  for(let row of results){
    let li = document.createElement('LI');
    let anchor = document.createElement('A');
    anchor.href = row.link;
    anchor.innerHTML = row.label;
    let openIn = element.getAttribute('target');
    if(openIn) anchor.target = openIn;
    anchor.addEventListener('click',(event)=>{
      if(openIn){
        alert(openIn);
      }
      else {
        event.preventDefault();
        let link = event.target.tagName==='A' ?event.target.href :event.target.parentNode.href;
        window.open(link,"","height=768,width=1024,top=100,left=100")
       }
    });
    li.appendChild(anchor);
    ul.appendChild(li);
  }
  return ul;
}

/* GENERAL UTILITIES
   interpolate
   _getLocalContainer
   _getContent
*/
String.prototype.interpolate = function(params) {
  const names = Object.keys(params);
  const vals = Object.values(params);
  return new Function(...names, `return \`${this}\`;`)(...vals);
}   
function _getLocalContainer(url){
  if(url.startsWith('/')) return window.origin + url;
  else if(url.startsWith('.')) {
    return window.location.href.replace(/[^\/]+$/,'') + url;
  }
  else return url;
}
async function _getContent(element,url,ctype){
    let content = "";
    let reg = new RegExp(window.location.href);
    url = url.replace(reg,'');
// CONTENT FROM DATA ISLAND
    if(url.startsWith('#')){
      element = element.querySelector(url);
      content = ctype.match(/sparql/) ?element :element.textContent;
    }
// CONTENT FROM FILE
    else {
      var response = await window.fetch( url,{accept:ctype} );
      content =  await response.text();
    }
// MARKDOWN CONTENT
    if( ctype.match(/markdown/) ){
      if(typeof marked==="undefined"){
        try { 
          await import("/public/s/solid-uix/node_modules/marked/lib/marked.umd.js");
        }
        catch(e){ console.log("Could not load marked.js.",e);}
      }
      if(typeof marked !="undefined"){
        content = await marked.parse(content)
      }
    }
    return content;
}


export function bestLabel(node){
 let skosLabel = UI.rdf.sym( "http://www.w3.org/2004/02/skos/core#prefLabel");
  try{
    if(typeof node==="string")  node = UI.rdf.sym(node) ;
    const best = UI.store.any(node,UI.ns.ui('label'))
        || UI.store.any(node,skosLabel)
        || UI.store.any(node,UI.ns.rdfs('label'))
        || UI.store.any(node,UI.ns.dct('title'))
        || UI.store.any(node,UI.ns.foaf('name'))
        || UI.store.any(node,UI.ns.vcard('fn'))
        || UI.utils.label(node);
    return best;
  }
  catch(e) { console.log(e); return node }
}
