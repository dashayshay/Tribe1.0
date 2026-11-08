import React, { useEffect, useState } from 'react';
import { FlaskConical, Download, RotateCcw, Trash2, X, Sparkles } from 'lucide-react';
import { useTribe } from '../state/TribeContext.jsx';
import { VARIANTS, EXPERIMENT_ID } from '../lib/experiment.js';
import { summarize, exportLog, clearLog } from '../lib/analytics.js';

const fmt = (v, digits = 1) => (v == null ? '—' : Number(v).toFixed(digits));

const ROWS = [
  { key: 'sessions', label: 'Sessions', f: (v) => (v ?? 0) },
  { key: 'networkPerSession', label: 'Network actions / session', primary: true, f: fmt },
  { key: 'claimsPerSession', label: 'Chairs claimed / session', f: fmt },
  { key: 'sponsoredPerSession', label: 'Sponsored bookings / session', guardrail: true, f: fmt },
  { key: 'tabsPerSession', label: 'Tabs explored / session', f: fmt },
  { key: 'medianSecondsToFirstClaim', label: 'Median sec. to first claim', f: (v) => fmt(v, 0) },
];

/**
 * Side panel for the tab-structure A/B test. Visible beside the phone on wide
 * screens; on phones it opens as an overlay by tapping the status-bar clock
 * (or by adding `?lab=1` to the URL).
 */
export default function ExperimentLab({ onClose, overlay = false }) {
  const { variant, switchVariant, resetDemo, open } = useTribe();
  const [stats, setStats] = useState(() => summarize());

  useEffect(() => {
    const refresh = () => setStats(summarize());
    window.addEventListener('tribe:track', refresh);
    return () => window.removeEventListener('tribe:track', refresh);
  }, []);

  return (
    <aside
      aria-label="Experiment lab"
      className={`bg-stone-900/95 border border-stone-800 rounded-3xl p-5 space-y-4 text-stone-200 ${
        overlay ? 'w-full max-h-full overflow-y-auto' : 'w-[340px] shrink-0'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-purple-300 flex items-center gap-1.5">
            <FlaskConical size={13} /> Experiment Lab
          </p>
          <h2 className="font-display text-lg font-extrabold text-white mt-1">Tab structure test</h2>
          <p className="text-[11px] text-stone-500 font-mono">{EXPERIMENT_ID}</p>
        </div>
        {onClose && (
          <button onClick={onClose} aria-label="Close lab" className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-stone-400">
            <X size={15} />
          </button>
        )}
      </div>

      <p className="text-xs text-stone-400 leading-relaxed">
        <span className="text-stone-200 font-semibold">Hypothesis:</span> giving Network its own tab (B) raises chats, co-host
        invites and orbit taps per session — without lowering sponsored bookings.
      </p>

      <div className="grid grid-cols-2 gap-2">
        {Object.values(VARIANTS).map((v) => {
          const active = v.id === variant;
          return (
            <button
              key={v.id}
              onClick={() => switchVariant(v.id)}
              aria-pressed={active}
              className={`text-left p-3 rounded-2xl border transition-all ${
                active ? 'bg-orange-500/10 border-orange-500/70' : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-sm font-black ${active ? 'text-orange-300' : 'text-stone-300'}`}>
                  {v.id} · {v.name}
                </span>
              </div>
              <p className="text-[10px] text-stone-500 mt-1 leading-snug">{v.tabs.map((t) => t.label).join(' · ')}</p>
              <p className={`text-[10px] font-bold mt-1.5 ${active ? 'text-orange-400' : 'text-stone-600'}`}>
                {active ? 'Showing now' : 'Switch'}
              </p>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-stone-800 overflow-hidden">
        <table className="w-full text-[11px]">
          <thead className="bg-stone-950/70 text-stone-400">
            <tr>
              <th className="text-left font-bold px-3 py-2">Metric</th>
              <th className="font-bold px-2 py-2 w-12">A</th>
              <th className="font-bold px-2 py-2 w-12">B</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.key} className="border-t border-stone-800/80">
                <td className="px-3 py-2 text-stone-300">
                  {r.label}
                  {r.primary && <span className="ml-1 text-[9px] font-black text-purple-300">PRIMARY</span>}
                  {r.guardrail && <span className="ml-1 text-[9px] font-black text-amber-400">GUARDRAIL</span>}
                </td>
                <td className="px-2 py-2 text-center font-bold tabular-nums">{r.f(stats.A[r.key])}</td>
                <td className="px-2 py-2 text-center font-bold tabular-nums">{r.f(stats.B[r.key])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-stone-500 leading-relaxed">
        Metrics here are from this browser only. Add the PostHog snippet to <code className="text-stone-400">index.html</code> and
        every event is also sent there, tagged with the variant, for a real multi-user test.
      </p>

      <div className="grid grid-cols-2 gap-2">
        <LabButton icon={Download} onClick={exportLog}>Export events</LabButton>
        <LabButton icon={Sparkles} onClick={() => open('onboarding', { step: 0 })}>Replay onboarding</LabButton>
        <LabButton icon={Trash2} onClick={clearLog}>Clear metrics</LabButton>
        <LabButton icon={RotateCcw} onClick={resetDemo}>Reset demo</LabButton>
      </div>
    </aside>
  );
}

function LabButton({ icon: I, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-[11px] font-bold text-stone-200"
    >
      <I size={13} /> {children}
    </button>
  );
}
