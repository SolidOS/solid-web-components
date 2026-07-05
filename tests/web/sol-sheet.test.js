/**
 * @jest-environment jsdom
 *
 * Tests for <sol-sheet> — the bottom-sheet surface (edge-anchored sibling of
 * sol-modal / sol-window / sol-dropdown). Pointer-agnostic; callers gate when
 * to use it. Covered here:
 *   - registration + shadow render (scrim / panel / body parts, `body` getter)
 *   - show()/hide() reflect the `open` attribute + fire sol-ready / sol-close
 *   - scrim click and Escape dismiss
 *   - back-gesture contract: show() pushes one history entry; popstate closes;
 *     a programmatic hide() consumes the entry (history.back called)
 *   - focus restore on close
 *   - label → aria-label on the dialog panel
 */

import { jest } from '@jest/globals';
import { SolSheet } from '../../web/sol-sheet.js';

window.__SolSuppressDefineWarn = true;

function press(key) {
  document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

function makeSheet(attrs = {}) {
  const s = document.createElement('sol-sheet');
  for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
  document.body.appendChild(s);
  return s;
}

afterEach(() => { document.body.innerHTML = ''; jest.restoreAllMocks(); });

test('registers and renders scrim/panel/body; body getter targets the slot host', () => {
  expect(customElements.get('sol-sheet')).toBe(SolSheet);
  const s = makeSheet();
  expect(s.shadowRoot.querySelector('.scrim')).toBeTruthy();
  const panel = s.shadowRoot.querySelector('.panel');
  expect(panel.getAttribute('role')).toBe('dialog');
  expect(panel.getAttribute('aria-modal')).toBe('true');
  expect(s.body.classList.contains('body')).toBe(true);
  expect(s.body.querySelector('slot')).toBeTruthy();
});

test('label attribute becomes the dialog aria-label', () => {
  const s = makeSheet({ label: 'Browse the library' });
  expect(s.shadowRoot.querySelector('.panel').getAttribute('aria-label'))
    .toBe('Browse the library');
});

test('show()/hide() reflect [open] and fire sol-ready / sol-close', () => {
  const s = makeSheet();
  const events = [];
  s.addEventListener('sol-ready', () => events.push('ready'));
  s.addEventListener('sol-close', () => events.push('close'));
  s.show();
  expect(s.hasAttribute('open')).toBe(true);
  s.hide();
  expect(s.hasAttribute('open')).toBe(false);
  expect(events).toEqual(['ready', 'close']);
});

test('scrim click closes; Escape closes', () => {
  const s = makeSheet();
  s.show();
  s.shadowRoot.querySelector('.scrim').dispatchEvent(new MouseEvent('click'));
  expect(s.hasAttribute('open')).toBe(false);
  s.show();
  press('Escape');
  expect(s.hasAttribute('open')).toBe(false);
});

test('back gesture: show() pushes history; popstate closes without history.back', () => {
  const s = makeSheet();
  const pushed = jest.spyOn(history, 'pushState').mockImplementation(() => {});
  const backed = jest.spyOn(history, 'back').mockImplementation(() => {});
  s.show();
  expect(pushed).toHaveBeenCalledTimes(1);
  window.dispatchEvent(new PopStateEvent('popstate'));
  expect(s.hasAttribute('open')).toBe(false);
  expect(backed).not.toHaveBeenCalled();   // the pop itself consumed the entry
});

test('programmatic hide() consumes the pushed history entry', () => {
  const s = makeSheet();
  jest.spyOn(history, 'pushState').mockImplementation(() => {});
  const backed = jest.spyOn(history, 'back').mockImplementation(() => {});
  s.show();
  s.hide();
  expect(backed).toHaveBeenCalledTimes(1);
});

test('focus returns to the opener on close', () => {
  const opener = document.createElement('button');
  document.body.appendChild(opener);
  opener.focus();
  const s = makeSheet();
  const inner = document.createElement('button');
  inner.textContent = 'inside';
  s.appendChild(inner);
  s.show();
  s.hide();
  expect(document.activeElement).toBe(opener);
});

test('double show()/hide() are idempotent', () => {
  const s = makeSheet();
  jest.spyOn(history, 'pushState').mockImplementation(() => {});
  jest.spyOn(history, 'back').mockImplementation(() => {});
  s.show(); s.show();
  expect(s.hasAttribute('open')).toBe(true);
  s.hide(); s.hide();
  expect(s.hasAttribute('open')).toBe(false);
  expect(history.back).toHaveBeenCalledTimes(1);
});

test('closed sheet is inert: scrim/panel carry pointer-events:none until [open]', () => {
  // jsdom has no layout/hit-testing, so guard the CSS contract itself: the
  // full-viewport scrim MUST be pointer-events:none while closed (it once
  // swallowed every tap in the app) and interactive only under [open].
  const s = makeSheet();
  const css = s.shadowRoot.querySelector('style').textContent;
  const scrimBlock = css.match(/\.scrim\s*{[^}]*}/)[0];
  const panelBlock = css.match(/\.panel\s*{[^}]*}/)[0];
  expect(scrimBlock).toMatch(/pointer-events:\s*none/);
  expect(panelBlock).toMatch(/pointer-events:\s*none/);
  const openScrim = css.match(/:host\(\[open\]\)\s*\.scrim\s*{[^}]*}/)[0];
  expect(openScrim).toMatch(/pointer-events:\s*auto/);
});
