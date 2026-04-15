/**
 * Colors assigned to selected athletes by position. Kept to four distinct
 * hues that read clearly when sitting next to each other as grouped bars.
 * The `text`/`bg`/`border` Tailwind classes are listed explicitly (not
 * interpolated) so Tailwind's JIT can detect them.
 */
export interface AthleteColor {
  hex: string; // for Recharts fill
  chip: string; // chip background + text classes
  dot: string; // small swatch class
}

export const ATHLETE_COLORS: AthleteColor[] = [
  {
    hex: '#3b82f6',
    chip: 'bg-blue-50 text-blue-800 border-blue-200',
    dot: 'bg-blue-500',
  },
  {
    hex: '#f97316',
    chip: 'bg-orange-50 text-orange-800 border-orange-200',
    dot: 'bg-orange-500',
  },
  {
    hex: '#16a34a',
    chip: 'bg-green-50 text-green-800 border-green-200',
    dot: 'bg-green-600',
  },
  {
    hex: '#a855f7',
    chip: 'bg-purple-50 text-purple-800 border-purple-200',
    dot: 'bg-purple-500',
  },
];

export const MAX_ATHLETES = ATHLETE_COLORS.length;
