import { at } from '../lib/time.js';

export const CATEGORIES = ['All', 'Photography', 'UX/Design', 'Music Prod', 'Visual Arts', 'Writing'];

const COVER = {
  Photography: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=800',
  'UX/Design': 'https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&q=80&w=800',
  'Music Prod': 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=800',
  'Visual Arts': 'https://images.unsplash.com/photo-1518998053901-5348d3969105?auto=format&fit=crop&q=80&w=800',
  Writing: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800',
};

const ALT_COVER = {
  Photography: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800',
  'UX/Design': 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&q=80&w=800',
  'Music Prod': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800',
  'Visual Arts': 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800',
  Writing: 'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?auto=format&fit=crop&q=80&w=800',
};

export function coverFor(category, alt = true) {
  return (alt ? ALT_COVER : COVER)[category] ?? ALT_COVER['UX/Design'];
}

/**
 * Seed events. `takenByOthers` counts chairs held by other people; spots left
 * is derived (total − others − you), so the count can never drift out of sync.
 */
export function buildSeedEvents() {
  return [
    {
      id: 101,
      title: 'Golden Hour 35mm Street Photowalk',
      hostId: 'shutter',
      type: 'Community',
      image: COVER.Photography,
      startsAt: at(3, 16, 30),
      location: 'Arts District, Warehouse 4',
      price: 0,
      spotsTotal: 10,
      takenByOthers: 6,
      category: 'Photography',
      perk: null,
      description:
        'Grab your 35mm, DSLR, or phone. We walk the industrial district catching twilight reflections, then debrief over drinks at Arts District Brewing.',
      attendeeIds: ['elena', 'marcus', 'maya'],
    },
    {
      id: 102,
      title: 'Figma Systems & Cortado Jam',
      hostId: 'sarah',
      type: 'Community',
      image: COVER['UX/Design'],
      startsAt: at(2, 10),
      location: 'Espresso Lab & Co.',
      price: 0,
      spotsTotal: 6,
      takenByOthers: 4,
      category: 'UX/Design',
      perk: null,
      description:
        'Bring a laptop or sketchbook. We critique design systems, swap token setups, and untangle stubborn auto-layout bugs over good espresso.',
      attendeeIds: ['tariq', 'kira'],
    },
    {
      id: 103,
      title: 'Ableton 12 Analog Synths Masterclass',
      hostId: 'soundwave',
      type: 'Sponsored',
      image: COVER['Music Prod'],
      startsAt: at(4, 18),
      location: 'Beat Lab Studios, Room C',
      price: 35,
      spotsTotal: 12,
      takenByOthers: 8,
      category: 'Music Prod',
      perk: 'Free custom wavetable pack ($40 value)',
      description:
        'A hands-on, hardware-meets-software session with a Moog Matriarch and Ableton Push 3. Work in pairs to build stems for a live ambient track.',
      attendeeIds: ['julian', 'zoe'],
    },
    {
      id: 104,
      title: 'Curator VIP Night & Natural Wine',
      hostId: 'modern',
      type: 'Sponsored',
      image: COVER['Visual Arts'],
      startsAt: at(6, 19),
      location: 'Modern Art Museum, East Wing',
      price: 25,
      spotsTotal: 15,
      takenByOthers: 10,
      category: 'Visual Arts',
      perk: 'Private curator Q&A + 2 pours included',
      description:
        'Private gallery access after public hours. Hear directly from the lead curators about newly acquired generative and neo-expressionist pieces.',
      attendeeIds: ['chris', 'nina'],
    },
    {
      id: 105,
      title: 'Zine Swap & Flash Fiction Hour',
      hostId: 'devon',
      type: 'Community',
      image: COVER.Writing,
      startsAt: at(5, 19),
      location: 'Paper Cuts Print Shop',
      price: 0,
      spotsTotal: 8,
      takenByOthers: 3,
      category: 'Writing',
      perk: null,
      description:
        'Bring three copies of anything you made — zine, poem, comic. We trade, then write 500-word flash pieces from a shared prompt and read them aloud.',
      attendeeIds: ['maya'],
    },
  ];
}

