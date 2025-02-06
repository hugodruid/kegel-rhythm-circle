import { useState, useEffect } from "react";
import { KegalTimer } from "@/components/KegalTimer";
import { ExerciseControls } from "@/components/ExerciseControls";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type TimerMode = 'normal' | 'fast';

const Index = () => {
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  const [mode, setMode] = useState<TimerMode>('normal');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive]);

  const handleToggle = () => {
    if (!isActive) {
      setTime(0);
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <h1 className="text-3xl font-semibold text-gray-800 mb-2">
        Kegel Training
      </h1>
      
      <div className="text-xl font-medium text-gray-600 mb-4">
        Time: {formatTime(time)}
      </div>

      {!isActive && (
        <div className="mb-8">
          <Select
            value={mode}
            onValueChange={(value: TimerMode) => setMode(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal (5s)</SelectItem>
              <SelectItem value="fast">Fast (2s)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="flex flex-col items-center">
        <KegalTimer isActive={isActive} mode={mode} />
        <ExerciseControls
          isActive={isActive}
          onToggle={handleToggle}
        />
      </div>
      
      <p className="mt-8 text-gray-600 max-w-md text-center">
        Synchronize your breathing with the circle's movement. 
        Inhale and squeeze as it expands, exhale and release as it contracts.
      </p>
    </div>
  );
};

export default Index;