import { useState } from "react";
import { KegalTimer } from "@/components/KegalTimer";
import { ExerciseControls } from "@/components/ExerciseControls";

const Index = () => {
  const [isActive, setIsActive] = useState(false);

  const handleToggle = () => {
    if (!isActive) {
      // Reset happens automatically when starting
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <h1 className="text-3xl font-semibold text-gray-800 mb-8">
        Kegel Training
      </h1>
      
      <div className="flex flex-col items-center">
        <KegalTimer isActive={isActive} />
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