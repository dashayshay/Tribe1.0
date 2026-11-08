import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTribe } from '../state/TribeContext.jsx';
import { CATEGORIES, coverFor } from '../data/content.js';
import { Sheet, FieldLabel, inputClass, Stepper, WhenPicker, whenToIso, PrimaryButton } from '../components/ui.jsx';
import { track } from '../lib/analytics.js';

export default function CreateEventSheet({ category: initialCategory }) {
  const { close, dispatch, toast, goTo } = useTribe();
  const [form, setForm] = useState({
    title: '',
    category: initialCategory ?? 'UX/Design',
    location: '',
    when: { offset: 4, h: 18, m: 30 },
    spots: 6,
    paid: false,
    price: 10,
    description: '',
  });
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast('Give your hangout a title first.');
      return;
    }
    const event = {
      id: Date.now(),
      title: form.title.trim(),
      hostId: 'me',
      type: 'Community',
      image: coverFor(form.category),
      startsAt: whenToIso(form.when),
      location: form.location.trim() || 'Local creative studio, Downtown',
      price: form.paid ? form.price : 0,
      spotsTotal: form.spots,
      takenByOthers: 0,
      category: form.category,
      perk: null,
      description: form.description.trim() || 'A small peer gathering to make things together.',
      attendeeIds: [],
    };
    dispatch({ type: 'CREATE_EVENT', event, bookForMe: true });
    track('event_created', { category: event.category, paid: form.paid });
    close();
    goTo('explore');
    toast('Your hangout is live for verified local creatives.');
  };

  return (
    <Sheet title="Host a creative hangout" subtitle="Fill a small squad for an IRL activity" icon={Plus} onClose={close}>
      <form onSubmit={submit} className="p-5 space-y-4">
        <div>
          <FieldLabel htmlFor="ce-title">Activity title</FieldLabel>
          <input
            id="ce-title"
            value={form.title}
            onChange={(e) => set({ title: e.target.value })}
            placeholder="e.g. Sunday 120 film walk & chai"
            className={inputClass}
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel htmlFor="ce-cat">Category</FieldLabel>
            <select id="ce-cat" value={form.category} onChange={(e) => set({ category: e.target.value })} className={inputClass}>
              {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel>Squad size</FieldLabel>
            <Stepper label="squad size" value={form.spots} onChange={(spots) => set({ spots })} min={2} max={12} format={(v) => `${v} chairs`} />
          </div>
        </div>

        <div>
          <FieldLabel htmlFor="ce-loc">Meeting point</FieldLabel>
          <input
            id="ce-loc"
            value={form.location}
            onChange={(e) => set({ location: e.target.value })}
            placeholder="e.g. Maru Coffee, Arts District arch"
            className={inputClass}
          />
        </div>

        <div>
          <FieldLabel>When</FieldLabel>
          <WhenPicker value={form.when} onChange={(when) => set({ when })} />
        </div>

        <div className="space-y-2">
          <FieldLabel>Cost per person</FieldLabel>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => set({ paid: false })}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                !form.paid ? 'bg-emerald-950 border-emerald-500 text-emerald-300' : 'bg-stone-950 border-stone-800 text-stone-400'
              }`}
            >
              Free hangout
            </button>
            <button
              type="button"
              onClick={() => set({ paid: true })}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                form.paid ? 'bg-orange-950 border-orange-500 text-orange-300' : 'bg-stone-950 border-stone-800 text-stone-400'
              }`}
            >
              Covers materials
            </button>
          </div>
          {form.paid && (
            <div className="animate-rise-in">
              <Stepper label="price" value={form.price} onChange={(price) => set({ price })} min={5} max={40} step={5} format={(v) => `$${v} / person`} />
            </div>
          )}
        </div>

        <div>
          <FieldLabel htmlFor="ce-desc">Short description</FieldLabel>
          <textarea
            id="ce-desc"
            rows={2}
            value={form.description}
            onChange={(e) => set({ description: e.target.value })}
            placeholder="What should people bring? What's the vibe?"
            className={`${inputClass} resize-none`}
          />
        </div>

        <PrimaryButton type="submit">Publish to local Tribe feed</PrimaryButton>
      </form>
    </Sheet>
  );
}
