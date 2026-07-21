// Pure RDF→menu-item parsing helpers used by <sol-menu>'s `from-rdf`
// attribute. No DOM dependencies — `parseMenuItems` and friends return
// plain JS descriptions that the host element wraps with render closures.

import { rdf } from './rdf.js';
import { loadRdfStore } from './rdf-utils.js';

const UI     = 'http://www.w3.org/ns/ui#';
const RDF    = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const RDFS   = 'http://www.w3.org/2000/01/rdf-schema#';
const SCHEMA = 'http://schema.org/';
const ACL    = 'http://www.w3.org/ns/auth/acl#';
const DCT    = 'http://purl.org/dc/terms/';

// Who publishes the thing an item describes (a dct:publisher literal) —
// carried on entries so catalog cards can show a byline; round-tripped by
// the serializer like every other item field. (dct:creator collapsed into
// publisher, 2026-07-14.)
function dctVal(store, subject, localName) {
  const node = store.any(subject, rdf.sym(DCT + localName));
  return node ? node.value : null;
}

// A documentary comment carried on an item as rdfs:comment — used to round-trip
// the HTML comments that document menu/chrome items (generator re-emits them).
function rdfsComment(store, subject) {
  const node = store.any(subject, rdf.sym(RDFS + 'comment'));
  return node ? node.value : null;
}

// An item may declare the access mode it needs via the standard WAC vocab,
// e.g. `acl:mode acl:Write`. We surface a `requiresWrite` flag; the host app
// decides what to do with it (hide / disable / …) — the menu takes no policy.
function requiresWriteMode(store, subject) {
  return store.each(subject, rdf.sym(ACL + 'mode'), null)
    .some(m => m.value === ACL + 'Write');
}

// The attribute spelling of the same gate: a schema:additionalProperty named `if-logged-in`
// (or `requires-write`) with an EMPTY value — the boolean form. Mirrors the
// HTML path's isGated (sol-menu). A NON-empty `if-logged-in` is sol-include's
// alternate-source switch, NOT a gate, so it must not match here.
export function gatedByParams(params) {
  return (params || []).some(([k, v]) =>
    (k === 'if-logged-in' || k === 'requires-write') && !v);
}

// Read a single ui:<localName> property of `subject` from `store`.
export function rdfVal(store, subject, localName) {
  const node = store.any(subject, rdf.sym(UI + localName));
  return node ? node.value : null;
}

// Walk an rdf:List, returning its elements as an array. Menus no longer use
// rdf:Collections (schema:itemListElement membership since 2026-07-19); this
// stays for ui:Layout parts and other list-valued vocab.
export function rdfListElements(store, listNode) {
  if (listNode.elements) return listNode.elements;
  const items = [];
  let cur = listNode;
  const nil   = rdf.sym(RDF + 'nil');
  const first = rdf.sym(RDF + 'first');
  const rest  = rdf.sym(RDF + 'rest');
  while (cur && cur.value !== nil.value) {
    const el = store.any(cur, first);
    if (el) items.push(el);
    cur = store.any(cur, rest);
  }
  return items;
}

// Resolve a menu's schema:itemListElement membership into member nodes.
// A member reached through a schema:ListItem placement wrapper (it carries
// schema:item) sorts by the wrapper's schema:position — the curated-menu
// form. A direct member (unordered sets like the catalog #Available) has no
// wrapper and keeps document order after any positioned members (the sort is
// stable). Replaces the retired ui:parts rdf:Collection walk (2026-07-19).
export function menuMembers(store, menuNode) {
  const entries = store.each(menuNode, rdf.sym(SCHEMA + 'itemListElement'), null);
  const members = entries.map((entry) => {
    const target = store.any(entry, rdf.sym(SCHEMA + 'item'));
    if (!target) return { member: entry, pos: Infinity };
    const pos = store.any(entry, rdf.sym(SCHEMA + 'position'));
    return { member: target, pos: pos ? Number(pos.value) : Infinity };
  });
  members.sort((x, y) => x.pos - y.pos);
  return members.map((m) => m.member);
}

// Read a ui:Component (or handler) node into { tag, params } where
// params is [[name, value], ...] from schema:additionalProperty blanks.
export function rdfComponent(store, node) {
  if (!node) return { tag: null, params: [] };
  // The element tag derives from the schema:url module filename — inline
  // items and ui:Plugin entries alike (the ui:name spelling is retired
  // everywhere, 2026-07-19).
  const url = (store.any(node, rdf.sym(SCHEMA + 'url')) || {}).value || null;
  const tag = deriveTagFromModule(url);
  const attrNodes = store.each(node, rdf.sym(SCHEMA + 'additionalProperty'), null);
  const params = attrNodes.map(p => [
    (store.any(p, rdf.sym(SCHEMA + 'name'))  || {}).value || '',
    (store.any(p, rdf.sym(SCHEMA + 'value')) || {}).value || '',
  ]).filter(([k]) => k);
  return { tag, params };
}

