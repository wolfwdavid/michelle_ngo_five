/// <reference types="vitest/config" />
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type Plugin } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { z } from 'zod';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { VideoArraySchema } from './src/lib/data/schema';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * DATA-03: Fail `pnpm build` (and `pnpm dev` server start) on a schema violation
 * in src/lib/data/videos.json. Runs in `buildStart`, the canonical Rollup-compatible
 * lifecycle hook for fail-fast pre-bundle validation.
 *
 * Why a Vite plugin (not +layout.ts load throwing during prerender):
 *   - Plugin runs BEFORE any module evaluation → faster failure, cleaner stack.
 *   - this.error() prints directly to the terminal (no SvelteKit prerender wrapper).
 *   - Single non-zero exit code is guaranteed by the Rollup contract.
 *
 * Why z.prettifyError (not z.formatError):
 *   - Zod 4 deprecated z.formatError; prettifyError gives "✖ ... · at [3].category"
 *     output that points at the bad row by index — exactly what DATA-03's
 *     "readable error pointing at the bad row" criterion requires.
 *
 * Why we ALSO check (source, id) uniqueness here:
 *   - Cross-row constraint can't live in a per-record Zod schema. The schema in
 *     videos.json.test.ts asserts the same thing in vitest, but the plugin
 *     enforces it at build time too (defense in depth).
 */
function validateVideosPlugin(): Plugin {
  return {
    name: 'validate-videos',
    buildStart() {
      const path = resolve(__dirname, 'src/lib/data/videos.json');
      let raw: unknown;
      try {
        raw = JSON.parse(readFileSync(path, 'utf-8'));
      } catch (e) {
        this.error(`videos.json is not valid JSON: ${(e as Error).message}`);
        return; // unreachable — this.error throws
      }

      const result = VideoArraySchema.safeParse(raw);
      if (!result.success) {
        const pretty = z.prettifyError(result.error);
        this.error(`videos.json failed schema validation:\n${pretty}`);
        return; // unreachable
      }

      // Cross-row constraint: (source, id) must be unique across all records.
      const seen = new Set<string>();
      for (const v of result.data) {
        const key = `${v.source}:${v.id}`;
        if (seen.has(key)) {
          this.error(`videos.json: duplicate (source, id) pair: ${key}`);
          return; // unreachable
        }
        seen.add(key);
      }
    },
  };
}

export default defineConfig({
  // Plugin order matters: tailwindcss before sveltekit (Phase 1 Pattern 1);
  // validateVideosPlugin can sit anywhere before sveltekit but we put it
  // immediately before sveltekit() so the validation failure aborts the
  // build BEFORE Svelte starts compiling routes that import the data.
  plugins: [tailwindcss(), validateVideosPlugin(), sveltekit()],
  test: {
    // Vitest 4 deprecated `vitest.workspace.ts` in favor of inline projects.
    // This block replaces the standalone workspace file — same two-project
    // split (data=node, ui=jsdom) so Phase 2 fast data-layer tests don't
    // pay the jsdom bootstrap cost and component/route tests still get a DOM.
    //
    // Each project re-declares the plugin set so SvelteKit Vite plugins
    // (tailwindcss, validateVideosPlugin, sveltekit) load in BOTH projects
    // — required for $lib/* alias resolution and Svelte component compilation.
    projects: [
      {
        plugins: [tailwindcss(), validateVideosPlugin(), sveltekit()],
        test: {
          name: 'data',
          include: ['src/lib/data/**/*.{test,spec}.{js,ts}'],
          environment: 'node',
          globals: false,
        },
      },
      {
        plugins: [tailwindcss(), validateVideosPlugin(), sveltekit()],
        // `mount()` from 'svelte' resolves to svelte/src/index-server.js
        // unless we tell Vite to use browser conditions. Without this, every
        // ui test crashes with `lifecycle_function_unavailable: mount(...)
        // is not available on the server`.
        resolve: {
          conditions: ['browser'],
        },
        test: {
          name: 'ui',
          include: [
            'src/lib/components/**/*.{test,spec}.{js,ts}',
            'src/routes/**/*.{test,spec}.{js,ts}',
          ],
          environment: 'jsdom',
          globals: false,
          setupFiles: ['./vitest-setup-ui.ts'],
        },
      },
    ],
    // Coverage config stays at the root (not per-project) — applies to whatever
    // files were touched during the run.
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/lib/data/**/*.ts'],
      exclude: ['src/lib/data/**/*.test.ts'],
    },
  },
});
