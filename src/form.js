import {bestLabel} from './model-rdf.js';

  /**
   * @param {String}      form - the URL of the form definition document
   * @param {String}      formSubject - the data for the form
   * @param {String}      [formString] - a string form definition
   * @param {HTMLElement} [dom=document] - DOM container to hold form
   * @param {Boolean}     [forceReload] - empty store before loading
   * @param {String}      [formResultDocument] - place to store form results
   * @param {Function}    [script] - Javascript to execute on form change
   * @returns an HTML DIV element containing the form
   */
  export async function fetchForm(element,data){
    let node = UI.rdf.sym(element.source);
    await UI.store.fetcher.load(node.doc());
    if( node.doc().uri != element.source) return fetchOneForm(element);  // fragment not document
    else {
      let subjects = [];
      for(let row of data) subjects.push(row.id);
      let maxIndex = subjects.length;
      element.source = subjects[0];
      return fetchOneForm(element);
    }
  }
  export async function fetchOneForm(element){
console.log(2,element.source)
    return await renderForm({
                form : element.form,
         formSubject : element.source,
      resultDocument : element.resultDocument,
    });
  }
  async function renderForm(o){
    const dom = o.dom || document;
    const container = document.createElement("DIV");
    container.classList.add('sol-form');

    // the form
    let form = UI.rdf.sym(o.form);
    if(o.formString){
      UI.rdf.parse(string,UI.store,o.form,'text/turtle');
    }
    else await UI.store.fetcher.load(o.form);

    // the form data (subect)
    let subject = o.formSubject ;
alert(subject)
    if(!subject){
       let fSubj = UI.rdf.sym('http://www.w3.org/ns/ui#formSubject');
       subject = UI.store.any(form,fSubj)
    }
    else subject = UI.rdf.sym(subject);
    if(o.forceReload){ 
      if(subject && subject.doc) UI.store.removeDocument(subject.doc());
    }
    if(subject) await UI.store.fetcher.load(subject);
    else {
      container.innerHTML="ERROR : Could not load form subject "
      return container;
    }

    // optional results document & script
    let doc = o.formResultDocument;
    if(subject && !doc && subject.doc) doc = subject.doc();
    const script = o.script || async function (err,message){
      console.log(err,message)
      // await UI.store.fetcher.putBack(subject) // tempory work-around ui:ordered bug
    };

    let dataSource = bestLabel(subject.doc());
    let formSource = bestLabel(form);
    let header = document.createElement('DIV');
    header.innerHTML = `Editing <b>${dataSource.value}</b>`;
    container.appendChild(header);


    // create the form
    try {
      await UI.widgets.appendForm(dom, container, {}, subject, form, doc, script);
    }
    catch(e){
       // console.log(dom,container,subject,form,doc)
       container.innerHTML = "FORM ERROR:"+e;
    }  

    return container;
  }
