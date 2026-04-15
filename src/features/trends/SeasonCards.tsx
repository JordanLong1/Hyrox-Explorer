import { formatTime } from '@/shared/lib/time';
import type { SeasonSummary } from './stats';

interface SeasonCardsProps {
  summaries: SeasonSummary[];
}

/**
 * Three-up summary of the filtered population by season. Deliberately forces
 * a consistent slot for S4/S5/S6 so the user can eyeball a trend across cards
 * without mentally re-ordering. Seasons missing from the filtered data render
 * a muted placeholder rather than collapsing the grid.
 */
const SEASONS_TO_SHOW = [4, 5, 6];

export function SeasonCards({ summaries }: SeasonCardsProps) {
  const bySeason = new Map(summaries.map((s) => [s.season, s]));

  return (
    <section
      className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      aria-label="Season summaries"
    >
      {SEASONS_TO_SHOW.map((season) => {
        const summary = bySeason.get(season);
        return (
          <div
            key={season}
            className="bg-white border border-gray-200 rounded-lg p-6"
          >
            <p className="text-sm font-medium text-gray-500">Season {season}</p>
            {summary && summary.finisherCount > 0 ? (
              <>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatTime(summary.medianFinish)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  median finish ·{' '}
                  {summary.finisherCount.toLocaleString()} finishers
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-400 mt-2">No data for filters</p>
            )}
          </div>
        );
      })}
    </section>
  );
}
