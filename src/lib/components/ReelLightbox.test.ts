import { afterEach, describe, expect, it } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import ReelLightbox from './ReelLightbox.svelte';

// ReelLightbox contract (HERO-02 / HOME-06 / Pitfall B): a focus-managed
// role="dialog" that mounts the reel iframe ONLY when open. Closed -> nothing in
// the DOM (no backdrop, no dialog, NO iframe). Open -> aria-modal dialog with a
// Close button and an iframe whose src is the embed. Escape closes it. These
// tests are the proof, mirroring the WatchPlayer facade harness.

const EMBED = 'https://player.vimeo.com/video/264677021';
const TITLE = "Michelle Ngo Producer's Reel";

let host: HTMLElement;
let component: ReturnType<typeof mount> | undefined;

afterEach(() => {
  if (component) {
    unmount(component);
    component = undefined;
  }
  host?.remove();
});

function render(open: boolean) {
  host = document.createElement('div');
  document.body.appendChild(host);
  component = mount(ReelLightbox, {
    target: host,
    props: { open, embed: EMBED, title: TITLE },
  });
  return host;
}

describe('ReelLightbox — focus-managed reel facade (HERO-02)', () => {
  it('renders NOTHING when closed: no dialog, no iframe, no backdrop', () => {
    render(false);
    expect(host.querySelector('[role="dialog"]')).toBeNull();
    expect(host.querySelector('iframe')).toBeNull();
  });

  it('when open: aria-modal dialog with a Close button and the reel iframe', () => {
    render(true);
    const dialog = host.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    expect(dialog?.getAttribute('aria-label')).toBe(TITLE);

    const close = dialog?.querySelector('button[type="button"]');
    expect(close).not.toBeNull();
    expect(close?.getAttribute('aria-label')).toMatch(/close/i);

    const iframe = host.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe?.getAttribute('src')).toBe(EMBED);
    expect(iframe?.getAttribute('allowfullscreen')).not.toBeNull();
    expect(iframe?.getAttribute('allow')).toMatch(/fullscreen/);
  });

  it('clicking the Close button removes the dialog and its iframe', () => {
    render(true);
    const close = host.querySelector<HTMLButtonElement>('[role="dialog"] button[type="button"]');
    close?.click();
    flushSync();
    expect(host.querySelector('[role="dialog"]')).toBeNull();
    expect(host.querySelector('iframe')).toBeNull();
  });

  it('pressing Escape on the dialog closes it (open -> false)', () => {
    render(true);
    const dialog = host.querySelector<HTMLElement>('[role="dialog"]');
    dialog?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    flushSync();
    expect(host.querySelector('[role="dialog"]')).toBeNull();
    expect(host.querySelector('iframe')).toBeNull();
  });
});
