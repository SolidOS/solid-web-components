import {getDefaults} from './utils/utils.js';
import {miniQuery} from './utils/miniQuery.js';

export class SolSelect extends HTMLElement {
    constructor() {
	super();
    }
    async connectedCallback(){
	getDefaults(this);
        let limit = this.limit || this.getAttribute('limit');
        let wanted = this.wanted || this.getAttribute('wanted');
        let placeholder = this.placeholder || this.getAttribute('placeholder');
        let multiple = this.multiple || this.getAttribute('multiple');
        let data = await miniQuery(this,{wanted,limit});
        this.showSelector(data,this,placeholder,multiple);
    }
    showSelector(data,element,placeholder,multiple){
        let selector = document.createElement('SELECT');
        selector.style.padding = "0.5em";
        selector.style['margin-bottom'] = "0.25em";
        selector.style.width = "100%";
        if(multiple) {
          let size = data.length <7 ?data.length :6;
          selector.setAttribute('size',size);
          selector.setAttribute('multiple',true);
        }
        if(placeholder){
            let option = document.createElement('OPTION');
            option.innerHTML = placeholder;
            option.setAttribute('value','');
            option.setAttribute('disabled','true');
            option.setAttribute('selected','true');
            option.style['background-color'] = "transparent";
            option.style['color'] = "black";
            option.style['border-bottom'] = "1px solid black";
            selector.appendChild(option);
        }
        for(let row of data){
            let option = document.createElement('OPTION');
            option.style.padding = "0.25em";
            option.setAttribute('value',row.value);
            option.innerHTML = row.label;
            selector.appendChild(option);
        }
        element.appendChild(selector);
    }
}
customElements.define("sol-select",SolSelect);

export function insertSelector(container,opts){
    let limit = opts.limit ?`limit="${opts.limit}"` : "";
    let wanted = opts.wanted ?`wanted="${opts.wanted}"` : "";
    let placeholder = opts.placeholder || "Type to search...";
    container.innerHTML += `
        <sol-autocomplete
            source = "${opts.source}"
            wanted = "${opts.wanted}"
            placeholder = "${placeholder}"
            ${limit}
        ></sol-autocomplete>
    `;   
}

/* END */
