<!--
  Per-category type-tag, label-style (no chip background).
  Used in two places:
    - Inside VideoCard (DSGN-04): MUST be non-interactive — pass NO href prop.
    - On /watch/[id] metadata: IS interactive — pass href=/work/<slug>.
  The optional href prop switches between <span> and <a> to avoid nested
  <a><a></a></a> markup (Pitfall 4).

  ESLint: svelte/no-navigation-without-resolve disabled for this file —
  CategoryTag is a leaf, the CALLER produces a base-path-safe href (e.g.
  VideoCard builds `${base}/watch/${id}`; /watch/[id] metadata builds
  `${base}/work/${slug}`). Forwarding the caller's href verbatim keeps the
  component testable with literal hrefs (GRID-05 asserts the exact value).
-->
<script lang="ts">
  /* eslint-disable svelte/no-navigation-without-resolve */
  import type { Category } from '$lib/data';
  import { categoryAccent } from './categoryAccent';

  type Props = {
    category: Category;
    /** When provided, renders as <a href={href}>. Omit for non-interactive label. */
    href?: string;
  };
  let { category, href }: Props = $props();
</script>

{#if href}
  <a
    {href}
    class="text-xs font-bold uppercase tracking-wider underline-offset-2 hover:underline {categoryAccent(
      category
    )}"
  >
    {category}
  </a>
{:else}
  <span class="text-xs font-bold uppercase tracking-wider {categoryAccent(category)}">
    {category}
  </span>
{/if}
