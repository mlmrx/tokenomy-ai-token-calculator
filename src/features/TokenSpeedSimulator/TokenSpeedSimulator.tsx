
import React, { useState, useEffect, useRef } from 'react';
import { useTokenSimulator } from './useTokenSimulator';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  Play, Pause, RotateCcw, 
  Share2, Clock, Cpu, 
  MessageCircle, AlertCircle 
} from 'lucide-react';

/**
 * TokenSpeedSimulator - A component that simulates token generation at adjustable speeds
 * Allows users to visualize how fast tokens are generated at different speeds
 */
export function TokenSpeedSimulator() {
  const [inputSpeed, setInputSpeed] = useState<string>('100');
  const [inputLength, setInputLength] = useState<string>('400');
  const [errors, setErrors] = useState<{ speed?: string; length?: string }>({});
  const outputRef = useRef<HTMLDivElement>(null);

  // Create shareable link with current settings
  const createShareableLink = () => {
    const baseUrl = window.location.href.split('?')[0];
    const params = new URLSearchParams();
    params.set('speed', simulator.speed.toString());
    params.set('length', simulator.length.toString());
    params.set('auto', '1');
    return `${baseUrl}?${params.toString()}`;
  };

  // Copy shareable link to clipboard
  const copyShareableLink = () => {
    const link = createShareableLink();
    navigator.clipboard.writeText(link);
    // Show toast/notification (assuming you have some notification system)
    alert('Shareable link copied to clipboard!');
  };

  // Parse URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const speedParam = params.get('speed');
    const lengthParam = params.get('length');
    const autoParam = params.get('auto');
    
    if (speedParam) setInputSpeed(speedParam);
    if (lengthParam) setInputLength(lengthParam);
    
    // Start automatically if auto=1
    if (autoParam === '1' && speedParam && lengthParam) {
      setTimeout(() => {
        startSimulation(parseInt(speedParam), parseInt(lengthParam));
      }, 500);
    }
  }, []);

  // Load saved settings from localStorage
  useEffect(() => {
    const savedSpeed = localStorage.getItem('tokenSimulator.speed');
    const savedLength = localStorage.getItem('tokenSimulator.length');
    
    if (savedSpeed && !window.location.search.includes('speed')) {
      setInputSpeed(savedSpeed);
    }
    
    if (savedLength && !window.location.search.includes('length')) {
      setInputLength(savedLength);
    }
  }, []);

  // Scroll output to bottom when new tokens are added
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [simulator.tokens]);

  // Validate inputs and start simulation
  const startSimulation = (speed?: number, length?: number) => {
    const newErrors: { speed?: string; length?: string } = {};
    
    const speedValue = speed || parseInt(inputSpeed);
    const lengthValue = length || parseInt(inputLength);
    
    if (isNaN(speedValue) || speedValue < 1 || speedValue > 10000) {
      newErrors.speed = 'Speed must be between 1 and 10,000';
    }
    
    if (isNaN(lengthValue) || lengthValue < 1 || lengthValue > 10000) {
      newErrors.length = 'Length must be between 1 and 10,000';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      // Save settings to localStorage
      localStorage.setItem('tokenSimulator.speed', speedValue.toString());
      localStorage.setItem('tokenSimulator.length', lengthValue.toString());
      
      simulator.start(speedValue, lengthValue);
    }
  };

  // Initialize simulator hook
  const simulator = useTokenSimulator();
  
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">
      {/* Controls Section */}
      <Card className="p-4 bg-white/10 backdrop-blur-sm rounded-lg shadow-lg border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="speed" className="text-sm font-medium">
                Speed (tokens/s):
              </label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertCircle className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm bg-popover/90 backdrop-blur-sm border border-border shadow-lg">
                    <p>Controls how many tokens are generated per second. Higher values result in faster generation.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-2">
              <Slider
                id="speed-slider"
                min={1}
                max={1000}
                step={1}
                value={[parseInt(inputSpeed) || 100]}
                onValueChange={(val) => setInputSpeed(val[0].toString())}
                disabled={simulator.isRunning}
                className="flex-grow"
              />
              <Input
                id="speed"
                type="number"
                min={1}
                max={10000}
                value={inputSpeed}
                onChange={(e) => setInputSpeed(e.target.value)}
                className={`w-20 text-white bg-white/10 border-white/20 ${errors.speed ? 'border-red-500' : ''}`}
                disabled={simulator.isRunning}
              />
            </div>
            {errors.speed && <p className="text-red-400 text-xs mt-1">{errors.speed}</p>}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="length" className="text-sm font-medium">
                Length (tokens):
              </label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertCircle className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm bg-popover/90 backdrop-blur-sm border border-border shadow-lg">
                    <p>Total number of tokens to generate in this simulation.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-2">
              <Slider
                id="length-slider"
                min={10}
                max={2000}
                step={10}
                value={[parseInt(inputLength) || 400]}
                onValueChange={(val) => setInputLength(val[0].toString())}
                disabled={simulator.isRunning}
                className="flex-grow"
              />
              <Input
                id="length"
                type="number"
                min={1}
                max={10000}
                value={inputLength}
                onChange={(e) => setInputLength(e.target.value)}
                className={`w-20 text-white bg-white/10 border-white/20 ${errors.length ? 'border-red-500' : ''}`}
                disabled={simulator.isRunning}
              />
            </div>
            {errors.length && <p className="text-red-400 text-xs mt-1">{errors.length}</p>}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {!simulator.isRunning ? (
            <Button 
              onClick={() => startSimulation()} 
              disabled={simulator.tokens.length > 0 && simulator.tokens.length >= parseInt(inputLength)}
              className="bg-green-500 hover:bg-green-600 transition-colors"
            >
              <Play className="mr-2 h-4 w-4" />
              {simulator.tokens.length > 0 ? "Resume" : "Start"}
            </Button>
          ) : (
            <Button 
              onClick={simulator.pause} 
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </Button>
          )}
          
          <Button 
            onClick={simulator.reset} 
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          
          <Button 
            onClick={copyShareableLink} 
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </Card>
      
      {/* Metrics Section */}
      <Card className="p-4 bg-white/10 backdrop-blur-sm rounded-lg shadow-lg border-white/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-2 rounded-md bg-white/5">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium">Elapsed Time</span>
            </div>
            <p className="text-lg font-bold">{simulator.elapsedTime.toFixed(1)}s</p>
          </div>
          
          <div className="p-2 rounded-md bg-white/5">
            <div className="flex items-center justify-center gap-2 mb-1">
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs font-medium">Generated</span>
            </div>
            <p className="text-lg font-bold">{simulator.tokens.length} / {simulator.length}</p>
          </div>
          
          <div className="p-2 rounded-md bg-white/5">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Cpu className="h-4 w-4" />
              <span className="text-xs font-medium">Actual Speed</span>
            </div>
            <p className="text-lg font-bold">{simulator.effectiveSpeed.toFixed(1)} t/s</p>
          </div>
          
          <div className="p-2 rounded-md bg-white/5">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Share2 className="h-4 w-4" />
              <span className="text-xs font-medium">Remaining</span>
            </div>
            <p className="text-lg font-bold">{Math.max(0, simulator.length - simulator.tokens.length)}</p>
          </div>
        </div>
      </Card>
      
      {/* Output Section */}
      <Card className="p-4 bg-white/10 backdrop-blur-sm rounded-lg shadow-lg border-white/20">
        <div className="mb-2 flex justify-between items-center">
          <h3 className="text-sm font-medium">Output</h3>
          <span className="text-xs text-white/60">
            {simulator.tokens.length === 0 && !simulator.isRunning ? (
              'Press Start to begin simulation'
            ) : simulator.tokens.length >= simulator.length ? (
              'Simulation complete'
            ) : simulator.isRunning ? (
              'Generating tokens...'
            ) : (
              'Paused'
            )}
          </span>
        </div>
        
        <div 
          ref={outputRef}
          className="h-[200px] overflow-auto rounded-md bg-black/20 p-3 text-sm font-mono"
          style={{ scrollBehavior: 'smooth' }}
        >
          {simulator.tokens.length === 0 ? (
            <div className="flex items-center justify-center h-full text-white/50">
              {simulator.isLoading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
                  <p>Initializing...</p>
                </div>
              ) : (
                <p>No tokens generated yet</p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {simulator.tokens.map((token, i) => (
                <span 
                  key={i} 
                  className="inline-block px-1 mr-1 mb-1 bg-white/10 rounded token-stream"
                  style={{ animationDelay: `${i * 0.01}s` }}
                >
                  {token}
                </span>
              ))}
            </div>
          )}
        </div>
      </Card>
      
      {/* Progress Bar */}
      <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-200"
          style={{ width: `${Math.min(100, (simulator.tokens.length / simulator.length) * 100)}%` }}
        ></div>
      </div>
    </div>
  );
}
