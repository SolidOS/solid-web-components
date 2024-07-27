let lit,sym,ns,store,fetcher,updater,UI;

export {sym,lit};

export async function isoGetUI(){
    let config;
    if(typeof window !="undefined"){
      let browserUtils = await import('./browser-utils.js');
      config = browserUtils['fetchUI']();
    }
    else {
      let nodeUtils = await import('./node-utils.js');
      config = nodeUtils['rdfConfig'];
    }
    return config;
}
export async function getSingletonStore() {
  if(store) { store,fetcher,updater,UI,sym,ns,lit };
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
      const tmpval = (typeof row[pred] =="string") ?row[pred] :row[pred].join(' ');
      if(row.id.match(url)&&(tmpval||"").match(obj)) return row;
    }
  });
  if(limit) data = data.slice(0,limit);
  return data;
}

export async function fetchRdfData(component){ 
  let config={store,fetcher,updater}
  let url = config.source = component.source;
  config.shapeUrl = component.shape;
  config.targetClass = component.targetClass;
  let shape = new RDFfetcher( config );
  if(component.raw) shape.raw=true;
  let data = url.match(/#/) ?await shape.get(url) :await shape.getAll(url);
  return data;
}

export class RDFfetcher {

  constructor(config) {
    this.source = config.source;
    this.store = config.store;
    this.fetcher = config.fetcher;
    this.updater = config.updater;
    this.shapeUrl  = config.shapeUrl;
    this.targetClass  = config.targetClass;
 }
  async get(url) {
    try {
      await this.fetcher.load(url);
      return [ await this.getOne( sym(url) ) ];
    }
    catch(e) { console.log(e); }
  }
  async getAll(url) {
    let all = [];
    try {
      let node = sym(url);
      await this.fetcher.load(url);
      let data;
      if(this.targetClass){
        data = this.store.match( null, nsp('rdf:type'), nsp(this.targetClass), node.doc() )
        for(let row of data){
          all.push(await this.getOne(row.subject))
        }
      }
      else {
        let subjects = this.store.match(null,null,null,node.doc()).map(stmt => {
          if(typeof stmt.subject.value !=undefined) return stmt.subject.value;
        });
        // get unique subjects (include only the first occurrence of an element in an array)
        subjects = subjects.filter((value, index, self) => self.indexOf(value) === index);
        for(let subject of subjects){
          all.push(await this.getOne(sym(subject)));
        }
      }
for(let a of all) { if( a.id.match(/n0/)) console.log(44,a.id) }

      return(all)
    }
    catch(e) { console.log(e); }
  }
  async getOne(subject) {
    const predicates = this.store.statementsMatching(subject,null,null,subject.doc()).map(stmt => stmt.predicate);
    let row = {
      id: subject.value,
    };
    if(this.targetClass) row.targetClass = this.targetClass
    for(let predicate of predicates){
      let key = predicate.value.replace(/.*\//,'').replace(/.*#/,'');
      key=key.replace(/-/,'_');
      row =  this.getObjects( row,key,subject,predicate );
    }
    return row;
  }
  getObjects(row,key,subjectNode,predicate){
    let all=[];
    row[key] = [];
    let objects = this.store.each( subjectNode, predicate, null, subjectNode.doc() );
    for(let object of objects){
        all.push(object.value);
/*
      if(key==='image') {
        let image = object.value;
        if(image){
          row.image = `<img src="${image}" />`;
        }
        return row;
      }
      if(object.termType != "NamedNode"){
         all.push(object.value);
         continue;
      }
      let label = (this.store.any(object,nsp('schema:name'))||{}).value;
      if(!label){
          let hashnums =  (object.value.match(new RegExp('#', "g")) || []).length;
          label = hashnums===1 
                ? object.value.replace(/.*#/,'')
                : object.value;
      }
      let id = object.value;
      if(this.raw) all.push( {id,label} );
      else {
        if(id.match(this.source)||key=="additionalType"){ // is reference to object from same source
          all.push(label);
        }
        else {
//          all.push(`<a property="${predicate.value}" href="${id}">${label}</a>`);
          all.push(label);
        }
      }
*/
    }
    if(this.raw) {
      all = all.length===1 ?all[0] :all;
      if(all.length===0) all = "";
      if(all.length===1) all = all[0];
      row[key] = all;
      return row;
    }
    else {
      row[key] = all.length>0 ?all.join(', ') :"";
      return row;
    }
  }
}

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
  if(prefix==="oar") return sym("https://github.com/solid/organizations/vocabulary/oar.ttl#"+term);
  if(prefix==="siocs") return sym("http://rdfs.org/sioc/services#"+term);
  if(prefix==="sioct") return sym("http://rdfs.org/sioc/types#"+term);
  if(prefix==="sh") return sym("http://www.w3.org/ns/shacl#"+term);
  if(prefix==="skos") return sym( "http://www.w3.org/2004/02/skos/core#"+term);
  if(! ns[prefix]) { console.log( `unrecognized prefix '${prefixedTerm}'`); }
  return sym( ns[prefix](term) );
}

export function rmp(unPrefixedTerm){
  let term = unPrefixedTerm.match(/#/)
           ? unPrefixedTerm.replace(/.*#/,'')  
           : unPrefixedTerm.replace(/.*\//,'') ;
  let vocab = unPrefixedTerm.match(/#/)
            ? unPrefixedTerm.replace(/#.*/,'#')  
            : unPrefixedTerm.replace(/\/[^\/]+$/,'/') ;
  let prefix;
  if(vocab=="https://github.com/solid/organizations/vocabulary/oar.ttl#") prefix="oar:";
  if(vocab=="http://rdfs.org/sioc/services#") prefix="siocs:";
  if(vocab=="http://rdfs.org/sioc/types#") prefix="sioct:";
  if(vocab=="http://www.w3.org/ns/shacl#") prefix="shacl:";
  if(vocab=="http://www.w3.org/2004/02/skos/core#") prefix="skos:";
  if(!prefix){
    prefix = Object.keys(ns).find(key => ns[key] === $rdf.Namespace(fullUri).uri);
  }
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
     return label ?label.value :node.value.replace(/.*\//,'').replace(/.*#/,'');
  }
  catch(e) { console.log(e); return node }
}



