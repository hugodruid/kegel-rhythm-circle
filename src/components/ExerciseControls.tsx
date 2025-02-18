import { Button } from "@/components/ui/button";
import { Play, Square } from "lucide-react";

interface ExerciseControlsProps {
  isActive: boolean;
  onToggle: () => void;
}

export const ExerciseControls = ({ isActive, onToggle }: ExerciseControlsProps) => {
  return (
    <div className="flex gap-4 mt-8">
      <Button
        onClick={onToggle}
        className="w-32 bg-[#9b87f5] hover:bg-[#8b77e5]"
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