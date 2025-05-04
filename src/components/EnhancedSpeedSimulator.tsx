import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, AreaChart, Area } from 'recharts';
import { Info, Cpu, Zap, Layers, ArrowRightLeft, Network, Gauge, Play, Square, Activity, Hash, DollarSign, Clock, Settings, BrainCircuit, MessageSquare, Repeat, Users, LineChart as LineChartIcon, ToggleLeft, Eye, EyeOff, BarChartHorizontalBig, Pin, PinOff, X, BookOpen, UsersRound, Timer, Palette, Code, Building } from 'lucide-react'; // Added Building icon

// --- Types & Constants ---
type UIMode = 'simple' | 'advanced';
type Company = 'OpenAI' | 'Anthropic' | 'Google' | 'Meta' | 'Mistral AI' | 'Custom';

interface SimParams { speed: number; promptTokens: number; completionTokens: number; concurrency: number; ttfToken: number; streaming: boolean; }
interface Tick { t: number; tokensGenerated: number; }

interface ModelPreset {
    company: Company;
    speed: number; // tokens/s
    ttfToken: number; // sec
    priceIn: number; // $/1M tokens
    priceOut: number; // $/1M tokens
    themeColor: string; // Primary Tailwind color class (e.g., 'indigo', 'rose', 'emerald')
    // Optional: Add context window size? params?
}

// Structure for storing a pinned comparison run
interface ComparisonRun {
    id: string; name: string; params: SimParams; results: Tick[];
    stats: { totalTime: number; throughput: number; cost: number; };
    color: string; // Chart line/area color
    themeColor: string; // Associated theme color for the card border
    presetKey: string;
}

// --- Simulation Logic (Generator - unchanged) ---
function* simulate(params: SimParams): Generator<Tick, void, unknown> {
    const { speed, promptTokens, completionTokens, concurrency, ttfToken, streaming } = params;
    if (speed <= 0 || concurrency <= 0 || completionTokens < 0 || promptTokens < 0 || ttfToken < 0) { yield { t: 0, tokensGenerated: 0 }; return; }
    if (completionTokens === 0) { yield { t: 0, tokensGenerated: 0 }; yield { t: ttfToken, tokensGenerated: 0 }; return; }
    const totalCompletionTokens = completionTokens;
    const generationStartTime = ttfToken;
    let elapsedSeconds = 0, cumulativeGeneratedTokens = 0;
    const dt = 1 / 60;
    yield { t: 0, tokensGenerated: 0 };
    while (cumulativeGeneratedTokens < totalCompletionTokens) {
        elapsedSeconds += dt;
        let newlyGeneratedThisTick = 0;
        if (elapsedSeconds >= generationStartTime) { newlyGeneratedThisTick = speed * dt * concurrency; }
        cumulativeGeneratedTokens = Math.min(cumulativeGeneratedTokens + newlyGeneratedThisTick, totalCompletionTokens);
        yield { t: elapsedSeconds, tokensGenerated: cumulativeGeneratedTokens };
        if (elapsedSeconds > 600) { console.warn("Sim exceeded 10 mins"); break; }
    }
    if (cumulativeGeneratedTokens >= totalCompletionTokens) {
        const timeToGenerateAll = totalCompletionTokens / (speed * concurrency);
        const finalTime = generationStartTime + timeToGenerateAll;
        yield { t: finalTime, tokensGenerated: totalCompletionTokens };
    }
}

// --- Presets & Constants ---
// Added more models, company info, and theme colors
// Note: Speed/TTFT/Pricing are estimates and can vary significantly. Verify with official sources.
const MODEL_PRESETS: Record<string, ModelPreset> = {
  // OpenAI
  "GPT-4o": { company: "OpenAI", speed: 154, ttfToken: 0.29, priceIn: 5.0, priceOut: 15.0, themeColor: "cyan" },
  "GPT-4 Turbo": { company: "OpenAI", speed: 44, ttfToken: 0.68, priceIn: 10.0, priceOut: 30.0, themeColor: "cyan" },
  "GPT-3.5 Turbo": { company: "OpenAI", speed: 180, ttfToken: 0.25, priceIn: 0.50, priceOut: 1.50, themeColor: "cyan" }, // Estimate
  // Anthropic
  "Claude 3 Opus": { company: "Anthropic", speed: 27.4, ttfToken: 0.80, priceIn: 15.0, priceOut: 75.0, themeColor: "orange" },
  "Claude 3 Sonnet": { company: "Anthropic", speed: 60, ttfToken: 0.45, priceIn: 3.0, priceOut: 15.0, themeColor: "orange" }, // Estimate
  "Claude 3 Haiku": { company: "Anthropic", speed: 144.8, ttfToken: 0.53, priceIn: 0.25, priceOut: 1.25, themeColor: "orange" },
  // Google
  "Gemini 1.5 Pro": { company: "Google", speed: 59, ttfToken: 0.60, priceIn: 3.50, priceOut: 10.50, themeColor: "blue" }, // Adjusted pricing based on recent tiers
  "Gemini 1.5 Flash": { company: "Google", speed: 190, ttfToken: 0.28, priceIn: 0.35, priceOut: 1.05, themeColor: "blue" }, // Adjusted pricing
  // Meta
  "Llama 3 70B": { company: "Meta", speed: 90, ttfToken: 0.55, priceIn: 0.59, priceOut: 0.79, themeColor: "sky" }, // Estimate (Groq/Fireworks pricing varies)
  "Llama 3 8B": { company: "Meta", speed: 250, ttfToken: 0.30, priceIn: 0.05, priceOut: 0.10, themeColor: "sky" }, // Estimate (Groq/Fireworks pricing varies)
  // Mistral AI
  "Mistral Large": { company: "Mistral AI", speed: 70, ttfToken: 0.60, priceIn: 8.0, priceOut: 24.0, themeColor: "rose" }, // Estimate
  "Mistral Medium": { company: "Mistral AI", speed: 120, ttfToken: 0.40, priceIn: 2.7, priceOut: 8.1, themeColor: "rose" }, // Estimate (Mistral 7B often faster)
  "Mistral 7B": { company: "Mistral AI", speed: 280, ttfToken: 0.30, priceIn: 0.07, priceOut: 0.07, themeColor: "rose" }, // Estimate (Groq pricing)
};
const CUSTOM_PRESET_KEY = "custom";
const DEFAULT_THEME_COLOR = "indigo"; // Fallback theme

// Group models by company for the dropdown
const groupedModels = Object.entries(MODEL_PRESETS).reduce((acc, [key, preset]) => {
  if (!acc[preset.company]) {
    acc[preset.company] = [];
  }
  acc[preset.company].push({ key, name: key });
  return acc;
}, {} as Record<Company, { key: string; name: string }[]>);


