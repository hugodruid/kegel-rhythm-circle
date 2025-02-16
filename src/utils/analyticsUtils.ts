
import { format, parseISO, startOfDay, differenceInDays } from "date-fns";

export interface SessionData {
  id: string;
  started_at: string;
  duration_seconds: number;
  mode: 'normal' | 'fast' | 'very-fast';
}

export interface DayData {
  date: string;
  totalDuration: number;
  sessions: {
    normal: number;
    fast: number;
    'very-fast': number;
  };
  details: Array<{
    mode: string;
    duration: number;
    time: string;
  }>;
}

export const processSessionData = (sessions: SessionData[]): DayData[] => {
  const dayMap = new Map<string, DayData>();

  sessions.forEach(session => {
    const dayKey = format(parseISO(session.started_at), 'yyyy-MM-dd');
    const existingDay = dayMap.get(dayKey);

    const sessionDetail = {
      mode: session.mode,
      duration: session.duration_seconds,
      time: format(parseISO(session.started_at), 'h:mm a')
    };

    if (existingDay) {
      existingDay.totalDuration += session.duration_seconds;
      existingDay.sessions[session.mode] += session.duration_seconds;
      existingDay.details.push(sessionDetail);
    } else {
      dayMap.set(dayKey, {
        date: dayKey,
        totalDuration: session.duration_seconds,
        sessions: {
          normal: session.mode === 'normal' ? session.duration_seconds : 0,
          fast: session.mode === 'fast' ? session.duration_seconds : 0,
          'very-fast': session.mode === 'very-fast' ? session.duration_seconds : 0
        },
        details: [sessionDetail]
      });
    }
  });

  return Array.from(dayMap.values());
};

export const getColorIntensity = (duration: number): string => {
  // Assuming max daily duration is 30 minutes (1800 seconds)
  const intensity = Math.min(duration / 1800, 1);
  // Generate a purple color with varying intensity
  const baseColor = [214, 188, 250]; // Light purple #D6BCFA
  const targetColor = [110, 89, 165]; // Dark purple #6E59A5
  
  const r = Math.round(baseColor[0] + (targetColor[0] - baseColor[0]) * intensity);
  const g = Math.round(baseColor[1] + (targetColor[1] - baseColor[1]) * intensity);
  const b = Math.round(baseColor[2] + (targetColor[2] - baseColor[2]) * intensity);
  
  return `rgb(${r}, ${g}, ${b})`;
};
