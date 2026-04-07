import {getSingletonStore} from './rdf-utils.js';

async function test(){
  let one = await getSingletonStore();
  await one.fetcher.load("http://localhost:8444/home/s/catalog/catalog-data.ttl");
  await one.fetcher.load("http://localhost:8444/home/s/catalog/catalog-skos.ttl");
  console.log( miniQuery(one.store,{
//    wanted : "? a Event"
    wanted : "? broader LearningResource"
  }));
}
//test();

export function termFromUrl(url){
  return url.value.replace(/.*#/,'').replace(/.*\//,'');
}

export async function miniQuery(element,opts){
    let one = await getSingletonStore();
    if(element.source) await one.fetcher.load(element.source);
    let results = [];
    const wanted = opts.wanted;
    const limit = opts.limit;
    let [wantedSubject, wantedPredicate, ...wantedObject] = wanted.split(' ');
    wantedObject = wantedObject.join(' ');
    if(wantedPredicate=='a') wantedPredicate = "type";
    let subjects = findSubjects(one.store,wantedSubject);
    for(let subject of subjects){
        let predicates = findPredicates(one.store,subject,wantedPredicate);
        for(let predicate of predicates){
            let objects = findObjects(one.store,subject,predicate,wantedObject);
            if(wantedObject != '?' && objects.length>0) {
               let labelPredicate =  findPredicates(one.store,subject,'name')[0]
                         || findPredicates(one.store,subject,'label')[0]
                         || findPredicates(one.store,subject,'title')[0]
                         || findPredicates(one.store,subject,'prefLabel')[0];
                let label = labelPredicate ?one.store.any(subject,labelPredicate) :subject;
                results.push( {label:label.value,value:subject.value} );
                break
            }
        }
    }
    if(limit) results = results.slice(0,limit);
    return isort(results);
}
export function findObjects(store,subject,predicate,wantedObject){
    const isObject = {}
    const objects = [];
    const triples = store.match(subject,predicate);
    for(let t of triples){
        if(wantedObject && wantedObject != "?"){
            let foundObject = t.object.termType=='NamedNode' ?termFromUrl(t.object) :t.object;
            if(foundObject == wantedObject) return [t.object];
        }
        else {
            if(isObject[t.object]) continue;
            isObject[t.object] = true;
            objects.push(t.object);
        }
    }
    return objects;
}
export function findPredicates(store,subject,wantedPredicate){
    const isPredicate = {}
    const predicates = [];
    const triples = store.match(subject);
    for(let t of triples){
        if(wantedPredicate){
            let foundPredicate = termFromUrl(t.predicate);
            if(foundPredicate == wantedPredicate) return [t.predicate];
        }
        else {
            if(isPredicate[t.predicate]) continue;
            isPredicate[t.predicate] = true;
            predicates.push(t.predicate);
        }
    }
    return predicates;
}
export function findSubjects(store,wantedSubject){;
  const subjects = [];
  const isSubject = {}
  const notUnique = store.match();
  for(let s of notUnique){
    if(wantedSubject && wantedSubject != "?"){
      let foundSubject = termFromUrl(s.subject);
      if(foundSubject == wantedSubject) return [s.subject];
    }
    if(isSubject[s.subject]) continue;
    isSubject[s.subject] = true;
    subjects.push(s.subject);
  }
  return subjects;
}

export function isort(data) {
    return data.sort((a, b) => {
        a=a.label||a.value||a;
        b=b.label||b.value||b;
        const nameA = a.toLowerCase(); // Convert to lowercase
        const nameB = b.toLowerCase(); // Convert to lowercase
        if (nameA < nameB) {
            return -1; // a comes before b
        }
        if (nameA > nameB) {
            return 1; // a comes after b
        }
        return 0; // a and b are equal
    });
};
