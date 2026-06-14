/**
 * /work/[category] — BRWS-02 path-param filter + narrowed load.
 *
 * entries(): mandatory under adapter-static strict: true (Pitfall 1).
 *   Returns one entry per category, derived from the CATEGORIES single source of
 *   truth. Prerenders exactly 8 HTML files (build/work/<slug>/index.html).
 *
 * load(): narrows params.category via slugToCategory(). On unknown slug
 *   throws error(404). The `error()` helper from @sveltejs/kit returns `never`
 *   so TypeScript narrows `category` from `Category | undefined` → `Category`
 *   (noUncheckedIndexedAccess).
 *
 * Sort: featured-first, then published date desc.
 */
import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';
import { CATEGORIES, categoryToSlug, slugToCategory, getByCategory } from '$lib/data';

export const entries: EntryGenerator = () =>
  CATEGORIES.map((c) => ({ category: categoryToSlug(c) }));

// `async` (rather than a sync signature) so the 404 throw becomes an awaited
// promise-rejection — the page test asserts via `.rejects.toMatchObject({ status: 404 })`.
export const load: PageLoad = async ({ params }) => {
  const category = slugToCategory(params.category);
  if (!category) error(404, 'Category not found');

  const filtered = [...getByCategory(category)].toSorted((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return b.published.localeCompare(a.published);
  });

  return { category, videos: filtered };
};
