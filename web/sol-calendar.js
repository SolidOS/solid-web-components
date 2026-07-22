/**
 * <sol-calendar> — inline calendar viewer web component.
 *
 * Fetches a public iCalendar (ICS) feed from any provider that exports
 * one — Google Calendar, Apple iCloud, Outlook, Proton Calendar, or a
 * Solid pod — and renders the events as an agenda list that fits
 * whatever container the host page gives it.
 *
 * Two views: `agenda` (default) and `month` — a 7-column grid whose
 * cells carry event chips and open a day popover with the full list.
 * `mini` (today-only card) is still planned; the dispatch in
 * `_renderView` is where it lands.
 *
 * Attributes:
 *   source         One or more ICS URLs (whitespace-separated for >1),
 *                  **or** `file.ttl#Subject` PropertyValue config. The
 *                  RDF source may itself declare repeated `"source"`
 *                  values (multi-calendar / amalgamated view), in
 *                  which case events from every feed are fetched in
 *                  parallel and merged into one sorted agenda.
 *   provider       google | apple | outlook | proton | ics  (default: ics)
 *   calendar-id    For provider="google", the calendar email/id; URL is built
 *                  via the public-ICS template. Other providers ignore it.
 *   view           agenda | month  (default: agenda)
 *   start          ISO date YYYY-MM-DD (default: today). In month view it
 *                  picks the month the grid opens on.
 *   window-days    Agenda lookahead in days (default: 30). Ignored by month
 *                  view, which windows the fetch to the grid it draws.
 *   max-events     Cap on rendered events (default: 100)
 *   proxy          CORS proxy pattern — supports `{url}` token or appended
 *   time-zone      IANA TZ override (default: browser's resolved TZ)
 *   locale         BCP-47 (default: browser locale)
 *   hide-header    Boolean — when present, the title + provider strip
 *                  above the agenda is omitted. Useful when the host page
 *                  already labels the slot (dashboards, sidebars).
 *
 * The HTML attribute always wins over the same-named PropertyValue in
 * the RDF `source`, matching the `sol-time` / `sol-weather` convention.
 *
 * @element sol-calendar
 *
 * @example
 *   <!-- Direct URL -->
 *   <sol-calendar
 *     source="https://calendar.google.com/calendar/ical/.../public/basic.ics"
 *     proxy="http://localhost:3002/proxy?uri="></sol-calendar>
 *
 *   <!-- Provider helper builds the URL -->
 *   <sol-calendar provider="google" calendar-id="alice@example.org"></sol-calendar>
 *
 *   <!-- Pull every setting from a PropertyValue TTL -->
 *   <sol-calendar source="data/calendar-settings.ttl#Settings"></sol-calendar>
 */
import { adopt }   from '../core/adopt.js';
import { define }  from '../core/define.js';
import { CSS as CAL_CSS, sheet as CAL_SHEET } from './styles/sol-calendar-css.js';
import { getCalendarEvents, getMergedCalendarEvents, buildProviderUrl }
  from './utils/calendar-fetch.js';
import { loadConfig } from './utils/rdf-config.js';
import { getDefault, onDefaultChange } from '../core/defaults.js';
import { attachEditorSelfGear } from '../core/editor-self.js';

/** Predicate URI → HTML attribute name. After the vocab migration
 *  (see swc/claude/plans/PLAN-vocab-migration.md) calendar settings
 *  use direct predicates from Dublin Core / Schema.org / OWL-Time.
 *  `dct:source` is multi-valued; everything else is single. (`view` is a
 *  plain element attribute — default "agenda" — not a settings-doc predicate.) */
const DCT       = 'http://purl.org/dc/terms/';
const SCHEMA    = 'http://schema.org/';
const TIME_NS   = 'http://www.w3.org/2006/time#';
const CONFIG_MAP = [
  [DCT    + 'format',          'provider'],
  [TIME_NS + 'days',            'window-days'],
  [SCHEMA + 'numberOfItems',    'max-events'],
];

/** True iff `source` is a `something.ttl#Subject` PropertyValue pointer
 *  rather than a direct calendar URL. The presence of `#` plus the
 *  `.ttl`/`.shacl` extension is the disambiguator — an ICS URL with a
 *  fragment is exotic enough to leave for later. */
