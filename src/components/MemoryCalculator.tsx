import React, { useState, useMemo, useCallback, useEffect } from "react";
// Shadcn UI Components - Ensure these are installed and configured
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Tooltip as ShadTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner"; // Using sonner for toast notifications (npm install sonner)

// Recharts for Charts
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
// Icons (ensure lucide-react is installed)
import { DownloadIcon, InfoIcon, LinkIcon, CopyIcon } from "lucide-react";
import { z } from 'zod'; // For state validation from URL

// --- Data Structures ---

// Input parameter definition
type ParameterDef = {
  name: string; value: number; min: number; max: number; step: number; unit: string; log?: boolean; tooltip?: string;
};

// Architecture definition
type ArchitectureType = {
  id: string; name: string; notes: string; paramFormulaDesc?: string;
};

// Quantization definition
type QuantizationType = {
  id: string; name: string; bitsPerParameter: number; memoryMultiplier: number; performanceImpact: string; reference?: string; hwSupport?: string;
};

// GPU definition
interface GpuProfile {
  id: string; name: string; vramGB: number; powerW: number; bandwidthTBps?: number; fp8Support?: boolean; hourlyUSD?: number; dataSource?: string;
}

// Cloud instance definition
interface CloudInstanceProfile {
    id: string; name: string; gpuType: string; gpuCount: number; hourlyUSD: number; dataSource?: string;
}

// Advanced memory flags
interface MemoryFlags {
  flashAttention: boolean; gradientCheckpointFactor: number; zeroStage: 0 | 1 | 2 | 3; cpuOffloadPct: number;
  moe?: { experts: number; topK: number };
  lora?: { rank: number };
  sequenceParallelism?: number; kvCachePrecision?: 'fp16' | 'int8'; sparsity24?: boolean;
}

// Cost/Energy parameters
interface CostEnergyParams {
    trainingSteps: number; tokensPerSecondPerGPU: number; gridCarbonIntensity: number;
}

// Core model parameters
interface ModelParameters {
  hiddenSize: number; numLayers: number; numHeads: number; vocabSize: number; sequenceLength: number;
  batchSize: number; microBatchSizePerGPU: number;
}

// --- Static Data (Updated based on Appendix) ---

const architectureTypes: ArchitectureType[] = [
    { id: 'TX-DEC', name: 'Transformer Decoder-Only (Dense)', notes: 'GPT-style. Standard QKV+FFN layers.', paramFormulaDesc: "~12*L*d^2 + V*d" },
    { id: 'TX-ENC', name: 'Transformer Encoder-Only (Dense)', notes: 'BERT-style. Adds Pos/Segment Embeddings.', paramFormulaDesc: "~12*L*d^2 + V*d + S*d" },
    { id: 'TX-ED', name: 'Transformer Encoder-Decoder', notes: 'T5-style. Adds Cross-Attention in Decoder.', paramFormulaDesc: "~24*L*d^2 + V*d" },
    { id: 'TX-MOE', name: 'Transformer Decoder MoE', notes: 'Sparse MLP layers. Total params >> Active params.', paramFormulaDesc: "Dense + E*MLP_Params" },
    { id: 'SSM-MAMBA', name: 'Mamba SSM', notes: 'State-Space Model. No KV Cache. Good for long sequences.', paramFormulaDesc: "~4*L*d^2" },
    { id: 'RWKV-RNN', name: 'RWKV (RNN-mode)', notes: 'Linear attention RNN. No KV Cache.', paramFormulaDesc: "~2*L*d^2" },
    { id: 'HYENA', name: 'Hyena Operator', notes: 'Long-convolution based attention replacement.', paramFormulaDesc: "~4*L*d^2 + ConvParams" },
];

const quantizationTypes: QuantizationType[] = [
  { id: 'fp32', name: "FP32", bitsPerParameter: 32, memoryMultiplier: 1.000, performanceImpact: "Baseline accuracy & memory.", hwSupport: "All" },
  { id: 'fp16', name: "FP16", bitsPerParameter: 16, memoryMultiplier: 0.500, performanceImpact: "~<0.1% Δ. Faster via Tensor Cores.", hwSupport: "Volta+", reference: "Mixed Precision Training" },
  { id: 'bf16', name: "BF16", bitsPerParameter: 16, memoryMultiplier: 0.500, performanceImpact: "~<0.1% Δ. Better stability than FP16.", hwSupport: "Ampere+", reference: "BF16 Paper" },
  { id: 'fp8_e4m3', name: "FP8 (E4M3)", bitsPerParameter: 8, memoryMultiplier: 0.250, performanceImpact: "~<0.3% Δ with TransformerEngine.", hwSupport: "Hopper+", reference: "FP8 Formats Paper / TE GitHub" },
  { id: 'fp8_e5m2', name: "FP8 (E5M2)", bitsPerParameter: 8, memoryMultiplier: 0.250, performanceImpact: "Alternative FP8 format, similar impact.", hwSupport: "Hopper+", reference: "FP8 Formats Paper / TE GitHub" },
  { id: 'int8', name: "INT8 (W8A8 PTQ)", bitsPerParameter: 8, memoryMultiplier: 0.250, performanceImpact: "~0.1-1% Δ. Requires calibration (e.g., SmoothQuant).", hwSupport: "Most GPUs (optimized on Ampere+)", reference: "SmoothQuant Paper" },
  { id: 'awq', name: "AWQ (4-bit)", bitsPerParameter: 4, memoryMultiplier: 0.125, performanceImpact: "~<1% Δ. Activation-aware PTQ.", hwSupport: "GPU/CPU Libs", reference:"Lin et al., 2023 (AWQ)"},
  { id: 'gptq', name: "GPTQ (4-bit)", bitsPerParameter: 4, memoryMultiplier: 0.125, performanceImpact: "~<1% Δ. Layer-wise PTQ.", hwSupport: "GPU/CPU Libs", reference:"Frantar et al., 2022 (GPTQ)"},
];

const gpuProfiles: GpuProfile[] = [
  { id: 'rtx3090', name: 'NVIDIA RTX 3090', vramGB: 24, powerW: 350, bandwidthTBps: 0.936, fp8Support: false, dataSource: "NVIDIA Spec" },
  { id: 'rtx4090', name: 'NVIDIA RTX 4090', vramGB: 24, powerW: 450, bandwidthTBps: 1.008, fp8Support: false, dataSource: "NVIDIA Spec" },
  { id: 'a100-40-sxm', name: 'NVIDIA A100 (40GB SXM)', vramGB: 40, powerW: 400, bandwidthTBps: 1.555, fp8Support: false, dataSource: "NVIDIA Datasheet" },
  { id: 'a100-80-sxm', name: 'NVIDIA A100 (80GB SXM)', vramGB: 80, powerW: 400, bandwidthTBps: 1.935, fp8Support: false, dataSource: "NVIDIA Datasheet" },
  { id: 'l40s', name: 'NVIDIA L40S (Ada)', vramGB: 48, powerW: 350, bandwidthTBps: 0.864, fp8Support: true, dataSource: "NVIDIA L40S Page" },
  { id: 'h100-80-pcie', name: 'NVIDIA H100 (80GB PCIe)', vramGB: 80, powerW: 350, bandwidthTBps: 2.0, fp8Support: true, dataSource: "NVIDIA Datasheet" },
  { id: 'h100-80-sxm', name: 'NVIDIA H100 (80GB SXM)', vramGB: 80, powerW: 700, bandwidthTBps: 3.35, fp8Support: true, dataSource: "NVIDIA Datasheet" },
  { id: 'h200-141-sxm', name: 'NVIDIA H200 (141GB SXM)', vramGB: 141, powerW: 700, bandwidthTBps: 4.8, fp8Support: true, dataSource: "NVIDIA H200 Page" },
  { id: 'gh200-nvl2', name: 'NVIDIA GH200 NVL2 Pair (GPU Mem)', vramGB: 282, powerW: 1000, bandwidthTBps: 9.6, fp8Support: true, dataSource: "NVIDIA GH200 Page"},
  { id: 'b100-192-sxm', name: 'NVIDIA B100 (192GB SXM - Preview)', vramGB: 192, powerW: 1000, bandwidthTBps: 8.0, fp8Support: true, dataSource: "NVIDIA Blackwell Announce" },
  { id: 'b200-192-sxm', name: 'NVIDIA B200 (192GB SXM - Preview)', vramGB: 192, powerW: 1000, bandwidthTBps: 8.0, fp8Support: true, dataSource: "NVIDIA Blackwell Announce" },
];

const cloudInstanceProfiles: CloudInstanceProfile[] = [
    { id:'aws-p5.48xlarge', name: 'AWS p5.48xlarge (8xH100-80)', gpuType:'h100-80-sxm', gpuCount: 8, hourlyUSD: 98.32, dataSource: "AWS Pricing (us-east-1, On-Demand, ~2024)"},
    { id:'aws-g6e.48xlarge', name: 'AWS g6e.48xlarge (8xL40S)', gpuType:'l40s', gpuCount: 8, hourlyUSD: 21.74, dataSource: "AWS Pricing (us-east-1, On-Demand, ~2024)"},
    { id:'gcp-a3-highgpu-8g', name: 'GCP a3-highgpu-8g (8xH100-80)', gpuType:'h100-80-sxm', gpuCount: 8, hourlyUSD: 35.00, dataSource: "GCP Pricing (us-central1, On-Demand, ~2024)" },
    { id:'azure-ndm-a100-v4', name: 'Azure NDm A100 v4 (8xA100-80)', gpuType:'a100-80-sxm', gpuCount: 8, hourlyUSD: 27.40, dataSource: "Azure Pricing (East US, On-Demand, ~2024)"},
];

