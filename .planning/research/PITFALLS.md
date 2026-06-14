# Pitfalls Research

**Domain:** Static SvelteKit (adapter-static) video portfolio on GitHub Pages — YouTube-style horizontal rails, many Vimeo/YouTube embeds, tasteful 3D/parallax, dark-only theme
**Researched:** 2026-06-14
**Confidence:** HIGH (core mechanics verified against SvelteKit docs, axe/WCAG ACT rules, web.dev, and Chrome/TPGi a11y guidance; sibling repos v2–v4 provide a proven baseline)

> Scope note: this milestone is greenfield with a proven baseline. The genuinely *new* risk surface is (a) the GitHub Pages base-path/apex cutover, (b) the **horizontal rails** pattern (new in v5 — v3 was vertical scroll-snap, v4 was a static grid), (c) keeping the iframe budget sane on a rails home that can show dozens of cards, and (d) the "tasteful 3D/parallax" ask not wrecking perf/a11y. The pitfalls below are weighted toward those four areas.

---

## Critical Pitfalls

### Pitfall 1: GitHub Pages base-path breakage (the `%sveltekit.assets%` / hardcoded-URL trap)

**What goes wrong:**
The site works perfectly at `localhost:5173` and breaks the moment it deploys to `wolfwdavid.github.io/michelle_ngo_five/`. CSS doesn't load, posters 404, internal links 404, the favicon is missing. Then it breaks *again* in the opposite direction when you cut over to the apex `michellengo.net` (base `''`) because you hardcoded `/michelle_ngo_five/...` somewhere.

**Why it happens:**
GitHub Pages project sites serve from a subpath (`/michelle_ngo_five/`), but the apex/CNAME serves from root (`/`). Any asset or link reference that ignores SvelteKit's `base` will point at the wrong place in one of the two environments. The classic offenders: `<img src="/posters/foo.jpg">` (absolute, ignores base), `fetch('/data/videos.json')`, hand-written `<a href="/watch/123">`, and CSS `background: url(/...)`. SvelteKit fixes routed `<a>`/`<img>` via the compiler **only when you use the `base` store**; raw absolute paths are passed through untouched.

**How to avoid:**
- Set `kit.paths.base` from an env var so the *same* code builds for both targets: `base: process.env.BASE_PATH ?? ''`. Staging workflow sets `BASE_PATH=/michelle_ngo_five`; apex workflow leaves it empty.
- For internal links/assets in markup, import `{ base }` from `$app/paths` and prefix: `<a href="{base}/watch/{id}">`, `<img src="{base}/posters/{slug}.jpg">`. Or use `%sveltekit.assets%` in `app.html` for the favicon/static head assets.
- Never write a leading-slash absolute URL to a local asset by hand. Lint for `src="/` and `href="/` and `url(/` in the repo.
- For data: import the JSON at build time (`import videos from '$lib/data/videos.json'`) instead of `fetch`-ing it at runtime, which sidesteps the base-path issue entirely and is faster.
- Add `.nojekyll` to the build output root (adapter-static + Pages will otherwise let Jekyll strip the `_app/` directory — files/folders starting with `_` are ignored by Jekyll, which is exactly where SvelteKit puts its assets).

**Warning signs:**
A deploy preview where the page renders as unstyled HTML; DevTools Network tab full of 404s all sharing a `/michelle_ngo_five/michelle_ngo_five/...` doubled prefix (over-prefixing) or missing-prefix 404s; favicon missing only on Pages.

**Phase to address:**
**Phase 1 (Foundation/scaffold + deploy)** — get a trivial page deploying to the github.io subpath *before* building features, so base-path is proven end-to-end early.

---

### Pitfall 2: SPA-style routes 404 on Pages because there's no `fallback` / 404.html — and `/watch/[id]` deep links die

**What goes wrong:**
The home page loads, but visiting `michellengo.net/watch/264677021` directly (refresh, shared link, OG crawler) returns GitHub's generic 404. Same for `/work/documentary`. Client-side navigation works; direct entry and refresh don't.

**Why it happens:**
GitHub Pages has no server to route unknown paths back to the app. With adapter-static, *every* route the user can deep-link to must either be **prerendered to its own `index.html`**, or you must provide a SPA `fallback` page that Pages serves for unknown paths. GitHub Pages specifically serves `404.html` for any unmatched path, so the SvelteKit fallback must be named `404.html` (not the usual `200.html`/`index.html` used on Netlify-style hosts).

