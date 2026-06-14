import { describe, expect, it } from 'vitest';
import { CATEGORIES } from '$lib/data';
import { categoryAccent } from './categoryAccent';

/**
 * Guards the Category -> text-cat-* accent binding (DSGN-02/DSGN-04). Every
 * category in CATEGORIES must resolve to a real, non-empty `text-cat-*` class —
 * a missing/empty mapping would silently render an uncolored accent.
 */
describe('categoryAccent map', () => {
  it('maps every Category to a non-empty text-cat-* class', () => {
    for (const category of CATEGORIES) {
      const accent = categoryAccent(category);
      expect(accent, `accent for "${category}"`).toBeTypeOf('string');
      expect(accent.length, `accent for "${category}" is non-empty`).toBeGreaterThan(0);
      expect(accent, `accent for "${category}" is a text-cat-* class`).toMatch(/^text-cat-/);
    }
  });
});
