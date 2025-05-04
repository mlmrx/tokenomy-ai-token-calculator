import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox"; // Added Checkbox
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Added Tabs
import { Info, Leaf, Car, Smartphone, TreeDeciduous, Zap, Cpu, MapPin, Percent, DollarSign, Download, Code, Droplet, Upload, Target, Bell, Link as LinkIcon, AlertTriangle, Lightbulb } from 'lucide-react'; // Added more icons
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

// --- Configuration & Constants (May 2025 Data - Unchanged from V4) ---
type ModelSize = 'small' | 'medium' | 'large' | 'very_large';
const MODEL_DEFINITIONS: Record<string, { provider: string; sizeCategory: ModelSize }> = { /* ... V4 Data ... */
  'gpt-4o': { provider: 'OpenAI', sizeCategory: 'very_large' }, 'gpt-4': { provider: 'OpenAI', sizeCategory: 'large' }, 'gpt-4-turbo': { provider: 'OpenAI', sizeCategory: 'large' }, 'gpt-3.5-turbo': { provider: 'OpenAI', sizeCategory: 'medium' },
  'claude-3-opus': { provider: 'Anthropic', sizeCategory: 'very_large' }, 'claude-3-sonnet': { provider: 'Anthropic', sizeCategory: 'large' }, 'claude-3-haiku': { provider: 'Anthropic', sizeCategory: 'medium' },
  'gemini-1.5-pro': { provider: 'Google', sizeCategory: 'large' }, 'gemini-1.0-pro': { provider: 'Google', sizeCategory: 'medium' },
  'llama-3-70b': { provider: 'Meta', sizeCategory: 'large' }, 'llama-3-8b': { provider: 'Meta', sizeCategory: 'small' },
  'mistral-large': { provider: 'Mistral', sizeCategory: 'large' }, 'mistral-medium': { provider: 'Mistral', sizeCategory: 'medium' }, 'mistral-small': { provider: 'Mistral', sizeCategory: 'small' },
  'generic-small': { provider: 'Generic', sizeCategory: 'small' }, 'generic-medium': { provider: 'Generic', sizeCategory: 'medium' }, 'generic-large': { provider: 'Generic', sizeCategory: 'large' }, 'generic-very_large': { provider: 'Generic', sizeCategory: 'very_large' },
};
const getModelCategories = () => { /* ... V4 Function ... */
    const categories: Record<string, string[]> = {};
    for (const modelName in MODEL_DEFINITIONS) { const provider = MODEL_DEFINITIONS[modelName].provider; if (!categories[provider]) { categories[provider] = []; } categories[provider].push(modelName); }
    const sortedProviders = Object.keys(categories).sort((a, b) => { if (a === 'Generic') return 1; if (b === 'Generic') return -1; return a.localeCompare(b); });
    const sortedCategories: Record<string, string[]> = {}; sortedProviders.forEach(provider => { sortedCategories[provider] = categories[provider].sort(); }); return sortedCategories;
};
const ENERGY_PER_1K_TOKENS_KWH: Record<ModelSize, number> = { /* ... V4 Data ... */
  small: 0.0001, medium: 0.001, large: 0.004, very_large: 0.008,
};
type HardwareType = 'h100' | 'a100' | 'tpu-v4' | 'tpu-v5' | 'cpu';
const HARDWARE_EFFICIENCY_FACTORS: Record<HardwareType, number> = { /* ... V4 Data ... */
  'h100': 1.0, 'a100': 1.2, 'tpu-v5': 1.1, 'tpu-v4': 1.4, 'cpu': 10.0,
};
type Region = 'us-national-avg' | 'global-avg' | 'us-west' | 'us-central' | 'us-east' | 'eu-west' | 'eu-north' | 'asia-east' | 'india';
const REGIONAL_CARBON_INTENSITY: Record<Region, number> = { /* ... V4 Data ... */
  'us-national-avg': 394, 'global-avg': 400, 'us-west': 250, 'us-central': 450, 'us-east': 380, 'eu-west': 220, 'eu-north': 100, 'asia-east': 500, 'india': 650,
};
const DEFAULT_REGION: Region = 'us-national-avg';
const DEFAULT_PUE = 1.56; const MIN_PUE = 1.05; const MAX_PUE = 2.0;
const DEFAULT_RENEWABLE_SHARE = 0; const MIN_RENEWABLE_SHARE = 0; const MAX_RENEWABLE_SHARE = 100;
const DEFAULT_COST_PER_KWH = 0.132; const MIN_COST_PER_KWH = 0.01; const MAX_COST_PER_KWH = 0.50;
const DIRECT_WATER_USAGE_L_PER_KWH = 0.36; const INDIRECT_WATER_USAGE_L_PER_KWH = 4.52;
const GCO2E_PER_MILE_DRIVEN = 393; const GCO2E_PER_SMARTPHONE_CHARGE = 8; const KGCO2E_SEQ_PER_TREE_YEAR = 60;
const MIN_TOKENS = 1000; const MAX_TOKENS_SLIDER = 10000000; const TOKEN_STEP = 1000;

// --- NEW: Placeholder Data/Config for Lean Features ---
// Lifecycle/Embodied Carbon (Placeholder - requires real data)
const EMBODIED_CARBON_KGCO2E: Record<HardwareType, number> = {
    'h100': 500, 'a100': 450, 'tpu-v5': 400, 'tpu-v4': 350, 'cpu': 50 // Highly speculative placeholder values!
};
const HARDWARE_LIFESPAN_YEARS = 4; // Assumed lifespan

// Region Latency (Placeholder - very rough estimates in ms)
const REGION_LATENCY_MS: Record<Region, number> = {
    'us-national-avg': 50, 'global-avg': 150, 'us-west': 30, 'us-central': 40, 'us-east': 35,
    'eu-west': 90, 'eu-north': 100, 'asia-east': 180, 'india': 220
};

