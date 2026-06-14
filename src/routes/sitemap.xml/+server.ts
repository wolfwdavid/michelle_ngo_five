/**
 * Build-time-generated sitemap.xml (SEO-03).
 *
 * Emits all 70 URLs across the static site:
 *   - 6 static routes: /, /work, /pbs-american-portrait, /press, /about, /contact
 *   - 8 /work/[category] routes (one per Category in display order)
 *   - 56 /watch/[id] routes (one per Video)
 *
 * Total = 6 + 8 + 56 = 70 <url> blocks.
 *
 * Prerendered (build emits build/sitemap.xml).
 *
 * BASE_PATH note: this file emits ABSOLUTE production URLs (https://michellengo.net/...)
 * regardless of BASE_PATH (Pitfall 11 — canonical/sitemap URLs must be fully-
 * qualified, NOT base-relative). Staging deploys at wolfwdavid.github.io/
 * michelle_ngo_five/ emit a sitemap with the production host — acceptable because
 * staging is noindex and search engines won't crawl it; the production build emits
 * the same sitemap content unchanged.
 */
import { videos, getCategoriesInDisplayOrder, categoryToSlug } from '$lib/data';

export const prerender = true;

const SITE = 'https://michellengo.net';
const TODAY = new Date().toISOString().slice(0, 10); // build-time lastmod

const STATIC_ROUTES = ['/', '/work/', '/pbs-american-portrait/', '/press/', '/about/', '/contact/'];

export function GET() {
  const urls: string[] = [];

  // Static routes
  for (const path of STATIC_ROUTES) {
    urls.push(`  <url><loc>${SITE}${path}</loc><lastmod>${TODAY}</lastmod></url>`);
  }

  // /work/[category] — 8 entries in display order
  for (const category of getCategoriesInDisplayOrder()) {
    const slug = categoryToSlug(category);
    urls.push(`  <url><loc>${SITE}/work/${slug}/</loc><lastmod>${TODAY}</lastmod></url>`);
  }

  // /watch/[id] — 56 entries
  for (const v of videos) {
    urls.push(`  <url><loc>${SITE}/watch/${v.id}/</loc><lastmod>${TODAY}</lastmod></url>`);
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
