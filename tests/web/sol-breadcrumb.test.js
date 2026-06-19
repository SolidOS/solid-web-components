/**
 * @jest-environment jsdom
 *
 * Tests for <sol-breadcrumb>:
 *   - custom-element registration
 *   - building crumb segments from declarative <span data-key> children
 *   - rendered links (buttons) for earlier segments vs. a non-clickable current
 *   - separators between segments
 *   - ARIA (aria-current on the last, aria-hidden on separators)
 *   - sol-breadcrumb-navigate event detail on click (key/index/label)
 *
 * Note: the live MutationObserver re-render (push/pop a <span data-key>)
 * is not exercised here. The component's _render() mutates its own
 * children, which re-fires its own childList observer; in jsdom under
 * Jest that self-feeding loop never settles (it livelocks rather than
 * throttling like a real browser), so it can't be tested deterministically.
 */

window.__SolSuppressDefineWarn = true;

beforeAll(async () => {
  await import('../../web/sol-breadcrumb.js');
});

afterEach(() => { document.body.innerHTML = ''; });

function mount(segments = [['root', 'Main Menu'], ['notes', 'Notes'], ['daily', 'Daily']]) {
  const spans = segments
    .map(([key, label]) => `<span data-key="${key}">${label}</span>`)
    .join('');
  document.body.innerHTML = `<sol-breadcrumb id="bc">${spans}</sol-breadcrumb>`;
  return document.getElementById('bc');
}

// The rendered chrome buttons/current, in document order.
function crumbs(el) {
  return Array.from(el.children).filter(c => !c.hasAttribute('data-key'));
}

// ── registration ────────────────────────────────────────────────────────────

describe('sol-breadcrumb — registration', () => {
  test('registers the custom element', () => {
    expect(customElements.get('sol-breadcrumb')).toBeTruthy();
  });
});

// ── building segments ─────────────────────────────────────────────────────────

describe('sol-breadcrumb — building segments', () => {
  test('renders one crumb plus one separator per non-last segment', () => {
    const el = mount();
    const rendered = crumbs(el);
    // 3 segments → 3 crumbs + 2 separators interleaved.
    const segs = rendered.filter(c => !c.classList.contains('sol-breadcrumb-sep'));
    const seps = rendered.filter(c => c.classList.contains('sol-breadcrumb-sep'));
    expect(segs).toHaveLength(3);
    expect(seps).toHaveLength(2);
  });

  test('earlier segments are clickable buttons, the last is a non-clickable current', () => {
    const el = mount();
    const segs = crumbs(el).filter(c => !c.classList.contains('sol-breadcrumb-sep'));

    // root + notes → buttons
    expect(segs[0].tagName).toBe('BUTTON');
    expect(segs[0].type).toBe('button');
    expect(segs[0].className).toBe('sol-breadcrumb-segment');
    expect(segs[1].tagName).toBe('BUTTON');

    // daily → current span
    expect(segs[2].tagName).toBe('SPAN');
    expect(segs[2].className).toBe('sol-breadcrumb-current');
  });

  test('crumb labels come from the source span text (trimmed)', () => {
    document.body.innerHTML =
      `<sol-breadcrumb id="bc"><span data-key="a">  Padded  </span>` +
      `<span data-key="b">Last</span></sol-breadcrumb>`;
    const el = document.getElementById('bc');
    const segs = crumbs(el).filter(c => !c.classList.contains('sol-breadcrumb-sep'));
    expect(segs[0].textContent).toBe('Padded');
    expect(segs[1].textContent).toBe('Last');
  });

  test('a single segment renders a current crumb with no separator', () => {
    const el = mount([['only', 'Home']]);
    const rendered = crumbs(el);
    expect(rendered).toHaveLength(1);
    expect(rendered[0].className).toBe('sol-breadcrumb-current');
    expect(rendered[0].textContent).toBe('Home');
  });

  test('an empty breadcrumb renders no chrome', () => {
    document.body.innerHTML = `<sol-breadcrumb id="bc"></sol-breadcrumb>`;
    const el = document.getElementById('bc');
    expect(crumbs(el)).toHaveLength(0);
  });

  test('source data-key spans are kept (hidden via CSS), not consumed', () => {
    const el = mount();
    expect(el.querySelectorAll(':scope > [data-key]')).toHaveLength(3);
  });
});

// ── separators ────────────────────────────────────────────────────────────────

describe('sol-breadcrumb — separators', () => {
  test('separators sit between crumbs and carry the › glyph', () => {
    const el = mount();
    const seps = crumbs(el).filter(c => c.classList.contains('sol-breadcrumb-sep'));
    expect(seps).toHaveLength(2);
    for (const sep of seps) expect(sep.textContent).toBe('›');
  });
});

// ── ARIA ──────────────────────────────────────────────────────────────────────

describe('sol-breadcrumb — ARIA', () => {
  test('the current (last) crumb carries aria-current="page"', () => {
    const el = mount();
    const current = el.querySelector('.sol-breadcrumb-current');
    expect(current.getAttribute('aria-current')).toBe('page');
  });

  test('only the last crumb is marked aria-current', () => {
    const el = mount();
    expect(el.querySelectorAll('[aria-current]')).toHaveLength(1);
  });

  test('separators are aria-hidden', () => {
    const el = mount();
    const seps = el.querySelectorAll('.sol-breadcrumb-sep');
    for (const sep of seps) expect(sep.getAttribute('aria-hidden')).toBe('true');
  });
});

// ── navigate events ───────────────────────────────────────────────────────────

describe('sol-breadcrumb — sol-breadcrumb-navigate', () => {
  test('clicking an earlier crumb emits navigate with key/index/label', () => {
    const el = mount();
    let detail = null;
    el.addEventListener('sol-breadcrumb-navigate', (e) => { detail = e.detail; });

    const first = crumbs(el).find(c => c.tagName === 'BUTTON');
    first.click();

    expect(detail).toEqual({ key: 'root', index: 0, label: 'Main Menu' });
  });

  test('the second crumb reports its own index/key/label', () => {
    const el = mount();
    let detail = null;
    el.addEventListener('sol-breadcrumb-navigate', (e) => { detail = e.detail; });

    const buttons = crumbs(el).filter(c => c.tagName === 'BUTTON');
    buttons[1].click();

    expect(detail).toEqual({ key: 'notes', index: 1, label: 'Notes' });
  });

  test('the navigate event bubbles and is composed', () => {
    const el = mount();
    let evt = null;
    document.body.addEventListener('sol-breadcrumb-navigate', (e) => { evt = e; });

    crumbs(el).find(c => c.tagName === 'BUTTON').click();

    expect(evt).toBeTruthy();
    expect(evt.bubbles).toBe(true);
    expect(evt.composed).toBe(true);
  });

  test('the current crumb is inert — clicking it emits nothing', () => {
    const el = mount();
    let fired = false;
    el.addEventListener('sol-breadcrumb-navigate', () => { fired = true; });
    el.querySelector('.sol-breadcrumb-current').click();
    expect(fired).toBe(false);
  });
});
