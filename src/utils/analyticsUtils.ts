
import { format, parseISO, startOfDay, differenceInDays } from "date-fns";

export interface SessionData {
  id: string;
  started_at: string;
  duration_seconds: number;
  mode: 'normal' | 'fast' | 'very-fast';
  exercise_type?: 'kegal' | 'relaxation';
}

export interface DayData {
  date: string;
  totalDuration: number;
  sessions: {
    normal: number;
    fast: number;
    'very-fast': number;
  };
  exerciseTypes: {
    kegal: number;
    relaxation: number;
  };
  details: Array<{
    mode: string;
    duration: number;
    time: string;
    exercise_type?: string;
  }>;
}

export const processSessionData = (sessions: SessionData[]): DayData[] => {
  const dayMap = new Map<string, DayData>();

  sessions.forEach(session => {
    const dayKey = format(parseISO(session.started_at), 'yyyy-MM-dd');
    const existingDay = dayMap.get(dayKey);
    const exerciseType = session.exercise_type || 'kegal'; // Default to kegal if not specified

    const sessionDetail = {
      mode: session.mode,
      duration: session.duration_seconds,
      time: format(parseISO(session.started_at), 'h:mm a'),
      exercise_type: exerciseType
    };

    if (existingDay) {
      existingDay.totalDuration += session.duration_seconds;
      existingDay.sessions[session.mode] += session.duration_seconds;
      existingDay.exerciseTypes[exerciseType] += session.duration_seconds;
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
        exerciseTypes: {
          kegal: exerciseType === 'kegal' ? session.duration_seconds : 0,
          relaxation: exerciseType === 'relaxation' ? session.duration_seconds : 0
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

export const getExerciseTypeColorIntensity = (duration: number, type: 'kegal' | 'relaxation'): string => {
  // Assuming max daily duration is 30 minutes (1800 seconds)
  const intensity = Math.min(duration / 1800, 1);
  
  if (type === 'kegal') {
    // Ocean Blue colors
    const baseColor = [224, 242, 254]; // Light blue #E0F2FE
    const targetColor = [14, 165, 233]; // Ocean blue #0EA5E9
    
    const r = Math.round(baseColor[0] + (targetColor[0] - baseColor[0]) * intensity);
    const g = Math.round(baseColor[1] + (targetColor[1] - baseColor[1]) * intensity);
    const b = Math.round(baseColor[2] + (targetColor[2] - baseColor[2]) * intensity);
    
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Green colors
    const baseColor = [220, 252, 231]; // Light green #DCF2E7
    const targetColor = [34, 197, 94]; // Green #22C55E
    
    const r = Math.round(baseColor[0] + (targetColor[0] - baseColor[0]) * intensity);
    const g = Math.round(baseColor[1] + (targetColor[1] - baseColor[1]) * intensity);
    const b = Math.round(baseColor[2] + (targetColor[2] - baseColor[2]) * intensity);
    
    return `rgb(${r}, ${g}, ${b})`;
  }
};
