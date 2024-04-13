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
  content = await filterByQuerySelector(content,wanted,element);
  if(!element.trusted && ctype.match(/(html|markdown|text)/i)) content = await sanitize(content);
  return content;
}
