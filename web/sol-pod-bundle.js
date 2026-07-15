/**
 * sol-pod-bundle.js — bundle entry: the pod-browsing stack in one import.
 *
 * Side-effect aggregator (like sol-basic): each child module registers its
 * custom element on import. Covers browsing a pod and editing its resources:
 *   sol-pod          — the pod browser
 *   sol-pod-extras   — sol-pod-ops (file operations) + sol-wac (sharing)
 *   sol-live-edit    — the split source/preview editor pod-ops opens
 *
 * Externals (rdflib, the auth stack) resolve through the page's importmap,
 * exactly as when importing the components individually.
 */
import './sol-pod.js';
import './sol-pod-extras.js';
import './sol-live-edit.js';
