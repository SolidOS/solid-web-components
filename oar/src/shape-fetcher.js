import {nsp,sym,getSingletonStore} from './rdf-utils.js';

export async function fetchShapeFromObject(component){ 
  let config = getSingletonStore(component.config);
  let url = config.source = component.source;
  config.shapeUrl = component.shape;
  config.targetClass = component.targetClass;
  let shape = new ShapeFetcher( config );
  if(!component.asHtml) shape.raw=true;
  let data = url.match(/#/) ?await shape.get(url) :await shape.getAll(url);
  // wanted
  if(component.wanted) data = data.filter( (row)=> {
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
  });
  // limit
  if(component.limit) data = data.slice(0,component.limit);
  return data;
}

export class ShapeFetcher {

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
      let services = this.store.match( null, nsp('rdf:type'), nsp(this.targetClass) );
      for(let service of services){
        all.push(await this.getOne(service.subject))
      }
      return(all)
    }
    catch(e) { console.log(e); }
  }
  async shacl2properties(shaclShapeUrl){
    let fields = [];
    let shaclNode = sym(shaclShapeUrl)
    try {
      await this.fetcher.load(shaclNode.doc());
    }
    catch(e){ console.log('Load error '+e) }
    let properties = this.store.match(shaclNode,nsp('sh:property'),null,shaclNode.doc());
    this.isIRI={};
    for(let property of properties){
      property = property.object;
      let value = (this.store.any(property,nsp('sh:path'))||{}).value;
//      this.isIRI[value] = (this.store.match(property,nsp('sh:datatype'),nsp('sh:IRI'))||{}).length;
      fields.push(value);
    }
    this.properties = fields;
  }
  async getOne(subject) {
    if(!this.properties) await this.shacl2properties(this.shapeUrl);
    let row = {
      id: subject.value,
      targetClass: this.targetClass
    };
    for(let predicate of this.properties){
      let key = predicate.replace(/.*\//,'').replace(/.*#/,'');
      key=key.replace(/-/,'_');
      row =  this.getObjects( row,key,subject,predicate );
    }
    return row;
  }
  getObjects(row,key,subjectNode,predicate){
    let all=[];
    row[key] = [];
//    row[key+'_label'] = [];
    let objects = this.store.each( subjectNode, nsp(predicate) );
    for(let object of objects){
      if(object.termType != "NamedNode"){
         all.push(object.value);
         continue;
      }
      let label = (this.store.any(object,nsp('schema:name'))||{}).value;
      if(!label){
//        if(this.isIRI[predicate]) label = object.value
//        else label = object.value.replace(/.*#/,'');
          let hashnums =  (object.value.match(new RegExp('#', "g")) || []).length;
          label = hashnums===1 
                ? object.value.replace(/.*#/,'')
                : object.value;
      }
      let id = object.value;
      if(this.raw) all.push( {id,label} );
//      all.push( {id,label} );
      if(this.raw) {
        row[key].push(id)
        row[key+'_label'].push(label)
      }
      else {
        if(id.match(this.source)){ // is reference to object from same source
          all.push(`<a property="${predicate}" href="#" onclick="handleRDF(event,'${id}')">${label}</a>`);
        }
        else {
          all.push(`<a property="${predicate}" href="${id}">${label}</a>`);
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

