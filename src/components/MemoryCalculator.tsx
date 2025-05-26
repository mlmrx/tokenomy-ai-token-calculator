
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
import { AlertCircle, Info, Zap, Cpu, HardDrive, DollarSign } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Type definitions
interface ModelParameters {
  hiddenSize: number;
  numLayers: number;
  numHeads: number;
  vocabSize: number;
  sequenceLength: number;
  batchSize: number;
  microBatchSizePerGPU: number;
}

interface MemoryFlags {
  flashAttention: boolean;
  gradientCheckpointFactor: number;
  zeroStage: 0 | 1 | 2 | 3;
  cpuOffloadPct: number;
  moe: {
    experts: number;
    topK: number;
  };
  lora: {
    rank: number;
  };
  sequenceParallelism: number;
  kvCachePrecision: "fp16" | "int8";
  sparsity24: boolean;
}

interface CostEnergyParams {
  trainingSteps: number;
  tokensPerSecondPerGPU: number;
  gridCarbonIntensity: number;
}

const MemoryCalculator: React.FC = () => {
  // State with proper defaults
  const [modelParams, setModelParams] = useState<ModelParameters>({
    hiddenSize: 4096,
    numLayers: 32,
    numHeads: 32,
    vocabSize: 50257,
    sequenceLength: 2048,
    batchSize: 64,
    microBatchSizePerGPU: 8
  });

  const [memoryFlags, setMemoryFlags] = useState<MemoryFlags>({
    flashAttention: true,
    gradientCheckpointFactor: 1.0,
    zeroStage: 2,
    cpuOffloadPct: 0,
    moe: {
      experts: 8,
      topK: 2
    },
    lora: {
      rank: 64
    },
    sequenceParallelism: 1,
    kvCachePrecision: "fp16",
    sparsity24: false
  });

  const [costEnergyParams, setCostEnergyParams] = useState<CostEnergyParams>({
    trainingSteps: 100000,
    tokensPerSecondPerGPU: 1500,
    gridCarbonIntensity: 0.4
  });

  const [selectedModel, setSelectedModel] = useState("gpt-3.5-like");

  // Predefined model configurations
  const modelPresets = {
    "gpt-3.5-like": {
      hiddenSize: 4096,
      numLayers: 32,
      numHeads: 32,
      vocabSize: 50257,
      sequenceLength: 2048,
      batchSize: 64,
      microBatchSizePerGPU: 8
    },
    "llama-7b": {
      hiddenSize: 4096,
      numLayers: 32,
      numHeads: 32,
      vocabSize: 32000,
      sequenceLength: 2048,
      batchSize: 32,
      microBatchSizePerGPU: 4
    },
    "llama-13b": {
      hiddenSize: 5120,
      numLayers: 40,
      numHeads: 40,
      vocabSize: 32000,
      sequenceLength: 2048,
      batchSize: 16,
      microBatchSizePerGPU: 2
    }
  };

  const handleModelChange = (modelName: string) => {
    setSelectedModel(modelName);
    if (modelName in modelPresets) {
      setModelParams(prev => ({
        ...prev,
        ...modelPresets[modelName as keyof typeof modelPresets]
      }));
    }
  };

  // Memory calculation functions
  const calculateModelMemory = useMemo(() => {
    const { hiddenSize, numLayers, vocabSize } = modelParams;
    const parameterCount = (12 * numLayers * hiddenSize * hiddenSize) + (vocabSize * hiddenSize);
    const modelSizeGB = (parameterCount * 2) / (1024 ** 3); // FP16
    return {
      parameterCount,
      modelSizeGB
    };
  }, [modelParams]);

  const calculateActivationMemory = useMemo(() => {
    const { hiddenSize, numLayers, sequenceLength, batchSize } = modelParams;
    const activationMemoryGB = (batchSize * sequenceLength * hiddenSize * numLayers * 8) / (1024 ** 3);
    const reductionFactor = memoryFlags.flashAttention ? 0.5 : 1.0;
    return activationMemoryGB * reductionFactor;
  }, [modelParams, memoryFlags.flashAttention]);

  const calculateGradientMemory = useMemo(() => {
    const { modelSizeGB } = calculateModelMemory;
    const gradientCheckpointReduction = 1 / memoryFlags.gradientCheckpointFactor;
    return modelSizeGB * gradientCheckpointReduction;
  }, [calculateModelMemory, memoryFlags.gradientCheckpointFactor]);

  const calculateOptimizerMemory = useMemo(() => {
    const { modelSizeGB } = calculateModelMemory;
    const zeroMultipliers = { 0: 8, 1: 4, 2: 2, 3: 1 };
    return modelSizeGB * zeroMultipliers[memoryFlags.zeroStage];
  }, [calculateModelMemory, memoryFlags.zeroStage]);

  const totalMemoryGB = useMemo(() => {
    return calculateModelMemory.modelSizeGB + 
           calculateActivationMemory + 
           calculateGradientMemory + 
           calculateOptimizerMemory;
  }, [calculateModelMemory, calculateActivationMemory, calculateGradientMemory, calculateOptimizerMemory]);

  const estimatedCost = useMemo(() => {
    const hoursOfTraining = costEnergyParams.trainingSteps / (costEnergyParams.tokensPerSecondPerGPU * 3600);
    const costPerGPUHour = 2.50; // Example rate
    return hoursOfTraining * costPerGPUHour;
  }, [costEnergyParams]);

  const estimatedEnergy = useMemo(() => {
    const powerPerGPU = 300; // Watts
    const hoursOfTraining = costEnergyParams.trainingSteps / (costEnergyParams.tokensPerSecondPerGPU * 3600);
    const energyKWh = (powerPerGPU * hoursOfTraining) / 1000;
    const carbonKg = energyKWh * costEnergyParams.gridCarbonIntensity;
    return { energyKWh, carbonKg };
  }, [costEnergyParams]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Memory Requirements Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="model" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="model">Model</TabsTrigger>
              <TabsTrigger value="optimization">Optimization</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="cost">Cost & Energy</TabsTrigger>
            </TabsList>

            <TabsContent value="model" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="model-preset">Model Preset</Label>
                  <Select value={selectedModel} onValueChange={handleModelChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-3.5-like">GPT-3.5-like</SelectItem>
                      <SelectItem value="llama-7b">LLaMA 7B</SelectItem>
                      <SelectItem value="llama-13b">LLaMA 13B</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="hidden-size">Hidden Size</Label>
                  <Input
                    id="hidden-size"
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
                    id="num-layers"
                    type="number"
                    value={modelParams.numLayers}
                    onChange={(e) => setModelParams(prev => ({
                      ...prev,
                      numLayers: parseInt(e.target.value) || 0
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="vocab-size">Vocabulary Size</Label>
                  <Input
                    id="vocab-size"
                    type="number"
                    value={modelParams.vocabSize}
                    onChange={(e) => setModelParams(prev => ({
                      ...prev,
                      vocabSize: parseInt(e.target.value) || 0
                    }))}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="optimization" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="flash-attention"
                    checked={memoryFlags.flashAttention}
                    onCheckedChange={(checked) => 
                      setMemoryFlags(prev => ({ ...prev, flashAttention: checked }))
                    }
                  />
                  <Label htmlFor="flash-attention">Flash Attention</Label>
                </div>
                <div>
                  <Label htmlFor="zero-stage">ZeRO Stage</Label>
                  <Select 
                    value={memoryFlags.zeroStage.toString()} 
                    onValueChange={(value) => 
                      setMemoryFlags(prev => ({ 
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
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{totalMemoryGB.toFixed(2)} GB</div>
                    <p className="text-xs text-muted-foreground">Total Memory Required</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{(calculateModelMemory.parameterCount / 1e9).toFixed(2)}B</div>
                    <p className="text-xs text-muted-foreground">Parameters</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Model Weights</span>
                  <span>{calculateModelMemory.modelSizeGB.toFixed(2)} GB</span>
                </div>
                <div className="flex justify-between">
                  <span>Activations</span>
                  <span>{calculateActivationMemory.toFixed(2)} GB</span>
                </div>
                <div className="flex justify-between">
                  <span>Gradients</span>
                  <span>{calculateGradientMemory.toFixed(2)} GB</span>
                </div>
                <div className="flex justify-between">
                  <span>Optimizer States</span>
                  <span>{calculateOptimizerMemory.toFixed(2)} GB</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cost" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="training-steps">Training Steps</Label>
                  <Input
                    id="training-steps"
                    type="number"
                    value={costEnergyParams.trainingSteps}
                    onChange={(e) => setCostEnergyParams(prev => ({
                      ...prev,
                      trainingSteps: parseInt(e.target.value) || 0
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="grid-carbon">Grid Carbon Intensity (kg CO₂/kWh)</Label>
                  <Input
                    id="grid-carbon"
                    type="number"
                    step="0.1"
                    value={costEnergyParams.gridCarbonIntensity}
                    onChange={(e) => setCostEnergyParams(prev => ({
                      ...prev,
                      gridCarbonIntensity: parseFloat(e.target.value) || 0
                    }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">${estimatedCost.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Estimated Cost</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{estimatedEnergy.energyKWh.toFixed(1)} kWh</div>
                    <p className="text-xs text-muted-foreground">Energy Usage</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{estimatedEnergy.carbonKg.toFixed(1)} kg</div>
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
