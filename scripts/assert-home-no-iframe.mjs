#!/usr/bin/env node
/**
 * HOME-06 / Pitfall B build guard: assert the prerendered home (build/index.html)
 * contains ZERO <iframe>.
 *
 * The home is a facade — cards are poster <img>, and the producer reel iframe is
 * mounted ONLY inside ReelHero's lightbox, on click. If a live embed ever leaks
 * onto home (e.g. an eager player), it tanks mobile LCP/INP. This guard runs
 * after `vite build` (chained in package.json "build") so a leak fails CI, not
 * just review.
 *
 * Exit codes: 0 = clean, 1 = iframe found OR build/index.html missing.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const homeFile = resolve(repoRoot, 'build', 'index.html');

let html;
try {
  html = readFileSync(homeFile, 'utf8');
} catch {
  console.error(`✗ assert-home-no-iframe: ${homeFile} not found — run \`vite build\` first.`);
  process.exit(1);
}

const match = /<iframe/i.exec(html);
if (match) {
  // Show a little context around the first offending tag.
  const start = Math.max(0, match.index - 80);
  const context = html.slice(start, match.index + 120).replace(/\s+/g, ' ').trim();
  console.error('✗ assert-home-no-iframe: build/index.html contains an <iframe> (HOME-06 violated).');
  console.error(`  context: …${context}…`);
  process.exit(1);
}

console.log('home: 0 iframes ✓');
