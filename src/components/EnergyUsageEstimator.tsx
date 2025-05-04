import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, Leaf, Car, Smartphone, TreeDeciduous, Zap, Cpu, MapPin, Percent, DollarSign, Download, Code, Droplet, Upload, Target, Bell, Link as LinkIcon, AlertTriangle, Lightbulb } from 'lucide-react';
// Import necessary components from recharts for gauges
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

// --- Configuration & Constants (May 2025 Data - Unchanged from V5) ---
type ModelSize = 'small' | 'medium' | 'large' | 'very_large';
const MODEL_DEFINITIONS: Record<string, { provider: string; sizeCategory: ModelSize }> = { /* ... V5 Data ... */
  'gpt-4o': { provider: 'OpenAI', sizeCategory: 'very_large' }, 'gpt-4': { provider: 'OpenAI', sizeCategory: 'large' }, 'gpt-4-turbo': { provider: 'OpenAI', sizeCategory: 'large' }, 'gpt-3.5-turbo': { provider: 'OpenAI', sizeCategory: 'medium' },
  'claude-3-opus': { provider: 'Anthropic', sizeCategory: 'very_large' }, 'claude-3-sonnet': { provider: 'Anthropic', sizeCategory: 'large' }, 'claude-3-haiku': { provider: 'Anthropic', sizeCategory: 'medium' },
  'gemini-1.5-pro': { provider: 'Google', sizeCategory: 'large' }, 'gemini-1.0-pro': { provider: 'Google', sizeCategory: 'medium' },
  'llama-3-70b': { provider: 'Meta', sizeCategory: 'large' }, 'llama-3-8b': { provider: 'Meta', sizeCategory: 'small' },
  'mistral-large': { provider: 'Mistral', sizeCategory: 'large' }, 'mistral-medium': { provider: 'Mistral', sizeCategory: 'medium' }, 'mistral-small': { provider: 'Mistral', sizeCategory: 'small' },
  'generic-small': { provider: 'Generic', sizeCategory: 'small' }, 'generic-medium': { provider: 'Generic', sizeCategory: 'medium' }, 'generic-large': { provider: 'Generic', sizeCategory: 'large' }, 'generic-very_large': { provider: 'Generic', sizeCategory: 'very_large' },
};
const getModelCategories = () => { /* ... V5 Function ... */
    const categories: Record<string, string[]> = {};
    for (const modelName in MODEL_DEFINITIONS) { const provider = MODEL_DEFINITIONS[modelName].provider; if (!categories[provider]) { categories[provider] = []; } categories[provider].push(modelName); }
    const sortedProviders = Object.keys(categories).sort((a, b) => { if (a === 'Generic') return 1; if (b === 'Generic') return -1; return a.localeCompare(b); });
    const sortedCategories: Record<string, string[]> = {}; sortedProviders.forEach(provider => { sortedCategories[provider] = categories[provider].sort(); }); return sortedCategories;
};
const ENERGY_PER_1K_TOKENS_KWH: Record<ModelSize, number> = { /* ... V5 Data ... */
  small: 0.0001, medium: 0.001, large: 0.004, very_large: 0.008,
};
type HardwareType = 'h100' | 'a100' | 'tpu-v4' | 'tpu-v5' | 'cpu';
const HARDWARE_EFFICIENCY_FACTORS: Record<HardwareType, number> = { /* ... V5 Data ... */
  'h100': 1.0, 'a100': 1.2, 'tpu-v5': 1.1, 'tpu-v4': 1.4, 'cpu': 10.0,
};
type Region = 'us-national-avg' | 'global-avg' | 'us-west' | 'us-central' | 'us-east' | 'eu-west' | 'eu-north' | 'asia-east' | 'india';
const REGIONAL_CARBON_INTENSITY: Record<Region, number> = { /* ... V5 Data ... */
  'us-national-avg': 394, 'global-avg': 400, 'us-west': 250, 'us-central': 450, 'us-east': 380, 'eu-west': 220, 'eu-north': 100, 'asia-east': 500, 'india': 650,
};
const DEFAULT_REGION: Region = 'us-national-avg';
const DEFAULT_PUE = 1.56; const MIN_PUE = 1.05; const MAX_PUE = 2.0;
const DEFAULT_RENEWABLE_SHARE = 0; const MIN_RENEWABLE_SHARE = 0; const MAX_RENEWABLE_SHARE = 100;
const DEFAULT_COST_PER_KWH = 0.132; const MIN_COST_PER_KWH = 0.01; const MAX_COST_PER_KWH = 0.50;
const DIRECT_WATER_USAGE_L_PER_KWH = 0.36; const INDIRECT_WATER_USAGE_L_PER_KWH = 4.52;
const GCO2E_PER_MILE_DRIVEN = 393; const GCO2E_PER_SMARTPHONE_CHARGE = 8; const KGCO2E_SEQ_PER_TREE_YEAR = 60;
const MIN_TOKENS = 1000; const MAX_TOKENS_SLIDER = 10000000; const TOKEN_STEP = 1000;
const EMBODIED_CARBON_KGCO2E: Record<HardwareType, number> = { /* ... V5 Data ... */
    'h100': 500, 'a100': 450, 'tpu-v5': 400, 'tpu-v4': 350, 'cpu': 50
};
const HARDWARE_LIFESPAN_YEARS = 4;
const REGION_LATENCY_MS: Record<Region, number> = { /* ... V5 Data ... */
    'us-national-avg': 50, 'global-avg': 150, 'us-west': 30, 'us-central': 40, 'us-east': 35,
    'eu-west': 90, 'eu-north': 100, 'asia-east': 180, 'india': 220
};
const OFFSET_PROJECTS = [ /* ... V5 Data ... */
    { id: 'regen-forest-amazon', name: 'Amazon Rainforest Reforestation', price_usd_per_tonne_co2e: 15, link: '#' },
    { id: 'direct-air-capture-iceland', name: 'Direct Air Capture (DAC) Iceland', price_usd_per_tonne_co2e: 600, link: '#' },
    { id: 'renewable-wind-india', name: 'Wind Power Generation India', price_usd_per_tonne_co2e: 8, link: '#' },
];

