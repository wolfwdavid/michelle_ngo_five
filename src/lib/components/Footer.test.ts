import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock $app/state + $app/paths BEFORE Footer import.
// mockPage required even though Footer doesn't read page.url directly —
// shared consumers in test environments may pull from $app/state through
// hoisted module side-effects. Defensive.
const { mockPageFooter } = vi.hoisted(() => ({
  mockPageFooter: {
    url: new URL('http://localhost/'),
    route: { id: '/' as string | null },
  },
}));
vi.mock('$app/state', () => ({ page: mockPageFooter }));
vi.mock('$app/paths', () => ({ base: '' }));

import { mount, unmount } from 'svelte';
import Footer from './Footer.svelte';
import { getCategoriesInDisplayOrder } from '$lib/data';

let host: HTMLElement;
let component: ReturnType<typeof mount> | undefined;
beforeEach(() => {
  mockPageFooter.url = new URL('http://localhost/');
  mockPageFooter.route = { id: '/' };
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

describe('Footer — D-24 / D-25 structure', () => {
  it('renders a <footer> element', () => {
    component = mount(Footer, { target: makeHost(), props: {} });
    const footer = host.querySelector('footer');
    expect(footer).not.toBeNull();
  });

  it('renders three columns (data-footer-col="contact" / "work" / "site")', () => {
    component = mount(Footer, { target: makeHost(), props: {} });
    const cols = Array.from(host.querySelectorAll('[data-footer-col]')).map((el) =>
      el.getAttribute('data-footer-col')
    );
    expect(cols).toEqual(['contact', 'work', 'site']);
  });
});

describe('Footer — D-26 column 1 (ContactBlock)', () => {
  it('column 1 contains the 5 channel rows in D-36 order (Email → Phone → IMDb → LinkedIn → Vimeo)', () => {
    component = mount(Footer, { target: makeHost(), props: {} });
    const col1 = host.querySelector('[data-footer-col="contact"]');
    expect(col1).not.toBeNull();
    const linkTexts = Array.from(col1!.querySelectorAll('a')).map((a) => a.textContent?.trim());
    expect(linkTexts).toEqual(['mynogo@gmail.com', '(917) 566-1976', 'IMDb', 'LinkedIn', 'Vimeo']);
  });

  it('column 1 email is mailto:mynogo@gmail.com', () => {
    component = mount(Footer, { target: makeHost(), props: {} });
    const col1 = host.querySelector('[data-footer-col="contact"]');
    const email = Array.from(col1!.querySelectorAll('a')).find(
      (a) => a.getAttribute('href') === 'mailto:mynogo@gmail.com'
    );
    expect(email).toBeDefined();
  });

  it('column 1 phone is tel:+19175661976', () => {
    component = mount(Footer, { target: makeHost(), props: {} });
    const col1 = host.querySelector('[data-footer-col="contact"]');
    const phone = Array.from(col1!.querySelectorAll('a')).find(
      (a) => a.getAttribute('href') === 'tel:+19175661976'
    );
    expect(phone).toBeDefined();
  });
});

describe('Footer — D-27 column 2 (mirrored categories)', () => {
  it('column 2 renders all 8 categories in getCategoriesInDisplayOrder() order', () => {
    component = mount(Footer, { target: makeHost(), props: {} });
    const col2 = host.querySelector('[data-footer-col="work"]');
    expect(col2).not.toBeNull();
    const order = getCategoriesInDisplayOrder();
    const linkTexts = Array.from(col2!.querySelectorAll('a')).map(
      (a) => a.textContent?.trim() ?? ''
    );
    // Filter to only category names (drop the column header if any non-link text is in <a>; here there isn't).
    expect(linkTexts).toEqual(Array.from(order));
  });

  it('PBS American Portrait link points to /pbs-american-portrait/ (D-02 inherited)', () => {
    component = mount(Footer, { target: makeHost(), props: {} });
    const col2 = host.querySelector('[data-footer-col="work"]');
    const pbsLink = Array.from(col2!.querySelectorAll('a')).find(
      (a) => a.textContent?.trim() === 'PBS American Portrait'
    );
    expect(pbsLink?.getAttribute('href')).toBe('/pbs-american-portrait/');
  });

  it('non-PBS category links use /work/<slug> (no trailing slash) — matches TopNav verbatim', () => {
    component = mount(Footer, { target: makeHost(), props: {} });
    const col2 = host.querySelector('[data-footer-col="work"]');
    const reelLink = Array.from(col2!.querySelectorAll('a')).find(
      (a) => a.textContent?.trim() === 'Reel'
    );
    expect(reelLink?.getAttribute('href')).toBe('/work/reel');
  });

  it('column 2 category links carry NO accent class (D-31 — footer stays mono)', () => {
    component = mount(Footer, { target: makeHost(), props: {} });
    const col2 = host.querySelector('[data-footer-col="work"]');
    const links = Array.from(col2!.querySelectorAll('a'));
    for (const a of links) {
      // No active-state per-category accent in footer. Class must NOT contain text-cat-*.
      expect(a.className).not.toMatch(/text-cat-/);
    }
  });
});

describe('Footer — D-28 column 3 (secondary nav)', () => {
  it('column 3 contains exactly 4 links in order: About / Press / Contact / View All Work →', () => {
    component = mount(Footer, { target: makeHost(), props: {} });
    const col3 = host.querySelector('[data-footer-col="site"]');
    expect(col3).not.toBeNull();
    const linkTexts = Array.from(col3!.querySelectorAll('a')).map((a) => a.textContent?.trim());
    expect(linkTexts).toEqual(['About', 'Press', 'Contact', 'View All Work →']);
  });

  it('column 3 hrefs match TopNav form: /about, /press, /contact, /work', () => {
    component = mount(Footer, { target: makeHost(), props: {} });
    const col3 = host.querySelector('[data-footer-col="site"]');
    const links = Array.from(col3!.querySelectorAll('a'));
    const hrefs = links.map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['/about', '/press', '/contact', '/work']);
  });
});

describe('Footer — D-29 bottom strip', () => {
  it('renders copyright + Built with SvelteKit literal', () => {
    component = mount(Footer, { target: makeHost(), props: {} });
    // Use textContent.includes to be whitespace-tolerant.
    const text = host.textContent ?? '';
    expect(text).toContain('© 2026 Michelle Ngo');
    expect(text).toContain('Built with SvelteKit');
  });

  it('bottom strip has a top border (hairline border-t border-white/10)', () => {
    component = mount(Footer, { target: makeHost(), props: {} });
    // The bottom-strip div carries `border-t border-white/10`.
    const strips = Array.from(host.querySelectorAll('div')).filter(
      (d) => d.className.includes('border-t') && d.className.includes('border-white/10')
    );
    // The footer's outer <footer> also has border-t border-white/10 (D-30 top border);
    // expect at least 1 element with the class combo carrying the copyright.
    expect(strips.length).toBeGreaterThanOrEqual(1);
    // Confirm at least one of these elements contains the copyright text.
    const stripWithCopy = strips.find((s) => (s.textContent ?? '').includes('© 2026'));
    expect(stripWithCopy, 'bottom strip with copyright not found').toBeDefined();
  });
});

describe('Footer — D-30 prefetch on all internal links', () => {
  it('every internal link in columns 2 + 3 has data-sveltekit-preload-data="hover"', () => {
    component = mount(Footer, { target: makeHost(), props: {} });
    // Columns 2 and 3 — internal site nav.
    const col2 = host.querySelector('[data-footer-col="work"]');
    const col3 = host.querySelector('[data-footer-col="site"]');
    const links = [
      ...Array.from(col2!.querySelectorAll('a')),
      ...Array.from(col3!.querySelectorAll('a')),
    ];
    // Sanity: 8 + 4 = 12 links.
    expect(links.length).toBe(12);
    for (const a of links) {
      expect(a.getAttribute('data-sveltekit-preload-data')).toBe('hover');
    }
  });
});
