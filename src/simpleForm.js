function _getFirstInput(element){
  for(let fieldType of ['INPUT','TEXTAREA','SELECT']){
     if(element.tagName.match(fieldType)) return element.value;
     let val = element.getElementsByTagName(fieldType);
     if(val && val[0] ) return val[0].value;
  }
}
export async function makeSimpleForm(element){
  let node = UI.rdf.sym(element.source);
  await UI.store.fetcher.load(node.doc());
  let formElement = document.createElement('DIV');
  let subject = options.formSubject;
  for(let p of options.parts){
    let predicate = UI.rdf.sym(p.property);
    let object = (UI.store.any(node,predicate)||{}).value;
    let fieldType;
    if(p.type.endsWith("SingleLineTextField")) fieldType = "TEXT";
    if(p.type.endsWith("MultiLineTextField")) fieldType = "TEXTAREA";
    if(p.type.endsWith("RadioSet")) fieldType = "RADIO";
    p.fieldType = fieldType;
    options.current = p;
    let field = await _makeField(node,predicate,object,options) ;
    if(field) formElement.appendChild( field );
  }
  return formElement;
}
export async function harvestForm(url,config){
  let harvested = [];
  let form = document.getElementById(url);
  let inputs = form.querySelectorAll(`[data-subject="${url}"]`);
  for(let i of inputs){
    let row = {};
    harvested.type ||= i.dataset.type;
    row.subject =  url;
    row.predicate = i.dataset.predicate;
    row.object = i.value;
    if(i.type==="textarea") row.object = i.innerHTML;
    else if(i.type==="radio" && i.checked) { row.object = i.value;}
    else if(i.type==="radio") continue;
    harvested.push(row);
  }
  return harvested;  
  //console.log(44,JSON.stringify(harvested,4,4))
}

function _makeField(subject,predicate,object,options){
  const predLabel = UI.utils.label(predicate);
  predicate = predicate.value;
  subject = subject.value;
  let row = document.createElement('DIV');
  let label = document.createElement('DIV');
  label.style['font-weight'] = "550";
  if(options.horizontalLabels) {
    label.style.display = "table-cell";
    row.style.display = "table-row;border-radius:0.5rem;margin-bottom:1rem;"
    label.style['text-align'] = "right";
    label.style.width = "12ch";
    label.style["vertical-align"]="top";
    field.style['margin-left'] = "1rem";
  }
  label.innerHTML = predLabel;
  let field = document.createElement('DIV');
  field.style.display = "table-cell"
  let fieldValue = object ?object.trim() :""
  field.style["border-radius"] = "0.4rem";
  let fieldContent = _fieldFunction[options.current.fieldType](subject,predicate,fieldValue,options);
  field.appendChild(fieldContent);
  row.appendChild(label);
  row.appendChild(field);
  return row;

}

const _fieldFunction = {

  RADIO: (subject,predicate,object,options)=>{
    let fieldset = document.createElement('FIELDSET');
    for(let item of options.current.radioButtons) {
      let radio = document.createElement('INPUT');
      let radioLabel = document.createElement('SPAN');
      radio.name = predicate;
      radio.type =  "radio";
      radio.name = predicate;
    radio.dataset.oldvalue = object;
    radio.dataset.subjecttype = options.subjectType;
    radio.dataset.subject = subject;
    radio.dataset.predicate = predicate;
      if(item.id===object){
        radio.checked = true;
      }
      radioLabel.dataset.object = radio.value = item.id;
      radioLabel.innerHTML = UI.utils.label(UI.rdf.sym(item.id)) + "&nbsp;";
      fieldset.appendChild(radio);
      fieldset.appendChild(radioLabel);
    }
    if(options.horizontalFields) fieldset.style.marginLeft = "1rem";
    fieldset.style.paddingLeft = 0;
    fieldset.style.paddingRight = 0;
    fieldset.style.marginBottom = "1rem";
    fieldset.style["font-size"] = "95%";
//    fieldset.style.width = "30rem";
    fieldset.style["border-radius"] = "0.4rem";
/*
    fieldset.dataset.subject = subject;
    fieldset.dataset.predicate = predicate;
    fieldset.dataset.object = predicate;
*/
    return fieldset;
  },
  TEXT: (subject,predicate,object,options)=> {
    let field = document.createElement('INPUT');
    field.value = object;
    field.type = 'text';
    field.dataset.oldvalue = object;
    field.dataset.subjecttype = options.subjectType;
    field.dataset.subject = subject;
    field.dataset.predicate = predicate;
    field.style["font-size"] = "95%";
//    field.style.width = "30rem";
    field.style.padding = "0.5rem";
    if(options.horizontalFields) field.style["margin-left"] = "1rem";
    field.style["margin-bottom"] = "1rem";
    field.style["border-radius"] = "0.4rem";
    return field;
  },
  TEXTAREA: (subject,predicate,object,options)=> {
    let field = document.createElement('TEXTAREA');
    field.innerHTML = object;
    field.dataset.oldvalue = object;
    field.dataset.subjecttype = options.subjectType;
    field.dataset.subject = subject;
    field.dataset.predicate = predicate;
    field.style.height = "10rem";
    field.style["font-size"] = "95%";
//    field.style.width = "30rem";
    field.style.padding = "0.5rem";
    if(options.horizontalFields) field.style["margin-left"] = "1rem";
    field.style["margin-bottom"] = "1rem";
    field.style["border-radius"] = "0.4rem";
    return field;
  },
}

