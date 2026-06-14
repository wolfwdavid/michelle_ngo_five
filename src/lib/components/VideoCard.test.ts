import { afterEach, describe, expect, it } from 'vitest';
import { mount, unmount } from 'svelte';
import VideoCard from './VideoCard.svelte';
import { getById, type Video } from '$lib/data';

let host: HTMLElement;
let component: ReturnType<typeof mount> | undefined;

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

function reel(): Video {
  const v = getById('264677021');
  if (!v) throw new Error('test fixture missing: vimeo:264677021');
  return v;
}

describe('VideoCard — GRID-01 (thumb + title + tag + uploader)', () => {
  it('renders thumb img with the video thumbnail URL', () => {
    component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
    const img = host.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe(reel().thumbnail);
  });

  it('renders title as h3 with the video title', () => {
    component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
    const h3 = host.querySelector('h3');
    expect(h3?.textContent?.trim()).toBe(reel().title);
  });

  it('renders uploader text', () => {
    component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
    expect(host.textContent).toContain(reel().uploader);
  });

  it('renders category tag with the video category text', () => {
    component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
    expect(host.textContent).toContain(reel().category);
  });

  it('alt attribute matches video.title (D-18)', () => {
    component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
    const img = host.querySelector('img');
    expect(img?.getAttribute('alt')).toBe(reel().title);
  });
});

describe('VideoCard — GRID-03 lazy loading (D-17)', () => {
  it('eager prop defaults to false → loading="lazy"', () => {
    component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
    const img = host.querySelector('img');
    expect(img?.getAttribute('loading')).toBe('lazy');
  });

  it('eager={true} → loading="eager" (first 8 above the fold)', () => {
    component = mount(VideoCard, { target: makeHost(), props: { video: reel(), eager: true } });
    const img = host.querySelector('img');
    expect(img?.getAttribute('loading')).toBe('eager');
  });

  it('decoding="async" on every thumb (D-17)', () => {
    component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
    expect(host.querySelector('img')?.getAttribute('decoding')).toBe('async');
  });

  it('thumb wrapper uses aspect-video class (D-10) and bg-neutral-900 (D-16)', () => {
    component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
    const wrapper = host.querySelector('img')?.parentElement;
    expect(wrapper?.className).toMatch(/aspect-video/);
    expect(wrapper?.className).toMatch(/bg-neutral-900/);
  });

  it('img has transition-opacity class for D-16 fade-in', () => {
    component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
    expect(host.querySelector('img')?.className).toMatch(/transition-opacity/);
  });
});

describe('VideoCard — GRID-04 click target (D-13, D-14)', () => {
  it('whole card is a single <a> link', () => {
    component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
    // The card itself wraps everything in an <a>.
    const links = host.querySelectorAll('a');
    expect(links.length).toBe(1);
  });

  it('href ends with /watch/<video.id> (BASE_PATH-safe)', () => {
    component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
    const a = host.querySelector('a');
    expect(a?.getAttribute('href')).toMatch(/\/watch\/264677021$/);
  });

  it('has data-sveltekit-preload-data="hover" attribute (D-14)', () => {
    component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
    const a = host.querySelector('a');
    expect(a?.getAttribute('data-sveltekit-preload-data')).toBe('hover');
  });

  it('category chip on the card is NOT a nested <a> (D-13 — invalid HTML)', () => {
    component = mount(VideoCard, { target: makeHost(), props: { video: reel() } });
    // The chip should be a <span>, not an <a>. Total <a> count is 1 (the outer card).
    expect(host.querySelectorAll('a').length).toBe(1);
  });
});
