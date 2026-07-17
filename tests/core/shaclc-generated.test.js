/**
 * shapes/*.shaclc are GENERATED twins of their .shacl sources
 * (scripts/regen-shaclc.mjs — the .shacl is canonical, never hand-edit a
 * .shaclc). This drift guard fails when a .shacl changes without
 * regenerating, or a twin is missing — run `node scripts/regen-shaclc.mjs`.
 */
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');

test('every shapes/*.shaclc matches what regen-shaclc derives from its .shacl', () => {
  // --check compares without writing, exits 1 listing STALE/MISSING twins.
  execFileSync(process.execPath, [join(root, 'scripts', 'regen-shaclc.mjs'), '--check'], {
    cwd: root,
    stdio: 'pipe',
  });
});
