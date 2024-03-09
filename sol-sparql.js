//import * as util from './drafts-old/sol/libs/utils.js';
//import {showNamedTemplate,results2table} from './drafts-old/sol/libs/display.js';
import {fetchNonRdfData} from './src/model.js';
import {rel2absIRI} from './src/utils.js';

export async function fetchSparqlData(element){
    let endpoint = element.getAttribute('endpoint');
    endpoint = await rel2absIRI(endpoint.trim());
    let query = (await fetchNonRdfData({
      source : element.source,
      type : 'html',
      queryParam : element.queryParam,
    })).trim();
    let prefixes = `PREFIX : <#>\n`;
    for(let p of query.split(/\s/)){
      if(!p.match(/[^\s]+[^\s]+/)) continue;
      const prefix = (p.split(/:/))[0];
      if(UI.ns[prefix]) {
        prefixes += `PREFIX ${prefix}: ${UI.ns[prefix]()}\n`;
      }
    }
    query = prefixes + query;
    let resultElement,resultsString;
    try {
      let results = await sparqlQuery( endpoint, query );
      return results;
    }
    catch(e) { console.log(e); }
  }

  export async function sparqlQuery(endpoint,queryString,forceReload){
    if(typeof Comunica !="undefined")
      return await _comunicaQuery(endpoint,queryString,forceReload);
    else   
      return await _rdflibQuery(endpoint,queryString,forceReload);  
  }

  async function _rdflibQuery(endpoint,queryString,forceReload){
//    const kb = UI.rdf.graph();
//    const fetcher = UI.rdf.fetcher(kb);
    const kb = UI.store;
    await kb.fetcher.load(endpoint);
    try {
      let preparedQuery;
      try {
        preparedQuery=await UI.rdf.SPARQLToQuery(queryString,false,kb);
      }
      catch(e){"Could not prepare query : ",e}
      let wanted = preparedQuery.vars.map( stm=>stm.label );
      let table = [];
      let results = kb.querySync(preparedQuery);
      console.log(44,results)
      for(let r of results){
        let row = {};
        for(let w of wanted){
          let value = r['?'+w];
          row[w] = value ?value.value :"";
        }
        table.push(row);
      }
      table = table.sort((a,b)=>a.label > b.label ?1 :-1);
      if(!table.length) console.log('No results!');
      return table
    }
    catch(e) { console.log("Could not get results : ",e); }
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
        value = value.termType==='NamedNode' ?value.value :value;
        value = value.id ?value.id.replace(/^"/).replace(/"$/) :value;
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


