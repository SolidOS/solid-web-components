import {wantedProperties} from './catalog-definition.js';

for(let k of Object.keys(wantedProperties)){
  console.log(`
    sh:property [
        sh:path <${wantedProperties[k]}> ;
        rdfs:label "${k}" ;
    ] ;
  ` );   
}
