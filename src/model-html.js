import { isoDoc,domFromContent } from "./isomorphic.js";

/* filterByQuerySelector(content:HTMLstring,wanted:querySelectorString)
   returns elements in the HTML that match the wanted query
   
*/
export async function filterByQuerySelector(content,wanted,element){
  try {
    if(!wanted) return content;
    const contentHolder = isoDoc.createElement('DIV');
    const tmpDom = await domFromContent(content);
    for(let el of tmpDom.querySelectorAll(wanted)){
      contentHolder.appendChild(el);
    }
    return contentHolder.innerHTML;
  }
  catch(e){ console.log("Could not parse as HTML",e); return ""; }
}
