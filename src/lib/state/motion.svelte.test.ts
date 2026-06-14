import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Tests for the single shared reduced-motion gate (FND-06).
 *
 * jsdom ships no `matchMedia`, so we install a controllable stub before each
 * test. The stub lets us drive `.matches` and fire `change` events to assert the
 * gate is both correct (default-allowed vs reduced) and reactive to OS changes.
 *
 * The module is imported dynamically (and the module registry reset) per test so
 * each test sees a fresh gate initialized against the stub we just installed.
 */

type Listener = (e: MediaQueryListEvent) => void;

function installMatchMedia(initialMatches: boolean) {
  const listeners = new Set<Listener>();
  const mql = {
    matches: initialMatches,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addEventListener: (_: string, cb: Listener) => listeners.add(cb),
    removeEventListener: (_: string, cb: Listener) => listeners.delete(cb),
    // legacy API some code paths use
    addListener: (cb: Listener) => listeners.add(cb),
    removeListener: (cb: Listener) => listeners.delete(cb),
    dispatchEvent: () => true,
  };
  const fire = (matches: boolean) => {
    mql.matches = matches;
    for (const cb of listeners) cb({ matches } as MediaQueryListEvent);
  };
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => mql)
  );
  return { fire };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('prefersReducedMotion gate', () => {
  it('defaults to motion-allowed (reduced=false) when the OS does not request reduced motion', async () => {
    installMatchMedia(false);
    const { prefersReducedMotion } = await import('./motion.svelte');
    expect(prefersReducedMotion.current).toBe(false);
  });

  it('reports reduced=true when the OS requests reduced motion', async () => {
    installMatchMedia(true);
    const { prefersReducedMotion } = await import('./motion.svelte');
    expect(prefersReducedMotion.current).toBe(true);
  });

  it('updates reactively when the OS reduce-motion preference changes', async () => {
    const { fire } = installMatchMedia(false);
    const { prefersReducedMotion } = await import('./motion.svelte');
    expect(prefersReducedMotion.current).toBe(false);
    fire(true);
    expect(prefersReducedMotion.current).toBe(true);
    fire(false);
    expect(prefersReducedMotion.current).toBe(false);
  });
});
