import {getDefaults} from './utils.js';
import {getSingletonStore} from './rdf-utils.js';

export async function solidosShow(url,displayArea,pane,clicked,element){
  let label = clicked.getAttribute('label') || "";
  let config = await getSingletonStore();
  let base = location.href.replace(/\?uri=.*/,'');
  let subject = url.uri ?url :config.sym(url);
  let hasOutline = displayArea.querySelector('.TabuatorOutline');
  if(!hasOutline) insertSolidosOutliner(displayArea);
  const outliner = panes.getOutliner(document);
  pane ||= "";
  if(label.match(/Profile Editor/)) pane = "editProfile";
  if(label.match(/Preferences Editor/)) pane = "basicPreferences";
  pane = pane ?panes.byName(pane) :null;
  let tableArea = displayArea.querySelector('.TabulatorOutline > table');
  await outliner.GotoSubject(subject,true,pane,true,null,tableArea);
  const params = new URLSearchParams(location.search)        
  params.set('uri', subject.uri);                                    
  window.history.replaceState({}, '', `${base}?${params}`);  
}

export function insertSolidosOutliner(displayArea){
  displayArea.innerHTML = `
      <div class="TabulatorOutline" role="main">
         <table></table>
         <div id="GlobalDashboard"></div>
      </div>
  `;
}
