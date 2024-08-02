import {rdfConfig} from '../utils/node-utils.js';
import {getSingletonStore} from '../utils/rdf-utils.js';

const source = 'http://localhost:8444/home/s/solidify/build/all.ttl';

async function oarShape(component){ 
  let url = component.source;
  let config = getSingletonStore(rdfConfig);
  config.shapeUrl = component.shapeUrl;
  config.shapeType = component.shapeType;
  let pkg = await import(`../modules/${component.shape}.js`);
  let shapeConstructor = pkg[component.shape];
  let shape = new shapeConstructor( config );
  return await url.match(/#/) ?shape.get(url) :shape.getAll(url);
}
//console.log( await oarShape({ source, shape:'Service' }) );
console.log(
  await oarShape({
    source, 
    shape:'Forum' ,
    shapeUrl: 'http://localhost:8444/home/s/solid-web-components/oar/modules/Forum.ttl#ForumShape',
    shapeType: 'sioc:Forum',
  })
 );
