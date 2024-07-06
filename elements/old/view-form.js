import { isoDoc,isoWin } from './isomorphic.js';
import { rel2absIRI } from './utils.js';
import { registerView,processCustomElement } from './controller.js';
import { fetchRdfData,bestLabel} from './model-rdf.js';

/* HANDLE FORM ACTIONS
*/
  registerView({
    actions : {formNext,formPrevious,formAdd,formRemove,formHelp},
  });

  export async function formAdd(clickedElement){ 
    let element = clickedElement.closest('.sol-form').parentNode;
    let header = clickedElement.closest('.sol-form-header');
    let orgSource = element.source;
    let newSubject = UI.rdf.sym( element.source.replace(/#.*$/,'') + '#' + Math.random() );
    let formNode = UI.rdf.sym(element.form);
    let defaults = UI.store.each(formNode,UI.ns.ui('defaultForNew'));
    let ins =[];
    let del = [];
    for(let d of defaults){
      let predicate = UI.store.any(d,UI.ns.ui('property'));
      let object = UI.store.any(d,UI.ns.ui('default'));
      let exists = UI.store.any(newSubject, predicate, object, newSubject.doc() ) ;
      if(exists && exists.length==0) continue;
      if(predicate.value==UI.ns.rdf('type').value){
        object = UI.rdf.sym(object.value);
      }
      ins.push( UI.rdf.st( newSubject, predicate, object, newSubject.doc() ) );
    }
    UI.store.updater.update(del, ins, (uri, ok, message) => {
      if (ok){
        console.log('add successful');
        element.source=newSubject.value;
        element.setAttribute('source',newSubject.value);
        element.innerHTML="";
        processCustomElement(element);
      }
      else alert(message)
    })
  }
  export async function formRemove(clickedElement){
    let form = clickedElement.closest('.sol-form');
    let element = form.parentNode;
    let source = UI.rdf.sym(element.source);
    let toRemove = UI.rdf.sym( form.getAttribute('data-source') );
    let ins = [];
    let del = [];
    for(let s of UI.store.match(toRemove,null,null,source.doc())){
      del.push(s)
    }
    UI.store.updater.update(del, ins, (uri, ok, message) => {
       if (ok) {
         console.log('Removal succeeded.');
         element.innerHTML=""
         element.setAttribute('source', element.source.replace(/#.*$/,''));
         processCustomElement(element);
       }
       else alert('Removal failed : ',message)
    });
  }
  async function formNext(d){
    let currentIndex = Number(d.closest('.sol-form-header').getAttribute('index'));
    let maxIndex = Number(d.closest('.sol-form-header').getAttribute('maxindex'));
    let nextIndex = currentIndex +1;
    if( nextIndex > maxIndex ) nextIndex = 1;
    let indexArea = d.closest('.sol-form-header').querySelector('.index');
    indexArea.innerHTML=nextIndex;
    d.closest('.sol-form-header').setAttribute('index',nextIndex);
    let component = d.closest('.sol-form').parentNode;
    return showComponent(component,nextIndex-1);
  }
  async function formPrevious(d){
    let currentIndex = Number(d.closest('.sol-form-header').getAttribute('index'));
    let maxIndex = Number(d.closest('.sol-form-header').getAttribute('maxindex'));
    let prevIndex = currentIndex - 1;
    if( prevIndex < 1 ) prevIndex = maxIndex;
    let indexArea = d.closest('.sol-form-header').querySelector('.index');
    indexArea.innerHTML=prevIndex;
    d.closest('.sol-form-header').setAttribute('index',prevIndex);
    let component = d.closest('.sol-form').parentNode;
    return showComponent(component,prevIndex-1);
  }
  export async function formHelp(clickedElement){
  }
  function showComponent(component,index){
    let old = component.childNodes[0].childNodes[1];
    old.remove();
    var myArray = JSON.parse(component.getAttribute('data-array'));
    component.source = myArray[index];
    return fetchOneForm(component);
  }

/* PREPARE FORM CONTAINER & HEADER
*/
  export async function fetchForm(element,data){
    let node = UI.rdf.sym(element.source);
    if( node.doc().uri != element.source) {
      let orgSource = element.source
      element.source = element.source.replace(/#.*$/,'')
      data = await fetchRdfData(element);
      element.source = orgSource
    }
    else {
      data = await fetchRdfData(element);
    }
    let subjects = [];
    const container = document.createElement("DIV");
    container.classList.add('sol-form');
    element.container = container;
      element.setAttribute('maxIndex',data.length);
      element.maxIndex = data.length;
      for(let row of data) subjects.push(row.id);
      let arrayStr = JSON.stringify(subjects);
      element.setAttribute('data-array',arrayStr);
      if( node.doc().uri != element.source) {
        let currentIndex = subjects.indexOf(element.source) +1;
        if(currentIndex<1)currentIndex=1;
        element.setAttribute('index',currentIndex);
        element.index = currentIndex;
      }
      else {
        element.source = subjects[0];
        element.setAttribute('index',1);
        element.index = 1;
      }
      container.appendChild( createFormHeader(element,data) );
      element.container = container;  
      return fetchOneForm(element);
  }
  export async function fetchOneForm(element){
    element.resultDocument = element.getAttribute('resultDocument');
    if(element.resultDocument) element.resultDocument = await rel2absIRI(element.resultDocument);
    return await renderForm({
                form : element.form,
         formSubject : element.source,
      resultDocument : element.resultDocument,
           container : element.container,
              element,
    });
  }
  function createFormHeader(element,data){
    let prevClick = "solrun(event,'formPrevious')";
    let nextClick = `solrun(event,'formNext')`;
    let addClick = `solrun(event,'formAdd')`;
    let removeClick = `solrun(event,'formRemove')`;
    let helpClick = `solrun(event,'formHelp')`;
    let bstyle = "background:none !important;border:none;font-size:150%;cursor:pointer";
    let dataSource = bestLabel((UI.rdf.sym(element.source)).doc());
    let header = document.createElement('DIV');
    header.innerHTML = `
<div class="sol-form-header" index="${element.index}" maxindex="${element.maxIndex}">
  <i>editing</i> ${dataSource.value}
  <span class="index">${element.index}</span>/<span class="maxIndex">${element.maxIndex}</span>
  <span class="sol-navigation-buttons" role="navigation">                         
    <button onclick="${prevClick}" style="${bstyle}" title="previous" role="button">&lt;</button>
    <button onclick="${nextClick}" style="${bstyle}" title="next" role="button">&gt;</button>
    <button onclick="${addClick}" style="${bstyle}" title="add" role="button">+</button>
    <button onclick="${removeClick}" style="${bstyle}" title="remove" role="button">-</button>
<!--    <sol-modal source="./data/form-help.html" style="${bstyle}" height="360px;" width="640px">?</sol-modal> -->
  </span>
    `;
    header.style['font-size']='130%';
    header.style['margin-bottom']='0.5rem';
    return(header)
  }

/* RENDER FORM
*/
  async function renderForm(o){

    const dom = o.dom || document;
    const container = o.container;

    // the form data (subect)
    let subject = o.formSubject ;
    subject = UI.rdf.sym(subject);
    if(o.forceReload){ 
      if(subject && subject.doc) UI.store.removeDocument(subject.doc());
    }
    if(subject) await UI.store.fetcher.load(subject);
    else {
      container.innerHTML+="ERROR : Could not load form subject "
      return container;
    }

    // the form
    let form = UI.rdf.sym(o.form);
    if(o.formString){
      UI.rdf.parse(string,UI.store,o.form,'text/turtle');
    }
    else await UI.store.fetcher.load(o.form);

    // optional results document & script
    let doc = o.formResultDocument;
    if(subject && !doc && subject.doc) doc = subject.doc();
    const script = o.script || async function (err,message){
      console.log(err,message)
      // await UI.store.fetcher.putBack(subject) // tempory work-around ui:ordered bug
    };

    let dataSource = subject && subject.doc ?bestLabel(subject.doc()) :"";
    let formSource = bestLabel(form);

    // create the form
    try {
      await UI.widgets.appendForm(dom, container, {}, subject, form, doc, script);
    }
    catch(e){
       // console.log(dom,container,subject,form,doc)
       container.innerHTML = "FORM ERROR:"+e;
    }  
    container.setAttribute('data-source',o.formSubject);
    return container;
  }

