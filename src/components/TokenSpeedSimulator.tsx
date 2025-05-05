
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import {
  Info,
  Cpu,
  Zap,
  Layers,
  ArrowRightLeft,
  Network,
  Gauge,
  Play,
  Square,
  Activity,
  Hash,
  DollarSign,
  Clock,
  Settings,
  BrainCircuit,
  Repeat,
  Users,
  LineChart as LineChartIcon,
  ToggleLeft,
  Eye,
  EyeOff,
  BarChartHorizontalBig,
  Pin,
  PinOff,
  X,
  BookOpen,
  UsersRound,
  Timer,
  Palette,
  Code,
  Building,
} from 'lucide-react';

// --- Types & Constants ---
type UIMode = 'simple' | 'advanced';
type Company = 'OpenAI' | 'Anthropic' | 'Google' | 'Meta' | 'Mistral AI' | 'Custom';

interface SimParams {
  // Add appropriate SimParams interface properties here
  baseTokensPerSecond: number;
  maxTokens: number;
  modelName: string;
  // Add other necessary properties
}

interface Tick {
  t: number;
  tokensGenerated: number;
}

interface ModelPreset {
  // Add appropriate ModelPreset interface properties here
  name: string;
  baseSpeed: number;
  // Add other necessary properties
}

interface ComparisonRun {
  id: string;
  name: string;
  color: string;
  results: Tick[];
}

// Placeholder for the simulation generator function
function* simulate(params: SimParams): Generator<Tick, void, unknown> {
  let t = 0;
  let tokensGenerated = 0;
  const { baseTokensPerSecond, maxTokens } = params;
  
  while (tokensGenerated < maxTokens) {
    const increment = baseTokensPerSecond * 0.1; // Simulate 0.1 second increments
    tokensGenerated += increment;
    t += 0.1;
    
    yield {
      t,
      tokensGenerated: Math.min(tokensGenerated, maxTokens),
    };
  }
}

// Define model presets and other constants
const MODEL_PRESETS = {
  'gpt-4o': { name: 'GPT-4o', baseSpeed: 40, company: 'OpenAI' },
  'gpt-4': { name: 'GPT-4', baseSpeed: 20, company: 'OpenAI' },
  'claude-3-opus': { name: 'Claude 3 Opus', baseSpeed: 42, company: 'Anthropic' },
  'claude-3-sonnet': { name: 'Claude 3 Sonnet', baseSpeed: 65, company: 'Anthropic' },
  'gemini-1.5-pro': { name: 'Gemini 1.5 Pro', baseSpeed: 50, company: 'Google' },
  'llama-3': { name: 'Llama 3', baseSpeed: 45, company: 'Meta' },
  'mistral-large': { name: 'Mistral Large', baseSpeed: 60, company: 'Mistral AI' },
};

const groupedModels = {
  'OpenAI': ['gpt-4o', 'gpt-4', 'gpt-3.5-turbo'],
  'Anthropic': ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
  'Google': ['gemini-1.5-pro', 'gemini-1.5', 'palm-2'],
  'Meta': ['llama-3', 'llama-2'],
  'Mistral AI': ['mistral-large', 'mistral-medium', 'mistral-small'],
  'Custom': ['custom-model'],
};

const BASE_SPEEDS = {
  'gpt-4o': 40,
  'gpt-4': 20,
  'gpt-3.5-turbo': 30,
  'claude-3-opus': 42,
  'claude-3-sonnet': 65,
  'claude-3-haiku': 80,
  'gemini-1.5-pro': 50,
  'gemini-1.5': 55,
  'palm-2': 25,
  'llama-3': 45,
  'llama-2': 35,
  'mistral-large': 60,
  'mistral-medium': 70,
  'mistral-small': 75,
  'custom-model': 50,
};

const FACTORS = {
  'hardwareAcceleration': { name: 'Hardware Acceleration', impact: 1.5 },
  'batchProcessing': { name: 'Batch Processing', impact: 1.3 },
  'modelOptimization': { name: 'Model Optimization', impact: 1.2 },
  'networkLatency': { name: 'Network Latency', reduction: 0.8 },
  'serviceLoad': { name: 'Service Load', reduction: 0.7 },
};

