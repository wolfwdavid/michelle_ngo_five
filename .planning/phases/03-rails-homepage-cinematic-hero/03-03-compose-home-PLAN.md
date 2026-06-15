---
phase: 03-rails-homepage-cinematic-hero
plan: 03
type: execute
wave: 2
depends_on: ["03-01", "03-02"]
files_modified:
  - src/routes/+page.ts
  - src/routes/+page.svelte
  - src/routes/+layout.svelte
  - scripts/assert-home-no-iframe.mjs
  - package.json
autonomous: false
requirements: [HOME-01, HOME-02, HOME-05, HOME-06, HERO-01]
must_haves:
  truths:
    - "The homepage replaces the Phase-1 placeholder: ReelHero followed by one CategoryRail per category in display order"
    - "Exactly 8 rails render, each accent-labeled, each linking to its /work/[category] page"
    - "A skip-to-content link lets keyboard users bypass the hero and all 8 rails"
    - "The built home (build/index.html) contains zero <iframe> — enforced by a build-time guard"
    - "pnpm build prerenders cleanly with base path and the home emits the correct title/description/canonical"
  artifacts:
    - path: "src/routes/+page.svelte"
      provides: "Composed home — ReelHero + {#each rails} CategoryRail + home SEO head"
      min_lines: 25
      contains: "CategoryRail"
    - path: "src/routes/+page.ts"
      provides: "Build-time load() mapping getCategoriesInDisplayOrder() → {category, videos} rails (prerenderable, zero runtime fetch)"
      min_lines: 8
      contains: "getCategoriesInDisplayOrder"
    - path: "scripts/assert-home-no-iframe.mjs"
      provides: "CI guard asserting build/index.html has no <iframe> (HOME-06)"
      min_lines: 8
      contains: "iframe"
  key_links:
    - from: "src/routes/+page.svelte"
      to: "src/lib/components/ReelHero.svelte"
      via: "hero leads the page"
      pattern: "ReelHero"
    - from: "src/routes/+page.svelte"
      to: "src/lib/components/CategoryRail.svelte"
      via: "{#each rails} renders a CategoryRail per category"
      pattern: "CategoryRail"
    - from: "src/routes/+page.ts"
      to: "$lib/data"
      via: "getCategoriesInDisplayOrder().map(c => ({category, videos: getByCategory(c)}))"
      pattern: "getByCategory"
---

<objective>
Compose the homepage from the two leaf components: rewrite the Phase-1 placeholder `+page.svelte` into `ReelHero` followed by one `CategoryRail` per category (display order), add a `+page.ts` load that builds the rails array at prerender time, add a skip-to-content link in the layout, and wire a build-time guard that fails the build if any `<iframe>` leaks onto home. This is the verification plan: it proves the home-level invariants (8 rails, zero iframes, clean prerender) end-to-end.

Purpose: HOME-01/02/05/06 + HERO-01 at the composition level — turn two tested primitives into the signature page and lock the zero-iframe invariant into CI.
Output: Composed home (+page.svelte/+page.ts), skip link, and a `assert-home-no-iframe` guard wired into the build script.
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
<!-- Contracts from the Wave-1 leaf components + existing layer. Use directly. -->

From 03-01 — CategoryRail.svelte: `{ category: Category; videos: readonly Video[] }` — renders the full labeled rail.
From 03-02 — ReelHero.svelte: no props — renders the full hero + PLAY REEL + lightbox.

From $lib/data:
  getCategoriesInDisplayOrder(): readonly Category[]   // D-04: count desc, ties alpha (8 categories)
  getByCategory(category): readonly Video[]            // public, hidden-filtered

Existing +layout.svelte mounts &lt;TopNav/&gt; {@render children()} &lt;Footer/&gt;. Add the skip link there (or at top of +page.svelte) targeting #main.

Existing placeholder +page.svelte (TO REPLACE) already shows the head pattern: a &lt;svelte:head&gt; with title + meta description. Keep a home title/description/canonical (SEO parity with Phase 2 pages — base from $app/paths for canonical host literal).

