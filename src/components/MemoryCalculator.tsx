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
/**
 * Formats a large number into a human-readable string with metric prefixes (K, M, B, T).
 * Includes basic handling for small numbers and zero.
 * @param num - The number to format.
 * @param precision - Number of decimal places for the scaled number.
 * @returns Formatted string (e.g., "1.23 M", "10 K", "500").
 */
const formatNumber = (num: number, precision: number = 2): string => {
    if (num === 0) return "0";
    const absNum = Math.abs(num);

    // Handle numbers between -1 and 1 (exclusive of 0)
    if (absNum < 1) {
        // Use fixed precision for small numbers, potentially scientific notation if very small
        if (absNum < 1e-6) {
            return num.toExponential(precision);
        }
        return num.toFixed(precision);
    }

    const units = ['', 'K', 'M', 'B', 'T']; // Kilo, Mega, Giga, Tera
    // Determine the correct tier based on the magnitude
    const tier = Math.max(0, Math.min(units.length - 1, Math.floor(Math.log10(absNum) / 3)));

    // If tier is 0, the number is less than 1000, format without suffix
    if (tier === 0) return num.toFixed(0);

    const suffix = units[tier];
    const scale = Math.pow(10, tier * 3);
    const scaled = num / scale;

    // Format the scaled number with the specified precision
    return scaled.toFixed(precision) + " " + suffix;
};

/**
 * Formats bytes into a human-readable string (KB, MB, GB, etc.).
 * @param bytes - Number of bytes.
 * @param decimals - Number of decimal places.
 * @returns Formatted string.
 */
