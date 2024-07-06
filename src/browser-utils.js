import 'https://cdn.jsdelivr.net/npm/solid-ui@latest/dist/solid-ui.min.js';

export  function getUI(){
  if(typeof window !="undefined"){
    let UI = window.UI;
    if(UI){
      delete window.UI;
      return({
        store:UI.store,
        fetcher:UI.store.fetcher,
        updater:UI.store.updater,
        ns:UI.ns,
        sym:UI.rdf.sym,
        lit:UI.rdf.lit,
      });
    }
  }
}

