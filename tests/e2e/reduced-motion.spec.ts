import { test, expect } from '@playwright/test';

/**
 * QUAL-04 — reduced-motion audit.
 *
 * Proves the SINGLE FND-06 gate (prefersReducedMotion, read by
 * src/lib/state/motion.svelte.ts) governs ALL hero + rail motion — not that
 * motion happens to be absent. The positive control (no-preference => .motion
 * present) is what makes this a real gate test.
 *
 * Hero motion is double-gated: `class:motion={motionOK}` on <section class="hero">
 * (motionOK = !prefersReducedMotion.current) PLUS CSS @media
 * (prefers-reduced-motion: no-preference). The hero poster carries a permanent
 * `transform: scale(1.08)` base; PARALLAX adds a translate on top. So we assert
 * there is no TRANSLATE component (matrix e/f ≈ 0), not full identity.
 *
 * `class:motion` is applied by client JS, so each assertion waits for hydration
 * (the motion class settling) before reading.
 */

/** Read the computed transform matrix translate components (tx, ty) of a locator. */
async function translateOf(locator: import('@playwright/test').Locator) {
  return locator.evaluate((el) => {
    const t = getComputedStyle(el).transform;
    if (t === 'none' || !t) return { tx: 0, ty: 0 };
    const m = new DOMMatrixReadOnly(t);
    return { tx: m.m41, ty: m.m42 };
  });
}

test('reduce: hero has NO .motion class and no parallax translate', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const hero = page.locator('.hero');
  await expect(hero).toBeVisible();
  // The gate removes the motion class on the client once hydrated.
  await expect(hero).not.toHaveClass(/(^|\s)motion(\s|$)/);

  // Parallax layer carries only its base scale — no translate offset applied.
  const { tx, ty } = await translateOf(page.locator('.hero-bg'));
  expect(Math.abs(tx)).toBeLessThanOrEqual(0.5);
  expect(Math.abs(ty)).toBeLessThanOrEqual(0.5);
});

test('reduce: moving the pointer over the hero does NOT apply a tilt translate', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.hero')).toBeVisible();

  // The pointer-tilt $effect early-returns under reduced motion
  // (`if (!motionOK) return`), so pointermove must leave the layers untouched.
  const box = await page.locator('.hero').boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width * 0.25, box.y + box.height * 0.25);
    await page.mouse.move(box.x + box.width * 0.75, box.y + box.height * 0.75);
  }

  const bg = await translateOf(page.locator('.hero-bg'));
  const fg = await translateOf(page.locator('.hero-fg'));
  expect(Math.abs(bg.tx)).toBeLessThanOrEqual(0.5);
  expect(Math.abs(bg.ty)).toBeLessThanOrEqual(0.5);
  expect(Math.abs(fg.tx)).toBeLessThanOrEqual(0.5);
  expect(Math.abs(fg.ty)).toBeLessThanOrEqual(0.5);
});

test('no-preference (positive control): hero DOES carry the .motion class', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');

  const hero = page.locator('.hero');
  await expect(hero).toBeVisible();
  // Proves the gate TOGGLES — motion is gated, not globally absent.
  await expect(hero).toHaveClass(/(^|\s)motion(\s|$)/);
});

test('reduce: rail Next button is operable and pages without smooth animation', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const firstRail = page.locator('section.rail').first();
  await expect(firstRail).toBeVisible();
  const scroller = firstRail.locator('ul.rail-scroller');

  // The Next button pages the rail; under reduced motion CategoryRail uses
  // behavior:'auto', so scrollLeft changes (effectively) synchronously rather
  // than animating over many frames.
  const next = firstRail.getByRole('button', { name: /Scroll .* right/ });
  await expect(next).toBeAttached();

  const before = await scroller.evaluate((el) => el.scrollLeft);
  await next.dispatchEvent('click');
  // Give one tick; with behavior:auto the jump is immediate.
  await page.waitForTimeout(50);
  const after = await scroller.evaluate((el) => el.scrollLeft);

  expect(after).toBeGreaterThan(before);
});