**How to avoid:**
- **Prefer full prerender.** Since the 56-video dataset is static and known at build time, prerender *every* `/watch/[id]` and `/work/[category]`. Add `export const prerender = true;` and make the dynamic routes discoverable — see Pitfall 3.
- Set `adapter-static({ fallback: '404.html' })` as a safety net so any not-prerendered path still client-renders instead of hard-404ing.
- After build, manually open a deep link in the deploy preview and hard-refresh it. Don't trust in-app navigation as proof.

**Warning signs:**
"Works when I click through, 404 when I refresh." OG/social link previews showing a 404. Search Console reporting soft-404s on watch pages.

**Phase to address:**
**Phase 1** (fallback config + first prerendered route) and re-verified in the **phase that builds `/watch/[id]`** (watch-page phase).

---

### Pitfall 3: Dynamic routes silently skipped by the prerender crawler (`entries()` coverage gap)

**What goes wrong:**
You ship and most watch pages exist — but a handful (the ones not linked from any rail, e.g. a video only reachable via the PBS flagship page, or a brand-new one) are missing. The crawler only prerendered what it could *find by following links*.

**Why it happens:**
adapter-static prerenders by crawling links starting from `/`. A `[id]` route the crawler never sees a link to is never generated. If every video appears in at least one rail this may be masked — until a category gets filtered or a video is intentionally unlisted, and then it's a 404.

**How to avoid:**
- Don't rely on crawling. Explicitly enumerate all dynamic params via `entries()` exported from the `+page.server.ts`/`+page.ts` of `/watch/[id]` and `/work/[category]`, returning the full id/category list from the dataset. This guarantees 56 watch pages + 8 category pages regardless of linking.
- Alternatively/additionally set `kit.prerender.entries` in `svelte.config.js`. Belt and suspenders.
- Set `kit.prerender.handleHttpError` / `handleMissingId` to `'fail'` (not `'warn'`) so the build *errors* on a broken link instead of quietly shipping a hole.
- Assert build output count: a CI check that counts generated `watch/*/index.html` and fails if it isn't 56.

**Warning signs:**
Build log lines like "X pages prerendered" where X is lower than expected; a video that plays from its rail card but 404s when its URL is opened cold.

**Phase to address:**
**Watch-page phase** and **category-browse phase** (whichever introduces each dynamic route). Add the CI count check in the **deploy/CI phase**.

---

### Pitfall 4: Mounting every video iframe on the rails home — LCP and main-thread death

**What goes wrong:**
The YouTube-style home has, say, 8 rails × ~7 cards = dozens of cards. If each card mounts a real Vimeo/YouTube `<iframe>`, the page pulls megabytes of third-party JS/CSS, opens dozens of connections, and mobile LCP/INP collapse. The page "works" on the dev machine and is unusable on a mid-range phone over 4G.

**Why it happens:**
A naive card renders the embed iframe directly. Each YouTube/Vimeo iframe is ~hundreds of KB of player payload; removing embeds has been measured to cut page load ~5× on multi-embed pages. Even with native `loading="lazy"`, dozens of in-viewport-ish iframes still hammer the network.

**How to avoid:**
- **Facade pattern, always.** Rail cards render a *poster image + play button*, never a live iframe. The real iframe is created only on click (or on watch-page navigation). Use `lite-youtube`/`lite-vimeo` style custom elements or a hand-rolled facade — the dataset already has posters in `static/posters/`.
- Cap concurrently-mounted real iframes (PROJECT explicitly requires this). On the watch page, only the primary video is a live iframe; the "more in this category" rail uses facades.
- Use the poster image as the card; preconnect to the embed origin only on hover/focus (warm the connection without loading the player).
- Beware the inverse trap: don't `loading="lazy"` the **hero/LCP poster** itself — Chrome found lazy-loading in-viewport content can hurt LCP ~20%. The hero poster should be eager + `fetchpriority="high"`.

**Warning signs:**
Lighthouse mobile "Reduce the impact of third-party code" with huge YouTube/Vimeo numbers; dozens of `player`/`embed` requests on initial home load; INP > 200ms when scrolling rails; fans on the laptop spinning on the home page.

