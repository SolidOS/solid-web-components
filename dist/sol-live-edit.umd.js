(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.SolLiveEdit = {}));
})(this, (function (exports) { 'use strict';

  /**
   * Minimal CodeMirror 6 editor builder.
   * Used by sol-live-edit when running standalone (not inside the podz bundle).
   * podz itself uses podz-editor.js which has keybinding options and language support.
   */

  const ESM = 'https://esm.sh';

  const LANG_MAP = {
    ttl:    [`${ESM}/codemirror-lang-turtle`,        m => m.turtle],
    n3:     [`${ESM}/codemirror-lang-turtle`,        m => m.turtle],
    jsonld: [`${ESM}/@codemirror/lang-json@6`,       m => m.json],
    json:   [`${ESM}/@codemirror/lang-json@6`,       m => m.json],
    md:     [`${ESM}/@codemirror/lang-markdown@6`,   m => m.markdown],
    html:   [`${ESM}/@codemirror/lang-html@6`,       m => m.html],
    htm:    [`${ESM}/@codemirror/lang-html@6`,       m => m.html],
    js:     [`${ESM}/@codemirror/lang-javascript@6`, m => m.javascript],
    mjs:    [`${ESM}/@codemirror/lang-javascript@6`, m => m.javascript],
    css:    [`${ESM}/@codemirror/lang-css@6`,        m => m.css],
    xml:    [`${ESM}/@codemirror/lang-xml@6`,        m => m.xml],
    svg:    [`${ESM}/@codemirror/lang-xml@6`,        m => m.xml],
  };

  /**
   * Create a minimal CodeMirror 6 EditorView in `parent`.
   * @param {Element} parent   — container DOM element
   * @param {string}  ext      — file extension key (e.g. 'ttl', 'md', 'html')
   * @param {ShadowRoot|null} root — shadow root for CSS injection (or null for light DOM)
   * @param {Function} onChange — called when content changes
   * @returns {Promise<EditorView>}
   */
  async function buildEditor(parent, ext, root, onChange) {
    const { EditorView, keymap, lineNumbers, highlightActiveLine, drawSelection }
      = await import(`${ESM}/@codemirror/view@6`);
    const { EditorState }
      = await import(`${ESM}/@codemirror/state@6`);
    const { defaultKeymap, history, historyKeymap, indentWithTab }
      = await import(`${ESM}/@codemirror/commands@6`);
    const { syntaxHighlighting, defaultHighlightStyle }
      = await import(`${ESM}/@codemirror/language@6`);

    let langExt = [];
    const langEntry = ext && LANG_MAP[ext];
    if (langEntry) {
      try {
        const [url, pick] = langEntry;
        const m = await import(url);
        const fn = pick(m);
        if (fn) langExt = [fn()];
      } catch (_) { /* CDN miss — degrade silently */ }
    }

    const updateListener = EditorView.updateListener.of(u => {
      if (u.docChanged && onChange) onChange();
    });

    const view = new EditorView({
      state: EditorState.create({
        doc: '',
        extensions: [
          history(),
          lineNumbers(),
          highlightActiveLine(),
          drawSelection(),
          syntaxHighlighting(defaultHighlightStyle),
          keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
          ...langExt,
          updateListener,
          EditorView.theme({
            '&': { height: '100%' },
            '.cm-editor': { height: '100%' },
            '.cm-scroller': { overflow: 'auto', fontFamily: 'inherit' },
          }),
        ],
      }),
      parent,
      root: root || undefined,
    });

    return view;
  }

  /**
   * Style helpers for Constructable Stylesheets + adoptedStyleSheets.
   *
   * `sheetFrom(css)` returns a `CSSStyleSheet` on evergreen browsers, or
   * `null` when the constructor is unavailable (e.g. Jest/node env). Callers
   * should keep the raw `CSS` string export alongside the sheet so they can
   * fall back to a `<style>` tag when `sheet` is null.
   *
   * `adopt(root, { sheet, css, extra })` wires a shadow root (or document)
   * with the baseline module sheet (+ any extras). If no sheet is available
   * it appends `<style>${css}</style>` into the root instead.
   */

  let _supports = null;
  function supports() {
    if (_supports !== null) return _supports;
    try {
      const s = new CSSStyleSheet();
      _supports = typeof s.replaceSync === 'function';
    } catch {
      _supports = false;
    }
    return _supports;
  }

  function sheetFrom(css) {
    if (!supports()) return null;
    const s = new CSSStyleSheet();
    s.replaceSync(css);
    return s;
  }

  // Adopt a CSSStyleSheet into `root` (ShadowRoot or Document). When sheets
  // aren't supported, falls back to inserting a <style> with the given css.
  function adopt(root, { sheet, css, extra = [] } = {}) {
    const host = root.adoptedStyleSheets !== undefined ? root : null;
    if (host && sheet) {
      const sheets = [sheet];
      const strings = [];
      for (const e of extra) {
        if (e instanceof CSSStyleSheet) sheets.push(e);
        else if (typeof e === 'string') strings.push(e);
      }
      host.adoptedStyleSheets = [...host.adoptedStyleSheets, ...sheets];
      for (const s of strings) appendStyle(root, s);
      return;
    }
    // Fallback path: inline <style> for baseline + extras.
    if (css) appendStyle(root, css);
    for (const e of extra) {
      if (typeof e === 'string') appendStyle(root, e);
    }
  }

  function appendStyle(root, css) {
    const el = document.createElement('style');
    el.textContent = css;
    root.appendChild(el);
  }

  // Styles for <sol-live-edit> shadow DOM.
  // Uses CSS custom properties so the host page's theme (podz or standalone)
  // flows through.

  const CSS = `
:host{display:flex;flex-direction:column;overflow:hidden;font-family:inherit;position:relative}
.er{padding:.5em 1em;background:#fff0f0;border-bottom:1px solid #f5c6cb;color:#c0392b;font-size:.82em;display:none;flex-shrink:0}
.er.on{display:block}

.cf{display:none;position:absolute;top:0;right:0;z-index:20;
    min-width:180px;padding:10px 14px;
    background:var(--surface,#fff);border:1px solid var(--border,#ccc);
    border-radius:0 0 0 8px;box-shadow:0 4px 16px rgba(0,0,0,.15);
    flex-direction:column;gap:10px;font-size:.82em}
.cf.on{display:flex}
.cg{display:flex;flex-direction:column;gap:4px}
.cg b{font-weight:700;color:var(--text,#333);margin-bottom:2px;font-size:.9em}
.cg label{display:flex;align-items:center;gap:6px;cursor:pointer;color:var(--text,#222);padding:1px 0}
.cg input[type=radio]{margin:0;cursor:pointer;accent-color:var(--accent,#4a9eff)}

.modal-backdrop{display:none;position:absolute;inset:0;z-index:30;
    background:rgba(0,0,0,.35);align-items:center;justify-content:center}
.modal-backdrop.on{display:flex}
.modal-box{background:var(--surface,#fff);border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,.25);
    max-width:90%;max-height:85%;width:600px;overflow-y:auto;position:relative;padding:1.2rem 1.5rem 1.5rem}
.modal-box.wide{width:800px}
.modal-close{position:absolute;top:8px;right:12px;border:none;background:none;
    font-size:1.3em;cursor:pointer;color:var(--text-muted,#888);line-height:1;padding:4px}
.modal-close:hover{color:var(--text,#333)}

.modal-box h2{margin:.2em 0 .7em;font-size:1.05em}
.modal-box h3{margin:.9em 0 .25em;font-size:.92em;color:var(--accent,#4a9eff)}
.modal-box h4{margin:.5em 0 .12em;font-size:.86em}
.modal-box p{margin:.15em 0 .4em;font-size:.84em;color:var(--text-muted,#555)}
.modal-box code{display:block;white-space:pre;overflow-x:auto;font-size:.8em;
    background:var(--code-bg,#f4f4f4);padding:.4em .7em;border-radius:4px;
    border:1px solid var(--border,#ddd);margin:.15em 0 .5em}

.modal-box .sc{display:inline-block;vertical-align:top;margin:.4rem;padding:.4rem .7rem;
    border:1px solid var(--border,#ddd);border-radius:6px}
.modal-box .sc h3{margin:0 0 .25em;font-size:.86em}
.modal-box .stat-table td{padding:2px 8px;font-size:.8em}

.body{display:flex;flex:1;overflow:hidden}
.ep{flex:1;display:flex;flex-direction:column;overflow:hidden;border-right:1px solid var(--border,#ccc)}
.pp{flex:1;overflow:auto;position:relative;display:flex;justify-content:safe center;align-items:safe center}
.pp>#po{flex-shrink:0}
.pp>.mdp{padding:1rem 1.4rem}

.csv-tbl{width:100%;border-collapse:collapse;font-size:.88em}
.csv-tbl th{padding:7px 10px;text-align:left;background:var(--text,#222);color:var(--surface,#fff);font-weight:600;position:sticky;top:0;z-index:1}
.csv-tbl td{padding:5px 10px;border-bottom:1px solid var(--border,#eee)}
.csv-tbl tr:nth-child(even) td{background:var(--hover,#f4f4f4)}
`;

  const sheet = sheetFrom(CSS);

  // Idempotent wrapper around customElements.define. Prevents a throw when the
  // same tag is registered twice — e.g. when a page loads both the all-in-one
  // bundle and a per-component UMD build, or when a module is re-evaluated by
  // a hot-reloader.
  function define(name, klass) {
    if (typeof customElements === 'undefined') return;
    const existing = customElements.get(name);
    if (existing) {
      if (existing !== klass && !window.__SolSuppressDefineWarn) {
        console.warn(`[solid-web-components] <${name}> already registered; keeping the existing definition.`);
      }
      return;
    }
    customElements.define(name, klass);
  }

  /**
   * <sol-live-edit> — live split-pane editor web component.
   * Attributes: source="URL"  format="turtle|csv|markdown|html|mermaid|jsonld|graphviz"
   *             readonly  (boolean — disables save button)
   * Properties: fetchFn (Function) — authenticated fetch; content (string get/set)
   * Events: sol-change({content}), sol-save({content,url}), sol-load({content,url})
   */


  const R = './utils/renderers/';
  const H = './utils/live-edit-help/';
  const D = './data/live-edit/';

  // Pre-loaded module registry — populated by SolLiveEdit.registerModules()
  // for bundled consumers where dynamic import() can't resolve relative paths.
  const _preloaded = { renderers: {}, help: {}, examples: {} };

  // Lazy renderer lookup — falls back to dynamic import when not pre-loaded
  const RENDERERS = {
    turtle:   () => _preloaded.renderers.turtle   || import(`${R}turtle.js`).then(m => m.renderTurtle),
    jsonld:   () => _preloaded.renderers.jsonld   || import(`${R}jsonld.js`).then(m => m.renderJsonLd),
    csv:      () => _preloaded.renderers.csv      || import(`${R}csv.js`).then(m => m.renderCSV),
    markdown: () => _preloaded.renderers.markdown || import(`${R}markdown.js`).then(m => m.renderMarkdown),
    mermaid:  () => _preloaded.renderers.mermaid  || import(`${R}mermaid.js`).then(m => m.renderMermaid),
    html:     () => _preloaded.renderers.html     || import(`${R}html.js`).then(m => m.renderHtml),
    graphviz: () => _preloaded.renderers.graphviz || import(`${R}graphviz.js`).then(m => m.renderGraphviz),
  };
  const _rendererCache = {};

  const HELP = {
    turtle:   () => _preloaded.help.turtle   || import(`${H}turtle.js`).then(m => m.turtleHelp),
    jsonld:   () => _preloaded.help.jsonld   || import(`${H}jsonld.js`).then(m => m.jsonldHelp),
    csv:      () => _preloaded.help.csv      || import(`${H}csv.js`).then(m => m.csvHelp),
    markdown: () => _preloaded.help.markdown || import(`${H}markdown.js`).then(m => m.markdownHelp),
    mermaid:  () => _preloaded.help.mermaid  || import(`${H}mermaid.js`).then(m => m.mermaidHelp),
    graphviz: () => _preloaded.help.graphviz || import(`${H}graphviz.js`).then(m => m.graphvizHelp),
  };

  const EXAMPLES = {
    turtle:   () => _preloaded.examples.turtle   || import(`${D}turtle.js`).then(m => m.example),
    jsonld:   () => _preloaded.examples.jsonld   || import(`${D}jsonld.js`).then(m => m.example),
    csv:      () => _preloaded.examples.csv      || import(`${D}csv.js`).then(m => m.example),
    markdown: () => _preloaded.examples.markdown || import(`${D}markdown.js`).then(m => m.example),
    mermaid:  () => _preloaded.examples.mermaid  || import(`${D}mermaid.js`).then(m => m.example),
    html:     () => _preloaded.examples.html     || import(`${D}html.js`).then(m => m.example),
    graphviz: () => _preloaded.examples.graphviz || import(`${D}graphviz.js`).then(m => m.example),
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

  /**
   * Live split-pane editor web component.
   *
   * CodeMirror syntax highlighting, preview rendering, and format-specific help.
   *
   * @class SolLiveEdit
   * @extends HTMLElement
   * @attr {string} source - URL to load
   * @attr {string} format - turtle|csv|markdown|html|mermaid|jsonld|graphviz
   * @attr {boolean} readonly - disables save button
   * @property {Function} fetchFn - authenticated fetch function
   * @property {string} content - editor content (get/set)
   * @fires sol-change - detail: { content }
   * @fires sol-save - detail: { content, url }
   * @fires sol-load - detail: { content, url }
   * @fires sol-zoom - detail: { zoom, pct }
   * @fires sol-format - detail: { format, canZoom, canStats }
   */
  class SolLiveEdit extends HTMLElement {
    static get observedAttributes() { return ['source','format','readonly']; }
    static registerModules({ renderers, help, examples } = {}) {
      if (renderers) Object.assign(_preloaded.renderers, renderers);
      if (help) Object.assign(_preloaded.help, help);
      if (examples) Object.assign(_preloaded.examples, examples);
    }
    constructor() {
      super();
      this._fn=null;this._cm=null;this._db=null;this._sim=null;this._fmt=null;this._statsOn=false;
      this._cfg={view:'both',keys:'default'};this._zoom=1.0;
      this.attachShadow({mode:'open'});
    }
    get fetchFn(){return this._fn;} set fetchFn(f){this._fn=f;}
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
      s.innerHTML=`
<div class="er" id="er"></div>
<div class="cf" id="cf">
  <div class="cg">
    <b>View</b>
    <label><input type="radio" name="sle-view" value="both"> Both</label>
    <label><input type="radio" name="sle-view" value="editor"> Editor only</label>
    <label><input type="radio" name="sle-view" value="preview"> Preview only</label>
  </div>
  <div class="cg">
    <b>Key bindings</b>
    <label><input type="radio" name="sle-keys" value="default"> Default</label>
    <label><input type="radio" name="sle-keys" value="emacs"> Emacs</label>
    <label><input type="radio" name="sle-keys" value="vim"> Vim</label>
  </div>
</div>
<div class="modal-backdrop" id="modal">
  <div class="modal-box" id="modalBox">
    <button class="modal-close" id="modalClose">\u00d7</button>
    <div id="modalBody"></div>
  </div>
</div>
<div class="body">
  <div class="ep" id="ep"></div>
  <div class="pp" id="pp">
    <div id="po" style="width:100%;height:100%;position:relative"></div>
  </div>
</div>`;
      s.adoptedStyleSheets = [];
      adopt(s, { sheet: sheet, css: CSS });

      // Settings dropdown change handler
      s.getElementById('cf').addEventListener('change',e=>{
        const nm=e.target.name;if(!nm?.startsWith('sle-'))return;
        const k=nm.slice(4);this._cfg[k]=e.target.value;this._saveCfg();
        if(k==='view')this._applyView();
        else {const p=this.content;this._buildEditor().then(()=>this._setContent(p));}
      });

      // Close modal on backdrop click or close button
      s.getElementById('modal').addEventListener('click',e=>{
        if(e.target===s.getElementById('modal'))this._closeModal();
      });
      s.getElementById('modalClose').addEventListener('click',()=>this._closeModal());

      // Close settings dropdown when clicking outside
      s.addEventListener('click',e=>{
        const cf=s.getElementById('cf');
        if(cf.classList.contains('on')&&!cf.contains(e.target))cf.classList.remove('on');
      });

      this._loadCfg();
      const src=this.getAttribute('source');
      const fmt=this.getAttribute('format')||EXT[src?.split('.').pop()?.toLowerCase()]||'markdown';
      await this._setFmt(fmt);
      this._applyView();
      if(src){await this._loadSrc(src);}
      else {const ex=await(EXAMPLES[fmt]||EXAMPLES.markdown)().catch(()=>'');await this._setContent(ex);}
    }

    async _setFmt(fmt){
      this._fmt=fmt||'markdown';
      this._zoom=1.0;
      const po=this.shadowRoot.getElementById('po');
      if(po){po.style.transform='';po.style.transformOrigin='';po.style.width='';}
      this.dispatchEvent(new CustomEvent('sol-format',{detail:{format:this._fmt,canZoom:this.canZoom,canStats:this.canStats},bubbles:true,composed:true}));
      await this._buildEditor();
    }

    async _buildEditor(){
      const pane=this.shadowRoot.getElementById('ep');
      if(!pane)return;
      if(this._cm){this._cm.destroy();this._cm=null;}
      const extKey=CM_EXT[this._fmt]||null;
      const editorMod=this.constructor.editorModule;
      if(editorMod){
        try{
          const {createEditor}=await import(editorMod);
          this._cm=await createEditor(pane,'',extKey?`f.${extKey}`:'f.txt',
            {dark:false,keyBindings:this._cfg.keys,onChange:()=>this._change()});
          return;
        }catch(_){/* fall through to built-in editor */}
      }
      const view=await buildEditor(pane,extKey,this.shadowRoot,()=>this._change());
      this._cm={
        getValue:()=>view.state.doc.toString(),
        setValue:(v)=>view.dispatch({changes:{from:0,to:view.state.doc.length,insert:v}}),
        destroy:()=>view.destroy(),
      };
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

    // ── Modal helpers ───────────────────────────────────────────────────────────
    _openModal(html,wide){
      const s=this.shadowRoot;
      const box=s.getElementById('modalBox');
      s.getElementById('modalBody').innerHTML=html;
      box.classList.toggle('wide',!!wide);
      s.getElementById('modal').classList.add('on');
    }
    _closeModal(){
      this.shadowRoot.getElementById('modal').classList.remove('on');
    }

    // ── Help → modal ───────────────────────────────────────────────────────────
    async _toggleHelp(){
      const modal=this.shadowRoot.getElementById('modal');
      if(modal.classList.contains('on')){this._closeModal();return;}
      const ldr=HELP[this._fmt];
      const html=ldr?_helpHtml(await ldr()):'<p>No help available for this format.</p>';
      this._openModal(html);
    }

    // ── Settings → dropdown ────────────────────────────────────────────────────
    _toggleCfg(){
      const cf=this.shadowRoot.getElementById('cf');
      if(!cf)return;
      const opening=!cf.classList.contains('on');
      cf.classList.toggle('on');
      if(opening){
        this.shadowRoot.querySelectorAll('[name^="sle-"]').forEach(r=>{
          r.checked=r.value===this._cfg[r.name.slice(4)];
        });
      }
    }

    // ── Statistics → modal ─────────────────────────────────────────────────────
    async _toggleStats(){
      const modal=this.shadowRoot.getElementById('modal');
      if(modal.classList.contains('on')){this._closeModal();return;}
      try{
        const csvMod = _preloaded.renderers._csvModule || await import(`${R}csv.js`);
        const {parseCSV,calcStats,renderStats}=csvMod;
        const container=document.createElement('div');
        renderStats(calcStats(parseCSV(this.content)),container);
        this._openModal(container.innerHTML,true);
      }catch(e){
        this._openModal(`<p style="color:#c0392b">${_esc(e.message)}</p>`);
      }
    }

    _loadCfg(){try{Object.assign(this._cfg,JSON.parse(localStorage.getItem('sle-cfg')||'{}'));}catch(_){}}
    _saveCfg(){try{localStorage.setItem('sle-cfg',JSON.stringify(this._cfg));}catch(_){}}
    _setZoom(z){
      this._zoom=Math.max(0.2,Math.min(5.0,Math.round(z*5)/5));
      const pct=Math.round(this._zoom*100);
      const po=this.shadowRoot.getElementById('po');
      const pp=this.shadowRoot.getElementById('pp');
      if(po){
        po.style.width=`${100*this._zoom}%`;
        po.style.height=`${100*this._zoom}%`;
      }
      if(pp&&this._zoom>1){
        requestAnimationFrame(()=>{
          pp.scrollLeft=(pp.scrollWidth-pp.clientWidth)/2;
          pp.scrollTop=(pp.scrollHeight-pp.clientHeight)/2;
        });
      }
      this.dispatchEvent(new CustomEvent('sol-zoom',{detail:{zoom:this._zoom,pct},bubbles:true,composed:true}));
    }
    _applyView(){const v=this._cfg.view,sr=this.shadowRoot,ep=sr.getElementById('ep'),pp=sr.getElementById('pp');if(ep)ep.style.display=v==='preview'?'none':'';if(pp)pp.style.display=v==='editor'?'none':'';}
  }

  function _helpHtml(h){
    if(!h)return '';
    let s=`<h2>${h.title}</h2>`;
    for(const sec of h.sections){
      s+=`<h3>${sec.heading}</h3>`;
      for(const item of sec.items)s+=`<h4>${item.title}</h4><p>${item.description}</p><code>${_esc(item.code)}</code>`;
    }
    return s;
  }
  function _esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  define('sol-live-edit',SolLiveEdit);

  exports.SolLiveEdit = SolLiveEdit;
  exports.default = SolLiveEdit;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
