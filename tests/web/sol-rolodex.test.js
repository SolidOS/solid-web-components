/**
 * @jest-environment jsdom
 *
 * Tests for <sol-rolodex>:
 *   - custom-element registration
 *   - shadow DOM built from child <div> cards (nav, counter, card)
 *   - the "N of M" counter and initial card content
 *   - prev/next button navigation, including wrap-around at both ends
 *   - ArrowLeft / ArrowRight keyboard navigation on the wrapper
 *   - non-<div> children are ignored
 */

window.__SolSuppressDefineWarn = true;

beforeAll(async () => {
  await import('../../web/sol-rolodex.js');
});

afterEach(() => { document.body.innerHTML = ''; });

// connectedCallback is async (awaits the view render); give microtasks a beat.
async function settle() { await new Promise(r => setTimeout(r, 20)); }

function mountRolodex(innerHTML) {
  document.body.innerHTML = `<sol-rolodex id="r">${innerHTML}</sol-rolodex>`;
  return document.getElementById('r');
}

const THREE_CARDS = `
  <div>Alpha</div>
  <div>Beta</div>
  <div>Gamma</div>`;

function counter(el) { return el.shadowRoot.querySelector('.rolodex-counter'); }
function card(el)    { return el.shadowRoot.querySelector('.rolodex-card'); }
function prevBtn(el) { return el.shadowRoot.querySelector('.rolodex-btn[aria-label="Previous record"]'); }
function nextBtn(el) { return el.shadowRoot.querySelector('.rolodex-btn[aria-label="Next record"]'); }
function wrapper(el) { return el.shadowRoot.querySelector('.sol-view-rolodex'); }

function arrow(el, key) {
  wrapper(el).dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

// ── registration ────────────────────────────────────────────────────────────

describe('sol-rolodex — registration', () => {
  test('is registered as a custom element', () => {
    expect(customElements.get('sol-rolodex')).toBeTruthy();
  });

  test('attaches an open shadow root', async () => {
    const el = mountRolodex(THREE_CARDS);
    await settle();
    expect(el.shadowRoot).toBeTruthy();
  });
});

// ── shadow DOM structure ─────────────────────────────────────────────────────

describe('sol-rolodex — rendered shadow DOM', () => {
  test('builds nav, counter, card and prev/next buttons', async () => {
    const el = mountRolodex(THREE_CARDS);
    await settle();
    expect(wrapper(el)).toBeTruthy();
    expect(counter(el)).toBeTruthy();
    expect(card(el)).toBeTruthy();
    expect(prevBtn(el)).toBeTruthy();
    expect(nextBtn(el)).toBeTruthy();
  });

  test('shows the first card and an "N of M" counter on mount', async () => {
    const el = mountRolodex(THREE_CARDS);
    await settle();
    expect(counter(el).textContent).toBe('1 of 3');
    expect(card(el).textContent).toContain('Alpha');
  });

  test('renders cloned child markup into the card (not the live nodes)', async () => {
    const el = mountRolodex('<div><b>Bold</b> one</div><div>two</div>');
    await settle();
    expect(card(el).querySelector('b')).toBeTruthy();
    expect(card(el).textContent).toContain('Bold one');
  });
});

// ── button navigation ────────────────────────────────────────────────────────

describe('sol-rolodex — prev/next navigation', () => {
  test('next button advances to the following card', async () => {
    const el = mountRolodex(THREE_CARDS);
    await settle();
    nextBtn(el).click();
    expect(counter(el).textContent).toBe('2 of 3');
    expect(card(el).textContent).toContain('Beta');

    nextBtn(el).click();
    expect(counter(el).textContent).toBe('3 of 3');
    expect(card(el).textContent).toContain('Gamma');
  });

  test('next wraps from the last card back to the first', async () => {
    const el = mountRolodex(THREE_CARDS);
    await settle();
    nextBtn(el).click(); // 2
    nextBtn(el).click(); // 3
    nextBtn(el).click(); // wrap -> 1
    expect(counter(el).textContent).toBe('1 of 3');
    expect(card(el).textContent).toContain('Alpha');
  });

  test('prev wraps from the first card to the last', async () => {
    const el = mountRolodex(THREE_CARDS);
    await settle();
    prevBtn(el).click(); // wrap -> 3
    expect(counter(el).textContent).toBe('3 of 3');
    expect(card(el).textContent).toContain('Gamma');
  });
});

// ── keyboard navigation ──────────────────────────────────────────────────────

describe('sol-rolodex — keyboard navigation', () => {
  test('ArrowRight advances and ArrowLeft goes back', async () => {
    const el = mountRolodex(THREE_CARDS);
    await settle();

    arrow(el, 'ArrowRight');
    expect(counter(el).textContent).toBe('2 of 3');
    expect(card(el).textContent).toContain('Beta');

    arrow(el, 'ArrowLeft');
    expect(counter(el).textContent).toBe('1 of 3');
    expect(card(el).textContent).toContain('Alpha');
  });

  test('an unrelated key does not change the current card', async () => {
    const el = mountRolodex(THREE_CARDS);
    await settle();
    arrow(el, 'Enter');
    expect(counter(el).textContent).toBe('1 of 3');
  });
});

// ── child filtering ──────────────────────────────────────────────────────────

describe('sol-rolodex — child handling', () => {
  test('ignores non-<div> children when counting cards', async () => {
    const el = mountRolodex(`
      <span>not a card</span>
      <div>Only card</div>
      <p>also ignored</p>`);
    await settle();
    expect(counter(el).textContent).toBe('1 of 1');
    expect(card(el).textContent).toContain('Only card');
  });

  test('a single card has prev/next wrap back onto itself', async () => {
    const el = mountRolodex('<div>Solo</div>');
    await settle();
    nextBtn(el).click();
    expect(counter(el).textContent).toBe('1 of 1');
    expect(card(el).textContent).toContain('Solo');
  });
});
