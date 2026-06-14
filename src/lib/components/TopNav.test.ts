import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock $app/state's `page` rune-style export BEFORE importing TopNav.
// The mock is mutable per-test: tests overwrite `mockPage.url` to simulate route changes.
//
// `vi.mock` is hoisted to the top of the file by Vitest's transformer (above all
// imports). Plain top-level `const` declarations are NOT hoisted with it, which
// produces a TDZ "Cannot access 'mockPage' before initialization" error when the
// mock factory runs. `vi.hoisted` lifts the const initialization alongside the
// mock so the factory can safely reference it (Vitest 4 idiom).
const { mockPage } = vi.hoisted(() => ({
  mockPage: {
    url: new URL('http://localhost/'),
    route: { id: '/' as string | null },
  },
}));
vi.mock('$app/state', () => ({ page: mockPage }));

// Mock $app/paths so the test doesn't depend on BASE_PATH being set during vitest run.
vi.mock('$app/paths', () => ({ base: '' }));

import { flushSync, mount, unmount } from 'svelte';
import TopNav from './TopNav.svelte';
import { getCategoriesInDisplayOrder } from '$lib/data';

let host: HTMLElement;
let component: ReturnType<typeof mount> | undefined;

beforeEach(() => {
  mockPage.url = new URL('http://localhost/');
  mockPage.route = { id: '/' };
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

describe('TopNav — NAV-01 baseline rendering (D-39, D-40)', () => {
  it('renders the MICHELLE NGO wordmark linking to /', () => {
    component = mount(TopNav, { target: makeHost(), props: {} });
    // Wordmark is the first <a> inside <header>; href is base+'/' or just '/'.
    const wordmark = host.querySelector('header a');
    expect(wordmark?.textContent?.toLowerCase()).toContain('michelle ngo');
  });

  it('renders all 8 category links in getCategoriesInDisplayOrder() order', () => {
    component = mount(TopNav, { target: makeHost(), props: {} });
    const order = getCategoriesInDisplayOrder();
    const linkTexts = Array.from(host.querySelectorAll('a'))
      .map((a) => a.textContent?.trim() ?? '')
      .filter((t) => order.includes(t as (typeof order)[number]));
    expect(linkTexts).toEqual(order);
  });

  it('renders About / Press / Contact secondary links', () => {
    component = mount(TopNav, { target: makeHost(), props: {} });
    const texts = Array.from(host.querySelectorAll('a')).map((a) => a.textContent?.trim());
    expect(texts).toContain('About');
    expect(texts).toContain('Press');
    expect(texts).toContain('Contact');
  });

  it('PBS link uses /pbs-american-portrait/ href (D-02); other 7 categories use /work/<slug>', () => {
    component = mount(TopNav, { target: makeHost(), props: {} });
    const pbsLink = Array.from(host.querySelectorAll('a')).find(
      (a) => a.textContent?.trim() === 'PBS American Portrait'
    );
    // PBS retargeted to /pbs-american-portrait/ (special-cased; trailing slash matches trailingSlash='always').
    // The 7 other category links still use /work/<slug>.
    expect(pbsLink?.getAttribute('href')).toBe('/pbs-american-portrait/');
    const reelLink = Array.from(host.querySelectorAll('a')).find(
      (a) => a.textContent?.trim() === 'Reel'
    );
    expect(reelLink?.getAttribute('href')).toBe('/work/reel');
  });
});

describe('TopNav — active state (D-41)', () => {
  it('on /work/pbs-american-portrait, PBS link gets cat-pbs accent class', () => {
    mockPage.url = new URL('http://localhost/work/pbs-american-portrait');
    component = mount(TopNav, { target: makeHost(), props: {} });
    const pbsLink = Array.from(host.querySelectorAll('a')).find(
      (a) => a.textContent?.trim() === 'PBS American Portrait'
    );
    expect(pbsLink?.className).toMatch(/text-cat-pbs/);
  });

  it('on /work/pbs-american-portrait/ (trailing slash, production shape under trailingSlash=always), PBS link still gets cat-pbs accent class', () => {
    // src/routes/+layout.ts sets `trailingSlash = 'always'`, so the production
    // URL on a /work/<slug>/ prerendered page carries a trailing slash.
    // isActive(slug) MUST normalize pathname before comparison or the active
    // branch is unreachable.
    mockPage.url = new URL('http://localhost/work/pbs-american-portrait/');
    component = mount(TopNav, { target: makeHost(), props: {} });
    const pbsLink = Array.from(host.querySelectorAll('a')).find(
      (a) => a.textContent?.trim() === 'PBS American Portrait'
    );
    expect(pbsLink?.className).toMatch(/text-cat-pbs/);
  });

  it('on /work (no filter), no category link is highlighted', () => {
    mockPage.url = new URL('http://localhost/work');
    component = mount(TopNav, { target: makeHost(), props: {} });
    const order = getCategoriesInDisplayOrder();
    const highlighted = Array.from(host.querySelectorAll('a'))
      .filter((a) => order.includes((a.textContent?.trim() ?? '') as (typeof order)[number]))
      .filter((a) => /text-cat-/.test(a.className));
    expect(highlighted.length).toBe(0);
  });

  it('on /watch/<id>, no category link is highlighted (D-41)', () => {
    mockPage.url = new URL('http://localhost/watch/264677021');
    component = mount(TopNav, { target: makeHost(), props: {} });
    const order = getCategoriesInDisplayOrder();
    const highlighted = Array.from(host.querySelectorAll('a'))
      .filter((a) => order.includes((a.textContent?.trim() ?? '') as (typeof order)[number]))
      .filter((a) => /text-cat-/.test(a.className));
    expect(highlighted.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// D-13 / D-14: scroll-aware TopNav on `/` only.
// ---------------------------------------------------------------------------

function makeSentinel(): HTMLElement {
  // The Phase-3 hero renders <div id="hero-sentinel"> inside the hero section.
  // Tests construct the sentinel inline to simulate the hero having mounted.
  const sentinel = document.createElement('div');
  sentinel.id = 'hero-sentinel';
  document.body.appendChild(sentinel);
  return sentinel;
}

describe('TopNav — D-13 scroll-aware on home', () => {
  it('scroll-aware home: on route "/", TopNav attaches an IntersectionObserver on #hero-sentinel', () => {
    mockPage.route = { id: '/' };
    mockPage.url = new URL('http://localhost/');
    const sentinel = makeSentinel();
    // Spy on the global stub so we can verify observe() was called with the sentinel.
    const observed: Element[] = [];
    const originalIO = globalThis.IntersectionObserver;
    class TrackingIO {
      observe = (el: Element) => observed.push(el);
      disconnect = vi.fn();
      unobserve = vi.fn();
      takeRecords = () => [];
      root = null;
      rootMargin = '';
      thresholds = [];
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      constructor(_cb: IntersectionObserverCallback) {}
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    globalThis.IntersectionObserver = TrackingIO as any;
    try {
      component = mount(TopNav, { target: makeHost(), props: {} });
      // Svelte 5 $effect runs on a microtask queue after mount() returns;
      // flushSync drains it so observer.observe(sentinel) has fired before assertion.
      flushSync();
      expect(observed).toContain(sentinel);
    } finally {
      globalThis.IntersectionObserver = originalIO;
      sentinel.remove();
    }
  });

  it('scroll-aware home: TopNav <header> has bg-neutral-950 class by default (sentinel not intersecting)', () => {
    mockPage.route = { id: '/' };
    mockPage.url = new URL('http://localhost/');
    makeSentinel();
    component = mount(TopNav, { target: makeHost(), props: {} });
    // Default: heroVisible=false → solid bg.
    const header = host.querySelector('header');
    expect(header?.className).toMatch(/bg-neutral-950/);
  });
});

describe('TopNav — D-13 solid on non-home routes', () => {
  it('solid on non-home: on /work, TopNav <header> renders bg-neutral-950 (no transparent class)', () => {
    mockPage.route = { id: '/work' };
    mockPage.url = new URL('http://localhost/work/');
    component = mount(TopNav, { target: makeHost(), props: {} });
    const header = host.querySelector('header');
    expect(header?.className).toMatch(/bg-neutral-950/);
    expect(header?.className).not.toMatch(/bg-transparent/);
  });

  it('solid on non-home: on /work/[category], TopNav stays solid', () => {
    mockPage.route = { id: '/work/[category]' };
    mockPage.url = new URL('http://localhost/work/pbs-american-portrait/');
    component = mount(TopNav, { target: makeHost(), props: {} });
    const header = host.querySelector('header');
    expect(header?.className).toMatch(/bg-neutral-950/);
    expect(header?.className).not.toMatch(/bg-transparent/);
  });

  it('solid on non-home: on /watch/[id], TopNav stays solid', () => {
    mockPage.route = { id: '/watch/[id]' };
    mockPage.url = new URL('http://localhost/watch/264677021/');
    component = mount(TopNav, { target: makeHost(), props: {} });
    const header = host.querySelector('header');
    expect(header?.className).toMatch(/bg-neutral-950/);
    expect(header?.className).not.toMatch(/bg-transparent/);
  });

  it('solid on non-home: on /about, TopNav stays solid', () => {
    mockPage.route = { id: '/about' };
    mockPage.url = new URL('http://localhost/about/');
    component = mount(TopNav, { target: makeHost(), props: {} });
    const header = host.querySelector('header');
    expect(header?.className).toMatch(/bg-neutral-950/);
    expect(header?.className).not.toMatch(/bg-transparent/);
  });

  it('solid on non-home: on /press, TopNav stays solid', () => {
    mockPage.route = { id: '/press' };
    mockPage.url = new URL('http://localhost/press/');
    component = mount(TopNav, { target: makeHost(), props: {} });
    const header = host.querySelector('header');
    expect(header?.className).toMatch(/bg-neutral-950/);
    expect(header?.className).not.toMatch(/bg-transparent/);
  });

  it('solid on non-home: on /contact, TopNav stays solid', () => {
    mockPage.route = { id: '/contact' };
    mockPage.url = new URL('http://localhost/contact/');
    component = mount(TopNav, { target: makeHost(), props: {} });
    const header = host.querySelector('header');
    expect(header?.className).toMatch(/bg-neutral-950/);
    expect(header?.className).not.toMatch(/bg-transparent/);
  });
});

// ---------------------------------------------------------------------------
// D-02 + D-03: retarget PBS link to /pbs-american-portrait/ and extend
// active-state to highlight on BOTH /pbs-american-portrait/ AND
// /work/pbs-american-portrait/. Other 7 category links still point to /work/<slug>.
// ---------------------------------------------------------------------------

describe('TopNav — PBS retarget + active-state extension', () => {
  it('D-02: PBS link href is /pbs-american-portrait/ (retargeted from /work/pbs-american-portrait; trailing slash matches D-01 trailingSlash=always)', () => {
    component = mount(TopNav, { target: makeHost(), props: {} });
    const pbsLink = Array.from(host.querySelectorAll('a')).find(
      (a) => a.textContent?.trim() === 'PBS American Portrait'
    );
    expect(pbsLink?.getAttribute('href')).toBe('/pbs-american-portrait/');
  });

  it('D-02 regression: non-PBS category links still point to /work/<slug>', () => {
    component = mount(TopNav, { target: makeHost(), props: {} });
    // Pick any non-PBS category — Reel is a known slug in the taxonomy.
    const reelLink = Array.from(host.querySelectorAll('a')).find(
      (a) => a.textContent?.trim() === 'Reel'
    );
    expect(reelLink?.getAttribute('href')).toBe('/work/reel');
  });

  it('D-03: on /pbs-american-portrait/, PBS link gets cat-pbs accent class (NEW surface)', () => {
    mockPage.url = new URL('http://localhost/pbs-american-portrait/');
    mockPage.route = { id: '/pbs-american-portrait' };
    component = mount(TopNav, { target: makeHost(), props: {} });
    const pbsLink = Array.from(host.querySelectorAll('a')).find(
      (a) => a.textContent?.trim() === 'PBS American Portrait'
    );
    expect(pbsLink?.className).toMatch(/text-cat-pbs/);
  });

  it('D-03 regression: on /work/pbs-american-portrait/, PBS link STILL gets cat-pbs accent class (existing surface preserved)', () => {
    mockPage.url = new URL('http://localhost/work/pbs-american-portrait/');
    mockPage.route = { id: '/work/[category]' };
    component = mount(TopNav, { target: makeHost(), props: {} });
    const pbsLink = Array.from(host.querySelectorAll('a')).find(
      (a) => a.textContent?.trim() === 'PBS American Portrait'
    );
    expect(pbsLink?.className).toMatch(/text-cat-pbs/);
  });

  it('D-03 disambiguation: on /pbs-american-portrait/, OTHER category links are NOT highlighted', () => {
    mockPage.url = new URL('http://localhost/pbs-american-portrait/');
    mockPage.route = { id: '/pbs-american-portrait' };
    component = mount(TopNav, { target: makeHost(), props: {} });
    const order = getCategoriesInDisplayOrder();
    const highlighted = Array.from(host.querySelectorAll('a'))
      .filter((a) => order.includes((a.textContent?.trim() ?? '') as (typeof order)[number]))
      .filter((a) => /text-cat-/.test(a.className))
      .map((a) => a.textContent?.trim());
    expect(highlighted).toEqual(['PBS American Portrait']);
  });
});
