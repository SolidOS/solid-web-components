import {defineRdfObject} from './isomorphic.js';

export async function fetchRdfData(element){
  let done = {};
  let aoh = [];
  let source = await rdfLoad(element.source);
  const triples = element.source.match(/#/) 
                ? store.match(source,null,null,source.doc()) 
                : store.match(null,null,null,source.doc());
  for(let t of triples){
    let subject = t.subject;
    if(done[subject.value]) continue;
    done[subject.value]=true;
    const predicates = store.match(subject,null,null,source.doc());
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
      if(subj=="*"){
        if(row[pred].match(obj)) aoh.push(row)
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
    await fetcher.load(uri)
  }catch(err){console.log("URI LOAD ERROR",err)}
  else try {
    let pkg = await import('./file-io.js');
    let filePath = uri.replace(/^file:\/\//,'').replace(/\#.*/,'');
    uri = $rdf.sym(uri);
    let content = await pkg.readFileAsync(filePath,'utf8');
    try {
      $rdf.parse(content, store, uri.doc().value, 'text/turtle');
    }catch(err){console.log("FILE PARSE ERROR: ",err)}
  }catch(err){console.log("FILE READ ERROR: ",err)}
  return sym(uri);
}
export function rdfMatch(s,p,o,g){
  if(s && typeof s=="string") s = sym(s);
  if(p && typeof p=="string") p = sym(p);
  if(o && typeof o=="string") o = sym(o);
  if(g && typeof g=="string") g = sym(g);
  return store.match(s,p,o,g);
}
export function rdfRemove(...args){
  return store.remove(args);
}
export async function rdfPutBack(uri,kb){
  kb ||= store;
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
    const node = $rdf.sym(uri);
    $rdf.serialize(node, kb, uri, 'text/turtle', async (err,turtleString) => {
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
    fetcher.webOperation(method, uri,options).then( async(response) => {
      if (response.ok) {
        resolve(response.responseText);
      }
      else {
        reject(new Error(`Error fetching data from '${uri}' : ${response.statusText}`));
      }
    });
  });
}
/* Dynamically import rdflib if called from command line.
     Else use the UI object from solid-ui or panes or mashib
     imported by user in a script tag.
*/
let store; let fetcher; let sym; let $rdf;
export async function checkRdfObject(){
  if(!store) {
    const handler = await defineRdfObject();
    store = handler.store;
    fetcher = handler.fetcher;
    sym = handler.sym;
    $rdf = handler.rdf;
  }
}
