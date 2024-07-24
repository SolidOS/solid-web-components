export class SolWeather extends HTMLElement {
  constructor() { 
    super(); 
  }
  connectedCallback(){ 
    this.innerHTML = `<iframe src="../dashboard/plugins/weather.html"></iframe>`;
  }
}
customElements.define("sol-weather",SolWeather);



