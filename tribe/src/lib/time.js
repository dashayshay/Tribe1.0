// Seed events are generated relative to "now" so the demo never shows stale,
// already-passed dates (the original file hard-coded Nov 2023 weekdays).

export function at(daysFromNow, hour, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export function formatWhen(iso) {
  const d = new Date(iso);
  const day = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${day} • ${time}`;
}

export function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function startOfDay(d) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

export function dayDiff(iso) {
  return Math.round((startOfDay(iso) - startOfDay(new Date())) / 86_400_000);
}

export function relativeDay(iso) {
  const diff = dayDiff(iso);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff < 0) return `${-diff} days ago`;
  if (diff < 7) return new Date(iso).toLocaleDateString('en-US', { weekday: 'long' });
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function hoursUntil(iso) {
  return (new Date(iso) - new Date()) / 3_600_000;
}

/** Day options for pickers: today through +6 days. */
export function nextDays(count = 7) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const label =
      i === 0 ? 'Today' : i === 1 ? 'Tmrw' : d.toLocaleDateString('en-US', { weekday: 'short' });
    return { offset: i, label, date: d.getDate() };
  });
}

export const TIME_OPTIONS = [
  [9, 0], [10, 0], [11, 0], [12, 30], [14, 0], [16, 30], [18, 0], [18, 30], [19, 0], [20, 0],
].map(([h, m]) => ({
  h,
  m,
  label: new Date(2000, 0, 1, h, m).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
}));
