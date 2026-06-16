# Deferred Items — Phase 04 (hardening-apex-cutover-launch)

Out-of-scope discoveries logged during execution. NOT fixed in the plan that found them
(SCOPE BOUNDARY: only auto-fix issues directly caused by the current task's changes).

## From Plan 04-01 (quality-gates)

- **Pre-existing ESLint error in `src/lib/state/motion.svelte.test.ts:1`** —
  `'beforeEach' is defined but never used (@typescript-eslint/no-unused-vars)`.
  Introduced in Phase 01-03 (commit 5282829); untouched by Plan 04-01. `pnpm lint`
  fails solely on this line. Fix: drop `beforeEach` from the vitest import in that
  test file. Deferred because it is unrelated to the quality-gates work and lives in
  a file this plan never modified.
