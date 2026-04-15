import { useMemo, useState } from 'react';
import type { Division, Gender, HyroxResult } from '@/shared/types/hyrox';
import { formatTime } from '@/shared/lib/time';
import { compareByEventName } from '@/shared/lib/eventName';
import { athleteKey } from './stats';

interface AthleteSelectorProps {
  results: HyroxResult[];
  selectedKeys: Set<string>;
  canAdd: boolean;
  onAdd: (result: HyroxResult, rowIndex: number) => void;
}

const LEADERBOARD_LIMIT = 200;

/**
 * Panel UX: pick an event, narrow by gender/division, click a row to add.
 * We cap the visible leaderboard to keep the DOM small; the biggest events
 * have ~1850 finishers and we don't need to render them all to let the user
 * pick a top-N result.
 */
export function AthleteSelector({
  results,
  selectedKeys,
  canAdd,
  onAdd,
}: AthleteSelectorProps) {
  // Build an event list once from the dataset: unique events, ordered by
  // season then city so the dropdown reads like the Trends axis.
  const events = useMemo(() => {
    const seen = new Map<string, { eventId: string; eventName: string }>();
    for (const r of results) {
      if (!seen.has(r.eventId)) {
        seen.set(r.eventId, { eventId: r.eventId, eventName: r.eventName });
      }
    }
    return [...seen.values()].sort((a, b) =>
      compareByEventName(a.eventName, b.eventName),
    );
  }, [results]);

  const [eventId, setEventId] = useState<string>(events[0]?.eventId ?? '');
  const [gender, setGender] = useState<Gender>('male');
  const [division, setDivision] = useState<Division>('open');

  // Results are indexed rather than filtered on a copy so we can hand the
  // original row index back to the parent for stable keys.
  const leaderboard = useMemo(() => {
    const matches: Array<{ result: HyroxResult; rowIndex: number }> = [];
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      if (
        r.eventId === eventId &&
        r.gender === gender &&
        r.division === division
      ) {
        matches.push({ result: r, rowIndex: i });
      }
    }
    matches.sort((a, b) => a.result.totalTime - b.result.totalTime);
    return {
      visible: matches.slice(0, LEADERBOARD_LIMIT),
      total: matches.length,
    };
  }, [results, eventId, gender, division]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Add athletes</h2>
        <p className="text-sm text-gray-600 mt-1">
          Pick an event, then click an athlete's row to add them. Up to 4
          athletes can be compared.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="compare-event"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Event
          </label>
          <select
            id="compare-event"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
          >
            {events.map((ev) => (
              <option key={ev.eventId} value={ev.eventId}>
                {ev.eventName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="compare-gender"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Gender
          </label>
          <select
            id="compare-gender"
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
            htmlFor="compare-division"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Division
          </label>
          <select
            id="compare-division"
            value={division}
            onChange={(e) => setDivision(e.target.value as Division)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
          >
            <option value="open">Open</option>
            <option value="pro">Pro</option>
            <option value="doubles">Doubles</option>
            <option value="relay">Relay</option>
          </select>
        </div>
      </div>

      {!canAdd && (
        <p
          role="status"
          className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2"
        >
          Maximum of 4 athletes selected. Remove one to add another.
        </p>
      )}

      {leaderboard.total === 0 ? (
        <p className="text-sm text-gray-500 italic">
          No athletes at this event match those filters.
        </p>
      ) : (
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left font-medium text-gray-700 px-3 py-2 w-12">
                    #
                  </th>
                  <th className="text-left font-medium text-gray-700 px-3 py-2">
                    Finish
                  </th>
                  <th className="text-left font-medium text-gray-700 px-3 py-2">
                    Age
                  </th>
                  <th className="text-left font-medium text-gray-700 px-3 py-2">
                    Country
                  </th>
                  <th className="px-3 py-2 w-24" />
                </tr>
              </thead>
              <tbody>
                {leaderboard.visible.map(({ result, rowIndex }, i) => {
                  const key = athleteKey(result, rowIndex);
                  const alreadySelected = selectedKeys.has(key);
                  const disabled = alreadySelected || !canAdd;
                  return (
                    <tr
                      key={key}
                      className="border-t border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-3 py-2 text-gray-500 tabular-nums">
                        {i + 1}
                      </td>
                      <td className="px-3 py-2 font-medium text-gray-900 tabular-nums">
                        {formatTime(result.totalTime)}
                      </td>
                      <td className="px-3 py-2 text-gray-600">
                        {result.ageGroup || '—'}
                      </td>
                      <td className="px-3 py-2 text-gray-600">
                        {result.nationality?.trim() || '—'}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => onAdd(result, rowIndex)}
                          className="text-xs font-medium px-2 py-1 rounded-md border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed"
                        >
                          {alreadySelected ? 'Added' : 'Add'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {leaderboard.total > LEADERBOARD_LIMIT && (
            <p className="text-xs text-gray-500 px-3 py-2 bg-gray-50 border-t border-gray-200">
              Showing top {LEADERBOARD_LIMIT} of{' '}
              {leaderboard.total.toLocaleString()} finishers. Narrow by gender
              or division to see more.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
