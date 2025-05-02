
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Timer, FileText, MessageSquare, User, LucideIcon, Zap } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  unit: string;
  icon: LucideIcon;
  color?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, unit, color }) => {
  return (
    <Card className="shadow-md overflow-hidden border-0">
      <div className={`absolute inset-0 opacity-5 ${color || 'bg-primary'}`} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-1.5 rounded-full ${color ? color : 'bg-primary/10'}`}>
          <Icon className={`h-4 w-4 ${color ? 'text-white' : 'text-primary'}`} />
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {unit}
        </p>
      </CardContent>
    </Card>
  );
};

const TokenSpeedSimulator = () => {
  const [tokensPerSecond, setTokensPerSecond] = useState(25);
  const [textLength, setTextLength] = useState(1000);
  const [timeToProcess, setTimeToProcess] = useState(0);
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    // Calculate time to process based on tokens per second and text length
    setTimeToProcess(textLength / tokensPerSecond);
    
    // Reset animation progress when parameters change
    setAnimationProgress(0);
    
    // Start animation
    let startTime = Date.now();
    let frameId: number;
    
    const animate = () => {
      const elapsedTime = (Date.now() - startTime) / 1000;
      const progress = Math.min(100, (elapsedTime / (timeToProcess || 1)) * 100);
      setAnimationProgress(progress);
      
      if (progress < 100) {
        frameId = requestAnimationFrame(animate);
      }
    };
    
    if (timeToProcess > 0) {
      frameId = requestAnimationFrame(animate);
    }
    
    return () => cancelAnimationFrame(frameId);
  }, [tokensPerSecond, textLength]);

  // Calculate the words per minute based on tokens per second (rough estimate)
  const wordsPerMinute = Math.round(tokensPerSecond * 0.75 * 60);

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-blue-600/10" />
        <CardHeader className="relative">
          <div className="flex items-center mb-1">
            <Zap className="h-5 w-5 text-purple-500 mr-2" />
            <CardTitle>Token Speed Simulator</CardTitle>
          </div>
          <CardDescription>Adjust the parameters to simulate token processing speed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 relative">
          <div className="grid gap-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium">Tokens per Second</div>
                <Badge variant="secondary" className="bg-purple-100 hover:bg-purple-200 text-purple-800">
                  {tokensPerSecond} tokens/sec
                </Badge>
              </div>
              <div className="px-1">
                <Slider
                  defaultValue={[tokensPerSecond]}
                  max={100}
                  step={1}
                  onValueChange={(value) => setTokensPerSecond(Number(value[0]))}
                  className="[&>span]:bg-purple-500"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Slow (1)</span>
                  <span>Medium (25)</span>
                  <span>Fast (100)</span>
                </div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium">Text Length (Tokens)</div>
                <Badge variant="secondary" className="bg-blue-100 hover:bg-blue-200 text-blue-800">
                  {textLength} tokens
                </Badge>
              </div>
              <div className="px-1">
                <Slider
                  defaultValue={[textLength]}
                  max={5000}
                  step={100}
                  onValueChange={(value) => setTextLength(Number(value[0]))}
                  className="[&>span]:bg-blue-500"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Short (100)</span>
                  <span>Medium (1000)</span>
                  <span>Long (5000)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Processing Time"
          value={timeToProcess.toFixed(1)}
          unit="seconds"
          icon={Timer}
          color="bg-purple-600"
        />
        <MetricCard
          title="Reading Speed"
          value={wordsPerMinute}
          unit="words per minute"
          icon={FileText}
          color="bg-blue-600"
        />
        <MetricCard
          title="Concurrent Users"
          value={Math.max(1, Math.floor(tokensPerSecond / 5))}
          unit="supported users"
          icon={User}
          color="bg-emerald-600"
        />
      </div>

      <Card className="shadow-lg border-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/10" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 text-blue-500 mr-2" />
            Live Simulation
          </CardTitle>
          <CardDescription>Real-time visualization of token processing speed.</CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="mb-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300 ease-linear"
                style={{ width: `${animationProgress}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium mb-2 text-gray-700">Progress</div>
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold text-purple-700">{Math.min(100, Math.round(animationProgress))}%</div>
                <Badge 
                  variant="outline" 
                  className={`${animationProgress < 100 ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}
                >
                  {animationProgress < 100 ? 'Processing' : 'Complete'}
                </Badge>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium mb-2 text-gray-700">Estimated Completion</div>
              <div className="flex justify-between items-center">
                <div className="text-xl font-bold text-blue-700">
                  {timeToProcess > 0 ? 
                    `${Math.max(0, (timeToProcess * (1 - animationProgress/100))).toFixed(1)}s remaining` : 
                    "Ready"
                  }
                </div>
                <Zap className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { TokenSpeedSimulator };
export default TokenSpeedSimulator;
