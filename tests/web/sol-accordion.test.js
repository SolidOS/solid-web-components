/**
 * @jest-environment jsdom
 *
 * Tests for <sol-accordion>:
 *   - custom-element registration
 *   - light-DOM render: wrapper region + <details>/<summary> per author div
 *   - first panel open by default; start-closed collapses all
 *   - exclusive grouping (shared <details name>)
 *   - summary text + collapsible body from the child divs
 *   - ARIA wiring (role, aria-expanded, tabindex, aria-labelledby)
 *   - toggle event syncs aria-expanded; Enter/Space keypress toggles
 *   - degenerate panels ("No content") and empty accordion message
 */

import '../../web/sol-accordion.js';

window.__SolSuppressDefineWarn = true;

afterEach(() => { document.body.innerHTML = ''; });

// ── helpers ──────────────────────────────────────────────────────────────────

// Mount markup, append to the document so connectedCallback runs, return the el.
function mount(inner) {
  const el = document.createElement('sol-accordion');
  el.innerHTML = inner;
  document.body.appendChild(el);
  return el;
}

const TWO_PANELS = `
  <div><div>First</div><div>Body one</div></div>
  <div><div>Second</div><div>Body two</div></div>`;

function press(target, key) {
  target.dispatchEvent(new KeyboardEvent('keypress', { key, bubbles: true, cancelable: true }));
}

// ── registration ─────────────────────────────────────────────────────────────

describe('SolAccordion — registration', () => {
  test('is registered as <sol-accordion>', () => {
    expect(customElements.get('sol-accordion')).toBeTruthy();
  });

  test('createElement yields an HTMLElement instance of the registered class', () => {
    const Klass = customElements.get('sol-accordion');
    const el = document.createElement('sol-accordion');
    expect(el).toBeInstanceOf(Klass);
    expect(el).toBeInstanceOf(HTMLElement);
  });
});

// ── light-DOM render ─────────────────────────────────────────────────────────

describe('SolAccordion — render', () => {
  test('renders a labelled region wrapper (light DOM, no shadow root)', () => {
    const el = mount(TWO_PANELS);
    expect(el.shadowRoot).toBeNull();

    const wrapper = el.querySelector('.sol-accordion-wrapper');
    expect(wrapper).toBeTruthy();
    expect(wrapper.getAttribute('role')).toBe('region');
    expect(wrapper.getAttribute('aria-label')).toBe('Accordion');
  });

  test('wraps each author div into one <details>/<summary> pair', () => {
    const el = mount(TWO_PANELS);
    const details = el.querySelectorAll('.sol-accordion-wrapper > details');
    expect(details).toHaveLength(2);
    details.forEach(d => {
      expect(d.querySelector(':scope > summary')).toBeTruthy();
      expect(d.querySelector(':scope > .accordion-body')).toBeTruthy();
    });
  });

  test('summary text comes from the first inner div; body from the rest', () => {
    const el = mount(TWO_PANELS);
    const [d0, d1] = el.querySelectorAll('details');
    expect(d0.querySelector('summary').textContent).toBe('First');
    expect(d0.querySelector('.accordion-body').textContent).toBe('Body one');
    expect(d1.querySelector('summary').textContent).toBe('Second');
    expect(d1.querySelector('.accordion-body').textContent).toBe('Body two');
  });

  test('replaces the author light DOM (original child divs are gone)', () => {
    const el = mount(TWO_PANELS);
    // The only top-level child is the generated wrapper.
    expect(el.children).toHaveLength(1);
    expect(el.children[0].className).toBe('sol-accordion-wrapper');
  });

  test('injects the named stylesheet into the document head exactly once', () => {
    mount(TWO_PANELS);
    mount(TWO_PANELS);
    expect(document.querySelectorAll('#sol-accordion-styles')).toHaveLength(1);
  });
});

// ── open / closed initial state ──────────────────────────────────────────────

describe('SolAccordion — initial open state', () => {
  test('first panel is open by default; the rest are closed', () => {
    const el = mount(TWO_PANELS);
    const [d0, d1] = el.querySelectorAll('details');
    expect(d0.open).toBe(true);
    expect(d1.open).toBe(false);
    expect(d0.querySelector('summary').getAttribute('aria-expanded')).toBe('true');
    expect(d1.querySelector('summary').getAttribute('aria-expanded')).toBe('false');
  });

  test('start-closed leaves every panel collapsed', () => {
    const el = document.createElement('sol-accordion');
    el.setAttribute('start-closed', '');
    el.innerHTML = TWO_PANELS;
    document.body.appendChild(el);

    el.querySelectorAll('details').forEach(d => {
      expect(d.open).toBe(false);
      expect(d.querySelector('summary').getAttribute('aria-expanded')).toBe('false');
    });
  });
});

