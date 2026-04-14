import { useState, useMemo } from 'react';
import { median } from '@/shared/lib/stats';
import { formatTime } from '@/shared/lib/time';
import type { Division, Gender } from '@/shared/types/hyrox';
import { EmptyState } from '@/shared/components/EmptyState';
import { useHyroxData } from '@/app/providers/DataProvider';

import { medianSplits, stationStats } from './stats';
import { SegmentChart } from './SegmentChart';
import { StationTable } from './StationTable';

const TARGET_TIMES = [
  { label: '1:00', seconds: 3600 },
  { label: '1:15', seconds: 4500 },
  { label: '1:30', seconds: 5400 },
  { label: '1:45', seconds: 6300 },
  { label: '2:00', seconds: 7200 },
  { label: '2:15', seconds: 8100 },
  { label: '2:30', seconds: 9000 },
];

const TARGET_WINDOW_SECONDS = 120;
const MIN_SAMPLE_SIZE = 20;

export function PacingGuide() {
  const results = useHyroxData();
  const [targetSeconds, setTargetSeconds] = useState<number>(5400);
  const [gender, setGender] = useState<Gender>('male');
  const [division, setDivision] = useState<Division>('open');

  const filteredResults = useMemo(() => {
    return results.filter(
      (r) =>
        r.gender === gender &&
        r.division === division &&
        Math.abs(r.totalTime - targetSeconds) <= TARGET_WINDOW_SECONDS,
    );
  }, [results, gender, division, targetSeconds]);

  const medians = useMemo(
    () => medianSplits(filteredResults),
    [filteredResults],
  );

  const stations = useMemo(
    () => stationStats(filteredResults),
    [filteredResults],
  );

  const headlineStats = useMemo(() => {
    return {
      runTime: median(filteredResults.map((r) => r.runTime)),
      workTime: median(filteredResults.map((r) => r.workTime)),
      roxzoneTime: median(filteredResults.map((r) => r.roxzoneTime)),
    };
  }, [filteredResults]);

  const sampleSize = filteredResults.length;
  const hasData = sampleSize > 0;
  const isLowSample = hasData && sampleSize < MIN_SAMPLE_SIZE;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Pacing Guide
        </h1>
        <p className="text-gray-600 mt-1">
          Pick a target finish time and see what splits you need to hit.
        </p>
      </header>

      {/* Filters */}
      <section className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="target-time"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Target finish time
            </label>
            <select
              id="target-time"
              value={targetSeconds}
              onChange={(e) => setTargetSeconds(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
            >
              {TARGET_TIMES.map((t) => (
                <option key={t.seconds} value={t.seconds}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Gender
            </label>
            <select
              id="gender"
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
              htmlFor="division"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Division
            </label>
            <select
              id="division"
              value={division}
              onChange={(e) => setDivision(e.target.value as Division)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="open">Open</option>
              <option value="pro">Pro</option>
              <option value="relay">Relay</option>
              <option value="doubles">Doubles</option>
            </select>
          </div>
        </div>
      </section>

      {/* Empty state OR visualizations */}
      {!hasData ? (
        <EmptyState
          title="No athletes match these filters"
          description="Try widening your target time, switching divisions, or picking a different gender. Some combinations have very few finishers."
        />
      ) : (
        <>
          {isLowSample && (
            <div
              role="alert"
              className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900"
            >
              <p className="font-medium">Small sample size warning</p>
              <p className="mt-1">
                Only {sampleSize} {sampleSize === 1 ? 'athlete' : 'athletes'}{' '}
                match these filters. The medians shown below may not be
                representative — try widening your target time or changing other
                filters for a more reliable estimate.
              </p>
            </div>
          )}

          {/* Headline stats */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <p className="text-sm text-gray-500">Total run time</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatTime(headlineStats.runTime)}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <p className="text-sm text-gray-500">Total work time</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatTime(headlineStats.workTime)}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <p className="text-sm text-gray-500">Total roxzone time</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatTime(headlineStats.roxzoneTime)}
              </p>
            </div>
          </section>

          <p className="text-sm text-gray-500">
            Based on {sampleSize.toLocaleString()} athletes who finished within
            {' '}
            ±
            {TARGET_WINDOW_SECONDS % 60 === 0
              ? `${TARGET_WINDOW_SECONDS / 60} minute${
                  TARGET_WINDOW_SECONDS / 60 === 1 ? '' : 's'
                }`
              : `${Math.floor(TARGET_WINDOW_SECONDS / 60) > 0
                  ? `${Math.floor(TARGET_WINDOW_SECONDS / 60)} minute${
                      Math.floor(TARGET_WINDOW_SECONDS / 60) === 1 ? '' : 's'
                    } `
                  : ''}${TARGET_WINDOW_SECONDS % 60} second${
                  TARGET_WINDOW_SECONDS % 60 === 1 ? '' : 's'
                }`}{' '}
            of your target.
          </p>

          {/* Segment chart */}
          <section className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Segment-by-segment breakdown
            </h2>
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <div className="min-w-[600px]">
                <SegmentChart medians={medians} />
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm bg-blue-500" />
                Run
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm bg-orange-500" />
                Station
              </div>
            </div>
          </section>

          {/* Station table */}
          <section className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Station breakdown
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              25th and 75th percentiles show the spread of times at each
              station. Click a column header to sort.
            </p>
            <StationTable stats={stations} />
          </section>
        </>
      )}
    </div>
  );
}
