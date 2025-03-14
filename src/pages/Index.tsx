
import { useState, useEffect } from "react";
import { KegalTimer } from "@/components/KegalTimer";
import { ExerciseControls } from "@/components/ExerciseControls";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Activity, Leaf } from "lucide-react";

type TimerMode = 'normal' | 'fast' | 'very-fast';
type ExerciseType = 'kegal' | 'relaxation';

const Index = () => {
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  const [mode, setMode] = useState<TimerMode>('normal');
  const [exerciseType, setExerciseType] = useState<ExerciseType>('kegal');
  const [user, setUser] = useState<User | null>(null);
  const {
    toast
  } = useToast();
  
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);
  
  const handleToggle = async () => {
    if (!isActive) {
      setTime(0);
      setIsActive(true);
    } else {
      setIsActive(false);

      // Save session if user is logged in
      if (user) {
        try {
          const {
            error
          } = await supabase.from('exercise_sessions').insert({
            user_id: user.id,
            duration_seconds: time,
            mode: mode,
            exercise_type: exerciseType
          });
          if (error) throw error;
          toast({
            title: "Session saved!",
            description: "Your exercise session has been recorded."
          });
        } catch (error: any) {
          toast({
            title: "Error saving session",
            description: error.message,
            variant: "destructive"
          });
        }
      }
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

  const handleExerciseChange = (value: string) => {
    if (value === "kegal" || value === "relaxation") {
      setExerciseType(value);
    }
  };

  const getInstructions = () => {
    if (exerciseType === 'kegal') {
      return "Synchronize your breathing and your pelvic floor contractions with the circle's movement. Inhale and squeeze as it expands, exhale and release as it contracts.";
    } else {
      return "Synchronize your breathing and your pelvic floor relaxation with the circle's movement. Inhale and push out as it contracts, exhale and relax as it expands.";
    }
  };
  
  return <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="flex flex-col items-center mb-2">
        <h1 className="text-3xl font-semibold text-gray-800 mb-3">Pelvic Floor Trainer</h1>
        
        <ToggleGroup type="single" value={exerciseType} onValueChange={handleExerciseChange} className="mb-1">
          <ToggleGroupItem value="kegal" className="gap-1 data-[state=on]:bg-[#9b87f5] data-[state=on]:text-white" aria-label="Kegal Exercise">
            <Activity className="h-4 w-4" />
            <span>Kegal</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="relaxation" className="gap-1 data-[state=on]:bg-[#6cb28e] data-[state=on]:text-white" aria-label="Relaxation Exercise">
            <Leaf className="h-4 w-4" />
            <span>Relaxation</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <div className="text-xl font-medium text-gray-600 mb-4">
        Time: {formatTime(time)}
      </div>

      {!isActive && <div className="mb-8 w-64">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">Normal</span>
            <span className="text-sm text-gray-600">Fast</span>
            <span className="text-sm text-gray-600">Very Fast</span>
          </div>
          <Slider value={getSliderValue()} onValueChange={handleSliderChange} max={100} step={50} className="mb-2" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>5s</span>
            <span>2s</span>
            <span>1s</span>
          </div>
        </div>}
      
      <div className="flex flex-col items-center">
        <KegalTimer isActive={isActive} mode={mode} exerciseType={exerciseType} />
        <ExerciseControls isActive={isActive} onToggle={handleToggle} />
      </div>
      
      {!user && !isActive && <p className="mt-8 text-gray-600 text-center">
          Sign in to track your exercise sessions!
        </p>}
      
      <p className="mt-8 text-gray-600 max-w-md text-center">
        {getInstructions()}
      </p>
    </div>;
};

export default Index;