package.json scripts today: "build": "vite build", "check": "svelte-kit sync && svelte-check ...".
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: +page.ts load + rewrite +page.svelte (ReelHero + 8 rails) + skip link</name>
  <files>src/routes/+page.ts, src/routes/+page.svelte, src/routes/+layout.svelte</files>
  <read_first>
    - src/routes/+page.svelte (the Phase-1 placeholder being REPLACED — keep its base-safe + head conventions)
    - src/routes/+layout.svelte (where the skip-link target #main lives; TopNav/Footer chrome stays)
    - src/lib/data/videos.ts (getCategoriesInDisplayOrder, getByCategory — the exact loader API)
    - src/lib/components/CategoryRail.svelte (the rail it stamps — from 03-01)
    - src/lib/components/ReelHero.svelte (the hero it leads with — from 03-02)
    - .planning/phases/03-rails-homepage-cinematic-hero/03-RESEARCH.md (Code Examples Q5 — home composition)
    - .planning/phases/03-rails-homepage-cinematic-hero/03-UI-SPEC.md ("Rhythm & layout" — gutter + vertical rhythm between rails)
  </read_first>
  <action>
    1. Create `src/routes/+page.ts`:
       ```ts
       import { getCategoriesInDisplayOrder, getByCategory } from '$lib/data';
       export const prerender = true;
       export function load() {
         const rails = getCategoriesInDisplayOrder().map((category) => ({
           category,
           videos: getByCategory(category)
         }));
         return { rails };
       }
       ```
       (Pure build-time data; zero runtime fetch; base-path safe — RESEARCH Q5. Keep `prerender = true` consistent with the rest of the static site.)

    2. REPLACE `src/routes/+page.svelte` entirely:
       - `<script lang="ts">` importing `CategoryRail` and `ReelHero` from '$lib/components/...', and `let { data } = $props();` (PageData with `rails`).
       - `<svelte:head>`: home `<title>Michelle Ngo — Filmmaker & Producer</title>`, meta description (keep the placeholder's copy), and a canonical `<link rel="canonical" href="https://michellengo.net/" />` (absolute production host, matching Phase 2 SEO-01 convention).
       - Body:
         ```svelte
         <ReelHero />
         <main id="main">
           {#each data.rails as { category, videos } (category)}
             <CategoryRail {category} {videos} />
           {/each}
         </main>
         ```
       - Apply the UI-SPEC vertical rhythm between rails (generous `clamp(2.5rem, 6vh, 4rem)` spacing; hero→first rail slightly tighter) via a wrapper class or space-y utility on `#main`.
       - Remove the placeholder's `rel="external"` /work link entirely (the /work routes now exist from Phase 2, and CategoryRail's See-all links there).

    3. Add a skip-to-content link so keyboard users bypass the hero + 8 rails (RESEARCH Q5 / UI-SPEC). Prefer adding it once in `src/routes/+layout.svelte` as the first focusable element: `<a href="#main" class="...visually-hidden until focused...">Skip to content</a>` (visible on focus, app.css focus ring). It targets `#main` which +page.svelte now provides. (If layout-level placement is awkward, place it at the very top of +page.svelte before `<ReelHero />`.)
  </action>
  <verify>
    <automated>cd "C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_five" && pnpm check && pnpm build</automated>
  </verify>
  <acceptance_criteria>
    - `grep -q 'getCategoriesInDisplayOrder' src/routes/+page.ts` and `grep -q 'getByCategory' src/routes/+page.ts` (HOME-01 rail mapping)
    - `grep -q 'CategoryRail' src/routes/+page.svelte` and `grep -q 'ReelHero' src/routes/+page.svelte` (composition: HOME-01/02 + HERO-01)
    - `grep -q 'id="main"' src/routes/+page.svelte` and `grep -q 'href="#main"' src/routes/+layout.svelte` (skip link → content, HOME-03/QUAL-01)
    - `! grep -q 'rel="external"' src/routes/+page.svelte` (placeholder workaround removed)
    - `grep -q 'rel="canonical"' src/routes/+page.svelte` (SEO-01 parity)
    - After `pnpm build`: `grep -c 'aria-labelledby' build/index.html` returns 8 (8 rails rendered in display order — HOME-01). If the home file is named differently, check `build/index.html`.
    - `pnpm check` exits 0 and `pnpm build` exits 0
  </acceptance_criteria>
  <done>The homepage renders ReelHero + 8 CategoryRails from a prerenderable load(), with a skip-to-content link and home SEO head. Build is green.</done>
</task>

<task type="auto">
  <name>Task 2: Zero-iframe build guard wired into the build script</name>
  <files>scripts/assert-home-no-iframe.mjs, package.json</files>
  <read_first>
    - package.json (the "build" script to chain the guard onto)
    - src/routes/+page.svelte (confirms the home mounts no iframe directly — the guard enforces it post-build)
    - .planning/phases/03-rails-homepage-cinematic-hero/03-RESEARCH.md ("Validation Architecture" — zero-iframe home guard)
    - .planning/phases/03-rails-homepage-cinematic-hero/03-UI-SPEC.md ("Acceptance hooks" — build/index.html ZERO &lt;iframe&gt;)
  </read_first>
  <action>
    1. Create `scripts/assert-home-no-iframe.mjs` — a tiny Node script (ESM) that:
       - reads `build/index.html` (resolve relative to repo root),
       - if the file does not exist, exits non-zero with a clear message ("run vite build first"),
       - if its contents match `/<iframe/i`, prints the offending context and `process.exit(1)`,
       - otherwise prints "home: 0 iframes ✓" and exits 0.
       This directly enforces HOME-06 / Pitfall B at build time.

    2. Wire it into `package.json`. Add a `"verify:home"` script `"node scripts/assert-home-no-iframe.mjs"` and chain it onto build so a leak fails CI:
       change `"build": "vite build"` → `"build": "vite build && node scripts/assert-home-no-iframe.mjs"`.
       (Keep it after the build so build/index.html exists.)
  </action>
  <verify>
    <automated>cd "C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_five" && pnpm build && node scripts/assert-home-no-iframe.mjs</automated>
  </verify>
  <acceptance_criteria>
    - `test -f scripts/assert-home-no-iframe.mjs` (guard exists)
    - `grep -q 'iframe' scripts/assert-home-no-iframe.mjs` (it checks for iframes)
    - `grep -q 'assert-home-no-iframe' package.json` (wired into scripts/build)
    - `pnpm build` exits 0 AND prints the 0-iframe confirmation (proves home/index.html has no &lt;iframe&gt; — HOME-06)
    - Sanity (manual/optional): `! grep -qi '<iframe' build/index.html`
  </acceptance_criteria>
  <done>A build-time guard asserts build/index.html has zero iframes and is chained into `pnpm build`; the build passes with the home at 0 iframes.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: Human verify — hero, PLAY REEL, 8 rails, keyboard, reduced motion</name>
  <action>Pause for the user to verify the composed home in a real browser (steps below). This is a human gate after Tasks 1-2 automate the build; no code changes here.</action>
  <what-built>
    The full signature home: a full-bleed cinematic ReelHero (eager LCP poster, wordmark, tagline, PLAY REEL) leading into 8 accent-labeled horizontal scroll-snap rails, each with a peek of the next card and Prev/Next controls, plus a build-time zero-iframe guard.
  </what-built>
  <how-to-verify>
    1. Run `pnpm preview` and open the served home URL (note the base path, e.g. /michelle_ngo_five/).
    2. Hero: confirm the wordmark + tagline + PLAY REEL render over the poster; click PLAY REEL → the reel plays in a lightbox; press Escape → it closes and focus returns to the PLAY REEL button.
    3. Rails: confirm 8 rails in display order (PBS first), each with an accent label + "View all" link; horizontal scroll shows a peek of the next card; on desktop, Prev/Next chevrons page the rail.
    4. Keyboard: Tab from the top — the skip-to-content link appears first; Tab through a rail walks card→card and then exits (no trap); focus ring is clearly visible over posters.
    5. Reduced motion: enable OS "Reduce motion" and reload — the hero parallax/tilt stops (static premium hero) and Prev/Next jump instantly (no smooth scroll). The page still looks premium.
    6. Mobile (real device or responsive emulation): rails swipe with momentum and snap softly (proximity), no overscroll chaining to the page.
  </how-to-verify>
  <resume-signal>Type "approved" or describe any visual/interaction issues to fix.</resume-signal>
</task>

</tasks>

<verification>
- `pnpm check` exits 0; `pnpm build` exits 0 and prints the zero-iframe confirmation.
- `grep -c 'aria-labelledby' build/index.html` == 8 (8 rails in display order — HOME-01).
- `! grep -qi '<iframe' build/index.html` (HOME-06 — enforced by the guard).
- Human checkpoint confirms hero/PLAY REEL/rails/keyboard/reduced-motion behavior.
</verification>

<success_criteria>
The Phase-1 placeholder home is replaced by the signature page: ReelHero + 8 CategoryRails (display order) from a prerenderable load(), with a skip-to-content link, home SEO head, and a build-time guard that fails the build if any iframe leaks onto home. Build is green, home renders 8 rails, and the home contains zero iframes.
</success_criteria>

<output>
After completion, create `.planning/phases/03-rails-homepage-cinematic-hero/03-03-SUMMARY.md`.
</output>
