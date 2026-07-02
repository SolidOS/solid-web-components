/**
 * @jest-environment jsdom
 */

import { SolElement } from '../../core/sol-element.js';

let tag = 0;
function mount(build) {
  const name = `sol-element-test-${++tag}`;
  class El extends SolElement { connectedCallback() { build(this); } }
  customElements.define(name, El);
  const el = document.createElement(name);
  document.body.appendChild(el);
  return el;
}

afterEach(() => { document.body.innerHTML = ''; });

describe('SolElement teardown registry', () => {
  test('_on listeners are removed on disconnect', () => {
    let count = 0;
    const el = mount((self) => self._on(document, 'ping', () => { count++; }));
    document.dispatchEvent(new Event('ping'));
    expect(count).toBe(1);
    el.remove();                                    // disconnect
    document.dispatchEvent(new Event('ping'));
    expect(count).toBe(1);                           // no longer listening
  });

  test('_cleanup callbacks run once on disconnect', () => {
    let torn = 0;
    const el = mount((self) => self._cleanup(() => { torn++; }));
    expect(torn).toBe(0);
    el.remove();
    expect(torn).toBe(1);
    // A second (spurious) disconnect must not re-run cleanups.
    el.disconnectedCallback();
    expect(torn).toBe(1);
  });

  test('a subclass disconnectedCallback can super-call to get teardown', () => {
    let removed = false, extra = false;
    const name = `sol-element-test-${++tag}`;
    class El extends SolElement {
      connectedCallback() { this._cleanup(() => { removed = true; }); }
      disconnectedCallback() { super.disconnectedCallback(); extra = true; }
    }
    customElements.define(name, El);
    const el = document.createElement(name);
    document.body.appendChild(el);
    el.remove();
    expect(removed).toBe(true);   // base teardown ran via super
    expect(extra).toBe(true);     // subclass teardown ran too
  });

  test('a throwing cleanup does not block the others', () => {
    let second = false;
    const el = mount((self) => {
      self._cleanup(() => { throw new Error('boom'); });
      self._cleanup(() => { second = true; });
    });
    expect(() => el.remove()).not.toThrow();
    expect(second).toBe(true);
  });
});
