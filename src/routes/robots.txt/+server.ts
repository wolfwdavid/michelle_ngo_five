/**
 * Build-time-generated, environment-gated robots.txt (SEO-04).
 *
 * Replaces the former unconditional static/robots.txt (which a static file
 * CANNOT env-gate — it is copied verbatim). Prerendered like sitemap.xml
 * (build emits a flat build/robots.txt).
 *
 * Keyed off the SAME build-time BASE_PATH signal that drives the two deploy
 * workflows — no manual edit at cutover:
 *   - staging deploy.yml             builds with BASE_PATH=/michelle_ngo_five -> Disallow: /
 *   - production deploy-production.yml builds with BASE_PATH=''               -> Allow: /
 *
 * process.env.BASE_PATH is readable directly here (Node prerender context).
 */
export const prerender = true;

const SITE = 'https://michellengo.net';

export function GET() {
  // Staging (BASE_PATH=/michelle_ngo_five) stays fully blocked; the apex
  // (BASE_PATH='') is crawlable.
  const isStaging = (process.env.BASE_PATH ?? '') !== '';
  const body = isStaging
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
