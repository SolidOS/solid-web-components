// Turns the plain item descriptions produced by core/menu-rdf.js
// (parseMenuItems) into DOM render closures. Shared by <sol-menu> and
// <sol-tabs> so both render the identical ui:Menu RDF shape the same way.
//
// The descriptions are component-agnostic; only the closures below touch
// the DOM. A host element supplies a `ctx`:
//
//   { host, baseUrl, sourceName, embedClass }
//
//   host        — element used for getAttribute('data-handler') and sol-error
//   baseUrl     — the host module's import.meta.url, for handler resolution
//   sourceName  — host tag name, used in error messages / event detail
//   embedClass  — CSS class added to each embedded element
//                 ('sol-menu-embed' / 'sol-tab-embed')

import { siblingUrl } from './here.js';
import { displayItem, contentForHref, placeOutput } from './display-target.js';

/**
 * A component desc's tag (derived from its schema:url module filename) is
 * either a custom-element tag (render that
 * component) or a *command* — an opaque registry key the host app resolves.
 * Custom-element names must contain a hyphen (HTML spec), so a bare name that
 * isn't a registered element is a command. The name is NOT a tag, a global, or
 * a script: clicking it dispatches `sol-command` for the app to map; an
 * unregistered key is a no-op. Bounded entirely by the app's registry.
 *
 * @param {string} name  an item's tag / command key
 * @returns {boolean}    true when it should be treated as a command
 */
export function isCommandName(name) {
  if (!name) return false;
  if (name.includes('-')) return false;          // hyphenated → custom element
  if (customElements.get(name)) return false;     // registered custom element
  // A real built-in HTML element (iframe, video, img, …) is content to render,
  // not a command. document.createElement returns an HTMLUnknownElement only
  // for names that aren't valid elements — those are the command keys.
  try {
    if (typeof document !== 'undefined'
        && !(document.createElement(name) instanceof HTMLUnknownElement)) return false;
  } catch (_) { /* invalid element name → treat as a command */ }
  return true;
}

/** schema:additionalProperty/ui:parameter pairs [[k,v],…] → { k: v, … } command args. */
export function paramsToObject(params) {
  return Object.fromEntries(params || []);
}

// Params the app consumes structurally (placement + gating). They stay in the
// param list — gatedByParams reads them and they round-trip through the RDF —
// but must never leak into a link's outbound URL.
const URL_PARAM_SKIP = new Set(['region', 'if-logged-in', 'requires-write']);

/**
 * Merge a ui:Link's schema:additionalProperty pairs into its URL as search
 * params. An empty value emits a bare flag (`?defer`), matching the
 * empty-string convention for valueless attributes. A same-named key already in
 * the href is replaced, not duplicated; any #fragment is preserved.
 *
 * String surgery rather than `new URL()`: same-origin link hrefs are relative
 * (they go to `sol-include`) and have no base to resolve against here.
 *
 * @param {string} href
 * @param {Array<[string, string]>} [params]
 * @returns {string} href unchanged when there is nothing to add
 */
export function hrefWithParams(href, params) {
  const pairs = (params || []).filter(([k]) => k && !URL_PARAM_SKIP.has(k));
  if (!href || !pairs.length) return href;

  const hash = href.indexOf('#');
  const base = hash < 0 ? href : href.slice(0, hash);
  const frag = hash < 0 ? '' : href.slice(hash);
  const q = base.indexOf('?');
  const path = q < 0 ? base : base.slice(0, q);

  const names = new Set(pairs.map(([k]) => k));
  const kept = (q < 0 ? '' : base.slice(q + 1)).split('&').filter((s) => {
    if (!s) return false;
    try { return !names.has(decodeURIComponent(s.split('=')[0])); }
    catch { return true; }                       // malformed escape — leave it alone
  });

  const enc = encodeURIComponent;
  const added = pairs.map(([k, v]) =>
    (v === '' || v == null ? enc(k) : `${enc(k)}=${enc(v)}`));

  return `${path}?${kept.concat(added).join('&')}${frag}`;
}

/**
 * Dispatch a menu/button/tab command. `command` is the registry key (from a
 * component tag or a bare `data-handler`); `params` is the
 * args object. Bubbling + composed so one document-level listener in the host
 * app catches it.
 *
 * The detail carries `place(output)` — a lazy helper the app's handler calls
 * ONLY if its script produces output: it mounts `output` (Element / fragment /
 * HTML string) into the launcher's resolved region (`regionCtx`), reusing the
 * same region cascade as components, and returns the host element. A
 * fire-and-forget command simply never calls it, so nothing is resolved or
 * conjured. A button's region is its own `region=`/`data-for`; a tab's is its
 * pane (passed as `regionCtx.fallbackEl`).
 *
 * @param {HTMLElement} host
 * @param {string} command
 * @param {object} [params]
 * @param {{id?:string|null, fallbackEl?:Element|null, name?:string}} [regionCtx]
 */
