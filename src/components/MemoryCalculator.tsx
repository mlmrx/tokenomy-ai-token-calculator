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

type ParameterDef = {
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  log?: boolean;
  tooltip?: string;
};

type QuantizationType = {
  name: string;
  bitsPerParameter: number;
  memoryMultiplier: number;
  performanceImpact: string;
  reference?: string;
};

interface GpuProfile {
  id: string;
  name: string;
  vramGB: number;
  powerW: number;
  hourlyUSD?: number;
  dataSource?: string;
}

interface CloudInstanceProfile {
    id: string;
    name: string;
    gpuType: string;
    gpuCount: number;
    hourlyUSD: number;
    dataSource?: string;
}

interface MemoryFlags {
  flashAttention: boolean;
  gradientCheckpointFactor: number;
  zeroStage: 0 | 1 | 2 | 3;
  cpuOffloadPct: number;
  moe?: { experts: number; topK: number };
  lora?: { rank: number };
}

interface CostEnergyParams {
    trainingSteps: number;
    tokensPerSecondPerGPU: number;
    gridCarbonIntensity: number;
}

// Extended ModelParameters to include micro batch size
interface ModelParameters {
  hiddenSize: number;
  numLayers: number;
  numHeads: number;
  vocabSize: number;
  sequenceLength: number;
  batchSize: number; // Target Global Batch Size (B_global)
  microBatchSizePerGPU: number; // Actual batch size processed per GPU per step (B_micro)
}

// --- Static Data ---

const quantizationTypes: QuantizationType[] = [
  { name: "FP32", bitsPerParameter: 32, memoryMultiplier: 1.0, performanceImpact: "Baseline accuracy & memory. Slowest on modern GPUs." },
  { name: "FP16", bitsPerParameter: 16, memoryMultiplier: 0.5, performanceImpact: "Requires Volta+ GPUs. Faster training/inference via Tensor Cores. Potential stability issues (requires loss scaling)." },
  { name: "BF16", bitsPerParameter: 16, memoryMultiplier: 0.5, performanceImpact: "Requires Ampere+ GPUs. Similar speed to FP16, better training stability (wider dynamic range)." },
  { name: "INT8", bitsPerParameter: 8, memoryMultiplier: 0.25, performanceImpact: "Significant memory reduction & speedup (esp. inference). Moderate accuracy loss (~1-5% typical, task dependent). Requires calibration or Quantization-Aware Training (QAT)." },
  { name: "AWQ (4-bit)", bitsPerParameter: 4, memoryMultiplier: 0.125, performanceImpact: "Activation-aware Weight Quantization. Very low memory. Minimal accuracy loss (~0.2% PPL reported). Fast inference.", reference:"Lin et al., 2023"},
  { name: "GPTQ (4-bit)", bitsPerParameter: 4, memoryMultiplier: 0.125, performanceImpact: "Post-Training Quantization. Very low memory. Minimal accuracy loss (~0.03 PPL @175B reported). Fast inference.", reference:"Frantar et al., 2022"},
];

const gpuProfiles: GpuProfile[] = [
  { id: 'rtx3090', name: 'NVIDIA RTX 3090', vramGB: 24, powerW: 350, dataSource: "NVIDIA Spec" },
  { id: 'rtx4090', name: 'NVIDIA RTX 4090', vramGB: 24, powerW: 450, dataSource: "NVIDIA Spec" },
  { id: 'a100-40-sxm', name: 'NVIDIA A100 (40GB SXM)', vramGB: 40, powerW: 400, dataSource: "NVIDIA Datasheet" },
  { id: 'a100-80-sxm', name: 'NVIDIA A100 (80GB SXM)', vramGB: 80, powerW: 400, dataSource: "NVIDIA Datasheet" },
  { id: 'h100-80-pcie', name: 'NVIDIA H100 (80GB PCIe)', vramGB: 80, powerW: 350, dataSource: "NVIDIA Datasheet" },
  { id: 'h100-80-sxm', name: 'NVIDIA H100 (80GB SXM)', vramGB: 80, powerW: 700, dataSource: "NVIDIA Datasheet / TRG" },
  { id: 'h100-94-nvl', name: 'NVIDIA H100 NVL (94GB)', vramGB: 94, powerW: 700, dataSource: "NVIDIA H100 NVL" },
  { id: 'gh200-gracehopper', name: 'NVIDIA GH200 Grace Hopper (GPU Mem)', vramGB: 96, powerW: 1000, dataSource: "NVIDIA GH200"},
  { id: 'b100-192-sxm', name: 'NVIDIA B100 (192GB SXM - Preview)', vramGB: 192, powerW: 1000, dataSource: "NVIDIA Blackwell Announce" },
  { id: 'b200-192-sxm', name: 'NVIDIA B200 (192GB SXM - Preview)', vramGB: 192, powerW: 1000, dataSource: "NVIDIA Blackwell Announce" },
];

const cloudInstanceProfiles: CloudInstanceProfile[] = [
    { id:'aws-p4d.24xlarge', name: 'AWS p4d.24xlarge', gpuType:'a100-40-sxm', gpuCount: 8, hourlyUSD: 32.77, dataSource: "AWS Pricing (us-east-1, On-Demand, ~2024)"},
    { id:'aws-p4de.24xlarge', name: 'AWS p4de.24xlarge', gpuType:'a100-80-sxm', gpuCount: 8, hourlyUSD: 40.96, dataSource: "AWS Pricing (us-east-1, On-Demand, ~2024)"},
    { id:'aws-p5.48xlarge', name: 'AWS p5.48xlarge', gpuType:'h100-80-sxm', gpuCount: 8, hourlyUSD: 98.32, dataSource: "AWS Pricing (us-east-1, On-Demand, ~2024)"},
    { id:'gcp-a2-highgpu-8g', name: 'GCP a2-highgpu-8g', gpuType:'a100-40-sxm', gpuCount: 8, hourlyUSD: 29.36, dataSource: "GCP Pricing (us-central1, On-Demand, ~2024)"},
    { id:'gcp-a3-highgpu-8g', name: 'GCP a3-highgpu-8g', gpuType:'h100-80-sxm', gpuCount: 8, hourlyUSD: 35.00, dataSource: "GCP Pricing (us-central1, On-Demand, ~2024)" },
    { id:'azure-ndm-a100-v4', name: 'Azure NDm A100 v4', gpuType:'a100-80-sxm', gpuCount: 8, hourlyUSD: 27.40, dataSource: "Azure Pricing (East US, On-Demand, ~2024)"},
];

const DEFAULT_GRID_INTENSITY = 0.386;

// --- Model Presets ---
interface ModelPreset {
    name: string;
    modelType: string;
    params: Partial<ModelParameters>;
    flags?: Partial<MemoryFlags>;
    precision?: string;
}

const modelPresets: ModelPreset[] = [
    { name: "Llama-3-8B Instruct", modelType: "decoder", params: { hiddenSize: 4096, numLayers: 32, numHeads: 32, vocabSize: 128256, sequenceLength: 8192, batchSize: 64, microBatchSizePerGPU: 4 }, precision: "bf16" }, // Example micro batch
    { name: "Mixtral-8x7B", modelType: "decoder", params: { hiddenSize: 4096, numLayers: 32, numHeads: 32, vocabSize: 32000, sequenceLength: 4096, batchSize: 32, microBatchSizePerGPU: 2 }, flags: { moe: { experts: 8, topK: 2 } }, precision: "bf16" },
    { name: "Phi-3-mini (3.8B)", modelType: "decoder", params: { hiddenSize: 3072, numLayers: 32, numHeads: 32, vocabSize: 32064, sequenceLength: 4096, batchSize: 64, microBatchSizePerGPU: 8 }, precision: "bf16"},
    { name: "BERT-Large", modelType: "encoder", params: { hiddenSize: 1024, numLayers: 24, numHeads: 16, vocabSize: 30522, sequenceLength: 512, batchSize: 256, microBatchSizePerGPU: 32 }, precision: "fp32"},
    { name: "T5-Large (770M)", modelType: "encoder-decoder", params: { hiddenSize: 1024, numLayers: 24, numHeads: 16, vocabSize: 32128, sequenceLength: 512, batchSize: 128, microBatchSizePerGPU: 16 }, precision: "fp32"},
];

// --- Helper Functions ---

