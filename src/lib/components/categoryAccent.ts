/**
 * Static map from Category name -> Tailwind class string for the per-category
 * accent color (DSGN-02/DSGN-04). The ONLY place a category-to-color binding lives.
 *
 * Why a static literal map (not a computed slug):
 *   Tailwind v4's scanner reads source files and collects utility class names
 *   that appear LITERALLY. A dynamic `` `text-cat-${categoryToSlug(c)}` ``
 *   would compute the class at runtime but Tailwind would NEVER generate it
 *   at build time — the class wouldn't exist in the bundled CSS (Pitfall 1).
 *
 *   This file has every text-cat-* string spelled out verbatim, so the
 *   scanner finds them all and Tailwind generates utilities for each.
 *
 * Adding a new category -> add to CATEGORIES (categories.ts) -> add an entry
 * here -> add a --color-cat-* variable in app.css. Three lines, three files.
 */
import type { Category } from '$lib/data';

const ACCENT: Record<Category, string> = {
  'PBS American Portrait': 'text-cat-pbs',
  'Promos & Trailers': 'text-cat-promos',
  'Branded Content': 'text-cat-branded',
  'Documentary / Short Film': 'text-cat-docshort',
  Reel: 'text-cat-reel',
  'Personal / Tribute': 'text-cat-personal',
  'Educational / Nonprofit': 'text-cat-edunon',
  Other: 'text-cat-other',
};

export function categoryAccent(category: Category): string {
  return ACCENT[category];
}
