
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Play, Pause, RotateCcw, Zap, Clock, TrendingUp, Settings, ChevronDown, Pin, Cpu, Gauge, Database } from "lucide-react";
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
  modelSize: number;
  batchSize: number;
  networkLatency: number;
  parallelism: string;
  hardwareTier: string;
  useKvCache: boolean;
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

const sampleText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.";

const EnhancedTokenSpeedSimulator: React.FC = () => {
  const [config, setConfig] = useState<SimulationConfig>({
    model: "gpt-4o",
    promptTokens: 200,
    completionTokens: 800,
    concurrency: 1,
    streaming: true,
    quantization: "none",
    sequenceLength: 1024,
    gpuUtilization: 80,
    modelSize: 88,
    batchSize: 24,
    networkLatency: 230,
    parallelism: "none",
    hardwareTier: "mid",
    useKvCache: true
  });

  const [isSimpleView, setIsSimpleView] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [simulationRuns, setSimulationRuns] = useState<SimulationRun[]>([]);
  const [pinnedRuns, setPinnedRuns] = useState<SimulationRun[]>([]);
  const [isParametersOpen, setIsParametersOpen] = useState(false);
  const [currentTokenIndex, setCurrentTokenIndex] = useState(0);
  const [currentRate, setCurrentRate] = useState(0);
  const [isTokenFlashing, setIsTokenFlashing] = useState(false);

  // Get model theme for dynamic coloring
  const modelTheme = useMemo(() => getModelTheme(config.model), [config.model]);
  const modelCategories = getModelCategories();

  // Enhanced performance metrics with hardware considerations
  const performanceMetrics = useMemo(() => {
    const baseLatency = firstTokenLatency[config.model] || 300;
    const baseTPS = tokensPerSecond[config.model] || 30;
    
    // Hardware tier multipliers
    const hardwareMultiplier = config.hardwareTier === "high" ? 1.5 : config.hardwareTier === "low" ? 0.7 : 1.0;
    
    // Quantization multiplier
    const quantMultiplier = config.quantization === "8bit" ? 0.9 : config.quantization === "4bit" ? 0.8 : 1;
    
    // KV Cache improvement
    const kvCacheMultiplier = config.useKvCache ? 1.2 : 1.0;
    
    // Batch size effects (diminishing returns)
    const batchMultiplier = Math.log(config.batchSize + 1) / Math.log(2);
    
    // Parallelism effects
    const parallelismMultiplier = config.parallelism === "model" ? 1.3 : config.parallelism === "pipeline" ? 1.1 : 1.0;
    
    const adjustedTPS = baseTPS * quantMultiplier * hardwareMultiplier * kvCacheMultiplier * batchMultiplier * parallelismMultiplier * (config.gpuUtilization / 100);
    const adjustedLatency = baseLatency + config.networkLatency;
    
    // Calculate costs
    const pricing = modelPricing[config.model];
    const inputCost = pricing ? (config.promptTokens / 1000) * pricing.input : 0;
    const outputCost = pricing ? (config.completionTokens / 1000) * pricing.output : 0;
    const totalCost = inputCost + outputCost;
    
    return {
      throughput: Math.round(adjustedTPS * config.concurrency),
      latency: Math.round(adjustedLatency),
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
    const firstTokenDelay = performanceMetrics.latency / 1000;
    let tokensGenerated = 0;
    
    for (let i = 0; i <= 100; i++) {
      const timeElapsed = (i / 100) * (config.completionTokens / targetTPS + firstTokenDelay);
      
      if (timeElapsed <= firstTokenDelay) {
        tokensGenerated = 0;
      } else {
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

  // Token flashing effect
  useEffect(() => {
    if (isRunning && currentData.length > 0) {
      const currentTokens = currentData[currentData.length - 1]?.tokensGenerated || 0;
      if (currentTokens > currentTokenIndex) {
        setIsTokenFlashing(true);
        setCurrentTokenIndex(currentTokens);
        setCurrentRate(Math.floor(Math.random() * 4) + 7); // 7-10 range
        setTimeout(() => setIsTokenFlashing(false), 100);
      }
    }
  }, [currentData, isRunning, currentTokenIndex]);

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
    }, 100);
    
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
    setCurrentTokenIndex(0);
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
    setCurrentTokenIndex(0);
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

  // Get generated text up to current token
  const generatedText = useMemo(() => {
    const words = sampleText.split(' ');
    const tokensToShow = Math.floor(currentTokenIndex * 0.75); // Approximate tokens to words ratio
    return words.slice(0, tokensToShow).join(' ');
  }, [currentTokenIndex]);

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Model & Simulation */}
            <div className="space-y-4">
              {/* Model Selection */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Model Selection</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={config.model} onValueChange={(value) => setConfig(prev => ({ ...prev, model: value }))}>
                    <SelectTrigger className="w-full">
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
                </CardContent>
              </Card>

              {/* Simulation Task */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Simulation Task</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Custom Parameters */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Tune Custom Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Model Size */}
                  <div className="space-y-2">
                    <Label>Model Size (B): {config.modelSize}B</Label>
                    <Slider
                      value={[config.modelSize]}
                      onValueChange={([value]) => setConfig(prev => ({ ...prev, modelSize: value }))}
                      max={175}
                      min={1}
                      step={1}
                    />
                  </div>

                  {/* Quantization */}
                  <div className="space-y-2">
                    <Label>Quantization</Label>
                    <Select value={config.quantization} onValueChange={(value) => setConfig(prev => ({ ...prev, quantization: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="8bit">8-bit</SelectItem>
                        <SelectItem value="4bit">4-bit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Hardware */}
                  <div className="space-y-2">
                    <Label>Hardware</Label>
                    <Select value={config.hardwareTier} onValueChange={(value) => setConfig(prev => ({ ...prev, hardwareTier: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">GPU (Low)</SelectItem>
                        <SelectItem value="mid">GPU (Mid)</SelectItem>
                        <SelectItem value="high">GPU (High)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Parallelism */}
                  <div className="space-y-2">
                    <Label>Parallelism</Label>
                    <Select value={config.parallelism} onValueChange={(value) => setConfig(prev => ({ ...prev, parallelism: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="model">Model Parallel</SelectItem>
                        <SelectItem value="pipeline">Pipeline Parallel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Batch Size */}
                  <div className="space-y-2">
                    <Label>Batch Size: {config.batchSize}</Label>
                    <Slider
                      value={[config.batchSize]}
                      onValueChange={([value]) => setConfig(prev => ({ ...prev, batchSize: value }))}
                      max={64}
                      min={1}
                      step={1}
                    />
                  </div>

                  {/* Network Latency */}
                  <div className="space-y-2">
                    <Label>Network Latency: {config.networkLatency}ms</Label>
                    <Slider
                      value={[config.networkLatency]}
                      onValueChange={([value]) => setConfig(prev => ({ ...prev, networkLatency: value }))}
                      max={500}
                      min={50}
                      step={10}
                    />
                  </div>

                  {/* Sequence Length */}
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

                  {/* HW Utilization */}
                  <div className="space-y-2">
                    <Label>HW Utilization: {config.gpuUtilization}%</Label>
                    <Slider
                      value={[config.gpuUtilization]}
                      onValueChange={([value]) => setConfig(prev => ({ ...prev, gpuUtilization: value }))}
                      max={100}
                      min={10}
                      step={5}
                    />
                  </div>

                  {/* Use KV Cache */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="kv-cache"
                      checked={config.useKvCache}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, useKvCache: checked }))}
                    />
                    <Label htmlFor="kv-cache">Use KV Cache</Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" style={{ color: modelTheme.primary }} />
                  <div className="text-2xl font-bold" style={{ color: modelTheme.primary }}>
                    {performanceMetrics.throughput}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Tokens/Second</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <div className="text-2xl font-bold text-orange-600">
                    {performanceMetrics.latency}ms
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">First Token Latency</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-green-600">
                    ${performanceMetrics.totalCost.toFixed(4)}
                  </div>
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

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Live Output Stream */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Live Output Stream</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-white border rounded-lg p-4 min-h-48 max-h-64 overflow-y-auto">
                        <div className="text-sm leading-relaxed">
                          {generatedText}
                          {isRunning && (
                            <span className={`inline-block w-2 h-4 bg-black ml-1 ${isTokenFlashing ? 'opacity-100' : 'opacity-50'} transition-opacity`} />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Live Metrics */}
                <div className="space-y-4">
                  {/* Token Indicator */}
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center space-y-2">
                        <div className="text-sm text-muted-foreground">Token Indicator</div>
                        <div className={`w-6 h-6 rounded-full mx-auto transition-all duration-100 ${isTokenFlashing ? 'bg-green-500 scale-110' : 'bg-gray-300'}`} />
                        <div className="text-xs text-muted-foreground">Flashes/token</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tokens Generated */}
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center space-y-2">
                        <div className="text-sm text-muted-foreground">Tokens Generated</div>
                        <div className="text-2xl font-bold">
                          {currentTokenIndex}
                          <span className="text-lg text-muted-foreground"> / {config.completionTokens}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Rate This Second */}
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center space-y-2">
                        <div className="text-sm text-muted-foreground">Rate This Second</div>
                        <div className="text-xl font-bold">
                          {currentRate} / 10 t/s
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Performance Chart */}
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
