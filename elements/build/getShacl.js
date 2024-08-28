import {nsp,getTerm,getSingletonStore} from '../utils/rdf-utils.js';
const shape = 'http:localhost:8444/home/s/solid-web-components/elements/build/catalog.ttl#SolidProjectResourceShape';

export async function getShacl(shape){
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

(async()=>{
  let [p,t] = await getShacl(shape);
  console.log(p,t);
})();


