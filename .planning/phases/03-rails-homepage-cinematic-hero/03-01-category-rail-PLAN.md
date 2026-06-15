---
phase: 03-rails-homepage-cinematic-hero
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/components/CategoryRail.svelte
  - src/lib/components/CategoryRail.test.ts
autonomous: true
requirements: [HOME-01, HOME-02, HOME-03, HOME-04, HOME-05, HOME-06]
must_haves:
  truths:
    - "A rail renders an accent-labeled region with a See-all link and a horizontal list of VideoCards"
    - "Cards scroll-snap horizontally (proximity) with a visible peek of the next card on every breakpoint"
    - "Prev/Next buttons page the rail by ~85% of its width, smooth when motion is allowed, instant under reduced motion"
    - "The rail is a labeled <section> wrapping a <ul> of focusable <li><a> cards — keyboard reaches every card, Tab exits, no focus trap"
    - "A rail mounts zero iframes — cards are poster <img> only"
  artifacts:
    - path: "src/lib/components/CategoryRail.svelte"
      provides: "Accessible scroll-snap rail wrapping VideoCard, with accent header + See-all link + Prev/Next controls"
      min_lines: 60
      contains: "aria-labelledby"
    - path: "src/lib/components/CategoryRail.test.ts"
      provides: "Vitest proving region/list semantics, accent label, See-all href, zero iframes, Prev/Next buttons"
      min_lines: 40
  key_links:
    - from: "src/lib/components/CategoryRail.svelte"
      to: "src/lib/components/VideoCard.svelte"
      via: "renders one VideoCard per video inside the <ul> scroller"
      pattern: "VideoCard"
    - from: "src/lib/components/CategoryRail.svelte"
      to: "src/lib/state/motion.svelte.ts"
      via: "scrollBy behavior gated on prefersReducedMotion.current"
      pattern: "prefersReducedMotion\\.current"
    - from: "src/lib/components/CategoryRail.svelte"
      to: "$lib/data categoryToSlug"
      via: "See-all link → /work/[slug]"
      pattern: "work/\\$\\{slug\\}"
---

<objective>
Build `CategoryRail.svelte` — the reusable, accessible horizontal scroll-snap rail primitive that the homepage will stamp once per category. It wraps the existing `VideoCard` in a labeled region + list, snaps with a visible peek of the next card, and exposes pointer-only Prev/Next controls. This is a leaf component (no page wiring yet) so it can be built and unit-tested in isolation.

Purpose: This is the signature browse mechanism (HOME-01..06). Getting the a11y/snap/peek/controls correct here, once, means the home composition (03-03) is pure mapping.
Output: `CategoryRail.svelte` + `CategoryRail.test.ts`. Zero iframes, zero new dependencies.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/03-rails-homepage-cinematic-hero/03-RESEARCH.md
@.planning/phases/03-rails-homepage-cinematic-hero/03-UI-SPEC.md

<interfaces>
<!-- Contracts the executor needs — use directly, no codebase exploration. -->

