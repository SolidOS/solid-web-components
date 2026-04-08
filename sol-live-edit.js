/**
 * <sol-live-edit> — live split-pane editor web component.
 * Attributes: source="URL"  format="turtle|csv|markdown|html|mermaid|jsonld|graphviz"
 *             readonly  (boolean — disables save button)
 * Properties: fetchFn (Function) — authenticated fetch; content (string get/set)
 * Events: sol-change({content}), sol-save({content,url}), sol-load({content,url})
 */

import { buildEditor } from './utils/cm-editor.js';
import { CSS } from './utils/sol-live-edit-css.js';

const R = './utils/renderers/';
const H = './utils/live-edit-help/';
const D = './data/live-edit/';

// Lazy renderer lookup — imported on first use
const RENDERERS = {
  turtle:   () => import(`${R}turtle.js`).then(m => m.renderTurtle),
  jsonld:   () => import(`${R}jsonld.js`).then(m => m.renderJsonLd),
  csv:      () => import(`${R}csv.js`).then(m => m.renderCSV),
  markdown: () => import(`${R}markdown.js`).then(m => m.renderMarkdown),
  mermaid:  () => import(`${R}mermaid.js`).then(m => m.renderMermaid),
  html:     () => import(`${R}html.js`).then(m => m.renderHtml),
  graphviz: () => import(`${R}graphviz.js`).then(m => m.renderGraphviz),
};
const _rendererCache = {};

const HELP = {
  turtle: () => import(`${H}turtle.js`).then(m => m.turtleHelp),
  jsonld: () => import(`${H}jsonld.js`).then(m => m.jsonldHelp),
  csv:    () => import(`${H}csv.js`).then(m => m.csvHelp),
  markdown: () => import(`${H}markdown.js`).then(m => m.markdownHelp),
  mermaid: () => import(`${H}mermaid.js`).then(m => m.mermaidHelp),
  graphviz: () => import(`${H}graphviz.js`).then(m => m.graphvizHelp),
};

const EXAMPLES = {
  turtle: () => import(`${D}turtle.js`).then(m => m.example),
  jsonld: () => import(`${D}jsonld.js`).then(m => m.example),
  csv:    () => import(`${D}csv.js`).then(m => m.example),
  markdown: () => import(`${D}markdown.js`).then(m => m.example),
  mermaid:  () => import(`${D}mermaid.js`).then(m => m.example),
  html:     () => import(`${D}html.js`).then(m => m.example),
  graphviz: () => import(`${D}graphviz.js`).then(m => m.example),
};

const ZOOM_FMTS = new Set(['turtle','jsonld','graphviz','markdown','mermaid']);

const EXT = {ttl:'turtle',n3:'turtle',turtle:'turtle',jsonld:'jsonld',csv:'csv',tsv:'csv',
             md:'markdown',markdown:'markdown',mmd:'mermaid',mermaid:'mermaid',
             html:'html',htm:'html',dot:'graphviz',gv:'graphviz'};

const MIME = {'text/turtle':'turtle','text/n3':'turtle','application/ld+json':'jsonld',
              'text/csv':'csv','text/tab-separated-values':'csv','text/markdown':'markdown',
              'text/x-markdown':'markdown','text/html':'html','text/x-mermaid':'mermaid',
              'text/vnd.graphviz':'graphviz','text/x-dot':'graphviz'};

const FMIME = {turtle:'text/turtle',jsonld:'application/ld+json',csv:'text/csv',
               markdown:'text/markdown',html:'text/html',mermaid:'text/x-mermaid',
               graphviz:'text/vnd.graphviz'};

const CM_EXT = {turtle:'ttl',jsonld:'jsonld',markdown:'md',html:'html'};

class SolLiveEdit extends HTMLElement {
  static get observedAttributes() { return ['source','format','readonly']; }
  constructor() {
    super();
    this._fn=null;this._cm=null;this._db=null;this._sim=null;this._fmt=null;this._statsOn=false;
    this._cfg={view:'both',keys:'default'};this._zoom=1.0;
    this.attachShadow({mode:'open'});
  }
  get fetchFn(){return this._fn;} set fetchFn(f){this._fn=f;}
  // _cm is always normalised to { getValue, setValue, destroy }
  get content(){return this._cm?this._cm.getValue():'';}
  set content(t){this._setContent(t);}
  get format(){return this._fmt;}

  async connectedCallback(){await this._init();}
  attributeChangedCallback(n,_,v){
    if(!this.shadowRoot.firstChild)return;
    if(n==='source')this._loadSrc(v);
    if(n==='format')this._setFmt(v);
  }

