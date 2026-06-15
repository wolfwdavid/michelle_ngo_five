<!--
  ReelLightbox — the PLAY REEL focus-managed dialog (HERO-02).

  Mirrors the proven WatchPlayer facade: the live Vimeo iframe is created ONLY
  when the dialog is open ({#if open}), so home stays at ZERO iframes until the
  user clicks PLAY REEL (HOME-06 / Pitfall B). Mounting on user intent is why
  `autoplay` in the allow-list is acceptable — the facade itself never autoplays
  on load, and no loading="lazy" is needed because the iframe doesn't exist until
  open (the strongest possible deferral).

  A11y (RESEARCH Q4 / UI-SPEC "PLAY REEL CTA"):
    - role="dialog" aria-modal="true" aria-label={title}, tabindex="-1" so the
      container itself takes focus on open.
    - On open: remember document.activeElement, move focus into the dialog.
      On close: restore focus to the element that opened it (the PLAY REEL CTA).
    - Escape closes; the backdrop scrim (~55% black) closes on click.
    - Close button is a real <button type="button"> with aria-label="Close",
      ≥44px, an inline SVG ✕ (a drawn path, never a font glyph), inheriting
      app.css's high-contrast focus-visible ring.
    - aria-modal + the small focusable set (Close button + iframe) is a
      sufficient v1 "trap"; the dialog is the only interactive surface.
-->
<script lang="ts">
  let {
    open = $bindable(false),
    embed,
    title,
  }: { open?: boolean; embed: string; title: string } = $props();

  let dialog: HTMLDivElement | undefined = $state();
  let lastFocused: HTMLElement | null = null;

  // Focus management: capture the opener, focus the dialog on open; restore on
  // close. Mirrors the RESEARCH Q4 shape.
  $effect(() => {
    if (open) {
      lastFocused = document.activeElement as HTMLElement;
      dialog?.focus();
    } else {
      lastFocused?.focus();
    }
  });

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') open = false;
  }
</script>

{#if open}
  <!-- Backdrop scrim: ~55% black; clicking it closes the dialog. aria-hidden so
       SR ignores the dimming layer (the dialog carries the accessible name). -->
  <div
    class="fixed inset-0 z-50 bg-black/55"
    aria-hidden="true"
    onclick={() => (open = false)}
  ></div>

  <div
    bind:this={dialog}
    role="dialog"
    aria-modal="true"
    aria-label={title}
    tabindex="-1"
    onkeydown={onKey}
    class="fixed inset-0 z-50 m-auto flex h-fit max-h-[90vh] w-[min(92vw,1100px)] flex-col p-3 focus-visible:outline-none sm:p-6"
  >
    <button
      type="button"
      aria-label="Close"
      onclick={() => (open = false)}
      class="ml-auto mb-2 flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-black/60 text-white ring-1 ring-white/20 transition-colors hover:bg-black/80"
    >
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M6 6l12 12M18 6L6 18"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </button>

    <div class="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
      <iframe
        src={embed}
        {title}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowfullscreen
        class="absolute inset-0 h-full w-full border-0"
      ></iframe>
    </div>
  </div>
{/if}
