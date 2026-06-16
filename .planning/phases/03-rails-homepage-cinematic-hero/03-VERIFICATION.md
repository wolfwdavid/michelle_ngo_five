---
phase: 03-rails-homepage-cinematic-hero
verified: 2026-06-15T21:50:00Z
status: passed
score: 12/12 must-haves verified
re_verification: false
gaps: []
human_verification: []
---

# Phase 03: Rails + Homepage Cinematic Hero — Verification Report

**Phase Goal:** Replace the placeholder home with a full-bleed cinematic hero (wordmark + tagline + PLAY REEL opening producer reel Vimeo 264677021; tasteful 3D/parallax gated on reduced-motion + graceful degradation; eager LCP poster) + 8 horizontal scroll-snap category rails (accent-labeled, card peek, keyboard + Prev/Next, SR-friendly, cards to /watch/[id], ZERO live iframes on home).

**Verified:** 2026-06-15T21:50:00Z
**Status:** PASSED
**Re-verification:** No — initial verification
**Human checkpoint:** Pre-approved by user; treated as satisfied.

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | A rail renders an accent-labeled region with a See-all link and a horizontal list of VideoCards | VERIFIED | `CategoryRail.svelte:51` — `<section aria-labelledby=...>` + `<h2>` with `categoryAccent()` + `href="${base}/work/${slug}/"` View-all link |
| 2 | Cards scroll-snap horizontally (proximity) with a visible peek on every breakpoint | VERIFIED | `CategoryRail.svelte:121` — `scroll-snap-type: x proximity`; `min-width: clamp(220px, 70vw, 300px)` peek recipe |
| 3 | Prev/Next buttons page the rail by ~85% width, behavior gated on motion | VERIFIED | `CategoryRail.svelte:44-48` — `scroller.scrollBy({ left: dir * scroller.clientWidth * 0.85, behavior: prefersReducedMotion.current ? 'auto' : 'smooth' })` |
| 4 | Rail is a labeled section wrapping a ul of focusable li/a cards — keyboard reaches every card, no focus trap | VERIFIED | `CategoryRail.svelte:69-73` — `<ul bind:this={scroller}>`; no `tabindex="0"` on scroller; VideoCard renders own `<li><a>` |
| 5 | A rail mounts zero iframes — cards are poster img only | VERIFIED | grep confirms no `iframe` in CategoryRail.svelte; all 3 test cases pass (15/15 tests green) |
| 6 | Full-bleed hero (min-height 88svh) leads with wordmark, tagline, and single PLAY REEL CTA | VERIFIED | `ReelHero.svelte:144-147` — `.hero { min-height: 88svh; }` + `<h1>Michelle Ngo</h1>` + `<p>Filmmaker...` + `<a class="hero-cta"` |
| 7 | PLAY REEL opens a focus-trapped lightbox that lazily mounts the Vimeo iframe (264677021) on click; Escape + backdrop close and return focus | VERIFIED | `ReelLightbox.svelte:49-100` — `{#if open}` gate; `role="dialog" aria-modal="true"`; `$effect` restores focus; `e.key === 'Escape'` handler; backdrop click closes |
| 8 | Before any click the hero mounts zero iframes; PLAY REEL degrades to /watch/264677021 with no JS | VERIFIED | `ReelHero.svelte:114-124` — PLAY REEL is `<a href="${base}/watch/${producerReelId}/">`; no `<iframe>` in ReelHero.svelte; ReelHero test confirms 0 iframes pre-click |
| 9 | Hero LCP poster img is eager + fetchpriority=high + explicit width/height (never lazy) | VERIFIED | `ReelHero.svelte:94-104` — `loading="eager" fetchpriority="high" width="1920" height="1080"`; build/index.html confirms `fetchpriority="high"` present, `loading="eager"` present |
| 10 | All hero parallax/tilt is double-gated (prefersReducedMotion.current AND @media no-preference, plus @supports) and degrades to static premium hero | VERIFIED | `ReelHero.svelte:240-260` — `@supports (animation-timeline: scroll())` wrapping `@media (prefers-reduced-motion: no-preference)` + `class:motion={motionOK}` where `motionOK = $derived(!prefersReducedMotion.current)` |
| 11 | Homepage replaces placeholder: ReelHero followed by 8 CategoryRails in display order; build emits exactly 8 aria-labelledby rail regions | VERIFIED | `+page.svelte` — `<ReelHero />` + `{#each data.rails}`; `build/index.html` — `aria-labelledby` count: **8**, zero iframes |
| 12 | Skip-to-content link + main landmark + build-time iframe guard wired into pnpm build | VERIFIED | `+layout.svelte:44,48` — `<a href="#main">Skip to content</a>` + `<main id="main">`; `package.json:12` — `"build": "vite build && node scripts/assert-home-no-iframe.mjs"`; guard printed "home: 0 iframes ✓" |

