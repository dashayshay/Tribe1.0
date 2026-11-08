// People are fictional. Avatars are generated (initials on brand gradients)
// rather than stock portraits, so no real person is shown as a "verified user".

export const ME = {
  id: 'me',
  name: 'Alex Morgan',
  role: 'Senior Product Designer & Photographer',
  gradient: 'from-orange-500 to-purple-600',
};

/** Selectable creative niches. `category` ties a niche to an Explore filter. */
export const NICHES = [
  { label: 'Street Photography', category: 'Photography', icon: 'Camera' },
  { label: 'Analog Film', category: 'Photography', icon: 'Aperture' },
  { label: 'UX/Design', category: 'UX/Design', icon: 'Monitor' },
  { label: 'Analog Typography', category: 'UX/Design', icon: 'Type' },
  { label: 'Modular Synths', category: 'Music Prod', icon: 'Radio' },
  { label: 'Beatmaking', category: 'Music Prod', icon: 'Mic' },
  { label: 'Riso Printmaking', category: 'Visual Arts', icon: 'Printer' },
  { label: 'Painting & Illustration', category: 'Visual Arts', icon: 'Palette' },
  { label: 'Fiction & Essays', category: 'Writing', icon: 'Feather' },
  { label: 'Zines', category: 'Writing', icon: 'BookOpen' },
];

export const DEFAULT_NICHES = [
  'UX/Design',
  'Street Photography',
  'Analog Typography',
  'Modular Synths',
  'Riso Printmaking',
];

export const PEOPLE = {
  tariq: {
    id: 'tariq', name: 'Tariq H.', role: 'Product Designer', ring: 'inner', affinity: 4,
    niches: ['UX/Design', 'Street Photography', 'Beatmaking'],
    project: 'Open-source design-token audit kit',
    gradient: 'from-teal-400 to-emerald-600',
  },
  elena: {
    id: 'elena', name: 'Elena R.', role: 'Indie Cinematographer', ring: 'inner', affinity: 2,
    niches: ['Street Photography', 'Analog Film', 'Painting & Illustration'],
    project: 'Short doc on LA night-bus drivers',
    gradient: 'from-orange-400 to-rose-500',
  },
  julian: {
    id: 'julian', name: 'Julian D.', role: 'Sound Designer', ring: 'inner', affinity: 3,
    niches: ['Modular Synths', 'Beatmaking', 'UX/Design'],
    project: 'Generative ambient score for a gallery opening',
    gradient: 'from-purple-500 to-indigo-600',
  },
  maya: {
    id: 'maya', name: 'Maya S.', role: 'Architectural Photographer', ring: 'inner', affinity: 4,
    niches: ['Street Photography', 'Riso Printmaking', 'Analog Typography'],
    project: 'Riso zine of brutalist stairwells',
    gradient: 'from-amber-400 to-orange-600',
  },
  nina: {
    id: 'nina', name: 'Nina W.', role: 'Art Director', ring: 'inner', affinity: 1,
    niches: ['Analog Typography', 'Painting & Illustration', 'UX/Design'],
    project: 'Identity for a natural-wine bar',
    gradient: 'from-teal-500 to-cyan-700',
  },
  chris: {
    id: 'chris', name: 'Chris V.', role: 'Sculptor', ring: 'outer', affinity: 0,
    niches: ['Painting & Illustration'],
    project: 'Cast-concrete benches for a pocket park',
    gradient: 'from-stone-400 to-stone-600',
  },
  zoe: {
    id: 'zoe', name: 'Zoe P.', role: 'Modular Enthusiast', ring: 'outer', affinity: 2,
    niches: ['Modular Synths', 'Beatmaking'],
    project: 'Eurorack case build, week 6',
    gradient: 'from-purple-400 to-fuchsia-600',
  },
  sarah: {
    id: 'sarah', name: 'Sarah L.', role: 'Interaction Lead', ring: 'outer', affinity: 3,
    niches: ['UX/Design', 'Analog Typography'],
    project: 'Motion spec library for her team',
    gradient: 'from-emerald-400 to-teal-600',
  },
  marcus: {
    id: 'marcus', name: 'Marcus K.', role: 'Colorist & Street Lead', ring: 'outer', affinity: 1,
    niches: ['Analog Film', 'Street Photography'],
    project: 'Film-emulation LUT pack',
    gradient: 'from-orange-500 to-amber-500',
  },
  devon: {
    id: 'devon', name: 'Devon C.', role: 'Illustrator', ring: 'outer', affinity: 2,
    niches: ['Painting & Illustration', 'Riso Printmaking', 'Zines'],
    project: 'Monthly two-color comic zine',
    gradient: 'from-rose-400 to-orange-500',
  },
  kira: {
    id: 'kira', name: 'Kira Y.', role: 'Type Designer', ring: 'outer', affinity: 2,
    niches: ['Analog Typography', 'UX/Design', 'Riso Printmaking'],
    project: 'Hand-set wood-type specimen book',
    gradient: 'from-indigo-400 to-purple-600',
  },
};

export const PEOPLE_LIST = Object.values(PEOPLE);

/** Businesses that host curated events. */
export const BUSINESSES = {
  shutter: { id: 'shutter', name: 'Shutter & Grain Collective', gradient: 'from-stone-500 to-stone-700' },
  soundwave: { id: 'soundwave', name: 'SoundWave Studio Lab', gradient: 'from-purple-600 to-indigo-700' },
  modern: { id: 'modern', name: 'The Modern Contemporary', gradient: 'from-amber-500 to-orange-700' },
  studios: { id: 'studios', name: 'Arts District Studios', gradient: 'from-purple-500 to-orange-500' },
};

export function getPerson(id) {
  if (id === 'me') return ME;
  return PEOPLE[id] ?? BUSINESSES[id] ?? null;
}

export function sharedNiches(person, myNiches) {
  return (person.niches ?? []).filter((n) => myNiches.includes(n));
}

/**
 * Overlap score shown on the Overlapping Niches feed. Only defined for people
 * who share 2+ disciplines — a relationship signal, not a network counter.
 */
export function matchScore(person, myNiches) {
  const n = sharedNiches(person, myNiches).length;
  if (n < 2) return null;
  return Math.min(98, 70 + n * 8 + person.affinity);
}
