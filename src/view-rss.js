/* import {SolBase} from '../sol-core.js'; */
import {selector,links} from './view-anchorList.js';
import {registerView} from './controller.js';

registerView({
    actions : {showFeedItems},
  templates : {rss}
});
/*
export class SolRss extends SolBase {
  constructor(){
    super(); 
  }
}
customElements.define('sol-rss', SolRss);
*/

export async function rss(element,data){
    const el = await selector(element,data);
    const selectElement=el.querySelector('.sol-selector')
    selectElement.setAttribute('onchange',"javascript:solrun(event,'showFeedItems')");
    selectElement.setAttribute( 'proxy', element.getAttribute('proxy') );
    await showFeedItems(selectElement);
    return el;
}

export async function showFeedItems(selector,flags){
    const index= selector.selectedIndex || 0;
    const feedUri = (selector.options[index]).value
    const proxy = selector.getAttribute('proxy');
    let items = await getFeedItems(feedUri,{proxy,anchorOnly:1});
    let anchors = await links({viewIn:"popup"},items);
    let selectorParent = selector.parentNode.querySelector('.sol-selector-display');
    selectorParent.classList.add('sol-links');
    selectorParent.innerHTML=anchors.innerHTML;
    selectorParent.scrollTop = 0;
}


export async function getFeedItems(feedUri,options){
    options ||= {};
    const proxy = options.proxy || "";
    const isVideoFeed = options.isVideoFeed;

    // fetch feed URI & load it into a DOM structure
    //
    feedUri = proxy + encodeURI( feedUri );
    let feedDom;
    try {
      let response = await fetch( feedUri );
      let feedContent = await response.text();
      const domParser = new window.DOMParser();
      feedDom = domParser.parseFromString(feedContent, "text/xml")
    }
    catch(e) { alert(e) };

    // find items (RSS) or entries (Atom)
    //
    let items = feedDom.querySelectorAll("item") || null;
    let thumbnail;
    if(isVideoFeed){
       thumbnail = feedDom.querySelector("channel").querySelector("title").innerHTML;
    }
    items = items.length<1 ?feedDom.querySelectorAll("entry") :items;

    //
    // parse items
    //
    let parsedItems=[];
    items.forEach( el => {

      // find item link, account for specific kinds of quirks
      //
      let link = el.querySelector("link").innerHTML;
      // vox
      if(!link) link = el.querySelector('link').getAttribute('href');
      // reddit
      if(!link || link.match(/ /)){
        link = el.querySelector('content').innerHTML.replace(/.*\[link\]/ ,'').replace(/a href="/,'').replace(/"&gt;.*/,'').replace(/.*&lt;/,'');
      }
      // engadget
      if(!link.match(/^http/))link=link.replace(/.*\[CDATA\[/,'').replace(/\]\]\>$/,'');

      // always use https, not http
      link = link.replace(/^http:/,'https:');

      // get the title
      let label = el.querySelector("title").innerHTML;
      label = label.replace(/^\<\!\[CDATA\[/,'');
      label = label.replace(/\]\].*\>/,'').trim();

      if(isVideoFeed){
        link = el.querySelector('enclosure').getAttribute('url');  
        label= thumbnail;
      }
      let row = {label,link};
      if( !options.anchorOnly ){
        for(let field of el.childNodes){
          if(field.tagName) row[field.tagName] = field.textContent;
        }
      }
      parsedItems.push(row);
      // parsedItems.push({label,link});
    });
    return parsedItems;
  }  // END OF fetchAnchorArray.rss
