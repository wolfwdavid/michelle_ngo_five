import { describe, expect, it } from 'vitest';
import { GET } from './+server';
import { videos, getCategoriesInDisplayOrder, categoryToSlug } from '$lib/data';

async function getBody(): Promise<string> {
  const res = GET();
  return await res.text();
}

describe('/sitemap.xml — SEO-03', () => {
  it('is a well-formed urlset XML document', async () => {
    const body = await getBody();
    expect(body).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(body).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(body).toContain('</urlset>');
  });

  it('enumerates exactly 70 <loc> entries (6 static + 8 category + 56 watch)', async () => {
    const body = await getBody();
    const locCount = (body.match(/<loc>/g) ?? []).length;
    expect(locCount).toBe(70);
    expect(videos.length).toBe(56);
    expect(getCategoriesInDisplayOrder().length).toBe(8);
  });

  it('uses the absolute production host (not base-relative)', async () => {
    const body = await getBody();
    expect(body).toContain('https://michellengo.net');
    // No base-relative or staging-host leakage in <loc> entries.
    expect(body).not.toContain('/michelle_ngo_five/');
  });

  it('includes the three static pages this site exposes', async () => {
    const body = await getBody();
    expect(body).toContain('<loc>https://michellengo.net/about/</loc>');
    expect(body).toContain('<loc>https://michellengo.net/press/</loc>');
    expect(body).toContain('<loc>https://michellengo.net/contact/</loc>');
  });

  it('includes home, /work/, and /pbs-american-portrait/', async () => {
    const body = await getBody();
    expect(body).toContain('<loc>https://michellengo.net/</loc>');
    expect(body).toContain('<loc>https://michellengo.net/work/</loc>');
    expect(body).toContain('<loc>https://michellengo.net/pbs-american-portrait/</loc>');
  });

  it('includes a /watch/<id>/ entry for the first video', async () => {
    const body = await getBody();
    const firstVideo = videos[0];
    expect(firstVideo, 'videos[0] should exist').toBeDefined();
    expect(body).toContain(`<loc>https://michellengo.net/watch/${firstVideo!.id}/</loc>`);
  });

  it('includes all 8 category slugs', async () => {
    const body = await getBody();
    for (const category of getCategoriesInDisplayOrder()) {
      const slug = categoryToSlug(category);
      expect(body).toContain(`<loc>https://michellengo.net/work/${slug}/</loc>`);
    }
  });
});