  // ── Public API for host page buttons ────────────────────────────────────────
  get canZoom()  { return ZOOM_FMTS.has(this._fmt); }
  get canStats() { return this._fmt === 'csv'; }
  get zoom()     { return Math.round(this._zoom * 100); }
  zoomIn()       { this._setZoom(this._zoom + 0.2); }
  zoomOut()      { this._setZoom(this._zoom - 0.2); }
  save()         { this._save(); }
  toggleSettings(){ this._toggleCfg(); }
  toggleHelp()   { this._toggleHelp(); }
  toggleStats()  { this._toggleStats(); }

  async _init(){
    const s=this.shadowRoot;
    s.innerHTML=`<style>${CSS}</style>
<div class="er" id="er"></div>
<div class="cf" id="cf" style="display:none"><div class="cg"><b>View</b><label><input type="radio" name="sle-view" value="both">Show Both</label><label><input type="radio" name="sle-view" value="editor">Hide Preview</label><label><input type="radio" name="sle-view" value="preview">Hide Editor</label></div><div class="cg"><b>Keys</b><label><input type="radio" name="sle-keys" value="default">Default</label><label><input type="radio" name="sle-keys" value="emacs">Emacs</label><label><input type="radio" name="sle-keys" value="vim">Vim</label></div></div>
<div class="body"><div class="ep" id="ep"></div>
<div class="pp" id="pp"><div class="hl" id="hl"></div>
<div id="po" style="width:100%;height:100%;position:relative"></div>
<div class="st" id="st" style="display:none"></div></div></div>`;
    s.getElementById('cf').addEventListener('change',e=>{
      const nm=e.target.name;if(!nm?.startsWith('sle-'))return;
      const k=nm.slice(4);this._cfg[k]=e.target.value;this._saveCfg();
      if(k==='view')this._applyView();
      else{const p=this.content;this._buildEditor().then(()=>this._setContent(p));}
    });
    this._loadCfg();
    const src=this.getAttribute('source');
    const fmt=this.getAttribute('format')||EXT[src?.split('.').pop()?.toLowerCase()]||'markdown';
    await this._setFmt(fmt);
    this._applyView();
    if(src){await this._loadSrc(src);}
    else{const ex=await(EXAMPLES[fmt]||EXAMPLES.markdown)().catch(()=>'');await this._setContent(ex);}
  }

  async _setFmt(fmt){
    this._fmt=fmt||'markdown';
    this._zoom=1.0;
    const po=this.shadowRoot.getElementById('po');if(po)po.style.zoom='';
    this.dispatchEvent(new CustomEvent('sol-format',{detail:{format:this._fmt,canZoom:this.canZoom,canStats:this.canStats},bubbles:true,composed:true}));
    await this._buildEditor();
  }

  async _buildEditor(){
    const pane=this.shadowRoot.getElementById('ep');
    if(!pane)return;
    if(this._cm){this._cm.destroy();this._cm=null;}
    const extKey=CM_EXT[this._fmt]||null;
    try{
      // podz-editor.js already returns { getValue, setValue, destroy }
      const {createEditor}=await import('../src/podz-editor.js');
      this._cm=await createEditor(pane,'',extKey?`f.${extKey}`:'f.txt',
        {dark:false,keyBindings:this._cfg.keys,onChange:()=>this._change()});
    }catch(_){
      // standalone fallback — wrap raw EditorView in same interface
      const view=await buildEditor(pane,extKey,this.shadowRoot,()=>this._change());
      this._cm={
        getValue:()=>view.state.doc.toString(),
        setValue:(v)=>view.dispatch({changes:{from:0,to:view.state.doc.length,insert:v}}),
        destroy:()=>view.destroy(),
      };
    }
  }

  _change(){
    clearTimeout(this._db);this._db=setTimeout(()=>this._render(),400);
    this.dispatchEvent(new CustomEvent('sol-change',{detail:{content:this.content},bubbles:true,composed:true}));
  }

  async _setContent(text){
    if(!this._cm)return;
    this._cm.setValue(text);
    await this._render();
  }

  async _render(){
    if(this._sim){this._sim();this._sim=null;}
    const out=this.shadowRoot.getElementById('po');
    const er=this.shadowRoot.getElementById('er');
    if(!out)return;
    if(!_rendererCache[this._fmt]&&RENDERERS[this._fmt])
      _rendererCache[this._fmt]=await RENDERERS[this._fmt]();
    const fn=_rendererCache[this._fmt];
    if(!fn){out.innerHTML='<p style="padding:1rem">No preview.</p>';return;}
    try{
      const r=await fn(this.content,out);
      if(typeof r==='function')this._sim=r;
      er.textContent='';er.classList.remove('on');
    }catch(e){er.textContent=e.message;er.classList.add('on');}
  }