const formatNumber = (num: number, precision: number = 2): string => {
    if (num === 0) return "0";
    if (Math.abs(num) < 1 && num !== 0) return num.toFixed(precision);
    const units = ['', 'K', 'M', 'B', 'T'];
    const tier = Math.max(0, Math.min(units.length - 1, Math.floor(Math.log10(Math.abs(num)) / 3)));
    const suffix = units[tier];
    const scale = Math.pow(10, tier * 3);
    const scaled = num / scale;
    return scaled.toFixed(precision) + " " + suffix;
};

const formatBytes = (bytes: number, decimals: number = 2): string => {
    if (bytes <= 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.min(sizes.length - 1, Math.floor(Math.log(bytes) / Math.log(k)));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const gigabytesToBytes = (gb: number): number => gb * 1024 * 1024 * 1024;
const bytesToGigabytes = (bytes: number): number => bytes / (1024 * 1024 * 1024);

// --- Zod Schema for URL State Validation ---
const LoraSchema = z.object({ rank: z.number().positive() }).optional();
const MoeSchema = z.object({ experts: z.number().positive(), topK: z.number().positive() }).optional();

const MemoryFlagsSchema = z.object({
  flashAttention: z.boolean(),
  gradientCheckpointFactor: z.number().min(0.1).max(1.0), // Allow slightly lower min
  zeroStage: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  cpuOffloadPct: z.number().min(0).max(100),
  moe: MoeSchema,
  lora: LoraSchema,
});

const ModelParametersSchema = z.object({
  hiddenSize: z.number().positive(),
  numLayers: z.number().positive(),
  numHeads: z.number().positive(),
  vocabSize: z.number().positive(),
  sequenceLength: z.number().positive(),
  batchSize: z.number().positive(), // Global
  microBatchSizePerGPU: z.number().positive(), // Micro
});

const CostEnergyParamsSchema = z.object({
  trainingSteps: z.number().positive(),
  tokensPerSecondPerGPU: z.number().positive(),
  gridCarbonIntensity: z.number().nonnegative(),
});

const AppStateSchema = z.object({
  v: z.literal(1), // Version number for schema changes
  mt: z.string(), // modelType
  p: ModelParametersSchema,
  f: MemoryFlagsSchema,
  prec: z.string(), // precision
  hw: z.string(), // selectedHardwareId
  ng: z.number().positive(), // numGpus
  cost: CostEnergyParamsSchema,
});

type AppState = z.infer<typeof AppStateSchema>;

// --- Main Component ---

const MemoryCalculator = () => {
  // --- State Definitions ---
  const [modelType, setModelType] = useState<string>(modelPresets[0].modelType);
  const [parameters, setParameters] = useState<ModelParameters>(() => ({
      hiddenSize: 4096, numLayers: 32, numHeads: 32, vocabSize: 50000, sequenceLength: 8192,
      batchSize: 8, microBatchSizePerGPU: 1, // Added microBatchSizePerGPU
      ...modelPresets[0].params // Override defaults with preset
  }));
  const [precision, setPrecision] = useState<string>(modelPresets[0].precision || "bf16");
  const [memoryFlags, setMemoryFlags] = useState<MemoryFlags>(() => ({
    flashAttention: true, gradientCheckpointFactor: 1.0, zeroStage: 0, cpuOffloadPct: 0,
    moe: undefined, lora: undefined,
    ...modelPresets[0].flags
  }));
  const [selectedHardwareId, setSelectedHardwareId] = useState<string>(gpuProfiles[5].id); // Default H100 80GB SXM
  const [numGpus, setNumGpus] = useState<number>(8);
  const [costParams, setCostParams] = useState<CostEnergyParams>({
      trainingSteps: 100000, tokensPerSecondPerGPU: 3000, gridCarbonIntensity: DEFAULT_GRID_INTENSITY,
  });
  const [isInitializedFromUrl, setIsInitializedFromUrl] = useState(false);

  // --- Input Definitions ---
  const parametersList: Record<keyof Omit<ModelParameters, 'microBatchSizePerGPU'>, ParameterDef> = {
    hiddenSize: { name: "Hidden Size (d_model)", value: parameters.hiddenSize, min: 128, max: 32768, step: 128, unit: "", tooltip: "Dimensionality of the model's embeddings and layers." },
    numLayers: { name: "Number of Layers (L)", value: parameters.numLayers, min: 1, max: 200, step: 1, unit: "", tooltip: "Number of transformer blocks (encoder or decoder)." },
    numHeads: { name: "Attention Heads", value: parameters.numHeads, min: 1, max: 128, step: 1, unit: "", tooltip: "Number of parallel attention mechanisms per layer." },
    vocabSize: { name: "Vocabulary Size (V)", value: parameters.vocabSize, min: 1000, max: 262144, step: 1000, unit: "", log: false, tooltip: "Number of unique tokens the model recognizes." },
    sequenceLength: { name: "Sequence Length (S)", value: parameters.sequenceLength, min: 128, max: 131072, step: 128, unit: "tokens", log: true, tooltip: "Maximum number of tokens processed in one input sequence." },
    batchSize: { name: "Target Global Batch Size (B)", value: parameters.batchSize, min: 1, max: 8192, step: 1, unit: "", log: true, tooltip: "Total effective batch size across all GPUs after gradient accumulation." } // Updated tooltip
    // microBatchSizePerGPU handled separately
  };
   const microBatchSizeDef: ParameterDef = {
       name: "Micro Batch Size / GPU", value: parameters.microBatchSizePerGPU, min: 1, max: 256, step: 1, unit: "", log: false, tooltip: "Number of sequences processed by each GPU in a single forward/backward pass before gradient accumulation."
   };


  // --- Permalink State Serialization/Deserialization ---

  // Function to serialize state to Base64 JSON
  const serializeState = useCallback((): string => {
    const state: AppState = {
      v: 1,
      mt: modelType,
      p: parameters,
      f: memoryFlags,
      prec: precision,
      hw: selectedHardwareId,
      ng: numGpus,
      cost: costParams,
    };
    try {
        const jsonString = JSON.stringify(state);
        return btoa(jsonString); // Base64 encode
    } catch (error) {
        console.error("Error serializing state:", error);
        return "";
    }
  }, [modelType, parameters, memoryFlags, precision, selectedHardwareId, numGpus, costParams]);

  // Function to deserialize state and update UI
  const deserializeState = useCallback((encodedState: string) => {
    try {
        const jsonString = atob(encodedState); // Base64 decode
        const parsedState = JSON.parse(jsonString);

        // Validate using Zod schema
        const validationResult = AppStateSchema.safeParse(parsedState);

        if (!validationResult.success) {
            console.error("URL state validation failed:", validationResult.error.errors);
            toast.error("Failed to load configuration from link: Invalid data.");
            // Reset URL hash
            window.location.hash = "";
            return;
        }

        const state = validationResult.data;

        // Update state variables
        setModelType(state.mt);
        setParameters(state.p);
        setMemoryFlags(state.f);
        setPrecision(state.prec);
        // Ensure hardware ID exists, otherwise fallback
        setSelectedHardwareId(gpuProfiles.some(g => g.id === state.hw) ? state.hw : gpuProfiles[5].id);
        setNumGpus(state.ng);
        setCostParams(state.cost);
        toast.success("Configuration loaded from link.");

    } catch (error) {
        console.error("Error deserializing state:", error);
        toast.error("Failed to load configuration from link: Invalid format.");
        // Reset URL hash if decoding fails
        window.location.hash = "";
    }
  }, []); // No dependencies needed for setters

   // Effect to load state from URL hash on initial mount
   useEffect(() => {
       if (window.location.hash && window.location.hash.length > 1) {
           const encodedState = window.location.hash.substring(1); // Remove '#'
           deserializeState(encodedState);
       }
       setIsInitializedFromUrl(true); // Mark initialization complete
   }, [deserializeState]); // Run only once on mount

   // Effect to update URL hash when state changes (after initial load)
   useEffect(() => {
       if (!isInitializedFromUrl) return; // Don't update URL during initial load from hash

       const handler = setTimeout(() => {
           const encodedState = serializeState();
           // Update hash without adding to browser history stack
           window.history.replaceState(null, '', `#${encodedState}`);
       }, 500); // Debounce update slightly

       return () => clearTimeout(handler); // Cleanup timeout on unmount or state change
   }, [serializeState, isInitializedFromUrl]); // Re-run when state changes


  // --- Derived State and Calculations ---

  const selectedQuantization = useMemo(() => quantizationTypes.find(q => q.name.toLowerCase().startsWith(precision.toLowerCase())) || quantizationTypes[0], [precision]);
  const selectedHardware = useMemo(() => gpuProfiles.find(g => g.id === selectedHardwareId), [selectedHardwareId]);

  // --- Core Memory Calculation Logic (Modified) ---
  const { memoryRequirementsBytes, memoryRequirementsGB, parameterDetails, derivedParams } = useMemo(() => {
    // Input Parameters
    const H = parameters.hiddenSize;
    const L = parameters.numLayers;
    const V = parameters.vocabSize;
    const S = parameters.sequenceLength;
    const B_global_target = parameters.batchSize; // Target Global Batch Size
    const B_micro = parameters.microBatchSizePerGPU; // Micro Batch Size per GPU (NOW AN INPUT)
    const N_gpus = numGpus > 0 ? numGpus : 1;

    // Calculate required gradient accumulation steps
    const effective_batch_per_step = B_micro * N_gpus;
    const gradientAccumulationSteps = effective_batch_per_step > 0
        ? Math.ceil(B_global_target / effective_batch_per_step)
        : 1; // Avoid division by zero, default to 1

    // Precision details (same as before)
    const quantInfo = selectedQuantization;
    const bytesPerParamModel = quantInfo.bitsPerParameter / 8;
    const computePrecisionBits = (quantInfo.bitsPerParameter <= 16 && quantInfo.name !== 'INT8') ? 16 : 32;
    const bytesPerParamCompute = computePrecisionBits / 8;
    const bytesPerParamOptimizer = 32 / 8;

    // --- 1. Calculate Total Base Parameters (Raw Count) --- (Same as before)
    let P_total_raw = 0;
    let P_embedding = V * H;
    let P_output_proj = V * H;
    const MLP_FACTOR = 4;
    const MLP_intermediate = MLP_FACTOR * H;
    if (modelType === "decoder") { const P_attn_layer = 4 * H * H; const P_mlp_layer = 2 * H * MLP_intermediate; const P_norm_layer = 2 * (2 * H); const P_layer = P_attn_layer + P_mlp_layer + P_norm_layer; const P_final_norm = 2 * H; P_total_raw = P_embedding + (L * P_layer) + P_final_norm + P_output_proj; }
    else if (modelType === "encoder") { const P_pos_embed = S * H; const P_type_embed = 2 * H; const P_embed_norm = 2 * H; const P_embeddings_total = P_embedding + P_pos_embed + P_type_embed + P_embed_norm; const P_attn_layer = 4 * H * H; const P_mlp_layer = 2 * H * MLP_intermediate; const P_norm_layer = 2 * (2 * H); const P_layer = P_attn_layer + P_mlp_layer + P_norm_layer; const P_pooler = H * H + H; P_total_raw = P_embeddings_total + (L * P_layer) + P_pooler; }
    else if (modelType === "encoder-decoder") { const P_enc_attn = 4 * H * H; const P_enc_mlp = 2 * H * MLP_intermediate; const P_enc_norm = 2 * (2 * H); const P_enc_layer = P_enc_attn + P_enc_mlp + P_enc_norm; const P_dec_self_attn = 4 * H * H; const P_dec_cross_attn = 4 * H * H; const P_dec_mlp = 2 * H * MLP_intermediate; const P_dec_norm = 3 * (2 * H); const P_dec_layer = P_dec_self_attn + P_dec_cross_attn + P_dec_mlp + P_dec_norm; const P_final_norm = 2 * H; P_total_raw = P_embedding + (L * P_enc_layer) + (L * P_dec_layer) + P_final_norm + P_output_proj; }

    // --- Adjust for MoE --- (Same as before)
    let P_trainable_raw = P_total_raw; let P_active_raw = P_total_raw; let isMoE = false;
    if (memoryFlags.moe && memoryFlags.moe.experts > 1 && (modelType === "decoder" || modelType === "encoder-decoder")) { isMoE = true; const experts = memoryFlags.moe.experts; const topK = memoryFlags.moe.topK; const P_dense_mlp_layer = 2 * H * MLP_intermediate; const P_router_layer = H * experts; const P_experts_total_layer = experts * P_dense_mlp_layer; const P_moe_mlp_layer = P_router_layer + P_experts_total_layer; P_total_raw = P_total_raw - (L * P_dense_mlp_layer) + (L * P_moe_mlp_layer); P_trainable_raw = P_total_raw; const P_non_mlp_base = P_total_raw - (L * P_moe_mlp_layer); const P_active_experts_layer = topK * P_dense_mlp_layer; P_active_raw = P_non_mlp_base + L * (P_router_layer + P_active_experts_layer); }

    // --- Adjust for LoRA --- (Same as before)
    let P_lora_raw = 0; let isLora = false;
    if (memoryFlags.lora && memoryFlags.lora.rank > 0) { isLora = true; const R = memoryFlags.lora.rank; const lora_matrices_per_layer = 2 * (H * R + R * H); P_lora_raw = L * lora_matrices_per_layer; P_trainable_raw = P_lora_raw; }

    // --- 2. Calculate Memory Components (Bytes per GPU) --- (Mostly same, uses B_micro directly)

    // a) Model Weights Memory (Same as before)
    let modelWeightsBytes = P_total_raw * bytesPerParamModel; if (isLora) { modelWeightsBytes += P_lora_raw * (16 / 8); } if (memoryFlags.zeroStage === 3) { modelWeightsBytes /= N_gpus; }
    // b) Optimizer States Memory (Same as before)
    const OPTIMIZER_STATES_MULTIPLIER = 2; let optimizerStateBytes = P_trainable_raw * bytesPerParamOptimizer * OPTIMIZER_STATES_MULTIPLIER; if (memoryFlags.zeroStage >= 1) { optimizerStateBytes /= N_gpus; }
    // c) Gradient Memory (Same as before)
    let gradientMemoryBytes = P_trainable_raw * bytesPerParamCompute; if (memoryFlags.zeroStage >= 2) { gradientMemoryBytes /= N_gpus; }

    // d) Activation Memory (Uses B_micro directly)
    const ACTIVATION_HEURISTIC_FACTOR = 28; // Keep heuristic factor
    let activationMemoryBytes = B_micro * S * H * L * bytesPerParamCompute * ACTIVATION_HEURISTIC_FACTOR;
    activationMemoryBytes += B_micro * S * H * bytesPerParamCompute; // Add embedding activations
    if (memoryFlags.flashAttention && S > 1024) { activationMemoryBytes *= 0.7; } // Flash Attn factor
    if (memoryFlags.gradientCheckpointFactor < 1.0) { activationMemoryBytes *= memoryFlags.gradientCheckpointFactor; } // Grad Checkpoint factor
    if (isMoE) { activationMemoryBytes *= 1.1; } // MoE factor

    // e) Temporary Buffers & Fragmentation (Same as before)
    const FRAGMENTATION_FACTOR = 0.10; let tempMemoryBytes = (modelWeightsBytes + optimizerStateBytes + gradientMemoryBytes + activationMemoryBytes) * FRAGMENTATION_FACTOR;

    // f) CPU Offload (Same as before)
    let cpuSwapBytes = 0; if (memoryFlags.zeroStage >= 1 && memoryFlags.cpuOffloadPct > 0) { const offloadFraction = memoryFlags.cpuOffloadPct / 100; let bytesToOffload = 0; if (memoryFlags.zeroStage >= 1) bytesToOffload += optimizerStateBytes; if (memoryFlags.zeroStage >= 2) bytesToOffload += gradientMemoryBytes; cpuSwapBytes = bytesToOffload * offloadFraction; if (memoryFlags.zeroStage >= 1) optimizerStateBytes *= (1 - offloadFraction); if (memoryFlags.zeroStage >= 2) gradientMemoryBytes *= (1 - offloadFraction); }

    // --- 3. Calculate Totals per GPU --- (Same as before)
    const totalTrainingBytesPerGPU = modelWeightsBytes + activationMemoryBytes + optimizerStateBytes + gradientMemoryBytes + tempMemoryBytes;
    const INFERENCE_ACTIVATION_FACTOR = 0.5; const inferenceActivationBytes = activationMemoryBytes * INFERENCE_ACTIVATION_FACTOR; const inferenceTempBytes = tempMemoryBytes * INFERENCE_ACTIVATION_FACTOR; let inferenceModelWeightsBytes = P_total_raw * bytesPerParamModel; if (isLora) { inferenceModelWeightsBytes += P_lora_raw * (16 / 8); } const totalInferenceBytesPerGPU = inferenceModelWeightsBytes + inferenceActivationBytes + inferenceTempBytes;

    // --- 4. Package Results ---
    const bytesResult = { modelWeightsBytes, activationMemoryBytes, optimizerStateBytes, gradientMemoryBytes, tempMemoryBytes, totalTrainingBytesPerGPU, totalInferenceBytesPerGPU, cpuSwapBytes };
    const gbResult = { modelWeightsGB: bytesToGigabytes(bytesResult.modelWeightsBytes), activationMemoryGB: bytesToGigabytes(bytesResult.activationMemoryBytes), optimizerStateGB: bytesToGigabytes(bytesResult.optimizerStateBytes), gradientMemoryGB: bytesToGigabytes(bytesResult.gradientMemoryBytes), tempMemoryGB: bytesToGigabytes(bytesResult.tempMemoryBytes), totalTrainingGB: bytesToGigabytes(bytesResult.totalTrainingBytesPerGPU), totalInferenceGB: bytesToGigabytes(bytesResult.totalInferenceBytesPerGPU), cpuSwapGB: bytesToGigabytes(bytesResult.cpuSwapBytes) };
    const paramsResult = { totalParamsRaw: P_total_raw, trainableParamsRaw: P_trainable_raw, activeParamsRaw: P_active_raw, loraParamsRaw: P_lora_raw, isMoE, isLora };
    const derivedResult = { gradientAccumulationSteps }; // Add derived params here

    return { memoryRequirementsBytes: bytesResult, memoryRequirementsGB: gbResult, parameterDetails: paramsResult, derivedParams: derivedResult };

  }, [parameters, modelType, selectedQuantization, memoryFlags, numGpus]); // Dependencies updated for parameters.microBatchSizePerGPU

  // Calculate Cost & Energy (Uses parameters.batchSize as target global batch)
  const costEnergyResults = useMemo(() => {
    if (!selectedHardware || costParams.tokensPerSecondPerGPU <= 0 || numGpus <= 0 || costParams.trainingSteps <= 0) return null;
    const S = parameters.sequenceLength;
    const B_global_target = parameters.batchSize; // Use target global batch size for total tokens
    const steps = costParams.trainingSteps;
    const tokenPerSecPerGPU = costParams.tokensPerSecondPerGPU;
    const nGPUs = numGpus;
    const totalTokens = steps * B_global_target * S;
    const totalTokenPerSec = tokenPerSecPerGPU * nGPUs;
    const totalSeconds = totalTokenPerSec > 0 ? totalTokens / totalTokenPerSec : 0;
    const totalHours = totalSeconds / 3600;
    const totalPowerKW = (selectedHardware.powerW * nGPUs) / 1000;
    const energyKWh = totalHours * totalPowerKW;
    const co2kg = energyKWh * costParams.gridCarbonIntensity;
    const matchingInstance = cloudInstanceProfiles.find(inst => inst.gpuType === selectedHardware.id && inst.gpuCount === nGPUs);
    let hourlyRate = 0; let costSource = "N/A (No Pricing Data)";
    if (matchingInstance) { hourlyRate = matchingInstance.hourlyUSD; costSource = `${matchingInstance.name} (${matchingInstance.dataSource || 'Cloud Provider'})`; }
    else if (selectedHardware.hourlyUSD && nGPUs > 0) { hourlyRate = selectedHardware.hourlyUSD * nGPUs; costSource = `${nGPUs}x ${selectedHardware.name} (GPU Estimate)`; }
    else { const similarInstance = cloudInstanceProfiles.find(inst => inst.gpuType === selectedHardware.id); if (similarInstance) { hourlyRate = (similarInstance.hourlyUSD / similarInstance.gpuCount) * nGPUs; costSource = `${nGPUs}x ${selectedHardware.name} (Scaled from ${similarInstance.name})`; } }
    const totalCostUSD = totalHours * hourlyRate;
    return { gpuHours: totalHours * nGPUs, wallHours: totalHours, energyKWh, co2kg, totalCostUSD, costBasis: hourlyRate > 0 ? `$${hourlyRate.toFixed(3)}/hr (${costSource})` : costSource };
  }, [parameters.sequenceLength, parameters.batchSize, costParams, selectedHardware, numGpus]); // Depends on target global batch size

  // Calculate Disk Sizes
  const diskSizeEstimates = useMemo(() => {
      const P_total = parameterDetails.totalParamsRaw;
      const P_trainable = parameterDetails.trainableParamsRaw;
      const bitsPerParam = selectedQuantization.bitsPerParameter;
      const bytesPerParam = bitsPerParam / 8;
      const bytesPerParamOpt = 32 / 8; // Optimizer states usually FP32
      const optMultiplier = 2; // Adam m,v

      // Model weights file size (.safetensors/.pt)
      const modelFileSize = P_total * bytesPerParam;

      // Optimizer state size (only for trainable params)
      const optimizerStateSize = P_trainable * bytesPerParamOpt * optMultiplier;

      // Full Checkpoint Size (Simplified: Model Weights + Optimizer States)
      // Real checkpoints might include gradients, RNG state, framework overhead etc.
      // Assume base model weights + LoRA weights (if active) + optimizer states for trainable weights
      let fullCheckpointSize = (P_total * bytesPerParam) + optimizerStateSize;
      if (parameterDetails.isLora) {
          // If LoRA, checkpoint often saves *only* LoRA weights + optimizer states for LoRA
          // Or sometimes base + LoRA + optimizer states for LoRA. Let's assume the latter for a larger estimate.
          fullCheckpointSize = (P_total * bytesPerParam) + (parameterDetails.loraParamsRaw * (16/8)) + optimizerStateSize; // Base(quant) + LoRA(fp16) + Opt(fp32 for LoRA)
          // More accurate LoRA-only checkpoint: (parameterDetails.loraParamsRaw * (16/8)) + optimizerStateSize
      }


      return {
          modelFileSizeGB: bytesToGigabytes(modelFileSize),
          optimizerStateSizeGB: bytesToGigabytes(optimizerStateSize),
          fullCheckpointSizeGB: bytesToGigabytes(fullCheckpointSize),
      };
  }, [parameterDetails, selectedQuantization]);


  // --- UI Handlers ---

  const handleParameterChange = useCallback((param: keyof ModelParameters, value: number | string) => {
    const isMicroBatch = param === 'microBatchSizePerGPU';
    const def = isMicroBatch ? microBatchSizeDef : parametersList[param as keyof Omit<ModelParameters, 'microBatchSizePerGPU'>];
    let numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) numValue = def.min;
    numValue = Math.max(def.min, Math.min(def.max, numValue));
    // Ensure micro batch is not larger than global batch
    if (isMicroBatch && numValue > parameters.batchSize) {
        numValue = parameters.batchSize;
        toast.warning("Micro batch size cannot exceed global batch size.");
    }
     if (param === 'batchSize' && numValue < parameters.microBatchSizePerGPU) {
         numValue = parameters.microBatchSizePerGPU;
         toast.warning("Global batch size cannot be smaller than micro batch size.");
     }

    setParameters(prev => ({ ...prev, [param]: numValue }));
  }, [parametersList, parameters.batchSize, parameters.microBatchSizePerGPU]); // Added dependencies

   const handleFlagChange = useCallback((flag: keyof MemoryFlags, value: any) => {
       if (flag === 'moe' && value === true) value = { experts: 8, topK: 2 };
       else if (flag === 'moe' && value === false) value = undefined;
       else if (flag === 'lora' && value === true) value = { rank: 8 };
       else if (flag === 'lora' && value === false) value = undefined;
       else if (flag === 'zeroStage') value = parseInt(String(value)) || 0;
       else if (flag === 'gradientCheckpointFactor') value = parseFloat(String(value)) || 1.0;
       setMemoryFlags(prev => ({ ...prev, [flag]: value }));
       if (flag === 'zeroStage' && value === 0) setMemoryFlags(prev => ({ ...prev, cpuOffloadPct: 0 }));
   }, []);

   const handleCostParamChange = useCallback((param: keyof CostEnergyParams, value: string) => {
       let numValue = parseFloat(value);
       if (isNaN(numValue) || numValue < 0) numValue = 0;
       if (param === 'trainingSteps' && numValue < 1 && value !== '') numValue = 1;
       setCostParams(prev => ({ ...prev, [param]: numValue }));
   }, []);

   const handleApplyPreset = useCallback((preset: ModelPreset) => {
       setModelType(preset.modelType);
       setParameters(prev => ({
            // Start with current state to preserve any missing keys
            ...prev,
            // Apply preset params, ensuring microBatch isn't larger than global
            ...preset.params,
            microBatchSizePerGPU: Math.min(
                preset.params.microBatchSizePerGPU ?? prev.microBatchSizePerGPU,
                preset.params.batchSize ?? prev.batchSize
            ),
            batchSize: Math.max(
                 preset.params.batchSize ?? prev.batchSize,
                 preset.params.microBatchSizePerGPU ?? prev.microBatchSizePerGPU
            ),
       }));
       if (preset.precision) setPrecision(preset.precision);
       setMemoryFlags({
           flashAttention: true, gradientCheckpointFactor: 1.0, zeroStage: 0, cpuOffloadPct: 0,
           moe: undefined, lora: undefined, ...preset.flags
       });
       toast.success(`Preset "${preset.name}" loaded.`);
   }, []);

   // Handler for copying the permalink
   const handleCopyLink = useCallback(() => {
        const encodedState = serializeState();
        const url = `${window.location.origin}${window.location.pathname}#${encodedState}`;
        navigator.clipboard.writeText(url)
            .then(() => {
                toast.success("Link copied to clipboard!");
            })
            .catch(err => {
                console.error("Failed to copy link: ", err);
                toast.error("Failed to copy link.");
            });
    }, [serializeState]);


   // --- Chart Data Preparation --- (Same as before)
    const trainingMemoryBreakdownData = useMemo(() => [
        { name: "Model Weights", value: memoryRequirementsGB.modelWeightsGB },
        { name: "Activations", value: memoryRequirementsGB.activationMemoryGB },
        { name: "Optimizer States", value: memoryRequirementsGB.optimizerStateGB },
        { name: "Gradients", value: memoryRequirementsGB.gradientMemoryGB },
        { name: "Temp/Overhead", value: memoryRequirementsGB.tempMemoryGB },
    ].filter(item => item && item.value > 0.001), [memoryRequirementsGB]);

    const inferenceMemoryBreakdownData = useMemo(() => [
        { name: "Model Weights", value: bytesToGigabytes(parameterDetails.totalParamsRaw * (selectedQuantization.bitsPerParameter / 8) + (parameterDetails.isLora ? parameterDetails.loraParamsRaw * (16/8) : 0)) },
        { name: "Activations", value: bytesToGigabytes(memoryRequirementsBytes.activationMemoryBytes * 0.5) },
        { name: "Temp/Overhead", value: bytesToGigabytes(memoryRequirementsBytes.tempMemoryBytes * 0.5) },
    ].filter(item => item && item.value > 0.001), [memoryRequirementsBytes, parameterDetails, selectedQuantization]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19AF', '#DB2777'];
    const vramUsagePercent = selectedHardware ? (memoryRequirementsGB.totalTrainingGB / selectedHardware.vramGB) * 100 : 0;
    const getVramBarColor = (usage: number): string => {
        if (!selectedHardware || selectedHardware.vramGB === 0) return 'bg-gray-400';
        if (usage > 100) return 'bg-red-600'; if (usage > 90) return 'bg-red-500';
        if (usage > 70) return 'bg-amber-500'; if (usage > 0) return 'bg-green-500';
        return 'bg-secondary';
    };

  // --- Render Component ---
  return (
    <TooltipProvider delayDuration={300}>
    <div className="container mx-auto p-4 lg:p-6 space-y-6">
      <Card className="overflow-visible">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold tracking-tight">Enhanced LLM Memory & Capacity Planner</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Estimate VRAM, training time, cost, and environmental impact with advanced optimizations.
          </CardDescription>
            <div className="flex flex-wrap gap-2 justify-center pt-4">
                <Label className="pt-1.5 font-semibold mr-2 text-sm">Load Preset:</Label>
                {modelPresets.map(p => ( <Button key={p.name} variant="outline" size="sm" onClick={() => handleApplyPreset(p)} className="text-xs h-7">{p.name}</Button> ))}
            </div>
            <div className="flex justify-center pt-3">
                <Button variant="ghost" size="sm" onClick={handleCopyLink} className="text-xs h-7 text-blue-600 hover:text-blue-800">
                    <LinkIcon className="w-3 h-3 mr-1.5"/> Copy Sharable Link
                </Button>
            </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

            {/* === Left Column: Configuration === */}
            <div className="space-y-5">
               {/* --- Model Architecture & Basic Params --- */}
               <Card>
                 <CardHeader className="pb-4"><CardTitle className="text-lg">1. Model Configuration</CardTitle></CardHeader>
                 <CardContent className="space-y-4">
                     <div> <Label htmlFor="modelType">Architecture Type</Label> <Select value={modelType} onValueChange={setModelType}><SelectTrigger id="modelType"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="decoder">Decoder-only (GPT-style)</SelectItem><SelectItem value="encoder">Encoder-only (BERT-style)</SelectItem><SelectItem value="encoder-decoder">Encoder-Decoder (T5-style)</SelectItem></SelectContent></Select> </div>
                     {/* Base Parameters */}
                     {Object.entries(parametersList).map(([key, param]) => ( <div key={key}> <div className="flex justify-between items-center mb-1"> <Label htmlFor={key} className="text-sm font-medium flex items-center">{param.name} {param.unit && `(${param.unit})`} {param.tooltip && (<ShadTooltip><TooltipTrigger asChild><InfoIcon className="w-3 h-3 ml-1.5 text-muted-foreground cursor-help"/></TooltipTrigger><TooltipContent><p className="max-w-xs">{param.tooltip}</p></TooltipContent></ShadTooltip>)} </Label> <Input type="number" id={`${key}-input`} value={parameters[key as keyof Omit<ModelParameters, 'microBatchSizePerGPU'>]} onChange={(e) => handleParameterChange(key as keyof Omit<ModelParameters, 'microBatchSizePerGPU'>, e.target.value)} min={param.min} max={param.max} step={param.step} className="w-28 h-8 text-sm" aria-label={`${param.name} value`}/> </div> <Slider id={key} min={param.min} max={param.max} step={param.step} value={[parameters[key as keyof Omit<ModelParameters, 'microBatchSizePerGPU'>]]} onValueChange={(value) => handleParameterChange(key as keyof Omit<ModelParameters, 'microBatchSizePerGPU'>, value[0])} className="mt-1" aria-label={`${param.name} slider`}/> </div> ))}
                     {/* Micro Batch Size Input */}
                     <div> <div className="flex justify-between items-center mb-1"> <Label htmlFor="microBatchSizePerGPU" className="text-sm font-medium flex items-center">{microBatchSizeDef.name} {microBatchSizeDef.tooltip && (<ShadTooltip><TooltipTrigger asChild><InfoIcon className="w-3 h-3 ml-1.5 text-muted-foreground cursor-help"/></TooltipTrigger><TooltipContent><p className="max-w-xs">{microBatchSizeDef.tooltip}</p></TooltipContent></ShadTooltip>)} </Label> <Input type="number" id="microBatchSizePerGPU-input" value={parameters.microBatchSizePerGPU} onChange={(e) => handleParameterChange('microBatchSizePerGPU', e.target.value)} min={microBatchSizeDef.min} max={microBatchSizeDef.max} step={microBatchSizeDef.step} className="w-28 h-8 text-sm" aria-label={`${microBatchSizeDef.name} value`}/> </div> <Slider id="microBatchSizePerGPU" min={microBatchSizeDef.min} max={microBatchSizeDef.max} step={microBatchSizeDef.step} value={[parameters.microBatchSizePerGPU]} onValueChange={(value) => handleParameterChange('microBatchSizePerGPU', value[0])} className="mt-1" aria-label={`${microBatchSizeDef.name} slider`}/> </div>
                 </CardContent>
               </Card>

                {/* --- Precision & Quantization --- */}
               <Card>
                 <CardHeader className="pb-4"><CardTitle className="text-lg">2. Precision & Quantization</CardTitle></CardHeader>
                 <CardContent> <div> <Label htmlFor="precision">Compute & Storage Precision</Label> <ShadTooltip> <TooltipTrigger asChild> <Select value={precision} onValueChange={setPrecision}> <SelectTrigger id="precision"><SelectValue /></SelectTrigger> <SelectContent> {quantizationTypes.map(q => ( <SelectItem key={q.name} value={q.name.toLowerCase().split(' ')[0]}> {q.name} ({q.bitsPerParameter}-bit) </SelectItem> ))} </SelectContent> </Select> </TooltipTrigger> <TooltipContent side="right" className="max-w-sm"> <p>Select the numerical format for model weights and computation.</p> <p className="mt-1"><strong>{selectedQuantization.name}:</strong> {selectedQuantization.performanceImpact}</p> {selectedQuantization.reference && <p className="text-xs mt-1">Ref: {selectedQuantization.reference}</p>} </TooltipContent> </ShadTooltip> </div> </CardContent>
               </Card>

               {/* --- Advanced Memory Optimization Techniques --- */}
                <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-lg font-semibold px-6 py-4 hover:no-underline"> <span className="mr-auto">3. Advanced Optimizations (Optional)</span> </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 space-y-6">
                       {/* Flash Attention */} <div className="flex items-center justify-between space-x-2 border-b pb-4"> <Label htmlFor="flashAttention" className="flex flex-col space-y-1 pr-4"> <span>FlashAttention / SDPA</span> <span className="font-normal leading-snug text-muted-foreground text-sm"> Use memory-efficient attention kernel (reduces activation memory, esp. for long sequences). </span> </Label> <ShadTooltip> <TooltipTrigger asChild><Switch id="flashAttention" checked={memoryFlags.flashAttention} onCheckedChange={(c) => handleFlagChange('flashAttention', c)} /></TooltipTrigger> <TooltipContent><p>Applies ~30% activation memory reduction heuristic if SeqLen > 1024.</p></TooltipContent> </ShadTooltip> </div>
                       {/* Gradient Checkpointing */} <div className="border-b pb-4"> <div className="flex justify-between items-center mb-1"> <Label htmlFor="gradCheckpoint" className="flex flex-col space-y-1"> <span>Gradient Checkpointing</span> <span className="font-normal leading-snug text-muted-foreground text-sm"> Trade compute for memory by recomputing activations. Factor = % of activation memory retained. </span> </Label> <span className="text-sm font-medium whitespace-nowrap ml-2">{Math.round(memoryFlags.gradientCheckpointFactor * 100)}% Memory</span> </div> <Slider id="gradCheckpoint" min={0.3} max={1.0} step={0.05} value={[memoryFlags.gradientCheckpointFactor]} onValueChange={(v) => handleFlagChange('gradientCheckpointFactor', v[0])} aria-label="Gradient Checkpointing Factor"/> <span className="text-xs text-muted-foreground">100% = Off, Lower % = More Memory Saved (but more recompute)</span> </div>
                       {/* ZeRO Optimization */} <div className="border-b pb-4"> <Label className="mb-2 block font-medium">ZeRO Stage (DeepSpeed/FSDP)</Label> <ShadTooltip> <TooltipTrigger asChild> <RadioGroup value={String(memoryFlags.zeroStage)} onValueChange={(v) => handleFlagChange('zeroStage', v)} className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2"> {[0, 1, 2, 3].map(stage => ( <div key={stage} className="flex items-center space-x-2"> <RadioGroupItem value={String(stage)} id={`zero-${stage}`} /> <Label htmlFor={`zero-${stage}`} className="font-normal">Stage {stage}</Label> </div> ))} </RadioGroup> </TooltipTrigger> <TooltipContent side="bottom" className="max-w-md p-3"> <p className="font-semibold mb-1">ZeRO partitions model state across GPUs:</p> <ul className="list-disc list-inside text-xs space-y-1"> <li><b>Stage 0:</b> None (standard data parallelism).</li> <li><b>Stage 1:</b> Shards Optimizer States.</li> <li><b>Stage 2:</b> Shards Optimizer States & Gradients.</li> <li><b>Stage 3:</b> Shards Optimizer States, Gradients, & Model Parameters.</li> </ul> <p className="text-xs mt-2">Reduces memory per GPU but increases communication.</p> </TooltipContent> </ShadTooltip> {memoryFlags.zeroStage >= 1 && ( <div className="mt-4"> <div className="flex justify-between items-center mb-1"> <Label htmlFor="cpuOffload" className="flex flex-col space-y-1"> <span>ZeRO CPU Offload %</span> <span className="font-normal leading-snug text-muted-foreground text-sm"> Offload sharded optimizer/gradients (Stage {memoryFlags.zeroStage}) to CPU RAM. </span> </Label> <span className="text-sm font-medium whitespace-nowrap ml-2">{memoryFlags.cpuOffloadPct}%</span> </div> <Slider id="cpuOffload" min={0} max={100} step={5} value={[memoryFlags.cpuOffloadPct]} onValueChange={(v) => handleFlagChange('cpuOffloadPct', v[0])} disabled={memoryFlags.zeroStage === 0} aria-label="CPU Offload Percentage"/> <span className="text-xs text-muted-foreground">Requires sufficient CPU RAM. Slows down training due to PCIe transfers.</span> </div> )} </div>
                       {/* Mixture of Experts (MoE) */} <div className="border-b pb-4"> <div className="flex items-center justify-between mb-3"> <Label className="font-medium flex items-center">Mixture of Experts (MoE) <ShadTooltip> <TooltipTrigger asChild><InfoIcon className="w-3 h-3 ml-1.5 text-muted-foreground cursor-help"/></TooltipTrigger> <TooltipContent><p className="max-w-xs">Replaces dense MLP layers with sparse MoE layers. Increases total parameters but keeps active parameters/token low.</p></TooltipContent> </ShadTooltip> </Label> <Switch id="enableMoE" checked={!!memoryFlags.moe} onCheckedChange={(checked) => handleFlagChange('moe', checked)} aria-label="Enable Mixture of Experts"/> </div> {memoryFlags.moe && ( <div className="grid grid-cols-2 gap-4"> <div> <Label htmlFor="moeExperts" className="text-sm">Total Experts (E)</Label> <Input id="moeExperts" type="number" min="2" step="1" value={memoryFlags.moe.experts} onChange={(e) => handleFlagChange('moe', { ...memoryFlags.moe, experts: parseInt(e.target.value) || 2 })} className="h-8 text-sm"/> </div> <div> <Label htmlFor="moeTopK" className="text-sm">Activated Experts (K)</Label> <Input id="moeTopK" type="number" min="1" step="1" max={memoryFlags.moe.experts} value={memoryFlags.moe.topK} onChange={(e) => handleFlagChange('moe', { ...memoryFlags.moe, topK: Math.min(parseInt(e.target.value) || 1, memoryFlags.moe?.experts || 1) })} className="h-8 text-sm"/> </div> </div> )} </div>
                       {/* LoRA / QLoRA */} <div> <div className="flex items-center justify-between mb-3"> <Label className="font-medium flex items-center">LoRA (Low-Rank Adaptation) <ShadTooltip> <TooltipTrigger asChild><InfoIcon className="w-3 h-3 ml-1.5 text-muted-foreground cursor-help"/></TooltipTrigger> <TooltipContent><p className="max-w-xs">Parameter-Efficient Fine-Tuning (PEFT) method. Freezes base model, trains small adapter matrices. Drastically reduces trainable params & optimizer memory.</p></TooltipContent> </ShadTooltip> </Label> <Switch id="enableLora" checked={!!memoryFlags.lora} onCheckedChange={(checked) => handleFlagChange('lora', checked)} aria-label="Enable LoRA"/> </div> {memoryFlags.lora && ( <div className="mt-2"> <Label htmlFor="loraRank" className="text-sm">LoRA Rank (r)</Label> <ShadTooltip> <TooltipTrigger asChild> <Select value={String(memoryFlags.lora.rank)} onValueChange={(v) => handleFlagChange('lora', { ...memoryFlags.lora, rank: parseInt(v) || 4 })}> <SelectTrigger id="loraRank" className="h-8 text-sm"><SelectValue /></SelectTrigger> <SelectContent> {[4, 8, 16, 32, 64, 128, 256].map(r => <SelectItem key={r} value={String(r)}>{r}</SelectItem>)} </SelectContent> </Select> </TooltipTrigger> <TooltipContent> <p>LoRA rank 'r'. Higher rank means more trainable parameters (≈ 2*L*2*H*r) but potentially better adaptation. Common values: 4-64.</p> </TooltipContent> </ShadTooltip> </div> )} </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                 {/* --- Hardware & Cluster Setup --- */}
                <Card>
                   <CardHeader className="pb-4"><CardTitle className="text-lg">4. Hardware Configuration</CardTitle></CardHeader>
                   <CardContent className="space-y-4">
                       <div> <Label htmlFor="gpuType">Target GPU</Label> <Select value={selectedHardwareId} onValueChange={setSelectedHardwareId}> <SelectTrigger id="gpuType"><SelectValue /></SelectTrigger> <SelectContent> {gpuProfiles.map(g => ( <SelectItem key={g.id} value={g.id}> {g.name} ({g.vramGB} GB VRAM, {g.powerW}W TDP) </SelectItem> ))} </SelectContent> </Select> </div>
                       <div> <Label htmlFor="numGpus">Number of GPUs</Label> <Input id="numGpus" type="number" min="1" step="1" max="1024" value={numGpus} onChange={(e) => setNumGpus(parseInt(e.target.value) || 1)} className="h-8 text-sm"/> <p className="text-xs text-muted-foreground mt-1">Used for ZeRO sharding, calculating micro-batch size, and total cost/power.</p> </div>
                   </CardContent>
               </Card>
            </div> {/* End Left Column */}


            {/* === Right Column: Results === */}
            <div className="space-y-5">
              {/* --- Parameter & Batch Summary --- */}
               <Card>
                 <CardHeader className="pb-2"><CardTitle className="text-lg">Parameter & Batch Summary</CardTitle></CardHeader>
                 <CardContent className="grid grid-cols-2 gap-x-4 gap-y-3 text-center">
                      {/* Parameter Counts */}
                      <div> <Label className="text-xs text-muted-foreground block mb-0.5">Total Parameters</Label> <div className="text-xl font-bold"> {formatNumber(parameterDetails.totalParamsRaw, 2)} {parameterDetails.isMoE && <span className="text-xs font-normal text-emerald-600">(MoE)</span>} </div> <div className="text-xs text-muted-foreground">({(parameterDetails.totalParamsRaw / 1e9).toFixed(2)} B)</div> </div>
                      <div> <Label className="text-xs text-muted-foreground block mb-0.5">Trainable Parameters</Label> <div className="text-xl font-bold"> {formatNumber(parameterDetails.trainableParamsRaw, 2)} {parameterDetails.isLora && <span className="text-xs font-normal text-blue-600">(LoRA)</span>} </div> <div className="text-xs text-muted-foreground">({(parameterDetails.trainableParamsRaw / parameterDetails.totalParamsRaw * 100).toFixed(2)}% of total)</div> </div>
                      {parameterDetails.isMoE && ( <div className="col-span-2"> <Label className="text-xs text-muted-foreground block mb-0.5">Active Parameters / Token (MoE)</Label> <div className="text-lg font-semibold"> {formatNumber(parameterDetails.activeParamsRaw, 2)} </div> <div className="text-xs text-muted-foreground">({(parameterDetails.activeParamsRaw / parameterDetails.totalParamsRaw * 100).toFixed(2)}% of total)</div> </div> )}
                      {/* Gradient Accumulation */}
                      <div className="col-span-2 border-t pt-3 mt-1">
                          <Label className="text-xs text-muted-foreground block mb-0.5">Gradient Accumulation Steps</Label>
                          <div className="text-xl font-bold">{derivedParams.gradientAccumulationSteps}</div>
                          <p className="text-xs text-muted-foreground">Needed to reach Global Batch Size of {parameters.batchSize} with {parameters.microBatchSizePerGPU} micro-batch / GPU across {numGpus} GPU(s).</p>
                      </div>
                 </CardContent>
               </Card>

              {/* --- Memory Requirements --- */}
              <Card>
                  <CardHeader className="pb-4"><CardTitle className="text-lg">Estimated Memory Requirements</CardTitle></CardHeader>
                  <CardContent>
                     {/* VRAM Heat Bar */} <div className="mb-6"> <div className="flex justify-between items-center mb-1 text-sm"> <Label>Est. Training VRAM / GPU</Label> <span className={`font-bold ${vramUsagePercent > 100 ? 'text-red-600' : ''}`}> {memoryRequirementsGB.totalTrainingGB.toFixed(2)} GB {selectedHardware && ` / ${selectedHardware.vramGB} GB`} {selectedHardware && ` (${vramUsagePercent.toFixed(0)}%)`} </span> </div> <div className={`w-full h-3 ${getVramBarColor(0)} rounded-full overflow-hidden bg-opacity-50`}> <div className={`h-full ${getVramBarColor(vramUsagePercent)} transition-all duration-300 ease-out rounded-full`} style={{ width: `${Math.min(100, Math.max(0, vramUsagePercent))}%` }} /> </div> {memoryRequirementsGB.cpuSwapGB > 0 && ( <p className="text-xs text-muted-foreground mt-1 text-center"> (+ {memoryRequirementsGB.cpuSwapGB.toFixed(2)} GB offloaded to CPU RAM per GPU via ZeRO Offload) </p> )} {vramUsagePercent > 100 && ( <p className="text-xs text-red-600 font-semibold mt-1 text-center"> Warning: Estimated VRAM exceeds target GPU capacity! </p> )} {!selectedHardware && ( <p className="text-xs text-muted-foreground mt-1 text-center"> Select hardware to compare usage against VRAM limit. </p> )} </div>
                    <Tabs defaultValue="training">
                      <TabsList className="grid w-full grid-cols-2"> <TabsTrigger value="training">Training Breakdown</TabsTrigger> <TabsTrigger value="inference">Inference Estimate</TabsTrigger> </TabsList>
                      {/* Training Tab */} <TabsContent value="training" className="mt-4 space-y-4"> <div className="grid grid-cols-2 gap-3 text-center"> <div className="bg-secondary/50 p-2 rounded-lg"> <div className="text-xs text-muted-foreground">Total / GPU</div> <div className="text-lg font-bold">{memoryRequirementsGB.totalTrainingGB.toFixed(2)} GB</div> </div> <div className="bg-secondary/50 p-2 rounded-lg"> <div className="text-xs text-muted-foreground">Model Weights / GPU</div> <div className="text-lg font-bold"> {memoryRequirementsGB.modelWeightsGB.toFixed(2)} GB </div> <div className="text-[10px] text-muted-foreground leading-tight"> {memoryFlags.zeroStage === 3 ? "(ZeRO-3 Sharded)" : (parameterDetails.isLora ? "(Base + LoRA)" : "")} </div> </div> </div> <div className="h-60 w-full"> <ResponsiveContainer width="100%" height="100%"> <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}> <Pie data={trainingMemoryBreakdownData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="80%" innerRadius="35%" fill="#8884d8" labelLine={false} label={({ cx, cy, midAngle, outerRadius, percent, index, name, value }) => { const RADIAN = Math.PI / 180; const radius = outerRadius * 1.1; const x = cx + radius * Math.cos(-midAngle * RADIAN); const y = cy + radius * Math.sin(-midAngle * RADIAN); return ( percent > 0.03 ? <text x={x} y={y} fill={COLORS[index % COLORS.length]} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10" fontWeight="medium"> {`${name}: ${value.toFixed(1)}GB`} </text> : null ); }} > {trainingMemoryBreakdownData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]}/> ))} </Pie> <RechartsTooltip formatter={(value: number, name: string, props) => [`${value.toFixed(2)} GB (${(props.payload.percent * 100).toFixed(1)}%)`, name]} contentStyle={{background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(2px)', border: 'none', borderRadius: '4px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '8px'}} /> </PieChart> </ResponsiveContainer> </div> </TabsContent>
                       {/* Inference Tab */} <TabsContent value="inference" className="mt-4 space-y-4"> <div className="grid grid-cols-1 gap-4 text-center"> <div className="bg-secondary/50 p-3 rounded-lg"> <div className="text-sm text-muted-foreground">Est. Inference Memory / GPU ({selectedQuantization.name})</div> <div className="text-xl font-bold">{memoryRequirementsGB.totalInferenceGB.toFixed(2)} GB</div> <p className="text-xs text-muted-foreground">(Excl. Optimizer/Gradients; Activations ~50% of training)</p> </div> </div> <div className="h-60 w-full"> <ResponsiveContainer width="100%" height="100%"> <BarChart data={inferenceMemoryBreakdownData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}> <CartesianGrid strokeDasharray="3 3" horizontal={false}/> <XAxis type="number" unit=" GB" fontSize={10} /> <YAxis type="category" dataKey="name" width={80} fontSize={10}/> <RechartsTooltip formatter={(value: number) => `${value.toFixed(2)} GB`} /> <Bar dataKey="value" name="Memory (GB)" barSize={20}> {inferenceMemoryBreakdownData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> ))} </Bar> </BarChart> </ResponsiveContainer> </div> </TabsContent>
                    </Tabs>
                  </CardContent>
              </Card>

              {/* --- Disk Size Estimates --- */}
              <Card>
                  <CardHeader className="pb-4"><CardTitle className="text-lg">Estimated Disk Sizes</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                       <div className="bg-secondary/30 p-2 rounded">
                            <Label className="text-xs text-muted-foreground block mb-0.5 flex items-center justify-center">Model Weights
                               <ShadTooltip> <TooltipTrigger asChild><InfoIcon className="w-3 h-3 ml-1 text-muted-foreground cursor-help"/></TooltipTrigger> <TooltipContent><p>.safetensors / .pt file size (Total Params * Bytes/Param)</p></TooltipContent> </ShadTooltip>
                            </Label>
                            <div className="text-md font-semibold">{diskSizeEstimates.modelFileSizeGB.toFixed(2)} GB</div>
                       </div>
                       <div className="bg-secondary/30 p-2 rounded">
                            <Label className="text-xs text-muted-foreground block mb-0.5 flex items-center justify-center">Optimizer State
                                <ShadTooltip> <TooltipTrigger asChild><InfoIcon className="w-3 h-3 ml-1 text-muted-foreground cursor-help"/></TooltipTrigger> <TooltipContent><p>Size of Adam m/v states (Trainable Params * 8 Bytes)</p></TooltipContent> </ShadTooltip>
                            </Label>
                            <div className="text-md font-semibold">{diskSizeEstimates.optimizerStateSizeGB.toFixed(2)} GB</div>
                       </div>
                       <div className="bg-secondary/30 p-2 rounded">
                            <Label className="text-xs text-muted-foreground block mb-0.5 flex items-center justify-center">Full Checkpoint
                                <ShadTooltip> <TooltipTrigger asChild><InfoIcon className="w-3 h-3 ml-1 text-muted-foreground cursor-help"/></TooltipTrigger> <TooltipContent><p>Approx. size (Model + Optimizer). Actual size varies.</p></TooltipContent> </ShadTooltip>
                            </Label>
                            <div className="text-md font-semibold">{diskSizeEstimates.fullCheckpointSizeGB.toFixed(2)} GB</div>
                       </div>
                  </CardContent>
              </Card>


               {/* --- Cost, Energy & Carbon --- */}
                <Card>
                    <CardHeader className="pb-4"> <CardTitle className="text-lg">Estimated Training Cost & Impact</CardTitle> <CardDescription className="text-sm">Based on hardware selection and training parameters.</CardDescription> </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"> <div> <Label htmlFor="trainingSteps" className="text-sm">Training Steps</Label> <Input id="trainingSteps" type="number" value={costParams.trainingSteps} onChange={e => handleCostParamChange('trainingSteps', e.target.value)} min="1" step="1000" className="h-8 text-sm"/> </div> <div> <Label htmlFor="tokensPerSec" className="text-sm flex items-center">Tokens/Sec/GPU <ShadTooltip> <TooltipTrigger asChild><InfoIcon className="w-3 h-3 ml-1.5 text-muted-foreground cursor-help"/></TooltipTrigger> <TooltipContent><p className="max-w-xs">Highly variable! Depends on model, hardware, precision, batch size, sequence length, software efficiency. Use measured values if possible.</p></TooltipContent> </ShadTooltip> </Label> <Input id="tokensPerSec" type="number" value={costParams.tokensPerSecondPerGPU} onChange={e => handleCostParamChange('tokensPerSecondPerGPU', e.target.value)} min="1" step="100" className="h-8 text-sm"/> </div> <div> <Label htmlFor="gridIntensity" className="text-sm flex items-center">Grid Carbon Intensity <ShadTooltip> <TooltipTrigger asChild><InfoIcon className="w-3 h-3 ml-1.5 text-muted-foreground cursor-help"/></TooltipTrigger> <TooltipContent side="top" className="max-w-xs p-2"> <p>Avg CO₂ emissions per kWh (kgCO₂/kWh). Varies by region/source.</p> <p className="text-xs mt-1">Default: {DEFAULT_GRID_INTENSITY} (US Avg)</p> <p className="text-xs">Examples: FR ~0.05, DE ~0.4, CN ~0.6, IS ~0.01</p> </TooltipContent> </ShadTooltip> </Label> <Input id="gridIntensity" type="number" value={costParams.gridCarbonIntensity} onChange={e => handleCostParamChange('gridCarbonIntensity', e.target.value)} min="0" step="0.01" className="h-8 text-sm"/> </div> </div>
                        {costEnergyResults && selectedHardware ? ( <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t text-center"> <div className="bg-secondary/30 p-2 rounded"> <Label className="text-xs text-muted-foreground block mb-0.5">Wall Time</Label> <div className="text-md font-semibold">{costEnergyResults.wallHours.toFixed(1)} hrs</div> <div className="text-[10px] text-muted-foreground">({formatNumber(costEnergyResults.gpuHours, 1)} GPU hrs)</div> </div> <div className="bg-secondary/30 p-2 rounded"> <Label className="text-xs text-muted-foreground block mb-0.5">Energy Use</Label> <div className="text-md font-semibold">{formatNumber(costEnergyResults.energyKWh, 1)} kWh</div> </div> <div className="bg-secondary/30 p-2 rounded"> <Label className="text-xs text-muted-foreground block mb-0.5">CO₂ Emissions</Label> <div className="text-md font-semibold">{costEnergyResults.co2kg.toFixed(2)} kg CO₂e</div> </div> <div className="bg-secondary/30 p-2 rounded"> <Label className="text-xs text-muted-foreground block mb-0.5">Cloud Cost</Label> <div className="text-md font-semibold">${formatNumber(costEnergyResults.totalCostUSD, 2)}</div> <div className="text-[10px] text-muted-foreground truncate px-1" title={costEnergyResults.costBasis}>{costEnergyResults.costBasis}</div> </div> </div> ) : ( <p className="text-center text-sm text-muted-foreground pt-4 border-t">Enter valid training parameters and select hardware to estimate cost and impact.</p> )}
                        <p className="text-xs text-muted-foreground pt-2">Cost and energy are rough estimates. Actual values depend heavily on workload, efficiency, cooling, specific instance pricing, and utilization.</p>
                    </CardContent>
                </Card>

                 {/* --- Quantization Impact Table --- */}
                 <Card>
                    <CardHeader className="pb-4"><CardTitle className="text-lg">Quantization Impact Overview</CardTitle></CardHeader>
                    <CardContent className="space-y-2"> <table className="w-full text-sm"> <thead> <tr className="border-b"> <th className="text-left py-1 px-1 font-semibold">Type</th> <th className="text-center py-1 px-1 font-semibold">Bits</th> <th className="text-center py-1 px-1 font-semibold">Mem. Factor</th> <th className="text-left py-1 px-1 font-semibold">Est. Perf. Impact</th> </tr> </thead> <tbody> {quantizationTypes.map((q) => ( <tr key={q.name} className={`border-b hover:bg-muted/50 ${q.name.toLowerCase().startsWith(precision.toLowerCase()) ? 'bg-secondary font-medium' : ''}`}> <td className="py-1.5 px-1">{q.name}</td> <td className="text-center py-1.5 px-1">{q.bitsPerParameter}</td> <td className="text-center py-1.5 px-1">{q.memoryMultiplier.toFixed(3)}x</td> <td className="py-1.5 px-1 text-xs">{q.performanceImpact}</td> </tr> ))} </tbody> </table> </CardContent>
                 </Card>

                 {/* --- Actions (Placeholders) --- */}
                 <Card>
                     <CardHeader className="pb-4"><CardTitle className="text-lg">Actions</CardTitle></CardHeader>
                     <CardContent className="flex flex-wrap gap-3">
                           <Button variant="outline" size="sm" disabled> <DownloadIcon className="mr-2 h-4 w-4" /> Export Summary (JSON) </Button>
                            <Button variant="outline" size="sm" disabled> <DownloadIcon className="mr-2 h-4 w-4" /> Save Charts (PNG) </Button>
                            <Button variant="outline" size="sm" disabled>Add Scenario for Comparison</Button>
                     </CardContent>
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
    {/* Add Sonner Toaster component at the root of your app or layout */}
    {/* <Toaster /> */}
    </TooltipProvider>
  );
};

export default MemoryCalculator;

// --- Required Dependencies ---
// npm install zod recharts lucide-react sonner
// Ensure Shadcn UI components are installed:
// npx shadcn-ui@latest add card label input select tabs slider switch accordion radio-group button tooltip chart toaster

// --- Notes on Implementation ---
// - Permalink: Uses Base64 encoding of JSON state in the URL hash (#). Loads on mount, updates on change (debounced). Assumes state isn't excessively large.
// - Grad Accum: Input for Micro Batch Size added. Calculation for required steps displayed.
// - Disk Size: Estimates added for model weights, optimizer state, and a simplified full checkpoint.
// - Tooltips: Added more InfoIcon tooltips for clarity.
// - Error Handling: Basic error handling for URL deserialization and clipboard copy.
// - Validation: Zod schema added for validating state loaded from URL.
// - Toast Notifications: Uses 'sonner' for feedback on link copying and loading state. Ensure <Toaster /> is included in your app's layout.
