// solid-web-components.bundle.js — all-in-one IIFE bundle entry.
//
// Imports every covered component for side-effect (custom-element
// registration) AND inlines every external runtime dep (rdflib, dompurify,
// marked, @comunica/query-sparql, …) into one self-contained file.
//
// Consumer usage: a single script tag, no importmap, no other externals.
//   <script src="https://your-host/dist/solid-web-components.bundle.min.js"></script>
//
// This is the simplest copy-paste path. Pay for it in file size: the bundle
// includes Comunica's SPARQL engine and all transitive RDF parsing code, so
// it lands in the multi-MB range. Consumers who want a smaller surface
// should use the per-component UMD bundles or the importmap path instead.
//
// sol-login is included here because its only runtime dependency on the
// inrupt auth client is a `window.solidClientAuthn` global lookup — the
// auth client is bring-your-own. Drop in
// `dist/vendor/@inrupt-solid-client-authn-browser.umd.js` *before* this
// bundle and sol-login wires itself up automatically. Components requiring
// solid-ui or mashlib stay out for now.

import './sol-menu.js';
import './sol-include.js';
import './sol-query.js';
import './sol-login.js';
