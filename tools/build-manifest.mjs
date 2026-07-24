#!/usr/bin/env node
/**
 * build-manifest.mjs
 *
 * Generates dist/sol-components.manifest.json from the per-component plugin
 * ttls in plugins/ (the RDF source of truth) + tools/manifest-base.json (the
 * hand-maintained envelope: @context, attributes, objects, stages).
 *
 * Each plugins/<tag>.ttl is a ui:Component doc (the same shape menus,
 * palette cards, and dk plugin manifests use — validated by
 * shapes/ui.shacl). The manifest `components` entry it produces carries the
 * ci meta contract: label / icon / description verbatim, shape / data / help
 * as dist-relative paths (plugins/ and dist/ are siblings, so the ttl's
 * ../-relative IRIs translate 1:1). The entry key is the element tag,
 * derived from the seed's schema:url module filename (the single payload
 * predicate — ui:name is retired); the stages block carries the loader's
 * module URLs, as before.
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Parser, Store, DataFactory } from 'n3';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const { namedNode } = DataFactory;

const UI = 'http://www.w3.org/ns/ui#';
const DCT = 'http://purl.org/dc/terms/';
const SCHEMA = 'http://schema.org/';
const PKG = 'file:///pkg/';                 // synthetic base for relativizing

function one(store, subj, pred) {
  const q = store.getQuads(subj, namedNode(pred), null, null);
  return q.length ? q[0].object : null;
}

// file:///pkg/shapes/x.shacl → ../shapes/x.shacl (relative to dist/)
function distRelative(iri) {
  if (!iri.startsWith(PKG)) return iri;     // absolute (http…) stays verbatim
  return '../' + iri.slice(PKG.length);
}

const components = {};
const files = readdirSync(resolve(root, 'plugins')).filter((f) => f.endsWith('.ttl')).sort();
for (const f of files) {
  const ttl = readFileSync(resolve(root, 'plugins', f), 'utf8');
  const store = new Store(new Parser({ baseIRI: `${PKG}plugins/${f}` }).parse(ttl));
  const subj = namedNode(`${PKG}plugins/${f}`);
  const moduleUrl = one(store, subj, 'http://schema.org/url')?.value;
  const base = moduleUrl ? moduleUrl.split('/').pop().split('?')[0].split('#')[0] : '';
  const name = base.replace(/\.js$/i, '').replace(/\.(esm|min)$/i, '');
  if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)+$/.test(name)) { console.error(`[build-manifest] ${f}: no tag-shaped schema:url — skipped`); continue; }

  const entry = {};
  const label = one(store, subj, UI + 'label');
  const icon  = one(store, subj, UI + 'icon');
  const desc  = one(store, subj, SCHEMA + 'description');
  const shape = one(store, subj, DCT + 'conformsTo');
  const help  = one(store, subj, SCHEMA + 'softwareHelp');
  if (label) entry.label = label.value;
  if (icon)  entry.icon = icon.termType === 'NamedNode' ? icon.value : icon.value;
  if (desc)  entry.description = desc.value;
  if (shape) entry.shape = distRelative(shape.value);
  const data = store.getQuads(subj, namedNode(DCT + 'references'), null, null)
    .map((q) => distRelative(q.object.value));
  if (data.length === 1) entry.data = data[0];
  else if (data.length > 1) entry.data = data;
  if (help) entry.help = distRelative(help.value);
  components[name] = entry;
}

const base = JSON.parse(readFileSync(resolve(here, 'manifest-base.json'), 'utf8'));
const out = { ...base, components };
writeFileSync(resolve(root, 'dist', 'sol-components.manifest.json'),
  JSON.stringify(out, null, 2) + '\n');
console.log(`[build-manifest] wrote dist/sol-components.manifest.json (${Object.keys(components).length} components from plugins/*.ttl)`);
