
import { Button } from "@/components/ui/button";
import { Play, Square } from "lucide-react";

interface ExerciseControlsProps {
  isActive: boolean;
  onToggle: () => void;
  exerciseType?: 'kegal' | 'relaxation';
}

export const ExerciseControls = ({ isActive, onToggle, exerciseType = 'kegal' }: ExerciseControlsProps) => {
  const getButtonColor = () => {
    return exerciseType === 'kegal' 
      ? "bg-[#0EA5E9] hover:bg-[#0EA5E9]/90" 
      : "bg-[#22C55E] hover:bg-[#22C55E]/90";
  };

  return (
    <div className="flex gap-4 mt-8">
      <Button
        onClick={onToggle}
        className={`w-32 ${getButtonColor()}`}
      >
        {isActive ? (
          <>
            <Square className="mr-2 h-4 w-4" /> Stop
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4" /> Start
          </>
        )}
      </Button>
    </div>
  );
};
