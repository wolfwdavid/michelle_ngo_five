# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — Cinematic Rails Portfolio

**Shipped:** 2026-06-17
**Phases:** 4 | **Plans:** 12 | **Tasks:** 20
**Stats:** 62 commits · 142 files · ~19.9k insertions · ~5,218 src LOC · 4 days

### What Was Built
- A dark, cinematic, YouTube-style static portfolio (SvelteKit 2 / Svelte 5 / Tailwind v4 / adapter-static) for 56 films across 8 horizontal category rails, prerendered to GitHub Pages with no backend.
- The signature new layer: 8 accent-labeled CategoryRails led by a double-gated CSS-3D parallax ReelHero with a focus-trapped PLAY REEL lightbox — zero iframes on home, enforced at build time.
- Content-complete destinations: 56 facade watch pages (VideoObject JSON-LD), /work + 8 category grids, PBS flagship, about/press/contact, 70-URL sitemap + per-page canonicals.
- Launch-readiness gates: axe WCAG-AA (8 routes × 3 engines), mobile Lighthouse (LCP 2.05s / CLS 0 / perf 98), responsive 375–1440 + mobile nav, single-gate reduced-motion audit — plus a prerender-count CI guard and a verified base-'' apex build.

### What Worked
- **Port-then-extend.** ~90% of the architecture was a verbatim port of shipped sibling michelle_ngo_four; only the rails home + hero was net-new. This front-loaded confidence and kept risk concentrated in one phase (P3).
- **Single reduced-motion gate built first (P1).** Having one motion source before any animated feature meant the P4 reduced-motion audit had exactly one thing to verify — both ReelHero and CategoryRail read it, no scattered matchMedia.
- **Facade pattern as a build-enforced invariant.** `assert-home-no-iframe.mjs` chained into `pnpm build` turned "protect mobile LCP" from a guideline into a gate that can't silently regress.
- **Quality gates that fix-at-source.** The P4 axe/responsive run surfaced 9 real violations (contrast, nested-`<li>`, heading order, 768px nav overflow, WebKit Escape focus) and they were fixed in components, not suppressed.

### What Was Inefficient
- **Marked Phase 4 complete before its verifier ran**, so the milestone audit had to back-fill the missing `04-VERIFICATION.md`. Completing a phase should always produce its VERIFICATION.md, even when checkpoints are deferred.
- **A transient API 500 killed an executor mid-plan** (after it had committed both tasks). Recovery was clean because tasks were committed atomically — but the lost final docs commit had to be reconstructed by hand. Atomic per-task commits paid off.
- **ROADMAP Progress table drifted to "Not started" for every phase** the whole project — the GSD tooling never maintained it; had to be synced by hand at milestone close.
- **One-liner extraction for MILESTONES.md produced fragments** ("Task 1 —", "Rule 3 - Blocking") because some SUMMARY one-liners led with task headers; curated by hand.

### Patterns Established
- Build-time guards as launch gates: zero-iframe assertion + exact-equality prerender-count guard (56 watch / 8 category) wired into the build/CI, not left to review.
- Deferred-but-documented checkpoints: a human-only step (apex DNS) recorded as "deferred, not failed" with a ready runbook (CUTOVER.md) and an explicit resume signal, rather than blocking the whole phase.
- Tiered a11y gating: serious/critical → build-fail, moderate → fix-or-document, minor → advisory — instead of a blanket `toEqual([])`.

### Key Lessons
1. **A phase isn't done until its VERIFICATION.md exists** — even if a checkpoint is deferred, verify the automated must-haves and record the deferral as tech debt in the report.
2. **Atomic per-task commits are the cheapest insurance** against mid-run API failures; recovery cost was minutes, not a re-run.
3. **Environment-gate anything that differs between staging and production** (the unconditional `noindex`/`robots.txt` is a latent apex-launch bug) — catch it in the cutover runbook before the flip, not after.
4. **Front-load the single source of truth** (motion gate, data barrel, design tokens) so later phases verify one thing instead of auditing many.

### Cost Observations
- Model mix: orchestration + execution on Opus; verifier + integration-checker on Sonnet.
- Notable: the riskiest work (rails a11y + parallax mobile perf) was isolated to one phase and gated by automated tests, so launch hardening surfaced only fixable violations — no rework of architecture.

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Key Change |
|-----------|--------|-------|------------|
| v1.0 | 4 | 12 | Established the GSD phase/wave flow for this repo; build-enforced quality gates introduced |

### Cumulative Quality

| Milestone | E2E / Unit | Mobile LCP | Zero-Dep Additions |
|-----------|------------|------------|--------------------|
| v1.0 | 57 e2e (3 engines) + unit suite green | 2.05s | reduced-motion gate, scroll-snap rails, facades (no carousel/animation lib) |

### Top Lessons (Verified Across Milestones)

1. (v1.0) Build-time guards beat review-time checks for invariants that must never regress.
2. (v1.0) Atomic commits make agent failures cheap to recover from.
