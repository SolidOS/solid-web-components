import {getDefaults} from './utils/utils.js';

export class SolVimeo extends HTMLElement {
  constructor() { 
    super(); 
  }
  async connectedCallback(){ 
    await getDefaults(this);    
    this.innerHTML = `
<iframe
  src="https://player.vimeo.com/video/${this.source}"
  width="${this.getAttribute('width')||320}"
  height="${this.getAttribute('height')||180}"
  frameborder="0"
  allow="autoplay; fullscreen; picture-in-picture"
  allowfullscreen
></iframe>                                                                                                                                                 
    `;
  }
}
customElements.define("sol-vimeo",SolVimeo);
