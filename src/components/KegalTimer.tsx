
import { useEffect, useState, useRef } from 'react';
import { cn } from "@/lib/utils";
import { Volume, VolumeX } from "lucide-react";

interface KegalTimerProps {
  isActive: boolean;
  mode: 'normal' | 'fast' | 'very-fast';
  onComplete?: () => void;
}

export const KegalTimer = ({ isActive, mode, onComplete }: KegalTimerProps) => {
  const [isBreathingIn, setIsBreathingIn] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const inhaleSound = useRef<HTMLAudioElement | null>(null);
  const exhaleSound = useRef<HTMLAudioElement | null>(null);
  
  const cycleDuration = mode === 'normal' ? 5 : mode === 'fast' ? 2 : 1;
  const transitionMs = (cycleDuration * 1000) - 100;
  
  // Initialize audio elements
  useEffect(() => {
    inhaleSound.current = new Audio('/sounds/inhale.mp3');
    exhaleSound.current = new Audio('/sounds/exhale.mp3');
    
    // Set up load handlers
    const handleInhaleLoaded = () => {
      console.log('Inhale sound loaded');
      checkSoundsLoaded();
    };
    
    const handleExhaleLoaded = () => {
      console.log('Exhale sound loaded');
      checkSoundsLoaded();
    };
    
    const checkSoundsLoaded = () => {
      if (inhaleSound.current?.readyState >= 2 && exhaleSound.current?.readyState >= 2) {
        console.log('Both sounds loaded');
        setSoundsLoaded(true);
      }
    };
    
    inhaleSound.current.addEventListener('canplaythrough', handleInhaleLoaded);
    exhaleSound.current.addEventListener('canplaythrough', handleExhaleLoaded);
    
    // Start loading the sounds
    inhaleSound.current.load();
    exhaleSound.current.load();
    
    return () => {
      inhaleSound.current?.removeEventListener('canplaythrough', handleInhaleLoaded);
      exhaleSound.current?.removeEventListener('canplaythrough', handleExhaleLoaded);
    };
  }, []);

  // Main timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && soundsLoaded) {
      // Play inhale sound immediately when starting
      if (inhaleSound.current && !isMuted) {
        inhaleSound.current.currentTime = 0;
        inhaleSound.current.play().catch(error => {
          console.error('Error playing inhale sound:', error);
        });
      }
      setIsBreathingIn(true);
      setSeconds(0);
      
      interval = setInterval(() => {
        setSeconds(prev => {
          const newSeconds = prev + 1;
          if (newSeconds >= cycleDuration) {
            setIsBreathingIn(current => {
              // Play appropriate sound when changing state
              const soundToPlay = current ? exhaleSound.current : inhaleSound.current;
              if (soundToPlay && !isMuted) {
                soundToPlay.currentTime = 0;
                soundToPlay.play().catch(error => {
                  console.error('Error playing sound:', error);
                });
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
  }, [isActive, cycleDuration, soundsLoaded, isMuted]);

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

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

      <button 
        onClick={toggleMute}
        className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/20 hover:bg-black/30 transition-colors backdrop-blur-sm"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? 
          <VolumeX size={24} className="text-white" /> : 
          <Volume size={24} className="text-white" />
        }
      </button>
    </div>
  );
};
