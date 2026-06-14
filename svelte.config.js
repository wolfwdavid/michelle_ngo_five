import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: '404.html',
      precompress: false,
      strict: true,
    }),
    paths: {
      base: process.env.BASE_PATH ?? '',
    },
    // Strict prerendering is fully fatal again: every chrome/internal link now
    // resolves to a real prerendered route. The scoped Wave-2 prerender error
    // tolerance was removed once Plan 02-04 shipped /about, /press, /contact —
    // the last not-yet-built destinations. Any broken internal link fails the
    // build.
  },
};

export default config;
