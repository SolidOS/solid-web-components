/**
 * <sol-dropdown> — a behind-the-scenes surface: a panel that drops down anchored
 * under a launcher button.
 *
 * Authors never write <sol-dropdown> themselves. It is CONJURED by the region
 * cascade (core/display-target.js) when an item declares `ui:region ui:Dropdown`
 * (region="dropdown") — set the region on a launcher and the cascade conjures a
 * sol-dropdown, assigns the launcher to `_anchor`, and mounts the item's content
 * into ::part(body). The sibling conjured surfaces are sol-modal (modal) and
 * sol-window (floating); this is the anchored-dropdown one.
 *
 *   <sol-button data-handler="sol-calendar" region="dropdown"
 *               source="calendar-settings.ttl#All">📅</sol-button>
 *   click → <sol-dropdown> conjured under the button, hosting <sol-calendar>.
 *
 * It positions itself `fixed` just under its anchor (flipping to stay on-screen),
 * tracks scroll/resize while open, and dismisses on outside-click / Escape by
 * removing itself.
 */
import { define } from '../core/define.js';
import { SolElement } from '../core/sol-element.js';
import { placeAnchored } from '../core/anchor-place.js';

const CSS = `
  :host { position: fixed; z-index: 1000; }
  .panel {
    border: 1px solid var(--menu-popup-border, silver);
    border-radius: var(--radius, 6px);
    background: var(--menu-bg, var(--surface, #fff));
    box-shadow: var(--shadow-popup, 0 8px 24px rgba(0, 0, 0, 0.28));
    overflow: auto;
    max-width: 92vw;
    max-height: calc(100vh - 16px);
  }
  .body { padding: var(--menu-popup-pad, 8px); }
`;

class SolDropdown extends SolElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  // The mount target the conjure() contract expects (host.body).
  get body() { return this.shadowRoot.querySelector('.body'); }

  connectedCallback() {
    if (this._rendered) return;
    this._rendered = true;
    const style = document.createElement('style');
    style.textContent = CSS;
    const panel = document.createElement('div');
    panel.className = 'panel';
    panel.setAttribute('part', 'panel');
    const body = document.createElement('div');
    body.className = 'body';
    body.setAttribute('part', 'body');
    panel.appendChild(body);
    this.shadowRoot.append(style, panel);

    this._place();
    // The hosted widget (e.g. sol-calendar) lays out / fetches asynchronously,
    // so the panel has ~no width when first placed — re-place once it does, and
    // whenever it resizes, so the right-edge flip keeps it on-screen.
    requestAnimationFrame(() => this._place());
    if (typeof ResizeObserver !== 'undefined') {
      this._ro = new ResizeObserver(() => this._place());
      this._ro.observe(panel);
      this._cleanup(() => this._ro.disconnect());
    }
    this._onReflow = () => this._place();
    // Outside-click / Escape dismiss. The click that OPENED us is on the anchor,
    // so excluding the anchor keeps that same event from closing us immediately.
    this._onDocClick = (e) => {
      const t = e.target;
      if (!this.contains(t) && !(this._anchor && this._anchor.contains && this._anchor.contains(t))) this._close();
    };
    this._onKey = (e) => { if (e.key === 'Escape') this._close(); };
    // SolElement._on auto-removes these on disconnect (this element self-removes
    // on close), so no hand-rolled disconnectedCallback teardown is needed.
    this._on(document, 'click', this._onDocClick);
    this._on(document, 'keydown', this._onKey);
    this._on(window, 'scroll', this._onReflow, true);
    this._on(window, 'resize', this._onReflow);
  }

  _close() { this.remove(); }   // SolElement tears down the listeners on disconnect

  // Anchor the panel under the launcher (shared placement with sol-dropdown-button,
  // so menu and dropdown surfaces line up the same). Positions the host; measures
  // the inner .panel for the overflow flip.
  _place() {
    placeAnchored(this._anchor, this, this.shadowRoot.querySelector('.panel'));
  }
}

define('sol-dropdown', SolDropdown);
export { SolDropdown };
export default SolDropdown;
