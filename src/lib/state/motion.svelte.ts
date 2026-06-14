/**
 * The SINGLE shared reduced-motion gate (FND-06).
 *
 * Every motion in the app — Phase 3's hero parallax, the rail smooth-scroll,
 * any future hover-preview or scroll-driven animation — MUST read from this one
 * gate. Do NOT call `window.matchMedia('(prefers-reduced-motion: reduce)')`
 * per-component; that fragments the source of truth and leaks listeners. Read
 * `prefersReducedMotion.current` instead.
 *
 * Behavior:
 *   - SSR / prerender (no `window`): resolves to motion-allowed (`current === false`)
 *     so the static HTML is byte-identical to the animated client path and the
 *     prerender never crashes on `matchMedia`.
 *   - Client: initializes from
 *     `window.matchMedia('(prefers-reduced-motion: reduce)').matches` and stays
 *     reactive via the media query's `change` event.
 *
 * Zero-dependency by design (no `runed`): a hand-rolled matchMedia gate is
 * sufficient for v1 and adds nothing to the bundle.
 */

const REDUCE_QUERY = '(prefers-reduced-motion: reduce)';

interface ReducedMotionGate {
  /** `true` when the OS requests reduced motion; `false` otherwise (and during SSR). */
  readonly current: boolean;
}

function createReducedMotion(): ReducedMotionGate {
  // SSR / prerender: no window → motion allowed, no listeners, no crash.
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return { current: false };
  }

  const mql = window.matchMedia(REDUCE_QUERY);
  let reduced = $state(mql.matches);

  const onChange = (e: MediaQueryListEvent) => {
    reduced = e.matches;
  };
  mql.addEventListener('change', onChange);

  return {
    get current() {
      return reduced;
    },
  };
}

/**
 * The one reduced-motion gate the whole app reads.
 * Usage: `if (!prefersReducedMotion.current) { /* run animation *\/ }`
 */
export const prefersReducedMotion: ReducedMotionGate = createReducedMotion();
