import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { modelPricing, firstTokenLatency, tokensPerSecond, getModelCategories, calculateCost, calculateTotalTime, getFeaturedModels } from "@/lib/modelData";
import { getModelTheme } from "@/lib/modelThemes";
import { Timer, FileText, MessageSquare, User, Zap, Clock, Info, BarChart2, LineChart as LineChartIcon, Settings, PieChart } from 'lucide-react';

interface TokenGenData {
  time: number | string;
  [key: string]: number | string;
}

const EnhancedSpeedSimulator = () => {
  // State for model selection
  const [selectedModels, setSelectedModels] = useState<string[]>(["gpt-4o", "claude-3-opus", "llama-3-70b"]);
  const [tokensToGenerate, setTokensToGenerate] = useState(1000);
  const [customSpeed, setCustomSpeed] = useState(30); // tokens per second
  const [customLatency, setCustomLatency] = useState(300); // milliseconds
  const [activeTab, setActiveTab] = useState("visualization");
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [generatedTextLength, setGeneratedTextLength] = useState(0);
  const [showCustomModel, setShowCustomModel] = useState(false);
  
  // Sample text for visualization (lorem ipsum)
  const sampleText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
  const words = sampleText.split(' ');
  
  // Animation frame reference
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const textDisplayRef = useRef<HTMLDivElement>(null);
  
  const modelCategories = getModelCategories();
  const availableModels = Object.keys(tokensPerSecond);
  const featuredModels = getFeaturedModels();

  // Handle model selection toggle
  const toggleModel = (model: string) => {
    if (selectedModels.includes(model)) {
      setSelectedModels(selectedModels.filter(m => m !== model));
    } else {
      // Limit to max 5 models
      if (selectedModels.length < 5) {
        setSelectedModels([...selectedModels, model]);
      }
    }
  };

  // Add custom model to selection
  const addCustomModel = () => {
    const customModel = "custom-model";
    // Add custom model data
    firstTokenLatency["custom-model"] = customLatency;
    tokensPerSecond["custom-model"] = customSpeed;
    modelPricing["custom-model"] = { input: 0.0001, output: 0.0005 };
    
    if (!selectedModels.includes(customModel)) {
      setSelectedModels([...selectedModels, customModel]);
    }
  };

  // Generate data for the time-based chart
  const generateTimeData = (): TokenGenData[] => {
    // Create time points from 0 to max time needed
    const maxTimeNeeded = Math.max(
      ...selectedModels.map(model => calculateTotalTime(tokensToGenerate, model))
    );
    
    // Create enough data points for a smooth chart
    const numPoints = 20;
    const timePoints: number[] = [];
    for (let i = 0; i <= numPoints; i++) {
      timePoints.push((maxTimeNeeded * i) / numPoints);
    }
    
    // Generate data for each time point
    return timePoints.map(time => {
      const dataPoint: TokenGenData = { time: time.toFixed(1) + 's' };
      
      selectedModels.forEach(model => {
        dataPoint[model] = Math.min(
          tokensToGenerate,
          time >= (firstTokenLatency[model] / 1000)
            ? Math.max(0, Math.floor((time - firstTokenLatency[model] / 1000) * tokensPerSecond[model]))
            : 0
        );
      });
      
      return dataPoint;
    });
  };

  // Generate comparison data for the models
  const generateComparisonData = () => {
    return selectedModels.map(model => {
      const theme = getModelTheme(model);
      const tps = tokensPerSecond[model];
      const latency = firstTokenLatency[model];
      const totalTime = calculateTotalTime(tokensToGenerate, model);
      const outputCost = calculateCost(tokensToGenerate, model, true);
      
      return {
        model,
        color: theme.primary,
        tps,
        latency,
        totalTime: parseFloat(totalTime.toFixed(2)),
        outputCost: outputCost,
        timePerToken: (1 / tps).toFixed(3)
      };
    }).sort((a, b) => a.totalTime - b.totalTime);
  };
  
  // Start/stop animation
  const toggleSimulation = () => {
    if (simulationRunning) {
      // Stop simulation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
      setSimulationRunning(false);
    } else {
      // Start simulation
      startTimeRef.current = Date.now();
      setElapsedTime(0);
      setGeneratedTextLength(0);
      setSimulationRunning(true);
      
      // Reset the text display
      if (textDisplayRef.current) {
        textDisplayRef.current.innerHTML = '';
      }
    }
  };
  
  // Animation effect for simulation
  useEffect(() => {
    if (!simulationRunning) return;
    
    const animate = () => {
      const now = Date.now();
      const elapsed = (now - startTimeRef.current) / 1000; // in seconds
      setElapsedTime(elapsed);
      
      // Get fastest model for visualization
      const fastestModel = selectedModels.reduce((fastest, model) => {
        const currentTPS = tokensPerSecond[model] || 0;
        const fastestTPS = tokensPerSecond[fastest] || 0;
        return currentTPS > fastestTPS ? model : fastest;
      }, selectedModels[0]);
      
      // Calculate tokens generated for visualization
      const tokensGenerated = Math.min(
        tokensToGenerate,
        elapsed >= (firstTokenLatency[fastestModel] / 1000)
          ? Math.floor((elapsed - firstTokenLatency[fastestModel] / 1000) * tokensPerSecond[fastestModel])
          : 0
      );
      
      // Update text display
      if (textDisplayRef.current) {
        // Each token is roughly equivalent to ~3-4 characters or ~0.75 words
        const approximateWords = Math.min(Math.ceil(tokensGenerated * 0.75), words.length);
        
        if (approximateWords > 0) {
          // Display generated words
          textDisplayRef.current.innerHTML = words.slice(0, approximateWords).join(' ');
          // Calculate percentage for visual indicators
          setGeneratedTextLength((approximateWords / words.length) * 100);
        } else {
          textDisplayRef.current.innerHTML = '<span class="text-gray-400">Waiting for first token...</span>';
        }
      }
      
      // Check if we've completed the generation
      const maxTime = calculateTotalTime(tokensToGenerate, fastestModel);
      if (elapsed < maxTime) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setSimulationRunning(false);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [simulationRunning, selectedModels, tokensToGenerate, words]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Prepare chart data
  const timeData = generateTimeData();
  const comparisonData = generateComparisonData();

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/5 pointer-events-none" />
        
        <CardHeader className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-5 w-5 text-purple-500" />
            <CardTitle>Token Speed Simulator</CardTitle>
          </div>
          <CardDescription>
            Compare token generation speeds across AI models and visualize real-time output
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 relative">
          {/* Configuration Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Model Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">Models (max 5)</h3>
                <Badge variant="outline" className="bg-purple-50">
                  {selectedModels.length}/5 selected
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Select onValueChange={(value) => {
                    if (!selectedModels.includes(value) && selectedModels.length < 5) {
                      setSelectedModels([...selectedModels, value]);
                    }
                  }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Add a model..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(modelCategories).map(([category, models]) => (
                        <SelectGroup key={category}>
                          <SelectLabel>{category}</SelectLabel>
                          {models.map(model => (
                            <SelectItem 
                              key={model} 
                              value={model}
                              disabled={selectedModels.includes(model)}
                            >
                              {model}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Toggle 
                          pressed={showCustomModel} 
                          onPressedChange={setShowCustomModel}
                          aria-label="Toggle custom model"
                        >
                          <Settings className="h-4 w-4" />
                        </Toggle>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Add custom model</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                {showCustomModel && (
                  <div className="p-3 bg-slate-50 rounded-md space-y-3">
                    <h4 className="text-sm font-medium">Custom Model</h4>
                    
                    <div>
                      <Label className="text-xs" htmlFor="custom-latency">
                        First token latency (ms)
                      </Label>
                      <div className="flex items-center gap-2">
                        <Slider
                          id="custom-latency"
                          min={50}
                          max={1000}
                          step={10}
                          value={[customLatency]}
                          onValueChange={(value) => setCustomLatency(value[0])}
                          className="flex-1"
                        />
                        <span className="text-sm w-12 text-right">{customLatency}</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs" htmlFor="custom-speed">
                        Tokens per second
                      </Label>
                      <div className="flex items-center gap-2">
                        <Slider
                          id="custom-speed"
                          min={1}
                          max={120}
                          step={1}
                          value={[customSpeed]}
                          onValueChange={(value) => setCustomSpeed(value[0])}
                          className="flex-1"
                        />
                        <span className="text-sm w-12 text-right">{customSpeed}</span>
                      </div>
                    </div>
                    
                    <Button 
                      size="sm" 
                      onClick={addCustomModel}
                      className="w-full bg-purple-500 hover:bg-purple-600"
                    >
                      Add Custom Model
                    </Button>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {featuredModels.map(model => (
                    <Badge 
                      key={model}
                      variant="outline"
                      className={`cursor-pointer transition-colors ${
                        selectedModels.includes(model) 
                          ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                      onClick={() => toggleModel(model)}
                    >
                      {model}
                      {selectedModels.includes(model) && (
                        <span className="ml-1">✓</span>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="bg-slate-50 p-3 rounded-md">
                <div className="mb-2 text-sm font-medium">Selected Models</div>
                {selectedModels.length === 0 ? (
                  <div className="text-sm text-gray-500">No models selected</div>
                ) : (
                  <div className="space-y-2">
                    {selectedModels.map(model => {
                      const theme = getModelTheme(model);
                      return (
                        <div 
                          key={model}
                          className="flex items-center justify-between text-sm p-2 rounded-md"
                          style={{ backgroundColor: `${theme.primary}20` }}
                        >
                          <span>{model}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5"
                            onClick={() => toggleModel(model)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            
            {/* Token Configuration */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm">Token Configuration</h3>
              
              <div>
                <Label htmlFor="tokensToGenerate">Output Tokens</Label>
                <div className="flex items-center gap-4 mt-1">
                  <Slider
                    id="tokensToGenerate"
                    min={100}
                    max={10000}
                    step={100}
                    value={[tokensToGenerate]}
                    onValueChange={(value) => setTokensToGenerate(value[0])}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={tokensToGenerate}
                    onChange={(e) => setTokensToGenerate(parseInt(e.target.value) || 100)}
                    className="w-24"
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Short (100)</span>
                  <span>Medium (1000)</span>
                  <span>Long (10000)</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Button 
                  className={`flex items-center gap-2 ${
                    simulationRunning 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                  onClick={toggleSimulation}
                >
                  {simulationRunning ? (
                    <>
                      <Clock className="h-4 w-4" /> Stop Simulation
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" /> Start Simulation
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    // Reset everything
                    if (animationRef.current) {
                      cancelAnimationFrame(animationRef.current);
                    }
                    setSimulationRunning(false);
                    setElapsedTime(0);
                    setGeneratedTextLength(0);
                    if (textDisplayRef.current) {
                      textDisplayRef.current.innerHTML = '';
                    }
                  }}
                >
                  Reset
                </Button>
              </div>
              
              {/* Summary Metrics */}
              <div className="bg-slate-50 p-3 rounded-md space-y-2 mt-4">
                <div className="text-sm font-medium mb-2">Simulation Progress</div>
                
                <div className="flex justify-between text-xs mb-1">
                  <span>Time elapsed</span>
                  <span className="font-semibold">{elapsedTime.toFixed(1)}s</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all"
                    style={{ 
                      width: `${Math.min(100, (generatedTextLength))}%`,
                      transition: 'width 0.3s ease-out'
                    }}
                  />
                </div>
                
                <div className="mt-2 text-center">
                  <Badge variant="outline" className={simulationRunning ? 'bg-green-100 text-green-800' : 'bg-gray-100'}>
                    {simulationRunning ? 'Generating Tokens' : 'Ready'}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Text Preview */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm">Text Generation Preview</h3>
              
              <div className="border rounded-md p-3 bg-white min-h-[200px] max-h-[250px] overflow-auto">
                <div ref={textDisplayRef} className="text-sm">
                  {simulationRunning ? (
                    <span className="text-gray-400">Waiting for first token...</span>
                  ) : (
                    <span className="text-gray-400">Start the simulation to see text generation</span>
                  )}
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  <span>
                    Text shown is an approximation of how tokens would be generated.
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabs for different visualizations */}
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="mt-6"
          >
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="visualization" className="flex items-center gap-2">
                <LineChartIcon className="h-4 w-4" /> 
                Time Comparison
              </TabsTrigger>
              <TabsTrigger value="metrics" className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4" /> 
                Speed Metrics
              </TabsTrigger>
              <TabsTrigger value="cost" className="flex items-center gap-2">
                <PieChart className="h-4 w-4" /> 
                Cost Analysis
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="visualization" className="p-1">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={timeData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis 
                        dataKey="time" 
                        label={{ value: 'Time (seconds)', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis 
                        label={{ value: 'Tokens Generated', angle: -90, position: 'insideLeft' }} 
                      />
                      <RechartsTooltip 
                        formatter={(value: any, name: string) => [`${value} tokens`, name]}
                        labelFormatter={(label) => `Time: ${label}`}
                      />
                      <Legend />
                      {selectedModels.map(model => {
                        const theme = getModelTheme(model);
                        return (
                          <Line
                            key={model}
                            type="monotone"
                            dataKey={model}
                            name={model}
                            stroke={theme.primary}
                            activeDot={{ r: 8 }}
                            strokeWidth={2}
                          />
                        );
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4 text-sm text-gray-600">
                  <div className="flex items-start gap-1">
                    <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div>
                      This chart shows how many tokens are generated over time for each model. 
                      The flat initial segment for each model represents the first token latency.
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="metrics" className="p-1">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Speed Comparison</h4>
                    <div className="space-y-3">
                      {comparisonData.map((item, idx) => (
                        <div key={item.model} className="flex flex-col space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span style={{ color: item.color }} className="font-medium">
                                {idx + 1}. {item.model}
                              </span>
                            </div>
                            <span className="text-sm">{item.totalTime.toFixed(1)}s</span>
                          </div>
                          <div className="h-2.5 bg-gray-200 rounded-full">
                            <div 
                              className="h-full rounded-full" 
                              style={{ 
                                width: `${(comparisonData[0].totalTime / item.totalTime) * 100}%`,
                                backgroundColor: item.color 
                              }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{item.tps} tokens/sec</span>
                            <span>{item.latency}ms first token</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="h-80">
                    <h4 className="font-medium mb-3">Tokens Per Second</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={comparisonData.map(item => ({
                          model: item.model,
                          tps: item.tps,
                          color: item.color
                        }))}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
                        <XAxis type="number" label={{ value: 'Tokens per Second', position: 'insideBottom', offset: -5 }} />
                        <YAxis 
                          dataKey="model" 
                          type="category" 
                          width={80} 
                          tick={{ fontSize: 12 }}
                        />
                        <RechartsTooltip formatter={(value: any) => [`${value} tokens/sec`]} />
                        <Bar 
                          dataKey="tps" 
                          name="Tokens per Second"
                          fill="#8884d8"
                          radius={[0, 4, 4, 0]}
                        >
                          {comparisonData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="cost" className="p-1">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Cost Per 1,000 Tokens</h4>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left pb-2">Model</th>
                            <th className="text-right pb-2">Output Cost</th>
                            <th className="text-right pb-2">Time to Generate</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {comparisonData.map((item) => (
                            <tr key={item.model} className="hover:bg-slate-100">
                              <td className="py-2">{item.model}</td>
                              <td className="text-right">${(item.outputCost / (tokensToGenerate / 1000)).toFixed(4)}</td>
                              <td className="text-right">{item.totalTime.toFixed(2)}s</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Total Cost for {tokensToGenerate.toLocaleString()} Tokens</h4>
                      <div className="space-y-2">
                        {comparisonData.map((item) => (
                          <div key={item.model} className="flex items-center justify-between bg-slate-50 p-2 rounded-md">
                            <span style={{ color: item.color }} className="font-medium">{item.model}</span>
                            <span className="font-semibold">${item.outputCost.toFixed(6)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium mb-3">Cost-Speed Analysis</h4>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={comparisonData.map(item => ({
                            model: item.model,
                            speed: item.tps,
                            cost: (item.outputCost / (tokensToGenerate / 1000)) * 1000, // Cost per million tokens
                            color: item.color
                          }))}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis 
                            dataKey="speed" 
                            label={{ value: 'Speed (tokens/sec)', position: 'insideBottom', offset: -5 }}
                          />
                          <YAxis 
                            label={{ value: 'Cost ($ per million tokens)', angle: -90, position: 'insideLeft' }} 
                          />
                          <RechartsTooltip 
                            formatter={(value: any, name: string) => [
                              name === 'cost' ? `$${value.toFixed(2)}` : value,
                              name === 'cost' ? 'Cost per Million Tokens' : 'Tokens per Second'
                            ]}
                            labelFormatter={(label) => `Model: ${label}`}
                          />
                          <Legend />
                          {comparisonData.map((entry, index) => (
                            <Line
                              key={`dot-${index}`}
                              data={[entry].map(item => ({
                                model: item.model,
                                speed: item.tps,
                                cost: (item.outputCost / (tokensToGenerate / 1000)) * 1000
                              }))}
                              type="monotone"
                              dataKey="cost"
                              name={entry.model}
                              stroke="none"
                              fill={entry.color}
                            >
                              {/* Fix: Use a LabelList component instead of Label with content function */}
                              <g>
                                {entry && (
                                  <g>
                                    <circle 
                                      cx={entry.tps} 
                                      cy={(entry.outputCost / (tokensToGenerate / 1000)) * 1000} 
                                      r={6} 
                                      fill={entry.color} 
                                    />
                                    <text 
                                      x={entry.tps} 
                                      y={(entry.outputCost / (tokensToGenerate / 1000)) * 1000 - 10} 
                                      textAnchor="middle" 
                                      fill={entry.color} 
                                      fontSize={12}
                                    >
                                      {entry.model}
                                    </text>
                                  </g>
                                )}
                              </g>
                            </Line>
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <div className="flex items-start gap-1">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                        <div>
                          This chart plots each model based on its token generation speed vs. its cost per million tokens.
                          Ideal models would appear in the bottom-right (fast & cheap).
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="relative text-xs text-gray-500 pt-0">
          <div className="flex items-center gap-1">
            <Info className="h-3 w-3" />
            <span>
              Token generation speeds and latencies are approximate and may vary based on server load, 
              prompt complexity, and model version.
            </span>
          </div>
        </CardFooter>
      </Card>
      
      {/* Additional metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-500" />
              Average Latency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedModels.length > 0
                ? (selectedModels.reduce(
                    (sum, model) => sum + firstTokenLatency[model],
                    0
                  ) / selectedModels.length).toFixed(0)
                : "0"}
              <span className="text-sm font-normal text-muted-foreground ml-1">ms</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average time to first token
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500" />
              Average Speed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedModels.length > 0
                ? (selectedModels.reduce(
                    (sum, model) => sum + tokensPerSecond[model],
                    0
                  ) / selectedModels.length).toFixed(1)
                : "0"}
              <span className="text-sm font-normal text-muted-foreground ml-1">tokens/sec</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average token generation speed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-500" />
              Reading Equivalent
            </CardTitle>
          </CardHeader>
          <Card
