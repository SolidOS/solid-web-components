import '../node_modules/marked/marked.min.js';
import {JSDOM} from 'jsdom';

md2rdf(`
  * [LABEL](RECALLS) {TOPIC} DESCRIPTION foo
  * [LABEL](RECALLS) {TOPIC} DESCRIPTION
`);
export async function mdFile2rdf(uri){

}
export async function mdString2rdf(mdStr){
  await initSolCli();
  let rdfStr = `
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
@prefix bookmark: <http://www.w3.org/2002/01/bookmark#>.
`;
  let htmlStr = marked.parse(mdStr);  
  let dom = new JSDOM(htmlStr);
  let doc = dom.window.document.body;
  let items = doc.querySelectorAll('li');
  let index = "0000";
  for(let item of items){
    index++;
    let anchor = item.querySelector('a');
    let link = anchor.getAttribute('href');
    let label = anchor.innerHTML.trim();
    let restStr = item.innerHTML.replace(/^.*<\/a>\s*/,'');
    let restAry = restStr.split(/}/);
    let topic = restAry[0].replace('{','');
    let description = restAry[1];
    rdfStr += `
<#${index}>
  a bookmark:Bookmark ;
  bookmark:recalls <${link}> ;
  bookmark:hasTopic "${topic}" ;
  rdfs:label <${label}> ;
  rdfs:comment """${description}""" .
`;
  }
  return(rdfStr);
}
