import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

// Phase-1 subset: tailwind + sveltekit only. The build-time data-validation
// plugin and the vitest `projects` block land in Plan 02 (they import schema.ts,
// which does not exist yet).
export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
});
