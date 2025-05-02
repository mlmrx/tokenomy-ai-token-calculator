
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { modelPricing } from "@/lib/modelData";
import { getModelTheme } from "@/lib/modelThemes";

// First token latency in milliseconds (approximate values)
const firstTokenLatency = {
  "gpt-4": 750,
  "gpt-4-turbo": 380,
  "gpt-3.5-turbo": 230,
  "claude-3-opus": 600,
  "claude-3-sonnet": 300,
  "claude-3-haiku": 200,
  "gemini-1.0-pro": 450,
  "gemini-1.5-pro": 350,
  "llama-2-70b": 550,
  "llama-2-13b": 280,
  "llama-2-7b": 180,
  "grok-1": 300,
  "deepseek-coder": 280,
  "qwen-max": 500,
  "ernie-bot": 400
};

// Tokens per second (approximate values)
const tokensPerSecond = {
  "gpt-4": 15,
  "gpt-4-turbo": 27,
  "gpt-3.5-turbo": 40,
  "claude-3-opus": 20,
  "claude-3-sonnet": 32,
  "claude-3-haiku": 45,
  "gemini-1.0-pro": 25,
  "gemini-1.5-pro": 30,
  "llama-2-70b": 18,
  "llama-2-13b": 35,
  "llama-2-7b": 50,
  "grok-1": 33,
  "deepseek-coder": 38,
  "qwen-max": 22,
  "ernie-bot": 28
};

const SpeedSimulator = () => {
  const [selectedModels, setSelectedModels] = useState<string[]>(["gpt-4", "claude-3-opus", "gemini-1.5-pro"]);
  const [contextSize, setContextSize] = useState(1000);
  const [outputTokens, setOutputTokens] = useState(500);
  const [chartType, setChartType] = useState("time");

  const availableModels = Object.keys(modelPricing).filter(model => 
    firstTokenLatency[model as keyof typeof firstTokenLatency] && 
    tokensPerSecond[model as keyof typeof tokensPerSecond]
  );

  const toggleModelSelection = (model: string) => {
    if (selectedModels.includes(model)) {
      setSelectedModels(selectedModels.filter(m => m !== model));
    } else {
      if (selectedModels.length < 5) {
        setSelectedModels([...selectedModels, model]);
      }
    }
  };

  const calculateTimeData = () => {
    const timePoints = [0, 0.5, 1, 2, 3, 4, 5];
    return timePoints.map(time => {
      const dataPoint: Record<string, any> = { time: `${time}s` };
      
      selectedModels.forEach(model => {
        const firstTokenTime = firstTokenLatency[model as keyof typeof firstTokenLatency] / 1000; // convert ms to s
        const tps = tokensPerSecond[model as keyof typeof tokensPerSecond];
        
        if (time === 0) {
          dataPoint[model] = 0;
        } else if (time <= firstTokenTime) {
          dataPoint[model] = 0;
        } else {
          const tokensGenerated = Math.min(
            Math.floor((time - firstTokenTime) * tps),
            outputTokens
          );
          dataPoint[model] = tokensGenerated;
        }
      });
      
      return dataPoint;
    });
  };

  const calculateTotalTime = (model: string) => {
    const firstToken = firstTokenLatency[model as keyof typeof firstTokenLatency] / 1000; // convert ms to s
    const tps = tokensPerSecond[model as keyof typeof tokensPerSecond];
    const remainingTime = outputTokens / tps;
    return firstToken + remainingTime;
  };

  const timeData = calculateTimeData();
  
  const comparisonData = selectedModels.map(model => {
    const theme = getModelTheme(model);
    const totalTime = calculateTotalTime(model);
    const tps = tokensPerSecond[model as keyof typeof tokensPerSecond];
    
    return {
      model,
      color: theme.primary,
      totalTime: parseFloat(totalTime.toFixed(2)),
      tokensPerSecond: tps,
      firstToken: firstTokenLatency[model as keyof typeof firstTokenLatency]
    };
  }).sort((a, b) => a.totalTime - b.totalTime);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Token Speed Simulator</CardTitle>
          <CardDescription className="text-center">
            Compare token generation speed across different AI models
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>Models to Compare (max 5)</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {availableModels.map(model => (
                    <div 
                      key={model} 
                      className={`px-3 py-2 rounded-md text-sm cursor-pointer transition-colors
                        ${selectedModels.includes(model) 
                          ? `bg-${getModelTheme(model).primary} text-white` 
                          : 'bg-secondary text-secondary-foreground'}
                      `}
                      onClick={() => toggleModelSelection(model)}
                    >
                      {model}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="contextSize">Context Size (input tokens)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="contextSize"
                    min={100}
                    max={100000}
                    step={100}
                    value={[contextSize]}
                    onValueChange={(value) => setContextSize(value[0])}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={contextSize}
                    onChange={(e) => setContextSize(parseInt(e.target.value) || 0)}
                    className="w-24"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="outputTokens">Output Tokens</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="outputTokens"
                    min={10}
                    max={4000}
                    step={10}
                    value={[outputTokens]}
                    onValueChange={(value) => setOutputTokens(value[0])}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={outputTokens}
                    onChange={(e) => setOutputTokens(parseInt(e.target.value) || 0)}
                    className="w-24"
                  />
                </div>
              </div>
              
              <Tabs value={chartType} onValueChange={setChartType} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="time">Time Comparison</TabsTrigger>
                  <TabsTrigger value="speed">Speed Metrics</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="h-80">
              <TabsContent value="time" className="mt-0 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={timeData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis label={{ value: 'Tokens Generated', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    {selectedModels.map(model => (
                      <Line 
                        key={model}
                        type="monotone"
                        dataKey={model}
                        name={model}
                        stroke={getModelTheme(model).primary}
                        activeDot={{ r: 8 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
              
              <TabsContent value="speed" className="mt-0">
                <div className="space-y-4 h-full overflow-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Model</th>
                        <th className="text-right p-2">First Token (ms)</th>
                        <th className="text-right p-2">Tokens/sec</th>
                        <th className="text-right p-2">Total Time (s)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonData.map((item) => (
                        <tr key={item.model} className="border-b">
                          <td className="p-2">{item.model}</td>
                          <td className="text-right p-2">{item.firstToken}</td>
                          <td className="text-right p-2">{item.tokensPerSecond}</td>
                          <td className="text-right p-2">{item.totalTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <div className="space-y-2 pt-4">
                    {comparisonData.map((item, index) => (
                      <div key={item.model} className="flex items-center">
                        <div className="w-32">{item.model}</div>
                        <div 
                          className="h-8 rounded-md" 
                          style={{
                            width: `${(item.totalTime / comparisonData[comparisonData.length - 1].totalTime) * 100}%`,
                            backgroundColor: item.color
                          }}
                        />
                        <div className="ml-2">{item.totalTime}s</div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpeedSimulator;
