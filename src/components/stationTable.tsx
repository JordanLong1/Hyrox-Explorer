import { useState, type ReactNode } from 'react';
import type { StationStat } from '../lib/stats';
import { formatDuration, formatTime } from '../lib/time';

interface StationTableProps {
  stats: StationStat[];
}

// todo: move this to a reusable util
const STATION_NAMES = [
  'SkiErg',
  'Sled Push',
  'Sled Pull',
  'Burpees',
  'Rowing',
  'Farmers Carry',
  'Lunges',
  'Wall Balls',
];

type SortKey = 'order' | 'median' | 'spread';

export function StationTable({ stats }: StationTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('order');

  // Compute the spread once so we can both display and sort by it.
  // Done here (not in stats.ts) because it's a presentation concern —
  // the raw p25/p75 are what stats.ts cares about.
  const rows = stats.map((s) => ({
    ...s,
    name: STATION_NAMES[s.index],
    spread: s.p75 - s.p25,
  }));

  const sortedRows = [...rows].sort((a, b) => {
    if (sortKey === 'order') return a.index - b.index;
    if (sortKey === 'median') return b.median - a.median; // slowest first
    return b.spread - a.spread; // widest spread first
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-600 border-b border-gray-200">
            <th className="py-2 pr-4">
              <SortButton
                active={sortKey === 'order'}
                onClick={() => setSortKey('order')}
              >
                Station
              </SortButton>
            </th>
            <th className="py-2 px-4">25th</th>
            <th className="py-2 px-4">
              <SortButton
                active={sortKey === 'median'}
                onClick={() => setSortKey('median')}
              >
                Median
              </SortButton>
            </th>
            <th className="py-2 px-4">75th</th>
            <th className="py-2 pl-4">
              <SortButton
                active={sortKey === 'spread'}
                onClick={() => setSortKey('spread')}
              >
                Spread
              </SortButton>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => (
            <tr
              key={row.index}
              className="border-b border-gray-100 last:border-0"
            >
              <td className="py-2 pr-4 font-medium text-gray-900">
                {row.name}
              </td>
              <td className="py-2 px-4 text-gray-600 tabular-nums">
                {formatTime(row.p25)}
              </td>
              <td className="py-2 px-4 text-gray-900 font-medium tabular-nums">
                {formatTime(row.median)}
              </td>
              <td className="py-2 px-4 text-gray-600 tabular-nums">
                {formatTime(row.p75)}
              </td>
              <td className="py-2 pl-4 text-gray-600 tabular-nums">
                {row.p25 === 0 && row.p75 === 0
                  ? '—'
                  : formatDuration(row.spread)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SortButton({
  children,
  active,
  onClick,
}: {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 font-medium transition-colors ${
        active ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
      }`}
    >
      {children}
      <span
        aria-hidden="true"
        className={`inline-block w-3 text-xs ${
          active ? 'opacity-100' : 'opacity-0'
        }`}
      >
        ↓
      </span>
    </button>
  );
}
