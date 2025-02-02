import { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";

interface KegalTimerProps {
  isActive: boolean;
  onComplete?: () => void;
}

export const KegalTimer = ({ isActive, onComplete }: KegalTimerProps) => {
  const [isBreathingIn, setIsBreathingIn] = useState(true);
  const [seconds, setSeconds] = useState(0);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(prev => {
          if (prev >= 7) {
            setIsBreathingIn(current => !current);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, isBreathingIn]);

  return (
    <div className="relative w-80 h-80">
      {/* Outer static circle */}
      <div className="absolute inset-0 rounded-full bg-[#D3E4FD]" />
      
      {/* Animated inner circle */}
      <div
        className={cn(
          "absolute inset-4 rounded-full bg-[#9b87f5] scale-75 transition-all duration-300",
          isActive && (isBreathingIn ? "breathe-in" : "breathe-out")
        )}
        style={{
          transform: `scale(${isBreathingIn ? 0.8 : 0.6})`,
          opacity: isBreathingIn ? 1 : 0.5,
        }}
      />
      
      {/* Text overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-2xl font-medium text-white">
          {isBreathingIn ? "Inhale & Squeeze" : "Exhale & Release"}
        </p>
      </div>
    </div>
  );
};