import {getLinkFromAttr} from './utils.js';

let lit,sym,ns,store,fetcher,updater,UI;

export {sym,lit};

/* RDF PARSER
*/
let rdf;

export async function fetchRdfData(component){ 
  return await catalog(component,'raw');
}

export async function catalog(element,raw,wantedProperties,wantedTypes){
  element.raw = raw;
  rdf = await getSingletonStore();
  let url = element.source;
  let node = rdf.sym(url);
  let doc  = node.doc();
  try { await rdf.fetcher.load(doc); }
  catch(e){ console.log(e)}
  let table = [];
  let wanted = getWanted(element);
  let allPredicates = getUniquePredicates( null, null, null, doc );
  let subjects = wanted.length > 0
     ? getMatchingSubjects()
     : getUniqueSubjects( null, null, null, doc );
  for(let subject of subjects){
    let row = await catalogRow(subject,wanted,element,wantedProperties)
    if(row) table.push(row)
  }
  table.sort((a, b) => (a.name||"").localeCompare(b.name||""));
  return(table);

  function getMatchingSubjects(){
    let matchingSubjects = [];
    let found = {};
    let uniqueSubjects;
    for(let clause of wanted){
      clause.value = typeFromLabel(clause.value);
      if( clause.predicate =="ft"){
        uniqueSubjects = getUniqueSubjects( null, null, null, doc );
        wanted.isFullText = true;
        wanted.fullTextvalue = clause.value;
      }
      else if(clause.predicate==="id") uniqueSubjects = getUniqueSubjects( sym(clause.value), null, null, doc );
      else if(clause.predicate==="type") uniqueSubjects = getUniqueSubjects( null,nsp('rdf:type'),sym(clause.value), doc );
      else {
        let predicate = predicateFromLabel(clause.predicate);
        let object    = lit(clause.value);
        uniqueSubjects = getUniqueSubjects( null, predicate, object, doc )
      }
      for(let s of uniqueSubjects){
        if(found[s]) continue;
        found[s]=true;
        matchingSubjects.push(s);
      }
    }
    return matchingSubjects;
  }

  function predicateFromLabel(label){
    if(wantedProperties && wantedProperties[label]) return sym(wantedProperties[label]);
    for(let p of allPredicates){
      if(p.value.match(label)) return p;
    }
    alert(`Unrecognized property label: '${label}'!`)
  }

  function typeFromLabel(label){
    if(!wantedTypes) return label;
    if(wantedTypes && wantedTypes[label]) return sym(wantedTypes[label].type);
    for(let t of Object.keys(wantedTypes)){
      let subtypes = wantedTypes[t].subtypes;
      if(!subtypes)continue;
      for(let s of Object.keys(subtypes)){
        if(s==label) return sym(subtypes[s].type);
      }
    }
    return sym(label);
  }

}

async function catalogRow(subject,wanted,element,wantedProperties){
  let row = { id: subject.value  };
  let rowPredicates = getUniquePredicates( subject, null, null, subject.doc() );
  for(let predicate of rowPredicates){
    let propertyLabel = getTerm(predicate.value)
    let displayLabel = propertyLabel.replace(/_/g,' ');
    let objects = rdf.store.each( subject, predicate, null, subject.doc() );
    row[propertyLabel]=[];
    row[propertyLabel+'Of']=[];
    if( !objects || objects.length < 1 ) {
      row[propertyLabel].push("");
      objects=[];
    }
    for(let o of objects){
      if(element.raw || propertyLabel==="name"){
        row[propertyLabel].push(o.value);
      }
      else {
        if(predicate.value.match(/(service-endpoint|repository|homepage|webpage|videoCallPage|wiki|webid|NamespaceURI)/i)){
          row[propertyLabel].push(`<a href="${o.value}" property="${predicate.value}" target="_BLANK">${displayLabel}</a>`);
        }
        else {
          displayLabel = bestLabel(o).replace(/_/g,' ') ;
          if(o.termType=="NamedNode" || o.termType=="BlankNode"){
            row[propertyLabel].push(`<a href="${o.value}" property="${predicate.value}">${displayLabel}</a>`);
          }
          else {
            if(element.isCatalog && propertyLabel==="keywords"){
              row[propertyLabel].push(`<a href="${element.source}" isKeyword property="${predicate.value}">${o.value}</a>`);
            }
            else row[propertyLabel].push(`<span property="${predicate.value}">${o.value}</span>`);
          }
        }
      }
    }
  }
  if(wanted[0].predicate=="ft"){
    let found =false
    for(let k of Object.keys(row)){
      let got = row[k];
      if(typeof got != "string") got = got.join(' ');
      if(got.toLowerCase().match(wanted[0].value.toLowerCase())) found = true;
    }
    if(!found) return;
  }

  /* get data in which subject is the object of a triple */
  let stmts = rdf.store.match( null, null, subject, subject.doc() );
  for(let s of stmts){
    let propertyLabel = getTerm(s.predicate);
    let displayLabel = (bestLabel(s.subject)||getTerm(s.subject.value)).replace(/_/g,' ') ;
    row[propertyLabel+"Of"]||=[];
    row[propertyLabel+"Of"].push(`<a href="${s.subject.value}" property="${s.predicate.value}">${displayLabel}</a>`);
  }
  for(let key of Object.keys(row)){ 
    row[key]||=[""];
    if(row[key].length<2) row[key]=row[key][0];
  }
  if(element.isCatalog){
    for(let key of Object.keys(wantedProperties)){ 
      if(!row[key]) row[key]= "";
      if(!row[key+'Of']) row[key+'Of']= "";
    }
  }
  return(row)
}

