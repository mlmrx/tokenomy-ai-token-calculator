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

interface SimParams {
    speed: number;
    promptTokens: number;
    completionTokens: number;
    concurrency: number;
    ttfToken: number;
    streaming: boolean;
}
interface Tick {
    t: number;
    tokensGenerated: number;
}

interface ModelPreset {
    company: Company;
    speed: number; // tokens/s
    ttfToken: number; // sec
    priceIn: number; // $/1M tokens
    priceOut: number; // $/1M tokens
    themeColor: string; // Primary Tailwind color class (e.g., 'indigo', 'rose', 'emerald')
}

// Structure for storing a pinned comparison run
interface ComparisonRun {
    id: string;
    name: string;
    params: SimParams;
    results: Tick[];
    stats: { totalTime: number; throughput: number; cost: number; };
    color: string; // Chart line/area color
    themeColor: string; // Associated theme color for the card border
    presetKey: string;
}

// --- Simulation Logic (Generator - unchanged) ---
function* simulate(params: SimParams): Generator<Tick, void, unknown> {
    const { speed, promptTokens, completionTokens, concurrency, ttfToken, streaming } = params;
    // Basic validation: Ensure parameters are non-negative and speed/concurrency are positive.
    if (speed <= 0 || concurrency <= 0 || completionTokens < 0 || promptTokens < 0 || ttfToken < 0) {
        yield { t: 0, tokensGenerated: 0 }; // Yield initial state
        return; // Stop if invalid params
    }
    // Handle edge case: No completion tokens requested.
    if (completionTokens === 0) {
        yield { t: 0, tokensGenerated: 0 }; // Initial state
        yield { t: ttfToken, tokensGenerated: 0 }; // State after TTFT
        return; // Stop simulation
    }

    const totalCompletionTokens = completionTokens;
    const generationStartTime = ttfToken; // Time when token generation actually starts
    let elapsedSeconds = 0;
    let cumulativeGeneratedTokens = 0;
    const dt = 1 / 60; // Time step for simulation (aiming for 60 FPS updates)

    yield { t: 0, tokensGenerated: 0 }; // Emit initial state (t=0)

    // Simulation loop: Continues until all tokens are generated or a time limit is hit.
    while (cumulativeGeneratedTokens < totalCompletionTokens) {
        elapsedSeconds += dt; // Increment time

        let newlyGeneratedThisTick = 0;
        // Only generate tokens after the Time To First Token (TTFT) has passed.
        if (elapsedSeconds >= generationStartTime) {
            newlyGeneratedThisTick = speed * dt * concurrency; // Tokens generated in this time step
        }

        // Update cumulative tokens, ensuring it doesn't exceed the target.
        cumulativeGeneratedTokens = Math.min(
            cumulativeGeneratedTokens + newlyGeneratedThisTick,
            totalCompletionTokens
        );

        // Yield the current state (time and tokens generated).
        yield { t: elapsedSeconds, tokensGenerated: cumulativeGeneratedTokens };

        // Safety break: Prevent infinite loops in case of unexpected issues.
        if (elapsedSeconds > 600) { // 10 minutes limit
            console.warn("Simulation exceeded 10 minutes, stopping.");
            break;
        }
    }

    // Ensure the final state accurately reflects reaching the total completion tokens.
    if (cumulativeGeneratedTokens >= totalCompletionTokens) {
        // Calculate the exact time needed to generate all tokens based on the rate.
        const timeToGenerateAll = totalCompletionTokens / (speed * concurrency);
        // The final timestamp is the TTFT plus the generation time.
        const finalTime = generationStartTime + timeToGenerateAll;
        // Yield the final, precise state.
        yield { t: finalTime, tokensGenerated: totalCompletionTokens };
    }
}


// --- Presets & Constants ---
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

// Group models by company for the dropdown selector
const groupedModels = Object.entries(MODEL_PRESETS).reduce((acc, [key, preset]) => {
    if (!acc[preset.company]) {
        acc[preset.company] = [];
    }
    acc[preset.company].push({ key, name: key });
    return acc;
}, {} as Record<Company, { key: string; name: string }[]>);


// Base speeds for different hardware types (tokens/second) - Simplified estimates
const BASE_SPEEDS = {
    'cpu': 10,
    'gpu_low': 50,
    'gpu_mid': 150,
    'gpu_high': 500,
    'tpu_v4': 450,
    'tpu_v5': 800,
};
// Factors affecting performance (multipliers) - Simplified estimates
const FACTORS = {
    // Larger models are generally slower
    modelSize: (p: number) => {
        if (p <= 7) return 1.2;
        if (p <= 13) return 1.0;
        if (p <= 30) return 0.7;
        if (p <= 70) return 0.4;
        return 0.15; // Very large models
    },
    // Quantization can increase speed (less precision)
    quantization: {
        'none': 1.0, // No quantization
        '8bit': 1.5, // 8-bit quantization
        '4bit': 2.0, // 4-bit quantization
    },
    // Larger batches might slightly improve throughput per unit but have overhead
    batchSize: (s: number) => 1 + (s - 1) * 0.05, // Small benefit per item
    // Longer sequences can slow down generation due to attention mechanism complexity
    sequenceLength: (l: number) => {
        if (l <= 512) return 1.0;
        if (l <= 1024) return 0.95;
        if (l <= 2048) return 0.9;
        if (l <= 4096) return 0.85;
        return 0.8; // Very long sequences
    },
    // Parallelism techniques can significantly boost speed
    parallelism: {
        'none': 1.0,
        'tensor': 1.8, // Tensor parallelism
        'pipeline': 1.5, // Pipeline parallelism (can be combined, simplified here)
    },
    // KV cache reduces re-computation for previous tokens
    kvCache: (e: boolean) => e ? 1.0 : 0.7, // Significant penalty if disabled
    // Network latency adds overhead, especially for TTFT, minor impact on streaming rate
    networkLatency: (l: number) => Math.max(0.1, 1 - l / 500), // Speed reduction factor
    // Hardware utilization affects effective speed
    hardwareUtilization: (u: number) => 0.5 + (u / 100) * 0.5, // Scale between 50% and 100% effective speed
};
// Tooltip descriptions for UI elements
const TOOLTIPS = {
    uiMode: "Toggle between Simple view (presets, task inputs, chart, final stats) and Advanced view (custom parameters, detailed visualizations).",
    modelPreset: "Select a pre-configured model or choose 'Custom Settings' (available in Advanced view) to manually adjust parameters. The interface theme color changes based on the selected model provider.",
    totalTime: "Total time elapsed from the start of the request until the last completion token is generated.",
    throughput: "Overall effective throughput calculated as (Prompt Tokens + Completion Tokens) / Total Time.",
    cost: "Estimated cost based on the selected model's pricing for prompt (input) and completion (output) tokens.",
    chartSimple: "Shows the cumulative number of completion tokens generated over time for the current settings. Use 'Pin Run' to add this simulation to the chart for comparison.",
    chartAdvanced: "Shows the live progress of the simulation, plotting generated tokens against time. Use 'Pin Run' to save the results of this run for comparison.",
    pinRun: "Save the current simulation's parameters, results (chart data), and calculated stats. Pinned runs appear on the chart and in the 'Pinned Comparisons' section below.",
    pinnedRuns: "A list of simulation runs you have pinned for comparison. Click the 'X' button on a card to remove it.",
    genSpeed: "The calculated or preset speed at which the model generates completion tokens, measured in tokens per second.",
    ttfToken: "Time To First Token: The duration from the request start until the very first completion token is generated. Affected by network latency and prompt processing.",
    pricing: "The cost per 1 million tokens for the selected preset model. 'In' refers to prompt tokens, 'Out' refers to completion tokens. Not applicable for custom settings.",
};
// Placeholder text for visualization
const LOREM_IPSUM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ";
// UI constants
const FLASH_DURATION_MS = 50; // Duration for the token indicator flash
const SIMULATION_INTERVAL_MS = 16; // Target interval for simulation updates (~60 FPS)
const MAX_COMPARISON_RUNS = 5; // Maximum number of runs that can be pinned
// Vibrant color palette for comparison lines (distinct from theme colors)
const COMPARISON_CHART_COLORS = ["#6366f1", "#ec4899", "#22c55e", "#f59e0b", "#a855f7", "#06b6d4"];

