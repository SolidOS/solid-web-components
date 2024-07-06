export class SolJitsi extends HTMLElement {
  constructor() { 
    super(); 
  }
  connectedCallback(){ 
    const roomName = this.getAttribute('source');
    this.innerHTML =`
      <iframe 
        allow="camera; microphone; fullscreen; display-capture; autoplay" 
        src="https://meet.jit.si/${roomName}" 
        style="height: 100%; width: 100%; border: 0px;"
      ></iframe>`  
    }
}
customElements.define("sol-jitsi",SolJitsi);


