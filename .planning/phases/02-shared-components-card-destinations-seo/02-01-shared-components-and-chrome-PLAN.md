---
phase: 02-shared-components-card-destinations-seo
plan: 01
type: execute
wave: 1
depends_on: []
autonomous: true
requirements: [DSGN-04]
files_modified:
  - src/lib/components/CategoryTag.svelte
  - src/lib/components/CategoryTag.test.ts
  - src/lib/components/VideoCard.svelte
  - src/lib/components/VideoCard.test.ts
  - src/lib/components/ContactBlock.svelte
  - src/lib/components/ContactBlock.test.ts
  - src/lib/components/TopNav.svelte
  - src/lib/components/TopNav.test.ts
  - src/lib/components/MobileMenu.svelte
  - src/lib/components/Footer.svelte
  - src/lib/components/Footer.test.ts
  - src/routes/+layout.svelte
  - src/routes/+page.svelte
must_haves:
  truths:
    - "Every page renders the TopNav (wordmark + 8 category links + About/Press/Contact) and a footer-mirrored Footer"
    - "The mobile menu opens from the hamburger, traps focus, and closes on Escape and on a link click"
    - "A keyboard user always sees a high-contrast focus ring on nav links, cards, and menu items over the dark canvas"
    - "VideoCard renders a 16:9 reserved-box lazy thumbnail with a line-clamped title, accent CategoryTag, and uploader, wrapping a base-safe <a> to /watch/[id]"
    - "ContactBlock is a single shared component (email mynogo@gmail.com, phone, Vimeo/IMDb/LinkedIn) reused by Footer (and later about/contact)"
  artifacts:
    - path: "src/lib/components/VideoCard.svelte"
      provides: "Reusable card leaf consumed by all browse/watch grids"
      contains: "aspect-video"
    - path: "src/lib/components/TopNav.svelte"
      provides: "Sitewide top nav with category links + mobile hamburger"
      contains: "getCategoriesInDisplayOrder"
    - path: "src/lib/components/Footer.svelte"
      provides: "Footer-mirrored nav with ContactBlock + category directory"
      contains: "ContactBlock"
    - path: "src/lib/components/MobileMenu.svelte"
      provides: "Keyboard-operable overlay menu (focus trap + Escape)"
      contains: "Escape"
    - path: "src/routes/+layout.svelte"
      provides: "Wires TopNav above and Footer below routed content"
      contains: "TopNav"
  key_links:
    - from: "src/routes/+layout.svelte"
      to: "TopNav + Footer"
      via: "component import + render around {@render children()}"
      pattern: "import TopNav"
    - from: "src/lib/components/TopNav.svelte"
      to: "$lib/data getCategoriesInDisplayOrder"
      via: "build-time category list"
      pattern: "getCategoriesInDisplayOrder"
    - from: "src/lib/components/Footer.svelte"
      to: "ContactBlock"
      via: "shared contact component"
      pattern: "ContactBlock"
---

<objective>
Port v4's shared leaf components (CategoryTag, VideoCard, ContactBlock) and the site chrome (TopNav, MobileMenu, Footer) into v5, wire them to the locked Phase-1 dark tokens and the `$lib/data` loader, and mount TopNav + Footer in `+layout.svelte` so every route in this phase has consistent, accessible chrome (DSGN-04).

Purpose: These are the shared dependencies every Wave-2 plan (watch, browse, static pages) consumes. They are a near-verbatim port from the shipped sibling `michelle_ngo_four`, adapted only to v5's already-existing `categoryAccent.ts` + `app.css` tokens. No new tokens are introduced.
Output: 6 components (+ tests), an updated layout that renders chrome, and the placeholder home left intact for Phase 3.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/research/ARCHITECTURE.md
@.planning/research/PITFALLS.md
@.planning/phases/01-foundation-data-reuse-proven-deploy/01-03-SUMMARY.md

<port_source>
Sibling to port FROM (read each file, copy, adapt to v5 tokens):
- C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/lib/components/CategoryTag.svelte (+ .test.ts)
- C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/lib/components/VideoCard.svelte (+ .test.ts)
- C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/lib/components/ContactBlock.svelte (+ .test.ts)
- C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/lib/components/TopNav.svelte (+ .test.ts)
- C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/lib/components/MobileMenu.svelte
- C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/lib/components/Footer.svelte (+ .test.ts)
- C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/routes/+layout.svelte
DO NOT port HeroPoster.svelte — the home hero is Phase 3.
</port_source>

<interfaces>
v5 data loader already exists (Phase 1) — import from '$lib/data' barrel only:
  export type Video, Category
  export const CATEGORIES, producerReelId
  export function categoryToSlug(c), slugToCategory(slug)
  export function getByCategory(c), getById(id)
  export function getCategoriesInDisplayOrder(): readonly Category[]
  export function getCategoriesWithCounts(): { category, slug, count }[]

