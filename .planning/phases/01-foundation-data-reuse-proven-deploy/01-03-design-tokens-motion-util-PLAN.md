---
phase: 01-foundation-data-reuse-proven-deploy
plan: 03
type: execute
wave: 3
depends_on: [01, 02]
files_modified:
  - src/app.css
  - src/lib/components/categoryAccent.ts
  - src/lib/components/categoryAccent.test.ts
  - src/lib/state/motion.svelte.ts
  - src/lib/state/motion.svelte.test.ts
autonomous: true
requirements: [DSGN-01, DSGN-02, DSGN-03, DSGN-04, FND-06]
must_haves:
  truths:
    - "The site renders on a near-black canvas site-wide (dark cinematic theme)"
    - "8 OKLCH per-category accent tokens exist and each is documented to pass AA on the near-black background"
    - "A thick high-contrast :focus-visible ring is defined and visible on black and over thumbnails"
    - "A single shared reduced-motion utility exists and is the one gate all later motion reads from"
    - "Typography, spacing, and a base focus/scrim convention are defined once for consistency across pages"
  # NOTE: DSGN-04 is PARTIALLY delivered in Phase 1 — only tokens/typography/spacing/focus-ring/scrim are delivered here.
  #       The chrome (top nav + footer + footer-mirrored nav) is delivered in Phase 2.
  #       Do NOT gate Phase 1 sign-off on nav/footer existing.
  artifacts:
    - path: "src/app.css"
      provides: "dark canvas + 8 --color-cat-* OKLCH accents + focus-visible ring + scrim tokens"
      contains: "--color-cat-pbs"
    - path: "src/lib/state/motion.svelte.ts"
      provides: "shared prefers-reduced-motion gate (the single source for motion-safe)"
      exports: ["prefersReducedMotion"]
    - path: "src/lib/components/categoryAccent.ts"
      provides: "verbatim Category → text-cat-* literal map (Tailwind-scanner-safe)"
      contains: "text-cat-pbs"
  key_links:
    - from: "src/lib/components/categoryAccent.ts"
      to: "src/app.css --color-cat-* tokens"
      via: "text-cat-* utilities generated from CSS vars"
      pattern: "text-cat-"
    - from: "src/routes/+layout.svelte"
      to: "src/app.css"
      via: "import '../app.css'"
      pattern: "app.css"
---

<objective>
Lock the dark cinematic design system — near-black canvas, the 8 OKLCH per-category accents (each AA-verified on dark), a deliberate thick focus-visible ring, and a scrim convention — and build the single shared reduced-motion utility that ALL later motion gates on.

Purpose: These tokens are the visual foundation every later component inherits (DSGN-01..04), and the motion utility (FND-06) MUST exist before any animated feature so Phase 3's hero/rail parallax can hang off one gate. v4 already has the 8 accent tokens and the categoryAccent map; the motion utility is genuinely NEW (v4 had no motion to gate).

Output: A complete `src/app.css` token system, the Tailwind-scanner-safe categoryAccent map, and `$lib/state/motion.svelte.ts` exposing the reduced-motion gate.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/research/PITFALLS.md
@.planning/research/STACK.md

# PORT SOURCE for tokens + accent map (NEW for motion util):
# C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_four/

<interfaces>
<!-- The 8 OKLCH accent tokens (port verbatim from sibling app.css @theme block).
     Lightness ~0.72-0.78 targets 4.7-5.6:1 against oklch(0.16 0 0) — AA on dark (DSGN-02). -->

@theme {
  --color-cat-pbs: oklch(0.72 0.21 25);     /* flagship, warmest */
  --color-cat-promos: oklch(0.78 0.18 60);
  --color-cat-branded: oklch(0.72 0.18 180);
  --color-cat-docshort: oklch(0.78 0.18 130);
  --color-cat-reel: oklch(0.78 0.18 280);
  --color-cat-personal: oklch(0.78 0.18 330);
  --color-cat-edunon: oklch(0.78 0.18 90);
  --color-cat-other: oklch(0.78 0.05 250);  /* quiet, near-gray */
}

categoryAccent.ts (port verbatim) maps each Category → literal 'text-cat-*' string
(Tailwind v4 only emits classes that appear LITERALLY in source — never compute the slug).

Motion utility (NEW — Svelte 5 runes module, $lib/state/motion.svelte.ts):
  export the reactive `prefersReducedMotion` gate, derived from
  window.matchMedia('(prefers-reduced-motion: reduce)'), SSR-safe (defaults to
  reduced=false / motion-allowed during prerender, updates on the client).
  This is the ONE gate every later motion (Phase 3 hero parallax, rail smooth-scroll) reads.
</interfaces>
</context>

