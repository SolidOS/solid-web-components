import { isoDoc } from './isomorphic.js';
import { registerView } from './controller.js';
import { getOptions,getAnchors } from './utils.js';

registerView({
  templates: {selector,links}     
});

export async function selector(element,data){
    let div = isoDoc.createElement('SELECT')
    div.classList.add('sol-selector')
    div.innerHTML = getOptions(data);
    return div;
}
export async function links(element,data){
  let div = isoDoc.createElement('DIV')
  div.classList.add('sol-links')
  div.innerHTML = getAnchors(data);
  return div;
}