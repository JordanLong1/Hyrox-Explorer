/**
 * Format seconds for display in data contexts where 0 means "missing".
 * 218 -> "3:38"
 * 5400 -> "1:30:00"
 * 0 -> "—"
 */
export function formatTime(seconds: number): string {
  if (seconds <= 0) return '—';
  return formatDuration(seconds);
}

/**
 * Format seconds as a duration, treating 0 as a real value.
 * Use this for axis ticks, scales, or anywhere 0 is meaningful rather than missing.
 * 0 -> "0:00"
 * 218 -> "3:38"
 * 5400 -> "1:30:00"
 */
export function formatDuration(seconds: number): string {
  const rounded = Math.max(0, Math.round(seconds));
  const h = Math.floor(rounded / 3600);
  const m = Math.floor((rounded % 3600) / 60);
  const s = rounded % 60;

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}
