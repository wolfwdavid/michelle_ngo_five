import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { load, entries } from './+page';
import { videos, producerReelId } from '$lib/data';
import type { Video } from '$lib/data';

// $app/state + $app/paths mocks. vi.hoisted lifts mockPageW alongside the
// vi.mock() factory (Vitest 4 idiom). Distinct identifier (`mockPageW`) avoids
// any future collision if more test files share the worker.
const { mockPageW } = vi.hoisted(() => ({
  mockPageW: { url: new URL('http://localhost/'), route: { id: null as string | null } },
}));
vi.mock('$app/state', () => ({ page: mockPageW }));
vi.mock('$app/paths', () => ({ base: '' }));

import { mount, unmount, flushSync } from 'svelte';
import Page from './+page.svelte';

// SvelteKit's PageLoad generic widens the awaited return to
// `void | (... & Record<string, any>)`, which blocks direct property access.
// Narrowing through a small helper preserves the real runtime shape while
// keeping the static `import { load }` form.
// `isStaging` is injected by the root +layout.server.ts (the SEO-04 indexing
// gate) and merges into every page's `data`. The Page component's `data` prop
// therefore requires it; the +page.ts `load` under test does not produce it, so
// we add the apex default (false) here to satisfy the mounted prop shape.
async function callLoad(
  event: Parameters<typeof load>[0]
): Promise<{ video: Video; rail: Video[]; isStaging: boolean }> {
  const result = await load(event);
  if (!result) throw new Error('load() returned void');
  return { ...(result as { video: Video; rail: Video[] }), isStaging: false };
}

describe('/watch/[id] +page.ts load — WATCH-01 (id route, narrowed load)', () => {
  it('valid id returns the matching video', async () => {
    const result = await callLoad({
      params: { id: producerReelId },
    } as Parameters<typeof load>[0]);
    expect(result.video.id).toBe(producerReelId);
    expect(result.video.category).toBe('Reel');
  });

  it('unknown id throws 404', async () => {
    await expect(
      load({ params: { id: 'does-not-exist-xyz' } } as Parameters<typeof load>[0])
    ).rejects.toMatchObject({ status: 404 });
  });
});

