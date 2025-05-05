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

interface SimParams { /* ... */ }
interface Tick { t: number; tokensGenerated: number; }
interface ModelPreset { /* ... */ }
interface ComparisonRun { /* ... */ }

// ... (Other constants, presets, FACTORS, TOOLTIPS, etc.)

function* simulate(params: SimParams): Generator<Tick, void, unknown> {
  // ... unchanged simulation generator logic ...
}

// ... MODEL_PRESETS, groupedModels, BASE_SPEEDS, FACTORS, TOOLTIPS, LOREM_IPSUM, UI constants ...

function Stat({ label, children, tooltip, icon: Icon, color = 'text-slate-800' }: any) {
  // ... unchanged Stat component ...
}

export const TokenSpeedSimulator: React.FC = () => {
  // State hooks, refs, derived values, simulation logic ...

  // Fix for chart sizing: wrap in flex and use height 100%
  // --- Rendering ---
  return (
    <TooltipProvider>
      <Card className={`w-full max-w-6xl mx-auto shadow-2xl border ...`}> 
        {/* ... CardHeader, shared inputs ... */}

        {uiMode === 'simple' && (
          <section className="space-y-8 animate-fadeIn">
            {/* ... Section Header, Stats ... */}
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
            {/* ... parameter fieldset, stats ... */}
            <div className={`mb-8 h-72 md:h-[450px] w-full border ${themeClasses.borderSoft} rounded-xl p-4 flex flex-col bg-gradient-to-br from-slate-50/50 to-${activeThemeColor}-50/30 shadow-inner overflow-hidden transition-colors duration-500`}>
              <Label className="flex items-center justify-center text-sm font-medium text-slate-700 mb-2">
                Live Completion Progress
              </Label>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart margin={{ top: 5, right: 30, left: 10, bottom: 20 }}> {/* use chartData */}
                    {/* ... grid, axes, tooltip, legend ... */}
                    {comparisonRuns.map(run => (
                      <Line key={run.id} type="monotone" dataKey="tokensGenerated" data={run.results} name={run.name} stroke={run.color} strokeWidth={2.5} dot={false} isAnimationActive={false} payload={{ runName: run.name }} />
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

        {/* ... pinned runs, disclaimer, styles ... */}
      </Card>
    </TooltipProvider>
  );
};

export default TokenSpeedSimulator;
