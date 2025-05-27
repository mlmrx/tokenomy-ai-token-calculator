
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChevronDown, ChevronUp, Cpu, Settings, Sliders, HardDrive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Import existing components
import ModelPresets, { modelPresets } from "./ModelPresets";
import EnhancedModelConfig from "./EnhancedModelConfig";
import EnhancedAdvancedOptimizations from "./EnhancedAdvancedOptimizations";
import HardwareConfiguration, { gpuOptions } from "./HardwareConfiguration";
import EstimatedMemoryRequirements from "./EstimatedMemoryRequirements";
import MemoryBreakdownChart from "./MemoryBreakdownChart";
import InferenceMemoryChart from "./InferenceMemoryChart";
import QuantizationTable from "./QuantizationTable";
import ActionButtons from "./ActionButtons";

// Enhanced type definitions (copied from original)
interface ModelParameters {
  architecture: string;
  hiddenSize: number;
  numLayers: number;
  numHeads: number;
  vocabSize: number;
  sequenceLength: number;
  batchSize: number;
  microBatchSizePerGPU: number;
  numGPUs: number;
}

interface OptimizationFlags {
  flashAttention: boolean;
  gradientCheckpointFactor: number;
  zeroStage: 0 | 1 | 2 | 3;
  cpuOffloadPct: number;
  moe: {
    enabled: boolean;
    experts: number;
    topK: number;
  };
  lora: {
    enabled: boolean;
    rank: number;
    alpha: number;
  };
  sequenceParallelism: number;
  kvCachePrecision: "fp16" | "int8" | "int4";
  sparsity24: boolean;
  activationCheckpointing: boolean;
  quantization: {
    enabled: boolean;
    bits: 4 | 8 | 16;
    type: "int" | "float";
  };
}

interface HardwareConfig {
  gpuType: string;
  memoryPerGPU: number;
  precision: "fp32" | "fp16" | "bf16" | "int8";
  interconnect: string;
}

interface CostEnergyParams {
  trainingSteps: number;
  tokensPerSecondPerGPU: number;
  gridCarbonIntensity: number;
  powerPerGPU: number;
  costPerGPUHour: number;
}

