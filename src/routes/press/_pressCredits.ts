/**
 * Route-local helper that derives the press credit list from `videos.json`.
 * Returns groups in the locked prestige order.
 *
 * Underscore prefix excludes this file from SvelteKit route detection
 * (SvelteKit 2.x ignores `_*` files under src/routes/*).
 *
 * Source filter: `videos.filter(v => v.uploader !== 'Michelle Ngo')` returns
 * the non-Michelle records (each distinct uploader has exactly 1 credit today).
 *
 * Why pure function (not memoized): `videos` is a module-scoped readonly array;
 * calls are cheap and only happen at build time (prerender). No runtime caching
 * needed.
 *
 * Future-proofing: if a future `videos.json` row carries an uploader not in
 * PRESTIGE_ORDER, that group is appended at the end in insertion order (no
 * crash, no silent drop).
 */
import { videos, type Video } from '$lib/data';

/** Prestige order. Hand-tuned for hiring-producer scan signal. */
const PRESTIGE_ORDER = [
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

export interface PressGroup {
  network: string;
  videos: Video[];
}

export function getPressCredits(): PressGroup[] {
  // Drop Michelle Ngo's own uploads (her credits surface elsewhere on the site;
  // /press is for broadcast partners only).
  const pressVideos = videos.filter((v) => v.uploader !== 'Michelle Ngo');

  // Group by uploader (uploader string verbatim — no normalization).
  const byNetwork = new Map<string, Video[]>();
  for (const v of pressVideos) {
    const list = byNetwork.get(v.uploader);
    if (list) {
      list.push(v);
    } else {
      byNetwork.set(v.uploader, [v]);
    }
  }

  // Emit in PRESTIGE_ORDER first, then append any unknown uploaders in
  // insertion order. Defensive future-proofing per JSDoc note above.
  const ordered: PressGroup[] = [];
  const consumed = new Set<string>();
  for (const network of PRESTIGE_ORDER) {
    const list = byNetwork.get(network);
    if (list && list.length > 0) {
      ordered.push({ network, videos: list });
      consumed.add(network);
    }
  }
  for (const [network, list] of byNetwork) {
    if (!consumed.has(network)) {
      ordered.push({ network, videos: list });
    }
  }
  return ordered;
}
