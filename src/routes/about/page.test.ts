import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock $app/state + $app/paths BEFORE Page import.
const { mockPageAbout } = vi.hoisted(() => ({
  mockPageAbout: {
    url: new URL('http://localhost/about/'),
    route: { id: '/about' as string | null },
  },
}));
vi.mock('$app/state', () => ({ page: mockPageAbout }));
vi.mock('$app/paths', () => ({ base: '' }));

import { mount, unmount } from 'svelte';
import Page from './+page.svelte';

let host: HTMLElement;
let component: ReturnType<typeof mount> | undefined;
beforeEach(() => {
  mockPageAbout.url = new URL('http://localhost/about/');
  mockPageAbout.route = { id: '/about' };
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

describe('/about — PAGE-01 / composition', () => {
  it('renders h1 with exact text "About"', () => {
    component = mount(Page, { target: makeHost(), props: {} });
    const h1 = host.querySelector('h1');
    expect(h1?.textContent?.trim()).toBe('About');
  });

  it('renders a bio paragraph at least 80 chars long with at least one first-person token', () => {
    component = mount(Page, { target: makeHost(), props: {} });
    const paragraphs = Array.from(host.querySelectorAll('p'));
    const bio = paragraphs.find((p) => (p.textContent?.trim().length ?? 0) >= 80);
    expect(bio, 'bio paragraph (>=80 chars) not found').toBeDefined();
    const text = bio?.textContent ?? '';
    expect(
      /\bI'?m\b|\bI\s+(make|love|work|am)\b|\bmy\b/.test(text),
      `bio paragraph did not contain a first-person token: "${text.slice(0, 80)}..."`
    ).toBe(true);
  });

  it('container uses max-w-2xl editorial width', () => {
    component = mount(Page, { target: makeHost(), props: {} });
    const main = host.querySelector('main');
    expect(main?.className).toContain('max-w-2xl');
    expect(main?.className).toContain('mx-auto');
    expect(main?.className).toContain('px-4');
    expect(main?.className).toContain('sm:px-6');
    expect(main?.className).toContain('lg:px-8');
  });

  it('renders <ContactBlock /> with 5 channels in order (Email → Phone → IMDb → LinkedIn → Vimeo)', () => {
    component = mount(Page, { target: makeHost(), props: {} });
    const linkTexts = Array.from(host.querySelectorAll('a')).map((a) => a.textContent?.trim());
    expect(linkTexts).toEqual(['mynogo@gmail.com', '(917) 566-1976', 'IMDb', 'LinkedIn', 'Vimeo']);
  });
});
