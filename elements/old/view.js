// import all views
//
import { rss,showFeedItems } from './view-rss.js';
import { reader } from './view-reader.js';
import { table } from './view-table.js';
import { links,selector } from './view-anchorList.js';
import { searchbar } from './view-searchbar.js';
import { isoDoc,isoWin } from './isomorphic.js';
import { fetchNonRdfData } from './model.js';
import { registerView } from './controller.js';

registerView({
  actions:{showInSolDisplay}
});

export async function showData(element,data){
  const templateName = element.template;
  let templateFunction = isoWin.sol.template[templateName];
  if(templateFunction) return templateFunction(element,data);      
  else if(templateName) return await showInCustomTemplate(templateName,data,isoDoc,element);    
  else return data;
}

async function showInCustomTemplate(template,dataAOH,dom,element){
  document ||= dom.window.document;
  let tmp = element.getAttribute('template');
  if(tmp.startsWith('#')) {
    template = document.querySelector(tmp).textContent;
    template = document.querySelector(tmp).innerHTML;
  }
  else {
    template = { source:template, type:"html" };
    template = await fetchNonRdfData(template,dom);
  }
  let resultsString = "";
  for(let row of dataAOH){
    resultsString += template.interpolate(row);
  }
  const el = document.createElement('SPAN');
  el.innerHTML = resultsString;
  return el;
}

async function showInSolDisplay(clickedElement){
  event.preventDefault();
  let source = clickedElement.href;
  let element = clickedElement.closest('.sol-wrapper');
  let display = element.querySelector('.sol-display');
  let type = clickedElement.getAttribute('linktype') || element.getAttribute('linktype') || 'component';
  display.innerHTML = await fetchNonRdfData({source,type});
}

