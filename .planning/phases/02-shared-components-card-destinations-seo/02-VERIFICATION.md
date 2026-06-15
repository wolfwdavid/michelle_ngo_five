---
phase: 02-shared-components-card-destinations-seo
verified: 2026-06-14T19:55:00Z
status: passed
score: 13/13 must-haves verified
gaps:
  - truth: "Every page has a correct Open Graph / Twitter card image URL"
    status: resolved
    resolution: "Fixed in commit after verification — both og:image and twitter:image in src/routes/+layout.svelte now use the hardcoded absolute URL https://michellengo.net/og-image.jpg (no base-relative prefix). Rebuilt: clean URL confirmed on home, /about, and deep /watch/[id] pages; strict build still exits 0."
    reason: "The layout uses `https://michellengo.net{base}/og-image.jpg` but adapter-static defaults paths.relative=true, which resolves `base` as a relative string during prerendering (`.`, `..`, `../..`). The emitted og:image content becomes malformed: `https://michellengo.net./og-image.jpg` on the home page and `https://michellengo.net../../og-image.jpg` on /watch/[id] pages. This is broken in both staging and production builds (verified empirically with BASE_PATH='' run). Canonicals and all other SEO tags are correct; only the OG/Twitter image URL is broken."
    artifacts:
      - path: "src/routes/+layout.svelte"
        issue: "Line 30: `content=\"https://michellengo.net{base}/og-image.jpg\"` — `{base}` is a relative string under paths.relative=true; must be a hardcoded absolute URL string, not a template containing base"
    missing:
      - "Replace `https://michellengo.net{base}/og-image.jpg` with the hardcoded absolute URL `https://michellengo.net/og-image.jpg` in both og:image and twitter:image meta tags in src/routes/+layout.svelte"
      - "Same fix for twitter:image on the line immediately below"
---

# Phase 2: Shared Components, Card Destinations & SEO — Verification Report

**Phase Goal:** Content-complete site on the locked dark design system — all 56 /watch/[id] pages (click-to-load facade embeds + VideoObject JSON-LD + "more in category" rail), /work + 8 /work/[category] grids, PBS flagship (18 videos), About (Person JSON-LD) + Press + Contact, per-page canonical/SEO, and a sitemap — base-path-safe, prerendering green under STRICT mode.
**Verified:** 2026-06-14T19:55:00Z
**Status:** passed — the 1 gap (OG/Twitter image URL) was fixed and re-verified post-verification
**Re-verification:** Yes — OG image gap resolved (hardcoded absolute URL), strict build re-confirmed exit 0

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | Build exits 0 under STRICT prerendering (no handleHttpError tolerance) | VERIFIED | `BASE_PATH=/michelle_ngo_five pnpm build` exits 0; `strict: true` confirmed in svelte.config.js; scoped tolerance removed in 02-04 |
| 2 | 56 /watch/[id] pages prerendered | VERIFIED | `find build/watch -name index.html \| wc -l` = 56 |
| 3 | Zero iframes in prerendered watch pages (WATCH-02 facade) | VERIFIED | `grep -l '<iframe' build/watch/*/index.html \| wc -l` = 0; WatchPlayer mounts iframe only on click (`activated = $state(false)`) |
| 4 | VideoObject JSON-LD on all 56 watch pages (SEO-02) | VERIFIED | `grep -rl 'VideoObject' build/watch \| wc -l` = 56; fields name/description/thumbnailUrl/uploadDate/embedUrl confirmed in built HTML |
| 5 | /work + 8 /work/[category] prerendered grids (BRWS-01/BRWS-02) | VERIFIED | `find build/work -mindepth 2 -name index.html \| wc -l` = 8; build/work/index.html exists; entries()-driven via CATEGORIES.map |
| 6 | PBS flagship (18 videos + intro copy + pbs.org link) (PBS-01) | VERIFIED | build/pbs-american-portrait/index.html exists; getByCategory('PBS American Portrait') wired; blockquote + outbound link present in source |
| 7 | About (Person JSON-LD), Press (network credits), Contact (ContactBlock) (PAGE-01/02/03) | VERIFIED | All three index.html exist; `'"@type":"Person"'` in build/about/index.html; PRESTIGE_ORDER in _pressCredits.ts; ContactBlock reused on about + contact + footer |
| 8 | Per-page canonical on all pages (SEO-01 canonical half) | VERIFIED | 56 watch + 9 work (including /work/index.html) + pbs + about + press + contact all emit `rel="canonical"` with absolute production host |
| 9 | sitemap.xml with 70 loc entries (SEO-03) | VERIFIED | build/sitemap.xml exists; `grep -c '<loc>' build/sitemap.xml` = 70 (6 static + 8 category + 56 watch) |
| 10 | TopNav + Footer chrome sitewide, footer-mirrored nav (DSGN-04) | VERIFIED | +layout.svelte imports and renders `<TopNav />` + `<Footer />`; 1 `<nav>` + 1 `<footer>` in build/index.html; Footer column 2 mirrors category links via getCategoriesInDisplayOrder() |
| 11 | MobileMenu keyboard-operable (Escape + focus trap + return focus) | VERIFIED | MobileMenu.svelte: `event.key === 'Escape'` → onclose; full Tab/Shift+Tab trap; $effect saves/restores `previouslyFocused`; aria-label="Close menu" + ≥44px touch target |
| 12 | No leading-slash local hrefs in src/ (FND-02) | VERIFIED | `grep -RnE 'href="/[a-z]' src/lib/components/` = 0 matches; 4 matches in test files are querySelector selectors (not runtime hrefs) |
| 13 | OG/Twitter card image URL correct on all pages (SEO-01 OG half) | FAILED | `{base}` in `https://michellengo.net{base}/og-image.jpg` resolves as relative path under paths.relative=true — emits `https://michellengo.net./og-image.jpg` (home), `https://michellengo.net../og-image.jpg` (about), `https://michellengo.net../../og-image.jpg` (watch) |

