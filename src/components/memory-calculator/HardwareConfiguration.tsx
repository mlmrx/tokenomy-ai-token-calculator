
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface HardwareConfig {
  gpuType: string;
  memoryPerGPU: number;
  precision: string;
  interconnect: string;
}

interface ModelParameters {
  numGPUs: number;
}

interface HardwareConfigurationProps {
  hardwareConfig: HardwareConfig;
  setHardwareConfig: React.Dispatch<React.SetStateAction<HardwareConfig>>;
  modelParams: ModelParameters;
  setModelParams: React.Dispatch<React.SetStateAction<any>>;
}

const gpuOptions = {
  "h100-80-sxm": { 
    name: "NVIDIA H100 (80GB SXM)", 
    memory: 80, 
    bandwidth: "3.35 TB/s", 
    features: "FP8",
    power: 700,
    cost: 4.00
  },
  "h100-94-sxm": { 
    name: "NVIDIA H100 (94GB SXM)", 
    memory: 94, 
    bandwidth: "3.35 TB/s", 
    features: "FP8",
    power: 700,
    cost: 4.50
  },
  "a100-80-sxm": { 
    name: "NVIDIA A100 (80GB SXM)", 
    memory: 80, 
    bandwidth: "2.04 TB/s", 
    features: "TF32",
    power: 400,
    cost: 2.50
  },
  "a100-40-sxm": { 
    name: "NVIDIA A100 (40GB SXM)", 
    memory: 40, 
    bandwidth: "1.56 TB/s", 
    features: "TF32",
    power: 400,
    cost: 2.00
  },
  "v100-32": { 
    name: "NVIDIA V100 (32GB)", 
    memory: 32, 
    bandwidth: "900 GB/s", 
    features: "FP16",
    power: 300,
    cost: 1.50
  },
  "rtx4090": { 
    name: "RTX 4090 (24GB)", 
    memory: 24, 
    bandwidth: "1008 GB/s", 
    features: "FP16",
    power: 450,
    cost: 1.20
  }
};

const HardwareConfiguration: React.FC<HardwareConfigurationProps> = ({
  hardwareConfig,
  setHardwareConfig,
  modelParams,
  setModelParams
}) => {
  const handleGpuChange = (gpuType: string) => {
    const gpu = gpuOptions[gpuType as keyof typeof gpuOptions];
    if (gpu) {
      setHardwareConfig(prev => ({
        ...prev,
        gpuType,
        memoryPerGPU: gpu.memory
      }));
    }
  };

  const selectedGpu = gpuOptions[hardwareConfig.gpuType as keyof typeof gpuOptions];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">4. Hardware Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Target GPU</Label>
          <Select value={hardwareConfig.gpuType} onValueChange={handleGpuChange}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(gpuOptions).map(([key, gpu]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {gpu.name} ({gpu.memory} GB VRAM, {gpu.bandwidth}, {gpu.features})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Number of GPUs</Label>
          <Input
            type="number"
            value={modelParams.numGPUs}
            onChange={(e) => setModelParams((prev: any) => ({
              ...prev,
              numGPUs: parseInt(e.target.value) || 1
            }))}
            className="mt-2"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Used for ZeRO sharding, calculating micro-batch size, and total cost/power.
          </p>
        </div>

        {selectedGpu && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-sm">
              <span className="text-muted-foreground">Memory per GPU:</span>
              <div className="font-medium">{selectedGpu.memory} GB</div>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Bandwidth:</span>
              <div className="font-medium">{selectedGpu.bandwidth}</div>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Power:</span>
              <div className="font-medium">{selectedGpu.power}W</div>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Cost/Hour:</span>
              <div className="font-medium">${selectedGpu.cost.toFixed(2)}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HardwareConfiguration;
export { gpuOptions };
