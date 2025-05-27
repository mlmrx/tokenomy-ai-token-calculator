
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Play, Pause, RotateCcw, Zap, Clock, TrendingUp, Settings, ChevronDown, Pin } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getModelTheme, getCompanyFromModel } from "@/lib/modelThemes";
import { modelPricing, firstTokenLatency, tokensPerSecond, getModelCategories } from "@/lib/modelData";

interface SimulationConfig {
  model: string;
  promptTokens: number;
  completionTokens: number;
  concurrency: number;
  streaming: boolean;
  quantization: string;
  sequenceLength: number;
  gpuUtilization: number;
}

interface Tick {
  timestamp: number;
  tokensPerSecond: number;
  throughput: number;
  latency: number;
  efficiency: number;
  tokensGenerated: number;
}

interface SimulationRun {
  id: string;
  config: SimulationConfig;
  data: Tick[];
  color: string;
  pinned: boolean;
}

const EnhancedTokenSpeedSimulator: React.FC = () => {
  const [config, setConfig] = useState<SimulationConfig>({
    model: "gpt-4o",
    promptTokens: 200,
    completionTokens: 800,
    concurrency: 1,
    streaming: true,
    quantization: "none",
    sequenceLength: 2048,
    gpuUtilization: 80
  });

  const [isSimpleView, setIsSimpleView] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [simulationRuns, setSimulationRuns] = useState<SimulationRun[]>([]);
  const [pinnedRuns, setPinnedRuns] = useState<SimulationRun[]>([]);
  const [isParametersOpen, setIsParametersOpen] = useState(false);

  // Get model theme for dynamic coloring
  const modelTheme = useMemo(() => getModelTheme(config.model), [config.model]);
  const modelCategories = getModelCategories();

  // Calculate performance metrics
  const performanceMetrics = useMemo(() => {
    const baseLatency = firstTokenLatency[config.model] || 300;
    const baseTPS = tokensPerSecond[config.model] || 30;
    
    // Apply quantization multiplier
    const quantMultiplier = config.quantization === "8bit" ? 0.9 : config.quantization === "4bit" ? 0.8 : 1;
    const adjustedTPS = baseTPS * quantMultiplier * (config.gpuUtilization / 100);
    
    // Calculate costs
    const pricing = modelPricing[config.model];
    const inputCost = pricing ? (config.promptTokens / 1000) * pricing.input : 0;
    const outputCost = pricing ? (config.completionTokens / 1000) * pricing.output : 0;
    const totalCost = inputCost + outputCost;
    
    return {
      throughput: Math.round(adjustedTPS * config.concurrency),
      latency: baseLatency,
      totalCost: totalCost,
      inputCost,
      outputCost,
      timeToComplete: config.completionTokens / adjustedTPS
    };
  }, [config]);

  // Generate simulation data
  const generateSimulationData = useCallback((): Tick[] => {
    const data: Tick[] = [];
    const targetTPS = performanceMetrics.throughput;
    const firstTokenDelay = performanceMetrics.latency / 1000; // Convert to seconds
    let tokensGenerated = 0;
    
    for (let i = 0; i <= 100; i++) {
      const timeElapsed = (i / 100) * (config.completionTokens / targetTPS + firstTokenDelay);
      
      if (timeElapsed <= firstTokenDelay) {
        // First token delay period
        tokensGenerated = 0;
      } else {
        // Token generation phase
        const generationTime = timeElapsed - firstTokenDelay;
        tokensGenerated = Math.min(
          Math.floor(generationTime * targetTPS),
          config.completionTokens
        );
      }
      
      const currentTPS = timeElapsed > firstTokenDelay ? targetTPS : 0;
      const efficiency = currentTPS / (tokensPerSecond[config.model] || 30);
      
      data.push({
        timestamp: i,
        tokensPerSecond: currentTPS,
        throughput: currentTPS * config.concurrency,
        latency: timeElapsed > firstTokenDelay ? 0 : performanceMetrics.latency,
        efficiency: efficiency,
        tokensGenerated: tokensGenerated
      });
    }
    
    return data;
  }, [config, performanceMetrics]);

  // Current simulation data
  const currentData = useMemo(() => {
    if (simulationRuns.length === 0) return [];
    return simulationRuns[simulationRuns.length - 1]?.data.slice(0, currentStep + 1) || [];
  }, [simulationRuns, currentStep]);

  // Animation effect
  useEffect(() => {
    if (!isRunning || simulationRuns.length === 0) return;
    
    const lastRun = simulationRuns[simulationRuns.length - 1];
    if (currentStep >= lastRun.data.length - 1) {
      setIsRunning(false);
      return;
    }
    
    const timer = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, 50);
    
    return () => clearTimeout(timer);
  }, [isRunning, currentStep, simulationRuns]);

  const startSimulation = useCallback(() => {
    const runId = Date.now().toString();
    const data = generateSimulationData();
    const newRun: SimulationRun = {
      id: runId,
      config: { ...config },
      data,
      color: modelTheme.primary,
      pinned: false
    };
    
    setSimulationRuns(prev => [...prev, newRun]);
    setCurrentStep(0);
    setIsRunning(true);
  }, [config, generateSimulationData, modelTheme.primary]);

  const toggleSimulation = () => {
    if (simulationRuns.length === 0) {
      startSimulation();
    } else {
      setIsRunning(!isRunning);
    }
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setCurrentStep(0);
  };

  const pinCurrentRun = () => {
    if (simulationRuns.length > 0) {
      const lastRun = simulationRuns[simulationRuns.length - 1];
      const pinnedRun = { ...lastRun, pinned: true };
      setPinnedRuns(prev => [...prev, pinnedRun]);
    }
  };

  const progress = currentData.length > 0 ? 
    (currentData[currentData.length - 1]?.tokensGenerated / config.completionTokens) * 100 : 0;

  return (
    <div className="space-y-6" style={{ '--model-primary': modelTheme.primary } as React.CSSProperties}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" style={{ color: modelTheme.primary }} />
              Token Speed Simulator
            </CardTitle>
            <div className="flex items-center gap-2">
              <Switch
                checked={!isSimpleView}
                onCheckedChange={(checked) => setIsSimpleView(!checked)}
              />
              <Label className="text-sm font-medium">Advanced</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration Section */}
          <div className="space-y-4">
            {/* Model Selection */}
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select value={config.model} onValueChange={(value) => setConfig(prev => ({ ...prev, model: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(modelCategories).map(([category, models]) => (
                    <div key={category}>
                      <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">{category}</div>
                      {models.map((model) => (
                        <SelectItem key={model} value={model}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: getModelTheme(model).primary }}
                            />
                            {model}
                          </div>
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Simulation Task */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="prompt-tokens">Prompt Tokens</Label>
                <Input
                  id="prompt-tokens"
                  type="number"
                  value={config.promptTokens}
                  onChange={(e) => setConfig(prev => ({ ...prev, promptTokens: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="completion-tokens">Completion Tokens</Label>
                <Input
                  id="completion-tokens"
                  type="number"
                  value={config.completionTokens}
                  onChange={(e) => setConfig(prev => ({ ...prev, completionTokens: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="concurrency">Concurrency</Label>
                <Input
                  id="concurrency"
                  type="number"
                  value={config.concurrency}
                  onChange={(e) => setConfig(prev => ({ ...prev, concurrency: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="streaming"
                  checked={config.streaming}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, streaming: checked }))}
                />
                <Label htmlFor="streaming">Streaming</Label>
              </div>
            </div>

            {/* Advanced Parameters (Collapsible) */}
            {!isSimpleView && (
              <Collapsible open={isParametersOpen} onOpenChange={setIsParametersOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Parameters
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isParametersOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Quantization</Label>
                      <Select value={config.quantization} onValueChange={(value) => setConfig(prev => ({ ...prev, quantization: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None (FP16)</SelectItem>
                          <SelectItem value="8bit">8-bit</SelectItem>
                          <SelectItem value="4bit">4-bit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Sequence Length: {config.sequenceLength}</Label>
                      <Slider
                        value={[config.sequenceLength]}
                        onValueChange={([value]) => setConfig(prev => ({ ...prev, sequenceLength: value }))}
                        max={8192}
                        min={512}
                        step={256}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>GPU Utilization: {config.gpuUtilization}%</Label>
                      <Slider
                        value={[config.gpuUtilization]}
                        onValueChange={([value]) => setConfig(prev => ({ ...prev, gpuUtilization: value }))}
                        max={100}
                        min={10}
                        step={5}
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>

          <Separator />

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold" style={{ color: modelTheme.primary }}>
                  {performanceMetrics.throughput}
                </div>
                <p className="text-xs text-muted-foreground">Tokens/Second</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-orange-600">
                  {performanceMetrics.latency}ms
                </div>
                <p className="text-xs text-muted-foreground">First Token Latency</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-green-600">
                  ${performanceMetrics.totalCost.toFixed(4)}
                </div>
                <p className="text-xs text-muted-foreground">Total Cost</p>
              </CardContent>
            </Card>
          </div>

          {/* Simulation Controls */}
          <div className="flex gap-2 justify-center">
            <Button onClick={toggleSimulation} size="lg" style={{ backgroundColor: modelTheme.primary }}>
              {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {isRunning ? "Pause" : simulationRuns.length === 0 ? "Start Simulation" : "Resume"}
            </Button>
            <Button variant="outline" onClick={resetSimulation}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            {simulationRuns.length > 0 && (
              <Button variant="outline" onClick={pinCurrentRun}>
                <Pin className="h-4 w-4 mr-2" />
                Pin Run
              </Button>
            )}
          </div>

          {/* Live Simulation */}
          {simulationRuns.length > 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Completion Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {currentData.length > 0 ? currentData[currentData.length - 1]?.tokensGenerated : 0} / {config.completionTokens} tokens
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <Card>
                <CardContent className="pt-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={currentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="tokensPerSecond"
                        name="Tokens/Second"
                        stroke={modelTheme.primary}
                        fill={modelTheme.primary}
                        fillOpacity={0.6}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Live Output Stream */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Live Output Stream</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-32 overflow-y-auto">
                    {currentData.length > 0 && (
                      <div>
                        <div className="text-blue-400">[SIMULATION] Starting token generation...</div>
                        <div className="text-yellow-400">[MODEL] {config.model}</div>
                        <div className="text-white">
                          {"█".repeat(Math.floor(progress / 5))}
                          {progress < 100 && <span className="animate-pulse">█</span>}
                        </div>
                        <div className="text-green-400">
                          Generated: {currentData[currentData.length - 1]?.tokensGenerated || 0} tokens
                        </div>
                        {progress >= 100 && <div className="text-green-400">[COMPLETE] Simulation finished!</div>}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Pinned Runs */}
          {pinnedRuns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pinned Runs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pinnedRuns.map((run, index) => (
                    <div key={run.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <Pin className="h-4 w-4" style={{ color: run.color }} />
                        <span className="font-medium">{run.config.model}</span>
                        <Badge variant="outline">{run.config.completionTokens} tokens</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {Math.round(run.data[run.data.length - 1]?.tokensPerSecond || 0)} TPS
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedTokenSpeedSimulator;
