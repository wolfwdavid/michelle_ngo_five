import { defineConfig, devices } from '@playwright/test';

// A non-default port chosen to avoid colliding with the sibling preview servers
// when several v* projects are open in adjacent terminals during local A/B work:
//   _four → Vite default 4173, _three → 4183. v5 uses 4187.
// CI always runs in a fresh container, so the choice is purely local-dev ergonomics.
const PORT = 4187;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html']] : 'list',
  use: {
    // E2E always runs against an UNPREFIXED build served at the server root so
    // page.goto('/work') resolves. The webServer command below deliberately
    // OMITS BASE_PATH; the GH Pages deploy job (separate workflow) sets BASE_PATH
    // for the actual uploaded artifact. Keeping e2e concerns isolated from
    // deploy-path concerns is what lets goto('/') find the home at root.
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // The apex cutover targets Safari, so webkit is a first-class engine here.
    // NOTE: Playwright's webkit is DESKTOP WebKit, not iOS Safari — real iPhone
    // momentum/keyboard QA stays a human-verify checkpoint (Task 3).
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: {
    // Build + preview the REAL adapter-static artifact (the same output GH
    // Actions uploads). This also runs scripts/assert-home-no-iframe.mjs via the
    // `build` script — fine, it just hardens the zero-iframe-home guarantee.
    //
    // CRITICAL: do NOT set BASE_PATH in this env. The build must serve at root so
    // page.goto('/work') / '/watch/264677021' resolve without a base prefix.
    command: `pnpm build && pnpm preview --port ${PORT}`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
