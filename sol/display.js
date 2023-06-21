export function results2table(results){
  let table = document.createElement('TABLE');
  let fields = Object.keys(results[0]);
  let toprow = document.createElement('TR');
  for(let field of fields){
    let th = document.createElement('TH');
    th.style.display="table-cell";
    th.innerText = field;
    th.style.background="#c6c6c6";
    th.style.border="1px solid black";
    th.style.padding="0.5rem";
    toprow.appendChild(th);    
  }
  table.appendChild(toprow);
  for(let r of results){
    let row = document.createElement('TR');
    row.style.display="table-row";
    for(let field of fields){
      let td = document.createElement('TD');
      td.style.padding="0.5rem";
      td.style.display="table-cell";
      td.style.border="1px solid black";
      td.innerText = row[field] = r[field];
      row.appendChild(td);         
    }
    table.appendChild(row);       
  }
  table.style["border-collapse"]="collapse";
  return table;
}
