/**
 * @jest-environment jsdom
 *
 * Tests for <sol-window>:
 *   - custom-element registration
 *   - lazy render on connect: titlebar / title / close button / body
 *   - title attribute (initial render + attributeChangedCallback)
 *   - body property exposes the content container
 *   - close() fires bubbling/composed sol-close and removes the element
 *   - close button click dismisses the window
 *   - stacking z-index assigned on connect and raised on pointerdown
 */

import { SolWindow } from '../../web/sol-window.js';

window.__SolSuppressDefineWarn = true;

afterEach(() => { document.body.innerHTML = ''; });

function makeWindow(attrs = {}) {
  const w = document.createElement('sol-window');
  for (const [k, v] of Object.entries(attrs)) w.setAttribute(k, v);
  document.body.appendChild(w);
  return w;
}

// ── registration ────────────────────────────────────────────────────────────

describe('SolWindow — registration', () => {
  test('the sol-window tag resolves to the SolWindow class', () => {
    expect(customElements.get('sol-window')).toBe(SolWindow);
  });

  test('observes only the title attribute', () => {
    expect(SolWindow.observedAttributes).toEqual(['title']);
  });
});

// ── rendered shadow DOM ───────────────────────────────────────────────────────

describe('SolWindow — render on connect', () => {
  test('renders titlebar, close button and body into the shadow root', () => {
    const w = makeWindow();
    expect(w.shadowRoot.querySelector('.titlebar')).toBeTruthy();
    expect(w.shadowRoot.querySelector('.close')).toBeTruthy();
    expect(w.shadowRoot.querySelector('.body')).toBeTruthy();
  });

  test('exposes the titlebar and body via shadow parts', () => {
    const w = makeWindow();
    expect(w.shadowRoot.querySelector('[part="titlebar"]')).toBeTruthy();
    expect(w.shadowRoot.querySelector('[part="body"]')).toBeTruthy();
    expect(w.shadowRoot.querySelector('[part="close"]')).toBeTruthy();
  });

  test('the close button carries an accessible label', () => {
    const w = makeWindow();
    expect(w.shadowRoot.querySelector('.close').getAttribute('aria-label')).toBe('Close');
  });

  test('renders only once even if reconnected', () => {
    const w = makeWindow();
    const firstBody = w.body;
    w.remove();
    document.body.appendChild(w);   // reconnect — should not re-render
    expect(w.body).toBe(firstBody);
  });
});

// ── title attribute ───────────────────────────────────────────────────────────

describe('SolWindow — title', () => {
  test('renders the initial title attribute into the title span', () => {
    const w = makeWindow({ title: 'Notes' });
    expect(w.shadowRoot.querySelector('.title').textContent).toBe('Notes');
  });

  test('renders an empty title span when no title is set', () => {
    const w = makeWindow();
    expect(w.shadowRoot.querySelector('.title').textContent).toBe('');
  });

  test('attributeChangedCallback updates the rendered title', () => {
    const w = makeWindow({ title: 'Old' });
    w.setAttribute('title', 'Renamed');
    expect(w.shadowRoot.querySelector('.title').textContent).toBe('Renamed');
  });

  test('clearing the title renders an empty string', () => {
    const w = makeWindow({ title: 'Something' });
    w.removeAttribute('title');
    expect(w.shadowRoot.querySelector('.title').textContent).toBe('');
  });
});

// ── body property ─────────────────────────────────────────────────────────────

describe('SolWindow — body container', () => {
  test('the body property is the .body content container', () => {
    const w = makeWindow();
    expect(w.body).toBe(w.shadowRoot.querySelector('.body'));
  });

  test('callers can mount content into body', () => {
    const w = makeWindow();
    const child = document.createElement('p');
    child.textContent = 'mounted';
    w.body.appendChild(child);
    expect(w.body.textContent).toBe('mounted');
  });
});

// ── close / dismissal ─────────────────────────────────────────────────────────

describe('SolWindow — close', () => {
  test('close() removes the window from the document', () => {
    const w = makeWindow();
    expect(w.parentNode).toBe(document.body);
    w.close();
    expect(w.parentNode).toBe(null);
  });

  test('close() fires a bubbling, composed sol-close event', () => {
    const w = makeWindow();
    let detail = null;
    document.body.addEventListener('sol-close', (e) => {
      detail = { bubbles: e.bubbles, composed: e.composed };
    });
    w.close();
    expect(detail).toEqual({ bubbles: true, composed: true });
  });

  test('clicking the close button dismisses the window', () => {
    const w = makeWindow();
    let closed = false;
    w.addEventListener('sol-close', () => { closed = true; });
    w.shadowRoot.querySelector('.close').click();
    expect(closed).toBe(true);
    expect(w.parentNode).toBe(null);
  });
});

// ── stacking ──────────────────────────────────────────────────────────────────

describe('SolWindow — stacking order', () => {
  test('assigns an explicit z-index on connect', () => {
    const w = makeWindow();
    expect(Number(w.style.zIndex)).toBeGreaterThan(0);
  });

  test('a window opened later sits above an earlier one', () => {
    const first = makeWindow();
    const second = makeWindow();
    expect(Number(second.style.zIndex)).toBeGreaterThan(Number(first.style.zIndex));
  });

  test('pointerdown raises the window to the front', () => {
    const first = makeWindow();
    const second = makeWindow();
    const before = Number(first.style.zIndex);
    first.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(Number(first.style.zIndex)).toBeGreaterThan(before);
    expect(Number(first.style.zIndex)).toBeGreaterThan(Number(second.style.zIndex));
  });
});
