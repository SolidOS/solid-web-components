let lit,sym,ns,store,fetcher,updater;

export {sym,lit};

export async function fetchRdfData(element){
  let done = {};
  let aoh = [];
  let source = await fetcher.load(element.source);
  const triples = element.source.match(/#/) 
                ? store.match(source,null,null,source.doc()) 
                : store.match(null,null,null,source.doc());
  for(let t of triples){
    let subject = t.subject;
    if(done[subject.value]) continue;
    done[subject.value]=true;
    const predicates = store.match(subject,null,null,source.doc());
    let row = {id:subject.value};
    for(let p of predicates){
      let key = p.predicate.value.replace(/.*\//,'').replace(/.*#/,'');
      let val = p.object.value; 
      if(row[key]){
        row[key] += "," + val;"," + val;
      }
      else row[key] = val;
    }
    if(element.wanted){
      let subj,pred,obj;
      const ary = element.wanted.split(/\s+/).filter(Boolean);
      subj = ary.shift();
      pred = ary.shift();
      obj = ary.join(' ');
      if(pred=='a') pred = "type";
      if(subj=="*"){
        if(row[pred] &&row[pred].match(obj)) aoh.push(row)
      }
      else{
        if(row.id.match(subj)&&row[pred].match(obj)) aoh.push(row)
      }
    }
    else {
      aoh.push(row);
    }
  }
  return aoh;
}

export async function fetchRDFdata(component){ 
  let config = getSingletonStore(component.config);
  let url = config.source = component.source;
  config.shapeUrl = component.shape;
  config.targetClass = component.targetClass;
  let shape = new RDFfetcher( config );
  if(!component.asHtml) shape.raw=true;
  let data = url.match(/#/) ?await shape.get(url) :await shape.getAll(url);
  // wanted
  if(component.wanted) data = data.filter( (row)=> {
    let clauses = component.wanted.split(/\s*\|\|\s*/);
    for(let clause of clauses){
      let pred,obj;
      const ary = clause.split(/\s+/).filter(Boolean);
      pred = ary.shift();
      if(pred=='a') pred = "type";
      obj = ary.join(' ');
      if(row.id.match(url)&&(row[pred]||"").match(obj)) return row;
    }
/*
      let subj,pred,obj;
      const ary = component.wanted.split(/\s+/).filter(Boolean);
      subj = ary.shift();
      pred = ary.shift();
      obj = ary.join(' ');
      if(pred=='a') pred = "type";
      if(subj=="*"){
        if(row[pred] &&row[pred].match(obj)) return(row)
      }
      else{
        if(row.id.match(subj)&&row[pred].match(obj)) return(row)
      }
*/
  });
  // limit
  if(component.limit) data = data.slice(0,component.limit);
  return data;
}

export class RDFfetcher {

  constructor(config) {
    this.source = config.source;
    this.store = config.store;
    this.fetcher = config.fetcher;
    this.updater = config.updater;
    this.shapeUrl  = config.shapeUrl;
    this.targetClass  = config.targetClass;
 }
  async get(url) {
    try {
      await this.fetcher.load(url);
      return [ await this.getOne( sym(url) ) ];
    }
    catch(e) { console.log(e); }
  }
  async getAll(url) {
    let all = [];
    try {
      await this.fetcher.load(url);
      let data;
      if(this.targetClass){
        data = this.store.match( null, nsp('rdf:type'), nsp(this.targetClass) )
        for(let row of data){
          all.push(await this.getOne(row.subject))
        }
      }
      else {
        let subjects = this.store.match(null,null,null,sym(url).doc()).map(stmt => {
          if(typeof stmt.subject.vaue !=undefined) return stmt.subject.value;
        });
        subjects = subjects.filter((value, index, self) => self.indexOf(value) === index);
        for(let subject of subjects){
          all.push(await this.getOne(sym(subject)));
        }
      }

      return(all)
    }
    catch(e) { console.log(e); }
  }
  async getOne(subject) {
    const predicates = this.store.statementsMatching(subject).map(stmt => stmt.predicate);
    let row = {
      id: subject.value,
    };
    if(this.targetClass) row.targetClass = this.targetClass
    for(let predicate of predicates){
      let key = predicate.value.replace(/.*\//,'').replace(/.*#/,'');
      key=key.replace(/-/,'_');
      row =  this.getObjects( row,key,subject,predicate );
    }
    return row;
  }
  getObjects(row,key,subjectNode,predicate){
    let all=[];
    row[key] = [];
    let objects = this.store.each( subjectNode, predicate );
    for(let object of objects){
      if(key==='image') {
        let image = object.value;
        if(image){
          row.image = `<img src="${image}" />`;
        }
        return row;
      }
      if(object.termType != "NamedNode"){
         all.push(object.value);
         continue;
      }
      let label = (this.store.any(object,nsp('schema:name'))||{}).value;
      if(!label){
          let hashnums =  (object.value.match(new RegExp('#', "g")) || []).length;
          label = hashnums===1 
                ? object.value.replace(/.*#/,'')
                : object.value;
      }
      let id = object.value;
      if(this.raw) all.push( {id,label} );
      else {
        if(id.match(this.source)||key=="additionalType"){ // is reference to object from same source
          all.push(label);
        }
        else {
          all.push(`<a property="${predicate.value}" href="${id}">${label}</a>`);
        }
      }
    }
    if(this.raw) {
      all = all.length===1 ?all[0] :all;
      if(all.length===0) all = "";
      if(all.length===1) all = all[0];
      row[key] = all;
      return row;
    }
    else {
      row[key] = all.length>0 ?all.join(', ') :"";
      return row;
    }
  }
}

export function getSingletonStore(config) {
  if(!sym){
    sym = config.sym ;
    lit = config.lit ;
    ns = config.ns;
    store = config.store;
    fetcher = config.fetcher;
    updater= config.updater ;
  }
  return { store,fetcher,updater };
}  
export async function webOp(method,uri,options) {
  options ||= {};
  return new Promise( (resolve, reject) => {
    try {
      fetcher.webOperation(method, uri,options).then( async(response) => {
        if (response.ok) {
          resolve(response.responseText);
        }
        else {
          resolve(response.status + response.statusText);
        }
      });
    }
    catch(err){ 
      console.log(method,uri,options,err);
      resolve(err.status+err.statusText); 
    }
  });
}
export function nsp(prefixedTerm){
  if(prefixedTerm.startsWith('http')) return sym(prefixedTerm);
  const [prefix,term] = prefixedTerm.split(/:/);
  if(prefix==="oar") return sym("https://github.com/solid/organizations/vocabulary/oar.ttl#"+term);
  if(prefix==="siocs") return sym("http://rdfs.org/sioc/services#"+term);
  if(prefix==="sioct") return sym("http://rdfs.org/sioc/types#"+term);
  if(prefix==="sh") return sym("http://www.w3.org/ns/shacl#"+term);
  if(prefix==="skos") return sym( "http://www.w3.org/2004/02/skos/core#"+term);
  if(! ns[prefix]) { console.log( `unrecognized prefix '${prefixedTerm}'`); }
  return sym( ns[prefix](term) );
}
/*
export function bestComment(subject,graph){
  return UI.store.any(subject,UI.ns.rdfs('comment'),null,graph)
      || UI.store.any(subject,UI.ns.schema('description'),null,graph);
}
export function bestLink(subject,graph){
  const recalls = UI.rdf.sym('http://www.w3.org/2002/01/bookmark#recalls');
  return UI.store.any(subject,recalls,null,graph)
      || UI.store.any(subject,UI.ns.schema('url'),null,graph)
      || subject;
}
export function bestLabel(node){
  try{
    if(typeof node==="string")  node = sym(node) ;
    const best = 
        || store.any(node,nsp('vcard:fn'))
        || store.any(node,nsp('foaf:fname'))
        || store.any(node,nsp('schema:name'))
        || store.any(node,nsp('doap:name'))
        || store.any(node,nsp('dct:title'))
        || store.any(node,nsp('rdfs:label'))
        || store.any(node,nsp('skos:label')
        || store.any(node,nsp('ui:label'))
        || node.value.replace(/.*\//,'').replace(/.*#/,'');
    return best;
  }
  catch(e) { console.log(e); return node }
}
*/


/* MOVE to utils.js 
*/
export function getTemplateVariables(templateString){
  const regex = /\${(.*?)}/g;
  let variables = {};
  let match;
  while ((match = regex.exec(templateString)) !== null) {
    variables[match[1]]=1;
  }
  return Object.keys(variables);
}


/* MOVE to view.js 
*/
export async function fillTemplate(element,dataAOH){
  const document = element.ownerDocument;
  let tmp = element.getAttribute('view');
  if(tmp=="card") return showCard(element,dataAOH);
  let template;
  if(tmp.match('#')) {
    template = document.querySelector(tmp).innerHTML;
  }
  else {
    template = await webOp('GET',element.view);
  }
  let properties = getTemplateVariables(template);
  let resultsString = "";
  for(let row of dataAOH){
     for(let key of properties){
       row[key] ||= "";
     }
     try {
       resultsString += template.interpolate(row);
     } 
     catch(e){console.log(e)}
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
  return `<span>`+val.replace(/>[^<]*</,'>'+key+'<')+'</span>&nbsp;';
}  
export async function showCard(element,dataAOH){
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
String.prototype.interp = function(params) {
  const names = Object.keys(params);
  for(let n of names){
    params[n] ||= ""; // MISSING VALUES DO NOT ERROR
  };
  const vals =  Object.values(params);
  return new Function(...names, `return \`${this}\`;`)(...vals);
}   

