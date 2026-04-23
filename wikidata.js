import {solQuery} from './sol-query-node.js';

const endpoint = 'https://query.wikidata.org/sparql';
const queryLibrary = 'http://localhost:3000/s/solid-web-components/wikidataQueries.ttl#';

const query = [
  'mostUsedProperties',
  'mostCommonClasses',
  'allProperties',
];
(async ()=>{
  for(const q of query){
    console.log(q);
    const data = await solQuery({
      endpoint,
      sparql: queryLibrary + q
    })
    console.log(data);
  }
})();
