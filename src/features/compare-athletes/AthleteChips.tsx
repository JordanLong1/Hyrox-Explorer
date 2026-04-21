import type { HyroxResult } from '@/shared/types/hyrox';
import { ATHLETE_COLORS } from './colors';
import { formatAthleteLabel } from './stats';

interface SelectedAthlete {
  key: string;
  result: HyroxResult;
  isExample: boolean;
}

interface AthleteChipsProps {
  selections: SelectedAthlete[];
  onRemove: (key: string) => void;
}

export function AthleteChips({ selections, onRemove }: AthleteChipsProps) {
  if (selections.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">No athletes selected yet.</p>
    );
  }

  return (
    <ul className="flex flex-wrap gap-2" aria-label="Selected athletes">
      {selections.map((sel, i) => {
        const color = ATHLETE_COLORS[i];
        return (
          <li
            key={sel.key}
            className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border ${color.chip}`}
          >
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full ${color.dot}`}
              aria-hidden="true"
            />
            <span className="tabular-nums">{formatAthleteLabel(sel.result)}</span>
            {sel.isExample && (
              <span className="text-xs opacity-70 italic">(example)</span>
            )}
            <button
              type="button"
              onClick={() => onRemove(sel.key)}
              aria-label={`Remove athlete ${formatAthleteLabel(sel.result)}`}
              className="ml-1 text-current opacity-60 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-current rounded-full leading-none"
            >
              <span aria-hidden="true">×</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
