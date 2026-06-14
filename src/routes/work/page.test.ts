import { describe, expect, it } from 'vitest';
import { load } from './+page';

// SvelteKit's PageLoad generic widens the awaited return to `void | (... & Record<string, any>)`,
// which blocks direct property access. Narrowing through a small helper preserves the
// real runtime shape while keeping the static `import { load }` form.
async function callLoad(
  event: Parameters<typeof load>[0]
): Promise<{ videos: { featured: boolean; published: string }[] }> {
  const result = await load(event);
  if (!result) throw new Error('load() returned void');
  return result as { videos: { featured: boolean; published: string }[] };
}

describe('/work +page.ts load — BRWS-01', () => {
  it('returns all 56 videos (no implicit category filter)', async () => {
    const result = await callLoad({} as Parameters<typeof load>[0]);
    expect(result.videos.length).toBe(56);
  });

  it('sort order: featured first, then published date descending', async () => {
    const result = await callLoad({} as Parameters<typeof load>[0]);
    const sorted = result.videos;
    // Featured-first: every featured video appears before every non-featured.
    const firstNonFeatured = sorted.findIndex((v: { featured: boolean }) => !v.featured);
    if (firstNonFeatured >= 0) {
      for (let i = firstNonFeatured; i < sorted.length; i++) {
        expect(sorted[i]?.featured).toBe(false);
      }
    }
    // Within non-featured: published date descending.
    const nonFeatured = sorted.filter((v: { featured: boolean }) => !v.featured);
    for (let i = 1; i < nonFeatured.length; i++) {
      const prev = nonFeatured[i - 1]!.published;
      const curr = nonFeatured[i]!.published;
      expect(prev.localeCompare(curr)).toBeGreaterThanOrEqual(0);
    }
  });

  it('result.videos is a NEW array (does NOT mutate the shared videos export)', async () => {
    const result = await callLoad({} as Parameters<typeof load>[0]);
    // Different reference from the live `$lib/data` videos array.
    const live = (await import('$lib/data')).videos;
    expect(result.videos).not.toBe(live);
  });
});
