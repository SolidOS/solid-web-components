/**
 * @jest-environment jsdom
 *
 * Tests for <sol-settings-nav>:
 *   - custom-element registration
 *   - one chip per sibling section with a direct heading, labelled by it
 *   - exactly one section visible: hidden attribute AND inline display:none
 *     (an app's `section { display:block }` beats [hidden] — the inline
 *     style is the guarantee)
 *   - clicking a chip switches the visible section; aria-selected +
 *     roving tabindex follow
 *   - ArrowRight/ArrowLeft move the selection
 *   - sections without a direct heading are not managed
 *   - nested sections belong to their parent's panel, no chip
 *   - a section added later (MutationObserver) gets a chip
 *   - ARIA wiring: tablist / tab / tabpanel / aria-controls
 */

import '../../web/sol-settings-nav.js';

window.__SolSuppressDefineWarn = true;

afterEach(() => { document.body.innerHTML = ''; });

// Mount a settings layout: the nav followed by sections, inside a wrapper.
function mount(sectionsHtml) {
  const wrap = document.createElement('div');
  wrap.innerHTML = `<sol-settings-nav></sol-settings-nav>${sectionsHtml}`;
  document.body.appendChild(wrap);
  return wrap;
}

const THREE_GROUPS = `
  <section><h3>General</h3><p>g-form</p></section>
  <section><h3>Accounts</h3><p>a-form</p></section>
  <section><h3>Advanced</h3><p>x-form</p></section>`;

const chips = (wrap) => [...wrap.querySelectorAll('.sol-settings-nav-chip')];
const sections = (wrap) => [...wrap.querySelectorAll('section')];
const visibleTitles = (wrap) =>
  sections(wrap).filter((s) => !s.hidden && s.style.display !== 'none')
    .map((s) => s.querySelector('h3')?.textContent);

// Flush the MutationObserver → requestAnimationFrame → _sync chain.
const flush = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

test('registers the custom element', () => {
  expect(customElements.get('sol-settings-nav')).toBeDefined();
});

test('one chip per headed section, labelled by its heading', () => {
  const wrap = mount(THREE_GROUPS);
  expect(chips(wrap).map((c) => c.textContent)).toEqual(['General', 'Accounts', 'Advanced']);
});

test('exactly one section visible — hidden attribute AND inline display', () => {
  const wrap = mount(THREE_GROUPS);
  expect(visibleTitles(wrap)).toEqual(['General']);
  const others = sections(wrap).slice(1);
  for (const s of others) {
    expect(s.hidden).toBe(true);
    expect(s.style.display).toBe('none');
  }
});

test('clicking a chip switches sections and moves aria-selected + tabindex', () => {
  const wrap = mount(THREE_GROUPS);
  chips(wrap)[1].click();
  expect(visibleTitles(wrap)).toEqual(['Accounts']);
  expect(chips(wrap).map((c) => c.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false']);
  expect(chips(wrap).map((c) => c.tabIndex)).toEqual([-1, 0, -1]);
});

test('ArrowRight / ArrowLeft move the selection (wrapping)', () => {
  const wrap = mount(THREE_GROUPS);
  const nav = wrap.querySelector('sol-settings-nav');
  const press = (key) => nav.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  press('ArrowRight');
  expect(visibleTitles(wrap)).toEqual(['Accounts']);
  press('ArrowLeft');
  press('ArrowLeft');   // wraps from first to last
  expect(visibleTitles(wrap)).toEqual(['Advanced']);
});

test('a section without a direct heading is not managed', () => {
  const wrap = mount(`${THREE_GROUPS}<section><p>error text, no heading</p></section>`);
  expect(chips(wrap)).toHaveLength(3);
  const bare = sections(wrap)[3];
  expect(bare.hidden).toBe(false);   // untouched — still paints
});

test('a nested section belongs to its parent panel — no chip of its own', () => {
  const wrap = mount(`
    <section><h3>Outer</h3><section><h3>Inner</h3></section></section>
    <section><h3>Second</h3></section>`);
  expect(chips(wrap).map((c) => c.textContent)).toEqual(['Outer', 'Second']);
});

test('a section added later gets a chip (MutationObserver)', async () => {
  const wrap = mount(THREE_GROUPS);
  const late = document.createElement('section');
  late.innerHTML = '<h3>Plugin X</h3><p>late form</p>';
  wrap.appendChild(late);
  await flush();
  expect(chips(wrap).map((c) => c.textContent)).toContain('Plugin X');
  expect(late.hidden).toBe(true);            // arrives unselected
  expect(visibleTitles(wrap)).toEqual(['General']);   // selection kept
});

test('until a user pick, the default tracks the FIRST section', async () => {
  const wrap = mount(THREE_GROUPS);
  const first = document.createElement('section');
  first.innerHTML = '<h3>Zeroth</h3>';
  wrap.insertBefore(first, wrap.querySelector('section'));
  await flush();
  // No user pick yet — the default follows the new first group.
  expect(visibleTitles(wrap)).toEqual(['Zeroth']);
});

test('a user pick sticks across late additions and prepends', async () => {
  const wrap = mount(THREE_GROUPS);
  chips(wrap)[1].click();   // pick Accounts
  const first = document.createElement('section');
  first.innerHTML = '<h3>Zeroth</h3>';
  wrap.insertBefore(first, wrap.querySelector('section'));
  await flush();
  expect(visibleTitles(wrap)).toEqual(['Accounts']);
  // …and falls back to the first when the picked section leaves the DOM.
  sections(wrap).find((s) => s.querySelector('h3')?.textContent === 'Accounts').remove();
  await flush();
  expect(visibleTitles(wrap)).toEqual(['Zeroth']);
});

test('panel ids stay unique when sections arrive across syncs', async () => {
  const wrap = mount(THREE_GROUPS);
  for (const name of ['Late A', 'Late B']) {
    const s = document.createElement('section');
    s.innerHTML = `<h3>${name}</h3>`;
    wrap.appendChild(s);
    await flush();
  }
  const ids = sections(wrap).map((s) => s.id);
  expect(new Set(ids).size).toBe(ids.length);
});

test('ARIA wiring: tablist, tabs, tabpanels, aria-controls', () => {
  const wrap = mount(THREE_GROUPS);
  const nav = wrap.querySelector('sol-settings-nav');
  expect(nav.getAttribute('role')).toBe('tablist');
  for (const chip of chips(wrap)) {
    expect(chip.getAttribute('role')).toBe('tab');
    const panel = document.getElementById(chip.getAttribute('aria-controls'));
    expect(panel).not.toBeNull();
    expect(panel.getAttribute('role')).toBe('tabpanel');
  }
});
