import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts';
import { calculateTotalTime, calculateTokensAtTime } from "@/lib/modelData";
import { getModelTheme } from "@/lib/modelThemes";
import { Separator } from "@/components/ui/separator";
import { tokensPerSecond } from "@/lib/modelData";
import { firstTokenLatency } from "@/lib/modelData";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Define the types for the data
interface SpeedDataPoint {
  time: number;
  tokens: number;
  tps: number;
}

interface RunConfig {
  runName: string;
  model: string;
  maxTokens: number;
  color: string;
}

interface RunData {
  runName: string;
  model: string;
  maxTokens: number;
  color: string;
  data: SpeedDataPoint[];
}

const TokenSpeedSimulator: React.FC = () => {
  const [runConfigs, setRunConfigs] = useState<RunConfig[]>([
    { runName: "Run 1", model: "gpt-4o", maxTokens: 1000, color: "#8884d8" }
  ]);
  const [comparisonModel, setComparisonModel] = useState<string | undefined>(undefined);
  const [comparisonData, setComparisonData] = useState<RunData | null>(null);
  const [timeScale, setTimeScale] = useState<number>(10);
  const [liveMode, setLiveMode] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  const [chartType, setChartType] = useState<'area' | 'line'>('area');
  const { toast } = useToast();

  // Generate a unique URL for the current chart configuration
  const generateShareableURL = useCallback(() => {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();

    runConfigs.forEach((run, index) => {
      params.append(`runName${index}`, run.runName);
      params.append(`model${index}`, run.model);
      params.append(`maxTokens${index}`, run.maxTokens.toString());
      params.append(`color${index}`, run.color);
    });

    if (comparisonModel) {
      params.append('comparisonModel', comparisonModel);
    }
    params.append('timeScale', timeScale.toString());
    params.append('chartType', chartType);

    return `${baseUrl}?${params.toString()}`;
  }, [runConfigs, comparisonModel, timeScale, chartType]);

  // Copy the shareable URL to clipboard
  const copyURLToClipboard = useCallback(() => {
    const url = generateShareableURL();
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopied(true);
        toast({
          title: "URL Copied",
          description: "Share this chart configuration with others!",
        });
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
      })
      .catch(err => {
        console.error("Failed to copy URL: ", err);
        toast({
          variant: "destructive",
          title: "Copy Failed",
          description: "Could not copy the URL to clipboard.",
        });
      });
  }, [generateShareableURL, toast]);

  // Load chart configuration from URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const newRunConfigs: RunConfig[] = [];
    let index = 0;

    while (urlParams.has(`model${index}`)) {
      const runName = urlParams.get(`runName${index}`) || `Run ${index + 1}`;
      const model = urlParams.get(`model${index}`) || "gpt-4o";
      const maxTokens = parseInt(urlParams.get(`maxTokens${index}`) || "1000", 10);
      const color = urlParams.get(`color${index}`) || "#8884d8";

      newRunConfigs.push({ runName, model, maxTokens, color });
      index++;
    }

    if (newRunConfigs.length > 0) {
      setRunConfigs(newRunConfigs);
    }

    const urlComparisonModel = urlParams.get('comparisonModel') || undefined;
    setComparisonModel(urlComparisonModel);

    const urlTimeScale = parseInt(urlParams.get('timeScale') || "10", 10);
    setTimeScale(urlTimeScale);

    const urlChartType = urlParams.get('chartType') as 'area' | 'line' || 'area';
    setChartType(urlChartType);
  }, []);

  // Function to add a new run
  const addRun = () => {
    setRunConfigs([
      ...runConfigs,
      {
        runName: `Run ${runConfigs.length + 1}`,
        model: "gpt-4o",
        maxTokens: 1000,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
      }
    ]);
  };

  // Function to remove a run
  const removeRun = (index: number) => {
    const newRuns = [...runConfigs];
    newRuns.splice(index, 1);
    setRunConfigs(newRuns);
  };

  // Function to update a run's configuration
  const updateRun = (index: number, key: string, value: any) => {
    const newRuns = [...runConfigs];
    newRuns[index][key] = value;
    setRunConfigs(newRuns);
  };

  // Generate the data for each run
  const data: RunData[] = runConfigs.map(run => {
    const totalTime = calculateTotalTime(run.maxTokens, run.model);
    const interval = totalTime / 100; // 100 data points
    const runData: SpeedDataPoint[] = [];

    for (let time = 0; time <= totalTime; time += interval) {
      const tokens = calculateTokensAtTime(time, run.model, run.maxTokens);
      const tps = tokensPerSecond[run.model] || 30; // Use a default value if not found

      runData.push({ time, tokens, tps });
    }

    return { ...run, data: runData };
  });

  // Generate comparison data
  useEffect(() => {
    if (comparisonModel) {
      const maxTokens = data.length > 0 ? data[0].maxTokens : 1000;
      const totalTime = calculateTotalTime(maxTokens, comparisonModel);
      const interval = totalTime / 100;
      const comparisonRunData: SpeedDataPoint[] = [];

      for (let time = 0; time <= totalTime; time += interval) {
        const tokens = calculateTokensAtTime(time, comparisonModel, maxTokens);
        const tps = tokensPerSecond[comparisonModel] || 30;

        comparisonRunData.push({ time, tokens, tps });
      }

      setComparisonData({
        runName: `${comparisonModel} (Comparison)`,
        model: comparisonModel,
        maxTokens: maxTokens,
        color: "#ff7300",
        data: comparisonRunData
      });
    } else {
      setComparisonData(null);
    }
  }, [comparisonModel, data]);

  // Live mode simulation
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (liveMode) {
      intervalId = setInterval(() => {
        setTimeScale(prev => {
          const newTime = prev + 1;
          return newTime > 60 ? 1 : newTime;
        });
      }, 1000);
    } else {
      setTimeScale(10);
    }

    return () => clearInterval(intervalId);
  }, [liveMode]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Token Speed Simulator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {runConfigs.map((run, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div className="md:col-span-1">
                <Label htmlFor={`runName-${index}`}>Run Name</Label>
                <Input
                  type="text"
                  id={`runName-${index}`}
                  value={run.runName}
                  onChange={(e) => updateRun(index, "runName", e.target.value)}
                />
              </div>
              <div className="md:col-span-1">
                <Label htmlFor={`model-${index}`}>Model</Label>
                <Select onValueChange={(value) => updateRun(index, "model", value)}>
                  <SelectTrigger id={`model-${index}`}>
                    <SelectValue placeholder="Select a model" defaultValue={run.model} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                    <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                    <SelectItem value="llama-3-70b">Llama 3 70B</SelectItem>
                    <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                    <SelectItem value="mistral-large">Mistral Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-1">
                <Label htmlFor={`maxTokens-${index}`}>Max Tokens</Label>
                <Input
                  type="number"
                  id={`maxTokens-${index}`}
                  value={run.maxTokens}
                  onChange={(e) => updateRun(index, "maxTokens", parseInt(e.target.value))}
                />
              </div>
              <div className="md:col-span-1 flex items-center justify-end">
                <Button variant="destructive" size="sm" onClick={() => removeRun(index)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <Button onClick={addRun}>Add Run</Button>
          <Separator className="my-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div>
              <Label htmlFor="comparisonModel">Compare Against</Label>
              <Select onValueChange={setComparisonModel}>
                <SelectTrigger id="comparisonModel">
                  <SelectValue placeholder="No Comparison" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                  <SelectItem value="llama-3-70b">Llama 3 70B</SelectItem>
                  <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                  <SelectItem value="mistral-large">Mistral Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Time Scale (seconds)</Label>
              <Slider
                min={1}
                max={60}
                step={1}
                value={[timeScale]}
                onValueChange={(value) => setTimeScale(value[0])}
              />
              <p className="text-sm text-muted-foreground">
                Current time scale: {timeScale} seconds
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="live" checked={liveMode} onCheckedChange={setLiveMode} />
              <Label htmlFor="live">Live Mode</Label>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex items-center space-x-2">
            <Label>Chart Type:</Label>
            <Select value={chartType} onValueChange={(value) => setChartType(value as 'area' | 'line')}>
              <SelectTrigger>
                <SelectValue placeholder="Select chart type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="area">Area Chart</SelectItem>
                <SelectItem value="line">Line Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator className="my-4" />
          <Button onClick={copyURLToClipboard} disabled={copied}>
            {copied ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy Shareable URL
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Token Generation Speed</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              margin={{
                top: 20,
                right: 20,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" domain={[0, timeScale]} label={{ value: 'Time (s)', position: 'bottom' }} />
              <YAxis dataKey="tokens" label={{ value: 'Tokens', angle: -90, position: 'left' }} />
              <Tooltip />
              <Legend />
              {chartType === 'area' ? (
                <>
                  {data.map((entry, index) => (
                    <Area
                      key={`${entry.runName}-area`}
                      type="monotone"
                      dataKey="tokens"
                      data={entry.data}
                      name={entry.runName}
                      stroke={entry.color}
                      strokeWidth={2}
                      fillOpacity={0.3}
                      fill={entry.color}
                      dot={false}
                      isAnimationActive={false}
                    />
                  ))}
                  {comparisonData && (
                    <Area
                      type="monotone"
                      dataKey="tokens"
                      data={comparisonData.data}
                      name={comparisonData.runName}
                      stroke={comparisonData.color}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      fillOpacity={0.2}
                      fill={comparisonData.color}
                      dot={false}
                      isAnimationActive={false}
                    />
                  )}
                </>
              ) : (
                <>
                  {data.map((entry, index) => (
                    <Line
                      key={`${entry.runName}-line`}
                      type="monotone"
                      dataKey="tokens"
                      data={entry.data}
                      name={entry.runName}
                      stroke={entry.color}
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  ))}
                  {comparisonData && (
                    <Line
                      type="monotone"
                      dataKey="tokens"
                      data={comparisonData.data}
                      name={comparisonData.runName}
                      stroke={comparisonData.color}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      isAnimationActive={false}
                    />
                  )}
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tokens Per Second (TPS)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              margin={{
                top: 20,
                right: 20,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" domain={[0, timeScale]} label={{ value: 'Time (s)', position: 'bottom' }} />
              <YAxis dataKey="tps" label={{ value: 'Tokens per Second', angle: -90, position: 'left' }} />
              <Tooltip />
              <Legend />
              {chartType === 'area' ? (
                <>
                  {data.map((entry, index) => (
                    <Area
                      key={`${entry.runName}-area`}
                      type="monotone"
                      dataKey="tps"
                      data={entry.data}
                      name={entry.runName}
                      stroke={entry.color}
                      strokeWidth={2}
                      fillOpacity={0.3}
                      fill={entry.color}
                      dot={false}
                      isAnimationActive={false}
                    />
                  ))}
                  {comparisonData && (
                    <Area
                      type="monotone"
                      dataKey="tps"
                      data={comparisonData.data}
                      name={comparisonData.runName}
                      stroke={comparisonData.color}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      fillOpacity={0.2}
                      fill={comparisonData.color}
                      dot={false}
                      isAnimationActive={false}
                    />
                  )}
                </>
              ) : (
                <>
                  {data.map((entry, index) => (
                    <Line
                      key={`${entry.runName}-line`}
                      type="monotone"
                      dataKey="tps"
                      data={entry.data}
                      name={entry.runName}
                      stroke={entry.color}
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  ))}
                  {comparisonData && (
                    <Line
                      type="monotone"
                      dataKey="tps"
                      data={comparisonData.data}
                      name={comparisonData.runName}
                      stroke={comparisonData.color}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      isAnimationActive={false}
                    />
                  )}
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenSpeedSimulator;
