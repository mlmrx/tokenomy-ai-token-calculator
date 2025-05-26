
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import EnhancedSlider from "./EnhancedSlider";

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

interface EnhancedModelConfigProps {
  modelParams: ModelParameters;
  setModelParams: React.Dispatch<React.SetStateAction<ModelParameters>>;
}

const architectureDescriptions = {
  "Transformer Decoder": "Standard autoregressive language model architecture",
  "Transformer Encoder": "Bidirectional encoder for understanding tasks",
  "Transformer Encoder-Decoder": "Sequence-to-sequence architecture",
  "Transformer Decoder MoE": "Sparse model with Mixture of Experts",
  "Mamba (State Space)": "Efficient state space model architecture"
};

const EnhancedModelConfig: React.FC<EnhancedModelConfigProps> = ({
  modelParams,
  setModelParams
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          1. Model Configuration
          <Badge variant="outline" className="text-xs">
            Parameters: {((modelParams.hiddenSize * modelParams.numLayers * 12) / 1e9).toFixed(1)}B
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Architecture</label>
          <Select 
            value={modelParams.architecture} 
            onValueChange={(value) => setModelParams(prev => ({ ...prev, architecture: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(architectureDescriptions).map(([arch, desc]) => (
                <SelectItem key={arch} value={arch}>
                  <div className="flex flex-col">
                    <span className="font-medium">{arch}</span>
                    <span className="text-xs text-muted-foreground">{desc}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EnhancedSlider
            label="Hidden Size (d_model)"
            value={modelParams.hiddenSize}
            onValueChange={(value) => setModelParams(prev => ({ ...prev, hiddenSize: value }))}
            min={512}
            max={16384}
            step={128}
            tooltip="The dimensionality of the model's hidden states and embeddings"
          />

          <EnhancedSlider
            label="Number of Layers"
            value={modelParams.numLayers}
            onValueChange={(value) => setModelParams(prev => ({ ...prev, numLayers: value }))}
            min={6}
            max={120}
            step={2}
            tooltip="Number of transformer layers in the model"
          />

          <EnhancedSlider
            label="Attention Heads"
            value={modelParams.numHeads}
            onValueChange={(value) => setModelParams(prev => ({ ...prev, numHeads: value }))}
            min={8}
            max={128}
            step={8}
            tooltip="Number of attention heads per layer"
          />

          <EnhancedSlider
            label="Vocabulary Size"
            value={modelParams.vocabSize}
            onValueChange={(value) => setModelParams(prev => ({ ...prev, vocabSize: value }))}
            min={10000}
            max={200000}
            step={1000}
            tooltip="Size of the model's vocabulary"
            formatValue={(value) => `${(value / 1000).toFixed(0)}K`}
          />

          <EnhancedSlider
            label="Sequence Length"
            value={modelParams.sequenceLength}
            onValueChange={(value) => setModelParams(prev => ({ ...prev, sequenceLength: value }))}
            min={512}
            max={32768}
            step={512}
            tooltip="Maximum sequence length the model can process"
            formatValue={(value) => `${(value / 1000).toFixed(1)}K`}
          />

          <EnhancedSlider
            label="Global Batch Size"
            value={modelParams.batchSize}
            onValueChange={(value) => setModelParams(prev => ({ ...prev, batchSize: value }))}
            min={1}
            max={512}
            step={1}
            tooltip="Total batch size across all GPUs"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <EnhancedSlider
            label="Micro Batch Size / GPU"
            value={modelParams.microBatchSizePerGPU}
            onValueChange={(value) => setModelParams(prev => ({ ...prev, microBatchSizePerGPU: value }))}
            min={1}
            max={32}
            step={1}
            tooltip="Batch size processed by each GPU before gradient accumulation"
          />

          <EnhancedSlider
            label="Number of GPUs"
            value={modelParams.numGPUs}
            onValueChange={(value) => setModelParams(prev => ({ ...prev, numGPUs: value }))}
            min={1}
            max={128}
            step={1}
            tooltip="Total number of GPUs for training/inference"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedModelConfig;
