import { isoDocument,domFromContent } from './isomorphic.js';
import { registerView } from '../sol-controller.js';

registerView({
  templates: {selector,links}     
})

export async function selector(data,dom){
    const domDoc = isoDocument(dom);
    let div = domDoc.createElement('SELECT')
    div.classList.add('sol-selector')
    div.innerHTML = getOptions(data,dom);
    return div;    return div;
}
export async function links(data,dom){export async function links(data,dom){
  const domDoc = isoDocument(dom);
  let div = domDoc.createElement('SELECT')
  div.classList.add('sol-selector')
  div.innerHTML = getAnchors(data,dom);
  return div;
}  