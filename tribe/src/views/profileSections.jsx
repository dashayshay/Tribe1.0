import React from 'react';
import { ShieldCheck, CheckCircle2, Star, Ticket, MessageSquareHeart, Crown, Calendar, Plus, AlertCircle } from 'lucide-react';
import { useTribe } from '../state/TribeContext.jsx';
import { PROFILE_STATS, TONES } from '../data/content.js';
import { NICHES, getPerson } from '../data/people.js';
import { Avatar, SectionCard, Icon } from '../components/ui.jsx';
import { formatWhen, relativeDay, hoursUntil } from '../lib/time.js';

export function IdentityCard() {
  const { me, state, vibes, open } = useTribe();
  const jams = PROFILE_STATS.jamsJoined + state.feedbackDone.length;
  const showRate = Math.round((PROFILE_STATS.attended / PROFILE_STATS.committed) * 100);

  return (
    <div className="bg-gradient-to-b from-stone-800/90 to-stone-900 border border-stone-800 rounded-3xl p-5 text-center shadow-xl">
      <div className="w-20 h-20 rounded-full mx-auto p-1 bg-gradient-to-tr from-purple-500 via-orange-500 to-amber-500 shadow-xl shadow-purple-500/20">
        <Avatar person={me} size="xl" className="w-full h-full border-2 border-stone-900" />
      </div>
      <div className="mt-3 flex items-center justify-center gap-1.5">
        <h2 className="font-display font-extrabold text-lg text-white">{me.name}</h2>
        {state.verified && <ShieldCheck size={18} className="text-emerald-400" aria-label="Verified" />}
      </div>
      <p className="text-xs text-purple-300 font-medium">{me.role}</p>

      {state.verified ? (
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-700/60 text-emerald-300 text-[10px] font-bold">
          <CheckCircle2 size={11} /> Gov ID & background verified
        </div>
      ) : (
        <button
          onClick={() => open('onboarding', { step: 2 })}
          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/70 border border-amber-700/60 text-amber-300 text-[10px] font-bold"
        >
          <AlertCircle size={11} /> Finish verification to claim chairs
        </button>
      )}

      <dl className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-stone-800">
        <div>
          <dd className="text-base font-black text-orange-400">{jams}</dd>
          <dt className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Jams joined</dt>
        </div>
        <div>
          <dd className="text-base font-black text-emerald-400">{showRate}%</dd>
          <dt className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Show rate</dt>
        </div>
        <div>
          <dd className="text-base font-black text-purple-400">{vibes.reviews}</dd>
          <dt className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Vibe reviews</dt>
        </div>
      </dl>
    </div>
  );
}

export function PendingFeedback() {
  const { pastHangouts, state, open } = useTribe();
  const pending = pastHangouts.filter((p) => !state.feedbackDone.includes(p.id));
  if (!pending.length) return null;
  return pending.map((p) => (
    <div
      key={p.id}
      className="bg-gradient-to-br from-purple-950/80 via-stone-900 to-stone-900 border border-purple-500/50 rounded-3xl p-4 flex items-center gap-3 shadow-lg animate-rise-in"
    >
      <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
        <MessageSquareHeart size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white leading-tight">How was {p.title}?</p>
        <p className="text-[11px] text-stone-400">
          {relativeDay(p.startsAt)} · your squad’s vibes for you unlock when you send yours
        </p>
      </div>
      <button
        onClick={() => open('feedback', { pastId: p.id })}
        className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shrink-0"
      >
        Leave vibes
      </button>
    </div>
  ));
}

export function VibeCloud() {
  const { vibes } = useTribe();
  return (
    <SectionCard
      icon={Star}
      iconClass="text-amber-400 fill-amber-400"
      title="Verified Vibe Cloud"
      subtitle="Anonymous, positive-only feedback from people you actually met"
      action={
        <span className="text-[10px] bg-stone-800 text-stone-400 px-2 py-0.5 rounded-full font-mono shrink-0">
          {vibes.reviews} reviews
        </span>
      }
    >
      <div className="flex flex-wrap gap-2 pt-1">
        {vibes.tags.map((t) => (
          <span
            key={t.word}
            className={`px-3 py-1 rounded-xl border font-bold transition-all ${TONES[t.tone]} ${
              t.pct >= 90 ? 'text-sm' : t.pct >= 65 ? 'text-xs' : 'text-[11px]'
            }`}
          >
            {t.word} <span className="opacity-70 text-[10px] tabular-nums">{t.pct}%</span>
          </span>
        ))}
      </div>
    </SectionCard>
  );
}

export function ReservedSpots() {
  const { events, toggleBooking, open, goTo } = useTribe();
  const upcoming = events
    .filter((e) => e.isBooked || e.isHosting)
    .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));

  return (
    <SectionCard
      icon={Ticket}
      iconClass="text-orange-400"
      title="Reserved Chairs"
      subtitle="Release 24h+ ahead to keep your show rate clean"
    >
      {upcoming.length === 0 ? (
        <div className="text-center py-3 space-y-2">
          <p className="text-xs text-stone-400">No chairs reserved yet.</p>
          <button onClick={() => goTo('explore')} className="text-xs font-bold text-orange-400 hover:underline">
            Find a squad
          </button>
        </div>
      ) : (
        <ul className="space-y-2">
          {upcoming.map((e) => {
            const late = hoursUntil(e.startsAt) < 24;
            const host = getPerson(e.hostId);
            return (
              <li key={e.id} className="flex items-center gap-3 p-2.5 rounded-2xl bg-stone-950/60 border border-stone-800">
                <button onClick={() => open('event', { id: e.id })} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                  <Avatar person={host} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{e.title}</p>
                    <p className="text-[10px] text-stone-400 flex items-center gap-1">
                      <Calendar size={10} className="text-orange-400" /> {formatWhen(e.startsAt)}
                    </p>
                  </div>
                </button>
                {e.isHosting ? (
                  <span className="text-[10px] font-bold text-purple-200 bg-purple-950 border border-purple-700/70 px-2 py-1 rounded-lg flex items-center gap-1 shrink-0">
                    <Crown size={11} /> Hosting
                  </span>
                ) : (
                  <label className="flex items-center gap-2 shrink-0 cursor-pointer">
                    <span className={`text-[10px] font-bold ${late ? 'text-amber-400' : 'text-stone-400'}`}>
                      {late ? 'Late' : 'Held'}
                    </span>
                    <span className="relative inline-flex">
                      <input
                        type="checkbox"
                        checked
                        onChange={() => toggleBooking(e)}
                        className="peer sr-only"
                        aria-label={`Release chair for ${e.title}`}
                      />
                      <span className="w-9 h-5 rounded-full bg-emerald-600 peer-focus-visible:ring-2 peer-focus-visible:ring-orange-500" />
                      <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white shadow" />
                    </span>
                  </label>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}

export function NicheList() {
  const { state, open } = useTribe();
  return (
    <SectionCard
      title="Active Niches"
      action={
        <button onClick={() => open('niches')} className="text-orange-400 text-xs font-bold hover:underline flex items-center gap-0.5">
          <Plus size={12} /> Edit
        </button>
      }
    >
      <div className="flex flex-wrap gap-2">
        {state.niches.map((label) => {
          const n = NICHES.find((x) => x.label === label);
          return (
            <span
              key={label}
              className="px-3 py-1.5 rounded-2xl bg-teal-950/40 border border-teal-800/60 text-xs text-teal-100 font-medium flex items-center gap-1.5"
            >
              <Icon name={n?.icon} size={12} className="text-teal-400" />
              {label}
            </span>
          );
        })}
      </div>
    </SectionCard>
  );
}
