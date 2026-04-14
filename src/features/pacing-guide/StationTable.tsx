import { useState, type ReactNode } from 'react';
import { formatTime, formatDuration } from '@/shared/lib/time';
import type { StationStat } from './stats';

interface StationTableProps {
  stats: StationStat[];
}
// todo: move to reusable
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
type SortDirection = 'asc' | 'desc';

// Each sort key has a sensible default direction.
// Race order is naturally ascending, but for performance metrics we want
// the "interesting" values (slowest, widest spread) on top by default.
const DEFAULT_DIRECTIONS: Record<SortKey, SortDirection> = {
  order: 'asc',
  median: 'desc',
  spread: 'desc',
};

export function StationTable({ stats }: StationTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('order');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      // Clicking the active column flips direction.
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      // Switching columns uses that column's default direction.
      setSortKey(key);
      setSortDirection(DEFAULT_DIRECTIONS[key]);
    }
  };

  const rows = stats.map((s) => ({
    ...s,
    name: STATION_NAMES[s.index],
    spread: s.p75 - s.p25,
  }));

  const sortedRows = [...rows].sort((a, b) => {
    const dir = sortDirection === 'asc' ? 1 : -1;
    if (sortKey === 'order') return (a.index - b.index) * dir;
    if (sortKey === 'median') return (a.median - b.median) * dir;
    return (a.spread - b.spread) * dir;
  });

  // ariaSort returns the value the WAI-ARIA spec wants on a sortable column.
  const ariaSort = (key: SortKey): 'ascending' | 'descending' | 'none' => {
    if (key !== sortKey) return 'none';
    return sortDirection === 'asc' ? 'ascending' : 'descending';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-600 border-b border-gray-200">
            <th className="py-2 pr-4" aria-sort={ariaSort('order')}>
              <SortButton
                active={sortKey === 'order'}
                direction={sortDirection}
                onClick={() => handleSort('order')}
              >
                Station
              </SortButton>
            </th>
            <th className="py-2 px-4">25th</th>
            <th className="py-2 px-4" aria-sort={ariaSort('median')}>
              <SortButton
                active={sortKey === 'median'}
                direction={sortDirection}
                onClick={() => handleSort('median')}
              >
                Median
              </SortButton>
            </th>
            <th className="py-2 px-4">75th</th>
            <th className="py-2 pl-4" aria-sort={ariaSort('spread')}>
              <SortButton
                active={sortKey === 'spread'}
                direction={sortDirection}
                onClick={() => handleSort('spread')}
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
                {row.p25 > 0 && row.p75 > 0 ? formatDuration(row.spread) : '—'}
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
  direction,
  onClick,
}: {
  children: ReactNode;
  active: boolean;
  direction: SortDirection;
  onClick: () => void;
}) {
  return (
    <button
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
        {direction === 'asc' ? '↑' : '↓'}
      </span>
    </button>
  );
}