v5 accent map already exists (Phase 1): src/lib/components/categoryAccent.ts
  export function categoryAccent(category): string   // returns 'text-cat-*' literal

v5 tokens already exist (Phase 1) in src/app.css: near-black oklch(0.16 0 0) canvas,
  8 --color-cat-* OKLCH accents → text-cat-*/bg-cat-* utilities, :focus-visible ring
  (light outline + dark halo), --scrim/.scrim convention.

Base-path invariant (FND-02, proven Phase 1): every internal href is `${base}/...`
  via `import { base } from '$app/paths'`. No leading-slash local hrefs.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Port leaf components (CategoryTag, VideoCard, ContactBlock) + tests</name>
  <read_first>
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/lib/components/CategoryTag.svelte (+ .test.ts)
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/lib/components/VideoCard.svelte (+ .test.ts)
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/lib/components/ContactBlock.svelte (+ .test.ts)
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_five/src/lib/components/categoryAccent.ts (already exists — wire to it)
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_five/src/lib/data/index.ts (the barrel these import from)
  </read_first>
  <action>
    Copy each v4 component + its test into v5 at the same path under src/lib/components/.

    CategoryTag.svelte: verbatim. It imports `categoryAccent` from './categoryAccent' (already exists in v5, function form `categoryAccent(category)`) and renders a `<span>` or `<a>` (when `href` prop given). Confirm it uses the v5 categoryAccent CALL form `categoryAccent(category)` (function), NOT map-index `categoryAccent[category]`.

    VideoCard.svelte: verbatim. Reserved 16:9 box (`aspect-video`), `bg-neutral-900` placeholder, blur/opacity fade-in on load, lazy by default with an `eager` prop, `decoding="async"`, `alt={video.title}`, line-clamp-2 title (h3), CategoryTag (non-link span form), uploader meta, whole-card `<a href={`${base}/watch/${video.id}`}>` with `data-sveltekit-preload-data="hover"` and the focus-visible ring classes. Thumbnails are remote URLs used as-is from videos.json (DATA-04 reserved box prevents CLS).

    ContactBlock.svelte: verbatim — single source of truth for email mynogo@gmail.com (mailto), phone (917) 566-1976 (tel:+19175661976), Vimeo (https://vimeo.com/user2149742), IMDb + LinkedIn channel-homepage fallbacks. No props, one vertical layout. Keep the v4 link literals exactly so the Person JSON-LD sameAs in Plan 02-04 can mirror them.

    Port each accompanying .test.ts verbatim. If a test imports from a v4-only path, repoint it to the v5 equivalent ('$lib/data', './categoryAccent'). Do NOT weaken assertions.

    Run `pnpm exec prettier --write` on the new files. Make zero token changes — these consume the existing app.css utilities.
  </action>
  <acceptance_criteria>
    - Files exist: `test -f src/lib/components/VideoCard.svelte && test -f src/lib/components/CategoryTag.svelte && test -f src/lib/components/ContactBlock.svelte` (exit 0)
    - VideoCard reserves the box: `grep -q "aspect-video" src/lib/components/VideoCard.svelte` (exit 0)
    - VideoCard links base-safe to watch: `grep -q '${base}/watch/' src/lib/components/VideoCard.svelte` (exit 0)
    - No leading-slash local hrefs introduced: `! grep -RnE 'href="/[a-z]' src/lib/components/` (exit 0 = none found)
    - ContactBlock is the single contact surface: `grep -q "mynogo@gmail.com" src/lib/components/ContactBlock.svelte` (exit 0)
    - Tests pass: `pnpm exec vitest run src/lib/components/CategoryTag.test.ts src/lib/components/VideoCard.test.ts src/lib/components/ContactBlock.test.ts` exits 0
  </acceptance_criteria>
  <verify>
    <automated>pnpm exec vitest run src/lib/components/VideoCard.test.ts src/lib/components/CategoryTag.test.ts src/lib/components/ContactBlock.test.ts</automated>
  </verify>
  <done>Three leaf components + tests ported, wired to v5's existing data barrel and accent map, all green, no hardcoded absolute local links.</done>
</task>

<task type="auto">
  <name>Task 2: Port chrome (TopNav, MobileMenu, Footer) + tests, wire into +layout.svelte</name>
  <read_first>
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/lib/components/TopNav.svelte (+ .test.ts)
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/lib/components/MobileMenu.svelte
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/lib/components/Footer.svelte (+ .test.ts)
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_four/src/routes/+layout.svelte (the chrome-mounting target)
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_five/src/routes/+layout.svelte (current — has favicon/OG head, no chrome yet)
  </read_first>
  <action>
    Copy TopNav.svelte, MobileMenu.svelte, Footer.svelte (+ TopNav.test.ts, Footer.test.ts) into v5.

    TopNav.svelte: verbatim. It renders the wordmark, the 8 category links from `getCategoriesInDisplayOrder()` (PBS link points to `${base}/pbs-american-portrait/`, others to `${base}/work/${slug}`), the About/Press/Contact links, and the hamburger that toggles MobileMenu. KEEP the scroll-aware transparency `$effect` that observes `#hero-sentinel` — but ADD a code comment: the sentinel is rendered by the Phase-3 hero; until then the `$effect` finds no sentinel and correctly keeps the nav solid (no error). Active-link detection uses `endsWith` on the slug suffix (handles trailingSlash='always' + relative base).

    MobileMenu.svelte: verbatim. MUST be keyboard-operable: focus trap inside the overlay, Escape closes (`onclose` callback), focus returns to the trigger, links close the menu on click. If v4's MobileMenu lacks Escape/focus-trap, IMPROVE it to add them (this is a DSGN-04/QUAL-03 a11y floor). Confirm the close button has an aria-label and ≥44px touch target.

    Footer.svelte: verbatim — 3-column directory: column 1 = `<ContactBlock />`, column 2 = category mirror from `getCategoriesInDisplayOrder()` (footer-mirrored nav, DSGN-04), column 3 = site links (About/Press/Contact + Work). All hrefs base-safe.

    Update src/routes/+layout.svelte: import TopNav and Footer, render `<TopNav />` before `{@render children()}` and `<Footer />` after. PRESERVE the existing favicon/OG/Twitter/noindex `<svelte:head>` block exactly (do not duplicate it from v4 — v5's is already correct and base-safe). Mirror v4's +layout.svelte structure for the chrome placement only.

    Port TopNav.test.ts + Footer.test.ts; repoint any v4-only import to v5 paths; do not weaken assertions. prettier --write all touched files.
  </action>
  <acceptance_criteria>
    - Files exist: `test -f src/lib/components/TopNav.svelte && test -f src/lib/components/MobileMenu.svelte && test -f src/lib/components/Footer.svelte` (exit 0)
    - Layout mounts chrome: `grep -q "import TopNav" src/routes/+layout.svelte && grep -q "<TopNav" src/routes/+layout.svelte && grep -q "<Footer" src/routes/+layout.svelte` (exit 0)
    - Layout head preserved (sitewide OG still present): `grep -q 'og:site_name' src/routes/+layout.svelte` (exit 0)
    - Footer mirrors nav via shared contact: `grep -q "ContactBlock" src/lib/components/Footer.svelte && grep -q "getCategoriesInDisplayOrder" src/lib/components/Footer.svelte` (exit 0)
    - MobileMenu is keyboard-operable: `grep -qi "Escape" src/lib/components/MobileMenu.svelte` (exit 0)
    - TopNav reads categories from data: `grep -q "getCategoriesInDisplayOrder" src/lib/components/TopNav.svelte` (exit 0)
    - No leading-slash local hrefs: `! grep -RnE 'href="/[a-z]' src/lib/components/TopNav.svelte src/lib/components/Footer.svelte src/lib/components/MobileMenu.svelte` (exit 0)
    - Chrome tests pass: `pnpm exec vitest run src/lib/components/TopNav.test.ts src/lib/components/Footer.test.ts` exits 0
    - Whole site still builds base-safe: `MSYS_NO_PATHCONV=1 BASE_PATH=/michelle_ngo_five pnpm build` exits 0
    - Type/lint clean: `pnpm check` reports 0 errors
  </acceptance_criteria>
  <verify>
    <automated>pnpm exec vitest run src/lib/components/TopNav.test.ts src/lib/components/Footer.test.ts && pnpm check</automated>
  </verify>
  <done>TopNav + MobileMenu + Footer ported and rendered around every route via +layout.svelte; mobile menu keyboard-operable (focus trap + Escape); footer mirrors nav; build green base-path-safe; sitewide head preserved (DSGN-04).</done>
</task>

</tasks>

<verification>
- `MSYS_NO_PATHCONV=1 BASE_PATH=/michelle_ngo_five pnpm build` exits 0 with chrome present on the placeholder home.
- `pnpm check` 0 errors; full `pnpm test` green.
- Every internal href in src/lib/components/ resolves through `${base}` (no `href="/..."` literals): `! grep -RnE 'href="/[a-z]' src/lib/components/`.
- TopNav, Footer, MobileMenu, VideoCard, CategoryTag, ContactBlock all exist and import only from '$lib/data' and './categoryAccent'.
</verification>

<success_criteria>
- Six components (CategoryTag, VideoCard, ContactBlock, TopNav, MobileMenu, Footer) ported, wired to existing v5 tokens + data, with passing tests.
- +layout.svelte renders TopNav above and Footer below every route; sitewide OG/favicon head preserved.
- Mobile menu is keyboard-operable (focus trap + Escape + return focus).
- Build is green and base-path-safe; no hardcoded absolute local links.
- The Phase-1 placeholder home (+page.svelte) is left intact (Phase 3 replaces it).
</success_criteria>

<output>
After completion, create `.planning/phases/02-shared-components-card-destinations-seo/02-01-SUMMARY.md`.
</output>
