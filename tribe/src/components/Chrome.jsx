import React from 'react';
import { Sparkles } from 'lucide-react';
import { useTribe } from '../state/TribeContext.jsx';
import { VARIANTS } from '../lib/experiment.js';
import { Icon } from './ui.jsx';

export function StatusBar({ onClockTap }) {
  return (
    <div className="h-11 px-7 pt-2 flex justify-between items-center text-xs font-semibold text-stone-400 shrink-0 z-40 bg-stone-900/90 backdrop-blur-md">
      {/* Tapping the clock opens the Experiment Lab on small screens. */}
      <button onClick={onClockTap} aria-label="Open experiment lab" className="tabular-nums">
        9:41
      </button>
      <div className="w-20 h-4 bg-stone-950 rounded-full -mt-1 hidden md:block border border-stone-800/80" />
      <div className="flex items-center gap-1.5 text-stone-300" aria-hidden="true">
        <span className="text-[10px] tracking-tight text-emerald-400 font-bold">5G</span>
        <div className="w-5 h-2.5 border border-stone-400 rounded-sm p-0.5 flex items-center">
          <div className="w-full h-full bg-stone-300 rounded-[1px]" />
        </div>
      </div>
    </div>
  );
}

export function Toast() {
  const { toastMsg } = useTribe();
  if (!toastMsg) return null;
  return (
    <div className="absolute top-12 left-4 right-4 z-[60] animate-drop-in" role="status" aria-live="polite">
      <div className="bg-gradient-to-r from-stone-800 to-stone-900 border border-purple-500/40 text-stone-100 px-4 py-3 rounded-2xl shadow-xl shadow-black/60 flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
          <Sparkles size={14} />
        </div>
        <p className="text-xs font-medium leading-tight flex-1">{toastMsg}</p>
      </div>
    </div>
  );
}

export function BottomNav() {
  const { variant, tab, setTab, close } = useTribe();
  return (
    <nav aria-label="Primary" className="h-16 px-4 bg-stone-900/95 backdrop-blur-md border-t border-stone-800 flex items-center justify-around shrink-0 z-40">
      {VARIANTS[variant].tabs.map((t) => {
        const active = tab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id);
              close();
            }}
            aria-current={active ? 'page' : undefined}
            className={`flex flex-col items-center justify-center gap-1 w-16 py-1 transition-all relative ${
              active ? 'text-orange-400' : 'text-stone-400 hover:text-stone-300'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${active ? 'bg-orange-500/10 scale-110' : ''}`}>
              <Icon name={t.icon} size={18} strokeWidth={active ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] tracking-tight ${active ? 'font-black text-white' : 'font-semibold'}`}>
              {t.label}
            </span>
            {active && <span className="w-1 h-1 bg-orange-400 rounded-full absolute bottom-0" />}
          </button>
        );
      })}
    </nav>
  );
}
