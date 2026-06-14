import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { load } from './+page';
import type { PageData } from './$types';

// Mock $app/state + $app/paths BEFORE Page import.
const { mockPagePress } = vi.hoisted(() => ({
  mockPagePress: {
    url: new URL('http://localhost/press/'),
    route: { id: '/press' as string | null },
  },
}));
vi.mock('$app/state', () => ({ page: mockPagePress }));
vi.mock('$app/paths', () => ({ base: '' }));

import { mount, unmount } from 'svelte';
import Page from './+page.svelte';

async function callLoad(): Promise<PageData> {
  const event = {} as Parameters<typeof load>[0];
  const result = await load(event);
  if (!result) throw new Error('load() returned void');
  return result as PageData;
}

let host: HTMLElement;
let component: ReturnType<typeof mount> | undefined;
beforeEach(() => {
  mockPagePress.url = new URL('http://localhost/press/');
  mockPagePress.route = { id: '/press' };
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

const EXPECTED_PRESTIGE_ORDER = [
  'HBO Max',
  'HBO',
  'PBS',
  'ABC News',
  'U2',
  'Amazon News',
  'Music Box Films',
  'Monument Releasing',
  'Cargo Film & Releasing',
  'AZPM',
  'HBODocs',
  'GrasshalmClips',
  'Lenny Cooke (Movie)',
];

describe('/press load — PAGE-02', () => {
  it('returns 13 groups in prestige order', async () => {
    const data = await callLoad();
    expect(data.groups.length).toBe(13);
    expect(data.groups.map((g) => g.network)).toEqual(EXPECTED_PRESTIGE_ORDER);
  });
});

describe('/press render — composition', () => {
  it('renders h1 with exact text "Press"', async () => {
    const data = await callLoad();
    component = mount(Page, { target: makeHost(), props: { data } });
    const h1 = host.querySelector('h1');
    expect(h1?.textContent?.trim()).toBe('Press');
  });

  it('renders 13 <section> elements with h2 labels in prestige order', async () => {
    const data = await callLoad();
    component = mount(Page, { target: makeHost(), props: { data } });
    const sections = Array.from(host.querySelectorAll('section'));
    expect(sections.length).toBe(13);
    const h2Texts = sections.map((s) => s.querySelector('h2')?.textContent?.trim() ?? '');
    expect(h2Texts).toEqual(EXPECTED_PRESTIGE_ORDER);
  });

  it('renders 13 credit anchors total, each pointing to /watch/[id] with hover prefetch', async () => {
    const data = await callLoad();
    component = mount(Page, { target: makeHost(), props: { data } });
    const creditLinks = Array.from(host.querySelectorAll('a[href^="/watch/"]'));
    expect(creditLinks.length).toBe(13);
    for (const a of creditLinks) {
      expect(a.getAttribute('data-sveltekit-preload-data')).toBe('hover');
      expect(a.getAttribute('href')).toMatch(/^\/watch\/.+$/);
    }
  });

  it('no section h2 carries a count suffix', async () => {
    const data = await callLoad();
    component = mount(Page, { target: makeHost(), props: { data } });
    const h2s = Array.from(host.querySelectorAll('h2'));
    for (const h of h2s) {
      expect(h.textContent?.trim() ?? '').not.toMatch(/\(\d+\)\s*$/);
    }
  });

  it('container uses max-w-3xl editorial width', async () => {
    const data = await callLoad();
    component = mount(Page, { target: makeHost(), props: { data } });
    const main = host.querySelector('main');
    expect(main?.className).toContain('max-w-3xl');
    expect(main?.className).toContain('px-4');
    expect(main?.className).toContain('sm:px-6');
    expect(main?.className).toContain('lg:px-8');
  });
});
