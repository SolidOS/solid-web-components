#!/usr/bin/env node
/**
 * build-importmaps.mjs
 *
 * Reads tools/external-deps.json and writes two importmap JSON files into
 * dist/ — one mapping bare specifiers to esm.sh URLs (CDN runtime), one
 * mapping them to ./vendor/<name>.js paths (offline / npm-installed runtime).
 *
 * The vendored files are produced by tools/vendor.mjs.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here    = dirname(fileURLToPath(import.meta.url));
const root    = resolve(here, '..');
const outDir  = resolve(root, 'dist');
const depsFile = resolve(here, 'external-deps.json');

const { deps } = JSON.parse(readFileSync(depsFile, 'utf8'));

const cdn   = { imports: {} };
const local = { imports: {} };

for (const [name, info] of Object.entries(deps)) {
  cdn.imports[name]   = info.cdn;
  // Vendored files are flat under dist/vendor/. Scoped names are slashed
  // back to a single filename so the path is predictable; @scope/pkg → @scope-pkg.
  const flat = name.replace(/\//g, '-');
  local.imports[name] = `./vendor/${flat}.js`;
}

mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, 'importmap-cdn.json'),   JSON.stringify(cdn,   null, 2) + '\n');
writeFileSync(resolve(outDir, 'importmap-local.json'), JSON.stringify(local, null, 2) + '\n');

console.log(`[build-importmaps] wrote dist/importmap-cdn.json   (${Object.keys(cdn.imports).length} entries)`);
console.log(`[build-importmaps] wrote dist/importmap-local.json (${Object.keys(local.imports).length} entries)`);