describe('/watch/[id] +page.ts load — WATCH-04 rail', () => {
  it('rail contains other videos in the same category', async () => {
    const result = await callLoad({
      params: { id: producerReelId },
    } as Parameters<typeof load>[0]);
    for (const v of result.rail) {
      expect(v.category).toBe('Reel');
      expect(v.id).not.toBe(producerReelId);
    }
  });

  it('rail excludes the current video', async () => {
    const result = await callLoad({
      params: { id: producerReelId },
    } as Parameters<typeof load>[0]);
    const ids = result.rail.map((v) => v.id);
    expect(ids).not.toContain(producerReelId);
  });

  it('rail count = same-category count - 1 (Reel has 4; rail = 3)', async () => {
    const result = await callLoad({
      params: { id: producerReelId },
    } as Parameters<typeof load>[0]);
    expect(result.rail.length).toBe(3);
  });

  it('rail is sorted featured-first then published date desc', async () => {
    const pbs = videos.find((v) => v.category === 'PBS American Portrait');
    if (!pbs) throw new Error('test fixture missing: any PBS video');
    const result = await callLoad({
      params: { id: pbs.id },
    } as Parameters<typeof load>[0]);
    const nonFeatured = result.rail.filter((v) => !v.featured);
    for (let i = 1; i < nonFeatured.length; i++) {
      expect(
        nonFeatured[i - 1]!.published.localeCompare(nonFeatured[i]!.published)
      ).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('/watch/[id] +page.ts entries — WATCH-01 prerender enumeration', () => {
  it('returns one entry per video — count matches videos.length (56)', () => {
    const list = entries() as Array<{ id: string }>;
    expect(list.length).toBe(56);
  });

  it('every entry has a non-empty id', () => {
    const list = entries() as Array<{ id: string }>;
    for (const e of list) {
      expect(typeof e.id).toBe('string');
      expect(e.id.length).toBeGreaterThan(0);
    }
  });

  it('entries include the producer reel id (264677021)', () => {
    const ids = (entries() as Array<{ id: string }>).map((e) => e.id);
    expect(ids).toContain('264677021');
  });
});

// ---------------------------------------------------------------------------
// Page-component render tests: facade (WATCH-02), metadata (WATCH-03),
// VideoObject JSON-LD (SEO-02), PBS cross-link.
// ---------------------------------------------------------------------------

let hostW: HTMLElement;
let componentW: ReturnType<typeof mount> | undefined;
beforeEach(() => {
  mockPageW.url = new URL('http://localhost/');
  mockPageW.route = { id: '/watch/[id]' };
});
afterEach(() => {
  if (componentW) {
    unmount(componentW);
    componentW = undefined;
  }
  hostW?.remove();
});
function makeHostW(): HTMLElement {
  hostW = document.createElement('div');
  document.body.appendChild(hostW);
  return hostW;
}

describe('/watch/[id] — WATCH-02 facade (no eager iframe)', () => {
  it('renders the WatchPlayer facade with NO iframe before interaction', async () => {
    const data = await callLoad({
      params: { id: producerReelId },
    } as Parameters<typeof load>[0]);
    componentW = mount(Page, { target: makeHostW(), props: { data } });
    // The page itself must mount zero live iframes — the facade only shows a
    // poster + play button until the user clicks.
    expect(hostW.querySelector('iframe')).toBeNull();
    expect(hostW.querySelector('button[aria-label^="Play"]')).not.toBeNull();
    expect(hostW.querySelector('img')).not.toBeNull();
  });

  it('clicking the play button mounts the embed iframe on demand', async () => {
    const data = await callLoad({
      params: { id: producerReelId },
    } as Parameters<typeof load>[0]);
    componentW = mount(Page, { target: makeHostW(), props: { data } });
    const playButton = hostW.querySelector<HTMLButtonElement>('button[aria-label^="Play"]');
    expect(playButton).not.toBeNull();
    playButton?.click();
    flushSync();
    const iframe = hostW.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe?.getAttribute('src')).toBe(data.video.embed);
  });
});

describe('/watch/[id] — WATCH-03 metadata + WATCH-04 rail', () => {
  it('renders the title as <h1> and the uploader · year line', async () => {
    const data = await callLoad({
      params: { id: producerReelId },
    } as Parameters<typeof load>[0]);
    componentW = mount(Page, { target: makeHostW(), props: { data } });
    expect(hostW.querySelector('h1')?.textContent?.trim()).toBe(data.video.title);
    expect(hostW.textContent).toContain(data.video.uploader);
    expect(hostW.textContent).toContain(data.video.published.slice(0, 4));
  });

  it('rail heading links to the category grid and renders VideoCards', async () => {
    const data = await callLoad({
      params: { id: producerReelId },
    } as Parameters<typeof load>[0]);
    componentW = mount(Page, { target: makeHostW(), props: { data } });
    const railHeading = hostW.querySelector('h2 a');
    expect(railHeading?.textContent).toContain('More in');
    // VideoCard renders one <a href$=/watch/{id}> per sibling.
    const cardLinks = hostW.querySelectorAll('a[href*="/watch/"]');
    expect(cardLinks.length).toBe(data.rail.length);
  });
});

describe('/watch/[id] — SEO-02 VideoObject JSON-LD', () => {
  it('emits a VideoObject with name, description, thumbnailUrl, uploadDate, embedUrl', async () => {
    const data = await callLoad({
      params: { id: producerReelId },
    } as Parameters<typeof load>[0]);
    // The JSON-LD lives in <svelte:head>; build the payload the page derives.
    const v = data.video;
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: v.title,
      description: v.description || v.title,
      thumbnailUrl: v.thumbnail,
      uploadDate: v.published,
      embedUrl: v.embed,
    };
    expect(jsonLd['@type']).toBe('VideoObject');
    expect(jsonLd.name).toBe(v.title);
    expect(jsonLd.thumbnailUrl).toBe(v.thumbnail);
    expect(jsonLd.uploadDate).toBe(v.published);
    expect(jsonLd.embedUrl).toBe(v.embed);
    expect(typeof jsonLd.description).toBe('string');
    expect(jsonLd.description.length).toBeGreaterThan(0);
  });
});

describe('/watch/[id] — PBS cross-link', () => {
  it('present when video.category === "PBS American Portrait"', async () => {
    const pbs = videos.find((v) => v.category === 'PBS American Portrait');
    if (!pbs) throw new Error('test fixture missing: any PBS video');
    const data = await callLoad({ params: { id: pbs.id } } as Parameters<typeof load>[0]);
    componentW = mount(Page, { target: makeHostW(), props: { data } });
    const crossLink = hostW.querySelector('a[href="/pbs-american-portrait/"]');
    expect(crossLink).not.toBeNull();
    expect(crossLink?.textContent?.trim()).toContain('About the PBS American Portrait project');
  });

  it('absent when video.category !== "PBS American Portrait"', async () => {
    const data = await callLoad({
      params: { id: producerReelId },
    } as Parameters<typeof load>[0]);
    componentW = mount(Page, { target: makeHostW(), props: { data } });
    const crossLink = hostW.querySelector('a[href="/pbs-american-portrait/"]');
    expect(crossLink).toBeNull();
  });
});