**Phase to address:**
**Rail/card component phase** (facade as a hard requirement of the card component) and **watch-page phase** (single live iframe + facade rail). Budget verified in the **performance/a11y hardening phase**.

---

### Pitfall 5: Horizontal rail is not keyboard-operable / screen-reader hostile

**What goes wrong:**
A keyboard user tabs through the home page and either (a) can't scroll the rail at all to reach cards 4–7 that are off-screen, or (b) Tab lands on off-screen cards that scroll the rail unexpectedly and lose the user, or (c) a screen reader user has no idea they entered a horizontally scrolling region or how many items it has. scroll-snap can also fight assistive tech focus, yanking the viewport when AT moves focus.

**Why it happens:**
A bare `overflow-x: auto` div is scrollable by mouse/trackpad but **not guaranteed reachable by keyboard** — Chrome 130+ and Firefox auto-make scroll containers focusable, but **Safari requires `tabindex="0"`** on the scroll container, and even where focusable, arrow-key scrolling alone is poor UX. Off-screen cards remain in the DOM and tabbable, so focus order silently walks off the visible area. scroll-snap mandatory can also "fight" programmatic focus.

**How to avoid:**
- Mark up each rail as a list (`<ul><li>`) inside a labelled region: `role="region"` (or a `<section>`) with `aria-label="PBS American Portrait"` so AT announces the rail and its name.
- Add `tabindex="0"` to the scroll container so Safari users can focus and arrow-scroll it; this is the axe `scrollable-region-focusable` fix.
- Provide explicit **Prev/Next buttons** (≥44×44px) as the primary keyboard affordance rather than relying on arrow-key scroll; wire them to `scrollBy`/`scrollIntoView`. Hide them from AT if redundant, but keep them operable.
- Ensure focusing a card with the keyboard scrolls it into view (`scroll-margin` + letting the browser bring focused element into view) — and that focusing does **not** trigger janky snap fights (use `scroll-snap-type: x proximity` over `mandatory` if it interferes, or `scroll-snap-stop`).
- Don't visually hide off-screen cards with `display:none` toggling on scroll (breaks Tab); instead let them stay in DOM and rely on the focus-into-view behavior, OR if you must limit, use `inert` on truly-hidden groups.

**Warning signs:**
Tab key skips past most cards or scrolls the page weirdly; VoiceOver/NVDA never says "list, 7 items" or the region name; arrowing through cards causes the viewport to jump; Safari keyboard users literally can't move the rail.

**Phase to address:**
**Rail/card component phase** — keyboard + ARIA is a definition-of-done criterion for the rail component, not a later polish task.

---

### Pitfall 6: Mobile momentum scroll + vertical-page scroll-hijack on rails

**What goes wrong:**
On touch, dragging a rail horizontally accidentally scrolls the whole page vertically (or vice-versa), the rail over-scrolls into the next section, or pull-to-refresh fires mid-swipe. On desktop trackpads, horizontal-wheel handling feels broken.

**Why it happens:**
Default touch-action lets the browser interpret a diagonal swipe ambiguously; `overscroll-behavior` isn't set, so a rail's scroll "chains" to the page. Custom JS wheel handlers often fight native momentum.

**How to avoid:**
- `overscroll-behavior-x: contain` on the rail so over-scrolling doesn't chain to the page/history.
- Prefer **native CSS scroll-snap + native scrolling** over JS-driven scroll. Avoid hijacking the wheel/touch with `preventDefault`.
- Test on a real iPhone and Android, not just DevTools device emulation — momentum and rubber-banding don't emulate faithfully.

**Warning signs:**
Page jumps vertically when you try to swipe a rail; back/forward navigation triggers from over-scroll; rail feels "sticky" or laggy vs. native scroll on device.

**Phase to address:**
**Rail/card component phase**, verified on real devices in the **performance/a11y hardening phase**.

---

### Pitfall 7: `prefers-reduced-motion` ignored — the "tasteful 3D/parallax" becomes an accessibility/nausea hazard

**What goes wrong:**
The premium parallax hero, 3D card tilt, and scroll-driven motion run for *everyone*, including users with vestibular disorders who set "reduce motion." This is a WCAG 2.3.3 / 2.2.2 concern and is exactly the kind of thing that makes a beautiful portfolio feel hostile.

