import React, { useState, useMemo, useCallback, useEffect } from "react";
// Shadcn UI Components
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
import { toast } from "sonner";

// Recharts
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
// Icons
import { DownloadIcon, InfoIcon, LinkIcon, CopyIcon } from "lucide-react";
import { z } from 'zod';

// --- Data Structures ---

// Input parameter definition
type ParameterDef = {
  name: string; value: number; min: number; max: number; step: number; unit: string; log?: boolean; tooltip?: string;
};

// Architecture definition
type ArchitectureType = {
  id: string; // e.g., 'TX-DEC', 'SSM-MAMBA'
  name: string; // e.g., 'Transformer Decoder-Only (Dense)'
  notes: string; // Description or source
  paramFormulaDesc?: string; // Simplified formula description
};

// Quantization definition
type QuantizationType = {
  id: string; // e.g., 'fp16', 'fp8_e4m3'
  name: string; bitsPerParameter: number; memoryMultiplier: number; performanceImpact: string; reference?: string; hwSupport?: string;
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
  // Placeholders for future tunables from appendix
  sequenceParallelism?: number; // TP degree
  kvCachePrecision?: 'fp16' | 'int8'; // Example
  sparsity24?: boolean; // 2:4 structured sparsity
}

// Cost/Energy parameters
interface CostEnergyParams {
    trainingSteps: number; tokensPerSecondPerGPU: number; gridCarbonIntensity: number;
}

// Core model parameters
interface ModelParameters {
  hiddenSize: number; numLayers: number; numHeads: number; vocabSize: number; sequenceLength: number;
  batchSize: number; // Target Global Batch Size
  microBatchSizePerGPU: number; // Micro Batch Size per GPU
  // Architecture specific params (optional, could be added based on selected arch)
  // e.g., convKernelSize for Hyena
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
  // { id: 'int6', name: "INT6 (BitSplit)", bitsPerParameter: 6, memoryMultiplier: 0.1875, performanceImpact: "~1% Δ? Research stage.", hwSupport: "Research", reference: "BitSplit Paper?" }, // Placeholder
  { id: 'awq', name: "AWQ (4-bit)", bitsPerParameter: 4, memoryMultiplier: 0.125, performanceImpact: "~<1% Δ. Activation-aware PTQ.", hwSupport: "GPU/CPU Libs", reference:"Lin et al., 2023 (AWQ)"},
  { id: 'gptq', name: "GPTQ (4-bit)", bitsPerParameter: 4, memoryMultiplier: 0.125, performanceImpact: "~<1% Δ. Layer-wise PTQ.", hwSupport: "GPU/CPU Libs", reference:"Frantar et al., 2022 (GPTQ)"},
  // { id: 'int3', name: "INT3 (Atom)", bitsPerParameter: 3, memoryMultiplier: 0.094, performanceImpact: "~1-2% Δ? Serving-time quant.", hwSupport: "Research/Specific Libs", reference: "Atom Paper (MLSys'24)" }, // Placeholder
  // { id: 'int2', name: "INT2", bitsPerParameter: 2, memoryMultiplier: 0.063, performanceImpact: "High accuracy loss. Research.", hwSupport: "Research" }, // Placeholder
];

const gpuProfiles: GpuProfile[] = [
  // Older Gens
  { id: 'rtx3090', name: 'NVIDIA RTX 3090', vramGB: 24, powerW: 350, bandwidthTBps: 0.936, fp8Support: false, dataSource: "NVIDIA Spec" },
  { id: 'rtx4090', name: 'NVIDIA RTX 4090', vramGB: 24, powerW: 450, bandwidthTBps: 1.008, fp8Support: false, dataSource: "NVIDIA Spec" }, // Ada has FP8 support via driver/libs but not Hopper Tensor Cores
  { id: 'a100-40-sxm', name: 'NVIDIA A100 (40GB SXM)', vramGB: 40, powerW: 400, bandwidthTBps: 1.555, fp8Support: false, dataSource: "NVIDIA Datasheet" },
  { id: 'a100-80-sxm', name: 'NVIDIA A100 (80GB SXM)', vramGB: 80, powerW: 400, bandwidthTBps: 1.935, fp8Support: false, dataSource: "NVIDIA Datasheet" },
  // Hopper Gen
  { id: 'l40s', name: 'NVIDIA L40S (Ada)', vramGB: 48, powerW: 350, bandwidthTBps: 0.864, fp8Support: true, dataSource: "NVIDIA L40S Page" }, // Ada supports FP8 via SW
  { id: 'h100-80-pcie', name: 'NVIDIA H100 (80GB PCIe)', vramGB: 80, powerW: 350, bandwidthTBps: 2.0, fp8Support: true, dataSource: "NVIDIA Datasheet" },
  { id: 'h100-80-sxm', name: 'NVIDIA H100 (80GB SXM)', vramGB: 80, powerW: 700, bandwidthTBps: 3.35, fp8Support: true, dataSource: "NVIDIA Datasheet" },
  { id: 'h200-141-sxm', name: 'NVIDIA H200 (141GB SXM)', vramGB: 141, powerW: 700, bandwidthTBps: 4.8, fp8Support: true, dataSource: "NVIDIA H200 Page" }, // Appendix value
  { id: 'gh200-nvl2', name: 'NVIDIA GH200 NVL2 Pair (GPU Mem)', vramGB: 282, powerW: 1000, bandwidthTBps: 9.6, fp8Support: true, dataSource: "NVIDIA GH200 Page"}, // Combined for pair, HBM3e. Power is approx per node. VRAM is 141GB per GPU.
  // Blackwell Gen (Preview)
  { id: 'b100-192-sxm', name: 'NVIDIA B100 (192GB SXM - Preview)', vramGB: 192, powerW: 1000, bandwidthTBps: 8.0, fp8Support: true, dataSource: "NVIDIA Blackwell Announce" }, // Bandwidth estimated
  { id: 'b200-192-sxm', name: 'NVIDIA B200 (192GB SXM - Preview)', vramGB: 192, powerW: 1000, bandwidthTBps: 8.0, fp8Support: true, dataSource: "NVIDIA Blackwell Announce" }, // B200 is often a pair of B100 dies
];

