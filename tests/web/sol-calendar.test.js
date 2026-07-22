/**
 * @jest-environment jsdom
 *
 * Tests for <sol-calendar> — the inline iCalendar (ICS) agenda viewer.
 *
 * NOTE: this component is not a date-picker — it fetches one or more ICS
 * feeds and renders the events, either as a flat agenda list (default) or
 * as a month grid (view="month"). The deterministic seams exercised here
 * are:
 *   - registration + exports
 *   - static observedAttributes / shape
 *   - the pure buildProviderUrl() helper (the only exported pure fn)
 *   - attribute readers (provider / view / window-days / max-events)
 *   - the `start` getter parsing YYYY-MM-DD to LOCAL midnight (the one
 *     date-math seam, driven by an explicit attribute so it never
 *     depends on Date.now())
 *   - the agenda render: row-per-event, date/time/summary/location
 *     columns, event-URL links, the today + repeat-date classes, the
 *     empty-state message, and hide-header
 *   - ARIA on the status + agenda regions
 *   - the month grid: whole-week cell counts (including a 28-day February
 *     that needs no padding, and a leap February), in-month vs padding
 *     cells, events bucketed into their day, the day popover and its
 *     toggle/one-at-a-time behaviour, month-anchor stepping across a year
 *     boundary, hide-header, and the grid/row/gridcell ARIA roles
 *
 * Renders are driven through _renderAgenda() with explicit event arrays
 * (and a fixed-date ICS blob through the real fetch path once), so no
 * assertion depends on the current date or on locale-formatted month /
 * weekday NAME strings — date columns are asserted by structure, counts,
 * and selected/repeat state instead.
 */

window.__SolSuppressDefineWarn = true;

let SolCalendar, buildProviderUrl;

beforeAll(async () => {
  ({ SolCalendar, buildProviderUrl } = await import('../../web/sol-calendar.js'));
});

function settle() { return new Promise(r => setTimeout(r, 20)); }

afterEach(() => {
  document.body.innerHTML = '';
  delete global.fetch;
});

/** Mount a <sol-calendar> with the given attributes and let
 *  connectedCallback's async _applySource / _update settle. */
async function mount(attrs = '') {
  document.body.innerHTML = `<sol-calendar ${attrs}></sol-calendar>`;
  const el = document.body.querySelector('sol-calendar');
  await settle();
  return el;
}

/** A plain agenda-event object in the shape _renderAgenda expects. */
function ev({ summary = 'Event', start, end, allDay = false, location, url } = {}) {
  return { summary, start, end: end || start, allDay, location, url };
}

// ── registration & static config ─────────────────────────────────────────────

describe('registration', () => {
  test('the element is defined under <sol-calendar>', () => {
    expect(customElements.get('sol-calendar')).toBe(SolCalendar);
  });

  test('observedAttributes lists the documented attributes', () => {
    expect(SolCalendar.observedAttributes).toEqual([
      'source', 'provider', 'calendar-id', 'view',
      'start', 'window-days', 'max-events', 'proxy',
      'time-zone', 'locale', 'hide-header',
    ]);
  });

  test('shape points at the calendar-settings SHACL file', () => {
    expect(SolCalendar.shape).toMatch(/shapes\/calendar-settings\.shacl$/);
  });
});

// ── buildProviderUrl (the only exported pure helper) ─────────────────────────

describe('buildProviderUrl', () => {
  test('composes a public Google ICS URL from a calendar id', () => {
    expect(buildProviderUrl('google', 'alice@example.org')).toBe(
      'https://calendar.google.com/calendar/ical/' +
      'alice%40example.org/public/basic.ics',
    );
  });

  test('is case-insensitive on the provider name', () => {
    expect(buildProviderUrl('GOOGLE', 'a@b.org'))
      .toBe(buildProviderUrl('google', 'a@b.org'));
  });

  test('returns null for non-composing providers (caller has the URL)', () => {
    expect(buildProviderUrl('apple', 'x')).toBeNull();
    expect(buildProviderUrl('ics', 'x')).toBeNull();
  });

  test('returns null when no calendar id is supplied', () => {
    expect(buildProviderUrl('google', '')).toBeNull();
  });
});

