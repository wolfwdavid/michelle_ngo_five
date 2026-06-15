/**
 * Home load — builds the rails array at PRERENDER time (HOME-01).
 *
 * One rail per category in display order (D-04: count desc, ties alpha), each
 * paired with its public (hidden-filtered) videos. Pure build-time data — zero
 * runtime fetch, base-path safe — so the rails ship inside the prerendered
 * build/index.html (RESEARCH Q5).
 *
 * Empty categories are dropped here, not in the view: a category with 0 public
 * videos is simply absent (no empty shelf — UI-SPEC "Empty rail" / States).
 */
import type { PageLoad } from './$types';
import { getCategoriesInDisplayOrder, getByCategory } from '$lib/data';

export const prerender = true;

export const load: PageLoad = () => {
  const rails = getCategoriesInDisplayOrder()
    .map((category) => ({ category, videos: getByCategory(category) }))
    .filter((rail) => rail.videos.length > 0);

  return { rails };
};
