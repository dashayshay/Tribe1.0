import React, { useEffect, useState } from 'react';
import {
  ArrowLeft, ArrowRight, Check, IdCard, ScanFace, ShieldCheck, Fingerprint, Users, Armchair, HeartHandshake, LoaderCircle, Tags,
} from 'lucide-react';
import { useTribe } from '../state/TribeContext.jsx';
import { NICHES } from '../data/people.js';
import { Icon, PrimaryButton, Sheet } from '../components/ui.jsx';
import { track } from '../lib/analytics.js';

export function NichePicker({ value, onChange }) {
  const toggle = (label) =>
    onChange(value.includes(label) ? value.filter((l) => l !== label) : [...value, label]);
  return (
    <div className="grid grid-cols-2 gap-2">
      {NICHES.map((n) => {
        const on = value.includes(n.label);
        return (
          <button
            key={n.label}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(n.label)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl border text-left transition-all ${
              on ? 'bg-teal-950/80 border-teal-500 text-teal-100' : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
            }`}
          >
            <Icon name={n.icon} size={15} className={on ? 'text-teal-300' : 'text-stone-500'} />
            <span className="text-xs font-semibold leading-tight flex-1">{n.label}</span>
            {on && <Check size={13} className="text-teal-300" />}
          </button>
        );
      })}
    </div>
  );
}

export function NichesSheet() {
  const { state, dispatch, close, toast } = useTribe();
  const [niches, setNiches] = useState(state.niches);
  return (
    <Sheet title="Your creative niches" subtitle="Pick at least two — they power Overlapping Niches" icon={Tags} iconClass="bg-teal-500/20 text-teal-300" onClose={close}>
      <div className="p-5 space-y-4">
        <NichePicker value={niches} onChange={setNiches} />
        <PrimaryButton
          disabled={niches.length < 2}
          onClick={() => {
            dispatch({ type: 'SET_NICHES', niches });
            close();
            toast('Niches updated — your overlaps just refreshed.');
          }}
        >
          Save niches
        </PrimaryButton>
      </div>
    </Sheet>
  );
}

const CHECKS = [
  { id: 'id', label: 'Government ID', detail: 'Driver’s license or passport', icon: IdCard },
  { id: 'face', label: 'Selfie match', detail: 'Live photo matched to your ID', icon: ScanFace },
  { id: 'bg', label: 'Background screen', detail: 'Safety check, never shown to others', icon: Fingerprint },
];

/** Full-screen first-run flow: welcome → niches → verification → show-up pledge. */
export default function Onboarding({ step: startStep = 0 }) {
  const { state, dispatch, close, toast } = useTribe();
  const [step, setStep] = useState(startStep);
  const [niches, setNiches] = useState(state.niches);
  const [verifyStage, setVerifyStage] = useState(state.verified ? CHECKS.length : -1); // -1 idle
  const [pledged, setPledged] = useState(false);

  // Simulated verification: tick each check in sequence.
  useEffect(() => {
    if (verifyStage < 0 || verifyStage >= CHECKS.length) return;
    const t = setTimeout(() => setVerifyStage((s) => s + 1), 900);
    return () => clearTimeout(t);
  }, [verifyStage]);
  const verified = verifyStage >= CHECKS.length;

  const finish = (skipped = false) => {
    dispatch({ type: 'ONBOARD', niches: skipped ? state.niches : niches, verified: skipped ? true : verified });
    track('onboarding_complete', { skipped, niches: niches.length });
    close();
    if (!skipped) toast('Welcome to Tribe. Your first squad is one tap away.');
  };

  const steps = ['Welcome', 'Niches', 'Verify', 'Pledge'];

  return (
    <div role="dialog" aria-modal="true" aria-label="Welcome to Tribe" className="absolute inset-0 z-[55] bg-stone-950 flex flex-col animate-fade-in">
      <div className="px-5 pt-4 flex items-center justify-between shrink-0">
        {step > 0 ? (
          <button onClick={() => setStep((s) => s - 1)} aria-label="Back" className="w-9 h-9 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-300">
            <ArrowLeft size={16} />
          </button>
        ) : (
          <span className="w-9" />
        )}
        <div className="flex gap-1.5" aria-label={`Step ${step + 1} of ${steps.length}`}>
          {steps.map((s, i) => (
            <span key={s} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-orange-500' : i < step ? 'w-3 bg-orange-500/50' : 'w-3 bg-stone-800'}`} />
          ))}
        </div>
        <button onClick={() => finish(true)} className="text-[11px] font-bold text-stone-500 hover:text-stone-300 w-16 text-right">
          Skip demo
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-6 pb-4">
        {step === 0 && (
          <div className="space-y-6 animate-rise-in">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-xl shadow-orange-500/30 text-white font-black text-xl tracking-tighter">
              TR
            </div>
            <div>
              <h1 className="font-display text-[34px] leading-[1.02] font-extrabold text-white">
                Small squads.
                <br />
                Real rooms.
                <br />
                <span className="text-orange-400">Making things together.</span>
              </h1>
              <p className="text-sm text-stone-400 mt-3 leading-relaxed">
                Skip the awkward coffee date and the 50-person mixer. Book an empty chair at a hangout built around the thing you already love making.
              </p>
            </div>
            <ul className="space-y-3">
              {[
                { icon: Armchair, tone: 'text-orange-400 bg-orange-500/10', title: 'Claim an empty chair', body: 'Photowalks, design jams, synth sessions — 4 to 15 people.' },
                { icon: ShieldCheck, tone: 'text-emerald-400 bg-emerald-500/10', title: 'Verified creatives only', body: 'Everyone passes ID and a background screen.' },
                { icon: HeartHandshake, tone: 'text-purple-300 bg-purple-500/10', title: 'Built-in icebreakers', body: 'Conversation starters tuned to each squad.' },
              ].map((f) => (
                <li key={f.title} className="flex gap-3 items-start">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${f.tone}`}>
                    <f.icon size={17} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{f.title}</p>
                    <p className="text-xs text-stone-400">{f.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5 animate-rise-in">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-white">What do you make?</h2>
              <p className="text-sm text-stone-400 mt-1">Pick two or more. We match you with people who overlap.</p>
            </div>
            <NichePicker value={niches} onChange={setNiches} />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 animate-rise-in">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-white">Get verified</h2>
              <p className="text-sm text-stone-400 mt-1">
                Every person in every squad goes through this. It takes about two minutes.
              </p>
            </div>
            <ul className="space-y-2.5">
              {CHECKS.map((c, i) => {
                const done = verifyStage > i;
                const active = verifyStage === i;
                return (
                  <li
                    key={c.id}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
                      done ? 'bg-emerald-950/40 border-emerald-700/60' : active ? 'bg-purple-950/40 border-purple-500/60' : 'bg-stone-900 border-stone-800'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${done ? 'bg-emerald-500/20 text-emerald-300' : 'bg-stone-800 text-stone-400'}`}>
                      <c.icon size={17} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{c.label}</p>
                      <p className="text-[11px] text-stone-400">{c.detail}</p>
                    </div>
                    {done ? (
                      <Check size={18} className="text-emerald-400" />
                    ) : active ? (
                      <LoaderCircle size={18} className="text-purple-300 animate-spin" />
                    ) : null}
                  </li>
                );
              })}
            </ul>
            {verified && (
              <div className="flex items-center gap-2 text-emerald-300 text-sm font-bold animate-rise-in">
                <ShieldCheck size={18} /> You’re verified.
              </div>
            )}
            <p className="text-[11px] text-stone-500">Prototype: verification is simulated — no data leaves your browser.</p>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 animate-rise-in">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-white">The show-up pledge</h2>
              <p className="text-sm text-stone-400 mt-1">Small squads only work when everyone shows. Here’s the deal:</p>
            </div>
            <ul className="space-y-3 text-sm text-stone-300">
              <li className="flex gap-2.5">
                <Users size={17} className="text-orange-400 shrink-0 mt-0.5" />
                Your <b className="text-white">Show Rate</b> is visible to hosts. Release a chair 24h+ ahead and it stays clean.
              </li>
              <li className="flex gap-2.5">
                <HeartHandshake size={17} className="text-purple-300 shrink-0 mt-0.5" />
                After each hangout you leave <b className="text-white">anonymous, positive-only</b> vibes. Your squad’s vibes for you unlock once you send yours.
              </li>
              <li className="flex gap-2.5">
                <ShieldCheck size={17} className="text-emerald-400 shrink-0 mt-0.5" />
                Anyone can report a safety concern privately, any time.
              </li>
            </ul>
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-stone-900 border border-stone-800 cursor-pointer">
              <input
                type="checkbox"
                checked={pledged}
                onChange={(e) => setPledged(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-orange-500"
              />
              <span className="text-sm text-stone-200 font-medium">I’ll show up, or release my chair at least 24 hours ahead.</span>
            </label>
          </div>
        )}
      </div>

      <div className="px-6 pb-6 pt-3 shrink-0">
        {step === 0 && (
          <PrimaryButton onClick={() => setStep(1)}>
            Get started <ArrowRight size={16} />
          </PrimaryButton>
        )}
        {step === 1 && (
          <PrimaryButton disabled={niches.length < 2} onClick={() => setStep(2)}>
            {niches.length < 2 ? `Pick ${2 - niches.length} more` : 'Continue'} <ArrowRight size={16} />
          </PrimaryButton>
        )}
        {step === 2 &&
          (verified ? (
            <PrimaryButton onClick={() => setStep(3)}>
              Continue <ArrowRight size={16} />
            </PrimaryButton>
          ) : (
            <PrimaryButton disabled={verifyStage >= 0} onClick={() => setVerifyStage(0)}>
              {verifyStage >= 0 ? 'Verifying…' : 'Start verification'}
            </PrimaryButton>
          ))}
        {step === 3 && (
          <PrimaryButton disabled={!pledged} onClick={() => finish(false)}>
            Enter Tribe
          </PrimaryButton>
        )}
      </div>
    </div>
  );
}