const formatBytes = (bytes: number, decimals: number = 2): string => {
    if (bytes <= 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']; // Added PB
    // Calculate the logarithm base 1024 to find the correct unit
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    // Ensure index is within the bounds of the sizes array
    const index = Math.min(i, sizes.length - 1);
    // Calculate the value in the chosen unit and format it
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
      // Initial default values (will be overridden by useEffect -> preset)
      hiddenSize: 4096, numLayers: 32, numHeads: 32, vocabSize: 50000, sequenceLength: 8192,
      batchSize: 8, microBatchSizePerGPU: 1,
  }));
  const [precision, setPrecision] = useState<string>(modelPresets[0].precision || "bf16");
  const [memoryFlags, setMemoryFlags] = useState<MemoryFlags>(() => ({
      // Initial default values (will be overridden by useEffect -> preset)
      flashAttention: true, gradientCheckpointFactor: 1.0, zeroStage: 0, cpuOffloadPct: 0,
      moe: undefined, lora: undefined,
  }));
  const [selectedHardwareId, setSelectedHardwareId] = useState<string>(gpuProfiles[6].id); // Default H100 80GB SXM
  const [numGpus, setNumGpus] = useState<number>(8);
  const [costParams, setCostParams] = useState<CostEnergyParams>({
      // Initial default values (will be overridden by useEffect -> preset)
      trainingSteps: 100000, tokensPerSecondPerGPU: 3000, gridCarbonIntensity: DEFAULT_GRID_INTENSITY,
  });
  const [isInitializedFromUrl, setIsInitializedFromUrl] = useState(false);

  // Initialize state properly based on the first preset on initial mount
  useEffect(() => {
      const initialPreset = modelPresets[0];
      setArchitectureId(initialPreset.archId);
      setParameters(prev => ({
          ...prev, // Keep base defaults if preset doesn't specify everything
          ...initialPreset.params
      }));
      setPrecision(initialPreset.precision || 'bf16'); // Use preset precision or fallback
      setMemoryFlags(prev => ({
          ...prev, // Keep base defaults
          ...initialPreset.flags
      }));
      setCostParams({ // Reset cost params to defaults on mount
          trainingSteps: 100000, tokensPerSecondPerGPU: 3000, gridCarbonIntensity: DEFAULT_GRID_INTENSITY,
      });
      // Only attempt to load from URL *after* setting initial defaults
      if (window.location.hash && window.location.hash.length > 1) {
          const encodedState = window.location.hash.substring(1);
          deserializeState(encodedState);
      } else {
          setIsInitializedFromUrl(true); // Mark as initialized if no hash
      }
  }, []); // Run only once on mount

  // --- Input Definitions ---
  const parametersList: Record<keyof Omit<ModelParameters, 'microBatchSizePerGPU'>, ParameterDef> = {
    hiddenSize: { name: "Hidden Size (d_model)", value: parameters.hiddenSize, min: 128, max: 32768, step: 128, unit: "", tooltip: "Dimensionality of the model's embeddings and layers." },
    numLayers: { name: "Number of Layers (L)", value: parameters.numLayers, min: 1, max: 200, step: 1, unit: "", tooltip: "Number of transformer blocks (encoder or decoder)." },
    numHeads: { name: "Attention Heads", value: parameters.numHeads, min: 0, max: 128, step: 1, unit: "", tooltip: "Number of parallel attention mechanisms per layer (0 for non-attention models)." }, // Min set to 0
    vocabSize: { name: "Vocabulary Size (V)", value: parameters.vocabSize, min: 1000, max: 262144, step: 1000, unit: "", log: false, tooltip: "Number of unique tokens the model recognizes." },
    sequenceLength: { name: "Sequence Length (S)", value: parameters.sequenceLength, min: 128, max: 131072, step: 128, unit: "tokens", log: true, tooltip: "Maximum number of tokens processed in one input sequence." },
    batchSize: { name: "Target Global Batch Size (B)", value: parameters.batchSize, min: 1, max: 8192, step: 1, unit: "", log: true, tooltip: "Total effective batch size across all GPUs after gradient accumulation." }
  };
   const microBatchSizeDef: ParameterDef = {
       name: "Micro Batch Size / GPU", value: parameters.microBatchSizePerGPU, min: 1, max: 256, step: 1, unit: "", log: false, tooltip: "Number of sequences processed by each GPU in a single forward/backward pass before gradient accumulation."
   };

  // --- Permalink State Serialization/Deserialization ---
  const serializeState = useCallback((): string => {
    const state: AppState = { v: 2, arch: architectureId, p: parameters, f: memoryFlags, prec: precision, hw: selectedHardwareId, ng: numGpus, cost: costParams };
    try { return btoa(JSON.stringify(state)); } catch (error) { console.error("Error serializing state:", error); return ""; }
  }, [architectureId, parameters, memoryFlags, precision, selectedHardwareId, numGpus, costParams]);

  const deserializeState = useCallback((encodedState: string) => {
    try {
        const jsonString = atob(encodedState); const parsedState = JSON.parse(jsonString);
        const validationResult = AppStateSchema.safeParse(parsedState);
        if (!validationResult.success) { console.error("URL state validation failed:", validationResult.error.errors); toast.error("Failed to load configuration from link: Invalid data."); window.location.hash = ""; return false; } // Return false on failure
        const state = validationResult.data;
        setArchitectureId(architectureTypes.some(a => a.id === state.arch) ? state.arch : architectureTypes[0].id);
        setParameters(state.p); setMemoryFlags(state.f); setPrecision(state.prec);
        setSelectedHardwareId(gpuProfiles.some(g => g.id === state.hw) ? state.hw : gpuProfiles[6].id); // Default to H100 80GB SXM on error
        setNumGpus(state.ng); setCostParams(state.cost);
        toast.success("Configuration loaded from link.");
        return true; // Return true on success
    } catch (error) { console.error("Error deserializing state:", error); toast.error("Failed to load configuration from link: Invalid format."); window.location.hash = ""; return false; } // Return false on failure
  }, []); // Removed setters from deps

   // Effect to load state from URL hash on initial mount (Modified)
   useEffect(() => {
       let loaded = false;
       if (window.location.hash && window.location.hash.length > 1) {
           const encodedState = window.location.hash.substring(1);
           loaded = deserializeState(encodedState);
       }
       setIsInitializedFromUrl(true); // Mark initialization attempt complete
       // If loading failed or no hash, apply preset 0 explicitly
       if (!loaded) {
            handleApplyPreset(modelPresets[0]);
       }
   }, [deserializeState]); // Run only once on mount

   // Effect to update URL hash when state changes
   useEffect(() => {
       if (!isInitializedFromUrl) return; // Don't update URL during initial load/deserialization
       const handler = setTimeout(() => {
           const encodedState = serializeState();
           window.history.replaceState(null, '', `#${encodedState}`);
       }, 500); // Debounce update
       return () => clearTimeout(handler);
   }, [serializeState, isInitializedFromUrl]);

  // --- Derived State and Calculations ---
  const selectedQuantization = useMemo(() => quantizationTypes.find(q => q.id === precision) || quantizationTypes.find(q=>q.id === 'fp32')!, [precision]);
  const selectedHardware = useMemo(() => gpuProfiles.find(g => g.id === selectedHardwareId), [selectedHardwareId]);
  const selectedArchitecture = useMemo(() => architectureTypes.find(a => a.id === architectureId) || architectureTypes[0], [architectureId]);

  // --- Parameter Count Calculation ---
  const parameterDetails = useMemo(() => {
      const { hiddenSize: d, numLayers: L, vocabSize: V, sequenceLength: S } = parameters;
      const { moe, lora } = memoryFlags;
      let P_total_raw = 0; let P_trainable_raw = 0; let P_active_raw = 0;
      let isMoE = !!(moe && moe.experts > 1 && (architectureId === 'TX-DEC' || architectureId === 'TX-MOE' || architectureId === 'TX-ED'));
      let isLora = !!(lora && lora.rank > 0);
      const MLP_FACTOR = 4; const MLP_intermediate = MLP_FACTOR * d;

      switch (architectureId) {
          case 'TX-DEC': case 'TX-MOE':
              const P_attn_layer_dec = 4 * d * d; const P_mlp_layer_dec = 2 * d * MLP_intermediate; const P_norm_layer_dec = 2 * (2 * d);
              const P_layer_dec = P_attn_layer_dec + P_mlp_layer_dec + P_norm_layer_dec; const P_embedding_dec = V * d; const P_output_proj_dec = V * d; const P_final_norm_dec = 2 * d;
              P_total_raw = P_embedding_dec + (L * P_layer_dec) + P_final_norm_dec + P_output_proj_dec; break;
          case 'TX-ENC':
              const P_pos_embed_enc = S * d; const P_type_embed_enc = 2 * d; const P_embed_norm_enc = 2 * d; const P_embeddings_total_enc = V * d + P_pos_embed_enc + P_type_embed_enc + P_embed_norm_enc;
              const P_attn_layer_enc = 4 * d * d; const P_mlp_layer_enc = 2 * d * MLP_intermediate; const P_norm_layer_enc = 2 * (2 * d); const P_layer_enc = P_attn_layer_enc + P_mlp_layer_enc + P_norm_layer_enc;
              const P_pooler_enc = d * d + d; P_total_raw = P_embeddings_total_enc + (L * P_layer_enc) + P_pooler_enc; break;
          case 'TX-ED':
              const P_enc_attn_ed = 4 * d * d; const P_enc_mlp_ed = 2 * d * MLP_intermediate; const P_enc_norm_ed = 2 * (2 * d); const P_enc_layer_ed = P_enc_attn_ed + P_enc_mlp_ed + P_enc_norm_ed;
              const P_dec_self_attn_ed = 4 * d * d; const P_dec_cross_attn_ed = 4 * d * d; const P_dec_mlp_ed = 2 * d * MLP_intermediate; const P_dec_norm_ed = 3 * (2 * d); const P_dec_layer_ed = P_dec_self_attn_ed + P_dec_cross_attn_ed + P_dec_mlp_ed + P_dec_norm_ed;
              const P_embedding_ed = V * d; const P_final_norm_ed = 2 * d; P_total_raw = P_embedding_ed + (L * P_enc_layer_ed) + (L * P_dec_layer_ed) + P_final_norm_ed; break;
          case 'SSM-MAMBA':
              const P_ssm_kernel_proj = 4 * d * d; const P_conv_gate = 6 * d; const P_layer_mamba = P_ssm_kernel_proj + P_conv_gate;
              P_total_raw = V * d + (L * P_layer_mamba) + V * d; break;
          case 'RWKV-RNN':
              const P_mix_rwkv = 2 * d * d; const P_other_rwkv = 6 * d; const P_layer_rwkv = P_mix_rwkv + P_other_rwkv;
              P_total_raw = V * d + (L * P_layer_rwkv) + V * d; break;
          case 'HYENA':
              const k_conv = 128; const P_proj_hyena = 4 * d * d; const P_conv_hyena = 2 * d * k_conv; const P_layer_hyena = P_proj_hyena + P_conv_hyena;
              P_total_raw = V * d + (L * P_layer_hyena) + V * d; break;
          default: P_total_raw = 0;
      }
      P_trainable_raw = P_total_raw;
      if (isMoE) {
          const experts = moe.experts; const topK = moe.topK; const P_dense_mlp_layer = 2 * d * MLP_intermediate; const P_router_layer = d * experts; const P_experts_total_layer = experts * P_dense_mlp_layer; const P_moe_mlp_layer = P_router_layer + P_experts_total_layer;
          P_total_raw = P_total_raw - (L * P_dense_mlp_layer) + (L * P_moe_mlp_layer); P_trainable_raw = P_total_raw;
          const P_non_mlp_base = P_total_raw - (L * P_moe_mlp_layer); const P_active_experts_layer = topK * P_dense_mlp_layer; P_active_raw = P_non_mlp_base + L * (P_router_layer + P_active_experts_layer);
      } else { P_active_raw = P_total_raw; }
      let P_lora_raw = 0;
      if (isLora) { 
          const R = lora.rank; 
          const lora_matrices_per_layer = 2 * (d * R + R * d); 
          P_lora_raw = L * lora_matrices_per_layer;
      }

      // Calculate different parameter counts based on weight quantization
      const paramMultiplier = selectedQuantization.memoryMultiplier;
      const P_total = P_total_raw; // Raw count does not change with quantization
      const P_trainable = P_trainable_raw + P_lora_raw; // Add LoRA params if applicable
      const P_active = P_active_raw;
      // Memory required to store params in different formats (adds a bit of overhead for bookkeeping)
      const M_lora = P_lora_raw * 4 / (1024 * 1024 * 1024); // Always FP32
      const M_params = P_total * paramMultiplier * (4/32) / (1024 * 1024 * 1024); // GB
      const M_active_params = P_active * paramMultiplier * (4/32) / (1024 * 1024 * 1024); // GB

      return { 
          P_total, P_trainable, P_active, P_lora: P_lora_raw,
          M_params, M_active_params, M_lora,
          isMoE, isLora,
      };
  }, [parameters, architectureId, memoryFlags, selectedQuantization]);

  // --- Memory Calculation Details for Training ---
  const trainingMemoryDetails = useMemo(() => {
      if (!selectedHardware) return null;

      const { hiddenSize: d, numLayers: L, sequenceLength: S, microBatchSizePerGPU: B_micro } = parameters;
      const { M_active_params, P_active, isMoE } = parameterDetails || {};
      const { memoryMultiplier: paramMultiplier } = selectedQuantization || { memoryMultiplier: 1.0 };
      const { flashAttention = true, gradientCheckpointFactor = 1.0, zeroStage = 0 } = memoryFlags || {};

      // Base activation calculation for attention-based models (per layer)
      const MLP_FACTOR = 4;
      const isAttentionModel = parameters.numHeads > 0;

      // --- Determine per-layer memory footprints ---
      // A large fraction of GPU memory during training is used by activations
      // kept in memory for the backward pass. These can be reduced via gradient checkpointing.

      // Size of activations per token for forward pass
      let bytes_per_token_fwd = 0;
      // Base activations for all models: embeddings and misc operations
      bytes_per_token_fwd += d * 2; // About 2 bytes per embedding dim
      
      // Additional activations for specific architectures
      if (isAttentionModel) {
          if (architectureId === 'TX-ED') {
              // Full encoder-decoder has ~2x the activations
              bytes_per_token_fwd += 2 * (d * 10 + (isMoE ? d * 4 : d * 8));
          } else {
              bytes_per_token_fwd += d * 10 + (isMoE ? d * 4 : d * 8); // Attention outputs + FF activations
          }
      } else {
          // Non-attention models (SSM, Hyena, etc)
          if (architectureId === 'SSM-MAMBA') {
              bytes_per_token_fwd += d * 4; // SSM kernels
          } else {
              bytes_per_token_fwd += d * 3; // Other architectures generic estimate
          }
      }
      
      // Handle attention optimization
      if (isAttentionModel && flashAttention) {
          // FlashAttention reduces memory for attention ops
          bytes_per_token_fwd *= 0.75; 
      }

      // Calculate KV cache for decoder models - retained per token
      let kv_cache_bytes_per_token = 0;
      if (architectureId === 'TX-DEC' || architectureId === 'TX-MOE') {
          // KV cache: 2 * hidden_size * bytes_per_param for each token
          kv_cache_bytes_per_token = 2 * d * (memoryFlags.kvCachePrecision === 'int8' ? 1 : 2);
      }

      // Calculate total activations memory requirement
      // This depends on sequence length, batch size, and gradient checkpointing
      const bytes_per_seq_fwd = bytes_per_token_fwd * S;
      const activation_discount = Math.sqrt(gradientCheckpointFactor); // Gradient checkpointing
      const M_activations = B_micro * bytes_per_seq_fwd * L * activation_discount / (1024 * 1024 * 1024);
      
      // KV cache memory (if applicable)
      const M_kvcache = B_micro * kv_cache_bytes_per_token * S * L / (1024 * 1024 * 1024);

      // Optimizer states (Adam with 8-bit stats uses ~10 bytes/param)
      // ZeRO shards optimizer states across GPUs - only need 1/N per GPU
      const optimizer_fraction_per_gpu = zeroStage >= 1 ? (1.0 / numGpus) : 1.0;
      const M_optimizer = P_active * 10 * optimizer_fraction_per_gpu / (1024 * 1024 * 1024); // GB

      // Gradients - ZeRO shards gradients across GPUs from stage 2+
      const grads_fraction_per_gpu = zeroStage >= 2 ? (1.0 / numGpus) : 1.0;
      const bytes_per_param_grad = paramMultiplier * (4/32) * 4; // 4 bytes per original param for gradient
      const M_gradients = P_active * bytes_per_param_grad * grads_fraction_per_gpu / (1024 * 1024 * 1024); // GB

      // Model weights - ZeRO shards weights across GPUs from stage 3
      const weights_fraction_per_gpu = zeroStage >= 3 ? (1.0 / numGpus) : 1.0;
      const M_model_sharded = M_active_params * weights_fraction_per_gpu; // GB

      // CPU offload consideration
      const cpu_fraction = memoryFlags.cpuOffloadPct / 100.0;
      const M_optimizer_after_offload = M_optimizer * (1 - cpu_fraction);
      
      // Base memory for CUDA context and PyTorch overhead
      const M_base = 2.0; // About 2 GB for CUDA context + framework overhead

      // Calculate total memory per GPU for training
      const M_total_training_per_gpu = (
          M_base + 
          M_activations + 
          M_kvcache +
          M_model_sharded +
          M_optimizer_after_offload + 
          M_gradients
      );

      // Create memory component breakdown
      const memoryComponents = [
          { name: "Model Weights", value: M_model_sharded, color: "#8884d8" },
          { name: "Optimizer States", value: M_optimizer_after_offload, color: "#82ca9d" },
          { name: "Gradients", value: M_gradients, color: "#ffc658" },
          { name: "Activations", value: M_activations, color: "#ff8042" },
          { name: "KV Cache", value: M_kvcache, color: "#0088FE" },
          { name: "CUDA & PyTorch", value: M_base, color: "#8A2BE2" }
      ];

      // Filter out zero-value components and sort by size (largest first)
      const filteredComponents = memoryComponents
          .filter(item => item.value > 0)
          .sort((a, b) => b.value - a.value);

      // Maximum theoretical throughput calculation
      const { bandwidthTBps } = selectedHardware;
      // Estimate tokens/sec based on GPU memory bandwidth and model size
      // This is a rough approximation based on bandwidth utilization 
      const avg_params_per_token = P_active / 1000; // approximately how many params are activated per token
      const bandwidth_utilization = 0.7; // 70% utilization of theoretical bandwidth
      const tokens_per_second_estimated = bandwidthTBps ? 
          Math.floor((bandwidthTBps * 1e12 * bandwidth_utilization) / (avg_params_per_token * 2 * 4)) : undefined; // 2 ops per param (mul+add), 4 bytes per FP32
      
      return {
          M_total_training_per_gpu,
          M_activations,
          M_kvcache,
          M_model_sharded,
          M_optimizer_after_offload,
          M_gradients,
          M_base,
          components: filteredComponents,
          tokens_per_second_estimated
      };
  }, [parameters, memoryFlags, parameterDetails, selectedQuantization, numGpus, selectedHardware, architectureId]);

  // --- Memory Calculation Details for Inference ---
  const inferenceMemoryDetails = useMemo(() => {
      if (!selectedHardware) return null;
      
      const { hiddenSize: d, numLayers: L, sequenceLength: S, microBatchSizePerGPU: B_micro } = parameters;
      const { M_active_params } = parameterDetails || {};
      
      // For inference, we don't need optimizer states or full gradients
      
      // KV cache is usually the main memory consumer during inference
      let kv_cache_bytes_per_token = 0;
      if (architectureId === 'TX-DEC' || architectureId === 'TX-MOE') {
          // KV cache: 2 * hidden_size * bytes_per_param for each token
          // If using int8 KV cache, we use 1 byte per element instead of 2
          kv_cache_bytes_per_token = 2 * d * (memoryFlags.kvCachePrecision === 'int8' ? 1 : 2);
      }
      
      // Forward pass activations per sequence
      // For inference, we only keep activations for the current token
      const bytes_per_token_fwd = d * 4; // Simpler estimate for inference
      const M_workingmem = B_micro * bytes_per_token_fwd * L / (1024 * 1024 * 1024);
      
      // KV cache memory (key contributor in inference)
      const M_kvcache = B_micro * kv_cache_bytes_per_token * S * L / (1024 * 1024 * 1024);
      
      // Base memory for CUDA context and PyTorch overhead
      const M_base = 1.5; // Typically less overhead than training
      
      // Calculate total memory per GPU for inference
      const M_total_inference_per_gpu = M_base + M_active_params + M_workingmem + M_kvcache;
      
      // Create memory component breakdown
      const memoryComponents = [
          { name: "Model Weights", value: M_active_params, color: "#8884d8" },
          { name: "Working Memory", value: M_workingmem, color: "#82ca9d" },
          { name: "KV Cache", value: M_kvcache, color: "#0088FE" },
          { name: "CUDA & PyTorch", value: M_base, color: "#8A2BE2" }
      ];

      // Filter out zero-value components and sort by size (largest first)
      const filteredComponents = memoryComponents
          .filter(item => item.value > 0)
          .sort((a, b) => b.value - a.value);
          
      return {
          M_total_inference_per_gpu,
          M_active_params,
          M_workingmem,
          M_kvcache,
          M_base,
          components: filteredComponents
      };
  }, [parameters, memoryFlags, parameterDetails, selectedHardware, architectureId]);
  
  // --- Training Cost/Energy Estimation ---
  const costEnergyEstimation = useMemo(() => {
      if (!selectedHardware || !trainingMemoryDetails) return null;
      
      const { trainingSteps, tokensPerSecondPerGPU, gridCarbonIntensity } = costParams;
      const { tokens_per_second_estimated } = trainingMemoryDetails;
      
      // Calculate how many tokens will be processed during training
      const batchTokensPerStep = parameters.batchSize * parameters.sequenceLength;
      const totalTokens = batchTokensPerStep * trainingSteps;
      
      // Time estimation based on tokens per second
      const tokensPerSecond = tokensPerSecondPerGPU * numGpus; // Total tokens/sec across all GPUs
      const trainingTimeSeconds = totalTokens / tokensPerSecond;
      const trainingTimeHours = trainingTimeSeconds / 3600;
      
      // Energy consumption - powerW is in watts, convert to kWh
      const energyPerGpuKWh = (selectedHardware.powerW / 1000) * trainingTimeHours;
      const totalEnergyKWh = energyPerGpuKWh * numGpus;
      
      // Carbon footprint (metric tons of CO2e)
      // Using gridCarbonIntensity in kg CO2e per kWh
      const carbonEmissionsTonnes = (totalEnergyKWh * gridCarbonIntensity) / 1000;
      
      // Cost calculation
      let totalCostUSD = 0;
      const selectedCloudInstance = cloudInstanceProfiles.find(p => p.gpuType === selectedHardwareId);
      if (selectedCloudInstance) {
          // If we have an exact match for a cloud instance with this GPU
          totalCostUSD = selectedCloudInstance.hourlyUSD * trainingTimeHours;
      } else if (selectedHardware.hourlyUSD) {
          // If the GPU has its own hourly cost defined
          totalCostUSD = selectedHardware.hourlyUSD * numGpus * trainingTimeHours;
      } else {
          // Rough approximation based on GPU class and VRAM
          const baseHourlyRate = (selectedHardwareId.includes('h100') || selectedHardwareId.includes('h200')) ? 
              10 : (selectedHardwareId.includes('a100') ? 5 : 2);
          const vramFactor = selectedHardware.vramGB / 40; // Normalize relative to 40GB
          totalCostUSD = baseHourlyRate * vramFactor * numGpus * trainingTimeHours;
      }
      
      return {
          totalTokens,
          trainingTimeHours,
          totalEnergyKWh,
          carbonEmissionsTonnes,
          totalCostUSD,
          costPerKTokens: (totalCostUSD / (totalTokens / 1000)),
      };
  }, [selectedHardware, trainingMemoryDetails, costParams, parameters.batchSize, parameters.sequenceLength, numGpus, selectedHardwareId]);

  // Function to apply model preset
  const handleApplyPreset = (preset: ModelPreset) => {
      setArchitectureId(preset.archId);
      setParameters(prev => ({
          ...prev, // Keep current values as default
          ...preset.params // Override with preset values
      }));
      setPrecision(preset.precision || 'bf16'); // Use preset precision or fallback
      // Handle memory flags, preserving any values not specified in the preset
      setMemoryFlags(prev => ({
          ...prev, // Keep current flags as default
          ...preset.flags, // Override with preset flags
      }));
      toast.success(`Applied preset: ${preset.name}`);
  };

  // TODO: Implement your UI using the calculated data

  return (
    <div className="container mx-auto p-4">
      <h1>Memory Calculator</h1>
      {/* TODO: Add your UI components here */}
    </div>
  );
};

export default MemoryCalculator;
