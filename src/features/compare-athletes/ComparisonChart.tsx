import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { formatDuration, formatTime } from '@/shared/lib/time';
import type { HyroxResult } from '@/shared/types/hyrox';
import { ATHLETE_COLORS } from './colors';
import {
  SEGMENT_ORDER,
  formatAthleteShortLabel,
  segmentTime,
} from './stats';

interface ComparisonChartProps {
  athletes: HyroxResult[];
}

/**
 * Grouped bars: one group per race segment (8 runs + 8 stations = 16), one
 * bar per selected athlete within each group. Athlete colors are positional,
 * matching the chips and summary cards.
 *
 * We store bar values on the data rows under keys `a0`…`a3` so Recharts can
 * render one <Bar> per athlete — dataKey has to be a static string, not a
 * dynamic function.
 */
export function ComparisonChart({ athletes }: ComparisonChartProps) {
  const data = SEGMENT_ORDER.map((pos) => {
    const row: Record<string, number | string> = {
      name: pos.label,
      kind: pos.kind,
    };
    athletes.forEach((a, i) => {
      row[`a${i}`] = segmentTime(a, pos);
    });
    return row;
  });

  const labels = athletes.map((a) => formatAthleteShortLabel(a));

  return (
    <ResponsiveContainer width="100%" height={380}>
      <BarChart
        data={data}
        margin={{ top: 8, right: 16, bottom: 60, left: 16 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
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
        <Tooltip content={<SegmentTooltip labels={labels} />} />
        <Legend
          verticalAlign="top"
          height={36}
          wrapperStyle={{ fontSize: 12 }}
          formatter={(_value, _entry, index) => labels[index] ?? ''}
        />
        {athletes.map((_, i) => (
          <Bar
            key={i}
            dataKey={`a${i}`}
            fill={ATHLETE_COLORS[i].hex}
            radius={[2, 2, 0, 0]}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

function SegmentTooltip({
  active,
  payload,
  label,
  labels,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
  labels: string[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white border border-gray-200 rounded px-3 py-2 shadow-sm text-sm">
      <p className="font-medium text-gray-900 mb-1">{label}</p>
      <ul className="space-y-0.5">
        {payload.map((p) => {
          const idx = Number(p.dataKey.replace('a', ''));
          return (
            <li key={p.dataKey} className="flex items-center gap-2">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: p.color }}
                aria-hidden="true"
              />
              <span className="text-gray-600 truncate max-w-[220px]">
                {labels[idx]}
              </span>
              <span className="ml-auto font-medium text-gray-900 tabular-nums">
                {formatTime(p.value)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