**Why it happens:**
Motion is added during the "make it premium" pass and the reduced-motion gate is forgotten, or only applied to *some* animations (CSS transitions guarded but JS-driven scroll parallax not).

**How to avoid:**
- Gate **all** non-essential motion behind `@media (prefers-reduced-motion: reduce)` (CSS) and, for JS-driven effects, check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` before attaching scroll/parallax handlers. PROJECT already mandates "motion-safe gated" — enforce it as a single shared `motionSafe` store/util so nothing is missed.
- Reduced-motion path should still show the hero poster/reel as a static frame and disable parallax/tilt, not break layout.
- Provide instant (non-animated) alternatives for rail Prev/Next (`scroll-behavior: auto` under reduced motion instead of `smooth`).

**Warning signs:**
Enabling "Reduce motion" in OS settings changes nothing on the site; parallax still moves; auto-playing/looping hero motion with no static fallback.

**Phase to address:**
**Hero + motion phase** (gate at the source) and audited again in **a11y hardening phase**. Build the `motionSafe` util in **Phase 1** so every later component uses it.

---

### Pitfall 8: Parallax / transform-heavy scroll handlers cause jank and CLS

**What goes wrong:**
The parallax hero and depth effects stutter while scrolling on mobile; Lighthouse flags CLS because the hero/poster shifts as it loads or as transforms apply; INP spikes from heavy `scroll` listeners doing layout reads/writes every frame.

**Why it happens:**
Animating `top`/`left`/`margin` (layout-triggering) instead of `transform`/`opacity` (compositor-only); running un-throttled `scroll` handlers that read `getBoundingClientRect` (forced reflow) then write styles; reserving no space for the hero media so it shifts when loaded.

**How to avoid:**
- Animate only `transform` and `opacity`. Promote with `will-change: transform` sparingly (overuse blows up memory on mobile).
- Drive parallax with the **`scroll`-linked CSS** approach or `IntersectionObserver`/`requestAnimationFrame`, never synchronous work in a raw `scroll` listener. Prefer CSS scroll-driven animations where supported, with a JS/RAF fallback that batches reads then writes.
- Reserve hero dimensions (fixed aspect-ratio box) so the poster/iframe doesn't cause CLS; set `width`/`height`/`aspect-ratio` on every poster `<img>`.
- Keep heavy 3D off the critical path — don't ship a WebGL/Three.js bundle for the hero unless it's truly needed; CSS 3D transforms (perspective/tilt) get most of the "depth" feel at a fraction of the cost. A full 3D engine on a content portfolio is usually over-engineering (see Tech Debt table).

**Warning signs:**
Lighthouse CLS > 0.1, mostly attributed to the hero; "Avoid large layout shifts"; visible stutter when scrolling the home on a phone; DevTools Performance showing long `scroll` tasks / forced reflow warnings.

**Phase to address:**
**Hero + motion phase**, with a CLS/INP budget checked in **performance hardening phase**.

---

### Pitfall 9: Layout shift from poster/thumbnail loading (CLS across all rails)

**What goes wrong:**
As rail posters lazy-load, cards resize and the rails reflow, bumping content around — death by a thousand small shifts across 8 rails.

**Why it happens:**
`<img>` without intrinsic dimensions; cards sized by image instead of by a fixed aspect-ratio container.

**How to avoid:**
- Every poster gets explicit `width`/`height` (or a CSS `aspect-ratio` wrapper, e.g. 16:9) so space is reserved before load.
- Use a low-cost blurred/solid placeholder (dark, matching theme) so empty cards aren't white flashes on the dark theme.
- `loading="lazy"` + `decoding="async"` for off-screen rail posters; eager only for the first rail / hero.

**Warning signs:**
CLS spread across many small shifts (not one big one); white flashes in cards on a slow connection; rails "settling" after load.

**Phase to address:**
**Rail/card component phase**.

---

### Pitfall 10: Dark-theme contrast failures — text over thumbnails and invisible focus rings on black

**What goes wrong:**
Card titles/overlay text placed over bright video thumbnails become unreadable (white-on-bright-frame). The OKLCH per-category accent looks great but fails AA on a near-black background for body text. And the keyboard focus ring — often a default thin blue — is nearly invisible on `#000`, so keyboard users can't see where they are (the very users Pitfall 5 was trying to serve).