const cloudInstanceProfiles: CloudInstanceProfile[] = [
    { id:'aws-p5.48xlarge', name: 'AWS p5.48xlarge (8xH100-80)', gpuType:'h100-80-sxm', gpuCount: 8, hourlyUSD: 98.32, dataSource: "AWS Pricing (us-east-1, On-Demand, ~2024)"},
    { id:'aws-g6e.48xlarge', name: 'AWS g6e.48xlarge (8xL40S)', gpuType:'l40s', gpuCount: 8, hourlyUSD: 21.74, dataSource: "AWS Pricing (us-east-1, On-Demand, ~2024)"}, // Example L40S instance
    { id:'gcp-a3-highgpu-8g', name: 'GCP a3-highgpu-8g (8xH100-80)', gpuType:'h100-80-sxm', gpuCount: 8, hourlyUSD: 35.00, dataSource: "GCP Pricing (us-central1, On-Demand, ~2024)" },
    { id:'azure-ndm-a100-v4', name: 'Azure NDm A100 v4 (8xA100-80)', gpuType:'a100-80-sxm', gpuCount: 8, hourlyUSD: 27.40, dataSource: "Azure Pricing (East US, On-Demand, ~2024)"},
    // Add H200/B200 instances when available
];

const DEFAULT_GRID_INTENSITY = 0.386;

// --- Model Presets ---
interface ModelPreset {
    name: string;
    archId: string; // Added architecture ID
    modelType: string; // Keep for simpler logic branching if needed
    params: Partial<ModelParameters>;
    flags?: Partial<MemoryFlags>;
    precision?: string;
}

const modelPresets: ModelPreset[] = [
    { name: "Llama-3-8B Instruct", archId: 'TX-DEC', modelType: "decoder", params: { hiddenSize: 4096, numLayers: 32, numHeads: 32, vocabSize: 128256, sequenceLength: 8192, batchSize: 64, microBatchSizePerGPU: 4 }, precision: "bf16" },
    { name: "Mixtral-8x7B", archId: 'TX-MOE', modelType: "decoder", params: { hiddenSize: 4096, numLayers: 32, numHeads: 32, vocabSize: 32000, sequenceLength: 4096, batchSize: 32, microBatchSizePerGPU: 2 }, flags: { moe: { experts: 8, topK: 2 } }, precision: "bf16" },
    { name: "Mamba-2.8B", archId: 'SSM-MAMBA', modelType: "decoder", params: { hiddenSize: 2560, numLayers: 64, numHeads: 0, vocabSize: 50277, sequenceLength: 4096, batchSize: 64, microBatchSizePerGPU: 8 }, precision: "bf16" }, // Example Mamba params
    { name: "BERT-Large", archId: 'TX-ENC', modelType: "encoder", params: { hiddenSize: 1024, numLayers: 24, numHeads: 16, vocabSize: 30522, sequenceLength: 512, batchSize: 256, microBatchSizePerGPU: 32 }, precision: "fp32"},
    { name: "T5-Large (770M)", archId: 'TX-ED', modelType: "encoder-decoder", params: { hiddenSize: 1024, numLayers: 24, numHeads: 16, vocabSize: 32128, sequenceLength: 512, batchSize: 128, microBatchSizePerGPU: 16 }, precision: "fp32"},
];

// --- Helper Functions --- (Same as before)
const formatNumber = (num: number, precision: number = 2): string => { /* ... */ };
const formatBytes = (bytes: number, decimals: number = 2): string => { /* ... */ };
const gigabytesToBytes = (gb: number): number => gb * 1024 * 1024 * 1024;
const bytesToGigabytes = (bytes: number): number => bytes / (1024 * 1024 * 1024);

// --- Zod Schema for URL State Validation (Updated) ---
const LoraSchema = z.object({ rank: z.number().positive() }).optional();
const MoeSchema = z.object({ experts: z.number().positive(), topK: z.number().positive() }).optional();
const MemoryFlagsSchema = z.object({
  flashAttention: z.boolean(), gradientCheckpointFactor: z.number().min(0.1).max(1.0),
  zeroStage: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  cpuOffloadPct: z.number().min(0).max(100), moe: MoeSchema, lora: LoraSchema,
  // Optional future flags
  sequenceParallelism: z.number().optional(), kvCachePrecision: z.enum(['fp16', 'int8']).optional(), sparsity24: z.boolean().optional(),
});
const ModelParametersSchema = z.object({
  hiddenSize: z.number().positive(), numLayers: z.number().positive(), numHeads: z.number().nonnegative(), // Heads can be 0 for non-attn models
  vocabSize: z.number().positive(), sequenceLength: z.number().positive(), batchSize: z.number().positive(), microBatchSizePerGPU: z.number().positive(),
});
const CostEnergyParamsSchema = z.object({
  trainingSteps: z.number().positive(), tokensPerSecondPerGPU: z.number().positive(), gridCarbonIntensity: z.number().nonnegative(),
});

