/**
 * <sol-sheet> — a bottom sheet: the edge-anchored member of the surface
 * family (sol-modal = centered, sol-window = floating, sol-dropdown =
 * anchored under a launcher). A full-width panel slides up from the bottom
 * of the viewport over a scrim; slotted light-DOM children are the content
 * (pair with <sol-accordion> for the one-open-at-a-time group idiom the
 * phone navigator uses).
 *
 * The element is pointer-agnostic — no media queries in here. Its callers
 * decide when a sheet is the right surface (dk's phone paths gate on the
 * coarse-pointer media query; desktop code simply never opens one).
 *
 *   <sol-sheet label="Browse the library">
 *     <sol-accordion start-closed> … </sol-accordion>
 *   </sol-sheet>
 *
 * Attributes: open (boolean, reflected), label (aria-label for the dialog)
 * Methods: show(), hide()
 * Events: sol-ready (on show), sol-close (on hide) — matching sol-modal
 *
 * Dismissal: scrim tap, Escape, and the BACK GESTURE — show() pushes one
 * history entry so Android's system back (a popstate in the WebView) closes
 * the sheet instead of leaving the page; hide() by any other route consumes
 * that entry again. Focus is trapped while open and restored on close.
 */
import { define } from '../core/define.js';
import { SolElement } from '../core/sol-element.js';
import { focusablesIn, deepActiveElement, trapTab } from '../core/focus-trap.js';

const CSS = `
  :host { display: contents; }
  /* CLOSED = fully inert. The scrim spans the viewport even when the sheet
     is closed, so without pointer-events:none it silently swallows every
     tap in the app (found the hard way on-device). visibility rides the
     transition so the fade-out still shows. */
  .scrim {
    position: fixed; inset: 0;
    background: rgba(0, 0, 0, 0.45);
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity 0.2s ease, visibility 0.2s;
  }
  .panel {
    position: fixed;
    left: 0; right: 0; bottom: 0;
    z-index: 1001;
    max-height: min(85vh, 44rem);
    display: flex;
    flex-direction: column;
    background: var(--menu-bg, var(--surface, #fff));
    color: var(--text, inherit);
    border: 1px solid var(--menu-popup-border, silver);
    border-bottom: none;
    border-radius: var(--radius, 6px) var(--radius, 6px) 0 0;
    box-shadow: var(--shadow-popup, 0 -8px 24px rgba(0, 0, 0, 0.28));
    padding-bottom: env(safe-area-inset-bottom, 0);
    transform: translateY(100%);
    visibility: hidden;
    pointer-events: none;
    transition: transform 0.2s ease-out, visibility 0.2s;
  }
  :host([open]) .scrim { opacity: 1; visibility: visible; pointer-events: auto; }
  :host([open]) .panel { transform: translateY(0); visibility: visible; pointer-events: auto; }
  @media (prefers-reduced-motion: reduce) {
    .scrim, .panel { transition: none; }
  }
  .grip {
    flex: 0 0 auto;
    width: 44px; height: 4px;
    margin: 8px auto 4px;
    border-radius: 2px;
    background: var(--text-muted, #999);
    opacity: 0.5;
  }
  .body {
    flex: 1 1 auto;
    min-height: 0;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    padding: var(--menu-popup-pad, 8px);
  }
`;

class SolSheet extends SolElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  // Mount target, matching the conjure() contract the other surfaces expose.
  get body() { return this.shadowRoot.querySelector('.body'); }

  connectedCallback() {
    // DOM builds once; listeners re-wire on EVERY connect — SolElement's
    // disconnect teardown removed them, and a _rendered-guarded wiring
    // would never come back on re-attach (the classic reconnect gotcha).
    if (!this._rendered) {
      this._rendered = true;
      const style = document.createElement('style');
      style.textContent = CSS;
      const scrim = document.createElement('div');
      scrim.className = 'scrim';
      scrim.setAttribute('part', 'scrim');
      const panel = document.createElement('div');
      panel.className = 'panel';
      panel.setAttribute('part', 'panel');
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-modal', 'true');
      if (this.getAttribute('label')) panel.setAttribute('aria-label', this.getAttribute('label'));
      const grip = document.createElement('div');
      grip.className = 'grip';
      grip.setAttribute('aria-hidden', 'true');
      const body = document.createElement('div');
      body.className = 'body';
      body.setAttribute('part', 'body');
      body.appendChild(document.createElement('slot'));
      panel.append(grip, body);
      this.shadowRoot.append(style, scrim, panel);
    }
    const scrim = this.shadowRoot.querySelector('.scrim');
    const panel = this.shadowRoot.querySelector('.panel');
    this._on(scrim, 'click', () => this.hide());
    this._on(document, 'keydown', (e) => {
      if (e.key === 'Escape' && this.hasAttribute('open')) { e.stopPropagation(); this.hide(); }
    });
    // Back gesture: our history entry on top → popstate means "close me".
    this._on(window, 'popstate', () => {
      if (this.hasAttribute('open')) this._hide({ fromPop: true });
    });
    // Tab stays inside the open sheet (same trap the modal uses; focusables
    // are the slotted light-DOM children). VISIBLE ones only — content may
    // hold collapsed sections (e.g. sol-tabs' accordion groups) whose rows
    // are 0-height but still match the focusable selector.
    this._on(panel, 'keydown', (e) => trapTab(e, this, () => this._visibleFocusables()));
  }

  _visibleFocusables() {
    return focusablesIn(this).filter((el) => el.offsetParent !== null);
  }

  show() {
    if (this.hasAttribute('open')) return;
    this._restoreFocus = deepActiveElement();
    this.setAttribute('open', '');
    try { history.pushState({ solSheet: true }, ''); this._pushed = true; } catch (_) { this._pushed = false; }
    const f = this._visibleFocusables()[0];
    if (f) f.focus();
    this.dispatchEvent(new CustomEvent('sol-ready', { bubbles: true, composed: true }));
  }

  hide() { this._hide({}); }

  _hide({ fromPop = false } = {}) {
    if (!this.hasAttribute('open')) return;
    this.removeAttribute('open');
    // Consume our history entry unless the back gesture already popped it.
    if (this._pushed && !fromPop) { this._pushed = false; try { history.back(); } catch (_) {} }
    this._pushed = false;
    try { this._restoreFocus?.focus?.(); } catch (_) {}
    this._restoreFocus = null;
    this.dispatchEvent(new CustomEvent('sol-close', { bubbles: true, composed: true }));
  }
}

define('sol-sheet', SolSheet);
export { SolSheet };
export default SolSheet;