<tasks>

<task type="tdd">
  <name>Task 1: Build the shared reduced-motion utility (FND-06, NEW)</name>
  <files>src/lib/state/motion.svelte.ts, src/lib/state/motion.svelte.test.ts</files>
  <read_first>
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_five/.planning/research/STACK.md
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_five/.planning/research/PITFALLS.md
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_four/src/routes/+layout.ts
  </read_first>
  <behavior>
    - During SSR/prerender (no window), the gate resolves to "motion allowed" (reduced=false) so the static markup is unaffected and no crash occurs.
    - On the client, the gate reflects window.matchMedia('(prefers-reduced-motion: reduce)').matches.
    - When the OS reduce-motion preference changes, the gate updates reactively (matchMedia change listener).
    - A consumer can read a single boolean (e.g. prefersReducedMotion.current === true) to decide whether to run an animation.
  </behavior>
  <action>
    Create `src/lib/state/motion.svelte.ts` — a Svelte 5 runes module (`.svelte.ts` so `$state`/`$effect` are allowed) exposing the single reduced-motion gate. Requirements:
      - SSR-safe: guard `typeof window === 'undefined'` (or check `browser` from `$app/environment`); default to reduced=false (motion allowed) so prerendered HTML is identical to the motion path.
      - On the client, initialize from `window.matchMedia('(prefers-reduced-motion: reduce)').matches` and subscribe to its `change` event to stay reactive.
      - Export a stable API the rest of the app reads — prefer a `prefersReducedMotion` object with a `.current` boolean getter (runes pattern), e.g. `export const prefersReducedMotion = createReducedMotion();`.
      - Keep it dependency-free (do NOT pull in `runed` for v1 — STACK lists it as optional; a hand-rolled matchMedia gate is sufficient and zero-bundle).
      - Add a JSDoc note that this is the SINGLE gate all motion (Phase 3 hero parallax, rail smooth-scroll, future hover-preview) must read — never a per-component matchMedia.

    Create `src/lib/state/motion.svelte.test.ts` covering the behaviors above (mock `window.matchMedia` in jsdom; assert default-allowed when matches=false, reduced when matches=true, and reactive update on a simulated change). This is a `ui` (jsdom) test — it runs under the vitest ui project from Plan 02.
  </action>
  <acceptance_criteria>
    - `test -f src/lib/state/motion.svelte.ts` (exit 0)
    - `grep -q "prefers-reduced-motion" src/lib/state/motion.svelte.ts` (exit 0)
    - `grep -qE "prefersReducedMotion" src/lib/state/motion.svelte.ts` (exit 0 — exported gate)
    - `grep -qE "browser|typeof window" src/lib/state/motion.svelte.ts` (exit 0 — SSR guard present)
    - `! grep -q "from 'runed'" src/lib/state/motion.svelte.ts` (exit 0 — zero-dep, no runed)
    - `pnpm exec vitest run src/lib/state/` exits 0 (motion util tests pass)
    - `pnpm check` exits 0 (svelte-check clean — the runes module type-checks)
  </acceptance_criteria>
  <verify>
    <automated>cd "C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_five" && test -f src/lib/state/motion.svelte.ts && grep -q "prefers-reduced-motion" src/lib/state/motion.svelte.ts && pnpm exec vitest run src/lib/state/ && echo OK</automated>
  </verify>
  <done>A single SSR-safe, zero-dependency reduced-motion gate exists at $lib/state/motion.svelte.ts, exported as prefersReducedMotion, reactive to OS changes, with passing jsdom tests — the one gate all later motion reads from.</done>
</task>