// The fragment of a subject IRI (e.g. ".../menu.ttl#Settings" → "Settings"),
// used as the item's stable id so an HTML region can claim it via data-for.
function fragmentOf(node) {
  const v = (node && node.value) || '';
  const i = v.indexOf('#');
  return i >= 0 ? v.slice(i + 1) : null;
}

// A ui:Plugin entry has ONE payload predicate — schema:url — whose reading
// depends on the entry's schema:additionalType (2026-07-19, replacing the
// former ui:href/ui:module/ui:name trio). For a Component the element tag
// derives from the module URL's filename (filename==tag is a hard
// convention, enforced by :PluginShape's sh:pattern on the IRI). Strip a
// query string, then the .js extension, then an .esm/.min infix; the
// remainder must be a valid custom-element tag (lowercase, hyphenated) or
// the entry is unusable.
export function deriveTagFromModule(moduleUrl) {
  if (!moduleUrl) return null;
  const base = String(moduleUrl).split('/').pop().split('?')[0].split('#')[0];
  const tag = base.replace(/\.js$/i, '').replace(/\.(esm|min)$/i, '');
  return /^[a-z][a-z0-9]*(-[a-z0-9]+)+$/.test(tag) ? tag : null;
}

// A ui:Command entry's schema:url points into the host app's command
// registry document — the KEY is the fragment (`…/commands.ttl#restartApp`
// → "restartApp"), hyphen-free by the same rule that distinguishes command
// keys from element tags.
export function commandKeyFromUrl(url) {
  if (!url) return null;
  const i = String(url).indexOf('#');
  const key = i >= 0 ? String(url).slice(i + 1) : null;
  return key && /^[A-Za-z][A-Za-z0-9]*$/.test(key) ? key : null;
}

// Normalize a ui:orientation value to the "horizontal"/"vertical" token used
// by the HTML attribute layer. Accepts a ui:Orientation instance IRI
// (ui:Horizontal → "horizontal") or a legacy literal ("horizontal").
function orientationToken(v) {
  if (!v) return null;
  const local = v.includes('#') ? v.slice(v.indexOf('#') + 1) : v;
  return local.toLowerCase();
}

// Normalize a ui:region value to the lowercase token the HTML `region=`
// attribute uses. Accepts a ui:Region instance IRI (ui:Modal → "modal") or a
// literal. region is the ONE display property carried in RDF: it is the stored
// form of placement. At render time placement is still resolved from HTML —
// the generator emits `region=` from this token and display-target.js reads it
// there — so the "display lives in HTML" runtime model is unchanged.
function regionToken(v) {
  if (!v) return null;
  const local = v.includes('#') ? v.slice(v.indexOf('#') + 1) : v;
  return local.toLowerCase();
}

/**
 * Parse a ui:Menu's members (schema:itemListElement, wrapper-aware and
 * position-sorted — see menuMembers) into a tree of plain item descriptions.
 *
 * Each description has one of these shapes (no functions, no DOM):
 *
 *   { type: 'submenu',   id, name, children: [...] }
 *   { type: 'component', id, name, icon, region, tag, params }
 *   { type: 'link',      id, name, icon, region, href, contents }
 *
 * The only display info in the RDF is `region` (ui:region, the stored placement
 * token). `how/lifetime` and the resolution of `region` are still done from the
 * HTML at render time (region= cascade, data-for, surface keywords). `id` is the
 * item's IRI fragment, the join key an HTML region uses to claim it.
 *
 * A ui:region ON THE MENU is the default for members that carry none of their
 * own (item region — entry triple or `region` attribute pair — always wins).
 * Submenus inherit the default until one sets its own ui:region.
 */