**Score:** 12/12 truths verified

---

### Required Artifacts

| Artifact | Min Lines | Actual Lines | Key Pattern | Status |
|----------|-----------|--------------|-------------|--------|
| `src/lib/components/CategoryRail.svelte` | 60 | 184 | `aria-labelledby` present | VERIFIED |
| `src/lib/components/CategoryRail.test.ts` | 40 | 118 | 6 assertions, all passing | VERIFIED |
| `src/lib/components/ReelLightbox.svelte` | 40 | 100 | `role="dialog"` present | VERIFIED |
| `src/lib/components/ReelHero.svelte` | 70 | 301 | `fetchpriority` present | VERIFIED |
| `src/lib/components/ReelLightbox.test.ts` | 30 | 77 | 4 assertions, all passing | VERIFIED |
| `src/lib/components/ReelHero.test.ts` | 30 | 81 | 5 assertions, all passing | VERIFIED |
| `src/routes/+page.svelte` | 25 | 56 | `CategoryRail` present | VERIFIED |
| `src/routes/+page.ts` | 8 | 23 | `getCategoriesInDisplayOrder` present | VERIFIED |
| `scripts/assert-home-no-iframe.mjs` | 8 | 39 | `iframe` check + `process.exit(1)` | VERIFIED |

---

### Key Link Verification

| From | To | Via | Status | Evidence |
|------|----|-----|--------|----------|
| `CategoryRail.svelte` | `VideoCard.svelte` | Renders one VideoCard per video inside `<ul>` | WIRED | Line 70-73: `{#each videos as video}<VideoCard {video} eager={false} />` |
| `CategoryRail.svelte` | `$lib/state/motion.svelte.ts` | scrollBy behavior gated on prefersReducedMotion.current | WIRED | Line 46: `behavior: prefersReducedMotion.current ? 'auto' : 'smooth'` |
| `CategoryRail.svelte` | `$lib/data categoryToSlug` | See-all link to /work/[slug] | WIRED | Line 60: `href={\`${base}/work/${slug}/\`}` |
| `ReelHero.svelte` | `ReelLightbox.svelte` | PLAY REEL click sets lightbox open=true | WIRED | Line 36+86-89+141: `import ReelLightbox`; `openReel` sets `open = true`; `<ReelLightbox bind:open>` |
| `ReelHero.svelte` | `$lib/data getById/producerReelId` | Reel embed + thumbnail resolved from dataset | WIRED | Lines 34, 40-43: `import { getById, producerReelId }`, `const reel = getById(producerReelId)` |
| `ReelHero.svelte` | `$lib/state/motion.svelte.ts` | Parallax/tilt gated on prefersReducedMotion.current | WIRED | Lines 35, 46, 59: `const motionOK = $derived(!prefersReducedMotion.current)`; `if (!motionOK) return` |
| `+page.svelte` | `ReelHero.svelte` | Hero leads the page | WIRED | Line 34: `<ReelHero />` |
| `+page.svelte` | `CategoryRail.svelte` | `{#each rails}` renders a CategoryRail per category | WIRED | Lines 37-39: `{#each data.rails as { category, videos }}<CategoryRail>` |
| `+page.ts` | `$lib/data` | `getCategoriesInDisplayOrder().map(c => ({category, videos: getByCategory(c)}))` | WIRED | Lines 13, 18-21 |

