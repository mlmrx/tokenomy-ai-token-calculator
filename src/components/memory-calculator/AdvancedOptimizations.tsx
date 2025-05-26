
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

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

interface AdvancedOptimizationsProps {
  optimizationFlags: OptimizationFlags;
  setOptimizationFlags: React.Dispatch<React.SetStateAction<OptimizationFlags>>;
  precision: "fp32" | "fp16" | "bf16" | "int8";
  onPrecisionChange: (precision: "fp32" | "fp16" | "bf16" | "int8") => void;
}

const AdvancedOptimizations: React.FC<AdvancedOptimizationsProps> = ({
  optimizationFlags,
  setOptimizationFlags,
  precision,
  onPrecisionChange
}) => {
  return (
    <div className="space-y-6">
      {/* Precision & Quantization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">2. Precision & Quantization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Compute & Storage Precision</Label>
            <Select value={precision} onValueChange={onPrecisionChange}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fp32">FP32 (32-bit)</SelectItem>
                <SelectItem value="fp16">FP16 (16-bit)</SelectItem>
                <SelectItem value="bf16">BF16 (16-bit)</SelectItem>
                <SelectItem value="int8">INT8 (8-bit)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Optimizations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">3. Advanced Optimizations (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* FlashAttention */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">FlashAttention / SDPA</Label>
              <p className="text-xs text-muted-foreground">Use memory-efficient attention kernel.</p>
            </div>
            <Switch
              checked={optimizationFlags.flashAttention}
              onCheckedChange={(checked) =>
                setOptimizationFlags(prev => ({ ...prev, flashAttention: checked }))
              }
            />
          </div>

          <Separator />

          {/* Gradient Checkpointing */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Gradient Checkpointing</Label>
                <p className="text-xs text-muted-foreground">
                  Trade compute for memory by recomputing activations. Factor = % of activation memory retained.
                </p>
              </div>
              <Switch
                checked={optimizationFlags.activationCheckpointing}
                onCheckedChange={(checked) =>
                  setOptimizationFlags(prev => ({ ...prev, activationCheckpointing: checked }))
                }
              />
            </div>
            
            {optimizationFlags.activationCheckpointing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{Math.round(optimizationFlags.gradientCheckpointFactor * 100)}% Memory</span>
                  <span className="text-xs text-muted-foreground">
                    100% = Off, Lower % = More Memory Saved (but more recompute)
                  </span>
                </div>
                <Slider
                  value={[optimizationFlags.gradientCheckpointFactor]}
                  onValueChange={([value]) =>
                    setOptimizationFlags(prev => ({ ...prev, gradientCheckpointFactor: value }))
                  }
                  max={1}
                  min={0.1}
                  step={0.1}
                  className="w-full"
                />
              </div>
            )}
          </div>

          <Separator />

          {/* ZeRO Stage */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">ZeRO Stage (DeepSpeed/FSDP)</Label>
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((stage) => (
                <button
                  key={stage}
                  onClick={() =>
                    setOptimizationFlags(prev => ({ ...prev, zeroStage: stage as 0 | 1 | 2 | 3 }))
                  }
                  className={`p-2 text-sm rounded border transition-colors ${
                    optimizationFlags.zeroStage === stage
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border hover:bg-muted'
                  }`}
                >
                  Stage {stage}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Mixture of Experts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Mixture of Experts (MoE)</Label>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Total Experts (E)</Label>
                  <Input
                    type="number"
                    value={optimizationFlags.moe.experts}
                    onChange={(e) =>
                      setOptimizationFlags(prev => ({
                        ...prev,
                        moe: { ...prev.moe, experts: parseInt(e.target.value) || 8 }
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Activated Experts (K)</Label>
                  <Input
                    type="number"
                    value={optimizationFlags.moe.topK}
                    onChange={(e) =>
                      setOptimizationFlags(prev => ({
                        ...prev,
                        moe: { ...prev.moe, topK: parseInt(e.target.value) || 2 }
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* LoRA */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">LoRA (Low-Rank Adaptation)</Label>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Rank</Label>
                  <Input
                    type="number"
                    value={optimizationFlags.lora.rank}
                    onChange={(e) =>
                      setOptimizationFlags(prev => ({
                        ...prev,
                        lora: { ...prev.lora, rank: parseInt(e.target.value) || 64 }
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Alpha</Label>
                  <Input
                    type="number"
                    value={optimizationFlags.lora.alpha}
                    onChange={(e) =>
                      setOptimizationFlags(prev => ({
                        ...prev,
                        lora: { ...prev.lora, alpha: parseInt(e.target.value) || 128 }
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Future Tunables */}
          <div className="space-y-4">
            <Label className="text-sm font-medium text-muted-foreground">Future Tunables (Placeholders):</Label>
            
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Sequence Parallelism</span>
                <span className="text-xs bg-muted px-2 py-1 rounded">Coming Soon</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>KV Cache INT8</span>
                <span className="text-xs bg-muted px-2 py-1 rounded">Coming Soon</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>2:4 Sparsity</span>
                <span className="text-xs bg-muted px-2 py-1 rounded">Coming Soon</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedOptimizations;
