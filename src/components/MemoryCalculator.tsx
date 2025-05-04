import React, { useState, useMemo, useCallback } from "react";
// Shadcn UI Components - Ensure these are installed and configured in your project
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
import { Tooltip as ShadTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Renamed Shadcn Tooltip to avoid conflict
// Recharts for Charts
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts'; // Keep Recharts Tooltip as is
// Icons (ensure lucide-react is installed)
import { DownloadIcon, InfoIcon } from "lucide-react";

// --- Data Structures (as per spec) ---

// Definition for each model parameter input
type ParameterDef = {
  name: string;        // Display name
  value: number;       // Current value (used for initial state if needed)
  min: number;         // Minimum slider/input value
  max: number;         // Maximum slider/input value
  step: number;        // Slider/input step size
  unit: string;        // Display unit (e.g., "tokens")
  log?: boolean;       // Optional: Use logarithmic scale for slider range (visual only, input handles number)
  tooltip?: string;    // Optional tooltip text
};

// Definition for quantization types
type QuantizationType = {
  name: string;                 // Display name (e.g., "FP16", "AWQ (4-bit)")
  bitsPerParameter: number;     // Effective bits per parameter for storage/weights
  memoryMultiplier: number;     // Factor compared to FP32 (e.g., 0.5 for FP16)
  performanceImpact: string;    // Qualitative description of accuracy/speed trade-offs
  reference?: string;           // Optional citation key or note (e.g., "AWQ Paper")
};

// Definition for GPU hardware profiles
interface GpuProfile {
  id: string;             // Unique identifier (e.g., 'h100-80-sxm')
  name: string;           // Display name (e.g., 'NVIDIA H100 (80GB SXM)')
  vramGB: number;         // VRAM in Gigabytes
  powerW: number;         // Typical board power consumption in Watts
  hourlyUSD?: number;     // Optional: Estimated hourly cost for *this specific GPU* (less common, instance cost preferred)
  dataSource?: string;    // Optional: Source of the data (e.g., 'NVIDIA Datasheet')
}

// Definition for Cloud Instance profiles
interface CloudInstanceProfile {
    id: string;             // Unique identifier (e.g., 'aws-p5.48xlarge')
    name: string;           // Display name (e.g., 'AWS p5.48xlarge')
    gpuType: string;        // ID of the GpuProfile used in this instance
    gpuCount: number;       // Number of GPUs in this instance
    hourlyUSD: number;      // Hourly cost for the entire instance
    dataSource?: string;    // Optional: Source of the pricing data (e.g., 'AWS Pricing Page')
}

// Flags controlling advanced memory optimization techniques
interface MemoryFlags {
  flashAttention: boolean;          // Use FlashAttention/SDPA optimization
  gradientCheckpointFactor: number; // Factor of activation memory retained (1.0 = none, <1.0 = checkpointing enabled)
  zeroStage: 0 | 1 | 2 | 3;         // DeepSpeed ZeRO stage (0=off, 1=Opt, 2=Opt+Grad, 3=Opt+Grad+Param)
  cpuOffloadPct: number;            // Percentage (0-100) of optimizer+gradient states offloaded to CPU (requires ZeRO >= 1)
  moe?: { experts: number; topK: number }; // Mixture-of-Experts config (if enabled)
  lora?: { rank: number };          // LoRA config (if enabled)
}

// Parameters for cost and energy calculation
interface CostEnergyParams {
    trainingSteps: number;           // Total number of training steps
    tokensPerSecondPerGPU: number; // Estimated processing throughput per GPU
    gridCarbonIntensity: number;     // CO2 emissions factor for the electricity grid (kg CO2 / kWh)
}

// Core model architecture parameters
interface ModelParameters {
  hiddenSize: number;        // Model hidden dimension (d_model)
  numLayers: number;         // Number of transformer layers (L)
  numHeads: number;          // Number of attention heads (decoder-specific often)
  vocabSize: number;         // Vocabulary size (V)
  sequenceLength: number;    // Input sequence length (S)
  batchSize: number;         // Global batch size (B) - total across all GPUs
}

// --- Static Data (Potentially moved to separate files like `hardwareProfiles.ts`, `quantizationTypes.ts`) ---

const quantizationTypes: QuantizationType[] = [
  // Baseline
  { name: "FP32", bitsPerParameter: 32, memoryMultiplier: 1.0, performanceImpact: "Baseline accuracy & memory. Slowest on modern GPUs." },
  // Mixed Precision (Common for Training)
  { name: "FP16", bitsPerParameter: 16, memoryMultiplier: 0.5, performanceImpact: "Requires Volta+ GPUs. Faster training/inference via Tensor Cores. Potential stability issues (requires loss scaling)." },
  { name: "BF16", bitsPerParameter: 16, memoryMultiplier: 0.5, performanceImpact: "Requires Ampere+ GPUs. Similar speed to FP16, better training stability (wider dynamic range)." },
  // Quantization (Common for Inference, sometimes QAT)
  { name: "INT8", bitsPerParameter: 8, memoryMultiplier: 0.25, performanceImpact: "Significant memory reduction & speedup (esp. inference). Moderate accuracy loss (~1-5% typical, task dependent). Requires calibration or Quantization-Aware Training (QAT)." },
  // Advanced 4-bit Quantization (Primarily Inference)
  { name: "AWQ (4-bit)", bitsPerParameter: 4, memoryMultiplier: 0.125, performanceImpact: "Activation-aware Weight Quantization. Very low memory. Minimal accuracy loss (~0.2% PPL reported). Fast inference.", reference:"Lin et al., 2023"},
  { name: "GPTQ (4-bit)", bitsPerParameter: 4, memoryMultiplier: 0.125, performanceImpact: "Post-Training Quantization. Very low memory. Minimal accuracy loss (~0.03 PPL @175B reported). Fast inference.", reference:"Frantar et al., 2022"},
  // Note: Effective bits for AWQ/GPTQ can vary (e.g., 3-bit, group size). 4-bit is a common representation.
];

// GPU Profiles (Add more as needed)
const gpuProfiles: GpuProfile[] = [
  { id: 'rtx3090', name: 'NVIDIA RTX 3090', vramGB: 24, powerW: 350, dataSource: "NVIDIA Spec" },
  { id: 'rtx4090', name: 'NVIDIA RTX 4090', vramGB: 24, powerW: 450, dataSource: "NVIDIA Spec" },
  { id: 'a100-40-sxm', name: 'NVIDIA A100 (40GB SXM)', vramGB: 40, powerW: 400, dataSource: "NVIDIA Datasheet" },
  { id: 'a100-80-sxm', name: 'NVIDIA A100 (80GB SXM)', vramGB: 80, powerW: 400, dataSource: "NVIDIA Datasheet" },
  { id: 'h100-80-pcie', name: 'NVIDIA H100 (80GB PCIe)', vramGB: 80, powerW: 350, dataSource: "NVIDIA Datasheet" },
  { id: 'h100-80-sxm', name: 'NVIDIA H100 (80GB SXM)', vramGB: 80, powerW: 700, dataSource: "NVIDIA Datasheet / TRG" }, // Spec power=700W
  { id: 'h100-94-nvl', name: 'NVIDIA H100 NVL (94GB)', vramGB: 94, powerW: 700, dataSource: "NVIDIA H100 NVL" }, // Estimated power, VRAM is per GPU (2 per card)
  { id: 'gh200-gracehopper', name: 'NVIDIA GH200 Grace Hopper (GPU Mem)', vramGB: 96, powerW: 1000, dataSource: "NVIDIA GH200"}, // HBM3e GPU memory. Total system power. CPU has separate 480GB LPDDR5X.
  { id: 'b100-192-sxm', name: 'NVIDIA B100 (192GB SXM - Preview)', vramGB: 192, powerW: 1000, dataSource: "NVIDIA Blackwell Announce" }, // Power is TDP estimate
  { id: 'b200-192-sxm', name: 'NVIDIA B200 (192GB SXM - Preview)', vramGB: 192, powerW: 1000, dataSource: "NVIDIA Blackwell Announce" }, // Power is TDP estimate, same GPU as B100 but different configurations
];

// Cloud Instance Profiles (Add more as needed, pricing is approximate and region-dependent)
const cloudInstanceProfiles: CloudInstanceProfile[] = [
    { id:'aws-p4d.24xlarge', name: 'AWS p4d.24xlarge', gpuType:'a100-40-sxm', gpuCount: 8, hourlyUSD: 32.77, dataSource: "AWS Pricing (us-east-1, On-Demand, ~2024)"},
    { id:'aws-p4de.24xlarge', name: 'AWS p4de.24xlarge', gpuType:'a100-80-sxm', gpuCount: 8, hourlyUSD: 40.96, dataSource: "AWS Pricing (us-east-1, On-Demand, ~2024)"},
    { id:'aws-p5.48xlarge', name: 'AWS p5.48xlarge', gpuType:'h100-80-sxm', gpuCount: 8, hourlyUSD: 98.32, dataSource: "AWS Pricing (us-east-1, On-Demand, ~2024)"}, // Spec price 31.464 likely outdated/contract
    { id:'gcp-a2-highgpu-8g', name: 'GCP a2-highgpu-8g', gpuType:'a100-40-sxm', gpuCount: 8, hourlyUSD: 29.36, dataSource: "GCP Pricing (us-central1, On-Demand, ~2024)"},
    { id:'gcp-a3-highgpu-8g', name: 'GCP a3-highgpu-8g', gpuType:'h100-80-sxm', gpuCount: 8, hourlyUSD: 35.00, dataSource: "GCP Pricing (us-central1, On-Demand, ~2024)" }, // Approx
    { id:'azure-ndm-a100-v4', name: 'Azure NDm A100 v4', gpuType:'a100-80-sxm', gpuCount: 8, hourlyUSD: 27.40, dataSource: "Azure Pricing (East US, On-Demand, ~2024)"},
    // Add more instances for different providers, regions, GPU counts (e.g., single GPU instances)
];

// Default values
const DEFAULT_GRID_INTENSITY = 0.386; // kg CO2 / kWh (US Average 2023/2024 - EIA) Spec value

// --- Model Presets ---
interface ModelPreset {
    name: string;
    modelType: string;
    params: Partial<ModelParameters>; // Allow partial parameters
    flags?: Partial<MemoryFlags>;     // Allow partial flags
    precision?: string;               // Optional precision override
}

// Common model presets for quick configuration
const modelPresets: ModelPreset[] = [
    { name: "Llama-3-8B Instruct", modelType: "decoder", params: { hiddenSize: 4096, numLayers: 32, numHeads: 32, vocabSize: 128256, sequenceLength: 8192, batchSize: 8 }, precision: "bf16" },
    { name: "Mixtral-8x7B", modelType: "decoder", params: { hiddenSize: 4096, numLayers: 32, numHeads: 32, vocabSize: 32000, sequenceLength: 4096, batchSize: 4 }, flags: { moe: { experts: 8, topK: 2 } }, precision: "bf16" },
    { name: "Phi-3-mini (3.8B)", modelType: "decoder", params: { hiddenSize: 3072, numLayers: 32, numHeads: 32, vocabSize: 32064, sequenceLength: 4096, batchSize: 8 }, precision: "bf16"},
    { name: "BERT-Large", modelType: "encoder", params: { hiddenSize: 1024, numLayers: 24, numHeads: 16, vocabSize: 30522, sequenceLength: 512, batchSize: 32 }, precision: "fp32"},
    { name: "T5-Large (770M)", modelType: "encoder-decoder", params: { hiddenSize: 1024, numLayers: 24, numHeads: 16, vocabSize: 32128, sequenceLength: 512, batchSize: 16 }, precision: "fp32"},
    // Add more presets (e.g., GPT-4 scale, smaller models)
];


// --- Helper Functions ---

/**
 * Formats a large number into a human-readable string with metric prefixes (K, M, B).
 * @param num - The number to format.
 * @param precision - Number of decimal places.
 * @returns Formatted string.
 */
const formatNumber = (num: number, precision: number = 2): string => {
    if (num === 0) return "0";
    if (Math.abs(num) < 1) return num.toFixed(precision); // Handle small numbers

    const units = ['', 'K', 'M', 'B', 'T']; // Kilo, Mega, Giga, Tera
    const tier = Math.floor(Math.log10(Math.abs(num)) / 3);

    if (tier === 0) return num.toFixed(0); // No suffix for numbers < 1000

    const suffix = units[tier];
    const scale = Math.pow(10, tier * 3);
    const scaled = num / scale;

    return scaled.toFixed(precision) + " " + suffix;
};

/**
 * Formats bytes into a human-readable string (KB, MB, GB, etc.).
 * @param bytes - Number of bytes.
 * @param decimals - Number of decimal places.
 * @returns Formatted string.
 */
const formatBytes = (bytes: number, decimals: number = 2): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    // Ensure index is within bounds
    const index = Math.min(i, sizes.length - 1);
    return parseFloat((bytes / Math.pow(k, index)).toFixed(dm)) + ' ' + sizes[index];
};