export const ICEBREAKERS = {
  Photography: [
    "What's one shot you missed this month that still haunts you?",
    'Natural-light purist or strobe magician: where do you draw the line?',
    'If you could keep only one prime focal length forever, which one?',
  ],
  'UX/Design': [
    "What's the most unforgivable UI pattern you saw in the wild this week?",
    'Auto-layout wizard or frame freestyler when prototyping early ideas?',
    'Design systems: creative freedom or corporate prison?',
  ],
  'Music Prod': [
    "What's the guilty-pleasure plugin you refuse to delete?",
    'Analog imperfection vs. pristine digital precision: what wins your ear?',
    "Which album's mixdown made you rethink how you produce?",
  ],
  'Visual Arts': [
    'What medium did you hate until you were forced to work with it?',
    'If your aesthetic were an architectural movement, which one?',
    'Do you make work with the gallery in mind, or purely for yourself?',
  ],
  Writing: [
    'Pen-and-paper first draft, or straight into mechanical-keyboard chaos?',
    'Who is your favorite villain purely from a dialogue perspective?',
    "What's the sentence you refused to let an editor cut?",
  ],
};

/** Positive-only vibe tags. `count` = reviewers who chose the tag. */
export const VIBE_TAGS = [
  { word: 'Reliable', count: 38, tone: 'emerald' },
  { word: 'Insightful', count: 33, tone: 'purple' },
  { word: 'Generous Listener', count: 29, tone: 'teal' },
  { word: 'Taste-maker', count: 24, tone: 'amber' },
  { word: 'Action-Oriented', count: 21, tone: 'orange' },
  { word: 'No Ego', count: 18, tone: 'stone' },
];
export const BASE_REVIEWS = 38;

export const TONES = {
  emerald: 'text-emerald-300 bg-emerald-950/60 border-emerald-800/60',
  purple: 'text-purple-300 bg-purple-950/60 border-purple-800/60',
  teal: 'text-teal-300 bg-teal-950/60 border-teal-800/60',
  amber: 'text-amber-300 bg-amber-950/60 border-amber-800/60',
  orange: 'text-orange-300 bg-orange-950/60 border-orange-800/60',
  stone: 'text-stone-300 bg-stone-800/80 border-stone-700/60',
};

/** A hangout the user already attended — drives the post-hangout feedback flow. */
export function buildPastHangouts() {
  return [
    {
      id: 'p1',
      title: 'Riso Zine Night',
      category: 'Visual Arts',
      startsAt: at(-3, 19),
      location: 'Paper Cuts Print Shop',
      squadIds: ['maya', 'devon', 'kira', 'zoe'],
      // What the squad left for you — revealed only after you submit yours.
      received: { 'Generous Listener': 2, Insightful: 1, 'Taste-maker': 1, Reliable: 4 },
    },
  ];
}

export const PROFILE_STATS = { jamsJoined: 12, committed: 12, attended: 12 };

/** Seed DMs, keyed by person id. */
export const SEED_CHATS = {
  kira: [{ from: 'them', text: 'Your stairwell prints at Riso night were so good. Are you still into wood type?' }],
  maya: [{ from: 'them', text: 'Thanks for bringing extra paper last week 🙏' }],
  julian: [{ from: 'them', text: 'Found a cheap Make Noise 0-Coast. Jam soon?' }],
};

export const CANNED_REPLIES = [
  "Yes — I've been wanting a reason to do this.",
  'Love that. What day works for you?',
  "Ha, I was literally thinking the same thing. Let's make it happen.",
  'In. Want to co-host so we can keep it to a small squad?',
];

/** Venue off-peak slots for the Host Hub yield flow. */
export function buildSlots() {
  return [
    { id: 's1', room: 'Riso Room', startsAt: at(2, 14), window: '2–5 PM', usualFill: 15, category: 'Visual Arts', suggestion: 'Riso Zine Sprint' },
    { id: 's2', room: 'Darkroom B', startsAt: at(3, 10), window: '10 AM–1 PM', usualFill: 8, category: 'Photography', suggestion: 'Darkroom Printing for Film Shooters' },
    { id: 's3', room: 'Studio C · Synth Wall', startsAt: at(5, 13), window: '1–4 PM', usualFill: 22, category: 'Music Prod', suggestion: 'Patch Cable Social: Intro to Modular' },
  ];
}

export const CONNECTORS = [
  { personId: 'elena', score: 98, specialty: 'Fills photo walks in < 24h' },
  { personId: 'marcus', score: 94, specialty: 'Street + color squads' },
  { personId: 'me', score: 91, specialty: 'UX & photo jams' },
];

export const HOST_BASE = { reach: 1480, gmv: 3240, bookings: 84 };
