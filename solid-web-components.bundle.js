// All-in-one bundle entry point.
//
// Imports every <sol-*> component for its customElements.define side-effect.
// rdflib, dompurify, marked, Comunica, and Inrupt auth are inlined by rollup
// (see rollup.config.js); no page globals required.

import './sol-accordion.js';
import './sol-include.js';
import './sol-live-edit.js';
import './sol-login.js';
import './sol-menu.js';
import './sol-modal.js';
import './sol-pod.js';
import './sol-pod-ops.js';
import './sol-query.js';
import './sol-rolodex.js';
import './sol-tabs.js';
import './sol-solidos.js';
import './sol-wac.js';

// Re-export the RDF singleton so apps that want to share state with mashlib /
// solid-ui / solid-logic can read SolidWebComponents.rdf.store from the bundle.
export { rdf } from './shared/rdf.js';
