export async function makeWorkspace(element,data,dom){
  if(element.type=='rdf'){
    element.innerHTML = `
      <sol-rdf template="select" source="${element.source}"></sol-rdf>
      <div></div>
    `;
    element.querySelector('select').onchange = (event)=>{

    });
  }
}
export function workspaceAction(element){
  let selected = element.value;
  let target = element.nextElementSibling;
  target.innerHTML=
}