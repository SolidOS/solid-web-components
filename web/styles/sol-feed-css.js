// Styles for <sol-feed>'s shadow root. Exports the raw `CSS` string plus a
// constructable `sheet` (null in non-DOM envs) — the same shape as the
// other web/styles/*-css.js modules. All colours and metrics reference the
// shared design tokens so the component themes with the rest of the suite.
import { sheetFrom } from '../../core/adopt.js';

export const CSS = `
  :host {
    display: flex;
    flex-direction: column;
    /* Respect whatever height the container gives us; with no container
       height, fall back to this viewport cap. Either way the article list
       scrolls inside the component and never overflows its container. */
    height: 100%;
    max-height: 100vh;
    font-family: var(--font-ui, system-ui, -apple-system, sans-serif);
    font-size: var(--font-size, 20px);
    color: var(--text, #212121);
  }
  * { box-sizing: border-box; }

  /* The component owns its own scrolling: each view puts the scrollbar on
     its own list/grid, so the status line and news picker stay pinned. */
  .sol-feed { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; }

  /* ── status / loading / empty ───────────────────────────────────────── */
  .sol-feed-status {
    flex: 0 0 auto;
    padding: .5rem .75rem;
    color: var(--text-muted, #7f8c8d);
    font-size: .85em;
  }
  .sol-feed-status[data-error] { color: var(--error, #e74c3c); }
  .sol-feed-empty {
    padding: 1rem .75rem;
    color: var(--text-muted, #7f8c8d);
    font-style: italic;
  }

  /* ── feed + topic link lists ─────────────────────────────────────────── */
  /* Both feed and topic stack vertically and fill the host. Topic puts a
     fixed-height source pane on top (~5 entries, scrolling for more) and
     the article list below. */
  .sol-feed-list {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
  }
  .sol-feed-list.feed  { gap: 0; }
  .sol-feed-list.topic { gap: .9rem; }

  .feed-sources,
  .feed-items {
    margin: 0;
    border: 1px solid var(--border, #d0d0d0);
    border-radius: 6px;
    background: var(--surface, #fff);
  }
  /* Topic view: a touch darker border so the two floating panels stand
     apart from the page; the slightly taller .9rem gap above gives them
     breathing room. */
  .sol-feed-list.topic .feed-sources,
  .sol-feed-list.topic .feed-items { border-color: #6e6e6e; }
  /* topic: the sources pane shows ~5 entries; the rest scroll inside it */
  .feed-sources { flex: 0 0 11rem; overflow: auto; }
  /* the articles list fills whatever height is left in the column */
  .feed-items {
    list-style: none;
    padding: 0;
    flex: 1 1 auto;
    min-height: 0;
    overflow: auto;
  }

  .feed-source-list { list-style: none; margin: 0; padding: 0; }
  .feed-source-list li + li,
  .feed-items li + li { border-top: 1px solid var(--border, #eee); }

  .feed-link {
    display: block;
    padding: .45rem .7rem;
    /* Article and source links use the theme's link colour (themed
       in root.css for light + dark), with --accent as the legacy
       fallback for pages that load sol-feed without root.css. */
    color: var(--link, var(--accent, #2980b9));
    text-decoration: none;
    line-height: 1.35;
  }
  .feed-link:hover { background: var(--hover, #eaf2fb); text-decoration: underline; }
  .feed-link.selected {
    background: var(--focus-bg, #ebf5fb);
    /* Text on the selection fill. Defaults to the normal link colour so
       existing consumers are unchanged; hosts that tint --focus-bg with
       a strong colour can set --selected-fg for a readable contrast. */
    color: var(--selected-fg, var(--link, var(--accent, #2980b9)));
    font-weight: 600;
  }
  .feed-link .feed-link-meta {
    display: block;
    font-size: .72em;
    color: var(--text-muted, #7f8c8d);
    font-weight: 400;
  }

  /* ── topics view ─────────────────────────────────────────────────────── */
  /* A "newsstand": one column per topic across the top (each listing its
     sources), with the shared .feed-articles card grid below. The columns
     band reuses the threePanel view's darker top-bar tint; together with the
     lighter articles strip they read as one two-tone panel. */
  .sol-feed-list.topics { gap: 0; }
  .feed-topic-columns {
    flex: 0 0 auto;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: .6rem;
    padding: .8rem .9rem;
    background: var(--feed-top-bar-bg,
                    color-mix(in srgb, var(--bg, #f5f5f5) 75%, #000));
    border-radius: var(--radius-md, 6px) var(--radius-md, 6px) 0 0;
  }
  .feed-topic-column {
    flex: 1 1 12rem;
    min-width: 0;
    border: 1px solid var(--border, #d0d0d0);
    border-radius: 6px;
    background: var(--surface, #fff);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .feed-topic-head {
    margin: 0;
    padding: .4rem .7rem;
    font-size: .74em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .04em;
    color: var(--text-muted, #7f8c8d);
    border-bottom: 1px solid var(--border, #d0d0d0);
  }
  /* Caps each column ~6 sources tall; the rest scroll within the column. */
  .feed-topic-col-list { max-height: 14rem; overflow: auto; }

  /* News cards: shorter boxes; the title tracks the host font size
     (1em = --font-size, set by the text-size setter) rather than the
     threePanel view's smaller .88em. Scoped to topics so other views are
     unchanged. */
  .sol-feed-list.topics .feed-card { aspect-ratio: 9 / 4; }
  .sol-feed-list.topics .feed-card-title {
    font-size: 1em;
    -webkit-line-clamp: 3;
  }

  /* ── threePanel view (legacy name: "all") ───────────────────────────── */
  /* Two-tone defaults: a darker strip behind the top-bar (controls)
     and a lighter strip behind the articles grid, both relative to
     the page --bg via color-mix. Override via
     --feed-top-bar-bg / --feed-articles-bg (or by re-styling the
     "top-bar" / "articles" shadow parts from outside) when the
     defaults don't suit. The two strips sit flush so they read as
     one continuous two-tone panel, rounded at the outer corners. */
  .feed-top-bar {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: .6rem;
    margin: 0;
    padding: .8rem .9rem;
    background: var(--feed-top-bar-bg,
                    color-mix(in srgb, var(--bg, #f5f5f5) 75%, #000));
    border-radius: var(--radius-md, 6px) var(--radius-md, 6px) 0 0;
  }
  .feed-source-buttons {
    flex: 1 1 auto;
    display: flex;
    flex-wrap: wrap;
    gap: .35rem;
    min-width: 0;
  }
  .feed-source-btn {
    font: inherit;
    font-size: .85em;
    padding: .3rem .9rem;
    border: 1px solid var(--border, #d0d0d0);
    border-radius: 999px;
    background: var(--surface, #fff);
    color: var(--text, #212121);
    cursor: pointer;
    white-space: nowrap;
  }
  .feed-source-btn:hover { background: var(--hover, #eaf2fb); }
  .feed-source-btn.selected {
    background: var(--accent, #3498db);
    color: #fff;
    border-color: var(--accent, #3498db);
  }
  .feed-source-btn:focus-visible {
    outline: 2px solid var(--accent, #3498db);
    outline-offset: 2px;
  }

  .feed-picker-toggle {
    font: inherit;
    font-size: 1.2em;
    line-height: 1;
    padding: .25rem .5rem;
    border: 1px solid var(--border, #d0d0d0);
    border-radius: 6px;
    background: var(--surface, #fff);
    color: var(--text, #212121);
    cursor: pointer;
  }
  .feed-picker-toggle:hover { background: var(--hover, #eaf2fb); }
  .feed-picker-toggle:focus-visible {
    outline: 2px solid var(--accent, #3498db);
    outline-offset: 2px;
  }

  /* The feed-management editor opens as a full panel (header + body) that
     takes over the article area; see the .editor-open rules below. The body
     is a two-zone grid: left = the drag palette (instruction + topic-group
     cards + trash); right = the add-source drop panel + add-topic form. */
  .feed-picker {
    flex: 0 0 auto;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
    margin: 0;
  }
  .feed-picker[hidden] { display: none; }

  /* Editor open: hide the articles / reader split and let the picker grow to
     fill the component, with its own scroll. */
  .sol-feed.editor-open .feed-articles,
  .sol-feed.editor-open .feed-reader-split { display: none; }
  .sol-feed.editor-open .feed-picker {
    flex: 1 1 auto;
    min-height: 0;
    overflow: auto;
    padding: 1.1rem 1.3rem 1.5rem;
    background: var(--feed-articles-bg,
                    color-mix(in srgb, var(--bg, #f5f5f5) 92%, #000));
    border-radius: 0 0 var(--radius-md, 6px) var(--radius-md, 6px);
  }

  .feed-editor-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
  }
  .feed-editor-title {
    margin: 0;
    font-size: 1.05em;
    font-weight: 700;
    letter-spacing: .01em;
    color: var(--text, #212121);
  }
  .feed-editor-close {
    flex: 0 0 auto;
    font: inherit;
    font-size: 1em;
    line-height: 1;
    padding: .3rem .6rem;
    border: 1px solid var(--border, #d0d0d0);
    border-radius: 6px;
    background: var(--surface, #fff);
    color: var(--text-muted, #7f8c8d);
    cursor: pointer;
  }
  .feed-editor-close:hover { background: var(--hover, #eaf2fb); color: var(--text, #212121); }
  .feed-editor-close:focus-visible { outline: 2px solid var(--accent, #3498db); outline-offset: 2px; }

  /* Subtitle, then one panel grid; the status note spans below it. */
  .feed-picker-left { display: flex; flex-direction: column; gap: 1rem; min-width: 0; }

  /* One responsive grid for every panel — topic-group cards plus the add-feed /
     add-topic panels and the trash — all the same width with a uniform 1rem
     gap so they sit flush with one another. */
  .feed-panel-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(12.5rem, 1fr));
    gap: 1rem;
    align-items: start;
  }
  /* Add-feed + add-topic stack in one cell (add-topic under add-feed). */
  .feed-add-stack { display: flex; flex-direction: column; gap: 1rem; min-width: 0; }
  /* Trash starts a fresh row under all the other panels, three columns wide. */
  .feed-panel-grid .feed-trash { grid-column: 1 / span 3; }
  .feed-picker-instruct {
    margin: 0;
    color: var(--text-muted, #7f8c8d);
    font-size: .9em;
  }
  .feed-picker-instruct strong { color: var(--text, #212121); }
  .feed-picker-note {
    margin: 0;
    font-size: .75em;
    color: var(--text-muted, #7f8c8d);
  }
  .feed-picker-note[data-error] { color: var(--error, #e74c3c); }

  /* Add-topic / add-feed forms are <form>s wrapping a <fieldset>; the
     fieldset carries the visible chrome so its legend sits on the top
     border, matching the .feed-topic source-picker boxes. */
  .feed-add-wrap { margin: 0; }
  .feed-add-form {
    border: 1px solid var(--border, #d0d0d0);
    border-radius: 6px;
    background: var(--surface, #fff);
    margin: 0;
    padding: .2rem .8rem .55rem;     /* match .feed-topic */
    display: flex;
    flex-direction: column;
    gap: .35rem;
  }
  .feed-add-form legend {
    font-size: .74em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .04em;
    color: var(--text-muted, #7f8c8d);
    padding: 0 .3rem;
  }
  .feed-add-form label {
    display: flex;
    flex-direction: column;
    gap: .15rem;
    font-size: .8em;
    color: var(--text, #212121);
  }
  .feed-add-form input,
  .feed-add-form select {
    font: inherit;
    font-size: .9em;
    padding: .2rem .35rem;
    border: 1px solid var(--border, #d0d0d0);
    border-radius: 4px;
    background: var(--surface, #fff);
    color: var(--text, #212121);
  }
  .feed-add-form button[type="submit"] {
    align-self: flex-end;
    font: inherit;
    font-size: .8em;
    padding: .25rem .8rem;
    border: 1px solid var(--accent, #3498db);
    border-radius: 6px;
    background: var(--accent, #3498db);
    color: #fff;
    cursor: pointer;
    margin-top: .15rem;
  }
  .feed-add-form button[type="submit"]:hover { filter: brightness(.94); }

  /* Add-a-source panel: a drop / paste / type zone, then an inline
     Name + Topic confirm revealed once a URL is captured. */
  .feed-drop-panel { gap: .6rem; }
  .feed-drop-zone {
    display: flex;
    flex-direction: column;
    gap: .5rem;
    padding: 1rem .8rem;
    border: 2px dashed var(--border, #c4c4c4);
    border-radius: 8px;
    background: color-mix(in srgb, var(--accent, #3498db) 4%, var(--surface, #fff));
    text-align: center;
    transition: border-color .12s, background .12s;
  }
  .feed-drop-zone.drop-target {
    border-color: var(--accent, #3498db);
    border-style: solid;
    background: color-mix(in srgb, var(--accent, #3498db) 12%, var(--surface, #fff));
  }
  .feed-drop-hint {
    font-size: .78em;
    line-height: 1.3;
    color: var(--text-muted, #7f8c8d);
  }
  .feed-drop-input {
    font: inherit;
    font-size: .9em;
    width: 100%;
    padding: .3rem .45rem;
    border: 1px solid var(--border, #d0d0d0);
    border-radius: 4px;
    background: var(--surface, #fff);
    color: var(--text, #212121);
  }
  .feed-drop-confirm { display: flex; flex-direction: column; gap: .4rem; }
  .feed-drop-confirm[hidden] { display: none; }
  .feed-drop-captured {
    margin: 0;
    font-size: .72em;
    color: var(--text-muted, #7f8c8d);
    word-break: break-all;
  }
  .feed-drop-confirm label {
    display: flex;
    flex-direction: column;
    gap: .15rem;
    font-size: .8em;
    color: var(--text, #212121);
  }
  .feed-drop-confirm input,
  .feed-drop-confirm select {
    font: inherit;
    font-size: .9em;
    padding: .2rem .35rem;
    border: 1px solid var(--border, #d0d0d0);
    border-radius: 4px;
    background: var(--surface, #fff);
    color: var(--text, #212121);
  }
  .feed-drop-actions {
    display: flex;
    gap: .4rem;
    justify-content: flex-end;
    margin-top: .15rem;
  }
  .feed-drop-actions button {
    font: inherit;
    font-size: .8em;
    padding: .25rem .8rem;
    border-radius: 6px;
    cursor: pointer;
  }
  .feed-drop-cancel {
    border: 1px solid var(--border, #d0d0d0);
    background: var(--surface, #fff);
    color: var(--text, #212121);
  }
  .feed-drop-cancel:hover { background: var(--hover, #eaf2fb); }
  .feed-drop-add {
    border: 1px solid var(--accent, #3498db);
    background: var(--accent, #3498db);
    color: #fff;
  }
  .feed-drop-add:hover { filter: brightness(.94); }

  /* Green borders around the feed-manager panels (topic-group cards, the
     add-source / add-topic panels, and the trash). */
  .feed-picker .feed-topic,
  .feed-picker .feed-add-form,
  .feed-picker .feed-trash { border-color: var(--feed-panel-border, #2e9e57); }
  .feed-picker .feed-drop-zone { border-color: var(--feed-panel-border, #2e9e57); }
  .feed-topic {
    border: 1px solid var(--border, #d0d0d0);
    border-radius: 6px;
    background: var(--surface, #fff);
    margin: 0;
    padding: .2rem .8rem .5rem;
    display: flex;
    flex-wrap: wrap;
    gap: .1rem 1.15rem;
  }
  .feed-topic legend {
    font-size: .74em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .04em;
    color: var(--text-muted, #7f8c8d);
    padding: 0 .3rem;
  }
  /* Each source is a draggable chip. A chip whose feed is shown on the bar is
     hidden from its topic (see .feed-chip[hidden]); drag it off the bar to
     bring the chip back. */
  .feed-chip {
    font: inherit;
    font-size: .82em;
    line-height: 1.2;
    padding: .2rem .6rem;
    border: 1px solid var(--border, #d0d0d0);
    border-radius: 999px;
    background: var(--surface, #fff);
    color: var(--text, #212121);
    cursor: grab;
    user-select: none;
    white-space: nowrap;
    transition: background .12s, border-color .12s, box-shadow .12s;
  }
  .feed-chip:hover { background: var(--hover, #eaf2fb); }
  .feed-chip:focus-visible {
    outline: 2px solid var(--accent, #3498db);
    outline-offset: 2px;
  }
  /* A selected feed is shown on the bar and removed from its topic, so its
     chip is hidden rather than highlighted. */
  .feed-chip[hidden] { display: none; }
  .feed-chip.dragging { opacity: .45; cursor: grabbing; }

  /* Drop affordances. The bar lights up when a palette chip is dragged onto
     it (→ show); the palette lights up when a bar pill is dragged back (→
     hide); a topic group lights up for a cross-topic chip (→ re-file). */
  .feed-top-bar.drop-target {
    outline: 2px dashed var(--accent, #3498db);
    outline-offset: -3px;
  }
  .feed-picker-left.drop-deselect {
    outline: 2px dashed var(--text-muted, #7f8c8d);
    outline-offset: 2px;
    border-radius: 8px;
  }
  .feed-topic.drop-target {
    outline: 2px dashed var(--accent, #3498db);
    outline-offset: -3px;
    background: var(--hover, #eaf2fb);
  }

  /* Trash drop target (editable only) — a grid cell the same width as the
     other panels. */
  .feed-trash {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: .5rem .8rem;
    border: 1px dashed var(--border, #c0c0c0);
    border-radius: 8px;
    text-align: center;
    font-size: .82em;
    color: var(--text-muted, #7f8c8d);
    background: var(--surface, #fff);
  }
  .feed-trash.drop-target {
    border-color: var(--error, #e74c3c);
    border-style: solid;
    color: var(--error, #e74c3c);
    background: color-mix(in srgb, var(--error, #e74c3c) 8%, transparent);
  }

  /* (Non-editable "choose feeds" carries the .palette-only marker — no add
     panels or trash, just the topic-card grid.) */

  /* Articles container — a grid of horizontal cards for the active
     feed. Sits flush against the top-bar above; together they form a
     two-tone panel (darker strip / lighter strip) framed by rounded
     outer corners. Override --feed-articles-bg to retint, or
     re-style the "articles" shadow part from outside. */
  .feed-articles {
    flex: 1 1 auto;
    min-height: 0;
    overflow: auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr));
    grid-auto-rows: min-content;
    gap: 1rem;
    padding: 1.4rem 1rem 1rem;
    background: var(--feed-articles-bg,
                    color-mix(in srgb, var(--bg, #f5f5f5) 88%, #000));
    border-radius: 0 0 var(--radius-md, 6px) var(--radius-md, 6px);
  }

  /* Inline reader (reader="inline", or auto under Electron): the top bar
     stays full-width on top, the article grid collapses to a fixed-width
     left column, and the reading pane fills the rest beside it. */
  .reader-inline .feed-reader-split {
    display: flex;
    flex: 1 1 auto;
    min-height: 0;
    gap: .5rem;
  }
  .reader-inline .feed-reader-split .feed-articles {
    flex: 0 0 var(--feed-list-width, 22rem);
    grid-template-columns: 1fr;
    border-radius: 0 0 0 var(--radius-md, 6px);
    /* Drop the top pad so the first card sits flush with the top of the
       column, matching the reading pane (which has no top inset) beside it. */
    padding-top: 0;
  }
  /* In the reader column the card fills the width, but the gallery's 3/2
     aspect-ratio would then make it very tall — drop the ratio and give the
     card a compact fixed height (rem, so it doesn't grow with the font), with
     the title clamped to what fits. */
  .reader-inline .feed-reader-split .feed-card {
    width: auto;
    aspect-ratio: auto;
    height: 5.5rem;
  }
  .reader-inline .feed-reader-split .feed-card-title { -webkit-line-clamp: 3; }
  .feed-article-pane {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    overflow: hidden;
    /* Articles are external pages designed for a light background — keep the
       reading pane white regardless of the app theme. */
    background: #fff;
    border-radius: 0 0 var(--radius-md, 6px) 0;
  }
  .feed-article-pane .feed-article-frame {
    flex: 1 1 auto;
    width: 100%;
    height: 100%;
    border: 0;
    background: #fff;
  }
  .feed-article-pane .sol-feed-empty { margin: auto; color: #555; }

  /* The currently-open article in the reader's list. */
  .reader-inline .feed-card.selected {
    outline: 2px solid var(--accent, #1F618D);
    outline-offset: -2px;
  }
  .feed-link.selected {
    background: color-mix(in srgb, var(--accent, #1F618D) 14%, transparent);
    font-weight: 600;
  }

  /* Horizontal card: image on the left, title on the right. The outer
     dimensions are fixed so image-less cards keep the same footprint —
     a coloured placeholder block stands in for the missing image. */
  .feed-card {
    display: flex;
    flex-direction: row;
    width: 17rem;
    aspect-ratio: 3 / 2;
    border-radius: 8px;
    overflow: hidden;
    background: var(--surface, #fff);
    border: 1px solid var(--border, #d0d0d0);
    box-shadow: 0 1px 4px var(--shadow, rgba(0,0,0,0.08));
    text-decoration: none;
    color: var(--text, #212121);
  }
  .feed-card-img {
    flex: 0 0 6rem;
    width: 6rem;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  /* Stand-in for cards without an image, same size as .feed-card-img. */
  .feed-card.no-image::before {
    content: '';
    flex: 0 0 6rem;
    background: linear-gradient(135deg, var(--accent, #3498db), var(--accent-dark, #2980b9));
  }

  .feed-card-title {
    flex: 1 1 auto;
    margin: 0;
    padding: .55rem .7rem;
    font-family: var(--font-ui, system-ui, sans-serif);
    font-size: .88em;
    font-weight: 400;
    line-height: 1.3;
    /* Article titles are link text — use the theme's link colour
       (themed in root.css for light + dark) so they read as clickable
       even though the whole card is the click target. */
    color: var(--link, var(--accent, #2980b9));
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
  }

  /* ── focus visibility ───────────────────────────────────────────────── */
  .feed-link:focus-visible,
  .feed-card:focus-visible,
  .feed-topic input:focus-visible {
    outline: 2px solid var(--accent, #3498db);
    outline-offset: -2px;
  }

  /* ── editing affordances (view="topics" + [editable]) ────────────────── */
  .feed-topic-headwrap { display: flex; align-items: center; gap: .25rem; }
  .feed-topic-headwrap .feed-topic-head { flex: 1 1 auto; min-width: 0; }
  .feed-topic-head.editable { cursor: text; border-radius: 4px; }
  .feed-topic-head.editable:hover { background: var(--hover, rgba(0,0,0,.06)); }
  .feed-add-source {
    flex: 0 0 auto; width: 1.4em; height: 1.4em; line-height: 1; padding: 0;
    border: 1px solid var(--border, #d0d0d0); border-radius: 5px; cursor: pointer;
    background: var(--surface, #fff); color: var(--text-muted, #7f8c8d); font-size: .9em;
  }
  .feed-add-source:hover { background: var(--accent, #3498db); color: #fff; border-color: transparent; }
  .feed-topic-rename {
    width: 100%; font: inherit; font-weight: 700; padding: .15rem .3rem;
    border: 1px solid var(--accent, #3498db); border-radius: 4px;
    background: var(--bg, #fff); color: var(--text, #111);
  }
  .feed-add-form { display: flex; flex-direction: column; gap: .3rem; padding: .35rem .4rem; }
  .feed-add-input {
    font: inherit; font-size: .82em; padding: .3rem .4rem; border: 1px solid var(--border, #c0c0c0);
    border-radius: 5px; background: var(--bg, #fff); color: var(--text, #111);
  }
  .feed-add-row { display: flex; gap: .3rem; }
  .feed-add-row button {
    font: inherit; font-size: .8em; padding: .25rem .6rem; border-radius: 5px; cursor: pointer;
    border: 1px solid var(--border, #c0c0c0); background: var(--surface, #fff); color: inherit;
  }
  .feed-add-row button.primary { background: var(--accent, #3498db); color: #fff; border-color: transparent; }

  .feed-source-list .editable-row { display: flex; align-items: center; gap: .15rem; }
  .editable-row .feed-link { flex: 1 1 auto; min-width: 0; cursor: grab; }
  .editable-row.dragging { opacity: .45; }
  .feed-del {
    flex: 0 0 auto; background: transparent; border: none; cursor: pointer; padding: 0 .25rem;
    color: var(--text-muted, #9aa0a6); font-size: .85em; line-height: 1;
  }
  .feed-del:hover { color: var(--error, #e74c3c); }
  .feed-topic-column.drop-target { outline: 2px dashed var(--accent, #3498db); outline-offset: -3px; border-radius: 6px; }

  /* delete confirm (inline, replaces the row) */
  .feed-del-confirm { display: flex; align-items: center; flex-wrap: wrap; gap: .3rem; padding: .15rem 0; width: 100%; }
  .feed-del-q { flex: 1 1 100%; font-size: .8em; }
  .feed-del-confirm button { font: inherit; font-size: .76em; padding: .15rem .55rem; border-radius: 5px; cursor: pointer; border: 1px solid var(--border, #c0c0c0); background: var(--surface, #fff); color: inherit; }
  .feed-del-yes { background: var(--error, #e74c3c) !important; color: #fff !important; border-color: transparent !important; }

  /* reorder insertion indicator (drop before/after a row) */
  .editable-row.drop-before { box-shadow: inset 0 2px 0 0 var(--accent, #3498db); }
  .editable-row.drop-after  { box-shadow: inset 0 -2px 0 0 var(--accent, #3498db); }

  /* deleted-bin view */
  .feed-bin-bar { display: flex; align-items: center; gap: .8rem; padding: .5rem .7rem; border-bottom: 1px solid var(--border, #d0d0d0); }
  .feed-bin-back { font: inherit; font-size: .85em; cursor: pointer; background: none; border: none; color: var(--link, #2980b9); padding: 0; }
  .feed-bin-title { font-weight: 700; }
  .feed-bin-list { padding: .5rem .7rem; }
  .feed-bin-row { display: flex; align-items: center; gap: .5rem; padding: .25rem 0; }
  .feed-bin-name { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .feed-bin-restore-to { font: inherit; font-size: .82em; }
  .feed-bin-restore {
    font: inherit; font-size: .8em; padding: .2rem .6rem; border-radius: 5px; cursor: pointer;
    border: 1px solid var(--border, #c0c0c0); background: var(--surface, #fff); color: inherit;
  }
  .feed-bin-restore:hover { background: var(--accent, #3498db); color: #fff; border-color: transparent; }
  .feed-bin-purge {
    font: inherit; font-size: .8em; padding: .2rem .6rem; border-radius: 5px; cursor: pointer;
    border: 1px solid var(--error, #e74c3c); background: transparent; color: var(--error, #e74c3c);
  }
  .feed-bin-purge:hover { background: var(--error, #e74c3c); color: #fff; }

`;

export const sheet = sheetFrom(CSS);
