import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * QUAL-01 — axe WCAG AA gate over the 8 key v5 routes.
 *
 * Adapted from the proven sibling michelle_ngo_three spec (same WCAG 2 A + AA +
 * 2.1 A + AA + best-practice tag set, same parametrized route loop) but with the
 * v5 GATING POLICY instead of the sibling's blanket `toEqual([])`:
 *
 *   - serious | critical  → HARD GATE (build-fail). These are the QUAL-01
 *     "no SERIOUS violations on key pages" floor.
 *   - moderate            → fixed at source where reasonable; any intentional
 *     carve-out is documented per-rule inline below (rule id + justification).
 *   - minor               → advisory only (console.warn), never gates.
 *
 * On any failure we print every violation's impact + id (+ the first target node)
 * so the regression is debuggable from CI logs alone.
 *
 * The preview server runs UNPREFIXED at root (playwright.config.ts PORT 4187,
 * BASE_PATH omitted) so `page.goto('/work')` resolves at the server root.
 */
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'];

const ROUTES = [
  { name: 'home /', path: '/' },
  { name: 'work', path: '/work' },
  { name: 'work category (pbs)', path: '/work/pbs-american-portrait' },
  { name: 'watch (producer reel)', path: '/watch/264677021' },
  { name: 'pbs landing', path: '/pbs-american-portrait' },
  { name: 'press', path: '/press' },
  { name: 'about', path: '/about' },
  { name: 'contact', path: '/contact' },
] as const;

/**
 * Moderate violations intentionally NOT fixed in this plan (none today). Add a
 * rule id here with a one-line justification to carve it out of the moderate
 * gate; serious/critical can NEVER be carved out this way.
 *
 * Example shape (kept empty until a genuine false-positive appears):
 *   'scrollable-region-focusable': 'rail <ul> is reachable via its focusable <li><a> cards — see CategoryRail a11y note',
 */
const MODERATE_CARVE_OUTS: Record<string, string> = {};

type Impact = 'minor' | 'moderate' | 'serious' | 'critical' | null | undefined;

function summarize(violations: { id: string; impact?: Impact; nodes: { target: unknown[] }[] }[]) {
  return violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    target: v.nodes[0]?.target,
  }));
}

for (const route of ROUTES) {
  test(`${route.name} — no serious/critical axe violations`, async ({ page }) => {
    await page.goto(route.path);
    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical'
    );
    const moderate = results.violations.filter(
      (v) => v.impact === 'moderate' && !MODERATE_CARVE_OUTS[v.id]
    );
    const advisory = results.violations.filter(
      (v) => v.impact === 'moderate' || v.impact === 'minor'
    );

    if (advisory.length) {
      console.warn(`a11y advisory ${route.path}`, summarize(advisory));
    }

    // Print the full picture on any failure for CI-log debuggability.
    if (blocking.length || moderate.length) {
      console.error(`a11y FAILURE ${route.path}`, summarize(results.violations));
    }

    // HARD GATE: zero serious/critical (QUAL-01 floor).
    expect(blocking, `serious/critical axe violations on ${route.path}`).toEqual([]);
    // Moderate gate (minus documented carve-outs): fix-or-document policy.
    expect(moderate, `moderate axe violations on ${route.path}`).toEqual([]);
  });
}