All 9 key links: WIRED.

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| HOME-01 | 03-01, 03-03 | One rail per category in display order, accent-labeled | SATISFIED | 8 rails confirmed in build/index.html; `getCategoriesInDisplayOrder()` drives `+page.ts` load |
| HOME-02 | 03-01 | Horizontal scroll-snap with visible peek of next card | SATISFIED | `scroll-snap-type: x proximity`; `clamp(220px, 70vw, 300px)` peek in CategoryRail.svelte |
| HOME-03 | 03-01 | Keyboard operable rails; Prev/Next on pointer devices | SATISFIED | `<ul>` of focusable `<li><a>`; two Prev/Next `<button type="button">`; `@media (hover: none)` hides them on touch |
| HOME-04 | 03-01 | SR-friendly labeled region + list semantics | SATISFIED | `<section aria-labelledby>` + `<ul>/<li>` pattern; no scroller `tabindex="0"` |
| HOME-05 | 03-01 | Cards open /watch/ page; See-all to /work/[category] | SATISFIED | VideoCard hrefs contain `/watch/`; See-all links to `/work/${slug}/` |
| HOME-06 | 03-01, 03-03 | Zero live iframes on home | SATISFIED | `build/index.html` iframe count: 0; build guard printed "home: 0 iframes ✓"; `{#if open}` gate in ReelLightbox |
| HERO-01 | 03-02, 03-03 | Full-bleed hero with wordmark, tagline, PLAY REEL CTA | SATISFIED | `<h1>Michelle Ngo</h1>` + `<p>Filmmaker & producer...` + `<a class="hero-cta">Play reel` |
| HERO-02 | 03-02 | PLAY REEL opens Vimeo 264677021; degrades to /watch/264677021 with no JS | SATISFIED | `href="${base}/watch/${producerReelId}/"` (no-JS fallback); click opens ReelLightbox with iframe src containing `264677021` |
| HERO-03 | 03-02 | Tasteful 3D/parallax gated on reduced-motion, graceful degradation | SATISFIED | `@supports (animation-timeline: scroll())` + `@media (prefers-reduced-motion: no-preference)` + `class:motion={motionOK}` triple guard |
| HERO-04 | 03-02 | LCP image loads eagerly, not lazy | SATISFIED | `loading="eager" fetchpriority="high" width="1920" height="1080"`; confirmed in build/index.html |

All 10 requirements: SATISFIED.

---

### Anti-Patterns Found

| File | Pattern | Severity | Verdict |
|------|---------|----------|---------|
| All phase 03 files | TODO / FIXME / PLACEHOLDER scan | — | None found |
| `CategoryRail.svelte` | `tabindex="0"` on scroller | — | Correctly absent (Pitfall A avoided) |
| `CategoryRail.svelte` | `scroll-snap-type: x mandatory` | — | Correctly absent (Pitfall E avoided); uses `proximity` |
| `ReelHero.svelte` | `loading="lazy"` on LCP img | — | Correctly absent; `loading="eager"` used |
| `+page.svelte` | Nested `<main>` | — | Absent; layout owns the single `<main id="main">` |
| Phase 03 Svelte files | Leading-slash absolute hrefs | — | None found; all use `${base}/...` pattern |

No blockers, no warnings.

---

### Build + Test Summary

| Check | Result |
|-------|--------|
| `pnpm build` (with `BASE_PATH=/michelle_ngo_five`) | Exit 0 |
| `assert-home-no-iframe.mjs` guard (run as part of build) | "home: 0 iframes ✓" |
| `build/index.html` — `aria-labelledby` count | **8** (exactly 8 rails) |
| `build/index.html` — `<iframe` count | **0** |
| `build/index.html` — `id="main"` | Present (1) |
| `build/index.html` — `fetchpriority="high"` | Present (1) |
| `build/index.html` — `loading="eager"` | Present (1) |
| `build/index.html` — `loading="lazy"` | 56 (rail card posters — correct) |
| `pnpm check` | 0 errors, 0 warnings (471 files) |
| `pnpm test` (full suite) | 196/196 passed, 25 test files |
| CategoryRail.test.ts | 6/6 passed |
| ReelLightbox.test.ts | 4/4 passed |
| ReelHero.test.ts | 5/5 passed |

---

### Human Verification Required

None. The human checkpoint (visual/interaction review of hero, PLAY REEL, 8 rails, keyboard navigation, reduced-motion behavior, and mobile swipe) was pre-approved by the user and is treated as satisfied.

---

## Gaps Summary

No gaps. All 12 observable truths verified, all 9 key links wired, all 10 requirements satisfied, build exits 0 with the iframe guard passing, `pnpm check` is clean, and all 196 tests pass.

---

_Verified: 2026-06-15T21:50:00Z_
_Verifier: Claude (gsd-verifier)_
