export async function card(dataAOH,element){
  const document = element.ownerDocument;
  const defaults = document.querySelector('sol-defaults');
  let resultsString="";
  let compact = element.getAttribute('compact');
//  if(!compact && defaults) compact = defaults.getAttribute('compact');
  const cardClass = compact ?"card-compact" :"card";
  for(let row of dataAOH){
    if(row.alternateName) row.name += " ("+row.alternateName+")";
    let rowType = row.additionalType;
    resultsString += `
    <div class="${cardClass}">
      <div class="header">
        <div class="name">${row.name}</div>
        <div class="type">a ${row.additionalType||row.type||""}</div>
      </div>
      ${row.image||""}
      <blockquote class="sol-card-description">${row.description||""}</blockquote>
      <div class="row-wrapper">
  `;

     for(let key in row){
       if(!row[key]) continue;
       if(key.match(
/^(image|id|type|name|additionalType|description|service_endpoint|homepage|repository|url|alternateName|isAccessibleForFree|license|videoCallPage|seeAlso)$/
       )) continue;
       resultsString += makeCardRow(key,row[key]);
    } 
    resultsString += `</div><div class="links">` ;
    if(row.service_endpoint){
      if( rowType && rowType.match(/MailingList/)) resultsString += makeCardFRow('subscribe',row.service_endpoint);
      else if( rowType && rowType.match(/MessageBoard/)) resultsString += makeCardFRow('join discussion',row.service_endpoint);
      else if( rowType && rowType.match(/Chat/)) resultsString += makeCardFRow('join chat',row.service_endpoint);
      else resultsString += makeCardFRow('service-endpoint',row.service_endpoint);
    }
    if(row.repository){
      if( rowType && rowType.match(/MailingList/)) resultsString += makeCardFRow('archives',row.repository);
      else if( rowType && rowType.match(/OngoingMeeting/)) resultsString += makeCardFRow('meeting notes',row.repository);
      else resultsString += makeCardFRow('repository',row.repository);
    }
    if(row.videoCallPage) resultsString += makeCardFRow('join video call',row.videoCallPage);
    if(row.homepage) resultsString += makeCardFRow('homepage',row.homepage);
    if(row.url) resultsString += makeCardFRow('url',row.url);
    resultsString += `</div><div class="footer">` ;
    let free = row.isAccessibleForFree;
    free = typeof(free)==="undefined" ?"?" :free==1 ?"yes" :"no";
    resultsString += `<span class="left">is free: ${free}</span>`;
    let license = row.license;
    license = license ?`<span class="right">license: ${license}</span>` :"";
    resultsString += license;
    resultsString += "</div></div>";
  }
  const el = document.createElement('DIV');
  el.innerHTML = resultsString;
  return el;
}
function makeCardRow(key,val){
       return `
<div style="display:table-row">
  <span style="display:table-cell;text-align:right;margin-right:1rem;">
    ${key}
  </span>
  :&nbsp; 
  <span style="display:table-cell">
    ${val}
  </span>
</div>
       `;
}  
function makeCardFRow(key,val){
  if(val.match(/^http/)) return `<a href="${val}">${key}</a>&nbsp;`;
  else return `<span>`+val.replace(/>[^<]*</,'>'+key+'<')+'</span>&nbsp;';
}  
