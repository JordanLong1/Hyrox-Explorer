import { useState } from 'react';
import { STATION_NAMES } from '@/shared/lib/stations';
import { formatTime } from '@/shared/lib/time';
import type { HyroxResult } from '@/shared/types/hyrox';
import { ATHLETE_COLORS } from './colors';

interface ComparisonTableProps {
  athletes: HyroxResult[];
}

type Mode = 'absolute' | 'delta';

/**
 * Station-by-station scoreboard. Rows are stations, columns are the selected
 * athletes (colored to match chips + chart). "Absolute" mode shows raw times
 * with the fastest highlighted per row. "Delta" mode anchors on the
 * first-selected athlete — their column is 0:00 everywhere and the others
 * show +/- relative to that anchor. First-selected as anchor (rather than
 * fastest-per-row) keeps the baseline predictable as athletes come and go.
 */
export function ComparisonTable({ athletes }: ComparisonTableProps) {
  const [mode, setMode] = useState<Mode>('absolute');
  const canToggleDelta = athletes.length >= 2;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-gray-600">
          {mode === 'absolute'
            ? 'Fastest time per station is highlighted.'
            : `All times shown relative to athlete 1.`}
        </p>
        <div
          role="tablist"
          aria-label="Table display mode"
          className="inline-flex rounded-md border border-gray-300 overflow-hidden text-sm"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'absolute'}
            onClick={() => setMode('absolute')}
            className={`px-3 py-1.5 font-medium ${
              mode === 'absolute'
                ? 'bg-blue-50 text-blue-700'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Absolute
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'delta'}
            disabled={!canToggleDelta}
            onClick={() => setMode('delta')}
            className={`px-3 py-1.5 font-medium border-l border-gray-300 ${
              mode === 'delta'
                ? 'bg-blue-50 text-blue-700'
                : 'bg-white text-gray-600 hover:bg-gray-50 disabled:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed'
            }`}
          >
            Delta
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left font-medium text-gray-700 px-3 py-2">
                Station
              </th>
              {athletes.map((_, i) => (
                <th
                  key={i}
                  className="text-right font-medium text-gray-700 px-3 py-2"
                  scope="col"
                >
                  <div className="inline-flex items-center gap-1.5">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${ATHLETE_COLORS[i].dot}`}
                      aria-hidden="true"
                    />
                    Athlete {i + 1}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STATION_NAMES.map((station, rowIdx) => {
              const times = athletes.map((a) => a.works[rowIdx]);
              const validTimes = times.filter((t) => t > 0);
              const fastest = validTimes.length > 0 ? Math.min(...validTimes) : 0;
              const baseline = times[0];

              return (
                <tr
                  key={station}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <th
                    scope="row"
                    className="text-left font-medium text-gray-900 px-3 py-2"
                  >
                    {station}
                  </th>
                  {times.map((t, i) => {
                    const isBaseline = i === 0 && mode === 'delta';
                    const isFastest =
                      mode === 'absolute' && t > 0 && t === fastest;

                    let display: string;
                    if (t <= 0) {
                      display = '—';
                    } else if (mode === 'delta') {
                      if (baseline <= 0) display = formatTime(t);
                      else if (i === 0) display = '0:00';
                      else display = formatSignedDelta(t - baseline);
                    } else {
                      display = formatTime(t);
                    }

                    return (
                      <td
                        key={i}
                        className={`text-right px-3 py-2 tabular-nums ${
                          isFastest
                            ? 'font-semibold text-green-700'
                            : isBaseline
                              ? 'text-gray-400'
                              : 'text-gray-700'
                        }`}
                      >
                        {display}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatSignedDelta(seconds: number): string {
  const rounded = Math.round(seconds);
  if (rounded === 0) return '±0:00';
  const sign = rounded > 0 ? '+' : '−';
  const abs = Math.abs(rounded);
  const m = Math.floor(abs / 60);
  const s = abs % 60;
  return `${sign}${m}:${s.toString().padStart(2, '0')}`;
}
