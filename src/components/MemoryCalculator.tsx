
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

type ParameterType = {
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
};

type QuantizationType = {
  name: string;
  bitsPerParameter: number;
  memoryMultiplier: number;
  performanceImpact: string;
};

const MemoryCalculator = () => {
  const [modelType, setModelType] = useState("decoder");
  const [parameters, setParameters] = useState<Record<string, number>>({
    hiddenSize: 4096,
    numLayers: 32,
    numHeads: 32,
    vocabSize: 50000,
    sequenceLength: 8192,
    batchSize: 32
  });
  const [precision, setPrecision] = useState<string>("fp32");
  
  const quantizationTypes: QuantizationType[] = [
    { name: "FP32", bitsPerParameter: 32, memoryMultiplier: 1.0, performanceImpact: "None (baseline)" },
    { name: "FP16", bitsPerParameter: 16, memoryMultiplier: 0.5, performanceImpact: "Minimal on modern GPUs" },
    { name: "BF16", bitsPerParameter: 16, memoryMultiplier: 0.5, performanceImpact: "Better than FP16 for training" },
    { name: "INT8", bitsPerParameter: 8, memoryMultiplier: 0.25, performanceImpact: "Moderate, 2-5% accuracy loss" },
    { name: "INT4", bitsPerParameter: 4, memoryMultiplier: 0.125, performanceImpact: "Significant, 5-15% accuracy loss" }
  ];
  
  const parametersList: Record<string, ParameterType> = {
    hiddenSize: { name: "Hidden Size", value: parameters.hiddenSize, min: 128, max: 16384, step: 128, unit: "" },
    numLayers: { name: "Number of Layers", value: parameters.numLayers, min: 1, max: 100, step: 1, unit: "" },
    numHeads: { name: "Attention Heads", value: parameters.numHeads, min: 1, max: 128, step: 1, unit: "" },
    vocabSize: { name: "Vocabulary Size", value: parameters.vocabSize, min: 1000, max: 100000, step: 1000, unit: "" },
    sequenceLength: { name: "Sequence Length", value: parameters.sequenceLength, min: 512, max: 32768, step: 512, unit: "tokens" },
    batchSize: { name: "Batch Size", value: parameters.batchSize, min: 1, max: 128, step: 1, unit: "" }
  };
  
  const handleParameterChange = (param: string, value: number) => {
    setParameters({ ...parameters, [param]: value });
  };
  
  const selectedQuantization = quantizationTypes.find(q => q.name.toLowerCase() === precision);

  // Calculate total parameters
  const totalParameters = useMemo(() => {
    let paramCount = 0;
    
    if (modelType === "decoder") {
      // For decoder-only models like GPT
      // Embedding parameters
      const embeddingParams = parameters.vocabSize * parameters.hiddenSize;
      
      // Transformer layer parameters
      const attentionParams = 4 * parameters.hiddenSize * parameters.hiddenSize; // Q, K, V projections and output projection
      const mlpParams = 8 * parameters.hiddenSize * parameters.hiddenSize; // MLP with 4x hidden size
      
      const layerNormParams = 2 * parameters.hiddenSize; // 2 layer norms per transformer layer
      const layerParams = attentionParams + mlpParams + layerNormParams;
      
      // Final layer norm and output projection
      const finalParams = parameters.hiddenSize + parameters.hiddenSize * parameters.vocabSize;
      
      paramCount = embeddingParams + (parameters.numLayers * layerParams) + finalParams;
    } else if (modelType === "encoder") {
      // For encoder-only models like BERT
      // Embedding parameters (token, position, type)
      const embeddingParams = parameters.vocabSize * parameters.hiddenSize + 
                             512 * parameters.hiddenSize +
                             2 * parameters.hiddenSize;
      
      // Transformer layer parameters
      const attentionParams = 4 * parameters.hiddenSize * parameters.hiddenSize; // Self-attention
      const mlpParams = 8 * parameters.hiddenSize * parameters.hiddenSize;
      const layerNormParams = 2 * parameters.hiddenSize;
      const layerParams = attentionParams + mlpParams + layerNormParams;
      
      // Final layer norm
      const finalParams = parameters.hiddenSize;
      
      paramCount = embeddingParams + (parameters.numLayers * layerParams) + finalParams;
    } else if (modelType === "encoder-decoder") {
      // For encoder-decoder models like T5
      // Shared embedding
      const embeddingParams = parameters.vocabSize * parameters.hiddenSize;
      
      // Encoder layers
      const encAttentionParams = 4 * parameters.hiddenSize * parameters.hiddenSize;
      const encMlpParams = 8 * parameters.hiddenSize * parameters.hiddenSize;
      const encLayerNormParams = 2 * parameters.hiddenSize;
      const encLayerParams = encAttentionParams + encMlpParams + encLayerNormParams;
      
      // Decoder layers (with cross-attention)
      const decSelfAttentionParams = 4 * parameters.hiddenSize * parameters.hiddenSize;
      const decCrossAttentionParams = 4 * parameters.hiddenSize * parameters.hiddenSize;
      const decMlpParams = 8 * parameters.hiddenSize * parameters.hiddenSize;
      const decLayerNormParams = 3 * parameters.hiddenSize; // 3 layer norms
      const decLayerParams = decSelfAttentionParams + decCrossAttentionParams + decMlpParams + decLayerNormParams;
      
      // Final layer norm and output projection
      const finalParams = parameters.hiddenSize + parameters.hiddenSize * parameters.vocabSize;
      
      paramCount = embeddingParams + 
                   (parameters.numLayers * encLayerParams) + 
                   (parameters.numLayers * decLayerParams) + 
                   finalParams;
    }
    
    // Round to millions
    return Math.round(paramCount / 1000000);
  }, [parameters, modelType]);
  
  // Calculate memory requirements
  const memoryRequirements = useMemo(() => {
    const bytesPerParam = (selectedQuantization?.bitsPerParameter || 32) / 8;
    
    // Model weights memory (parameters * bytes per parameter)
    const modelWeightsGB = (totalParameters * 1000000 * bytesPerParam) / (1024 * 1024 * 1024);
    
    // Activation memory (roughly proportional to batch size, sequence length, and model size)
    // This is a simplified approximation
    const activationFactor = modelType === "encoder-decoder" ? 2 : 1;
    const activationMemoryGB = activationFactor * 
                              parameters.batchSize * 
                              parameters.sequenceLength * 
                              parameters.numLayers * 
                              parameters.hiddenSize * 4 / (1024 * 1024 * 1024);
    
    // Optimizer states memory (for training, typically 8-12 bytes per parameter)
    // Adam uses 8 bytes per parameter (m, v)
    const optimizerStateGB = totalParameters * 1000000 * 8 / (1024 * 1024 * 1024);
    
    // Gradient memory (same size as model weights)
    const gradientMemoryGB = modelWeightsGB;
    
    // Total training memory
    const totalTrainingGB = modelWeightsGB + activationMemoryGB + optimizerStateGB + gradientMemoryGB;
    
    // Total inference memory (no optimizer states or gradients)
    const totalInferenceGB = modelWeightsGB + (activationMemoryGB * 0.5); // Usually less activation memory during inference
    
    return {
      modelWeightsGB: parseFloat(modelWeightsGB.toFixed(2)),
      activationMemoryGB: parseFloat(activationMemoryGB.toFixed(2)),
      optimizerStateGB: parseFloat(optimizerStateGB.toFixed(2)),
      gradientMemoryGB: parseFloat(gradientMemoryGB.toFixed(2)),
      totalTrainingGB: parseFloat(totalTrainingGB.toFixed(2)),
      totalInferenceGB: parseFloat(totalInferenceGB.toFixed(2))
    };
  }, [totalParameters, parameters, modelType, selectedQuantization]);
  
  // Data for memory breakdown chart
  const memoryBreakdownData = [
    { name: "Model Weights", value: memoryRequirements.modelWeightsGB },
    { name: "Activations", value: memoryRequirements.activationMemoryGB },
    { name: "Optimizer States", value: memoryRequirements.optimizerStateGB },
    { name: "Gradients", value: memoryRequirements.gradientMemoryGB }
  ];
  
  // Colors for the chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  // Comparison with common hardware
  const hardwareComparisons = [
    { name: "RTX 3090 (24GB)", limit: 24 },
    { name: "A100 (40GB)", limit: 40 },
    { name: "A100 (80GB)", limit: 80 },
    { name: "H100 (80GB)", limit: 80 },
    { name: "8x A100 (320GB)", limit: 320 },
  ];
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">LLM Memory Calculator</CardTitle>
          <CardDescription className="text-center">
            Estimate memory requirements for large language models
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="modelType">Model Architecture</Label>
                <Select
                  value={modelType}
                  onValueChange={setModelType}
                >
                  <SelectTrigger id="modelType">
                    <SelectValue placeholder="Select model type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="decoder">Decoder-only (GPT-style)</SelectItem>
                    <SelectItem value="encoder">Encoder-only (BERT-style)</SelectItem>
                    <SelectItem value="encoder-decoder">Encoder-Decoder (T5-style)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="precision">Precision / Quantization</Label>
                <Select
                  value={precision}
                  onValueChange={setPrecision}
                >
                  <SelectTrigger id="precision">
                    <SelectValue placeholder="Select precision" />
                  </SelectTrigger>
                  <SelectContent>
                    {quantizationTypes.map(q => (
                      <SelectItem key={q.name} value={q.name.toLowerCase()}>
                        {q.name} ({q.bitsPerParameter}-bit)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4">
                {Object.entries(parametersList).map(([key, param]) => (
                  <div key={key}>
                    <Label htmlFor={key}>{param.name} {param.unit && `(${param.unit})`}</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        id={key}
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        value={[parameters[key]]}
                        onValueChange={(value) => handleParameterChange(key, value[0])}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={parameters[key]}
                        onChange={(e) => handleParameterChange(key, parseInt(e.target.value) || param.min)}
                        className="w-24"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-secondary p-4 rounded-lg flex flex-col items-center">
                <div className="text-lg">Total Parameters</div>
                <div className="text-4xl font-bold">{totalParameters} M</div>
                <div className="text-muted-foreground">
                  (~{(totalParameters / 1000).toFixed(2)} B)
                </div>
              </div>
              
              <Tabs defaultValue="training">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="training">Training Memory</TabsTrigger>
                  <TabsTrigger value="inference">Inference Memory</TabsTrigger>
                </TabsList>
                
                <TabsContent value="training" className="space-y-4">
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="bg-secondary/50 p-3 rounded-lg text-center">
                      <div className="text-sm">Total Training Memory</div>
                      <div className="text-2xl font-bold">{memoryRequirements.totalTrainingGB} GB</div>
                    </div>
                    <div className="bg-secondary/50 p-3 rounded-lg text-center">
                      <div className="text-sm">Per GPU (8-way)</div>
                      <div className="text-2xl font-bold">{(memoryRequirements.totalTrainingGB / 8).toFixed(2)} GB</div>
                    </div>
                  </div>
                  
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={memoryBreakdownData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value.toFixed(1)} GB`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {memoryBreakdownData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${Number(value).toFixed(2)} GB`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Hardware Requirements</Label>
                    {hardwareComparisons.map((hw) => (
                      <div key={hw.name} className="flex items-center">
                        <div className="w-32 text-sm">{hw.name}</div>
                        <div className="flex-1 h-6 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${memoryRequirements.totalTrainingGB > hw.limit ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(100, (memoryRequirements.totalTrainingGB / hw.limit) * 100)}%` }}
                          />
                        </div>
                        <div className="w-24 text-right text-sm">
                          {(memoryRequirements.totalTrainingGB / hw.limit * 100).toFixed(0)}% used
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="inference" className="space-y-4">
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="bg-secondary/50 p-3 rounded-lg text-center">
                      <div className="text-sm">Inference Memory</div>
                      <div className="text-2xl font-bold">{memoryRequirements.totalInferenceGB} GB</div>
                    </div>
                    <div className="bg-secondary/50 p-3 rounded-lg text-center">
                      <div className="text-sm">With {precision} Precision</div>
                      <div className="text-2xl font-bold">{selectedQuantization ? (memoryRequirements.totalInferenceGB * selectedQuantization.memoryMultiplier).toFixed(2) : "N/A"} GB</div>
                    </div>
                  </div>
                  
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: "Model Weights", value: memoryRequirements.modelWeightsGB },
                          { name: "Activations", value: memoryRequirements.activationMemoryGB * 0.5 }
                        ]}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis label={{ value: 'Memory (GB)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value) => `${Number(value).toFixed(2)} GB`} />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Quantization Performance Impact</Label>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Type</th>
                          <th className="text-center py-2">Bits/Param</th>
                          <th className="text-center py-2">Memory Savings</th>
                          <th className="text-left py-2">Performance Impact</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quantizationTypes.map((q) => (
                          <tr key={q.name} className={`border-b ${q.name.toLowerCase() === precision ? 'bg-secondary/50' : ''}`}>
                            <td className="py-2">{q.name}</td>
                            <td className="text-center py-2">{q.bitsPerParameter}</td>
                            <td className="text-center py-2">{(1 - q.memoryMultiplier) * 100}%</td>
                            <td className="py-2">{q.performanceImpact}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MemoryCalculator;
