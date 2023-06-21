import * as util from './sol-utils.js';
// import {sparqlQuery} from './sparql.js';
import {results2table} from './display.js';

export class SolSparql extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  async connectedCallback(){
    let shadow = this.shadowRoot;
    let endpoint,template,query,queryParam;
    template =  (this.querySelector('template').innerHTML).trim();
    query = (this.querySelector('script').innerText).trim();
    endpoint = this.querySelector('endpoint').innerHTML;
    endpoint = util.rel2absIRI(endpoint.trim());
    let resultElement;
    try {
      let results = await sparqlQuery( endpoint, query );
      if(template==='ui:Table'){
        resultElement = results2table(results);
      }
      else {
        let resultsString = "";
        for(let row of results){
          for(let k of Object.keys(row)){
            row[k]=row[k].replace(/^"/,'').replace(/"$/,'').replace(/"@en$/,'')||"";
          }
          resultsString += template.interpolate(row);
        }
        resultElement = document.createElement('DIV');
        resultElement.innerHTML = resultsString;     
      }
    }
    catch(e) { console.log(e); }
    shadow.appendChild(resultElement)
  }
}
customElements.define("sol-sparql",SolSparql);

  export async function sparqlQuery(endpoint,queryString,forceReload){
    if( endpoint.startsWith('/') ){
      endpoint = window.origin + endpoint;
    }
    else if( endpoint.startsWith('./') ){
      let loc = window.location.href;
      endpoint = loc.replace(/\/[^\/]*$/,'') + endpoint.replace(/^\./,'');
    }
    if(typeof Comunica !="undefined")
      return await _comunicaQuery(endpoint,queryString,forceReload);
    else   
      return await _rdflibQuery(endpoint,queryString,forceReload);  
  }

  async function _rdflibQuery(endpoint,queryString,forceReload){
    const kb = UI.rdf.graph();
    const fetcher = UI.rdf.fetcher(kb);
    await kb.fetcher.load(endpoint);
    try {
      const preparedQuery=await UI.rdf.SPARQLToQuery(queryString,false,kb);
      let wanted = preparedQuery.vars.map( stm=>stm.label );
      let table = [];
      let results = kb.querySync(preparedQuery);
      for(let r of results){
        let row = {};
        for(let w of wanted){
          let value = r['?'+w];
          row[w] = value ?value.value :"";
        }
        table.push(row);
      }
      table = table.sort((a,b)=>a.label > b.label ?1 :-1);
      return table
    }
    catch(e) { console.log(e); }
  }

  async  function _comunicaQuery(endpoint,sparqlStr,forceReload){
   try {
    let comunica = new Comunica.QueryEngine();
    if(forceReload) comunica.invalidateHttpCache();
    function munge(x){
       return x ? x.replace(/^"/,'').replace(/"[^"]*$/,'') :"";
    }
    let bindingStream;
    try { 
      bindingStream = await comunica.queryBindings(sparqlStr,{sources:[endpoint]}); 
    }
//    try { result = await comunica.query(sparqlStr,{sources:[endpoint]}) ; }
    catch(e){alert(e); return};
    let wanted = bindingStream.variables;
    let result = await bindingStream.toArray()
    let table = [];
    let hash = {};
    for(let e of result) {
      let ary = e.entries._root.entries;
      let row = {} ;
      for(let i of ary){
        let key = i[0];
        let value = i[1];
        if( typeof row[key] != 'ARRAY' ) row[key]= [row[key]]
        if( typeof row[key] === "ARRAY" ) row[key].push(value.id)
        else row[key] = value.id;
      }
      table.push(row);
    }
    if(!table.length) console.log('No results!');
    return table;
   }
   catch(e){console.log(e)}
  }

function flatten(results,groupOn){
  const newResults = {};
  for(let row of results) {
    let key = row[groupOn];
    if(!newResults[key]) newResults[key]={};
    for(let k of Object.keys(row)){
      if(!newResults[key][k]) {
        newResults[key][k]=row[k];
        continue;
      }  
      if(newResults[key][k].includes(row[k])) continue;
      if(typeof newResults[key][k]!="object") newResults[key][k]=[newResults[key][k]]
      newResults[key][k].push(row[k])
    }
  }
  results = [];
  for(let n of Object.keys(newResults)){
    results.push(newResults[n])
  }
  return results;
} 

