
/**
 * Token Speed Simulator Component
 * Provides a UI to simulate token generation at various speeds and lengths
 * Displays real-time metrics and streamed tokens with play/pause/reset controls
 */
import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTokenSimulator } from './useTokenSimulator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, RefreshCw, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Parse URL query params
const parseQueryParams = () => {
  const searchParams = new URLSearchParams(window.location.search);
  return {
    speed: Number(searchParams.get('speed')) || undefined,
    length: Number(searchParams.get('length')) || undefined,
    auto: searchParams.get('auto') === '1',
  };
};

// Format time as mm:ss.ms
const formatTime = (ms: number): string => {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const milliseconds = Math.floor((ms % 1000) / 10);
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
};

const TokenSpeedSimulator: React.FC = () => {
  const { toast } = useToast();
  const location = useLocation();
  const outputRef = useRef<HTMLDivElement>(null);
  
  // Input validation state
  const [speedError, setSpeedError] = useState<string | null>(null);
  const [lengthError, setLengthError] = useState<string | null>(null);
  const [chartType, setChartType] = useState("time");
  
  // Get URL parameters and localStorage values
  const queryParams = parseQueryParams();
  const savedSpeed = localStorage.getItem('tokenSimulator.speed');
  const savedLength = localStorage.getItem('tokenSimulator.length');
  
  const initialSpeed = queryParams.speed || Number(savedSpeed) || 100;
  const initialLength = queryParams.length || Number(savedLength) || 400;
  
  const {
    tokens,
    isRunning,
    isPaused,
    elapsedTime,
    effectiveSpeed,
    speed,
    length,
    tokensGenerated,
    tokensRemaining,
    percentComplete,
    start,
    pause,
    reset,
    updateSpeed,
    updateLength,
  } = useTokenSimulator({
    initialSpeed,
    initialLength,
    autoStart: queryParams.auto,
  });
  
  // Validate speed on blur
  const handleSpeedBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (isNaN(value) || value < 1 || value > 10000) {
      setSpeedError('Speed must be between 1-10,000');
    } else {
      setSpeedError(null);
      updateSpeed(value);
    }
  };
  
  // Validate length on blur
  const handleLengthBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (isNaN(value) || value < 1 || value > 10000) {
      setLengthError('Length must be between 1-10,000');
    } else {
      setLengthError(null);
      updateLength(value);
    }
  };
  
  // Handle input changes
  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value || /^\d+$/.test(value)) {
      const numValue = Number(value);
      if (numValue <= 10000) {
        updateSpeed(numValue || 1);
        setSpeedError(null);
      }
    }
  };
  
  const handleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value || /^\d+$/.test(value)) {
      const numValue = Number(value);
      if (numValue <= 10000) {
        updateLength(numValue || 1);
        setLengthError(null);
      }
    }
  };
  
  // Share functionality
  const handleShare = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?speed=${speed}&length=${length}&auto=1`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          toast({
            title: "Link Copied",
            description: "Share link copied to clipboard",
          });
        })
        .catch(() => {
          toast({
            title: "Copy Failed",
            description: "Failed to copy link to clipboard",
            variant: "destructive",
          });
        });
    } else {
      toast({
        title: "Copy Failed",
        description: "Browser doesn't support clipboard access",
        variant: "destructive",
      });
    }
  };
  
  // Auto-scroll to bottom of output
  useEffect(() => {
    if (outputRef.current && tokens.length > 0) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [tokens]);
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="speed" className="block mb-2">
                Speed (tokens/s)
              </Label>
              <Input
                id="speed"
                type="number"
                min={1}
                max={10000}
                value={speed}
                onChange={handleSpeedChange}
                onBlur={handleSpeedBlur}
                className={`w-full ${speedError ? 'border-red-500' : ''}`}
                aria-invalid={!!speedError}
                aria-describedby={speedError ? "speed-error" : undefined}
                disabled={isRunning && !isPaused}
              />
              {speedError && (
                <p id="speed-error" className="text-red-500 text-sm mt-1">
                  {speedError}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="length" className="block mb-2">
                Length (total tokens)
              </Label>
              <Input
                id="length"
                type="number"
                min={1}
                max={10000}
                value={length}
                onChange={handleLengthChange}
                onBlur={handleLengthBlur}
                className={`w-full ${lengthError ? 'border-red-500' : ''}`}
                aria-invalid={!!lengthError}
                aria-describedby={lengthError ? "length-error" : undefined}
                disabled={isRunning && !isPaused}
              />
              {lengthError && (
                <p id="length-error" className="text-red-500 text-sm mt-1">
                  {lengthError}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <div className="p-4 border rounded-md h-full">
            <h2 className="text-lg font-medium mb-3">Real-time Metrics</h2>
            <div className="grid grid-cols-2 gap-y-2 mb-4">
              <div className="text-sm">Elapsed Time:</div>
              <div className="text-sm font-mono">{formatTime(elapsedTime)}</div>
              
              <div className="text-sm">Effective Speed:</div>
              <div className="text-sm font-mono">{effectiveSpeed.toFixed(2)} t/s</div>
              
              <div className="text-sm">Tokens Generated:</div>
              <div className="text-sm font-mono">
                {tokensGenerated} / {length} ({percentComplete}%)
              </div>
            </div>
            
            <Progress value={percentComplete} className="h-2 mb-4" />
            
            <div className="flex space-x-2 justify-between">
              <Button
                onClick={isPaused ? start : isRunning ? pause : start}
                disabled={speedError !== null || lengthError !== null || (tokensGenerated >= length && !isPaused)}
                aria-label={isPaused ? "Resume" : isRunning ? "Pause" : "Start"}
                className="flex-1"
              >
                {isPaused ? (
                  <Play className="mr-1 h-4 w-4" />
                ) : isRunning ? (
                  <Pause className="mr-1 h-4 w-4" />
                ) : (
                  <Play className="mr-1 h-4 w-4" />
                )}
                {isPaused ? "Resume" : isRunning ? "Pause" : "Start"}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={reset}
                aria-label="Reset"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleShare}
                aria-label="Share"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border rounded-md p-4 bg-muted/20">
        <h2 className="text-lg font-medium mb-2">Output</h2>
        <ScrollArea className="h-64 w-full p-3 bg-card rounded-md font-mono text-sm">
          {tokens.length === 0 && !isRunning ? (
            <div className="text-muted-foreground text-center py-6">
              Press start to begin token generation
            </div>
          ) : tokens.length === 0 && isRunning ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : (
            <div className="whitespace-pre-wrap break-all">
              {tokens.join(' ')}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default TokenSpeedSimulator;