// Tooltips for UI elements
const TOOLTIPS = {
  uiMode: 'Switch between simple and advanced simulation view',
  modelPreset: 'Select a pre-configured AI model',
  totalTime: 'Total time to generate tokens',
  throughput: 'Speed of token generation',
  cost: 'Estimated cost to generate tokens',
  chartSimple: 'Token generation progress over time',
  chartAdvanced: 'Detailed token generation metrics',
  pinRun: 'Save this run for comparison',
  pinnedRuns: 'Compare different model configurations',
  genSpeed: 'Base token generation speed',
  ttfToken: 'Time to first token',
  pricing: 'Cost per 1K tokens',
};

const LOREM_IPSUM = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.`;

// UI constants
const themeColors = {
  'OpenAI': 'emerald',
  'Anthropic': 'violet',
  'Google': 'blue',
  'Meta': 'indigo',
  'Mistral AI': 'amber',
  'Custom': 'slate',
};

// Stats component
function Stat({ label, children, tooltip, icon: Icon, color = 'text-slate-800' }: any) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          {Icon && <Icon className={`w-5 h-5 mr-2 ${color}`} />}
          <span className="text-sm font-medium text-slate-600">{label}</span>
        </div>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">{tooltip}</TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="text-2xl font-semibold">{children}</div>
    </div>
  );
}

export const TokenSpeedSimulator: React.FC = () => {
  // Fix: define uiMode state
  const [uiMode, setUiMode] = useState<UIMode>('simple');
  const [activePresetKey, setActivePresetKey] = useState('gpt-4o');
  const [activeCompany, setActiveCompany] = useState<Company>('OpenAI');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [maxTokens, setMaxTokens] = useState(2000);
  const [maxTime, setMaxTime] = useState(60);
  const [customBaseSpeed, setCustomBaseSpeed] = useState(40);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [simulationResults, setSimulationResults] = useState<Tick[]>([]);
  const [chartData, setChartData] = useState<Tick[]>([]);
  const [comparisonRuns, setComparisonRuns] = useState<ComparisonRun[]>([]);
  const [pinnedResults, setPinnedResults] = useState<{ id: string, name: string, color: string, results: Tick[] }[]>([]);
  const simulationRef = useRef<{ id?: ReturnType<typeof setInterval> }>({}); 
  
  const activeThemeColor = useMemo(() => {
    return themeColors[activeCompany] || 'slate';
  }, [activeCompany]);
  
  // Define other state variables and logic as needed

  const themeClasses = useMemo(() => {
    return {
      borderSoft: `border-${activeThemeColor}-200/50`,
      borderStrong: `border-${activeThemeColor}-400/70`,
      textSoft: `text-${activeThemeColor}-500`,
      textStrong: `text-${activeThemeColor}-700`,
      bgSoft: `bg-${activeThemeColor}-50`,
      bgStrong: `bg-${activeThemeColor}-100`,
    };
  }, [activeThemeColor]);

  // Fix for chart sizing: wrap in flex and use height 100%
  // --- Rendering ---
  return (
    <TooltipProvider>
      <Card className={`w-full max-w-6xl mx-auto shadow-2xl border ...`}> 
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">Token Speed Simulator</CardTitle>
              <CardDescription>Compare token generation speeds across AI models</CardDescription>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="ui-mode-toggle" className="text-sm font-medium">
                  {uiMode === 'simple' ? 'Simple' : 'Advanced'}
                </Label>
                <Switch 
                  id="ui-mode-toggle"
                  checked={uiMode === 'advanced'}
                  onCheckedChange={(checked) => setUiMode(checked ? 'advanced' : 'simple')}
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[250px]">
              <Label htmlFor="model-preset" className="text-sm font-medium mb-2 block">Model</Label>
              <Select 
                value={activePresetKey} 
                onValueChange={(val) => {
                  setActivePresetKey(val);
                  const company = Object.entries(groupedModels).find(([_, models]) => 
                    models.includes(val)
                  )?.[0] as Company;
                  if (company) {
                    setActiveCompany(company);
                    setIsCustomMode(company === 'Custom');
                  }
                }}
              >
                <SelectTrigger id="model-preset" className="w-full">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(groupedModels).map(([company, models]) => (
                    <SelectGroup key={company}>
                      <SelectLabel>{company}</SelectLabel>
                      {models.map(model => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[250px]">
              <Label htmlFor="max-tokens" className="text-sm font-medium mb-2 block">Max Tokens</Label>
              <div className="flex gap-2 items-center">
                <Slider 
                  id="max-tokens"
                  min={100} 
                  max={10000} 
                  step={100} 
                  value={[maxTokens]} 
                  onValueChange={(val) => setMaxTokens(val[0])}
                  className="flex-1" 
                />
                <Input 
                  type="number" 
                  value={maxTokens} 
                  onChange={(e) => setMaxTokens(parseInt(e.target.value) || 1000)} 
                  className="w-20"
                />
              </div>
            </div>
          </div>

          {uiMode === 'simple' && (
            <section className="space-y-8 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Stat 
                  label="Estimated Completion Time" 
                  icon={Clock} 
                  color={`text-${activeThemeColor}-500`}
                  tooltip={TOOLTIPS.totalTime}
                >
                  {isVisualizing ? 
                    `${(simulationResults[simulationResults.length - 1]?.t || 0).toFixed(1)}s` : 
                    `${(maxTokens / (BASE_SPEEDS[activePresetKey as keyof typeof BASE_SPEEDS] || 40)).toFixed(1)}s`
                  }
                </Stat>
                <Stat 
                  label="Token Throughput" 
                  icon={Activity} 
                  color={`text-${activeThemeColor}-500`}
                  tooltip={TOOLTIPS.throughput}
                >
                  {`${BASE_SPEEDS[activePresetKey as keyof typeof BASE_SPEEDS] || 40} token/s`}
                </Stat>
                <Stat 
                  label="Estimated Cost" 
                  icon={DollarSign} 
                  color={`text-${activeThemeColor}-500`}
                  tooltip={TOOLTIPS.cost}
                >
                  {`$${((maxTokens / 1000) * 0.01).toFixed(4)}`}
                </Stat>
              </div>
              
              <div className={`h-72 md:h-[450px] w-full border ${themeClasses.borderSoft} rounded-xl p-4 flex flex-col bg-gradient-to-br from-slate-50/50 to-${activeThemeColor}-50/30 shadow-inner overflow-hidden transition-colors duration-500`}>
                <Label className="flex items-center justify-center text-sm font-medium text-slate-700 mb-2">
                  Completion Progress
                </Label>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={simulationResults} margin={{ top: 5, right: 30, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="t" type="number" label={{ value: 'Time (s)', position: 'insideBottom', dy: 15 }} stroke="#64748b" tickFormatter={(tick) => tick.toFixed(1)} domain={[0, maxTime]} allowDataOverflow tick={{ fontSize: 11 }} />
                      <YAxis label={{ value: 'Tokens', angle: -90, position: 'insideLeft', dx: -5 }} stroke="#64748b" domain={[0, maxTokens]} allowDataOverflow tick={{ fontSize: 11 }} />
                      <RechartsTooltip
                        wrapperClassName="!text-xs !rounded-md !shadow-lg !border-slate-200 !bg-white/80 !backdrop-blur-sm"
                        contentStyle={{ fontSize: '12px', padding: '6px 10px', borderRadius: '6px' }}
                        formatter={(value: number, name, props) => [`${Math.round(value)} tokens`, props.payload?.runName || 'Current Run']}
                        labelFormatter={(label: number) => `Time: ${label.toFixed(2)}s`}
                        cursor={{ stroke: `var(--theme-color-500)`, strokeWidth: 1, strokeDasharray: '3 3' }}
                      />
                      <defs>
                        {comparisonRuns.map((run) => (
                          <linearGradient key={run.id} id={`color-${run.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={run.color} stopOpacity={0.7} />
                            <stop offset="95%" stopColor={run.color} stopOpacity={0.1} />
                          </linearGradient>
                        ))}
                        <linearGradient id="color-current-simple" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--theme-color-500)" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="var(--theme-color-500)" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      {comparisonRuns.map(run => (
                        <Area key={run.id} type="monotone" dataKey="tokensGenerated" data={run.results} name={run.name} stroke={run.color} strokeWidth={2.5} fillOpacity={1} fill={`url(#color-${run.id})`} dot={false} isAnimationActive={false} payload={{ runName: run.name }} />
                      ))}
                      <Area
                        type="monotone"
                        dataKey="tokensGenerated"
                        data={simulationResults}
                        name={`Current: ${activePresetKey}`}
                        stroke="var(--theme-color-500)"
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        fillOpacity={1}
                        fill="url(#color-current-simple)"
                        dot={false}
                        isAnimationActive={false}
                        payload={{ runName: `Current: ${activePresetKey}` }}
                      />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>
          )}

          {uiMode === 'advanced' && (
            <section className="space-y-8 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Stat 
                  label="Estimated Completion Time" 
                  icon={Clock} 
                  color={`text-${activeThemeColor}-500`}
                  tooltip={TOOLTIPS.totalTime}
                >
                  {isVisualizing ? 
                    `${(chartData[chartData.length - 1]?.t || 0).toFixed(1)}s` : 
                    `${(maxTokens / (isCustomMode ? customBaseSpeed : (BASE_SPEEDS[activePresetKey as keyof typeof BASE_SPEEDS] || 40))).toFixed(1)}s`
                  }
                </Stat>
                <Stat 
                  label="Token Throughput" 
                  icon={Activity} 
                  color={`text-${activeThemeColor}-500`}
                  tooltip={TOOLTIPS.throughput}
                >
                  {`${isCustomMode ? customBaseSpeed : (BASE_SPEEDS[activePresetKey as keyof typeof BASE_SPEEDS] || 40)} token/s`}
                </Stat>
                <Stat 
                  label="Estimated Cost" 
                  icon={DollarSign} 
                  color={`text-${activeThemeColor}-500`}
                  tooltip={TOOLTIPS.cost}
                >
                  {`$${((maxTokens / 1000) * 0.01).toFixed(4)}`}
                </Stat>
              </div>
              
              <div className={`mb-8 h-72 md:h-[450px] w-full border ${themeClasses.borderSoft} rounded-xl p-4 flex flex-col bg-gradient-to-br from-slate-50/50 to-${activeThemeColor}-50/30 shadow-inner overflow-hidden transition-colors duration-500`}>
                <Label className="flex items-center justify-center text-sm font-medium text-slate-700 mb-2">
                  Live Completion Progress
                </Label>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart margin={{ top: 5, right: 30, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="t" 
                        type="number" 
                        label={{ value: 'Time (s)', position: 'insideBottom', dy: 15 }} 
                        stroke="#64748b" 
                        tickFormatter={(tick) => tick.toFixed(1)} 
                        domain={[0, maxTime]} 
                        allowDataOverflow 
                        tick={{ fontSize: 11 }} 
                      />
                      <YAxis 
                        label={{ value: 'Tokens', angle: -90, position: 'insideLeft', dx: -5 }} 
                        stroke="#64748b" 
                        domain={[0, maxTokens]} 
                        allowDataOverflow 
                        tick={{ fontSize: 11 }} 
                      />
                      <RechartsTooltip 
                        wrapperClassName="!text-xs !rounded-md !shadow-lg !border-slate-200 !bg-white/80 !backdrop-blur-sm"
                        contentStyle={{ fontSize: '12px', padding: '6px 10px', borderRadius: '6px' }}
                        formatter={(value: number, name, props) => [`${Math.round(value)} tokens`, props.payload?.runName || 'Current Run']}
                        labelFormatter={(label: number) => `Time: ${label.toFixed(2)}s`}
                        cursor={{ stroke: `var(--theme-color-500)`, strokeWidth: 1, strokeDasharray: '3 3' }}
                      />
                      {comparisonRuns.map(run => (
                        <Line 
                          key={run.id} 
                          type="monotone" 
                          dataKey="tokensGenerated" 
                          data={run.results} 
                          name={run.name} 
                          stroke={run.color} 
                          strokeWidth={2.5} 
                          dot={false} 
                          isAnimationActive={false} 
                          payload={{ runName: run.name }} 
                        />
                      ))}
                      {isVisualizing && (
                        <Line
                          type="monotone"
                          dataKey="tokensGenerated"
                          data={chartData}
                          name={`Live: ${isCustomMode ? 'Custom' : activePresetKey}`}
                          stroke="var(--theme-color-500)"
                          strokeWidth={2}
                          strokeDasharray="4 4"
                          dot={false}
                          isAnimationActive={false}
                          payload={{ runName: `Live: ${isCustomMode ? 'Custom' : activePresetKey}` }}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>
          )}
        </CardContent>
      </Card>
      
      <style jsx global>
        {`
          :root {
            --theme-color-50: var(--${activeThemeColor}-50);
            --theme-color-100: var(--${activeThemeColor}-100);
            --theme-color-200: var(--${activeThemeColor}-200);
            --theme-color-300: var(--${activeThemeColor}-300);
            --theme-color-400: var(--${activeThemeColor}-400);
            --theme-color-500: var(--${activeThemeColor}-500);
            --theme-color-600: var(--${activeThemeColor}-600);
            --theme-color-700: var(--${activeThemeColor}-700);
            --theme-color-800: var(--${activeThemeColor}-800);
            --theme-color-900: var(--${activeThemeColor}-900);
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-in-out;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>
    </TooltipProvider>
  );
};

export default TokenSpeedSimulator;
