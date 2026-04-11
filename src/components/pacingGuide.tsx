import { useState } from 'react';
import type { HyroxResult, Division, Gender } from '../types/hyrox';

interface PacingGuideProps {
  results: HyroxResult[];
}

// Target finish times in seconds. We pick a sensible range of common goals.
const TARGET_TIMES = [
  { label: '1:00', seconds: 3600 },
  { label: '1:15', seconds: 4500 },
  { label: '1:30', seconds: 5400 },
  { label: '1:45', seconds: 6300 },
  { label: '2:00', seconds: 7200 },
  { label: '2:15', seconds: 8100 },
  { label: '2:30', seconds: 9000 },
];

export function PacingGuide({ results }: PacingGuideProps) {
  const [targetSeconds, setTargetSeconds] = useState<number>(5400); // default 1:30
  const [gender, setGender] = useState<Gender>('male');
  const [division, setDivision] = useState<Division>('open');

  // ... rest of the component
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Pacing Guide</h1>
        <p className="text-gray-600 mt-1">
          Pick a target finish time and see what splits you need to hit.
        </p>
      </header>

      {/* Filters */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Target time */}
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

          {/* Gender */}
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

          {/* Division */}
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
            </select>
          </div>
        </div>
      </section>

      {/* Headline stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Total run time</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">--:--</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Total work time</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">--:--</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Total roxzone time</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">--:--</p>
        </div>
      </section>

      {/* Segment chart */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Segment-by-segment breakdown
        </h2>
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
          [Chart goes here]
        </div>
      </section>

      {/* Station table */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Station breakdown
        </h2>
        <p className="text-gray-500 text-sm">[Station table goes here]</p>
      </section>

      {/* Debug: current filter state. Remove later. */}
      <pre className="text-xs bg-gray-100 p-3 rounded text-gray-600">
        {JSON.stringify({ targetSeconds, gender, division }, null, 2)}
      </pre>
    </div>
  );
}
