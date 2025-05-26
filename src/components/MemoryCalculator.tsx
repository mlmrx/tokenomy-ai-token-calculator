import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Define the types for the model parameters
interface ModelParams {
  batchSize: number;
  sequenceLength: number;
  hiddenSize: number;
  numLayers: number;
  numHeads: number;
  vocabSize: number;
  microBatchSizePerGPU: number;
}

// Define the types for the memory flags
interface MemoryFlags {
  flashAttention: boolean;
  gradientCheckpointFactor: number;
  zeroStage: number;
  cpuOffloadPct: number;
  moe: boolean;
  lora: boolean;
  sequenceParallelism: boolean;
  kvCachePrecision: string;
  sparsity24: boolean;
}

// Define the types for the cost and energy parameters
interface CostEnergyParams {
  trainingSteps: number;
  tokensPerSecondPerGPU: number;
  gridCarbonIntensity: number;
}

// Define the types for the model presets
interface ModelPreset {
  batchSize: number;
  sequenceLength: number;
  hiddenSize: number;
  numLayers: number;
  numHeads: number;
  vocabSize: number;
  microBatchSizePerGPU: number;
  flashAttention: boolean;
  gradientCheckpointFactor: number;
  zeroStage: number;
  cpuOffloadPct: number;
  moe: boolean;
  lora: boolean;
  sequenceParallelism: boolean;
  kvCachePrecision: string;
  sparsity24: boolean;
  trainingSteps: number;
  tokensPerSecondPerGPU: number;
  gridCarbonIntensity: number;
}

// Define the model presets
const modelPresets: Record<string, ModelPreset> = {
  "gpt-3": {
    batchSize: 32,
    sequenceLength: 2048,
    hiddenSize: 12288,
    numLayers: 24,
    numHeads: 96,
    vocabSize: 50257,
    microBatchSizePerGPU: 4,
    flashAttention: true,
    gradientCheckpointFactor: 1,
    zeroStage: 2,
    cpuOffloadPct: 0,
    moe: false,
    lora: false,
    sequenceParallelism: false,
    kvCachePrecision: "fp16",
    sparsity24: false,
    trainingSteps: 100000,
    tokensPerSecondPerGPU: 1000,
    gridCarbonIntensity: 300
  },
  "gpt-j": {
    batchSize: 16,
    sequenceLength: 2048,
    hiddenSize: 4096,
    numLayers: 28,
    numHeads: 16,
    vocabSize: 50400,
    microBatchSizePerGPU: 2,
    flashAttention: true,
    gradientCheckpointFactor: 1,
    zeroStage: 2,
    cpuOffloadPct: 0,
    moe: false,
    lora: false,
    sequenceParallelism: false,
    kvCachePrecision: "fp16",
    sparsity24: false,
    trainingSteps: 50000,
    tokensPerSecondPerGPU: 800,
    gridCarbonIntensity: 250
  },
  "llama-7b": {
    batchSize: 32,
    sequenceLength: 2048,
    hiddenSize: 4096,
    numLayers: 32,
    numHeads: 32,
    vocabSize: 32000,
    microBatchSizePerGPU: 4,
    flashAttention: true,
    gradientCheckpointFactor: 1,
    zeroStage: 2,
    cpuOffloadPct: 0,
    moe: false,
    lora: false,
    sequenceParallelism: false,
    kvCachePrecision: "fp16",
    sparsity24: false,
    trainingSteps: 75000,
    tokensPerSecondPerGPU: 900,
    gridCarbonIntensity: 280
  },
  "llama-65b": {
    batchSize: 16,
    sequenceLength: 2048,
    hiddenSize: 8192,
    numLayers: 80,
    numHeads: 64,
    vocabSize: 32000,
    microBatchSizePerGPU: 2,
    flashAttention: true,
    gradientCheckpointFactor: 1,
    zeroStage: 2,
    cpuOffloadPct: 0,
    moe: false,
    lora: false,
    sequenceParallelism: false,
    kvCachePrecision: "fp16",
    sparsity24: false,
    trainingSteps: 120000,
    tokensPerSecondPerGPU: 700,
    gridCarbonIntensity: 320
  },
  "bloom-176b": {
    batchSize: 8,
    sequenceLength: 2048,
    hiddenSize: 14336,
    numLayers: 70,
    numHeads: 112,
    vocabSize: 250680,
    microBatchSizePerGPU: 1,
    flashAttention: true,
    gradientCheckpointFactor: 1,
    zeroStage: 3,
    cpuOffloadPct: 20,
    moe: false,
    lora: false,
    sequenceParallelism: false,
    kvCachePrecision: "fp16",
    sparsity24: false,
    trainingSteps: 150000,
    tokensPerSecondPerGPU: 600,
    gridCarbonIntensity: 350
  },
  "mistral-7b": {
    batchSize: 32,
    sequenceLength: 2048,
    hiddenSize: 4096,
    numLayers: 32,
    numHeads: 32,
    vocabSize: 32000,
    microBatchSizePerGPU: 4,
    flashAttention: true,
    gradientCheckpointFactor: 1,
    zeroStage: 2,
    cpuOffloadPct: 0,
    moe: false,
    lora: false,
    sequenceParallelism: false,
    kvCachePrecision: "fp16",
    sparsity24: false,
    trainingSteps: 75000,
    tokensPerSecondPerGPU: 950,
    gridCarbonIntensity: 270
  },
  "mixtral-8x7b": {
    batchSize: 16,
    sequenceLength: 2048,
    hiddenSize: 4096,
    numLayers: 32,
    numHeads: 32,
    vocabSize: 32000,
    microBatchSizePerGPU: 2,
    flashAttention: true,
    gradientCheckpointFactor: 1,
    zeroStage: 2,
    cpuOffloadPct: 0,
    moe: true,
    lora: false,
    sequenceParallelism: false,
    kvCachePrecision: "fp16",
    sparsity24: false,
    trainingSteps: 100000,
    tokensPerSecondPerGPU: 850,
    gridCarbonIntensity: 300
  }
};

