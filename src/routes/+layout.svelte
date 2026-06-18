<!--
  Site chrome: app.css import + base-path-safe favicon/OG head + noindex meta.
  Phase 2 (DSGN-04): TopNav above every route, Footer below the routed content.
  Every local asset href goes through `base` from $app/paths (FND-02).
-->
<script lang="ts">
  import '../app.css';
  import { base } from '$app/paths';
  import TopNav from '$lib/components/TopNav.svelte';
  import Footer from '$lib/components/Footer.svelte';
  let { children, data } = $props();

  // The noindex gate keys off the build-time BASE_PATH env signal, surfaced by
  // +layout.server.ts at prerender (via $env/dynamic/private). Apex builds with
  // BASE_PATH='' -> isStaging=false (indexable). Staging builds with
  // BASE_PATH=/michelle_ngo_five -> isStaging=true (stays noindex).
  // NOTE: `base` from $app/paths is NOT usable here — adapter-static's relative
  // paths make it resolve to '.' in BOTH builds, so it cannot distinguish them.
  const isStaging = $derived(data.isStaging);
</script>

<svelte:head>
  {#if isStaging}
    <meta name="robots" content="noindex, nofollow" />
  {/if}
  <title>Michelle Ngo</title>

  <!-- Favicon set (multi-size for browser tabs + iOS + Android home-screen) -->
  <link rel="icon" type="image/x-icon" href="{base}/favicon.ico" sizes="any" />
  <link rel="icon" type="image/png" sizes="16x16" href="{base}/favicon-16.png" />
  <link rel="icon" type="image/png" sizes="32x32" href="{base}/favicon-32.png" />
  <link rel="icon" type="image/png" sizes="192x192" href="{base}/favicon-192.png" />
  <link rel="icon" type="image/png" sizes="512x512" href="{base}/favicon-512.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="{base}/apple-touch-icon.png" />

  <!-- Sitewide OG + Twitter card. Per-route overrides happen in each
       +page.svelte's own <svelte:head>. -->
  <meta property="og:site_name" content="Michelle Ngo" />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="https://michellengo.net/og-image.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Michelle Ngo — Filmmaker & Producer" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="https://michellengo.net/og-image.jpg" />
</svelte:head>

<!--
  Skip-to-content link (HOME-03 / QUAL-01): the FIRST focusable element on every
  page. Visually hidden until focused, it lets keyboard users jump past the hero
  + all rails to #main (provided by the home +page.svelte). Base-safe in-page
  hash; the app.css :focus-visible ring renders it clearly on focus.
-->
<a href="#main" class="skip-link">Skip to content</a>

<TopNav />

<main id="main">
  {@render children()}
</main>

<Footer />

<style>
  /* Off-screen until focused, then pinned top-left over the chrome. */
  .skip-link {
    position: absolute;
    left: 0.5rem;
    top: -3rem;
    z-index: 100;
    padding: 0.5rem 0.875rem;
    border-radius: 0.5rem;
    background: var(--canvas);
    color: var(--ink);
    font-weight: 600;
    text-decoration: none;
    transition: top 150ms ease;
  }
  .skip-link:focus {
    top: 0.5rem;
  }
</style>
