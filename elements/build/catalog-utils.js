import {nsp,getTerm,getSingletonStore} from './rdf-utils.js';

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





/*
export async function catalogMenu(element){
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



(async()=>{
  const shape = 'http:localhost:8444/home/s/solid-web-components/elements/build/catalog.ttl#SolidProjectResourceShape';
  let [p,t] = await getShacl(shape);
  console.log(p,t);
})();
*/

