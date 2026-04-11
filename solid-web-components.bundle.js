// All-in-one bundle entry point.
//
// Exposes runtime deps as window globals (the components read them lazily)
// and imports every <sol-*> component for its customElements.define side-effect.

import * as $rdf from 'rdflib';
import * as solidClientAuthn from '@inrupt/solid-client-authn-browser';
import { QueryEngine } from '@comunica/query-sparql';

if (typeof window !== 'undefined') {
  window.$rdf = $rdf;
  window.solidClientAuthn = solidClientAuthn;
  window.Comunica = { QueryEngine, newEngine: () => new QueryEngine() };
}

import './sol-query.js';
import './sol-include.js';
import './sol-live-edit.js';
import './sol-login.js';
import './sol-modal.js';
import './sol-pod.js';

export { $rdf, solidClientAuthn, QueryEngine };
