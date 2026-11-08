import React, { useState } from 'react';
import { Activity, Lightbulb, ChevronRight, Award, Zap, CalendarClock, ShieldCheck, Send, Check, Radio } from 'lucide-react';
import { useTribe } from '../state/TribeContext.jsx';
import { CONNECTORS, HOST_BASE } from '../data/content.js';
import { getPerson } from '../data/people.js';
import { relativeDay } from '../lib/time.js';
import { Avatar, SectionCard, inputClass } from '../components/ui.jsx';

function genieIdeas(niche) {
  const n = niche.trim() || 'Your Studio';
  return [
    {
      title: `${n} Soundboard & Jam`,
      pitch: 'Bring 8 practitioners together for micro-sprints and peer reviews. Coffee on the house.',
      fit: '8–12 verified locals',
    },
    {
      title: `Off-the-Record: ${n} Unplugged`,
      pitch: 'A candid breakdown of how top local studios are handling industry shifts. Premium ticket.',
      fit: '15 ticketed spots',
    },
  ];
}

export default function HostHubView() {
  const { events, slots, state, open, dispatch, toast } = useTribe();
  const [niche, setNiche] = useState('Ceramics & Coffee');
  const [ideas, setIdeas] = useState(() => [
    {
      title: 'Raku & Roast: Wheel-Throwing + Roaster Tasting',
      pitch: 'Pair 6 ceramicists with a local roaster. Throw your own espresso cup, then taste single-origin brews.',
      fit: '8–10 high-intent makers',
    },
    {
      title: 'Tactile Typography in Clay',
      pitch: 'Letterpress designers carve movable clay stamps — printmakers meet the pottery studio.',
      fit: '12 verified creatives',
    },
  ]);
  const [sparking, setSparking] = useState(false);

  const hostEvents = events.filter((e) => e.hostId === 'studios');
  const extraBookings = hostEvents.reduce((s, e) => s + e.takenByOthers, 0);
  const extraGmv = hostEvents.reduce((s, e) => s + e.takenByOthers * e.price, 0);

  const spark = () => {
    if (!niche.trim()) {
      toast('Tell the Genie what your space has first.');
      return;
    }
    setSparking(true);
    setTimeout(() => {
      setIdeas(genieIdeas(niche));
      setSparking(false);
      toast('2 fresh concepts tailored to your space.');
    }, 700);
  };

  return (
    <div className="flex-1 overflow-y-auto px-5 pt-3 pb-28 space-y-4">
      <div className="bg-gradient-to-br from-purple-950/60 via-stone-900 to-stone-900 border border-purple-600/40 rounded-3xl p-5 shadow-xl">
        <div className="flex justify-between items-start">
          <div>
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-900/90 text-purple-200 border border-purple-700/60">
              Host Partner Hub
            </span>
            <h2 className="font-display text-xl font-extrabold text-white mt-2 leading-tight">Arts District Studios</h2>
            <p className="text-xs text-stone-400">Co-working & event space · Los Angeles</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/40 flex items-center justify-center shrink-0">
            <Activity size={20} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <Metric label="Niche reach" value={HOST_BASE.reach.toLocaleString()} delta="+18%" note="Verified creatives within 5 mi" />
          <Metric label="Ticket GMV" value={`$${(HOST_BASE.gmv + extraGmv).toLocaleString()}`} valueClass="text-amber-400" delta="+12%" note="This month" />
          <Metric label="Squad bookings" value={HOST_BASE.bookings + extraBookings} valueClass="text-purple-300" note="Across all rooms" />
          <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-2xl p-3">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1">
              <ShieldCheck size={11} /> No-shows
            </span>
            <span className="block text-xl font-black text-emerald-300 mt-0.5">0</span>
            <span className="text-[10px] text-stone-400">Show-rate screening works</span>
          </div>
        </div>
      </div>

      <SectionCard icon={CalendarClock} iconClass="text-orange-400" title="Off-peak slots" subtitle="Rooms that usually sit empty — fill them with a curated squad">
        <ul className="space-y-2">
          {slots.map((slot) => {
            const eventId = state.publishedSlots[slot.id];
            const live = eventId ? events.find((e) => e.id === eventId) : null;
            return (
              <li key={slot.id} className="p-3 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="text-xs font-bold text-white">{slot.room}</p>
                    <p className="text-[11px] text-stone-400">
                      {relativeDay(slot.startsAt)} · {slot.window}
                    </p>
                  </div>
                  {live ? (
                    <button
                      onClick={() => open('event', { id: live.id })}
                      className="text-[10px] font-black text-emerald-300 bg-emerald-950 border border-emerald-700 px-2 py-1 rounded-lg flex items-center gap-1"
                    >
                      <Radio size={11} /> Live · {live.takenByOthers}/{live.spotsTotal}
                    </button>
                  ) : (
                    <button
                      onClick={() => open('publishSlot', { slotId: slot.id })}
                      className="text-[11px] font-bold text-white bg-orange-500 hover:bg-orange-400 px-3 py-1.5 rounded-xl"
                    >
                      Fill slot
                    </button>
                  )}
                </div>
                <div>
                  <div className="h-1.5 rounded-full bg-stone-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${live ? 'bg-emerald-500' : 'bg-amber-500/80'}`}
                      style={{ width: `${live ? Math.round((live.takenByOthers / live.spotsTotal) * 100) : slot.usualFill}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1">
                    {live ? 'Booked via Tribe' : `Usually ${slot.usualFill}% booked at this time`}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </SectionCard>

      <section className="bg-gradient-to-b from-stone-900 to-stone-950 border border-purple-500/40 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <Lightbulb size={18} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white">Event Genie</h3>
            <p className="text-[11px] text-stone-400">High-demand concepts for your empty slots</p>
          </div>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="genie-niche" className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
            Your space / equipment
          </label>
          <div className="flex gap-2">
            <input
              id="genie-niche"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && spark()}
              placeholder="e.g. Risograph studio, darkroom"
              className={`${inputClass} focus:border-purple-500 flex-1`}
            />
            <button
              onClick={spark}
              disabled={sparking}
              className="px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold shadow-md shadow-purple-600/30 flex items-center gap-1 shrink-0 disabled:opacity-70"
            >
              {sparking ? <Zap size={13} className="animate-pulse" /> : 'Spark'}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {ideas.map((idea) => (
            <div key={idea.title} className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3 space-y-1.5 animate-rise-in">
              <div className="flex justify-between items-start gap-2">
                <h4 className="font-bold text-xs text-white">{idea.title}</h4>
                <span className="text-[9px] bg-purple-950 text-purple-300 font-bold px-2 py-0.5 rounded-full border border-purple-800/60 shrink-0">
                  {idea.fit}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 leading-relaxed">{idea.pitch}</p>
              <button
                onClick={() => open('publishSlot', { draft: { title: idea.title, pitch: idea.pitch } })}
                className="text-[11px] font-bold text-orange-400 hover:text-orange-300 inline-flex items-center gap-1 pt-1"
              >
                Publish into an open slot <ChevronRight size={12} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <SectionCard
        icon={Award}
        iconClass="text-amber-400"
        title="Top Niche Connectors"
        subtitle="Squad leads who reliably fill rooms with the right people"
      >
        <ul className="space-y-2.5">
          {CONNECTORS.map((c, i) => {
            const p = getPerson(c.personId);
            const invited = state.invitedConnectors.includes(c.personId);
            return (
              <li key={c.personId} className="flex items-center justify-between p-2 rounded-2xl bg-stone-950/50 border border-stone-800/80 gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xs font-black text-stone-500 w-5">#{i + 1}</span>
                  <Avatar person={p} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                      {p.name}
                      {c.personId === 'me' && (
                        <span className="text-[9px] px-1.5 rounded bg-orange-500/20 text-orange-300">You</span>
                      )}
                    </p>
                    <p className="text-[10px] text-stone-400 truncate">{c.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-extrabold text-purple-300 bg-purple-950/60 border border-purple-800/60 px-2 py-1 rounded-xl">
                    {c.score} impact
                  </span>
                  {c.personId !== 'me' && (
                    <button
                      disabled={invited}
                      onClick={() => {
                        dispatch({ type: 'INVITE_CONNECTOR', personId: c.personId });
                        toast(`Invite sent — ${p.name} can accept from their Host requests.`);
                      }}
                      aria-label={invited ? `${p.name} invited` : `Invite ${p.name} to host`}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        invited ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-purple-600 hover:bg-purple-500 text-white'
                      }`}
                    >
                      {invited ? <Check size={14} /> : <Send size={13} />}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </SectionCard>
    </div>
  );
}

function Metric({ label, value, delta, note, valueClass = 'text-white' }) {
  return (
    <div className="bg-stone-950/70 border border-stone-800/80 rounded-2xl p-3">
      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">{label}</span>
      <div className="flex items-baseline gap-1.5 mt-0.5">
        <span className={`text-xl font-black ${valueClass}`}>{value}</span>
        {delta && <span className="text-[10px] font-bold text-emerald-400">{delta}</span>}
      </div>
      <span className="text-[10px] text-stone-500">{note}</span>
    </div>
  );
}
