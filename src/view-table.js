import { isoDoc,domFromContent } from './isomorphic.js';
import { registerView } from './controller.js';

registerView({
  templates: {table}     
})

/* TABLE FORMATS 
*/
export function table(element,aoh,dom){
    let table = isoDoc.createElement('TABLE');
    if(!aoh.length) return;
    let fields = getMostKeys(aoh);
    return( aoh.length >1 
            ? horizontalTable(table,fields,aoh,isoDoc)
            : verticalTable(table,fields,aoh,isoDoc)
    );
  }
  function getMostKeys(aoh){
    let mostKeys = {};
    for(let row of aoh){
      let rowKeys = Object.keys(row);
      let curKeys = Object.keys(mostKeys);
      if(rowKeys.length > curKeys.length) mostKeys = row
    }
    return Object.keys(mostKeys);
  }
  function horizontalTable(table,fields,aoh,domDoc){
    domDoc ||= document;
    const toprow = domDoc.createElement('TR');
    for(let field of fields){
      let th = domDoc.createElement('TH');
      th.style.display="table-cell";
      th.innerHTML = field;
      th.style.border="1px solid black";
      th.style.padding="0.5rem";
      toprow.appendChild(th);    
    }
    table.appendChild(toprow);
    for(let r of aoh){
      let row = domDoc.createElement('TR');
      row.style.display="table-row";
      for(let field of fields){
        let td = domDoc.createElement('TD');
        td.style.padding="0.5rem";
        td.style.display="table-cell";
        td.style.border="1px solid black";
        let value = row[field] = r[field]  || "";
        td.innerHTML = mungeValue(field,value);
        row.appendChild(td);         
      }
      table.appendChild(row);       
    }
    table.style["border-collapse"]="collapse";
    return table;
  }
  function verticalTable(table,fields,aoh,domDoc){
    domDoc ||= document;
    for(let field of fields){
      let th = domDoc.createElement('TH');
      th.style.display="table-cell";
      th.innerHTML = field;
      th.style.border="1px solid black";
      th.style.padding="0.5rem";
      let td = domDoc.createElement('TD');
      td.style.display="table-cell";
      let value = aoh[0][field];
      td.innerHTML = mungeValue(field,value);
      td.style.border="1px solid black";
      td.style.padding="0.5rem";
      let row = domDoc.createElement('TR');
      row.appendChild(th);    
      row.appendChild(td);    
      table.appendChild(row);
    }
    table.style["border-collapse"]="collapse";
    return table;
  }
  function mungeValue(field,value){
      let label = value;
      if(field==='id'||field==='type'){
        label = value.replace(/^.*\//,'').replace(/.*#/,'');
      }
      if(value.match(/^(http|file)/)){
        label = `<a href="${value}" title="${value}">${label}</a>`;       
      }
      return label;
  }
  