export async function catalogMenu(element,wantedTypes){
   const source = getLinkFromAttr(element,'source');
   const view = getLinkFromAttr(element,'view');
   const definition = getLinkFromAttr(element,'definition');
   await fetcher.load(source);   
   if(definition){
     let pkg = await import(definition);
     wantedTypes = pkg.wantedTypes;
     wantedProperties = pkg.wantedProperties;
   }
   let showTypes = count(source,wantedTypes);
   let total = showTypes.shift();   
   let menu = "<sol-menu>";
   for(let t of showTypes){
     if(t.page){
       menu += `<link label="${t.name}" source="${t.page}" count="${t.count}" linkType="component" />\n`;
     }
     else menu += `<link label="${t.name}" view="${view}" source="${source}" wanted="a ${t.type}" count="${t.count}" linkType="catalog" />\n`;
   }
   menu += "</sol-menu>\n";
   menu += `<p style="text-align:center;font-size:110%">total resources cataloged: ${total}<p>`;
   return menu;
}


export function filterRdf(data,element){
  const wanted = element.wanted || element.getAttribute ?element.getAttribute('wanted') :null;
  const limit = element.limit || element.getAttribute ?element.getAttribute('limit') :null;
  let url = element.source;
  if(wanted) data = data.filter( (row)=> {
    let clauses = wanted.split(/\s*\|\|\s*/);
    for(let clause of clauses){
      let pred,obj;
      const ary = clause.split(/\s+/).filter(Boolean);
      pred = ary.shift();
      if(pred=='a') pred = "type";
      obj = ary.join(' ');
      if(typeof row[pred] =="undefined") row[pred] = "";
      if(!row.id.match(url)) continue;
      let tmpval = (typeof row[pred] =="string") ?row[pred] :row[pred].join(' ');
      if(row.id.match(url)&&(tmpval||"").match(obj)) return row;
    }
  });
  if(limit) data = data.slice(0,limit);
  return data;
}

