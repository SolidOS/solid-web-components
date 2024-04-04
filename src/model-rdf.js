import {isoWin,defineRdfObject} from './isomorphic.js';
/*
  label = skos:prefLabel, rdfs:label, dct:title, schema:name, foaf:name, vcard:fn, or UI.utils.label(node)
  comment = rdfs:comment; schema:description
  link = bookmark:recalls, schema:url
*/
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

export async function fetchRdfData(element){
  let done = {};
  let aoh = [];
  let source = await rdfLoad(element.source);
  const triples = element.source.match(/#/) 
                ? UI.store.match(source,null,null,source.doc()) 
                : UI.store.match(null,null,null,source.doc());
  for(let t of triples){
    let subject = t.subject;
    if(done[subject.value]) continue;
    done[subject.value]=true;
    const predicates = UI.store.match(subject,null,null,source.doc());
    let row = {id:subject.value};
    for(let p of predicates){
      let key = p.predicate.value.replace(/.*\//,'').replace(/.*#/,'');
      let val = p.object.value; 
      if(row[key]){
        row[key] += "," + val;"," + val;
      }
      else row[key] = val;
    }
    if(element.wanted){
      let subj,pred,obj;
      const ary = element.wanted.split(/\s+/).filter(Boolean);
      subj = ary.shift();
      pred = ary.shift();
      obj = ary.join(' ');
      if(pred=='a') pred = "type";
      if(subj=="*"){
        if(row[pred] &&row[pred].match(obj)) aoh.push(row)
      }
      else{
        if(row.id.match(subj)&&row[pred].match(obj)) aoh.push(row)
      }
    }
    else {
      aoh.push(row);
    }
  }
  return aoh;
}

export async function rdfLoad(uri){
  await checkRdfObject();
  if(uri.startsWith('http')) try {
    await UI.store.fetcher.load(uri)
  }catch(err){console.log("URI LOAD ERROR",err)}
  else try {
    let pkg = await import('./file-io.js');
    let filePath = uri.replace(/^file:\/\//,'').replace(/\#.*/,'');
    uri = UI.rdf.sym(uri);
    let content = await pkg.readFileAsync(filePath,'utf8');
    try {
      UI.rdf.parse(content, UI.store, uri.doc().value, 'text/turtle');
    }catch(err){console.log("FILE PARSE ERROR: ",err)}
  }catch(err){console.log("FILE READ ERROR: ",err)}
  return UI.rdf.sym(uri);
}
export function rdfMatch(s,p,o,g){
  if(s && typeof s=="string") s = UI.rdf.sym(s);
  if(p && typeof p=="string") p = UI.rdf.sym(p);
  if(o && typeof o=="string") o = UI.rdf.sym(o);
  if(g && typeof g=="string") g = UI.rdf.sym(g);
  return UI.store.match(s,p,o,g);
}
export function rdfRemove(...args){
  return UI.store.remove(args);
}
export async function rdfPutBack(uri,kb){
  kb ||= UI.store;
  const stmts = kb.match();
  if(uri.startsWith('http')) try {
    await kb.fetcher.putBack(uri)
  }catch(err){console.log("PUTBACK ERROR",err)}
  else try {
    // serialize to string, write to file
    for(let s of stmts){
      console.log(s.subject.value,s.predicate.value,s.object.value)
    }
    return;
    const node = UI.rdf.sym(uri);
    UI.rdf.serialize(node, kb, uri, 'text/turtle', async (err,turtleString) => {
      if(err) {
        console.log('SERIALIZE ERROR : ',err)
        return;
      }
      console.log('yy '+turtleString)
      let pkg = await import('./file-io.js');
    //  let pathName = uri.replace(/^file:\/\//,'');
    //  await pkg.writeFileAsync(pathName,turtleString);
    });
  }catch(err){console.log("FILE WRITE ERROR",err)}
}

export async function webOp(method,uri,options) {
  await checkRdfObject();
  return new Promise( (resolve, reject) => {
    try {
      UI.store.fetcher.webOperation(method, uri,options).then( async(response) => {
        if (response.ok) {
          resolve(response.responseText);
        }
        else {
          resolve(response.status + response.statusText);
        }
      });
    }
    catch(err){ resolve(err.status+err.statusText); }
  });
}
/* If mashlib or solid-ui is loaded, use their exported UI object
   Else expect user to have imported rdflib and ns and create a dummy UI object from them.
*/
export async function checkRdfObject(){
  if(typeof UI==="undefined") {
    isoWin.UI = global.UI = {
      store : global.sol.store,
         ns : global.sol.ns,
        rdf : global.sol.$rdf,
    };
  }
}
