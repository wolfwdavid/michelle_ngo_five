import { describe, expect, it } from 'vitest';
import { getPressCredits } from './_pressCredits';

const EXPECTED_PRESTIGE_ORDER = [
  'HBO Max',
  'HBO',
  'PBS',
  'ABC News',
  'U2',
  'Amazon News',
  'Music Box Films',
  'Monument Releasing',
  'Cargo Film & Releasing',
  'AZPM',
  'HBODocs',
  'GrasshalmClips',
  'Lenny Cooke (Movie)',
] as const;

describe('getPressCredits — filter + grouping', () => {
  it('returns 13 groups (one per distinct non-Michelle uploader)', () => {
    const groups = getPressCredits();
    expect(groups.length).toBe(13);
  });

  it('total video count across all groups is 13 (no duplicates, no Michelle Ngo)', () => {
    const groups = getPressCredits();
    const totalCount = groups.reduce((acc, g) => acc + g.videos.length, 0);
    expect(totalCount).toBe(13);
    for (const g of groups) {
      for (const v of g.videos) {
        expect(v.uploader).not.toBe('Michelle Ngo');
      }
    }
  });

  it('every group.network matches one of the 13 known uploaders', () => {
    const groups = getPressCredits();
    for (const g of groups) {
      expect(EXPECTED_PRESTIGE_ORDER as readonly string[]).toContain(g.network);
    }
  });

  it('every group has at least one video; group.videos is non-empty', () => {
    const groups = getPressCredits();
    for (const g of groups) {
      expect(g.videos.length).toBeGreaterThan(0);
    }
  });

  it('grouping invariant: every video.uploader matches its group.network', () => {
    const groups = getPressCredits();
    for (const g of groups) {
      for (const v of g.videos) {
        expect(v.uploader).toBe(g.network);
      }
    }
  });
});

describe('getPressCredits — prestige order', () => {
  it('groups emitted in the locked prestige order', () => {
    const groups = getPressCredits();
    const actualOrder = groups.map((g) => g.network);
    expect(actualOrder).toEqual(Array.from(EXPECTED_PRESTIGE_ORDER));
  });
});
