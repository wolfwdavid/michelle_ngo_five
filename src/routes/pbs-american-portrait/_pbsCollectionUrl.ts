/**
 * Extracts the first pbs.org/american-portrait/collection/... URL from a video's
 * description. Returns null if no match.
 *
 * Underscore prefix excludes this file from SvelteKit route detection
 * (SvelteKit ignores `_*` files under src/routes/*).
 *
 * Defensive trailing-punctuation strip: today's 18 PBS descriptions have no
 * trailing punctuation on the URL, but a future copy edit could introduce a
 * `.` or `,` — this trim is a free safety net.
 *
 * Regex `[^\s)]+` (negate space AND closing paren) handles the inline-parenthesis case.
 */
const COLLECTION_URL = /https?:\/\/(?:www\.)?pbs\.org\/american-portrait\/collection\/[^\s)]+/;
const TRAILING_PUNCT = /[).,!?]+$/;

export function pbsCollectionUrl(description: string): string | null {
  const m = description.match(COLLECTION_URL);
  if (!m) return null;
  return m[0].replace(TRAILING_PUNCT, '');
}
