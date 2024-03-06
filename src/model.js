import {sanitize,markdownString2HTML} from './isomorphic.js';
import {webOp} from './model-rdf.js';
import {filterByQuerySelector} from './model-html.js';

export async function fetchNonRdfData(element){
  let queryParam = element.queryParam;
  let wanted = element.wanted;
  let url = element.source;
  let ctype = element.type;
  if(!url || !ctype) return;
  let content =  await webOp('GET',element.source);
  if( ctype.match(/markdown/i) ){
    content = await markdownString2HTML(content);
  }
  if( ctype.match(/text/) ){
    content = `<pre><code>${content.replace(/</g,'&lt;')}</code></pre>`;
  }
  content = await filterByQuerySelector(content,wanted,element);
  if(!element.trusted && ctype.match(/(html|markdown|text)/i)) content = await sanitize(content);
  return content;
}
/*
export async function fetchNonRdfContent(element,url,ctype,webOp){
  let content;
  try {
   if(!inBrowser){
      element.source = element.source.replace(/^file:\/\//,'');
      const pkg = await import('./file-io.js');
      content = await pkg.readFileAsync(element.source,'utf8');
    }
    else {
      content =  await webOp('GET',element.source);
    }
    return content;
  }
  catch(e){console.log(e);return ""}
}
*/