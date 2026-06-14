// Vitest UI project setup — jsdom doesn't ship IntersectionObserver.
// Phase 4 TopNav (per D-13/D-14) attaches an IntersectionObserver inside a $effect
// that runs as soon as <TopNav /> mounts on the `/` route. Without this stub the
// `mount(TopNav, ...)` call in TopNav.test.ts crashes with
// `ReferenceError: IntersectionObserver is not defined`.
//
// Source: 04-RESEARCH.md §Common Pitfalls Pitfall 3 (Pattern B — shared setup file).
// Future phases that mount components observing scroll positions inherit this stub.
import { vi } from 'vitest';

class IntersectionObserverStub {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  takeRecords = vi.fn(() => [] as IntersectionObserverEntry[]);
  root: Element | Document | null = null;
  rootMargin = '';
  thresholds: ReadonlyArray<number> = [];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_cb: IntersectionObserverCallback, _opts?: IntersectionObserverInit) {}
}

globalThis.IntersectionObserver =
  IntersectionObserverStub as unknown as typeof IntersectionObserver;
