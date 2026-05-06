/**
 * sol-full.js — load every covered component in one tag.
 *
 * Side-effect aggregator: each child module registers its custom element
 * on import. Externals (rdflib, dompurify, marked, @comunica/query-sparql)
 * stay bare-specifier and are resolved by the consumer's importmap, so
 * CDN mode and offline mode both work without changing this file.
 *
 * Usage:
 *   <script type="importmap" src="dist/importmap-cdn.json"></script>
 *       — or —
 *   <script type="importmap" src="dist/importmap-local.json"></script>
 *
 *   <script type="module" src="web/sol-full.js"></script>
 *
 * Adding a component here requires that every external it pulls in (via
 * core/* or its own imports) is listed in tools/external-deps.json so both
 * the CDN and local importmaps cover it. Components that need extras
 * (solid-ui, mashlib, @inrupt/solid-client-authn-browser, etc.) stay out
 * until those externals are vendored.
 */

import './sol-menu.js';
import './sol-include.js';
import './sol-query.js';
import './sol-login.js';

// TODO: add the rest as their externals get vendored:
//   sol-accordion, sol-modal, sol-tabs, sol-rolodex, sol-live-edit, sol-pod,
//   sol-pod-ops, sol-wac (no extra externals expected — verify and add)
//   sol-form          (requires solid-ui — vendor solid-ui first)
//   sol-solidos       (requires mashlib)
// sol-login is in: it only needs `window.solidClientAuthn` (provided by
// dist/vendor/@inrupt-solid-client-authn-browser.umd.js loaded as a
// `<script>` tag before this aggregator).
