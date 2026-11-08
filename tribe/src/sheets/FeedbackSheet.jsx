import React, { useState } from 'react';
import { MessageSquareHeart, Check, Lock, Sparkles, UserX } from 'lucide-react';
import { useTribe } from '../state/TribeContext.jsx';
import { VIBE_TAGS, TONES } from '../data/content.js';
import { getPerson } from '../data/people.js';
import { relativeDay } from '../lib/time.js';
import { Avatar, Sheet, PrimaryButton } from '../components/ui.jsx';
import { track } from '../lib/analytics.js';

const MAX_TAGS = 3;

/**
 * Post-hangout feedback, three steps:
 *   1. Who showed up?   → feeds each person's Show Rate (privately)
 *   2. Positive vibes   → up to 3 tags per person, anonymous
 *   3. Reveal           → the squad's vibes for *you* unlock (double-blind,
 *                         like Airbnb reviews, so nobody tit-for-tats)
 */
export default function FeedbackSheet({ pastId }) {
  const { pastHangouts, close, dispatch, toast, vibes } = useTribe();
  const hangout = pastHangouts.find((p) => p.id === pastId);
  const squad = hangout?.squadIds.map(getPerson) ?? [];
  const [step, setStep] = useState(0);
  const [showed, setShowed] = useState(() => Object.fromEntries((hangout?.squadIds ?? []).map((id) => [id, true])));
  const [tags, setTags] = useState({});

  if (!hangout) return null;

  const present = squad.filter((p) => showed[p.id]);
  const toggleTag = (pid, word) =>
    setTags((t) => {
      const cur = t[pid] ?? [];
      if (cur.includes(word)) return { ...t, [pid]: cur.filter((w) => w !== word) };
      if (cur.length >= MAX_TAGS) return t;
      return { ...t, [pid]: [...cur, word] };
    });

  const received = Object.entries(hangout.received);
  const reviewers = hangout.squadIds.length;

  const submit = () => {
    dispatch({ type: 'SUBMIT_FEEDBACK', pastId, received: hangout.received, reviewers });
    track('feedback_submitted', {
      pastId,
      noShows: squad.length - present.length,
      tagsGiven: Object.values(tags).flat().length,
    });
    setStep(2);
  };

  return (
    <Sheet
      title={hangout.title}
      subtitle={`${relativeDay(hangout.startsAt)} · ${hangout.location}`}
      icon={MessageSquareHeart}
      iconClass="bg-purple-500/20 text-purple-300"
      onClose={close}
      tall
    >
      <div className="p-5 space-y-4">
        {step === 0 && (
          <div className="space-y-4 animate-rise-in">
            <div>
              <h3 className="font-display text-lg font-extrabold text-white">Who made it?</h3>
              <p className="text-xs text-stone-400">Only used for Show Rate. Nobody sees who marked them.</p>
            </div>
            <ul className="space-y-2">
              {squad.map((p) => (
                <li key={p.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-stone-950/60 border border-stone-800">
                  <div className="flex items-center gap-2.5">
                    <Avatar person={p} size="sm" />
                    <div>
                      <p className="text-xs font-bold text-white">{p.name}</p>
                      <p className="text-[10px] text-stone-400">{p.role}</p>
                    </div>
                  </div>
                  <div className="flex bg-stone-900 rounded-xl p-0.5 border border-stone-800" role="group" aria-label={`Did ${p.name} show up?`}>
                    <button
                      onClick={() => setShowed((s) => ({ ...s, [p.id]: true }))}
                      aria-pressed={showed[p.id]}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 ${showed[p.id] ? 'bg-emerald-600 text-white' : 'text-stone-400'}`}
                    >
                      <Check size={11} /> Showed
                    </button>
                    <button
                      onClick={() => setShowed((s) => ({ ...s, [p.id]: false }))}
                      aria-pressed={!showed[p.id]}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 ${!showed[p.id] ? 'bg-stone-700 text-white' : 'text-stone-400'}`}
                    >
                      <UserX size={11} /> No-show
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <PrimaryButton onClick={() => setStep(1)}>Next: leave vibes</PrimaryButton>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4 animate-rise-in">
            <div>
              <h3 className="font-display text-lg font-extrabold text-white">What stood out?</h3>
              <p className="text-xs text-stone-400 flex items-center gap-1">
                <Lock size={11} /> Anonymous and positive-only. Up to {MAX_TAGS} per person.
              </p>
            </div>
            {present.length === 0 && <p className="text-xs text-stone-400">No one to rate — that’s okay.</p>}
            {present.map((p) => (
              <div key={p.id} className="p-3 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-2">
                <div className="flex items-center gap-2">
                  <Avatar person={p} size="xs" className="w-6 h-6" />
                  <span className="text-xs font-bold text-white">{p.name}</span>
                  <span className="text-[10px] text-stone-500 ml-auto">{(tags[p.id] ?? []).length}/{MAX_TAGS}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {VIBE_TAGS.map((t) => {
                    const on = (tags[p.id] ?? []).includes(t.word);
                    return (
                      <button
                        key={t.word}
                        aria-pressed={on}
                        onClick={() => toggleTag(p.id, t.word)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all ${
                          on ? TONES[t.tone] : 'bg-stone-900 border-stone-800 text-stone-500 hover:text-stone-300'
                        }`}
                      >
                        {t.word}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <PrimaryButton onClick={submit}>Send & unlock my vibes</PrimaryButton>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 text-center animate-rise-in pt-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center">
              <Sparkles size={28} />
            </div>
            <div>
              <h3 className="font-display text-xl font-extrabold text-white">Your squad’s vibes for you</h3>
              <p className="text-xs text-stone-400 mt-1">From {reviewers} people at {hangout.title}. Added to your Vibe Cloud.</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {received.map(([word, n], i) => {
                const tone = VIBE_TAGS.find((t) => t.word === word)?.tone ?? 'stone';
                return (
                  <span
                    key={word}
                    style={{ animationDelay: `${i * 120}ms` }}
                    className={`px-3 py-1.5 rounded-xl text-sm font-bold border animate-rise-in ${TONES[tone]}`}
                  >
                    {word} <span className="opacity-70 text-xs">+{n}</span>
                  </span>
                );
              })}
            </div>
            <p className="text-[11px] text-stone-500">Vibe Cloud now reflects {vibes.reviews} reviews.</p>
            <PrimaryButton
              onClick={() => {
                close();
                toast('Thanks — your feedback stays anonymous.');
              }}
            >
              Done
            </PrimaryButton>
          </div>
        )}
      </div>
    </Sheet>
  );
}
