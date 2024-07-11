import {fetchRdfData,filterRdf,getSingletonStore} from './utils/rdf-utils.js';

(async()=>{
  await getSingletonStore();
  let element = {
       source: 'http://localhost:8444/s/solidify/build/all.ttl',
     shapeUrl: 'http://localhost:8444/s/solid-web-components/oar/modules/Forum.ttl#ForumShape',
      shapeType: 'sioc:Forum',
      wanted:"provider Practitioners",
          raw: false,
  };
  let data = await fetchRdfData(element);
  data = await filterRdf(data,element);
  console.log(data);
})();
