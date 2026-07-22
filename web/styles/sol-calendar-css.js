// Styles for <sol-calendar>'s shadow root. Exports the raw `CSS` string
// plus a constructable `sheet` — same shape as the other web/styles/*-css.js
// modules. All colours and metrics reference the shared design tokens so
// the component themes with the rest of the suite.
import { sheetFrom } from '../../core/adopt.js';

export const CSS = `
  :host {
    display: flex;
    flex-direction: column;
    /* Respect whatever height the container gives us; with no container
       height, fall back to this viewport cap. Either way the agenda list
       scrolls inside the component and never overflows its container. */
    height: 100%;
    max-height: 100vh;
    font-family: var(--font-ui, system-ui, -apple-system, sans-serif);
    font-size: var(--font-size, 20px);
    color: var(--text, #212121);
  }
  * { box-sizing: border-box; }

  .sol-calendar {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  /* ── status / loading / empty ───────────────────────────────────────── */
  .sol-calendar-status {
    flex: 0 0 auto;
    padding: .5rem .75rem;
    color: var(--text-muted, #7f8c8d);
    font-size: max(16px, .85em);
  }
  .sol-calendar-status[data-error] { color: var(--error, #e74c3c); }
  .sol-calendar-empty {
    padding: 1rem .75rem;
    color: var(--text-muted, #7f8c8d);
    font-style: italic;
  }

  /* ── header (provider label) ────────────────────────────────────────── */
  .cal-header {
    flex: 0 0 auto;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: .75rem;
    padding: .4rem .75rem;
    border-bottom: 1px solid var(--border, #d0d0d0);
    background: var(--surface, #fff);
  }
  .cal-title {
    font-weight: 600;
    font-size: max(16px, .95em);
    color: var(--text, #212121);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .cal-provider {
    color: var(--text-muted, #7f8c8d);
    font-size: max(16px, .8em);
    text-transform: lowercase;
  }

  /* ── agenda list (table-like: date | time | event per row) ──────────── */
  .cal-agenda {
    flex: 1 1 auto;
    min-height: 0;
    overflow: auto;
    background: var(--surface, #fff);
    border: 1px solid var(--border, #d0d0d0);
    border-radius: 6px;
    margin: .5rem;
  }
  /* No day-header rows — each .cal-row is self-contained with its own
     date column, so the agenda reads as one flat table-like list. */

  .cal-rows {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .cal-row {
    display: grid;
    /* Body column is "auto" (not "1fr") so each row's intrinsic
       width is the actual width of its content. That lets host
       pages size the whole calendar to fit-content via
       "width: max-content" — the fr-based version had no
       well-defined max-content, which collapses fit-width sizing.
       NOTE: Don't use backticks in this comment; the surrounding
       JS template literal uses backticks as its delimiter and any
       stray one in the CSS body terminates the string early. */
    grid-template-columns: 7rem 7rem auto;
    column-gap: .75rem;
    align-items: baseline;
    padding: .35rem .75rem;
    border-top: 1px solid color-mix(in srgb, var(--border, #d0d0d0) 50%, transparent);
    font-size: max(16px, .9em);
  }
  .cal-row:first-child { border-top: none; }
  /* When the row is "today", give a subtle accent stripe at the left so
     it stands out without changing the column widths or alignment. */
  .cal-row.today {
    background: color-mix(in srgb, var(--accent, #3498db) 8%, transparent);
    box-shadow: inset 3px 0 0 var(--accent, #3498db);
  }

  .cal-row-date,
  .cal-row-time {
    color: var(--text-muted, #7f8c8d);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /* The date repeats on every row. Don't visually emphasise it — the
     event title is the row's primary content. */
  .cal-row-date { font-size: max(16px, .9em); }
  /* When a date is the same as the row above, the JS adds .repeat —
     keep the column reserved (no layout shift) but hide the text so a
     run of same-day events reads cleanly. */
  .cal-row-date.repeat { visibility: hidden; }

  .cal-row-body { min-width: 0; }
  .cal-row-summary {
    color: var(--text, #212121);
    overflow-wrap: anywhere;
  }
  .cal-row-location {
    display: block;
    color: var(--text-muted, #7f8c8d);
    font-size: max(16px, .85em);
    margin-top: .1rem;
    overflow-wrap: anywhere;
  }
  .cal-row a {
    /* Use the theme's link colour so a clickable event summary reads as
       a real link (Jitsi / Meet / W3C events-page join URLs) — the
       row's plain text events stay in the regular text colour. */
    color: var(--link, var(--accent, #2980b9));
    text-decoration: none;
  }
  .cal-row a:hover,
  .cal-row a:focus-visible {
    text-decoration: underline;
  }

  /* ── month view (view="month") ─────────────────────────────────────── */

  .cal-month-header { display: flex; align-items: center; gap: .5rem; }
  .cal-month-header .cal-title { flex: 1; text-align: center; }

  .cal-nav {
    font: inherit; line-height: 1; cursor: pointer;
    background: none; color: inherit;
    border: 1px solid var(--border, #cfcfcf); border-radius: 6px;
    padding: .1rem .5rem;
  }
  .cal-nav:hover { background: var(--hover-bg, rgba(0,0,0,.06)); }
  .cal-nav:focus-visible { outline: 2px solid var(--focus, #4c6ef5); outline-offset: 1px; }

  .cal-month { display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: auto; }
  .cal-month-row { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); }

  .cal-weekdays { position: sticky; top: 0; z-index: 1; background: var(--bg, #fff); }
  .cal-weekday {
    padding: .25rem; text-align: center;
    font-size: .8em; font-weight: 600; color: var(--muted, #666);
  }

  .cal-day {
    position: relative;                 /* popover anchor */
    min-height: 4.5rem; padding: .2rem;
    border-top: 1px solid var(--border, #e6e6e6);
    border-left: 1px solid var(--border, #e6e6e6);
    display: flex; flex-direction: column; gap: .1rem;
    /* NO overflow:hidden — it would clip the day popover. Chips ellipsis
       individually, and a busy day just makes its week row taller. */
  }
  /* Lift the open day above its later siblings so they can't paint over it. */
  .cal-day:has(.cal-day-popover) { z-index: 5; }
  .cal-month-row .cal-day:last-child { border-right: 1px solid var(--border, #e6e6e6); }
  .cal-month-row:last-child .cal-day { border-bottom: 1px solid var(--border, #e6e6e6); }
  .cal-day.outside { opacity: .45; }
  .cal-day.today { background: var(--today-bg, rgba(76,110,245,.10)); }
  .cal-day.has-events { cursor: pointer; }
  .cal-day:focus-visible { outline: 2px solid var(--focus, #4c6ef5); outline-offset: -2px; }

  .cal-day-num { font-size: .85em; font-weight: 600; }
  .cal-day.today .cal-day-num { color: var(--accent, #4c6ef5); }

  .cal-chip {
    font-size: .75em; line-height: 1.3;
    padding: 0 .25rem; border-radius: 3px;
    background: var(--chip-bg, rgba(76,110,245,.16));
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .cal-chip.all-day { background: var(--chip-allday-bg, rgba(64,160,96,.18)); }

  .cal-day-popover {
    position: absolute; top: 100%; left: 0; z-index: 5;
    min-width: max(100%, 16rem); max-width: 22rem;
    max-height: 60vh; overflow: auto;
    padding: .4rem;
    background: var(--bg, #fff); color: var(--text, #212121);
    border: 1px solid var(--border, #cfcfcf); border-radius: 8px;
    box-shadow: 0 6px 20px rgba(0,0,0,.18);
    cursor: default;
  }
  .cal-day-popover-head { font-weight: 600; margin-bottom: .25rem; }
  /* The popover reuses .cal-rows/.cal-row, which the agenda lays out as a
     date+time+body grid — here there's no date column. */
  .cal-day-popover .cal-row { grid-template-columns: 5rem 1fr; }

  /* A cell in the last rows would clip its popover against the scroller;
     flip it above instead. */
  .cal-month-row:nth-last-child(-n+2) .cal-day-popover { top: auto; bottom: 100%; }

  /* Phone (coarse pointer): inside a viewport-capped dropdown the fixed
     7rem+7rem grid columns squeeze the event body to a sliver (one
     character per line). Wrap instead: date + time on the first line,
     event body full-width beneath. Desktop keeps the table-like grid. */
  @media (hover: none) and (pointer: coarse) {
    .cal-row {
      display: flex; flex-wrap: wrap; align-items: baseline;
      column-gap: .6rem; row-gap: .1rem;
    }
    .cal-row-body { flex: 1 1 100%; }
    /* visibility:hidden would still hold a first-line slot in the flex
       row — drop repeats entirely on the phone. */
    .cal-row-date.repeat { display: none; }
  }
`;

export const sheet = sheetFrom(CSS);
export default sheet;
