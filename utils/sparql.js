import {rel2absIRI,getLinks} from './utils/utils.js';
import {fetchNonRdfData} from './utils/model.js';
import {getSingletonStore} from './utils/rdf-utils.js';

export async function fetchSparqlData(element){
  let endpoint = element.getAttribute('endpoint');
  let queryParam = element.getAttribute('queryParam');
  if(endpoint) endpoint = rel2absIRI(endpoint.trim());
  let query;
  if(element.source){
    query = (await fetchNonRdfData({
      source : element.source,
      type : 'component',
    })).trim();
  }
  else{
    //query=element.getAttribute('sparql');
    let queryArea = document.querySelector( element.getAttribute('query') );
    query = queryArea.textContent;
  }
  if(queryParam){
    query = query.interpolate({queryParam});
  }
    let prefixes;
  // prefixes = endpoint ?`PREFIX : <${endpoint}#>\n` :"";
/*
  for(let line of query.split(/\n/)){
      if(!line.match(/^\s*PREFIX/)) continue;
      let prefix = (line.split(/:/))[0];
      prefix = prefix.replace(/\s*PREFIX\s* /,'');
      if(prefix && UI.ns[prefix]) {
alert(prefix)
        prefixes += `PREFIX ${prefix}: ${UI.ns[prefix]()}\n`;
      }
  }
  for(let p of query.split(/\s/)){
      if(!p.match(/[^\s]+[^\s]+/)) continue;
      const prefix = (p.split(/:/))[0];
      if(prefix && UI.ns[prefix]) {
alert(prefix)
        prefixes += `PREFIX ${prefix}: ${UI.ns[prefix]()}\n`;
      }
  }
*/
  if(prefixes) query = prefixes + query;
  alert(query)
  let resultElement,resultsString;
  try {
      let results = await sparqlQuery( endpoint, query );
      return results;
  }
  catch(e) { console.log('SPARQL RESULTS ERROR:',e); }
}

  export async function sparqlQuery(endpoint,queryString,forceReload){
    if(typeof Comunica !="undefined")
      return await _comunicaQuery(endpoint,queryString,forceReload);
    else   
      return await _rdflibQuery(endpoint,queryString,forceReload);  
  }

  async function _rdflibQuery(endpoint,queryString,forceReload){
    //----------------------------------------------------------------------
    // use temporary store, not universal store, so query is not cached
    // maybe make this a 'forceReload' param that can be turned on and off?
    // const kb = UI.store;
//    const kb = UI.rdf.graph();
      //    kb.fetcher = UI.rdf.fetcher(kb,{fetch:UI.store.fetcher._fetch})
      const config = await getSingletonStore();
      const kb = config.store;
      kb.fetcher = config.fetcher;
      
      //----------------------------------------------------------------------
    let [mainQuery, groupByClause] = queryString.split(/\s+GROUP\s+BY\s+/i);
    let groupKey;
    if(mainQuery&&groupByClause) {
      groupKey = groupByClause.trim().replace(/^\?/,'').replace(/\.$/,'');
      queryString = mainQuery;
    }
    try {
      await kb.fetcher.load(endpoint);
      let preparedQuery;
      try {
        preparedQuery=await config.UI.rdf.SPARQLToQuery(queryString,false,kb);
      }
      catch(e){console.log("Could not prepare query : ",e);}
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
console.log(table)
      if(groupKey) table = groupBy(results,groupKey);
console.log( table );
      if(!table.length) console.log('No results!');
      return table
    }
    catch(e) { console.log("Could not get results : ",e); }
  }


function groupBy(data, key) {
  const groupedData = data.reduce((acc, curr) => {
    const groupName = curr[key];
    if (!acc[groupName]) {
      acc[groupName] = {};
    }
    for (const prop in curr) {
      if (prop !== key) {
        if (!acc[groupName][prop] || acc[groupName][prop] !== curr[prop]) {
          if (!acc[groupName][prop]) {
            acc[groupName][prop] = [];
          }
          acc[groupName][prop].push(curr[prop]);
        }
      }
    }
    return acc;
  }, {});

  const result = Object.entries(groupedData).map(([groupName, group]) => {
    const row = { [key]: groupName };
    for (const prop in group) {
      if (group[prop].length > 1) {
        row[prop] = group[prop].join(', ');
      } else {
        row[prop] = group[prop][0];
      }
    }
    return row;
  });

  return result;
}


  async  function _comunicaQuery(endpoint,sparqlStr,forceReload){
   try {
    let comunica = new Comunica.QueryEngine();
    if(forceReload) comunica.invalidateHttpCache();
    function munge(x){
       return x ? x.replace(/^"/,'').replace(/"[^"]*$/,'') :"";
    }
    let bindingStream;
    let options = endpoint ?{sources:[endpoint]} :null; 
    try { 
      bindingStream = await comunica.queryBindings(sparqlStr,options); 
    }
    catch(e){alert('COMUNICA ERROR '+e); return};
    let result = await bindingStream.toArray()
    let table = [];
    let hash = {};
    for(let e of result) {
console.log(e)
      let row = {} ;
      let ary = e.entries._root.entries;
      if(!ary || !ary.length) ary =e.entries._root.nodes;
      for(let i of ary){
        let key = i[0];
console.log(key)
        let val = e.get(key);
        let value = val ?val.value  :null;
/*
        let value = i[1];
        value = value.termType==='NamedNode' ?value.value :value;
        value = value.id ?value.value :value;
*/
        if( typeof row[key] != 'ARRAY' ) row[key]= [row[key]]

//        if( typeof row[key] === "ARRAY" ) row[key].push(value.id)
        if( typeof row[key] === "ARRAY" ) row[key].push(value)
//        else row[key] = value.id;
        else row[key] = value;
      }
console.log(row)
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


