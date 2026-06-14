import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { load, entries } from './+page';
import type { PageData } from './$types';

// Mock $app/state + $app/paths BEFORE Page import. Distinct identifier
// (`mockPageWk`) avoids cross-file collision.
const { mockPageWk } = vi.hoisted(() => ({
  mockPageWk: { url: new URL('http://localhost/'), route: { id: null as string | null } },
}));
vi.mock('$app/state', () => ({ page: mockPageWk }));
vi.mock('$app/paths', () => ({ base: '' }));

import { mount, unmount } from 'svelte';
import Page from './+page.svelte';

// PageData narrower: the same helper feeds both the load-shape assertions
// (result.category etc.) AND the mount tests (which need the strict Category enum).
async function callLoad(event: Parameters<typeof load>[0]): Promise<PageData> {
  const result = await load(event);
  if (!result) throw new Error('load() returned void');
  return result as PageData;
}

describe('/work/[category] +page.ts load — BRWS-02', () => {
  it('valid slug returns the matching category and its videos', async () => {
    const result = await callLoad({
      params: { category: 'pbs-american-portrait' },
    } as Parameters<typeof load>[0]);
    expect(result.category).toBe('PBS American Portrait');
    expect(result.videos.length).toBe(18);
  });

  it('all returned videos have category === result.category', async () => {
    const result = await callLoad({
      params: { category: 'reel' },
    } as Parameters<typeof load>[0]);
    expect(result.category).toBe('Reel');
    for (const v of result.videos) {
      expect(v.category).toBe('Reel');
    }
  });

  it('unknown slug throws 404', async () => {
    await expect(
      load({ params: { category: 'does-not-exist' } } as Parameters<typeof load>[0])
    ).rejects.toMatchObject({ status: 404 });
  });

  it('videos sorted featured-first then published date desc', async () => {
    const result = await callLoad({
      params: { category: 'pbs-american-portrait' },
    } as Parameters<typeof load>[0]);
    const nonFeatured = result.videos.filter((v: { featured: boolean }) => !v.featured);
    for (let i = 1; i < nonFeatured.length; i++) {
      expect(
        nonFeatured[i - 1]!.published.localeCompare(nonFeatured[i]!.published)
      ).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('/work/[category] +page.ts entries — prerender enumeration', () => {
  it('returns exactly 8 entries (one per category)', async () => {
    const result = entries();
    expect(Array.isArray(result)).toBe(true);
    expect((result as Array<{ category: string }>).length).toBe(8);
  });

  it('each entry has a non-empty category slug', async () => {
    const list = entries() as Array<{ category: string }>;
    for (const e of list) {
      expect(typeof e.category).toBe('string');
      expect(e.category.length).toBeGreaterThan(0);
      expect(e.category).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('entries include "pbs-american-portrait" and "reel"', async () => {
    const slugs = (entries() as Array<{ category: string }>).map((e) => e.category);
    expect(slugs).toContain('pbs-american-portrait');
    expect(slugs).toContain('reel');
  });
});

// ---------------------------------------------------------------------------
// PBS-only cross-link `→ About the PBS American Portrait project` rendered
// after the h1 and before the grid on /work/pbs-american-portrait/.
// ---------------------------------------------------------------------------

let hostWk: HTMLElement;
let componentWk: ReturnType<typeof mount> | undefined;
beforeEach(() => {
  mockPageWk.url = new URL('http://localhost/');
  mockPageWk.route = { id: '/work/[category]' };
});
afterEach(() => {
  if (componentWk) {
    unmount(componentWk);
    componentWk = undefined;
  }
  hostWk?.remove();
});
function makeHostWk(): HTMLElement {
  hostWk = document.createElement('div');
  document.body.appendChild(hostWk);
  return hostWk;
}

describe('/work/[category] — PBS cross-link', () => {
  it('PBS cross-link present when category === "PBS American Portrait"', async () => {
    const data = await callLoad({
      params: { category: 'pbs-american-portrait' },
    } as Parameters<typeof load>[0]);
    componentWk = mount(Page, { target: makeHostWk(), props: { data } });
    const crossLink = hostWk.querySelector('a[href="/pbs-american-portrait/"]');
    expect(crossLink).not.toBeNull();
    expect(crossLink?.textContent?.trim()).toContain('About the PBS American Portrait project');
  });

  it('PBS cross-link absent on non-PBS category (e.g. /work/reel)', async () => {
    const data = await callLoad({ params: { category: 'reel' } } as Parameters<typeof load>[0]);
    componentWk = mount(Page, { target: makeHostWk(), props: { data } });
    const crossLink = hostWk.querySelector('a[href="/pbs-american-portrait/"]');
    expect(crossLink).toBeNull();
  });
});
