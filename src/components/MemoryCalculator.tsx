
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Info, Zap, Cpu, HardDrive, DollarSign, Share2, Download, BarChart3 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

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

    // LoRA adjustment
    if (optimizationFlags.lora.enabled) {
      const loraParams = numLayers * hiddenSize * optimizationFlags.lora.rank * 2;
      parameterCount += loraParams;
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

    // Disk size calculation
    const diskSizeGB = modelSizeGB * 2.5; // Account for checkpoints, logs, etc.

    // Quantization impact
    const quantizationReduction = optimizationFlags.quantization.enabled ? 
      (16 / optimizationFlags.quantization.bits) : 1;

    return {
      parameterCount,
      modelSizeGB,
      activationMemoryGB: adjustedActivationMemory,
      gradientMemoryGB,
      optimizerMemoryGB,
      kvCacheMemoryGB,
      totalMemoryPerGPU,
      totalMemoryGB,
      diskSizeGB,
      memoryEfficiency: (totalMemoryPerGPU / hardwareConfig.memoryPerGPU) * 100,
      quantizationReduction
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
      carbonKg,
      totalTokens
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
          <CardTitle className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                Enhanced LLM Memory & Capacity Planner
              </span>
              <p className="text-sm text-muted-foreground font-normal mt-1">
                Estimate VRAM, training time, cost, and environmental impact with advanced optimizations.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={shareConfiguration}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Configuration */}
            <div className="space-y-6">
              {/* Model Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Model Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Model Preset</Label>
                      <Select value={selectedPreset} onValueChange={handlePresetChange}>
                        <SelectTrigger>
                          <SelectValue />
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
                      <Label>Architecture</Label>
                      <Select value={modelParams.architecture} onValueChange={(value) => 
                        setModelParams(prev => ({ ...prev, architecture: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TX-DEC">Transformer Decoder</SelectItem>
                          <SelectItem value="TX-ENC-DEC">Encoder-Decoder</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Hidden Size</Label>
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
                      <Label>Number of Layers</Label>
                      <Input
                        type="number"
                        value={modelParams.numLayers}
                        onChange={(e) => setModelParams(prev => ({
                          ...prev,
                          numLayers: parseInt(e.target.value) || 0
                        }))}
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
                      />
                    </div>
                    <div>
                      <Label>Vocabulary Size</Label>
                      <Input
                        type="number"
                        value={modelParams.vocabSize}
                        onChange={(e) => setModelParams(prev => ({
                          ...prev,
                          vocabSize: parseInt(e.target.value) || 0
                        }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Sequence Length</Label>
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
                      <Label>Global Batch Size</Label>
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
                </CardContent>
              </Card>

              {/* Hardware Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Hardware Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>GPU Type</Label>
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
                      <Label>Number of GPUs</Label>
                      <Input
                        type="number"
                        value={modelParams.numGPUs}
                        onChange={(e) => setModelParams(prev => ({
                          ...prev,
                          numGPUs: parseInt(e.target.value) || 1
                        }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Precision</Label>
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
                      <Label>Memory per GPU (GB)</Label>
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
                </CardContent>
              </Card>

              {/* Optimization Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Optimization Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Flash Attention</Label>
                      <Switch
                        checked={optimizationFlags.flashAttention}
                        onCheckedChange={(checked) => 
                          setOptimizationFlags(prev => ({ ...prev, flashAttention: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Activation Checkpointing</Label>
                      <Switch
                        checked={optimizationFlags.activationCheckpointing}
                        onCheckedChange={(checked) => 
                          setOptimizationFlags(prev => ({ ...prev, activationCheckpointing: checked }))
                        }
                      />
                    </div>

                    <div>
                      <Label>Gradient Checkpointing Factor: {optimizationFlags.gradientCheckpointFactor}</Label>
                      <Slider
                        value={[optimizationFlags.gradientCheckpointFactor]}
                        onValueChange={([value]) => 
                          setOptimizationFlags(prev => ({ ...prev, gradientCheckpointFactor: value }))
                        }
                        min={0.1}
                        max={2.0}
                        step={0.1}
                        className="mt-2"
                      />
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
                          <SelectItem value="0">Stage 0 - No sharding</SelectItem>
                          <SelectItem value="1">Stage 1 - Optimizer sharding</SelectItem>
                          <SelectItem value="2">Stage 2 - Optimizer + gradient sharding</SelectItem>
                          <SelectItem value="3">Stage 3 - Full parameter sharding</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* MoE Settings */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Mixture of Experts (MoE)</Label>
                        <Switch
                          checked={optimizationFlags.moe.enabled}
                          onCheckedChange={(checked) => 
                            setOptimizationFlags(prev => ({ 
                              ...prev, 
                              moe: { ...prev.moe, enabled: checked }
                            }))
                          }
                        />
                      </div>
                      
                      {optimizationFlags.moe.enabled && (
                        <div className="grid grid-cols-2 gap-2 ml-4">
                          <div>
                            <Label className="text-sm">Experts</Label>
                            <Input
                              type="number"
                              size="sm"
                              value={optimizationFlags.moe.experts}
                              onChange={(e) => setOptimizationFlags(prev => ({
                                ...prev,
                                moe: { ...prev.moe, experts: parseInt(e.target.value) || 8 }
                              }))}
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Top-K</Label>
                            <Input
                              type="number"
                              size="sm"
                              value={optimizationFlags.moe.topK}
                              onChange={(e) => setOptimizationFlags(prev => ({
                                ...prev,
                                moe: { ...prev.moe, topK: parseInt(e.target.value) || 2 }
                              }))}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* LoRA Settings */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>LoRA Fine-tuning</Label>
                        <Switch
                          checked={optimizationFlags.lora.enabled}
                          onCheckedChange={(checked) => 
                            setOptimizationFlags(prev => ({ 
                              ...prev, 
                              lora: { ...prev.lora, enabled: checked }
                            }))
                          }
                        />
                      </div>
                      
                      {optimizationFlags.lora.enabled && (
                        <div className="grid grid-cols-2 gap-2 ml-4">
                          <div>
                            <Label className="text-sm">Rank</Label>
                            <Input
                              type="number"
                              size="sm"
                              value={optimizationFlags.lora.rank}
                              onChange={(e) => setOptimizationFlags(prev => ({
                                ...prev,
                                lora: { ...prev.lora, rank: parseInt(e.target.value) || 64 }
                              }))}
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Alpha</Label>
                            <Input
                              type="number"
                              size="sm"
                              value={optimizationFlags.lora.alpha}
                              onChange={(e) => setOptimizationFlags(prev => ({
                                ...prev,
                                lora: { ...prev.lora, alpha: parseInt(e.target.value) || 128 }
                              }))}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quantization Settings */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Quantization</Label>
                        <Switch
                          checked={optimizationFlags.quantization.enabled}
                          onCheckedChange={(checked) => 
                            setOptimizationFlags(prev => ({ 
                              ...prev, 
                              quantization: { ...prev.quantization, enabled: checked }
                            }))
                          }
                        />
                      </div>
                      
                      {optimizationFlags.quantization.enabled && (
                        <div className="grid grid-cols-2 gap-2 ml-4">
                          <div>
                            <Label className="text-sm">Bits</Label>
                            <Select 
                              value={optimizationFlags.quantization.bits.toString()}
                              onValueChange={(value) => 
                                setOptimizationFlags(prev => ({ 
                                  ...prev, 
                                  quantization: { ...prev.quantization, bits: parseInt(value) as 4 | 8 | 16 }
                                }))
                              }
                            >
                              <SelectTrigger size="sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="4">4-bit</SelectItem>
                                <SelectItem value="8">8-bit</SelectItem>
                                <SelectItem value="16">16-bit</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-sm">Type</Label>
                            <Select 
                              value={optimizationFlags.quantization.type}
                              onValueChange={(value: "int" | "float") => 
                                setOptimizationFlags(prev => ({ 
                                  ...prev, 
                                  quantization: { ...prev.quantization, type: value }
                                }))
                              }
                            >
                              <SelectTrigger size="sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="int">Integer</SelectItem>
                                <SelectItem value="float">Float</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Results */}
            <div className="space-y-6">
              {/* Parameter & Training Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Parameter & Training Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {(memoryCalculations.parameterCount / 1e9).toFixed(2)}B
                      </div>
                      <div className="text-sm text-muted-foreground">Parameters</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {memoryCalculations.totalMemoryGB.toFixed(1)} GB
                      </div>
                      <div className="text-sm text-muted-foreground">Total Memory</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        ${costEnergy.totalCost.toFixed(0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Training Cost</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {costEnergy.trainingTimeHours.toFixed(1)}h
                      </div>
                      <div className="text-sm text-muted-foreground">Training Time</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Memory Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Memory Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span>Model Weights:</span>
                        <span className="font-medium">{memoryCalculations.modelSizeGB.toFixed(2)} GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Activations:</span>
                        <span className="font-medium">{memoryCalculations.activationMemoryGB.toFixed(2)} GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gradients:</span>
                        <span className="font-medium">{memoryCalculations.gradientMemoryGB.toFixed(2)} GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Optimizer:</span>
                        <span className="font-medium">{memoryCalculations.optimizerMemoryGB.toFixed(2)} GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>KV Cache:</span>
                        <span className="font-medium">{memoryCalculations.kvCacheMemoryGB.toFixed(2)} GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Per GPU:</span>
                        <span className="font-medium">{memoryCalculations.totalMemoryPerGPU.toFixed(2)} GB</span>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Memory Efficiency</span>
                        <span className="text-sm">{memoryCalculations.memoryEfficiency.toFixed(1)}%</span>
                      </div>
                      <Progress value={memoryCalculations.memoryEfficiency} className="h-2" />
                    </div>
                    
                    {memoryCalculations.memoryEfficiency > 95 && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Memory usage is very high. Consider reducing batch size or enabling more optimizations.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Training Breakdown Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Training Memory Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={trainingBreakdownData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {trainingBreakdownData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `${value.toFixed(2)} GB`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Storage & Environment */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Storage & Environment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <HardDrive className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <div className="text-lg font-bold">{memoryCalculations.diskSizeGB.toFixed(1)} GB</div>
                      <div className="text-sm text-muted-foreground">Disk Size</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                      <div className="text-lg font-bold">{costEnergy.energyKWh.toFixed(0)} kWh</div>
                      <div className="text-sm text-muted-foreground">Energy Usage</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-lg font-bold">{costEnergy.carbonKg.toFixed(1)} kg</div>
                      <div className="text-sm text-muted-foreground">CO₂ Emissions</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-lg font-bold">{(costEnergy.totalTokens / 1e9).toFixed(2)}B</div>
                      <div className="text-sm text-muted-foreground">Total Tokens</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quantization Impact (if enabled) */}
              {optimizationFlags.quantization.enabled && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quantization Impact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Memory Reduction:</span>
                        <Badge variant="secondary">
                          {((1 - 1/memoryCalculations.quantizationReduction) * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Quantized Size:</span>
                        <span className="font-medium">
                          {(memoryCalculations.modelSizeGB / memoryCalculations.quantizationReduction).toFixed(2)} GB
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Precision:</span>
                        <span className="font-medium">
                          {optimizationFlags.quantization.bits}-bit {optimizationFlags.quantization.type}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MemoryCalculator;
