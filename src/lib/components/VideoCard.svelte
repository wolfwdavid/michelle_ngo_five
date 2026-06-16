<!--
  Single-link card with aspect-video thumb, blur-up fade-in, colored category
  tag, h3 title (line-clamp-2), and uploader meta. Used by /work,
  /work/[category], and the /watch rail. ONE component, no variants.

  Decisions implemented:
    D-10 thumb aspect-video 16:9
    D-11 meta order: tag -> title -> uploader
    D-12 typography: tag text-xs bold uppercase tracked, title text-sm md:text-base, uploader text-xs neutral-500
    D-13 single <a> wraps the whole card (no nested <a>; chip is <span>)
    D-14 data-sveltekit-preload-data="hover"
    D-15 thumbnail URL used as-is from videos.json
    D-16 solid-color fade-in (bg-neutral-900 wrapper + opacity-0 -> opacity-100 on load)
    D-17 first-8 eager via eager prop, all others lazy; decoding async
    D-18 alt={video.title}
    D-19 h3 for card titles
    D-06 hover: title underlines + thumb opacity 90 (group-hover)
    D-07 focus ring: white 2px + 2px offset on dark bg

  ESLint: svelte/no-navigation-without-resolve disabled for this file —
  the href is built from `$app/paths` base + video.id (already base-path
  safe). The rule would require resolve('/watch/[id]', { id }), which is
  the SvelteKit 2.27+ typed-routes API; we're using the older string
  concatenation pattern locked in by Phase 1's BASE_PATH wiring.
-->
<script lang="ts">
  /* eslint-disable svelte/no-navigation-without-resolve */
  import { base } from '$app/paths';
  import type { Video } from '$lib/data';
  import CategoryTag from './CategoryTag.svelte';

  import type { Snippet } from 'svelte';

  type Props = {
    video: Video;
    /** First 8 cards above the fold pass eager={true} (D-17). */
    eager?: boolean;
    /**
     * Optional extra content rendered INSIDE the card's own <li> (after the
     * card link). Lets surfaces like the PBS landing attach a per-card badge
     * (e.g. "See on PBS →") without wrapping VideoCard in a second <li> — which
     * would nest <li> inside <li> and fail axe's `list` rule (QUAL-01).
     */
    children?: Snippet;
  };
  let { video, eager = false, children }: Props = $props();

  let loaded = $state(false);
</script>

<li>
  <a
    href={`${base}/watch/${video.id}`}
    data-sveltekit-preload-data="hover"
    class="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
  >
    <div class="relative aspect-video overflow-hidden bg-neutral-900">
      <img
        src={video.thumbnail}
        alt={video.title}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        class="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-90"
        class:opacity-100={loaded}
        onload={() => (loaded = true)}
      />
    </div>
    <div class="mt-2 space-y-0.5">
      <CategoryTag category={video.category} />
      <h3 class="line-clamp-2 text-sm font-medium md:text-base group-hover:underline">
        {video.title}
      </h3>
      <p class="text-xs text-neutral-400">{video.uploader}</p>
    </div>
  </a>
  {#if children}
    {@render children()}
  {/if}
</li>