// ── attribute readers ────────────────────────────────────────────────────────

describe('attribute readers', () => {
  test('provider defaults to "ics" and lower-cases', async () => {
    const a = await mount('source="x.ics"');
    expect(a.provider).toBe('ics');
    const b = await mount('source="x.ics" provider="Google"');
    expect(b.provider).toBe('google');
  });

  test('view defaults to "agenda" and lower-cases', async () => {
    expect((await mount('source="x.ics"')).view).toBe('agenda');
    expect((await mount('source="x.ics" view="AGENDA"')).view).toBe('agenda');
  });

  test('window-days / max-events parse, clamp to >= 1, and default', async () => {
    const def = await mount('source="x.ics"');
    expect(def.windowDays).toBe(30);
    expect(def.maxEvents).toBe(100);

    const set = await mount('source="x.ics" window-days="7" max-events="5"');
    expect(set.windowDays).toBe(7);
    expect(set.maxEvents).toBe(5);

    // 0 / negative / non-numeric all floor to the minimum of 1 (or default).
    const clamp = await mount('source="x.ics" window-days="0" max-events="-3"');
    expect(clamp.windowDays).toBe(30); // 0 || 30 → 30, then max(1, …)
    expect(clamp.maxEvents).toBe(1);   // max(1, -3) → 1
  });
});

// ── startDate getter (the one date-math seam, fixed via attribute) ───────────

describe('startDate', () => {
  test('parses a YYYY-MM-DD attribute to LOCAL midnight (not UTC)', async () => {
    const el = await mount('source="x.ics" start="2025-05-01"');
    const d = el.startDate;
    // Asserted by numeric Y/M/D + zeroed clock — locale-independent and
    // immune to the UTC-vs-local-midnight bug the getter guards against.
    expect(d.getFullYear()).toBe(2025);
    expect(d.getMonth()).toBe(4);      // 0-based → May
    expect(d.getDate()).toBe(1);
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
    expect(d.getSeconds()).toBe(0);
  });

  test('with no start= attribute returns local midnight of *some* day', async () => {
    const el = await mount('source="x.ics"');
    const d = el.startDate;
    expect(d instanceof Date).toBe(true);
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
  });
});

// ── _update guard: no source ─────────────────────────────────────────────────

describe('_update with no source', () => {
  test('shows the "No calendar source" error in the status region', async () => {
    const el = await mount('');
    const status = el.shadowRoot.querySelector('.sol-calendar-status');
    expect(status.getAttribute('role')).toBe('status');
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(status.hasAttribute('data-error')).toBe(true);
    expect(status.textContent).toMatch(/No calendar source/);
    expect(status.style.display).toBe('');
  });
});

// ── agenda render (driven with explicit event arrays) ────────────────────────

