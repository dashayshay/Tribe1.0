import React, { useMemo, useState } from 'react';
import { Search, X, MapPin, ShieldCheck, Compass, Plus, Sparkles, ChevronRight } from 'lucide-react';
import { useTribe } from '../state/TribeContext.jsx';
import { CATEGORIES } from '../data/content.js';
import { Avatar } from '../components/ui.jsx';
import { EventCard, RailCard } from '../components/EventCard.jsx';

const FILTERS = [
  { id: 'all', label: 'All Gatherings' },
  { id: 'free', label: 'Free Squad Hangouts' },
  { id: 'sponsored', label: 'Curated & Perks' },
];

export default function ExploreView() {
  const { events, variant, goTo, open, me, exploreFilter, setExploreFilter } = useTribe();
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) => {
      const matchCat = category === 'All' || e.category === category;
      const matchQ =
        !q || [e.title, e.location, e.category, e.description].some((s) => s?.toLowerCase().includes(q));
      const matchType =
        exploreFilter === 'all' ? true : exploreFilter === 'free' ? e.price === 0 : e.type === 'Sponsored';
      return matchCat && matchQ && matchType;
    });
  }, [events, category, query, exploreFilter]);

  // Variant B has no Exclusive tab, so curated events surface as a rail here.
  const showRail = variant === 'B' && exploreFilter === 'all' && category === 'All' && !query;
  const sponsored = events.filter((e) => e.type === 'Sponsored');

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      <header className="px-5 pt-3 pb-2 shrink-0 space-y-3 bg-stone-900/95 backdrop-blur z-20 border-b border-stone-800/60">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-black text-sm tracking-tighter">
              TR
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-base tracking-tight text-white">TRIBE</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-950/80 text-purple-300 border border-purple-800/70">
                  IRL CREATIVE
                </span>
              </div>
              <p className="text-[11px] text-stone-400 flex items-center gap-1 font-medium">
                <MapPin size={11} className="text-orange-400" /> Los Angeles Arts District
              </p>
            </div>
          </div>
          <button
            onClick={() => goTo('profile')}
            aria-label="Open your profile"
            className="flex items-center gap-1 bg-stone-800/90 hover:bg-stone-800 border border-stone-700/80 pl-1 pr-2 py-1 rounded-full transition-all"
          >
            <Avatar person={me} size="xs" className="w-6 h-6" />
            <ShieldCheck size={14} className="text-emerald-400" />
          </button>
        </div>

        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search gatherings"
            placeholder="Find photowalks, design jams, beats..."
            className="w-full bg-stone-950/70 border border-stone-800 focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/50 rounded-2xl pl-9 pr-8 py-2.5 text-[13px] text-white placeholder-stone-500 transition-all outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setExploreFilter(f.id)}
              aria-pressed={exploreFilter === f.id}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all shrink-0 ${
                exploreFilter === f.id
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'bg-stone-800/80 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-2 px-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              aria-pressed={category === cat}
              className={`px-3 py-1 rounded-xl text-[11px] font-medium tracking-tight whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-teal-700 text-white font-bold border border-teal-400/40'
                  : 'bg-stone-800/40 text-stone-400 hover:bg-stone-800/80 hover:text-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 pb-28">
        {showRail && sponsored.length > 0 && (
          <section aria-label="Partner curations" className="space-y-2">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={13} /> Partner Curations
              </h2>
              <button
                onClick={() => setExploreFilter('sponsored')}
                className="text-[11px] font-bold text-stone-400 hover:text-amber-300 flex items-center"
              >
                See all <ChevronRight size={12} />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
              {sponsored.map((e) => (
                <RailCard key={e.id} event={e} />
              ))}
            </div>
          </section>
        )}

        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            {filtered.length} {filtered.length === 1 ? 'gathering' : 'gatherings'}
          </span>
          <span className="text-[11px] text-stone-500 flex items-center gap-1">
            <ShieldCheck size={12} className="text-emerald-400" /> ID-verified only
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-stone-950/40 border border-stone-800/70 rounded-3xl p-8 text-center space-y-3">
            <Compass size={32} className="mx-auto text-stone-600" />
            <h4 className="text-sm font-bold text-stone-300">Nothing here yet</h4>
            <p className="text-xs text-stone-500 max-w-[240px] mx-auto">
              Be the one to break the ice — host a small hangout for local creatives.
            </p>
            <button
              onClick={() => open('create', { category: category === 'All' ? undefined : category })}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full text-xs font-bold transition-all shadow-md shadow-orange-500/20"
            >
              + Host a hangout
            </button>
          </div>
        ) : (
          filtered.map((e) => <EventCard key={e.id} event={e} />)
        )}
      </div>

      <button
        onClick={() => open('create')}
        aria-label="Host a hangout"
        className="absolute bottom-5 right-5 z-30 w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-xl shadow-orange-500/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all border border-white/20"
      >
        <Plus size={26} strokeWidth={2.6} />
      </button>
    </div>
  );
}
