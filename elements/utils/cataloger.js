import {count} from './rdf-utils.js';
(async()=>{ 
  let data;
  data = 
    await count("http://localhost:8444/home/s/solidify/build/all.ttl")
//    await getMissing("http://localhost:8444/home/s/solidify/build/all.ttl",'schema:name')
//    await getPredicates("http://localhost:8444/home/s/solidify/build/all.ttl")
//    await count("http://localhost:8444/home/s/solidify/build/prozion.ttl")
  console.log( data  )
})();

