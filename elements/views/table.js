/* TABLE FORMATS 
*/
export function table(aoh,element){
    let document = element.ownerDocument;
    let table = document.createElement('TABLE');
    if(!aoh.length) return;
    let fields = getMostKeys(aoh);
    return( aoh.length >1 
            ? horizontalTable(table,fields,aoh,element)
            : verticalTable(table,fields,aoh,element)
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
function horizontalTable(table,fields,aoh,element){
    const isoDoc = element.ownerDocument;
    const toprow = isoDoc.createElement('TR');
    for(let field of fields){
      let th = isoDoc.createElement('TH');
      th.style.display="table-cell";
      th.innerHTML = field;
      th.style.border="1px solid black";
      th.style.padding="0.5rem";
      toprow.appendChild(th);    
    }
    table.appendChild(toprow);
    for(let r of aoh){
      let row = isoDoc.createElement('TR');
      row.style.display="table-row";
      for(let field of fields){
        let td = isoDoc.createElement('TD');
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
  function verticalTable(table,fields,aoh,element){
      const isoDoc = element.ownerDocument;
      for(let field of fields){
      let th = isoDoc.createElement('TH');
      th.style.display="table-cell";
      th.innerHTML = field;
      th.style.border="1px solid black";
      th.style.padding="0.5rem";
      let td = isoDoc.createElement('TD');
      td.style.display="table-cell";
      let value = aoh[0][field];
      td.innerHTML = mungeValue(field,value);
      td.style.border="1px solid black";
      td.style.padding="0.5rem";
      let row = isoDoc.createElement('TR');
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
  
