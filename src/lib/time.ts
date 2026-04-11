/**
 * Format seconds as "M:SS" or "H:MM:SS" depending on size.
 * 218 -> "3:38"
 * 5400 -> "1:30:00"
 * 0 -> "—" (for missing data)
 */
export function formatTime(seconds: number): string {
  if (seconds <= 0) return '—';

  const rounded = Math.round(seconds);
  const h = Math.floor(rounded / 3600);
  const m = Math.floor((rounded % 3600) / 60);
  const s = rounded % 60;

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}
