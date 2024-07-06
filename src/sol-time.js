import {isoWin} from './isomorphic.js';

export class SolTime extends HTMLElement {
  constructor() { 
    super(); 
  }
  connectedCallback(){ 
    isoWin.timer ||= setInterval(displayTime, 60000); // update every minute
    displayTime();
  }
}
customElements.define("sol-time",SolTime);

function displayTime(){ 
  const element = document.querySelector('SOL-TIME');
  element.classList.add('sol-time');
  element.style.display="inline-block";
  var now = new Date();
  var localTime = formatTime(now.getHours()) + ':' + formatTime(now.getMinutes());
  var utcTime = formatTime(now.getUTCHours()) + ':' + formatTime(now.getUTCMinutes());
  element.innerHTML = `<div class="sol-time" style="display:inline-block; text-align:right;padding:0.5rem;border-radius:0.3rem;border:1px solid grey;font-size:0.8rem;width:5rem;">
      <div style="white-space:nowrap !important">Local : ${localTime}</div>
      <span style="white-space:nowrap !important">UTC : </span><span>${utcTime}</span>
    </div>`;
}
function formatTime(time) {
  return time < 10 ? '0' + time : time;
}
