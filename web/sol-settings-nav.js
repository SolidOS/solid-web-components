/**
 * <sol-settings-nav> — a chip row that shows one sibling section at a time.
 *
 * Drop it above a set of <section> groups (a settings page, a preferences
 * panel, any "many small forms" layout): every section under the nav's
 * PARENT element that carries a heading (h1–h6) gets a chip labelled by
 * that heading, and exactly one section is visible at a time. Chips are
 * DERIVED from the page's own markup — nothing is configured on the nav —
 * so sections added later at runtime (e.g. per-plugin settings groups that
 * resolve asynchronously) get chips as they arrive, via a MutationObserver.
 *
 *   <div class="my-settings">
 *     <sol-settings-nav></sol-settings-nav>
 *     <section><h3>General</h3> …form…</section>
 *     <section><h3>Accounts</h3> …form…</section>
 *   </div>
 *
 * Selection rules:
 *   - a section nested inside another candidate section belongs to its
 *     parent's panel, not the chip row
 *   - a section inside a display:none host is skipped (e.g. a group its
 *     app hides on the phone) — no chip to an empty panel
 *   - until the user picks a chip, the FIRST section stays selected — the
 *     default tracks the list, so async mounting (groups arriving over
 *     several frames while the page assembles, possibly hidden) can never
 *     strand the selection on whichever group happened to be first at some
 *     transient moment
 *   - a user pick sticks; if the picked section leaves the DOM, selection
 *     falls back to the first
 *
 * Hiding uses BOTH the hidden attribute (semantics) and an inline
 * display:none (robustness): an app rule like `section { display:block }`
 * silently beats the UA's [hidden] style, so the attribute alone is not
 * enough (found the hard way — every panel painted while hidden said
 * otherwise).
 *
 * ARIA: the row is a tablist; chips are tabs with a roving tabindex and
 * ArrowLeft/ArrowRight movement; each section gets role=tabpanel.
 */
import { define } from '../core/define.js';
import { ensureDocStyle } from '../core/adopt.js';
import { CSS } from './styles/sol-settings-nav-css.js';

class SolSettingsNav extends HTMLElement {
  connectedCallback() {
    if (this._wired) return;
    this._wired = true;
    this._root = this.parentElement || this;
    this._active = null;         // the selected section element
    this._chipFor = new Map();   // section element -> chip button
    this.setAttribute('role', 'tablist');
    ensureDocStyle(this.getRootNode(), 'sol-settings-nav-styles', CSS);
    this._mo = new MutationObserver(() => this._schedule());
    this._mo.observe(this._root, { childList: true, subtree: true });
    this._sync();
  }

  disconnectedCallback() { this._mo?.disconnect(); }

  _schedule() {
    if (this._pending) return;
    this._pending = true;
    requestAnimationFrame(() => { this._pending = false; this._sync(); });
  }

  // The sections this nav manages: descendants of the parent that carry a
  // heading, are not nested inside another candidate, and can actually
  // paint (skip sections whose HOST element is display:none).
  _groups() {
    const all = [...this._root.querySelectorAll('section')]
      .filter((sec) => sec.querySelector(':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6'));
    return all.filter((sec) => {
      if (all.some((other) => other !== sec && other.contains(sec))) return false;
      for (let el = sec.parentElement; el && el !== this._root; el = el.parentElement) {
        if (getComputedStyle(el).display === 'none') return false;
      }
      return true;
    });
  }

  // Rebuild the chip row to match the current groups (idempotent — a no-op
  // when the group list is unchanged, so the observer can't loop on our own
  // hidden-toggles and chip appends).
  _sync() {
    const groups = this._groups();
    const known = [...this._chipFor.keys()];
    const same = groups.length === known.length && groups.every((g, i) => known[i] === g);
    if (!same) {
      this._chipFor.clear();
      this.replaceChildren();
      groups.forEach((sec) => {
        const label = sec.querySelector(':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6')?.textContent?.trim() || 'Other';
        if (!sec.id) {
          // Mint a doc-unique id — index-based names collide when groups
          // arrive over several syncs (two panels named alike breaks
          // aria-controls).
          let n = 1;
          while (sec.ownerDocument.getElementById('sol-settings-panel-' + n)) n++;
          sec.id = 'sol-settings-panel-' + n;
        }
        sec.setAttribute('role', 'tabpanel');
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'sol-settings-nav-chip';
        chip.textContent = label;
        chip.setAttribute('role', 'tab');
        chip.setAttribute('aria-controls', sec.id);
        chip.addEventListener('click', () => this._select(sec));
        this.appendChild(chip);
        this._chipFor.set(sec, chip);
      });
      this.addEventListener('keydown', this._onKey);
    }
    // Selection: until the user picks a chip, the default TRACKS the first
    // group (async mounting can't strand it on a transient first); a user
    // pick sticks while its section stays in the DOM.
    if (!this._userPicked || !this._active?.isConnected) {
      if (this._active && !this._active.isConnected) this._userPicked = false;
      this._active = groups[0] || null;
    }
    this._apply(groups);
  }

  _select(sec) {
    this._active = sec;
    this._userPicked = true;
    this._apply(this._groups());
    this._chipFor.get(sec)?.focus();
  }

  _apply(groups) {
    for (const sec of groups) {
      const on = sec === this._active;
      sec.hidden = !on;
      sec.style.display = on ? '' : 'none';
      const chip = this._chipFor.get(sec);
      if (chip) {
        chip.setAttribute('aria-selected', on ? 'true' : 'false');
        chip.tabIndex = on ? 0 : -1;
      }
    }
  }

  _onKey = (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const groups = this._groups();
    const i = groups.indexOf(this._active);
    if (i < 0) return;
    const next = groups[(i + (e.key === 'ArrowRight' ? 1 : -1) + groups.length) % groups.length];
    e.preventDefault();
    this._select(next);
  };
}

define('sol-settings-nav', SolSettingsNav);

export { SolSettingsNav };
