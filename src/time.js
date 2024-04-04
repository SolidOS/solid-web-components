export class SolTime extends HTMLElement {
  constructor() { 
    super(); 
  }
  connectedCallback(){ 
    displayTime();
  }
}
customElements.define("sol-time",SolTime);

function displayTime(){ 
  const element = document.querySelector('SOL-TIME');
  var now = new Date();
  var localTime = formatTime(now.getHours()) + ':' + formatTime(now.getMinutes());
  var utcTime = formatTime(now.getUTCHours()) + ':' + formatTime(now.getUTCMinutes());
  element.innerHTML = `<div style="display:table-cell; text-align:right;padding:0.5rem;opacity:70%;background:white;border-radius:0.3rem;">
      <span style="font-size:small">Local :</span> <span style="color:brown">${localTime}</span><br />
      <span style="font-size:small">UTC : </span><span style="color:brown" >${utcTime}</span>
    </div>`;
  setInterval(displayTime, 60000); // update every minute
}
function formatTime(time) {
  return time < 10 ? '0' + time : time;
}