// --- Stat Component (Displays a single metric) ---
function Stat({ label, children, tooltip, icon: Icon, color = "text-slate-800" }: { label: string; children: React.ReactNode; tooltip?: string; icon?: React.ElementType, color?: string }) {
    const content = (
        <div className="rounded-xl border border-slate-200/70 p-4 text-center bg-white shadow-lg hover:shadow-indigo-100/50 transition-shadow duration-300 flex items-center space-x-4">
            {/* Icon with gradient background */}
            {Icon && (
                <div className="p-2.5 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full">
                    <Icon className={`h-5 w-5 text-indigo-600`} />
                </div>
            )}
            {/* Label and Value */}
            <div className="text-left">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">{label}</div>
                <span className={`font-bold text-xl md:text-2xl ${color} block`}>{children}</span>
            </div>
        </div>
    );

    // Wrap with Tooltip if tooltip text is provided
    if (tooltip) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>{content}</TooltipTrigger>
                <TooltipContent>{tooltip}</TooltipContent>
            </Tooltip>
        );
    }
    return content; // Return content directly if no tooltip
}


// --- Main Component ---
export const TokenSpeedSimulator: React.FC = () => {
    // --- State ---
    const [uiMode, setUiMode] = useState<UIMode>('simple'); // 'simple' or 'advanced'
    const [selectedPreset, setSelectedPreset] = useState<string>("GPT-4o"); // Key of the selected preset or CUSTOM_PRESET_KEY

    // State for Advanced Mode Custom Parameters
    const [modelSize, setModelSize] = useState<number>(13); // Model size in billions of parameters
    const [hardware, setHardware] = useState<keyof typeof BASE_SPEEDS>('gpu_mid'); // Selected hardware type
    const [quantization, setQuantization] = useState<keyof typeof FACTORS.quantization>('none'); // Quantization level
    const [batchSize, setBatchSize] = useState<number>(1); // Inference batch size
    const [sequenceLength, setSequenceLength] = useState<number>(1024); // Input sequence length
    const [parallelism, setParallelism] = useState<keyof typeof FACTORS.parallelism>('none'); // Parallelism strategy
    const [useKvCache, setUseKvCache] = useState<boolean>(true); // Whether KV caching is enabled
    const [networkLatency, setNetworkLatency] = useState<number>(0); // Network latency in ms
    const [hardwareUtilization, setHardwareUtilization] = useState<number>(80); // Hardware utilization percentage

    // State for Simulation Task Parameters (shared between modes)
    const [promptTokens, setPromptTokens] = useState<number>(200); // Number of input tokens
    const [completionTokens, setCompletionTokens] = useState<number>(800); // Number of output tokens to generate
    const [concurrency, setConcurrency] = useState<number>(1); // Number of concurrent requests
    const [streaming, setStreaming] = useState<boolean>(true); // Whether the response is streamed

    // State for Advanced Mode Visualization
    const [isVisualizing, setIsVisualizing] = useState<boolean>(false); // Is the advanced simulation running?
    const [visualizedText, setVisualizedText] = useState<string>(""); // Text displayed in the output area
    const [tokenFlash, setTokenFlash] = useState<boolean>(false); // Controls the visual flash indicator
    const [tokenCount, setTokenCount] = useState<number>(0); // Current count of generated tokens in visualization
    const [tokensThisSecond, setTokensThisSecond] = useState<number>(0); // Tokens generated in the current second (for rate display)
    const [chartData, setChartData] = useState<Tick[]>([]); // Data points for the advanced mode chart

    // State for Simple Mode Results (calculated automatically)
    const [simulationResults, setSimulationResults] = useState<Tick[]>([]); // Pre-calculated results for simple mode

    // State for Comparison Feature
    const [comparisonRuns, setComparisonRuns] = useState<ComparisonRun[]>([]); // Array of pinned simulation runs

    // --- Refs ---
    const simLoopRef = useRef<NodeJS.Timeout | null>(null); // Interval ID for the advanced simulation loop
    const flashTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Timeout ID for the token flash effect
    const secondIntervalRef = useRef<NodeJS.Timeout | null>(null); // Interval ID for resetting the 'tokensThisSecond' counter
    const textIndexRef = useRef<number>(0); // Index for cycling through LOREM_IPSUM text
    const visualizationAreaRef = useRef<HTMLTextAreaElement>(null); // Ref for the text output area to manage scrolling
    const previousTickTokensRef = useRef<number>(0); // Stores the token count from the previous tick for delta calculation

    // --- Derived Values ---

    // Determine the active preset key, handling the case where 'Custom' is selected in simple mode (defaults to GPT-4o)
    const activePresetKey = useMemo(() => {
        if (uiMode === 'simple' && selectedPreset === CUSTOM_PRESET_KEY) {
            return "GPT-4o"; // Fallback if custom is somehow selected in simple mode
        }
        return selectedPreset;
    }, [uiMode, selectedPreset]);

    // Check if the simulator is currently in custom parameter mode (Advanced UI + Custom selected)
    const isCustomMode = useMemo(() => activePresetKey === CUSTOM_PRESET_KEY && uiMode === 'advanced', [activePresetKey, uiMode]);

    // Get the data object for the currently active preset (or null if custom)
    const currentPresetData = useMemo(() => {
        if (isCustomMode) return null; // No preset data when in custom mode
        return MODEL_PRESETS[activePresetKey]; // Get data from the presets map
    }, [activePresetKey, isCustomMode]);

    // Determine the active theme color based on the selected preset or default for custom mode
    const activeThemeColor = useMemo(() => {
        if (isCustomMode) return DEFAULT_THEME_COLOR; // Use default for custom settings
        return currentPresetData?.themeColor || DEFAULT_THEME_COLOR; // Use preset's color or fallback
    }, [isCustomMode, currentPresetData]);

    // Generate dynamic Tailwind CSS class strings based on the active theme color
    // These are used throughout the component to apply theme-specific styling.
    const themeClasses = useMemo(() => ({
        text: `text-${activeThemeColor}-600`,
        textHover: `hover:text-${activeThemeColor}-700`,
        bg: `bg-${activeThemeColor}-600`,
        bgHover: `hover:bg-${activeThemeColor}-700`,
        border: `border-${activeThemeColor}-500`, // Stronger border color
        borderSoft: `border-${activeThemeColor}-200/60`, // Softer border color
        ring: `focus:ring-${activeThemeColor}-500`,
        progress: `[&>div]:bg-${activeThemeColor}-500`, // Target shadcn progress indicator
        icon: `text-${activeThemeColor}-600`, // For main icons
        statIconBgFrom: `from-${activeThemeColor}-100`, // Stat icon gradient start
        statIconBgTo: `to-${activeThemeColor}-200`, // Stat icon gradient end
        statIconText: `text-${activeThemeColor}-600`, // Stat icon color
        chartCursor: `stroke-${activeThemeColor}-500`, // Recharts tooltip cursor
        pinButtonBg: `bg-${activeThemeColor}-600`,
        pinButtonBgHover: `hover:bg-${activeThemeColor}-700`,
        // Note: liveLineStroke and liveAreaFill are now primarily used via CSS variables for reliability
        // Keeping them here might be useful for other elements if needed.
        liveLineStrokeClass: `stroke-${activeThemeColor}-500`,
        liveAreaFillClass: `fill-${activeThemeColor}-500`,
    }), [activeThemeColor]);

    // Calculate the effective generation speed based on mode (preset or custom calculation)
    const effectiveSpeed = useMemo(() => {
        if (!isCustomMode && currentPresetData) {
            return currentPresetData.speed; // Use preset speed if not in custom mode
        }
        // Calculate speed based on custom parameters and factors
        const base = BASE_SPEEDS[hardware] || BASE_SPEEDS['gpu_mid'];
        const modelFactor = FACTORS.modelSize(modelSize);
        const quantFactor = FACTORS.quantization[quantization];
        // Batch factor is not directly used in this simplified speed calculation
        // const batchFactor = FACTORS.batchSize(batchSize);
        const seqLenFactor = FACTORS.sequenceLength(sequenceLength);
        const parallelFactor = FACTORS.parallelism[parallelism];
        const kvCacheFactor = FACTORS.kvCache(useKvCache);
        const networkFactor = FACTORS.networkLatency(networkLatency); // Latency affects TTFT more than rate here
        const utilizationFactor = FACTORS.hardwareUtilization(hardwareUtilization);

        // Combine factors (multiplicative)
        const speed = base * modelFactor * quantFactor * seqLenFactor * parallelFactor * kvCacheFactor * networkFactor * utilizationFactor;
        return Math.max(0.1, speed); // Ensure speed is at least slightly positive
    }, [isCustomMode, currentPresetData, modelSize, hardware, quantization, /*batchSize,*/ sequenceLength, parallelism, useKvCache, networkLatency, hardwareUtilization]);

    // Calculate the effective Time To First Token (TTFT)
    const effectiveTtfToken = useMemo(() => {
        if (!isCustomMode && currentPresetData) {
            return currentPresetData.ttfToken; // Use preset TTFT
        }
        // Estimate TTFT based on latency and prompt size (very simplified)
        // Assumes some base processing time + network + time proportional to prompt
        return 0.1 + (networkLatency / 1000) + (promptTokens / 5000); // Example calculation
    }, [isCustomMode, currentPresetData, networkLatency, promptTokens]);


    // --- Simulation Runner (for Simple Mode Auto-Run) ---
    // Calculates the full simulation results when in simple mode or relevant params change.
    const runSimulationForSimpleMode = useCallback(() => {
        if (uiMode !== 'simple') return; // Only run in simple mode

        const presetData = MODEL_PRESETS[activePresetKey];
        if (!presetData) return; // Should have a valid preset in simple mode

        // Set parameters based on the selected preset and current task inputs
        const params: SimParams = {
            speed: presetData.speed,
            promptTokens,
            completionTokens,
            concurrency,
            ttfToken: presetData.ttfToken,
            streaming, // Streaming doesn't affect the final result data, but included for consistency
        };

        const results: Tick[] = [];
        // Run the simulation generator to completion
        for (const tick of simulate(params)) {
            results.push(tick);
        }
        // Update the state with the full set of results
        setSimulationResults(results);
    }, [uiMode, activePresetKey, promptTokens, completionTokens, concurrency, streaming]); // Dependencies

    // --- Auto-run simulation effect for Simple mode ---
    // Triggers the simulation calculation whenever simple mode is active and dependencies change.
    useEffect(() => {
        if (uiMode === 'simple') {
            runSimulationForSimpleMode();
        } else {
            // Clear simple mode results when switching to advanced
            setSimulationResults([]);
        }
    }, [uiMode, runSimulationForSimpleMode]); // Dependencies: uiMode and the calculation function itself

    // --- Simulation Effect (for Advanced Mode Visualization) ---
    // Handles the live simulation updates when 'isVisualizing' is true in advanced mode.
    useEffect(() => {
        // Cleanup function: Clears intervals and timeouts when effect stops or dependencies change.
        const cleanup = () => {
            if (simLoopRef.current) clearInterval(simLoopRef.current);
            if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
            if (secondIntervalRef.current) clearInterval(secondIntervalRef.current);
            simLoopRef.current = null;
            flashTimeoutRef.current = null;
            secondIntervalRef.current = null;
            setTokenFlash(false); // Ensure flash is off on cleanup
        };

        // Run simulation only if in advanced mode and visualization is active.
        if (isVisualizing && uiMode === 'advanced') {
            // Reset visualization state before starting
            setVisualizedText("");
            setTokenCount(0);
            setTokensThisSecond(0);
            setChartData([]); // Clear previous chart data
            textIndexRef.current = 0; // Reset text generator index
            previousTickTokensRef.current = 0; // Reset previous token count

            // Get parameters for the simulation (uses effective values for custom mode)
            const simParams: SimParams = {
                speed: effectiveSpeed,
                promptTokens,
                completionTokens,
                concurrency,
                ttfToken: effectiveTtfToken,
                streaming,
            };

            const simulatorInstance = simulate(simParams); // Create generator instance

            // Interval to reset the 'tokens per second' counter
            setTokensThisSecond(0); // Initial reset
            secondIntervalRef.current = setInterval(() => setTokensThisSecond(0), 1000);

            // Main simulation loop interval
            simLoopRef.current = setInterval(() => {
                const { value: tickData, done } = simulatorInstance.next(); // Get next simulation step

                if (tickData) {
                    const currentTotalTokens = tickData.tokensGenerated;
                    // Calculate newly generated tokens since the last tick (integer value)
                    const newlyGeneratedInt = Math.floor(currentTotalTokens) - Math.floor(previousTickTokensRef.current);

                    // Update chart data with the new tick
                    setChartData(prevData => [...prevData, tickData]);

                    // Update text output and indicators if new tokens were generated
                    if (newlyGeneratedInt > 0) {
                        // Append new characters to the visualized text
                        setVisualizedText(prev => {
                            let newText = prev;
                            for (let i = 0; i < newlyGeneratedInt; i++) {
                                newText += LOREM_IPSUM[textIndexRef.current % LOREM_IPSUM.length];
                                textIndexRef.current += 1;
                            }
                            // Keep text area content manageable (last 1000 chars)
                            return newText.length > 1000 ? newText.slice(-1000) : newText;
                        });

                        // Auto-scroll text area to the bottom
                        if (visualizationAreaRef.current) {
                            visualizationAreaRef.current.scrollTop = visualizationAreaRef.current.scrollHeight;
                        }

                        // Update token counters
                        setTokenCount(Math.floor(currentTotalTokens));
                        setTokensThisSecond(prev => prev + newlyGeneratedInt);

                        // Trigger token flash indicator
                        setTokenFlash(true);
                        if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current); // Clear previous timeout
                        flashTimeoutRef.current = setTimeout(() => setTokenFlash(false), FLASH_DURATION_MS);
                    }
                    // Store current token count for the next tick's delta calculation
                    previousTickTokensRef.current = currentTotalTokens;
                }

                // If simulation is done, clean up intervals/timeouts and stop visualizing
                if (done) {
                    cleanup();
                    setIsVisualizing(false);
                }
            }, SIMULATION_INTERVAL_MS); // Run at the defined interval

        } else {
            // If not visualizing or not in advanced mode, reset visualization state.
            setTokenCount(0);
            setTokensThisSecond(0);
            setChartData([]);
            setVisualizedText("");
        }

        // Return the cleanup function to be executed on unmount or dependency change.
        return cleanup;
    }, [isVisualizing, uiMode, effectiveSpeed, effectiveTtfToken, promptTokens, completionTokens, concurrency, streaming]); // Dependencies

    // --- Calculations for Stats ---
    // Calculates total time, throughput, and cost from simulation results.
    const calculateStats = useCallback((results: Tick[], presetKeyForCost: string, pTokens: number, cTokens: number) => {
        if (results.length === 0) {
            return { totalTime: 0, throughput: 0, cost: 0 }; // Return zeros if no results
        }

        // Total time is the timestamp of the last tick
        const totalTime = results[results.length - 1].t;
        // Throughput calculation
        const throughput = totalTime > 0 ? (pTokens + cTokens) / totalTime : 0;

        // Cost calculation (only if a valid preset is used)
        let cost = 0;
        const presetData = MODEL_PRESETS[presetKeyForCost];
        if (presetData) {
            const inCost = (pTokens / 1_000_000) * presetData.priceIn; // Cost for prompt tokens
            const outCost = (cTokens / 1_000_000) * presetData.priceOut; // Cost for completion tokens
            cost = inCost + outCost;
        }

        return { totalTime, throughput, cost };
    }, []); // No dependencies, it's a pure function based on inputs

    // --- Event Handlers ---

    // Toggle between Simple and Advanced UI modes
    const handleUiModeChange = useCallback((checked: boolean) => {
        const newMode = checked ? 'advanced' : 'simple';
        setUiMode(newMode);
        setIsVisualizing(false); // Stop visualization when changing modes
        // If switching to simple and 'Custom' was selected, revert to a default preset
        if (newMode === 'simple' && selectedPreset === CUSTOM_PRESET_KEY) {
            setSelectedPreset("GPT-4o");
        }
    }, [selectedPreset]); // Depends on selectedPreset to handle the custom fallback

    // Handle changes in the model preset dropdown
    const handlePresetChange = useCallback((value: string) => {
        // Prevent selecting 'Custom' directly in simple mode (should only be possible in advanced)
        if (uiMode === 'simple' && value === CUSTOM_PRESET_KEY) return;
        setSelectedPreset(value);
        setIsVisualizing(false); // Stop visualization if preset changes
    }, [uiMode]); // Depends on uiMode

    // Generic handler for slider value changes
    const handleSliderChange = useCallback((value: number[], setter: React.Dispatch<React.SetStateAction<number>>) => {
        setter(value[0]); // Sliders typically return an array, take the first element
    }, []);

    // Generic handler for select (dropdown) value changes
    const handleSelectChange = useCallback((value: string, setter: React.Dispatch<React.SetStateAction<any>>) => {
        setter(value);
    }, []);

    // Generic handler for checkbox changes
    const handleCheckedChange = useCallback((checked: boolean | 'indeterminate', setter: React.Dispatch<React.SetStateAction<boolean>>) => {
        if (typeof checked === 'boolean') { // Handle boolean state
            setter(checked);
        }
        // Ignore 'indeterminate' state if the checkbox supports it
    }, []);

    // Generic handler for switch changes
    const handleSwitchChange = useCallback((checked: boolean, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
        setter(checked);
    }, []);

    // Generic handler for number input changes with validation
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<number>>, min = 0, max = 1000000) => {
        let value = parseInt(e.target.value, 10);
        if (isNaN(value)) {
            value = min; // Default to min if input is not a number
        }
        // Clamp value within min/max bounds
        value = Math.max(min, Math.min(max, value));
        setter(value);
    }, []);

    // Toggle the advanced mode visualization on/off
    const toggleVisualization = useCallback(() => {
        setIsVisualizing((prev) => !prev); // Flip the boolean state
    }, []);

    // --- Pinning Logic ---
    // Saves the current simulation run (parameters, results, stats) for comparison.
    const handlePinRun = useCallback(() => {
        // Limit the number of pinned runs
        if (comparisonRuns.length >= MAX_COMPARISON_RUNS) {
            alert(`Maximum of ${MAX_COMPARISON_RUNS} comparison runs reached.`);
            return;
        }

        // Determine which results to pin based on the current UI mode
        const resultsToPin = uiMode === 'simple' ? simulationResults : chartData;
        if (resultsToPin.length === 0) {
            alert("No simulation data available to pin.");
            return;
        }

        // Capture the parameters used for this run
        const currentParams: SimParams = {
            speed: effectiveSpeed, // Use calculated/preset speed
            promptTokens,
            completionTokens,
            concurrency,
            ttfToken: effectiveTtfToken, // Use calculated/preset TTFT
            streaming,
        };

        // Calculate stats for the run to be pinned
        const currentStats = calculateStats(resultsToPin, activePresetKey, promptTokens, completionTokens);

        // Create a descriptive name for the pinned run
        const runName = isCustomMode
            ? `Custom (S:${effectiveSpeed.toFixed(0)} P:${promptTokens} C:${completionTokens} N:${concurrency})`
            : `${activePresetKey} (P:${promptTokens} C:${completionTokens} N:${concurrency})`;

        // Create the new comparison run object
        const newRun: ComparisonRun = {
            id: Date.now().toString(), // Simple unique ID based on timestamp
            name: runName,
            params: currentParams,
            results: resultsToPin,
            stats: currentStats,
            // Assign a color from the palette for the chart line/area
            color: COMPARISON_CHART_COLORS[comparisonRuns.length % COMPARISON_CHART_COLORS.length],
            themeColor: activeThemeColor, // Store the theme color active at the time of pinning
            presetKey: activePresetKey, // Store which preset (or 'custom') was used
        };

        // Add the new run to the comparison state
        setComparisonRuns(prev => [...prev, newRun]);
    }, [
        comparisonRuns, uiMode, simulationResults, chartData, // Data sources
        effectiveSpeed, promptTokens, completionTokens, concurrency, effectiveTtfToken, streaming, // Parameters
        activePresetKey, isCustomMode, calculateStats, activeThemeColor // Context and helpers
    ]); // Dependencies

    // Remove a specific pinned run by its ID
    const handleRemoveRun = useCallback((idToRemove: string) => {
        setComparisonRuns(prev => prev.filter(run => run.id !== idToRemove));
    }, []);

    // --- Calculations for Simple Mode Stats Display ---
    // Calculates stats specifically for the simple mode display area.
    const simpleModeStats = useMemo(() => {
        if (uiMode === 'simple') {
            // Calculate stats based on the pre-computed simple mode results
            return calculateStats(simulationResults, activePresetKey, promptTokens, completionTokens);
        }
        // Return zero stats if not in simple mode
        return { totalTime: 0, throughput: 0, cost: 0 };
    }, [uiMode, simulationResults, activePresetKey, promptTokens, completionTokens, calculateStats]); // Dependencies

    // Progress bar percentage for Advanced mode (rate this second vs max expected)
    const progressPercentage = useMemo(() => {
        if (uiMode !== 'advanced' || !isVisualizing) return 0; // Only relevant during advanced visualization

        // Calculate the target rate based on effective speed and concurrency
        const targetRate = effectiveSpeed * concurrency;
        // Avoid division by zero if target rate is somehow zero
        return targetRate > 0
            ? Math.min(100, (tokensThisSecond / targetRate) * 100) // Calculate percentage, capped at 100
            : 0;
    }, [uiMode, isVisualizing, tokensThisSecond, effectiveSpeed, concurrency]); // Dependencies

    // Determine which data to display in the chart based on UI mode
    const chartDisplayData = uiMode === 'simple' ? simulationResults : chartData;

    // Determine if the "Pin Run" button should be enabled
    const showPinButton = (uiMode === 'simple' && simulationResults.length > 0) || (uiMode === 'advanced' && chartData.length > 0);

    // --- Chart Axis Calculations ---
    // Combine current data and pinned runs to determine axis limits
    const allChartRuns = useMemo(() => [
        ...comparisonRuns,
        // Include the currently displayed data (simple results or live advanced data)
        { id: 'current', name: 'Current', results: chartDisplayData, color: 'var(--theme-color-500)', themeColor: activeThemeColor, presetKey: activePresetKey, params: {} as SimParams, stats: { totalTime: 0, throughput: 0, cost: 0 } } // Mock structure for current data
    ], [comparisonRuns, chartDisplayData, activeThemeColor, activePresetKey]);

    // Calculate the maximum time value across all runs for the X-axis domain
    const maxTime = useMemo(() => {
        const maxT = Math.max(
            0.1, // Ensure minimum domain value
            ...allChartRuns.flatMap(run => run.results.map(tick => tick.t)) // Get max time from all ticks
        );
        return Math.ceil(maxT * 1.1); // Add a little padding
    }, [allChartRuns]);

    // Calculate the maximum token value across all runs for the Y-axis domain
    const maxTokens = useMemo(() => {
        const maxT = Math.max(
            completionTokens, // Ensure domain covers the target completion tokens
            ...allChartRuns.flatMap(run => run.results.map(tick => tick.tokensGenerated)) // Get max tokens from all ticks
        );
        return Math.ceil(maxT * 1.05); // Add a little padding
    }, [allChartRuns, completionTokens]);


    // --- Rendering ---
    return (
        <TooltipProvider>
            {/* Main Card Container with dynamic border color and background gradient */}
            <Card className={`w-full max-w-6xl mx-auto shadow-2xl border ${themeClasses.borderSoft} rounded-2xl overflow-hidden bg-gradient-to-br from-${activeThemeColor}-50/30 via-white to-white/60 backdrop-blur-xl transition-colors duration-500`}>
                {/* Card Header */}
                <CardHeader className={`border-b ${themeClasses.borderSoft} pb-4 px-6 pt-5 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gradient-to-r from-slate-100/50 via-white/30 to-${activeThemeColor}-100/30 transition-colors duration-500`}>
                    {/* Title and Description */}
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
                    <div className="flex items-center space-x-1 p-1 bg-slate-200/70 rounded-full border border-slate-300/50 shadow-inner mt-3 sm:mt-0">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => handleUiModeChange(false)} className={`rounded-full px-3 py-1 h-8 text-xs ${uiMode === 'simple' ? `bg-white shadow ${themeClasses.text} font-semibold` : `text-slate-600 hover:bg-slate-100/70`}`}>
                                    <Eye className="h-4 w-4 mr-1.5" /> Simple
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Switch to Simple View</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => handleUiModeChange(true)} className={`rounded-full px-3 py-1 h-8 text-xs ${uiMode === 'advanced' ? `bg-white shadow ${themeClasses.text} font-semibold` : `text-slate-600 hover:bg-slate-100/70`}`}>
                                    <Code className="h-4 w-4 mr-1.5" /> Advanced
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Switch to Advanced View</TooltipContent>
                        </Tooltip>
                    </div>
                </CardHeader>

                {/* Card Content */}
                <CardContent className="p-6 md:p-8 space-y-10">

                    {/* --- Shared Inputs (Visible in both modes) --- */}
                    <section className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6 items-start">
                        {/* Preset Selector */}
                        <div className="space-y-2.5">
                            <Label htmlFor="modelPreset" className={`flex items-center text-base font-semibold ${themeClasses.text}`}>
                                <BrainCircuit className="mr-2 h-5 w-5" /> Select Model
                            </Label>
                            <Select value={activePresetKey} onValueChange={handlePresetChange}>
                                <SelectTrigger id="modelPreset" className={`w-full text-sm h-10 rounded-lg shadow-sm border-slate-300 focus:border-${activeThemeColor}-500 focus:ring-${activeThemeColor}-500 bg-white transition-colors duration-500`}>
                                    <SelectValue placeholder="Select a model..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* Map over grouped models */}
                                    {Object.entries(groupedModels).map(([company, models]) => (
                                        <SelectGroup key={company}>
                                            {/* Company Label with dynamic color */}
                                            <SelectLabel className={`flex items-center text-${MODEL_PRESETS[models[0].key]?.themeColor || DEFAULT_THEME_COLOR}-600`}>
                                                <Building size={14} className="mr-1.5" />{company}
                                            </SelectLabel>
                                            {/* Model Items */}
                                            {models.map(model => (
                                                <SelectItem key={model.key} value={model.key} className="text-sm">{model.name}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    ))}
                                    {/* Custom Option (only in Advanced mode) */}
                                    {uiMode === 'advanced' && (
                                        <SelectGroup>
                                            <SelectLabel>Manual</SelectLabel>
                                            <SelectItem value={CUSTOM_PRESET_KEY} className="text-sm">
                                                <span className="flex items-center"><Settings className="mr-2 h-4 w-4" /> Custom Settings</span>
                                            </SelectItem>
                                        </SelectGroup>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Simulation Task Inputs Card */}
                        <Card className={`p-4 border-${activeThemeColor}-200/50 bg-gradient-to-br from-slate-50/60 to-${activeThemeColor}-50/40 rounded-lg shadow-sm transition-colors duration-500`}>
                            <Label className="flex items-center text-base font-semibold text-slate-700 mb-3">
                                <BarChartHorizontalBig className="mr-2 h-5 w-5 text-slate-600" /> Simulation Task
                            </Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-4 items-end">
                                {/* Prompt Tokens Input */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="promptTokens" className="text-xs font-medium text-slate-600">Prompt Tokens</Label>
                                    <Input id="promptTokens" type="number" value={promptTokens} onChange={(e) => handleInputChange(e, setPromptTokens, 0)} className="h-9 text-sm rounded-md shadow-inner bg-white/70" />
                                </div>
                                {/* Completion Tokens Input */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="completionTokens" className="text-xs font-medium text-slate-600">Completion Tokens</Label>
                                    <Input id="completionTokens" type="number" value={completionTokens} onChange={(e) => handleInputChange(e, setCompletionTokens, 0)} className="h-9 text-sm rounded-md shadow-inner bg-white/70" />
                                </div>
                                {/* Concurrency Input */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="concurrency" className="text-xs font-medium text-slate-600">Concurrency</Label>
                                    <Input id="concurrency" type="number" value={concurrency} onChange={(e) => handleInputChange(e, setConcurrency, 1)} min={1} className="h-9 text-sm rounded-md shadow-inner bg-white/70" />
                                </div>
                                {/* Streaming Switch */}
                                <div className="flex items-center space-x-2 pb-1.5">
                                    <Switch id="streaming" checked={streaming} onCheckedChange={(c) => handleSwitchChange(c, setStreaming)} />
                                    <Label htmlFor="streaming" className="text-xs font-medium text-slate-600">Streaming</Label>
                                </div>
                            </div>
                        </Card>
                    </section>

                    <Separator className={`my-8 ${themeClasses.borderSoft} transition-colors duration-500`} />

                    {/* --- Simple Mode UI --- */}
                    {uiMode === 'simple' && (
                        <section className="space-y-8 animate-fadeIn">
                            {/* Section Header and Pin Button */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                <h2 className="text-2xl font-semibold text-slate-800 tracking-tight mb-3 sm:mb-0">Simulation Results</h2>
                                <Button onClick={handlePinRun} variant="default" size="sm" disabled={!showPinButton || comparisonRuns.length >= MAX_COMPARISON_RUNS} className={`shadow-md hover:shadow-lg transition-shadow ${themeClasses.pinButtonBg} ${themeClasses.pinButtonBgHover} text-white rounded-full px-4`}>
                                    <Pin className="mr-1.5 h-4 w-4" /> Pin Run
                                </Button>
                            </div>
                            {/* Stats Display */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                                <Stat label="Total Time" tooltip={TOOLTIPS.totalTime} icon={Timer}>{simpleModeStats.totalTime.toFixed(2)} s</Stat>
                                <Stat label="Throughput" tooltip={TOOLTIPS.throughput} icon={Zap}>{simpleModeStats.throughput.toFixed(1)} t/s</Stat>
                                <Stat label="Est. Cost" tooltip={TOOLTIPS.cost} icon={DollarSign}>${simpleModeStats.cost.toFixed(4)}</Stat>
                            </div>
                            {/* Chart Area */}
                            <div className={`h-72 md:h-[450px] w-full border ${themeClasses.borderSoft} rounded-xl p-4 bg-gradient-to-br from-slate-50/50 to-${activeThemeColor}-50/30 shadow-inner overflow-hidden transition-colors duration-500`}>
                                <Label className="flex items-center justify-center text-sm font-medium text-slate-700 mb-3">Completion Progress</Label>
                                <ResponsiveContainer width="100%" height="calc(100% - 28px)">
                                    <AreaChart data={simulationResults} margin={{ top: 5, right: 30, left: 10, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="t" type="number" label={{ value: 'Time (s)', position: 'insideBottom', dy: 15 }} stroke="#64748b" tickFormatter={(tick) => tick.toFixed(1)} domain={[0, maxTime]} allowDataOverflow tick={{ fontSize: 11 }} />
                                        <YAxis label={{ value: 'Tokens', angle: -90, position: 'insideLeft', dx: -5 }} stroke="#64748b" domain={[0, maxTokens]} allowDataOverflow tick={{ fontSize: 11 }} />
                                        <RechartsTooltip
                                            wrapperClassName="!text-xs !rounded-md !shadow-lg !border-slate-200 !bg-white/80 !backdrop-blur-sm"
                                            contentStyle={{ fontSize: '12px', padding: '6px 10px', borderRadius: '6px' }}
                                            formatter={(value: number, name, props) => [`${Math.round(value)} tokens`, props.payload?.runName || "Current Run"]} // Use optional chaining
                                            labelFormatter={(label: number) => `Time: ${label.toFixed(2)}s`}
                                            cursor={{ stroke: `var(--theme-color-500, ${COMPARISON_CHART_COLORS[0]})`, strokeWidth: 1, strokeDasharray: '3 3' }} // Use CSS var for cursor
                                        />
                                        {/* Define gradients for area fills */}
                                        <defs>
                                            {/* Gradients for pinned comparison runs */}
                                            {comparisonRuns.map((run) => (
                                                <linearGradient key={run.id} id={`color-${run.id}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={run.color} stopOpacity={0.7} />
                                                    <stop offset="95%" stopColor={run.color} stopOpacity={0.1} />
                                                </linearGradient>
                                            ))}
                                            {/* Gradient for the current run (using CSS variable) */}
                                            <linearGradient id="color-current-simple" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--theme-color-500, #a78bfa)" stopOpacity={0.5} />
                                                <stop offset="95%" stopColor="var(--theme-color-500, #a78bfa)" stopOpacity={0.05} />
                                            </linearGradient>
                                        </defs>
                                        {/* Render areas for pinned runs */}
                                        {comparisonRuns.map(run => (
                                            <Area key={run.id} type="monotone" dataKey="tokensGenerated" data={run.results} name={run.name} stroke={run.color} strokeWidth={2.5} fillOpacity={1} fill={`url(#color-${run.id})`} dot={false} isAnimationActive={false} payload={{ runName: run.name }} />
                                        ))}
                                        {/* Render area for the current run */}
                                        {/* FIX: Added stroke prop using CSS variable */}
                                        <Area
                                            type="monotone"
                                            dataKey="tokensGenerated"
                                            data={simulationResults}
                                            name={`Current: ${activePresetKey}`}
                                            stroke="var(--theme-color-500, #a78bfa)" // Use CSS variable for stroke
                                            strokeWidth={1.5}
                                            strokeDasharray="4 4"
                                            fillOpacity={1}
                                            fill="url(#color-current-simple)" // Use the defined gradient
                                            dot={false}
                                            isAnimationActive={false}
                                            payload={{ runName: `Current: ${activePresetKey}` }}
                                        />
                                        <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </section>
                    )}

                    {/* --- Advanced Mode UI --- */}
                    {uiMode === 'advanced' && (
                        <section className="space-y-8 animate-fadeIn">
                            {/* Custom Input Parameters Grid */}
                            <fieldset disabled={!isCustomMode} className={`transition-opacity duration-300 ${isCustomMode ? 'opacity-100' : 'opacity-60 pointer-events-none'} border ${themeClasses.borderSoft} rounded-xl p-6 bg-gradient-to-br from-slate-50/60 to-${activeThemeColor}-50/40 shadow-sm transition-colors duration-500`}>
                                <legend className={`text-lg font-semibold ${themeClasses.text} mb-4 px-2 -ml-2 transition-colors duration-500`}>
                                    {isCustomMode ? 'Tune Custom Parameters' : 'Parameters (Preset Active)'}
                                </legend>
                                {/* Message shown when a preset is active */}
                                {!isCustomMode && (
                                    <p className="text-xs text-center text-amber-700 bg-amber-50 p-2 rounded-md border border-amber-200 mb-4 -mt-2">
                                        Manual parameters disabled. Using '{activePresetKey}' preset values for speed and TTFT.
                                    </p>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                                    {/* --- Column 1 --- */}
                                    <div className="space-y-6">
                                        {/* Model Size Slider */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="modelSize" className="text-sm font-medium text-slate-600">Model Size (B)</Label>
                                            <div className="flex items-center space-x-3">
                                                <Slider id="modelSize" value={[modelSize]} onValueChange={(v) => handleSliderChange(v, setModelSize)} min={1} max={180} step={1} />
                                                <span className={`text-sm w-12 text-right font-medium ${themeClasses.text}`}>{modelSize}B</span>
                                            </div>
                                        </div>
                                        {/* Quantization Select */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="quantization" className="text-sm font-medium text-slate-600">Quantization</Label>
                                            <Select value={quantization} onValueChange={(v) => handleSelectChange(v, setQuantization)}>
                                                <SelectTrigger id="quantization" className="text-sm h-9 rounded-md"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    <SelectItem value="8bit">8-bit</SelectItem>
                                                    <SelectItem value="4bit">4-bit</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    {/* --- Column 2 --- */}
                                    <div className="space-y-6">
                                        {/* Hardware Select */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="hardware" className="text-sm font-medium text-slate-600">Hardware</Label>
                                            <Select value={hardware} onValueChange={(v) => handleSelectChange(v, setHardware)}>
                                                <SelectTrigger id="hardware" className="text-sm h-9 rounded-md"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="cpu">CPU</SelectItem>
                                                    <SelectItem value="gpu_low">GPU (Low)</SelectItem>
                                                    <SelectItem value="gpu_mid">GPU (Mid)</SelectItem>
                                                    <SelectItem value="gpu_high">GPU (High)</SelectItem>
                                                    <SelectItem value="tpu_v4">TPU v4</SelectItem>
                                                    <SelectItem value="tpu_v5">TPU v5</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {/* Parallelism Select */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="parallelism" className="text-sm font-medium text-slate-600">Parallelism</Label>
                                            <Select value={parallelism} onValueChange={(v) => handleSelectChange(v, setParallelism)}>
                                                <SelectTrigger id="parallelism" className="text-sm h-9 rounded-md"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    <SelectItem value="tensor">Tensor</SelectItem>
                                                    <SelectItem value="pipeline">Pipeline</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    {/* --- Column 3 --- */}
                                    <div className="space-y-6">
                                        {/* Batch Size Slider */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="batchSize" className="text-sm font-medium text-slate-600">Batch Size</Label>
                                            <div className="flex items-center space-x-3">
                                                <Slider id="batchSize" value={[batchSize]} onValueChange={(v) => handleSliderChange(v, setBatchSize)} min={1} max={64} step={1} />
                                                <span className={`text-sm w-10 text-right font-medium ${themeClasses.text}`}>{batchSize}</span>
                                            </div>
                                        </div>
                                        {/* Network Latency Slider */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="networkLatency" className="text-sm font-medium text-slate-600">Network Latency (ms)</Label>
                                            <div className="flex items-center space-x-3">
                                                <Slider id="networkLatency" value={[networkLatency]} onValueChange={(v) => handleSliderChange(v, setNetworkLatency)} min={0} max={500} step={5} />
                                                <span className={`text-sm w-12 text-right font-medium ${themeClasses.text}`}>{networkLatency}ms</span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* --- Row 2 (Spans across columns) --- */}
                                    <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 items-center pt-4">
                                        {/* Sequence Length Slider */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="sequenceLength" className="text-sm font-medium text-slate-600">Sequence Length</Label>
                                            <div className="flex items-center space-x-3">
                                                <Slider id="sequenceLength" value={[sequenceLength]} onValueChange={(v) => handleSliderChange(v, setSequenceLength)} min={128} max={8192} step={128} />
                                                <span className={`text-sm w-16 text-right font-medium ${themeClasses.text}`}>{sequenceLength}</span>
                                            </div>
                                        </div>
                                        {/* Hardware Utilization Slider */}
                                        <div className="space-y-1.5">
                                            <Label htmlFor="hardwareUtilization" className="text-sm font-medium text-slate-600">HW Utilization (%)</Label>
                                            <div className="flex items-center space-x-3">
                                                <Slider id="hardwareUtilization" value={[hardwareUtilization]} onValueChange={(v) => handleSliderChange(v, setHardwareUtilization)} min={10} max={100} step={5} />
                                                <span className={`text-sm w-10 text-right font-medium ${themeClasses.text}`}>{hardwareUtilization}%</span>
                                            </div>
                                        </div>
                                        {/* KV Cache Checkbox */}
                                        <div className="flex items-center space-x-2 pt-5 justify-center md:justify-start">
                                            <Checkbox id="kvCache" checked={useKvCache} onCheckedChange={(c) => handleCheckedChange(c, setUseKvCache)} />
                                            <Label htmlFor="kvCache" className="text-sm font-medium text-slate-600">Use KV Cache</Label>
                                        </div>
                                    </div>
                                </div>
                            </fieldset>

                            <Separator className={`my-8 ${themeClasses.borderSoft} transition-colors duration-500`} />

                            {/* Advanced Estimated Performance Section */}
                            <div className="mt-4 pt-4">
                                <h3 className="text-xl font-semibold text-center mb-4 text-slate-800">
                                    {isCustomMode ? 'Estimated Performance (Custom)' : `Performance & Pricing (${activePresetKey})`}
                                </h3>
                                {/* Stats Display for Advanced Mode */}
                                <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 bg-gradient-to-r from-${activeThemeColor}-100/50 via-white to-purple-100/50 p-6 rounded-xl shadow-inner mb-6 transition-colors duration-500`}>
                                    <Stat label="Gen Speed" tooltip={TOOLTIPS.genSpeed} icon={Zap}>{effectiveSpeed.toFixed(1)} t/s</Stat>
                                    <Stat label="TTF Token" tooltip={TOOLTIPS.ttfToken} icon={Clock}>
                                        {/* Display effective TTFT, add '(Est.)' if custom */}
                                        <span className={isCustomMode ? 'text-slate-500' : ''}>
                                            {effectiveTtfToken.toFixed(2)}s {isCustomMode ? '(Est.)' : ''}
                                        </span>
                                    </Stat>
                                    <Stat label="Pricing ($/1M)" tooltip={TOOLTIPS.pricing} icon={DollarSign}>
                                        {/* Display pricing only if a preset is active */}
                                        <span className={isCustomMode ? 'text-slate-500 italic' : ''}>
                                            {isCustomMode ? 'N/A (Custom)' : (
                                                <>
                                                    <span className="text-emerald-600">${(currentPresetData?.priceIn ?? 0).toFixed(2)}</span> In / <span className="text-rose-600">${(currentPresetData?.priceOut ?? 0).toFixed(2)}</span> Out
                                                </>
                                            )}
                                        </span>
                                    </Stat>
                                </div>
                            </div>

                            {/* Advanced Visualization Section */}
                            <div className="mt-6 pt-6 border-t border-dashed border-slate-300">
                                {/* Section Header and Pin Button */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                                    <h3 className="text-xl font-semibold text-slate-800 mb-3 sm:mb-0">Live Visualization</h3>
                                    <Button onClick={handlePinRun} variant="outline" size="sm" disabled={!showPinButton || comparisonRuns.length >= MAX_COMPARISON_RUNS} className={`shadow-sm hover:shadow-md transition-shadow bg-white border-slate-300 hover:bg-slate-50 text-slate-700 rounded-full px-4`}>
                                        <Pin className={`mr-1.5 h-4 w-4 ${themeClasses.icon}`} /> Pin Run
                                    </Button>
                                </div>
                                {/* Start/Stop Simulation Button */}
                                <div className="flex justify-center mb-6">
                                    <Button onClick={toggleVisualization} variant={isVisualizing ? "destructive" : "default"} className={`w-48 shadow-md hover:shadow-lg transition-shadow rounded-full text-base py-2.5 ${isVisualizing ? 'bg-red-500 hover:bg-red-600' : `${themeClasses.bg} ${themeClasses.bgHover}`}`}>
                                        {isVisualizing ? <Square className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                                        {isVisualizing ? 'Stop Simulation' : 'Start Simulation'}
                                    </Button>
                                </div>

                                {/* Live Chart */}
                                <div className={`mb-8 h-72 md:h-[450px] w-full border ${themeClasses.borderSoft} rounded-xl p-4 bg-gradient-to-br from-slate-50/50 to-${activeThemeColor}-50/30 shadow-inner overflow-hidden transition-colors duration-500`}>
                                    <Label className="flex items-center justify-center text-sm font-medium text-slate-700 mb-3">Live Completion Progress</Label>
                                    <ResponsiveContainer width="100%" height="calc(100% - 28px)">
                                        {/* Using LineChart for advanced mode */}
                                        <LineChart margin={{ top: 5, right: 30, left: 10, bottom: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="t" type="number" label={{ value: 'Time (s)', position: 'insideBottom', dy: 15 }} stroke="#64748b" tickFormatter={(tick) => tick.toFixed(1)} domain={[0, maxTime]} allowDataOverflow tick={{ fontSize: 11 }} />
                                            <YAxis label={{ value: 'Tokens', angle: -90, position: 'insideLeft', dx: -5 }} stroke="#64748b" domain={[0, maxTokens]} allowDataOverflow tick={{ fontSize: 11 }} />
                                            <RechartsTooltip
                                                wrapperClassName="!text-xs !rounded-md !shadow-lg !border-slate-200 !bg-white/80 !backdrop-blur-sm"
                                                contentStyle={{ fontSize: '12px', padding: '6px 10px', borderRadius: '6px' }}
                                                formatter={(value: number, name, props) => [`${Math.round(value)} tokens`, props.payload?.runName || "Current Run"]} // Use optional chaining
                                                labelFormatter={(label: number) => `Time: ${label.toFixed(2)}s`}
                                                cursor={{ stroke: `var(--theme-color-500, ${COMPARISON_CHART_COLORS[0]})`, strokeWidth: 1, strokeDasharray: '3 3' }} // Use CSS var for cursor
                                            />
                                            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }} />
                                            {/* Render lines for pinned runs */}
                                            {comparisonRuns.map(run => (
                                                <Line key={run.id} type="monotone" dataKey="tokensGenerated" data={run.results} name={run.name} stroke={run.color} strokeWidth={2.5} dot={false} isAnimationActive={false} payload={{ runName: run.name }} />
                                            ))}
                                            {/* Render line for the live simulation */}
                                            {/* FIX: Added stroke prop using CSS variable */}
                                            {isVisualizing && (
                                                <Line
                                                    type="monotone"
                                                    dataKey="tokensGenerated"
                                                    data={chartData} // Live data source
                                                    name={`Live: ${isCustomMode ? 'Custom' : activePresetKey}`}
                                                    stroke="var(--theme-color-500, #a78bfa)" // Use CSS variable for stroke
                                                    strokeWidth={2}
                                                    strokeDasharray="4 4"
                                                    dot={false}
                                                    isAnimationActive={false} // Disable animation for live updates
                                                    payload={{ runName: `Live: ${isCustomMode ? 'Custom' : activePresetKey}` }}
                                                />
                                            )}
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Other Live Indicators */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                    {/* Terminal-like text output */}
                                    <div className="space-y-2">
                                        <Label htmlFor="liveOutputArea" className="text-sm font-medium flex items-center text-slate-600">
                                            <Code className="mr-2 h-4 w-4 text-slate-500" />Live Output Stream
                                        </Label>
                                        <textarea
                                            id="liveOutputArea"
                                            ref={visualizationAreaRef}
                                            readOnly
                                            value={visualizedText}
                                            placeholder="$ Simulation output appears here when running..."
                                            className={`w-full h-36 p-4 border rounded-lg bg-slate-900 text-slate-200 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-${activeThemeColor}-500/50 shadow-inner scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800 transition-colors duration-500`}
                                        />
                                    </div>
                                    {/* Right side indicators card */}
                                    <div className={`space-y-5 pt-2 border ${themeClasses.borderSoft} rounded-lg p-4 bg-gradient-to-br from-slate-50/60 to-${activeThemeColor}-50/40 shadow-sm transition-colors duration-500`}>
                                        {/* Token Flash Indicator */}
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-medium flex items-center text-slate-600"><Activity className="mr-2 h-4 w-4 text-slate-500" />Token Indicator</Label>
                                            <div className="flex items-center space-x-2">
                                                <div className={`h-4 w-4 rounded-full transition-colors shadow-inner ${tokenFlash ? `${themeClasses.bg} animate-pulse` : 'bg-slate-300'}`}></div>
                                                <span className="text-xs text-slate-500">Flashes/token</span>
                                            </div>
                                        </div>
                                        <Separator className="border-slate-200/80" />
                                        {/* Tokens Generated Counter */}
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-medium flex items-center text-slate-600"><Hash className="mr-2 h-4 w-4 text-slate-500" />Tokens Generated</Label>
                                            <div className="flex items-baseline space-x-1">
                                                <span className={`text-lg font-semibold ${themeClasses.text}`}>{tokenCount}</span>
                                                <span className="text-sm text-slate-500">/ {completionTokens}</span>
                                            </div>
                                        </div>
                                        <Separator className="border-slate-200/80" />
                                        {/* Rate This Second Indicator */}
                                        <div className="space-y-1.5">
                                            <Label className="text-sm font-medium flex items-center text-slate-600"><Gauge className="mr-2 h-4 w-4 text-slate-500" />Rate This Second</Label>
                                            <div className="flex items-center space-x-3">
                                                <Progress value={isVisualizing ? progressPercentage : 0} className={`w-full h-2.5 ${themeClasses.progress}`} />
                                                <span className="text-xs text-slate-600 font-medium w-28 text-right">{tokensThisSecond} / {(effectiveSpeed * concurrency).toFixed(0)} t/s</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* --- Pinned Runs Display (Visible if any runs are pinned) --- */}
                    {comparisonRuns.length > 0 && (
                        <div className="mt-10 pt-10 border-t border-dashed border-slate-300">
                            <h3 className="text-xl font-semibold text-center text-slate-800 mb-6 flex items-center justify-center">
                                <PinOff className="mr-2 h-5 w-5 text-slate-500" /> Pinned Comparisons ({comparisonRuns.length}/{MAX_COMPARISON_RUNS})
                            </h3>
                            {/* Grid for Pinned Run Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 justify-center">
                                {comparisonRuns.map(run => (
                                    // Card for each pinned run
                                    <Card key={run.id} className={`p-4 border border-slate-200 rounded-xl shadow-lg w-full bg-white hover:shadow-${run.themeColor}-100/50 transition-shadow duration-200 flex flex-col`} style={{ borderLeft: `5px solid ${run.color}` }}> {/* Use run's chart color for left border */}
                                        {/* Card Header: Name and Remove Button */}
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="text-sm font-semibold truncate pr-2" title={run.name} style={{ color: run.color }}>{run.name}</p>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 rounded-full hover:bg-red-100" onClick={() => handleRemoveRun(run.id)}>
                                                <X className="h-4 w-4 text-slate-400 hover:text-red-500" />
                                            </Button>
                                        </div>
                                        {/* Card Body: Stats */}
                                        <div className="text-sm space-y-1.5 text-slate-600 mt-auto pt-2 border-t border-slate-200/60">
                                            <p className="flex justify-between">Time: <span className="font-medium text-slate-900">{run.stats.totalTime.toFixed(2)}s</span></p>
                                            <p className="flex justify-between">Throughput: <span className="font-medium text-slate-900">{run.stats.throughput.toFixed(1)} t/s</span></p>
                                            {/* Show cost only if it wasn't a custom run */}
                                            {run.presetKey !== CUSTOM_PRESET_KEY && <p className="flex justify-between">Cost: <span className="font-medium text-slate-900">${run.stats.cost.toFixed(4)}</span></p>}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Disclaimer */}
                    <p className="text-xs text-slate-500 text-center mt-12 italic">
                        Disclaimer: Preset data (speed, TTFT, pricing) is indicative and based on publicly available information or estimates; always verify with official provider documentation. Custom estimations and simulations are simplified models; actual real-world performance will vary based on numerous factors not fully captured here.
                    </p>

                </CardContent>
            </Card>

            {/* Inline styles for animations and dynamic CSS variables */}
            <style>
                {`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out forwards;
                }

                /* Define root CSS variables for the theme */
                :root {
                    /* Use Tailwind's theme() function to get actual color values */
                    /* Fallbacks are provided in case the theme color isn't in Tailwind's config (e.g., during setup) */
                    --theme-color-50: theme(colors.${activeThemeColor}.50, #eff6ff);
                    --theme-color-100: theme(colors.${activeThemeColor}.100, #dbeafe);
                    --theme-color-200: theme(colors.${activeThemeColor}.200, #c7d2fe);
                    --theme-color-500: theme(colors.${activeThemeColor}.500, #6366f1);
                    --theme-color-600: theme(colors.${activeThemeColor}.600, #4f46e5);
                    --theme-color-700: theme(colors.${activeThemeColor}.700, #4338ca);
                }
                `}
            </style>

            {/* Style block to help Tailwind JIT compiler recognize dynamic classes */}
            {/* Include all possible theme colors and class types used dynamically */}
            <style>
                {`
                /* Force Tailwind JIT to recognize dynamic classes */
                /* bg */ .bg-cyan-600 {} .bg-orange-600 {} .bg-blue-600 {} .bg-sky-600 {} .bg-rose-600 {} .bg-indigo-600 {}
                /* hover:bg */ .hover:bg-cyan-700 {} .hover:bg-orange-700 {} .hover:bg-blue-700 {} .hover:bg-sky-700 {} .hover:bg-rose-700 {} .hover:bg-indigo-700 {}
                /* text */ .text-cyan-600 {} .text-orange-600 {} .text-blue-600 {} .text-sky-600 {} .text-rose-600 {} .text-indigo-600 {}
                /* hover:text */ .hover:text-cyan-700 {} .hover:text-orange-700 {} .hover:text-blue-700 {} .hover:text-sky-700 {} .hover:text-rose-700 {} .hover:text-indigo-700 {}
                /* border (strong) */ .border-cyan-500 {} .border-orange-500 {} .border-blue-500 {} .border-sky-500 {} .border-rose-500 {} .border-indigo-500 {}
                /* border (soft) */ .border-cyan-200\/60 {} .border-orange-200\/60 {} .border-blue-200\/60 {} .border-sky-200\/60 {} .border-rose-200\/60 {} .border-indigo-200\/60 {}
                /* ring */ .focus\:ring-cyan-500 {} .focus\:ring-orange-500 {} .focus\:ring-blue-500 {} .focus\:ring-sky-500 {} .focus\:ring-rose-500 {} .focus\:ring-indigo-500 {}
                /* progress */ .\[\&\>div\]\:bg-cyan-500 {} .\[\&\>div\]\:bg-orange-500 {} .\[\&\>div\]\:bg-blue-500 {} .\[\&\>div\]\:bg-sky-500 {} .\[\&\>div\]\:bg-rose-500 {} .\[\&\>div\]\:bg-indigo-500 {}
                /* stroke (used via var now, but keep for JIT safety) */ .stroke-cyan-500 {} .stroke-orange-500 {} .stroke-blue-500 {} .stroke-sky-500 {} .stroke-rose-500 {} .stroke-indigo-500 {}
                /* fill (used via var now, but keep for JIT safety) */ .fill-cyan-500 {} .fill-orange-500 {} .fill-blue-500 {} .fill-sky-500 {} .fill-rose-500 {} .fill-indigo-500 {}
                /* from (gradient) */ .from-cyan-100 {} .from-orange-100 {} .from-blue-100 {} .from-sky-100 {} .from-rose-100 {} .from-indigo-100 {}
                /* to (gradient) */ .to-cyan-200 {} .to-orange-200 {} .to-blue-200 {} .to-sky-200 {} .to-rose-200 {} .to-indigo-200 {}
                /* bg-gradient-to-br (uses -50) */ .to-cyan-50\/30 {} .to-orange-50\/30 {} .to-blue-50\/30 {} .to-sky-50\/30 {} .to-rose-50\/30 {} .to-indigo-50\/30 {} .from-cyan-50\/30 {} .from-orange-50\/30 {} .from-blue-50\/30 {} .from-sky-50\/30 {} .from-rose-50\/30 {} .from-indigo-50\/30 {}
                /* hover:shadow */ .hover\:shadow-cyan-100\/50 {} .hover\:shadow-orange-100\/50 {} .hover\:shadow-blue-100\/50 {} .hover\:shadow-sky-100\/50 {} .hover\:shadow-rose-100\/50 {} .hover\:shadow-indigo-100\/50 {}
                `}
            </style>

        </TooltipProvider>
    );
};

// Export as default for use in applications like Next.js/Vite
export default TokenSpeedSimulator;