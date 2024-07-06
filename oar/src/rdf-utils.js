let lit,sym,ns,store,fetcher,updater;

export {sym,lit};

export function getSingletonStore(config) {
  if(!sym){
    sym = config.sym ;
    lit = config.lit ;
    ns = config.ns;
    store = config.store;
    fetcher = config.fetcher;
    updater= config.updater ;
  }
  return { store,fetcher,updater };
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
export async function fillTemplate(element,dataAOH){
  const document = element.ownerDocument;
  let tmp = element.getAttribute('view');
  let template;
  if(tmp.match('#')) {
    template = document.querySelector(tmp).innerHTML;
  }
  else {
    template = await webOp('GET',element.view);
  }
  let resultsString = "";
  for(let row of dataAOH){
     try {
       resultsString += template.interpolate(row);
     } 
     catch(e){console.log(e)}
  }
  const el = document.createElement('DIV');
  el.innerHTML = resultsString;
  return el;
}
String.prototype.interp = function(params) {
  const names = Object.keys(params);
  for(let n of names){
    params[n] ||= ""; // MISSING VALUES DO NOT ERROR
  };
  const vals =  Object.values(params);
  return new Function(...names, `return \`${this}\`;`)(...vals);
}   
export function nsp(prefixedTerm){
  if(prefixedTerm.startsWith('http')) return sym(prefixedTerm);
  const [prefix,term] = prefixedTerm.split(/:/);
  if(prefix==="oar") return sym("https://github.com/solid/organizations/vocabulary/oar.ttl#"+term);
  if(prefix==="siocs") return sym("http://rdfs.org/sioc/services#"+term);
  if(prefix==="sioct") return sym("http://rdfs.org/sioc/types#"+term);
  if(prefix==="sh") return sym("http://www.w3.org/ns/shacl#"+term);
  if(! ns[prefix]) { console.log( `unrecognized prefix '${prefixedTerm}'`); }
  return sym( ns[prefix](term) );
}

