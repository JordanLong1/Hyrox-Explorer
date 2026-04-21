import { useMemo, useState } from 'react';
import { EmptyState } from '@/shared/components/EmptyState';
import { useHyroxData } from '@/app/providers/useHyroxData';
import type { Division, Gender } from '@/shared/types/hyrox';

import { eventStats, seasonSummaries } from './stats';
import { SeasonCards } from './SeasonCards';
import { MedianFinishChart } from './MedianFinishChart';
import { FieldSizeChart } from './FieldSizeChart';

const DEFAULT_MIN_FINISHERS = 20;

// Only open and pro shown in the Trends view. Doubles and relay exist in the
// dataset but represent different formats — mixing them into a "state of the
// sport" chart would compare apples to oranges. Pacing Guide shows them
// because they're valid targets; Trends intentionally doesn't.
const DIVISIONS: Division[] = ['open', 'pro'];

export function Trends() {
  const results = useHyroxData();

  const [gender, setGender] = useState<Gender>('male');
  const [division, setDivision] = useState<Division>('open');
  const [minFinishers, setMinFinishers] = useState<number>(
    DEFAULT_MIN_FINISHERS,
  );

  const events = useMemo(
    () => eventStats(results, { gender, division, minFinishers }),
    [results, gender, division, minFinishers],
  );

  const seasons = useMemo(
    () => seasonSummaries(results, { gender, division }),
    [results, gender, division],
  );

  const hasEvents = events.length > 0;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Trends</h1>
        <p className="text-gray-600 mt-1">
          How Hyrox has changed across seasons 4–6. Adjust the filters to slice
          the field by gender and division.
        </p>
      </header>

      {/* Filters */}
      <section className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="trends-gender"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Gender
            </label>
            <select
              id="trends-gender"
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="trends-division"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Division
            </label>
            <select
              id="trends-division"
              value={division}
              onChange={(e) => setDivision(e.target.value as Division)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
            >
              {DIVISIONS.map((d) => (
                <option key={d} value={d}>
                  {d === 'open' ? 'Open' : 'Pro'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="trends-min-finishers"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Min finishers per event
            </label>
            <input
              id="trends-min-finishers"
              type="number"
              min={0}
              step={5}
              value={minFinishers}
              onChange={(e) => {
                const n = Number(e.target.value);
                setMinFinishers(Number.isFinite(n) && n >= 0 ? n : 0);
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
            />
          </div>
        </div>
      </section>

      <SeasonCards summaries={seasons} />

      {!hasEvents ? (
        <EmptyState
          title="No events match these filters"
          description="The minimum finishers threshold may be too high for this gender/division combination. Try lowering it."
        />
      ) : (
        <>
          <section className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Median finish time per event
            </h2>
            <p className="text-sm text-gray-600 mt-1 mb-4">
              Showing {events.length} events across seasons 4–6. Dashed lines
              mark season boundaries.
            </p>
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <div className="min-w-[600px]">
                <MedianFinishChart events={events} />
              </div>
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Field size per event
            </h2>
            <p className="text-sm text-gray-600 mt-1 mb-4">
              Number of finishers matching the selected gender and division.
            </p>
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <div className="min-w-[600px]">
                <FieldSizeChart events={events} />
              </div>
            </div>
          </section>
        </>
      )}

      {/* Methodology — always visible, even when empty, so the limitations
          are part of the reader's understanding of the page itself. */}
      <section
        aria-labelledby="methodology-heading"
        className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6 text-sm text-gray-700"
      >
        <h2
          id="methodology-heading"
          className="text-base font-semibold text-gray-900 mb-2"
        >
          Methodology
        </h2>
        <ul className="space-y-2 list-disc list-inside">
          <li>
            The dataset has no per-event date, only a season number and city.
            Events are ordered by season, then alphabetically by city within a
            season — an approximation of chronology, not a literal timeline.
          </li>
          <li>
            Small fields produce noisy medians. The minimum-finishers filter
            drops events whose filtered finisher count falls below the
            threshold. The default of 20 keeps most events visible across all
            gender/division combinations; raise it for stricter comparisons.
          </li>
          <li>
            Only open and pro divisions are shown. Doubles and relay are
            different formats and aren't directly comparable.
          </li>
        </ul>
      </section>
    </div>
  );
}
