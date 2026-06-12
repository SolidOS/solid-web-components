// Shared styles for the menu/bar managers and the plugin manager boxes.
// Type scale: the :host font-size is var(--font-size) (the app's setting),
// primary text (titles, labels, inputs) is 1em of it, secondary text
// (chips, tags, statuses, blurbs) is .8em — everything floored at 16px.
export const CSS = `
:host { display: block; font-family: var(--font-ui, system-ui, sans-serif);
        font-size: var(--font-size, 1rem); color: var(--text, #212121); }
:host([hidden]) { display: none; }
* { box-sizing: border-box; }

.builder { border: 1px solid var(--border, #d0d0d0); border-radius: 10px;
           background: var(--surface, #fff); padding: .6rem .7rem; }
.builder-head { display: flex; align-items: center; gap: .6rem; margin-bottom: .5rem; }
.builder-title { font-weight: 700; font-size: max(16px, 1em); flex: 1 1 auto; }
.builder-status { font-size: max(16px, .8em); color: var(--text-muted, #7f8c8d); }
.builder-status.error { color: var(--error, #c0392b); }
.builder-status.saved { color: var(--success, #27ae60); }

ul.tree, ul.tree ul { list-style: none; margin: 0; padding: 0; }
ul.tree ul { padding-left: 1.4rem; border-left: 1px dashed var(--border, #d0d0d0); margin-left: .55rem; }

li.item { margin: .15rem 0; }
.row { display: flex; align-items: center; gap: .4rem; padding: .2rem .35rem;
       border: 1px solid transparent; border-radius: 7px; background: var(--bg, #fafafa); }
.row:hover { border-color: var(--border, #d0d0d0); }
.row.drop-target { outline: 2px solid var(--accent, #3498db); outline-offset: -2px; }
.row.drop-before { box-shadow: 0 -2px 0 0 var(--accent, #3498db); }
.row.drop-after  { box-shadow: 0  2px 0 0 var(--accent, #3498db); }

.grip { cursor: grab; color: var(--text-muted, #9aa0a6); user-select: none; padding: 0 .15rem; }
.label { flex: 1 1 auto; min-width: 6rem; font: inherit; font-size: max(16px, 1em); padding: .15rem .4rem;
         border: 1px solid transparent; border-radius: 5px; background: transparent; color: inherit; }
.label:hover, .label:focus { border-color: var(--border, #c0c0c0); background: var(--surface, #fff); outline: none; }
.chip { flex: 0 0 auto; font-size: max(16px, .8em); padding: .1rem .45rem; border-radius: 99px;
        background: var(--hover, #eaf2fb); color: var(--text-muted, #5d6d7e); white-space: nowrap; }
.chip.empty { background: transparent; border: 1px dashed var(--border, #c0c0c0); }

.row-btn { flex: 0 0 auto; font: inherit; font-size: max(16px, .8em); line-height: 1; padding: .2rem .35rem;
           border: none; border-radius: 5px; background: transparent; cursor: pointer;
           color: var(--text-muted, #9aa0a6); }
.row-btn:hover { background: var(--hover, #eaf2fb); color: var(--text, #212121); }
.row-btn.danger:hover { color: var(--error, #c0392b); }

.adders { display: flex; gap: .4rem; margin-top: .45rem; }
.add-btn { font: inherit; font-size: max(16px, .8em); padding: .25rem .6rem; cursor: pointer;
           border: 1px dashed var(--border, #c0c0c0); border-radius: 6px;
           background: transparent; color: var(--text-muted, #555); }
.add-btn:hover { background: var(--hover, #eaf2fb); color: var(--text, #111); }
.save-btn { font: inherit; font-size: max(16px, .8em); font-weight: 600; padding: .3rem .9rem; cursor: pointer;
            border: none; border-radius: 7px; background: var(--accent, #3498db); color: #fff; }
.save-btn:disabled { opacity: .5; cursor: default; }
.hint { font-size: max(16px, .8em); font-style: italic; color: var(--text-muted, #7f8c8d); padding: .3rem .2rem; }

/* palette */
.cards { display: flex; flex-wrap: wrap; gap: .45rem; }
.card { display: flex; flex-direction: column; gap: .1rem; padding: .4rem .6rem; cursor: grab;
        border: 1px solid var(--border, #d0d0d0); border-radius: 8px; background: var(--bg, #fafafa);
        user-select: none; min-width: 7rem; }
.card:hover { border-color: var(--accent, #3498db); background: var(--surface, #fff); }
.card.dragging { opacity: .5; }
.card-top { display: flex; align-items: center; gap: .3rem; }
.card-icon { font-size: max(16px, 1em); }
.card-label { font-size: max(16px, 1em); font-weight: 600; }
.card-help { margin-left: auto; font-size: max(16px, .8em); color: var(--text-muted, #7f8c8d);
             text-decoration: none; border: 1px solid var(--border, #d0d0d0); border-radius: 50%;
             width: 1.2em; height: 1.2em; line-height: 1.2em; text-align: center; }
.card-help:hover { color: var(--accent, #3498db); border-color: var(--accent, #3498db); }
.card-tag { font-size: max(16px, .8em); color: var(--text-muted, #7f8c8d); font-family: var(--font-mono, monospace); }
.card-desc { font-size: max(16px, .8em); color: var(--text-muted, #7f8c8d); max-width: 16rem; }

/* plugin manager: drop target, ghost cards, manifest-URL row */
.cards.drop-over { outline: 2px dashed var(--accent, #3498db); outline-offset: 3px; border-radius: 8px; }
.card.ghost { border-style: dashed; background: transparent; opacity: .85; }
.card-ghost-note { font-size: max(16px, .8em); font-style: italic; color: var(--text-muted, #7f8c8d); }
.url-row { display: flex; gap: .4rem; margin-top: .55rem; }
.url-input { flex: 1 1 auto; min-width: 10rem; font: inherit; font-size: max(16px, 1em);
             padding: .25rem .5rem; border: 1px solid var(--border, #c0c0c0); border-radius: 6px;
             background: var(--surface, #fff); color: inherit; }
.url-input:focus { border-color: var(--accent, #3498db); outline: none; }
`;
export default CSS;
