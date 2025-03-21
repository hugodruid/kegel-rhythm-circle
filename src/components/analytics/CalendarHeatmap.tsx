
import { useMemo } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell, Legend } from 'recharts';
import { format, parseISO, startOfWeek, addWeeks, eachMonthOfInterval, subWeeks, differenceInDays } from 'date-fns';
import type { DayData } from '@/utils/analyticsUtils';
import { getExerciseTypeColorIntensity } from '@/utils/analyticsUtils';
import { useIsMobile } from '@/hooks/use-mobile';

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
      
      <div className="mb-2">
        <p className="font-medium text-xs">Exercise Types:</p>
        {Object.entries(data.exerciseTypes || {}).map(([type, duration]) => (
          duration > 0 && (
            <div key={type} className="text-sm">
              • {type === 'kegal' ? 'Kegel' : 'Relaxation'}: {Math.round(duration)}s
            </div>
          )
        ))}
      </div>
      
      <div className="mb-2">
        <p className="font-medium text-xs">Speeds:</p>
        {Object.entries(data.sessions).map(([mode, duration]) => (
          duration > 0 && (
            <div key={mode} className="text-sm">
              • {mode.charAt(0).toUpperCase() + mode.slice(1)}: {Math.round(duration)}s
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
  const isMobile = useIsMobile();
  const weeksToShow = isMobile ? 8 : 12;

  const { chartData, monthLabels } = useMemo(() => {
    const today = new Date();
    const endDate = today;
    const startViewDate = subWeeks(endDate, weeksToShow - 1);
    // Set Monday as start of week
    const startDate = startOfWeek(startViewDate, { weekStartsOn: 1 });

    // Generate month labels
    const months = eachMonthOfInterval({
      start: startViewDate,
      end: endDate
    });

    const monthLabels = months.map(date => ({
      x: Math.floor(differenceInDays(date, startViewDate) / 7),
      label: format(date, 'MMM')
    }));

    const processedData = [];
    for (let week = 0; week < weeksToShow; week++) {
      for (let day = 0; day < 7; day++) {
        const currentDate = addWeeks(startDate, week);
        currentDate.setDate(currentDate.getDate() + day);
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        
        const dayData = data.find(d => d.date === dateStr) || {
          date: dateStr,
          totalDuration: 0,
          sessions: { normal: 0, fast: 0, 'very-fast': 0 },
          exerciseTypes: { kegal: 0, relaxation: 0 },
          details: []
        };

        // Determine the dominant exercise type for coloring
        let dominantType: 'kegal' | 'relaxation' = 'kegal';
        if ((dayData.exerciseTypes?.relaxation || 0) > (dayData.exerciseTypes?.kegal || 0)) {
          dominantType = 'relaxation';
        }

        processedData.push({
          ...dayData,
          x: week,
          y: day,
          dominantType
        });
      }
    }
    return { chartData: processedData, monthLabels };
  }, [data, weeksToShow]);

  // Updated day labels to start with Monday
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="w-full">
      <div className="relative">
        <ResponsiveContainer width="100%" height={isMobile ? 240 : 280}>
          <ScatterChart
            margin={isMobile ? 
              { top: 20, right: 5, bottom: 20, left: 30 } : 
              { top: 20, right: 20, bottom: 20, left: 45 }
            }
          >
            <XAxis
              type="number"
              dataKey="x"
              domain={[0, weeksToShow - 1]}
              tick={false}
              axisLine={false}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={[0, 6]}
              tickFormatter={(value) => isMobile ? dayLabels[value].slice(0, 1) : dayLabels[value]}
              tick={{ fontSize: isMobile ? 10 : 12, fill: '#666' }}
              axisLine={false}
              dx={isMobile ? -5 : -10}
            />
            <ZAxis 
              type="number" 
              dataKey="totalDuration" 
              range={[isMobile ? 300 : 500, isMobile ? 300 : 500]} 
            />
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
                <Cell
                  key={index}
                  fill={entry.totalDuration > 0 
                    ? getExerciseTypeColorIntensity(entry.totalDuration, entry.dominantType) 
                    : '#F1F0FB'
                  }
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        
        {/* Month labels */}
        <div className={`absolute top-0 ${isMobile ? 'left-32' : 'left-44'} right-0 flex justify-start pl-2`}>
          {monthLabels.map((month, index) => (
            <div
              key={index}
              className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}
              style={{
                position: 'absolute',
                left: `${(month.x / weeksToShow) * 100}%`,
                transform: 'translateX(-50%)'
              }}
            >
              {month.label}
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex justify-center space-x-4 mt-2">
        <div className="flex items-center">
          <div className="w-3 h-3 mr-1 rounded-sm" style={{ backgroundColor: '#0EA5E9' }}></div>
          <span className="text-xs text-gray-600">Kegel</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 mr-1 rounded-sm" style={{ backgroundColor: '#22C55E' }}></div>
          <span className="text-xs text-gray-600">Relaxation</span>
        </div>
      </div>
    </div>
  );
};
