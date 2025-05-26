
import React, { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw, Zap, Clock, TrendingUp } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface SimulationParams {
  baseTokensPerSecond: number;
  batchSize: number;
  sequenceLength: number;
  parallelRequests: number;
  warmupSteps: number;
  totalSteps: number;
  variability: number;
}

interface Tick {
  timestamp: number;
  tokensPerSecond: number;
  throughput: number;
  latency: number;
  efficiency: number;
}

interface SimulationRun {
  runName: string;
  data: Tick[];
  color: string;
}

const TokenSpeedSimulator: React.FC = () => {
  const [params, setParams] = useState<SimulationParams>({
    baseTokensPerSecond: 1500,
    batchSize: 8,
    sequenceLength: 2048,
    parallelRequests: 4,
    warmupSteps: 50,
    totalSteps: 200,
    variability: 0.1
  });

  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [simulationRuns, setSimulationRuns] = useState<SimulationRun[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<keyof Tick>("tokensPerSecond");

  // Simulation logic
  const generateSimulationData = useCallback((runParams: SimulationParams, runName: string): Tick[] => {
    const data: Tick[] = [];
    
    for (let i = 0; i < runParams.totalSteps; i++) {
      const isWarmup = i < runParams.warmupSteps;
      const progress = isWarmup ? i / runParams.warmupSteps : 1;
      
      // Base performance with warmup
      let basePerformance = runParams.baseTokensPerSecond * progress;
      
      // Add variability
      const variance = 1 + (Math.random() - 0.5) * 2 * runParams.variability;
      const tokensPerSecond = basePerformance * variance;
      
      // Calculate derived metrics
      const throughput = tokensPerSecond * runParams.batchSize;
      const latency = (runParams.sequenceLength / tokensPerSecond) * 1000; // ms
      const efficiency = tokensPerSecond / runParams.baseTokensPerSecond;
      
      data.push({
        timestamp: i,
        tokensPerSecond: Math.round(tokensPerSecond),
        throughput: Math.round(throughput),
        latency: Math.round(latency * 100) / 100,
        efficiency: Math.round(efficiency * 1000) / 1000
      });
    }
    
    return data;
  }, []);

  const runSimulation = useCallback(() => {
    const runName = `Run ${simulationRuns.length + 1}`;
    const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#8dd1e1"];
    const color = colors[simulationRuns.length % colors.length];
    
    const data = generateSimulationData(params, runName);
    
    setSimulationRuns(prev => [...prev, {
      runName,
      data,
      color
    }]);
  }, [params, simulationRuns.length, generateSimulationData]);

  const clearSimulations = useCallback(() => {
    setSimulationRuns([]);
    setCurrentStep(0);
  }, []);

  // Current simulation data
  const currentData = useMemo(() => {
    if (simulationRuns.length === 0) return [];
    return simulationRuns[simulationRuns.length - 1].data.slice(0, currentStep + 1);
  }, [simulationRuns, currentStep]);

  // Combined data for comparison
  const combinedData = useMemo(() => {
    if (simulationRuns.length === 0) return [];
    
    const maxLength = Math.max(...simulationRuns.map(run => run.data.length));
    const combined = [];
    
    for (let i = 0; i < maxLength; i++) {
      const point: any = { timestamp: i };
      simulationRuns.forEach(run => {
        if (run.data[i]) {
          point[`${run.runName}_${selectedMetric}`] = run.data[i][selectedMetric];
        }
      });
      combined.push(point);
    }
    
    return combined;
  }, [simulationRuns, selectedMetric]);

  // Statistics
  const currentStats = useMemo(() => {
    if (currentData.length === 0) return null;
    
    const latest = currentData[currentData.length - 1];
    const avg = currentData.reduce((sum, tick) => sum + tick.tokensPerSecond, 0) / currentData.length;
    const max = Math.max(...currentData.map(tick => tick.tokensPerSecond));
    const min = Math.min(...currentData.map(tick => tick.tokensPerSecond));
    
    return {
      current: latest.tokensPerSecond,
      average: Math.round(avg),
      maximum: max,
      minimum: min,
      efficiency: latest.efficiency
    };
  }, [currentData]);

  // Animation effect
  React.useEffect(() => {
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

  const handleStartPause = () => {
    if (simulationRuns.length === 0) {
      runSimulation();
      setCurrentStep(0);
      setIsRunning(true);
    } else {
      setIsRunning(!isRunning);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentStep(0);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Token Speed Simulator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="setup" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="simulation">Simulation</TabsTrigger>
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="base-tps">Base Tokens/Second</Label>
                  <Input
                    id="base-tps"
                    type="number"
                    value={params.baseTokensPerSecond}
                    onChange={(e) => setParams(prev => ({
                      ...prev,
                      baseTokensPerSecond: parseInt(e.target.value) || 0
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="batch-size">Batch Size</Label>
                  <Input
                    id="batch-size"
                    type="number"
                    value={params.batchSize}
                    onChange={(e) => setParams(prev => ({
                      ...prev,
                      batchSize: parseInt(e.target.value) || 0
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="sequence-length">Sequence Length</Label>
                  <Input
                    id="sequence-length"
                    type="number"
                    value={params.sequenceLength}
                    onChange={(e) => setParams(prev => ({
                      ...prev,
                      sequenceLength: parseInt(e.target.value) || 0
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="variability">Variability (%)</Label>
                  <Input
                    id="variability"
                    type="number"
                    step="0.01"
                    value={params.variability}
                    onChange={(e) => setParams(prev => ({
                      ...prev,
                      variability: parseFloat(e.target.value) || 0
                    }))}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleStartPause}>
                  {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  {isRunning ? "Pause" : "Start"}
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button variant="outline" onClick={runSimulation}>
                  New Run
                </Button>
                <Button variant="outline" onClick={clearSimulations}>
                  Clear All
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="simulation" className="space-y-4">
              {currentStats && (
                <div className="grid grid-cols-5 gap-4 mb-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-blue-600">{currentStats.current}</div>
                      <p className="text-xs text-muted-foreground">Current TPS</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-green-600">{currentStats.average}</div>
                      <p className="text-xs text-muted-foreground">Average TPS</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-purple-600">{currentStats.maximum}</div>
                      <p className="text-xs text-muted-foreground">Max TPS</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-orange-600">{currentStats.minimum}</div>
                      <p className="text-xs text-muted-foreground">Min TPS</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-red-600">{(currentStats.efficiency * 100).toFixed(1)}%</div>
                      <p className="text-xs text-muted-foreground">Efficiency</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              <Card>
                <CardContent className="pt-4">
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={currentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="tokensPerSecond"
                        name="Tokens/Second"
                        stroke="#8884d8"
                        strokeWidth={2}
                        fillOpacity={0.6}
                        fill="#8884d8"
                        dot={false}
                        isAnimationActive={false}
                      />
                      <Area
                        type="monotone"
                        dataKey="efficiency"
                        name="Efficiency"
                        stroke="#82ca9d"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        fillOpacity={0.3}
                        fill="#82ca9d"
                        dot={false}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comparison" className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Select value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as keyof Tick)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tokensPerSecond">Tokens/Second</SelectItem>
                    <SelectItem value="throughput">Throughput</SelectItem>
                    <SelectItem value="latency">Latency</SelectItem>
                    <SelectItem value="efficiency">Efficiency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card>
                <CardContent className="pt-4">
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={combinedData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {simulationRuns.map((run) => (
                        <Line
                          key={run.runName}
                          type="monotone"
                          dataKey={`${run.runName}_${selectedMetric}`}
                          name={run.runName}
                          stroke={run.color}
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={false}
                        />
                      ))}
                      {simulationRuns.length > 1 && (
                        <Line
                          type="monotone"
                          dataKey={`baseline_${selectedMetric}`}
                          name="Baseline"
                          stroke="#999"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={false}
                          isAnimationActive={false}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {simulationRuns.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                  {simulationRuns.map((run, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded" 
                              style={{ backgroundColor: run.color }}
                            />
                            <span className="font-medium">{run.runName}</span>
                          </div>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>Avg: {Math.round(run.data.reduce((sum, tick) => sum + tick.tokensPerSecond, 0) / run.data.length)} TPS</span>
                            <span>Max: {Math.max(...run.data.map(tick => tick.tokensPerSecond))} TPS</span>
                            <span>Min: {Math.min(...run.data.map(tick => tick.tokensPerSecond))} TPS</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Performance Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Warmup Phase:</span>
                        <span>{params.warmupSteps} steps</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Target TPS:</span>
                        <span>{params.baseTokensPerSecond}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expected Variance:</span>
                        <span>±{(params.variability * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Optimization Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p>• Increase batch size for higher throughput</p>
                      <p>• Reduce sequence length for lower latency</p>
                      <p>• Monitor warmup patterns for optimization</p>
                      <p>• Consider parallelization for scaling</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenSpeedSimulator;