describe('_renderAgenda', () => {
  const may1 = () => new Date(2025, 4, 1, 9, 0);
  const may1b = () => new Date(2025, 4, 1, 14, 30);
  const may2 = () => new Date(2025, 4, 2, 11, 0);

  test('renders one row per event with date / time / body columns', async () => {
    const el = await mount('source="x.ics"');
    el._renderAgenda([
      ev({ summary: 'Standup', start: may1() }),
      ev({ summary: 'Lunch', start: may1b() }),
      ev({ summary: 'Review', start: may2() }),
    ]);

    const rows = el.shadowRoot.querySelectorAll('.cal-row');
    expect(rows).toHaveLength(3);
    // each row carries the three column children
    expect(rows[0].querySelector('.cal-row-date')).not.toBeNull();
    expect(rows[0].querySelector('.cal-row-time')).not.toBeNull();
    expect(rows[0].querySelector('.cal-row-summary').textContent).toBe('Standup');
  });

  test('formats a timed event as HH:MM–HH:MM (locale-independent digits)', async () => {
    const el = await mount('source="x.ics"');
    el._renderAgenda([
      ev({ summary: 'Mtg', start: new Date(2025, 4, 1, 9, 5),
           end: new Date(2025, 4, 1, 10, 15) }),
    ]);
    expect(el.shadowRoot.querySelector('.cal-row-time').textContent)
      .toBe('09:05–10:15');
  });

  test('an all-day event reads "All day"', async () => {
    const el = await mount('source="x.ics"');
    el._renderAgenda([ev({ summary: 'Holiday', start: may1(), allDay: true })]);
    expect(el.shadowRoot.querySelector('.cal-row-time').textContent).toBe('All day');
  });

  test('a zero-duration event shows just the start time (no en-dash)', async () => {
    const el = await mount('source="x.ics"');
    const t = new Date(2025, 4, 1, 14, 0);
    el._renderAgenda([ev({ summary: 'Ping', start: t, end: t })]);
    expect(el.shadowRoot.querySelector('.cal-row-time').textContent).toBe('14:00');
  });

  test('blanks the date column on consecutive same-day rows (repeat class)', async () => {
    const el = await mount('source="x.ics"');
    el._renderAgenda([
      ev({ summary: 'A', start: may1() }),     // first May 1 → no repeat
      ev({ summary: 'B', start: may1b() }),    // second May 1 → repeat
      ev({ summary: 'C', start: may2() }),     // May 2 → fresh date, no repeat
    ]);
    const dates = [...el.shadowRoot.querySelectorAll('.cal-row-date')];
    expect(dates[0].classList.contains('repeat')).toBe(false);
    expect(dates[1].classList.contains('repeat')).toBe(true);
    expect(dates[2].classList.contains('repeat')).toBe(false);
  });

  test('marks a row whose start is today with the .today class', async () => {
    const el = await mount('source="x.ics"');
    const todayNoon = new Date();
    todayNoon.setHours(12, 0, 0, 0);
    el._renderAgenda([
      ev({ summary: 'Now', start: todayNoon }),
      ev({ summary: 'Future', start: new Date(2099, 0, 1, 9, 0) }),
    ]);
    const rows = el.shadowRoot.querySelectorAll('.cal-row');
    expect(rows[0].classList.contains('today')).toBe(true);
    expect(rows[1].classList.contains('today')).toBe(false);
  });

  test('renders the summary as a target=_blank link when the event has a URL', async () => {
    const el = await mount('source="x.ics"');
    el._renderAgenda([
      ev({ summary: 'Call', start: may1(), url: 'https://meet.example/abc' }),
    ]);
    const a = el.shadowRoot.querySelector('.cal-row-summary a');
    expect(a).not.toBeNull();
    expect(a.getAttribute('href')).toBe('https://meet.example/abc');
    expect(a.getAttribute('target')).toBe('_blank');
    expect(a.getAttribute('rel')).toBe('noopener noreferrer');
    expect(a.textContent).toBe('Call');
  });

  test('falls back to "(untitled)" for an event with no summary', async () => {
    const el = await mount('source="x.ics"');
    el._renderAgenda([ev({ summary: '', start: may1() })]);
    expect(el.shadowRoot.querySelector('.cal-row-summary').textContent)
      .toBe('(untitled)');
  });

  test('renders a location row when the event carries a location', async () => {
    const el = await mount('source="x.ics"');
    el._renderAgenda([ev({ summary: 'Talk', start: may1(), location: 'Room 5' })]);
    expect(el.shadowRoot.querySelector('.cal-row-location').textContent).toBe('Room 5');

    // …and none when it doesn't.
    el._renderAgenda([ev({ summary: 'NoLoc', start: may1() })]);
    expect(el.shadowRoot.querySelector('.cal-row-location')).toBeNull();
  });

  test('shows the empty-state message (with window-days) when there are no events', async () => {
    const el = await mount('source="x.ics" window-days="14"');
    el._renderAgenda([]);
    const empty = el.shadowRoot.querySelector('.sol-calendar-empty');
    expect(empty).not.toBeNull();
    expect(empty.textContent).toBe('No events in the next 14 days.');
    // the agenda container still carries its ARIA label
    expect(el.shadowRoot.querySelector('.cal-agenda').getAttribute('aria-label'))
      .toBe('Upcoming events');
  });
});