**Why it happens:**
Dark-only design tempts low-contrast "moody" grays; text-over-image contrast is unpredictable because the thumbnail content varies per video; focus styles are an afterthought and the browser default doesn't pop on black.

**How to avoid:**
- Text over thumbnails always sits on a scrim: a gradient/overlay (`rgba(0,0,0,.4–.7)`) behind text, or place titles *below* the thumbnail on a solid dark surface rather than over the image. Verify the worst-case (brightest) thumbnail still yields ≥4.5:1 for body, ≥3:1 for large text.
- Don't use the saturated category accent for small body text on near-black — reserve accents for borders/labels/large headings; check each of the 8 OKLCH accents against the background for AA.
- Design a **deliberate, high-contrast focus ring**: a thick (2–3px) light/white outline with offset, or a double ring (dark + light) that works over any thumbnail. Use `:focus-visible`, never remove outlines without a replacement.
- Run an automated contrast pass (axe) on the rendered dark theme, plus manual eyes on text-over-image cards.

**Warning signs:**
axe "color-contrast" violations; you can't tell where keyboard focus is on the home page; squinting to read card titles over a bright frame; accents that look neon but fail the contrast checker.

**Phase to address:**
**Design-system phase** (tokens: scrim, focus ring, validate the 8 accents) and enforced in **rail/card** + **a11y hardening** phases.

---

### Pitfall 11: SEO/Open Graph for video content is generic or missing (kills shareability)

**What goes wrong:**
Sharing a `/watch/[id]` link on social/messaging shows no thumbnail, the repo name, or a 404 (ties to Pitfall 2). Search engines don't understand the videos. For a *filmmaker's portfolio*, a broken share preview is a direct credibility hit.

**Why it happens:**
Static prerender means per-page `<head>` must be set at build time per route (via `<svelte:head>`), and it's easy to ship one global OG image and call it done. Video-specific tags (`og:video`, `VideoObject` JSON-LD, poster as `og:image`) get skipped. Absolute URLs in OG tags also collide with the base-path issue (OG needs *fully-qualified* `https://michellengo.net/...` URLs, not base-relative).

**How to avoid:**
- Per-watch-page `<svelte:head>`: unique `<title>`, `og:title`, `og:description`, `og:image` (the video poster, absolute URL), `og:type=video.other`, `og:video`/`twitter:player` where the embed allows, and `VideoObject` JSON-LD (name, thumbnailUrl, embedUrl, uploadDate, duration).
- OG/canonical URLs must be **absolute and production-host** (`https://michellengo.net/...`) — compute from a `PUBLIC_SITE_URL`, not from `base`. Staging can keep its own.
- PROJECT already calls for `Person` JSON-LD (About) and broadcast credits (Press) — add `VideoObject` per watch page and verify with a sharing debugger / Rich Results test.
- Generate `sitemap.xml` at build from the dataset; add `robots.txt`. Easy to forget on a hand-rolled static site.

**Warning signs:**
Pasting a watch link into Slack/iMessage shows no rich preview or the wrong image; Rich Results Test finds no VideoObject; OG image URL is `/posters/...` (relative) and thus broken for crawlers.

**Phase to address:**
**Watch-page phase** (per-page meta + VideoObject) and a **content/SEO polish phase** (sitemap, robots, About/Press JSON-LD).

---

### Pitfall 12: Apex `michellengo.net` cutover breaks (CNAME, trailing slashes, mixed base, HTTPS)

**What goes wrong:**
The github.io staging site is perfect, but the production cutover to `michellengo.net` 404s everything, loses the custom domain on the next deploy, or serves with broken styles because base is still `/michelle_ngo_five`. Or trailing-slash mismatches cause `/work` vs `/work/` to behave differently and break links.

