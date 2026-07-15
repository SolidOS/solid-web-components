/**
 * sol-basic.js — bundle entry: the everyday UI tier.
 *
 * Registers the everyday UI primitives that work from plain HTML:
 *   sol-button, sol-dropdown-button, sol-include, sol-menu, sol-tabs,
 *   sol-accordion, sol-rolodex
 * …plus the registered-by-tag helpers these conjure / instantiate at runtime:
 *   sol-default     — singleton holding shared non-CSS defaults (proxy, region…)
 *   sol-modal       — the "modal" display surface + the editor-self gear popup
 *   sol-window      — the "floating" display surface
 * The author-facing surface for the conjured ones is the region KEYWORD
 * (region="modal" / "floating"), not the tag — see core/display-target.js.
 *
 * sol-menu's EDITOR (sol-tree-edit + sol-breadcrumb) is NOT here: editing a
 * menu reads/writes it as RDF (SHACL + Turtle), so it's part of the solid-ui
 * editing stack — loaded via component-interop's `rdf` capability (or the importmap +
 * module recipe). sol-menu conjures sol-tree-edit by tag when it's present.
 *
 * Deliberately NOT here (the heavier Solid stacks):
 *   sol-login, sol-form, sol-settings, sol-query, sol-solidos — see
 *   sol-form-bundle (editing) and sol-pod-bundle (pods).
 * `menu-from-rdf` IS included (2026-07-14): the menu family drives from RDF
 * out of the box, so `from-rdf` works with just this bundle. It pulls
 * rdflib through the importmap; pages that want the old truly-rdflib-free
 * tier can import the individual components instead.
 */

import './menu-from-rdf.js';  // from-rdf activation for the menu family (pulls rdflib)
import './sol-include.js';
import './sol-button.js';
import './sol-dropdown-button.js';
import './sol-menu.js';
import './sol-tabs.js';
import './sol-accordion.js';
import './sol-rolodex.js';
import './sol-settings-nav.js';   // chip row: one sibling section shown at a time

// Registered-by-tag helpers the primitives conjure / instantiate at runtime:
import './sol-default.js';    // singleton holding shared non-CSS defaults (proxy, region…)
import './sol-modal.js';      // modal display surface + editor-self gear popup
import './sol-window.js';     // floating-window display surface

// Surface the JS API on `window.SolBasic.*` for hosts that need the class
// symbols, not just the registered custom-element tags.
export { SolButton } from './sol-button.js';
export { SolDropdownButton } from './sol-dropdown-button.js';
export { SolInclude } from './sol-include.js';
export { SolMenu } from './sol-menu.js';
export { SolTabs } from './sol-tabs.js';
