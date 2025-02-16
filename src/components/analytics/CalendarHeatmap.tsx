
import { useMemo } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip } from 'recharts';
import { format, parseISO, startOfWeek, addWeeks, getDay } from 'date-fns';
import type { DayData } from '@/utils/analyticsUtils';
import { getColorIntensity } from '@/utils/analyticsUtils';

interface CalendarHeatmapProps {
  data: DayData[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.[0]?.payload) return null;

  const data: DayData = payload[0].payload;
  const date = parseISO(data.date);

  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
      <p className="font-semibold mb-2">{format(date, 'MMMM d, yyyy')}</p>
      <p className="text-sm mb-2">Total Exercise: {Math.round(data.totalDuration)} seconds</p>
      <div className="space-y-1">
        {Object.entries(data.sessions).map(([mode, duration]) => (
          duration > 0 && (
            <div key={mode} className="text-sm">
              • {mode.charAt(0).toUpperCase() + mode.slice(1)}: {duration}s
            </div>
          )
        ))}
      </div>
      <div className="mt-2 text-xs text-gray-500">
        Sessions: {data.details.length}
      </div>
    </div>
  );
};

export const CalendarHeatmap = ({ data }: CalendarHeatmapProps) => {
  const chartData = useMemo(() => {
    const today = new Date();
    const startDate = startOfWeek(today);
    const weeksToShow = 12; // Show 12 weeks of data

    const processedData = [];
    for (let week = 0; week < weeksToShow; week++) {
      for (let day = 0; day < 7; day++) {
        const currentDate = addWeeks(startDate, -week);
        currentDate.setDate(currentDate.getDate() + day);
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        
        const dayData = data.find(d => d.date === dateStr) || {
          date: dateStr,
          totalDuration: 0,
          sessions: { normal: 0, fast: 0, 'very-fast': 0 },
          details: []
        };

        processedData.push({
          ...dayData,
          x: week,
          y: day,
        });
      }
    }
    return processedData;
  }, [data]);

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 10, right: 0, bottom: 10, left: 0 }}
        >
          <XAxis
            type="number"
            dataKey="x"
            domain={[0, 11]}
            tick={false}
            axisLine={false}
          />
          <YAxis
            type="number"
            dataKey="y"
            domain={[0, 6]}
            tick={false}
            axisLine={false}
          />
          <ZAxis type="number" dataKey="totalDuration" range={[500, 500]} />
          <Tooltip content={<CustomTooltip />} />
          <Scatter
            data={chartData}
            shape="square"
            fill="#D6BCFA"
            fillOpacity={0.8}
            animationBegin={200}
            animationDuration={400}
          >
            {chartData.map((entry, index) => (
              <cell
                key={index}
                fill={entry.totalDuration > 0 ? getColorIntensity(entry.totalDuration) : '#F1F0FB'}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