export function parseMenuItems(store, menuNode, inheritedRegion = null) {
  const parts = menuMembers(store, menuNode);
  const typeNode = rdf.sym(RDF + 'type');
  const menuRegion = regionToken(rdfVal(store, menuNode, 'region')) || inheritedRegion;
  const items = [];

  for (const part of parts) {
    // A node may carry several rdf:types — test membership, never any().
    const types  = store.each(part, typeNode, null).map((t) => t.value);
    const isA    = (local) => types.includes(UI + local);
    const id       = fragmentOf(part);
    const label    = rdfVal(store, part, 'label') || part.value;
    const icon     = rdfVal(store, part, 'icon');
    const ownRegion = regionToken(rdfVal(store, part, 'region'));
    // Resolved placement: the item's own region, else the menu default. The
    // regionInherited flag marks the latter so serialization never
    // materializes an inherited default onto the item.
    const region   = ownRegion || menuRegion;
    const comment  = rdfsComment(store, part);
    const publisher = dctVal(store, part, 'publisher');
    // dct:source — the chip's MANIFEST IRI (e.g. plugins/music.ttl). This is the
    // chip's stable identity: a chip is a PLUGIN (one manifest), not a component
    // (one element tag backs many chips). It links a mounted menu item back to
    // its catalog entry. NB: distinct from any schema:additionalProperty `source` PARAM, which
    // is the plugin's data source, not its identity.
    const manifest  = dctVal(store, part, 'source');
    const requiresWrite = requiresWriteMode(store, part);

    if (isA('Menu')) {
      items.push({ type: 'submenu', id, name: label, comment, requiresWrite, children: parseMenuItems(store, part, menuRegion) });
      continue;
    }

    // ── ui:Plugin entry (plugin-manifest-unification stage 2) ──────────────
    // The part is a REFERENCE to a unified plugin entry (usually in the
    // catalog doc — the loader pulls referenced docs into the store). The
    // entry IS the item: no copy exists. schema:additionalType picks the
    // kind; the in-memory description keeps the exact legacy shape so every
    // consumer (sol-menu/sol-tabs/managers) works unchanged, plus an `entry`
    // marker so menu-serialize re-emits the REFERENCE, never a body.
    const kind = (store.any(part, rdf.sym(SCHEMA + 'additionalType')) || {}).value;
    if (isA('Plugin') || kind) {
      const blurb = (store.any(part, rdf.sym(SCHEMA + 'description')) || {}).value || comment;
      const { params } = rdfComponent(store, part);
      const paramRegion = (params.find(([k]) => k === 'region') || [])[1];
      const itemParams = params.filter(([k]) => k !== 'region');
      const common = { id, name: label, icon, comment: blurb, publisher,
        region: (paramRegion || '').toLowerCase() || region,
        regionInherited: !paramRegion && !ownRegion && !!menuRegion,
        requiresWrite: requiresWrite || gatedByParams(params),
        manifest: manifest || part.value,
        entry: part.value };
      // ONE payload predicate — schema:url — read by kind (2026-07-19):
      //   Link      → the URL to open (href)
      //   Component → the ES module; the element tag derives from its filename
      //   Command   → a registry-doc fragment; the KEY is the fragment name
      const payload = (store.any(part, rdf.sym(SCHEMA + 'url')) || {}).value || null;
      if (kind === UI + 'Link') {
        items.push({ ...common, type: 'link', href: payload, contents: null });
        continue;
      }
      const tag = kind === UI + 'Command'
        ? commandKeyFromUrl(payload)
        : deriveTagFromModule(payload);
      if (!tag) {
        console.warn(`[menu-rdf] skipping ui:Plugin entry ${part.value} — ` +
          (kind === UI + 'Command'
            ? `a Command's schema:url needs a hyphen-free #fragment key (got "${payload}")`
            : `cannot derive a tag from schema:url "${payload}"`));
        continue;
      }
      items.push({ ...common, type: 'component', tag, params: itemParams,
        module: kind === UI + 'Command' ? null : payload });
      continue;
    }

    // Inline `a ui:Command` — same single payload: schema:url is a fragment
    // IRI whose hyphen-free fragment is the key (component-shaped desc, tag
    // = key, exactly like a Command entry).
    if (isA('Command')) {
      const cmdUrl = (store.any(part, rdf.sym(SCHEMA + 'url')) || {}).value || null;
      const key = commandKeyFromUrl(cmdUrl);
      if (!key) {
        console.warn(`[menu-rdf] skipping ui:Command ${part.value} — schema:url needs a hyphen-free #fragment key`);
        continue;
      }
      const { params } = rdfComponent(store, part);
      items.push({ type: 'component', id, name: label, icon, comment, publisher,
        region: null, requiresWrite: requiresWrite || gatedByParams(params),
        tag: key, params: params.filter(([k]) => k !== 'region'),
        module: null, command: cmdUrl, manifest });
      continue;
    }

    if (isA('Component')) {
      // The single schema:url payload IS the module; the tag derives from
      // its filename (rdfComponent). The retired ui:name/ui:module spellings
      // are no longer read.
      const { tag, params } = rdfComponent(store, part);
      const moduleUrl = (store.any(part, rdf.sym(SCHEMA + 'url')) || {}).value || null;
      if (!tag) {
        console.warn(`[menu-rdf] skipping ui:Component ${part.value} — cannot derive a tag from schema:url "${moduleUrl}"`);
        continue;
      }
      // Placement rides the attribute channel (a `region` schema:additionalProperty) —
      // lift it into the structural field, exactly as the HTML harvest does
      // with a region= attribute (menu-html TAB_SKIP). The legacy ui:region
      // triple is still READ for third-party data; menu-serialize writes the
      // attribute spelling back for components (never the triple).
      const paramRegion = (params.find(([k]) => k === 'region') || [])[1];
      const itemParams = params.filter(([k]) => k !== 'region');
      items.push({ type: 'component', id, name: label, icon, comment, publisher,
        region: (paramRegion || '').toLowerCase() || region,
        regionInherited: !paramRegion && !ownRegion && !!menuRegion,
        requiresWrite: requiresWrite || gatedByParams(params),
        tag, params: itemParams, module: moduleUrl, manifest });
      continue;
    }

    const href     = (store.any(part, rdf.sym(SCHEMA + 'url')) || {}).value || null;
    const contents = rdfVal(store, part, 'contents');
    items.push({ type: 'link', id, name: label, icon, region,
      regionInherited: !ownRegion && !!menuRegion,
      comment, publisher, requiresWrite, href, contents, manifest });
  }
  return items;
}

