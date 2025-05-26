import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cpu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Import new components
import ModelPresets, { modelPresets } from "./memory-calculator/ModelPresets";
import AdvancedOptimizations from "./memory-calculator/AdvancedOptimizations";
import HardwareConfiguration, { gpuOptions } from "./memory-calculator/HardwareConfiguration";
import ResultsPanel from "./memory-calculator/ResultsPanel";
import QuantizationTable from "./memory-calculator/QuantizationTable";
import ActionButtons from "./memory-calculator/ActionButtons";

// Enhanced type definitions
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

const MemoryCalculator: React.FC = () => {
  const { toast } = useToast();
  
  // Enhanced state with defaults matching live version
  const [modelParams, setModelParams] = useState<ModelParameters>({
    architecture: "TX-DEC",
    hiddenSize: 4096,
    numLayers: 32,
    numHeads: 32,
    vocabSize: 128256,
    sequenceLength: 8192,
    batchSize: 64,
    microBatchSizePerGPU: 4,
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

  // Hardware options
  const hardwareOptions = {
    "H100-80-SXM": { memory: 80, power: 700, cost: 4.00 },
    "H100-80-PCIe": { memory: 80, power: 700, cost: 3.50 },
    "A100-80-SXM": { memory: 80, power: 400, cost: 2.50 },
    "A100-40-SXM": { memory: 40, power: 400, cost: 2.00 },
    "V100-32": { memory: 32, power: 300, cost: 1.50 },
    "RTX4090": { memory: 24, power: 450, cost: 1.20 },
    "A6000": { memory: 48, power: 300, cost: 1.80 }
  };

  // Model presets matching live version
  const modelPresets = {
    "llama-7b": {
      architecture: "TX-DEC",
      hiddenSize: 4096,
      numLayers: 32,
      numHeads: 32,
      vocabSize: 32000,
      sequenceLength: 4096,
      batchSize: 32,
      microBatchSizePerGPU: 4,
      numGPUs: 4
    },
    "llama-13b": {
      architecture: "TX-DEC",
      hiddenSize: 5120,
      numLayers: 40,
      numHeads: 40,
      vocabSize: 32000,
      sequenceLength: 4096,
      batchSize: 32,
      microBatchSizePerGPU: 2,
      numGPUs: 8
    },
    "llama-70b": {
      architecture: "TX-DEC",
      hiddenSize: 8192,
      numLayers: 80,
      numHeads: 64,
      vocabSize: 32000,
      sequenceLength: 4096,
      batchSize: 16,
      microBatchSizePerGPU: 1,
      numGPUs: 16
    },
    "gpt-4-scale": {
      architecture: "TX-DEC",
      hiddenSize: 12288,
      numLayers: 96,
      numHeads: 96,
      vocabSize: 100000,
      sequenceLength: 8192,
      batchSize: 8,
      microBatchSizePerGPU: 1,
      numGPUs: 32
    }
  };

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

  const updateURL = () => {
    const config = {
      modelParams,
      optimizationFlags,
      hardwareConfig,
      costEnergyParams
    };
    const encoded = btoa(JSON.stringify(config));
    const url = `${window.location.origin}${window.location.pathname}#config=${encoded}`;
    window.location.hash = `config=${encoded}`;
  };

  const shareConfiguration = () => {
    updateURL();
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Configuration Shared",
      description: "URL copied to clipboard",
    });
  };

  const exportData = () => {
    const data = {
      modelParams,
      optimizationFlags,
      hardwareConfig,
      costEnergyParams,
      results: memoryCalculations,
      costEnergy,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'memory-calculator-config.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data Exported",
      description: "Configuration saved as JSON file",
    });
  };

  // Enhanced memory calculations
  const memoryCalculations = useMemo(() => {
    const { hiddenSize, numLayers, vocabSize, sequenceLength, batchSize, numGPUs } = modelParams;
    const { precision } = hardwareConfig;
    
    // Bytes per parameter based on precision
    const bytesPerParam = {
      'fp32': 4,
      'fp16': 2,
      'bf16': 2,
      'int8': 1
    }[precision] || 2;

    // Enhanced parameter calculation with MoE support
    let parameterCount = 0;
    if (modelParams.architecture.includes("Decoder")) {
      // Transformer decoder architecture with proper scaling
      const attentionParams = numLayers * 4 * hiddenSize * hiddenSize; // Q, K, V, O projections
      const ffnParams = numLayers * 8 * hiddenSize * hiddenSize; // Standard 4x expansion
      const embeddingParams = vocabSize * hiddenSize;
      const layerNormParams = numLayers * 2 * hiddenSize;
      
      parameterCount = attentionParams + ffnParams + embeddingParams + layerNormParams;
    }
    
    // MOE adjustment with proper expert scaling
    if (optimizationFlags.moe.enabled) {
      const expertParams = numLayers * optimizationFlags.moe.experts * 8 * hiddenSize * hiddenSize;
      parameterCount += expertParams;
    }

    // LoRA adjustment
    if (optimizationFlags.lora.enabled) {
      const loraParams = numLayers * hiddenSize * optimizationFlags.lora.rank * 2;
      parameterCount += loraParams;
    }

    const modelSizeGB = (parameterCount * bytesPerParam) / (1024 ** 3);

    // Enhanced activation memory calculation
    const activationBytesPerToken = hiddenSize * numLayers * bytesPerParam * 4; // More realistic estimate
    const activationMemoryGB = (batchSize * sequenceLength * activationBytesPerToken) / (1024 ** 3);
    
    // Flash attention and gradient checkpointing reductions
    const flashReduction = optimizationFlags.flashAttention ? 0.5 : 1.0;
    const checkpointReduction = optimizationFlags.activationCheckpointing ? optimizationFlags.gradientCheckpointFactor : 1.0;
    const adjustedActivationMemory = activationMemoryGB * flashReduction * checkpointReduction;

    // Enhanced gradient memory calculation
    const gradientMemoryGB = modelSizeGB; // Gradients same size as model

    // Enhanced optimizer memory based on ZeRO stage
    const zeroReductions = { 0: 1, 1: 0.5, 2: 0.25, 3: 0.125 };
    const optimizerMemoryGB = (modelSizeGB * 8 * zeroReductions[optimizationFlags.zeroStage]) / numGPUs; // Adam needs 8x model size

    // Enhanced KV cache memory
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

  // Enhanced cost and energy calculations
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

  const exportData = () => {
    const data = {
      modelParams,
      optimizationFlags,
      hardwareConfig,
      costEnergyParams,
      results: memoryCalculations,
      costEnergy,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'memory-calculator-config.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data Exported",
      description: "Configuration saved as JSON file",
    });
  };

  const handleHardwareChange = (gpuType: string) => {
    const hardware = hardwareOptions[gpuType as keyof typeof hardwareOptions];
    if (hardware) {
      setHardwareConfig(prev => ({
        ...prev,
        gpuType,
        memoryPerGPU: hardware.memory
      }));
      setCostEnergyParams(prev => ({
        ...prev,
        powerPerGPU: hardware.power,
        costPerGPUHour: hardware.cost
      }));
    }
  };

  // Training breakdown pie chart data
  const trainingBreakdownData = [
    { name: 'Model Weights', value: memoryCalculations.modelSizeGB, color: '#8884d8' },
    { name: 'Activations', value: memoryCalculations.activationMemoryGB, color: '#82ca9d' },
    { name: 'Gradients', value: memoryCalculations.gradientMemoryGB, color: '#ffc658' },
    { name: 'Optimizer', value: memoryCalculations.optimizerMemoryGB, color: '#ff7300' },
    { name: 'KV Cache', value: memoryCalculations.kvCacheMemoryGB, color: '#8dd1e1' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-6 w-6" />
            Enhanced LLM Memory & Capacity Planner
          </CardTitle>
          <p className="text-muted-foreground">
            Estimate VRAM, training time, cost, and environmental impact with advanced optimizations.
          </p>
        </CardHeader>
        <CardContent>
          <ModelPresets
            selectedPreset={selectedPreset}
            onPresetChange={handlePresetChange}
            onShareConfiguration={shareConfiguration}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Configuration */}
            <div className="space-y-6">
              {/* Model Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">1. Model Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Architecture</Label>
                    <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                      <div className="font-medium">{modelParams.architecture}</div>
                      {modelParams.architecture.includes("MoE") && (
                        <div className="text-sm text-muted-foreground mt-1">
                          Sparse MLP layers. Total params >> Active params.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Hidden Size (d_model)</Label>
                      <Input
                        type="number"
                        value={modelParams.hiddenSize}
                        onChange={(e) => setModelParams(prev => ({
                          ...prev,
                          hiddenSize: parseInt(e.target.value) || 0
                        }))}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Number of Layers (L)</Label>
                      <Input
                        type="number"
                        value={modelParams.numLayers}
                        onChange={(e) => setModelParams(prev => ({
                          ...prev,
                          numLayers: parseInt(e.target.value) || 0
                        }))}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Attention Heads</Label>
                      <Input
                        type="number"
                        value={modelParams.numHeads}
                        onChange={(e) => setModelParams(prev => ({
                          ...prev,
                          numHeads: parseInt(e.target.value) || 0
                        }))}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Vocabulary Size (V)</Label>
                      <Input
                        type="number"
                        value={modelParams.vocabSize}
                        onChange={(e) => setModelParams(prev => ({
                          ...prev,
                          vocabSize: parseInt(e.target.value) || 0
                        }))}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Sequence Length (S) (tokens)</Label>
                      <Input
                        type="number"
                        value={modelParams.sequenceLength}
                        onChange={(e) => setModelParams(prev => ({
                          ...prev,
                          sequenceLength: parseInt(e.target.value) || 0
                        }))}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Target Global Batch Size (B)</Label>
                      <Input
                        type="number"
                        value={modelParams.batchSize}
                        onChange={(e) => setModelParams(prev => ({
                          ...prev,
                          batchSize: parseInt(e.target.value) || 0
                        }))}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Micro Batch Size / GPU</Label>
                    <Input
                      type="number"
                      value={modelParams.microBatchSizePerGPU}
                      onChange={(e) => setModelParams(prev => ({
                        ...prev,
                        microBatchSizePerGPU: parseInt(e.target.value) || 0
                      }))}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <AdvancedOptimizations
                optimizationFlags={optimizationFlags}
                setOptimizationFlags={setOptimizationFlags}
                precision={hardwareConfig.precision}
                onPrecisionChange={(precision) => 
                  setHardwareConfig(prev => ({ ...prev, precision }))
                }
              />

              <HardwareConfiguration
                hardwareConfig={hardwareConfig}
                setHardwareConfig={setHardwareConfig}
                modelParams={modelParams}
                setModelParams={setModelParams}
              />
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              <ResultsPanel
                calculations={memoryCalculations}
                costEnergy={costEnergy}
                hardwareConfig={hardwareConfig}
                modelParams={modelParams}
                optimizationFlags={optimizationFlags}
              />
            </div>
          </div>

          <div className="mt-8 space-y-6">
            <QuantizationTable />
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
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

export default MemoryCalculator;
