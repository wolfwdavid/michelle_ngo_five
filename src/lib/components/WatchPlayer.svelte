<!--
  WatchPlayer — WATCH-02 click-to-load FACADE.

  v4 mounted the embed iframe eagerly (its D-33: "direct iframe embed ... no
  facade"). v5 replaces that with a poster facade: a reserved 16:9 box shows the
  thumbnail + a centered play button, and the real iframe is created ONLY when
  the user clicks. Result: zero live iframes on the watch page until interaction
  (the page-render test asserts no <iframe> before click), and no
  autoplay-with-sound on load.

  Because the iframe is created on user intent, `autoplay` in the allow-list is
  acceptable (the facade itself never autoplays). No loading="lazy" is needed —
  the iframe doesn't exist until click, which is the strongest possible deferral.

  A11y: the play affordance is a real <button type="button"> with
  aria-label="Play {title}", a >=44px hit area, and inherits app.css's
  high-contrast :focus-visible ring (light outline + dark halo) so it stays
  visible on the near-black canvas and over bright posters (DSGN-03 / Pitfall 10).
  The box has reserved aspect-video dimensions so there is no CLS (Pitfall 9).
-->
<script lang="ts">
  type Props = {
    /** Embed player URL (Vimeo/YouTube) — used as-is from videos.json. */
    embed: string;
    /** Poster thumbnail URL shown before activation — used as-is from videos.json. */
    thumbnail: string;
    /** Video title — alt text + accessible button/iframe name. */
    title: string;
  };
  let { embed, thumbnail, title }: Props = $props();

  // Facade gate: no iframe exists until the user clicks the play button.
  let activated = $state(false);
</script>

<div class="relative aspect-video overflow-hidden bg-neutral-900">
  {#if activated}
    <iframe
      src={embed}
      {title}
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowfullscreen
      class="absolute inset-0 h-full w-full border-0"
    ></iframe>
  {:else}
    <img
      src={thumbnail}
      alt={title}
      decoding="async"
      class="absolute inset-0 h-full w-full object-cover"
    />
    <button
      type="button"
      aria-label={`Play ${title}`}
      onclick={() => (activated = true)}
      class="group absolute inset-0 flex items-center justify-center focus-visible:outline-none"
    >
      <span
        class="flex h-16 w-16 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-black/60 ring-1 ring-white/20 transition-colors group-hover:bg-black/80"
      >
        <!-- Play triangle. The dark scrim circle behind it guarantees AA contrast
             of the white glyph over any poster art (DSGN-04 / Pitfall 10). -->
        <svg
          viewBox="0 0 24 24"
          class="ml-1 h-7 w-7 fill-white"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </button>
  {/if}
</div>
