# Architecture Research

**Domain:** Static SvelteKit video portfolio with a YouTube-style rails homepage (GitHub Pages)
**Researched:** 2026-06-14
**Confidence:** HIGH (the sibling repo `michelle_ngo_four` is a fully-shipped, test-covered implementation of ~90% of this architecture; only the rails homepage layer is genuinely new)

## Summary: What's Reused vs What's New

v5 inherits a **proven, content-complete architecture** from `michelle_ngo_four`. The data layer, schema, loader API, build-time Zod validation, route set, prerender `entries()` patterns, base-path handling, and two-workflow deploy are all working in v4 and should be lifted nearly verbatim. The 56-video dataset and posters carry over unchanged.

The **only genuinely new architecture** in v5 is the **homepage composition**: v4's home was a flat featured grid (8 cards) + hero; v5's home is **N horizontal category rails** (one per category, in display order), each a horizontal scroller of `VideoCard`s. This introduces three new/changed components (`CategoryRail`, `RailRow`, a richer `ReelHero`) and changes only `/+page.ts` and `/+page.svelte`. Everything downstream of a card click (`/watch/[id]`, `/work`, `/work/[category]`, etc.) is unchanged from v4.

**Build-order headline:** rebuild the data layer + chrome first (it's a copy), then build the rails homepage last because it depends on `VideoCard` and the `getByCategory` / `getCategoriesInDisplayOrder` loader API that everything else also needs.

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│  BUILD TIME (Node) — runs once, ships zero JS for data                 │
├──────────────────────────────────────────────────────────────────────┤
│  videos.json (56 records, 8 categories)                                │
│      │                                                                 │
│      ├──► vite.config.ts: validateVideosPlugin (buildStart)            │
│      │       └─ VideoArraySchema.safeParse + (source,id) uniqueness    │
│      │          → fails `pnpm build`/`pnpm dev` on bad data            │
│      │                                                                 │
│      └──► $lib/data (index.ts public surface)                          │
│              schema.ts ── VideoSchema / VideoArraySchema (Zod 4)        │
│              categories.ts ── CATEGORIES, slug<->category              │
│              videos.ts ── parse() once → loader API:                   │
│                 videos, getById, getByCategory,                        │
│                 getCategoriesInDisplayOrder,                           │
│                 getCategoriesWithCounts, producerReelId                │
├──────────────────────────────────────────────────────────────────────┤
│  ROUTE LOADERS (+page.ts) — run at prerender, output baked into HTML   │
├──────────────────────────────────────────────────────────────────────┤
│  / ──► getCategoriesInDisplayOrder() + getByCategory(c) → rails[]      │
│  /work ──► videos (sorted)                                              │
│  /work/[category] ──► entries()=8 slugs; getByCategory(slug)           │
│  /watch/[id] ──► entries()=56 ids; getById + same-cat rail            │
│  /pbs-american-portrait ──► getByCategory('PBS American Portrait')     │
│  /about /press /contact ──► static                                     │
│  /sitemap.xml ──► +server.ts enumerates 6+8+56 = 70 URLs              │
├──────────────────────────────────────────────────────────────────────┤
│  COMPONENT TREE (prerendered HTML + minimal hydration)                 │
├──────────────────────────────────────────────────────────────────────┤
│  +layout.svelte:  TopNav ─► (route) ◄─ Footer ─► ContactBlock         │
│                                                                        │
│  / :  ReelHero                                                         │
│         └─ #hero-sentinel (IntersectionObserver target for TopNav)     │
│       CategoryRail × N  (NEW)                                          │
│         └─ RailRow (horizontal scroller, NEW)                          │
│              └─ VideoCard × M  ─► /watch/[id]                          │
│                   └─ CategoryTag                                       │
│       WatchPlayer lives on /watch/[id] (iframe wrapper)                │
└──────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Status vs v4 | Implementation |
|-----------|----------------|--------------|----------------|
| `$lib/data` (index.ts) | Single public import surface for all data | **Reuse verbatim** | Re-exports schema types, category helpers, loader fns |
| `schema.ts` | Zod 4 `VideoSchema` (discriminatedUnion on `source`), defaults for `featured/hidden/tags` | **Reuse verbatim** | `z.strictObject`, `z.iso.date()`, `VideoArraySchema` |
| `categories.ts` | `CATEGORIES` const list, `categoryToSlug`, `slugToCategory` | **Reuse verbatim** | Closed enum + memoized slug map |
| `videos.ts` | Parse once; expose `videos`, `getById`, `getByCategory`, `getCategoriesInDisplayOrder`, `getCategoriesWithCounts`, `producerReelId` | **Reuse verbatim** | Applies Zod defaults; computes display order count-desc/ties-alpha |
| `validateVideosPlugin` | Fail build on schema violation or dup `(source,id)` | **Reuse verbatim** | Vite plugin, `buildStart` hook, `z.prettifyError` |
| `TopNav` | Wordmark + category links + About/Press/Contact; scroll-aware transparency over hero on `/` | **Reuse, light tweak** | `IntersectionObserver` on `#hero-sentinel`; `$app/state` page reactivity |
| `MobileMenu` | Overlay nav for `<sm` | **Reuse** | Toggled by TopNav hamburger |
| `Footer` | 3-col directory: ContactBlock + category mirror + site links | **Reuse verbatim** | Reads `getCategoriesInDisplayOrder()` |
| `ContactBlock` | Single source of truth for email/phone/socials | **Reuse verbatim** | No props; used on /about, /contact, Footer |
| `VideoCard` | One card: 16:9 thumb (blur-up fade), CategoryTag, title, uploader; wraps `<a>` to `/watch/[id]` | **Reuse verbatim** | `eager` prop for above-the-fold; `data-sveltekit-preload-data="hover"` |
| `CategoryTag` | Per-category accent label; `<span>` or `<a>` based on `href` prop | **Reuse verbatim** | `categoryAccent()` static map |
| `ReelHero` | Full-bleed reel-led hero: poster (LCP), gradient, name/tagline, PLAY REEL CTA, scroll cue, `#hero-sentinel`; **v5: add motion-safe 3D/parallax** | **Evolve from `HeroPoster`** | Layered z-stack; `prefers-reduced-motion` gate for any motion |
| `CategoryRail` | **NEW.** One labeled shelf: heading-is-link (`More in {cat} →` to /work/[slug]) + a `RailRow` of that category's cards | **NEW** | Receives `{ category, videos }`; renders `RailRow` |
| `RailRow` | **NEW.** Horizontal scroller: scroll-snap track + keyboard/touch nav + optional prev/next arrows; honors reduced-motion | **NEW** | CSS scroll-snap + `aria` roles; arrows scroll by viewport |
| `WatchPlayer` | Iframe embed wrapper (aspect-video, lazy, no autoplay) on /watch/[id] | **Extract from v4 inline** | Currently inline in `/watch/[id]/+page.svelte`; v5 may extract to a named component |

## Recommended Project Structure

```
src/
├── app.css                      # Tailwind import + @theme OKLCH per-category accents (reuse)
├── app.html                     # shell (reuse)
├── lib/
│   ├── assets/
│   │   └── hero-poster.webp      # hero LCP image (reuse or refresh)
│   ├── data/                     # ── DATA LAYER (reuse verbatim from v4) ──
│   │   ├── index.ts              # public surface: import { ... } from '$lib/data'
│   │   ├── schema.ts             # Zod 4 VideoSchema / VideoArraySchema
│   │   ├── categories.ts         # CATEGORIES + slug helpers
│   │   ├── videos.ts             # typed loader (getByCategory, getById, ...)
│   │   └── videos.json           # 56 records (copy from v4)
│   └── components/
│       ├── categoryAccent.ts     # Category -> text-cat-* literal map (reuse)
│       ├── CategoryTag.svelte    # (reuse)
│       ├── VideoCard.svelte      # (reuse verbatim — the rail's leaf)
│       ├── TopNav.svelte         # (reuse, light tweak)
│       ├── MobileMenu.svelte     # (reuse)
│       ├── Footer.svelte         # (reuse)
│       ├── ContactBlock.svelte   # (reuse)
│       ├── ReelHero.svelte       # (evolve from HeroPoster — add motion-safe depth)
│       ├── CategoryRail.svelte   # NEW — labeled shelf
│       ├── RailRow.svelte        # NEW — horizontal scroller primitive
│       └── WatchPlayer.svelte    # NEW (optional extract) — iframe wrapper
├── routes/
│   ├── +layout.svelte            # TopNav + {children} + Footer + head/SEO (reuse)
│   ├── +layout.ts                # prerender=true; trailingSlash='always' (reuse)
│   ├── +page.svelte              # CHANGED — ReelHero + {#each rails} CategoryRail
│   ├── +page.ts                  # CHANGED — build rails[] from category data
│   ├── +error.svelte             # (reuse)
│   ├── work/
│   │   ├── +page.svelte | +page.ts            # all-videos grid (reuse)
│   │   └── [category]/+page.svelte | +page.ts # entries()=8 slugs (reuse)
│   ├── watch/[id]/+page.svelte | +page.ts     # entries()=56 ids (reuse)
│   ├── pbs-american-portrait/+page.svelte|.ts # flagship landing (reuse)
│   ├── about/+page.svelte        # bio + Person JSON-LD (reuse)
│   ├── press/+page.svelte        # broadcast credits (reuse)
│   ├── contact/+page.svelte      # ContactBlock (reuse)
│   └── sitemap.xml/+server.ts    # 70-URL sitemap (reuse)
├── svelte.config.js              # adapter-static, paths.base = BASE_PATH ?? '' (reuse)
└── vite.config.ts                # tailwind + validateVideosPlugin + sveltekit (reuse)
```

### Structure Rationale

- **`lib/data/` is a self-contained, framework-agnostic layer.** Routes only ever import from `$lib/data` (the `index.ts` barrel), never from `videos.ts`/`schema.ts` directly. This single import path means the rails refactor touches zero data code.
- **`lib/components/` is flat (no per-feature folders).** v4 proved a flat component dir scales fine for ~12 components. The rails additions (`CategoryRail`, `RailRow`) sit alongside the rest; `VideoCard` is shared by rails, grids, and the watch rail with **no variants**.
- **Rails logic lives in components + the home loader, not the data layer.** The data layer already exposes exactly what rails need (`getCategoriesInDisplayOrder`, `getByCategory`). Composing them into rail rows is a view concern, kept in `/+page.ts` (data shaping) and `CategoryRail`/`RailRow` (presentation).

## Architectural Patterns

### Pattern 1: Build-time data, zero runtime fetch (the core invariant)

**What:** All 56 videos live in version-controlled JSON. Zod parses once at module load (build time). `adapter-static` prerenders every route, so the parsed/sorted data is baked into HTML. No client fetch, no DB, no API.
**When to use:** Static content portfolio with a known, curated dataset (exactly this).
**Trade-offs:** Content edits require a rebuild + deploy (acceptable — out of scope: CMS). Upside: fastest possible LCP, no runtime errors, trivially cacheable, free hosting.

```typescript
// videos.ts — parse once, defaults applied, never ships to client
const _parsed = VideoArraySchema.parse(rawVideos);
export const videos = _parsed.filter((v) => !v.hidden);
```

### Pattern 2: Rails homepage compose (NEW — the v5 signature)

**What:** The home loader produces an ordered array of `{ category, videos }` rail objects. The page `{#each}`es them into `CategoryRail` components, each rendering a `RailRow` of `VideoCard`s. Ordering and per-rail video selection are computed at build time; the prerendered HTML already contains every card.
**When to use:** YouTube-style "shelves" home where each row is a category.
**Trade-offs:** More DOM on the home page than a single grid (N rails × M cards). Mitigation: thumbnails lazy-load by default (`VideoCard` already does `loading="lazy"` for non-eager); only the first rail's first few cards pass `eager={true}`. Horizontal overflow is CSS-only (scroll-snap), so no JS is required for the core scroll — JS only enhances with arrow buttons.

```typescript
// /+page.ts — shape the rails at build time
import { getCategoriesInDisplayOrder, getByCategory } from '$lib/data';

export const load: PageLoad = () => ({
  rails: getCategoriesInDisplayOrder().map((category) => ({
    category,
    videos: [...getByCategory(category)].toSorted(
      (a, b) =>
        (a.featured === b.featured ? 0 : a.featured ? -1 : 1) ||
        b.published.localeCompare(a.published)
    ),
  })),
});
```

```svelte
<!-- /+page.svelte -->
<ReelHero />
{#each data.rails as rail, i (rail.category)}
  <CategoryRail category={rail.category} videos={rail.videos} eager={i === 0} />
{/each}
```

### Pattern 3: Accessible horizontal scroller (`RailRow`, NEW)

**What:** A scroll-snap track that is operable by touch, mouse-drag/trackpad, AND keyboard. Prev/next arrow buttons scroll by one "page" (≈ visible width). The track is a list (`<ul role="list">` of `<li>`); arrows are real `<button>`s with `aria-label`. Focusable cards (the existing `<a>` in `VideoCard`) make the row keyboard-traversable via Tab; arrows are a convenience, not the only way to navigate.
**When to use:** Every rail row.
**Trade-offs:** Must honor `prefers-reduced-motion` (use `scroll-behavior: smooth` only when motion is allowed; instant jump otherwise). Arrow buttons need JS; the row must remain fully usable with JS disabled (native overflow scroll + keyboard). Overflow-clipping the row must not clip focus rings vertically — use horizontal `overflow-x-auto` with vertical padding so focus rings render.

```svelte
<!-- RailRow.svelte (shape) -->
<div class="relative group">
  <button aria-label="Scroll left" onclick={() => scrollByPage(-1)} class="rail-arrow ...">‹</button>
  <ul bind:this={track} role="list"
      class="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth motion-reduce:scroll-auto py-2">
    {#each videos as video, i (video.id)}
      <li class="snap-start shrink-0 w-[60vw] sm:w-64 lg:w-72">
        <VideoCard {video} eager={eager && i < 3} />
      </li>
    {/each}
  </ul>
  <button aria-label="Scroll right" onclick={() => scrollByPage(1)} class="rail-arrow ...">›</button>
</div>
```

### Pattern 4: Mandatory `entries()` under `adapter-static strict: true`

**What:** Every dynamic route (`/work/[category]`, `/watch/[id]`) MUST export an `EntryGenerator` so the prerenderer knows every path to emit. v4 derives these from the single sources of truth: 8 category slugs and 56 video ids.
**When to use:** Any `[param]` route on a fully static build.
**Trade-offs:** Forget it and `strict: true` fails the build (this is the intended safety net). Keep entries derived from `$lib/data` so adding a video/category auto-extends the prerender set.

```typescript
export const entries: EntryGenerator = () => videos.map((v) => ({ id: v.id }));           // /watch/[id]
export const entries: EntryGenerator = () => CATEGORIES.map((c) => ({ category: categoryToSlug(c) })); // /work/[category]
```

### Pattern 5: Base-path-safe links via `$app/paths` `base`

**What:** Every internal href is `` `${base}/...` `` where `base` comes from `$app/paths`. `svelte.config.js` sets `paths.base = process.env.BASE_PATH ?? ''`. Staging builds with `BASE_PATH=/michelle_ngo_five`; apex builds with `BASE_PATH=''`.
**When to use:** Every internal link, every static asset reference (favicons, posters, og-image).
**Trade-offs:** Hardcoding `/work/...` breaks on the `/michelle_ngo_five/` staging deploy. The `base` idiom is the locked-in convention across v4 (TopNav, VideoCard, Footer, CategoryTag, hero). Active-link detection must `endsWith` the slug suffix (not `===`) because `paths.relative` can render `base` as a relative `../..` during SSR.

## Data Flow

### Request Flow (build time → static HTML)

```
videos.json
   ↓ (buildStart) validateVideosPlugin → fail fast on bad data
   ↓ (module load) VideoArraySchema.parse → defaults applied → `videos`
   ↓
/+page.ts load()  →  getCategoriesInDisplayOrder() + getByCategory(c)  →  rails[]
   ↓ (prerender)
/+page.svelte  →  ReelHero + {#each rails} CategoryRail → RailRow → VideoCard
   ↓
build/index.html  (every rail + every card baked in; thumbnails lazy)
```

### Click-through Flow (runtime, client navigation)

```
[user clicks a VideoCard in a rail]
   → href = `${base}/watch/${video.id}`  (preloaded on hover)
   → /watch/[id] prerendered HTML: WatchPlayer iframe + "More in {category}" rail
   → CategoryTag link → /work/[category] grid
```

### Key Data Flows

1. **Rails compose (NEW):** `getCategoriesInDisplayOrder()` gives rail order (count-desc, ties-alpha); `getByCategory(c)` fills each rail; per-rail sort = featured-first then date-desc — identical sort logic already used by `/work`, `/work/[category]`, `/pbs`, and the watch rail, so v5 reuses one comparator everywhere.
2. **Single-source category taxonomy:** `CATEGORIES` drives the Zod enum, the nav, the footer, the rail set, the `/work/[category]` entries, and the sitemap. Add a category in one place → it propagates to every surface (plus one `categoryAccent` entry + one `--color-cat-*` var).
3. **Reel CTA:** `producerReelId = '264677021'` is read by `ReelHero`'s PLAY REEL CTA → links to `/watch/264677021`; the reel video stays in the public `videos` array so it also appears in its category rail.

## Suggested Build Order

Dependencies flow upward — build the shared leaves first, the composing surfaces last. The rails homepage is intentionally **last** because it depends on both the data API and `VideoCard`.

| Step | Build | Depends on | Why this order |
|------|-------|-----------|----------------|
| 1 | Scaffold + config (`svelte.config.js`, `vite.config.ts` with `validateVideosPlugin`, `app.css` OKLCH theme, `+layout.ts`) | — | Everything compiles against this; validation must exist before data lands |
| 2 | Data layer (`categories.ts` → `schema.ts` → `videos.ts` → `index.ts`) + copy `videos.json` | step 1 | The whole site reads `$lib/data`; copy verbatim from v4 |
| 3 | Leaf components: `CategoryTag`, `VideoCard`, `categoryAccent` | step 2 (types) | Shared by rails, grids, watch rail; no upstream deps |
| 4 | Chrome: `TopNav` + `MobileMenu`, `Footer`, `ContactBlock` (and `+layout.svelte`) | steps 2–3 | Sitewide; needed by every route's visual shell |
| 5 | Browse routes: `/work`, `/work/[category]` (`entries()`), `/watch/[id]` (`entries()` + WatchPlayer), `/pbs-american-portrait` | steps 3–4 | These are card destinations; build before the home links to them |
| 6 | Static routes: `/about` (Person JSON-LD), `/press`, `/contact`, `/sitemap.xml` | step 4 | Independent; can parallelize with step 5 |
| 7 | **`RailRow`** (horizontal scroller primitive) | `VideoCard` (step 3) | NEW; the reusable scroll mechanic |
| 8 | **`CategoryRail`** (labeled shelf) | `RailRow` (step 7) | NEW; wraps RailRow with heading-is-link |
| 9 | **`ReelHero`** (evolve from HeroPoster; motion-safe depth/parallax) | `producerReelId`, `#hero-sentinel` contract with TopNav | NEW polish; TopNav transparency depends on the sentinel |
| 10 | **`/+page.ts` + `/+page.svelte`** (rails homepage compose) | steps 7–9 + data | The signature surface; assembles everything |
| 11 | Deploy workflows (`deploy.yml` staging, `deploy-production.yml` apex + CNAME) | a building site | Verify-then-flip; staging on push, apex on manual dispatch |

**Phase implication for the roadmap:** steps 1–6 are a near-verbatim port of shipped v4 code (low risk, fast) and naturally form a "foundation + reuse" phase. Steps 7–10 are the genuinely new rails work and warrant their own phase with a11y/perf attention (keyboard scrolling, reduced-motion, lazy thumbnails, iframe budget). Step 9's 3D/parallax is the one area likely to need deeper phase-specific research (depth/motion technique choice, perf budget on mobile).

## Scaling Considerations

This is a static portfolio; "scale" means content volume and page weight, not concurrent users (GitHub Pages CDN handles traffic).

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Current (56 videos, 8 cats) | No changes. Flat JSON, prerender all routes, lazy thumbnails. |
| ~200 videos | Home page DOM grows (more cards per rail). Cap cards per rail (e.g., first 12 + "see all" → /work/[category]); keep full set on the category grid. |
| ~1000 videos / many categories | Consider per-rail "lazy mount" (IntersectionObserver renders a rail's cards when it scrolls near). Still no backend; JSON stays the source of truth. |

### Scaling Priorities

1. **First bottleneck — home page weight/LCP:** too many eager thumbnails. Fix: only the first visible rail's first ~3 cards are `eager`; everything else `loading="lazy"`. Already the v4 card default.
2. **Second bottleneck — concurrently-mounted iframes:** never mount video iframes in cards (cards are `<img>` thumbs linking to /watch). Only `/watch/[id]` mounts one iframe, lazy. This caps the iframe budget at 1 by construction.

## Anti-Patterns

### Anti-Pattern 1: Dynamic Tailwind class names for category colors

**What people do:** `` class={`text-cat-${categoryToSlug(category)}`} `` to color rails/tags.
**Why it's wrong:** Tailwind v4's scanner only emits classes that appear **literally** in source. A computed class is never generated, so the color silently doesn't exist in the bundled CSS.
**Do this instead:** Keep the verbatim `Category → 'text-cat-*'` map in `categoryAccent.ts` (every literal spelled out), backed by `--color-cat-*` vars in `app.css`. Reuse v4's exactly.

### Anti-Pattern 2: Mounting video iframes inside rail/grid cards

**What people do:** Embed a playable iframe in each `VideoCard` for inline preview.
**Why it's wrong:** N rails × M cards = dozens of iframes → catastrophic mobile LCP and memory; blows the iframe budget.
**Do this instead:** Cards are `<img>` thumbnails wrapped in an `<a>` to `/watch/[id]`. Exactly one iframe mounts, lazily, on the watch page.

### Anti-Pattern 3: Arrow-button-only rail navigation

**What people do:** Build the horizontal scroller so it only scrolls via JS prev/next buttons.
**Why it's wrong:** Breaks keyboard users, breaks with JS disabled, fails WCAG. Also fragile in SSR/prerender.
**Do this instead:** Native CSS `overflow-x-auto` + `scroll-snap` is the substrate (works with zero JS, keyboard-Tab through cards). Arrow buttons are a progressive enhancement layered on top, with `aria-label`s and reduced-motion-aware scrolling.

### Anti-Pattern 4: Hardcoded internal links / asset paths

**What people do:** `href="/work/..."` or `src="/posters/..."`.
**Why it's wrong:** Breaks on the `/michelle_ngo_five/` staging base path.
**Do this instead:** `` `${base}/...` `` via `$app/paths` for every internal href and static asset. Active-state checks use `endsWith` on the slug suffix (handles `paths.relative` + `trailingSlash='always'`).

### Anti-Pattern 5: Validating data only in tests (not at build)

**What people do:** Rely on vitest to catch bad `videos.json`.
**Why it's wrong:** A bad commit can deploy if tests are skipped. Schema drift ships silently.
**Do this instead:** Keep the `validateVideosPlugin` in `vite.config.ts` (`buildStart`) so `pnpm build` AND `pnpm dev` fail fast with a row-pointing `z.prettifyError` message — defense in depth alongside the vitest checks.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Vimeo | `<iframe src={video.embed}>` on /watch only; PLAY REEL → reel id `264677021` | No API; embed URLs live in `videos.json`. Lazy, no autoplay. |
| YouTube | `<iframe src={video.embed}>` on /watch only | Same pattern; `source` discriminator in schema future-proofs source-specific fields |
| GitHub Pages | `adapter-static` → `build/` → `upload-pages-artifact` → `deploy-pages` | `.nojekyll` required; `404.html` fallback; CNAME for apex |
| Google (SEO) | Build-time JSON-LD: `VideoObject` on /watch, `Person` on /about; `/sitemap.xml` | `{@html}` of `JSON.stringify` — safe (no user input); 70-URL sitemap |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| routes ↔ data | `import { ... } from '$lib/data'` (barrel only) | Never import `videos.ts`/`schema.ts` directly — single refactor point |
| `/+page.ts` ↔ `CategoryRail` | typed `rails: { category, videos }[]` via `PageData` | Loader shapes; component renders; no logic duplication |
| `CategoryRail` ↔ `RailRow` ↔ `VideoCard` | props down only (`category`, `videos`, `eager`) | One-way data flow; cards are pure leaves linking out |
| `ReelHero` ↔ `TopNav` | DOM contract: `#hero-sentinel` div observed by TopNav's IntersectionObserver | Only cross-component coupling; keep the id stable |

### Base-Path & Deploy Architecture

- **`svelte.config.js`:** `adapter-static({ fallback: '404.html', strict: true })`, `paths.base = process.env.BASE_PATH ?? ''`.
- **Staging (`deploy.yml`):** triggers on push to `main`; builds with `BASE_PATH=/${{ github.event.repository.name }}` → serves at `wolfwdavid.github.io/michelle_ngo_five/`; `noindex` meta in `+layout.svelte` keeps it out of search.
- **Production (`deploy-production.yml`):** `workflow_dispatch` only (verify-then-flip); builds with `BASE_PATH=''`; asserts `build/CNAME` exists before deploy → serves at `michellengo.net`.
- Both upload `build/` via `upload-pages-artifact@v3` + `deploy-pages@v4`, share `concurrency: group: pages`. Node 22, pnpm 11, `--frozen-lockfile`.

## Sources

- `michelle_ngo_four` shipped source — data layer (`src/lib/data/*`), components (`src/lib/components/*`), routes (`src/routes/*`), `vite.config.ts`, `svelte.config.js`, `.github/workflows/{deploy,deploy-production}.yml` — HIGH confidence (working, test-covered reference implementation)
- `michelle_ngo_five/.planning/PROJECT.md` — v5 scope, locked decisions, rails-homepage requirement, two-workflow deploy, motion-safe 3D/parallax goal

---
*Architecture research for: static SvelteKit video portfolio with a YouTube-style rails homepage*
*Researched: 2026-06-14*
