// Shared styles for the menu/bar managers and the plugin manager boxes.
// Type rule (Jeff): EVERY font is the user-set size — :host font-size is
// var(--font-size) (the font-size button's value) and every rule below is
// max(16px, 1em) of it. Hierarchy comes from weight/color/mono, never from
// shrinking text; NOTHING may ever render under 16px.
export const CSS = `
:host { display: block; font-family: var(--font-ui, system-ui, sans-serif);
        font-size: var(--font-size, 1rem); color: var(--text, #212121);
        max-height: 100%; min-height: 0; }
:host([hidden]) { display: none; }
* { box-sizing: border-box; }

/* THE SCROLL GOES ON THE ITEM THAT NEEDS IT: when the page constrains the
   box's height, the cards / rows area scrolls inside it — the head, topic
   tabs and URL row stay put, and the page/pane never grows a scrollbar.
   Unconstrained, these are no-ops. */
.builder { border: 1px solid var(--border, #d0d0d0); border-radius: 10px;
           background: var(--surface, #fff); padding: .6rem .7rem;
           display: flex; flex-direction: column; max-height: 100%; min-height: 0; }
.builder > .cards { overflow: hidden auto; flex: 1 1 auto; min-height: 0; }
.builder > ul.tree { overflow: hidden auto; min-height: 0; }
.builder-head { display: flex; align-items: center; gap: .6rem; margin-bottom: .5rem; }
.builder-title { font-weight: 700; font-size: max(16px, 1em); flex: 1 1 auto; }
.builder-status { font-size: max(16px, 1em); color: var(--text-muted, #7f8c8d); }
.builder-status.error { color: var(--error, #c0392b); }
.builder-status.saved { color: var(--success, #27ae60); }

/* accordion mode (accordion= group attribute): the header stays visible and
   toggles the body; a closed member is just its header row */
:host([accordion]) .builder-head { cursor: pointer; user-select: none; }
:host([accordion]) .builder-head:focus-visible { outline: 2px solid var(--accent, #3498db); outline-offset: 2px; border-radius: 5px; }
.builder-disclosure { flex: 0 0 auto; font-size: max(16px, 1em); color: var(--text-muted, #7f8c8d); }
.builder-disclosure::before { content: '▶'; }
:host([open]) .builder-disclosure::before { content: '▼'; }
:host([accordion]:not([open])) .builder > ul.tree,
:host([accordion]:not([open])) .builder > .adders { display: none; }
:host([accordion]:not([open])) .builder-head { margin-bottom: 0; }

ul.tree, ul.tree ul { list-style: none; margin: 0; padding: 0; }
ul.tree ul { padding-left: 1.4rem; border-left: 1px dashed var(--border, #d0d0d0); margin-left: .55rem; }

li.item { margin: .15rem 0; }
/* row = three columns: [grip + name] [plugins column] [✕ at the right];
   chips WRAP within their own column (a second row of plugins starts under
   the first) — never horizontal scrolling */
.row { display: flex; align-items: flex-start; gap: .4rem; padding: .2rem .35rem;
       border: 1px solid transparent; border-radius: 7px; background: var(--bg, #fafafa); }
.row > .chips { display: flex; flex-wrap: wrap; align-items: center; gap: .4rem;
                flex: 1 1 auto; min-width: 0; }
.row:hover { border-color: var(--border, #d0d0d0); }
.row.drop-target { outline: 2px solid var(--accent, #3498db); outline-offset: -2px; }
.row.drop-before { box-shadow: 0 -2px 0 0 var(--accent, #3498db); }
.row.drop-after  { box-shadow: 0  2px 0 0 var(--accent, #3498db); }

.grip { cursor: grab; color: var(--text-muted, #9aa0a6); user-select: none; padding: 0 .15rem; }
/* Editable names LOOK like input fields: always boxed, light background,
   dark text (whatever the app theme). */
.label { flex: 0 1 20ch; width: 20ch; font: inherit; font-size: max(16px, 1em); padding: .15rem .4rem;
         border: 1px solid var(--border, #c0c0c0); border-radius: 5px;
         background: #d9d9d9; color: #1a1a1a; }
.label:hover, .label:focus { border-color: var(--accent, #3498db); outline: none; }
.chip { flex: 0 0 auto; font-size: max(16px, 1em); padding: .1rem .45rem; border-radius: 99px;
        background: var(--hover, #eaf2fb); color: var(--text-muted, #5d6d7e); white-space: nowrap; }
.chip.empty { background: transparent; border: 1px dashed var(--border, #c0c0c0); }
/* a dragged chip held over another chip's left/right half — the reorder
   insertion point within the item */
.chip.drop-before { box-shadow: -3px 0 0 0 var(--accent, #3498db); }
.chip.drop-after  { box-shadow:  3px 0 0 0 var(--accent, #3498db); }

.row-btn { flex: 0 0 auto; font: inherit; font-size: max(16px, 1em); line-height: 1; padding: .2rem .35rem;
           border: none; border-radius: 5px; background: transparent; cursor: pointer;
           color: var(--text-muted, #9aa0a6); }
.row-btn:hover { background: var(--hover, #eaf2fb); color: var(--text, #212121); }
.row-btn.danger:hover { color: var(--error, #c0392b); }

.adders { display: flex; gap: .4rem; margin-top: .45rem; }
.add-btn { font: inherit; font-size: max(16px, 1em); padding: .25rem .6rem; cursor: pointer;
           border: 1px dashed var(--border, #c0c0c0); border-radius: 6px;
           background: transparent; color: var(--text-muted, #555); }
.add-btn:hover { background: var(--hover, #eaf2fb); color: var(--text, #111); }
.add-input { flex: 1 1 auto; min-width: 12rem; font: inherit; font-size: max(16px, 1em);
             padding: .25rem .5rem; border: 1px dashed var(--border, #c0c0c0); border-radius: 6px;
             background: #d9d9d9; color: #1a1a1a; }
.add-input::placeholder { color: #555; }
.add-input:focus { border-color: var(--accent, #3498db); outline: none; }
.add-input.drop-over { border-style: solid; border-color: var(--accent, #3498db);
                       background: var(--hover, #eaf2fb); }
.hint { font-size: max(16px, 1em); font-style: italic; color: var(--text-muted, #7f8c8d); padding: .3rem .2rem; }

/* palette — cards are all the SAME width (em: tracks the font-size setting)
   and vary in height with their content */
.cards { display: flex; flex-wrap: wrap; gap: .45rem; align-items: flex-start; }
.card { display: flex; flex-direction: column; gap: .1rem; padding: .4rem .6rem; cursor: grab;
        border: 1px solid var(--border, #d0d0d0); border-radius: 8px; background: var(--bg, #fafafa);
        user-select: none; width: 18em; }
.card:hover { border-color: var(--accent, #3498db); background: var(--surface, #fff); }
.card.dragging { opacity: .5; }
.card-top { display: flex; align-items: center; gap: .3rem; }
.card-icon { font-size: max(16px, 1em); }
.card-icon img { width: 1.2em; height: 1.2em; object-fit: contain; vertical-align: middle; }
.card-label { font-size: max(16px, 1em); font-weight: 600; }
.card-desc { font-size: max(16px, 1em); color: var(--text-muted, #7f8c8d); }

/* plugin manager: drop target, topic tabs, ghost cards, manifest-URL row */
.cards.drop-over { outline: 2px dashed var(--accent, #3498db); outline-offset: 3px; border-radius: 8px; }
.topic-tabs { display: flex; flex-wrap: wrap; gap: .35rem; margin-bottom: .55rem;
              border-bottom: 1px solid var(--border, #e0e0e0); padding-bottom: .35rem; }
.topic-tab { font: inherit; font-size: max(16px, 1em); padding: .2rem .75rem; cursor: pointer;
             border: 1px solid var(--border, #c0c0c0); border-radius: 99px;
             background: transparent; color: var(--text-muted, #5d6d7e); }
.topic-tab:hover { background: var(--hover, #eaf2fb); color: var(--text, #212121); }
.topic-tab.active { background: var(--accent, #3498db); border-color: var(--accent, #3498db); color: #fff; }
/* a sub-topic's headed group inside its parent's tab */
.cards-subhead { flex: 1 1 100%; font-size: max(16px, 1em); font-weight: 600;
                 color: var(--text-muted, #5d6d7e); margin-top: .35rem;
                 padding-bottom: .15rem; border-bottom: 1px solid var(--border, #e0e0e0); }
.card.ghost { border-style: dashed; background: transparent; opacity: .85; }
/* margin-top:auto pins the byline to the card's bottom edge, so authors
   line up across a row no matter how long each description is (cards in a
   row stretch to equal height). */
.card-byline { align-self: flex-end; margin-top: auto; padding-top: .15rem; font-style: italic;
               font-size: max(16px, 1em); color: var(--text-muted, #7f8c8d); }
.card-ghost-note { font-size: max(16px, 1em); font-style: italic; color: var(--text-muted, #7f8c8d); }
.url-row { display: flex; gap: .4rem; margin-top: .55rem; }
.url-input { flex: 1 1 auto; min-width: 10rem; font: inherit; font-size: max(16px, 1em);
             padding: .25rem .5rem; border: 1px solid var(--border, #c0c0c0); border-radius: 6px;
             background: #d9d9d9; color: #1a1a1a; }
.url-input::placeholder { color: #555; }
.url-input:focus { border-color: var(--accent, #3498db); outline: none; }
`;
export default CSS;
