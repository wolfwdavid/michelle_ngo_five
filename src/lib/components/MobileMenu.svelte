<!--
  D-42: full-screen mobile overlay menu. Triggered from TopNav's hamburger
  (visible only <sm). Closes via close button, Escape, or any link tap.

  Animation: instant (no transition) — sidesteps prefers-reduced-motion handling.

  A11y floor (DSGN-04 / QUAL-03) — keyboard-operable overlay:
    - role="dialog" aria-modal="true" with an accessible name.
    - Escape closes the menu (calls onclose).
    - Focus is TRAPPED inside the overlay while open (Tab / Shift+Tab cycle
      between the first and last focusable elements).
    - On open, focus moves to the close button; on close, focus RETURNS to the
      element that had focus before the menu opened (the hamburger trigger).
    - Close button has aria-label="Close menu" and a ≥44px touch target.

  ESLint: svelte/no-navigation-without-resolve disabled for this file —
  MobileMenu is a leaf nav component; hrefs are produced base-path-safely via
  `${base}/...` template literals (same pattern as VideoCard / TopNav).
-->
<script lang="ts">
  /* eslint-disable svelte/no-navigation-without-resolve */
  import { base } from '$app/paths';
  import { getCategoriesInDisplayOrder, categoryToSlug } from '$lib/data';

  type Props = {
    /** Called when the user closes the menu (close button, Escape, or link tap). */
    onclose: () => void;
  };
  let { onclose }: Props = $props();

  const categories = getCategoriesInDisplayOrder();

  // The overlay container — used to scope the focus trap.
  let dialogEl = $state<HTMLDivElement | null>(null);
  // The element that had focus before the menu opened, so we can restore it.
  let previouslyFocused: HTMLElement | null = null;

  function focusable(): HTMLElement[] {
    if (!dialogEl) return [];
    return Array.from(
      dialogEl.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => el.offsetParent !== null || el === document.activeElement);
  }

  function onkeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      // Restore focus to the trigger SYNCHRONOUSLY, while the dialog is still
      // mounted. WebKit (the apex cutover's primary engine) drops a .focus()
      // issued from the effect-cleanup tick that unmounts the dialog, leaving
      // activeElement on <body>. Focusing here — before onclose() unmounts us —
      // lands reliably across Chromium/Firefox/WebKit (DSGN-04 / QUAL-03).
      previouslyFocused?.focus?.();
      onclose();
      return;
    }
    if (event.key !== 'Tab') return;

    // Focus trap: keep Tab / Shift+Tab cycling inside the overlay.
    const items = focusable();
    const first = items[0];
    const last = items[items.length - 1];
    if (!first || !last) return;
    const active = document.activeElement as HTMLElement | null;

    if (event.shiftKey) {
      if (active === first || !dialogEl?.contains(active)) {
        event.preventDefault();
        last.focus();
      }
    } else {
      if (active === last || !dialogEl?.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  // On mount: remember the trigger, move focus into the dialog.
  // On destroy: return focus to the trigger.
  $effect(() => {
    previouslyFocused = (document.activeElement as HTMLElement | null) ?? null;
    // Move focus to the first focusable element (the close button) so keyboard
    // and screen-reader users land inside the dialog immediately.
    const items = focusable();
    items[0]?.focus();

    return () => {
      // Return focus to the trigger. WebKit (the apex cutover's primary engine)
      // drops a .focus() call made during the same teardown tick that removes
      // this dialog from the DOM — activeElement falls back to <body>. Deferring
      // to the next frame lets the removal settle so the focus actually lands on
      // the hamburger (keyboard return-focus contract, DSGN-04 / QUAL-03).
      const target = previouslyFocused;
      requestAnimationFrame(() => target?.focus?.());
    };
  });
</script>

<svelte:window {onkeydown} />

<div
  bind:this={dialogEl}
  role="dialog"
  aria-modal="true"
  aria-label="Site menu"
  class="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col"
>
  <div class="flex items-center justify-between px-4 h-14 border-b border-white/10">
    <a href={base || '/'} onclick={onclose} class="text-sm font-bold uppercase tracking-widest">
      Michelle Ngo
    </a>
    <button
      type="button"
      class="p-3 -mr-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
      aria-label="Close menu"
      onclick={onclose}
    >
      <span class="block w-5 h-px bg-white rotate-45 translate-y-px"></span>
      <span class="block w-5 h-px bg-white -rotate-45 -translate-y-px"></span>
    </button>
  </div>

  <nav class="flex-1 overflow-y-auto px-4 py-6">
    <ul class="space-y-4 text-base uppercase tracking-wider">
      {#each categories as category (category)}
        {@const slug = categoryToSlug(category)}
        {@const href =
          slug === 'pbs-american-portrait'
            ? `${base}/pbs-american-portrait/`
            : `${base}/work/${slug}`}
        <li>
          <a {href} onclick={onclose} class="block hover:underline">
            {category}
          </a>
        </li>
      {/each}
    </ul>

    <hr class="my-6 border-white/10" />

    <ul class="space-y-3 text-sm uppercase tracking-wider text-neutral-400">
      <li>
        <a href={`${base}/about`} onclick={onclose} class="block hover:text-white">About</a>
      </li>
      <li>
        <a href={`${base}/press`} onclick={onclose} class="block hover:text-white">Press</a>
      </li>
      <li>
        <a href={`${base}/contact`} onclick={onclose} class="block hover:text-white">Contact</a>
      </li>
    </ul>
  </nav>
</div>
