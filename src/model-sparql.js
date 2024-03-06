 /* SPARQL HANDLER
 * read sparql component into a dom structure
 * find its endpoint, template, and sparql elements
 * get results passing those to sol-sparql.js.sparqlQuery(endpoint,sparql)
 * iterates over results, interpolating them into the template 
 * returns resultString
*/
async function sparql(element,url,options){
    let resultsString = "";
    try {
      let dom = await _getContent(element,element.source,'sparql' );
      if(typeof dom==="string") dom=(new DOMParser()).parseFromString(dom,'text/html');
      let endpoint = dom.querySelector('endpoint').innerText.trim();
      let template = dom.querySelector('template').innerHTML
      let sparql = dom.querySelector('script').innerText.trim();
      endpoint =_getLocalContainer(endpoint);
      let results = await sparqlQuery( endpoint, sparql );
      for(let row of results){
        for(let k of Object.keys(row)){
          row[k]=row[k].replace(/^"/,'').replace(/"$/,'').replace(/"@en$/,'') || "";
        }
        resultsString += template.interpolate(row);
      }
    }
    catch(e) { console.log(e); }
    return resultsString;
}
export function replaceParams(content,queryParam){
  if(!queryParam) return content;
  return content.interpolate({queryParam});
}