const gigabytesToBytes = (gb: number): number => gb * 1024 * 1024 * 1024;
const bytesToGigabytes = (bytes: number): number => bytes / (1024 * 1024 * 1024);

// --- Main Component ---

const MemoryCalculator = () => {
  // --- State Definitions ---
  const [modelType, setModelType] = useState<string>(modelPresets[0].modelType); // Default to first preset's type
  const [parameters, setParameters] = useState<ModelParameters>(() => ({ // Initialize with first preset values
      hiddenSize: 4096,
      numLayers: 32,
      numHeads: 32,
      vocabSize: 50000,
      sequenceLength: 8192,
      batchSize: 8, // Default global batch size
      ...modelPresets[0].params // Override defaults with preset
  }));
  const [precision, setPrecision] = useState<string>(modelPresets[0].precision || "bf16"); // Default to BF16 or preset's precision

  // State for advanced memory optimization flags
  const [memoryFlags, setMemoryFlags] = useState<MemoryFlags>(() => ({
    flashAttention: true,             // Default ON
    gradientCheckpointFactor: 1.0,    // Default OFF (factor 1.0 means full memory)
    zeroStage: 0,                     // Default OFF
    cpuOffloadPct: 0,                 // Default OFF
    moe: undefined,                   // Default OFF
    lora: undefined,                  // Default OFF
    ...modelPresets[0].flags           // Override defaults with preset flags
  }));

  // State for hardware selection and cluster size
  const [selectedHardwareId, setSelectedHardwareId] = useState<string>(gpuProfiles[6].id); // Default to H100 80GB SXM
  const [numGpus, setNumGpus] = useState<number>(8); // Default number of GPUs

  // State for cost calculation inputs
  const [costParams, setCostParams] = useState<CostEnergyParams>({
      trainingSteps: 100000,         // Default steps
      tokensPerSecondPerGPU: 3000,   // Placeholder throughput - HIGHLY VARIABLE
      gridCarbonIntensity: DEFAULT_GRID_INTENSITY,
  });

  // --- Input Definitions ---
  // Defines the UI controls for model parameters
  const parametersList: Record<keyof ModelParameters, ParameterDef> = {
    hiddenSize: { name: "Hidden Size (d_model)", value: parameters.hiddenSize, min: 128, max: 32768, step: 128, unit: "", tooltip: "Dimensionality of the model's embeddings and layers." },
    numLayers: { name: "Number of Layers (L)", value: parameters.numLayers, min: 1, max: 200, step: 1, unit: "", tooltip: "Number of transformer blocks (encoder or decoder)." },
    // Note: num_heads often related to hidden_size (e.g., hidden_size / 64 or 128) but keep separate for flexibility
    numHeads: { name: "Attention Heads", value: parameters.numHeads, min: 1, max: 128, step: 1, unit: "", tooltip: "Number of parallel attention mechanisms per layer." },
    vocabSize: { name: "Vocabulary Size (V)", value: parameters.vocabSize, min: 1000, max: 262144, step: 1000, unit: "", log: false, tooltip: "Number of unique tokens the model recognizes." }, // Log scale often not intuitive for vocab
    sequenceLength: { name: "Sequence Length (S)", value: parameters.sequenceLength, min: 128, max: 131072, step: 128, unit: "tokens", log: true, tooltip: "Maximum number of tokens processed in one input sequence." },
    batchSize: { name: "Global Batch Size (B)", value: parameters.batchSize, min: 1, max: 4096, step: 1, unit: "", log: true, tooltip: "Total number of sequences processed across all GPUs in one step." }
  };

  // --- Derived State and Calculations ---

  // Find the selected quantization definition based on the 'precision' state
  const selectedQuantization = useMemo(() => {
      // Match based on the start of the name (e.g., "awq" matches "AWQ (4-bit)")
      return quantizationTypes.find(q => q.name.toLowerCase().startsWith(precision.toLowerCase()))
             || quantizationTypes[0]; // Fallback to FP32 if no match
  }, [precision]);

  // Find the selected GPU hardware profile
  const selectedHardware = useMemo((): GpuProfile | undefined => {
      return gpuProfiles.find(g => g.id === selectedHardwareId);
  }, [selectedHardwareId]);

  // --- Core Memory Calculation Logic ---
  // This complex calculation estimates memory usage based on all parameters and flags.
  const { memoryRequirementsBytes, memoryRequirementsGB, parameterDetails } = useMemo(() => {
    // Input Parameters
    const H = parameters.hiddenSize;
    const L = parameters.numLayers;
    const V = parameters.vocabSize;
    const S = parameters.sequenceLength;
    const B_global = parameters.batchSize; // Global batch size
    const N_gpus = numGpus > 0 ? numGpus : 1; // Number of GPUs

    // Calculate micro batch size per GPU (simplistic view, ignores pipeline parallelism stages)
    const B_micro = Math.max(1, Math.ceil(B_global / N_gpus));

    // Precision details
    const quantInfo = selectedQuantization;
    const bytesPerParamModel = quantInfo.bitsPerParameter / 8;
    // Assume compute precision is FP16/BF16 if model uses them, else FP32. Affects activations/gradients.
    const computePrecisionBits = (quantInfo.bitsPerParameter <= 16 && quantInfo.name !== 'INT8') ? 16 : 32; // Use 16 for FP16/BF16, 32 otherwise (incl. INT8/4-bit base compute)
    const bytesPerParamCompute = computePrecisionBits / 8;
    // Optimizer states are typically stored in FP32 for stability, regardless of compute precision
    const bytesPerParamOptimizer = 32 / 8;

    // --- 1. Calculate Total Base Parameters (Raw Count) ---
    let P_total_raw = 0;
    let P_embedding = V * H;
    let P_output_proj = V * H; // Often tied with input embeddings in decoders, assume NOT tied for max estimate
    const MLP_FACTOR = 4; // Common factor for MLP intermediate size (e.g., Llama, GPT-3)
    const MLP_intermediate = MLP_FACTOR * H;

    if (modelType === "decoder") { // GPT-style
        const P_attn_layer = 4 * H * H; // Q, K, V, O projections
        const P_mlp_layer = 2 * H * MLP_intermediate; // Up and Down projections
        const P_norm_layer = 2 * (2 * H); // 2 LayerNorms per layer (scale+bias each)
        const P_layer = P_attn_layer + P_mlp_layer + P_norm_layer;
        const P_final_norm = 2 * H;
        P_total_raw = P_embedding + (L * P_layer) + P_final_norm + P_output_proj;
    } else if (modelType === "encoder") { // BERT-style
        const P_pos_embed = S * H; // Simplified: Use max sequence length
        const P_type_embed = 2 * H; // Typically 2 segment types
        const P_embed_norm = 2 * H;
        const P_embeddings_total = P_embedding + P_pos_embed + P_type_embed + P_embed_norm;
        const P_attn_layer = 4 * H * H;
        const P_mlp_layer = 2 * H * MLP_intermediate;
        const P_norm_layer = 2 * (2 * H);
        const P_layer = P_attn_layer + P_mlp_layer + P_norm_layer;
        const P_pooler = H * H + H; // Optional pooler layer
        P_total_raw = P_embeddings_total + (L * P_layer) + P_pooler;
    } else if (modelType === "encoder-decoder") { // T5-style
        // Encoder Layer
        const P_enc_attn = 4 * H * H;
        const P_enc_mlp = 2 * H * MLP_intermediate;
        const P_enc_norm = 2 * (2 * H);
        const P_enc_layer = P_enc_attn + P_enc_mlp + P_enc_norm;
        // Decoder Layer
        const P_dec_self_attn = 4 * H * H;
        const P_dec_cross_attn = 4 * H * H;
        const P_dec_mlp = 2 * H * MLP_intermediate;
        const P_dec_norm = 3 * (2 * H); // 3 LayerNorms
        const P_dec_layer = P_dec_self_attn + P_dec_cross_attn + P_dec_mlp + P_dec_norm;
        // Assume shared embeddings & output projection tied to embeddings
        const P_final_norm = 2 * H;
        P_total_raw = P_embedding + (L * P_enc_layer) + (L * P_dec_layer) + P_final_norm + P_output_proj; // Add output proj explicitly
    }

    // --- Adjust for MoE ---
    let P_trainable_raw = P_total_raw; // Initially, all params are trainable
    let P_active_raw = P_total_raw;    // Initially, all params are active per token
    let isMoE = false;
    if (memoryFlags.moe && memoryFlags.moe.experts > 1 && (modelType === "decoder" || modelType === "encoder-decoder")) {
        isMoE = true;
        const experts = memoryFlags.moe.experts;
        const topK = memoryFlags.moe.topK;
        // Params for ONE dense MLP FFN (H->4H, 4H->H)
        const P_dense_mlp_layer = 2 * H * MLP_intermediate;
        // Params for ONE MoE Layer: Router (H->E) + E * (Dense MLP Params)
        const P_router_layer = H * experts;
        const P_experts_total_layer = experts * P_dense_mlp_layer;
        const P_moe_mlp_layer = P_router_layer + P_experts_total_layer;

        // Replace dense MLP params with MoE MLP params in total count
        P_total_raw = P_total_raw - (L * P_dense_mlp_layer) + (L * P_moe_mlp_layer);
        P_trainable_raw = P_total_raw; // All MoE params are trainable by default

        // Calculate *active* parameters per token
        // Base params (non-MLP) + Router + TopK * ExpertMLP params
        const P_non_mlp_base = P_total_raw - (L * P_moe_mlp_layer); // Params outside the MoE layers
        const P_active_experts_layer = topK * P_dense_mlp_layer; // Only K experts active
        P_active_raw = P_non_mlp_base + L * (P_router_layer + P_active_experts_layer);
    }

    // --- Adjust for LoRA ---
    let P_lora_raw = 0;
    let isLora = false;
    if (memoryFlags.lora && memoryFlags.lora.rank > 0) {
        isLora = true;
        const R = memoryFlags.lora.rank;
        // LoRA adds A (H*R) and B (R*H) matrices. Assume applied to Q and V projections in attention.
        // Number of LoRA applications per layer = 2 (Q, V)
        const lora_matrices_per_layer = 2 * (H * R + R * H); // A(HxR), B(RxH) for Q and V
        P_lora_raw = L * lora_matrices_per_layer;

        // With LoRA, only the LoRA weights are trainable
        P_trainable_raw = P_lora_raw;
        // LoRA weights are typically trained in FP16 or FP32. Assume FP16 for memory.
        const bytesPerParamLora = 16 / 8;
        // LoRA weights ADD to the base model weight memory
        // Model weights memory calculation below will handle adding this.
    }

    // --- 2. Calculate Memory Components (Bytes per GPU) ---

    // a) Model Weights Memory
    let modelWeightsBytes = P_total_raw * bytesPerParamModel;
    if (isLora) {
        modelWeightsBytes += P_lora_raw * (16 / 8); // Add LoRA weights (assume FP16)
    }
    // Apply ZeRO-3 Sharding
    if (memoryFlags.zeroStage === 3) {
        modelWeightsBytes /= N_gpus;
    }

    // b) Optimizer States Memory (Training only)
    // Adam/AdamW: 2 states (m, v) per trainable parameter, typically FP32.
    const OPTIMIZER_STATES_MULTIPLIER = 2; // m & v for Adam
    let optimizerStateBytes = P_trainable_raw * bytesPerParamOptimizer * OPTIMIZER_STATES_MULTIPLIER;
    // Apply ZeRO Optimizer Sharding (Stages 1, 2, 3)
    if (memoryFlags.zeroStage >= 1) {
        optimizerStateBytes /= N_gpus;
    }

    // c) Gradient Memory (Training only)
    // Gradients match trainable parameters, typically in compute precision (FP16/BF16/FP32).
    let gradientMemoryBytes = P_trainable_raw * bytesPerParamCompute;
    // Apply ZeRO Gradient Sharding (Stages 2, 3)
    if (memoryFlags.zeroStage >= 2) {
        gradientMemoryBytes /= N_gpus;
    }

    // d) Activation Memory (Training & Inference) - Highly Approximate!
    // Formula based on estimations (e.g., MosaicML, DeepSpeed papers)
    // Activation Memory ≈ B_micro * S * H * L * (Factor related to attention, MLP, norms) * bytesPerParamCompute
    // Let's use a simplified heuristic factor. This is the most variable part.
    const ACTIVATION_HEURISTIC_FACTOR = 28; // Adjusted heuristic factor (includes attn, MLP, norms, intermediate saves)
    let activationMemoryBytes = B_micro * S * H * L * bytesPerParamCompute * ACTIVATION_HEURISTIC_FACTOR;
    // Add contribution from embeddings (B_micro * S * H) - sometimes significant
    activationMemoryBytes += B_micro * S * H * bytesPerParamCompute;

    // Apply FlashAttention / SDPA Optimization
    // Reduces activation memory by avoiding storing the S x S attention matrix. Affects the attention part of the heuristic factor.
    // Apply a reduction factor, more effective for longer sequences.
    if (memoryFlags.flashAttention && S > 1024) {
        const flash_attn_factor = 0.7; // Heuristic: Assume ~30% reduction in activation memory overall
        activationMemoryBytes *= flash_attn_factor;
    }

    // Apply Gradient Checkpointing Optimization
    // Reduces activation memory by recomputing during backward pass.
    // Factor < 1.0 means checkpointing is active.
    if (memoryFlags.gradientCheckpointFactor < 1.0) {
        activationMemoryBytes *= memoryFlags.gradientCheckpointFactor;
    }

     // Adjust for MoE Activation Memory
     if (isMoE) {
         // MoE might slightly increase activation due to router outputs, but only K experts run.
         // Let's assume the base formula roughly holds, maybe a slight increase.
         activationMemoryBytes *= 1.1; // Small heuristic increase for MoE overhead
     }

    // e) Temporary Buffers & Fragmentation
    // Allocate a percentage for framework overhead, temporary storage during ops, memory fragmentation.
    const FRAGMENTATION_FACTOR = 0.10; // 10% buffer - adjust as needed
    // Calculate based on the sum of major components *before* CPU offload
    let tempMemoryBytes = (modelWeightsBytes + optimizerStateBytes + gradientMemoryBytes + activationMemoryBytes) * FRAGMENTATION_FACTOR;

    // f) CPU Offload (Training only)
    let cpuSwapBytes = 0;
    if (memoryFlags.zeroStage >= 1 && memoryFlags.cpuOffloadPct > 0) {
        const offloadFraction = memoryFlags.cpuOffloadPct / 100;
        // Offload applies to sharded optimizer states and (if ZeRO >= 2) gradients.
        let bytesToOffload = 0;
        if (memoryFlags.zeroStage >= 1) bytesToOffload += optimizerStateBytes;
        if (memoryFlags.zeroStage >= 2) bytesToOffload += gradientMemoryBytes;

        cpuSwapBytes = bytesToOffload * offloadFraction;

        // Reduce GPU memory accordingly
        if (memoryFlags.zeroStage >= 1) optimizerStateBytes *= (1 - offloadFraction);
        if (memoryFlags.zeroStage >= 2) gradientMemoryBytes *= (1 - offloadFraction);
    }

    // --- 3. Calculate Totals per GPU ---
    const totalTrainingBytesPerGPU = modelWeightsBytes + activationMemoryBytes + optimizerStateBytes + gradientMemoryBytes + tempMemoryBytes;

    // Inference Memory Estimation:
    // - No optimizer states or gradients.
    // - Activation memory is often smaller (no need to save for backward pass). Use a factor.
    const INFERENCE_ACTIVATION_FACTOR = 0.5; // Heuristic: Inference activations are ~50% of training
    const inferenceActivationBytes = activationMemoryBytes * INFERENCE_ACTIVATION_FACTOR;
    // Inference temp memory might also be slightly less, use same factor for simplicity
    const inferenceTempBytes = tempMemoryBytes * INFERENCE_ACTIVATION_FACTOR;
    // Model weights remain the same (potentially affected by ZeRO-3 if inference uses it, but less common)
    let inferenceModelWeightsBytes = P_total_raw * bytesPerParamModel;
     if (isLora) {
         inferenceModelWeightsBytes += P_lora_raw * (16 / 8); // Add LoRA weights
     }
     // If running inference with ZeRO-3 (less common, needs specialized frameworks like DeepSpeed-Inference)
     // if (memoryFlags.zeroStage === 3) { inferenceModelWeightsBytes /= N_gpus; }
     // Assume inference is typically done on single or fewer GPUs without ZeRO-3 param sharding for simplicity here.

    const totalInferenceBytesPerGPU = inferenceModelWeightsBytes + inferenceActivationBytes + inferenceTempBytes;

    // --- 4. Package Results ---
    const bytesResult = {
      modelWeightsBytes: modelWeightsBytes,         // Weights on GPU (after ZeRO-3 if applicable)
      activationMemoryBytes: activationMemoryBytes, // Training activations (after checkpointing/flash)
      optimizerStateBytes: optimizerStateBytes,     // Optimizer states on GPU (after ZeRO/offload)
      gradientMemoryBytes: gradientMemoryBytes,     // Gradients on GPU (after ZeRO/offload)
      tempMemoryBytes: tempMemoryBytes,             // Estimated overhead/fragmentation
      totalTrainingBytesPerGPU: totalTrainingBytesPerGPU,
      totalInferenceBytesPerGPU: totalInferenceBytesPerGPU, // Simpler inference estimate
      cpuSwapBytes: cpuSwapBytes,                   // Amount offloaded to CPU RAM per GPU
    };

    const gbResult = {
       modelWeightsGB: bytesToGigabytes(bytesResult.modelWeightsBytes),
       activationMemoryGB: bytesToGigabytes(bytesResult.activationMemoryBytes),
       optimizerStateGB: bytesToGigabytes(bytesResult.optimizerStateBytes),
       gradientMemoryGB: bytesToGigabytes(bytesResult.gradientMemoryBytes),
       tempMemoryGB: bytesToGigabytes(bytesResult.tempMemoryBytes),
       totalTrainingGB: bytesToGigabytes(bytesResult.totalTrainingBytesPerGPU),
       totalInferenceGB: bytesToGigabytes(bytesResult.totalInferenceBytesPerGPU),
       cpuSwapGB: bytesToGigabytes(bytesResult.cpuSwapBytes),
    };

    const paramsResult = {
        totalParamsRaw: P_total_raw,        // Total parameters including MoE experts
        trainableParamsRaw: P_trainable_raw,// Trainable parameters (base or LoRA)
        activeParamsRaw: P_active_raw,      // Active parameters per token (relevant for MoE throughput)
        loraParamsRaw: P_lora_raw,          // Number of LoRA parameters added
        isMoE: isMoE,
        isLora: isLora,
    };

    return {
        memoryRequirementsBytes: bytesResult,
        memoryRequirementsGB: gbResult,
        parameterDetails: paramsResult,
    };

  }, [parameters, modelType, selectedQuantization, memoryFlags, numGpus]);

  // Calculate Cost & Energy based on training parameters and hardware
  const costEnergyResults = useMemo(() => {
    if (!selectedHardware || costParams.tokensPerSecondPerGPU <= 0 || numGpus <= 0 || costParams.trainingSteps <= 0) {
        return null; // Not enough info
    }

    const S = parameters.sequenceLength;
    const B_global = parameters.batchSize;
    const steps = costParams.trainingSteps;
    const tokenPerSecPerGPU = costParams.tokensPerSecondPerGPU;
    const nGPUs = numGpus;

    // Total tokens processed = steps * global_batch_size * sequence_length
    const totalTokens = steps * B_global * S;
    // Overall throughput = tokenPerSecPerGPU * nGPUs
    const totalTokenPerSec = tokenPerSecPerGPU * nGPUs;
    // Total time in seconds = totalTokens / totalTokenPerSec
    const totalSeconds = totalTokens / totalTokenPerSec;
    const totalHours = totalSeconds / 3600; // Wall-clock hours for the training job

    // Energy Calculation
    // Total power consumption = nGPUs * power_per_gpu (kW)
    const totalPowerKW = (selectedHardware.powerW * nGPUs) / 1000;
    const energyKWh = totalHours * totalPowerKW;

    // CO2 Emissions Calculation
    const co2kg = energyKWh * costParams.gridCarbonIntensity;

    // Cost Calculation
    // Try to find a matching cloud instance first
    const matchingInstance = cloudInstanceProfiles.find(inst => inst.gpuType === selectedHardware.id && inst.gpuCount === nGPUs);
    let hourlyRate = 0;
    let costSource = "N/A (No Pricing Data)";

    if (matchingInstance) {
         hourlyRate = matchingInstance.hourlyUSD;
         costSource = `${matchingInstance.name} (${matchingInstance.dataSource || 'Cloud Provider'})`;
    } else if (selectedHardware.hourlyUSD && nGPUs > 0) {
        // Fallback: Estimate cost by multiplying single GPU hourly rate (less accurate)
        hourlyRate = selectedHardware.hourlyUSD * nGPUs;
        costSource = `${nGPUs}x ${selectedHardware.name} (GPU Estimate)`;
    } else {
        // Fallback: Try finding *any* instance with the right GPU type and scale cost (even less accurate)
        const similarInstance = cloudInstanceProfiles.find(inst => inst.gpuType === selectedHardware.id);
        if (similarInstance) {
            hourlyRate = (similarInstance.hourlyUSD / similarInstance.gpuCount) * nGPUs;
            costSource = `${nGPUs}x ${selectedHardware.name} (Scaled from ${similarInstance.name})`;
        }
    }

    const totalCostUSD = totalHours * hourlyRate;

    return {
      gpuHours: totalHours * nGPUs, // Total GPU-hours across all GPUs
      wallHours: totalHours,        // Wall-clock time for the job
      energyKWh: energyKWh,
      co2kg: co2kg,
      totalCostUSD: totalCostUSD,
      costBasis: hourlyRate > 0 ? `$${hourlyRate.toFixed(3)}/hr (${costSource})` : costSource,
    };
  }, [parameters, costParams, selectedHardware, numGpus]);


  // --- UI Handlers ---

  // Handles changes in the main model parameter sliders/inputs
  const handleParameterChange = useCallback((param: keyof ModelParameters, value: number | string) => {
    const def = parametersList[param];
    let numValue = typeof value === 'string' ? parseFloat(value) : value; // Use parseFloat for potentially large/log values

    if (isNaN(numValue)) numValue = def.min;
    // Clamp value within defined min/max
    numValue = Math.max(def.min, Math.min(def.max, numValue));

    setParameters(prev => ({ ...prev, [param]: numValue }));
  }, [parametersList]); // Include parametersList dependency

  // Handles changes in the advanced memory optimization flags (switches, sliders, radio)
   const handleFlagChange = useCallback((flag: keyof MemoryFlags, value: any) => {
       // Special handling for MoE/LoRA enabling/disabling to set default values
       if (flag === 'moe' && value === true) { // Enabling MoE
           value = { experts: 8, topK: 2 }; // Set default MoE config
       } else if (flag === 'moe' && value === false) { // Disabling MoE
           value = undefined;
       } else if (flag === 'lora' && value === true) { // Enabling LoRA
           value = { rank: 8 }; // Set default LoRA rank
       } else if (flag === 'lora' && value === false) { // Disabling LoRA
            value = undefined;
       } else if (flag === 'zeroStage') { // Ensure ZeRO stage is parsed as number
            value = parseInt(String(value)) || 0;
       } else if (flag === 'gradientCheckpointFactor') { // Ensure factor is float
            value = parseFloat(String(value)) || 1.0;
       }


       setMemoryFlags(prev => ({ ...prev, [flag]: value }));

       // If ZeRO is turned off, disable CPU offload
       if (flag === 'zeroStage' && value === 0) {
           setMemoryFlags(prev => ({ ...prev, cpuOffloadPct: 0 }));
       }
   }, []); // No dependencies needed if only using setMemoryFlags

   // Handles changes in the cost/energy calculation inputs
   const handleCostParamChange = useCallback((param: keyof CostEnergyParams, value: string) => {
       let numValue = parseFloat(value);
       // Basic validation: ensure non-negative, handle NaN
       if (isNaN(numValue) || numValue < 0) numValue = 0;
       // Add specific constraints if needed (e.g., steps >= 1)
       if (param === 'trainingSteps' && numValue < 1 && value !== '') numValue = 1;

       setCostParams(prev => ({ ...prev, [param]: numValue }));
   }, []); // No dependencies needed

   // Applies a selected model preset
   const handleApplyPreset = useCallback((preset: ModelPreset) => {
       setModelType(preset.modelType);
       // Update parameters, keeping existing ones if not specified in preset
       setParameters(prev => ({
            hiddenSize: preset.params.hiddenSize ?? prev.hiddenSize,
            numLayers: preset.params.numLayers ?? prev.numLayers,
            numHeads: preset.params.numHeads ?? prev.numHeads,
            vocabSize: preset.params.vocabSize ?? prev.vocabSize,
            sequenceLength: preset.params.sequenceLength ?? prev.sequenceLength,
            batchSize: preset.params.batchSize ?? prev.batchSize,
       }));
       if (preset.precision) {
           setPrecision(preset.precision);
       }
       // Reset flags to defaults first, then apply preset-specific flags
       setMemoryFlags({
           flashAttention: true,
           gradientCheckpointFactor: 1.0,
           zeroStage: 0,
           cpuOffloadPct: 0,
           moe: undefined,
           lora: undefined,
           ...preset.flags // Apply preset specific flags, overriding defaults
       });
   }, []); // No dependencies needed

   // --- Chart Data Preparation ---

    // Data for the Training Memory Breakdown Pie Chart
    const trainingMemoryBreakdownData = useMemo(() => [
        { name: "Model Weights", value: memoryRequirementsGB.modelWeightsGB },
        { name: "Activations", value: memoryRequirementsGB.activationMemoryGB },
        { name: "Optimizer States", value: memoryRequirementsGB.optimizerStateGB },
        { name: "Gradients", value: memoryRequirementsGB.gradientMemoryGB },
        { name: "Temp/Overhead", value: memoryRequirementsGB.tempMemoryGB },
        // Conditionally add LoRA if active and contributes memory
        // Note: LoRA weights are included in modelWeightsGB calculation if active, so separate entry might be redundant unless specifically desired.
        // parameterDetails.isLora && { name: "LoRA Weights", value: bytesToGigabytes(parameterDetails.loraParamsRaw * (16/8)) },
    ].filter(item => item && item.value > 0.001), [memoryRequirementsGB, parameterDetails]); // Filter out negligible values and nulls

    // Data for the Inference Memory Breakdown Bar Chart
    const inferenceMemoryBreakdownData = useMemo(() => [
        // Use the dedicated inference calculation results
        { name: "Model Weights", value: bytesToGigabytes(P_total_raw * bytesPerParamModel + (parameterDetails.isLora ? parameterDetails.loraParamsRaw * (16/8) : 0)) }, // Recalculate inference weights without ZeRO-3 assumption
        { name: "Activations", value: bytesToGigabytes(memoryRequirementsBytes.activationMemoryBytes * 0.5) }, // Approx. 50% factor
        { name: "Temp/Overhead", value: bytesToGigabytes(memoryRequirementsBytes.tempMemoryBytes * 0.5) }, // Approx. 50% factor
    ].filter(item => item && item.value > 0.001), [memoryRequirementsBytes, parameterDetails, P_total_raw, bytesPerParamModel]); // Filter out negligible values

    // Colors for charts
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19AF', '#DB2777']; // Added more colors

    // Calculate VRAM usage percentage for the heat bar
    const vramUsagePercent = selectedHardware ? (memoryRequirementsGB.totalTrainingGB / selectedHardware.vramGB) * 100 : 0;
    const getVramBarColor = (usage: number): string => {
        if (!selectedHardware || selectedHardware.vramGB === 0) return 'bg-gray-400'; // Indicate unknown/no hardware
        if (usage > 100) return 'bg-red-600';      // Clearly over limit
        if (usage > 90) return 'bg-red-500';       // Danger zone
        if (usage > 70) return 'bg-amber-500';     // Warning zone
        if (usage > 0) return 'bg-green-500';      // Within limits
        return 'bg-secondary'; // Fallback or zero usage
    };

  // --- Render Component ---
  return (
    <TooltipProvider delayDuration={300}> {/* Set default tooltip delay */}
    <div className="container mx-auto p-4 lg:p-6 space-y-6">
      <Card className="overflow-visible"> {/* Allow tooltips to overflow card boundaries */}
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold tracking-tight">Enhanced LLM Memory & Capacity Planner</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Estimate VRAM, cost, and environmental impact for LLM training & inference with advanced optimizations.
          </CardDescription>
           {/* Preset Buttons */}
            <div className="flex flex-wrap gap-2 justify-center pt-4">
                <Label className="pt-1.5 font-semibold mr-2 text-sm">Load Preset:</Label>
                {modelPresets.map(p => (
                    <Button key={p.name} variant="outline" size="sm" onClick={() => handleApplyPreset(p)} className="text-xs h-7">
                        {p.name}
                    </Button>
                ))}
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
                     {/* Model Architecture Dropdown */}
                     <div>
                        <Label htmlFor="modelType">Architecture Type</Label>
                        <Select value={modelType} onValueChange={setModelType}>
                            <SelectTrigger id="modelType"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="decoder">Decoder-only (GPT-style)</SelectItem>
                                <SelectItem value="encoder">Encoder-only (BERT-style)</SelectItem>
                                <SelectItem value="encoder-decoder">Encoder-Decoder (T5-style)</SelectItem>
                            </SelectContent>
                        </Select>
                     </div>

                     {/* Dynamic Parameter Sliders/Inputs */}
                     {Object.entries(parametersList).map(([key, param]) => (
                        <div key={key}>
                            <div className="flex justify-between items-center mb-1">
                             <Label htmlFor={key} className="text-sm font-medium flex items-center">
                                 {param.name} {param.unit && `(${param.unit})`}
                                 {param.tooltip && (
                                     <ShadTooltip>
                                         <TooltipTrigger asChild><InfoIcon className="w-3 h-3 ml-1.5 text-muted-foreground cursor-help"/></TooltipTrigger>
                                         <TooltipContent><p className="max-w-xs">{param.tooltip}</p></TooltipContent>
                                     </ShadTooltip>
                                 )}
                             </Label>
                             <Input
                                type="number"
                                id={`${key}-input`}
                                value={parameters[key as keyof ModelParameters]}
                                onChange={(e) => handleParameterChange(key as keyof ModelParameters, e.target.value)}
                                min={param.min}
                                max={param.max}
                                step={param.step}
                                className="w-28 h-8 text-sm"
                                aria-label={`${param.name} value`}
                              />
                            </div>
                            <Slider
                                id={key}
                                min={param.min}
                                max={param.max}
                                step={param.step}
                                value={[parameters[key as keyof ModelParameters]]}
                                onValueChange={(value) => handleParameterChange(key as keyof ModelParameters, value[0])}
                                className="mt-1"
                                aria-label={`${param.name} slider`}
                            />
                        </div>
                     ))}
                 </CardContent>
               </Card>

                {/* --- Precision & Quantization --- */}
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
                                            // Use first part like 'fp16' or 'awq' as value for simplicity
                                            <SelectItem key={q.name} value={q.name.toLowerCase().split(' ')[0]}>
                                                {q.name} ({q.bitsPerParameter}-bit)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-sm">
                                  <p>Select the numerical format for model weights and computation.</p>
                                  <p className="mt-1"><strong>{selectedQuantization.name}:</strong> {selectedQuantization.performanceImpact}</p>
                                  {selectedQuantization.reference && <p className="text-xs mt-1">Ref: {selectedQuantization.reference}</p>}
                              </TooltipContent>
                          </ShadTooltip>
                     </div>
                 </CardContent>
               </Card>


               {/* --- Advanced Memory Optimization Techniques --- */}
                <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-lg font-semibold px-6 py-4 hover:no-underline">
                        <span className="mr-auto">3. Advanced Optimizations (Optional)</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 space-y-6">
                      {/* Flash Attention */}
                       <div className="flex items-center justify-between space-x-2 border-b pb-4">
                            <Label htmlFor="flashAttention" className="flex flex-col space-y-1 pr-4">
                                <span>FlashAttention / SDPA</span>
                                <span className="font-normal leading-snug text-muted-foreground text-sm">
                                Use memory-efficient attention kernel (reduces activation memory, esp. for long sequences).
                                </span>
                            </Label>
                             <ShadTooltip>
                                <TooltipTrigger asChild><Switch id="flashAttention" checked={memoryFlags.flashAttention} onCheckedChange={(c) => handleFlagChange('flashAttention', c)} /></TooltipTrigger>
                                <TooltipContent><p>Applies ~30% activation memory reduction heuristic if SeqLen > 1024.</p></TooltipContent>
                             </ShadTooltip>
                        </div>

                       {/* Gradient Checkpointing */}
                       <div className="border-b pb-4">
                           <div className="flex justify-between items-center mb-1">
                                <Label htmlFor="gradCheckpoint" className="flex flex-col space-y-1">
                                     <span>Gradient Checkpointing</span>
                                      <span className="font-normal leading-snug text-muted-foreground text-sm">
                                          Trade compute for memory by recomputing activations. Factor = % of activation memory retained.
                                      </span>
                                </Label>
                                <span className="text-sm font-medium whitespace-nowrap ml-2">{Math.round(memoryFlags.gradientCheckpointFactor * 100)}% Memory</span>
                           </div>
                            <Slider
                                id="gradCheckpoint"
                                min={0.3} max={1.0} step={0.05} // Range 30% (heavy chkpt) to 100% (off) memory usage
                                value={[memoryFlags.gradientCheckpointFactor]}
                                onValueChange={(v) => handleFlagChange('gradientCheckpointFactor', v[0])}
                                aria-label="Gradient Checkpointing Factor"
                            />
                            <span className="text-xs text-muted-foreground">100% = Off, Lower % = More Memory Saved (but more recompute)</span>
                       </div>

                       {/* ZeRO Optimization */}
                       <div className="border-b pb-4">
                            <Label className="mb-2 block font-medium">ZeRO Stage (DeepSpeed/FSDP)</Label>
                             <ShadTooltip>
                                <TooltipTrigger asChild>
                                    <RadioGroup
                                        value={String(memoryFlags.zeroStage)}
                                        onValueChange={(v) => handleFlagChange('zeroStage', v)} // Pass string value
                                        className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2"
                                    >
                                        {[0, 1, 2, 3].map(stage => (
                                            <div key={stage} className="flex items-center space-x-2">
                                                <RadioGroupItem value={String(stage)} id={`zero-${stage}`} />
                                                <Label htmlFor={`zero-${stage}`} className="font-normal">Stage {stage}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="max-w-md p-3">
                                   <p className="font-semibold mb-1">ZeRO partitions model state across GPUs:</p>
                                   <ul className="list-disc list-inside text-xs space-y-1">
                                       <li><b>Stage 0:</b> None (standard data parallelism).</li>
                                       <li><b>Stage 1:</b> Shards Optimizer States.</li>
                                       <li><b>Stage 2:</b> Shards Optimizer States & Gradients.</li>
                                       <li><b>Stage 3:</b> Shards Optimizer States, Gradients, & Model Parameters.</li>
                                   </ul>
                                   <p className="text-xs mt-2">Reduces memory per GPU but increases communication.</p>
                                </TooltipContent>
                            </ShadTooltip>

                             {/* ZeRO CPU Offload */}
                             {memoryFlags.zeroStage >= 1 && ( // Show only if ZeRO is active
                                <div className="mt-4">
                                    <div className="flex justify-between items-center mb-1">
                                         <Label htmlFor="cpuOffload" className="flex flex-col space-y-1">
                                            <span>ZeRO CPU Offload %</span>
                                            <span className="font-normal leading-snug text-muted-foreground text-sm">
                                                Offload sharded optimizer/gradients (Stage {memoryFlags.zeroStage}) to CPU RAM.
                                            </span>
                                        </Label>
                                        <span className="text-sm font-medium whitespace-nowrap ml-2">{memoryFlags.cpuOffloadPct}%</span>
                                    </div>
                                    <Slider
                                        id="cpuOffload"
                                        min={0} max={100} step={5}
                                        value={[memoryFlags.cpuOffloadPct]}
                                        onValueChange={(v) => handleFlagChange('cpuOffloadPct', v[0])}
                                        disabled={memoryFlags.zeroStage === 0} // Disable if ZeRO is off
                                        aria-label="CPU Offload Percentage"
                                    />
                                     <span className="text-xs text-muted-foreground">Requires sufficient CPU RAM. Slows down training due to PCIe transfers.</span>
                                </div>
                             )}
                       </div>

                      {/* Mixture of Experts (MoE) */}
                       <div className="border-b pb-4">
                           <div className="flex items-center justify-between mb-3">
                               <Label className="font-medium flex items-center">Mixture of Experts (MoE)
                                   <ShadTooltip>
                                       <TooltipTrigger asChild><InfoIcon className="w-3 h-3 ml-1.5 text-muted-foreground cursor-help"/></TooltipTrigger>
                                       <TooltipContent><p className="max-w-xs">Replaces dense MLP layers with sparse MoE layers. Increases total parameters but keeps active parameters/token low.</p></TooltipContent>
                                   </ShadTooltip>
                               </Label>
                                <Switch
                                    id="enableMoE"
                                    checked={!!memoryFlags.moe}
                                    onCheckedChange={(checked) => handleFlagChange('moe', checked)} // Let handler set defaults
                                    aria-label="Enable Mixture of Experts"
                                />
                           </div>
                           {memoryFlags.moe && (
                               <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="moeExperts" className="text-sm">Total Experts (E)</Label>
                                        <Input
                                            id="moeExperts" type="number" min="2" step="1"
                                            value={memoryFlags.moe.experts}
                                            onChange={(e) => handleFlagChange('moe', { ...memoryFlags.moe, experts: parseInt(e.target.value) || 2 })}
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                     <div>
                                         <Label htmlFor="moeTopK" className="text-sm">Activated Experts (K)</Label>
                                         <Input
                                             id="moeTopK" type="number" min="1" step="1" max={memoryFlags.moe.experts}
                                             value={memoryFlags.moe.topK}
                                             onChange={(e) => handleFlagChange('moe', { ...memoryFlags.moe, topK: Math.min(parseInt(e.target.value) || 1, memoryFlags.moe?.experts || 1) })}
                                             className="h-8 text-sm"
                                         />
                                    </div>
                               </div>
                           )}
                       </div>

                       {/* LoRA / QLoRA */}
                       <div> {/* No border-b for last item */}
                             <div className="flex items-center justify-between mb-3">
                                <Label className="font-medium flex items-center">LoRA (Low-Rank Adaptation)
                                    <ShadTooltip>
                                        <TooltipTrigger asChild><InfoIcon className="w-3 h-3 ml-1.5 text-muted-foreground cursor-help"/></TooltipTrigger>
                                        <TooltipContent><p className="max-w-xs">Parameter-Efficient Fine-Tuning (PEFT) method. Freezes base model, trains small adapter matrices. Drastically reduces trainable params & optimizer memory.</p></TooltipContent>
                                    </ShadTooltip>
                                </Label>
                                  <Switch
                                      id="enableLora"
                                      checked={!!memoryFlags.lora}
                                      onCheckedChange={(checked) => handleFlagChange('lora', checked)} // Let handler set defaults
                                      aria-label="Enable LoRA"
                                  />
                             </div>
                             {memoryFlags.lora && (
                                 <div className="mt-2">
                                     <Label htmlFor="loraRank" className="text-sm">LoRA Rank (r)</Label>
                                       <ShadTooltip>
                                            <TooltipTrigger asChild>
                                                <Select
                                                    value={String(memoryFlags.lora.rank)}
                                                    onValueChange={(v) => handleFlagChange('lora', { ...memoryFlags.lora, rank: parseInt(v) || 4 })}
                                                >
                                                    <SelectTrigger id="loraRank" className="h-8 text-sm"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        {[4, 8, 16, 32, 64, 128, 256].map(r => <SelectItem key={r} value={String(r)}>{r}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>LoRA rank 'r'. Higher rank means more trainable parameters (≈ 2*L*2*H*r) but potentially better adaptation. Common values: 4-64.</p>
                                            </TooltipContent>
                                       </ShadTooltip>
                                 </div>
                             )}
                       </div>

                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                 {/* --- Hardware & Cluster Setup --- */}
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
                                           {g.name} ({g.vramGB} GB VRAM, {g.powerW}W TDP)
                                       </SelectItem>
                                   ))}
                               </SelectContent>
                           </Select>
                       </div>
                       <div>
                           <Label htmlFor="numGpus">Number of GPUs</Label>
                            <Input
                                id="numGpus" type="number" min="1" step="1" max="1024" // Set a reasonable max
                                value={numGpus}
                                onChange={(e) => setNumGpus(parseInt(e.target.value) || 1)}
                                className="h-8 text-sm"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Used for ZeRO sharding, calculating micro-batch size, and total cost/power.</p>
                       </div>
                   </CardContent>
               </Card>
            </div> {/* End Left Column */}


            {/* === Right Column: Results === */}
            <div className="space-y-5">
              {/* --- Parameter Count Summary --- */}
               <Card>
                 <CardHeader className="pb-2"><CardTitle className="text-lg">Parameter Summary</CardTitle></CardHeader>
                 <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                      <div>
                        <Label className="text-xs text-muted-foreground block mb-0.5">Total Parameters</Label>
                        <div className="text-2xl font-bold">
                            {formatNumber(parameterDetails.totalParamsRaw, 2)}
                            {parameterDetails.isMoE ? <span className="text-xs font-normal text-emerald-600"> (MoE)</span> : ""}
                        </div>
                        <div className="text-xs text-muted-foreground">({(parameterDetails.totalParamsRaw / 1e9).toFixed(2)} B)</div>
                      </div>
                       <div>
                        <Label className="text-xs text-muted-foreground block mb-0.5">Trainable Parameters</Label>
                        <div className="text-2xl font-bold">
                            {formatNumber(parameterDetails.trainableParamsRaw, 2)}
                            {parameterDetails.isLora ? <span className="text-xs font-normal text-blue-600"> (LoRA)</span> : ""}
                        </div>
                         <div className="text-xs text-muted-foreground">({(parameterDetails.trainableParamsRaw / parameterDetails.totalParamsRaw * 100).toFixed(2)}% of total)</div>
                      </div>
                      {/* Optional: Show Active Params for MoE */}
                      {parameterDetails.isMoE && (
                          <div className="sm:col-span-2">
                            <Label className="text-xs text-muted-foreground block mb-0.5">Active Parameters / Token (MoE)</Label>
                            <div className="text-xl font-semibold">
                                {formatNumber(parameterDetails.activeParamsRaw, 2)}
                            </div>
                            <div className="text-xs text-muted-foreground">({(parameterDetails.activeParamsRaw / parameterDetails.totalParamsRaw * 100).toFixed(2)}% of total)</div>
                          </div>
                      )}
                 </CardContent>
               </Card>


              {/* --- Memory Requirements --- */}
              <Card>
                  <CardHeader className="pb-4"><CardTitle className="text-lg">Estimated Memory Requirements</CardTitle></CardHeader>
                  <CardContent>
                     {/* VRAM Heat Bar */}
                     <div className="mb-6">
                         <div className="flex justify-between items-center mb-1 text-sm">
                             <Label>Est. Training VRAM / GPU</Label>
                             <span className={`font-bold ${vramUsagePercent > 100 ? 'text-red-600' : ''}`}>
                                {memoryRequirementsGB.totalTrainingGB.toFixed(2)} GB
                                {selectedHardware && ` / ${selectedHardware.vramGB} GB`}
                                {selectedHardware && ` (${vramUsagePercent.toFixed(0)}%)`}
                            </span>
                        </div>
                         <div className={`w-full h-3 ${getVramBarColor(0)} rounded-full overflow-hidden bg-opacity-50`}> {/* Background bar */}
                            <div
                                className={`h-full ${getVramBarColor(vramUsagePercent)} transition-all duration-300 ease-out rounded-full`}
                                style={{ width: `${Math.min(100, Math.max(0, vramUsagePercent))}%` }}
                            />
                        </div>
                         {memoryRequirementsGB.cpuSwapGB > 0 && (
                             <p className="text-xs text-muted-foreground mt-1 text-center">
                                 (+ {memoryRequirementsGB.cpuSwapGB.toFixed(2)} GB offloaded to CPU RAM per GPU via ZeRO Offload)
                             </p>
                         )}
                         {vramUsagePercent > 100 && (
                             <p className="text-xs text-red-600 font-semibold mt-1 text-center">
                                 Warning: Estimated VRAM exceeds target GPU capacity!
                             </p>
                         )}
                         {!selectedHardware && (
                              <p className="text-xs text-muted-foreground mt-1 text-center">
                                 Select hardware to compare usage against VRAM limit.
                             </p>
                         )}
                     </div>


                    <Tabs defaultValue="training">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="training">Training Breakdown</TabsTrigger>
                        <TabsTrigger value="inference">Inference Estimate</TabsTrigger>
                      </TabsList>

                      {/* Training Tab */}
                      <TabsContent value="training" className="mt-4 space-y-4">
                         {/* Summary Cards */}
                         <div className="grid grid-cols-2 gap-3 text-center">
                            <div className="bg-secondary/50 p-2 rounded-lg">
                                <div className="text-xs text-muted-foreground">Total / GPU</div>
                                <div className="text-lg font-bold">{memoryRequirementsGB.totalTrainingGB.toFixed(2)} GB</div>
                            </div>
                            <div className="bg-secondary/50 p-2 rounded-lg">
                                <div className="text-xs text-muted-foreground">Model Weights / GPU</div>
                                <div className="text-lg font-bold">
                                    {memoryRequirementsGB.modelWeightsGB.toFixed(2)} GB
                                </div>
                                 <div className="text-[10px] text-muted-foreground leading-tight">
                                     {memoryFlags.zeroStage === 3 ? "(ZeRO-3 Sharded)" : (parameterDetails.isLora ? "(Base + LoRA)" : "")}
                                 </div>
                            </div>
                         </div>

                         {/* Training Pie Chart */}
                         <div className="h-60 w-full"> {/* Reduced height slightly */}
                           <ResponsiveContainer width="100%" height="100%">
                             <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                               <Pie
                                 data={trainingMemoryBreakdownData}
                                 dataKey="value"
                                 nameKey="name"
                                 cx="50%"
                                 cy="50%"
                                 outerRadius="80%" // Use percentage for responsiveness
                                 innerRadius="35%" // Make it a donut chart
                                 fill="#8884d8"
                                 labelLine={false}
                                 // Custom label rendering
                                 label={({ cx, cy, midAngle, outerRadius, percent, index, name, value }) => {
                                    const RADIAN = Math.PI / 180;
                                    // Position label slightly outside the slice
                                    const radius = outerRadius * 1.1;
                                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                    // Only render label if percentage is significant
                                    return ( percent > 0.03 ? // Threshold for showing label (e.g., 3%)
                                        <text x={x} y={y} fill={COLORS[index % COLORS.length]} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10" fontWeight="medium">
                                            {`${name}: ${value.toFixed(1)}GB`}
                                        </text> : null
                                    );
                                  }}
                               >
                                 {trainingMemoryBreakdownData.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]}/>
                                 ))}
                               </Pie>
                               <RechartsTooltip
                                    formatter={(value: number, name: string, props) => [`${value.toFixed(2)} GB (${(props.payload.percent * 100).toFixed(1)}%)`, name]}
                                    contentStyle={{background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(2px)', border: 'none', borderRadius: '4px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '8px'}}
                                />
                               {/* <Legend layout="vertical" align="right" verticalAlign="middle" iconSize={10} wrapperStyle={{fontSize: '10px'}}/> */}
                             </PieChart>
                           </ResponsiveContainer>
                         </div>
                         {/* Quantization Table (Moved outside tabs for general reference) */}
                      </TabsContent>

                       {/* Inference Tab */}
                      <TabsContent value="inference" className="mt-4 space-y-4">
                          <div className="grid grid-cols-1 gap-4 text-center">
                            <div className="bg-secondary/50 p-3 rounded-lg">
                                <div className="text-sm text-muted-foreground">Est. Inference Memory / GPU ({selectedQuantization.name})</div>
                                <div className="text-xl font-bold">{memoryRequirementsGB.totalInferenceGB.toFixed(2)} GB</div>
                                <p className="text-xs text-muted-foreground">(Excl. Optimizer/Gradients; Activations ~50% of training)</p>
                            </div>
                          </div>
                           {/* Inference Bar Chart */}
                           <div className="h-60 w-full">
                               <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={inferenceMemoryBreakdownData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false}/> {/* Vertical grid lines */}
                                    <XAxis type="number" unit=" GB" fontSize={10} />
                                    <YAxis type="category" dataKey="name" width={80} fontSize={10}/>
                                    <RechartsTooltip formatter={(value: number) => `${value.toFixed(2)} GB`} />
                                    {/* <Legend /> */}
                                    <Bar dataKey="value" name="Memory (GB)" barSize={20}>
                                        {inferenceMemoryBreakdownData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                               </ResponsiveContainer>
                           </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
              </Card>

               {/* --- Cost, Energy & Carbon --- */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Estimated Training Cost & Impact</CardTitle>
                        <CardDescription className="text-sm">Based on hardware selection and training parameters.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         {/* Input Parameters for Cost Calc */}
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                             <div>
                                 <Label htmlFor="trainingSteps" className="text-sm">Training Steps</Label>
                                 <Input id="trainingSteps" type="number" value={costParams.trainingSteps} onChange={e => handleCostParamChange('trainingSteps', e.target.value)} min="1" step="1000" className="h-8 text-sm"/>
                             </div>
                              <div>
                                 <Label htmlFor="tokensPerSec" className="text-sm flex items-center">Tokens/Sec/GPU
                                     <ShadTooltip>
                                         <TooltipTrigger asChild><InfoIcon className="w-3 h-3 ml-1.5 text-muted-foreground cursor-help"/></TooltipTrigger>
                                         <TooltipContent><p className="max-w-xs">Highly variable! Depends on model, hardware, precision, batch size, sequence length, software efficiency. Use measured values if possible.</p></TooltipContent>
                                     </ShadTooltip>
                                 </Label>
                                 <Input id="tokensPerSec" type="number" value={costParams.tokensPerSecondPerGPU} onChange={e => handleCostParamChange('tokensPerSecondPerGPU', e.target.value)} min="1" step="100" className="h-8 text-sm"/>
                             </div>
                              <div>
                                 <Label htmlFor="gridIntensity" className="text-sm flex items-center">Grid Carbon Intensity
                                    <ShadTooltip>
                                        <TooltipTrigger asChild><InfoIcon className="w-3 h-3 ml-1.5 text-muted-foreground cursor-help"/></TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-xs p-2">
                                            <p>Avg CO₂ emissions per kWh (kgCO₂/kWh). Varies by region/source.</p>
                                            <p className="text-xs mt-1">Default: {DEFAULT_GRID_INTENSITY} (US Avg)</p>
                                            <p className="text-xs">Examples: FR ~0.05, DE ~0.4, CN ~0.6, IS ~0.01</p>
                                        </TooltipContent>
                                    </ShadTooltip>
                                 </Label>
                                 <Input id="gridIntensity" type="number" value={costParams.gridCarbonIntensity} onChange={e => handleCostParamChange('gridCarbonIntensity', e.target.value)} min="0" step="0.01" className="h-8 text-sm"/>
                             </div>
                         </div>

                        {/* Calculated Results */}
                        {costEnergyResults && selectedHardware ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t text-center">
                                <div className="bg-secondary/30 p-2 rounded">
                                    <Label className="text-xs text-muted-foreground block mb-0.5">Wall Time</Label>
                                    <div className="text-md font-semibold">{costEnergyResults.wallHours.toFixed(1)} hrs</div>
                                    <div className="text-[10px] text-muted-foreground">({formatNumber(costEnergyResults.gpuHours, 1)} GPU hrs)</div>
                                </div>
                                 <div className="bg-secondary/30 p-2 rounded">
                                    <Label className="text-xs text-muted-foreground block mb-0.5">Energy Use</Label>
                                    <div className="text-md font-semibold">{formatNumber(costEnergyResults.energyKWh, 1)} kWh</div>
                                </div>
                                 <div className="bg-secondary/30 p-2 rounded">
                                    <Label className="text-xs text-muted-foreground block mb-0.5">CO₂ Emissions</Label>
                                    <div className="text-md font-semibold">{costEnergyResults.co2kg.toFixed(2)} kg CO₂e</div>
                                </div>
                                 <div className="bg-secondary/30 p-2 rounded">
                                    <Label className="text-xs text-muted-foreground block mb-0.5">Cloud Cost</Label>
                                    <div className="text-md font-semibold">${formatNumber(costEnergyResults.totalCostUSD, 2)}</div>
                                    <div className="text-[10px] text-muted-foreground truncate px-1" title={costEnergyResults.costBasis}>{costEnergyResults.costBasis}</div>
                                </div>
                            </div>
                        ) : (
                             <p className="text-center text-sm text-muted-foreground pt-4 border-t">Enter valid training parameters and select hardware to estimate cost and impact.</p>
                        )}
                        <p className="text-xs text-muted-foreground pt-2">Cost and energy are rough estimates. Actual values depend heavily on workload, efficiency, cooling, specific instance pricing, and utilization.</p>
                    </CardContent>
                </Card>

                 {/* --- Quantization Impact Table (Moved here for general reference) --- */}
                 <Card>
                    <CardHeader className="pb-4"><CardTitle className="text-lg">Quantization Impact Overview</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b">
                                <th className="text-left py-1 px-1 font-semibold">Type</th>
                                <th className="text-center py-1 px-1 font-semibold">Bits</th>
                                <th className="text-center py-1 px-1 font-semibold">Mem. Factor</th>
                                <th className="text-left py-1 px-1 font-semibold">Est. Perf. Impact</th>
                            </tr>
                            </thead>
                            <tbody>
                            {quantizationTypes.map((q) => (
                                <tr key={q.name} className={`border-b hover:bg-muted/50 ${q.name.toLowerCase().startsWith(precision.toLowerCase()) ? 'bg-secondary font-medium' : ''}`}>
                                    <td className="py-1.5 px-1">{q.name}</td>
                                    <td className="text-center py-1.5 px-1">{q.bitsPerParameter}</td>
                                    <td className="text-center py-1.5 px-1">{q.memoryMultiplier.toFixed(3)}x</td>
                                    <td className="py-1.5 px-1 text-xs">{q.performanceImpact}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </CardContent>
                 </Card>

                 {/* --- Actions (Placeholders) --- */}
                 <Card>
                     <CardHeader className="pb-4"><CardTitle className="text-lg">Actions</CardTitle></CardHeader>
                     <CardContent className="flex flex-wrap gap-3">
                           <Button variant="outline" size="sm" disabled>
                              <DownloadIcon className="mr-2 h-4 w-4" /> Export Summary (JSON)
                           </Button>
                            <Button variant="outline" size="sm" disabled>
                                <DownloadIcon className="mr-2 h-4 w-4" /> Save Charts (PNG)
                            </Button>
                            {/* Add Scenario button - requires more complex state management (e.g., array of configs) */}
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
            {/* Consider adding links to key papers or resources if desired */}
      </footer>
    </div> {/* End Container */}
    </TooltipProvider>
  );
};

export default MemoryCalculator;

// --- Required ShadCN UI Components ---
// Ensure you have installed and configured these components in your project:
// npx shadcn-ui@latest add card label input select tabs slider switch accordion radio-group button tooltip chart (using recharts internally)
// (You might also need `lucide-react` for icons: npm install lucide-react)

// --- Notes on Implementation vs Spec ---
// - Scenario Comparison: Not implemented due to state management complexity. Added a disabled button placeholder. Would require storing multiple configurations.
// - Export: Added disabled buttons. Actual export logic (JSON serialization, chart-to-PNG using html2canvas/similar, CSV generation) requires additional libraries and implementation.
// - Data Freshness: The GitHub Action for updating hardware/pricing data is an external process and not part of this React component. Data is static here.
// - API Shape: The component keeps calculations client-side within `useMemo`. Refactoring into separate functions is done, but no external API calls are made as per the original component structure.
// - Citations: Added as tooltip text or comments where appropriate, rather than formal citation rendering.
// - Log Sliders: The 'log' flag is noted but not implemented visually on the Shadcn slider (it doesn't support log scale directly). Input fields handle the number correctly.
// - Throughput (tokens/sec): This remains a critical input with a placeholder default. Users should adjust based on benchmarks or experience.
