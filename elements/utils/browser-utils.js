const host = "http://localhost:8444";
window.SolidAppContext = {
  noAuth : host,
  webId : host + "/profile/card#me",
  scroll : 200 // for eyeFocus, should be height of top banner
}
window.$SolidTestEnvironment = {
  iconBase : "/assets/icons/",
  originalIconBase : "/assets/originalIcons/",
}
//import 'https://cdn.jsdelivr.net/npm/solid-ui@latest/dist/solid-ui.min.js';
import 'https://cdn.jsdelivr.net/npm/mashlib@latest/dist/mashlib.min.js';
import "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
import "https://cdn.jsdelivr.net/npm/dompurify@3.1.6/dist/purify.min.js";

export  function fetchUI(){
  if(typeof window !="undefined"){
    let UI = window.UI;
    if(UI){
      const config = {
        store:UI.store,
        fetcher:UI.store.fetcher,
        updater:UI.store.updater,
        ns:UI.ns,
        sym:UI.rdf.sym,
        lit:UI.rdf.lit,
        UI:UI,
      };
      delete window.UI;
      return config;
    }
  }
}

