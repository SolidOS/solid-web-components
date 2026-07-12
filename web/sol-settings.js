/**
 * <sol-settings> — discovery-driven settings page.
 *
 * Walks the current document (crossing into every shadow root) for
 * elements whose custom-element class declares an editor (`static get
 * editor()` or `static get shape()`). For each, renders one flat
 * `<section><h3>label</h3>…editor…</section>` — the same shape a
 * hand-authored settings group has, so a `<sol-settings-nav>` chip row
 * above picks every discovered widget up as its own chip. On successful
 * save the host component's `reload()` (if present) is invoked.
 *
 * No configuration: drop a `<sol-settings></sol-settings>` anywhere
 * on the page; widgets elsewhere on the page are picked up
 * automatically. Hosts can render widgets into a keep-alive region pane so
 * they stay mounted (hidden) when the user navigates to the settings page;
 * otherwise discovery only sees widgets currently in the DOM.
 *
 * Attributes:
 *   none
 *
 * Methods:
 *   refresh() — re-walk and rebuild the sections if the widget set
 *               has changed (signature: tag + subject). Cheap no-op
 *               when nothing changed. Use from consumer code when a
 *               new editable widget is mounted after sol-settings
 *               connected. (Tab activation triggers this automatically
 *               via the sol-tab-activate listener.)
 *
 * Events (consumed):
 *   sol-form-save — bubbling from any embedded editor; triggers
 *                   `host.reload()` on the corresponding source widget.
 */

import { define } from '../core/define.js';
import { buildEditorElement, triggerSelfEditor, editPlacement } from '../core/editor.js';
import { findExtensionPoints } from '../core/extension-points.js';

class SolSettings extends HTMLElement {
  connectedCallback() {
    if (this._wired) return;
    this._wired = true;
    // Defer one microtask so the surrounding DOM (e.g., a sibling
    // keep-alive wrapper that holds the dashboard widgets) is fully
    // attached before discovery walks.
    queueMicrotask(() => this._build());

    // Re-discover when the editable-component set changes. Generic trigger: a
    // debounced MutationObserver on the whole document — works with any app, no
    // swc-specific navigation needed. `sol-tab-activate` stays as an extra hint
    // for keep-alive tab UIs (harmless if no one fires it). The rebuild only
    // happens when the discovered set actually changed (signature compare).
    this._rebuild = () => {
      if (this.offsetParent === null) return;   // we're hidden; ignore
      this._rebuildIfChanged();
    };
    this._mo = new MutationObserver(() => {
      clearTimeout(this._moTimer);
      this._moTimer = setTimeout(this._rebuild, 50);
    });
    this._mo.observe(document.documentElement, { childList: true, subtree: true });
    document.addEventListener('sol-tab-activate', this._rebuild);
  }

  disconnectedCallback() {
    if (this._mo) { this._mo.disconnect(); this._mo = null; }
    clearTimeout(this._moTimer);
    if (this._rebuild) {
      document.removeEventListener('sol-tab-activate', this._rebuild);
      this._rebuild = null;
    }
  }

  _build() {
    const widgets = this._discover();
    this._lastSignature = signatureOf(widgets);
    this.innerHTML = '';
    // No editable widgets → render NOTHING. (There used to be a "No editable
    // widgets found" note; in a sections/chip-nav layout it painted as stray
    // text under every group, and an empty element is the honest state.)
    if (!widgets.length) return;
    for (const widget of widgets) {
      const section = document.createElement('section');
      const h3 = document.createElement('h3');
      h3.textContent = widget.label;
      const body = document.createElement('div');
      body.className = 'sol-settings-slot';
      section.append(h3, body);
      this._mountEditor(body, widget);
      this.appendChild(section);
    }
  }

  _rebuildIfChanged() {
    const widgets = this._discover();
    const sig = signatureOf(widgets);
    if (sig === this._lastSignature) return;
    this._build();
  }

  refresh() { this._rebuildIfChanged(); }

  _mountEditor(body, widget) {
    // forms:"self" — the component renders its own editor; offer a trigger.
    if (widget.spec && widget.spec.self) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sol-settings-self-open';
      btn.textContent = `Edit ${widget.label}…`;
      btn.addEventListener('click', () => triggerSelfEditor(widget.el, widget.spec));
      body.appendChild(btn);
      return;
    }
    const editor = buildEditorElement(widget.el, widget.spec);
    if (!editor) {
      body.textContent = 'No editor available.';
      return;
    }
    editor.addEventListener('sol-form-save', () => {
      if (typeof widget.el.reload === 'function') {
        widget.el.reload().catch(() => {});
      }
    });
    body.appendChild(editor);
  }

  // Editable widgets = every element offering the `edit` extension point. The
  // walk + shadow-crossing + resolution lives in core/extension-points.js; this
  // is just the `edit` case of the general protocol. Opt-out attr stays
  // `data-settings-skip` for back-compat with pages that use it.
  _discover() {
    return findExtensionPoints('edit', { skipAttr: 'data-settings-skip' })
      .filter(({ el }) => el !== this && !this.contains(el))
      // inPlace editors render a gear ON the element itself — sol-settings
      // gathers only the "collected" ones (the default placement).
      .filter(({ el, spec }) => editPlacement(el, spec) === 'collected')
      .map(({ el, spec }) => ({
        el, spec,
        label: el.getAttribute('label') || labelFromTag(el.localName),
      }));
  }
}

// Fallback label when an element has no `label` attribute. Drops the leading
// vendor-prefix segment (sol-, dk-, my-, …) generically and title-cases the
// rest — `sol-weather` → "Weather", `my-thing` → "Thing", `sol-dropdown-button`
// → "Dropdown Button". Any component can override with an explicit `label`.
function labelFromTag(tag) {
  return tag
    .replace(/^[a-z0-9]+-/, '')
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/** Stable identity for a discovered widget set, used to detect when a
 *  later re-discovery has actually changed anything. Tag + subject is
 *  enough — two instances of the same widget with the same source
 *  would render an identical section. */
function signatureOf(widgets) {
  return widgets
    .map(w => `${w.el.localName}#${w.el.getAttribute('source') || w.el.getAttribute('from-rdf') || ''}`)
    .sort()
    .join('|');
}

define('sol-settings', SolSettings);
export { SolSettings };
export default SolSettings;
