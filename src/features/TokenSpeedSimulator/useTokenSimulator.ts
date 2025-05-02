
/**
 * Custom hook that implements the core token simulation logic
 * Handles token generation timing, state management, and animation frame scheduling
 */
import { useState, useEffect, useRef, useCallback } from 'react';

interface TokenSimulatorOptions {
  initialSpeed: number;
  initialLength: number;
  autoStart?: boolean;
}

interface TokenSimulatorState {
  tokens: string[];
  isRunning: boolean;
  isPaused: boolean;
  startTime: number | null;
  pausedTime: number;
  elapsedTime: number;
  effectiveSpeed: number;
}

export function useTokenSimulator({
  initialSpeed,
  initialLength,
  autoStart = false,
}: TokenSimulatorOptions) {
  const [speed, setSpeed] = useState<number>(initialSpeed);
  const [length, setLength] = useState<number>(initialLength);
  const [state, setState] = useState<TokenSimulatorState>({
    tokens: [],
    isRunning: false,
    isPaused: false,
    startTime: null,
    pausedTime: 0,
    elapsedTime: 0,
    effectiveSpeed: 0,
  });

  const animationFrameRef = useRef<number | null>(null);
  const lastTokenTimeRef = useRef<number>(0);
  const tokensGeneratedRef = useRef<number>(0);

  // Reset simulation to initial state
  const reset = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    tokensGeneratedRef.current = 0;
    lastTokenTimeRef.current = 0;
    
    setState({
      tokens: [],
      isRunning: false,
      isPaused: false,
      startTime: null,
      pausedTime: 0,
      elapsedTime: 0,
      effectiveSpeed: 0,
    });
  }, []);

  // Start or resume the simulation
  const start = useCallback(() => {
    if (state.isPaused) {
      // Resume from pause
      setState(prev => ({
        ...prev,
        isPaused: false,
        pausedTime: prev.pausedTime + (Date.now() - (prev.startTime || 0) - prev.elapsedTime),
      }));
    } else {
      // Fresh start
      setState(prev => ({
        ...prev,
        isRunning: true,
        startTime: Date.now(),
        pausedTime: 0,
      }));
    }
  }, [state.isPaused]);

  // Pause the simulation
  const pause = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPaused: true,
    }));
  }, []);

  // Update speed with validation
  const updateSpeed = useCallback((newSpeed: number) => {
    if (newSpeed >= 1 && newSpeed <= 10000) {
      setSpeed(newSpeed);
      localStorage.setItem('tokenSimulator.speed', newSpeed.toString());
    }
  }, []);

  // Update length with validation
  const updateLength = useCallback((newLength: number) => {
    if (newLength >= 1 && newLength <= 10000) {
      setLength(newLength);
      localStorage.setItem('tokenSimulator.length', newLength.toString());
    }
  }, []);

  // Core animation loop
  useEffect(() => {
    if (!state.isRunning || state.isPaused || tokensGeneratedRef.current >= length) {
      return;
    }

    const animate = (timestamp: number) => {
      if (!state.startTime) return;
      
      const currentElapsed = timestamp - state.startTime - state.pausedTime;
      const tokensToGenerate = Math.floor((currentElapsed / 1000) * speed) - tokensGeneratedRef.current;
      
      if (tokensToGenerate > 0) {
        const newTokens: string[] = [];
        
        for (let i = 0; i < tokensToGenerate; i++) {
          if (tokensGeneratedRef.current < length) {
            newTokens.push(`token-${tokensGeneratedRef.current + 1}`);
            tokensGeneratedRef.current++;
          }
        }
        
        if (newTokens.length > 0) {
          setState(prev => {
            const updatedTokens = [...prev.tokens, ...newTokens];
            const effectiveRate = tokensGeneratedRef.current / (currentElapsed / 1000);
            
            return {
              ...prev,
              tokens: updatedTokens,
              elapsedTime: currentElapsed,
              effectiveSpeed: Number.isFinite(effectiveRate) ? effectiveRate : 0,
            };
          });
        } else {
          setState(prev => ({
            ...prev,
            elapsedTime: currentElapsed,
          }));
        }
      }
      
      // Handle completion
      if (tokensGeneratedRef.current >= length) {
        setState(prev => ({
          ...prev,
          isRunning: false,
          elapsedTime: currentElapsed,
        }));
        return;
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    // Use requestAnimationFrame for high speeds (>60 tokens/s), or setTimeout for lower speeds
    if (speed > 60) {
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      const interval = Math.floor(1000 / speed);
      const timer = setInterval(() => {
        if (state.startTime && !state.isPaused) {
          const now = Date.now();
          const currentElapsed = now - state.startTime - state.pausedTime;
          
          if (tokensGeneratedRef.current < length) {
            setState(prev => {
              const updatedTokens = [...prev.tokens, `token-${tokensGeneratedRef.current + 1}`];
              tokensGeneratedRef.current++;
              
              const effectiveRate = tokensGeneratedRef.current / (currentElapsed / 1000);
              
              // Check if all tokens have been generated
              if (tokensGeneratedRef.current >= length) {
                clearInterval(timer);
              }
              
              return {
                ...prev,
                tokens: updatedTokens,
                elapsedTime: currentElapsed,
                effectiveSpeed: Number.isFinite(effectiveRate) ? effectiveRate : 0,
                isRunning: tokensGeneratedRef.current < length,
              };
            });
          } else {
            clearInterval(timer);
            setState(prev => ({
              ...prev,
              isRunning: false,
              elapsedTime: currentElapsed,
            }));
          }
        }
      }, interval);
      
      return () => clearInterval(timer);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state.isRunning, state.isPaused, state.startTime, state.pausedTime, speed, length]);

  // Auto-start effect
  useEffect(() => {
    if (autoStart) {
      start();
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [autoStart, start]);

  return {
    // State
    tokens: state.tokens,
    isRunning: state.isRunning,
    isPaused: state.isPaused,
    elapsedTime: state.elapsedTime,
    effectiveSpeed: state.effectiveSpeed,
    
    // Parameters
    speed,
    length,
    
    // Token metrics
    tokensGenerated: state.tokens.length,
    tokensRemaining: length - state.tokens.length,
    percentComplete: Math.floor((state.tokens.length / length) * 100),
    
    // Actions
    start,
    pause,
    reset,
    updateSpeed,
    updateLength,
  };
}
