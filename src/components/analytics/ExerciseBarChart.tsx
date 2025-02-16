
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO, subDays } from 'date-fns';
import type { DayData } from '@/utils/analyticsUtils';

interface ExerciseBarChartProps {
  data: DayData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;

  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
      <p className="font-semibold mb-2">{format(parseISO(label), 'MMM d')}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="text-sm">
          • {entry.dataKey.charAt(0).toUpperCase() + entry.dataKey.slice(1)}: {Math.round(entry.value)}s
        </div>
      ))}
    </div>
  );
};

export const ExerciseBarChart = ({ data }: ExerciseBarChartProps) => {
  const last8Days = Array.from({ length: 8 }, (_, i) => {
    const date = format(subDays(new Date(), 7 - i), 'yyyy-MM-dd');
    const dayData = data.find(d => d.date === date) || {
      date,
      sessions: { normal: 0, fast: 0, 'very-fast': 0 }
    };
    return {
      date,
      ...dayData.sessions
    };
  });

  const formatYAxis = (value: number) => {
    if (value === 0) return '0';
    if (value < 60) return `${value}s`;
    return `${Math.floor(value / 60)}m`;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={last8Days}
          margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
        >
          <XAxis 
            dataKey="date"
            tickFormatter={(date) => format(parseISO(date), 'MMM d')}
            tick={{ fontSize: 12, fill: '#666' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#666' }}
            tickFormatter={formatYAxis}
            ticks={[0, 30, 60, 90, 120, 150, 180]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="normal" stackId="a" fill="#D6BCFA" />
          <Bar dataKey="fast" stackId="a" fill="#9F7AEA" />
          <Bar dataKey="very-fast" stackId="a" fill="#6E59A5" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
