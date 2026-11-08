import React from 'react';
import { Sparkles, Ticket } from 'lucide-react';
import { useTribe } from '../state/TribeContext.jsx';
import { SponsoredCard } from '../components/EventCard.jsx';

/** Variant A only: dedicated tab for partner-curated events. */
export default function ExclusiveView() {
  const { events } = useTribe();
  const sponsored = events.filter((e) => e.type === 'Sponsored');

  return (
    <div className="flex-1 overflow-y-auto px-5 pt-3 pb-28 space-y-4">
      <div className="bg-gradient-to-br from-amber-950/70 via-stone-900 to-stone-900 border border-amber-600/40 rounded-3xl p-5 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
        <div className="flex items-center gap-1.5 text-amber-400 text-xs font-extrabold uppercase tracking-wider">
          <Sparkles size={14} /> Partner Curations
        </div>
        <h2 className="font-display text-xl font-extrabold text-white mt-1 leading-tight">
          Studio masterclasses & secret sessions
        </h2>
        <p className="text-xs text-stone-300 mt-2 leading-relaxed">
          Venues and brands sponsor pro equipment, natural wine, and intimate small-group spaces.
        </p>
        <div className="mt-4 flex gap-3 text-center">
          <div className="bg-stone-950/60 border border-amber-500/30 rounded-2xl px-3 py-2 flex-1">
            <span className="block text-base font-black text-amber-400">100%</span>
            <span className="text-[10px] text-stone-400 font-semibold uppercase">Verified cohorts</span>
          </div>
          <div className="bg-stone-950/60 border border-amber-500/30 rounded-2xl px-3 py-2 flex-1">
            <span className="block text-base font-black text-purple-400">≤ 15</span>
            <span className="text-[10px] text-stone-400 font-semibold uppercase">Per room</span>
          </div>
        </div>
      </div>

      <h3 className="text-xs font-extrabold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
        <Ticket size={13} className="text-amber-400" /> Exclusive creative drops
      </h3>
      {sponsored.map((e) => (
        <SponsoredCard key={e.id} event={e} />
      ))}
    </div>
  );
}