**Why it happens:**
- The `CNAME` file in the published output gets *overwritten/removed* by the deploy action (GitHub Pages stores the custom domain via that file or the repo setting; a fresh `gh-pages` push without it drops the domain).
- The apex build must use `base: ''`, but the env var wiring (Pitfall 1) is only set for staging.
- adapter-static defaults to `trailingSlash` behavior that may or may not match how you wrote links; inconsistent trailing slashes cause subtle 404s on Pages (which is picky about `/foo` vs `/foo/`).
- DNS apex (`A`/`ALIAS`/`ANAME` records to GitHub's IPs) + "Enforce HTTPS" toggle not set → cert/redirect issues.

**How to avoid:**
- Production workflow writes `static/CNAME` (or injects `CNAME` into the build output) containing `michellengo.net` so every deploy preserves the domain. Verify it survives a redeploy.
- Distinct env (`BASE_PATH=''`, `PUBLIC_SITE_URL=https://michellengo.net`) for the production workflow vs staging.
- Set `kit.prerender` + adapter to emit directory-style `index.html` per route (matches Pages' trailing-slash serving); pick one `trailingSlash` policy and use `base`-aware links everywhere so it's consistent.
- Configure DNS apex records per GitHub's documented IPs, enable "Enforce HTTPS," and test the cold apex URL + a deep link after cutover.

**Warning signs:**
Custom domain field empties in repo Settings → Pages after a deploy; apex serves unstyled (still base-prefixed) assets; `http://` not redirecting to `https://`; `/work` 404s but `/work/` works (or vice-versa).

**Phase to address:**
**Deploy/CI phase** (both workflows) — do a *dry-run* apex cutover on a throwaway domain or at least validate the CNAME-preservation + `base:''` build before the real DNS switch.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Render real iframes in rail cards (skip facade) | Cards "just work," less code | Catastrophic mobile LCP/INP; violates iframe-budget constraint | **Never** for the rails home — facade is non-negotiable |
| Hardcode `/michelle_ngo_five/...` paths to "make staging work" | Fixes staging fast | Breaks apex cutover; double-prefix bugs | Never — use `base`-aware paths from day 1 |
| Rely on link-crawl prerender (no `entries()`) | Less config | Unlinked/unlisted videos silently 404 | Acceptable *only* if a CI count-check proves all 56 pages exist |
| Full WebGL/Three.js 3D hero for "premium feel" | Maximum wow | Heavy bundle, mobile jank, a11y/CLS risk, maintenance | Rarely — prefer CSS 3D/perspective; reserve WebGL for a single deliberate, reduced-motion-gated showpiece |
| Single global OG image | Ships fast | Every shared video looks identical/wrong; weak SEO for a *filmmaker* | MVP-only, must be replaced before "done" |
| One mega `videos.json` imported everywhere | Simple | Fine at 56 items; revisit only if dataset 10×s | Acceptable at this scale — don't over-engineer a CMS |
| Skip Prev/Next buttons (scroll-only rails) | Cleaner look | Keyboard/Safari users can't operate rails | Never — buttons are the keyboard affordance |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Vimeo embed (`264677021` reel + others) | Mount live `<iframe>` per card; assume Vimeo handles lazy | Facade (poster + play); load Vimeo player only on click; preconnect on hover |
| YouTube embeds | Use full `youtube.com/embed` iframe everywhere | Use `youtube-nocookie.com` + `lite-youtube` facade; load on click |
| GitHub Pages + Jekyll | Forget `.nojekyll`; `_app/` assets stripped | Emit `.nojekyll` in output root every build |
| GitHub Pages custom domain | Deploy action wipes `CNAME` | Persist `CNAME` in `static/` so it's republished each deploy |
| Open Graph crawlers | Base-relative `og:image`/`og:url` | Absolute production URLs from `PUBLIC_SITE_URL` |
| Vimeo/YouTube poster vs local poster | Hotlink third-party thumbnails (rate-limited, CLS) | Use local `static/posters/*` with explicit dimensions |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Many live iframes on home | INP spikes, 5× slower load, fan spin | Facade pattern, cap live iframes | Immediately, on any phone, at ~dozen cards |
| Lazy-loading the hero/LCP poster | Worse LCP (~20% per Chrome) | Hero poster eager + `fetchpriority="high"` | First paint on every visit |
| Un-throttled scroll parallax | Scroll jank, long tasks, INP | `transform`/`opacity` only, RAF/IO or CSS scroll-driven | On mid/low-end mobile while scrolling |
| Posters without dimensions | CLS spread across rails | `aspect-ratio`/`width`+`height` + placeholder | On slow connections, every load |
| `will-change` on many cards | Mobile memory blowup, crashes | Use sparingly, only on actively-animating elements | On long pages with many promoted layers |
| Shipping a 3D engine bundle | Large JS, slow TTI on mobile | CSS 3D first; WebGL only if essential | On 4G / low-end Android |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing the personal email/phone as plain text harvestable by bots | Spam to `mynogo@gmail.com` / phone | Obfuscate or use a mailto with light protection; it's a tradeoff vs. accessibility — keep it reachable but consider a contact form-less mailto |
| Third-party iframes without `referrerpolicy`/sandbox consideration | Minor info leakage to embed origins | Use `youtube-nocookie.com`; set sensible `referrerpolicy`; only load on interaction |
| Embedding arbitrary user-supplied embed URLs | N/A here (curated dataset) but XSS if it grew | Keep embed IDs validated by Zod at build (already planned) — never interpolate raw HTML |
| Missing CSP on a static host | Lower risk (no backend) but defense-in-depth | Add a `Content-Security-Policy` via `<meta>` allowing only self + youtube/vimeo/img origins |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Rails with no scroll affordance | Users don't realize more cards exist off-screen | Show a peeking partial card + Prev/Next arrows + edge fade |
| Autoplaying hero reel with sound | Hostile, especially mobile | Muted/poster by default; PLAY REEL is explicit user action |
| No "where am I" in deep rails | Disorientation scrolling 8 rails | Clear rail headings, sticky section context, "View all" link per category |
| Click target only on the tiny play icon | Frustrating on touch | Whole card is the click target; ≥44px touch targets |
| Dark theme with pure-black + low-contrast gray | Eye strain, unreadable | Use near-black surfaces (e.g. `oklch` dark grays) with sufficient text contrast, scrims over thumbnails |
| Endless rails, no way to browse fully | Users who want *all* of a category get stuck scrolling | Each rail links to `/work/[category]` grid (already planned — wire it) |

## "Looks Done But Isn't" Checklist

- [ ] **Base paths:** Works on github.io subpath AND apex `base:''` — verify both, not just localhost
- [ ] **Deep links:** `/watch/[id]` and `/work/[category]` survive a **cold hard-refresh** on Pages (404.html fallback present)
- [ ] **Prerender coverage:** Exactly 56 `watch/*/index.html` + 8 category pages generated (CI count check), including any unlisted video
- [ ] **`.nojekyll`:** Present in deploy output; `_app/` assets actually load
- [ ] **CNAME:** Survives a *second* production deploy without re-typing the domain in settings
- [ ] **Facades:** Home page mounts **zero** live video iframes until a card is clicked
- [ ] **Keyboard rails:** Can reach and operate every rail with Tab + Prev/Next in **Safari** (tabindex on scroll container)
- [ ] **Screen reader:** Each rail announces its name and item count; off-screen cards don't strand focus
- [ ] **Reduced motion:** OS "Reduce motion" actually disables parallax/tilt and stops hero motion
- [ ] **Focus ring:** Visible on pure-black and over bright thumbnails (not the default thin blue)
- [ ] **Contrast:** Worst-case (brightest) thumbnail still meets AA for overlaid text; all 8 accents pass on dark bg
- [ ] **CLS:** Hero + all rail posters have reserved dimensions; CLS < 0.1 on mobile
- [ ] **LCP:** Hero poster eager + `fetchpriority=high`, not lazy
- [ ] **OG/SEO:** Each watch page has unique title + VideoObject JSON-LD + absolute `og:image`; share preview renders
- [ ] **Sitemap/robots:** Generated from dataset and present in output

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Base-path hardcoded everywhere | MEDIUM | Grep for `"/` literals; replace with `base`-prefixed; wire `BASE_PATH` env; redeploy both targets |
| Deep links 404 on Pages | LOW | Add `fallback: '404.html'`; add `entries()`; rebuild |
| Live iframes shipped on home | MEDIUM | Swap card to facade component (localized to one component); re-measure |
| Rails not keyboard-operable | LOW–MEDIUM | Add `tabindex=0`, region label, Prev/Next handlers to the rail component (single component) |
| Parallax jank/CLS | MEDIUM | Switch to transform/opacity, gate behind reduced-motion, reserve hero dimensions |
| CNAME lost on deploy | LOW | Re-add domain in settings + persist `static/CNAME`; wait for cert |
| Missing prerendered video page | LOW | Add to `entries()`/dataset; rebuild; CI count-check catches future ones |
| OG previews broken | LOW | Add absolute-URL meta + VideoObject per watch page; re-scrape with sharing debugger |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| 1. Base-path breakage | Phase 1 (scaffold + deploy) | Trivial page renders styled on github.io subpath |
| 2. SPA route 404 / fallback | Phase 1 + watch-page phase | Cold hard-refresh of a deep link returns the app, not 404 |
| 3. Prerender entries() gap | Watch-page + category phases | CI counts 56 watch + 8 category HTML files |
| 4. Too many iframes / LCP | Rail/card + watch phases | Home loads 0 live iframes; Lighthouse mobile LCP within budget |
| 5. Rail keyboard/SR a11y | Rail/card phase | Tab + Prev/Next operate rails in Safari; SR announces region + count |
| 6. Mobile momentum/overscroll | Rail/card phase | Real-device swipe doesn't hijack page scroll |
| 7. prefers-reduced-motion | Phase 1 util + hero/motion phase | OS reduce-motion disables all non-essential motion |
| 8. Parallax jank / CLS | Hero/motion phase | CLS < 0.1, no long scroll tasks in Perf panel |
| 9. Poster CLS | Rail/card phase | All posters have reserved dimensions; no card resize on load |
| 10. Dark contrast / focus ring | Design-system + a11y phases | axe color-contrast clean; focus visible on black + thumbnails |
| 11. SEO/OG for video | Watch-page + SEO polish phase | Rich Results finds VideoObject; share preview renders |
| 12. Apex CNAME cutover | Deploy/CI phase | `base:''` build + persisted CNAME + HTTPS verified on apex |

## Sources

- [Static site generation • SvelteKit Docs (adapter-static, fallback, prerender)](https://svelte.dev/docs/kit/adapter-static) — HIGH
- [Setting paths.base causes adapter-static 404 · sveltejs/kit #4528](https://github.com/sveltejs/kit/issues/4528) — MEDIUM
- [Dynamic routing with adapter-static/prerender/ssr · sveltejs/kit Discussion #11977](https://github.com/sveltejs/kit/discussions/11977) — MEDIUM
- [Dynamic Routes on GitHub Pages using SvelteKit and 404 Trickery — Obfuscated Memories](https://irshadpi.me/deploying-sveltekit-dynamic-routes-github-pages) — MEDIUM
- [The missing guide to understanding adapter-static — Stanislav Khromov](https://khromov.se/the-missing-guide-to-understanding-adapter-static-in-sveltekit/) — MEDIUM
- [axe: Ensure scrollable region has keyboard access (scrollable-region-focusable)](https://dequeuniversity.com/rules/axe/4.0/scrollable-region-focusable) — HIGH
- [ACT Rule: Scrollable element is keyboard accessible (0ssw9k)](https://www.w3.org/WAI/standards-guidelines/act/rules/0ssw9k/) — HIGH
- [TPGi: Short note on improving usability of scrollable regions](https://www.tpgi.com/short-note-on-improving-usability-of-scrollable-regions/) — HIGH
- [Safari keyboard focus for scrollable containers — Apple Developer Forums](https://developer.apple.com/forums/thread/810694) — MEDIUM
- [Make accessible carousels — Chrome for Developers](https://developer.chrome.com/blog/accessible-carousel) — HIGH
- [Building Accessible Carousels — Smashing Magazine](https://www.smashingmagazine.com/2023/02/guide-building-accessible-carousels/) — MEDIUM
- [Consider accessibility for horizontally scrollable regions — Bogdan Cerovac](https://cerovac.com/a11y/2024/02/consider-accessibility-when-using-horizontally-scrollable-regions-in-webpages-and-apps/) — MEDIUM
- [Lazy load images and iframe elements — web.dev](https://web.dev/learn/performance/lazy-load-images-and-iframe-elements) — HIGH
- [Performance-Optimized Video Embeds with Zero JavaScript — Frontend Masters](https://frontendmasters.com/blog/performance-optimized-video-embeds-with-zero-javascript/) — MEDIUM
- [Why YouTube Embeds Hurt Your Website — Swarmify](https://swarmify.com/blog/why-youtube-embeds-hurt-your-website/) — LOW (vendor, but measurements align)
- Sibling repos michelle_ngo_two/three/four (proven baseline, content/data, references) — HIGH (direct project context)

---
*Pitfalls research for: static SvelteKit video portfolio on GitHub Pages (rails + iframes + motion + dark)*
*Researched: 2026-06-14*