// ── exclusive grouping ───────────────────────────────────────────────────────

describe('SolAccordion — exclusive grouping', () => {
  test('all panels share one non-empty <details name> (exclusive accordion)', () => {
    const el = mount(TWO_PANELS);
    const names = [...el.querySelectorAll('details')].map(d => d.name);
    expect(names[0]).toMatch(/^sol-accordion-/);
    expect(new Set(names).size).toBe(1); // every detail in the same group
  });

  test('two accordions on a page use distinct group names', () => {
    const a = mount(TWO_PANELS);
    const b = mount(TWO_PANELS);
    expect(a.querySelector('details').name).not.toBe(b.querySelector('details').name);
  });
});

// ── ARIA wiring ──────────────────────────────────────────────────────────────

describe('SolAccordion — ARIA', () => {
  test('each summary is a focusable button labelling its body', () => {
    const el = mount(TWO_PANELS);
    el.querySelectorAll('details').forEach((d, i) => {
      const sum = d.querySelector('summary');
      expect(sum.getAttribute('role')).toBe('button');
      expect(sum.getAttribute('tabindex')).toBe('0');
      expect(sum.id).toBe(`panel-${i}-summary`);

      const body = d.querySelector('.accordion-body');
      expect(body.getAttribute('role')).toBe('region');
      expect(body.getAttribute('aria-labelledby')).toBe(`panel-${i}-summary`);
    });
  });
});

// ── interactive toggling ─────────────────────────────────────────────────────

describe('SolAccordion — toggling', () => {
  test('a toggle event syncs the summary aria-expanded to details.open', () => {
    const el = mount(TWO_PANELS);
    const d1 = el.querySelectorAll('details')[1];
    const sum1 = d1.querySelector('summary');
    expect(sum1.getAttribute('aria-expanded')).toBe('false');

    d1.open = true;
    d1.dispatchEvent(new Event('toggle'));
    expect(sum1.getAttribute('aria-expanded')).toBe('true');

    d1.open = false;
    d1.dispatchEvent(new Event('toggle'));
    expect(sum1.getAttribute('aria-expanded')).toBe('false');
  });

  test('Enter on a collapsed summary opens its panel', () => {
    const el = mount(TWO_PANELS);
    const d1 = el.querySelectorAll('details')[1];
    expect(d1.open).toBe(false);
    press(d1.querySelector('summary'), 'Enter');
    expect(d1.open).toBe(true);
  });

  test('Space on an open summary closes its panel', () => {
    const el = mount(TWO_PANELS);
    const d0 = el.querySelectorAll('details')[0];
    expect(d0.open).toBe(true);
    press(d0.querySelector('summary'), ' ');
    expect(d0.open).toBe(false);
  });

  test('keypress toggling is prevented from the default <details> behaviour', () => {
    const el = mount(TWO_PANELS);
    const sum = el.querySelectorAll('details')[1].querySelector('summary');
    const ev = new KeyboardEvent('keypress', { key: 'Enter', bubbles: true, cancelable: true });
    sum.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
  });

  test('an unrelated key does not toggle the panel', () => {
    const el = mount(TWO_PANELS);
    const d1 = el.querySelectorAll('details')[1];
    press(d1.querySelector('summary'), 'a');
    expect(d1.open).toBe(false);
  });
});

// ── degenerate panels ────────────────────────────────────────────────────────

describe('SolAccordion — degenerate input', () => {
  test('a panel with no inner divs renders a "No content" body', () => {
    const el = mount('<div>Just a header</div>');
    const det = el.querySelector('details');
    expect(det.querySelector('summary').textContent).toBe('Just a header');
    expect(det.querySelector('.accordion-body').textContent).toBe('No content');
  });

  test('a single inner div (length < 2) still falls back to "No content"', () => {
    const el = mount('<div><div>Only header</div></div>');
    const det = el.querySelector('details');
    expect(det.querySelector('.accordion-body').textContent).toBe('No content');
  });

  test('multiple content divs are concatenated into the body', () => {
    const el = mount('<div><div>Head</div><div>one</div><div>two</div></div>');
    const sections = el.querySelectorAll('.accordion-content-section');
    expect(sections).toHaveLength(2);
    expect(sections[0].textContent).toBe('one');
    expect(sections[1].textContent).toBe('two');
  });

  test('with no author divs, renders the empty-accordion message', () => {
    const el = mount('<p>not a div</p>');
    expect(el.querySelector('.sol-accordion-wrapper')).toBeNull();
    expect(el.textContent).toBe('No accordion panels found');
  });
});
