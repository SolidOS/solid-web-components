import {rdfConfig} from '../utils/node-utils.js';
import {getSingletonStore} from '../utils/rdf-utils.js';
import {ShapeFetcher} from '../modules/shape-fetcher.js';

async function oarShape(component){ 
  let url = component.source;
  let config = getSingletonStore(rdfConfig);
  config.shapeUrl = component.shapeUrl;
  config.shapeType = component.shapeType;
  let shape = new ShapeFetcher( config );
  return await url.match(/#/) ?shape.get(url) :shape.getAll(url);
}

console.log(
  await oarShape({
       source: 'http://localhost:8444/home/s/solidify/build/all.ttl',
     shapeUrl: 'http://localhost:8444/home/s/solid-web-components/oar/modules/Forum.ttl#ForumShape',
    shapeType: 'sioc:Forum',
  })
);
