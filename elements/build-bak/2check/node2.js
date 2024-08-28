import {getSingletonStore,webOp,sym} from '/home/jeff/s/solid-web-components/elements/utils/rdf-utils.js';
import {fetchNonRdfData} from '/home/jeff/s/solid-web-components/elements/utils/model.js';
import {domFromContent} from '/home/jeff/s/solid-web-components/elements/utils/utils.js';


(async()=>{
  let rdf = await getSingletonStore();
  let source = 'https://www.dublincore.org/specifications/dublin-core/dcmi-terms/';
  let wanted = null //'tr.divider-title-row' ;
  let content = await fetchNonRdfData({source,wanted,type:'component'});
  let dom = await domFromContent(content);
  let rows = dom.querySelectorAll('tr');
  for(let row of rows){
    if(row.id) console.log(row.id);
  }
})();