export function dispatchCommand(host, command, params, regionCtx = {}) {
  const place = (output) => placeOutput({
    launcher: host,
    id: regionCtx.id ?? null,
    fallbackEl: regionCtx.fallbackEl ?? null,
    name: regionCtx.name ?? command,
    output,
  });
  host.dispatchEvent(new CustomEvent('sol-command', {
    bubbles: true, composed: true,
    detail: { command, params: params || {}, source: host, place },
  }));
}

/**
 * Lazy-import a sibling sol-* handler module on first use, so authors
 * don't have to <script> every component a declared item references.
 *
 * @param {string} tag        custom-element tag, e.g. "sol-query"
 * @param {HTMLElement} host  element that emits sol-error on failure
 * @param {string} baseUrl    importing component's import.meta.url
 * @param {string} sourceName host tag name, for the warning / event
 */
export function ensureHandler(tag, host, baseUrl, sourceName, moduleUrl = null) {
  if (customElements.get(tag)) return;
  const fail = (err) => {
    const msg = `<${sourceName}> could not auto-load handler "${tag}" — make sure its module is reachable and any externals are in the importmap (${err.message})`;
    console.warn(msg);
    if (host) host.dispatchEvent(new CustomEvent('sol-error', {
      bubbles: true, composed: true,
      detail: { source: sourceName, kind: 'handler-load', tag, message: err.message },
    }));
  };
  // schema:url — an installable component names its own ES module; import it
  // for ANY tag. http(s) only: the page's CSP decides which origins may run.
  if (moduleUrl) {
    if (!/^https?:/.test(moduleUrl)) {
      fail(new Error(`a component module url must be http(s), got ${moduleUrl}`));
      return;
    }
    import(/* webpackIgnore: true */ moduleUrl).catch(fail);
    return;
  }
  if (!/^sol-[a-z-]+$/.test(tag)) return;
  import(siblingUrl(`./${tag}.js`, baseUrl)).catch(fail);
}

/**
 * Build a render closure for a ui:Component part. Placement is resolved from
 * the HTML at click time by the dispatcher (region= cascade off the host,
 * `data-for` claim by this item's id, or the host's own body as fallback).
 * Components default to keep-alive.
 *
 * @param {object} desc { id, name, tag, params }
 * @param {object} ctx  { host, baseUrl, sourceName, embedClass }
 * @returns {(body: HTMLElement) => void}
 */
export function renderComponentItem(desc, ctx) {
  return (body) => {
    const { id, name, tag, params } = desc;
    if (!tag) return;
    // desc.module (its schema:url) rides along so an installable component's own
    // ES module is imported on first mount — no import-map entry needed.
    const ensure = (t) => ensureHandler(t, ctx.host, ctx.baseUrl, ctx.sourceName,
                                        t === tag ? desc.module : null);
    ensure(tag);
    displayItem({
      launcher: ctx.host, id, name: name || id,
      tag, attrs: params, replace: false,
      embedClass: ctx.embedClass, fallbackEl: body, ensure,
    });
  };
}

/**
 * Build a render closure for a ui:Link part. A `ui:contents` literal is
 * injected as HTML; otherwise the link's schema:url is rendered by the origin-inferred
 * element (same-origin → trusted `sol-include`, external → `iframe`). A
 * non-default viewer is expressed as a `ui:Component`, not a handler.
 * Placement is resolved from the HTML by the dispatcher (region= / data-for).
 *
 * The item's params are merged into the URL ONCE here, before both
 * contentForHref and displayItem — so the embedded (iframe / sol-include) and
 * the popped-out (window.open for the tab/window regions) paths get the same
 * URL without per-surface handling.
 *
 * @param {object} desc { id, name, href, contents, params }
 * @param {object} ctx  { host, baseUrl, sourceName, embedClass }
 * @returns {(body: HTMLElement) => void}
 */
export function renderLinkItem(desc, ctx) {
  return (body) => {
    const { id, name, href, contents } = desc;
    const ensure = (t) => ensureHandler(t, ctx.host, ctx.baseUrl, ctx.sourceName);

    if (contents != null) {
      displayItem({
        launcher: ctx.host, id, name: name || id, contents,
        embedClass: ctx.embedClass, fallbackEl: body, ensure,
      });
      return;
    }
    if (!href) return;

    const url = hrefWithParams(href, desc.params);
    const { tag, attrs, replace } = contentForHref(url);
    ensure(tag);

    displayItem({
      launcher: ctx.host, id, name: name || id,
      tag, attrs, href: url, replace,
      embedClass: ctx.embedClass, fallbackEl: body, ensure,
    });
  };
}
