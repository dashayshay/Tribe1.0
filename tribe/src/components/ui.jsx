import React, { useState } from 'react';
import {
  X, Minus, Plus, Circle, Search, Sparkles, Users, Activity, Orbit, UserRound, Camera, Aperture,
  Monitor, Type, Radio, Mic, Printer, Palette, Feather, BookOpen,
} from 'lucide-react';
import { nextDays, TIME_OPTIONS } from '../lib/time.js';

// Explicit map (instead of `import * as`) keeps the bundle tree-shaken.
const ICONS = {
  Search, Sparkles, Users, Activity, Orbit, UserRound, Camera, Aperture,
  Monitor, Type, Radio, Mic, Printer, Palette, Feather, BookOpen,
};

/** Resolve a lucide icon by name (used for icons referenced from data files). */
export function Icon({ name, ...props }) {
  const C = ICONS[name] ?? Circle;
  return <C {...props} />;
}

const AVATAR_SIZES = {
  xs: 'w-5 h-5 text-[8px]',
  sm: 'w-8 h-8 text-[10px]',
  md: 'w-10 h-10 text-xs',
  lg: 'w-12 h-12 text-sm',
  xl: 'w-20 h-20 text-2xl',
};

function initials(name = '') {
  return name
    .replace(/[^A-Za-z\s&]/g, '')
    .split(/\s+/)
    .filter((w) => w && w !== '&')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

/** Generated avatar: initials on a brand gradient. */
export function Avatar({ person, size = 'sm', className = '' }) {
  if (!person) return null;
  return (
    <div
      aria-hidden="true"
      className={`${AVATAR_SIZES[size]} shrink-0 rounded-full bg-gradient-to-br ${person.gradient ?? 'from-stone-500 to-stone-700'} flex items-center justify-center font-display font-extrabold text-white/95 tracking-tight ${className}`}
    >
      {initials(person.name)}
    </div>
  );
}

/** Cover image that degrades to a gradient if the remote image fails. */
export function Cover({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return <div className={`bg-gradient-to-br from-purple-900 via-stone-900 to-orange-900 ${className}`} />;
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className}`} />;
}

export function SectionCard({ icon: IconC, iconClass = 'text-purple-400', title, subtitle, action, children, className = '' }) {
  return (
    <section className={`bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-lg space-y-3 ${className}`}>
      <div className="flex justify-between items-start gap-3">
        <div>
          <h3 className="font-extrabold text-xs text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
            {IconC && <IconC size={13} className={iconClass} />} {title}
          </h3>
          {subtitle && <p className="text-[11px] text-stone-400 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Bottom sheet that sits inside the phone frame. */
export function Sheet({ title, subtitle, icon: IconC, iconClass = 'bg-orange-500/20 text-orange-400', onClose, children, tall = false }) {
  return (
    <div
      className="absolute inset-0 bg-black/75 backdrop-blur-sm z-50 flex flex-col justify-end animate-fade-in"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`bg-stone-900 border-t border-stone-800 rounded-t-[32px] ${tall ? 'h-[92%]' : 'max-h-[92%]'} flex flex-col animate-slide-up`}
      >
        <div className="mx-auto mt-2.5 w-10 h-1 rounded-full bg-stone-700 shrink-0" />
        <div className="flex justify-between items-center px-5 pt-3 pb-3 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {IconC && (
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}>
                <IconC size={17} />
              </div>
            )}
            <div className="min-w-0">
              <h2 className="font-display font-extrabold text-base text-white leading-tight truncate">{title}</h2>
              {subtitle && <p className="text-[11px] text-stone-400 truncate">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center shrink-0"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">{children}</div>
      </div>
    </div>
  );
}

export function FieldLabel({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
      {children}
    </label>
  );
}

export const inputClass =
  'w-full bg-stone-950 border border-stone-800 focus:border-orange-500 rounded-2xl px-3.5 py-2.5 text-[13px] text-white placeholder-stone-500 outline-none transition-colors';

export function Stepper({ value, onChange, min, max, step = 1, format = (v) => v, label }) {
  const clamp = (v) => Math.min(max, Math.max(min, v));
  return (
    <div className="flex items-center justify-between bg-stone-950 border border-stone-800 rounded-2xl px-1.5 py-1.5">
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        onClick={() => onChange(clamp(value - step))}
        disabled={value <= min}
        className="w-8 h-8 rounded-xl bg-stone-800 text-stone-300 flex items-center justify-center disabled:opacity-30"
      >
        <Minus size={14} />
      </button>
      <span className="text-sm font-black text-white tabular-nums" aria-live="polite">{format(value)}</span>
      <button
        type="button"
        aria-label={`Increase ${label}`}
        onClick={() => onChange(clamp(value + step))}
        disabled={value >= max}
        className="w-8 h-8 rounded-xl bg-stone-800 text-stone-300 flex items-center justify-center disabled:opacity-30"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

/** Day chips + time select. `value` = { offset, h, m }. */
export function WhenPicker({ value, onChange }) {
  const days = nextDays(7);
  return (
    <div className="space-y-2">
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
        {days.map((d) => (
          <button
            type="button"
            key={d.offset}
            onClick={() => onChange({ ...value, offset: d.offset })}
            className={`shrink-0 w-12 py-1.5 rounded-xl border text-center transition-all ${
              value.offset === d.offset
                ? 'bg-orange-500 border-orange-400 text-white'
                : 'bg-stone-950 border-stone-800 text-stone-400'
            }`}
          >
            <span className="block text-[9px] font-bold uppercase">{d.label}</span>
            <span className="block text-sm font-black">{d.date}</span>
          </button>
        ))}
      </div>
      <select
        aria-label="Start time"
        value={`${value.h}:${value.m}`}
        onChange={(e) => {
          const [h, m] = e.target.value.split(':').map(Number);
          onChange({ ...value, h, m });
        }}
        className={inputClass}
      >
        {TIME_OPTIONS.map((t) => (
          <option key={t.label} value={`${t.h}:${t.m}`}>{t.label}</option>
        ))}
      </select>
    </div>
  );
}

export function whenToIso({ offset, h, m }) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

export function PrimaryButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl text-sm font-black shadow-lg shadow-orange-500/30 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 ${className}`}
    >
      {children}
    </button>
  );
}

export function NicheTag({ children, active = true }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
        active ? 'bg-teal-950/70 text-teal-300 border-teal-800/70' : 'bg-stone-900 text-stone-500 border-stone-800'
      }`}
    >
      {children}
    </span>
  );
}
