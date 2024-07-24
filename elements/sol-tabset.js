import {getDefaults} from './utils/utils.js';
export class SolTabset extends HTMLElement {
  constructor() { 
    super(); 
  }
  connectedCallback(){ 
    getDefaults(this);
    let content = this.innerHTML;
    this.innerHTML = `
<div class="tabset sol-wrapper">
  <div class="sol-header">
    <sol-menu style="background:transparent">
      ${content}
    </sol-menu>
  </div>
  <div class="sol-display" style="background:white;display:block;width:100%;border:1px solid grey;border-radius:0.3rem;height:10rem"></div>
</sol-wrapper>
<style>
.tabset.sol-wrapper .sol-menu li {
  border:1px solid grey;
  border-radius:0.3rem 0.3rem 0 0;
  margin-left:0.5rem;
  border-bottom:0;
}
.tabset .sol-display {
  padding-top:1rem !important;
  padding-bottom:1rem !important;
}
.tabset .sol-component {
//  padding:0 !important;
//  margin:0 !important;
}
.sol-links a {
  font-size:0.9rem !important;
}
</style>
    `;
  }
}
customElements.define("sol-tabset",SolTabset);

