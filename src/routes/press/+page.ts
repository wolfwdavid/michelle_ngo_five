/**
 * /press load (PAGE-02).
 *
 * Calls the route-local helper and returns the grouped press credits for
 * +page.svelte to iterate. Prerendered (inherits prerender=true from the
 * sitewide +layout.ts). Build emits build/press/index.html.
 */
import type { PageLoad } from './$types';
import { getPressCredits, type PressGroup } from './_pressCredits';

export const load: PageLoad<{ groups: PressGroup[] }> = () => {
  return { groups: getPressCredits() };
};
