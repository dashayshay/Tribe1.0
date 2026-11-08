import { load, save } from './storage.js';

/**
 * Tab-structure A/B test.
 *
 * A — Control (what the prototype shipped with):
 *     Explore · Exclusive · My Tribe · Host Hub
 *     Sponsored events get a dedicated tab; Profile and Network share one tab.
 *
 * B — Network-first (what the product brief describes):
 *     Explore · Network · Profile · Host Hub
 *     Network gets its own tab; sponsored events move to an Explore rail + filter.
 *
 * Hypothesis: B increases network actions (chats, co-host invites, orbit taps)
 * per session without reducing sponsored bookings (guardrail).
 */

export const EXPERIMENT_ID = 'tabs_v1';
const KEY = `tribe.exp.${EXPERIMENT_ID}`;

export const VARIANTS = {
  A: {
    id: 'A',
    name: 'Control',
    blurb: 'Exclusive tab · Profile + Network combined',
    tabs: [
      { id: 'discover', label: 'Explore', icon: 'Search' },
      { id: 'exclusive', label: 'Exclusive', icon: 'Sparkles' },
      { id: 'tribe', label: 'My Tribe', icon: 'Users' },
      { id: 'host', label: 'Host Hub', icon: 'Activity' },
    ],
  },
  B: {
    id: 'B',
    name: 'Network-first',
    blurb: 'Network tab · sponsored rail lives in Explore',
    tabs: [
      { id: 'discover', label: 'Explore', icon: 'Search' },
      { id: 'network', label: 'Network', icon: 'Orbit' },
      { id: 'profile', label: 'Profile', icon: 'UserRound' },
      { id: 'host', label: 'Host Hub', icon: 'Activity' },
    ],
  },
};

/**
 * Resolution order:
 *   1. `?variant=a|b` in the URL (handy for sharing a specific arm), persisted
 *   2. a previously stored assignment (sticky per browser)
 *   3. a fresh 50/50 coin flip
 */
export function resolveVariant() {
  let fromUrl = null;
  try {
    fromUrl = new URLSearchParams(window.location.search).get('variant')?.toUpperCase();
  } catch {
    /* ignore */
  }
  if (fromUrl && VARIANTS[fromUrl]) {
    save(KEY, fromUrl);
    return { id: fromUrl, source: 'url' };
  }
  const stored = load(KEY, null);
  if (stored && VARIANTS[stored]) return { id: stored, source: 'sticky' };
  const assigned = Math.random() < 0.5 ? 'A' : 'B';
  save(KEY, assigned);
  return { id: assigned, source: 'random' };
}

export function persistVariant(id) {
  save(KEY, id);
}

/** Maps a logical section to the tab that holds it in a given variant. */
export function tabFor(variantId, section) {
  const map =
    variantId === 'A'
      ? { explore: 'discover', exclusive: 'exclusive', network: 'tribe', profile: 'tribe', host: 'host' }
      : { explore: 'discover', exclusive: 'discover', network: 'network', profile: 'profile', host: 'host' };
  return map[section] ?? 'discover';
}