// ── header strip vs hide-header ──────────────────────────────────────────────

describe('hide-header', () => {
  test('renders a .cal-header (title + provider) by default', async () => {
    const el = await mount('source="x.ics" provider="apple"');
    el._renderAgenda([ev({ summary: 'A', start: new Date(2025, 4, 1, 9, 0) })]);
    const header = el.shadowRoot.querySelector('.cal-header');
    expect(header).not.toBeNull();
    expect(header.querySelector('.cal-provider').textContent).toBe('apple');
    expect(header.querySelector('.cal-title')).not.toBeNull();
  });

  test('omits the header entirely when hide-header is present', async () => {
    const el = await mount('source="x.ics" hide-header');
    el._renderAgenda([ev({ summary: 'A', start: new Date(2025, 4, 1, 9, 0) })]);
    expect(el.shadowRoot.querySelector('.cal-header')).toBeNull();
    // the agenda list still renders
    expect(el.shadowRoot.querySelector('.cal-agenda')).not.toBeNull();
  });

  test('header is also omitted on the empty render path', async () => {
    const el = await mount('source="x.ics" hide-header');
    el._renderAgenda([]);
    expect(el.shadowRoot.querySelector('.cal-header')).toBeNull();
    expect(el.shadowRoot.querySelector('.sol-calendar-empty')).not.toBeNull();
  });
});

// ── full fetch → parse → render path (fixed-date ICS, no network) ────────────

describe('end-to-end render via a fixed-date ICS feed', () => {
  // A minimal RFC-5545 calendar with two timed events on 2025-05-01 and
  // one on 2025-05-02. Dates use the floating (no-TZID) form so they land
  // on the same wall-clock day regardless of the test machine's zone.
  const ICS = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//test//EN',
    'BEGIN:VEVENT',
    'UID:e1@test',
    'SUMMARY:Standup',
    'DTSTART:20250501T090000',
    'DTEND:20250501T093000',
    'END:VEVENT',
    'BEGIN:VEVENT',
    'UID:e2@test',
    'SUMMARY:Lunch',
    'LOCATION:Cafe',
    'DTSTART:20250501T120000',
    'DTEND:20250501T130000',
    'END:VEVENT',
    'BEGIN:VEVENT',
    'UID:e3@test',
    'SUMMARY:Review',
    'DTSTART:20250502T110000',
    'DTEND:20250502T120000',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  function mockIcsFetch() {
    global.fetch = () => Promise.resolve({
      ok: true, status: 200,
      text: () => Promise.resolve(ICS),
    });
  }

  test('fetches, parses, sorts by start, and renders one row per windowed event', async () => {
    mockIcsFetch();
    // Same-origin .ics is fetched directly; a fixed start + a window that
    // covers the fixture makes the set of rendered events deterministic.
    const el = await mount('source="https://localhost/cal.ics" ' +
                           'start="2025-05-01" window-days="7"');
    await settle();

    const rows = el.shadowRoot.querySelectorAll('.cal-row');
    expect(rows).toHaveLength(3);
    // sorted ascending by start: Standup (09:00) → Lunch (12:00) → Review
    const summaries = [...el.shadowRoot.querySelectorAll('.cal-row-summary')]
      .map(s => s.textContent);
    expect(summaries).toEqual(['Standup', 'Lunch', 'Review']);

    // the timed columns are locale-independent HH:MM digits
    const times = [...el.shadowRoot.querySelectorAll('.cal-row-time')]
      .map(t => t.textContent);
    expect(times).toEqual(['09:00–09:30', '12:00–13:00', '11:00–12:00']);

    // Lunch carried a LOCATION
    expect(el.shadowRoot.querySelector('.cal-row-location').textContent).toBe('Cafe');

    // status cleared once the render succeeded
    const status = el.shadowRoot.querySelector('.sol-calendar-status');
    expect(status.hasAttribute('data-error')).toBe(false);
    expect(status.style.display).toBe('none');
  });

  test('a narrow window trims events outside [start, start + days)', async () => {
    mockIcsFetch();
    // window-days="1" → [2025-05-01 00:00, 2025-05-02 00:00): drops the
    // May-2 Review, keeps the two May-1 events.
    const el = await mount('source="https://localhost/cal.ics" ' +
                           'start="2025-05-01" window-days="1"');
    await settle();
    const summaries = [...el.shadowRoot.querySelectorAll('.cal-row-summary')]
      .map(s => s.textContent);
    expect(summaries).toEqual(['Standup', 'Lunch']);
  });
});

