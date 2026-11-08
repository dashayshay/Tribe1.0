import React from 'react';
import { Calendar, Check, Clock, MapPin, Sparkles, Users, Zap, Award, Crown } from 'lucide-react';
import { useTribe } from '../state/TribeContext.jsx';
import { formatWhen } from '../lib/time.js';
import { getPerson } from '../data/people.js';
import { Avatar, Cover } from './ui.jsx';
import { track } from '../lib/analytics.js';

export function hostLabel(event) {
  const host = getPerson(event.hostId);
  const co = event.coHostId ? getPerson(event.coHostId) : null;
  return co ? `${host?.name} & ${co.name}` : host?.name ?? 'Tribe host';
}

export function ctaFor(event) {
  if (event.isHosting) return { label: 'Hosting', tone: 'hosting' };
  if (event.isBooked) return { label: event.price ? 'Ticket claimed' : 'Chair claimed', tone: 'booked' };
  if (event.spotsLeft <= 0) return { label: 'Full', tone: 'full' };
  return { label: event.price ? `Book · $${event.price}` : 'Claim chair', tone: event.price ? 'paid' : 'free' };
}

const CTA_TONES = {
  hosting: 'bg-purple-950 text-purple-200 border border-purple-700/80',
  booked: 'bg-emerald-950 text-emerald-300 border border-emerald-700/80 hover:bg-emerald-900',
  full: 'bg-stone-800 text-stone-500 border border-stone-700',
  free: 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30',
  paid: 'bg-orange-500 hover:bg-orange-400 text-white shadow-md shadow-orange-500/30',
};

function useOpenEvent() {
  const { open } = useTribe();
  return (event) => {
    track('event_open', { id: event.id, sponsored: event.type === 'Sponsored' });
    open('event', { id: event.id });
  };
}

function cardKeys(handler) {
  return {
    role: 'button',
    tabIndex: 0,
    onClick: handler,
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handler();
      }
    },
  };
}

export function EventCard({ event }) {
  const { toggleBooking } = useTribe();
  const openEvent = useOpenEvent();
  const cta = ctaFor(event);
  const host = getPerson(event.hostId);
  const co = event.coHostId ? getPerson(event.coHostId) : null;

  return (
    <article
      {...cardKeys(() => openEvent(event))}
      aria-label={event.title}
      className="group bg-stone-900 border border-stone-800/90 hover:border-stone-700 rounded-3xl overflow-hidden shadow-lg transition-all cursor-pointer active:scale-[0.99] animate-rise-in"
    >
      <div className="relative h-44 w-full overflow-hidden bg-stone-950">
        <Cover src={event.image} alt="" className="w-full h-full group-hover:scale-105 transition-transform duration-500 opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />

        <div className="absolute top-3 left-3 flex gap-1.5 items-center">
          {event.type === 'Sponsored' ? (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/90 text-stone-950 flex items-center gap-1 shadow-md shadow-amber-500/30">
              <Sparkles size={11} /> Curated
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-900/90 text-teal-200 border border-teal-700/60 flex items-center gap-1 backdrop-blur-sm">
              <Users size={11} /> Squad Hangout
            </span>
          )}
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-stone-950/80 text-stone-300 border border-stone-700/60 backdrop-blur-sm">
            {event.category}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-tight flex items-center gap-1 backdrop-blur-md shadow-md ${
              event.spotsLeft <= 2
                ? 'bg-rose-950/90 text-rose-300 border border-rose-800'
                : 'bg-stone-900/80 text-stone-200 border border-stone-700/70'
            }`}
          >
            <Clock size={11} />
            {event.spotsLeft === 0 ? 'Full' : `${event.spotsLeft} ${event.spotsLeft === 1 ? 'chair' : 'chairs'} left`}
          </span>
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
          <p className="text-[11px] font-semibold text-orange-400 flex items-center gap-1">
            <Calendar size={11} /> {formatWhen(event.startsAt)}
          </p>
          <span
            className={`text-sm font-black px-2 py-0.5 rounded-lg ${
              event.price === 0
                ? 'text-emerald-400 bg-emerald-950/80 border border-emerald-800/60'
                : 'text-amber-300 bg-stone-950/80 border border-amber-500/40'
            }`}
          >
            {event.price === 0 ? 'FREE' : `$${event.price}`}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-sm text-white group-hover:text-orange-400 transition-colors leading-snug">{event.title}</h3>
          <p className="text-[11px] text-stone-400 flex items-center gap-1.5 mt-1">
            <MapPin size={11} className="text-stone-500 shrink-0" />
            <span className="truncate">{event.location}</span>
          </p>
        </div>

        {event.perk && (
          <div className="bg-amber-950/40 border border-amber-700/40 rounded-xl px-2.5 py-1 flex items-center gap-2">
            <Zap size={12} className="text-amber-400 shrink-0" />
            <span className="text-[10px] font-semibold text-amber-200 truncate">Perk: {event.perk}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-stone-800/80 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex -space-x-1.5">
              <Avatar person={host} size="xs" className="ring-2 ring-stone-900" />
              {co && <Avatar person={co} size="xs" className="ring-2 ring-stone-900" />}
            </div>
            <span className="text-[11px] text-stone-300 font-medium truncate">{hostLabel(event)}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleBooking(event);
            }}
            disabled={cta.tone === 'full'}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shrink-0 ${CTA_TONES[cta.tone]}`}
          >
            {(cta.tone === 'booked' || cta.tone === 'hosting') && (cta.tone === 'hosting' ? <Crown size={12} /> : <Check size={12} />)}
            {cta.label}
          </button>
        </div>
      </div>
    </article>
  );
}

