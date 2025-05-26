
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Info, Zap, Cpu, HardDrive, DollarSign, Share2, Copy } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

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
    activationCheckpointing: false
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
    const params = new URLSearchParams(window.location.hash.slice(1));
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
    }[precision];

    // Model parameters calculation
    let parameterCount = 0;
    if (modelParams.architecture === "TX-DEC") {
      // Transformer decoder architecture
      parameterCount = (12 * numLayers * hiddenSize * hiddenSize) + (vocabSize * hiddenSize);
    }
    
    // MOE adjustment
    if (optimizationFlags.moe.enabled) {
      const expertParams = (8 * hiddenSize * hiddenSize) * optimizationFlags.moe.experts;
      parameterCount += expertParams;
    }

    const modelSizeGB = (parameterCount * bytesPerParam) / (1024 ** 3);

    // Activation memory with precision consideration
    const activationBytesPerToken = hiddenSize * numLayers * bytesPerParam;
    const activationMemoryGB = (batchSize * sequenceLength * activationBytesPerToken) / (1024 ** 3);
    
    // Flash attention reduction
    const flashReduction = optimizationFlags.flashAttention ? 0.5 : 1.0;
    const adjustedActivationMemory = activationMemoryGB * flashReduction;

    // Gradient memory with checkpointing
    const gradientMemoryGB = optimizationFlags.activationCheckpointing ? 
      modelSizeGB / optimizationFlags.gradientCheckpointFactor : modelSizeGB;

    // Optimizer memory based on ZeRO stage
    const zeroMultipliers = { 0: 8, 1: 4, 2: 2, 3: 1 };
    const optimizerMemoryGB = (modelSizeGB * zeroMultipliers[optimizationFlags.zeroStage]) / numGPUs;

    // KV cache memory
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
      memoryEfficiency: (totalMemoryPerGPU / hardwareConfig.memoryPerGPU) * 100
    };
  }, [modelParams, optimizationFlags, hardwareConfig]);

  // Cost and energy calculations
  const costEnergy = useMemo(() => {
    const totalTokens = costEnergyParams.trainingSteps * modelParams.batchSize * modelParams.sequenceLength;
    const trainingTimeHours = totalTokens / (costEnergyParams.tokensPerSecondPerGPU * modelParams.numGPUs * 3600);
    const totalCost = trainingTimeHours * costEnergyParams.costPerGPUHour * modelParams.numGPUs;
    const energyKWh = (trainingTimeHours * costEnergyParams.powerPerGPU * modelParams.numGPUs) / 1000;
    const carbonKg = energyKWh * costEnergyParams.gridCarbonIntensity;

    return {
      trainingTimeHours,
      totalCost,
      energyKWh,
      carbonKg
    };
  }, [costEnergyParams, modelParams]);

  const handlePresetChange = (presetName: string) => {
    setSelectedPreset(presetName);
    if (presetName in modelPresets) {
      setModelParams(prev => ({
        ...prev,
        ...modelPresets[presetName as keyof typeof modelPresets]
      }));
    }
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Advanced Memory Requirements Calculator
            </span>
            <Button variant="outline" size="sm" onClick={shareConfiguration}>
              <Share2 className="h-4 w-4 mr-2" />
              Share Config
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="model" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="model">Model</TabsTrigger>
              <TabsTrigger value="hardware">Hardware</TabsTrigger>
              <TabsTrigger value="optimization">Optimization</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="cost">Cost & Energy</TabsTrigger>
            </TabsList>

            <TabsContent value="model" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="model-preset">Model Preset</Label>
                  <Select value={selectedPreset} onValueChange={handlePresetChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a preset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="llama-7b">LLaMA 7B</SelectItem>
                      <SelectItem value="llama-13b">LLaMA 13B</SelectItem>
                      <SelectItem value="llama-70b">LLaMA 70B</SelectItem>
                      <SelectItem value="gpt-4-scale">GPT-4 Scale</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="architecture">Architecture</Label>
                  <Select value={modelParams.architecture} onValueChange={(value) => 
                    setModelParams(prev => ({ ...prev, architecture: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TX-DEC">Transformer Decoder</SelectItem>
                      <SelectItem value="TX-ENC-DEC">Encoder-Decoder</SelectItem>
                      <SelectItem value="TX-ENC">Encoder Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="hidden-size">Hidden Size</Label>
                  <Input
                    type="number"
                    value={modelParams.hiddenSize}
                    onChange={(e) => setModelParams(prev => ({
                      ...prev,
                      hiddenSize: parseInt(e.target.value) || 0
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="num-layers">Number of Layers</Label>
                  <Input
                    type="number"
                    value={modelParams.numLayers}
                    onChange={(e) => setModelParams(prev => ({
                      ...prev,
                      numLayers: parseInt(e.target.value) || 0
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="num-heads">Attention Heads</Label>
                  <Input
                    type="number"
                    value={modelParams.numHeads}
                    onChange={(e) => setModelParams(prev => ({
                      ...prev,
                      numHeads: parseInt(e.target.value) || 0
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="vocab-size">Vocabulary Size</Label>
                  <Input
                    type="number"
                    value={modelParams.vocabSize}
                    onChange={(e) => setModelParams(prev => ({
                      ...prev,
                      vocabSize: parseInt(e.target.value) || 0
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="sequence-length">Sequence Length</Label>
                  <Input
                    type="number"
                    value={modelParams.sequenceLength}
                    onChange={(e) => setModelParams(prev => ({
                      ...prev,
                      sequenceLength: parseInt(e.target.value) || 0
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="batch-size">Global Batch Size</Label>
                  <Input
                    type="number"
                    value={modelParams.batchSize}
                    onChange={(e) => setModelParams(prev => ({
                      ...prev,
                      batchSize: parseInt(e.target.value) || 0
                    }))}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="hardware" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gpu-type">GPU Type</Label>
                  <Select value={hardwareConfig.gpuType} onValueChange={handleHardwareChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(hardwareOptions).map(gpu => (
                        <SelectItem key={gpu} value={gpu}>{gpu}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="num-gpus">Number of GPUs</Label>
                  <Input
                    type="number"
                    value={modelParams.numGPUs}
                    onChange={(e) => setModelParams(prev => ({
                      ...prev,
                      numGPUs: parseInt(e.target.value) || 1
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="precision">Precision</Label>
                  <Select value={hardwareConfig.precision} onValueChange={(value: any) =>
                    setHardwareConfig(prev => ({ ...prev, precision: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fp32">FP32</SelectItem>
                      <SelectItem value="fp16">FP16</SelectItem>
                      <SelectItem value="bf16">BF16</SelectItem>
                      <SelectItem value="int8">INT8</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="memory-per-gpu">Memory per GPU (GB)</Label>
                  <Input
                    type="number"
                    value={hardwareConfig.memoryPerGPU}
                    onChange={(e) => setHardwareConfig(prev => ({
                      ...prev,
                      memoryPerGPU: parseFloat(e.target.value) || 0
                    }))}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="optimization" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={optimizationFlags.flashAttention}
                    onCheckedChange={(checked) => 
                      setOptimizationFlags(prev => ({ ...prev, flashAttention: checked }))
                    }
                  />
                  <Label>Flash Attention</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={optimizationFlags.activationCheckpointing}
                    onCheckedChange={(checked) => 
                      setOptimizationFlags(prev => ({ ...prev, activationCheckpointing: checked }))
                    }
                  />
                  <Label>Activation Checkpointing</Label>
                </div>
                <div>
                  <Label>ZeRO Stage</Label>
                  <Select 
                    value={optimizationFlags.zeroStage.toString()} 
                    onValueChange={(value) => 
                      setOptimizationFlags(prev => ({ 
                        ...prev, 
                        zeroStage: parseInt(value) as 0 | 1 | 2 | 3 
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Stage 0</SelectItem>
                      <SelectItem value="1">Stage 1</SelectItem>
                      <SelectItem value="2">Stage 2</SelectItem>
                      <SelectItem value="3">Stage 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>KV Cache Precision</Label>
                  <Select 
                    value={optimizationFlags.kvCachePrecision}
                    onValueChange={(value: any) => 
                      setOptimizationFlags(prev => ({ ...prev, kvCachePrecision: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fp16">FP16</SelectItem>
                      <SelectItem value="int8">INT8</SelectItem>
                      <SelectItem value="int4">INT4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={optimizationFlags.moe.enabled}
                    onCheckedChange={(checked) => 
                      setOptimizationFlags(prev => ({ 
                        ...prev, 
                        moe: { ...prev.moe, enabled: checked }
                      }))
                    }
                  />
                  <Label>Mixture of Experts (MoE)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={optimizationFlags.lora.enabled}
                    onCheckedChange={(checked) => 
                      setOptimizationFlags(prev => ({ 
                        ...prev, 
                        lora: { ...prev.lora, enabled: checked }
                      }))
                    }
                  />
                  <Label>LoRA Fine-tuning</Label>
                </div>
                {optimizationFlags.moe.enabled && (
                  <>
                    <div>
                      <Label>Number of Experts</Label>
                      <Input
                        type="number"
                        value={optimizationFlags.moe.experts}
                        onChange={(e) => setOptimizationFlags(prev => ({
                          ...prev,
                          moe: { ...prev.moe, experts: parseInt(e.target.value) || 8 }
                        }))}
                      />
                    </div>
                    <div>
                      <Label>Top-K Experts</Label>
                      <Input
                        type="number"
                        value={optimizationFlags.moe.topK}
                        onChange={(e) => setOptimizationFlags(prev => ({
                          ...prev,
                          moe: { ...prev.moe, topK: parseInt(e.target.value) || 2 }
                        }))}
                      />
                    </div>
                  </>
                )}
                {optimizationFlags.lora.enabled && (
                  <>
                    <div>
                      <Label>LoRA Rank</Label>
                      <Input
                        type="number"
                        value={optimizationFlags.lora.rank}
                        onChange={(e) => setOptimizationFlags(prev => ({
                          ...prev,
                          lora: { ...prev.lora, rank: parseInt(e.target.value) || 64 }
                        }))}
                      />
                    </div>
                    <div>
                      <Label>LoRA Alpha</Label>
                      <Input
                        type="number"
                        value={optimizationFlags.lora.alpha}
                        onChange={(e) => setOptimizationFlags(prev => ({
                          ...prev,
                          lora: { ...prev.lora, alpha: parseInt(e.target.value) || 128 }
                        }))}
                      />
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{memoryCalculations.totalMemoryGB.toFixed(2)} GB</div>
                    <p className="text-xs text-muted-foreground">Total Memory Required</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{(memoryCalculations.parameterCount / 1e9).toFixed(2)}B</div>
                    <p className="text-xs text-muted-foreground">Parameters</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{memoryCalculations.totalMemoryPerGPU.toFixed(2)} GB</div>
                    <p className="text-xs text-muted-foreground">Memory per GPU</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{memoryCalculations.memoryEfficiency.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">Memory Efficiency</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Model Weights</span>
                  <span>{memoryCalculations.modelSizeGB.toFixed(2)} GB</span>
                </div>
                <div className="flex justify-between">
                  <span>Activations</span>
                  <span>{memoryCalculations.activationMemoryGB.toFixed(2)} GB</span>
                </div>
                <div className="flex justify-between">
                  <span>Gradients</span>
                  <span>{memoryCalculations.gradientMemoryGB.toFixed(2)} GB</span>
                </div>
                <div className="flex justify-between">
                  <span>Optimizer States</span>
                  <span>{memoryCalculations.optimizerMemoryGB.toFixed(2)} GB</span>
                </div>
                <div className="flex justify-between">
                  <span>KV Cache</span>
                  <span>{memoryCalculations.kvCacheMemoryGB.toFixed(2)} GB</span>
                </div>
              </div>

              <Progress value={memoryCalculations.memoryEfficiency} className="w-full" />
              
              {memoryCalculations.memoryEfficiency > 95 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Memory usage is very high. Consider reducing batch size or enabling more optimizations.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="cost" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Training Steps</Label>
                  <Input
                    type="number"
                    value={costEnergyParams.trainingSteps}
                    onChange={(e) => setCostEnergyParams(prev => ({
                      ...prev,
                      trainingSteps: parseInt(e.target.value) || 0
                    }))}
                  />
                </div>
                <div>
                  <Label>Tokens/sec/GPU</Label>
                  <Input
                    type="number"
                    value={costEnergyParams.tokensPerSecondPerGPU}
                    onChange={(e) => setCostEnergyParams(prev => ({
                      ...prev,
                      tokensPerSecondPerGPU: parseInt(e.target.value) || 0
                    }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">${costEnergy.totalCost.toFixed(0)}</div>
                    <p className="text-xs text-muted-foreground">Total Training Cost</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{costEnergy.trainingTimeHours.toFixed(1)} hrs</div>
                    <p className="text-xs text-muted-foreground">Training Time</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{costEnergy.energyKWh.toFixed(0)} kWh</div>
                    <p className="text-xs text-muted-foreground">Energy Consumption</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{costEnergy.carbonKg.toFixed(1)} kg</div>
                    <p className="text-xs text-muted-foreground">CO₂ Emissions</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MemoryCalculator;