const AppStateSchema = z.object({
  v: z.literal(2), // Incremented version
  arch: z.string(), // architectureId
  p: ModelParametersSchema, f: MemoryFlagsSchema, prec: z.string(), hw: z.string(), ng: z.number().positive(), cost: CostEnergyParamsSchema,
});
type AppState = z.infer<typeof AppStateSchema>;

// --- Main Component ---
const MemoryCalculator = () => {
  // --- State Definitions ---
  const [architectureId, setArchitectureId] = useState<string>(modelPresets[0].archId);
  const [parameters, setParameters] = useState<ModelParameters>(() => ({ /* Default params + preset override */ }));
  const [precision, setPrecision] = useState<string>(modelPresets[0].precision || "bf16");
  const [memoryFlags, setMemoryFlags] = useState<MemoryFlags>(() => ({ /* Default flags + preset override */ }));
  const [selectedHardwareId, setSelectedHardwareId] = useState<string>(gpuProfiles[5].id);
  const [numGpus, setNumGpus] = useState<number>(8);
  const [costParams, setCostParams] = useState<CostEnergyParams>({ /* Defaults */ });
  const [isInitializedFromUrl, setIsInitializedFromUrl] = useState(false);

  // Initialize state properly, including defaults from the first preset
  useEffect(() => {
      setParameters(prev => ({
          hiddenSize: 4096, numLayers: 32, numHeads: 32, vocabSize: 50000, sequenceLength: 8192,
          batchSize: 8, microBatchSizePerGPU: 1,
          ...modelPresets[0].params
      }));
      setMemoryFlags(prev => ({
          flashAttention: true, gradientCheckpointFactor: 1.0, zeroStage: 0, cpuOffloadPct: 0,
          moe: undefined, lora: undefined,
          ...modelPresets[0].flags
      }));
      setCostParams({
          trainingSteps: 100000, tokensPerSecondPerGPU: 3000, gridCarbonIntensity: DEFAULT_GRID_INTENSITY,
      });
  }, []); // Run only once on mount

  // --- Input Definitions ---
  const parametersList: Record<keyof Omit<ModelParameters, 'microBatchSizePerGPU'>, ParameterDef> = { /* ... same as before ... */ };
  const microBatchSizeDef: ParameterDef = { /* ... same as before ... */ };

  // --- Permalink State Serialization/Deserialization (Updated Schema) ---
  const serializeState = useCallback((): string => {
    const state: AppState = { v: 2, arch: architectureId, p: parameters, f: memoryFlags, prec: precision, hw: selectedHardwareId, ng: numGpus, cost: costParams };
    try { return btoa(JSON.stringify(state)); } catch (error) { console.error("Error serializing state:", error); return ""; }
  }, [architectureId, parameters, memoryFlags, precision, selectedHardwareId, numGpus, costParams]);

  const deserializeState = useCallback((encodedState: string) => {
    try {
        const jsonString = atob(encodedState); const parsedState = JSON.parse(jsonString);
        const validationResult = AppStateSchema.safeParse(parsedState);
        if (!validationResult.success) { console.error("URL state validation failed:", validationResult.error.errors); toast.error("Failed to load configuration from link: Invalid data."); window.location.hash = ""; return; }
        const state = validationResult.data;
        // Update state variables
        setArchitectureId(architectureTypes.some(a => a.id === state.arch) ? state.arch : architectureTypes[0].id); // Fallback
        setParameters(state.p); setMemoryFlags(state.f); setPrecision(state.prec);
        setSelectedHardwareId(gpuProfiles.some(g => g.id === state.hw) ? state.hw : gpuProfiles[5].id); // Fallback
        setNumGpus(state.ng); setCostParams(state.cost);
        toast.success("Configuration loaded from link.");
    } catch (error) { console.error("Error deserializing state:", error); toast.error("Failed to load configuration from link: Invalid format."); window.location.hash = ""; }
  }, []);

   useEffect(() => { /* ... Load state from URL on mount ... */ }, [deserializeState]);
   useEffect(() => { /* ... Update URL hash on state change ... */ }, [serializeState, isInitializedFromUrl]);

  // --- Derived State and Calculations ---
  const selectedQuantization = useMemo(() => quantizationTypes.find(q => q.id === precision) || quantizationTypes.find(q=>q.id === 'fp32')!, [precision]); // Use ID now
  const selectedHardware = useMemo(() => gpuProfiles.find(g => g.id === selectedHardwareId), [selectedHardwareId]);
  const selectedArchitecture = useMemo(() => architectureTypes.find(a => a.id === architectureId) || architectureTypes[0], [architectureId]);

  // --- Parameter Count Calculation (Refactored based on Appendix) ---
  const parameterDetails = useMemo(() => {
      const { hiddenSize: d, numLayers: L, vocabSize: V, sequenceLength: S } = parameters;
      const { moe, lora } = memoryFlags;
      let P_total_raw = 0;
      let P_trainable_raw = 0;
      let P_active_raw = 0; // For MoE
      let isMoE = !!(moe && moe.experts > 1 && (architectureId === 'TX-DEC' || architectureId === 'TX-MOE' || architectureId === 'TX-ED'));
      let isLora = !!(lora && lora.rank > 0);
      const MLP_FACTOR = 4; // Standard assumption unless specified otherwise
      const MLP_intermediate = MLP_FACTOR * d;

      // Base parameter calculation per architecture
      switch (architectureId) {
          case 'TX-DEC': // Dense Decoder-Only (GPT-style)
          case 'TX-MOE': // MoE Decoder-Only (Base calculation is dense)
              const P_attn_layer_dec = 4 * d * d; // Q, K, V, O
              const P_mlp_layer_dec = 2 * d * MLP_intermediate; // FFN Up, Down
              const P_norm_layer_dec = 2 * (2 * d); // 2 LayerNorms
              const P_layer_dec = P_attn_layer_dec + P_mlp_layer_dec + P_norm_layer_dec;
              const P_embedding_dec = V * d;
              const P_output_proj_dec = V * d; // Assume not tied
              const P_final_norm_dec = 2 * d;
              P_total_raw = P_embedding_dec + (L * P_layer_dec) + P_final_norm_dec + P_output_proj_dec;
              break;
          case 'TX-ENC': // Dense Encoder-Only (BERT-style)
              const P_pos_embed_enc = S * d; // Approx
              const P_type_embed_enc = 2 * d;
              const P_embed_norm_enc = 2 * d;
              const P_embeddings_total_enc = V * d + P_pos_embed_enc + P_type_embed_enc + P_embed_norm_enc;
              const P_attn_layer_enc = 4 * d * d;
              const P_mlp_layer_enc = 2 * d * MLP_intermediate;
              const P_norm_layer_enc = 2 * (2 * d);
              const P_layer_enc = P_attn_layer_enc + P_mlp_layer_enc + P_norm_layer_enc;
              const P_pooler_enc = d * d + d; // Optional pooler
              P_total_raw = P_embeddings_total_enc + (L * P_layer_enc) + P_pooler_enc;
              break;
          case 'TX-ED': // Encoder-Decoder (T5-style)
              // Encoder Layer
              const P_enc_attn_ed = 4 * d * d;
              const P_enc_mlp_ed = 2 * d * MLP_intermediate;
              const P_enc_norm_ed = 2 * (2 * d);
              const P_enc_layer_ed = P_enc_attn_ed + P_enc_mlp_ed + P_enc_norm_ed;
              // Decoder Layer
              const P_dec_self_attn_ed = 4 * d * d;
              const P_dec_cross_attn_ed = 4 * d * d;
              const P_dec_mlp_ed = 2 * d * MLP_intermediate;
              const P_dec_norm_ed = 3 * (2 * d); // 3 LayerNorms
              const P_dec_layer_ed = P_dec_self_attn_ed + P_dec_cross_attn_ed + P_dec_mlp_ed + P_dec_norm_ed;
              const P_embedding_ed = V * d; // Shared
              const P_output_proj_ed = V * d; // Assume tied for T5 style
              const P_final_norm_ed = 2 * d;
              P_total_raw = P_embedding_ed + (L * P_enc_layer_ed) + (L * P_dec_layer_ed) + P_final_norm_ed; // Output proj implicitly tied
              break;
          case 'SSM-MAMBA': // Mamba
              // Formula: ~4d^2 (SSM Kernel + In/Out Proj) + 6d (Conv Gate etc.) per layer
              const P_ssm_kernel_proj = 4 * d * d; // Approx for A, B, C, D proj + In/Out proj
              const P_conv_gate = 6 * d; // Approx for 1D Conv, SiLU Gate, Norms
              const P_layer_mamba = P_ssm_kernel_proj + P_conv_gate;
              P_total_raw = V * d + (L * P_layer_mamba) + V * d; // Input Embed + Layers + Output Proj
              break;
          case 'RWKV-RNN': // RWKV
              // Formula: ~2d^2 (Time/Channel Mix) + 6d per layer
              const P_mix_rwkv = 2 * d * d; // Approx for Time + Channel Mix matrices
              const P_other_rwkv = 6 * d; // Approx for norms, gates etc.
              const P_layer_rwkv = P_mix_rwkv + P_other_rwkv;
              P_total_raw = V * d + (L * P_layer_rwkv) + V * d; // Input Embed + Layers + Output Proj
              break;
          case 'HYENA': // Hyena
              // Formula: ~4d^2 (Projections) + 2dk (Conv Kernel) per layer
              const k_conv = 128; // Assume default kernel size, could be param
              const P_proj_hyena = 4 * d * d; // Approx for input/output projections
              const P_conv_hyena = 2 * d * k_conv; // Long convolution filter params
              const P_layer_hyena = P_proj_hyena + P_conv_hyena;
              P_total_raw = V * d + (L * P_layer_hyena) + V * d; // Input Embed + Layers + Output Proj
              break;
          default:
              P_total_raw = 0; // Should not happen
      }

      P_trainable_raw = P_total_raw; // Default: all params trainable

      // Adjust for MoE (applied on top of dense base)
      if (isMoE) {
          const experts = moe.experts; const topK = moe.topK;
          const P_dense_mlp_layer = 2 * d * MLP_intermediate; // Params of one FFN
          const P_router_layer = d * experts; // Gating network params
          const P_experts_total_layer = experts * P_dense_mlp_layer;
          const P_moe_mlp_layer = P_router_layer + P_experts_total_layer;
          // Replace dense MLP count with MoE MLP count
          P_total_raw = P_total_raw - (L * P_dense_mlp_layer) + (L * P_moe_mlp_layer);
          P_trainable_raw = P_total_raw; // All MoE params trainable by default
          // Calculate active parameters
          const P_non_mlp_base = P_total_raw - (L * P_moe_mlp_layer);
          const P_active_experts_layer = topK * P_dense_mlp_layer;
          P_active_raw = P_non_mlp_base + L * (P_router_layer + P_active_experts_layer);
      } else {
          P_active_raw = P_total_raw; // For non-MoE, active = total
      }

      // Adjust for LoRA
      let P_lora_raw = 0;
      if (isLora) {
          const R = lora.rank;
          // Assume LoRA applied to Q, V projections (2 matrices per proj)
          const lora_matrices_per_layer = 2 * (d * R + R * d);
          P_lora_raw = L * lora_matrices_per_layer;
          P_trainable_raw = P_lora_raw; // Only LoRA params are trained
      }

      return { totalParamsRaw: P_total_raw, trainableParamsRaw: P_trainable_raw, activeParamsRaw: P_active_raw, loraParamsRaw: P_lora_raw, isMoE, isLora };
  }, [parameters, architectureId, memoryFlags]);

  // --- Core Memory Calculation Logic (Refactored based on Appendix) ---
  const { memoryRequirementsBytes, memoryRequirementsGB, derivedParams } = useMemo(() => {
      const { hiddenSize: d, numLayers: L, sequenceLength: S, microBatchSizePerGPU: B_micro, batchSize: B_global_target } = parameters;
      const { totalParamsRaw, trainableParamsRaw, activeParamsRaw, loraParamsRaw, isMoE, isLora } = parameterDetails;
      const { flashAttention, gradientCheckpointFactor, zeroStage, cpuOffloadPct, moe } = memoryFlags;
      const N_gpus = numGpus > 0 ? numGpus : 1;
      const bytesPerParamModel = selectedQuantization.bitsPerParameter / 8;
      const bytesPerParamOpt = 32 / 8; // Optimizer states usually FP32
      const optFactor = 2; // Adam m,v

      // --- Calculate Gradient Accumulation Steps ---
      const effective_batch_per_step = B_micro * N_gpus;
      const gradientAccumulationSteps = effective_batch_per_step > 0 ? Math.ceil(B_global_target / effective_batch_per_step) : 1;

      // --- 1. Model Weights Memory ---
      // Start with total raw params (incl MoE experts if active)
      let modelWeightsBytes = totalParamsRaw * bytesPerParamModel;
      if (isLora) {
          // Add LoRA weights (assume FP16 storage for LoRA adapters)
          modelWeightsBytes += loraParamsRaw * (16 / 8);
      }
      // Apply ZeRO-3 Sharding
      if (zeroStage === 3) {
          modelWeightsBytes /= N_gpus;
      }
      // Apply Sparsity (Placeholder - needs specific kernel support)
      // if (memoryFlags.sparsity24) { modelWeightsBytes *= 0.5; }

      // --- 2. Optimizer States Memory ---
      // Based on *trainable* parameters, typically FP32
      let optimizerStateBytes = trainableParamsRaw * bytesPerParamOpt * optFactor;
      // Apply ZeRO Optimizer Sharding (Stages 1, 2, 3)
      if (zeroStage >= 1) {
          optimizerStateBytes /= N_gpus;
      }

      // --- 3. Gradient Memory ---
      // Based on *trainable* parameters, typically in compute precision (FP16/BF16/FP32)
      const computePrecisionBits = (selectedQuantization.bitsPerParameter <= 16 && selectedQuantization.id !== 'int8') ? 16 : 32;
      const bytesPerParamCompute = computePrecisionBits / 8;
      let gradientMemoryBytes = trainableParamsRaw * bytesPerParamCompute;
      // Apply ZeRO Gradient Sharding (Stages 2, 3)
      if (zeroStage >= 2) {
          gradientMemoryBytes /= N_gpus;
      }

      // --- 4. Activation Memory ---
      // Appendix formula: B_micro * S * d * 4bytes * f_activ
      // Let's refine f_activ based on architecture and flags
      let activationMemoryBytes = 0;
      const bytesPerActivation = bytesPerParamCompute; // Usually compute precision

      // Base activation memory estimate (varies by architecture)
      // Rough estimates - could be refined with more detailed formulas
      let baseActivFactor = 0;
      if (architectureId.startsWith('TX')) { // Transformers
          baseActivFactor = 28; // Heuristic factor for Attention + MLP + Norms + intermediates
          // Add KV Cache estimate (for training, might be smaller than full S*S)
          // KV Cache per layer: 2 * B_micro * S * d * bytesPerActivation (Simplified)
          // Let's fold this into the heuristic for now.
      } else if (architectureId === 'SSM-MAMBA' || architectureId === 'RWKV-RNN') {
          // SSM/RNNs have much lower activation memory - primarily hidden state
          baseActivFactor = 4; // Smaller factor: B_micro * S * d * factor
      } else if (architectureId === 'HYENA') {
          baseActivFactor = 16; // Convolution based, likely between Tx and SSM
      }

      activationMemoryBytes = B_micro * S * d * L * bytesPerActivation * baseActivFactor; // Base estimate per layer

      // Apply FlashAttention (Only for Transformer architectures)
      if (flashAttention && S > 1024 && architectureId.startsWith('TX')) {
          activationMemoryBytes *= 0.7; // Appendix suggests 0.5, let's use 0.7 heuristic overall reduction
      }
      // Apply Gradient Checkpointing
      if (gradientCheckpointFactor < 1.0) {
          activationMemoryBytes *= gradientCheckpointFactor;
      }
       // Adjust for MoE Activation Memory (Slight increase for router)
      if (isMoE) {
          activationMemoryBytes *= 1.1;
      }
       // Apply Sequence Parallelism (Placeholder - Divides activations across TP group)
      // if (memoryFlags.sequenceParallelism && memoryFlags.sequenceParallelism > 1) {
      //    activationMemoryBytes /= memoryFlags.sequenceParallelism;
      // }


      // --- 5. Temporary Buffers & Fragmentation ---
      const FRAGMENTATION_FACTOR = 0.10;
      let tempMemoryBytes = (modelWeightsBytes + optimizerStateBytes + gradientMemoryBytes + activationMemoryBytes) * FRAGMENTATION_FACTOR;

      // --- 6. CPU Offload ---
      let cpuSwapBytes = 0;
      if (zeroStage >= 1 && cpuOffloadPct > 0) {
          const offloadFraction = cpuOffloadPct / 100;
          let bytesToOffload = 0;
          if (zeroStage >= 1) bytesToOffload += optimizerStateBytes;
          if (zeroStage >= 2) bytesToOffload += gradientMemoryBytes;
          cpuSwapBytes = bytesToOffload * offloadFraction;
          if (zeroStage >= 1) optimizerStateBytes *= (1 - offloadFraction);
          if (zeroStage >= 2) gradientMemoryBytes *= (1 - offloadFraction);
      }

      // --- Totals per GPU ---
      const totalTrainingBytesPerGPU = modelWeightsBytes + activationMemoryBytes + optimizerStateBytes + gradientMemoryBytes + tempMemoryBytes;

      // --- Inference Memory Estimation ---
      let inferenceModelWeightsBytes = totalParamsRaw * bytesPerParamModel;
      if (isLora) { inferenceModelWeightsBytes += loraParamsRaw * (16 / 8); }
      // Apply ZeRO-3 sharding *if* inference uses it (less common, requires specific frameworks)
      // if (zeroStage === 3 && useZeROForInference) { inferenceModelWeightsBytes /= N_gpus; }

      // Inference Activations:
      let inferenceActivationBytes = 0;
      const INFERENCE_KV_CACHE_FACTOR = 1.0; // Assume full KV cache for inference unless optimized
      const INFERENCE_SSM_FACTOR = 0.1; // Very small state for SSM/RNN
      if (architectureId.startsWith('TX')) {
          // Transformer: Primarily KV Cache + minimal layer outputs
          // KV Cache: B_inf * S_inf * L * 2 * d * bytesPerKV // (B_inf=1 usually)
          // Simplified: Use a factor of training activations, potentially reduced by KV quant
          const kvBytes = B_micro * S * L * 2 * d * (memoryFlags.kvCachePrecision === 'int8' ? 1 : bytesPerParamCompute);
          inferenceActivationBytes = kvBytes * INFERENCE_KV_CACHE_FACTOR;
      } else if (architectureId === 'SSM-MAMBA' || architectureId === 'RWKV-RNN') {
          // SSM/RNN: Minimal state needed
          inferenceActivationBytes = activationMemoryBytes * INFERENCE_SSM_FACTOR; // Much smaller than training
      } else {
           inferenceActivationBytes = activationMemoryBytes * 0.5; // Default fallback
      }
       // Apply FlashAttention savings if applicable
       if (flashAttention && S > 1024 && architectureId.startsWith('TX')) {
           inferenceActivationBytes *= 0.7; // Reduce KV cache estimate slightly too
       }

      const inferenceTempBytes = tempMemoryBytes * 0.5; // Assume less temp needed
      const totalInferenceBytesPerGPU = inferenceModelWeightsBytes + inferenceActivationBytes + inferenceTempBytes;


      // Package results
      const bytesResult = { modelWeightsBytes, activationMemoryBytes, optimizerStateBytes, gradientMemoryBytes, tempMemoryBytes, totalTrainingBytesPerGPU, totalInferenceBytesPerGPU, cpuSwapBytes };
      const gbResult = { modelWeightsGB: bytesToGigabytes(bytesResult.modelWeightsBytes), activationMemoryGB: bytesToGigabytes(bytesResult.activationMemoryBytes), optimizerStateGB: bytesToGigabytes(bytesResult.optimizerStateBytes), gradientMemoryGB: bytesToGigabytes(bytesResult.gradientMemoryBytes), tempMemoryGB: bytesToGigabytes(bytesResult.tempMemoryBytes), totalTrainingGB: bytesToGigabytes(bytesResult.totalTrainingBytesPerGPU), totalInferenceGB: bytesToGigabytes(bytesResult.totalInferenceBytesPerGPU), cpuSwapGB: bytesToGigabytes(bytesResult.cpuSwapBytes) };
      const derivedResult = { gradientAccumulationSteps };

      return { memoryRequirementsBytes: bytesResult, memoryRequirementsGB: gbResult, derivedParams: derivedResult };

  }, [parameters, architectureId, selectedQuantization, memoryFlags, numGpus, parameterDetails]); // Added parameterDetails dependency

  // Calculate Cost & Energy (Same logic, uses derived B_global_target)
  const costEnergyResults = useMemo(() => { /* ... same as before ... */ }, [parameters.sequenceLength, parameters.batchSize, costParams, selectedHardware, numGpus]);

  // Calculate Disk Sizes (Uses updated parameterDetails)
  const diskSizeEstimates = useMemo(() => { /* ... same as before ... */ }, [parameterDetails, selectedQuantization]);

  // Calculate Chinchilla Optimal Tokens (New)
  const chinchillaOptimalTokens = useMemo(() => {
      const paramsB = parameterDetails.totalParamsRaw / 1e9;
      if (paramsB <= 0) return 0;
      // Formula: DataTokens ≈ 1.69e9 × (Params/1e9) -- from Appendix (simplified version)
      // More common rule of thumb: ~20 tokens per parameter
      // return 1.69e9 * paramsB; // Appendix formula
      return 20 * parameterDetails.totalParamsRaw; // Rule of thumb
  }, [parameterDetails.totalParamsRaw]);


  // --- UI Handlers --- (Mostly same, update preset handler)
  const handleParameterChange = useCallback((param: keyof ModelParameters, value: number | string) => { /* ... same as before ... */ }, [parametersList, parameters.batchSize, parameters.microBatchSizePerGPU]);
  const handleFlagChange = useCallback((flag: keyof MemoryFlags, value: any) => { /* ... same as before ... */ }, []);
  const handleCostParamChange = useCallback((param: keyof CostEnergyParams, value: string) => { /* ... same as before ... */ }, []);
  const handleApplyPreset = useCallback((preset: ModelPreset) => {
       setArchitectureId(preset.archId); // Set architecture
       setModelType(preset.modelType); // Keep modelType if needed elsewhere
       setParameters(prev => ({ /* ... Apply preset params, ensure micro <= global ... */ }));
       if (preset.precision) setPrecision(quantizationTypes.find(q=>q.name.toLowerCase().startsWith(preset.precision!.toLowerCase()))?.id || 'bf16'); // Use ID
       setMemoryFlags({ /* ... Reset flags + apply preset flags ... */ });
       toast.success(`Preset "${preset.name}" loaded.`);
   }, []);
  const handleCopyLink = useCallback(() => { /* ... same as before ... */ }, [serializeState]);

   // --- Chart Data Preparation --- (Same as before)
    const trainingMemoryBreakdownData = useMemo(() => [ /* ... */ ], [memoryRequirementsGB]);
    const inferenceMemoryBreakdownData = useMemo(() => [ /* ... */ ], [memoryRequirementsBytes, parameterDetails, selectedQuantization]);
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19AF', '#DB2777'];
    const vramUsagePercent = selectedHardware ? (memoryRequirementsGB.totalTrainingGB / selectedHardware.vramGB) * 100 : 0;
    const getVramBarColor = (usage: number): string => { /* ... */ };

  // --- Render Component ---
  return (
    <TooltipProvider delayDuration={300}>
    <div className="container mx-auto p-4 lg:p-6 space-y-6">
      <Card className="overflow-visible">
        <CardHeader>
          {/* ... Title, Description, Preset Buttons, Copy Link Button ... */}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

            {/* === Left Column: Configuration === */}
            <div className="space-y-5">
               {/* --- Model Configuration --- */}
               <Card>
                 <CardHeader className="pb-4"><CardTitle className="text-lg">1. Model Configuration</CardTitle></CardHeader>
                 <CardContent className="space-y-4">
                     {/* Architecture Selector (NEW) */}
                     <div>
                         <Label htmlFor="architectureType">Architecture</Label>
                         <Select value={architectureId} onValueChange={setArchitectureId}>
                             <SelectTrigger id="architectureType"><SelectValue /></SelectTrigger>
                             <SelectContent>
                                 {architectureTypes.map(arch => (
                                     <SelectItem key={arch.id} value={arch.id}>
                                         {arch.name}
                                     </SelectItem>
                                 ))}
                             </SelectContent>
                         </Select>
                         <p className="text-xs text-muted-foreground mt-1">{selectedArchitecture?.notes}</p>
                     </div>
                     {/* Parameter Sliders/Inputs */}
                     {/* ... Render sliders for parametersList ... */}
                     {/* ... Render slider for microBatchSizeDef ... */}
                 </CardContent>
               </Card>

                {/* --- Precision & Quantization (Updated Options) --- */}
               <Card>
                 <CardHeader className="pb-4"><CardTitle className="text-lg">2. Precision & Quantization</CardTitle></CardHeader>
                 <CardContent>
                     <div>
                         <Label htmlFor="precision">Compute & Storage Precision</Label>
                         <ShadTooltip>
                             <TooltipTrigger asChild>
                                 <Select value={precision} onValueChange={setPrecision}>
                                     <SelectTrigger id="precision"><SelectValue /></SelectTrigger>
                                     <SelectContent>
                                         {quantizationTypes.map(q => (
                                             <SelectItem key={q.id} value={q.id}>
                                                 {q.name} ({q.bitsPerParameter}-bit)
                                             </SelectItem>
                                         ))}
                                     </SelectContent>
                                 </Select>
                             </TooltipTrigger>
                             <TooltipContent side="right" className="max-w-sm p-2">
                                 <p>Select the numerical format.</p>
                                 <p className="mt-1"><strong>{selectedQuantization.name}:</strong> {selectedQuantization.performanceImpact}</p>
                                 {selectedQuantization.hwSupport && <p className="text-xs mt-1">HW Support: {selectedQuantization.hwSupport}</p>}
                                 {selectedQuantization.reference && <p className="text-xs mt-1">Ref: {selectedQuantization.reference}</p>}
                             </TooltipContent>
                         </ShadTooltip>
                     </div>
                 </CardContent>
               </Card>

               {/* --- Advanced Optimizations --- */}
                <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                    {/* ... Accordion content for FlashAttn, GradChkpt, ZeRO, MoE, LoRA ... */}
                    {/* (Placeholder for future tunables like Seq Parallelism, KV Cache Quant, Sparsity) */}
                     <AccordionContent className="px-6 pb-6 space-y-6">
                        {/* ... Existing flags ... */}
                        <div className="border-t pt-4 space-y-2 text-sm text-muted-foreground">
                            <p>Future Tunables (Placeholders):</p>
                            <div className="flex items-center justify-between"><span>Sequence Parallelism</span> <Switch disabled /></div>
                            <div className="flex items-center justify-between"><span>KV Cache INT8</span> <Switch disabled /></div>
                            <div className="flex items-center justify-between"><span>2:4 Sparsity</span> <Switch disabled /></div>
                        </div>
                    </AccordionContent>
                </Accordion>

                 {/* --- Hardware Configuration (Updated Options) --- */}
                <Card>
                   <CardHeader className="pb-4"><CardTitle className="text-lg">4. Hardware Configuration</CardTitle></CardHeader>
                   <CardContent className="space-y-4">
                       <div>
                           <Label htmlFor="gpuType">Target GPU</Label>
                           <Select value={selectedHardwareId} onValueChange={setSelectedHardwareId}>
                               <SelectTrigger id="gpuType"><SelectValue /></SelectTrigger>
                               <SelectContent>
                                   {gpuProfiles.map(g => (
                                       <SelectItem key={g.id} value={g.id}>
                                           {g.name} ({g.vramGB} GB VRAM{g.bandwidthTBps ? `, ${g.bandwidthTBps} TB/s` : ''}{g.fp8Support ? ', FP8' : ''})
                                       </SelectItem>
                                   ))}
                               </SelectContent>
                           </Select>
                       </div>
                       {/* ... Num GPUs input ... */}
                   </CardContent>
               </Card>
            </div> {/* End Left Column */}


            {/* === Right Column: Results === */}
            <div className="space-y-5">
              {/* --- Parameter & Batch Summary (Updated) --- */}
               <Card>
                 <CardHeader className="pb-2"><CardTitle className="text-lg">Parameter & Training Summary</CardTitle></CardHeader>
                 <CardContent className="grid grid-cols-2 gap-x-4 gap-y-3 text-center">
                      {/* ... Parameter Counts (Total, Trainable, Active) ... */}
                      {/* Grad Accum */}
                      <div className="col-span-2 border-t pt-3 mt-1">
                          <Label className="text-xs text-muted-foreground block mb-0.5">Gradient Accumulation Steps</Label>
                          {/* ... Display steps ... */}
                      </div>
                      {/* Chinchilla Optimal Tokens (NEW) */}
                      <div className="col-span-2 border-t pt-3 mt-1">
                          <Label className="text-xs text-muted-foreground block mb-0.5 flex items-center justify-center">Chinchilla Optimal Tokens (Approx)
                              <ShadTooltip> <TooltipTrigger asChild><InfoIcon className="w-3 h-3 ml-1 text-muted-foreground cursor-help"/></TooltipTrigger> <TooltipContent><p>Rule of thumb (~20 tokens/param) for compute-optimal training dataset size.</p></TooltipContent> </ShadTooltip>
                          </Label>
                          <div className="text-lg font-semibold">{formatNumber(chinchillaOptimalTokens, 2)}</div>
                      </div>
                 </CardContent>
               </Card>

              {/* --- Memory Requirements (Uses updated calcs) --- */}
              <Card>
                  <CardHeader className="pb-4"><CardTitle className="text-lg">Estimated Memory Requirements</CardTitle></CardHeader>
                  <CardContent>
                     {/* ... VRAM Heat Bar ... */}
                    <Tabs defaultValue="training">
                      {/* ... Training/Inference Tabs with Charts ... */}
                    </Tabs>
                  </CardContent>
              </Card>

              {/* --- Disk Size Estimates --- */}
              <Card>
                  {/* ... Disk Size Card Content ... */}
              </Card>

               {/* --- Cost, Energy & Carbon --- */}
                <Card>
                    {/* ... Cost Card Content ... */}
                </Card>

                 {/* --- Quantization Impact Table --- */}
                 <Card>
                     {/* ... Quantization Table Content ... */}
                 </Card>

                 {/* --- Actions (Placeholders) --- */}
                 <Card>
                    {/* ... Action Buttons ... */}
                 </Card>

            </div> {/* End Right Column */}
          </div> {/* End Grid */}
        </CardContent>
      </Card>

      {/* --- Footer / Notes --- */}
      <footer className="text-center text-xs text-muted-foreground space-y-1 pt-4 border-t">
            {/* ... Disclaimer ... */}
      </footer>
    </div> {/* End Container */}
    {/* <Toaster /> */}
    </TooltipProvider>
  );
};

export default MemoryCalculator;

// --- Required Dependencies ---
// npm install zod recharts lucide-react sonner
// Ensure Shadcn UI components are installed

// --- Notes ---
// - Placeholder comments indicate where existing UI elements (sliders, charts etc.) fit.
// - Some calculations (FLOPs, detailed throughput) from the appendix are complex and not fully implemented, focusing on memory and core parameters.
// - Extra tunables (Seq Parallelism, KV Quant, Sparsity) are added as disabled placeholders in the UI.
// - Ensure the <Toaster /> component from 'sonner' is added to your app's root layout for notifications.