const BASE_SPEEDS = { 'cpu': 10, 'gpu_low': 50, 'gpu_mid': 150, 'gpu_high': 500, 'tpu_v4': 450, 'tpu_v5': 800, };
const FACTORS = { /* Factors unchanged */
    modelSize: (p: number) => { if (p <= 7) return 1.2; if (p <= 13) return 1.0; if (p <= 30) return 0.7; if (p <= 70) return 0.4; return 0.15; },
    quantization: { 'none': 1.0, '8bit': 1.5, '4bit': 2.0, }, batchSize: (s: number) => 1 + (s - 1) * 0.05,
    sequenceLength: (l: number) => { if (l <= 512) return 1.0; if (l <= 1024) return 0.95; if (l <= 2048) return 0.9; if (l <= 4096) return 0.85; return 0.8; },
    parallelism: { 'none': 1.0, 'tensor': 1.8, 'pipeline': 1.5, }, kvCache: (e: boolean) => e ? 1.0 : 0.7,
    networkLatency: (l: number) => Math.max(0.1, 1 - l / 500), hardwareUtilization: (u: number) => 0.5 + (u / 100) * 0.5,
};
const TOOLTIPS = { /* Tooltips unchanged - Omitted for brevity */
    uiMode: "Toggle between Simple view (presets, task inputs, chart, final stats) and Advanced view (custom parameters, detailed visualizations).",
    modelPreset: "Select model or 'Custom Settings' (Advanced view). Theme color changes based on model provider.",
    totalTime: "Total time for simulation.",
    throughput: "Overall effective throughput (total tokens / total time).",
    cost: "Estimated cost for prompt & completion tokens.",
    chartSimple: "Shows cumulative completion tokens over time. Pin runs to compare.",
    chartAdvanced: "Shows live simulation progress. Pin runs to compare.",
    pinRun: "Add the current simulation results (parameters, stats, chart data) to the comparison.",
    pinnedRuns: "Pinned simulation runs for comparison. Click 'X' to remove.",
};
const LOREM_IPSUM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ";
const FLASH_DURATION_MS = 50;
const SIMULATION_INTERVAL_MS = 16;
const MAX_COMPARISON_RUNS = 5;
// Vibrant color palette for comparison lines (distinct from theme colors)
const COMPARISON_CHART_COLORS = ["#6366f1", "#ec4899", "#22c55e", "#f59e0b", "#a855f7", "#06b6d4"];

