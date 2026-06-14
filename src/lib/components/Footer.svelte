<!--
  NAV-02 / CONT-01 (footer half): site-wide footer.

  Decisions implemented:
    D-04 — lives in src/routes/+layout.svelte, below {@render children()}
    D-24 — new component at src/lib/components/Footer.svelte
    D-25 — three-column desktop / single-column mobile grid
    D-26 — column 1: <ContactBlock /> (same shared component as /about + /contact)
    D-27 — column 2: 8 category links in display order, PBS retargeted to /pbs-american-portrait/
    D-28 — column 3: About, Press, Contact, View All Work →
    D-29 — bottom strip: © 2026 Michelle Ngo  ·  Built with SvelteKit
    D-30 — hairline border-t border-white/10, bg-neutral-950 continuous, py-12 md:py-16
    D-31 — NO active-state highlighting on footer category links (footer is static directory)
    D-32 — ContactBlock reused VERBATIM (no orientation prop, no variants)
    D-38 — CONT-02 satisfied: editing email/phone in ContactBlock propagates here

  ESLint: svelte/no-navigation-without-resolve disabled — internal hrefs built
  from `${base}/...` (same idiom as TopNav + VideoCard + page-level /work link).

  Mirror semantics (D-27): category link hrefs match TopNav exactly. TopNav uses
  `${base}/work/${slug}` (no trailing slash) for non-PBS categories — this footer
  uses the same form to keep "mirror" exact. SvelteKit normalizes URLs on click
  under trailingSlash='always'; both forms reach the same prerendered HTML.
-->
<script lang="ts">
  /* eslint-disable svelte/no-navigation-without-resolve */
  import { base } from '$app/paths';
  import { getCategoriesInDisplayOrder, categoryToSlug } from '$lib/data';
  import ContactBlock from './ContactBlock.svelte';

  const categories = getCategoriesInDisplayOrder();
</script>

<footer class="border-t border-white/10 bg-neutral-950 py-12 md:py-16">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
      <!-- Column 1: ContactBlock (D-26) — same shared component as /about + /contact (D-32, D-38) -->
      <div data-footer-col="contact">
        <h3 class="text-xs uppercase tracking-wider text-neutral-500">Contact</h3>
        <div class="mt-4">
          <ContactBlock />
        </div>
      </div>

      <!-- Column 2: 8 categories mirror (D-27) — PBS retargeted per D-02 -->
      <div data-footer-col="work">
        <h3 class="text-xs uppercase tracking-wider text-neutral-500">Work</h3>
        <ul class="mt-4 space-y-2 text-base">
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
                class="text-white hover:underline underline-offset-2"
              >
                {category}
              </a>
            </li>
          {/each}
        </ul>
      </div>

      <!-- Column 3: secondary nav (D-28) — About, Press, Contact, View All Work → -->
      <div data-footer-col="site">
        <h3 class="text-xs uppercase tracking-wider text-neutral-500">Site</h3>
        <ul class="mt-4 space-y-2 text-base">
          <li>
            <a
              href={`${base}/about`}
              data-sveltekit-preload-data="hover"
              class="text-white hover:underline underline-offset-2"
            >
              About
            </a>
          </li>
          <li>
            <a
              href={`${base}/press`}
              data-sveltekit-preload-data="hover"
              class="text-white hover:underline underline-offset-2"
            >
              Press
            </a>
          </li>
          <li>
            <a
              href={`${base}/contact`}
              data-sveltekit-preload-data="hover"
              class="text-white hover:underline underline-offset-2"
            >
              Contact
            </a>
          </li>
          <li>
            <a
              href={`${base}/work`}
              data-sveltekit-preload-data="hover"
              class="text-white hover:underline underline-offset-2"
            >
              View All Work →
            </a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Bottom strip (D-29): hairline border + copyright + Built with SvelteKit -->
    <div
      class="mt-12 md:mt-16 pt-6 border-t border-white/10 text-center text-xs text-neutral-500 tracking-wider"
    >
      © 2026 Michelle Ngo · Built with SvelteKit
    </div>
  </div>
</footer>