<task type="auto">
  <name>Task 2: Lock the dark token system + categoryAccent map (DSGN-01..04)</name>
  <files>src/app.css, src/lib/components/categoryAccent.ts, src/lib/components/categoryAccent.test.ts</files>
  <read_first>
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_four/src/app.css
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_four/src/lib/components/categoryAccent.ts
    - C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_five/src/app.css (the minimal placeholder from Plan 01 — REPLACE it)
  </read_first>
  <action>
    1. REPLACE `src/app.css` (the Plan-01 placeholder) with the full token system. Start from the sibling app.css (port the entire `@theme` block with all 8 `--color-cat-*` OKLCH tokens VERBATIM — they are AA-tuned for oklch(0.16 0 0)), then ADD the tokens the sibling leaned on Tailwind utilities for, so the dark system is explicit and consistent (DSGN-01, DSGN-03, DSGN-04):
       - `:root { color-scheme: dark; }`
       - A near-black canvas applied site-wide: `body { background: oklch(0.16 0 0); color: oklch(0.97 0 0); }` (DSGN-01)
       - A deliberate, thick, high-contrast `:focus-visible` ring that pops on pure black AND over bright thumbnails — e.g. a 3px light outline with offset (and optionally a dark companion shadow for over-image contrast). Use `:focus-visible`, never blanket-remove outlines. (DSGN-03)
       - A reusable scrim token/utility (e.g. a CSS custom prop for the gradient `rgba(0,0,0,.4)`→`.7`) that later text-over-thumbnail components apply (Pitfall 10). (DSGN-04 base convention)
       - Base typography/spacing defaults consistent across pages (font stack, sensible line-height) so chrome reads consistently. (DSGN-04)
       Document inline (comments) that each of the 8 accents is AA (>=4.5:1 body / >=3:1 large) on oklch(0.16 0 0) per the sibling's tuning notes. (DSGN-02)

    2. Copy `src/lib/components/categoryAccent.ts` VERBATIM from the sibling — the Category → literal 'text-cat-*' map. It depends on `import type { Category } from '$lib/data'` (available from Plan 02). Every text-cat-* string must appear LITERALLY (Tailwind v4 scanner requirement; Pitfall 1/Anti-Pattern 1).

    3. HAND-WRITE `src/lib/components/categoryAccent.test.ts` (~15 lines — this file does NOT exist in the sibling, so author it fresh; do NOT try to copy it). It is a `ui` (jsdom/node) vitest spec that imports CATEGORIES from `$lib/data` and the categoryAccent map from `./categoryAccent`, then asserts: for EVERY Category in the CATEGORIES array, `categoryAccent[category]` is a defined, non-empty string matching /^text-cat-/ (i.e. every category resolves to a real `text-cat-*` accent class — no undefined/empty mappings).

    4. Prove the accent utilities actually get generated by Tailwind (not silently dropped): build and grep the emitted CSS for the accent custom properties / classes.
  </action>
  <acceptance_criteria>
    - `grep -q "color-scheme: dark" src/app.css` (exit 0 — DSGN-01)
    - `grep -cE "^\\s*--color-cat-" src/app.css` returns 8 (exit 0 — all 8 OKLCH accents, DSGN-02)
    - `grep -q "focus-visible" src/app.css` (exit 0 — deliberate focus ring, DSGN-03)
    - `grep -qiE "scrim|rgba\\(0, ?0, ?0" src/app.css` (exit 0 — scrim convention, DSGN-04/Pitfall 10)
    - `grep -q "text-cat-pbs" src/lib/components/categoryAccent.ts && grep -c "text-cat-" src/lib/components/categoryAccent.ts | grep -qE "^[89]$|^1[0-9]$"` (exit 0 — all 8 literal accent strings present)
    - `pnpm build` exits 0 AND the emitted CSS in build/ contains the accent custom properties (e.g. `grep -rq -- "--color-cat-pbs" build/`) (exit 0 — tokens not dropped)
    - `pnpm exec vitest run src/lib/components/categoryAccent.test.ts` exits 0
  </acceptance_criteria>
  <verify>
    <automated>cd "C:/Users/Mkaru/Documents/Hello_World/hugginface_profile/Websites/michelle_ngo_websites/michelle_ngo_five" && grep -q "color-scheme: dark" src/app.css && [ "$(grep -cE '^[[:space:]]*--color-cat-' src/app.css)" = "8" ] && grep -q "focus-visible" src/app.css && pnpm build && grep -rq -- "--color-cat-pbs" build/ && echo OK</automated>
  </verify>
  <done>src/app.css defines the near-black canvas, all 8 AA-documented OKLCH accents, a thick focus-visible ring, a scrim convention, and base typography; categoryAccent.ts ported verbatim with all 8 literal text-cat-* strings; build emits the accent tokens (not dropped); tests pass.</done>
</task>

</tasks>

<verification>
- `src/app.css`: near-black canvas (DSGN-01), exactly 8 `--color-cat-*` OKLCH accents documented AA on dark (DSGN-02), thick `:focus-visible` ring (DSGN-03), scrim + base typography conventions (DSGN-04).
- `pnpm build` emits the accent tokens into build/ CSS (not silently dropped by the Tailwind scanner).
- `src/lib/state/motion.svelte.ts` exports a single SSR-safe reduced-motion gate `prefersReducedMotion`, reactive to OS changes, zero-dependency (FND-06).
- Motion util + categoryAccent tests pass; `pnpm check` clean.
</verification>

<success_criteria>
The dark cinematic token system is locked (near-black canvas, 8 AA OKLCH accents, thick focus ring, scrim convention, base type) and a single shared reduced-motion utility exists as the one gate all later motion reads from.
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-data-reuse-proven-deploy/01-03-SUMMARY.md`.
</output>
