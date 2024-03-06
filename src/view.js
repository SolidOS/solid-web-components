// import all views
//
import { reader } from './view-reader.js';
import { table } from './view-table.js';
import { links,selector } from './view-anchorList.js';
import { searchbar } from './view-searchbar.js';

import { isoDoc,isoWin } from './isomorphic.js';
import { fetchNonRdfData } from './model.js';

export async function showData(element,data){
  const templateName = element.template;
  let templateFunction = isoWin.sol.template[templateName];
  if(templateFunction) return templateFunction(element,data);      
  else if(templateName) return await showInCustomTemplate(templateName,data,isoDoc);    
  else return data;
}

async function showInCustomTemplate(template,dataAOH,dom){
  document ||= dom.window.document;
  template = { source:template, type:"html" };
  template = await fetchNonRdfData(template,dom);
  let resultsString = "";
  for(let row of dataAOH){
    resultsString += template.interpolate(row);
  }
  const el = document.createElement('SPAN');
  el.innerHTML = resultsString;
  return el;
}

String.prototype.interpolate = function(params) {
  const names = Object.keys(params);
  const vals = Object.values(params);
  return new Function(...names, `return \`${this}\`;`)(...vals);
}   
