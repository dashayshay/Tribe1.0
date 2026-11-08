import React, { useEffect, useRef } from 'react';
import { ArrowLeft, Calendar, MapPin, Users, Sparkles, Zap, Check, Crown, ShieldCheck } from 'lucide-react';
import { useTribe } from '../state/TribeContext.jsx';
import { ICEBREAKERS } from '../data/content.js';
import { getPerson } from '../data/people.js';
import { formatWhen } from '../lib/time.js';
import { Avatar, Cover } from '../components/ui.jsx';
import { hostLabel } from '../components/EventCard.jsx';

/**
 * Full-screen event detail. Reads the event by id from live state on every
 * render — the original stored a copy, so spot counts went stale after RSVP.
 */
export default function EventDetail({ id }) {
  const { getEvent, close, toggleBooking, me } = useTribe();
  const event = getEvent(id);
  const backRef = useRef(null);

  useEffect(() => {
    backRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  if (!event) return null;

  const attendees = [
    ...(event.isBooked && !event.isHosting ? [me] : []),
    ...event.attendeeIds.map(getPerson).filter(Boolean),
  ];
  const host = getPerson(event.hostId);
  const co = event.coHostId ? getPerson(event.coHostId) : null;
  const icebreakers = ICEBREAKERS[event.category] ?? ICEBREAKERS['UX/Design'];

  let cta;
  if (event.isHosting) cta = { label: "You're hosting", icon: Crown, cls: 'bg-purple-950 text-purple-200 border border-purple-600' };
  else if (event.isBooked) cta = { label: event.price ? 'Ticket claimed' : 'Chair claimed', icon: Check, cls: 'bg-emerald-950 text-emerald-300 border border-emerald-600 hover:bg-emerald-900' };
  else if (event.spotsLeft === 0) cta = { label: 'Squad full', icon: Users, cls: 'bg-stone-800 text-stone-500' };
  else cta = { label: event.price ? 'Secure ticket' : 'Claim empty chair', icon: Users, cls: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-500/30 hover:brightness-110' };
  const CtaIcon = cta.icon;

  return (
    <div role="dialog" aria-modal="true" aria-label={event.title} className="absolute inset-0 bg-stone-950 z-50 flex flex-col animate-slide-up">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="relative h-64 w-full shrink-0">
          <Cover src={event.image} alt="" className="w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-black/60" />
          <button
            ref={backRef}
            onClick={close}
            aria-label="Back"
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-stone-900/80 backdrop-blur-md border border-stone-700/80 text-white flex items-center justify-center hover:bg-stone-800 shadow-lg"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold bg-stone-900/80 backdrop-blur-md border border-stone-700 text-stone-200">
            {event.category}
          </span>
          <div className="absolute bottom-4 left-5 right-5">
            <span className={`text-xs font-bold uppercase tracking-wider block mb-1 ${event.type === 'Sponsored' ? 'text-amber-400' : 'text-teal-300'}`}>
              {event.type === 'Sponsored' ? 'Curated sponsor event' : 'Squad hangout'}
            </span>
            <h2 className="font-display text-2xl font-extrabold text-white leading-tight">{event.title}</h2>
          </div>
        </div>

        <div className="p-5 space-y-5 pb-8">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-2.5">
            <Row icon={Calendar}>{formatWhen(event.startsAt)}</Row>
            <Row icon={MapPin}>{event.location}</Row>
            <Row icon={Users}>
              {event.spotsLeft} of {event.spotsTotal} chairs open
            </Row>
            <div className="flex items-center gap-2.5 text-xs text-stone-300 font-medium pt-1">
              <div className="flex -space-x-1.5">
                <Avatar person={host} size="xs" className="ring-2 ring-stone-900" />
                {co && <Avatar person={co} size="xs" className="ring-2 ring-stone-900" />}
              </div>
              <span>Hosted by {hostLabel(event)}</span>
            </div>
          </div>

          {event.perk && (
            <div className="bg-gradient-to-r from-amber-950/60 to-stone-900 border border-amber-600/40 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Sparkles size={16} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">Perk included</span>
                <span className="text-xs font-medium text-stone-100">{event.perk}</span>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">About this session</h3>
            <p className="text-[13px] text-stone-300 leading-relaxed">{event.description}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-950/70 via-stone-900 to-stone-900 border border-purple-500/40 rounded-3xl p-4 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-purple-300 fill-purple-300" />
                <span className="text-xs font-extrabold text-white">Squad Icebreakers</span>
              </div>
              <span className="text-[9px] bg-purple-900/80 text-purple-200 border border-purple-700 px-2 py-0.5 rounded-full font-bold">
                Tribe Prep
              </span>
            </div>
            <p className="text-[11px] text-stone-300">Showing up solo? Three openers that work with this crowd:</p>
            <ol className="space-y-2 pt-1">
              {icebreakers.map((q, i) => (
                <li key={q} className="bg-stone-950/70 border border-stone-800/80 p-2.5 rounded-xl flex items-start gap-2">
                  <span className="text-[10px] font-black text-purple-400 shrink-0 mt-0.5">0{i + 1}</span>
                  <p className="text-[12px] text-stone-200 italic leading-snug">“{q}”</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">Confirmed creatives</h3>
            <ul className="space-y-2">
              {attendees.map((a) => (
                <li key={a.id} className="flex items-center justify-between p-2 rounded-2xl bg-stone-900 border border-stone-800">
                  <div className="flex items-center gap-2.5">
                    <Avatar person={a} size="sm" />
                    <div>
                      <p className="text-xs font-bold text-white">{a.id === 'me' ? 'You' : a.name}</p>
                      <p className="text-[10px] text-stone-400">{a.role}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck size={10} /> Verified
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-stone-900/95 backdrop-blur-md border-t border-stone-800 p-4 px-5 flex items-center justify-between shrink-0">
        <div>
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Commitment</span>
          <span className="text-xl font-black text-white">{event.price === 0 ? 'Free' : `$${event.price}`}</span>
        </div>
        <button
          onClick={() => toggleBooking(event)}
          disabled={!event.isBooked && !event.isHosting && event.spotsLeft === 0}
          className={`px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 flex items-center gap-2 ${cta.cls}`}
        >
          <CtaIcon size={16} /> {cta.label}
        </button>
      </div>
    </div>
  );
}

function Row({ icon: I, children }) {
  return (
    <div className="flex items-center gap-2.5 text-xs text-stone-300 font-medium">
      <I size={15} className="text-orange-400 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