// Offset Projects (Placeholder - Static CSV/JSON data)
const OFFSET_PROJECTS = [
    { id: 'regen-forest-amazon', name: 'Amazon Rainforest Reforestation', price_usd_per_tonne_co2e: 15, link: '#' },
    { id: 'direct-air-capture-iceland', name: 'Direct Air Capture (DAC) Iceland', price_usd_per_tonne_co2e: 600, link: '#' },
    { id: 'renewable-wind-india', name: 'Wind Power Generation India', price_usd_per_tonne_co2e: 8, link: '#' },
];

// --- Component Definition ---
// Renamed component from AiEnergyEstimatorV5 to EnergyUsageEstimator
export default function EnergyUsageEstimator() {
  // --- State Variables ---
  const [tokenCount, setTokenCount] = useState<number>(1000000);
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4o');
  const [selectedHardware, setSelectedHardware] = useState<HardwareType>('h100');
  const [selectedRegion, setSelectedRegion] = useState<Region>(DEFAULT_REGION);
  const [pue, setPue] = useState<number>(DEFAULT_PUE);
  const [renewableShare, setRenewableShare] = useState<number>(DEFAULT_RENEWABLE_SHARE);
  const [costPerKwh, setCostPerKwh] = useState<number>(DEFAULT_COST_PER_KWH);
  // NEW State for Lean Features
  const [includeLifecycle, setIncludeLifecycle] = useState<boolean>(false);
  const [maxLatencyMs, setMaxLatencyMs] = useState<number>(100); // For recommendation
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [alertThresholdKgCo2e, setAlertThresholdKgCo2e] = useState<number>(100); // e.g., 100 kg CO2e
  const [alertTriggered, setAlertTriggered] = useState<boolean>(false);
  const [customEnergyFactors, setCustomEnergyFactors] = useState<Record<ModelSize, number> | null>(null); // For JSON upload

  // --- Derived State & Calculations (Memoized) ---
  const modelCategories = useMemo(() => getModelCategories(), []);

  const calculationResults = useMemo(() => {
    // Use custom factors if available, otherwise default
    const energyFactors = customEnergyFactors || ENERGY_PER_1K_TOKENS_KWH;

    // 1. Base Compute Energy
    const modelSizeCategory = MODEL_DEFINITIONS[selectedModel]?.sizeCategory || 'medium';
    const baseEnergyPer1k = energyFactors[modelSizeCategory] ?? ENERGY_PER_1K_TOKENS_KWH[modelSizeCategory]; // Fallback if custom JSON missing category
    let computeEnergyKWh = (tokenCount / 1000) * baseEnergyPer1k;

    // 2. Adjust for Hardware
    const hardwareFactor = HARDWARE_EFFICIENCY_FACTORS[selectedHardware] || 1.0;
    computeEnergyKWh *= hardwareFactor;

    // 3. Account for PUE
    const totalFacilityEnergyKWh = computeEnergyKWh * pue;

    // 4. Determine Effective Carbon Intensity
    const gridCarbonIntensity = REGIONAL_CARBON_INTENSITY[selectedRegion] || REGIONAL_CARBON_INTENSITY['global-avg'];
    const effectiveCarbonIntensity = gridCarbonIntensity * (1 - renewableShare / 100);

    // 5. Calculate CO2e Emissions (Operational)
    const operationalCo2eGrams = totalFacilityEnergyKWh * effectiveCarbonIntensity;
    let operationalCo2eKg = operationalCo2eGrams / 1000;

    // 6. Calculate Energy Cost
    const totalEnergyCost = totalFacilityEnergyKWh * costPerKwh;

    // 7. Calculate Water Usage
    const directWaterUsageLiters = totalFacilityEnergyKWh * DIRECT_WATER_USAGE_L_PER_KWH;
    const totalWaterUsageLiters = directWaterUsageLiters + (totalFacilityEnergyKWh * INDIRECT_WATER_USAGE_L_PER_KWH);

    // --- NEW: Lifecycle/Embodied Carbon Calculation ---
    let embodiedCarbonKgCo2e = 0;
    let totalCo2eKg = operationalCo2eKg;
    if (includeLifecycle) {
        // Very rough estimate: amortize hardware embodied carbon over lifespan and usage duration
        // This needs a *much* more sophisticated model in reality (utilization, etc.)
        const hardwareEmbodied = EMBODIED_CARBON_KGCO2E[selectedHardware] || 0;
        // Assume the current token count represents a fraction of the hardware's lifetime work.
        // This is highly speculative! Needs real usage data / amortization model.
        // For demonstration, let's just add a fraction based on compute energy relative to an arbitrary annual amount.
        const estimatedAnnualComputeKWh = 10000; // Arbitrary guess for annual use
        const lifetimeComputeKWh = estimatedAnnualComputeKWh * HARDWARE_LIFESPAN_YEARS;
        // Avoid division by zero if lifetime compute is zero
        const usageFraction = lifetimeComputeKWh > 0 ? computeEnergyKWh / lifetimeComputeKWh : 0;
        embodiedCarbonKgCo2e = hardwareEmbodied * usageFraction;
        totalCo2eKg += embodiedCarbonKgCo2e;
    }

    // 8. Calculate Equivalencies (based on TOTAL CO2e if lifecycle included)
    const totalCo2eGramsFinal = totalCo2eKg * 1000;
    const milesDriven = totalCo2eGramsFinal / GCO2E_PER_MILE_DRIVEN;
    const phoneCharges = totalCo2eGramsFinal / GCO2E_PER_SMARTPHONE_CHARGE;
    const treeYears = KGCO2E_SEQ_PER_TREE_YEAR > 0 ? totalCo2eKg / KGCO2E_SEQ_PER_TREE_YEAR : 0;

    const eq = { milesDriven, phoneCharges, treeYears };

    // 9. Prepare Chart Data
    const chartEqData = [ /* ... unchanged ... */
        { name: 'Miles Driven', value: parseFloat(milesDriven.toFixed(1)), fill: '#8884d8' },
        { name: 'Phone Charges', value: parseFloat(phoneCharges.toFixed(0)), fill: '#82ca9d' },
        { name: 'Tree Years', value: parseFloat(treeYears.toFixed(1)), fill: '#ffc658' },
    ];

    // --- NEW: Recommendation Engine Logic ---
    let recommendation = null;
    if (maxLatencyMs > 0) {
        let bestRegion: Region | null = null;
        let lowestCo2 = Infinity;

        for (const regionKey in REGIONAL_CARBON_INTENSITY) {
            const region = regionKey as Region;
            const regionLatency = REGION_LATENCY_MS[region] || 999;
            const regionCo2Intensity = REGIONAL_CARBON_INTENSITY[region];

            if (regionLatency <= maxLatencyMs && regionCo2Intensity < lowestCo2) {
                lowestCo2 = regionCo2Intensity;
                bestRegion = region;
            }
        }
        // Ensure the recommended region is actually better than the current one
        if (bestRegion && bestRegion !== selectedRegion && REGIONAL_CARBON_INTENSITY[bestRegion] < gridCarbonIntensity) {
            recommendation = bestRegion;
        }
    }

    // --- NEW: Alerting Logic ---
    const thresholdBreached = totalCo2eKg > alertThresholdKgCo2e;

    return {
      computeEnergyKWh, totalFacilityEnergyKWh, effectiveCarbonIntensity,
      operationalCo2eKg, // Operational CO2
      embodiedCarbonKgCo2e, // Estimated embodied CO2 (if included)
      totalCo2eKg, // Total CO2 (Operational + Embodied if included)
      totalEnergyCost, directWaterUsageLiters, totalWaterUsageLiters,
      equivalencies: eq, chartData: chartEqData,
      recommendation, // NEW
      thresholdBreached, // NEW
      inputs: { /* ... unchanged ... */
        tokenCount, selectedModel, selectedHardware, selectedRegion, pue, renewableShare, costPerKwh, gridCarbonIntensity, includeLifecycle
      }
    };
  }, [tokenCount, selectedModel, selectedHardware, selectedRegion, pue, renewableShare, costPerKwh, includeLifecycle, maxLatencyMs, alertThresholdKgCo2e, customEnergyFactors]);

  // --- Event Handlers ---
  const handleTokenInputChange = (event: React.ChangeEvent<HTMLInputElement>) => { /* ... */ setTokenCount(isNaN(parseInt(event.target.value))?MIN_TOKENS:parseInt(event.target.value))};
  const handleTokenSliderChange = (value: number[]) => setTokenCount(value[0]);
  const handlePueChange = (event: React.ChangeEvent<HTMLInputElement>) => { /* ... */ setPue(isNaN(parseFloat(event.target.value))?MIN_PUE:Math.max(MIN_PUE, Math.min(MAX_PUE, parseFloat(event.target.value))))};
  const handleRenewableShareChange = (value: number[]) => setRenewableShare(value[0]);
  const handleCostChange = (event: React.ChangeEvent<HTMLInputElement>) => { /* ... */ setCostPerKwh(isNaN(parseFloat(event.target.value))?MIN_COST_PER_KWH:Math.max(MIN_COST_PER_KWH, Math.min(MAX_COST_PER_KWH, parseFloat(event.target.value))))};
  // NEW Handlers
  const handleLifecycleChange = (checked: boolean | 'indeterminate') => {
      setIncludeLifecycle(!!checked);
  };
   const handleMaxLatencyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
       const value = parseInt(event.target.value, 10);
       setMaxLatencyMs(isNaN(value) || value < 0 ? 0 : value);
   };
    const handleWebhookUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setWebhookUrl(event.target.value);
    };
    const handleAlertThresholdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(event.target.value);
        setAlertThresholdKgCo2e(isNaN(value) || value < 0 ? 0 : value);
    };

    // Webhook Trigger Function
    const triggerWebhook = useCallback(async () => {
        if (!webhookUrl || !calculationResults.thresholdBreached || alertTriggered) {
            console.log("Webhook not sent (URL missing, threshold not breached, or already triggered)");
            return; // Don't trigger if no URL, threshold not met, or already sent for this calculation
        }
        console.log(`Threshold breached (${calculationResults.totalCo2eKg.toFixed(2)} kg > ${alertThresholdKgCo2e} kg). Sending webhook to: ${webhookUrl}`);
        setAlertTriggered(true); // Prevent re-triggering for the same calculation result

        const payload = {
            message: `AI Energy Estimator Alert: CO2e threshold breached!`,
            estimatedCo2eKg: calculationResults.totalCo2eKg,
            thresholdKgCo2e: alertThresholdKgCo2e,
            timestamp: new Date().toISOString(),
            inputs: calculationResults.inputs // Send context
        };

        try {
            // IMPORTANT: This POST request is subject to CORS policy of the receiving server.
            // It might fail if the server doesn't allow requests from this origin.
            // A backend proxy is often needed for reliable webhook delivery.
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                console.error(`Webhook failed with status: ${response.status}`);
                // Optionally reset alertTriggered or show error to user
            } else {
                console.log("Webhook sent successfully.");
                // Maybe show success message
            }
        } catch (error) {
            console.error("Error sending webhook:", error);
            // Optionally reset alertTriggered or show error to user
        }
    }, [webhookUrl, calculationResults, alertThresholdKgCo2e, alertTriggered]);

     // Effect to trigger webhook when threshold is breached and conditions are met
     React.useEffect(() => {
         if (calculationResults.thresholdBreached && webhookUrl && !alertTriggered) {
             triggerWebhook();
         }
         // Reset alertTriggered if the calculation results change significantly (e.g., CO2 drops below threshold)
         // or if the webhook URL / threshold changes
         if ((!calculationResults.thresholdBreached || webhookUrl === '' || alertThresholdKgCo2e <= 0) && alertTriggered) {
             setAlertTriggered(false);
         }
     }, [calculationResults.thresholdBreached, calculationResults.totalCo2eKg, webhookUrl, alertThresholdKgCo2e, alertTriggered, triggerWebhook]);


     // File Upload Handler
     const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result;
                    if (typeof content === 'string') {
                        const parsedJson = JSON.parse(content);
                        // Basic validation: check if it has expected keys (model sizes)
                        if (parsedJson && typeof parsedJson === 'object' &&
                            // Check if *at least one* valid model size key exists with a number value
                            Object.values(ModelSize).some(size => typeof parsedJson[size] === 'number'))
                        {
                            console.log("Custom energy factors loaded:", parsedJson);
                            // Only update factors for valid keys found in the JSON
                            const validFactors: Partial<Record<ModelSize, number>> = {};
                            Object.values(ModelSize).forEach(size => {
                                if (typeof parsedJson[size] === 'number' && parsedJson[size] >= 0) {
                                    validFactors[size] = parsedJson[size];
                                }
                            });
                            // Merge with defaults for missing keys, ensuring we have a full Record<ModelSize, number>
                            const mergedFactors = { ...ENERGY_PER_1K_TOKENS_KWH, ...validFactors };
                            setCustomEnergyFactors(mergedFactors);

                        } else {
                            console.error("Invalid JSON format or no valid keys found for custom energy factors.");
                            alert("Invalid JSON format. Expected keys like 'small', 'medium', etc., with non-negative number values (kWh per 1k tokens).");
                            setCustomEnergyFactors(null); // Reset if invalid
                        }
                    }
                } catch (error) {
                    console.error("Error parsing JSON file:", error);
                    alert("Error parsing JSON file. Please ensure it's valid JSON.");
                    setCustomEnergyFactors(null); // Reset on error
                }
            };
            reader.readAsText(file);
        }
     };

     const clearCustomFactors = () => {
         setCustomEnergyFactors(null);
         // Reset the file input visually (optional, might require ref)
         const fileInput = document.getElementById('customFactorsUpload') as HTMLInputElement;
         if (fileInput) fileInput.value = '';
     };


  // --- Helper Functions (Unchanged) ---
  const formatNumber = (num: number, precision: number = 1): string => {
    if (isNaN(num)) return 'N/A'; if (num === 0) return '0';
    if (num > 0 && num < Math.pow(10, -precision)) { // Use exponential for very small positive numbers
        return num.toExponential(precision > 0 ? precision -1 : 0);
    }
    if (num >= 1e9) return (num / 1e9).toFixed(precision) + ' B';
    if (num >= 1e6) return (num / 1e6).toFixed(precision) + ' M';
    if (num >= 1e3) return (num / 1e3).toFixed(precision) + ' k';
    return num.toFixed(precision);
  };
  const formatTokenDisplay = (num: number): string => { /* ... */ return num >= 1e6? (num/1e6).toFixed(2)+'M' : num >= 1e3? (num/1e3).toFixed(1)+'k' : num.toString(); };

   // --- Export Functions (Updated to use full results object) ---
   const handleExport = (format: 'csv' | 'json') => {
       // Get all results including the breakdown
        const resultsToExport = {
            computeEnergyKWh: calculationResults.computeEnergyKWh,
            totalFacilityEnergyKWh: calculationResults.totalFacilityEnergyKWh,
            effectiveCarbonIntensity: calculationResults.effectiveCarbonIntensity,
            operationalCo2eKg: calculationResults.operationalCo2eKg,
            embodiedCarbonKgCo2e: calculationResults.embodiedCarbonKgCo2e,
            totalCo2eKg: calculationResults.totalCo2eKg,
            totalCo2eGrams: calculationResults.totalCo2eKg * 1000, // Recalculate grams from final kg
            totalEnergyCost: calculationResults.totalEnergyCost,
            directWaterUsageLiters: calculationResults.directWaterUsageLiters,
            totalWaterUsageLiters: calculationResults.totalWaterUsageLiters,
            equivalencies: calculationResults.equivalencies,
        };
       const dataToExport = {
           inputs: calculationResults.inputs,
           results: resultsToExport
       };

       let content = '';
       let filename = `ai_impact_estimate_${new Date().toISOString().split('T')[0]}.${format}`;
       let mimeType = '';

       if (format === 'json') {
           content = JSON.stringify(dataToExport, null, 2);
           mimeType = 'application/json';
       } else { // CSV
           mimeType = 'text/csv';
           const headers = [
               // Inputs
               'Token Count', 'Model', 'Hardware', 'Region', 'PUE', 'Renewable Share (%)', 'Cost per kWh ($)', 'Grid Carbon Intensity (gCO2e/kWh)', 'Include Lifecycle',
               // Results
               'Compute Energy (kWh)', 'Total Facility Energy (kWh)', 'Effective Carbon Intensity (gCO2e/kWh)',
               'Operational CO2e (kg)', 'Embodied CO2e (kg)', 'Total CO2e (kg)', 'Total CO2e (g)',
               'Total Energy Cost ($)', 'Direct Water Usage (L)', 'Total Water Usage (L)',
               'Equiv: Miles Driven', 'Equiv: Phone Charges', 'Equiv: Tree Years'
           ];
           const values = [
               // Inputs
               dataToExport.inputs.tokenCount, dataToExport.inputs.selectedModel, dataToExport.inputs.selectedHardware, dataToExport.inputs.selectedRegion,
               dataToExport.inputs.pue, dataToExport.inputs.renewableShare, dataToExport.inputs.costPerKwh, dataToExport.inputs.gridCarbonIntensity, dataToExport.inputs.includeLifecycle,
               // Results
               dataToExport.results.computeEnergyKWh.toFixed(5), dataToExport.results.totalFacilityEnergyKWh.toFixed(5), dataToExport.results.effectiveCarbonIntensity.toFixed(2),
               dataToExport.results.operationalCo2eKg.toFixed(5), dataToExport.results.embodiedCarbonKgCo2e.toFixed(5), dataToExport.results.totalCo2eKg.toFixed(5), dataToExport.results.totalCo2eGrams.toFixed(2),
               dataToExport.results.totalEnergyCost.toFixed(2), dataToExport.results.directWaterUsageLiters.toFixed(3), dataToExport.results.totalWaterUsageLiters.toFixed(3),
               dataToExport.results.equivalencies.milesDriven.toFixed(2), dataToExport.results.equivalencies.phoneCharges.toFixed(0), dataToExport.results.equivalencies.treeYears.toFixed(2)
           ];
           content = headers.join(',') + '\n' + values.join(',');
       }

       const blob = new Blob([content], { type: mimeType });
       const url = URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       a.download = filename;
       document.body.appendChild(a);
       a.click();
       document.body.removeChild(a);
       URL.revokeObjectURL(url);
   };

   // --- Embeddable Snippet (Unchanged logic) ---
    const generateEmbedSnippet = () => {
        const kwh = formatNumber(calculationResults.totalFacilityEnergyKWh, 2);
        // Use total CO2 for snippet
        const co2 = formatNumber(calculationResults.totalCo2eKg, 2);
        const cost = formatNumber(calculationResults.totalEnergyCost, 2);
        const water = formatNumber(calculationResults.totalWaterUsageLiters, 1);
        return `<div style="border:1px solid #ccc; padding:10px; font-family:sans-serif; font-size:12px; border-radius:5px; display:inline-block; background-color:#f9f9f9;">
  <strong>AI Task Impact (Est.):</strong><br>
  ⚡ ${kwh} kWh | 🌱 ${co2} kg CO₂e | 💧 ${water} L H₂O | 💰 $${cost} Cost ${includeLifecycle ? '(incl. Embodied)' : ''}
</div>`;
    };


  // --- Render ---
  return (
    <TooltipProvider>
      <Card className="w-full max-w-5xl mx-auto font-sans shadow-lg border border-gray-200 dark:border-gray-700"> {/* Increased max-width */}
         {/* Header */}
         <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40 pb-4">
            <div className="flex items-center gap-2 mb-1"><Leaf className="h-6 w-6 text-green-600 dark:text-green-400" /><CardTitle className="text-xl font-semibold">Energy Usage Estimator</CardTitle></div>
            <CardDescription>Estimate AI environmental impact (energy, emissions, water, cost) with advanced options. (Data ~May 2025)</CardDescription>
         </CardHeader>

        <CardContent className="p-6 space-y-8">
          {/* --- Configuration Tabs --- */}
          <Tabs defaultValue="core" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="core">Core Inputs</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Factors</TabsTrigger>
              <TabsTrigger value="actions">Actions & Tools</TabsTrigger>
            </TabsList>

            {/* Core Inputs Tab */}
            <TabsContent value="core" className="space-y-6">
                 {/* Row 1: Tokens */}
                <div className="space-y-3">
                   <div className="flex justify-between items-center mb-1"><Label htmlFor="tokenCountInput" className="text-sm font-medium flex items-center gap-1"><Zap className="w-4 h-4" />Number of Tokens</Label><span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/50">{formatTokenDisplay(tokenCount)}</span></div>
                   <div className="flex gap-4 items-center"><Slider id="token-slider" min={MIN_TOKENS} max={MAX_TOKENS_SLIDER} step={TOKEN_STEP} value={[Math.min(tokenCount, MAX_TOKENS_SLIDER)]} onValueChange={handleTokenSliderChange} className="flex-1" /><Input id="tokenCountInput" type="number" value={tokenCount} onChange={handleTokenInputChange} placeholder="e.g., 1000000" min={MIN_TOKENS} className="w-28 h-9" /></div>
                </div>
                 {/* Row 2: Model & Hardware */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Model Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="modelSelect">AI Model</Label>
                        <Select value={selectedModel} onValueChange={setSelectedModel}>
                            <SelectTrigger id="modelSelect"><SelectValue placeholder="Select model" /></SelectTrigger>
                            <SelectContent className="max-h-80 overflow-y-auto">{Object.entries(modelCategories).map(([provider, models]) => (<SelectGroup key={provider}><SelectLabel className="text-xs font-semibold text-muted-foreground">{provider}</SelectLabel>{models.map((modelName) => (<SelectItem key={modelName} value={modelName}>{modelName.startsWith('generic-') ? modelName.replace('generic-', 'Generic ') : modelName}</SelectItem>))}</SelectGroup>))}</SelectContent>
                        </Select>
                        <Tooltip><TooltipTrigger className="flex items-center text-xs text-muted-foreground cursor-help mt-1"><Info className="h-3 w-3 mr-1" /> Affects base energy/token.</TooltipTrigger><TooltipContent className="max-w-xs p-2"><p>Models mapped to size categories (S/M/L/XL) with estimated kWh/1k tokens. Actual usage varies.</p></TooltipContent></Tooltip>
                    </div>
                     {/* Hardware Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="hardwareSelect" className="flex items-center gap-1"><Cpu className="w-4 h-4" />Hardware Type</Label>
                        <Select value={selectedHardware} onValueChange={(v) => setSelectedHardware(v as HardwareType)}>
                            <SelectTrigger id="hardwareSelect"><SelectValue placeholder="Select hardware" /></SelectTrigger>
                            <SelectContent><SelectItem value="h100">NVIDIA H100</SelectItem><SelectItem value="a100">NVIDIA A100</SelectItem><SelectItem value="tpu-v5">Google TPU v5</SelectItem><SelectItem value="tpu-v4">Google TPU v4</SelectItem><SelectItem value="cpu">Generic CPU</SelectItem></SelectContent>
                        </Select>
                        <Tooltip><TooltipTrigger className="flex items-center text-xs text-muted-foreground cursor-help mt-1"><Info className="h-3 w-3 mr-1" /> Affects compute efficiency.</TooltipTrigger><TooltipContent className="max-w-xs p-2"><p>Applies a relative efficiency factor (H100=1.0). Higher factors = less efficient. Estimates only.</p></TooltipContent></Tooltip>
                    </div>
                </div>
                 {/* Row 3: Region & Cost */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Region Selection */}
                    <div className="space-y-2">
                         <Label htmlFor="regionSelect" className="flex items-center gap-1"><MapPin className="w-4 h-4" />Region (Grid Carbon Intensity)</Label>
                         <Select value={selectedRegion} onValueChange={(v) => setSelectedRegion(v as Region)}>
                            <SelectTrigger id="regionSelect"><SelectValue placeholder="Select region" /></SelectTrigger>
                            <SelectContent>{Object.entries(REGIONAL_CARBON_INTENSITY).map(([key, value]) => (<SelectItem key={key} value={key}>{key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} ({value} gCO₂e/kWh)</SelectItem>))}</SelectContent>
                         </Select>
                         <Tooltip><TooltipTrigger className="flex items-center text-xs text-muted-foreground cursor-help mt-1"><Info className="h-3 w-3 mr-1" /> Affects CO₂ per kWh.</TooltipTrigger><TooltipContent className="max-w-xs p-2"><p>Uses *average* grid carbon intensity estimates (gCO₂e/kWh) for the region (Data ~2023/2024). Real-time values vary.</p></TooltipContent></Tooltip>
                    </div>
                     {/* Cost Input */}
                    <div className="space-y-2">
                        <Label htmlFor="costInput" className="flex items-center gap-1"><DollarSign className="w-4 h-4" />Electricity Cost ($ / kWh)</Label>
                        <Input id="costInput" type="number" value={costPerKwh} onChange={handleCostChange} placeholder={`e.g., ${DEFAULT_COST_PER_KWH}`} min={MIN_COST_PER_KWH} max={MAX_COST_PER_KWH} step="0.01" />
                        <Tooltip><TooltipTrigger className="flex items-center text-xs text-muted-foreground cursor-help mt-1"><Info className="h-3 w-3 mr-1" /> Estimates operational cost.</TooltipTrigger><TooltipContent className="max-w-xs p-2"><p>Enter local electricity price. Default is US avg retail Feb 2025 (~${DEFAULT_COST_PER_KWH.toFixed(3)}/kWh).</p></TooltipContent></Tooltip>
                    </div>
                 </div>
            </TabsContent>

            {/* Advanced Factors Tab */}
            <TabsContent value="advanced" className="space-y-6">
                 {/* Row 1: PUE & Renewables */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* PUE Input */}
                    <div className="space-y-2">
                        <Label htmlFor="pueInput" className="flex items-center gap-1"><Zap className="w-4 h-4" />PUE (Power Usage Effectiveness)</Label>
                        <Input id="pueInput" type="number" value={pue} onChange={handlePueChange} placeholder={`e.g., ${DEFAULT_PUE}`} min={MIN_PUE} max={MAX_PUE} step="0.01" />
                        <Tooltip><TooltipTrigger className="flex items-center text-xs text-muted-foreground cursor-help mt-1"><Info className="h-3 w-3 mr-1" /> Datacenter overhead.</TooltipTrigger><TooltipContent className="max-w-xs p-2"><p>Total facility energy / IT equipment energy. Lower is better. Default is 2024 median (~1.56).</p></TooltipContent></Tooltip>
                    </div>
                    {/* Renewable Share */}
                    <div className="space-y-3">
                        <Label htmlFor="renewableSlider" className="flex items-center gap-1"><Percent className="w-4 h-4" />Renewable Energy Share (%)</Label>
                        <div className="flex gap-4 items-center"><Slider id="renewableSlider" min={MIN_RENEWABLE_SHARE} max={MAX_RENEWABLE_SHARE} step={1} value={[renewableShare]} onValueChange={handleRenewableShareChange} className="flex-1" /><span className="text-sm font-medium w-12 text-right">{renewableShare}%</span></div>
                        <Tooltip><TooltipTrigger className="flex items-center text-xs text-muted-foreground cursor-help mt-1"><Info className="h-3 w-3 mr-1" /> Reduces effective carbon intensity.</TooltipTrigger><TooltipContent className="max-w-xs p-2"><p>Percentage of energy matched by renewable sources or RECs.</p></TooltipContent></Tooltip>
                    </div>
                </div>
                 {/* Row 2: Lifecycle & Custom Factors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                     {/* NEW: Lifecycle Checkbox */}
                     <div className="space-y-2">
                         <Label>Lifecycle / Embodied Carbon</Label>
                         <div className="flex items-center space-x-2 mt-2">
                            <Checkbox id="lifecycleCheck" checked={includeLifecycle} onCheckedChange={handleLifecycleChange} />
                            <Label htmlFor="lifecycleCheck" className="text-sm font-normal text-muted-foreground">Include estimated hardware embodied carbon (amortized)</Label>
                         </div>
                         <Tooltip>
                            <TooltipTrigger className="flex items-center text-xs text-muted-foreground cursor-help mt-1"><Info className="h-3 w-3 mr-1" /> Adds manufacturing footprint estimate.</TooltipTrigger>
                            <TooltipContent className="max-w-xs p-2"><p>Highly speculative estimate of embodied carbon from hardware manufacturing, amortized over assumed lifespan and usage. Requires better data for accuracy.</p></TooltipContent>
                        </Tooltip>
                        {includeLifecycle && calculationResults.embodiedCarbonKgCo2e === 0 && (
                             <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Note: Embodied carbon data for selected hardware might be zero or placeholder.</p>
                        )}
                     </div>
                     {/* NEW: Custom Energy Factors Upload */}
                    <div className="space-y-2">
                        <Label htmlFor="customFactorsUpload" className="flex items-center gap-1"><Upload className="w-4 h-4"/>Custom Energy Factors (kWh/1k tokens)</Label>
                        <Input id="customFactorsUpload" type="file" accept=".json" onChange={handleFileUpload} className="text-xs"/>
                        {customEnergyFactors ? (
                             <div className="text-xs text-green-600 dark:text-green-400 flex items-center justify-between mt-1">
                                 <span>Custom factors loaded!</span>
                                 <Button variant="ghost" size="sm" className="text-xs h-auto p-0 text-muted-foreground hover:text-red-500" onClick={clearCustomFactors}>Clear</Button>
                             </div>
                        ) : (
                             <p className="text-xs text-muted-foreground mt-1">Optional: Upload JSON file with keys "small", "medium", "large", "very_large" and number values.</p>
                        )}
                    </div>
                </div>
            </TabsContent>

             {/* Actions & Tools Tab */}
            <TabsContent value="actions" className="space-y-6">
                 {/* Row 1: Recommendation */}
                 <div className="p-4 border rounded-lg bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800">
                    <Label className="flex items-center gap-1 mb-2 font-medium text-sky-800 dark:text-sky-300"><Lightbulb className="w-4 h-4"/>Region Recommendation</Label>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                         <Label htmlFor="maxLatencyInput" className="text-sm whitespace-nowrap">Max Latency (ms):</Label>
                         <Input id="maxLatencyInput" type="number" value={maxLatencyMs} onChange={handleMaxLatencyChange} min="0" className="w-24 h-8"/>
                         {calculationResults.recommendation ? (
                             <p className="text-sm text-sky-700 dark:text-sky-400">
                                 Suggestion: Consider region <strong className="font-semibold">{calculationResults.recommendation.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</strong> for lower CO₂ (~{REGIONAL_CARBON_INTENSITY[calculationResults.recommendation]} g/kWh) within {maxLatencyMs}ms latency.
                             </p>
                         ) : (
                             <p className="text-sm text-muted-foreground">No better region found within latency limit, or latency not set.</p>
                         )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Based on lowest average CO₂ intensity within estimated latency. Latency values are rough placeholders.</p>
                 </div>

                 {/* Row 2: Alerting / Webhook */}
                <div className="p-4 border rounded-lg">
                    <Label className="flex items-center gap-1 mb-2 font-medium"><Bell className="w-4 h-4"/>Webhook Alert</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="alertThresholdInput" className="text-sm">Alert Threshold (kg CO₂e):</Label>
                            <Input id="alertThresholdInput" type="number" value={alertThresholdKgCo2e} onChange={handleAlertThresholdChange} min="0" step="any"/>
                        </div>
                         <div className="space-y-1">
                             <Label htmlFor="webhookUrlInput" className="text-sm">Webhook URL:</Label>
                             <Input id="webhookUrlInput" type="url" value={webhookUrl} onChange={handleWebhookUrlChange} placeholder="https://your-webhook-endpoint.com"/>
                         </div>
                    </div>
                     <div className="mt-3 flex items-center gap-2 text-xs">
                         <AlertTriangle className={`w-4 h-4 ${calculationResults.thresholdBreached ? 'text-red-500' : 'text-muted-foreground'}`} />
                         <span className={calculationResults.thresholdBreached ? 'text-red-600 dark:text-red-400 font-medium' : 'text-muted-foreground'}>
                             {calculationResults.thresholdBreached ? `Threshold breached! (${calculationResults.totalCo2eKg.toFixed(2)} kg > ${alertThresholdKgCo2e} kg)` : `Threshold not breached.`}
                             {calculationResults.thresholdBreached && alertTriggered && " (Webhook attempt made)"}
                         </span>
                     </div>
                    <p className="text-xs text-muted-foreground mt-2">Sends a POST request to the URL if the total CO₂e exceeds the threshold. Requires server to accept requests (CORS). URL is handled client-side.</p>
                </div>

                 {/* Row 3: Offsetting */}
                <div className="p-4 border rounded-lg">
                    <Label className="flex items-center gap-1 mb-2 font-medium"><TreeDeciduous className="w-4 h-4"/>Carbon Offsetting (Estimate)</Label>
                    <p className="text-sm mb-3">Estimated cost to offset <strong className="font-semibold">{calculationResults.totalCo2eKg.toFixed(3)} kg CO₂e</strong> using static project data:</p>
                    <div className="space-y-2">
                        {OFFSET_PROJECTS.map(project => {
                            const cost = (calculationResults.totalCo2eKg / 1000) * project.price_usd_per_tonne_co2e; // Convert kg to tonnes
                            return (
                                <div key={project.id} className="flex justify-between items-center text-sm border-b pb-1">
                                    <span>{project.name}</span>
                                    <span className="font-medium">
                                        ~${formatNumber(cost, 2)}
                                        <Tooltip>
                                            <TooltipTrigger asChild><Button variant="ghost" size="sm" className="h-auto p-1 ml-1" asChild><a href={project.link} target="_blank" rel="noopener noreferrer"><LinkIcon className="w-3 h-3 text-muted-foreground"/></a></Button></TooltipTrigger>
                                            <TooltipContent><p>Visit project (placeholder link)</p></TooltipContent>
                                        </Tooltip>
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                     <p className="text-xs text-muted-foreground mt-2">Offset prices are illustrative and vary. This is NOT a payment integration. Links are placeholders.</p>
                </div>
            </TabsContent>
          </Tabs>


          {/* --- Results Section (Minor adjustments for lifecycle) --- */}
          <div className="space-y-6 pt-8 border-t dark:border-gray-700">
             <h3 className="text-lg font-medium text-center mb-4">Estimated Impact Summary</h3>
             {/* Row 1: Core Metrics + Water */}
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 {/* Total Energy */}
                 <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
                    <div className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Total Energy</div><p className="text-xl font-semibold text-blue-700 dark:text-blue-400">{formatNumber(calculationResults.totalFacilityEnergyKWh, 3)} <span className="text-base font-normal">kWh</span></p><p className="text-xs text-muted-foreground">(Compute: {formatNumber(calculationResults.computeEnergyKWh, 3)} kWh)</p>
                 </div>
                 {/* CO2 Emissions */}
                 <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg border border-green-200 dark:border-green-800 text-center">
                    <div className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">CO₂ Emissions</div>
                     <p className="text-xl font-semibold text-green-700 dark:text-green-400">
                        {formatNumber(calculationResults.totalCo2eKg, 3)} <span className="text-base font-normal">kg CO₂e</span>
                    </p>
                     {/* Show breakdown if lifecycle included */}
                     {includeLifecycle ? (
                         <p className="text-xs text-muted-foreground">(Op: {formatNumber(calculationResults.operationalCo2eKg, 3)}kg + Emb: {formatNumber(calculationResults.embodiedCarbonKgCo2e, 3)}kg)</p>
                     ) : (
                         <p className="text-xs text-muted-foreground">(Eff. Grid: {formatNumber(calculationResults.effectiveCarbonIntensity, 0)} g/kWh)</p>
                     )}
                 </div>
                 {/* Water Usage */}
                 <div className="bg-cyan-50 dark:bg-cyan-950/30 p-3 rounded-lg border border-cyan-200 dark:border-cyan-800 text-center">
                    <div className="text-sm font-medium text-cyan-800 dark:text-cyan-300 mb-1 flex items-center justify-center gap-1"><Droplet className="w-4 h-4"/>Water Usage</div><p className="text-xl font-semibold text-cyan-700 dark:text-cyan-400">{formatNumber(calculationResults.totalWaterUsageLiters, 2)} <span className="text-base font-normal">Liters</span></p><p className="text-xs text-muted-foreground">(Direct Cooling: {formatNumber(calculationResults.directWaterUsageLiters, 2)} L)</p>
                 </div>
                 {/* Energy Cost */}
                 <div className="bg-yellow-50 dark:bg-yellow-950/30 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 text-center">
                    <div className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">Est. Energy Cost</div><p className="text-xl font-semibold text-yellow-700 dark:text-yellow-400">${formatNumber(calculationResults.totalEnergyCost, 2)}</p><p className="text-xs text-muted-foreground">(@ ${costPerKwh.toFixed(3)}/kWh)</p>
                 </div>
             </div>

             {/* Row 2: Equivalencies & Chart */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start pt-4">
                 {/* Equivalencies List */}
                <div className="bg-gray-50 dark:bg-gray-950/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-300 mb-2">Rough Equivalencies (Based on Total CO₂)</div>
                    <div className="flex items-center gap-2"><Car className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0"/><div><p className="text-xs text-muted-foreground">Miles Driven (avg car, ~{GCO2E_PER_MILE_DRIVEN}g/mi)</p><p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{formatNumber(calculationResults.equivalencies.milesDriven)}</p></div></div>
                    <div className="flex items-center gap-2"><Smartphone className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0"/><div><p className="text-xs text-muted-foreground">Smartphone Charges (~{GCO2E_PER_SMARTPHONE_CHARGE}g/charge)</p><p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{formatNumber(calculationResults.equivalencies.phoneCharges, 0)}</p></div></div>
                    <div className="flex items-center gap-2"><TreeDeciduous className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0"/><div><p className="text-xs text-muted-foreground">Urban Tree Sequestration (~{KGCO2E_SEQ_PER_TREE_YEAR}kg/yr)</p><p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{formatNumber(calculationResults.equivalencies.treeYears)} years</p></div></div>
                </div>
                 {/* Chart */}
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-center">Equivalency Comparison</h4><div style={{ width: '100%', height: 200 }}><ResponsiveContainer><BarChart data={calculationResults.chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} /><XAxis dataKey="name" hide /><YAxis fontSize={10} width={35}/><RechartsTooltip contentStyle={{ fontSize: '12px', padding: '5px 8px', borderRadius: '6px' }} formatter={(value: number, name: string) => [formatNumber(value), name]}/><Bar dataKey="value" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
                </div>
             </div>
          </div>

          {/* --- Actions & Disclaimer --- */}
           <div className="space-y-4 pt-8 border-t dark:border-gray-700">
               {/* Export & Embed */}
               <div className="flex flex-wrap justify-center gap-4">
                   <Button variant="outline" size="sm" onClick={() => handleExport('csv')}><Download className="w-4 h-4 mr-2" />Export CSV</Button>
                   <Button variant="outline" size="sm" onClick={() => handleExport('json')}><Download className="w-4 h-4 mr-2" />Export JSON</Button>
                   <Tooltip>
                       <TooltipTrigger asChild><Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(generateEmbedSnippet())}><Code className="w-4 h-4 mr-2" />Copy Embed Snippet</Button></TooltipTrigger>
                       <TooltipContent className="max-w-md p-2"><p>Copy a basic HTML snippet of the results.</p><pre className="mt-2 p-1 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">{generateEmbedSnippet()}</pre></TooltipContent>
                   </Tooltip>
               </div>
               {/* Disclaimer */}
              <div className="text-xs text-muted-foreground text-center pt-4">
                  <strong>Disclaimer:</strong> Estimates based on generalized models and average factors (Data ~May 2025). Lifecycle/embodied carbon estimates are highly speculative. Real-world values vary significantly. Use for awareness and relative comparison.
              </div>
           </div>

        </CardContent>
         <CardFooter className="flex flex-col sm:flex-row justify-between items-center border-t dark:border-gray-700 pt-3 pb-3 px-6 bg-gray-50 dark:bg-gray-900/50 text-xs">
            <p className="text-muted-foreground mb-2 sm:mb-0">Equivalency Factors: EPA estimates. Water Factors: LBNL/Literature averages.</p>
            <Button variant="link" size="sm" className="text-xs h-auto p-0" asChild><a href="https://mlco2.github.io/impact/" target="_blank" rel="noopener noreferrer">Learn more about AI Footprints</a></Button>
         </CardFooter>
      </Card>
    </TooltipProvider>
  );
}

// --- Required Shadcn UI Components ---
// Ensure: card, input, label, select, slider, tooltip, button, checkbox, tabs
// Install: npm install lucide-react recharts