import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { formatDuration, formatTime } from '@/shared/lib/time';
import type { EventStat } from './stats';

interface MedianFinishChartProps {
  events: EventStat[];
}

/**
 * Line chart of median finish time per event, x-axis ordered by season then
 * city. Season boundaries are marked with vertical reference lines so the
 * reader can read within-season variance vs. season-to-season shifts.
 *
 * Tick labels on the x-axis would be unreadable at 87 events wide, so we hide
 * them and put the event name in the tooltip instead.
 */
export function MedianFinishChart({ events }: MedianFinishChartProps) {
  const data = events.map((e) => ({
    eventId: e.eventId,
    city: e.city,
    season: e.season,
    eventName: e.eventName,
    finisherCount: e.finisherCount,
    medianFinish: e.medianFinish,
  }));

  // Compute x-positions where the season changes — these become reference lines.
  const seasonBoundaries: number[] = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i].season !== data[i - 1].season) {
      seasonBoundaries.push(i - 0.5);
    }
  }

  return (
    <ResponsiveContainer width="100%" height={340}>
      <LineChart
        data={data}
        margin={{ top: 8, right: 16, bottom: 24, left: 16 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="eventId"
          tick={false}
          axisLine={{ stroke: '#9ca3af' }}
          label={{
            value: 'Events (S4 → S5 → S6, alphabetical by city within season)',
            position: 'insideBottom',
            offset: -4,
            style: { fontSize: 12, fill: '#6b7280' },
          }}
        />
        <YAxis
          tickFormatter={formatDuration}
          tick={{ fontSize: 12 }}
          width={60}
          domain={['auto', 'auto']}
        />
        {seasonBoundaries.map((x) => (
          <ReferenceLine
            key={x}
            x={data[Math.ceil(x)].eventId}
            stroke="#d1d5db"
            strokeDasharray="4 4"
          />
        ))}
        <Tooltip content={<FinishTooltip />} />
        <Line
          type="monotone"
          dataKey="medianFinish"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ r: 2, fill: '#3b82f6' }}
          activeDot={{ r: 5 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function FinishTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload: {
      city: string;
      season: number;
      medianFinish: number;
      finisherCount: number;
    };
  }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded px-3 py-2 shadow-sm text-sm">
      <p className="font-medium text-gray-900">
        S{d.season} {d.city}
      </p>
      <p className="text-gray-600 mt-0.5">
        Median {formatTime(d.medianFinish)}
      </p>
      <p className="text-gray-500 text-xs mt-0.5">
        {d.finisherCount.toLocaleString()} finishers
      </p>
    </div>
  );
}