/** Larger amber card used on the Exclusive tab (variant A). */
export function SponsoredCard({ event }) {
  const { toggleBooking } = useTribe();
  const openEvent = useOpenEvent();
  const host = getPerson(event.hostId);
  return (
    <article
      {...cardKeys(() => openEvent(event))}
      aria-label={event.title}
      className="bg-stone-900 border border-amber-500/30 hover:border-amber-500/60 rounded-3xl overflow-hidden shadow-xl transition-all cursor-pointer group animate-rise-in"
    >
      <div className="relative h-40 w-full overflow-hidden">
        <Cover src={event.image} alt="" className="w-full h-full group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent" />
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-stone-950 flex items-center gap-1 shadow-md">
          <Award size={12} /> {event.category}
        </span>
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-xs">
          <span className="font-bold text-white bg-stone-950/80 backdrop-blur px-2.5 py-1 rounded-lg border border-stone-800">
            {formatWhen(event.startsAt)}
          </span>
          <span className="font-black text-amber-300 bg-stone-950/80 backdrop-blur px-2.5 py-1 rounded-lg border border-amber-500/40">
            {event.price ? `$${event.price}` : 'FREE'}
          </span>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">{event.title}</h4>
          <p className="text-[11px] text-stone-400 flex items-center gap-1 mt-1">
            <MapPin size={11} className="text-stone-500" /> {event.location}
          </p>
        </div>
        {event.perk && (
          <div className="bg-amber-950/30 border border-amber-600/30 rounded-2xl p-2.5 flex items-start gap-2">
            <Sparkles size={14} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-wide text-amber-400 block">Attendee perk</span>
              <span className="text-xs text-stone-200 font-medium">{event.perk}</span>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between pt-1 gap-2">
          <span className="text-[11px] text-stone-400 font-medium flex items-center gap-1.5 min-w-0">
            <Avatar person={host} size="xs" />
            <span className="truncate">{host?.name}</span>
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleBooking(event);
            }}
            disabled={!event.isBooked && event.spotsLeft === 0}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              event.isBooked
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                : event.spotsLeft === 0
                  ? 'bg-stone-800 text-stone-500'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-black shadow-md shadow-amber-500/20 hover:brightness-110'
            }`}
          >
            {event.isBooked ? 'Ticket claimed ✓' : event.spotsLeft === 0 ? 'Full' : `Claim spot${event.price ? ` · $${event.price}` : ''}`}
          </button>
        </div>
      </div>
    </article>
  );
}

/** Compact horizontal card for the variant-B partner rail in Explore. */
export function RailCard({ event }) {
  const openEvent = useOpenEvent();
  return (
    <article
      {...cardKeys(() => openEvent(event))}
      aria-label={event.title}
      className="w-56 shrink-0 bg-stone-900 border border-amber-500/30 rounded-2xl overflow-hidden cursor-pointer hover:border-amber-500/60 transition-all"
    >
      <div className="relative h-24">
        <Cover src={event.image} alt="" className="w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 to-transparent" />
        <span className="absolute bottom-2 left-2 text-[10px] font-black text-amber-300 bg-stone-950/80 px-2 py-0.5 rounded-md border border-amber-500/40">
          {event.price ? `$${event.price}` : 'FREE'}
        </span>
        {event.isBooked && (
          <span className="absolute top-2 right-2 text-[10px] font-black text-emerald-300 bg-emerald-950/90 px-2 py-0.5 rounded-md border border-emerald-700">
            Claimed ✓
          </span>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-xs font-bold text-white leading-snug line-clamp-1">{event.title}</p>
        {event.perk && <p className="text-[10px] text-amber-200/90 mt-0.5 line-clamp-1">✦ {event.perk}</p>}
      </div>
    </article>
  );
}
