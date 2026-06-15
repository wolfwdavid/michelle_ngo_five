import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockPageContact } = vi.hoisted(() => ({
  mockPageContact: {
    url: new URL('http://localhost/contact/'),
    route: { id: '/contact' as string | null },
  },
}));
vi.mock('$app/state', () => ({ page: mockPageContact }));
vi.mock('$app/paths', () => ({ base: '' }));

import { mount, unmount } from 'svelte';
import Page from './+page.svelte';

let host: HTMLElement;
let component: ReturnType<typeof mount> | undefined;
beforeEach(() => {
  mockPageContact.url = new URL('http://localhost/contact/');
  mockPageContact.route = { id: '/contact' };
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

describe('/contact — PAGE-03 composition', () => {
  it('renders h1 with exact text "Contact"', () => {
    component = mount(Page, { target: makeHost(), props: {} });
    const h1 = host.querySelector('h1');
    expect(h1?.textContent?.trim()).toBe('Contact');
  });

  it('container uses max-w-2xl editorial width', () => {
    component = mount(Page, { target: makeHost(), props: {} });
    // The <main id="main"> landmark now lives in +layout.svelte; the page owns the
    // editorial-width content container (a <section>).
    const container = host.querySelector('section.max-w-2xl');
    expect(container).not.toBeNull();
    expect(container?.className).toContain('mx-auto');
  });

  it('renders <ContactBlock /> with 5 channels in order (Email → Phone → IMDb → LinkedIn → Vimeo)', () => {
    component = mount(Page, { target: makeHost(), props: {} });
    const linkTexts = Array.from(host.querySelectorAll('a')).map((a) => a.textContent?.trim());
    expect(linkTexts).toEqual(['mynogo@gmail.com', '(917) 566-1976', 'IMDb', 'LinkedIn', 'Vimeo']);
  });

  it('does NOT render a <form> element (contact form Out of Scope; mailto: is the channel)', () => {
    component = mount(Page, { target: makeHost(), props: {} });
    const form = host.querySelector('form');
    expect(form).toBeNull();
  });
});