  async _loadSrc(url){
    if(!url)return;
    const fmt=EXT[url.split('?')[0].split('.').pop()?.toLowerCase()]||this._fmt||'markdown';
    if(fmt!==this._fmt)await this._setFmt(fmt);
    try{
      const fn=this._fn||fetch;
      const resp=await fn(url);
      if(!resp.ok)throw new Error(`HTTP ${resp.status}`);
      const text=await resp.text();
      const mf=MIME[(resp.headers.get('content-type')||'').split(';')[0].trim()];
      if(mf&&mf!==this._fmt)await this._setFmt(mf);
      await this._setContent(text);
      if(!this.hasAttribute('readonly')){
        const sb=this.shadowRoot.getElementById('svBtn');if(sb)sb.style.display='';
      }
      this.dispatchEvent(new CustomEvent('sol-load',{detail:{content:text,url},bubbles:true,composed:true}));
    }catch(e){
      const er=this.shadowRoot.getElementById('er');
      if(er){er.textContent=`Load failed: ${e.message}`;er.classList.add('on');}
    }
  }

  async _save(){
    const url=this.getAttribute('source');const text=this.content;
    this.dispatchEvent(new CustomEvent('sol-save',{detail:{content:text,url},bubbles:true,composed:true}));
    if(!url)return;
    try{
      const fn=this._fn||fetch;
      const r=await fn(url,{method:'PUT',headers:{'Content-Type':FMIME[this._fmt]||'text/plain'},body:text});
      if(!r.ok)throw new Error(`HTTP ${r.status}`);
    }catch(e){
      const er=this.shadowRoot.getElementById('er');
      if(er){er.textContent=`Save failed: ${e.message}`;er.classList.add('on');}
    }
  }

  async _toggleHelp(){
    const ov=this.shadowRoot.getElementById('hl');if(!ov)return;
    if(ov.classList.contains('on')){ov.classList.remove('on');return;}
    if(!ov.dataset.loaded){
      const ldr=HELP[this._fmt];
      ov.innerHTML=ldr?_helpHtml(await ldr()):'<p>No help.</p>';
      ov.dataset.loaded='1';
    }
    ov.classList.add('on');
  }

  _loadCfg(){try{Object.assign(this._cfg,JSON.parse(localStorage.getItem('sle-cfg')||'{}'));}catch(_){}}
  _saveCfg(){try{localStorage.setItem('sle-cfg',JSON.stringify(this._cfg));}catch(_){}}
  _setZoom(z){
    this._zoom=Math.max(0.2,Math.min(5.0,Math.round(z*5)/5));
    const pct=Math.round(this._zoom*100);
    const po=this.shadowRoot.getElementById('po');
    if(po)po.style.zoom=this._zoom===1?'':this._zoom;
    this.dispatchEvent(new CustomEvent('sol-zoom',{detail:{zoom:this._zoom,pct},bubbles:true,composed:true}));
  }
  _applyView(){const v=this._cfg.view,sr=this.shadowRoot,ep=sr.getElementById('ep'),pp=sr.getElementById('pp');if(ep)ep.style.display=v==='preview'?'none':'';if(pp)pp.style.display=v==='editor'?'none':'';}
  _toggleCfg(){const p=this.shadowRoot.getElementById('cf');if(!p)return;const o=p.style.display!=='none';p.style.display=o?'none':'';if(!o)this.shadowRoot.querySelectorAll('[name^="sle-"]').forEach(r=>{r.checked=r.value===this._cfg[r.name.slice(4)];});}

  async _toggleStats(){
    const sp=this.shadowRoot.getElementById('st');const out=this.shadowRoot.getElementById('po');
    this._statsOn=!this._statsOn;
    if(this._statsOn){
      try{
        const {parseCSV,calcStats,renderStats}=await import(`${R}csv.js`);
        renderStats(calcStats(parseCSV(this.content)),sp);
      }catch(e){sp.innerHTML=`<p>${e.message}</p>`;}
      sp.style.display='';if(out)out.style.display='none';
    }else{sp.style.display='none';if(out)out.style.display='';}
  }
}

function _helpHtml(h){
  if(!h)return'';
  let s=`<button onclick="this.closest('.hl').classList.remove('on')" style="float:right;font-size:1.1em;border:none;background:none;cursor:pointer">✕</button><h2>${h.title}</h2>`;
  for(const sec of h.sections){
    s+=`<h3>${sec.heading}</h3>`;
    for(const item of sec.items)s+=`<h4>${item.title}</h4><p>${item.description}</p><code>${_esc(item.code)}</code>`;
  }
  return s;
}
function _esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

customElements.define('sol-live-edit',SolLiveEdit);
