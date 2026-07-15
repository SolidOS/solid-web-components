/**
 * core/manifest.js — the library's own manifest, readable WITHOUT
 * component-interop.
 *
 * dist/sol-components.manifest.json ships in the package and carries each
 * component's display/settings metadata (label, icon, description, settings
 * `shape`, default `data` doc). component-interop parses it when it drives a
 * page; this module is the ci-free reader, so an app (e.g. data-kitchen's
 * plugin settings) can consume the same facts from the file directly.
 *
 *   import { getComponentMeta } from 'sol-components/core/manifest.js';
 *   const meta = await getComponentMeta('sol-weather');
 *   // → { label, icon, description, shape: <abs URL>, data: [<abs URL>] }
 *
 * The meta contract matches what ci exposes as `manifest.meta[tag]`:
 * `label`, `icon`, `title`, `description`, `params` verbatim; `shape` and
 * `help` resolved to absolute URLs against the manifest's location; `data`
 * normalized to an ARRAY of absolute URLs.
 *
 * The package root is found from, in order: an explicit `base` option, an
 * import map on the page that maps the `sol-components/core/` or
 * `sol-components/` prefix (present under both sol-load and ci — covers the
 * bundled case, where import.meta.url no longer points into the package),
 * and finally this module's own URL.
 */

const MANIFEST_PATH = 'dist/sol-components.manifest.json';
const VERBATIM = ['label', 'icon', 'title', 'description', 'params'];

let _cache = null;   // Promise<{url, raw, meta}> — one fetch per page

function rootFromImportMap() {
  if (typeof document === 'undefined') return null;
  for (const tag of document.querySelectorAll('script[type="importmap"]')) {
    let imports;
    try { imports = JSON.parse(tag.textContent || '{}').imports || {}; }
    catch { continue; }
    const core = imports['sol-components/core/'];
    if (core) return new URL('..', new URL(core, document.baseURI));
    const web = imports['sol-components/'];
    if (web) return new URL('..', new URL(web, document.baseURI));
  }
  return null;
}

export function packageRoot(base = null) {
  if (base) {
    const b = typeof document === 'undefined' ? base : new URL(base, document.baseURI);
    return new URL(String(b).endsWith('/') ? String(b) : String(b) + '/');
  }
  return rootFromImportMap() || new URL('..', import.meta.url);
}

// Fetch + parse the manifest once; entries get ci's meta contract applied.
export function getManifest({ base = null, fetcher = null } = {}) {
  if (_cache) return _cache;
  const url = new URL(MANIFEST_PATH, packageRoot(base)).href;
  const doFetch = fetcher || ((u) => fetch(u));
  _cache = (async () => {
    const resp = await doFetch(url);
    if (!resp.ok) throw new Error(`manifest ${resp.status} at ${url}`);
    const raw = await resp.json();
    const meta = {};
    for (const [tag, v] of Object.entries(raw.components || {})) {
      if (!v || typeof v !== 'object') continue;   // string form: module only
      const m = {};
      for (const k of VERBATIM) if (v[k] != null) m[k] = v[k];
      if (v.shape != null) m.shape = new URL(v.shape, url).href;
      if (v.help != null) m.help = new URL(v.help, url).href;
      if (v.data != null) {
        m.data = (Array.isArray(v.data) ? v.data : [v.data])
          .map((d) => new URL(d, url).href);
      }
      meta[tag] = m;
    }
    return { url, raw, meta };
  })();
  _cache.catch(() => { _cache = null; });   // a failed fetch may be retried
  return _cache;
}

// One component's meta (or null) — the drop-in for ci's manifest.meta[tag].
export async function getComponentMeta(tag, opts = {}) {
  if (!tag) return null;
  try { return (await getManifest(opts)).meta[tag] || null; }
  catch { return null; }
}

// test hook
export function _resetManifestCache() { _cache = null; }