const DEFAULT_GRID_INTENSITY = 0.386;

// --- Model Presets ---
interface ModelPreset {
    name: string; archId: string; modelType: string; params: Partial<ModelParameters>; flags?: Partial<MemoryFlags>; precision?: string;
}

const modelPresets: ModelPreset[] = [
    { name: "Llama-3-8B Instruct", archId: 'TX-DEC', modelType: "decoder", params: { hiddenSize: 4096, numLayers: 32, numHeads: 32, vocabSize: 128256, sequenceLength: 8192, batchSize: 64, microBatchSizePerGPU: 4 }, precision: "bf16" },
    { name: "Mixtral-8x7B", archId: 'TX-MOE', modelType: "decoder", params: { hiddenSize: 4096, numLayers: 32, numHeads: 32, vocabSize: 32000, sequenceLength: 4096, batchSize: 32, microBatchSizePerGPU: 2 }, flags: { moe: { experts: 8, topK: 2 } }, precision: "bf16" },
    { name: "Mamba-2.8B", archId: 'SSM-MAMBA', modelType: "decoder", params: { hiddenSize: 2560, numLayers: 64, numHeads: 0, vocabSize: 50277, sequenceLength: 4096, batchSize: 64, microBatchSizePerGPU: 8 }, precision: "bf16" },
    { name: "BERT-Large", archId: 'TX-ENC', modelType: "encoder", params: { hiddenSize: 1024, numLayers: 24, numHeads: 16, vocabSize: 30522, sequenceLength: 512, batchSize: 256, microBatchSizePerGPU: 32 }, precision: "fp32"},
    { name: "T5-Large (770M)", archId: 'TX-ED', modelType: "encoder-decoder", params: { hiddenSize: 1024, numLayers: 24, numHeads: 16, vocabSize: 32128, sequenceLength: 512, batchSize: 128, microBatchSizePerGPU: 16 }, precision: "fp32"},
];

// --- Helper Functions ---
const formatNumber = (num: number, precision: number = 2): string => {
    if (num === 0) return "0"; const absNum = Math.abs(num);
    if (absNum < 1) { if (absNum < 1e-6) { return num.toExponential(precision); } return num.toFixed(precision); }
    const units = ['', 'K', 'M', 'B', 'T']; const tier = Math.max(0, Math.min(units.length - 1, Math.floor(Math.log10(absNum) / 3)));
    if (tier === 0) return num.toFixed(0); const suffix = units[tier]; const scale = Math.pow(10, tier * 3); const scaled = num / scale;
    return scaled.toFixed(precision) + " " + suffix;
};
const formatBytes = (bytes: number, decimals: number = 2): string => {
    if (bytes <= 0) return '0 Bytes'; const k = 1024; const dm = decimals < 0 ? 0 : decimals; const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k)); const index = Math.min(i, sizes.length - 1);
    return parseFloat((bytes / Math.pow(k, index)).toFixed(dm)) + ' ' + sizes[index];
};
const gigabytesToBytes = (gb: number): number => gb * 1024 * 1024 * 1024;
const bytesToGigabytes = (bytes: number): number => bytes / (1024 * 1024 * 1024);

// --- Zod Schema for URL State Validation ---
const LoraSchema = z.object({ rank: z.number().positive() }).optional();
const MoeSchema = z.object({ experts: z.number().positive(), topK: z.number().positive() }).optional();
const MemoryFlagsSchema = z.object({
  flashAttention: z.boolean(), gradientCheckpointFactor: z.number().min(0.1).max(1.0),
  zeroStage: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  cpuOffloadPct: z.number().min(0).max(100), moe: MoeSchema, lora: LoraSchema,
  sequenceParallelism: z.number().optional(), kvCachePrecision: z.enum(['fp16', 'int8']).optional(), sparsity24: z.boolean().optional(),
});
const ModelParametersSchema = z.object({
  hiddenSize: z.number().positive(), numLayers: z.number().positive(), numHeads: z.number().nonnegative(),
  vocabSize: z.number().positive(), sequenceLength: z.number().positive(), batchSize: z.number().positive(), microBatchSizePerGPU: z.number().positive(),
});
const CostEnergyParamsSchema = z.object({
  trainingSteps: z.number().positive(), tokensPerSecondPerGPU: z.number().positive(), gridCarbonIntensity: z.number().nonnegative(),
});
const AppStateSchema = z.object({
  v: z.literal(2), arch: z.string(), p: ModelParametersSchema, f: MemoryFlagsSchema, prec: z.string(), hw: z.string(), ng: z.number().positive(), cost: CostEnergyParamsSchema,
});
type AppState = z.infer<typeof AppStateSchema>;