const MemoryCalculator: React.FC = () => {
  const [modelParams, setModelParams] = useState<ModelParams>({
    batchSize: 32,
    sequenceLength: 2048,
    hiddenSize: 4096,
    numLayers: 32,
    numHeads: 32,
    vocabSize: 32000,
    microBatchSizePerGPU: 4
  });

  const [memoryFlags, setMemoryFlags] = useState<MemoryFlags>({
    flashAttention: true,
    gradientCheckpointFactor: 1,
    zeroStage: 2,
    cpuOffloadPct: 0,
    moe: false,
    lora: false,
    sequenceParallelism: false,
    kvCachePrecision: "fp16",
    sparsity24: false
  });

  const [costEnergyParams, setCostEnergyParams] = useState<CostEnergyParams>({
    trainingSteps: 75000,
    tokensPerSecondPerGPU: 900,
    gridCarbonIntensity: 280
  });

  const [numGPUs, setNumGPUs] = useState<number>(8);
  const [gpuMemory, setGPUMemory] = useState<number>(80); // in GB
  const [gpuPower, setGPUPower] = useState<number>(350); // in Watts

  const { toast } = useToast();

  // Function to handle model preset selection
  const handleModelPreset = (modelName: string) => {
    const preset = modelPresets[modelName];
    if (preset) {
      // Ensure all required properties are present
      setModelParams({
        batchSize: preset.batchSize || modelParams.batchSize,
        sequenceLength: preset.sequenceLength || modelParams.sequenceLength,
        hiddenSize: preset.hiddenSize || modelParams.hiddenSize,
        numLayers: preset.numLayers || modelParams.numLayers,
        numHeads: preset.numHeads || modelParams.numHeads,
        vocabSize: preset.vocabSize || modelParams.vocabSize,
        microBatchSizePerGPU: preset.microBatchSizePerGPU || modelParams.microBatchSizePerGPU
      });
      setMemoryFlags({
        flashAttention: preset.flashAttention !== undefined ? preset.flashAttention : memoryFlags.flashAttention,
        gradientCheckpointFactor: preset.gradientCheckpointFactor || memoryFlags.gradientCheckpointFactor,
        zeroStage: preset.zeroStage !== undefined ? preset.zeroStage : memoryFlags.zeroStage,
        cpuOffloadPct: preset.cpuOffloadPct || memoryFlags.cpuOffloadPct,
        moe: preset.moe || memoryFlags.moe,
        lora: preset.lora || memoryFlags.lora,
        sequenceParallelism: preset.sequenceParallelism || memoryFlags.sequenceParallelism,
        kvCachePrecision: preset.kvCachePrecision || memoryFlags.kvCachePrecision,
        sparsity24: preset.sparsity24 !== undefined ? preset.sparsity24 : memoryFlags.sparsity24
      });
      setCostEnergyParams({
        trainingSteps: preset.trainingSteps || costEnergyParams.trainingSteps,
        tokensPerSecondPerGPU: preset.tokensPerSecondPerGPU || costEnergyParams.tokensPerSecondPerGPU,
        gridCarbonIntensity: preset.gridCarbonIntensity || costEnergyParams.gridCarbonIntensity
      });
    }
  };

  // Calculation functions
  const calculateModelSize = useCallback(() => {
    const { hiddenSize, numLayers, numHeads, vocabSize } = modelParams;
    const { moe } = memoryFlags;

    let totalParams = numLayers * (12 * hiddenSize * hiddenSize + 4 * hiddenSize);
    totalParams += vocabSize * hiddenSize;
    totalParams += numLayers * numHeads * 3 * (hiddenSize / numHeads) * (hiddenSize / numHeads);

    if (moe) {
      totalParams *= 1.2; // Rough estimate for MoE models
    }

    return totalParams;
  }, [modelParams, memoryFlags]);

  const calculateActivationMemory = useCallback(() => {
    const { batchSize, sequenceLength, hiddenSize, microBatchSizePerGPU } = modelParams;
    const { gradientCheckpointFactor } = memoryFlags;

    let activationSize = 4 * batchSize * sequenceLength * hiddenSize; // fp32
    activationSize /= microBatchSizePerGPU; // Adjust for micro-batching

    if (gradientCheckpointFactor > 1) {
      activationSize /= gradientCheckpointFactor;
    }

    return activationSize;
  }, [modelParams, memoryFlags]);

  const calculateGradientMemory = useCallback(() => {
    const modelSize = calculateModelSize();
    return 4 * modelSize; // fp32 gradients
  }, [calculateModelSize]);

  const calculateOptimizerMemory = useCallback(() => {
    const modelSize = calculateModelSize();
    return 8 * modelSize; // Adam optimizer (fp32)
  }, [calculateModelSize]);

  const calculateKVMemory = useCallback(() => {
    const { batchSize, sequenceLength, numLayers, numHeads } = modelParams;
    const { kvCachePrecision, sequenceParallelism } = memoryFlags;

    let kvCacheSize = batchSize * sequenceLength * numLayers * numHeads * (hiddenSize / numHeads);

    if (kvCachePrecision === "fp16") {
      kvCacheSize *= 2;
    } else if (kvCachePrecision === "int8") {
      kvCacheSize /= 2;
    } else {
      kvCacheSize *= 4; // default to fp32
    }

    if (sequenceParallelism) {
      kvCacheSize /= 2;
    }

    return kvCacheSize;
  }, [modelParams, memoryFlags]);

  const calculateTotalMemory = useCallback(() => {
    const modelSize = calculateModelSize();
    const activationMemory = calculateActivationMemory();
    const gradientMemory = calculateGradientMemory();
    const optimizerMemory = calculateOptimizerMemory();
    const kvMemory = calculateKVMemory();
    const { zeroStage, cpuOffloadPct } = memoryFlags;

    let totalMemory = modelSize + activationMemory + gradientMemory + optimizerMemory + kvMemory;

    if (zeroStage > 0) {
      totalMemory /= numGPUs;
    }

    if (cpuOffloadPct > 0) {
      totalMemory *= (1 - cpuOffloadPct / 100);
    }

    return totalMemory;
  }, [calculateModelSize, calculateActivationMemory, calculateGradientMemory, calculateOptimizerMemory, calculateKVMemory, numGPUs, memoryFlags]);

  const calculateCost = useCallback(() => {
    const { trainingSteps, tokensPerSecondPerGPU } = costEnergyParams;
    const modelSize = calculateModelSize();
    const totalTokens = trainingSteps * tokensPerSecondPerGPU * numGPUs;
    const costPerToken = 0.000001; // Placeholder cost per token
    return totalTokens * costPerToken;
  }, [calculateModelSize, costEnergyParams, numGPUs]);

  const calculateEnergyConsumption = useCallback(() => {
    const { trainingSteps, tokensPerSecondPerGPU, gridCarbonIntensity } = costEnergyParams;
    const totalTrainingTime = trainingSteps / tokensPerSecondPerGPU; // in seconds
    const totalPowerConsumption = gpuPower * numGPUs * totalTrainingTime / 3600; // kWh
    const carbonFootprint = totalPowerConsumption * gridCarbonIntensity / 1000; // kgCO2
    return {
      powerConsumption: totalPowerConsumption,
      carbonFootprint: carbonFootprint
    };
  }, [costEnergyParams, gpuPower, numGPUs]);

  // Format bytes to human-readable format
  const formatBytes = (bytes: number) => {
    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    let unitIndex = 0;
    while (bytes > 1024 && unitIndex < units.length - 1) {
      bytes /= 1024;
      unitIndex++;
    }
    return `${bytes.toFixed(2)} ${units[unitIndex]}`;
  };

  const modelSize = calculateModelSize();
  const activationMemory = calculateActivationMemory();
  const gradientMemory = calculateGradientMemory();
  const optimizerMemory = calculateOptimizerMemory();
  const kvMemory = calculateKVMemory();
  const totalMemory = calculateTotalMemory();
  const cost = calculateCost();
  const energyConsumption = calculateEnergyConsumption();

  // Check if the model fits in the available GPU memory
  const modelFitsInGPUMemory = totalMemory <= gpuMemory * 1024 * 1024 * 1024;

  useEffect(() => {
    if (!modelFitsInGPUMemory) {
      toast({
        title: "Memory Alert",
        description: "The model may not fit in the available GPU memory. Consider reducing batch size, sequence length, or enabling memory optimization techniques.",
        variant: "destructive",
      });
    }
  }, [modelFitsInGPUMemory, toast]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">LLM Memory, Cost & Energy Calculator</h1>
      <Tabs defaultValue="model" className="space-y-4">
        <TabsList>
          <TabsTrigger value="model">Model Parameters</TabsTrigger>
          <TabsTrigger value="memory">Memory Flags</TabsTrigger>
          <TabsTrigger value="hardware">Hardware Setup</TabsTrigger>
          <TabsTrigger value="energy">Cost & Energy</TabsTrigger>
        </TabsList>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TabsContent value="model" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Model Parameters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="modelPreset">Model Preset</Label>
                  <Select onValueChange={handleModelPreset}>
                    <SelectTrigger id="modelPreset">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(modelPresets).map((modelName) => (
                        <SelectItem key={modelName} value={modelName}>{modelName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="batchSize">Batch Size</Label>
                  <Input
                    id="batchSize"
                    type="number"
                    value={modelParams.batchSize}
                    onChange={(e) => setModelParams({...modelParams, batchSize: parseInt(e.target.value) || 0})}
                    min={1}
                  />
                </div>
                <div>
                  <Label htmlFor="sequenceLength">Sequence Length</Label>
                  <Input
                    id="sequenceLength"
                    type="number"
                    value={modelParams.sequenceLength}
                    onChange={(e) => setModelParams({...modelParams, sequenceLength: parseInt(e.target.value) || 0})}
                    min={1}
                  />
                </div>
                <div>
                  <Label htmlFor="hiddenSize">Hidden Size</Label>
                  <Input
                    id="hiddenSize"
                    type="number"
                    value={modelParams.hiddenSize}
                    onChange={(e) => setModelParams({...modelParams, hiddenSize: parseInt(e.target.value) || 0})}
                    min={1}
                  />
                </div>
                <div>
                  <Label htmlFor="numLayers">Number of Layers</Label>
                  <Input
                    id="numLayers"
                    type="number"
                    value={modelParams.numLayers}
                    onChange={(e) => setModelParams({...modelParams, numLayers: parseInt(e.target.value) || 0})}
                    min={1}
                  />
                </div>
                <div>
                  <Label htmlFor="numHeads">Number of Heads</Label>
                  <Input
                    id="numHeads"
                    type="number"
                    value={modelParams.numHeads}
                    onChange={(e) => setModelParams({...modelParams, numHeads: parseInt(e.target.value) || 0})}
                    min={1}
                  />
                </div>
                <div>
                  <Label htmlFor="vocabSize">Vocabulary Size</Label>
                  <Input
                    id="vocabSize"
                    type="number"
                    value={modelParams.vocabSize}
                    onChange={(e) => setModelParams({...modelParams, vocabSize: parseInt(e.target.value) || 0})}
                    min={1}
                  />
                </div>
                <div>
                  <Label htmlFor="microBatchSizePerGPU">Micro Batch Size per GPU</Label>
                  <Input
                    id="microBatchSizePerGPU"
                    type="number"
                    value={modelParams.microBatchSizePerGPU}
                    onChange={(e) => setModelParams({...modelParams, microBatchSizePerGPU: parseInt(e.target.value) || 0})}
                    min={1}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="memory" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Memory Flags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="flashAttention">Flash Attention</Label>
                  <Switch
                    id="flashAttention"
                    checked={memoryFlags.flashAttention}
                    onCheckedChange={(checked) => setMemoryFlags({...memoryFlags, flashAttention: checked})}
                  />
                </div>
                <div>
                  <Label htmlFor="gradientCheckpointFactor">Gradient Checkpoint Factor</Label>
                  <Input
                    id="gradientCheckpointFactor"
                    type="number"
                    value={memoryFlags.gradientCheckpointFactor}
                    onChange={(e) => setMemoryFlags({...memoryFlags, gradientCheckpointFactor: parseInt(e.target.value) || 1})}
                    min={1}
                  />
                </div>
                <div>
                  <Label htmlFor="zeroStage">Zero Stage</Label>
                  <Select onValueChange={(value) => setMemoryFlags({...memoryFlags, zeroStage: parseInt(value) || 0})}>
                    <SelectTrigger id="zeroStage">
                      <SelectValue placeholder="Select Zero Stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0 (Disabled)</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cpuOffloadPct">CPU Offload (%)</Label>
                  <Input
                    id="cpuOffloadPct"
                    type="number"
                    value={memoryFlags.cpuOffloadPct}
                    onChange={(e) => setMemoryFlags({...memoryFlags, cpuOffloadPct: parseInt(e.target.value) || 0})}
                    min={0}
                    max={100}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="moe">Mixture of Experts (MoE)</Label>
                  <Switch
                    id="moe"
                    checked={memoryFlags.moe}
                    onCheckedChange={(checked) => setMemoryFlags({...memoryFlags, moe: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="lora">LoRA</Label>
                  <Switch
                    id="lora"
                    checked={memoryFlags.lora}
                    onCheckedChange={(checked) => setMemoryFlags({...memoryFlags, lora: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sequenceParallelism">Sequence Parallelism</Label>
                  <Switch
                    id="sequenceParallelism"
                    checked={memoryFlags.sequenceParallelism}
                    onCheckedChange={(checked) => setMemoryFlags({...memoryFlags, sequenceParallelism: checked})}
                  />
                </div>
                <div>
                  <Label htmlFor="kvCachePrecision">KV Cache Precision</Label>
                  <Select onValueChange={(value) => setMemoryFlags({...memoryFlags, kvCachePrecision: value})}>
                    <SelectTrigger id="kvCachePrecision">
                      <SelectValue placeholder="Select Precision" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fp32">FP32</SelectItem>
                      <SelectItem value="fp16">FP16</SelectItem>
                      <SelectItem value="int8">INT8</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sparsity24">Sparsity 2:4</Label>
                  <Switch
                    id="sparsity24"
                    checked={memoryFlags.sparsity24}
                    onCheckedChange={(checked) => setMemoryFlags({...memoryFlags, sparsity24: checked})}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="hardware" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hardware Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="numGPUs">Number of GPUs</Label>
                  <Input
                    id="numGPUs"
                    type="number"
                    value={numGPUs}
                    onChange={(e) => setNumGPUs(parseInt(e.target.value) || 1)}
                    min={1}
                  />
                </div>
                <div>
                  <Label htmlFor="gpuMemory">GPU Memory (GB)</Label>
                  <Input
                    id="gpuMemory"
                    type="number"
                    value={gpuMemory}
                    onChange={(e) => setGPUMemory(parseInt(e.target.value) || 1)}
                    min={1}
                  />
                </div>
                <div>
                  <Label htmlFor="gpuPower">GPU Power (Watts)</Label>
                  <Input
                    id="gpuPower"
                    type="number"
                    value={gpuPower}
                    onChange={(e) => setGPUPower(parseInt(e.target.value) || 1)}
                    min={1}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="energy" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Energy Parameters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="trainingSteps">Training Steps</Label>
                    <Input
                      id="trainingSteps"
                      type="number"
                      value={costEnergyParams.trainingSteps}
                      onChange={(e) => setCostEnergyParams({...costEnergyParams, trainingSteps: parseInt(e.target.value) || 0})}
                      min={1}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tokensPerSecondPerGPU">Tokens/sec per GPU</Label>
                    <Input
                      id="tokensPerSecondPerGPU"
                      type="number"
                      value={costEnergyParams.tokensPerSecondPerGPU}
                      onChange={(e) => setCostEnergyParams({...costEnergyParams, tokensPerSecondPerGPU: parseFloat(e.target.value) || 0})}
                      min={0}
                      step={0.1}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gridCarbonIntensity">Grid Carbon Intensity (gCO2/kWh)</Label>
                    <Input
                      id="gridCarbonIntensity"
                      type="number"
                      value={costEnergyParams.gridCarbonIntensity}
                      onChange={(e) => setCostEnergyParams({...costEnergyParams, gridCarbonIntensity: parseFloat(e.target.value) || 0})}
                      min={0}
                      step={1}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Memory Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Model Size</Label>
                <p>{formatBytes(modelSize)}</p>
              </div>
              <div className="space-y-2">
                <Label>Activation Memory</Label>
                <p>{formatBytes(activationMemory)}</p>
              </div>
              <div className="space-y-2">
                <Label>Gradient Memory</Label>
                <p>{formatBytes(gradientMemory)}</p>
              </div>
              <div className="space-y-2">
                <Label>Optimizer Memory</Label>
                <p>{formatBytes(optimizerMemory)}</p>
              </div>
              <div className="space-y-2">
                <Label>KV Cache Memory</Label>
                <p>{formatBytes(kvMemory)}</p>
              </div>
              <div className="space-y-2">
                <Label>Total Memory</Label>
                <p>{formatBytes(totalMemory)}</p>
              </div>
              <div className={`space-y-2 ${modelFitsInGPUMemory ? "text-green-500" : "text-red-500"}`}>
                <Label>Model Fits in GPU Memory?</Label>
                <p>{modelFitsInGPUMemory ? "Yes" : "No"}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cost & Energy Estimates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Estimated Training Cost</Label>
                <p>${cost.toFixed(2)}</p>
              </div>
              <div className="space-y-2">
                <Label>Estimated Power Consumption</Label>
                <p>{energyConsumption.powerConsumption.toFixed(2)} kWh</p>
              </div>
              <div className="space-y-2">
                <Label>Estimated Carbon Footprint</Label>
                <p>{energyConsumption.carbonFootprint.toFixed(2)} kgCO2</p>
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
};

export default MemoryCalculator;
