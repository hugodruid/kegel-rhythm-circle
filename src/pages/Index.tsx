import { useState, useEffect } from "react";
import { KegalTimer } from "@/components/KegalTimer";
import { ExerciseControls } from "@/components/ExerciseControls";
import { Slider } from "@/components/ui/slider";

type TimerMode = 'normal' | 'fast' | 'very-fast';

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

  const handleSliderChange = (value: number[]) => {
    switch (value[0]) {
      case 0:
        setMode('normal');
        break;
      case 50:
        setMode('fast');
        break;
      case 100:
        setMode('very-fast');
        break;
    }
  };

  const getSliderValue = () => {
    switch (mode) {
      case 'normal':
        return [0];
      case 'fast':
        return [50];
      case 'very-fast':
        return [100];
    }
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
        <div className="mb-8 w-64">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">Normal</span>
            <span className="text-sm text-gray-600">Fast</span>
            <span className="text-sm text-gray-600">Very Fast</span>
          </div>
          <Slider
            value={getSliderValue()}
            onValueChange={handleSliderChange}
            max={100}
            step={50}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>5s</span>
            <span>2s</span>
            <span>1s</span>
          </div>
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
        Synchronize your breathing and your pelvic floor contractions with the circle's movement. 
        Inhale and squeeze as it expands, exhale and release as it contracts.
      </p>
    </div>
  );
};

export default Index;