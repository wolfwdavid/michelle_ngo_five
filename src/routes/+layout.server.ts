import { env } from '$env/dynamic/private';

/**
 * The single source of truth for the staging-vs-apex indexing gate (SEO-04).
 *
 * Runs ONLY at prerender (Node) — this site is fully static — so `process.env`
 * is the build-time signal that already differentiates the two deploy workflows:
 *   - staging deploy.yml             builds with BASE_PATH=/michelle_ngo_five
 *   - production deploy-production.yml builds with BASE_PATH=''
 *
 * Surfacing it here (rather than reading `base` from $app/paths in the layout)
 * is deliberate: adapter-static's relative paths make `base` resolve to '.' in
 * BOTH builds, so it cannot distinguish them. `$env/dynamic/private` reads the
 * raw BASE_PATH and gracefully yields '' when unset (the apex case).
 *
 * isStaging === true  -> emit <meta name="robots" content="noindex, nofollow">
 * isStaging === false -> apex: NO noindex meta (search-indexable).
 */
export const load = () => {
  const basePath = env.BASE_PATH ?? '';
  return { isStaging: basePath !== '' };
};