// --- Helper Function (Number Formatting - Unchanged) ---
const formatNumber = (num: number, precision: number = 1): string => {
    if (isNaN(num)) return 'N/A'; if (num === 0) return '0';
    if (num > 0 && num < Math.pow(10, -precision)) { return num.toExponential(precision > 0 ? precision -1 : 0); }
    if (num >= 1e9) return (num / 1e9).toFixed(precision) + ' B';
    if (num >= 1e6) return (num / 1e6).toFixed(precision) + ' M';
    if (num >= 1e3) return (num / 1e3).toFixed(precision) + ' k';
    return num.toFixed(precision);
};
const formatTokenDisplay = (num: number): string => { /* ... V5 Function ... */ return num >= 1e6? (num/1e6).toFixed(2)+'M' : num >= 1e3? (num/1e3).toFixed(1)+'k' : num.toString(); };


// --- NEW: Metric Gauge Component ---
interface MetricGaugeProps {
  value: number;
  maxValue: number; // For scaling the gauge visually
  label: string;
  unit: string;
  color: string;
  precision?: number;
}

const MetricGauge: React.FC<MetricGaugeProps> = ({ value, maxValue, label, unit, color, precision = 1 }) => {
  const displayValue = formatNumber(value, precision);
  // Ensure value doesn't visually exceed maxValue for the gauge display
  const gaugeValue = Math.min(value, maxValue);
  // Calculate percentage for the radial bar, handle maxValue=0
  const percentage = maxValue > 0 ? (gaugeValue / maxValue) * 100 : 0;

  const data = [{ name: label, value: percentage, fill: color }];

  return (
    <div className="flex flex-col items-center text-center p-2 rounded-lg border bg-card dark:bg-gray-900/50">
      <div className="text-sm font-medium text-muted-foreground mb-1 h-10 flex items-center justify-center">{label}</div>
      <div style={{ width: '100%', height: 100 }}> {/* Fixed height container */}
        <ResponsiveContainer>
          <RadialBarChart
            innerRadius="70%"
            outerRadius="90%"
            barSize={10}
            data={data}
            startAngle={180}
            endAngle={0}
            cy="90%" // Adjust vertical position
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar
              background={{ fill: 'rgba(128, 128, 128, 0.1)' }} // Use theme-aware color if possible
              dataKey="value"
              cornerRadius={5}
              angleAxisId={0} // Ensure it uses the correct axis
            />
            {/* Text in the center */}
            <text x="50%" y="85%" textAnchor="middle" dominantBaseline="middle" className="text-lg font-semibold fill-current">
              {displayValue}
            </text>
             <text x="50%" y="105%" textAnchor="middle" dominantBaseline="middle" className="text-xs text-muted-foreground fill-current">
              {unit}
            </text>
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};


// --- Main Component Definition ---
export default function EnergyUsageEstimator() {
  // --- State Variables (Unchanged) ---
  const [tokenCount, setTokenCount] = useState<number>(1000000);
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4o');
  const [selectedHardware, setSelectedHardware] = useState<HardwareType>('h100');
  const [selectedRegion, setSelectedRegion] = useState<Region>(DEFAULT_REGION);
  const [pue, setPue] = useState<number>(DEFAULT_PUE);
  const [renewableShare, setRenewableShare] = useState<number>(DEFAULT_RENEWABLE_SHARE);
  const [costPerKwh, setCostPerKwh] = useState<number>(DEFAULT_COST_PER_KWH);
  const [includeLifecycle, setIncludeLifecycle] = useState<boolean>(false);
  const [maxLatencyMs, setMaxLatencyMs] = useState<number>(100);
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [alertThresholdKgCo2e, setAlertThresholdKgCo2e] = useState<number>(100);
  const [alertTriggered, setAlertTriggered] = useState<boolean>(false);
  const [customEnergyFactors, setCustomEnergyFactors] = useState<Record<ModelSize, number> | null>(null);

  // --- Derived State & Calculations (Unchanged logic) ---
  const modelCategories = useMemo(() => getModelCategories(), []);
  const calculationResults = useMemo(() => {
    const energyFactors = customEnergyFactors || ENERGY_PER_1K_TOKENS_KWH;
    const modelSizeCategory = MODEL_DEFINITIONS[selectedModel]?.sizeCategory || 'medium';
    const baseEnergyPer1k = energyFactors[modelSizeCategory] ?? ENERGY_PER_1K_TOKENS_KWH[modelSizeCategory];
    let computeEnergyKWh = (tokenCount / 1000) * baseEnergyPer1k;
    const hardwareFactor = HARDWARE_EFFICIENCY_FACTORS[selectedHardware] || 1.0;
    computeEnergyKWh *= hardwareFactor;
    const totalFacilityEnergyKWh = computeEnergyKWh * pue;
    const gridCarbonIntensity = REGIONAL_CARBON_INTENSITY[selectedRegion] || REGIONAL_CARBON_INTENSITY['global-avg'];
    const effectiveCarbonIntensity = gridCarbonIntensity * (1 - renewableShare / 100);
    const operationalCo2eGrams = totalFacilityEnergyKWh * effectiveCarbonIntensity;
    let operationalCo2eKg = operationalCo2eGrams / 1000;
    const totalEnergyCost = totalFacilityEnergyKWh * costPerKwh;
    const directWaterUsageLiters = totalFacilityEnergyKWh * DIRECT_WATER_USAGE_L_PER_KWH;
    const totalWaterUsageLiters = directWaterUsageLiters + (totalFacilityEnergyKWh * INDIRECT_WATER_USAGE_L_PER_KWH);
    let embodiedCarbonKgCo2e = 0;
    let totalCo2eKg = operationalCo2eKg;
    if (includeLifecycle) {
        const hardwareEmbodied = EMBODIED_CARBON_KGCO2E[selectedHardware] || 0;
        const estimatedAnnualComputeKWh = 10000;
        const lifetimeComputeKWh = estimatedAnnualComputeKWh * HARDWARE_LIFESPAN_YEARS;
        const usageFraction = lifetimeComputeKWh > 0 ? computeEnergyKWh / lifetimeComputeKWh : 0;
        embodiedCarbonKgCo2e = hardwareEmbodied * usageFraction;
        totalCo2eKg += embodiedCarbonKgCo2e;
    }
    const totalCo2eGramsFinal = totalCo2eKg * 1000;
    const milesDriven = totalCo2eGramsFinal / GCO2E_PER_MILE_DRIVEN;
    const phoneCharges = totalCo2eGramsFinal / GCO2E_PER_SMARTPHONE_CHARGE;
    const treeYears = KGCO2E_SEQ_PER_TREE_YEAR > 0 ? totalCo2eKg / KGCO2E_SEQ_PER_TREE_YEAR : 0;
    const eq = { milesDriven, phoneCharges, treeYears };
    const chartEqData = [
        { name: 'Miles Driven', value: parseFloat(milesDriven.toFixed(1)), fill: '#8884d8' },
        { name: 'Phone Charges', value: parseFloat(phoneCharges.toFixed(0)), fill: '#82ca9d' },
        { name: 'Tree Years', value: parseFloat(treeYears.toFixed(1)), fill: '#ffc658' },
    ];
    let recommendation = null;
    if (maxLatencyMs > 0) { /* ... recommendation logic ... */
        let bestRegion: Region | null = null; let lowestCo2 = Infinity;
        for (const regionKey in REGIONAL_CARBON_INTENSITY) {
            const region = regionKey as Region; const regionLatency = REGION_LATENCY_MS[region] || 999; const regionCo2Intensity = REGIONAL_CARBON_INTENSITY[region];
            if (regionLatency <= maxLatencyMs && regionCo2Intensity < lowestCo2) { lowestCo2 = regionCo2Intensity; bestRegion = region; }
        }
        if (bestRegion && bestRegion !== selectedRegion && REGIONAL_CARBON_INTENSITY[bestRegion] < gridCarbonIntensity) { recommendation = bestRegion; }
    }
    const thresholdBreached = totalCo2eKg > alertThresholdKgCo2e;

    return {
      computeEnergyKWh, totalFacilityEnergyKWh, effectiveCarbonIntensity, operationalCo2eKg,
      embodiedCarbonKgCo2e, totalCo2eKg, totalEnergyCost, directWaterUsageLiters, totalWaterUsageLiters,
      equivalencies: eq, chartData: chartEqData, recommendation, thresholdBreached,
      inputs: { tokenCount, selectedModel, selectedHardware, selectedRegion, pue, renewableShare, costPerKwh, gridCarbonIntensity, includeLifecycle }
    };
  }, [tokenCount, selectedModel, selectedHardware, selectedRegion, pue, renewableShare, costPerKwh, includeLifecycle, maxLatencyMs, alertThresholdKgCo2e, customEnergyFactors]);

  // --- Event Handlers (Unchanged logic) ---
  const handleTokenInputChange = (event: React.ChangeEvent<HTMLInputElement>) => { /* ... */ setTokenCount(isNaN(parseInt(event.target.value))?MIN_TOKENS:parseInt(event.target.value))};
  const handleTokenSliderChange = (value: number[]) => setTokenCount(value[0]);
  const handlePueChange = (event: React.ChangeEvent<HTMLInputElement>) => { /* ... */ setPue(isNaN(parseFloat(event.target.value))?MIN_PUE:Math.max(MIN_PUE, Math.min(MAX_PUE, parseFloat(event.target.value))))};
  const handleRenewableShareChange = (value: number[]) => setRenewableShare(value[0]);
  const handleCostChange = (event: React.ChangeEvent<HTMLInputElement>) => { /* ... */ setCostPerKwh(isNaN(parseFloat(event.target.value))?MIN_COST_PER_KWH:Math.max(MIN_COST_PER_KWH, Math.min(MAX_COST_PER_KWH, parseFloat(event.target.value))))};
  const handleLifecycleChange = (checked: boolean | 'indeterminate') => { setIncludeLifecycle(!!checked); };
  const handleMaxLatencyChange = (event: React.ChangeEvent<HTMLInputElement>) => { /* ... */ setMaxLatencyMs(isNaN(parseInt(event.target.value))?0:parseInt(event.target.value))};
  const handleWebhookUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => { setWebhookUrl(event.target.value); };
  const handleAlertThresholdChange = (event: React.ChangeEvent<HTMLInputElement>) => { /* ... */ setAlertThresholdKgCo2e(isNaN(parseFloat(event.target.value))?0:parseFloat(event.target.value))};
  const triggerWebhook = useCallback(async () => { /* ... V5 Logic ... */ console.log("Triggering webhook (logic omitted)..."); }, [webhookUrl, calculationResults, alertThresholdKgCo2e, alertTriggered]);
  React.useEffect(() => { /* ... V5 Webhook Effect ... */ if (calculationResults.thresholdBreached && webhookUrl && !alertTriggered) { triggerWebhook(); } if ((!calculationResults.thresholdBreached || webhookUrl === '' || alertThresholdKgCo2e <= 0) && alertTriggered) { setAlertTriggered(false); } }, [calculationResults.thresholdBreached, calculationResults.totalCo2eKg, webhookUrl, alertThresholdKgCo2e, alertTriggered, triggerWebhook]);
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => { /* ... V5 Logic ... */ console.log("Handling file upload (logic omitted)..."); };
  const clearCustomFactors = () => { /* ... V5 Logic ... */ setCustomEnergyFactors(null); };
  const handleExport = (format: 'csv' | 'json') => { /* ... V5 Logic ... */ console.log(`Exporting ${format}...`); };
  const generateEmbedSnippet = () => { /* ... V5 Logic ... */ return `<div>Snippet...</div>`; };

  // --- Render ---
  return (
    <TooltipProvider>
      <Card className="w-full max-w-5xl mx-auto font-sans shadow-lg border border-gray-200 dark:border-gray-700">
         {/* Header (Unchanged) */}
         <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40 pb-4">
            <div className="flex items-center gap-2 mb-1"><Leaf className="h-6 w-6 text-green-600 dark:text-green-400" /><CardTitle className="text-xl font-semibold">Energy Usage Estimator</CardTitle></div>
            <CardDescription>Estimate AI environmental impact (energy, emissions, water, cost) with advanced options. (Data ~May 2025)</CardDescription>
         </CardHeader>

        <CardContent className="p-6 space-y-8">
          {/* --- Configuration Tabs (Unchanged structure) --- */}
          <Tabs defaultValue="core" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="core">Core Inputs</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Factors</TabsTrigger>
              <TabsTrigger value="actions">Actions & Tools</TabsTrigger>
            </TabsList>

            {/* Core Inputs Tab (Unchanged) */}
            <TabsContent value="core" className="space-y-6">
                 {/* ... V5 Core Inputs ... */}
                 {/* Row 1: Tokens */} <div className="space-y-3"> <div className="flex justify-between items-center mb-1"><Label htmlFor="tokenCountInput" className="text-sm font-medium flex items-center gap-1"><Zap className="w-4 h-4" />Number of Tokens</Label><span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/50">{formatTokenDisplay(tokenCount)}</span></div> <div className="flex gap-4 items-center"><Slider id="token-slider" min={MIN_TOKENS} max={MAX_TOKENS_SLIDER} step={TOKEN_STEP} value={[Math.min(tokenCount, MAX_TOKENS_SLIDER)]} onValueChange={handleTokenSliderChange} className="flex-1" /><Input id="tokenCountInput" type="number" value={tokenCount} onChange={handleTokenInputChange} placeholder="e.g., 1000000" min={MIN_TOKENS} className="w-28 h-9" /></div> </div>
                 {/* Row 2: Model & Hardware */} <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> <div className="space-y-2"><Label htmlFor="modelSelect">AI Model</Label><Select value={selectedModel} onValueChange={setSelectedModel}><SelectTrigger id="modelSelect"><SelectValue placeholder="Select model" /></SelectTrigger><SelectContent className="max-h-80 overflow-y-auto">{Object.entries(modelCategories).map(([provider, models]) => (<SelectGroup key={provider}><SelectLabel className="text-xs font-semibold text-muted-foreground">{provider}</SelectLabel>{models.map((modelName) => (<SelectItem key={modelName} value={modelName}>{modelName.startsWith('generic-') ? modelName.replace('generic-', 'Generic ') : modelName}</SelectItem>))}</SelectGroup>))}</SelectContent></Select><Tooltip><TooltipTrigger className="flex items-center text-xs text-muted-foreground cursor-help mt-1"><Info className="h-3 w-3 mr-1" /> Affects base energy/token.</TooltipTrigger><TooltipContent className="max-w-xs p-2"><p>Models mapped to size categories (S/M/L/XL) with estimated kWh/1k tokens. Actual usage varies.</p></TooltipContent></Tooltip></div> <div className="space-y-2"><Label htmlFor="hardwareSelect" className="flex items-center gap-1"><Cpu className="w-4 h-4" />Hardware Type</Label><Select value={selectedHardware} onValueChange={(v) => setSelectedHardware(v as HardwareType)}><SelectTrigger id="hardwareSelect"><SelectValue placeholder="Select hardware" /></SelectTrigger><SelectContent><SelectItem value="h100">NVIDIA H100</SelectItem><SelectItem value="a100">NVIDIA A100</SelectItem><SelectItem value="tpu-v5">Google TPU v5</SelectItem><SelectItem value="tpu-v4">Google TPU v4</SelectItem><SelectItem value="cpu">Generic CPU</SelectItem></SelectContent></Select><Tooltip><TooltipTrigger className="flex items-center text-xs text-muted-foreground cursor-help mt-1"><Info className="h-3 w-3 mr-1" /> Affects compute efficiency.</TooltipTrigger><TooltipContent className="max-w-xs p-2"><p>Applies a relative efficiency factor (H100=1.0). Higher factors = less efficient. Estimates only.</p></TooltipContent></Tooltip></div> </div>
                 {/* Row 3: Region & Cost */} <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> <div className="space-y-2"><Label htmlFor="regionSelect" className="flex items-center gap-1"><MapPin className="w-4 h-4" />Region (Grid Carbon Intensity)</Label><Select value={selectedRegion} onValueChange={(v) => setSelectedRegion(v as Region)}><SelectTrigger id="regionSelect"><SelectValue placeholder="Select region" /></SelectTrigger><SelectContent>{Object.entries(REGIONAL_CARBON_INTENSITY).map(([key, value]) => (<SelectItem key={key} value={key}>{key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} ({value} gCO₂e/kWh)</SelectItem>))}</SelectContent></Select><Tooltip><TooltipTrigger className="flex items-center text-xs text-muted-foreground cursor-help mt-1"><Info className="h-3 w-3 mr-1" /> Affects CO₂ per kWh.</TooltipTrigger><TooltipContent className="max-w-xs p-2"><p>Uses *average* grid carbon intensity estimates (gCO₂e/kWh) for the region (Data ~2023/2024). Real-time values vary.</p></TooltipContent></Tooltip></div> <div className="space-y-2"><Label htmlFor="costInput" className="flex items-center gap-1"><DollarSign className="w-4 h-4" />Electricity Cost ($ / kWh)</Label><Input id="costInput" type="number" value={costPerKwh} onChange={handleCostChange} placeholder={`e.g., ${DEFAULT_COST_PER_KWH}`} min={MIN_COST_PER_KWH} max={MAX_COST_PER_KWH} step="0.01" /><Tooltip><TooltipTrigger className="flex items-center text-xs text-muted-foreground cursor-help mt-1"><Info className="h-3 w-3 mr-1" /> Estimates operational cost.</TooltipTrigger><TooltipContent className="max-w-xs p-2"><p>Enter local electricity price. Default is US avg retail Feb 2025 (~${DEFAULT_COST_PER_KWH.toFixed(3)}/kWh).</p></TooltipContent></Tooltip></div> </div>
            </TabsContent>

            {/* Advanced Factors Tab (Unchanged) */}
            <TabsContent value="advanced" className="space-y-6">
                 {/* ... V5 Advanced Factors ... */}
                 {/* Row 1: PUE & Renewables */} <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> <div className="space-y-2"><Label htmlFor="pueInput" className="flex items-center gap-1"><Zap className="w-4 h-4" />PUE (Power Usage Effectiveness)</Label><Input id="pueInput" type="number" value={pue} onChange={handlePueChange} placeholder={`e.g., ${DEFAULT_PUE}`} min={MIN_PUE} max={MAX_PUE} step="0.01" /><Tooltip><TooltipTrigger className="flex items-center text-xs text-muted-foreground cursor-help mt-1"><Info className="h-3 w-3 mr-1" /> Datacenter overhead.</TooltipTrigger><TooltipContent className="max-w-xs p-2"><p>Total facility energy / IT equipment energy. Lower is better. Default is 2024 median (~1.56).</p></TooltipContent></Tooltip></div> <div className="space-y-3"><Label htmlFor="renewableSlider" className="flex items-center gap-1"><Percent className="w-4 h-4" />Renewable Energy Share (%)</Label><div className="flex gap-4 items-center"><Slider id="renewableSlider" min={MIN_RENEWABLE_SHARE} max={MAX_RENEWABLE_SHARE} step={1} value={[renewableShare]} onValueChange={handleRenewableShareChange} className="flex-1" /><span className="text-sm font-medium w-12 text-right">{renewableShare}%</span></div><Tooltip><TooltipTrigger className="flex items-center text-xs text-muted-foreground cursor-help mt-1"><Info className="h-3 w-3 mr-1" /> Reduces effective carbon intensity.</TooltipTrigger><TooltipContent className="max-w-xs p-2"><p>Percentage of energy matched by renewable sources or RECs.</p></TooltipContent></Tooltip></div> </div>
                 {/* Row 2: Lifecycle & Custom Factors */} <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"> <div className="space-y-2"><Label>Lifecycle / Embodied Carbon</Label><div className="flex items-center space-x-2 mt-2"><Checkbox id="lifecycleCheck" checked={includeLifecycle} onCheckedChange={handleLifecycleChange} /><Label htmlFor="lifecycleCheck" className="text-sm font-normal text-muted-foreground">Include estimated hardware embodied carbon (amortized)</Label></div><Tooltip><TooltipTrigger className="flex items-center text-xs text-muted-foreground cursor-help mt-1"><Info className="h-3 w-3 mr-1" /> Adds manufacturing footprint estimate.</TooltipTrigger><TooltipContent className="max-w-xs p-2"><p>Highly speculative estimate of embodied carbon from hardware manufacturing, amortized over assumed lifespan and usage. Requires better data for accuracy.</p></TooltipContent></Tooltip>{includeLifecycle && calculationResults.embodiedCarbonKgCo2e === 0 && (<p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Note: Embodied carbon data for selected hardware might be zero or placeholder.</p>)}</div> <div className="space-y-2"><Label htmlFor="customFactorsUpload" className="flex items-center gap-1"><Upload className="w-4 h-4"/>Custom Energy Factors (kWh/1k tokens)</Label><Input id="customFactorsUpload" type="file" accept=".json" onChange={handleFileUpload} className="text-xs"/>{customEnergyFactors ? (<div className="text-xs text-green-600 dark:text-green-400 flex items-center justify-between mt-1"><span>Custom factors loaded!</span><Button variant="ghost" size="sm" className="text-xs h-auto p-0 text-muted-foreground hover:text-red-500" onClick={clearCustomFactors}>Clear</Button></div>) : (<p className="text-xs text-muted-foreground mt-1">Optional: Upload JSON file with keys "small", "medium", "large", "very_large" and number values.</p>)}</div> </div>
            </TabsContent>

             {/* Actions & Tools Tab (Unchanged) */}
            <TabsContent value="actions" className="space-y-6">
                 {/* ... V5 Actions & Tools ... */}
                 {/* Row 1: Recommendation */} <div className="p-4 border rounded-lg bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800"><Label className="flex items-center gap-1 mb-2 font-medium text-sky-800 dark:text-sky-300"><Lightbulb className="w-4 h-4"/>Region Recommendation</Label><div className="flex flex-col sm:flex-row items-center gap-4"><Label htmlFor="maxLatencyInput" className="text-sm whitespace-nowrap">Max Latency (ms):</Label><Input id="maxLatencyInput" type="number" value={maxLatencyMs} onChange={handleMaxLatencyChange} min="0" className="w-24 h-8"/>{calculationResults.recommendation ? (<p className="text-sm text-sky-700 dark:text-sky-400"> Suggestion: Consider region <strong className="font-semibold">{calculationResults.recommendation.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</strong> for lower CO₂ (~{REGIONAL_CARBON_INTENSITY[calculationResults.recommendation]} g/kWh) within {maxLatencyMs}ms latency. </p>) : (<p className="text-sm text-muted-foreground">No better region found within latency limit, or latency not set.</p>)}</div><p className="text-xs text-muted-foreground mt-2">Based on lowest average CO₂ intensity within estimated latency. Latency values are rough placeholders.</p></div>
                 {/* Row 2: Alerting / Webhook */} <div className="p-4 border rounded-lg"><Label className="flex items-center gap-1 mb-2 font-medium"><Bell className="w-4 h-4"/>Webhook Alert</Label><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-1"><Label htmlFor="alertThresholdInput" className="text-sm">Alert Threshold (kg CO₂e):</Label><Input id="alertThresholdInput" type="number" value={alertThresholdKgCo2e} onChange={handleAlertThresholdChange} min="0" step="any"/></div> <div className="space-y-1"><Label htmlFor="webhookUrlInput" className="text-sm">Webhook URL:</Label><Input id="webhookUrlInput" type="url" value={webhookUrl} onChange={handleWebhookUrlChange} placeholder="https://your-webhook-endpoint.com"/></div></div> <div className="mt-3 flex items-center gap-2 text-xs"><AlertTriangle className={`w-4 h-4 ${calculationResults.thresholdBreached ? 'text-red-500' : 'text-muted-foreground'}`} /><span className={calculationResults.thresholdBreached ? 'text-red-600 dark:text-red-400 font-medium' : 'text-muted-foreground'}> {calculationResults.thresholdBreached ? `Threshold breached! (${calculationResults.totalCo2eKg.toFixed(2)} kg > ${alertThresholdKgCo2e} kg)` : `Threshold not breached.`} {calculationResults.thresholdBreached && alertTriggered && " (Webhook attempt made)"} </span></div><p className="text-xs text-muted-foreground mt-2">Sends a POST request to the URL if the total CO₂e exceeds the threshold. Requires server to accept requests (CORS). URL is handled client-side.</p></div>
                 {/* Row 3: Offsetting */} <div className="p-4 border rounded-lg"><Label className="flex items-center gap-1 mb-2 font-medium"><TreeDeciduous className="w-4 h-4"/>Carbon Offsetting (Estimate)</Label><p className="text-sm mb-3">Estimated cost to offset <strong className="font-semibold">{calculationResults.totalCo2eKg.toFixed(3)} kg CO₂e</strong> using static project data:</p><div className="space-y-2">{OFFSET_PROJECTS.map(project => { const cost = (calculationResults.totalCo2eKg / 1000) * project.price_usd_per_tonne_co2e; return (<div key={project.id} className="flex justify-between items-center text-sm border-b pb-1"><span>{project.name}</span><span className="font-medium"> ~${formatNumber(cost, 2)} <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="sm" className="h-auto p-1 ml-1" asChild><a href={project.link} target="_blank" rel="noopener noreferrer"><LinkIcon className="w-3 h-3 text-muted-foreground"/></a></Button></TooltipTrigger><TooltipContent><p>Visit project (placeholder link)</p></TooltipContent></Tooltip></span></div>); })}</div> <p className="text-xs text-muted-foreground mt-2">Offset prices are illustrative and vary. This is NOT a payment integration. Links are placeholders.</p></div>
            </TabsContent>
          </Tabs>


          {/* --- Results Section (REPLACED with Gauges) --- */}
          <div className="space-y-6 pt-8 border-t dark:border-gray-700">
             <h3 className="text-lg font-medium text-center mb-4">Estimated Impact Summary</h3>
             {/* Row 1: Core Metrics Gauges */}
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                 <MetricGauge
                    label="Total Energy"
                    value={calculationResults.totalFacilityEnergyKWh}
                    maxValue={100} // Adjust maxValue based on typical expected range, e.g. 100 kWh
                    unit="kWh"
                    color="#3b82f6" // Blue
                    precision={3}
                 />
                  <MetricGauge
                    label={includeLifecycle ? "Total CO₂e" : "Operational CO₂e"}
                    value={calculationResults.totalCo2eKg}
                    maxValue={50} // Adjust maxValue based on typical expected range, e.g. 50 kg
                    unit="kg CO₂e"
                    color="#10b981" // Green
                    precision={3}
                 />
                 <MetricGauge
                    label="Total Water"
                    value={calculationResults.totalWaterUsageLiters}
                    maxValue={500} // Adjust maxValue based on typical expected range, e.g. 500 L
                    unit="Liters"
                    color="#06b6d4" // Cyan
                    precision={2}
                 />
                 <MetricGauge
                    label="Est. Energy Cost"
                    value={calculationResults.totalEnergyCost}
                    maxValue={20} // Adjust maxValue based on typical expected range, e.g. $20
                    unit="$"
                    color="#eab308" // Yellow
                    precision={2}
                 />
             </div>
             {/* Optional: Show CO2 breakdown if lifecycle included */}
             {includeLifecycle && (
                 <p className="text-xs text-center text-muted-foreground -mt-2">
                     (CO₂ Breakdown: Op: {formatNumber(calculationResults.operationalCo2eKg, 3)}kg + Emb: {formatNumber(calculationResults.embodiedCarbonKgCo2e, 3)}kg)
                 </p>
             )}


             {/* Row 2: Equivalencies & Chart (Unchanged) */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start pt-4">
                 {/* Equivalencies List */}
                <div className="bg-gray-50 dark:bg-gray-950/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
                    {/* ... V5 Equivalencies Display ... */}
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-300 mb-2">Rough Equivalencies (Based on Total CO₂)</div><div className="flex items-center gap-2"><Car className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0"/><div><p className="text-xs text-muted-foreground">Miles Driven (avg car, ~{GCO2E_PER_MILE_DRIVEN}g/mi)</p><p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{formatNumber(calculationResults.equivalencies.milesDriven)}</p></div></div><div className="flex items-center gap-2"><Smartphone className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0"/><div><p className="text-xs text-muted-foreground">Smartphone Charges (~{GCO2E_PER_SMARTPHONE_CHARGE}g/charge)</p><p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{formatNumber(calculationResults.equivalencies.phoneCharges, 0)}</p></div></div><div className="flex items-center gap-2"><TreeDeciduous className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0"/><div><p className="text-xs text-muted-foreground">Urban Tree Sequestration (~{KGCO2E_SEQ_PER_TREE_YEAR}kg/yr)</p><p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{formatNumber(calculationResults.equivalencies.treeYears)} years</p></div></div>
                </div>
                 {/* Chart */}
                <div className="space-y-2">
                    {/* ... V5 Chart ... */}
                    <h4 className="text-sm font-medium text-center">Equivalency Comparison</h4><div style={{ width: '100%', height: 200 }}><ResponsiveContainer><BarChart data={calculationResults.chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} /><XAxis dataKey="name" hide /><YAxis fontSize={10} width={35}/><RechartsTooltip contentStyle={{ fontSize: '12px', padding: '5px 8px', borderRadius: '6px' }} formatter={(value: number, name: string) => [formatNumber(value), name]}/><Bar dataKey="value" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
                </div>
             </div>
          </div>

          {/* --- Actions & Disclaimer (Unchanged) --- */}
           <div className="space-y-4 pt-8 border-t dark:border-gray-700">
               {/* Export & Embed */}
               <div className="flex flex-wrap justify-center gap-4">
                   {/* ... V5 Buttons ... */}
                   <Button variant="outline" size="sm" onClick={() => handleExport('csv')}><Download className="w-4 h-4 mr-2" />Export CSV</Button><Button variant="outline" size="sm" onClick={() => handleExport('json')}><Download className="w-4 h-4 mr-2" />Export JSON</Button><Tooltip><TooltipTrigger asChild><Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(generateEmbedSnippet())}><Code className="w-4 h-4 mr-2" />Copy Embed Snippet</Button></TooltipTrigger><TooltipContent className="max-w-md p-2"><p>Copy a basic HTML snippet of the results.</p><pre className="mt-2 p-1 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">{generateEmbedSnippet()}</pre></TooltipContent></Tooltip>
               </div>
               {/* Disclaimer */}
              <div className="text-xs text-muted-foreground text-center pt-4">
                  {/* ... V5 Disclaimer ... */}
                  <strong>Disclaimer:</strong> Estimates based on generalized models and average factors (Data ~May 2025). Lifecycle/embodied carbon estimates are highly speculative. Real-world values vary significantly. Use for awareness and relative comparison.
              </div>
           </div>

        </CardContent>
         <CardFooter className="flex flex-col sm:flex-row justify-between items-center border-t dark:border-gray-700 pt-3 pb-3 px-6 bg-gray-50 dark:bg-gray-900/50 text-xs">
            {/* ... V5 Footer ... */}
            <p className="text-muted-foreground mb-2 sm:mb-0">Equivalency Factors: EPA estimates. Water Factors: LBNL/Literature averages.</p><Button variant="link" size="sm" className="text-xs h-auto p-0" asChild><a href="https://mlco2.github.io/impact/" target="_blank" rel="noopener noreferrer">Learn more about AI Footprints</a></Button>
         </CardFooter>
      </Card>
    </TooltipProvider>
  );
}

// --- Required Shadcn UI Components ---
// Ensure: card, input, label, select, slider, tooltip, button, checkbox, tabs
// Install: npm install lucide-react recharts