const EnhancedMemoryCalculator: React.FC = () => {
  const { toast } = useToast();
  
  // Enhanced state with defaults matching live version
  const [modelParams, setModelParams] = useState<ModelParameters>({
    architecture: "Transformer Decoder",
    hiddenSize: 4096,
    numLayers: 32,
    numHeads: 32,
    vocabSize: 128256,
    sequenceLength: 8192,
    batchSize: 32,
    microBatchSizePerGPU: 2,
    numGPUs: 8
  });

  const [optimizationFlags, setOptimizationFlags] = useState<OptimizationFlags>({
    flashAttention: true,
    gradientCheckpointFactor: 1.0,
    zeroStage: 0,
    cpuOffloadPct: 0,
    moe: {
      enabled: false,
      experts: 8,
      topK: 2
    },
    lora: {
      enabled: false,
      rank: 64,
      alpha: 128
    },
    sequenceParallelism: 1,
    kvCachePrecision: "fp16",
    sparsity24: false,
    activationCheckpointing: false,
    quantization: {
      enabled: false,
      bits: 8,
      type: "int"
    }
  });

  const [hardwareConfig, setHardwareConfig] = useState<HardwareConfig>({
    gpuType: "H100-80-SXM",
    memoryPerGPU: 80,
    precision: "bf16",
    interconnect: "NVLink"
  });

  const [costEnergyParams, setCostEnergyParams] = useState<CostEnergyParams>({
    trainingSteps: 100000,
    tokensPerSecondPerGPU: 3000,
    gridCarbonIntensity: 0.386,
    powerPerGPU: 700,
    costPerGPUHour: 4.00
  });

  const [selectedPreset, setSelectedPreset] = useState("custom");
  const [openSections, setOpenSections] = useState<string[]>(["model"]);

  // URL state management
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const configString = params.get('config');
    if (configString) {
      try {
        const config = JSON.parse(atob(configString));
        if (config.modelParams) setModelParams(config.modelParams);
        if (config.optimizationFlags) setOptimizationFlags(config.optimizationFlags);
        if (config.hardwareConfig) setHardwareConfig(config.hardwareConfig);
        if (config.costEnergyParams) setCostEnergyParams(config.costEnergyParams);
      } catch (error) {
        console.error('Failed to load configuration from URL:', error);
      }
    }
  }, []);

  const shareConfiguration = () => {
    const config = {
      modelParams,
      optimizationFlags,
      hardwareConfig,
      costEnergyParams
    };
    const encoded = btoa(JSON.stringify(config));
    const url = `${window.location.origin}${window.location.pathname}#config=${encoded}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Configuration Shared",
      description: "Shareable link copied to clipboard",
    });
  };

  // Enhanced memory calculations (same as original)
  const memoryCalculations = useMemo(() => {
    const { hiddenSize, numLayers, vocabSize, sequenceLength, batchSize, numGPUs } = modelParams;
    const { precision } = hardwareConfig;
    
    const bytesPerParam = {
      'fp32': 4,
      'fp16': 2,
      'bf16': 2,
      'int8': 1
    }[precision] || 2;

    let parameterCount = 0;
    if (modelParams.architecture.includes("Decoder")) {
      const attentionParams = numLayers * 4 * hiddenSize * hiddenSize;
      const ffnParams = numLayers * 8 * hiddenSize * hiddenSize;
      const embeddingParams = vocabSize * hiddenSize;
      const layerNormParams = numLayers * 2 * hiddenSize;
      
      parameterCount = attentionParams + ffnParams + embeddingParams + layerNormParams;
    }
    
    if (optimizationFlags.moe.enabled) {
      const expertParams = numLayers * optimizationFlags.moe.experts * 8 * hiddenSize * hiddenSize;
      parameterCount += expertParams;
    }

    if (optimizationFlags.lora.enabled) {
      const loraParams = numLayers * hiddenSize * optimizationFlags.lora.rank * 2;
      parameterCount += loraParams;
    }

    const modelSizeGB = (parameterCount * bytesPerParam) / (1024 ** 3);

    const activationBytesPerToken = hiddenSize * numLayers * bytesPerParam * 4;
    const activationMemoryGB = (batchSize * sequenceLength * activationBytesPerToken) / (1024 ** 3);
    
    const flashReduction = optimizationFlags.flashAttention ? 0.5 : 1.0;
    const checkpointReduction = optimizationFlags.activationCheckpointing ? optimizationFlags.gradientCheckpointFactor : 1.0;
    const adjustedActivationMemory = activationMemoryGB * flashReduction * checkpointReduction;

    const gradientMemoryGB = modelSizeGB;

    const zeroReductions = { 0: 1, 1: 0.5, 2: 0.25, 3: 0.125 };
    const optimizerMemoryGB = (modelSizeGB * 8 * zeroReductions[optimizationFlags.zeroStage]) / numGPUs;

    const kvCacheBytes = optimizationFlags.kvCachePrecision === "fp16" ? 2 : 
                        optimizationFlags.kvCachePrecision === "int8" ? 1 : 0.5;
    const kvCacheMemoryGB = (2 * numLayers * batchSize * sequenceLength * hiddenSize * kvCacheBytes) / (1024 ** 3);

    const totalMemoryPerGPU = (modelSizeGB + adjustedActivationMemory + gradientMemoryGB + optimizerMemoryGB + kvCacheMemoryGB) / numGPUs;
    const totalMemoryGB = totalMemoryPerGPU * numGPUs;

    return {
      parameterCount,
      modelSizeGB,
      activationMemoryGB: adjustedActivationMemory,
      gradientMemoryGB,
      optimizerMemoryGB,
      kvCacheMemoryGB,
      totalMemoryPerGPU,
      totalMemoryGB,
      diskSizeGB: modelSizeGB * 2.5,
      memoryEfficiency: (totalMemoryPerGPU / hardwareConfig.memoryPerGPU) * 100,
      quantizationReduction: optimizationFlags.quantization.enabled ? (16 / optimizationFlags.quantization.bits) : 1
    };
  }, [modelParams, optimizationFlags, hardwareConfig]);

  // Enhanced cost and energy calculations (same as original)
  const costEnergy = useMemo(() => {
    const selectedGpu = gpuOptions[hardwareConfig.gpuType as keyof typeof gpuOptions];
    if (!selectedGpu) return { trainingTimeHours: 0, totalCost: 0, energyKWh: 0, carbonKg: 0, totalTokens: 0, tokensPerSecondPerGPU: 3000, trainingSteps: costEnergyParams.trainingSteps, gridCarbonIntensity: costEnergyParams.gridCarbonIntensity };
    
    const totalTokens = costEnergyParams.trainingSteps * modelParams.batchSize * modelParams.sequenceLength;
    const trainingTimeHours = totalTokens / (costEnergyParams.tokensPerSecondPerGPU * modelParams.numGPUs * 3600);
    const totalCost = trainingTimeHours * selectedGpu.cost * modelParams.numGPUs;
    const energyKWh = (trainingTimeHours * selectedGpu.power * modelParams.numGPUs) / 1000;
    const carbonKg = energyKWh * costEnergyParams.gridCarbonIntensity;

    return {
      trainingTimeHours,
      totalCost,
      energyKWh,
      carbonKg,
      totalTokens,
      tokensPerSecondPerGPU: costEnergyParams.tokensPerSecondPerGPU,
      trainingSteps: costEnergyParams.trainingSteps,
      gridCarbonIntensity: costEnergyParams.gridCarbonIntensity
    };
  }, [costEnergyParams, modelParams, hardwareConfig]);

  const handlePresetChange = (presetName: string) => {
    setSelectedPreset(presetName);
    if (presetName in modelPresets) {
      const preset = modelPresets[presetName as keyof typeof modelPresets];
      setModelParams(prev => ({
        ...prev,
        ...preset
      }));
    }
  };

  const toggleAllSections = () => {
    if (openSections.length > 0) {
      setOpenSections([]);
    } else {
      setOpenSections(["model", "optimizations", "hardware"]);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-500 to-pink-500 bg-clip-text text-transparent">
            <Cpu className="h-6 w-6" />
            Enhanced LLM Memory & Capacity Planner
          </CardTitle>
          <p className="text-muted-foreground">
            Estimate VRAM, training time, cost, and environmental impact with advanced optimizations.
          </p>
        </CardHeader>
        <CardContent>
          {/* Model Presets Section */}
          <div className="mb-6">
            <ModelPresets
              selectedPreset={selectedPreset}
              onPresetChange={handlePresetChange}
              onShareConfiguration={shareConfiguration}
            />
          </div>

          {/* Configuration Sections - Collapsible */}
          <Card className="mb-8">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Configuration</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAllSections}
                  className="flex items-center gap-2"
                >
                  {openSections.length > 0 ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Collapse All
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Expand All
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Configure your model parameters, optimizations, and hardware settings
              </p>
            </CardHeader>
            <CardContent>
              <Accordion 
                type="multiple" 
                value={openSections} 
                onValueChange={setOpenSections}
                className="space-y-4"
              >
                <AccordionItem value="model" className="border rounded-lg px-4">
                  <AccordionTrigger className="flex items-center gap-2 hover:no-underline">
                    <Settings className="h-4 w-4" />
                    <span className="font-medium">Model Configuration</span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <EnhancedModelConfig
                      modelParams={modelParams}
                      setModelParams={setModelParams}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="optimizations" className="border rounded-lg px-4">
                  <AccordionTrigger className="flex items-center gap-2 hover:no-underline">
                    <Sliders className="h-4 w-4" />
                    <span className="font-medium">Advanced Optimizations</span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <EnhancedAdvancedOptimizations
                      optimizationFlags={optimizationFlags}
                      setOptimizationFlags={setOptimizationFlags}
                      precision={hardwareConfig.precision}
                      onPrecisionChange={(precision) => 
                        setHardwareConfig(prev => ({ ...prev, precision }))
                      }
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="hardware" className="border rounded-lg px-4">
                  <AccordionTrigger className="flex items-center gap-2 hover:no-underline">
                    <HardDrive className="h-4 w-4" />
                    <span className="font-medium">Hardware Configuration</span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <HardwareConfiguration
                      hardwareConfig={hardwareConfig}
                      setHardwareConfig={setHardwareConfig}
                      modelParams={modelParams}
                      setModelParams={setModelParams}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Main Memory Requirements */}
            <EstimatedMemoryRequirements
              calculations={memoryCalculations}
              hardwareConfig={hardwareConfig}
              modelParams={modelParams}
            />
            
            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MemoryBreakdownChart data={memoryCalculations} />
              
              <InferenceMemoryChart 
                data={{
                  modelSizeGB: memoryCalculations.modelSizeGB,
                  kvCacheMemoryGB: memoryCalculations.kvCacheMemoryGB,
                  totalAvailableGB: hardwareConfig.memoryPerGPU
                }}
              />
            </div>

            {/* Additional Information */}
            <QuantizationTable />
            
            {/* Export & Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Export & Share</CardTitle>
              </CardHeader>
              <CardContent>
                <ActionButtons 
                  data={{
                    modelParams,
                    optimizationFlags,
                    hardwareConfig,
                    calculations: memoryCalculations,
                    costEnergy
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedMemoryCalculator;
