import {getSingletonStore,nsp,rmp,bestLabel} from './rdf-utils.js';
import {wantedProperties,wantedTypes} from './catalog-definition.js';
let rdf;

const predMap = {
  "https://github.com/solid/organizations/vocabulary/oar.ttl#name" : "name",
  'http://purl.org/dc/terms/title'              : "name",
  'http://www.w3.org/2000/01/rdf-schema#label'  : "name",
  'http://xmlns.com/foaf/0.1/fname'              : "name",
  'http://www.w3.org/2006/vcard/ns#fn'           : "name",
  'http://schema.org/name'                       : "name",
  'http://usefulinc.com/ns/doap#name'            : "name",
  'http://www.w3.org/2004/02/skos/core#label'    : "name",
  'http://www.w3.org/ns/ui#label'                : "name",
  "https://github.com/solid/organizations/vocabulary/oar.ttl#description" : "description",
  'http://schema.org/description'                : "description",
  'http://usefulinc.com/ns/doap#description'     : "description",
  'http://www.w3.org/2000/01/rdf-schema#comment' : "description",
  "https://github.com/solid/organizations/vocabulary/oar.ttl#type" : "type",
  'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' : "type",
  'http://schema.org/additionalType'                : "type",
  "https://github.com/solid/organizations/vocabulary/oar.ttl#image" : "image",
  'http://schema.org/image'                         : "image",
  'http://schema.org/screenshot'                    : "image",
  'http://schema.org/logo'                          : "image",
  "https://github.com/solid/organizations/tree/main/vocabularies/oar.ttl#videoCallPage" : "videoCall",
  'http://schema.org/service-endpoint'              : "serviceEndpoint",
  'http://rdfs.org/sioc/services#service_endpoint'  : "serviceEndpoint",
  'http://usefulinc.com/ns/doap#service_endpoint'   : "serviceEndpoint",
  'http://usefulinc.com/ns/doap#repository'         : "repository",
  'http://usefulinc.com/ns/doap#homepage'           : "homepage",
  'http://usefulinc.com/ns/doap#wiki'               : "wiki",
  'http://www.w3.org/ns/solid/terms#webid'          : "webid",
  'http://schema.org/webpage'                       : "homepage",
  'http://schema.org/alternateName'                 : "alternateName",
  'http://schema.org/url'                           : "webpage",
  'http://xmlns.com/foaf/0.1/homepage'              : "homepage",
  "http://www.w3.org/ns/dcat#landingPage"           : "landingPage"
};

function getTerm(value){
  if(!value) return "";
  if(value.value) value = value.value;
  return value.replace(/.*#/,'').replace(/.*\//,'').replace(/-/g,'_');
}


export async function catalog(element,raw){
  element.raw = raw;
  rdf = await getSingletonStore();
  let url = element.source;
  let node = rdf.sym(url);
  let doc  = node.doc();
  try { await rdf.fetcher.load(doc); }
  catch(e){ console.log(e)}
  let wanted = getWanted(element);
  let table = [];
  let uniqueSubjects = getUniqueSubjects( null, null, null, doc )
  for(let subject of uniqueSubjects){
    if( wanted.predicate==='id' && subject.value != wanted.value ) continue;
    let row = catalogRow(subject,wanted,element)
    if(row) table.push(row)
  }
  table.sort((a, b) => (a.name||"").localeCompare(b.name||""));
  // console.log(rdf.store.namespaces) lists prefixes in loaded doc & their urls
  return(table);
}
function catalogRow(subject,wanted,element){
  let row = { id: subject.value  };
  let rowPredicates = getUniquePredicates( subject, null, null, subject.doc() );
  let found = wanted ?false :true;
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
      if( wanted.predicate===propertyLabel && o.value === wanted.value ) found = true ;
      if( wanted.predicate===propertyLabel && getTerm(o.value) === wanted.value ) found = true ;
      if(predicate.value.match(/(service-endpoint|repository|homepage|webpage|videoCallPage|landingPage|wiki|webid)/)){
        if(element.raw){
          row[propertyLabel].push(o.value);
        }
        else {
          row[propertyLabel].push(`<a href="${o.value}" property="${predicate}" target="_BLANK">${displayLabel}</a>`);
        }
      }
      else {
        displayLabel = bestLabel(o).replace(/_/g,' ') ;
        if(o.termType=="NamedNode" || o.termType=="BlankNode"){
          if(element.raw){
            row[propertyLabel].push(o.value);
          }
          else {
            row[propertyLabel].push(`<a href="${o.value}" property="${predicate}">${displayLabel}</a>`);
          }
        }
        else {
          if(element.raw){
           row[propertyLabel].push(o.value);
          }
          else {
            row[propertyLabel].push(`<span property="${predicate}">${o.value}</span>`);
          }
        }
      }
    }
  }
  if(wanted.predicate==="ft"){
    for(let k of Object.keys(row)){
      let got = row[k];
      if(typeof got != "string") got = got.join(' ');
      if(got.toLowerCase().match(wanted.value.toLowerCase())) found = true;
    }
  }
  if(!found) return null;
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
  for(let key of wantedProperties){ 
    key = getTerm(key);
    if(!row[key]) row[key]= "";
  }
  return(row)
}
function getWanted(element){
    if(!element.wanted) return {};
    const ary = element.wanted.split(/\s+/).filter(Boolean);
    let predicate = ary.shift();
    if(predicate=='a') predicate = "type";
    let value = ary.join(' ');
    return {predicate,value};
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

async function count(url){
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

/* FOLLOWING WORKS IN NODE */
(async()=>{ 
//    await getMissing("http://localhost:8444/home/s/solidify/build/all.ttl",'schema:name')
  console.log(
//    await getPredicates("http://localhost:8444/home/s/solidify/build/all.ttl")
    await count("http://localhost:8444/home/s/solidify/build/all.ttl")
//    await count("http://localhost:8444/home/s/solidify/build/prozion.ttl")
  )
})();
