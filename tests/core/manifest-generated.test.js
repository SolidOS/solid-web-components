/**
 * dist/sol-components.manifest.json is GENERATED from plugins/*.ttl by
 * tools/build-manifest.mjs. This drift guard fails when a plugin ttl (or the
 * envelope in tools/manifest-base.json) changes without regenerating —
 * run `npm run build:manifest`.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { mkdtempSync, cpSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');

test('the shipped manifest matches what build-manifest derives from plugins/*.ttl', () => {
  // Re-run the generator against a COPY so the real dist/ isn't touched.
  const work = mkdtempSync(join(tmpdir(), 'sc-manifest-'));
  for (const d of ['plugins', 'tools', 'dist']) cpSync(join(root, d), join(work, d), { recursive: true });
  cpSync(join(root, 'node_modules', 'n3'), join(work, 'node_modules', 'n3'), { recursive: true });
  execFileSync(process.execPath, [join(work, 'tools', 'build-manifest.mjs')]);

  const shipped = JSON.parse(readFileSync(join(root, 'dist', 'sol-components.manifest.json'), 'utf8'));
  const derived = JSON.parse(readFileSync(join(work, 'dist', 'sol-components.manifest.json'), 'utf8'));
  expect(shipped).toEqual(derived);
});

test('every plugin ttl produced a manifest entry keyed by its ui:name', () => {
  const shipped = JSON.parse(readFileSync(join(root, 'dist', 'sol-components.manifest.json'), 'utf8'));
  for (const tag of ['sol-weather', 'sol-time', 'sol-search', 'sol-calendar', 'sol-feed', 'sol-login', 'sol-solidos']) {
    expect(shipped.components[tag]).toBeDefined();
  }
  // settings-bearing entries keep the ci meta contract fields
  expect(shipped.components['sol-weather']).toMatchObject({
    label: 'Weather',
    shape: '../shapes/weather-settings.shacl',
    data: '../data/weather-settings.ttl',
  });
});
