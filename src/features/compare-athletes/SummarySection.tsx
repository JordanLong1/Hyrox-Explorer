import type { HyroxResult } from '@/shared/types/hyrox';
import { formatTime } from '@/shared/lib/time';
import { ATHLETE_COLORS } from './colors';
import { relativeSummary } from './stats';

interface SummarySectionProps {
  athletes: HyroxResult[];
}

/**
 * Per-athlete headline card: finish time, strongest segment vs. the group,
 * and weakest segment vs. the group. "Strongest" is measured as the segment
 * where this athlete beat the group median by the most (or lost the least).
 * "Weakest" is the inverse.
 *
 * With only one athlete selected there's no group to compare against, so we
 * show a muted note explaining why.
 */
export function SummarySection({ athletes }: SummarySectionProps) {
  const hasGroup = athletes.length >= 2;

  return (
    <section
      aria-label="Athlete summaries"
      className={`grid gap-4 grid-cols-1 ${
        athletes.length >= 3 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2'
      }`}
    >
      {athletes.map((a, i) => {
        const color = ATHLETE_COLORS[i];
        const summary = relativeSummary(a, athletes);
        return (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-2">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${color.dot}`}
                aria-hidden="true"
              />
              <p className="text-sm font-medium text-gray-500">
                Athlete {i + 1}
              </p>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2 tabular-nums">
              {formatTime(a.totalTime)}
            </p>
            {hasGroup && summary.best && summary.worst ? (
              <dl className="mt-3 space-y-1 text-sm">
                <div className="flex items-baseline justify-between gap-2">
                  <dt className="text-gray-500">Strongest</dt>
                  <dd className="text-gray-900 text-right">
                    {summary.best.label}{' '}
                    <span className="text-green-700 tabular-nums text-xs">
                      {formatSignedDelta(summary.best.delta)}
                    </span>
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <dt className="text-gray-500">Weakest</dt>
                  <dd className="text-gray-900 text-right">
                    {summary.worst.label}{' '}
                    <span className="text-red-700 tabular-nums text-xs">
                      {formatSignedDelta(summary.worst.delta)}
                    </span>
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-xs text-gray-400 mt-3 italic">
                Add another athlete to compare.
              </p>
            )}
          </div>
        );
      })}
    </section>
  );
}

function formatSignedDelta(seconds: number): string {
  const rounded = Math.round(seconds);
  if (rounded === 0) return '±0s';
  const sign = rounded > 0 ? '+' : '−';
  const abs = Math.abs(rounded);
  const m = Math.floor(abs / 60);
  const s = abs % 60;
  if (m > 0) return `${sign}${m}:${s.toString().padStart(2, '0')}`;
  return `${sign}${s}s`;
}
