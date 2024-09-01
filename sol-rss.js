import {SolBase} from './sol-base.js';
import {selector} from './views/selector.js';
import {links} from './views/links.js';

export class SolRss extends SolBase {
  constructor(){
    super(); 
    this.type="rdf";
  }
  async showData(data,element){
    return super.showData( await rss(data,element), element );
  }
}
customElements.define('sol-rss', SolRss);

export async function rss(data,element){
    const el = await selector(data,element);
    const selectElement=el.querySelector('.sol-selector')
//    selectElement.setAttribute('onchange',"javascript:solrun(event,'showFeedItems')");
    selectElement.addEventListener('change',(event)=>{
      showFeedItems(selectElement,element);
    });
    selectElement.setAttribute( 'proxy', element.getAttribute('proxy') );
    await showFeedItems(selectElement,element);
    el.style['box-sizing'] = "box-model";
//    el.style.width = "17.5rem";
    el.style.width = "100%";
    selectElement.style['border-radius']="0.3rem 0.3rem 0 0";
    return el;
}
export async function showFeedItems(selector,element){
    const index= selector.selectedIndex || 0;
    const feedUri = (selector.options[index]).value
    const proxy = selector.getAttribute('proxy');
    let items = await getFeedItems(feedUri,{proxy,anchorOnly:1});
    element.scrollable=true;
    element.linkTarget="popup";
    element.style.display="block";
    selector.style["font-weight"]="bold";
    //let anchors = await links({viewIn:"popup",scrollable:true},items);
    let anchors = await links(items,element);
    let selectorParent = selector.parentNode.querySelector('.sol-selector-display');
    selectorParent.style.height="100%";
    selectorParent.classList.add('sol-selector-links');
    // selectorParent.innerHTML=anchors.innerHTML;
    selectorParent.innerHTML="";
    for(let a of anchors.childNodes){
      a.style.padding="0.5rem";
      selectorParent.appendChild(a);
    }
    selectorParent.style["text-align"]="left";
    selectorParent.style.border="1px solid gray";
    selectorParent.style['overflow-y']="scroll";
    selectorParent.style['border-radius']="0 0 0.3rem 0.3rem";
//    selectorParent.style.height = "13rem";
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
