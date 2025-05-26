
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

interface ModelPresetsProps {
  selectedPreset: string;
  onPresetChange: (preset: string) => void;
  onShareConfiguration: () => void;
}

const modelPresets: Record<string, ModelParameters & { description: string }> = {
  "llama-3-8b": {
    architecture: "Transformer Decoder",
    hiddenSize: 4096,
    numLayers: 32,
    numHeads: 32,
    vocabSize: 128256,
    sequenceLength: 8192,
    batchSize: 32,
    microBatchSizePerGPU: 2,
    numGPUs: 8,
    description: "Meta's Llama-3 8B Instruct model"
  },
  "mixtral-8x7b": {
    architecture: "Transformer Decoder MoE",
    hiddenSize: 4096,
    numLayers: 32,
    numHeads: 32,
    vocabSize: 32000,
    sequenceLength: 32768,
    batchSize: 16,
    microBatchSizePerGPU: 1,
    numGPUs: 16,
    description: "Mistral's Mixtral 8x7B sparse MoE model"
  },
  "mamba-2.8b": {
    architecture: "Mamba (State Space)",
    hiddenSize: 2560,
    numLayers: 64,
    numHeads: 16,
    vocabSize: 50280,
    sequenceLength: 2048,
    batchSize: 64,
    microBatchSizePerGPU: 4,
    numGPUs: 4,
    description: "Mamba 2.8B state space model"
  },
  "bert-large": {
    architecture: "Transformer Encoder",
    hiddenSize: 1024,
    numLayers: 24,
    numHeads: 16,
    vocabSize: 30522,
    sequenceLength: 512,
    batchSize: 32,
    microBatchSizePerGPU: 8,
    numGPUs: 2,
    description: "BERT Large (340M parameters)"
  },
  "t5-large": {
    architecture: "Transformer Encoder-Decoder",
    hiddenSize: 1024,
    numLayers: 24,
    numHeads: 16,
    vocabSize: 32128,
    sequenceLength: 512,
    batchSize: 32,
    microBatchSizePerGPU: 4,
    numGPUs: 4,
    description: "T5 Large (770M parameters)"
  },
  "custom": {
    architecture: "Transformer Decoder",
    hiddenSize: 4096,
    numLayers: 32,
    numHeads: 32,
    vocabSize: 32000,
    sequenceLength: 4096,
    batchSize: 32,
    microBatchSizePerGPU: 2,
    numGPUs: 8,
    description: "Custom configuration"
  }
};

const ModelPresets: React.FC<ModelPresetsProps> = ({
  selectedPreset,
  onPresetChange,
  onShareConfiguration
}) => {
  const { toast } = useToast();

  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex-1">
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          Load Preset:
        </label>
        <Select value={selectedPreset} onValueChange={onPresetChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(modelPresets).map(([key, preset]) => (
              <SelectItem key={key} value={key}>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {key === "custom" ? "Custom Configuration" : preset.description}
                  </span>
                  {key !== "custom" && (
                    <span className="text-xs text-muted-foreground">
                      {preset.architecture}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onShareConfiguration}
        className="mt-6"
      >
        <Copy className="h-4 w-4 mr-2" />
        Copy Shareable Link
      </Button>
    </div>
  );
};

export default ModelPresets;
export { modelPresets };
