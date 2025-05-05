
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner"; // Using sonner for toast notifications

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
export const MemoryCalculator: React.FC = () => {
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
      const jsonString = atob(encodedState);
      const parsedState = JSON.parse(jsonString);
      const validationResult = AppStateSchema.safeParse(parsedState);
      
      if (!validationResult.success) { 
        console.error("URL state validation failed:", validationResult.error.errors); 
        toast.error("Failed to load configuration from link: Invalid data."); 
        window.location.hash = ""; 
        return false; 
      }
      
      const state = validationResult.data;
      
      // Ensure we're setting all required fields for each state update
      setArchitectureId(architectureTypes.some(a => a.id === state.arch) ? state.arch : architectureTypes[0].id);
      
      // Set ModelParameters with all required fields
      setParameters({
        hiddenSize: state.p.hiddenSize,
        numLayers: state.p.numLayers,
        numHeads: state.p.numHeads,
        vocabSize: state.p.vocabSize,
        sequenceLength: state.p.sequenceLength,
        batchSize: state.p.batchSize,
        microBatchSizePerGPU: state.p.microBatchSizePerGPU
      });
      
      // Set MemoryFlags with all required fields
      setMemoryFlags({
        flashAttention: state.f.flashAttention,
        gradientCheckpointFactor: state.f.gradientCheckpointFactor,
        zeroStage: state.f.zeroStage,
        cpuOffloadPct: state.f.cpuOffloadPct,
        // Optional fields
        moe: state.f.moe,
        lora: state.f.lora,
        sequenceParallelism: state.f.sequenceParallelism,
        kvCachePrecision: state.f.kvCachePrecision,
        sparsity24: state.f.sparsity24
      });
      
      setPrecision(state.prec);
      
      setSelectedHardwareId(gpuProfiles.some(g => g.id === state.hw) ? state.hw : gpuProfiles[6].id);
      
      setNumGpus(state.ng);
      
      // Set CostEnergyParams with all required fields
      setCostParams({
        trainingSteps: state.cost.trainingSteps,
        tokensPerSecondPerGPU: state.cost.tokensPerSecondPerGPU,
        gridCarbonIntensity: state.cost.gridCarbonIntensity
      });
      
      toast.success("Configuration loaded from link.");
      return true;
    } catch (error) { 
      console.error("Error deserializing state:", error); 
      toast.error("Failed to load configuration from link: Invalid format."); 
      window.location.hash = ""; 
      return false; 
    }
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

      // Only train LoRA parameters in LoRA mode
      if (isLora) {
          P_trainable_raw = P_lora_raw;
      }

      return {
          totalParams: P_total_raw,
          trainableParams: P_trainable_raw,
          activeParams: P_active_raw,
          loraParams: P_lora_raw,
          isMoE: isMoE,
          isLora: isLora
      };
  }, [parameters, memoryFlags, architectureId]);

  // --- Function to handle applying a preset ---
  const handleApplyPreset = useCallback((preset: ModelPreset) => {
    setArchitectureId(preset.archId);
    
    // Set parameters, ensuring all required fields exist
    setParameters(prev => {
        const updatedParams: ModelParameters = {
            // Start with full defaults
            hiddenSize: prev.hiddenSize, 
            numLayers: prev.numLayers,
            numHeads: prev.numHeads,
            vocabSize: prev.vocabSize,
            sequenceLength: prev.sequenceLength,
            batchSize: prev.batchSize,
            microBatchSizePerGPU: prev.microBatchSizePerGPU,
            
            // Override with preset values
            ...(preset.params.hiddenSize !== undefined ? { hiddenSize: preset.params.hiddenSize } : {}),
            ...(preset.params.numLayers !== undefined ? { numLayers: preset.params.numLayers } : {}),
            ...(preset.params.numHeads !== undefined ? { numHeads: preset.params.numHeads } : {}),
            ...(preset.params.vocabSize !== undefined ? { vocabSize: preset.params.vocabSize } : {}),
            ...(preset.params.sequenceLength !== undefined ? { sequenceLength: preset.params.sequenceLength } : {}),
            ...(preset.params.batchSize !== undefined ? { batchSize: preset.params.batchSize } : {}),
            ...(preset.params.microBatchSizePerGPU !== undefined ? { microBatchSizePerGPU: preset.params.microBatchSizePerGPU } : {})
        };
        
        return updatedParams;
    });
    
    // Ensure all required fields exist in memoryFlags
    setMemoryFlags(prev => {
        // Start with current flags for defaults
        const newFlags: MemoryFlags = {
            flashAttention: prev.flashAttention,
            gradientCheckpointFactor: prev.gradientCheckpointFactor,
            zeroStage: prev.zeroStage,
            cpuOffloadPct: prev.cpuOffloadPct,
            // Reset MoE and LoRA to undefined when changing presets
            moe: undefined,
            lora: undefined
        };
        
        // Apply preset flags if they exist
        if (preset.flags) {
            if (preset.flags.moe) newFlags.moe = preset.flags.moe;
            if (preset.flags.lora) newFlags.lora = preset.flags.lora;
            if (preset.flags.flashAttention !== undefined) newFlags.flashAttention = preset.flags.flashAttention;
            if (preset.flags.gradientCheckpointFactor !== undefined) newFlags.gradientCheckpointFactor = preset.flags.gradientCheckpointFactor;
            if (preset.flags.zeroStage !== undefined) newFlags.zeroStage = preset.flags.zeroStage;
            if (preset.flags.cpuOffloadPct !== undefined) newFlags.cpuOffloadPct = preset.flags.cpuOffloadPct;
            if (preset.flags.sequenceParallelism !== undefined) newFlags.sequenceParallelism = preset.flags.sequenceParallelism;
            if (preset.flags.kvCachePrecision !== undefined) newFlags.kvCachePrecision = preset.flags.kvCachePrecision;
            if (preset.flags.sparsity24 !== undefined) newFlags.sparsity24 = preset.flags.sparsity24;
        }
        return newFlags;
    });
    
    // Set precision if specified in preset
    if (preset.precision) {
        setPrecision(preset.precision);
    }
    
    toast.success(`Applied ${preset.name} preset`);
  }, []);

  // --- Placeholder UI ---
  return (
    <div className="memory-calculator w-full max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">LLM Memory Calculator</h1>
      <p className="text-gray-600 mb-8 text-center">
        This is a placeholder for the Memory Calculator component. Full implementation coming soon.
      </p>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Model Architecture</CardTitle>
          <CardDescription>Select a model architecture and preset to explore memory requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="architecture">Architecture Type</Label>
              <Select value={architectureId} onValueChange={setArchitectureId}>
                <SelectTrigger id="architecture">
                  <SelectValue placeholder="Select architecture" />
                </SelectTrigger>
                <SelectContent>
                  {architectureTypes.map(arch => (
                    <SelectItem key={arch.id} value={arch.id}>
                      {arch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="preset">Model Preset</Label>
              <Select value={modelPresets[0].name} onValueChange={() => {}}>
                <SelectTrigger id="preset">
                  <SelectValue placeholder="Select preset" />
                </SelectTrigger>
                <SelectContent>
                  {modelPresets.map(preset => (
                    <SelectItem key={preset.name} value={preset.name}>
                      {preset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Parameter Statistics</CardTitle>
          <CardDescription>Estimated model parameters and memory requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border rounded-md bg-blue-50 text-center">
              <p className="text-sm text-gray-500">Total Parameters</p>
              <p className="text-3xl font-bold text-blue-700">{formatNumber(parameterDetails.totalParams)}</p>
            </div>
            <div className="p-4 border rounded-md bg-green-50 text-center">
              <p className="text-sm text-gray-500">Memory Required</p>
              <p className="text-3xl font-bold text-green-700">-</p>
            </div>
            <div className="p-4 border rounded-md bg-purple-50 text-center">
              <p className="text-sm text-gray-500">GPUs Needed</p>
              <p className="text-3xl font-bold text-purple-700">-</p>
            </div>
          </div>
          <div className="mt-6 text-center">
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <DownloadIcon className="mr-2 h-4 w-4" /> Download Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Export as default for compatibility with existing import statements
export default MemoryCalculator;
