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
      setIsBreathingIn(true);
      setSeconds(0);
      
      interval = setInterval(() => {
        setSeconds(prev => {
          const newSeconds = prev + 1;
          if (newSeconds >= 5) {
            setIsBreathingIn(current => !current);
            return 0;
          }
          return newSeconds;
        });
      }, 1000);
    } else {
      setIsBreathingIn(true);
      setSeconds(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive]);

  return (
    <div className="relative w-80 h-80">
      {/* Outer static circle */}
      <div className="absolute inset-0 rounded-full bg-[#D3E4FD]" />
      
      {/* Animated inner circle */}
      <div
        className={cn(
          "absolute inset-4 rounded-full bg-[#9b87f5]",
          isActive 
            ? `transform transition-transform duration-[4900ms] ease-in-out ${isBreathingIn ? "scale-110" : "scale-[0.6]"}`
            : "scale-[0.6]"
        )}
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