import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { load } from './+page';
import type { PageData } from './$types';
import type { Video } from '$lib/data';

// Mock $app/state + $app/paths BEFORE Page import (same pattern as TopNav.test.ts).
const { mockPage } = vi.hoisted(() => ({
  mockPage: {
    url: new URL('http://localhost/pbs-american-portrait/'),
    route: { id: '/pbs-american-portrait' as string | null },
  },
}));
vi.mock('$app/state', () => ({ page: mockPage }));
vi.mock('$app/paths', () => ({ base: '' }));

import { mount, unmount } from 'svelte';
import Page from './+page.svelte';

// PageData narrower: returns the full PageData shape so `mount(Page, { props: { data } })`
// accepts it without prop-type errors; assertions cast to `Video[]` as needed.
async function callLoad(event: Parameters<typeof load>[0]): Promise<PageData> {
  const result = await load(event);
  if (!result) throw new Error('load() returned void');
  return result as PageData;
}

let host: HTMLElement;
let component: ReturnType<typeof mount> | undefined;
beforeEach(() => {
  mockPage.url = new URL('http://localhost/pbs-american-portrait/');
  mockPage.route = { id: '/pbs-american-portrait' };
});
afterEach(() => {
  if (component) {
    unmount(component);
    component = undefined;
  }
  host?.remove();
});
function makeHost(): HTMLElement {
  host = document.createElement('div');
  document.body.appendChild(host);
  return host;
}

describe('/pbs-american-portrait load — PBS-01 (sort, 18 cards)', () => {
  it('load returns 18 videos (all PBS)', async () => {
    const result = await callLoad({} as Parameters<typeof load>[0]);
    expect(result.videos.length).toBe(18);
    for (const v of result.videos) {
      expect((v as Video).category).toBe('PBS American Portrait');
    }
  });
  it('sort featured-first then published date desc', async () => {
    const result = await callLoad({} as Parameters<typeof load>[0]);
    // Featured rows precede non-featured.
    let sawNonFeatured = false;
    for (const v of result.videos) {
      if (!(v as Video & { featured: boolean }).featured) sawNonFeatured = true;
      else if (sawNonFeatured) throw new Error('featured row after non-featured — sort violated');
    }
    // Within non-featured: dates monotonically non-increasing.
    const nonFeatured = result.videos.filter((v) => !(v as Video & { featured: boolean }).featured);
    for (let i = 1; i < nonFeatured.length; i++) {
      expect(
        nonFeatured[i - 1]!.published.localeCompare(nonFeatured[i]!.published)
      ).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('/pbs-american-portrait render — PBS-01', () => {
  it('renders 18 cards', async () => {
    const data = await callLoad({} as Parameters<typeof load>[0]);
    component = mount(Page, { target: makeHost(), props: { data } });
    // VideoCard wraps each card in a single <a> with href /watch/[id] — count the anchors.
    const cardLinks = Array.from(host.querySelectorAll('a[href^="/watch/"]'));
    expect(cardLinks.length).toBe(18);
  });
  it('h1 has text-cat-pbs class and text "PBS American Portrait"', async () => {
    const data = await callLoad({} as Parameters<typeof load>[0]);
    component = mount(Page, { target: makeHost(), props: { data } });
    const h1 = host.querySelector('h1');
    expect(h1?.textContent?.trim()).toBe('PBS American Portrait');
    expect(h1?.className).toMatch(/text-cat-pbs/);
  });
  it('subtitle text present "18 stories produced by Michelle Ngo"', async () => {
    const data = await callLoad({} as Parameters<typeof load>[0]);
    component = mount(Page, { target: makeHost(), props: { data } });
    const subtitleP = Array.from(host.querySelectorAll('p')).find(
      (p) => p.textContent?.trim() === '18 stories produced by Michelle Ngo'
    );
    expect(subtitleP).toBeDefined();
  });
  it('blockquote rendered with non-trivial body', async () => {
    const data = await callLoad({} as Parameters<typeof load>[0]);
    component = mount(Page, { target: makeHost(), props: { data } });
    const bq = host.querySelector('blockquote');
    expect(bq).toBeDefined();
    expect(bq?.textContent?.trim().length ?? 0).toBeGreaterThanOrEqual(20);
  });
  it('outbound link attrs: target=_blank rel=noopener', async () => {
    const data = await callLoad({} as Parameters<typeof load>[0]);
    component = mount(Page, { target: makeHost(), props: { data } });
    const outbound = host.querySelector('a[href="https://www.pbs.org/american-portrait/"]');
    expect(outbound).toBeDefined();
    expect(outbound?.getAttribute('target')).toBe('_blank');
    expect(outbound?.getAttribute('rel')).toBe('noopener');
  });
  it('h2 "Stories" present', async () => {
    const data = await callLoad({} as Parameters<typeof load>[0]);
    component = mount(Page, { target: makeHost(), props: { data } });
    const h2 = host.querySelector('h2');
    expect(h2?.textContent?.trim()).toBe('Stories');
  });
  it('canonical link present (SEO-01)', async () => {
    const data = await callLoad({} as Parameters<typeof load>[0]);
    component = mount(Page, { target: makeHost(), props: { data } });
    // svelte:head renders to document.head, not the mount host.
    const canonical = document.head.querySelector(
      'link[rel="canonical"][href="https://michellengo.net/pbs-american-portrait/"]'
    );
    expect(canonical).not.toBeNull();
  });
});

describe('/pbs-american-portrait per-card PBS badges', () => {
  it('15 "See on PBS →" badges rendered (3 PBS videos have no collection URL)', async () => {
    const data = await callLoad({} as Parameters<typeof load>[0]);
    component = mount(Page, { target: makeHost(), props: { data } });
    const badges = Array.from(
      host.querySelectorAll('a[href*="pbs.org/american-portrait/collection/"]')
    );
    expect(badges.length).toBe(15);
    for (const b of badges) {
      expect(b.getAttribute('target')).toBe('_blank');
      expect(b.getAttribute('rel')).toBe('noopener');
      expect(b.textContent?.trim()).toContain('See on PBS');
    }
  });
});