/**
 * A reference-style menu's members point at ui:Plugin entries that may live
 * in OTHER documents (the catalog doc, per plugin-manifest-unification).
 * Fetch every referenced doc the store doesn't already describe, parsing each
 * into the SAME store under its own graph name — so per-doc serialization
 * stays clean. Turtle is the entries' format; failures are warn-and-continue
 * (the parse then skips the unreadable entry, it doesn't sink the whole menu).
 */
export async function loadReferencedDocs(store, rootDocUrl, fetchFn = null) {
  // Minimal stores (e.g. the jest rdflib mock) can't enumerate statements —
  // they also only ever hold single-doc menus, so there's nothing to resolve.
  if (typeof store.statementsMatching !== 'function') return;
  // Resolve fetch lazily — a bare `fetch` default param THROWS where no
  // global fetch exists (jsdom), even when this function has nothing to do.
  if (!fetchFn) fetchFn = (typeof fetch === 'function') ? fetch : null;
  if (!fetchFn) return;
  const typeNode = rdf.sym(RDF + 'type');
  // Members hang off schema:itemListElement triples — either directly
  // (unordered sets) or behind a schema:ListItem wrapper whose schema:item is
  // the real member (curated menus); collect BOTH the entry and its target.
  // Two rounds: entries fetched in round 1 cannot themselves add membership
  // (plugin entries have none), but a nested submenu doc could — cap the walk.
  const elemPred = rdf.sym(SCHEMA + 'itemListElement');
  const itemPred = rdf.sym(SCHEMA + 'item');
  const members = () => {
    const out = [];
    for (const st of store.statementsMatching(null, elemPred, null)) {
      out.push(st.object);
      const target = store.any(st.object, itemPred);
      if (target) out.push(target);
    }
    return out;
  };
  for (let round = 0; round < 2; round++) {
    const missing = new Set();
    for (const member of members()) {
      if (!member || !member.value || member.termType !== 'NamedNode') continue;
      const doc = member.value.split('#')[0];
      if (!doc || doc === rootDocUrl) continue;
      // already have statements about this member → its doc is loaded enough
      if (store.any(member, typeNode)) continue;
      missing.add(doc);
    }
    if (!missing.size) return;
    for (const doc of missing) {
      try {
        const resp = await fetchFn(doc, { headers: { Accept: 'text/turtle' } });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        rdf.parse(await resp.text(), store, doc, 'text/turtle');
      } catch (e) {
        console.warn(`[menu-rdf] could not load referenced doc ${doc}: ${e && e.message}`);
      }
    }
  }
}

/**
 * Resolve `uri` (optionally relative to `baseUri`), fetch the RDF doc,
 * locate the menu root (by fragment or by ui:Menu type), pull in any docs
 * its members reference (ui:Plugin entries), and parse it.
 *
 * @returns {Promise<null | { items, orientation }>}
 *   `null` if no ui:Menu is found in the document.
 */
export async function loadMenuFromUri(uri, baseUri = null) {
  let docUrl, fragment;
  try {
    const parsed = new URL(uri, baseUri || undefined);
    fragment = parsed.hash.slice(1);
    parsed.hash = '';
    docUrl = parsed.href;
  } catch {
    docUrl = uri;
    fragment = '';
  }

  const store = await loadRdfStore(docUrl);
  let root;
  if (fragment) {
    root = rdf.sym(docUrl + '#' + fragment);
  } else {
    const menuType = rdf.sym(UI + 'Menu');
    const typeNode = rdf.sym(RDF + 'type');
    root = store.each(null, typeNode, menuType)[0];
  }
  if (!root) return null;

  await loadReferencedDocs(store, docUrl);

  const orientation = orientationToken(rdfVal(store, root, 'orientation')) || 'horizontal';
  const items       = parseMenuItems(store, root);
  return { items, orientation };
}
