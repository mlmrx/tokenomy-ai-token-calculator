
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

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
  precision: string;
  onPrecisionChange: (precision: string) => void;
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
        <CardContent>
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
          <TooltipProvider>
            {/* Flash Attention */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label>FlashAttention / SDPA</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Use memory-efficient attention kernel.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Switch
                checked={optimizationFlags.flashAttention}
                onCheckedChange={(checked) => 
                  setOptimizationFlags(prev => ({ ...prev, flashAttention: checked }))
                }
              />
            </div>

            {/* Gradient Checkpointing */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label>Gradient Checkpointing</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Trade compute for memory by recomputing activations. Factor = % of activation memory retained.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Switch
                  checked={optimizationFlags.activationCheckpointing}
                  onCheckedChange={(checked) => 
                    setOptimizationFlags(prev => ({ ...prev, activationCheckpointing: checked }))
                  }
                />
              </div>
              
              {optimizationFlags.activationCheckpointing && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">
                      {Math.round(optimizationFlags.gradientCheckpointFactor * 100)}% Memory
                    </span>
                    <span className="text-xs text-muted-foreground">
                      100% = Off, Lower % = More Memory Saved (but more recompute)
                    </span>
                  </div>
                  <Slider
                    value={[optimizationFlags.gradientCheckpointFactor * 100]}
                    onValueChange={([value]) => 
                      setOptimizationFlags(prev => ({ ...prev, gradientCheckpointFactor: value / 100 }))
                    }
                    min={10}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* ZeRO Stage */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label>ZeRO Stage (DeepSpeed/FSDP)</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Parameter sharding strategy for distributed training</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((stage) => (
                  <div
                    key={stage}
                    className={`p-3 border rounded-lg cursor-pointer text-center ${
                      optimizationFlags.zeroStage === stage 
                        ? 'border-primary bg-primary/10' 
                        : 'border-muted hover:border-muted-foreground/50'
                    }`}
                    onClick={() => setOptimizationFlags(prev => ({ 
                      ...prev, 
                      zeroStage: stage as 0 | 1 | 2 | 3 
                    }))}
                  >
                    <div className="font-medium">Stage {stage}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {stage === 0 && "No sharding"}
                      {stage === 1 && "Optimizer"}
                      {stage === 2 && "Optimizer + Gradients"}
                      {stage === 3 && "All parameters"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mixture of Experts */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label>Mixture of Experts (MoE)</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Sparse MLP layers. Total params >> Active params.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
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
                <div className="grid grid-cols-2 gap-4 ml-4">
                  <div>
                    <Label className="text-sm">Total Experts (E)</Label>
                    <Input
                      type="number"
                      value={optimizationFlags.moe.experts}
                      onChange={(e) => setOptimizationFlags(prev => ({
                        ...prev,
                        moe: { ...prev.moe, experts: parseInt(e.target.value) || 8 }
                      }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Activated Experts (K)</Label>
                    <Input
                      type="number"
                      value={optimizationFlags.moe.topK}
                      onChange={(e) => setOptimizationFlags(prev => ({
                        ...prev,
                        moe: { ...prev.moe, topK: parseInt(e.target.value) || 2 }
                      }))}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* LoRA */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label>LoRA (Low-Rank Adaptation)</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Parameter-efficient fine-tuning method</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
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
                <div className="grid grid-cols-2 gap-4 ml-4">
                  <div>
                    <Label className="text-sm">Rank</Label>
                    <Input
                      type="number"
                      value={optimizationFlags.lora.rank}
                      onChange={(e) => setOptimizationFlags(prev => ({
                        ...prev,
                        lora: { ...prev.lora, rank: parseInt(e.target.value) || 64 }
                      }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Alpha</Label>
                    <Input
                      type="number"
                      value={optimizationFlags.lora.alpha}
                      onChange={(e) => setOptimizationFlags(prev => ({
                        ...prev,
                        lora: { ...prev.lora, alpha: parseInt(e.target.value) || 128 }
                      }))}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Future Tunables */}
            <div className="space-y-4 pt-4 border-t">
              <Label className="text-sm font-medium text-muted-foreground">
                Future Tunables (Placeholders):
              </Label>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Sequence Parallelism</Label>
                  <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">KV Cache INT8</Label>
                  <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">2:4 Sparsity</Label>
                  <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                </div>
              </div>
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedOptimizations;
