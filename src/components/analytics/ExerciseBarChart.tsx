
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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
      <div className="mb-2">
        <p className="font-medium text-sm">Exercise Types:</p>
        {payload
          .filter((entry: any) => entry.dataKey.includes('type_'))
          .map((entry: any) => (
            entry.value > 0 && (
              <div key={entry.dataKey} className="text-sm">
                • {entry.dataKey === 'type_kegal' ? 'Kegel' : 'Relaxation'}: {Math.round(entry.value)}s
              </div>
            )
          ))}
      </div>
      <p className="font-medium text-sm">Speeds:</p>
      {payload
        .filter((entry: any) => !entry.dataKey.includes('type_'))
        .map((entry: any) => (
          entry.value > 0 && (
            <div key={entry.dataKey} className="text-sm">
              • {entry.dataKey.charAt(0).toUpperCase() + entry.dataKey.slice(1)}: {Math.round(entry.value)}s
            </div>
          )
        ))}
    </div>
  );
};

export const ExerciseBarChart = ({ data }: ExerciseBarChartProps) => {
  const last8Days = Array.from({ length: 8 }, (_, i) => {
    const date = format(subDays(new Date(), 7 - i), 'yyyy-MM-dd');
    const dayData = data.find(d => d.date === date) || {
      date,
      sessions: { normal: 0, fast: 0, 'very-fast': 0 },
      exerciseTypes: { kegal: 0, relaxation: 0 }
    };
    return {
      date,
      ...dayData.sessions,
      type_kegal: dayData.exerciseTypes?.kegal || 0,
      type_relaxation: dayData.exerciseTypes?.relaxation || 0
    };
  });

  const formatYAxis = (value: number) => {
    if (value === 0) return '0';
    if (value < 60) return `${value}s`;
    const minutes = Math.floor(value / 60);
    const seconds = value % 60;
    return seconds > 0 ? `${minutes}m${seconds}s` : `${minutes}m`;
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
          <Legend 
            verticalAlign="top" 
            height={36} 
            formatter={(value) => {
              if (value === 'type_kegal') return 'Kegel';
              if (value === 'type_relaxation') return 'Relaxation';
              return value.charAt(0).toUpperCase() + value.slice(1);
            }}
          />
          
          {/* Exercise type bars */}
          <Bar 
            dataKey="type_kegal" 
            name="Kegel" 
            stackId="type" 
            fill="#0EA5E9" 
            fillOpacity={0.8} 
          />
          <Bar 
            dataKey="type_relaxation" 
            name="Relaxation" 
            stackId="type" 
            fill="#22C55E" 
            fillOpacity={0.8} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
