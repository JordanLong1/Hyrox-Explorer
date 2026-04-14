import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatDuration, formatTime } from '@/shared/lib/time';
import type { MedianSplits } from './stats';

interface SegmentChartProps {
  medians: MedianSplits;
}

// The 8 Hyrox stations in order. These map to work_1 through work_8.
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

// Colors for the two segment types.
const COLORS = {
  run: '#3b82f6', // blue
  station: '#f97316', // orange
};

interface SegmentDataPoint {
  name: string;
  seconds: number;
  type: 'run' | 'station';
}

/**
 * Transform the medians into a flat array of data points in race order:
 * Run 1, SkiErg, Run 2, Sled Push, Run 3, Sled Pull, ...
 *
 */
function buildChartData(medians: MedianSplits): SegmentDataPoint[] {
  const data: SegmentDataPoint[] = [];

  for (let i = 0; i < 8; i++) {
    data.push({
      name: `Run ${i + 1}`,
      seconds: medians.runs[i],
      type: 'run',
    });
    data.push({
      name: STATION_NAMES[i],
      seconds: medians.works[i],
      type: 'station',
    });
  }

  return data;
}

/**
 * Custom tooltip so we show formatted time instead of raw seconds.
 */
function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: SegmentDataPoint }>;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded px-3 py-2 shadow-sm text-sm">
      <p className="font-medium text-gray-900">{data.name}</p>
      <p className="text-gray-600">{formatTime(data.seconds)}</p>
    </div>
  );
}

export function SegmentChart({ medians }: SegmentChartProps) {
  const data = buildChartData(medians);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={data}
        margin={{ top: 8, right: 16, bottom: 40, left: 16 }}
      >
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11 }}
          angle={-45}
          textAnchor="end"
          interval={0}
        />
        <YAxis
          tickFormatter={formatDuration}
          tick={{ fontSize: 12 }}
          width={50}
        />
        <Tooltip content={<ChartTooltip />} />
        <Bar dataKey="seconds" radius={[4, 4, 0, 0]}>
          {data.map((entry) => (
            <Cell
              key={entry.name}
              fill={entry.type === 'run' ? COLORS.run : COLORS.station}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
