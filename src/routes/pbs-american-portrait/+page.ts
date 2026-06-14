/**
 * /pbs-american-portrait/ — PBS-01 flagship landing route.
 *
 * Parameterless prerendered route. `prerender = true` + `trailingSlash = 'always'`
 * inherited from src/routes/+layout. No entries() needed (flat route).
 *
 * Load returns the 18 PBS videos sorted featured-first then date-desc,
 * mirroring /work/[category]/+page.ts shape.
 */
import type { PageLoad } from './$types';
import { getByCategory } from '$lib/data';

export const load: PageLoad = () => ({
  videos: [...getByCategory('PBS American Portrait')].toSorted((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return b.published.localeCompare(a.published);
  }),
});
