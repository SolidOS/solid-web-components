import {sanitize,markdownString2HTML,domFromContent} from './isomorphic.js';
import {webOp} from './model-rdf.js';
import {rel2absIRI} from './utils.js';
import {filterByQuerySelector} from './model-html.js';

export async function fetchNonRdfData(element){
  let queryParam = element.queryParam;
  let wanted = element.wanted;
  let url = element.source || element.getAttribute('source');
  url = await rel2absIRI(url);
  let ctype = element.type || element.getAttribute('type');
  if(!url || !ctype) return;
  let content="fail";
  try {
    content =  await webOp('GET',url);
  }
  catch(err){alert(err)}
  if( ctype.match(/markdown/i) ){
    content = await markdownString2HTML(content);
  }
  if( ctype.match(/text/) ){
    content = `<pre><code>${content.replace(/</g,'&lt;')}</code></pre>`;
  }
  if(!ctype=='raw') {
    content = await filterByQuerySelector(content,wanted,element);
    if(!element.trusted && ctype.match(/(html|markdown|text)/i)) {
      content = await sanitize(content);
    }
  }
  return content;
}

export async function putNonRdfData(element){
  let url = rel2absIRI( element.source || element.getAttribute('source') );
  let ctype = element.type || element.getAttribute('type');
  if(!url || !ctype) return;
  let body = element.content || element.getAttribute('content')  || "";
  let headers = {'Content-Type':ctype}
  try {
    let response =  await webOp('PUT',url,{body,contentType:ctype,headers});
    console.log(response)
  }
  catch(err){alert(err)}
}
