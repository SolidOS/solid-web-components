// core/rdf-bundle.js — the RDF editing stack as one importable barrel module.
//
// Importing this module IS loading the bundle: the bare specifiers resolve
// through the page's importmap (injected by component-interop from the
// manifest), the module registry dedupes anything already loaded, and the
// constituents evaluate in source order. Pages reach it as the importmap name
// "rdf-bundle" (a manifest shared-modules entry) or by its full specifier
// "sol-components/core/rdf-bundle.js" — e.g. the data-edit-shape attribute's
// handler entry.
import 'solid-logic';
import 'solid-ui';
import 'sol-tree-edit';
import 'sol-form';
import 'sol-modal';
import 'sol-settings';
import './edit-placements.js';
