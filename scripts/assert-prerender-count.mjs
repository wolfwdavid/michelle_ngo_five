#!/usr/bin/env node
/**
 * Phase 04 (Plan 04-02 / QUAL-02, Pitfall 3) — Prerender route-count guard.
 *
 * Proves: after `pnpm build`, the static output contains EXACTLY the expected
 * number of prerendered route HTML files. Unlike a coverage floor (≥), this
 * guard uses EXACT equality on the parameterized routes so that a content edit
 * which ADDS or DROPS a watch/category route trips the guard for human review
 * (a silent route drift is the failure mode this closes):
 *   - build/watch/<id>/index.html            (EXACTLY 56 — one per video)
 *   - build/work/<slug>/index.html           (EXACTLY 8  — one per category)
 *   - build/work/index.html                  (present — the unfiltered /work route)
 *   - build/pbs-american-portrait/index.html (present — PBS landing)
 *   - build/about/index.html                 (present)
 *   - build/press/index.html                 (present)
 *   - build/contact/index.html               (present)
 *   - build/index.html                       (present — home)
 *
 * Why this is necessary in addition to `adapter-static strict: true`:
 *   `strict: true` fails the build only if a route imported by another route is
 *   NOT prerenderable. If `entries()` for /watch/[id] returns ZERO entries the
 *   build still succeeds with zero /watch HTML files — `strict` does not catch
 *   an empty enumeration. This guard does, and it also catches an unexpected
 *   INCREASE (route added without review).
 *
 * Usage:
 *   pnpm build && node scripts/assert-prerender-count.mjs
 * OR:
 *   pnpm verify:prerender (after running `pnpm build` separately)
 *
 * Exit codes:
 *   0 — watch === 56 AND categories === 8 AND all required static pages present.
 *   1 — a count mismatch or a missing required static page (prerender drift).
 *   2 — `build/` directory doesn't exist (run `pnpm build` first).
 */
import { existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const BUILD = resolve(REPO_ROOT, 'build');

if (!existsSync(BUILD)) {
  console.error(
    `[assert-prerender-count] FATAL: ${BUILD} does not exist. Run 'pnpm build' first.`,
  );
  process.exit(2);
}

/**
 * Count subdirectories inside `parentDir` that themselves contain an index.html
 * file (the canonical adapter-static prerender shape: <route>/index.html).
 */
function countPrerendered(parentDir) {
  if (!existsSync(parentDir)) return 0;
  let count = 0;
  for (const e of readdirSync(parentDir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const indexHtml = join(parentDir, e.name, 'index.html');
    if (existsSync(indexHtml) && statSync(indexHtml).isFile()) count++;
  }
  return count;
}

// /watch/[id]: 56 subdirs each with an index.html.
const EXPECTED_WATCH = 56;
const watchCount = countPrerendered(join(BUILD, 'watch'));

// /work/[category]: 8 subdirs each with an index.html.
// build/work also holds the bare build/work/index.html for the /work route, but
// that file lives directly in build/work (not in a <slug>/ subdir), so the
// subdir count naturally excludes it.
const EXPECTED_CATEGORIES = 8;
const categoryCount = countPrerendered(join(BUILD, 'work'));

// Required parameterless static routes (each as <route>/index.html), plus home.
const requiredStaticPages = [
  ['work (unfiltered reel)', join(BUILD, 'work', 'index.html')],
  ['pbs-american-portrait', join(BUILD, 'pbs-american-portrait', 'index.html')],
  ['about', join(BUILD, 'about', 'index.html')],
  ['press', join(BUILD, 'press', 'index.html')],
  ['contact', join(BUILD, 'contact', 'index.html')],
  ['home', join(BUILD, 'index.html')],
];

const missingStatic = requiredStaticPages.filter(([, p]) => !existsSync(p));

// --- Report table -----------------------------------------------------------
const rows = [
  ['watch/<id>', watchCount, EXPECTED_WATCH, watchCount === EXPECTED_WATCH],
  ['work/<slug>', categoryCount, EXPECTED_CATEGORIES, categoryCount === EXPECTED_CATEGORIES],
];
console.log('[assert-prerender-count] prerendered route counts:');
console.log('  route          actual  expected  ok');
for (const [name, actual, expected, ok] of rows) {
  console.log(
    `  ${name.padEnd(13)} ${String(actual).padStart(6)}  ${String(expected).padStart(8)}  ${ok ? 'OK' : 'FAIL'}`,
  );
}
console.log('  required static pages:');
for (const [name, p] of requiredStaticPages) {
  console.log(`    ${name.padEnd(28)} ${existsSync(p) ? 'present' : 'MISSING'}`);
}

// --- Assertions -------------------------------------------------------------
const failures = [];
if (watchCount !== EXPECTED_WATCH) {
  failures.push(
    `build/watch/<id>/index.html count is ${watchCount}; expected EXACTLY ${EXPECTED_WATCH}. ` +
      `A watch route was added or dropped — review the videos dataset before deploying.`,
  );
}
if (categoryCount !== EXPECTED_CATEGORIES) {
  failures.push(
    `build/work/<slug>/index.html count is ${categoryCount}; expected EXACTLY ${EXPECTED_CATEGORIES}. ` +
      `A category route was added or dropped — review the category taxonomy before deploying.`,
  );
}
for (const [name] of missingStatic) {
  failures.push(`Missing required static page: ${name}.`);
}

if (failures.length > 0) {
  console.error('[assert-prerender-count] FAIL:');
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}

console.log(
  `[assert-prerender-count] PASS: ${watchCount} watch + ${categoryCount} category routes and all required static pages present.`,
);
process.exit(0);
