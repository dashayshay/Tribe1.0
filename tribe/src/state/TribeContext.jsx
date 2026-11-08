import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { load, save, remove } from '../lib/storage.js';
import { track, startSession } from '../lib/analytics.js';
import { resolveVariant, persistVariant, tabFor, VARIANTS } from '../lib/experiment.js';
import { hoursUntil } from '../lib/time.js';
import {
  buildSeedEvents, buildPastHangouts, buildSlots, SEED_CHATS, VIBE_TAGS, BASE_REVIEWS,
} from '../data/content.js';
import { DEFAULT_NICHES, ME } from '../data/people.js';

const STATE_KEY = 'tribe.state.v1';

// Only user-generated deltas are persisted. Seed content is rebuilt on every
// load so its dates stay relative to today.
const INITIAL = {
  onboarded: false,
  verified: false,
  niches: DEFAULT_NICHES,
  bookedIds: [101],
  createdEvents: [],
  feedbackDone: [],
  vibeBonus: {},
  reviewsBonus: 0,
  chats: SEED_CHATS,
  publishedSlots: {}, // slotId -> eventId
  invitedConnectors: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'ONBOARD':
      return { ...state, onboarded: true, verified: action.verified, niches: action.niches };
    case 'SET_NICHES':
      return { ...state, niches: action.niches };
    case 'BOOK':
      return state.bookedIds.includes(action.id) ? state : { ...state, bookedIds: [...state.bookedIds, action.id] };
    case 'RELEASE':
      return { ...state, bookedIds: state.bookedIds.filter((id) => id !== action.id) };
    case 'CREATE_EVENT':
      return {
        ...state,
        createdEvents: [action.event, ...state.createdEvents],
        bookedIds: action.bookForMe ? [...state.bookedIds, action.event.id] : state.bookedIds,
      };
    case 'BUMP_TAKEN':
      return {
        ...state,
        createdEvents: state.createdEvents.map((e) =>
          e.id === action.id
            ? { ...e, takenByOthers: Math.min(e.spotsTotal, e.takenByOthers + action.n) }
            : e,
        ),
      };
    case 'SUBMIT_FEEDBACK': {
      const vibeBonus = { ...state.vibeBonus };
      for (const [word, n] of Object.entries(action.received)) vibeBonus[word] = (vibeBonus[word] ?? 0) + n;
      return {
        ...state,
        feedbackDone: [...state.feedbackDone, action.pastId],
        vibeBonus,
        reviewsBonus: state.reviewsBonus + action.reviewers,
      };
    }
    case 'SEND_MESSAGE':
      return {
        ...state,
        chats: { ...state.chats, [action.personId]: [...(state.chats[action.personId] ?? []), action.message] },
      };
    case 'PUBLISH_SLOT':
      return { ...state, publishedSlots: { ...state.publishedSlots, [action.slotId]: action.eventId } };
    case 'INVITE_CONNECTOR':
      return { ...state, invitedConnectors: [...state.invitedConnectors, action.personId] };
    case 'RESET':
      return { ...INITIAL };
    default:
      return state;
  }
}

const TribeContext = createContext(null);