function isRdfConfigSource(source) {
  if (!source || !source.includes('#')) return false;
  const path = source.split('#', 1)[0].toLowerCase();
  return path.endsWith('.ttl') || path.endsWith('.shacl');
}

/** Format a Date as the day label used in the agenda's date column,
 *  e.g. "Wed, May 28". Honours the component's `locale` attribute. */
function formatDate(d, locale) {
  return d.toLocaleDateString(locale || undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

/** Compare two Dates for same-day (local TZ). Used to detect repeat
 *  dates in the agenda so the date column can blank-out without
 *  losing its layout slot. */
function sameYMD(a, b) {
  return !!a && !!b
    && a.getFullYear() === b.getFullYear()
    && a.getMonth()    === b.getMonth()
    && a.getDate()     === b.getDate();
}

/** Two-digit zero-padded number — used for the agenda time column so
 *  `09:30` aligns under `14:00`. */
function pad2(n) { return n < 10 ? '0' + n : String(n); }

/** Format the time half of an agenda row: "09:30–10:15", "14:00" if
 *  the event has no end time / a same-instant end, or "All day" when
 *  the event was a DATE-only DTSTART. */
function formatEventTime(ev, locale) {
  if (ev.allDay) return 'All day';
  const start = `${pad2(ev.start.getHours())}:${pad2(ev.start.getMinutes())}`;
  if (!ev.end || ev.end.getTime() === ev.start.getTime()) return start;
  // Don't show the end time if it's the same minute as the start
  // (some ICS sources use zero-duration events as bookmarks).
  const endSameMinute =
    ev.end.getFullYear() === ev.start.getFullYear() &&
    ev.end.getMonth()    === ev.start.getMonth() &&
    ev.end.getDate()     === ev.start.getDate() &&
    ev.end.getHours()    === ev.start.getHours() &&
    ev.end.getMinutes()  === ev.start.getMinutes();
  if (endSameMinute) return start;
  const end = `${pad2(ev.end.getHours())}:${pad2(ev.end.getMinutes())}`;
  return `${start}–${end}`;
}

/** Local YMD key ("2026-07-04") — the month grid buckets events by day. */
function ymdKey(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** First day of the week for a locale: 1=Mon … 7=Sun, per Intl's weekInfo.
 *  Falls back to Sunday where the engine doesn't expose it. */
function firstWeekday(locale) {
  try {
    const info = new Intl.Locale(locale || navigator.language).weekInfo;
    if (info && info.firstDay) return info.firstDay;
  } catch { /* no weekInfo in this engine */ }
  return 7;
}

/** The cells of a month grid: leading/trailing days pad the first and
 *  last weeks so every row holds 7. `inMonth` marks the real ones. */
function monthCells(anchor, locale) {
  const year = anchor.getFullYear(), month = anchor.getMonth();
  const start = firstWeekday(locale) % 7;                // 7 (Sun) → 0
  const lead  = (new Date(year, month, 1).getDay() - start + 7) % 7;
  const days  = new Date(year, month + 1, 0).getDate();  // day 0 of next month
  const total = Math.ceil((lead + days) / 7) * 7;
  const cells = [];
  for (let i = 0; i < total; i++) {
    const d = new Date(year, month, i - lead + 1);
    cells.push({ date: d, inMonth: d.getMonth() === month });
  }
  return cells;
}

/** Pretty header label for the title strip. We don't have the calendar's
 *  own X-WR-CALNAME yet (could be added) so this falls back to a clean
 *  rendering of the calendar-id or the URL host. */
function deriveTitle({ source, calendarId }) {
  if (calendarId) return calendarId;
  if (!source) return 'Calendar';
  try { return new URL(source, document.baseURI).hostname; }
  catch { return 'Calendar'; }
}

/**
 * Inline calendar viewer.
 *
 * @class SolCalendar
 * @extends HTMLElement
 */
class SolCalendar extends HTMLElement {
  static get observedAttributes() {
    return [
      'source', 'provider', 'calendar-id', 'view',
      'start', 'window-days', 'max-events', 'proxy',
      'time-zone', 'locale', 'hide-header',
    ];
  }

  /** SHACL shape declaring the fixed schema (predicates + datatypes +
   *  cardinalities). sol-form's shape-driven mode generates a labelled
   *  field per property; only `dct:source` is multi-valued. dk-settings
   *  discovery picks this up. The legacy `editor` (ui:Form TTL) getter
   *  was dropped in the direct-predicate vocab migration — see
   *  swc/claude/plans/PLAN-vocab-migration.md. */
  static get shape() {
    return new URL('../shapes/calendar-settings.shacl', import.meta.url).href;
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._controller = null;   // AbortController for the active fetch
    this._refreshMs  = 10 * 60 * 1000;
    this._timer      = null;
  }

  async connectedCallback() {
    adopt(this.shadowRoot, { sheet: CAL_SHEET, css: CAL_CSS });

    this._status = document.createElement('div');
    this._status.className = 'sol-calendar-status';
    this._status.setAttribute('role', 'status');
    this._status.setAttribute('aria-live', 'polite');
    this._status.style.display = 'none';

    this._root = document.createElement('div');
    this._root.className = 'sol-calendar';

    this.shadowRoot.append(this._status, this._root);

    // PropertyValue config first (HTML attributes already win because
    // _applySource only sets attributes that aren't already there).
    await this._applySource();

    try {
      await this._update();
    } catch (e) {
      this._setStatus(e.message || String(e), true);
    }
    this._timer = setInterval(() => this._update().catch(() => {}), this._refreshMs);

    // Re-fetch when <sol-default> changes the proxy at runtime.
    this._unsubDefaults = onDefaultChange((name) => {
      if (name === 'proxy') this.reload().catch(() => {});
    });

    if (this.hasAttribute('editor-self')) attachEditorSelfGear(this);
  }

  disconnectedCallback() {
    if (this._controller) this._controller.abort();
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
    if (this._unsubDefaults) { this._unsubDefaults(); this._unsubDefaults = null; }
  }

  /**
   * Re-read `source` and re-fetch calendar events. Public hook used by
   * external editors (e.g. dk-settings) after a configuration file
   * changes.
   */
  async reload() {
    await this._applySource();
    await this._update();
  }

  attributeChangedCallback(_name, oldV, newV) {
    if (oldV !== newV && this.isConnected && this._root) {
      this._update().catch(() => {});
    }
  }

  /** If `source` points at an RDF config file, pull PropertyValue
   *  settings into attributes that aren't already explicitly set on
   *  the HTML element. Skipped when source is empty or looks like a
   *  direct ICS URL. */
  async _applySource() {
    const source = this.getAttribute('source');
    if (!isRdfConfigSource(source)) return;
    try {
      const cfg = await loadConfig(source);
      for (const [predicate, attr] of CONFIG_MAP) {
        if (cfg[predicate] != null && !this.hasAttribute(attr)) {
          this.setAttribute(attr, String(cfg[predicate]));
        }
      }
      // dct:source provides the actual feed URLs (the element's `source`
      // attribute was a config-doc pointer). Stash them on the instance
      // instead of overwriting the attribute — sol-settings discovery
      // and the editor need `source` to keep pointing at the config TTL.
      const dctSource = cfg[DCT + 'source'];
      if (dctSource != null) {
        this._feedUrls = Array.isArray(dctSource)
          ? dctSource.map(String).filter(Boolean)
          : [String(dctSource)].filter(Boolean);
      }
    } catch (err) {
      // Bad TTL or missing rdflib — surface in the status strip but
      // keep going; explicit HTML attributes can still drive a render.
      this._setStatus(`Config: ${err.message}`, true);
    }
  }

  /** ICS feed URLs to fetch. When `source` is an RDF-config pointer,
   *  `_applySource` populates `this._feedUrls` from dct:source — those
   *  win. Otherwise `source` is treated as a direct ICS URL (or a
   *  whitespace-separated list of them), per the documented inline
   *  usage. Empty result before _applySource has run on a config
   *  pointer; the post-load render fills it in. */
  _sourceUrls() {
    if (Array.isArray(this._feedUrls) && this._feedUrls.length) return this._feedUrls;
    const raw = this.source;
    if (!raw || isRdfConfigSource(raw)) return [];
    return raw.split(/\s+/).filter(Boolean);
  }

  /** Update the polite live region. Pass `isError` to colour it red. */
  _setStatus(msg, isError = false) {
    if (!this._status) return;
    this._status.textContent = msg || '';
    this._status.style.display = msg ? '' : 'none';
    if (isError) this._status.setAttribute('data-error', '');
    else this._status.removeAttribute('data-error');
  }

  /* ── attribute readers ───────────────────────────────────────────── */

  get source()      { return this.getAttribute('source') || ''; }
  get provider()    { return (this.getAttribute('provider') || 'ics').toLowerCase(); }
  get calendarId()  { return this.getAttribute('calendar-id') || ''; }
  get view()        { return (this.getAttribute('view') || 'agenda').toLowerCase(); }
  get proxy()       { return this.getAttribute('proxy') || getDefault('proxy') || ''; }
  get locale()      { return this.getAttribute('locale') || ''; }
  get windowDays()  { return Math.max(1, Number(this.getAttribute('window-days')) || 30); }
  get maxEvents()   { return Math.max(1, Number(this.getAttribute('max-events')) || 100); }
  get startDate() {
    const raw = this.getAttribute('start');
    if (!raw) {
      // Start at midnight local — same-day events that started a few
      // minutes ago still appear, instead of being trimmed by the
      // window cutoff.
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    }
    // YYYY-MM-DD parses as UTC midnight; pin to local midnight so the
    // agenda's day-grouping matches what the user expects.
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return new Date(raw);
  }

  /* ── fetch + render dispatch ─────────────────────────────────────── */

  async _update() {
    if (!this._root) return;

    // After _applySource, `source` holds either zero URLs (caller is
    // using provider+calendar-id only), one URL, or N whitespace-
    // separated URLs (multi-calendar amalgamation).
    const urls = this._sourceUrls();
    if (!urls.length && !this.calendarId) {
      this._setStatus('No calendar source — set source= or provider= + calendar-id=', true);
      return;
    }

    if (this._controller) this._controller.abort();
    this._controller = new AbortController();
    const signal = this._controller.signal;

    this._setStatus(urls.length > 1
      ? `Loading ${urls.length} calendars…`
      : 'Loading calendar…');

    const opts = {
      provider:   this.provider,
      calendarId: this.calendarId,
      proxy:      this.proxy,
      start:      this.startDate,
      windowDays: this.windowDays,
      maxEvents:  this.maxEvents,
      signal,
    };

    // Month view windows the fetch to the grid it's about to draw — the
    // whole displayed month plus the adjacent-month days padding its first
    // and last weeks — instead of the agenda's rolling `window-days`.
    if (this.view === 'month') {
      const cells = monthCells(this.monthAnchor, this.locale);
      opts.start = cells[0].date;
      opts.windowDays = cells.length;
    }

    try {
      if (urls.length > 1) {
        // Amalgamated calendar — Promise.allSettled inside, so a single
        // dead feed doesn't blank the rest. Surface the count of
        // failures in the status strip without overriding the events.
        const { events, errors } = await getMergedCalendarEvents(urls, opts);
        this._renderView(events);
        if (errors.length) {
          this._setStatus(
            `Loaded ${urls.length - errors.length} of ${urls.length} calendars — ${errors.length} failed`,
            true);
          // Skip the per-feed warn when the failure is just our own
          // AbortController firing (e.g. a later _update cancelled an
          // in-flight one) — that's expected, not a real failure.
          for (const e of errors) {
            if (/aborted/i.test(e.message)) continue;
            console.warn(`[sol-calendar] ${e.url}: ${e.message}`);
          }
        } else {
          this._setStatus('');
        }
      } else {
        const events = await getCalendarEvents(urls[0] || '', opts);
        this._renderView(events);
        this._setStatus('');
      }
    } catch (e) {
      if (e.name === 'AbortError') return;
      this._renderEmpty(`Couldn't load calendar: ${e.message}`);
      this._setStatus(e.message || String(e), true);
    }
  }

  /** View dispatch — `view="month"` gets the grid, everything else the agenda. */
  _renderView(events) {
    if (this.view === 'month') this._renderMonth(events);
    else this._renderAgenda(events);
  }

  /** First of the displayed month. Month nav moves this; everything else
   *  derives from `start`. */
  get monthAnchor() {
    if (!this._monthAnchor) {
      const s = this.startDate;
      this._monthAnchor = new Date(s.getFullYear(), s.getMonth(), 1);
    }
    return this._monthAnchor;
  }

  /** Step the grid by ±1 month and refetch — the window follows the anchor. */
  async _stepMonth(delta) {
    const a = this.monthAnchor;
    this._monthAnchor = new Date(a.getFullYear(), a.getMonth() + delta, 1);
    await this._update();
  }

  _renderMonth(events) {
    const anchor = this.monthAnchor;
    const locale = this.locale || undefined;
    const frag = [];

    if (!this.hasAttribute('hide-header')) {
      const header = document.createElement('div');
      header.className = 'cal-header cal-month-header';

      const prev = document.createElement('button');
      prev.type = 'button';
      prev.className = 'cal-nav';
      prev.textContent = '‹';
      prev.setAttribute('aria-label', 'Previous month');
      prev.addEventListener('click', () => this._stepMonth(-1));

      const title = document.createElement('span');
      title.className = 'cal-title';
      title.textContent = anchor.toLocaleDateString(locale, { month: 'long', year: 'numeric' });

      const next = document.createElement('button');
      next.type = 'button';
      next.className = 'cal-nav';
      next.textContent = '›';
      next.setAttribute('aria-label', 'Next month');
      next.addEventListener('click', () => this._stepMonth(1));

      header.append(prev, title, next);
      frag.push(header);
    }

    const grid = document.createElement('div');
    grid.className = 'cal-month';
    grid.setAttribute('role', 'grid');
    grid.setAttribute('aria-label', anchor.toLocaleDateString(locale, { month: 'long', year: 'numeric' }));

    const cells = monthCells(anchor, this.locale);

    // Weekday strip — names come from the first week's cells, so the
    // labels always match the column order whatever the locale starts on.
    const head = document.createElement('div');
    head.className = 'cal-month-row cal-weekdays';
    head.setAttribute('role', 'row');
    for (const c of cells.slice(0, 7)) {
      const wd = document.createElement('span');
      wd.className = 'cal-weekday';
      wd.setAttribute('role', 'columnheader');
      wd.textContent = c.date.toLocaleDateString(locale, { weekday: 'short' });
      head.appendChild(wd);
    }
    grid.appendChild(head);

    // Bucket events by local day so each cell is a cheap lookup.
    const byDay = new Map();
    for (const ev of events) {
      const k = ymdKey(ev.start);
      if (!byDay.has(k)) byDay.set(k, []);
      byDay.get(k).push(ev);
    }

    const today = new Date();
    let row = null;
    cells.forEach((cell, i) => {
      if (i % 7 === 0) {
        row = document.createElement('div');
        row.className = 'cal-month-row';
        row.setAttribute('role', 'row');
        grid.appendChild(row);
      }
      const dayEvents = byDay.get(ymdKey(cell.date)) || [];

      const day = document.createElement('div');
      day.className = 'cal-day'
        + (cell.inMonth ? '' : ' outside')
        + (sameYMD(cell.date, today) ? ' today' : '')
        + (dayEvents.length ? ' has-events' : '');
      day.setAttribute('role', 'gridcell');
      day.dataset.date = ymdKey(cell.date);

      const num = document.createElement('span');
      num.className = 'cal-day-num';
      num.textContent = String(cell.date.getDate());
      day.appendChild(num);

      for (const ev of dayEvents) {
        const chip = document.createElement('span');
        chip.className = 'cal-chip' + (ev.allDay ? ' all-day' : '');
        chip.textContent = ev.summary || '(untitled)';
        chip.title = ev.summary || '';
        day.appendChild(chip);
      }

      if (dayEvents.length) {
        day.tabIndex = 0;
        day.setAttribute('aria-haspopup', 'dialog');
        const open = () => this._openDay(day, cell.date, dayEvents);
        day.addEventListener('click', open);
        day.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
        });
      }

      row.appendChild(day);
    });

    frag.push(grid);
    this._root.replaceChildren(...frag);
  }

  /** Day popover — the full event list for one cell. A second click (or
   *  Escape) closes it; only one is open at a time. */
  _openDay(cell, date, events) {
    const existing = this._root.querySelector('.cal-day-popover');
    const wasMine = existing && existing.parentElement === cell;
    if (existing) existing.remove();
    if (wasMine) return;

    const pop = document.createElement('div');
    pop.className = 'cal-day-popover';
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-label', formatDate(date, this.locale));

    const head = document.createElement('div');
    head.className = 'cal-day-popover-head';
    head.textContent = formatDate(date, this.locale);
    pop.appendChild(head);

    const ul = document.createElement('ul');
    ul.className = 'cal-rows';
    for (const ev of events) {
      const li = document.createElement('li');
      li.className = 'cal-row';

      const time = document.createElement('span');
      time.className = 'cal-row-time';
      time.textContent = formatEventTime(ev, this.locale);

      const body = document.createElement('div');
      body.className = 'cal-row-body';
      const summary = document.createElement('span');
      summary.className = 'cal-row-summary';
      if (ev.url) {
        const a = document.createElement('a');
        a.href = ev.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = ev.summary || '(untitled)';
        summary.appendChild(a);
      } else {
        summary.textContent = ev.summary || '(untitled)';
      }
      body.appendChild(summary);
      if (ev.location) {
        const loc = document.createElement('span');
        loc.className = 'cal-row-location';
        loc.textContent = ev.location;
        body.appendChild(loc);
      }

      li.append(time, body);
      ul.appendChild(li);
    }
    pop.appendChild(ul);

    pop.addEventListener('keydown', (e) => { if (e.key === 'Escape') pop.remove(); });
    cell.appendChild(pop);
  }

  _renderEmpty(msg) {
    const wrap = document.createElement('div');
    wrap.className = 'sol-calendar-empty';
    wrap.textContent = msg;
    this._root.replaceChildren(wrap);
  }

  _renderAgenda(events) {
    // hide-header: skip the title + provider strip entirely. Common for
    // dashboards / sidebars that already label the slot themselves.
    const showHeader = !this.hasAttribute('hide-header');
    let header = null;
    if (showHeader) {
      header = document.createElement('div');
      header.className = 'cal-header';
      const title = document.createElement('span');
      title.className = 'cal-title';
      title.textContent = deriveTitle({ source: this.source, calendarId: this.calendarId });
      const prov = document.createElement('span');
      prov.className = 'cal-provider';
      prov.textContent = this.provider;
      header.append(title, prov);
    }

    const list = document.createElement('div');
    list.className = 'cal-agenda';
    list.setAttribute('aria-label', 'Upcoming events');

    if (!events.length) {
      const empty = document.createElement('div');
      empty.className = 'sol-calendar-empty';
      empty.textContent = `No events in the next ${this.windowDays} days.`;
      list.appendChild(empty);
      this._root.replaceChildren(...(header ? [header, list] : [list]));
      return;
    }

    const today = new Date();
    const ul = document.createElement('ul');
    ul.className = 'cal-rows';

    // Flat list — one row per event, with date / time / event columns.
    // The date is rendered on every row (preserving the grid alignment)
    // but visually blanked when the previous row was the same day, so a
    // run of same-day events reads cleanly without losing the column.
    let prevDate = null;
    for (const ev of events) {
      const li = document.createElement('li');
      li.className = 'cal-row' + (sameYMD(ev.start, today) ? ' today' : '');

      const date = document.createElement('span');
      date.className = 'cal-row-date' + (sameYMD(ev.start, prevDate) ? ' repeat' : '');
      date.textContent = formatDate(ev.start, this.locale);

      const time = document.createElement('span');
      time.className = 'cal-row-time';
      time.textContent = formatEventTime(ev, this.locale);

      const body = document.createElement('div');
      body.className = 'cal-row-body';

      const summary = document.createElement('span');
      summary.className = 'cal-row-summary';
      if (ev.url) {
        const a = document.createElement('a');
        a.href = ev.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = ev.summary || '(untitled)';
        summary.appendChild(a);
      } else {
        summary.textContent = ev.summary || '(untitled)';
      }
      body.appendChild(summary);

      if (ev.location) {
        const loc = document.createElement('span');
        loc.className = 'cal-row-location';
        loc.textContent = ev.location;
        body.appendChild(loc);
      }

      li.append(date, time, body);
      ul.appendChild(li);
      prevDate = ev.start;
    }

    list.appendChild(ul);
    this._root.replaceChildren(...(header ? [header, list] : [list]));
  }
}

define('sol-calendar', SolCalendar);

export { SolCalendar, buildProviderUrl };
