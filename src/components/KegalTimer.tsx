import { useEffect, useState, useRef } from 'react';
import { cn } from "@/lib/utils";

interface KegalTimerProps {
  isActive: boolean;
  mode: 'normal' | 'fast' | 'very-fast';
  onComplete?: () => void;
}

export const KegalTimer = ({ isActive, mode, onComplete }: KegalTimerProps) => {
  const [isBreathingIn, setIsBreathingIn] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const inhaleSound = useRef(new Audio('/Sounds/inhale.mp3'));
  const exhaleSound = useRef(new Audio('/Sounds/exhale.mp3'));
  
  const cycleDuration = mode === 'normal' ? 5 : mode === 'fast' ? 2 : 1;
  const transitionMs = (cycleDuration * 1000) - 100;
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      setIsBreathingIn(true);
      setSeconds(0);
      
      interval = setInterval(() => {
        setSeconds(prev => {
          const newSeconds = prev + 1;
          if (newSeconds >= cycleDuration) {
            setIsBreathingIn(current => {
              // Play sound when changing state
              if (current) {
                exhaleSound.current.play().catch(console.error);
              } else {
                inhaleSound.current.play().catch(console.error);
              }
              return !current;
            });
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
  }, [isActive, cycleDuration]);

  // Preload sounds
  useEffect(() => {
    inhaleSound.current.load();
    exhaleSound.current.load();
  }, []);

  return (
    <div className="relative w-80 h-80">
      <div className="absolute inset-0 rounded-full bg-[#D3E4FD]" />
      
      <div
        style={{
          transition: isActive ? `transform ${transitionMs}ms ease-in-out` : 'none'
        }}
        className={cn(
          "absolute inset-4 rounded-full bg-[#9b87f5]",
          isActive ? (isBreathingIn ? "scale-110" : "scale-[0.6]") : "scale-[0.6]"
        )}
      />
      
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-2xl font-medium text-white">
          {isBreathingIn ? "Inhale & Squeeze" : "Exhale & Release"}
        </p>
      </div>
    </div>
  );
};