// --- Stat Component (Creative Styling - unchanged) ---
function Stat({ label, children, tooltip, icon: Icon, color = "text-slate-800" }: { label: string; children: React.ReactNode; tooltip?: string; icon?: React.ElementType, color?: string }) {
    const content = ( <div className="rounded-xl border border-slate-200/70 p-4 text-center bg-white shadow-lg hover:shadow-indigo-100/50 transition-shadow duration-300 flex items-center space-x-4"> {Icon && (<div className="p-2.5 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full"><Icon className={`h-5 w-5 text-indigo-600`} /></div>)} <div className="text-left"><div className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">{label}</div><span className={`font-bold text-xl md:text-2xl ${color} block`}>{children}</span></div></div> );
    if (tooltip) { return (<Tooltip><TooltipTrigger asChild>{content}</TooltipTrigger><TooltipContent>{tooltip}</TooltipContent></Tooltip>); } return content;
}

// --- Main Component ---
const EnhancedSpeedSimulator: React.FC = () => {
    // --- State ---
    const [uiMode, setUiMode] = useState<UIMode>('simple');
    const [selectedPreset, setSelectedPreset] = useState<string>("GPT-4o"); // Default to a preset
    // Custom Params state... (unchanged)
    const [modelSize, setModelSize] = useState<number>(13);
    const [hardware, setHardware] = useState<keyof typeof BASE_SPEEDS>('gpu_mid');
    const [quantization, setQuantization] = useState<keyof typeof FACTORS.quantization>('none');
    const [batchSize, setBatchSize] = useState<number>(1);
    const [sequenceLength, setSequenceLength] = useState<number>(1024);
    const [parallelism, setParallelism] = useState<keyof typeof FACTORS.parallelism>('none');
    const [useKvCache, setUseKvCache] = useState<boolean>(true);
    const [networkLatency, setNetworkLatency] = useState<number>(0);
    const [hardwareUtilization, setHardwareUtilization] = useState<number>(80);
    // Simulation Task Params state... (unchanged)
    const [promptTokens, setPromptTokens] = useState<number>(200);
    const [completionTokens, setCompletionTokens] = useState<number>(800);
    const [concurrency, setConcurrency] = useState<number>(1);
    const [streaming, setStreaming] = useState<boolean>(true);
    // Visualization State... (unchanged)
    const [isVisualizing, setIsVisualizing] = useState<boolean>(false);
    const [visualizedText, setVisualizedText] = useState<string>("");
    const [tokenFlash, setTokenFlash] = useState<boolean>(false);
    const [tokenCount, setTokenCount] = useState<number>(0);
    const [tokensThisSecond, setTokensThisSecond] = useState<number>(0);
    const [chartData, setChartData] = useState<Tick[]>([]);
    const [simulationResults, setSimulationResults] = useState<Tick[]>([]);
    // Comparison State... (unchanged)
    const [comparisonRuns, setComparisonRuns] = useState<ComparisonRun[]>([]);

    // --- Refs (unchanged) ---
    const simLoopRef = useRef<NodeJS.Timeout | null>(null); /* ... */
    const flashTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const secondIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const textIndexRef = useRef<number>(0);
    const visualizationAreaRef = useRef<HTMLTextAreaElement>(null);
    const previousTickTokensRef = useRef<number>(0);

    // --- Derived Values ---
    const activePresetKey = (uiMode === 'simple' && selectedPreset === CUSTOM_PRESET_KEY) ? "GPT-4o" : selectedPreset;
    const isCustomMode = activePresetKey === CUSTOM_PRESET_KEY && uiMode === 'advanced';
    const currentPresetData = useMemo(() => MODEL_PRESETS[activePresetKey], [activePresetKey]);

    // Determine the active theme color
    const activeThemeColor = useMemo(() => {
        if (isCustomMode) return DEFAULT_THEME_COLOR; // Use default for custom
        return currentPresetData?.themeColor || DEFAULT_THEME_COLOR;
    }, [isCustomMode, currentPresetData]);

    // Generate dynamic Tailwind classes based on the theme color
    // NOTE: For this to work reliably, ensure these color combinations exist in your Tailwind config
    // or use colors that are always available (like indigo, red, green, etc.)
    const themeClasses = useMemo(() => ({
        text: `text-${activeThemeColor}-600`,
        textHover: `hover:text-${activeThemeColor}-700`,
        bg: `bg-${activeThemeColor}-600`,
        bgHover: `hover:bg-${activeThemeColor}-700`,
        border: `border-${activeThemeColor}-500`,
        ring: `focus:ring-${activeThemeColor}-500`,
        progress: `[&>div]:bg-${activeThemeColor}-500`, // Target shadcn progress indicator
        icon: `text-${activeThemeColor}-600`, // For main icons
        statIconBgFrom: `from-${activeThemeColor}-100`, // Stat icon gradient start
        statIconBgTo: `to-${activeThemeColor}-200`, // Stat icon gradient end (adjust if needed)
        statIconText: `text-${activeThemeColor}-600`, // Stat icon color
        chartCursor: `stroke-${activeThemeColor}-500`, // Recharts cursor
        pinButtonBg: `bg-${activeThemeColor}-600`,
        pinButtonBgHover: `hover:bg-${activeThemeColor}-700`,
        liveLineStroke: `stroke-${activeThemeColor}-500`, // Color for the live/current line in charts
        liveAreaFill: `fill-${activeThemeColor}-500`, // Base color for area fill gradient
    }), [activeThemeColor]);


    const effectiveSpeed = useMemo(() => { /* ... calculation unchanged ... */
        if (!isCustomMode && currentPresetData) return currentPresetData.speed; const base = BASE_SPEEDS[hardware] || BASE_SPEEDS['gpu_mid']; const modelFactor = FACTORS.modelSize(modelSize); const quantFactor = FACTORS.quantization[quantization]; const batchFactor = FACTORS.batchSize(batchSize); const seqLenFactor = FACTORS.sequenceLength(sequenceLength); const parallelFactor = FACTORS.parallelism[parallelism]; const kvCacheFactor = FACTORS.kvCache(useKvCache); const networkFactor = FACTORS.networkLatency(networkLatency); const utilizationFactor = FACTORS.hardwareUtilization(hardwareUtilization); const speed = base * modelFactor * quantFactor * seqLenFactor * parallelFactor * kvCacheFactor * networkFactor * utilizationFactor; return Math.max(0.1, speed);
    }, [isCustomMode, currentPresetData, modelSize, hardware, quantization, batchSize, sequenceLength, parallelism, useKvCache, networkLatency, hardwareUtilization]);
    const effectiveTtfToken = useMemo(() => { /* ... calculation unchanged ... */
        if (!isCustomMode && currentPresetData) return currentPresetData.ttfToken; return 0.1 + networkLatency / 1000 + (promptTokens / 1000);
    }, [isCustomMode, currentPresetData, networkLatency, promptTokens]);

    // --- Simulation Runner (for Simple Mode Auto-Run - unchanged) ---
    const runSimulationForSimpleMode = useCallback(() => { /* ... */
        if (uiMode !== 'simple') return; const presetData = MODEL_PRESETS[activePresetKey]; if (!presetData) return; const params: SimParams = { speed: presetData.speed, promptTokens, completionTokens, concurrency, ttfToken: presetData.ttfToken, streaming, }; const results: Tick[] = []; for (const tick of simulate(params)) { results.push(tick); } setSimulationResults(results);
    }, [uiMode, activePresetKey, promptTokens, completionTokens, concurrency, streaming]);

    // --- Auto-run simulation effect for Simple mode (unchanged) ---
    useEffect(() => { /* ... */ if (uiMode === 'simple') { runSimulationForSimpleMode(); } else { setSimulationResults([]); } }, [uiMode, runSimulationForSimpleMode]);

    // --- Simulation Effect (for Advanced Mode Visualization - unchanged) ---
    useEffect(() => { /* ... */
        const cleanup = () => { if (simLoopRef.current) clearInterval(simLoopRef.current); if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current); if (secondIntervalRef.current) clearInterval(secondIntervalRef.current); simLoopRef.current = null; flashTimeoutRef.current = null; secondIntervalRef.current = null; setTokenFlash(false); }; cleanup();
        if (isVisualizing && uiMode === 'advanced') {
            setVisualizedText(""); setTokenCount(0); setTokensThisSecond(0); setChartData([]); textIndexRef.current = 0; previousTickTokensRef.current = 0; const simParams: SimParams = { speed: effectiveSpeed, promptTokens, completionTokens, concurrency, ttfToken: effectiveTtfToken, streaming, }; const simulatorInstance = simulate(simParams); setTokensThisSecond(0); secondIntervalRef.current = setInterval(() => setTokensThisSecond(0), 1000);
            simLoopRef.current = setInterval(() => {
                const { value: tickData, done } = simulatorInstance.next();
                if (tickData) {
                    const currentTotalTokens = tickData.tokensGenerated; const newlyGeneratedInt = Math.floor(currentTotalTokens) - Math.floor(previousTickTokensRef.current); setChartData(prevData => [...prevData, tickData]);
                    if (newlyGeneratedInt > 0) {
                        setVisualizedText(prev => { let nt=prev; for(let i=0;i<newlyGeneratedInt;i++){nt+=LOREM_IPSUM[textIndexRef.current % LOREM_IPSUM.length]; textIndexRef.current+=1;} return nt.length>1000?nt.slice(-1000):nt; }); if (visualizationAreaRef.current) visualizationAreaRef.current.scrollTop = visualizationAreaRef.current.scrollHeight; setTokenCount(Math.floor(currentTotalTokens)); setTokensThisSecond(prev => prev + newlyGeneratedInt); setTokenFlash(true); if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current); flashTimeoutRef.current = setTimeout(() => setTokenFlash(false), FLASH_DURATION_MS);
                    } previousTickTokensRef.current = currentTotalTokens;
                } if (done) { cleanup(); setIsVisualizing(false); }
            }, SIMULATION_INTERVAL_MS);
        } else { setTokenCount(0); setTokensThisSecond(0); setChartData([]); setVisualizedText(""); } return cleanup;
    }, [isVisualizing, uiMode, effectiveSpeed, effectiveTtfToken, promptTokens, completionTokens, concurrency, streaming]);

    // --- Calculations for Stats (unchanged) ---
    const calculateStats = useCallback((results: Tick[], presetKeyForCost: string, pTokens: number, cTokens: number) => { /* ... */
        if (results.length === 0) return { totalTime: 0, throughput: 0, cost: 0 }; const totalTime = results[results.length - 1].t; const throughput = totalTime > 0 ? (pTokens + cTokens) / totalTime : 0; let cost = 0; const presetData = MODEL_PRESETS[presetKeyForCost]; if (presetData) { const inCost = pTokens / 1_000_000 * presetData.priceIn; const outCost = cTokens / 1_000_000 * presetData.priceOut; cost = inCost + outCost; } return { totalTime, throughput, cost };
    }, []);

    // --- Event Handlers (unchanged) ---
    const handleUiModeChange = useCallback((checked: boolean) => { /* ... */ setUiMode(checked ? 'advanced' : 'simple'); setIsVisualizing(false); if (!checked && selectedPreset === CUSTOM_PRESET_KEY) { setSelectedPreset("GPT-4o"); } }, [selectedPreset]);
    const handlePresetChange = useCallback((value: string) => { /* ... */ if (uiMode === 'simple' && value === CUSTOM_PRESET_KEY) return; setSelectedPreset(value); setIsVisualizing(false); }, [uiMode]);
    const handleSliderChange = useCallback((v: number[], s: React.Dispatch<React.SetStateAction<number>>) => { s(v[0]); }, []);
    const handleSelectChange = useCallback((v: string, s: React.Dispatch<React.SetStateAction<any>>) => { s(v); }, []);
    const handleCheckedChange = useCallback((c: boolean | 'indeterminate', s: React.Dispatch<React.SetStateAction<boolean>>) => { if (typeof c === 'boolean') s(c); }, []);
    const handleSwitchChange = useCallback((c: boolean, s: React.Dispatch<React.SetStateAction<boolean>>) => { s(c); }, []);
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, s: React.Dispatch<React.SetStateAction<number>>, min = 0, max = 1000000) => { /* ... */ let v = parseInt(e.target.value, 10); if (isNaN(v)) v = min; v = Math.max(min, Math.min(max, v)); s(v); }, []);
    const toggleVisualization = useCallback(() => { setIsVisualizing((prev) => !prev); }, []);

    // --- Pinning Logic (Includes themeColor now) ---
    const handlePinRun = useCallback(() => {
        if (comparisonRuns.length >= MAX_COMPARISON_RUNS) { alert(`Max ${MAX_COMPARISON_RUNS} comparisons.`); return; }
        const resultsToPin = uiMode === 'simple' ? simulationResults : chartData;
        if (resultsToPin.length === 0) { alert("No data to pin."); return; }
        const currentParams: SimParams = { speed: effectiveSpeed, promptTokens, completionTokens, concurrency, ttfToken: effectiveTtfToken, streaming, };
        const currentStats = calculateStats(resultsToPin, activePresetKey, promptTokens, completionTokens);
        const runName = isCustomMode ? `Custom (S:${effectiveSpeed.toFixed(0)} P:${promptTokens} C:${completionTokens} N:${concurrency})` : `${activePresetKey} (P:${promptTokens} C:${completionTokens} N:${concurrency})`;
        const newRun: ComparisonRun = {
            id: Date.now().toString(), name: runName, params: currentParams, results: resultsToPin, stats: currentStats,
            color: COMPARISON_CHART_COLORS[comparisonRuns.length % COMPARISON_CHART_COLORS.length], // Use dedicated chart colors
            themeColor: activeThemeColor, // Store the theme color at time of pinning
            presetKey: activePresetKey,
        };
        setComparisonRuns(prev => [...prev, newRun]);
    }, [comparisonRuns, uiMode, simulationResults, chartData, effectiveSpeed, promptTokens, completionTokens, concurrency, effectiveTtfToken, streaming, activePresetKey, isCustomMode, calculateStats, activeThemeColor]); // Added activeThemeColor dependency
    const handleRemoveRun = useCallback((idToRemove: string) => { setComparisonRuns(prev => prev.filter(run => run.id !== idToRemove)); }, []);

    // --- Calculations for Simple Mode Stats (unchanged) ---
    const simpleModeStats = useMemo(() => { /* ... */
        if (uiMode === 'simple') { return calculateStats(simulationResults, activePresetKey, promptTokens, completionTokens); } return { totalTime: 0, throughput: 0, cost: 0 };
    }, [uiMode, simulationResults, activePresetKey, promptTokens, completionTokens, calculateStats]);

    // Progress bar (Advanced mode only - unchanged)
    const progressPercentage = useMemo(() => { /* ... */
        if (uiMode !== 'advanced') return 0; const targetRate = effectiveSpeed * concurrency; const maxExpectedTokens = Math.ceil(targetRate); return maxExpectedTokens > 0 ? Math.min(100, (tokensThisSecond / maxExpectedTokens) * 100) : 0;
    }, [uiMode, tokensThisSecond, effectiveSpeed, concurrency]);

    // Chart data determination (unchanged)
    const chartDisplayData = uiMode === 'simple' ? simulationResults : chartData;
    const showPinButton = (uiMode === 'simple' && simulationResults.length > 0) || (uiMode === 'advanced' && chartData.length > 0);

    // Calculate max time and tokens for chart axes (unchanged)
    const allChartRuns = useMemo(() => [...comparisonRuns, { results: chartDisplayData }], [comparisonRuns, chartDisplayData]);
    const maxTime = useMemo(() => Math.max(0.1, ...allChartRuns.flatMap(run => run.results.map(tick => tick.t))), [allChartRuns]);
    const maxTokens = useMemo(() => Math.max(completionTokens, ...allChartRuns.flatMap(run => run.results.map(tick => tick.tokensGenerated))), [allChartRuns, completionTokens]);


    // --- Rendering ---
    return (
        <TooltipProvider>
            <Card className={`w-full max-w-6xl mx-auto shadow-2xl border border-${activeThemeColor}-200/40 rounded-2xl overflow-hidden bg-gradient-to-br from-${activeThemeColor}-50/30 via-white to-white/60 backdrop-blur-xl transition-colors duration-500`}>
                <CardHeader className={`border-b border-${activeThemeColor}-200/60 pb-4 px-6 pt-5 flex flex-row justify-between items-center bg-gradient-to-r from-slate-100/50 via-white/30 to-${activeThemeColor}-100/30 transition-colors duration-500`}>
                    <div>
                        <CardTitle className="text-xl md:text-2xl font-bold text-slate-900 flex items-center">
                            <Zap className={`mr-2 h-5 w-5 ${themeClasses.icon} drop-shadow-sm`} />
                            Token Speed Simulator
                        </CardTitle>
                        <CardDescription className="text-sm text-slate-600 mt-1">
                            Explore LLM performance and cost trade-offs interactively.
                        </CardDescription>
                    </div>
                    {/* UI Mode Toggle - Pill style */}
                    <div className="flex items-center space-x-1 p-1 bg-slate-200/70 rounded-full border border-slate-300/50 shadow-inner">
                         <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="sm" onClick={() => handleUiModeChange(false)} className={`rounded-full px-3 py-1 h-8 text-xs ${uiMode === 'simple' ? `bg-white shadow ${themeClasses.text} font-semibold` : `text-slate-600 hover:bg-slate-100/70`}`}><Eye className="h-4 w-4 mr-1.5"/> Simple</Button></TooltipTrigger><TooltipContent>Switch to Simple View</TooltipContent></Tooltip>
                         <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="sm" onClick={() => handleUiModeChange(true)} className={`rounded-full px-3 py-1 h-8 text-xs ${uiMode === 'advanced' ? `bg-white shadow ${themeClasses.text} font-semibold` : `text-slate-600 hover:bg-slate-100/70`}`}><Code className="h-4 w-4 mr-1.5"/> Advanced</Button></TooltipTrigger><TooltipContent>Switch to Advanced View</TooltipContent></Tooltip>
                    </div>
                </CardHeader>

                <CardContent className="p-6 md:p-8 space-y-10">

                    {/* --- Shared Inputs --- */}
                    <section className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6 items-start">
                        {/* Preset Selector */}
                        <div className="space-y-2.5">
                            <Label htmlFor="modelPreset" className={`flex items-center text-base font-semibold ${themeClasses.text}`}><BrainCircuit className="mr-2 h-5 w-5" /> Select Model</Label>
                            <Select value={activePresetKey} onValueChange={handlePresetChange}>
                                <SelectTrigger id="modelPreset" className={`w-full text-sm h-10 rounded-lg shadow-sm border-slate-300 focus:border-${activeThemeColor}-500 focus:ring-${activeThemeColor}-500 bg-white`}>
                                    <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* Map over grouped models */}
                                    {Object.entries(groupedModels).map(([company, models]) => (
                                        <SelectGroup key={company}>
                                            <SelectLabel className={`flex items-center text-${MODEL_PRESETS[models[0].key]?.themeColor || DEFAULT_THEME_COLOR}-600`}><Building size={14} className="mr-1.5"/>{company}</SelectLabel>
                                            {models.map(model => (
                                                 <SelectItem key={model.key} value={model.key} className="text-sm">{model.name}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    ))}
                                    {/* Custom Option */}
                                    {uiMode === 'advanced' && (<SelectGroup><SelectLabel>Manual</SelectLabel><SelectItem value={CUSTOM_PRESET_KEY} className="text-sm"><span className="flex items-center"><Settings className="mr-2 h-4 w-4" /> Custom Settings</span></SelectItem></SelectGroup>)}
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Simulation Task Inputs */}
                        <Card className={`p-4 border-${activeThemeColor}-200/50 bg-gradient-to-br from-slate-50/60 to-${activeThemeColor}-50/40 rounded-lg shadow-sm transition-colors duration-500`}>
                             <Label className="flex items-center text-base font-semibold text-slate-700 mb-3"><BarChartHorizontalBig className="mr-2 h-5 w-5 text-slate-600" /> Simulation Task</Label>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-4 items-end">
                                 <div className="space-y-1.5"><Label htmlFor="promptTokens" className="text-xs font-medium text-slate-600">Prompt</Label><Input id="promptTokens" type="number" value={promptTokens} onChange={(e) => handleInputChange(e, setPromptTokens, 0)} className="h-9 text-sm rounded-md shadow-inner bg-white/70"/></div>
                                 <div className="space-y-1.5"><Label htmlFor="completionTokens" className="text-xs font-medium text-slate-600">Complete</Label><Input id="completionTokens" type="number" value={completionTokens} onChange={(e) => handleInputChange(e, setCompletionTokens, 0)} className="h-9 text-sm rounded-md shadow-inner bg-white/70"/></div>
                                 <div className="space-y-1.5"><Label htmlFor="concurrency" className="text-xs font-medium text-slate-600">Concurrent</Label><Input id="concurrency" type="number" value={concurrency} onChange={(e) => handleInputChange(e, setConcurrency, 1)} min={1} className="h-9 text-sm rounded-md shadow-inner bg-white/70"/></div>
                                 <div className="flex items-center space-x-2 pb-1.5"><Switch id="streaming" checked={streaming} onCheckedChange={(c) => handleSwitchChange(c, setStreaming)} /><Label htmlFor="streaming" className="text-xs font-medium text-slate-600">Stream</Label></div>
                             </div>
                        </Card>
                    </section>

                    <Separator className={`my-8 border-${activeThemeColor}-200/60 transition-colors duration-500`} />

                    {/* --- Simple Mode UI --- */}
                    {uiMode === 'simple' && (
                        <section className="space-y-8 animate-fadeIn">
                             <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">Simulation Results</h2>
                                <Button onClick={handlePinRun} variant="default" size="sm" disabled={simulationResults.length === 0 || comparisonRuns.length >= MAX_COMPARISON_RUNS} className={`shadow-md hover:shadow-lg transition-shadow ${themeClasses.pinButtonBg} ${themeClasses.pinButtonBgHover} text-white rounded-full px-4`}>
                                    <Pin className="mr-1.5 h-4 w-4" /> Pin Run
                                </Button>
                             </div>
                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                                 {/* Update Stat component to use theme color for icon */}
                                 <Stat label="Total Time" tooltip={TOOLTIPS.totalTime} icon={Timer}>{simpleModeStats.totalTime.toFixed(2)} s</Stat>
                                 <Stat label="Throughput" tooltip={TOOLTIPS.throughput} icon={Zap}>{simpleModeStats.throughput.toFixed(1)} t/s</Stat>
                                 <Stat label="Est. Cost" tooltip={TOOLTIPS.cost} icon={DollarSign}>${simpleModeStats.cost.toFixed(4)}</Stat>
                             </div>
                             <div className={`h-72 md:h-[450px] w-full border border-${activeThemeColor}-200/60 rounded-xl p-4 bg-gradient-to-br from-slate-50/50 to-${activeThemeColor}-50/30 shadow-inner overflow-hidden transition-colors duration-500`}>
                                 <Label className="flex items-center justify-center text-sm font-medium text-slate-700 mb-3">Completion Progress</Label>
                                 <ResponsiveContainer width="100%" height="calc(100% - 28px)">
                                     <AreaChart data={simulationResults} margin={{ top: 5, right: 30, left: 10, bottom: 20 }}>
                                         <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                         <XAxis dataKey="t" type="number" label={{ value: 'Time (s)', position: 'insideBottom', dy: 15 }} stroke="#64748b" tickFormatter={(tick) => tick.toFixed(1)} domain={[0, maxTime]} allowDataOverflow tick={{ fontSize: 11 }} />
                                         <YAxis label={{ value: 'Tokens', angle: -90, position: 'insideLeft', dx: -5 }} stroke="#64748b" domain={[0, dataMax => Math.max(dataMax, maxTokens)]} allowDataOverflow tick={{ fontSize: 11 }} />
                                         <RechartsTooltip wrapperClassName="!text-xs !rounded-md !shadow-lg !border-slate-200 !bg-white/80 !backdrop-blur-sm" contentStyle={{fontSize: '12px', padding: '6px 10px', borderRadius: '6px'}} formatter={(value: number, name, props) => [`${Math.round(value)} tokens`, props.payload.runName || "Current Run"]} labelFormatter={(label: number) => `Time: ${label.toFixed(2)}s`} cursor={{ stroke: themeClasses.chartCursor, strokeWidth: 1, strokeDasharray: '3 3' }}/>
                                         <defs>
                                             {comparisonRuns.map((run) => (<linearGradient key={run.id} id={`color-${run.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={run.color} stopOpacity={0.7}/><stop offset="95%" stopColor={run.color} stopOpacity={0.1}/></linearGradient>))}
                                             {/* Use dynamic theme color for current run gradient */}
                                             <linearGradient id="color-current-simple" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={`var(--theme-color-500, #a78bfa)`} stopOpacity={0.5}/><stop offset="95%" stopColor={`var(--theme-color-500, #a78bfa)`} stopOpacity={0.05}/></linearGradient>
                                         </defs>
                                         {comparisonRuns.map(run => (<Area key={run.id} type="monotone" dataKey="tokensGenerated" data={run.results} name={run.name} stroke={run.color} strokeWidth={2.5} fillOpacity={1} fill={`url(#color-${run.id})`} dot={false} isAnimationActive={false} />))}
                                         {/* Use dynamic theme color for current run stroke/fill */}
                                         <Area type="monotone" dataKey="tokensGenerated" data={simulationResults} name={`Current: ${activePresetKey}`} className={`${themeClasses.liveLineStroke} ${themeClasses.liveAreaFill}`} strokeWidth={1.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#color-current-simple)" dot={false} isAnimationActive={false} />
                                         <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '11px', paddingBottom: '10px'}}/>
                                     </AreaChart>
                                 </ResponsiveContainer>
                             </div>
                        </section>
                    )}

                    {/* --- Advanced Mode UI --- */}
                    {uiMode === 'advanced' && (
                        <section className="space-y-8 animate-fadeIn">
                            {/* Custom Input Parameters Grid */}
                             <fieldset disabled={!isCustomMode} className={`transition-opacity duration-300 ${isCustomMode ? 'opacity-100' : 'opacity-60 pointer-events-none'} border border-${activeThemeColor}-200/60 rounded-xl p-6 bg-gradient-to-br from-slate-50/60 to-${activeThemeColor}-50/40 shadow-sm transition-colors duration-500`}>
                                 <legend className={`text-lg font-semibold ${themeClasses.text} mb-4 px-2 -ml-2 transition-colors duration-500`}>{isCustomMode ? 'Tune Parameters' : 'Parameters (Preset Active)'}</legend>
                                 {!isCustomMode && (<p className="text-xs text-center text-amber-700 bg-amber-50 p-2 rounded-md border border-amber-200 mb-4 -mt-2">Manual parameters disabled. Using '{activePresetKey}' preset values.</p>)}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                                    {/* Columns with inputs/sliders - Apply theme color to slider values */}
                                    {/* Col 1 */}<div className="space-y-6"><div className="space-y-1.5"><Label className="text-sm font-medium text-slate-600">Model Size (B)</Label><div className="flex items-center space-x-3"><Slider id="modelSize" value={[modelSize]} onValueChange={(v)=>handleSliderChange(v,setModelSize)} min={1} max={180} step={1} /><span className={`text-sm w-12 text-right font-medium ${themeClasses.text}`}>{modelSize}B</span></div></div><div className="space-y-1.5"><Label className="text-sm font-medium text-slate-600">Quantization</Label><Select value={quantization} onValueChange={(v)=>handleSelectChange(v,setQuantization)}><SelectTrigger className="text-sm h-9 rounded-md"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem><SelectItem value="8bit">8-bit</SelectItem><SelectItem value="4bit">4-bit</SelectItem></SelectContent></Select></div></div>
                                    {/* Col 2 */}<div className="space-y-6"><div className="space-y-1.5"><Label className="text-sm font-medium text-slate-600">Hardware</Label><Select value={hardware} onValueChange={(v)=>handleSelectChange(v,setHardware)}><SelectTrigger className="text-sm h-9 rounded-md"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="cpu">CPU</SelectItem><SelectItem value="gpu_low">GPU (Low)</SelectItem><SelectItem value="gpu_mid">GPU (Mid)</SelectItem><SelectItem value="gpu_high">GPU (High)</SelectItem><SelectItem value="tpu_v4">TPU v4</SelectItem><SelectItem value="tpu_v5">TPU v5</SelectItem></SelectContent></Select></div><div className="space-y-1.5"><Label className="text-sm font-medium text-slate-600">Parallelism</Label><Select value={parallelism} onValueChange={(v)=>handleSelectChange(v,setParallelism)}><SelectTrigger className="text-sm h-9 rounded-md"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem><SelectItem value="tensor">Tensor</SelectItem><SelectItem value="pipeline">Pipeline</SelectItem></SelectContent></Select></div></div>
                                    {/* Col 3 */}<div className="space-y-6"><div className="space-y-1.5"><Label className="text-sm font-medium text-slate-600">Batch Size</Label><div className="flex items-center space-x-3"><Slider id="batchSize" value={[batchSize]} onValueChange={(v)=>handleSliderChange(v,setBatchSize)} min={1} max={64} step={1} /><span className={`text-sm w-10 text-right font-medium ${themeClasses.text}`}>{batchSize}</span></div></div><div className="space-y-1.5"><Label className="text-sm font-medium text-slate-600">Net Latency (ms)</Label><div className="flex items-center space-x-3"><Slider id="networkLatency" value={[networkLatency]} onValueChange={(v)=>handleSliderChange(v,setNetworkLatency)} min={0} max={500} step={5} /><span className={`text-sm w-12 text-right font-medium ${themeClasses.text}`}>{networkLatency}ms</span></div></div></div>
                                    {/* Row 2 */}<div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 items-center pt-4"><div className="space-y-1.5"><Label className="text-sm font-medium text-slate-600">Sequence Len</Label><div className="flex items-center space-x-3"><Slider id="sequenceLength" value={[sequenceLength]} onValueChange={(v)=>handleSliderChange(v,setSequenceLength)} min={128} max={8192} step={128} /><span className={`text-sm w-16 text-right font-medium ${themeClasses.text}`}>{sequenceLength}</span></div></div><div className="space-y-1.5"><Label className="text-sm font-medium text-slate-600">HW Utilization (%)</Label><div className="flex items-center space-x-3"><Slider id="hardwareUtilization" value={[hardwareUtilization]} onValueChange={(v)=>handleSliderChange(v,setHardwareUtilization)} min={10} max={100} step={5} /><span className={`text-sm w-10 text-right font-medium ${themeClasses.text}`}>{hardwareUtilization}%</span></div></div><div className="flex items-center space-x-2 pt-5 justify-center md:justify-start"><Checkbox id="kvCache" checked={useKvCache} onCheckedChange={(c)=>handleCheckedChange(c,setUseKvCache)}/><Label htmlFor="kvCache" className="text-sm font-medium text-slate-600">Use KV Cache</Label></div></div>
                                </div>
                            </fieldset>
                            <Separator className={`my-8 border-${activeThemeColor}-200/60 transition-colors duration-500`}/>
                            {/* Advanced Results Section */}
                            <div className="mt-4 pt-4">
                                <h3 className="text-xl font-semibold text-center mb-4">{isCustomMode ? 'Estimated Performance (Custom)' : `Performance & Pricing (${activePresetKey})`}</h3>
                                <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 bg-gradient-to-r from-${activeThemeColor}-100/50 via-white to-purple-100/50 p-6 rounded-xl shadow-inner mb-6 transition-colors duration-500`}>
                                    <Stat label="Gen Speed" tooltip={TOOLTIPS.genSpeed} icon={Zap}>{effectiveSpeed.toFixed(1)} t/s</Stat>
                                    <Stat label="TTF Token" tooltip={TOOLTIPS.ttfToken} icon={Clock}><span className={isCustomMode ? 'text-slate-500' : ''}>{isCustomMode ? effectiveTtfToken.toFixed(2) : (currentPresetData?.ttfToken ?? 0).toFixed(2)} {isCustomMode ? '(Est.)' : 's'}</span></Stat>
                                    <Stat label="Pricing ($/1M)" tooltip={TOOLTIPS.pricing} icon={DollarSign}>
                                        <span className={isCustomMode ? 'text-slate-500' : ''}>
                                            {isCustomMode ? 'N/A' : <> <span className="text-emerald-600">${(currentPresetData?.priceIn ?? 0).toFixed(2)}</span> In / <span className="text-rose-600">${(currentPresetData?.priceOut ?? 0).toFixed(2)}</span> Out </>}
                                        </span>
                                    </Stat>
                                </div>
                            </div>
                            {/* Advanced Visualization Section */}
                            <div className="mt-6 pt-6 border-t border-dashed border-slate-300">
                                 <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-semibold text-slate-800">Live Visualization</h3>
                                    <Button onClick={handlePinRun} variant="outline" size="sm" disabled={chartData.length === 0 || comparisonRuns.length >= MAX_COMPARISON_RUNS} className={`shadow-sm hover:shadow-md transition-shadow bg-white border-slate-300 hover:bg-slate-50 text-slate-700 rounded-full px-4`}>
                                        <Pin className={`mr-1.5 h-4 w-4 ${themeClasses.icon}`} /> Pin Run
                                    </Button>
                                 </div>
                                <div className="flex justify-center mb-6"><Button onClick={toggleVisualization} variant={isVisualizing ? "destructive" : "default"} className={`w-48 shadow-md hover:shadow-lg transition-shadow rounded-full text-base py-2.5 ${isVisualizing ? 'bg-red-500 hover:bg-red-600' : `${themeClasses.bg} ${themeClasses.bgHover}`}`}>{isVisualizing ? <Square className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}{isVisualizing ? 'Stop Simulation' : 'Start Simulation'}</Button></div>
                                {/* Chart */}
                                <div className={`mb-8 h-72 md:h-[450px] w-full border border-${activeThemeColor}-200/60 rounded-xl p-4 bg-gradient-to-br from-slate-50/50 to-${activeThemeColor}-50/30 shadow-inner overflow-hidden transition-colors duration-500`}>
                                     <Label className="flex items-center justify-center text-sm font-medium mb-3">Live Completion Progress</Label>
                                     <ResponsiveContainer width="100%" height="calc(100% - 28px)">
                                         <LineChart margin={{ top: 5, right: 30, left: 10, bottom: 20 }}>
                                             <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                             <XAxis dataKey="t" type="number" label={{ value: 'Time (s)', position: 'insideBottom', dy: 15 }} stroke="#64748b" tickFormatter={(tick) => tick.toFixed(1)} domain={[0, maxTime]} allowDataOverflow tick={{ fontSize: 11 }}/>
                                             <YAxis label={{ value: 'Tokens', angle: -90, position: 'insideLeft', dx: -5 }} stroke="#64748b" domain={[0, dataMax => Math.max(dataMax, maxTokens)]} allowDataOverflow tick={{ fontSize: 11 }}/>
                                             <RechartsTooltip wrapperClassName="!text-xs !rounded-md !shadow-lg !border-slate-200 !bg-white/80 !backdrop-blur-sm" contentStyle={{fontSize: '12px', padding: '6px 10px', borderRadius: '6px'}} formatter={(value: number, name, props) => [`${Math.round(value)} tokens`, props.payload.runName || "Current Run"]} labelFormatter={(label: number) => `Time: ${label.toFixed(2)}s`} cursor={{ stroke: themeClasses.chartCursor, strokeWidth: 1, strokeDasharray: '3 3' }}/>
                                             <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '11px', paddingBottom: '10px'}}/>
                                             {comparisonRuns.map(run => (<Line key={run.id} type="monotone" dataKey="tokensGenerated" data={run.results} name={run.name} stroke={run.color} strokeWidth={2.5} dot={false} isAnimationActive={false} /> ))}
                                             {isVisualizing && <Line type="monotone" dataKey="tokensGenerated" data={chartData} name={`Live: ${isCustomMode ? 'Custom' : activePresetKey}`} className={themeClasses.liveLineStroke} strokeWidth={2} strokeDasharray="4 4" dot={false} isAnimationActive={false} />}
                                         </LineChart>
                                     </ResponsiveContainer>
                                 </div>
                                {/* Other Indicators - Enhanced Layout */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                    {/* Terminal-like text output */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium flex items-center"><Code className="mr-2 h-4 w-4 text-slate-500"/>Live Output</Label>
                                        <textarea ref={visualizationAreaRef} readOnly value={visualizedText} placeholder="$ Simulation output appears here..." className={`w-full h-36 p-4 border rounded-lg bg-slate-900 text-slate-200 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-${activeThemeColor}-500/50 shadow-inner scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800 transition-colors duration-500`}/>
                                    </div>
                                    {/* Right side indicators */}
                                    <div className={`space-y-5 pt-2 border border-${activeThemeColor}-200/60 rounded-lg p-4 bg-gradient-to-br from-slate-50/60 to-${activeThemeColor}-50/40 shadow-sm transition-colors duration-500`}>
                                        <div className="flex items-center justify-between"><Label className="text-sm font-medium flex items-center"><Activity className="mr-2 h-4 w-4 text-slate-500"/>Token Indicator</Label><div className="flex items-center space-x-2"><div className={`h-4 w-4 rounded-full transition-colors shadow-inner ${tokenFlash ? `${themeClasses.bg} animate-pulse` : 'bg-slate-300'}`}></div><span className="text-xs text-slate-500">Flashes/token</span></div></div>
                                        <Separator className="border-slate-200/80"/>
                                        <div className="flex items-center justify-between"><Label className="text-sm font-medium flex items-center"><Hash className="mr-2 h-4 w-4 text-slate-500"/>Tokens Generated</Label><div className="flex items-baseline space-x-1"><span className={`text-lg font-semibold ${themeClasses.text}`}>{tokenCount}</span><span className="text-sm text-slate-500">/ {completionTokens}</span></div></div>
                                        <Separator className="border-slate-200/80"/>
                                        <div className="space-y-1.5"><Label className="text-sm font-medium flex items-center"><Gauge className="mr-2 h-4 w-4 text-slate-500"/>Rate This Second</Label><div className="flex items-center space-x-3"><Progress value={isVisualizing ? progressPercentage : 0} className={`w-full h-2.5 ${themeClasses.progress}`} /><span className="text-xs text-slate-600 font-medium w-28 text-right">{tokensThisSecond} / {(effectiveSpeed * concurrency).toFixed(0)} t/s</span></div></div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* --- Pinned Runs Display (Enhanced Styling) --- */}
                    {comparisonRuns.length > 0 && (
                        <div className="mt-10 pt-10 border-t border-dashed border-slate-300">
                             <h3 className="text-xl font-semibold text-center text-slate-800 mb-6 flex items-center justify-center">
                                <PinOff className="mr-2 h-5 w-5 text-slate-500"/> Pinned Comparisons
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 justify-center"> {/* Increased gap */}
                                {comparisonRuns.map(run => (
                                    // Use the themeColor stored with the run for the border
                                    <Card key={run.id} className={`p-4 border border-slate-200 rounded-xl shadow-lg w-full bg-white hover:shadow-${run.themeColor}-100/50 transition-shadow duration-200 flex flex-col`} style={{ borderLeft: `5px solid ${run.color}` }}>
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="text-sm font-semibold truncate pr-2" title={run.name} style={{ color: run.color }}>{run.name}</p>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 rounded-full hover:bg-red-100" onClick={() => handleRemoveRun(run.id)}>
                                                <X className="h-4 w-4 text-slate-400 hover:text-red-500"/>
                                            </Button>
                                        </div>
                                        <div className="text-sm space-y-1.5 text-slate-600 mt-auto pt-2 border-t border-slate-200/60">
                                            <p className="flex justify-between">Time: <span className="font-medium text-slate-900">{run.stats.totalTime.toFixed(2)}s</span></p>
                                            <p className="flex justify-between">Throughput: <span className="font-medium text-slate-900">{run.stats.throughput.toFixed(1)} t/s</span></p>
                                            {run.presetKey !== CUSTOM_PRESET_KEY && <p className="flex justify-between">Cost: <span className="font-medium text-slate-900">${run.stats.cost.toFixed(4)}</span></p>}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    <p className="text-xs text-slate-500 text-center mt-12 italic">
                        Disclaimer: Preset data is indicative; verify official sources. Custom estimations & simulations are simplified; actual performance varies.
                    </p>

                </CardContent>
            </Card>
            {/* </div> */}

            {/* Add subtle animation classes if not already present in globals.css */}
            {/* Add CSS variables for dynamic theme colors */}
            <style jsx global>{`
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(10px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                  animation: fadeIn 0.5s ease-out forwards;
                }
                :root {
                  --theme-color-50: #eff6ff; /* Default: indigo-50 */
                  --theme-color-100: #dbeafe; /* Default: indigo-100 */
                  --theme-color-200: #c7d2fe; /* Default: indigo-200 */
                  --theme-color-500: #6366f1; /* Default: indigo-500 */
                  --theme-color-600: #4f46e5; /* Default: indigo-600 */
                  --theme-color-700: #4338ca; /* Default: indigo-700 */
                }
             `}</style>
             {/* Inject dynamic theme colors */}
              <style jsx global>{`
                :root {
                  --theme-color-50: theme(colors.${activeThemeColor}.50);
                  --theme-color-100: theme(colors.${activeThemeColor}.100);
                  --theme-color-200: theme(colors.${activeThemeColor}.200);
                  --theme-color-500: theme(colors.${activeThemeColor}.500);
                  --theme-color-600: theme(colors.${activeThemeColor}.600);
                  --theme-color-700: theme(colors.${activeThemeColor}.700);
                }
             `}</style>

        </TooltipProvider>
    );
};

export default EnhancedSpeedSimulator;

// --- Dummy Shadcn UI Components & Recharts (for demonstration) ---
// Remove these if you have shadcn/ui and recharts properly configured.
/*
import { Button as ShadButton } from "@/components/ui/button"; // etc.
// ... (Dummy components from previous response - Omitted for brevity) ...
const DummyAreaChart: React.FC<any> = ({ children, data }) => <div className="border border-dashed border-gray-300 p-2 text-xs text-center text-gray-500">Area Chart Placeholder<pre className="text-left text-[8px] overflow-auto max-h-40">{JSON.stringify(data?.slice(-5), null, 1)}</pre>{children}</div>;
const DummyArea: React.FC<any> = ({ dataKey, name }) => <p>Area: {name} ({dataKey})</p>;

 const { Slider = DummySlider, Select = DummySelect, SelectContent = DummySelectContent, SelectGroup = DummySelectGroup, SelectLabel = DummySelectLabel, SelectItem = DummySelectItem, SelectTrigger = DummySelectTrigger, SelectValue = DummySelectValue, Checkbox = DummyCheckbox, Switch = DummySwitch, Tooltip = DummyTooltip, TooltipContent = DummyTooltipContent, TooltipProvider = DummyTooltipProvider, TooltipTrigger = DummyTooltipTrigger, Card = DummyCard, CardContent = DummyCardContent, CardHeader = DummyCardHeader, CardTitle = DummyCardTitle, CardDescription = DummyCardDescription, Label = DummyLabel, Input = DummyInput, Button = DummyButton, Progress = DummyProgress, Separator = DummySeparator } = { /* ... dummy assignments ... * / };
 const { ResponsiveContainer = DummyResponsiveContainer, LineChart = DummyLineChart, Line = DummyLine, AreaChart = DummyAreaChart, Area = DummyArea, XAxis = DummyXAxis, YAxis = DummyYAxis, CartesianGrid = DummyCartesianGrid, Tooltip: RechartsTooltip = DummyRechartsTooltip, Legend = DummyLegend } = { /* ... dummy assignments ... * / };
*/