VideoCard.svelte renders its OWN <li><a>…</a></li> (poster img only, base-safe href, accent CategoryTag).
Props: `{ video: Video; eager?: boolean }`. So a <ul> receives <li> children directly when you {#each} VideoCard.
A scoped Svelte <style> must use `:global(li)` to reach those child <li> elements (scoped styles don't pierce child components).

From $lib/data:
  type Category; type Video;
  categoryToSlug(category: Category): string   // 'PBS American Portrait' → 'pbs-american-portrait'

From $lib/components/categoryAccent:
  categoryAccent(category: Category): string   // returns a literal Tailwind class e.g. 'text-cat-pbs'

From $lib/state/motion.svelte (the ONE motion gate, FND-06):
  prefersReducedMotion.current: boolean        // true = reduce motion; SSR-safe (false during prerender)

From $app/paths:
  base: string                                  // GitHub Pages base prefix; ALL hrefs must be `${base}/...`
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Build CategoryRail.svelte (semantics + snap + peek + controls)</name>
  <files>src/lib/components/CategoryRail.svelte</files>
  <read_first>
    - src/lib/components/VideoCard.svelte (the card this wraps — renders its own &lt;li&gt;&lt;a&gt;; note the focus-ring + eager prop)
    - src/lib/components/categoryAccent.ts (categoryAccent map — accent class for the header)
    - src/lib/data/categories.ts (categoryToSlug rule)
    - src/lib/state/motion.svelte.ts (prefersReducedMotion.current — the ONLY motion gate; never per-component matchMedia)
    - .planning/phases/03-rails-homepage-cinematic-hero/03-RESEARCH.md (Code Examples Q1 — the rail shape to follow)
    - .planning/phases/03-rails-homepage-cinematic-hero/03-UI-SPEC.md ("RAILS" section — the binding design contract)
  </read_first>
  <action>
    Create `src/lib/components/CategoryRail.svelte`. Props: `{ category: Category; videos: readonly Video[] }`.
    Imports: `VideoCard` from './VideoCard.svelte', `categoryAccent` from './categoryAccent',
    `categoryToSlug` + types from '$lib/data', `prefersReducedMotion` from '$lib/state/motion.svelte',
    `base` from '$app/paths'. Add `/* eslint-disable svelte/no-navigation-without-resolve */` (same pattern as VideoCard — the See-all href is base-safe string concatenation).

    STRUCTURE (mirror RESEARCH Q1 + UI-SPEC "RAILS" anatomy exactly):
    - `const slug = $derived(categoryToSlug(category));`
    - `let scroller: HTMLUListElement | undefined = $state();`
    - `<section aria-labelledby={`rail-${slug}`} class="rail">` — labeled region (HOME-04).
    - Header row: a flex row with
        - `<h2 id={`rail-${slug}`} class={`... ${categoryAccent(category)}`}>{category}</h2>` —
          UPPERCASE, font-weight 600, letter-spacing +0.1em, size 0.8125rem (text-[0.8125rem]), accent-colored (HOME-01 + UI-SPEC Typography). Add a thin accent underline/dot cue per UI-SPEC.
        - `<a href={`${base}/work/${slug}/`} data-sveltekit-preload-data="hover" class="...">View all →</a>` (HOME-05 destination parity; small neutral text).
    - A `<div class="relative">` wrapping:
        - `<ul bind:this={scroller} class="rail-scroller">{#each videos as video (video.id)}<VideoCard {video} eager={false} />{/each}</ul>`
          — ALL rail cards lazy (eager={false}); per RESEARCH Q3 only the hero poster is eager. (HOME-02/05/06)
        - Two `<button type="button">` controls: Prev + Next. Each:
            - circular SVG chevron (NOT emoji — UI-SPEC anti-generic), ≥44×44px (min-h-[44px] min-w-[44px]),
              semi-transparent dark `bg-black/50` + hairline border, absolutely positioned at the inline edges, vertically centered.
            - `aria-label={`Scroll ${category} left`}` / `right`.
            - `onclick={() => page(-1)}` / `page(1)`.
            - inherits the app.css focus-visible ring (do not strip outline).

    The page() function (RESEARCH Q1 verbatim intent):
    ```
    function page(dir: 1 | -1) {
      if (!scroller) return;
      scroller.scrollBy({
        left: dir * scroller.clientWidth * 0.85,
        behavior: prefersReducedMotion.current ? 'auto' : 'smooth'
      });
    }
    ```

    `<style>` block (scoped) — follow RESEARCH Q1 + UI-SPEC:
    - `.rail-scroller { display:flex; gap:1rem; padding-inline: clamp(1rem,5vw,4rem); overflow-x:auto; scroll-snap-type: x proximity; scroll-padding-inline: clamp(1rem,5vw,4rem); overscroll-behavior-x: contain; scrollbar-width: none; }` and `.rail-scroller::-webkit-scrollbar { display:none; }` (hidden-but-scrollable — UI-SPEC). MUST be `proximity` NOT `mandatory` (Pitfall E).
    - `.rail-scroller > :global(li) { scroll-snap-align: start; scroll-margin-inline: 1rem; flex: 0 0 auto; min-width: clamp(220px, 70vw, 300px); }` — the clamp guarantees a visible PEEK of the next card on every breakpoint (HOME-02). `:global(li)` because VideoCard owns the &lt;li&gt;.
    - `@media (min-width: 768px) { .rail-scroller > :global(li) { min-width: 280px; } }`
    - Prev/Next: `@media (hover: none) { .rail-btn { display:none; } }` — hidden on touch (native swipe; HOME-03 "on pointer devices"). Show on hover/focus-within on pointer devices per UI-SPEC.

    Do NOT add `tabindex="0"` to the scroller — it already contains focusable &lt;a&gt; children; adding it creates a redundant Safari tab stop + SR over-announcement (RESEARCH Safari note, Pitfall A). Do NOT display:none / unmount offscreen cards. Do NOT mount any iframe.
  </action>
  <behavior>
    - Renders a &lt;section&gt; with aria-labelledby pointing at the &lt;h2&gt; id (region is named).
    - The &lt;h2&gt; carries the category's accent class (e.g. 'text-cat-pbs' for 'PBS American Portrait').
    - The scroller is a &lt;ul&gt; containing one VideoCard (&lt;li&gt;&lt;a&gt;) per video.
    - A "View all" link points to `${base}/work/${slug}/`.
    - Two Prev/Next &lt;button type="button"&gt; with aria-labels scoped to the category.
    - Zero &lt;iframe&gt; in the rendered output.
  </behavior>
  <verify>
    <automated>cd "C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_five" && pnpm check</automated>
  </verify>
  <acceptance_criteria>
    - `grep -q 'aria-labelledby' src/lib/components/CategoryRail.svelte` (labeled region, HOME-04)
    - `grep -q 'scroll-snap-type: x proximity' src/lib/components/CategoryRail.svelte` and `! grep -q 'mandatory' src/lib/components/CategoryRail.svelte` (Pitfall E)
    - `grep -q 'clamp(220px, 70vw, 300px)' src/lib/components/CategoryRail.svelte` (peek recipe, HOME-02)
    - `grep -q 'clientWidth \* 0.85' src/lib/components/CategoryRail.svelte` (paging factor, HOME-03)
    - `grep -q "prefersReducedMotion.current ? 'auto' : 'smooth'" src/lib/components/CategoryRail.svelte` (motion gate, QUAL-04)
    - `grep -q 'work/\${slug}/' src/lib/components/CategoryRail.svelte` (See-all destination, HOME-05)
    - `! grep -q 'iframe' src/lib/components/CategoryRail.svelte` (HOME-06)
    - `! grep -q 'tabindex="0"' src/lib/components/CategoryRail.svelte` (Safari scroller, Pitfall A)
    - `! grep -qE "href=\"/|href={'/" src/lib/components/CategoryRail.svelte` (no leading-slash absolute hrefs, Pitfall 1)
    - `pnpm check` exits 0
  </acceptance_criteria>
  <done>CategoryRail.svelte exists with the labeled region + list + peek + gated Prev/Next; svelte-check passes with 0 errors.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: CategoryRail.test.ts — semantics + zero-iframe + controls proof</name>
  <files>src/lib/components/CategoryRail.test.ts</files>
  <read_first>
    - src/lib/components/WatchPlayer.test.ts (the mount/flushSync/querySelector test pattern to mirror)
    - src/lib/components/VideoCard.test.ts (how a VideoCard-wrapping test asserts hrefs/imgs)
    - src/lib/components/CategoryRail.svelte (the component under test, from Task 1)
  </read_first>
  <action>
    Create `src/lib/components/CategoryRail.test.ts` mirroring WatchPlayer.test.ts (vitest + `mount`/`unmount`/`flushSync` from 'svelte', a `makeHost()` + `afterEach` cleanup).
    Build a small fixture: `const category = 'Reel' as Category;` and a 3-item `videos` array of minimal valid `Video` objects (id, source, title, uploader, thumbnail, embed, url, category, published — copy a shape from videos.json so it type-checks).
    Mount `CategoryRail` with `{ category, videos }`. Assert:
    1. `host.querySelector('section')?.getAttribute('aria-labelledby')` is non-null AND an element with that id exists (named region — HOME-04).
    2. `host.querySelector('ul')` exists and `host.querySelectorAll('ul > li').length === 3` (list semantics + one card per video — HOME-02/04).
    3. `host.querySelector('iframe')` is null (HOME-06 — zero iframes).
    4. A "View all" anchor exists whose href ends with `/work/reel/` (HOME-05 destination).
    5. Exactly two `<button type="button">` exist with aria-labels matching /scroll/i (Prev/Next — HOME-03).
    6. Every card anchor href contains `/watch/` (HOME-05 — cards open watch pages).
  </action>
  <behavior>
    - Test file imports CategoryRail and renders it against a 3-video Reel fixture.
    - All six assertions above pass.
  </behavior>
  <verify>
    <automated>cd "C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_five" && pnpm vitest run src/lib/components/CategoryRail.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - `pnpm vitest run src/lib/components/CategoryRail.test.ts` exits 0 with all tests passing
    - `grep -q "querySelector('iframe')" src/lib/components/CategoryRail.test.ts` (asserts zero iframes)
    - `grep -q 'aria-labelledby' src/lib/components/CategoryRail.test.ts` (asserts named region)
    - `grep -qi 'work/reel' src/lib/components/CategoryRail.test.ts` (asserts See-all destination)
  </acceptance_criteria>
  <done>CategoryRail.test.ts passes, proving region/list semantics, zero iframes, See-all destination, and Prev/Next controls.</done>
</task>

</tasks>

<verification>
- `pnpm check` exits 0 (no svelte/type errors).
- `pnpm vitest run src/lib/components/CategoryRail.test.ts` passes.
- Grep acceptance hooks above all hold (proximity snap, peek clamp, 0.85 paging, motion gate, zero iframe, no scroller tabindex, base-safe hrefs).
</verification>

<success_criteria>
A reusable CategoryRail exists that: renders a labeled region + list of VideoCards with a visible peek, snaps with proximity, exposes gated Prev/Next on pointer devices, reaches every card by keyboard without a focus trap, links "View all" to the category page, and mounts zero iframes. Unit-tested and type-clean.
</success_criteria>

<output>
After completion, create `.planning/phases/03-rails-homepage-cinematic-hero/03-01-SUMMARY.md`.
</output>
