export class SolTime extends HTMLElement {
  constructor() { 
    super(); 
  }
  connectedCallback(){ 
    var win = this.ownerDocument.defaultView;
    win.timer ||= setInterval(this.displayTime, 60000); // update every minute
    this.displayTime();
  }
displayTime(){ 
  const element = document.querySelector('SOL-TIME');
  element.classList.add('sol-time');
  element.style.display="inline-block";
  var now = new Date();
  var localTime = this.formatTime(now.getHours()) + ':' + this.formatTime(now.getMinutes());
  var utcTime = this.formatTime(now.getUTCHours()) + ':' + this.formatTime(now.getUTCMinutes());
  element.innerHTML = `<div class="sol-time" style="display:inline-block; text-align:right;padding:0.5rem;padding-left:0.10rem;border-radius:0.3rem;border:1px solid grey;font-size:0.8rem;width:5rem;background:white;color:black;opacity:80%;line-height:1.4em;">
      <div style="white-space:nowrap !important">Local : ${localTime}</div>
      <span style="white-space:nowrap !important">UTC : </span><span>${utcTime}</span>
    </div>`;
}
formatTime(time) {
  return time < 10 ? '0' + time : time;
}
}
customElements.define("sol-time",SolTime);

