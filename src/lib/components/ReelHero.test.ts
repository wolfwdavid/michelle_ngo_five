import { afterEach, describe, expect, it } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import ReelHero from './ReelHero.svelte';

// ReelHero contract (HERO-01..04 / HOME-06):
//   - leads with the wordmark <h1> + a one-line tagline + a single PLAY REEL CTA
//   - the LCP poster <img> is eager + fetchpriority=high + explicit width/height
//     (never loading="lazy") so it never regresses LCP and causes no CLS (HERO-04)
//   - mounts ZERO iframes before any click (the reel iframe lives only inside the
//     ReelLightbox, which is closed on load) — HOME-06 / Pitfall B
//   - the PLAY REEL control is an <a> whose href ends with /watch/264677021/ so it
//     works with NO JS (HERO-02 fallback); clicking it (JS) opens the reel dialog

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
  component = mount(ReelHero, { target: host, props: {} });
  return host;
}

// The single PLAY REEL control: the <a> whose href targets the reel watch page.
function playReel(): HTMLAnchorElement {
  const links = Array.from(host.querySelectorAll<HTMLAnchorElement>('a'));
  const reel = links.filter((a) => /watch\/264677021\/?$/.test(a.getAttribute('href') ?? ''));
  expect(reel.length).toBe(1);
  return reel[0]!;
}

describe('ReelHero — cinematic hero (HERO-01..04)', () => {
  it('leads with the Michelle Ngo wordmark and a one-line tagline', () => {
    render();
    expect(host.querySelector('h1')?.textContent).toContain('Michelle Ngo');
    const p = host.querySelector('p');
    expect(p?.textContent?.trim().length ?? 0).toBeGreaterThan(0);
  });

  it('LCP poster <img> is eager + fetchpriority=high + dimensioned, never lazy (HERO-04)', () => {
    render();
    const img = host.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('loading')).toBe('eager');
    expect(img?.getAttribute('fetchpriority')).toBe('high');
    expect(img?.getAttribute('width')).toBeTruthy();
    expect(img?.getAttribute('height')).toBeTruthy();
    expect(img?.getAttribute('loading')).not.toBe('lazy');
  });

  it('mounts ZERO iframes before any click (HOME-06 / Pitfall B)', () => {
    render();
    expect(host.querySelector('iframe')).toBeNull();
  });

  it('exposes exactly one PLAY REEL control: an <a> to /watch/264677021/ (HERO-02 no-JS fallback)', () => {
    render();
    const reel = playReel();
    expect(reel.getAttribute('href')).toMatch(/watch\/264677021\/$/);
  });

  it('clicking PLAY REEL (with JS) opens the reel dialog with an iframe (HERO-02)', () => {
    render();
    expect(host.querySelector('[role="dialog"]')).toBeNull();
    playReel().click();
    flushSync();
    const dialog = host.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    const iframe = host.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe?.getAttribute('src')).toContain('264677021');
  });
});
