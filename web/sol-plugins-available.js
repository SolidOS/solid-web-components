/**
 * <sol-plugins-available> — the palette of available plugins: draggable cards
 * the user drops onto a <sol-menu-builder> / <sol-bar-builder> item to say
 * what that item mounts.
 *
 *   <sol-plugins-available source="./data/palette.ttl#Palette"
 *                          for="sol-menu-builder, sol-bar-builder">
 *   </sol-plugins-available>
 *
 * The palette is the union of two catalogs:
 *   1. the `source` document (curated app presets) — a ui:Menu whose
 *      ui:Component parts each give ui:label (card name), ui:name (element
 *      tag), and ui:attribute defaults. Same shape, same parser as every
 *      other menu — the palette is itself editable with the menu builder.
 *   2. the loader manifests — every ComponentInterop.manifest.meta entry
 *      that declares a `label` (the label is the palette opt-in). A library
 *      thus offers its components by declaring metadata in its manifest;
 *      no curation file needed.
 * Deduped by tag: a `source` preset wins and is ENRICHED by the manifest's
 * icon / hover title / description / help for that tag.
 *
 * Attributes:
 *   source — the curated preset document (optional when manifests carry labels).
 *   for    — selector naming the builder(s) this palette feeds. Drag data
 *            is set globally (any builder accepts it); `for` exists so pages
 *            can declare the pairing and styling/tooling can use it.
 *
 * Drag payload: `application/x-sol-plugin` JSON {label, tag, params, icon}.
 */

import { define } from '../core/define.js';
import { adopt, sheetFrom } from '../core/adopt.js';
import { CSS } from './styles/sol-builders-css.js';
import { rdf } from '../core/rdf.js';
import { loadRdfStore } from '../core/rdf-utils.js';
import { parseMenuItems } from '../core/menu-rdf.js';
import { solFetch } from '../core/auth-fetch.js';
import { PLUGIN_MIME } from './sol-menu-builder.js';

const SHEET = sheetFrom(CSS);

class SolPluginsAvailable extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    adopt(this.shadowRoot, { sheet: SHEET, css: CSS });
  }

  connectedCallback() {
    if (this._built) return;
    this._built = true;
    this._root = document.createElement('div');
    this._root.className = 'builder';
    this.shadowRoot.appendChild(this._root);
    this._load();
  }

  get source() { return this.getAttribute('source') || ''; }

  async _load() {
    let presets = [];
    let loadError = null;
    if (this.source) {
      try {
        const docUrl = new URL(this.source.split('#')[0], document.baseURI).href;
        const frag = this.source.split('#')[1] || 'Palette';
        const store = await loadRdfStore(docUrl, solFetch);
        const items = parseMenuItems(store, rdf.sym(`${docUrl}#${frag}`));
        presets = items.filter((i) => i.type === 'component' && i.tag);
      } catch (e) {
        loadError = e;
      }
    }
    const plugins = this._withManifestMeta(presets);
    if (!plugins.length) {
      this._root.innerHTML = loadError
        ? `<div class="hint">Could not load palette: ${loadError.message}</div>`
        : '<div class="hint">Set source="palette.ttl#Palette" (or label components in a manifest) to list available plugins.</div>';
      return;
    }
    this._render(plugins);
  }

  // Union the curated presets with the loader manifests' component metadata:
  // a preset is enriched by its tag's manifest meta (icon/title/description/
  // help fill gaps); a labelled manifest component with no preset becomes a
  // card of its own.
  _withManifestMeta(presets) {
    const meta = (window.ComponentInterop
      && window.ComponentInterop.manifest
      && window.ComponentInterop.manifest.meta) || {};
    const out = presets.map((p) => {
      const m = meta[p.tag] || {};
      return {
        ...p,
        icon: p.icon || m.icon,
        title: m.title,
        description: m.description,
        help: m.help,
      };
    });
    const seen = new Set(presets.map((p) => p.tag));
    for (const [tag, m] of Object.entries(meta)) {
      if (!m.label || seen.has(tag)) continue;
      out.push({
        type: 'component', tag,
        name: m.label,
        icon: m.icon,
        title: m.title,
        description: m.description,
        help: m.help,
        params: (m.params || []).map((pv) => [pv.name, pv.value]),
      });
    }
    return out;
  }

  _render(plugins) {
    const head = document.createElement('div');
    head.className = 'builder-head';
    const title = document.createElement('span');
    title.className = 'builder-title';
    title.textContent = 'Available plugins';
    const hint = document.createElement('span');
    hint.className = 'builder-status';
    hint.textContent = 'drag onto a menu or bar item';
    head.append(title, hint);

    const cards = document.createElement('div');
    cards.className = 'cards';
    for (const p of plugins) {
      const card = document.createElement('div');
      card.className = 'card';
      card.draggable = true;
      card.setAttribute('role', 'listitem');
      const top = document.createElement('span');
      top.className = 'card-top';
      if (p.icon) {
        const icon = document.createElement('span');
        icon.className = 'card-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = p.icon;
        top.appendChild(icon);
      }
      const label = document.createElement('span');
      label.className = 'card-label';
      label.textContent = p.name || p.tag;
      top.appendChild(label);
      if (p.help) {
        const help = document.createElement('a');
        help.className = 'card-help';
        help.href = p.help;
        help.target = '_blank';
        help.rel = 'noopener';
        help.textContent = '?';
        help.setAttribute('aria-label', `Help for ${p.name || p.tag}`);
        help.addEventListener('dragstart', (e) => e.preventDefault());
        top.appendChild(help);
      }
      const tag = document.createElement('span');
      tag.className = 'card-tag';
      tag.textContent = `<${p.tag}>`;
      card.title = p.title
        || (p.params || []).map(([k, v]) => `${k}="${v}"`).join('\n')
        || 'no default attributes';
      card.append(top, tag);
      if (p.description) {
        const desc = document.createElement('span');
        desc.className = 'card-desc';
        desc.textContent = p.description;
        card.appendChild(desc);
      }
      card.addEventListener('dragstart', (e) => {
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData(PLUGIN_MIME, JSON.stringify({
          label: p.name || p.tag, tag: p.tag, params: p.params || [], icon: p.icon || '',
        }));
        e.dataTransfer.setData('text/plain', p.tag);
      });
      card.addEventListener('dragend', () => card.classList.remove('dragging'));
      cards.appendChild(card);
    }
    this._root.replaceChildren(head, cards);
  }
}

define('sol-plugins-available', SolPluginsAvailable);
export { SolPluginsAvailable };
export default SolPluginsAvailable;
