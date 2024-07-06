import {rdfConfig} from '../utils/node-utils.js';
import {fetchShapeFromObject} from '../modules/shape-fetcher.js';

console.log(

  await fetchShapeFromObject({

    targetClass: 'sioc:Forum',
         source: 'http://localhost:8444/home/s/solidify/build/all.ttl',
          shape: 'http://localhost:8444/home/s/solid-web-components/oar/modules/Forum.ttl#ForumShape',
           view: 'http://localhost:8444/home/s/solid-web-components/oar/assets/Forum.tmpl',
         config: rdfConfig,
  })

);
