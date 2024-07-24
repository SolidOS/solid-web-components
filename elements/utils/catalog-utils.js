import {getSingletonStore,nsp,rmp} from './rdf-utils.js';
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
  'http://usefulinc.com/ns/doap#service_endpoint'   : "serviceEndpoint",
  'http://usefulinc.com/ns/doap#repository'         : "repository",
  'http://usefulinc.com/ns/doap#homepage'           : "homepage",
  'http://schema.org/webpage'                       : "homepage",
  'http://schema.org/alternateName'                 : "alternateName",
  'http://schema.org/url'                           : "webpage",
  'http://xmlns.com/foaf/0.1/homepage'              : "homepage",
  "http://www.w3.org/ns/dcat#landingPage"           : "landingPage"
};
function getTerm(value){
  return value.replace(/.*#/,'').replace(/.*\//,'')
}

export async function catalog(element){
  rdf = await getSingletonStore();
  let url = element.source;
  let node = rdf.sym(url);
  let doc  = node.doc();
  let initialSubject = (doc.value == url) ?null :node;
  let table = [];
  try {
    await rdf.fetcher.load(doc);
    const subjects = getUniqueSubjects(initialSubject, null, null, doc );
    for(let subject of subjects){
      let row = {
        id : subject.uri,
        otherPreds : "",
      };
      let predicates = getUniquePredicates(subject,null,null,doc);
      for(let predicate of predicates){
        let objects = rdf.store.each(subject,predicate,null,doc);
        let knownPred = predMap[predicate.value];
        let predLabel = predicate.value.replace(/.*#/,'').replace(/.*\//,'');
        row[ knownPred ] ||= [] ;
        if(knownPred) {
          for(let object of objects){
            let value = object.value;
            if(knownPred=="type") value = getTerm(value);
            if(knownPred=="description") value = `<p style="max-width:50ch">${value}</p>`;
            if(knownPred.match(/(serviceEndpoint|repository|homepage|webpage|videoCall|landingPage)/)){
              row[knownPred].push(`<a href="${value}">${knownPred}</a>`);
            }
            else {
              row[knownPred].push( value );
            }
          }
        }
        else {
          row[predLabel] ||= [] ;
          for(let object of objects){
            row[predLabel].push( object.value );
            let regex = new RegExp(url);
            let ovalue = getTerm( object.value.replace(regex,'') );
            row.otherPreds += `<div><span style="width:18ch;text-align:right;margin-right:1rem;display:inline-block">${predLabel}</span><span>${ovalue}</span></div>`;
          }
        }
      }
      for(let key of Object.keys(row)){ 
        if(row[key].length===0) row[key]="";
        if(row[key].length===1) row[key]=row[key][0] 
      }
      table.push(row)
    }
    return(table);
  }
  catch(e){console.log(e)}
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
      if(" MessageBoard, ChatChannel, MailingList, OngoingMeeting, Community, NGO, Corporation, CommunityGroup, ResarchOrganization, GovernmentalOrganization, ResearchProject, OpenIdService, OpenIdServer, ".match(' '+key)) continue
       all[key]=typeStmts.length;
    }
    all.total=0;
    for(let one in all){ if(one=="total") continue; all.total+=all[one]; }
    return all;
}

async function getOrgs(url){
    rdf ||= await getSingletonStore();
    const node = rdf.sym(url);
    await rdf.fetcher.load(url);
    const types = getUniqueTypes(null, null, null, node.doc() );
    let all = [];
    for(let t of types){
      let typeStmts = rdf.store.match(null,null,t,node.doc()  );
      let key = getTerm(t.value)
      if(" MessageBoard, ChatChannel, MailingList, OngoingMeeting, Community, NGO, Corporation, CommunityGroup, ResarchOrganization, GovernmentalOrganization, ResearchProject, OpenIdService, OpenIdServer, ".match(' '+key)) continue
       all[key]=typeStmts.length;
    }
    all.total=0;
    for(let one in all){ if(one=="total") continue; all.total+=all[one]; }
    return all;
}

/* FOLLOWING WORKS IN NODE */
(async()=>{ 
  console.log(
//    await count("http://localhost:8444/home/s/solidify/build/all.ttl")
  )
})();
