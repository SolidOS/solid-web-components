import {nsp,getTerm,getSingletonStore} from './rdf-utils.js';
import {getLinkFromAttr} from './utils.js';

export async function getShacl(shape){
   if(!shape) return [{},{}];
   let wantedProperties = {};
   let wantedTypes = {};
   try {
     let rdf = await getSingletonStore();
     let node = rdf.sym(shape);
     let doc = node.doc();
     await rdf.fetcher.load(doc);
     let properties = rdf.store.each(node,nsp('sh:property'),null,doc);     
     for(let property of properties){
       let path = rdf.store.any(property,nsp('sh:path'),null,doc);
       let label = rdf.store.any(property,nsp('rdfs:label'),null,doc);
       wantedProperties[label.value] = path.value ;
     }
     let types = rdf.store.any(node,nsp('sh:or'),null,doc);     
     for(let type of types.elements){
       let tclass = rdf.store.any(type,nsp('sh:targetClass'),null,doc);
       wantedTypes[ getTerm(tclass) ] = {
          type : tclass.value,
         label : (rdf.store.any(tclass,nsp('rdfs:label'),null,doc)||{}).value,
       };
       let subclasses = rdf.store.each(null,nsp('rdfs:subClassOf'),tclass,doc);
       if(!subclasses.length) continue;
       let row = wantedTypes[ getTerm(tclass) ].subtypes = {};
       for(let sub of subclasses){
         row[ getTerm(sub) ] = {
              type : sub.value,
             label : (rdf.store.any(sub,nsp('rdfs:label'),null,doc)||{}).value,
         }
       }
       
     }
     return( [wantedProperties,wantedTypes]);
   }
   catch(e){ console.log(e) }
}

export async function catalogMenu(element){
   const source = getLinkFromAttr(element,'source');
   const view = getLinkFromAttr(element,'view');
   let rdf = await getSingletonStore();
   await rdf.fetcher.load(source);   
   let showTypes = count(source,rdf,element.wantedTypes);
   let total = showTypes.shift();   
   let menu = "<sol-menu>";
   for(let t of showTypes){
     if(t.page){
       menu += `<link label="${t.name}" source="${t.page}" count="${t.count}" linkType="component" />\n`;
     }
     else if(t.subtypes && Object.values(t.subtypes)[0].label ){
       menu += `<link label="${t.name}" view="${view}" source="${source}" wanted="a ${t.type}" count="${t.count}" linkType="catalog-tabset" />\n`;
     }
     else {
       menu += `<link label="${t.name}" view="${view}" source="${source}" wanted="a ${t.type}" count="${t.count}" linkType="catalog-page" />\n`;
     }
   }
   menu += "</sol-menu>\n";
   menu += `<p style="text-align:center;font-size:110%">total resources cataloged: ${total}<p>`;
   return menu;
}

export function count(url,rdf,types){
    const node = rdf.sym(url);
    let showTypes = [];
    for(let name in types){
      let typeObj = types[name];
      let type = typeObj ?typeObj.type :type;
      let stmts;
      let count=0;
      if( typeObj.subtypes ){
        for(let sub of Object.values(typeObj.subtypes)){
          stmts = rdf.store.match(null,nsp('rdf:type'),rdf.sym(sub.type),node.doc()  );
          count = count + stmts.length;
        }
      }
      else {
        stmts = rdf.store.match(null,nsp('rdf:type'),rdf.sym(type),node.doc()  );
        count = stmts.length;
      }
      showTypes.push( { name:types[name].label,count,type,page:types[name].page,tag:name,subtypes:types[name]['subtypes'] } );
    }
    let total=0;
    for(let one in showTypes){ if(one=="total") continue; total+=showTypes[one].count; }
    showTypes.unshift(total);
    return showTypes;
}

/* DATA MANAGEMENT UTILITIES
*/
export function unknownTypes(url,types,doc){
  if(!types) return null;
  const node = sym(url);
  let knownTypes = {};
  for(let key of Object.keys(types)){
    let type = types[key];
    knownTypes[type.type]=1
    if(type.subtypes){
      for(let key2 of Object.keys(type.subtypes)){
        let ktype = type.subtypes[key2];
        knownTypes[ktype.type]=1
      }
    }
  }
  let unknownTypes = {};
  let allTypes = store.match(null,nsp('rdf:type'),null,doc);
  for(let stmt of allTypes){
    let t = stmt.object.value;      
    if(!knownTypes[t]) unknownTypes[t]=1;
  }
  if(Object.keys(unknownTypes).length<1)   console.log("There are no unknown Types!")
  else console.log("There are unknown types : ",unknownTypes)
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


/*
(async()=>{
  const shape = 'http:localhost:8444/home/s/solid-web-components/elements/build/catalog.ttl#SolidProjectResourceShape';
  let [p,t] = await getShacl(shape);
  console.log(p,t);
})();
*/

