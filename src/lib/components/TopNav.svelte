<!--
  NAV-01: top nav — wordmark + 8 categories + About/Press/Contact.
  Sticky at desktop AND mobile (single behavior reads as one design intent;
  backdrop-blur prevents content bleed).

  Decisions implemented:
    D-09 — hairline border-b border-white/10 divider below the nav
    D-39 — lives in +layout.svelte (this component is imported there)
    D-40 — wordmark left, 8 categories inline, About/Press/Contact quieter at far right
    D-41 — active category gets categoryAccent() class; /work and /watch never highlight
    D-42 — hamburger triggers MobileMenu overlay (<sm only)
    D-14 carry-forward — data-sveltekit-preload-data="hover" on category links
    D-13 — scroll-aware transparency mode ON `/` ONLY (transparent over hero, solid past it)

  PHASE-3 HERO SENTINEL CONTRACT (read before touching the $effect below):
    The scroll-aware transparency observes `#hero-sentinel`. That sentinel is
    rendered by the Phase-3 hero (HeroPoster), which does NOT exist yet in this
    phase. Until the hero ships, `document.getElementById('hero-sentinel')`
    returns null, the null-guard below short-circuits (`heroVisible = false`),
    and the nav correctly stays SOLID with NO error. When the Phase-3 hero
    lands and renders the sentinel on `/`, this $effect re-runs on route id
    change and starts observing it — no change to this file required then.

  $app/state contract: page.url.pathname is REACTIVE inside .svelte files
  (SvelteKit 2.27+). Active-link detection re-runs whenever the user navigates.
  page.route.id is similarly reactive — read INSIDE the $effect body so the
  observer attaches/detaches as the user navigates between `/` and other routes.

  ESLint: svelte/no-navigation-without-resolve disabled for this file —
  TopNav is the site's primary nav; hrefs are produced base-path-safely via
  `${base}/...` template literals (same pattern as VideoCard + CategoryTag).
-->
<script lang="ts">
  /* eslint-disable svelte/no-navigation-without-resolve */
  import { page } from '$app/state';
  import { base } from '$app/paths';
  import { getCategoriesInDisplayOrder, categoryToSlug } from '$lib/data';
  import { categoryAccent } from './categoryAccent';
  import MobileMenu from './MobileMenu.svelte';

  const categories = getCategoriesInDisplayOrder();
  let mobileOpen = $state(false);

  // D-13/D-14: scroll-aware transparency, ONLY on route '/'.
  // When the hero is in viewport (sentinel intersecting), nav goes transparent
  // so name + tagline + CTA sit over the gradient-darkened poster. When the
  // user scrolls past the hero OR navigates to any other route, nav reverts
  // to solid chrome.
  //
  // The sentinel <div id="hero-sentinel"> is rendered by the Phase-3 hero
  // (HeroPoster) at the hero's bottom edge. TopNav queries it by id.
  //
  // Reactivity contract: page.route.id is read INSIDE the $effect body so
  // $effect re-runs whenever the route id changes. Capturing to a top-level
  // const would break reactivity.
  let heroVisible = $state(false);

  $effect(() => {
    // $effect runs ONLY in the browser (Svelte 5 guarantee — no typeof window guard needed).
    const onHomeRoute = page.route.id === '/';
    if (!onHomeRoute) {
      // Any non-/ route: solid nav, no observer. Defensive reset in case the
      // user navigated AWAY from / while observer was still attached.
      heroVisible = false;
      return; // no cleanup — no observer to disconnect
    }

    // On /: find the sentinel the Phase-3 hero renders. If it doesn't exist
    // yet (this phase has no hero; or mount-order timing), KEEP NAV SOLID for
    // this tick — the null-guard below makes the $effect a safe no-op. The
    // $effect re-runs on route id change so subsequent /-route mounts retry.
    const sentinel = document.getElementById('hero-sentinel');
    if (!sentinel) {
      heroVisible = false;
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // entry is guaranteed (we observe exactly one element).
        heroVisible = entry?.isIntersecting ?? false;
      },
      { threshold: 0 }
    );
    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  });

  // Both branches are literal strings so Tailwind v4's scanner generates every
  // utility class. Common prefix `sticky top-0 z-30 border-b` keeps layout
  // stable across the transition.
  const navClass = $derived(
    heroVisible
      ? 'sticky top-0 z-30 bg-transparent border-b border-transparent'
      : 'sticky top-0 z-30 bg-neutral-950/95 backdrop-blur border-b border-white/10'
  );

  function isActive(slug: string): boolean {
    // Normalize trailing slash, then suffix-match the slug. Two production
    // forces make a naive `=== \`${base}/work/${slug}\`` comparison fail:
    //   1. `trailingSlash = 'always'` normalizes page.url.pathname to
    //      `/work/<slug>/`.
    //   2. adapter-static + SvelteKit's default `paths.relative: true` renders
    //      `base` as a per-page relative string (e.g. `../..`), so the literal
    //      `${base}/work/${slug}` evaluates to `../../work/<slug>` during SSR
    //      while page.url.pathname stays absolute (`/work/<slug>/`).
    // endsWith on `/work/${slug}` sidesteps both.
    const normalized = page.url.pathname.replace(/\/$/, '');
    if (normalized.endsWith(`/work/${slug}`)) return true;
    // PBS gets a flagship landing surface that also counts as "active".
    // Slug guard prevents future categories with the same suffix from false-positive.
    if (slug === 'pbs-american-portrait' && normalized.endsWith('/pbs-american-portrait')) {
      return true;
    }
    return false;
  }
</script>

<header class={navClass}>
  <nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
    <a href={base || '/'} class="text-sm font-bold uppercase tracking-widest">Michelle Ngo</a>

    <!-- Desktop links (≥sm) -->
    <ul class="hidden sm:flex items-center gap-4 text-xs uppercase tracking-wider">
      {#each categories as category (category)}
        {@const slug = categoryToSlug(category)}
        {@const href =
          slug === 'pbs-american-portrait'
            ? `${base}/pbs-american-portrait/`
            : `${base}/work/${slug}`}
        <li>
          <a
            {href}
            data-sveltekit-preload-data="hover"
            class={isActive(slug) ? categoryAccent(category) : 'text-neutral-300 hover:text-white'}
          >
            {category}
          </a>
        </li>
      {/each}
      <li class="ml-2 flex gap-3 text-neutral-500">
        <a href={`${base}/about`} class="hover:text-white">About</a>
        <a href={`${base}/press`} class="hover:text-white">Press</a>
        <a href={`${base}/contact`} class="hover:text-white">Contact</a>
      </li>
    </ul>

    <!-- Hamburger (<sm) -->
    <button
      type="button"
      class="sm:hidden p-2 -mr-2"
      aria-label="Open menu"
      onclick={() => (mobileOpen = true)}
    >
      <span class="block w-5 h-0.5 bg-white mb-1"></span>
      <span class="block w-5 h-0.5 bg-white mb-1"></span>
      <span class="block w-5 h-0.5 bg-white"></span>
    </button>
  </nav>
</header>

{#if mobileOpen}
  <MobileMenu onclose={() => (mobileOpen = false)} />
{/if}
