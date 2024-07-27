import {rel2absIRI,sanitize,domFromContent} from './utils.js';
import {webOp} from './rdf-utils.js';

export async function fetchNonRdfData(element){
  let queryParam = element.queryParam;
  let wanted = element.wanted;
  let url = element.source;
  if(element.getAttribute){
      queryParam ||= element.getAttribute('queryParam');
      wanted ||= element.getAttribute('wanted');
      url ||= element.getAttribute('source');
  }
  url = rel2absIRI(url);
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
  if( !ctype.match(/(raw|component)/) ){
    // content = await filterByQuerySelector(content,wanted,element);
    if(!element.trusted && ctype.match(/(html|markdown|text)/i)) {
      try {
        content = await sanitize(content);
      }
      catch(e){console.log(e)}
    }
  }
  return content;
}
export async function filterByQuerySelector(content,element){
  const wanted = element.wanted ;
  if(!wanted||!content) return content;
  const doc = element.ownerDocument;
  try {
    const contentHolder = doc.createElement('DIV');
    const tmpDom = await domFromContent(content);
    for(let el of tmpDom.querySelectorAll(wanted)){
      contentHolder.appendChild(el);
    }
    return contentHolder.innerHTML;
  }
  catch(e){ console.log("Could not parse as HTML",e); return ""; }
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

export async function showMarkdown(source,displayArea){
  let content = await fetchNonRdfData({source,type:'markdown'});
  displayArea.innerHTML = `<base href="${source}" />` + content;
}

export async function markdownString2HTML(markdownString,dom){
    try {
      return await marked.parse(markdownString)
    }
    catch(e){ console.log("Could not parse ",e);}
}
