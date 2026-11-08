import React, { useEffect, useRef, useState } from 'react';
import { Handshake, LoaderCircle, Check } from 'lucide-react';
import { useTribe } from '../state/TribeContext.jsx';
import { getPerson, sharedNiches, NICHES } from '../data/people.js';
import { coverFor } from '../data/content.js';
import { Avatar, Sheet, FieldLabel, inputClass, Stepper, WhenPicker, whenToIso, PrimaryButton, NicheTag } from '../components/ui.jsx';
import { track } from '../lib/analytics.js';

/** Propose a co-hosted hangout to someone in your orbit. */
export default function CoHostSheet({ personId }) {
  const { state, me, dispatch, close, toast, goTo } = useTribe();
  const person = getPerson(personId);
  const shared = person ? sharedNiches(person, state.niches) : [];
  const category = NICHES.find((n) => n.label === (shared[0] ?? person?.niches[0]))?.category ?? 'UX/Design';
  const suggested = shared.length >= 2 ? `${shared[0]} × ${shared[1]} Jam` : `${shared[0] ?? person?.niches[0] ?? 'Creative'} Session`;

  const [title, setTitle] = useState(suggested);
  const [location, setLocation] = useState('');
  const [when, setWhen] = useState({ offset: 5, h: 11, m: 0 });
  const [spots, setSpots] = useState(6);
  const [phase, setPhase] = useState('edit'); // edit | waiting | accepted
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  if (!person) return null;

  const send = () => {
    setPhase('waiting');
    track('cohost_sent', { person: personId });
    timer.current = setTimeout(() => {
      const event = {
        id: Date.now(),
        title: title.trim() || suggested,
        hostId: 'me',
        coHostId: personId,
        type: 'Community',
        image: coverFor(category),
        startsAt: whenToIso(when),
        location: location.trim() || 'Arts District Studios, Lounge',
        price: 0,
        spotsTotal: spots,
        takenByOthers: 1, // the co-host holds a chair
        category,
        perk: null,
        description: `Co-hosted by ${me.name} and ${person.name}. Bring something you're working on in ${shared.join(' or ') || category}.`,
        attendeeIds: [personId],
      };
      dispatch({ type: 'CREATE_EVENT', event, bookForMe: true });
      setPhase('accepted');
    }, 1600);
  };

  return (
    <Sheet title={`Co-host with ${person.name}`} subtitle="Two hosts, one small squad" icon={Handshake} onClose={close}>
      {phase === 'edit' && (
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-stone-950/60 border border-stone-800">
            <div className="flex -space-x-2">
              <Avatar person={me} size="md" className="ring-2 ring-stone-900" />
              <Avatar person={person} size="md" className="ring-2 ring-stone-900" />
            </div>
            <div className="flex flex-wrap gap-1">
              {shared.map((n) => (
                <NicheTag key={n}>{n}</NicheTag>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel htmlFor="ch-title">Hangout title</FieldLabel>
            <input id="ch-title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </div>
          <div>
            <FieldLabel>When</FieldLabel>
            <WhenPicker value={when} onChange={setWhen} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel htmlFor="ch-loc">Where</FieldLabel>
              <input id="ch-loc" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Studio, café…" className={inputClass} />
            </div>
            <div>
              <FieldLabel>Squad size</FieldLabel>
              <Stepper label="squad size" value={spots} onChange={setSpots} min={3} max={12} />
            </div>
          </div>
          <PrimaryButton onClick={send}>Send co-host invite</PrimaryButton>
        </div>
      )}

      {phase !== 'edit' && (
        <div className="p-8 text-center space-y-4 animate-rise-in">
          <div className="flex justify-center -space-x-3">
            <Avatar person={me} size="lg" className="ring-4 ring-stone-900" />
            <Avatar person={person} size="lg" className="ring-4 ring-stone-900" />
          </div>
          {phase === 'waiting' ? (
            <>
              <LoaderCircle className="mx-auto text-purple-300 animate-spin" size={22} />
              <p className="text-sm text-stone-300">Waiting for {person.name} to accept…</p>
            </>
          ) : (
            <>
              <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                <Check size={20} />
              </div>
              <div>
                <h3 className="font-display text-lg font-extrabold text-white">{person.name} is in.</h3>
                <p className="text-xs text-stone-400 mt-1">“{title.trim() || suggested}” is live on the Explore feed.</p>
              </div>
              <PrimaryButton
                onClick={() => {
                  close();
                  goTo('explore');
                  toast('Co-hosted hangout published.');
                }}
              >
                See it on Explore
              </PrimaryButton>
            </>
          )}
        </div>
      )}
    </Sheet>
  );
}
