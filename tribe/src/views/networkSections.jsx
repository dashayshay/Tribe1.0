import React, { useMemo, useState } from 'react';
import { Share2, MessageCircle, Handshake, PenTool, Layers, X } from 'lucide-react';
import { useTribe } from '../state/TribeContext.jsx';
import { PEOPLE_LIST, sharedNiches, matchScore } from '../data/people.js';
import { Avatar, SectionCard, NicheTag } from '../components/ui.jsx';
import { track } from '../lib/analytics.js';

// Orbit geometry. Nodes are 36px; outer radius + half a node must fit inside
// the 288px-tall canvas (the original placed outer nodes at r=145 inside a
// 240px box, so they were clipped).
const RINGS = { inner: 68, outer: 116 };
const NODE = 36;

function positions(people, ring) {
  const step = 360 / Math.max(people.length, 1);
  const offset = ring === 'inner' ? -90 : -90 + step / 2;
  return people.map((p, i) => {
    const rad = ((offset + i * step) * Math.PI) / 180;
    return { person: p, x: Math.cos(rad) * RINGS[ring], y: Math.sin(rad) * RINGS[ring] };
  });
}

const RING_FILTERS = [
  { id: 'all', label: 'Everyone' },
  { id: 'inner', label: 'Inner circle' },
  { id: 'outer', label: 'Wider orbit' },
];

/**
 * Radial orbit. Design rule: no numeric counters or capacity limits —
 * closeness is shown spatially, never as "42/150".
 */
export function OrbitMap() {
  const { me, state, open } = useTribe();
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const nodes = useMemo(() => {
    const inner = PEOPLE_LIST.filter((p) => p.ring === 'inner');
    const outer = PEOPLE_LIST.filter((p) => p.ring === 'outer');
    return [...positions(inner, 'inner'), ...positions(outer, 'outer')];
  }, []);

  const shared = selected ? sharedNiches(selected, state.niches) : [];

  return (
    <SectionCard icon={Share2} title="Your Orbit" subtitle="The people you actually make things with, closest at the center">
      <div className="flex gap-1 bg-stone-950/70 p-1 rounded-2xl border border-stone-800/80" role="tablist" aria-label="Orbit rings">
        {RING_FILTERS.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
              filter === f.id ? 'bg-purple-600 text-white shadow-sm' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="relative h-72 w-full bg-stone-950/90 rounded-2xl border border-stone-800/80 flex items-center justify-center overflow-hidden">
        <div className="absolute rounded-full bg-purple-500/5 blur-2xl" style={{ width: 200, height: 200 }} />
        <div
          className="absolute rounded-full border border-purple-500/25 pointer-events-none"
          style={{ width: RINGS.inner * 2, height: RINGS.inner * 2 }}
        />
        <div
          className="absolute rounded-full border border-stone-700/70 border-dashed pointer-events-none"
          style={{ width: RINGS.outer * 2, height: RINGS.outer * 2 }}
        />

        <div className="z-10 flex flex-col items-center">
          <div className="rounded-full p-0.5 bg-purple-500 shadow-lg shadow-purple-500/40">
            <Avatar person={me} size="lg" />
          </div>
          <span className="text-[10px] font-extrabold text-purple-300 mt-1">You</span>
        </div>

        {nodes.map(({ person, x, y }) => {
          const dimmed = filter !== 'all' && person.ring !== filter;
          const isInner = person.ring === 'inner';
          const isSel = selected?.id === person.id;
          return (
            <button
              key={person.id}
              onClick={() => {
                setSelected(person);
                track('orbit_open', { person: person.id });
              }}
              aria-label={`${person.name}, ${person.role}`}
              style={{ transform: `translate(${x}px, ${y}px)`, width: NODE, height: NODE }}
              className={`absolute rounded-full p-0.5 transition-all duration-300 hover:scale-125 focus-visible:scale-125 ${
                isInner ? 'ring-2 ring-emerald-400/90' : 'ring-1 ring-purple-400/60'
              } ${dimmed ? 'opacity-15 scale-75 pointer-events-none' : 'opacity-100'} ${isSel ? 'scale-125 ring-orange-400' : ''}`}
            >
              <Avatar person={person} size="sm" className="w-full h-full" />
            </button>
          );
        })}
      </div>

      {selected ? (
        <div className="bg-stone-950/80 border border-purple-500/40 p-3 rounded-2xl space-y-2.5 animate-rise-in">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar person={selected} size="md" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">{selected.name}</p>
                <p className="text-[11px] text-stone-400 truncate">
                  {selected.role} · {selected.ring === 'inner' ? 'Inner circle' : 'Wider orbit'}
                </p>
              </div>
            </div>
            <button onClick={() => setSelected(null)} aria-label="Close" className="text-stone-500 hover:text-white">
              <X size={16} />
            </button>
          </div>
          {shared.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {shared.map((n) => (
                <NicheTag key={n}>{n}</NicheTag>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => open('chat', { personId: selected.id })}
              className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <MessageCircle size={14} /> Chat
            </button>
            <button
              onClick={() => open('cohost', { personId: selected.id })}
              className="flex-1 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Handshake size={14} /> Co-host
            </button>
          </div>
        </div>
      ) : (
        <p className="text-[11px] text-stone-500 text-center">Tap anyone in your orbit to chat or plan something together.</p>
      )}
    </SectionCard>
  );
}

export function OverlappingNiches() {
  const { state, open } = useTribe();
  const matches = useMemo(
    () =>
      PEOPLE_LIST.map((p) => ({ person: p, shared: sharedNiches(p, state.niches), score: matchScore(p, state.niches) }))
        .filter((m) => m.score !== null)
        .sort((a, b) => b.score - a.score),
    [state.niches],
  );

  return (
    <SectionCard
      icon={Layers}
      iconClass="text-teal-400"
      title="Overlapping Niches"
      subtitle="Friends who share two or more of your disciplines"
    >
      {matches.length === 0 ? (
        <div className="text-center py-4 space-y-2">
          <p className="text-xs text-stone-400">Add a few more niches to surface creative overlaps.</p>
          <button onClick={() => open('niches')} className="text-xs font-bold text-orange-400 hover:underline">
            Edit niches
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {matches.map(({ person, shared, score }) => (
            <div key={person.id} className="bg-stone-950/60 border border-stone-800 rounded-2xl p-3 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar person={person} size="md" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white">{person.name}</p>
                    <p className="text-[11px] text-stone-400 truncate">{person.role}</p>
                  </div>
                </div>
                <span className="text-[11px] font-black text-teal-300 bg-teal-950/70 border border-teal-700/60 px-2 py-1 rounded-xl shrink-0">
                  {score}% match
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {shared.map((n) => (
                  <NicheTag key={n}>{n}</NicheTag>
                ))}
              </div>
              <p className="text-[11px] text-stone-300 flex items-start gap-1.5">
                <PenTool size={12} className="text-orange-400 shrink-0 mt-0.5" />
                <span>
                  <span className="text-stone-500">Now making:</span> {person.project}
                </span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => open('chat', { personId: person.id })}
                  className="flex-1 py-1.5 bg-stone-800 hover:bg-stone-700 border border-purple-500/40 text-purple-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <MessageCircle size={13} /> Direct chat
                </button>
                <button
                  onClick={() => open('cohost', { personId: person.id })}
                  className="flex-1 py-1.5 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Handshake size={13} /> Co-host
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