// ── month view (view="month") ────────────────────────────────────────────────

describe('_renderMonth', () => {
  /** Mount on a fixed month so no assertion depends on today's date.
   *  July 2026 starts on a Wednesday and needs 5 weeks (35 cells). */
  const mountJuly = () => mount('source="x.ics" view="month" start="2026-07-01" locale="en-US"');

  test('view="month" dispatches to the grid, not the agenda', async () => {
    const el = await mountJuly();
    el._renderView([]);
    expect(el.shadowRoot.querySelector('.cal-month')).not.toBeNull();
    expect(el.shadowRoot.querySelector('.cal-agenda')).toBeNull();
  });

  test('the grid is whole weeks, with the month days marked in-month', async () => {
    const el = await mountJuly();
    el._renderMonth([]);
    const days = el.shadowRoot.querySelectorAll('.cal-day');
    expect(days).toHaveLength(35);                 // 5 weeks
    expect(days.length % 7).toBe(0);
    // July 2026 has 31 days; the other 4 cells pad from June/August.
    expect(el.shadowRoot.querySelectorAll('.cal-day:not(.outside)')).toHaveLength(31);
    expect(el.shadowRoot.querySelectorAll('.cal-day.outside')).toHaveLength(4);
  });

  test('a 4-week month fills exactly 28 cells with no padding', async () => {
    // February 2026 starts on a Sunday and has 28 days.
    const el = await mount('source="x.ics" view="month" start="2026-02-01" locale="en-US"');
    el._renderMonth([]);
    expect(el.shadowRoot.querySelectorAll('.cal-day')).toHaveLength(28);
    expect(el.shadowRoot.querySelectorAll('.cal-day.outside')).toHaveLength(0);
  });

  test('a leap February keeps all 29 days in-month', async () => {
    const el = await mount('source="x.ics" view="month" start="2024-02-01" locale="en-US"');
    el._renderMonth([]);
    expect(el.shadowRoot.querySelectorAll('.cal-day:not(.outside)')).toHaveLength(29);
  });

  test('seven weekday column headers, one per grid column', async () => {
    const el = await mountJuly();
    el._renderMonth([]);
    expect(el.shadowRoot.querySelectorAll('.cal-weekday')).toHaveLength(7);
  });

  test('events land in their own day cell as chips', async () => {
    const el = await mountJuly();
    el._renderMonth([
      ev({ summary: 'Standup', start: new Date(2026, 6, 2, 9, 0) }),
      ev({ summary: 'Lunch',   start: new Date(2026, 6, 2, 12, 0) }),
      ev({ summary: 'Review',  start: new Date(2026, 6, 9, 15, 0) }),
    ]);
    const cell2 = el.shadowRoot.querySelector('[data-date="2026-07-02"]');
    const cell9 = el.shadowRoot.querySelector('[data-date="2026-07-09"]');
    expect([...cell2.querySelectorAll('.cal-chip')].map(c => c.textContent))
      .toEqual(['Standup', 'Lunch']);
    expect([...cell9.querySelectorAll('.cal-chip')].map(c => c.textContent))
      .toEqual(['Review']);
    expect(cell2.classList.contains('has-events')).toBe(true);
    // a day with no events is inert
    expect(el.shadowRoot.querySelector('[data-date="2026-07-03"]')
      .classList.contains('has-events')).toBe(false);
  });

  test('clicking a day opens a popover listing that day, and toggles shut', async () => {
    const el = await mountJuly();
    el._renderMonth([
      ev({ summary: 'Standup', start: new Date(2026, 6, 2, 9, 5),
           end: new Date(2026, 6, 2, 9, 35), location: 'Cafe' }),
      ev({ summary: 'Lunch', start: new Date(2026, 6, 2, 12, 0) }),
    ]);
    const cell = el.shadowRoot.querySelector('[data-date="2026-07-02"]');

    cell.dispatchEvent(new Event('click', { bubbles: true }));
    const pop = el.shadowRoot.querySelector('.cal-day-popover');
    expect(pop).not.toBeNull();
    expect(pop.getAttribute('role')).toBe('dialog');
    expect([...pop.querySelectorAll('.cal-row-summary')].map(s => s.textContent))
      .toEqual(['Standup', 'Lunch']);
    expect(pop.querySelector('.cal-row-time').textContent).toBe('09:05–09:35');
    expect(pop.querySelector('.cal-row-location').textContent).toBe('Cafe');

    // second click on the same day closes it
    cell.dispatchEvent(new Event('click', { bubbles: true }));
    expect(el.shadowRoot.querySelector('.cal-day-popover')).toBeNull();
  });

  test('only one popover is open at a time', async () => {
    const el = await mountJuly();
    el._renderMonth([
      ev({ summary: 'A', start: new Date(2026, 6, 2, 9, 0) }),
      ev({ summary: 'B', start: new Date(2026, 6, 9, 9, 0) }),
    ]);
    el.shadowRoot.querySelector('[data-date="2026-07-02"]')
      .dispatchEvent(new Event('click', { bubbles: true }));
    el.shadowRoot.querySelector('[data-date="2026-07-09"]')
      .dispatchEvent(new Event('click', { bubbles: true }));
    const pops = el.shadowRoot.querySelectorAll('.cal-day-popover');
    expect(pops).toHaveLength(1);
    expect(pops[0].parentElement.dataset.date).toBe('2026-07-09');
  });

  test('the month anchor starts at `start` and the nav steps it', async () => {
    const el = await mountJuly();
    expect(el.monthAnchor.getFullYear()).toBe(2026);
    expect(el.monthAnchor.getMonth()).toBe(6);       // July

    el._monthAnchor = new Date(2026, 11, 1);          // December
    await el._stepMonth(1);
    expect(el.monthAnchor.getFullYear()).toBe(2027);  // rolls the year
    expect(el.monthAnchor.getMonth()).toBe(0);

    await el._stepMonth(-1);
    expect(el.monthAnchor.getFullYear()).toBe(2026);
    expect(el.monthAnchor.getMonth()).toBe(11);
  });

  test('hide-header drops the title strip and its month nav', async () => {
    const el = await mount('source="x.ics" view="month" start="2026-07-01" hide-header');
    el._renderMonth([]);
    expect(el.shadowRoot.querySelector('.cal-month-header')).toBeNull();
    expect(el.shadowRoot.querySelector('.cal-nav')).toBeNull();
    expect(el.shadowRoot.querySelector('.cal-month')).not.toBeNull();
  });

  test('the grid carries its ARIA roles', async () => {
    const el = await mountJuly();
    el._renderMonth([ev({ summary: 'A', start: new Date(2026, 6, 2, 9, 0) })]);
    expect(el.shadowRoot.querySelector('.cal-month').getAttribute('role')).toBe('grid');
    expect(el.shadowRoot.querySelectorAll('[role="row"]').length).toBe(6);   // weekday strip + 5 weeks
    expect(el.shadowRoot.querySelectorAll('[role="gridcell"]')).toHaveLength(35);
    expect(el.shadowRoot.querySelector('[data-date="2026-07-02"]')
      .getAttribute('aria-haspopup')).toBe('dialog');
  });
});
