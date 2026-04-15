import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import type { EventStat } from './stats';

interface FieldSizeChartProps {
  events: EventStat[];
}

/**
 * Field size per event. Shares the same x-axis ordering as MedianFinishChart
 * so the two can be read in tandem — a slow outlier event and its field size
 * line up vertically.
 */
export function FieldSizeChart({ events }: FieldSizeChartProps) {
  const data = events.map((e) => ({
    eventId: e.eventId,
    city: e.city,
    season: e.season,
    finisherCount: e.finisherCount,
  }));

  const seasonBoundaries: number[] = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i].season !== data[i - 1].season) {
      seasonBoundaries.push(i - 0.5);
    }
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={data}
        margin={{ top: 8, right: 16, bottom: 24, left: 16 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="eventId"
          tick={false}
          axisLine={{ stroke: '#9ca3af' }}
          label={{
            value: 'Events (same order as chart above)',
            position: 'insideBottom',
            offset: -4,
            style: { fontSize: 12, fill: '#6b7280' },
          }}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          width={60}
          tickFormatter={(v) => v.toLocaleString()}
        />
        {seasonBoundaries.map((x) => (
          <ReferenceLine
            key={x}
            x={data[Math.ceil(x)].eventId}
            stroke="#d1d5db"
            strokeDasharray="4 4"
          />
        ))}
        <Tooltip content={<FieldSizeTooltip />} />
        <Bar
          dataKey="finisherCount"
          fill="#f97316"
          radius={[2, 2, 0, 0]}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

function FieldSizeTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload: { city: string; season: number; finisherCount: number };
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
        {d.finisherCount.toLocaleString()} finishers
      </p>
    </div>
  );
}