export function TribeProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({ ...INITIAL, ...load(STATE_KEY, {}) }));
  useEffect(() => save(STATE_KEY, state), [state]);

  // Seeds are built once per page load (dates relative to now).
  const seeds = useMemo(() => buildSeedEvents(), []);
  const pastHangouts = useMemo(() => buildPastHangouts(), []);
  const slots = useMemo(() => buildSlots(), []);

  // ---- Experiment ------------------------------------------------------
  const [variant, setVariantState] = useState(() => resolveVariant().id);
  const [tab, setTabState] = useState('discover');
  const [exploreFilter, setExploreFilter] = useState('all');

  useEffect(() => {
    startSession(variant, 'load');
    track('tab_view', { tab: 'discover' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setTab = useCallback((id) => {
    setTabState(id);
    track('tab_view', { tab: id });
  }, []);

  const switchVariant = useCallback((id) => {
    if (!VARIANTS[id]) return;
    persistVariant(id);
    setVariantState(id);
    startSession(id, 'manual_switch');
    setTabState('discover');
    track('tab_view', { tab: 'discover' });
  }, []);

  /** Variant-aware navigation to a logical section. */
  const goTo = useCallback(
    (section) => {
      if (section === 'exclusive' && variant === 'B') setExploreFilter('sponsored');
      setTab(tabFor(variant, section));
    },
    [variant, setTab],
  );

  // ---- Overlays & toast --------------------------------------------------
  const [overlay, setOverlay] = useState(null); // { type, ...payload }
  const open = useCallback((type, payload = {}) => setOverlay({ type, ...payload }), []);
  const close = useCallback(() => setOverlay(null), []);

  const [toastMsg, setToastMsg] = useState(null);
  const toastTimer = useRef(null);
  const toast = useCallback((msg) => {
    // Clearing the previous timer fixes the original bug where an older
    // timeout would dismiss a newer toast early.
    clearTimeout(toastTimer.current);
    setToastMsg(msg);
    toastTimer.current = setTimeout(() => setToastMsg(null), 3200);
  }, []);

  // ---- Derived data ------------------------------------------------------
  const events = useMemo(() => {
    const all = [...state.createdEvents, ...seeds];
    return all.map((e) => {
      const isBooked = state.bookedIds.includes(e.id);
      const isHosting = e.hostId === 'me' || e.coHostId === 'me';
      const spotsLeft = Math.max(0, e.spotsTotal - e.takenByOthers - (isBooked ? 1 : 0));
      return { ...e, isBooked, isHosting, spotsLeft };
    });
  }, [state.createdEvents, state.bookedIds, seeds]);

  const getEvent = useCallback((id) => events.find((e) => e.id === id) ?? null, [events]);

  const vibes = useMemo(() => {
    const reviews = BASE_REVIEWS + state.reviewsBonus;
    return {
      reviews,
      tags: VIBE_TAGS.map((t) => {
        const count = Math.min(reviews, t.count + (state.vibeBonus[t.word] ?? 0));
        return { ...t, count, pct: Math.round((count / reviews) * 100) };
      }),
    };
  }, [state.vibeBonus, state.reviewsBonus]);

  // ---- Actions -----------------------------------------------------------
  const toggleBooking = useCallback(
    (event) => {
      if (event.isHosting) {
        toast("You're hosting this one — your chair is saved.");
        return;
      }
      if (event.isBooked) {
        dispatch({ type: 'RELEASE', id: event.id });
        track('rsvp_release', { id: event.id, hoursBefore: Math.round(hoursUntil(event.startsAt)) });
        toast(
          hoursUntil(event.startsAt) < 24
            ? 'Chair released. Releasing inside 24h counts as a late cancel.'
            : 'Chair released — the next person on the waitlist gets it.',
        );
        return;
      }
      if (event.spotsLeft <= 0) {
        toast('This squad is full. We’ll ping you if a chair opens.');
        return;
      }
      if (!state.verified) {
        toast('Verified creatives only — finish verification to claim a chair.');
        open('onboarding', { step: 2 });
        return;
      }
      dispatch({ type: 'BOOK', id: event.id });
      track('rsvp', { id: event.id, sponsored: event.type === 'Sponsored', price: event.price });
      toast(event.price === 0 ? 'Chair claimed. See you there.' : `$${event.price} ticket secured. You're in.`);
    },
    [toast, open, state.verified],
  );

  const resetDemo = useCallback(() => {
    remove(STATE_KEY);
    dispatch({ type: 'RESET' });
    setOverlay(null);
    setTabState('discover');
  }, []);

  const value = {
    state, dispatch, me: ME,
    events, getEvent, pastHangouts, slots, vibes,
    variant, switchVariant, tab, setTab, goTo,
    exploreFilter, setExploreFilter,
    overlay, open, close,
    toastMsg, toast,
    toggleBooking, resetDemo,
  };

  return <TribeContext.Provider value={value}>{children}</TribeContext.Provider>;
}

export function useTribe() {
  const ctx = useContext(TribeContext);
  if (!ctx) throw new Error('useTribe must be used inside <TribeProvider>');
  return ctx;
}
