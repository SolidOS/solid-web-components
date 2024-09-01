import { getOptions,getAnchors } from '../utils/utils.js';

export async function selector(data,element){
    const isoDoc = element.ownerDocument;
    let wrapper = isoDoc.createElement('DIV');
    let select = isoDoc.createElement('SELECT');
    let display = isoDoc.createElement('DIV');
    wrapper.classList.add('sol-selector-wrapper')
    select.classList.add('sol-selector')
    display.classList.add('sol-selector-display')
    select.style.width = "100%";
    select.innerHTML = getOptions(data);
    select.style.padding = "0.75rem";
    wrapper.appendChild(select);
    wrapper.appendChild(display);
    return wrapper;
}
