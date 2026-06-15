import { afterEach, describe, expect, it } from 'vitest';
import { mount, unmount } from 'svelte';
import CategoryRail from './CategoryRail.svelte';
import type { Category, Video } from '$lib/data';

// CategoryRail contract (HOME-01..06): the rail is a labeled <section> wrapping a
// <ul> of focusable VideoCard <li><a> cards, with a base-safe "View all" link to
// the category page and pointer-only Prev/Next controls — and it mounts ZERO
// iframes (poster <img> only). These tests are the proof.

const category = 'Reel' as Category;

// A deterministic 3-item Reel fixture. Shapes copied from videos.json so they
// satisfy the Video type (vimeo branch: source/id/title/uploader/published/
// thumbnail/embed/url/category).
const videos: readonly Video[] = [
  {
    source: 'vimeo',
    id: '28447961',
    title: 'Producer Reel A',
    uploader: 'Michelle Ngo',
    published: '2011-09-01',
    thumbnail: 'https://example.com/a.jpg',
    embed: 'https://player.vimeo.com/video/28447961',
    url: 'https://vimeo.com/28447961',
    category,
  },
  {
    source: 'vimeo',
    id: '227307921',
    title: 'Producer Reel B',
    uploader: 'Michelle Ngo',
    published: '2017-06-01',
    thumbnail: 'https://example.com/b.jpg',
    embed: 'https://player.vimeo.com/video/227307921',
    url: 'https://vimeo.com/227307921',
    category,
  },
  {
    source: 'vimeo',
    id: '264677021',
    title: 'Producer Reel C',
    uploader: 'Michelle Ngo',
    published: '2018-03-01',
    thumbnail: 'https://example.com/c.jpg',
    embed: 'https://player.vimeo.com/video/264677021',
    url: 'https://vimeo.com/264677021',
    category,
  },
] as Video[];

let host: HTMLElement;
let component: ReturnType<typeof mount> | undefined;

afterEach(() => {
  if (component) {
    unmount(component);
    component = undefined;
  }
  host?.remove();
});

function render() {
  host = document.createElement('div');
  document.body.appendChild(host);
  component = mount(CategoryRail, { target: host, props: { category, videos } });
  return host;
}

describe('CategoryRail — HOME-01..06 accessible rail', () => {
  it('is a named region: <section aria-labelledby> points at an existing id (HOME-04)', () => {
    render();
    const section = host.querySelector('section');
    expect(section).not.toBeNull();
    const labelledby = section?.getAttribute('aria-labelledby');
    expect(labelledby).toBeTruthy();
    const label = host.querySelector(`#${labelledby}`);
    expect(label).not.toBeNull();
    expect(label?.textContent?.trim()).toBe(category);
  });

  it('renders a <ul> with one <li> card per video (list semantics, HOME-02/04)', () => {
    render();
    expect(host.querySelector('ul')).not.toBeNull();
    expect(host.querySelectorAll('ul > li').length).toBe(3);
  });

  it('mounts ZERO iframes — poster <img> only (HOME-06)', () => {
    render();
    expect(host.querySelector('iframe')).toBeNull();
  });

  it('has a "View all" link to /work/reel/ (HOME-05 destination parity)', () => {
    render();
    const anchors = Array.from(host.querySelectorAll('a'));
    const viewAll = anchors.find((a) => /view all/i.test(a.textContent ?? ''));
    expect(viewAll).toBeTruthy();
    expect(viewAll?.getAttribute('href')).toMatch(/\/work\/reel\/$/);
  });

  it('exposes exactly two Prev/Next <button type="button"> with scroll aria-labels (HOME-03)', () => {
    render();
    const buttons = Array.from(host.querySelectorAll('button[type="button"]'));
    expect(buttons.length).toBe(2);
    for (const b of buttons) {
      expect(b.getAttribute('aria-label')).toMatch(/scroll/i);
    }
  });

  it('every card anchor opens a /watch/ page (HOME-05)', () => {
    render();
    const cardLinks = Array.from(host.querySelectorAll('ul > li a'));
    expect(cardLinks.length).toBe(3);
    for (const a of cardLinks) {
      expect(a.getAttribute('href')).toMatch(/\/watch\//);
    }
  });
});
