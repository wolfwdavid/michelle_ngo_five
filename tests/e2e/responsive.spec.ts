import { test, expect } from '@playwright/test';

/**
 * QUAL-03 — responsive layout + mobile-nav audit.
 *
 * Two guarantees:
 *   1. The PAGE never scrolls horizontally at 375 / 768 / 1024 / 1440. The rails
 *      scroll INTERNALLY (overflow-x on the rail <ul>); a horizontally-scrolling
 *      document is the classic "a rail forced page overflow" break (HOME-02).
 *   2. The TopNav hamburger (<sm) opens the MobileMenu role="dialog", the dialog
 *      holds the primary nav links, Escape closes it AND returns focus to the
 *      hamburger (DSGN-04 / MobileMenu focus-return contract). At ≥sm the
 *      hamburger is hidden (desktop nav shown).
 *
 * Tailwind's `sm` breakpoint is 640px, so the hamburger is visible at 375 and
 * hidden at 768 / 1024 / 1440.
 */

const VIEWPORTS = [
  { name: 'mobile 375', width: 375, height: 800 },
  { name: 'tablet 768', width: 768, height: 900 },
  { name: 'laptop 1024', width: 1024, height: 900 },
  { name: 'desktop 1440', width: 1440, height: 900 },
] as const;

/** True when the document does not scroll horizontally (allowing 1px rounding). */
async function noPageOverflow(page: import('@playwright/test').Page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth + 1
  );
}

for (const vp of VIEWPORTS) {
  test(`home has no horizontal page overflow @ ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('/');
    expect(await noPageOverflow(page), `page overflows horizontally @ ${vp.width}`).toBe(true);

    // A rail region and the hero wordmark must render at every width.
    await expect(page.locator('section.rail').first()).toBeVisible();
    await expect(page.getByRole('heading', { level: 1, name: 'Michelle Ngo' })).toBeVisible();
  });
}

test('watch page (densest layout) has no horizontal overflow @ 375 and 1440', async ({ page }) => {
  for (const width of [375, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/watch/264677021');
    expect(await noPageOverflow(page), `watch page overflows @ ${width}`).toBe(true);
  }
});

test('mobile nav opens, holds the nav links, Escape closes + returns focus @ 375', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/');

  const hamburger = page.getByRole('button', { name: 'Open menu' });
  await expect(hamburger).toBeVisible();

  // Open via the KEYBOARD (focus the trigger, then Enter). This mirrors how a
  // keyboard user actually invokes the menu — and it's the only flow for which
  // "return focus to the trigger" is meaningful. (WebKit, like Safari, does not
  // focus a <button> on mouse click, so a .click() would leave the trigger
  // unfocused and the return-focus assertion would be testing the wrong thing.)
  await hamburger.focus();
  await page.keyboard.press('Enter');

  const dialog = page.getByRole('dialog', { name: 'Site menu' });
  await expect(dialog).toBeVisible();
  // Primary destinations live inside the overlay.
  await expect(dialog.getByRole('link', { name: 'About', exact: true })).toBeVisible();
  await expect(dialog.getByRole('link', { name: 'Contact', exact: true })).toBeVisible();

  // Escape closes AND returns focus to the trigger (MobileMenu focus-return).
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(hamburger).toBeFocused();
});

test('hamburger is hidden at desktop width (1440); desktop nav shown', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Open menu' })).toBeHidden();
});
