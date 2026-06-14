/**
 * /watch/[id] — id-only route (no source prefix), narrowed load.
 *
 * entries(): mandatory under adapter-static strict: true (Pitfall 1/3).
 *   Returns one entry per video, derived from the $lib/data videos export
 *   (already hidden-filtered). Prerenders exactly 56 HTML files
 *   (build/watch/<id>/index.html) regardless of which pages are linked.
 *
 * load(): narrows params.id via getById(). On unknown id throws error(404).
 *   The `error()` helper from @sveltejs/kit returns `never` so TypeScript
 *   narrows `video` from `Video | undefined` → `Video`.
 *
 * Rail: build-time computed — same-category videos minus the current one,
 *   sorted featured-first then published desc. Returned alongside `video` so
 *   the prerendered HTML contains both. Zero client-side JS for the rail.
 */
import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';
import { getById, getByCategory, videos } from '$lib/data';

export const entries: EntryGenerator = () => videos.map((v) => ({ id: v.id }));

export const load: PageLoad = async ({ params }) => {
  const video = getById(params.id);
  if (!video) error(404, 'Video not found');

  const rail = [...getByCategory(video.category)]
    .filter((v) => v.id !== video.id)
    .toSorted((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return b.published.localeCompare(a.published);
    });

  return { video, rail };
};
