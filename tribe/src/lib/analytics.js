import { load, save, remove } from './storage.js';

/**
 * Tiny event tracker for the A/B test.
 *
 * Events are kept in localStorage so the Experiment Lab panel can summarise
 * them, and forwarded to PostHog if `window.posthog` exists — drop the PostHog
 * snippet into index.html and real multi-user data starts flowing with no
 * code changes.
 */

const LOG_KEY = 'tribe.analytics.v1';
const MAX_EVENTS = 3000;

let sessionId = newSessionId();
let currentVariant = null;

function newSessionId() {
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function startSession(variant, reason = 'load') {
  sessionId = newSessionId();
  currentVariant = variant;
  track('session_start', { reason });
}

export function track(name, props = {}) {
  const entry = { name, props, variant: currentVariant, session: sessionId, t: Date.now() };
  const log = load(LOG_KEY, []);
  log.push(entry);
  save(LOG_KEY, log.slice(-MAX_EVENTS));
  try {
    window.posthog?.capture?.(name, { ...props, $set: { tabs_v1: currentVariant } });
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent('tribe:track', { detail: entry }));
}

export function readLog() {
  return load(LOG_KEY, []);
}

export function clearLog() {
  remove(LOG_KEY);
  window.dispatchEvent(new CustomEvent('tribe:track'));
}

const NETWORK_ACTIONS = new Set(['chat_send', 'cohost_sent', 'orbit_open', 'chat_open']);

function median(nums) {
  if (!nums.length) return null;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/** Per-variant summary used by the Experiment Lab panel. */
export function summarize(log = readLog()) {
  const out = {};
  for (const v of ['A', 'B']) {
    const rows = log.filter((e) => e.variant === v);
    const sessions = new Map();
    for (const e of rows) {
      if (!sessions.has(e.session)) sessions.set(e.session, []);
      sessions.get(e.session).push(e);
    }
    const n = sessions.size;
    let claims = 0;
    let sponsored = 0;
    let network = 0;
    let tabsSeen = 0;
    const ttfc = [];
    for (const events of sessions.values()) {
      const start = events.find((e) => e.name === 'session_start')?.t ?? events[0].t;
      const firstClaim = events.find((e) => e.name === 'rsvp');
      if (firstClaim) ttfc.push((firstClaim.t - start) / 1000);
      claims += events.filter((e) => e.name === 'rsvp').length;
      sponsored += events.filter((e) => e.name === 'rsvp' && e.props?.sponsored).length;
      network += events.filter((e) => NETWORK_ACTIONS.has(e.name)).length;
      tabsSeen += new Set(events.filter((e) => e.name === 'tab_view').map((e) => e.props?.tab)).size;
    }
    const per = (x) => (n ? x / n : null);
    out[v] = {
      sessions: n,
      claimsPerSession: per(claims),
      networkPerSession: per(network),
      sponsoredPerSession: per(sponsored),
      tabsPerSession: per(tabsSeen),
      medianSecondsToFirstClaim: median(ttfc),
    };
  }
  return out;
}

export function exportLog() {
  const blob = new Blob([JSON.stringify(readLog(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tribe-ab-events-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