/* MARKDOWN PARSING
*/
export async function markdownString2HTML(markdownString,dom){
  let htmlString="";
  if(!isoWin.marked && !inBrowser){
    isoWin.marked = await import('marked');
  }
  if(!isoWin.marked && inBrowser){  
    try { 
      await import("../node_modules/marked/marked.min.js");
      // await import("https://cdn.jsdelivr.net/npm/marked/marked.min.js");
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

/* LIBRARY LOADING UTILITIES
*/
export async function isoGetUI(){
    let config;
    if(typeof window !="undefined"){
      let browserUtils = await import('./browser-utils.js');
      config = browserUtils.fetchUI();
    }
    else {
      let nodeUtils = await import('./node-utils.js');
      config = nodeUtils.rdfConfig;
    }
    return config;
}
export async function getSingletonStore() {
  if(typeof store !="undefined") return { store,fetcher,updater,UI,sym,ns,lit };
  let config = await isoGetUI();
  if(!sym){
    sym = config.sym ;
    lit = config.lit ;
    ns = config.ns;
    store = config.store;
    fetcher = config.fetcher;
    updater= config.updater ;
    UI=config.UI;
  }
  return { store,fetcher,updater,UI,sym,ns,lit };
}  


/* DATA MANAGEMENT UTILITIES
*/
export function count(url,types){
    const node = sym(url);
    let showTypes = [];
    for(let name in types){
      let type = types[name] ?types[name].type :type;
      let stmts = store.match(null,nsp('rdf:type'),sym(type),node.doc()  );
      let count = stmts.length;
      showTypes.push( { name:types[name].label,count,type,page:types[name].page,tag:name } );
    }
    let total=0;
    for(let one in showTypes){ if(one=="total") continue; total+=showTypes[one].count; }
    showTypes.unshift(total);
    return showTypes;
}
export async function countOLD(url){
    rdf ||= await getSingletonStore();
    const node = rdf.sym(url);
    await rdf.fetcher.load(url);
    const types = getUniqueTypes(null, null, null, node.doc() );
    let all = [];
    for(let t of types){
      let typeStmts = rdf.store.match(null,null,t,node.doc()  );
      let key = getTerm(t.value)
      if(" MessageBoard, ChatChannel, MailingList, OngoingMeeting, Community, NGO, Corporation, CommunityGroup, ResarchOrganization, GovernmentalOrganization, ResearchProject, OpenIdService, OpenIdServer, ResearchOrganization, Project ".match(' '+key)) continue
       all[key]=typeStmts.length;
    }
    all.total=0;
    for(let one in all){ if(one=="total") continue; all.total+=all[one]; }
    return all;
}
async function getPredicates(url){
    rdf ||= await getSingletonStore();
    const node = rdf.sym(url);
    await rdf.fetcher.load(url);
    const stmts = rdf.store.match(null, null, null, node.doc() );
    let predicates= new Set();
    for(let s of stmts){ predicates.add( s.predicate.value );}
    predicates = Array.from(predicates);
    console.log(predicates);
}

// const filteredData = $rdf.serialize(null, filteredStore, 'https://example.com/filtered', 'text/turtle');

async function getMissing(url,wantedPred){
    rdf ||= await getSingletonStore();
    const node = rdf.sym(url);
    await rdf.fetcher.load(url);
    wantedPred = wantedPred ?nsp(wantedPred) :null;
    const subjects = getUniqueSubjects(null, null, null, node.doc() );
    for(let subject of subjects){
      let found = rdf.store.any(subject,wantedPred,null,node.doc());
      if(!found) console.log( subject.value );
    }
}

/* GENERAL UTILITIES
*/
export async function webOp(method,uri,options) {
  options ||= {};
  return new Promise( (resolve, reject) => {
    try {
      fetcher.webOperation(method, uri,options).then( async(response) => {
        if (response.ok) {
          resolve(response.responseText);
        }
        else {
          resolve(response.status + response.statusText);
        }
      });
    }
    catch(err){ 
      console.log(method,uri,options,err);
      resolve(err.status+err.statusText); 
    }
  });
}
export function nsp(prefixedTerm){
  if(prefixedTerm.startsWith('http')) return sym(prefixedTerm);
  const [prefix,term] = prefixedTerm.split(/:/);
//  if(prefix==="oar") return sym("https://github.com/solid/organizations/vocabulary/oar.ttl#"+term);
  if(prefix==="soar") return sym("http://example.com/soar#"+term);
  if(prefix==="siocs") return sym("http://rdfs.org/sioc/services#"+term);
  if(prefix==="sioct") return sym("http://rdfs.org/sioc/types#"+term);
  if(prefix==="sh") return sym("http://www.w3.org/ns/shacl#"+term);
  if(prefix==="skos") return sym( "http://www.w3.org/2004/02/skos/core#"+term);
  if(! ns[prefix]) { console.log( `unrecognized prefix '${prefixedTerm}'`); }
  return sym( ns[prefix](term) );
}
export function bestComment(subject,graph){
  return UI.store.any(subject,UI.ns.rdfs('comment'),null,graph)
      || UI.store.any(subject,UI.ns.schema('description'),null,graph);
}
export function bestLink(subject,graph){
  const recalls = UI.rdf.sym('http://www.w3.org/2002/01/bookmark#recalls');
  return UI.store.any(subject,recalls,null,graph)
      || UI.store.any(subject,UI.ns.schema('url'),null,graph)
      || subject;
}
export function bestLabel(node){
  try{
    if(typeof node==="string")  node = sym(node) ;
    let label = store.any(node,nsp('vcard:fn'))
        || store.any(node,nsp('foaf:fname'))
        || store.any(node,nsp('schema:name'))
        || store.any(node,nsp('doap:name'))
        || store.any(node,nsp('dct:title'))
        || store.any(node,nsp('rdfs:label'))
        || store.any(node,nsp('skos:label')
        || store.any(node,nsp('ui:label')) );
     return label ?label.value :node.value.replace(/.*\//,'').replace(/.*#/,'').replace(/-/g,'_');
  }
  catch(e) { console.log(e); return node }
}
function getTerm(value){
  if(!value) return "";
  if(value.value) value = value.value;
  return value.replace(/.*#/,'').replace(/.*\//,'').replace(/-/g,'_');
}
function getUniqueSubjects(s,p,o,g){
  const uniqueSubjects = new Set();
  let stmts = rdf.store.match(s,p,o,g); 
  for(let stmt of stmts) {
    uniqueSubjects.add(stmt.subject);
  };
  return Array.from(uniqueSubjects);
}
function getUniquePredicates(s,p,o,g){
  const uniquePredicates = new Set();
  let stmts = rdf.store.match(s,p,o,g); 
  for(let stmt of stmts) {
    uniquePredicates.add(stmt.predicate);
  };
  return Array.from(uniquePredicates);
}
function getUniqueTypes(s,p,o,g){
  o =  nsp('rdf:type');
  const uniqueTypes = new Set();
  let stmts = rdf.store.match(null,null,null,g);
  for(let s of stmts){
    if(s.predicate.value==o.value) uniqueTypes.add(s.object);
  }
  return Array.from(uniqueTypes);
}

/* SEARCHING 
*/
function getWanted(element){
    element.wanted ||= element.getAttribute ?element.getAttribute('wanted') :null;
    if(!element.wanted) return {};
    let clauses = element.wanted.split(/\|\|/);
    let searchAry = [];
    for(let clause of clauses){
      const ary = clause.split(/\s+/).filter(Boolean);
      let predicate = ary.shift().trim();
      if(predicate=='a') predicate = "type";
      let value = ary.join(' ').trim();
      searchAry.push( {predicate,value} );
  }
  return searchAry;
}
