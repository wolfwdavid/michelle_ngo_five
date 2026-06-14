import { afterEach, describe, expect, it } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import WatchPlayer from './WatchPlayer.svelte';

// WATCH-02 facade contract: the page mounts ZERO live iframes until the user
// clicks the play button. These tests are the proof — (a) no iframe on initial
// render, (b) clicking the labelled play button mounts an iframe with the embed
// src, (c) the play button exposes an accessible name containing the title.

const EMBED = 'https://player.vimeo.com/video/264677021';
const THUMB = 'https://example.com/poster.jpg';
const TITLE = 'Producer Reel';

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

function render() {
  component = mount(WatchPlayer, {
    target: makeHost(),
    props: { embed: EMBED, thumbnail: THUMB, title: TITLE },
  });
}

describe('WatchPlayer — WATCH-02 click-to-load facade', () => {
  it('initial render shows a poster img and NO iframe (facade only)', () => {
    render();
    expect(host.querySelector('iframe')).toBeNull();
    const img = host.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe(THUMB);
    expect(img?.getAttribute('alt')).toBe(TITLE);
  });

  it('reserves a 16:9 box (aspect-video) so there is no CLS', () => {
    render();
    expect(host.innerHTML).toMatch(/aspect-video/);
  });

  it('play affordance is a real <button> with an accessible name containing the title', () => {
    render();
    const button = host.querySelector('button');
    expect(button).not.toBeNull();
    expect(button?.getAttribute('type')).toBe('button');
    const accName = button?.getAttribute('aria-label') ?? button?.textContent?.trim() ?? '';
    expect(accName).toContain(TITLE);
  });

  it('clicking the play button mounts an iframe with the given embed src', () => {
    render();
    expect(host.querySelector('iframe')).toBeNull();
    const button = host.querySelector('button');
    button?.click();
    flushSync();
    const iframe = host.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe?.getAttribute('src')).toBe(EMBED);
    expect(iframe?.getAttribute('title')).toBe(TITLE);
    expect(iframe?.getAttribute('allowfullscreen')).not.toBeNull();
    expect(iframe?.getAttribute('allow')).toMatch(/fullscreen/);
  });

  it('after activation the poster img and play button are removed', () => {
    render();
    host.querySelector('button')?.click();
    flushSync();
    expect(host.querySelector('button')).toBeNull();
    expect(host.querySelector('img')).toBeNull();
  });
});
