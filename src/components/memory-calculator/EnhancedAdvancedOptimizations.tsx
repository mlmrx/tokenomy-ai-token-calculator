
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import EnhancedSlider from "./EnhancedSlider";

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

interface EnhancedAdvancedOptimizationsProps {
  optimizationFlags: OptimizationFlags;
  setOptimizationFlags: React.Dispatch<React.SetStateAction<OptimizationFlags>>;
  precision: "fp32" | "fp16" | "bf16" | "int8";
  onPrecisionChange: (precision: "fp32" | "fp16" | "bf16" | "int8") => void;
}

const EnhancedAdvancedOptimizations: React.FC<EnhancedAdvancedOptimizationsProps> = ({
  optimizationFlags,
  setOptimizationFlags,
  precision,
  onPrecisionChange
}) => {
  const [isMemoryOptOpen, setIsMemoryOptOpen] = React.useState(true);
  const [isModelOptOpen, setIsModelOptOpen] = React.useState(false);
  const [isFutureOptOpen, setIsFutureOptOpen] = React.useState(false);

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
                <SelectItem value="fp32">
                  <div className="flex flex-col">
                    <span>FP32 (32-bit)</span>
                    <span className="text-xs text-muted-foreground">Highest precision, 4 bytes/param</span>
                  </div>
                </SelectItem>
                <SelectItem value="fp16">
                  <div className="flex flex-col">
                    <span>FP16 (16-bit)</span>
                    <span className="text-xs text-muted-foreground">Half precision, 2 bytes/param</span>
                  </div>
                </SelectItem>
                <SelectItem value="bf16">
                  <div className="flex flex-col">
                    <span>BF16 (16-bit)</span>
                    <span className="text-xs text-muted-foreground">Brain float, 2 bytes/param</span>
                  </div>
                </SelectItem>
                <SelectItem value="int8">
                  <div className="flex flex-col">
                    <span>INT8 (8-bit)</span>
                    <span className="text-xs text-muted-foreground">Quantized, 1 byte/param</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Memory Optimizations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">3. Advanced Optimizations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Collapsible open={isMemoryOptOpen} onOpenChange={setIsMemoryOptOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded">
              <div className="flex items-center gap-2">
                <span className="font-medium">Memory Optimizations</span>
                <Badge variant="outline">Core</Badge>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isMemoryOptOpen ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-6 pt-4">
              {/* FlashAttention */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">FlashAttention / SDPA</Label>
                  <p className="text-xs text-muted-foreground">Memory-efficient attention kernel (~50% memory reduction)</p>
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
                    <Label className="text-sm font-medium">Activation Checkpointing</Label>
                    <p className="text-xs text-muted-foreground">
                      Trade compute for memory by recomputing activations
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
                  <EnhancedSlider
                    label="Memory Retention Factor"
                    value={optimizationFlags.gradientCheckpointFactor}
                    onValueChange={(value) =>
                      setOptimizationFlags(prev => ({ ...prev, gradientCheckpointFactor: value }))
                    }
                    min={0.1}
                    max={1.0}
                    step={0.1}
                    tooltip="Percentage of activation memory retained (lower = more memory saved)"
                    unit="%"
                    formatValue={(value) => (value * 100).toFixed(0)}
                  />
                )}
              </div>

              <Separator />

              {/* ZeRO Stage */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">ZeRO Stage (DeepSpeed/FSDP)</Label>
                <div className="grid grid-cols-4 gap-2">
                  {([0, 1, 2, 3] as const).map((stage) => (
                    <button
                      key={stage}
                      onClick={() =>
                        setOptimizationFlags(prev => ({ ...prev, zeroStage: stage }))
                      }
                      className={`p-3 text-sm rounded border transition-all ${
                        optimizationFlags.zeroStage === stage
                          ? 'bg-primary text-primary-foreground border-primary shadow-md'
                          : 'bg-background border-border hover:bg-muted'
                      }`}
                    >
                      <div className="font-medium">Stage {stage}</div>
                      <div className="text-xs opacity-80">
                        {stage === 0 && "No sharding"}
                        {stage === 1 && "Optimizer"}
                        {stage === 2 && "Optimizer + Gradients"}
                        {stage === 3 && "All parameters"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* CPU Offload */}
              <EnhancedSlider
                label="ZeRO CPU Offload"
                value={optimizationFlags.cpuOffloadPct}
                onValueChange={(value) =>
                  setOptimizationFlags(prev => ({ ...prev, cpuOffloadPct: value }))
                }
                min={0}
                max={100}
                step={5}
                tooltip="Percentage of optimizer states offloaded to CPU"
                unit="%"
              />
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Model Architecture Optimizations */}
          <Collapsible open={isModelOptOpen} onOpenChange={setIsModelOptOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded">
              <div className="flex items-center gap-2">
                <span className="font-medium">Model Architecture</span>
                <Badge variant="secondary">Advanced</Badge>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isModelOptOpen ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-6 pt-4">
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
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
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
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
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
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Future Optimizations */}
          <Collapsible open={isFutureOptOpen} onOpenChange={setIsFutureOptOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded">
              <div className="flex items-center gap-2">
                <span className="font-medium">Future Optimizations</span>
                <Badge variant="outline">Coming Soon</Badge>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isFutureOptOpen ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded">
                  <span>Sequence Parallelism</span>
                  <Badge variant="outline" className="text-xs">v2.0</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded">
                  <span>KV Cache INT8/INT4</span>
                  <Badge variant="outline" className="text-xs">v2.0</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded">
                  <span>2:4 Structured Sparsity</span>
                  <Badge variant="outline" className="text-xs">v2.1</Badge>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedAdvancedOptimizations;