// --- Main Component ---
const MemoryCalculator = () => {
  // --- State Definitions ---
  const [architectureId, setArchitectureId] = useState<string>(modelPresets[0].archId);
  const [parameters, setParameters] = useState<ModelParameters>(() => ({
      hiddenSize: 4096, numLayers: 32, numHeads: 32, vocabSize: 50000, sequenceLength: 8192, batchSize: 8, microBatchSizePerGPU: 1,
  }));
  const [precision, setPrecision] = useState<string>(modelPresets[0].precision || "bf16");
  const [memoryFlags, setMemoryFlags] = useState<MemoryFlags>(() => ({
      flashAttention: true, gradientCheckpointFactor: 1.0, zeroStage: 0, cpuOffloadPct: 0, moe: undefined, lora: undefined,
  }));
  const [selectedHardwareId, setSelectedHardwareId] = useState<string>(gpuProfiles[6].id);
  const [numGpus, setNumGpus] = useState<number>(8);
  const [costParams, setCostParams] = useState<CostEnergyParams>({
      trainingSteps: 100000, tokensPerSecondPerGPU: 3000, gridCarbonIntensity: DEFAULT_GRID_INTENSITY,
  });
  const [isInitializedFromUrl, setIsInitializedFromUrl] = useState(false);

  // Handler to apply presets, ensuring consistency
  const handleApplyPreset = useCallback((preset: ModelPreset) => {
      setArchitectureId(preset.archId);
      setParameters(prev => {
          const newParams = {
              hiddenSize: 4096, numLayers: 32, numHeads: 32, vocabSize: 50000, sequenceLength: 8192, batchSize: 8, microBatchSizePerGPU: 1, // Start with base defaults
              ...preset.params // Apply preset params
          };
          // Ensure microBatch <= globalBatch after applying preset
          newParams.microBatchSizePerGPU = Math.min(newParams.microBatchSizePerGPU, newParams.batchSize);
          newParams.batchSize = Math.max(newParams.batchSize, newParams.microBatchSizePerGPU);
          return newParams;
      });
      setPrecision(preset.precision || 'bf16'); // Use preset precision string directly
      setMemoryFlags({ flashAttention: true, gradientCheckpointFactor: 1.0, zeroStage: 0, cpuOffloadPct: 0, moe: undefined, lora: undefined, ...preset.flags });
      toast.success(`Preset "${preset.name}" loaded.`);
  }, []); // Empty dependency array is fine here as it only uses setters

  // Deserialize state from URL
  const deserializeState = useCallback((encodedState: string) => {
    try {
        const jsonString = atob(encodedState); const parsedState = JSON.parse(jsonString);
        const validationResult = AppStateSchema.safeParse(parsedState);
        if (!validationResult.success) { console.error("URL state validation failed:", validationResult.error.errors); toast.error("Failed to load configuration from link: Invalid data."); window.location.hash = ""; return false; }
        const state = validationResult.data;
        setArchitectureId(architectureTypes.some(a => a.id === state.arch) ? state.arch : architectureTypes[0].id);
        setParameters(state.p); setMemoryFlags(state.f); setPrecision(state.prec);
        setSelectedHardwareId(gpuProfiles.some(g => g.id === state.hw) ? state.hw : gpuProfiles[6].id);
        setNumGpus(state.ng); setCostParams(state.cost);
        toast.success("Configuration loaded from link.");
        return true;
    } catch (error) { console.error("Error deserializing state:", error); toast.error("Failed to load configuration from link: Invalid format."); window.location.hash = ""; return false; }
  }, []); // Removed setters from deps, they don't need to be listed

  // Initialize state on mount: Load from URL or apply first preset
  useEffect(() => {
      let loaded = false;
      if (window.location.hash && window.location.hash.length > 1) {
          const encodedState = window.location.hash.substring(1);
          loaded = deserializeState(encodedState);
      }
      // If not loaded from URL (no hash or invalid hash), apply the first preset
      if (!loaded) {
          handleApplyPreset(modelPresets[0]);
      }
      setIsInitializedFromUrl(true); // Mark initialization attempt complete
  }, [deserializeState, handleApplyPreset]); // Add handleApplyPreset to dependencies

  // --- Input Definitions ---
  const parametersList: Record<keyof Omit<ModelParameters, 'microBatchSizePerGPU'>, ParameterDef> = {
    hiddenSize: { name: "Hidden Size (d_model)", value: parameters.hiddenSize, min: 128, max: 32768, step: 128, unit: "", tooltip: "Dimensionality of the model's embeddings and layers." },
    numLayers: { name: "Number of Layers (L)", value: parameters.numLayers, min: 1, max: 200, step: 1, unit: "", tooltip: "Number of transformer blocks (encoder or decoder)." },
    numHeads: { name: "Attention Heads", value: parameters.numHeads, min: 0, max: 128, step: 1, unit: "", tooltip: "Number of parallel attention mechanisms per layer (0 for non-attention models)." },
    vocabSize: { name: "Vocabulary Size (V)", value: parameters.vocabSize, min: 1000, max: 262144, step: 1000, unit: "", log: false, tooltip: "Number of unique tokens the model recognizes." },
    sequenceLength: { name: "Sequence Length (S)", value: parameters.sequenceLength, min: 128, max: 131072, step: 128, unit: "tokens", log: true, tooltip: "Maximum number of tokens processed in one input sequence." },
    batchSize: { name: "Target Global Batch Size (B)", value: parameters.batchSize, min: 1, max: 8192, step: 1, unit: "", log: true, tooltip: "Total effective batch size across all GPUs after gradient accumulation." }
  };
   const microBatchSizeDef: ParameterDef = {
       name: "Micro Batch Size / GPU", value: parameters.microBatchSizePerGPU, min: 1, max: 256, step: 1, unit: "", log: false, tooltip: "Number of sequences processed by each GPU in a single forward/backward pass before gradient accumulation."
   };

  // --- Permalink State Serialization ---
  const serializeState = useCallback((): string => {
    const state: AppState = { v: 2, arch: architectureId, p: parameters, f: memoryFlags, prec: precision, hw: selectedHardwareId, ng: numGpus, cost: costParams };
    try { return btoa(JSON.stringify(state)); } catch (error) { console.error("Error serializing state:", error); return ""; }
  }, [architectureId, parameters, memoryFlags, precision, selectedHardwareId, numGpus, costParams]);

   // Effect to update URL hash when state changes
   useEffect(() => {
       if (!isInitializedFromUrl) return;
       const handler = setTimeout(() => {
           const encodedState = serializeState();
           window.history.replaceState(null, '', `#${encodedState}`);
       }, 500);
       return () => clearTimeout(handler);
   }, [serializeState, isInitializedFromUrl]);

  // --- Derived State and Calculations ---
  const selectedQuantization = useMemo(() => quantizationTypes.find(q => q.id === precision) || quantizationTypes.find(q=>q.id === 'fp32')!, [precision]);
  const selectedHardware = useMemo(() => gpuProfiles.find(g => g.id === selectedHardwareId), [selectedHardwareId]);
  const selectedArchitecture = useMemo(() => architectureTypes.find(a => a.id === architectureId) || architectureTypes[0], [architectureId]);

  // --- Parameter Count Calculation ---
  const parameterDetails = useMemo(() => {
      const { hiddenSize: d, numLayers: L, vocabSize: V, sequenceLength: S } = parameters; const { moe, lora } = memoryFlags;
      let P_total_raw = 0; let P_trainable_raw = 0; let P_active_raw = 0;
      let isMoE = !!(moe && moe.experts > 1 && (architectureId === 'TX-DEC' || architectureId === 'TX-MOE' || architectureId === 'TX-ED'));
      let isLora = !!(lora && lora.rank > 0); const MLP_FACTOR = 4; const MLP_intermediate = MLP_FACTOR * d;
      switch (architectureId) {
          case 'TX-DEC': case 'TX-MOE': const P_attn_layer_dec = 4 * d * d; const P_mlp_layer_dec = 2 * d * MLP_intermediate; const P_norm_layer_dec = 2 * (2 * d); const P_layer_dec = P_attn_layer_dec + P_mlp_layer_dec + P_norm_layer_dec; const P_embedding_dec = V * d; const P_output_proj_dec = V * d; const P_final_norm_dec = 2 * d; P_total_raw = P_embedding_dec + (L * P_layer_dec) + P_final_norm_dec + P_output_proj_dec; break;
          case 'TX-ENC': const P_pos_embed_enc = S * d; const P_type_embed_enc = 2 * d; const P_embed_norm_enc = 2 * d; const P_embeddings_total_enc = V * d + P_pos_embed_enc + P_type_embed_enc + P_embed_norm_enc; const P_attn_layer_enc = 4 * d * d; const P_mlp_layer_enc = 2 * d * MLP_intermediate; const P_norm_layer_enc = 2 * (2 * d); const P_layer_enc = P_attn_layer_enc + P_mlp_layer_enc + P_norm_layer_enc; const P_pooler_enc = d * d + d; P_total_raw = P_embeddings_total_enc + (L * P_layer_enc) + P_pooler_enc; break;
          case 'TX-ED': const P_enc_attn_ed = 4 * d * d; const P_enc_mlp_ed = 2 * d * MLP_intermediate; const P_enc_norm_ed = 2 * (2 * d); const P_enc_layer_ed = P_enc_attn_ed + P_enc_mlp_ed + P_enc_norm_ed; const P_dec_self_attn_ed = 4 * d * d; const P_dec_cross_attn_ed = 4 * d * d; const P_dec_mlp_ed = 2 * d * MLP_intermediate; const P_dec_norm_ed = 3 * (2 * d); const P_dec_layer_ed = P_dec_self_attn_ed + P_dec_cross_attn_ed + P_dec_mlp_ed + P_dec_norm_ed; const P_embedding_ed = V * d; const P_final_norm_ed = 2 * d; P_total_raw = P_embedding_ed + (L * P_enc_layer_ed) + (L * P_dec_layer_ed) + P_final_norm_ed; break;
          case 'SSM-MAMBA': const P_ssm_kernel_proj = 4 * d * d; const P_conv_gate = 6 * d; const P_layer_mamba = P_ssm_kernel_proj + P_conv_gate; P_total_raw = V * d + (L * P_layer_mamba) + V * d; break;
          case 'RWKV-RNN': const P_mix_rwkv = 2 * d * d; const P_other_rwkv = 6 * d; const P_layer_rwkv = P_mix_rwkv + P_other_rwkv; P_total_raw = V * d + (L * P_layer_rwkv) + V * d; break;
          case 'HYENA': const k_conv = 128; const P_proj_hyena = 4 * d * d; const P_conv_hyena = 2 * d * k_conv; const P_layer_hyena = P_proj_hyena + P_conv_hyena; P_total_raw = V * d + (L * P_layer_hyena) + V * d; break;
          default: P_total_raw = 0;
      }
      P_trainable_raw = P_total_raw;
      if (isMoE) { const experts = moe.experts; const topK = moe.topK; const P_dense_mlp_layer = 2 * d * MLP_intermediate; const P_router_layer = d * experts; const P_experts_total_layer = experts * P_dense_mlp_layer; const P_moe_mlp_layer = P_router_layer + P_experts_total_layer; P_total_raw = P_total_raw - (L * P_dense_mlp_layer) + (L * P_moe_mlp_layer); P_trainable_raw = P_total_raw; const P_non_mlp_base = P_total_raw - (L * P_moe_mlp_layer); const P_active_experts_layer = topK * P_dense_mlp_layer; P_active_raw = P_non_mlp_base + L * (P_router_layer + P_active_experts_layer); } else { P_active_raw = P_total_raw; }
      let P_lora_raw = 0; if (isLora) { const R = lora.rank; const lora_matrices_per_layer = 2 * (d * R + R * d); P_lora_raw = L * lora_matrices_per_layer; P_trainable_raw = P_lora_raw; }
      return { totalParamsRaw: P_total_raw, trainableParamsRaw: P_trainable_raw, activeParamsRaw: P_active_raw, loraParamsRaw: P_lora_raw, isMoE, isLora };
  }, [parameters, architectureId, memoryFlags]);

  // --- Core Memory Calculation Logic ---
  const { memoryRequirementsBytes, memoryRequirementsGB, derivedParams } = useMemo(() => {
      const { hiddenSize: d, numLayers: L, sequenceLength: S, microBatchSizePerGPU: B_micro, batchSize: B_global_target } = parameters;
      const { totalParamsRaw, trainableParamsRaw, loraParamsRaw, isMoE, isLora } = parameterDetails;
      const { flashAttention, gradientCheckpointFactor, zeroStage, cpuOffloadPct, kvCachePrecision } = memoryFlags; const N_gpus = numGpus > 0 ? numGpus : 1;
      const bytesPerParamModel = selectedQuantization.bitsPerParameter / 8; const bytesPerParamOpt = 32 / 8; const optFactor = 2;
      const effective_batch_per_step = B_micro * N_gpus; const gradientAccumulationSteps = effective_batch_per_step > 0 ? Math.ceil(B_global_target / effective_batch_per_step) : 1;
      let modelWeightsBytes = totalParamsRaw * bytesPerParamModel; if (isLora) { modelWeightsBytes += loraParamsRaw * (16 / 8); } if (zeroStage === 3) { modelWeightsBytes /= N_gpus; }
      let optimizerStateBytes = trainableParamsRaw * bytesPerParamOpt * optFactor; if (zeroStage >= 1) { optimizerStateBytes /= N_gpus; }
      const computePrecisionBits = (selectedQuantization.bitsPerParameter <= 16 && selectedQuantization.id !== 'int8') ? 16 : 32; const bytesPerParamCompute = computePrecisionBits / 8;
      let gradientMemoryBytes = trainableParamsRaw * bytesPerParamCompute; if (zeroStage >= 2) { gradientMemoryBytes /= N_gpus; }
      let activationMemoryBytes = 0; const bytesPerActivation = bytesPerParamCompute; let baseActivFactor = 0;
      if (architectureId.startsWith('TX')) { baseActivFactor = 28; } else if (architectureId === 'SSM-MAMBA' || architectureId === 'RWKV-RNN') { baseActivFactor = 4; } else if (architectureId === 'HYENA') { baseActivFactor = 16; }
      activationMemoryBytes = B_micro * S * d * L * bytesPerActivation * baseActivFactor;
      if (flashAttention && S > 1024 && architectureId.startsWith('TX')) { activationMemoryBytes *= 0.7; } if (gradientCheckpointFactor < 1.0) { activationMemoryBytes *= gradientCheckpointFactor; } if (isMoE) { activationMemoryBytes *= 1.1; }
      const FRAGMENTATION_FACTOR = 0.10; let tempMemoryBytes = (modelWeightsBytes + optimizerStateBytes + gradientMemoryBytes + activationMemoryBytes) * FRAGMENTATION_FACTOR;
      let cpuSwapBytes = 0; if (zeroStage >= 1 && cpuOffloadPct > 0) { const offloadFraction = cpuOffloadPct / 100; let bytesToOffload = 0; if (zeroStage >= 1) bytesToOffload += optimizerStateBytes; if (zeroStage >= 2) bytesToOffload += gradientMemoryBytes; cpuSwapBytes = bytesToOffload * offloadFraction; if (zeroStage >= 1) optimizerStateBytes *= (1 - offloadFraction); if (zeroStage >= 2) gradientMemoryBytes *= (1 - offloadFraction); }
      const totalTrainingBytesPerGPU = modelWeightsBytes + activationMemoryBytes + optimizerStateBytes + gradientMemoryBytes + tempMemoryBytes;
      let inferenceModelWeightsBytes = totalParamsRaw * bytesPerParamModel; if (isLora) { inferenceModelWeightsBytes += loraParamsRaw * (16 / 8); }
      let inferenceActivationBytes = 0; const INFERENCE_KV_CACHE_FACTOR = 1.0; const INFERENCE_SSM_FACTOR = 0.1;
      if (architectureId.startsWith('TX')) { const kvBytes = B_micro * S * L * 2 * d * (kvCachePrecision === 'int8' ? 1 : bytesPerParamCompute); inferenceActivationBytes = kvBytes * INFERENCE_KV_CACHE_FACTOR; }
      else if (architectureId === 'SSM-MAMBA' || architectureId === 'RWKV-RNN') { inferenceActivationBytes = activationMemoryBytes * INFERENCE_SSM_FACTOR; }
      else { inferenceActivationBytes = activationMemoryBytes * 0.5; }
      if (flashAttention && S > 1024 && architectureId.startsWith('TX')) { inferenceActivationBytes *= 0.7; }
      const inferenceTempBytes = tempMemoryBytes * 0.5; const totalInferenceBytesPerGPU = inferenceModelWeightsBytes + inferenceActivationBytes + inferenceTempBytes;
      const bytesResult = { modelWeightsBytes, activationMemoryBytes, optimizerStateBytes, gradientMemoryBytes, tempMemoryBytes, totalTrainingBytesPerGPU, totalInferenceBytesPerGPU, cpuSwapBytes };
      const gbResult = { modelWeightsGB: bytesToGigabytes(bytesResult.modelWeightsBytes), activationMemoryGB: bytesToGigabytes(bytesResult.activationMemoryBytes), optimizerStateGB: bytesToGigabytes(bytesResult.optimizerStateBytes), gradientMemoryGB: bytesToGigabytes(bytesResult.gradientMemoryBytes), tempMemoryGB: bytesToGigabytes(bytesResult.tempMemoryBytes), totalTrainingGB: bytesToGigabytes(bytesResult.totalTrainingBytesPerGPU), totalInferenceGB: bytesToGigabytes(bytesResult.totalInferenceBytesPerGPU), cpuSwapGB: bytesToGigabytes(bytesResult.cpuSwapBytes) };
      const derivedResult = { gradientAccumulationSteps };
      return { memoryRequirementsBytes: bytesResult, memoryRequirementsGB: gbResult, derivedParams: derivedResult };
  }, [parameters, architectureId, selectedQuantization, memoryFlags, numGpus, parameterDetails]);

  // Calculate Cost & Energy
  const costEnergyResults = useMemo(() => {
      if (!selectedHardware || costParams.tokensPerSecondPerGPU <= 0 || numGpus <= 0 || costParams.trainingSteps <= 0) return null;
      const S = parameters.sequenceLength; const B_global_target = parameters.batchSize; const steps = costParams.trainingSteps; const tokenPerSecPerGPU = costParams.tokensPerSecondPerGPU; const nGPUs = numGpus;
      const totalTokens = steps * B_global_target * S; const totalTokenPerSec = tokenPerSecPerGPU * nGPUs; const totalSeconds = totalTokenPerSec > 0 ? totalTokens / totalTokenPerSec : 0; const totalHours = totalSeconds / 3600;
      const totalPowerKW = (selectedHardware.powerW * nGPUs) / 1000; const energyKWh = totalHours * totalPowerKW; const co2kg = energyKWh * costParams.gridCarbonIntensity;
      const matchingInstance = cloudInstanceProfiles.find(inst => inst.gpuType === selectedHardware.id && inst.gpuCount === nGPUs); let hourlyRate = 0; let costSource = "N/A (No Pricing Data)";
      if (matchingInstance) { hourlyRate = matchingInstance.hourlyUSD; costSource = `${matchingInstance.name} (${matchingInstance.dataSource || 'Cloud Provider'})`; }
      else if (selectedHardware.hourlyUSD && nGPUs > 0) { hourlyRate = selectedHardware.hourlyUSD * nGPUs; costSource = `${nGPUs}x ${selectedHardware.name} (GPU Estimate)`; }
      else { const similarInstance = cloudInstanceProfiles.find(inst => inst.gpuType === selectedHardware.id); if (similarInstance) { hourlyRate = (similarInstance.hourlyUSD / similarInstance.gpuCount) * nGPUs; costSource = `${nGPUs}x ${selectedHardware.name} (Scaled from ${similarInstance.name})`; } }
      const totalCostUSD = totalHours * hourlyRate;
      return { gpuHours: totalHours * nGPUs, wallHours: totalHours, energyKWh, co2kg, totalCostUSD, costBasis: hourlyRate > 0 ? `$${hourlyRate.toFixed(3)}/hr (${costSource})` : costSource };
  }, [parameters.sequenceLength, parameters.batchSize, costParams, selectedHardware, numGpus]);

  // Calculate Disk Sizes
  const diskSizeEstimates = useMemo(() => {
      const P_total = parameterDetails.totalParamsRaw; const P_trainable = parameterDetails.trainableParamsRaw; const bitsPerParam = selectedQuantization.bitsPerParameter; const bytesPerParam = bitsPerParam / 8; const bytesPerParamOpt = 32 / 8; const optMultiplier = 2;
      const modelFileSize = P_total * bytesPerParam; const optimizerStateSize = P_trainable * bytesPerParamOpt * optMultiplier;
      let fullCheckpointSize = (P_total * bytesPerParam) + optimizerStateSize;
      if (parameterDetails.isLora) { fullCheckpointSize = (P_total * bytesPerParam) + (parameterDetails.loraParamsRaw * (16/8)) + optimizerStateSize; }
      return { modelFileSizeGB: bytesToGigabytes(modelFileSize), optimizerStateSizeGB: bytesToGigabytes(optimizerStateSize), fullCheckpointSizeGB: bytesToGigabytes(fullCheckpointSize) };
  }, [parameterDetails, selectedQuantization]);

  // Calculate Chinchilla Optimal Tokens
  const chinchillaOptimalTokens = useMemo(() => {
      const paramsB = parameterDetails.totalParamsRaw / 1e9; if (paramsB <= 0) return 0; return 20 * parameterDetails.totalParamsRaw;
  }, [parameterDetails.totalParamsRaw]);

  // --- UI Handlers ---
  const handleParameterChange = useCallback((param: keyof ModelParameters, value: number | string) => {
      const isMicroBatch = param === 'microBatchSizePerGPU'; const def = isMicroBatch ? microBatchSizeDef : parametersList[param as keyof Omit<ModelParameters, 'microBatchSizePerGPU'>];
      let numValue = typeof value === 'string' ? parseFloat(value) : value; if (isNaN(numValue)) numValue = def.min; numValue = Math.max(def.min, Math.min(def.max, numValue));
      if (isMicroBatch && numValue > parameters.batchSize) { numValue = parameters.batchSize; toast.warning("Micro batch size cannot exceed global batch size."); }
      if (param === 'batchSize' && numValue < parameters.microBatchSizePerGPU) { numValue = parameters.microBatchSizePerGPU; toast.warning("Global batch size cannot be smaller than micro batch size."); }
      setParameters(prev => ({ ...prev, [param]: numValue }));
  }, [parameters.batchSize, parameters.microBatchSizePerGPU]); // Only depends on these specific params for validation

  const handleFlagChange = useCallback((flag: keyof MemoryFlags, value: any) => {
      if (flag === 'moe' && value === true) value = { experts: 8, topK: 2 }; else if (flag === 'moe' && value === false) value = undefined;
      else if (flag === 'lora' && value === true) value = { rank: 8 }; else if (flag === 'lora' && value === false) value = undefined;
      else if (flag === 'zeroStage') value = parseInt(String(value)) || 0; else if (flag === 'gradientCheckpointFactor') value = parseFloat(String(value)) || 1.0;
      setMemoryFlags(prev => ({ ...prev, [flag]: value }));
      if (flag === 'zeroStage' && value === 0) setMemoryFlags(prev => ({ ...prev, cpuOffloadPct: 0 }));
  }, []);

  const handleCostParamChange = useCallback((param: keyof CostEnergyParams, value: string) => {
      let numValue = parseFloat(value); if (isNaN(numValue) || numValue < 0) numValue = 0; if (param === 'trainingSteps' && numValue < 1 && value !== '') numValue = 1;
      setCostParams(prev => ({ ...prev, [param]: numValue }));
  }, []);

  // handleApplyPreset is defined in the useEffect for initialization

  const handleCopyLink = useCallback(() => {
      const encodedState = serializeState(); const url = `${window.location.origin}${window.location.pathname}#${encodedState}`;
      navigator.clipboard.writeText(url).then(() => toast.success("Link copied!")).catch(err => toast.error("Failed to copy link."));
  }, [serializeState]);

   // --- Chart Data Preparation ---
    const trainingMemoryBreakdownData = useMemo(() => [
        { name: "Model Weights", value: memoryRequirementsGB.modelWeightsGB }, { name: "Activations", value: memoryRequirementsGB.activationMemoryGB },
        { name: "Optimizer States", value: memoryRequirementsGB.optimizerStateGB }, { name: "Gradients", value: memoryRequirementsGB.gradientMemoryGB },
        { name: "Temp/Overhead", value: memoryRequirementsGB.tempMemoryGB },
    ].filter(item => item && item.value > 0.001), [memoryRequirementsGB]);

    const inferenceMemoryBreakdownData = useMemo(() => {
        // Calculate inference weights based on total inference memory minus estimated activations and temp
        const inferenceActivationsGB = bytesToGigabytes(memoryRequirementsBytes.activationMemoryBytes * 0.5);
        const inferenceTempGB = bytesToGigabytes(memoryRequirementsBytes.tempMemoryBytes * 0.5);
        const inferredWeightsGB = Math.max(0, memoryRequirementsGB.totalInferenceGB - inferenceActivationsGB - inferenceTempGB);

        return [
            { name: "Model Weights", value: inferredWeightsGB },
            { name: "Activations", value: inferenceActivationsGB },
            { name: "Temp/Overhead", value: inferenceTempGB },
        ].filter(item => item && item.value > 0.001);
    }, [memoryRequirementsBytes, memoryRequirementsGB.totalInferenceGB]);


    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19AF', '#DB2777'];
    const vramUsagePercent = selectedHardware ? (memoryRequirementsGB.totalTrainingGB / selectedHardware.vramGB) * 100 : 0;
    const getVramBarColor = (usage: number): string => {
        if (!selectedHardware || selectedHardware.vramGB === 0) return 'bg-gray-400'; if (usage > 100) return 'bg-red-600'; if (usage > 90) return 'bg-red-500';
        if (usage > 70) return 'bg-amber-500'; if (usage > 0) return 'bg-green-500'; return 'bg-secondary';
    };

  // --- Render Component ---
  return (
    <TooltipProvider delayDuration={300}>
    <div className="container mx-auto p-4 lg:p-6 space-y-6">
      <Card className="overflow-visible">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold tracking-tight">Enhanced LLM Memory & Capacity Planner</CardTitle>
          <CardDescription className="text-center text-muted-foreground"> Estimate VRAM, training time, cost, and environmental impact with advanced optimizations. </CardDescription>
            <div className="flex flex-wrap gap-2 justify-center pt-4">
                <Label className="pt-1.5 font-semibold mr-2 text-sm">Load Preset:</Label>
                {modelPresets.map(p => ( <Button key={p.name} variant="outline" size="sm" onClick={() => handleApplyPreset(p)} className="text-xs h-7">{p.name}</Button> ))}
            </div>
            <div className="flex justify-center pt-3">
                <Button variant="ghost" size="sm" onClick={handleCopyLink} className="text-xs h-7 text-blue-600 hover:text-blue-800"> <LinkIcon className="w-3 h-3 mr-1.5"/> Copy Sharable Link </Button>
            </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* === Left Column: Configuration === */}
            <div className="space-y-5">
               {/* --- Model Configuration --- */}
               <Card>
                 <CardHeader className="pb-4"><CardTitle className="text-lg">1. Model Configuration</CardTitle></CardHeader>
                 <CardContent className="space-y-4">
                     {/* Architecture Selector */}
                     <div>
                         <Label htmlFor="architectureType">Architecture</Label>
                         <Select value={architectureId} onValueChange={setArchitectureId}>
                             <SelectTrigger id="architectureType"><SelectValue /></SelectTrigger>
                             <SelectContent> {architectureTypes.map(arch => ( <SelectItem key={arch.id} value={arch.id}>{arch.name}</SelectItem> ))} </SelectContent>
                         </Select>
                         <p className="text-xs text-muted-foreground mt-1">{selectedArchitecture?.notes}</p>
                     </div>
                     {/* Parameter Sliders/Inputs */}
                     {Object.entries(parametersList).map(([key, param]) => (
                         <div key={key}>
                             <div className="flex justify-between items-center mb-1">
                                 {/* Label with Tooltip Trigger on InfoIcon */}
                                 <Label htmlFor={key} className="text-sm font-medium flex items-center">
                                     {param.name} {param.unit && `(${param.unit})`}
                                     {param.tooltip && (
                                         <ShadTooltip>
                                             <TooltipTrigger asChild>
                                                 <InfoIcon className="w-3 h-3 ml-1.5 text-muted-foreground cursor-help"/>
                                             </TooltipTrigger>
                                             <TooltipContent><p className="max-w-xs">{param.tooltip}</p></TooltipContent>
                                         </ShadTooltip>
                                     )}
                                 </Label>
                                 <Input type="number" id={`${key}-input`} value={parameters[key as keyof Omit<ModelParameters, 'microBatchSizePerGPU'>]} onChange={(e) => handleParameterChange(key as keyof Omit<ModelParameters, 'microBatchSizePerGPU'>, e.target.value)} min={param.min} max={param.max} step={param.step} className="w-28 h-8 text-sm" aria-label={`${param.name} value`}/>
                             </div>
                             <Slider id={key} min={param.min} max={param.max} step={param.step} value={[parameters[key as keyof Omit<ModelParameters, 'microBatchSizePerGPU'>]]} onValueChange={(value) => handleParameterChange(key as keyof Omit<ModelParameters, 'microBatchSizePerGPU'>, value[0])} className="mt-1" aria-label={`${param.name} slider`}/>
                         </div>
                     ))}
                     {/* Micro Batch Size Input */}
                     <div>
                         <div className="flex justify-between items-center mb-1">
                              {/* Label with Tooltip Trigger on InfoIcon */}
                             <Label htmlFor="microBatchSizePerGPU" className="text-sm font-medium flex items-center">
                                 {microBatchSizeDef.name}
                                 {microBatchSizeDef.tooltip && (
                                     <ShadTooltip>
                                         <TooltipTrigger asChild>
                                             <InfoIcon className="w-3 h-3 ml-1.5 text-muted-foreground cursor-help"/>
                                         </TooltipTrigger>
                                         <TooltipContent><p className="max-w-xs">{microBatchSizeDef.tooltip}</p></TooltipContent>
                                     </ShadTooltip>
                                 )}
                             </Label>
                             <Input type="number" id="microBatchSizePerGPU-input" value={parameters.microBatchSizePerGPU} onChange={(e) => handleParameterChange('microBatchSizePerGPU', e.target.value)} min={microBatchSizeDef.min} max={microBatchSizeDef.max} step={microBatchSizeDef.step} className="w-28 h-8 text-sm" aria-label={`${microBatchSizeDef.name} value`}/>
                         </div>
                         <Slider id="microBatchSizePerGPU" min={microBatchSizeDef.min} max={microBatchSizeDef.max} step={microBatchSizeDef.step} value={[parameters.microBatchSizePerGPU]} onValueChange={(value) => handleParameterChange('microBatchSizePerGPU', value[0])} className="mt-1" aria-label={`${microBatchSizeDef.name} slider`}/>
                     </div>
                 </CardContent>
               </Card>
                {/* --- Precision & Quantization --- */}
               <Card>
                 <CardHeader className="pb-4"><CardTitle className="text-lg">2. Precision & Quantization</CardTitle></CardHeader>
                 <CardContent>
                     <div>
                         {/* Label with Tooltip Trigger on InfoIcon */}
                         <Label htmlFor="precision" className="mb-1 flex items-center">
                             Compute & Storage Precision
                             <ShadTooltip>
                                 <TooltipTrigger asChild>
                                     <InfoIcon className="w-3 h-3 ml-1.5 text-muted-foreground cursor-help"/>
                                 </TooltipTrigger>
                                 <TooltipContent side="right" className="max-w-sm p-2">
                                     <p>Select the numerical format.</p>
                                     <p className="mt-1"><strong>{selectedQuantization.name}:</strong> {selectedQuantization.performanceImpact}</p>
                                     {selectedQuantization.hwSupport && <p className="text-xs mt-1">HW Support: {selectedQuantization.hwSupport}</p>}
                                     {selectedQuantization.reference && <p className="text-xs mt-1">Ref: {selectedQuantization.reference}</p>}
                                 </TooltipContent>
                             </ShadTooltip>
                         </Label>
                         <Select value={precision} onValueChange={setPrecision}>
                             <SelectTrigger id="precision"><SelectValue /></SelectTrigger>
                             <SelectContent> {quantizationTypes.map(q => ( <SelectItem key={q.id} value={q.id}> {q.name} ({q.bitsPerParameter}-bit) </SelectItem> ))} </SelectContent>
                         </Select>
                     </div>
                 </CardContent>
               </Card>
               {/* --- Advanced Optimizations --- */}
                <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-lg font-semibold px-6 py-4 hover:no-underline"> <span className="mr-auto">3. Advanced Optimizations (Optional)</span> </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 space-y-6">
                       {/* Flash Attention */}
                       <div className="flex items-center justify-between space-x-2 border-b pb-4">
                           {/* Label with Tooltip Trigger on InfoIcon */}
                            <Label htmlFor="flashAttention" className="flex flex-col space-y-1 pr-4">
                                <span className="flex items-center">
                                    FlashAttention / SDPA
                                    <ShadTooltip>
                                        <TooltipTrigger asChild><InfoIcon className="w-3 h-3 ml-1.5 text-muted-foreground cursor-help"/></TooltipTrigger>
                                        <TooltipContent><p>Applies ~30% activation memory reduction heuristic if SeqLen > 1024.</p></TooltipContent>
                                    </ShadTooltip>
                                </span>
                                <span className="font-normal leading-snug text-muted-foreground text-sm"> Use memory-efficient attention kernel. </span>
                            </Label>
                            <Switch id="flashAttention" checked={memoryFlags.flashAttention} onCheckedChange={(c) => handleFlagChange('flashAttention', c)} />
                        </div>
                       {/* Gradient Checkpointing */}
                       <div className="border-b pb-4">
                           <div className="flex justify-between items-center mb-1">
                               <Label htmlFor="gradCheckpoint" className="flex flex-col space-y-1">
                                   <span>Gradient Checkpointing</span>
                                   <span className="font-normal leading-snug text-muted-foreground text-sm"> Trade compute for memory by recomputing activations. Factor = % of activation memory retained. </span>
                               </Label>
                               <span className="text-sm font-medium whitespace-nowrap ml-2">{Math.round(memoryFlags.gradientCheckpointFactor * 100)}% Memory</span>
                           </div>
                           <Slider id="gradCheckpoint" min={0.3} max={1.0} step={0.05} value={[memoryFlags.gradientCheckpointFactor]} onValueChange={(v) => handleFlagChange('gradientCheckpointFactor', v[0])} aria-label="Gradient Checkpointing Factor"/>
                           <span className="text-xs text-muted-foreground">100% = Off, Lower % = More Memory Saved (but more recompute)</span>
                       </div>
                       {/* ZeRO Optimization */}
                       <div className="border-b pb-4">
                            {/* Label with Tooltip Trigger on InfoIcon */}
                           <Label className="mb-2 block font-medium flex items-center">
                               ZeRO Stage (DeepSpeed/FSDP)
                               <ShadTooltip>
                                   <TooltipTrigger asChild><InfoIcon className="w-3 h-3 ml-1.5 text-muted-foreground cursor-help"/></TooltipTrigger>
                                   <TooltipContent side="bottom" className="max-w-md p-3">
                                       <p className="font-semibold mb-1">ZeRO partitions model state across GPUs:</p>
                                       <ul className="list-disc list-inside text-xs space-y-1"> <li><b>Stage 0:</b> None (standard data parallelism).</li> <li><b>Stage 1:</b> Shards Optimizer States.</li> <li><b>Stage 2:</b> Shards Optimizer States & Gradients.</li> <li><b>Stage 3:</b> Shards Optimizer States, Gradients, & Model Parameters.</li> </ul>
                                       <p className="text-xs mt-2">Reduces memory per GPU but increases communication.</p>
                                   </TooltipContent>
                               </ShadTooltip>
                           </Label>
                           <RadioGroup value={String(memoryFlags.zeroStage)} onValueChange={(v) => handleFlagChange('zeroStage', v)} className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
                               {[0, 1, 2, 3].map(stage => ( <div key={stage} className="flex items-center space-x-2"> <RadioGroupItem value={String(stage)} id={`zero-${stage}`} /> <Label htmlFor={`zero-${stage}`} className="font-normal">Stage {stage}</Label> </div> ))}
                           </RadioGroup>
                           {/* ZeRO CPU Offload */}
                           {memoryFlags.zeroStage >= 1 && ( <div className="mt-4"> <div className="flex justify-between items-center mb-1"> <Label htmlFor="cpuOffload" className="flex flex-col space-y-1"> <span>ZeRO CPU Offload %</span> <span className="font-normal leading-snug text-muted-foreground text-sm"> Offload sharded optimizer/gradients (Stage {memoryFlags.zeroStage}) to CPU RAM. </span> </Label> <span className="text-sm font-medium whitespace-nowrap ml-2">{memoryFlags.cpuOffloadPct}%</span> </div> <Slider id="cpuOffload" min={0} max={100} step={5} value={[memoryFlags.cpuOffloadPct]} onValueChange={(v) => handleFlagChange('cpuOffloadPct', v[0])} disabled={memoryFlags.zeroStage === 0} aria-label="CPU Offload Percentage"/> <span className="text-xs text-muted-foreground">Requires sufficient CPU RAM. Slows down training due to PCIe transfers.</span> </div> )}
                       </div>
                       {/* Mixture of Experts (MoE) */}
                       <div className="border-b pb-4">
                           <div className="flex items-center justify-between mb-3">
                               {/* Label with Tooltip Trigger on InfoIcon */}
                               <Label className="font-medium flex items-center">
                                   Mixture of Experts (MoE)
                                   <ShadTooltip>
                                       <TooltipTrigger asChild><InfoIcon className="w-3 h-3 ml-1.5 text-muted-foreground cursor-help"/></TooltipTrigger>
                                       <TooltipContent><p className="max-w-xs">Replaces dense MLP layers with sparse MoE layers. Increases total parameters but keeps active parameters/token low.</p></TooltipContent>
                                   </ShadTooltip>
                               </Label>
                               <Switch id="enableMoE" checked={!!memoryFlags.moe} onCheckedChange={(checked) => handleFlagChange('moe', checked)} aria-label="Enable Mixture of Experts"/>
                           </div>
                           {memoryFlags.moe && ( <div className="grid grid-cols-2 gap-4"> <div> <Label htmlFor="moeExperts" className="text-sm">Total Experts (E)</Label> <Input id="moeExperts" type="number" min="2" step="1" value={memoryFlags.moe.experts} onChange={(e) => handleFlagChange('moe', { ...memoryFlags.moe, experts: parseInt(e.target.value) || 2 })} className="h-8 text-sm"/> </div> <div> <Label htmlFor="moeTopK" className="text-sm">Activated Experts (K)</Label> <Input id="moeTopK" type="number" min="1" step="1" max={memoryFlags.moe.experts} value={memoryFlags.moe.topK} onChange={(e) => handleFlagChange('moe', { ...memoryFlags.moe, topK: Math.min(parseInt(e.target.value) || 1, memoryFlags.moe?.experts || 1) })} className="h-8 text-sm"/> </div> </div> )}
                       </div>
                       {/* LoRA / QLoRA */}
                       <div className="border-b pb-4">
                           <div className="flex items-center justify-between mb-3">
                               {/* Label with Tooltip Trigger on InfoIcon */}
                               <Label className="font-medium flex items-center">
                                   LoRA (Low-Rank Adaptation)
                                   <ShadTooltip>
                                       <TooltipTrigger asChild><InfoIcon className="w-3 h-3 ml-1.5 text-muted-foreground cursor-help"/></TooltipTrigger>
                                       <TooltipContent><p className="max-w-xs">Parameter-Efficient Fine-Tuning (PEFT) method. Freezes base model, trains small adapter matrices. Drastically reduces trainable params & optimizer memory.</p></TooltipContent>
                                   </ShadTooltip>
                               </Label>
                               <Switch id="enableLora" checked={!!memoryFlags.lora} onCheckedChange={(checked) => handleFlagChange('lora', checked)} aria-label="Enable LoRA"/>
                           </div>
                           {memoryFlags.lora && (
                               <div className="mt-2">
                                   <Label htmlFor="loraRank" className="text-sm">LoRA Rank (r)</Label>
                                   {/* Tooltip on Label */}
                                   <ShadTooltip>
                                        <TooltipTrigger asChild>
                                            {/* Wrap Select in span for Tooltip Trigger */}
                                            <span>
                                                <Select value={String(memoryFlags.lora.rank)} onValueChange={(v) => handleFlagChange('lora', { ...memoryFlags.lora, rank: parseInt(v) || 4 })}>
                                                    <SelectTrigger id="loraRank" className="h-8 text-sm"><SelectValue /></SelectTrigger>
                                                    <SelectContent> {[4, 8, 16, 32, 64, 128, 256].map(r => <SelectItem key={r} value={String(r)}>{r}</SelectItem>)} </SelectContent>
                                                </Select>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent> <p>LoRA rank 'r'. Higher rank means more trainable parameters (≈ 2*L*2*H*r) but potentially better adaptation. Common values: 4-64.</p> </TooltipContent>
                                   </ShadTooltip>
                               </div>
                           )}
                       </div>
                       {/* Future Tunables Placeholder */} <div className="pt-4 space-y-2 text-sm text-muted-foreground"> <p className="font-medium text-foreground">Future Tunables (Placeholders):</p> <div className="flex items-center justify-between"><span>Sequence Parallelism</span> <Switch disabled /></div> <div className="flex items-center justify-between"><span>KV Cache INT8</span> <Switch disabled /></div> <div className="flex items-center justify-between"><span>2:4 Sparsity</span> <Switch disabled /></div> </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                 {/* --- Hardware Configuration --- */}
                <Card>
                   <CardHeader className="pb-4"><CardTitle className="text-lg">4. Hardware Configuration</CardTitle></CardHeader>
                   <CardContent className="space-y-4">
                       <div>
                           <Label htmlFor="gpuType">Target GPU</Label>
                           <Select value={selectedHardwareId} onValueChange={setSelectedHardwareId}>
                               <SelectTrigger id="gpuType"><SelectValue /></SelectTrigger>
                               <SelectContent> {gpuProfiles.map(g => ( <SelectItem key={g.id} value={g.id}> {g.name} ({g.vramGB} GB VRAM{g.bandwidthTBps ? `, ${g.bandwidthTBps} TB/s` : ''}{g.fp8Support ? ', FP8' : ''}) </SelectItem> ))} </SelectContent>
                           </Select>
                       </div>
                       <div>
                           <Label htmlFor="numGpus">Number of GPUs</Label>
                           <Input id="numGpus" type="number" min="1" step="1" max="1024" value={numGpus} onChange={(e) => setNumGpus(parseInt(e.target.value) || 1)} className="h-8 text-sm"/>
                           <p className="text-xs text-muted-foreground mt-1">Used for ZeRO sharding, calculating micro-batch size, and total cost/power.</p>
                       </div>
                   </CardContent>
               </Card>
            </div> {/* End Left Column */}

            {/* === Right Column: Results === */}
            <div className="space-y-5">
              {/* --- Parameter & Training Summary --- */}
               <Card>
                 <CardHeader className="pb-2"><CardTitle className="text-lg">Parameter & Training Summary</CardTitle></CardHeader>
                 <CardContent className="grid grid-cols-2 gap-x-4 gap-y-3 text-center">
                      <div> <Label className="text-xs text-muted-foreground block mb-0.5">Total Parameters</Label> <div className="text-xl font-bold"> {formatNumber(parameterDetails.totalParamsRaw, 2)} {parameterDetails.isMoE && <span className="text-xs font-normal text-emerald-600">(MoE)</span>} </div> <div className="text-xs text-muted-foreground">({(parameterDetails.totalParamsRaw / 1e9).toFixed(2)} B)</div> </div>
                      <div> <Label className="text-xs text-muted-foreground block mb-0.5">Trainable Parameters</Label> <div className="text-xl font-bold"> {formatNumber(parameterDetails.trainableParamsRaw, 2)} {parameterDetails.isLora && <span className="text-xs font-normal text-blue-600">(LoRA)</span>} </div> <div className="text-xs text-muted-foreground">({(parameterDetails.trainableParamsRaw / (parameterDetails.totalParamsRaw || 1) * 100).toFixed(2)}% of total)</div> </div>
                      {parameterDetails.isMoE && ( <div className="col-span-2"> <Label className="text-xs text-muted-foreground block mb-0.5">Active Parameters / Token (MoE)</Label> <div className="text-lg font-semibold"> {formatNumber(parameterDetails.activeParamsRaw, 2)} </div> <div className="text-xs text-muted-foreground">({(parameterDetails.activeParamsRaw / (parameterDetails.totalParamsRaw || 1) * 100).toFixed(2)}% of total)</div> </div> )}
                      <div className="col-span-2 border-t pt-3 mt-1"> <Label className="text-xs text-muted-foreground block mb-0.5">Gradient Accumulation Steps</Label> <div className="text-xl font-bold">{derivedParams.gradientAccumulationSteps}</div> <p className="text-xs text-muted-foreground">Needed to reach Global Batch Size of {parameters.batchSize} with {parameters.microBatchSizePerGPU} micro-batch / GPU across {numGpus} GPU(s).</p> </div>
                      <div className="col-span-2 border-t pt-3 mt-1"> <Label className="text-xs text-muted-foreground block mb-0.5 flex items-center justify-center">Chinchilla Optimal Tokens (Approx) <ShadTooltip> <TooltipTrigger asChild><InfoIcon className="w-3 h-3 ml-1 text-muted-foreground cursor-help"/></TooltipTrigger> <TooltipContent><p>Rule of thumb (~20 tokens/param) for compute-optimal training dataset size.</p></TooltipContent> </ShadTooltip> </Label> <div className="text-lg font-semibold">{formatNumber(chinchillaOptimalTokens, 2)}</div> </div>
                 </CardContent>
               </Card>
              {/* --- Memory Requirements --- */}
              <Card>
                  <CardHeader className="pb-4"><CardTitle className="text-lg">Estimated Memory Requirements</CardTitle></CardHeader>
                  <CardContent>
                     <div className="mb-6"> <div className="flex justify-between items-center mb-1 text-sm"> <Label>Est. Training VRAM / GPU</Label> <span className={`font-bold ${vramUsagePercent > 100 ? 'text-red-600' : ''}`}> {memoryRequirementsGB.totalTrainingGB.toFixed(2)} GB {selectedHardware && ` / ${selectedHardware.vramGB} GB`} {selectedHardware && ` (${vramUsagePercent.toFixed(0)}%)`} </span> </div> <div className={`w-full h-3 ${getVramBarColor(0)} rounded-full overflow-hidden bg-opacity-50`}> <div className={`h-full ${getVramBarColor(vramUsagePercent)} transition-all duration-300 ease-out rounded-full`} style={{ width: `${Math.min(100, Math.max(0, vramUsagePercent))}%` }} /> </div> {memoryRequirementsGB.cpuSwapGB > 0 && ( <p className="text-xs text-muted-foreground mt-1 text-center"> (+ {memoryRequirementsGB.cpuSwapGB.toFixed(2)} GB offloaded to CPU RAM per GPU via ZeRO Offload) </p> )} {vramUsagePercent > 100 && ( <p className="text-xs text-red-600 font-semibold mt-1 text-center"> Warning: Estimated VRAM exceeds target GPU capacity! </p> )} {!selectedHardware && ( <p className="text-xs text-muted-foreground mt-1 text-center"> Select hardware to compare usage against VRAM limit. </p> )} </div>
                    <Tabs defaultValue="training">
                      <TabsList className="grid w-full grid-cols-2"> <TabsTrigger value="training">Training Breakdown</TabsTrigger> <TabsTrigger value="inference">Inference Estimate</TabsTrigger> </TabsList>
                      <TabsContent value="training" className="mt-4 space-y-4"> <div className="grid grid-cols-2 gap-3 text-center"> <div className="bg-secondary/50 p-2 rounded-lg"> <div className="text-xs text-muted-foreground">Total / GPU</div> <div className="text-lg font-bold">{memoryRequirementsGB.totalTrainingGB.toFixed(2)} GB</div> </div> <div className="bg-secondary/50 p-2 rounded-lg"> <div className="text-xs text-muted-foreground">Model Weights / GPU</div> <div className="text-lg font-bold"> {memoryRequirementsGB.modelWeightsGB.toFixed(2)} GB </div> <div className="text-[10px] text-muted-foreground leading-tight"> {memoryFlags.zeroStage === 3 ? "(ZeRO-3 Sharded)" : (parameterDetails.isLora ? "(Base + LoRA)" : "")} </div> </div> </div> <div className="h-60 w-full"> <ResponsiveContainer width="100%" height="100%"> <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}> <Pie data={trainingMemoryBreakdownData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="80%" innerRadius="35%" fill="#8884d8" labelLine={false} label={({ cx, cy, midAngle, outerRadius, percent, index, name, value }) => { const RADIAN = Math.PI / 180; const radius = outerRadius * 1.1; const x = cx + radius * Math.cos(-midAngle * RADIAN); const y = cy + radius * Math.sin(-midAngle * RADIAN); return ( percent > 0.03 ? <text x={x} y={y} fill={COLORS[index % COLORS.length]} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10" fontWeight="medium"> {`${name}: ${value.toFixed(1)}GB`} </text> : null ); }} > {trainingMemoryBreakdownData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]}/> ))} </Pie> <RechartsTooltip formatter={(value: number, name: string, props) => [`${value.toFixed(2)} GB (${(props.payload.percent * 100).toFixed(1)}%)`, name]} contentStyle={{background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(2px)', border: 'none', borderRadius: '4px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '8px'}} /> </PieChart> </ResponsiveContainer> </div> </TabsContent>
                       <TabsContent value="inference" className="mt-4 space-y-4"> <div className="grid grid-cols-1 gap-4 text-center"> <div className="bg-secondary/50 p-3 rounded-lg"> <div className="text-sm text-muted-foreground">Est. Inference Memory / GPU ({selectedQuantization.name})</div> <div className="text-xl font-bold">{memoryRequirementsGB.totalInferenceGB.toFixed(2)} GB</div> <p className="text-xs text-muted-foreground">(Excl. Optimizer/Gradients; Activations vary by arch)</p> </div> </div> <div className="h-60 w-full"> <ResponsiveContainer width="100%" height="100%"> <BarChart data={inferenceMemoryBreakdownData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}> <CartesianGrid strokeDasharray="3 3" horizontal={false}/> <XAxis type="number" unit=" GB" fontSize={10} /> <YAxis type="category" dataKey="name" width={80} fontSize={10}/> <RechartsTooltip formatter={(value: number) => `${value.toFixed(2)} GB`} /> <Bar dataKey="value" name="Memory (GB)" barSize={20}> {inferenceMemoryBreakdownData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> ))} </Bar> </BarChart> </ResponsiveContainer> </div> </TabsContent>
                    </Tabs>
                  </CardContent>
              </Card>
              {/* --- Disk Size Estimates --- */}
              <Card>
                  <CardHeader className="pb-4"><CardTitle className="text-lg">Estimated Disk Sizes</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                       <div className="bg-secondary/30 p-2 rounded"> <Label className="text-xs text-muted-foreground block mb-0.5 flex items-center justify-center">Model Weights <ShadTooltip> <TooltipTrigger asChild><InfoIcon className="w-3 h-3 ml-1 text-muted-foreground cursor-help"/></TooltipTrigger> <TooltipContent><p>.safetensors / .pt file size (Total Params * Bytes/Param)</p></TooltipContent> </ShadTooltip> </Label> <div className="text-md font-semibold">{diskSizeEstimates.modelFileSizeGB.toFixed(2)} GB</div> </div>
                       <div className="bg-secondary/30 p-2 rounded"> <Label className="text-xs text-muted-foreground block mb-0.5 flex items-center justify-center">Optimizer State <ShadTooltip> <TooltipTrigger asChild><InfoIcon className="w-3 h-3 ml-1 text-muted-foreground cursor-help"/></TooltipTrigger> <TooltipContent><p>Size of Adam m/v states (Trainable Params * 8 Bytes)</p></TooltipContent> </ShadTooltip> </Label> <div className="text-md font-semibold">{diskSizeEstimates.optimizerStateSizeGB.toFixed(2)} GB</div> </div>
                       <div className="bg-secondary/30 p-2 rounded"> <Label className="text-xs text-muted-foreground block mb-0.5 flex items-center justify-center">Full Checkpoint <ShadTooltip> <TooltipTrigger asChild><InfoIcon className="w-3 h-3 ml-1 text-muted-foreground cursor-help"/></TooltipTrigger> <TooltipContent><p>Approx. size (Model + Optimizer). Actual size varies.</p></TooltipContent> </ShadTooltip> </Label> <div className="text-md font-semibold">{diskSizeEstimates.fullCheckpointSizeGB.toFixed(2)} GB</div> </div>
                  </CardContent>
              </Card>
               {/* --- Cost, Energy & Carbon --- */}
                <Card>
                    <CardHeader className="pb-4"> <CardTitle className="text-lg">Estimated Training Cost & Impact</CardTitle> <CardDescription className="text-sm">Based on hardware selection and training parameters.</CardDescription> </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"> <div> <Label htmlFor="trainingSteps" className="text-sm">Training Steps</Label> <Input id="trainingSteps" type="number" value={costParams.trainingSteps} onChange={e => handleCostParamChange('trainingSteps', e.target.value)} min="1" step="1000" className="h-8 text-sm"/> </div> <div> <Label htmlFor="tokensPerSec" className="text-sm flex items-center">Tokens/Sec/GPU <ShadTooltip> <TooltipTrigger asChild><InfoIcon className="w-3 h-3 ml-1.5 text-muted-foreground cursor-help"/></TooltipTrigger> <TooltipContent><p className="max-w-xs">Highly variable! Depends on model, hardware, precision, batch size, sequence length, software efficiency. Use measured values if possible.</p></TooltipContent> </ShadTooltip> </Label> <Input id="tokensPerSec" type="number" value={costParams.tokensPerSecondPerGPU} onChange={e => handleCostParamChange('tokensPerSecondPerGPU', e.target.value)} min="1" step="100" className="h-8 text-sm"/> </div> <div> <Label htmlFor="gridIntensity" className="text-sm flex items-center">Grid Carbon Intensity <ShadTooltip> <TooltipTrigger asChild><InfoIcon className="w-3 h-3 ml-1.5 text-muted-foreground cursor-help"/></TooltipTrigger> <TooltipContent side="top" className="max-w-xs p-2"> <p>Avg CO₂ emissions per kWh (kgCO₂/kWh). Varies by region/source.</p> <p className="text-xs mt-1">Default: {DEFAULT_GRID_INTENSITY} (US Avg)</p> <p className="text-xs">Examples: FR ~0.05, DE ~0.4, CN ~0.6, IS ~0.01</p> </TooltipContent> </ShadTooltip> </Label> <Input id="gridIntensity" type="number" value={costParams.gridCarbonIntensity} onChange={e => handleCostParamChange('gridIntensity', e.target.value)} min="0" step="0.01" className="h-8 text-sm"/> </div> </div>
                        {costEnergyResults && selectedHardware ? ( <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t text-center"> <div className="bg-secondary/30 p-2 rounded"> <Label className="text-xs text-muted-foreground block mb-0.5">Wall Time</Label> <div className="text-md font-semibold">{costEnergyResults.wallHours.toFixed(1)} hrs</div> <div className="text-[10px] text-muted-foreground">({formatNumber(costEnergyResults.gpuHours, 1)} GPU hrs)</div> </div> <div className="bg-secondary/30 p-2 rounded"> <Label className="text-xs text-muted-foreground block mb-0.5">Energy Use</Label> <div className="text-md font-semibold">{formatNumber(costEnergyResults.energyKWh, 1)} kWh</div> </div> <div className="bg-secondary/30 p-2 rounded"> <Label className="text-xs text-muted-foreground block mb-0.5">CO₂ Emissions</Label> <div className="text-md font-semibold">{costEnergyResults.co2kg.toFixed(2)} kg CO₂e</div> </div> <div className="bg-secondary/30 p-2 rounded"> <Label className="text-xs text-muted-foreground block mb-0.5">Cloud Cost</Label> <div className="text-md font-semibold">${formatNumber(costEnergyResults.totalCostUSD, 2)}</div> <div className="text-[10px] text-muted-foreground truncate px-1" title={costEnergyResults.costBasis}>{costEnergyResults.costBasis}</div> </div> </div> ) : ( <p className="text-center text-sm text-muted-foreground pt-4 border-t">Enter valid training parameters and select hardware to estimate cost and impact.</p> )}
                        <p className="text-xs text-muted-foreground pt-2">Cost and energy are rough estimates. Actual values depend heavily on workload, efficiency, cooling, specific instance pricing, and utilization.</p>
                    </CardContent>
                </Card>
                 {/* --- Quantization Impact Table --- */}
                 <Card>
                    <CardHeader className="pb-4"><CardTitle className="text-lg">Quantization Impact Overview</CardTitle></CardHeader>
                    <CardContent className="space-y-2"> <table className="w-full text-sm"> <thead> <tr className="border-b"> <th className="text-left py-1 px-1 font-semibold">Type</th> <th className="text-center py-1 px-1 font-semibold">Bits</th> <th className="text-center py-1 px-1 font-semibold">Mem. Factor</th> <th className="text-left py-1 px-1 font-semibold">Est. Perf. Impact</th> </tr> </thead> <tbody> {quantizationTypes.map((q) => ( <tr key={q.id} className={`border-b hover:bg-muted/50 ${q.id === precision ? 'bg-secondary font-medium' : ''}`}> <td className="py-1.5 px-1">{q.name}</td> <td className="text-center py-1.5 px-1">{q.bitsPerParameter}</td> <td className="text-center py-1.5 px-1">{q.memoryMultiplier.toFixed(3)}x</td> <td className="py-1.5 px-1 text-xs">{q.performanceImpact}</td> </tr> ))} </tbody> </table> </CardContent>
                 </Card>
                 {/* --- Actions (Placeholders) --- */}
                 <Card>
                     <CardHeader className="pb-4"><CardTitle className="text-lg">Actions</CardTitle></CardHeader>
                     <CardContent className="flex flex-wrap gap-3"> <Button variant="outline" size="sm" disabled> <DownloadIcon className="mr-2 h-4 w-4" /> Export Summary (JSON) </Button> <Button variant="outline" size="sm" disabled> <DownloadIcon className="mr-2 h-4 w-4" /> Save Charts (PNG) </Button> <Button variant="outline" size="sm" disabled>Add Scenario for Comparison</Button> </CardContent>
                 </Card>
            </div> {/* End Right Column */}
          </div> {/* End Grid */}
        </CardContent>
      </Card>
      {/* --- Footer / Notes --- */}
      <footer className="text-center text-xs text-muted-foreground space-y-1 pt-4 border-t">
            <p><strong>Disclaimer:</strong> All calculations are estimates. Actual memory usage, performance, cost, and energy consumption depend heavily on specific model implementation, framework overheads, hardware details, software versions, and workload characteristics.</p>
            <p>Activation memory calculation is particularly approximate. Cost/Energy estimates depend significantly on assumed throughput (Tokens/Sec/GPU).</p>
            <p>Hardware data (VRAM, Power, Pricing) based on publicly available datasheets and cloud provider pricing pages (subject to change and regional variation). Last data review: Approx Q2 2024.</p>
      </footer>
    </div> {/* End Container */}
    {/* Add Sonner Toaster component at the root of your app or layout: import { Toaster } from "@/components/ui/sonner" */}
    {/* <Toaster /> */}
    </TooltipProvider>
  );
};

export default MemoryCalculator;

// --- Required Dependencies ---
// npm install zod recharts lucide-react sonner
// Ensure Shadcn UI components are installed:
// npx shadcn-ui@latest add card label input select tabs slider switch accordion radio-group button tooltip chart toaster sonner
