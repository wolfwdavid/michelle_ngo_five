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
    prerender: {
      // The sitewide chrome (TopNav + Footer, Plan 02-01) links to routes that
      // are built later in THIS SAME phase by Wave-2 plans:
      //   /work, /work/[category]  -> Plan 02-03 (browse)
      //   /pbs-american-portrait/  -> Plan 02-03 (PBS flagship)
      //   /about, /press, /contact -> Plan 02-04 (static pages)
      // With `strict: true` the crawler follows those links and 404s the build
      // until they exist. This handler scopes the suppression to EXACTLY those
      // not-yet-built routes — any OTHER broken internal link still fails the
      // build. Remove these patterns as each Wave-2 plan lands its routes; the
      // whole `prerender` block is deleted once 02-04 ships (no routes remain
      // unbuilt and `strict` reverts to fully fatal).
      handleHttpError: ({ status, path, message }) => {
        const pending = [
          /\/work\/?$/,
          /\/work\/[^/]+\/?$/,
          /\/pbs-american-portrait\/?$/,
          /\/about\/?$/,
          /\/press\/?$/,
          /\/contact\/?$/,
        ];
        if (status === 404 && pending.some((re) => re.test(path))) {
          return; // tolerated: route ships later this phase
        }
        throw new Error(message);
      },
    },
  },
};

export default config;