**Score: 12/13 truths verified**

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/components/VideoCard.svelte` | Reusable 16:9 card with aspect-video, base-safe /watch link | VERIFIED | aspect-video present; `${base}/watch/${video.id}` href; focus-visible ring |
| `src/lib/components/TopNav.svelte` | Sitewide nav with getCategoriesInDisplayOrder + hamburger | VERIFIED | getCategoriesInDisplayOrder() called; MobileMenu triggered on hamburger click |
| `src/lib/components/Footer.svelte` | Footer-mirrored nav with ContactBlock + category directory | VERIFIED | ContactBlock + getCategoriesInDisplayOrder() + 3-column grid |
| `src/lib/components/MobileMenu.svelte` | Focus trap + Escape + ≥44px close button | VERIFIED | Full keyboard trap; Escape → onclose(); aria-label="Close menu"; min-h-[44px] min-w-[44px] |
| `src/lib/components/WatchPlayer.svelte` | Click-to-load facade: poster + button; iframe only when activated | VERIFIED | `activated = $state(false)`; `{#if activated}` gates iframe; aria-label="Play {title}"; aspect-video |
| `src/lib/components/ContactBlock.svelte` | Single source of truth for email/phone/Vimeo/IMDb/LinkedIn | VERIFIED | mynogo@gmail.com present; reused by Footer + about + contact |
| `src/routes/watch/[id]/+page.ts` | entries() over 56 ids + load returning {video, rail} | VERIFIED | `videos.map((v) => ({ id: v.id }))`; EntryGenerator exported; getById + getByCategory wired |
| `src/routes/watch/[id]/+page.svelte` | Facade + metadata + rail + VideoObject JSON-LD | VERIFIED | WatchPlayer imported; no raw `<iframe>`; VideoObject JSON-LD with all 5 required fields; canonical; CategoryTag; rail section |
| `src/routes/work/[category]/+page.ts` | entries() over 8 category slugs + filtered load | VERIFIED | `CATEGORIES.map((c) => ({ category: categoryToSlug(c) }))`; EntryGenerator exported |
| `src/routes/work/+page.svelte` | All-videos grid + canonical | VERIFIED | VideoCard grid; lg:grid-cols-4; `rel="canonical"` present |
| `src/routes/pbs-american-portrait/+page.svelte` | Flagship PBS landing with intro copy + grid + canonical | VERIFIED | "American Portrait" copy; pbs.org outbound link; VideoCard grid; canonical |
| `src/routes/about/+page.svelte` | About page with approved bio + Person JSON-LD | VERIFIED | Verbatim bio; ContactBlock; Person JSON-LD with sameAs; canonical |
| `src/routes/press/_pressCredits.ts` | Network-grouped broadcast credits from videos.json | VERIFIED | PRESTIGE_ORDER constant; grouped from uploader field |
| `src/routes/sitemap.xml/+server.ts` | Prerendered 70-URL sitemap | VERIFIED | `export const prerender = true`; SITE = 'https://michellengo.net'; getCategoriesInDisplayOrder + videos wired |
| `src/routes/+layout.svelte` | TopNav + Footer wired; sitewide OG head | PARTIAL | TopNav/Footer correctly wired; og:image URL malformed due to `{base}` in absolute URL template |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/routes/+layout.svelte` | TopNav + Footer | import + render around children | WIRED | `import TopNav` + `import Footer`; `<TopNav />` before `{@render children()}`; `<Footer />` after |
| `src/lib/components/TopNav.svelte` | $lib/data getCategoriesInDisplayOrder | build-time category list | WIRED | `getCategoriesInDisplayOrder()` called at module level |
| `src/lib/components/Footer.svelte` | ContactBlock | shared contact component | WIRED | `import ContactBlock from './ContactBlock.svelte'`; rendered in column 1 |
| `src/routes/watch/[id]/+page.ts` | $lib/data videos | entries() maps every video id | WIRED | `videos.map((v) => ({ id: v.id }))` |
| `src/routes/watch/[id]/+page.svelte` | WatchPlayer facade | click mounts iframe with video.embed | WIRED | `<WatchPlayer embed={video.embed} thumbnail={video.thumbnail} title={video.title} />` |
| `src/routes/watch/[id]/+page.svelte` | VideoObject JSON-LD | ld+json script with embedUrl/thumbnailUrl/uploadDate | WIRED | `{@html}` block with JSON.stringify(videoJsonLd); all fields confirmed in build/watch HTML |
| `src/routes/work/[category]/+page.ts` | $lib/data CATEGORIES | entries() maps every category slug | WIRED | `CATEGORIES.map((c) => ({ category: categoryToSlug(c) }))` |
| `src/routes/work/+page.svelte` | VideoCard | grid of cards from load data | WIRED | `{#each data.videos as video, i (video.id)}<VideoCard {video} eager={i < 8} />` |
| `src/routes/pbs-american-portrait/+page.ts` | $lib/data getByCategory | filter to PBS videos | WIRED | `getByCategory('PBS American Portrait')` in +page.ts |
| `src/routes/about/+page.svelte` | ContactBlock + Person JSON-LD | shared component + ld+json sameAs | WIRED | ContactBlock imported; personJsonLd with sameAs = [IMDB_URL, LINKEDIN_URL, VIMEO_URL] |
| `src/routes/contact/+page.svelte` | ContactBlock | same shared contact component | WIRED | `import ContactBlock from '$lib/components/ContactBlock.svelte'` |
| `src/routes/sitemap.xml/+server.ts` | $lib/data videos + categories | enumerates all watch + category URLs | WIRED | getCategoriesInDisplayOrder() + videos loop; 70 loc entries confirmed |
| `src/routes/+layout.svelte` | og-image.jpg | absolute URL for OG/Twitter | BROKEN | `https://michellengo.net{base}/og-image.jpg` — `{base}` is relative; produces `https://michellengo.net../og-image.jpg` on nested pages |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|---------|
| DSGN-04 | 02-01 | Chrome sitewide (TopNav + Footer + footer-mirrored nav) | SATISFIED | TopNav + Footer in +layout.svelte; Footer mirrors category nav; 181/181 tests green |
| WATCH-01 | 02-02 | 56 deep-linkable /watch/[id] pages prerendered | SATISFIED | 56 index.html files confirmed in build/watch |
| WATCH-02 | 02-02 | Click-to-load facade, never autoplay-with-sound | SATISFIED | WatchPlayer: 0 iframes in prerendered HTML; iframe mounts only on button click |
| WATCH-03 | 02-02 | Title, category, uploader/year, description shown | SATISFIED | h1, CategoryTag with href, uploader · year, conditional description in source + rendered HTML |
| WATCH-04 | 02-02 | "More in category" rail (hidden when empty) | SATISFIED | `{#if rail.length > 0}` section with VideoCard grid |
| BRWS-01 | 02-03 | /work shows all 56 in browsable grid | SATISFIED | work/index.html exists; VideoCard grid with lg:grid-cols-4 |
| BRWS-02 | 02-03 | /work/[category] prerendered for all 8 categories | SATISFIED | 8 category index.html files; entries()-driven via CATEGORIES.map |
| PBS-01 | 02-03 | PBS landing with 18 videos + intro copy + pbs.org link | SATISFIED | build/pbs-american-portrait/index.html; blockquote + outbound link + VideoCard grid |
| PAGE-01 | 02-04 | About page with approved bio + contact links | SATISFIED | Verbatim bio + ContactBlock in build/about/index.html |
| PAGE-02 | 02-04 | Press lists broadcast credits by network | SATISFIED | PRESTIGE_ORDER grouping; `${base}/watch/${id}` links |
| PAGE-03 | 02-04 | ContactBlock reused consistently (about/footer/contact) | SATISFIED | ContactBlock imported in all three surfaces; single source of truth |
| SEO-01 | 02-02/03/04 | Every page: title + meta description + canonical + OG/Twitter image | PARTIAL | Titles: all present. Meta descriptions: all present. Canonicals: all 70 pages correct. OG/Twitter image: BROKEN — malformed URL due to `{base}` in absolute URL template in +layout.svelte |
| SEO-02 | 02-02/04 | VideoObject JSON-LD on watch; Person JSON-LD on About | SATISFIED | 56 watch pages: VideoObject with all 5 required fields. About: Person JSON-LD with sameAs confirmed in build |
| SEO-03 | 02-04 | sitemap.xml enumerates all 70 routes | SATISFIED | build/sitemap.xml has exactly 70 `<loc>` entries (6+8+56), absolute production host |

---

### Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| `src/routes/+layout.svelte:30-31` | `https://michellengo.net{base}/og-image.jpg` — `{base}` is a relative path string under paths.relative=true (adapter-static default) | Blocker | OG image URL is invalid on every page; social share previews will fail to load the image sitewide; twitter:image has the same bug on line 36 |

No TODO/FIXME/placeholder comments found in Phase 2 code. No stub implementations. No hardcoded empty data arrays in rendered paths.

---

### Human Verification Required

#### 1. Mobile menu visual / interaction feel

**Test:** Open the site on a mobile viewport (<640px), tap the hamburger, navigate through categories, verify menu closes on link tap and on Escape.
**Expected:** Overlay opens full-screen, focus moves to close button, Tab cycles within overlay, Escape closes and returns focus to hamburger.
**Why human:** Focus trap + return-focus behavior requires a real browser; jsdom assertions in tests cover the logic but not the visual/interaction feel.

#### 2. VideoCard fade-up poster animation

**Test:** Open /work, scroll down; verify that poster images fade in as they enter the viewport (opacity-0 to opacity-100 on load).
**Expected:** Smooth opacity transition; no layout shift (aspect-video box maintains 16:9 before image loads).
**Why human:** Visual transition behavior requires a real browser.

#### 3. WatchPlayer: iframe autoplay on click

**Test:** Open any /watch/[id] page, click the play button; verify the Vimeo/YouTube embed starts playing.
**Expected:** Iframe mounts with the embed URL and video begins playing.
**Why human:** Requires real browser + network; the test suite uses jsdom which can't exercise the iframe.

---

### Gaps Summary

**1 gap blocking full goal achievement:**

**OG/Twitter image URL broken sitewide (SEO-01 partial failure).** The layout template `https://michellengo.net{base}/og-image.jpg` was intended to produce `https://michellengo.net/og-image.jpg` in production. However, SvelteKit's adapter-static defaults to `paths.relative: true`, which means the `base` import from `$app/paths` resolves to a relative string (`.` at the root, `..` one level deep, `../..` two levels deep) during prerendering. The resulting OG/Twitter image meta tag is `https://michellengo.net./og-image.jpg` on the home page and becomes increasingly broken at deeper routes.

**Fix:** Replace the two template literals in `src/routes/+layout.svelte` (lines 30 and 35) with the hardcoded absolute URL `https://michellengo.net/og-image.jpg`. The OG image is a production asset at the apex domain root — it should never be base-relative. This is a 2-line fix.

All other 12 truths — including the build exit 0 with strict prerendering, all 56 watch pages, all facade/VideoObject checks, 8 work category pages, PBS, About/Press/Contact, canonicals, sitemap (70 URLs), and the chrome — are fully verified against the actual build artifacts.

---

*Verified: 2026-06-14T19:55:00Z*
*Verifier: Claude (gsd-verifier)*
