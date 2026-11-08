import React, { useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { useTribe } from '../state/TribeContext.jsx';
import { CONNECTORS, coverFor } from '../data/content.js';
import { getPerson } from '../data/people.js';
import { relativeDay } from '../lib/time.js';
import { Avatar, Sheet, FieldLabel, inputClass, Stepper, PrimaryButton } from '../components/ui.jsx';
import { track } from '../lib/analytics.js';

/**
 * B2B yield flow: a venue turns an empty off-peak slot into a curated,
 * ticketed squad event, optionally led by a Top Connector.
 */
export default function PublishSlotSheet({ slotId, draft }) {
  const { slots, state, dispatch, close, toast } = useTribe();
  const openSlots = slots.filter((s) => !state.publishedSlots[s.id]);
  const [chosen, setChosen] = useState(slotId ?? openSlots[0]?.id ?? null);
  const slot = slots.find((s) => s.id === chosen);

  const [title, setTitle] = useState(draft?.title ?? slot?.suggestion ?? '');
  const [pitch, setPitch] = useState(draft?.pitch ?? '');
  const [spots, setSpots] = useState(10);
  const [price, setPrice] = useState(20);
  const [perk, setPerk] = useState('Studio time + materials included');
  const [lead, setLead] = useState(null);

  const pickSlot = (id) => {
    setChosen(id);
    if (!draft) setTitle(slots.find((s) => s.id === id)?.suggestion ?? '');
  };

  if (!openSlots.length) {
    return (
      <Sheet title="Fill an off-peak slot" icon={CalendarClock} onClose={close}>
        <p className="p-6 text-sm text-stone-400 text-center">Every open slot is already live. Nice work.</p>
      </Sheet>
    );
  }

  const publish = () => {
    if (!slot || !title.trim()) {
      toast('Pick a slot and give it a title.');
      return;
    }
    const leader = lead ? getPerson(lead) : null;
    const event = {
      id: Date.now(),
      title: title.trim(),
      hostId: 'studios',
      type: 'Sponsored',
      image: coverFor(slot.category),
      startsAt: slot.startsAt,
      location: `Arts District Studios · ${slot.room}`,
      price,
      spotsTotal: spots,
      takenByOthers: 0,
      category: slot.category,
      perk: perk.trim() || null,
      description:
        (pitch.trim() || `A curated small-squad session in our ${slot.room}.`) +
        (leader ? ` Led by ${leader.name}, one of our Top Niche Connectors.` : ''),
      attendeeIds: lead ? [lead] : [],
    };
    dispatch({ type: 'CREATE_EVENT', event, bookForMe: false });
    dispatch({ type: 'PUBLISH_SLOT', slotId: slot.id, eventId: event.id });
    track('host_publish', { slot: slot.id, price, spots, withLead: Boolean(lead) });
    close();
    toast(`${slot.room} is live to ${slot.category} creatives nearby.`);
    // Simulated demand so the host sees the slot start filling.
    setTimeout(() => {
      dispatch({ type: 'BUMP_TAKEN', id: event.id, n: 3 });
      toast(`3 verified creatives just booked “${event.title.slice(0, 28)}”.`);
    }, 2800);
  };

  return (
    <Sheet title="Fill an off-peak slot" subtitle="Publish a curated squad event" icon={CalendarClock} onClose={close}>
      <div className="p-5 space-y-4">
        <div>
          <FieldLabel>Slot</FieldLabel>
          <div className="space-y-1.5">
            {openSlots.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => pickSlot(s.id)}
                aria-pressed={chosen === s.id}
                className={`w-full flex justify-between items-center px-3 py-2.5 rounded-2xl border text-left transition-all ${
                  chosen === s.id ? 'bg-orange-950/50 border-orange-500 text-white' : 'bg-stone-950 border-stone-800 text-stone-400'
                }`}
              >
                <span className="text-xs font-bold">{s.room}</span>
                <span className="text-[11px]">
                  {relativeDay(s.startsAt)} · {s.window}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel htmlFor="ps-title">Event title</FieldLabel>
          <input id="ps-title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
        </div>
        <div>
          <FieldLabel htmlFor="ps-pitch">Pitch</FieldLabel>
          <textarea
            id="ps-pitch"
            rows={2}
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            placeholder="What will the squad make or learn?"
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Capacity</FieldLabel>
            <Stepper label="capacity" value={spots} onChange={setSpots} min={4} max={15} />
          </div>
          <div>
            <FieldLabel>Ticket</FieldLabel>
            <Stepper label="ticket price" value={price} onChange={setPrice} min={0} max={80} step={5} format={(v) => (v ? `$${v}` : 'Free')} />
          </div>
        </div>

        <div>
          <FieldLabel htmlFor="ps-perk">Attendee perk</FieldLabel>
          <input id="ps-perk" value={perk} onChange={(e) => setPerk(e.target.value)} className={`${inputClass} focus:border-amber-500`} />
        </div>

        <div>
          <FieldLabel>Squad lead (optional)</FieldLabel>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setLead(null)}
              className={`shrink-0 px-3 py-2 rounded-2xl border text-xs font-bold ${lead === null ? 'bg-stone-800 border-stone-600 text-white' : 'bg-stone-950 border-stone-800 text-stone-500'}`}
            >
              None
            </button>
            {CONNECTORS.filter((c) => c.personId !== 'me').map((c) => {
              const p = getPerson(c.personId);
              return (
                <button
                  key={c.personId}
                  type="button"
                  onClick={() => setLead(c.personId)}
                  aria-pressed={lead === c.personId}
                  className={`shrink-0 pl-1.5 pr-3 py-1.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 ${
                    lead === c.personId ? 'bg-purple-950/70 border-purple-500 text-purple-100' : 'bg-stone-950 border-stone-800 text-stone-400'
                  }`}
                >
                  <Avatar person={p} size="xs" className="w-6 h-6" /> {p.name}
                </button>
              );
            })}
          </div>
        </div>

        <PrimaryButton onClick={publish}>Publish to verified creatives</PrimaryButton>
      </div>
    </Sheet>
  );
}
