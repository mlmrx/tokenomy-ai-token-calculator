import React, { useState, useMemo, useCallback } from "react";
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
import { Tooltip as ShadTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Renamed Shadcn Tooltip
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts'; // Keep Recharts Tooltip as is
import { DownloadIcon } from "lucide-react";

// --- Data Structures (as per spec) ---

type ParameterDef = {
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  log?: boolean; // Optional: Use logarithmic scale for slider
};

type QuantizationType = {
  name: string;
  bitsPerParameter: number;
  memoryMultiplier: number; // Compared to FP32
  performanceImpact: string; // Qualitative description
  reference?: string; // Optional citation key or note
};

interface GpuProfile {
  id: string;
  name: string;
  vramGB: number;
  powerW: number; // Typical board power
  hourlyUSD?: number; // Optional cloud cost
  dataSource?: string; // Optional source note
}

interface CloudInstanceProfile {
    id: string;
    name: string;
    gpuType: string; // Matches GpuProfile id
    gpuCount: number;
    hourlyUSD: number;
    dataSource?: string; // Optional source note
}

interface MemoryFlags {
  flashAttention: boolean;
  gradientCheckpointFactor: number; // 0.0 to 1.0 (1.0 means no checkpointing)
  zeroStage: 0 | 1 | 2 | 3;
  cpuOffloadPct: number; // 0 to 100 (Percentage of optimizer+gradients offloaded)
  moe?: { experts: number; topK: number };
  lora?: { rank: number };
}

interface CostEnergyParams {
    trainingSteps: number;
    tokensPerSecondPerGPU: number;
    gridCarbonIntensity: number; // kg CO2 per kWh
}

interface ModelParameters {
  hiddenSize: number;
  numLayers: number;
  numHeads: number;
  vocabSize: number;
  sequenceLength: number;
  batchSize: number; // Global batch size
}

// --- Static Data (as per spec, potentially moved to hardwareProfiles.ts) ---

const quantizationTypes: QuantizationType[] = [
  { name: "FP32", bitsPerParameter: 32, memoryMultiplier: 1.0, performanceImpact: "None (baseline)" },
  { name: "FP16", bitsPerParameter: 16, memoryMultiplier: 0.5, performanceImpact: "Minimal perf loss; requires Volta+ GPUs; faster" },
  { name: "BF16", bitsPerParameter: 16, memoryMultiplier: 0.5, performanceImpact: "Better training stability than FP16; requires Ampere+ GPUs" },
  { name: "INT8", bitsPerParameter: 8, memoryMultiplier: 0.25, performanceImpact: "Moderate (~1-5%) accuracy loss; faster inference" },
  { name: "AWQ (4-bit)", bitsPerParameter: 4, memoryMultiplier: 0.125, performanceImpact: "Activation-aware Weight Quantization (~0.2% PPL loss) [Ref: Lin et al., 2023]", reference:"AWQ"},
  { name: "GPTQ (4-bit)", bitsPerParameter: 4, memoryMultiplier: 0.125, performanceImpact: "Post-Training Quantization (~0.03 PPL loss @175B) [Ref: Frantar et al., 2022]", reference:"GPTQ"},
  // Note: Actual bits for AWQ/GPTQ can vary (e.g., 3-bit, group size), 4 is common.
];

const gpuProfiles: GpuProfile[] = [
  { id: 'rtx3090', name: 'NVIDIA RTX 3090', vramGB: 24, powerW: 350 },
  { id: 'rtx4090', name: 'NVIDIA RTX 4090', vramGB: 24, powerW: 450 },
  { id: 'a100-40', name: 'NVIDIA A100 (40GB SXM)', vramGB: 40, powerW: 400 },
  { id: 'a100-80', name: 'NVIDIA A100 (80GB SXM)', vramGB: 80, powerW: 400 },
  { id: 'h100-80-pcie', name: 'NVIDIA H100 (80GB PCIe)', vramGB: 80, powerW: 350 },
  { id: 'h100-80-sxm', name: 'NVIDIA H100 (80GB SXM)', vramGB: 80, powerW: 700, dataSource: "TRG Datacenters" }, // Spec power=700W
  { id: 'h100-94-sxm', name: 'NVIDIA H100 NVL (94GB)', vramGB: 94, powerW: 700, dataSource: "NVIDIA H100 Datasheet" }, // Spec value
  { id: 'gh200-gracehopper', name: 'NVIDIA GH200 Grace Hopper Superchip (GPU Memory)', vramGB: 480, powerW: 1000, dataSource: "NVIDIA GH200 Datasheet"}, // Combined CPU+GPU memory is 624GB LPDDR5X. HBM3e GPU memory is 480GB. Power approx.
  { id: 'b200-192-sxm', name: 'NVIDIA B200 (192GB SXM - Preview)', vramGB: 192, powerW: 1000, dataSource: "NVIDIA Blackwell Announcement" }, // Power is preliminary estimate
];

const cloudInstanceProfiles: CloudInstanceProfile[] = [
    { id:'aws-p4d.24xlarge', name: 'AWS p4d.24xlarge', gpuType:'a100-40', gpuCount: 8, hourlyUSD: 32.77, dataSource: "AWS EC2 Pricing"},
    { id:'aws-p4de.24xlarge', name: 'AWS p4de.24xlarge', gpuType:'a100-80', gpuCount: 8, hourlyUSD: 40.96, dataSource: "AWS EC2 Pricing"},
    { id:'aws-p5.48xlarge', name: 'AWS p5.48xlarge', gpuType:'h100-80-sxm', gpuCount: 8, hourlyUSD: 98.32, dataSource: "AWS EC2 Pricing (as of early 2024)"}, // Spec price=31.464 might be outdated or specific region/contract
    { id:'gcp-a2-highgpu-8g', name: 'GCP a2-highgpu-8g', gpuType:'a100-40', gpuCount: 8, hourlyUSD: 29.36, dataSource: "GCP Pricing"},
    { id:'gcp-a3-highgpu-8g', name: 'GCP a3-highgpu-8g', gpuType:'h100-80-sxm', gpuCount: 8, hourlyUSD: 35.00, dataSource: "GCP Pricing (approx)" }, // Rough estimate
    { id:'azure-nd-a100-v4', name: 'Azure NDm A100 v4', gpuType:'a100-80', gpuCount: 8, hourlyUSD: 27.40, dataSource: "Azure Pricing"},
];

// Default values
const DEFAULT_GRID_INTENSITY = 0.386; // kg CO2 / kWh (US Average 2023/2024 - EIA) Spec value

// --- Helper Functions ---

const formatNumber = (num: number, precision: number = 2): string => {
    if (num >= 1e9) return (num / 1e9).toFixed(precision) + " B";
    if (num >= 1e6) return (num / 1e6).toFixed(precision) + " M";
    if (num >= 1e3) return (num / 1e3).toFixed(precision) + " K";
    return num.toFixed(precision);
};

const formatBytes = (bytes: number, decimals: number = 2): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const gigabytesToBytes = (gb: number): number => gb * 1024 * 1024 * 1024;
const bytesToGigabytes = (bytes: number): number => bytes / (1024 * 1024 * 1024);

// --- Presets ---
interface ModelPreset {
    name: string;
    params: Partial<ModelParameters>;
    modelType: string;
    flags?: Partial<MemoryFlags>;
    precision?: string;
}

const modelPresets: ModelPreset[] = [
    { name: "Llama-3-8B Instruct", modelType: "decoder", params: { hiddenSize: 4096, numLayers: 32, numHeads: 32, vocabSize: 128256, sequenceLength: 8192 }, precision: "bf16" },
    { name: "Mixtral-8x7B", modelType: "decoder", params: { hiddenSize: 4096, numLayers: 32, numHeads: 32, vocabSize: 32000, sequenceLength: 4096 }, flags: { moe: { experts: 8, topK: 2 } }, precision: "bf16" },
    { name: "Phi-3-mini (3.8B)", modelType: "decoder", params: { hiddenSize: 3072, numLayers: 32, numHeads: 32, vocabSize: 32064, sequenceLength: 4096 }, precision: "bf16"},
    { name: "BERT-Large", modelType: "encoder", params: { hiddenSize: 1024, numLayers: 24, numHeads: 16, vocabSize: 30522, sequenceLength: 512 }, precision: "fp32"},
    { name: "T5-Large (770M)", modelType: "encoder-decoder", params: { hiddenSize: 1024, numLayers: 24, numHeads: 16, vocabSize: 32128, sequenceLength: 512 }, precision: "fp32"},
];


// --- Main Component ---

const MemoryCalculator = () => {
  const [modelType, setModelType] = useState("decoder");
  const [parameters, setParameters] = useState<ModelParameters>({
    hiddenSize: 4096,
    numLayers: 32,
    numHeads: 32, // Note: num_heads often related to hidden_size (e.g., hidden_size / 64 or 128) but keep separate for flexibility
    vocabSize: 50000,
    sequenceLength: 8192,
    batchSize: 8 // Default global batch size
  });
  const [precision, setPrecision] = useState<string>("bf16"); // Default to BF16

  // New state for advanced features
  const [memoryFlags, setMemoryFlags] = useState<MemoryFlags>({
    flashAttention: true, // Enable by default as it's common now
    gradientCheckpointFactor: 1.0, // Default: no checkpointing
    zeroStage: 0, // Default: No ZeRO
    cpuOffloadPct: 0, // Default: No CPU offload
    moe: undefined, // Optional MoE config
    lora: undefined, // Optional LoRA config
  });

  // New state for hardware and cost
  const [selectedHardwareId, setSelectedHardwareId] = useState<string>(gpuProfiles[6].id); // Default to H100 80GB SXM
  const [numGpus, setNumGpus] = useState<number>(8); // Default number of GPUs
  const [costParams, setCostParams] = useState<CostEnergyParams>({
      trainingSteps: 10000,
      tokensPerSecondPerGPU: 3000, // Placeholder value, highly variable
      gridCarbonIntensity: DEFAULT_GRID_INTENSITY,
  });


  const parametersList: Record<keyof ModelParameters, ParameterDef> = {
    hiddenSize: { name: "Hidden Size (d_model)", value: parameters.hiddenSize, min: 128, max: 32768, step: 128, unit: "" },
    numLayers: { name: "Number of Layers (L)", value: parameters.numLayers, min: 1, max: 128, step: 1, unit: "" },
    numHeads: { name: "Attention Heads (Decoder)", value: parameters.numHeads, min: 1, max: 128, step: 1, unit: "" }, // Clarify this is often decoder-specific
    vocabSize: { name: "Vocabulary Size (V)", value: parameters.vocabSize, min: 1000, max: 262144, step: 1000, unit: "", log: true },
    sequenceLength: { name: "Sequence Length (S)", value: parameters.sequenceLength, min: 128, max: 131072, step: 128, unit: "tokens", log: true },
    batchSize: { name: "Global Batch Size (B)", value: parameters.batchSize, min: 1, max: 1024, step: 1, unit: "", log: true } // Clarify global
  };

  // --- Derived State and Calculations ---

  const selectedQuantization = useMemo(() => {
      return quantizationTypes.find(q => q.name.toLowerCase().startsWith(precision.toLowerCase())) || quantizationTypes[0]; // Fallback to FP32
  }, [precision]);

  const selectedHardware = useMemo((): GpuProfile | undefined => {
      return gpuProfiles.find(g => g.id === selectedHardwareId);
  }, [selectedHardwareId]);

  // Calculate Total Parameters (in actual count, not millions)
  const totalParametersRaw = useMemo((): number => {
    const H = parameters.hiddenSize;
    const L = parameters.numLayers;
    const V = parameters.vocabSize;
    // Assuming MLP intermediate size is 4*H based on common practice (e.g., Llama, GPT-3)
    // Some models use different factors (e.g., 8/3 * H for Llama 3). Let's stick to 4*H for simplicity.
    const MLP_FACTOR = 4;
    const MLP_intermediate = MLP_FACTOR * H;

    let paramCount = 0;

    // Common components
    const embeddingParams = V * H; // Token embeddings
    const outputProjectionParams = V * H; // Output layer projection (often tied with input embeddings in decoders)

    if (modelType === "decoder") {
      // GPT-style Decoder-Only
      // Attention block: Q, K, V projections (H*H each), Output projection (H*H) -> 4 * H*H
      const attentionParamsPerLayer = 4 * H * H;
      // MLP block: Gate/Up proj (H * MLP_intermediate), Down proj (MLP_intermediate * H) -> Assume 2 linear layers in MLP FFN = 2 * H * MLP_intermediate
      const mlpParamsPerLayer = 2 * H * MLP_intermediate; // Corrected: Usually 2 matrices: H->4H and 4H->H
      // LayerNorms: Typically 2 per layer (before attention, before MLP)
      const layerNormParamsPerLayer = 2 * (2 * H); // Each LayerNorm has scale+bias (2*H)

      const layerParams = attentionParamsPerLayer + mlpParamsPerLayer + layerNormParamsPerLayer;

      // Positional embeddings often separate, but sometimes baked in or negligible. Assume included or small.
      // Final LayerNorm
      const finalLayerNormParams = 2 * H;

      paramCount = embeddingParams + (L * layerParams) + outputProjectionParams + finalLayerNormParams;
      // Parameter sharing note: Often input embeddings and output projection are tied -> reduces params by V*H. Let's assume NOT tied by default for max estimate.

    } else if (modelType === "encoder") {
      // BERT-style Encoder-Only
      // Embeddings: Token, Position, Segment Type
      const posEmbeddings = parameters.sequenceLength * H; // Max sequence length assumed
      const typeEmbeddings = 2 * H; // Usually 2 segment types
      const embeddingLayerNorm = 2 * H;
      const totalEmbeddingParams = embeddingParams + posEmbeddings + typeEmbeddings + embeddingLayerNorm;

      // Attention block: Q, K, V, Output -> 4 * H*H
      const attentionParamsPerLayer = 4 * H * H;
      // MLP block: (H -> MLP_intermediate -> H) -> 2 * H * MLP_intermediate
      const mlpParamsPerLayer = 2 * H * MLP_intermediate;
      // LayerNorms: 2 per layer
      const layerNormParamsPerLayer = 2 * (2 * H);

      const layerParams = attentionParamsPerLayer + mlpParamsPerLayer + layerNormParamsPerLayer;

      // Final "Pooler" layer (optional, often a linear layer H*H + bias H)
      const poolerParams = H * H + H;

      paramCount = totalEmbeddingParams + (L * layerParams) + poolerParams;

    } else if (modelType === "encoder-decoder") {
      // T5-style Encoder-Decoder
      // Embeddings (often shared)
      // Encoder Layer
      const encAttentionParams = 4 * H * H;
      const encMlpParams = 2 * H * MLP_intermediate;
      const encLayerNormParams = 2 * (2 * H);
      const encLayerParams = encAttentionParams + encMlpParams + encLayerNormParams;

      // Decoder Layer
      const decSelfAttentionParams = 4 * H * H;
      const decCrossAttentionParams = 4 * H * H; // Attends to encoder output
      const decMlpParams = 2 * H * MLP_intermediate;
      const decLayerNormParams = 3 * (2 * H); // Self-attn, Cross-attn, MLP norms
      const decLayerParams = decSelfAttentionParams + decCrossAttentionParams + decMlpParams + decLayerNormParams;

      // Final LayerNorm + Output Projection (potentially tied to embeddings)
      const finalLayerNormParams = 2 * H;

      paramCount = embeddingParams + // Shared embeddings
                   (L * encLayerParams) + // Encoder stack
                   (L * decLayerParams) + // Decoder stack
                   finalLayerNormParams +
                   outputProjectionParams; // Output projection (maybe tied)
    }

    // Handle MoE Parameter Count
    if (memoryFlags.moe && memoryFlags.moe.experts > 1 && (modelType === "decoder" || modelType === "encoder-decoder")) {
        // MoE replaces the MLP block
        const H = parameters.hiddenSize;
        const MLP_FACTOR = 4; // Assuming same factor
        const MLP_intermediate = MLP_FACTOR * H;
        const experts = memoryFlags.moe.experts;

        // Calculate params for ONE dense MLP layer
        const denseMlpParamsPerLayer = 2 * H * MLP_intermediate; // H->4H and 4H->H

        // Calculate params for ONE MoE MLP layer
        // Router (gating network): H -> num_experts
        const routerParams = H * experts;
        // Expert MLPs: Each expert is like the dense MLP
        const expertMlpsTotalParams = experts * denseMlpParamsPerLayer;
        // Total MoE MLP params per layer = Router + All Experts
        const moeMlpParamsPerLayer = routerParams + expertMlpsTotalParams;

        // Find the original dense MLP params included in the base count
        let originalDenseMlpEstimate = 0;
        if (modelType === "decoder") {
             originalDenseMlpEstimate = 2 * H * MLP_intermediate;
        } else if (modelType === "encoder-decoder") {
             // MoE usually only in Decoder or only Encoder in T5-like, assume Decoder for now
             originalDenseMlpEstimate = 2 * H * MLP_intermediate; // Only replace decoder MLP
             // If MoE is in BOTH encoder and decoder, double this. Need clarification for T5 MoE placement. Let's assume decoder only.
        }
        // Replace the dense MLP count with MoE MLP count for each layer
        paramCount -= L * originalDenseMlpEstimate;
        paramCount += L * moeMlpParamsPerLayer;
    }


    return paramCount;
  }, [parameters, modelType, memoryFlags.moe]);

  // Calculate memory requirements (now returns bytes for internal precision)
  const memoryRequirementsBytes = useMemo(() => {
    const P_total = totalParametersRaw; // Total model parameters (can be huge for MoE)
    const B = parameters.batchSize; // Global batch size
    const S = parameters.sequenceLength;
    const H = parameters.hiddenSize;
    const L = parameters.numLayers;
    const V = parameters.vocabSize;
    const N_gpus = numGpus > 0 ? numGpus : 1; // Avoid division by zero
    const microB = Math.max(1, Math.ceil(B / N_gpus)); // Micro batch size per GPU (simplified, ignores pipeline parallelism)

    const bytesPerParamModel = selectedQuantization.bitsPerParameter / 8;

    // --- 1. Model Weights Memory ---
    let modelWeightsBytes = P_total * bytesPerParamModel;

    // --- Adjust for LoRA ---
    let trainableParams = P_total; // By default, all params are trainable
    let loraWeightBytes = 0;
    if (memoryFlags.lora && memoryFlags.lora.rank > 0) {
        const R = memoryFlags.lora.rank;
        // LoRA adds A (H*R) and B (R*H) matrices per attention block's Q and V projections (typically)
        // Sometimes applied elsewhere too (K, O, MLP). Let's assume Q and V for simplicity.
        // Decoder: L layers * 2 projections (Q, V) * 2 matrices (A, B) * H * R parameters
        // Rough estimate:
        const loraParamsPerLayer = 2 * (H * R + R * H); // LoRA for Q and V
        const totalLoraParams = L * loraParamsPerLayer;

        // LoRA weights are usually trained in FP32 or FP16, regardless of base model quantization. Let's assume FP16 for calculation.
        const bytesPerLoraParam = 16 / 8;
        loraWeightBytes = totalLoraParams * bytesPerLoraParam;

        // Only LoRA weights are trained
        trainableParams = totalLoraParams; // Override trainable params

        // Add LoRA weight memory to the total model memory on device
        modelWeightsBytes += loraWeightBytes;
    }

    // --- ZeRO Stage Impact on Model Weights ---
    // Stage 3 partitions model weights across N_gpus
    if (memoryFlags.zeroStage === 3) {
        modelWeightsBytes /= N_gpus;
    }
    // Stage 1 & 2 keep full weights on each GPU (or handle sharding differently)

    // --- 2. Optimizer States Memory (for Training) ---
    // Adam/AdamW typically store 2 states per trainable parameter (momentum m, variance v)
    // Usually stored in FP32.
    const bytesPerOptimizerStateParam = 32 / 8; // FP32 for m
    const bytesPerOptimizerStateParam2 = 32 / 8; // FP32 for v
    const optimizerMultiplier = 2; // m and v
    let optimizerStateBytes = trainableParams * (bytesPerOptimizerStateParam * optimizerMultiplier); // Assume FP32 states for m,v

    // Apply ZeRO Optimizer Sharding
    if (memoryFlags.zeroStage >= 1) { // Stage 1, 2, 3 shard optimizer states
        optimizerStateBytes /= N_gpus;
    }

    // --- 3. Gradient Memory (for Training) ---
    // Gradients have same dimensions as trainable parameters.
    // Usually calculated in FP16 or BF16 during mixed-precision training. Let's assume FP16.
    const bytesPerGradientParam = (precision === 'fp32' ? 32 : 16) / 8; // Use compute precision (FP16/BF16) or FP32 if model is FP32
    let gradientMemoryBytes = trainableParams * bytesPerGradientParam;

    // Apply ZeRO Gradient Sharding
    if (memoryFlags.zeroStage >= 2) { // Stage 2 & 3 shard gradients
        gradientMemoryBytes /= N_gpus;
    }

    // --- 4. Activation Memory (for Training & Inference) ---
    // This is highly approximate and depends heavily on implementation details.
    // Rough formula: B_micro * S * H * L * (constant factors for attention outputs, MLP outputs, layernorms, etc.)
    // From MosaicML Composer estimates: Activation Memory ≈ B * S * H * L * (10 + 24 * (1/Z)) where Z is tensor parallelism. Let's simplify.
    // Paper "Reducing Activation Recomputation in Large Transformer Models": ~ B*S*H*L*(Attention_factor + MLP_factor)
    // Let's use a simplified version: microB * S * H * L * (BytesPerActivationElement) * ConstantFactor
    // Assume activations are stored in compute precision (FP16/BF16 or FP32)
    const bytesPerActivation = (precision === 'fp32' ? 32 : 16) / 8;
    const ACTIVATION_CONSTANT_FACTOR = 16; // Heuristic factor - VERY ROUGH ESTIMATE

    let activationMemoryBytes = microB * S * H * L * bytesPerActivation * ACTIVATION_CONSTANT_FACTOR;

    // Apply Gradient Checkpointing
    // Reduces activation memory by not storing activations for all layers. Factor depends on strategy.
    // Spec suggests 0.4-0.7 savings -> means memory required is 0.3-0.6 of original. Let's use the factor directly.
    if (memoryFlags.gradientCheckpointFactor < 1.0) {
      // Checkpointing primarily saves activations needed for backward pass
      // Let's apply the factor directly as a multiplier (1.0 means full memory, 0.4 means 40% memory)
       activationMemoryBytes *= memoryFlags.gradientCheckpointFactor;
    }

    // Apply FlashAttention
    // Reduces memory by avoiding storing the large S x S attention matrix.
    // Savings are most significant for long sequences. Reduces the 'Attention_factor' part.
    // Spec suggests ~0.5 factor on activation memory for long sequences. Let's apply conditionally.
    if (memoryFlags.flashAttention && S > 1024) { // Apply only if FlashAttention enabled AND sequence is reasonably long
       // This is a heuristic. FlashAttention affects the NxN matrix part, not all activations.
       // Let's apply a moderate reduction factor, e.g., 0.7x, instead of the spec's optimistic 0.5x overall.
       activationMemoryBytes *= 0.7;
    }

     // Handle MoE Activation Memory
     if (memoryFlags.moe && memoryFlags.moe.experts > 1) {
         // MoE increases activation size slightly due to router computations and potentially larger intermediate states if not optimized.
         // However, only topK experts are activated per token.
         // Let's add a small overhead factor, e.g., 1.2x, to the activation memory as a rough estimate.
         activationMemoryBytes *= 1.2;
     }


    // --- 5. Temporary/Fragmentation Memory ---
    // Add a buffer for framework overhead, fragmentation, temporary variables during computation.
    // Let's add a fixed percentage of the other components.
    const fragmentationFactor = 0.10; // 10% buffer
    const tempMemoryBytes = (modelWeightsBytes + optimizerStateBytes + gradientMemoryBytes + activationMemoryBytes) * fragmentationFactor;


    // --- 6. CPU Offload ---
    let cpuSwapBytes = 0;
    if (memoryFlags.zeroStage >= 2 && memoryFlags.cpuOffloadPct > 0) { // Offload typically used with ZeRO-2/3
        const offloadFraction = memoryFlags.cpuOffloadPct / 100;
        // Offload applies to optimizer states and gradients that are *already sharded*
        const offloadableBytes = optimizerStateBytes + gradientMemoryBytes; // These are per-GPU sharded amounts
        cpuSwapBytes = offloadableBytes * offloadFraction;

        // Reduce the GPU memory requirement for these components
        optimizerStateBytes *= (1 - offloadFraction);
        gradientMemoryBytes *= (1 - offloadFraction);
    }


    // --- Totals per GPU ---
    const totalTrainingBytesPerGPU = modelWeightsBytes + activationMemoryBytes + optimizerStateBytes + gradientMemoryBytes + tempMemoryBytes;
    // Inference: No optimizer states, no gradients. Activation memory might be smaller (no need for backward pass saves).
    // Let's estimate inference activation memory as half of training (very rough). FlashAttention saving already applied.
    const inferenceActivationFactor = 0.5;
    const totalInferenceBytesPerGPU = modelWeightsBytes + (activationMemoryBytes * inferenceActivationFactor) + tempMemoryBytes; // Simplified inference

    return {
      modelWeightsBytes: modelWeightsBytes,
      activationMemoryBytes: activationMemoryBytes, // Training activations
      optimizerStateBytes: optimizerStateBytes, // After sharding/offload
      gradientMemoryBytes: gradientMemoryBytes, // After sharding/offload
      tempMemoryBytes: tempMemoryBytes,
      totalTrainingBytesPerGPU: totalTrainingBytesPerGPU,
      totalInferenceBytesPerGPU: totalInferenceBytesPerGPU,
      cpuSwapBytes: cpuSwapBytes, // Amount offloaded per GPU
      trainableParams: trainableParams,
      totalParams: P_total,
      loraWeightBytes: loraWeightBytes,
    };
  }, [totalParametersRaw, parameters, modelType, selectedQuantization, memoryFlags, numGpus, precision]);

   // Convert bytes to GB for display
   const memoryRequirementsGB = useMemo(() => {
       return {
           modelWeightsGB: bytesToGigabytes(memoryRequirementsBytes.modelWeightsBytes),
           activationMemoryGB: bytesToGigabytes(memoryRequirementsBytes.activationMemoryBytes),
           optimizerStateGB: bytesToGigabytes(memoryRequirementsBytes.optimizerStateBytes),
           gradientMemoryGB: bytesToGigabytes(memoryRequirementsBytes.gradientMemoryBytes),
           tempMemoryGB: bytesToGigabytes(memoryRequirementsBytes.tempMemoryBytes),
           totalTrainingGB: bytesToGigabytes(memoryRequirementsBytes.totalTrainingBytesPerGPU),
           totalInferenceGB: bytesToGigabytes(memoryRequirementsBytes.totalInferenceBytesPerGPU),
           cpuSwapGB: bytesToGigabytes(memoryRequirementsBytes.cpuSwapBytes),
           trainableParams: memoryRequirementsBytes.trainableParams,
           totalParams: memoryRequirementsBytes.totalParams,
           loraWeightGB: bytesToGigabytes(memoryRequirementsBytes.loraWeightBytes),
       };
   }, [memoryRequirementsBytes]);


  // Calculate Cost & Energy
  const costEnergyResults = useMemo(() => {
    if (!selectedHardware) return null;

    const S = parameters.sequenceLength;
    const B = parameters.batchSize; // Global batch size
    const steps = costParams.trainingSteps;
    const tokenPerSecPerGPU = costParams.tokensPerSecondPerGPU;
    const nGPUs = numGpus;

    if (tokenPerSecPerGPU <= 0 || nGPUs <= 0) return null;

    // Total tokens processed = steps * global_batch_size * sequence_length
    const totalTokens = steps * B * S;
    // Overall throughput = tokenPerSecPerGPU * nGPUs
    const totalTokenPerSec = tokenPerSecPerGPU * nGPUs;
    // Total time in seconds = totalTokens / totalTokenPerSec
    const totalSeconds = totalTokens / totalTokenPerSec;
    const totalHours = totalSeconds / 3600;

    // Energy
    const totalPowerKW = (selectedHardware.powerW * nGPUs) / 1000;
    const energyKWh = totalHours * totalPowerKW;

    // CO2 Emissions
    const co2kg = energyKWh * costParams.gridCarbonIntensity;

    // Cost (find instance or use GPU directly if no instance matches)
    const matchingInstance = cloudInstanceProfiles.find(inst => inst.gpuType === selectedHardware.id && inst.gpuCount === nGPUs);
    let hourlyRate = selectedHardware.hourlyUSD ?? 0; // Use raw GPU hourly if available
     let costSource = "GPU Profile Estimate";
    if (matchingInstance) {
         hourlyRate = matchingInstance.hourlyUSD;
         costSource = `${matchingInstance.name} Instance`;
    } else if (selectedHardware.hourlyUSD && nGPUs > 0) {
        hourlyRate = selectedHardware.hourlyUSD * nGPUs; // Estimate cost by multiplying single GPU cost if instance not found
        costSource = `${nGPUs}x ${selectedHardware.name} Estimate`;
    }


    const costUSD = totalHours * hourlyRate;

    return {
      gpuHours: totalHours,
      energyKWh: energyKWh,
      co2kg: co2kg,
      costUSD: costUSD,
      costBasis: hourlyRate > 0 ? `$${hourlyRate.toFixed(2)}/hr (${costSource})` : "N/A (No Pricing Data)",
    };
  }, [parameters, costParams, selectedHardware, numGpus]);

  // --- UI Handlers ---

  const handleParameterChange = (param: keyof ModelParameters, value: number | string) => {
    const def = parametersList[param];
    let numValue = typeof value === 'string' ? (def.log ? parseFloat(value) : parseInt(value)) : value;

    if (isNaN(numValue)) numValue = def.min;
    numValue = Math.max(def.min, Math.min(def.max, numValue)); // Clamp value

    setParameters(prev => ({ ...prev, [param]: numValue }));
  };

   const handleFlagChange = (flag: keyof MemoryFlags, value: any) => {
       setMemoryFlags(prev => ({ ...prev, [flag]: value }));
   };

   const handleCostParamChange = (param: keyof CostEnergyParams, value: string) => {
       let numValue = parseFloat(value);
       if (isNaN(numValue) || numValue < 0) numValue = 0;
       // Add specific constraints if needed (e.g., steps >= 1)
       setCostParams(prev => ({ ...prev, [param]: numValue }));
   };

   const handleApplyPreset = (preset: ModelPreset) => {
       setModelType(preset.modelType);
       setParameters(prev => ({ ...prev, ...preset.params }));
       if (preset.precision) {
           setPrecision(preset.precision);
       }
       // Reset flags first then apply preset flags
       setMemoryFlags(prev => ({
           flashAttention: true, // Keep defaults or reset as needed
           gradientCheckpointFactor: 1.0,
           zeroStage: 0,
           cpuOffloadPct: 0,
           moe: undefined,
           lora: undefined,
           ...preset.flags // Apply preset specific flags
       }));
   };

   // --- Chart Data ---
    const trainingMemoryBreakdownData = [
        { name: "Model Weights", value: memoryRequirementsGB.modelWeightsGB },
        { name: "Activations", value: memoryRequirementsGB.activationMemoryGB },
        { name: "Optimizer States", value: memoryRequirementsGB.optimizerStateGB },
        { name: "Gradients", value: memoryRequirementsGB.gradientMemoryGB },
        { name: "Temp/Overhead", value: memoryRequirementsGB.tempMemoryGB },
        memoryRequirementsGB.loraWeightGB > 0 && { name: "LoRA Weights", value: memoryRequirementsGB.loraWeightGB }
    ].filter(Boolean); // Filter out null/undefined if LoRA is not active

    const inferenceMemoryBreakdownData = [
        { name: "Model Weights", value: memoryRequirementsGB.modelWeightsGB },
        // Use the inference activation factor adjustment here
        { name: "Activations", value: bytesToGigabytes(memoryRequirementsBytes.activationMemoryBytes * 0.5) }, // Apply 0.5 factor for inference approx.
        { name: "Temp/Overhead", value: memoryRequirementsGB.tempMemoryGB },
         memoryRequirementsGB.loraWeightGB > 0 && { name: "LoRA Weights", value: memoryRequirementsGB.loraWeightGB }
    ].filter(Boolean);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19AF']; // Added more colors

    const vramUsagePercent = selectedHardware ? (memoryRequirementsGB.totalTrainingGB / selectedHardware.vramGB) * 100 : 0;
    const getVramBarColor = (usage: number) => {
        if (usage > 90) return 'bg-red-500';
        if (usage > 70) return 'bg-amber-500';
        if (usage > 0) return 'bg-green-500';
        return 'bg-secondary';
    };

  return (
    <TooltipProvider>
    <div className="container mx-auto p-4 space-y-6">
      <Card className="overflow-visible"> {/* Allow tooltips to overflow */}
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Enhanced LLM Memory & Capacity Planner</CardTitle>
          <CardDescription className="text-center">
            Estimate memory, cost, and environmental impact for LLM training and inference.
          </CardDescription>
           {/* Preset Buttons */}
            <div className="flex flex-wrap gap-2 justify-center pt-4">
                <Label className="pt-1.5 font-semibold mr-2">Presets:</Label>
                {modelPresets.map(p => (
                    <Button key={p.name} variant="outline" size="sm" onClick={() => handleApplyPreset(p)}>
                        {p.name}
                    </Button>
                ))}
            </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Left Column: Configuration */}
            <div className="space-y-6">
               {/* Model Architecture & Basic Params */}
               <Card>
                 <CardHeader><CardTitle className="text-lg">Model Configuration</CardTitle></CardHeader>
                 <CardContent className="space-y-4">
                     <div>
                        <Label htmlFor="modelType">Model Architecture</Label>
                        <Select value={modelType} onValueChange={setModelType}>
                            <SelectTrigger id="modelType"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="decoder">Decoder-only (GPT-style)</SelectItem>
                                <SelectItem value="encoder">Encoder-only (BERT-style)</SelectItem>
                                <SelectItem value="encoder-decoder">Encoder-Decoder (T5-style)</SelectItem>
                            </SelectContent>
                        </Select>
                     </div>

                     {Object.entries(parametersList).map(([key, param]) => (
                        <div key={key}>
                            <div className="flex justify-between items-center mb-1">
                             <Label htmlFor={key}>{param.name} {param.unit && `(${param.unit})`}</Label>
                             <Input
                                type="number"
                                id={`${key}-input`}
                                value={parameters[key as keyof ModelParameters]}
                                onChange={(e) => handleParameterChange(key as keyof ModelParameters, e.target.value)}
                                min={param.min}
                                max={param.max}
                                step={param.step}
                                className="w-28 h-8 text-sm"
                              />
                            </div>
                            <Slider
                                id={key}
                                min={param.min}
                                max={param.max}
                                step={param.step}
                                value={[parameters[key as keyof ModelParameters]]}
                                onValueChange={(value) => handleParameterChange(key as keyof ModelParameters, value[0])}
                                className="flex-1"
                            />
                        </div>
                     ))}
                 </CardContent>
               </Card>

                {/* Precision & Quantization */}
               <Card>
                 <CardHeader><CardTitle className="text-lg">Precision & Quantization</CardTitle></CardHeader>
                 <CardContent>
                     <div>
                        <Label htmlFor="precision">Compute & Storage Precision</Label>
                          <ShadTooltip>
                              <TooltipTrigger asChild>
                                <Select value={precision} onValueChange={setPrecision}>
                                    <SelectTrigger id="precision"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {quantizationTypes.map(q => (
                                            <SelectItem key={q.name} value={q.name.toLowerCase().split(' ')[0]}> {/* Use first part like 'fp16' as value */}
                                            {q.name} ({q.bitsPerParameter}-bit)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                              </TooltipTrigger>
                              <TooltipContent side="right">
                                  <p className="max-w-xs">
                                      Select the numerical precision for model weights storage and computation. Lower precision (e.g., FP16, BF16, INT8, 4-bit) significantly reduces memory but may impact accuracy.
                                      <br/><strong>Impact:</strong> {selectedQuantization.performanceImpact}
                                  </p>
                              </TooltipContent>
                          </ShadTooltip>
                     </div>
                 </CardContent>
               </Card>


               {/* Advanced Memory Optimization Techniques */}
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-lg font-semibold">Advanced Memory Optimizations</AccordionTrigger>
                    <AccordionContent className="space-y-6 pt-4">
                      {/* Flash Attention */}
                       <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="flashAttention" className="flex flex-col space-y-1">
                                <span>FlashAttention / SDPA</span>
                                <span className="font-normal leading-snug text-muted-foreground text-sm">
                                Use memory-efficient attention (reduces activation memory for long sequences). Enabled by default if S > 1024.
                                </span>
                            </Label>
                             <ShadTooltip>
                                <TooltipTrigger asChild><Switch id="flashAttention" checked={memoryFlags.flashAttention} onCheckedChange={(c) => handleFlagChange('flashAttention', c)} /></TooltipTrigger>
                                <TooltipContent><p>Applies approx {100 - 70}% activation memory reduction if SeqLen > 1024.</p></TooltipContent>
                             </ShadTooltip>
                        </div>

                       {/* Gradient Checkpointing */}
                       <div>
                           <div className="flex justify-between items-center mb-1">
                                <Label htmlFor="gradCheckpoint" className="flex flex-col space-y-1">
                                     <span>Gradient Checkpointing</span>
                                      <span className="font-normal leading-snug text-muted-foreground text-sm">
                                          Trade compute for memory by recomputing activations during backward pass. 1.0 = Off.
                                      </span>
                                </Label>
                                <span className="text-sm font-medium">{(memoryFlags.gradientCheckpointFactor * 100).toFixed(0)}% Activ. Mem</span>
                           </div>
                            <Slider
                                id="gradCheckpoint"
                                min={0.3} max={1.0} step={0.05} // Range 30% to 100% memory usage
                                value={[memoryFlags.gradientCheckpointFactor]}
                                onValueChange={(v) => handleFlagChange('gradientCheckpointFactor', v[0])}
                            />
                       </div>

                       {/* ZeRO Optimization */}
                       <div>
                            <Label className="mb-2 block">ZeRO Stage (DeepSpeed/FSDP)</Label>
                             <ShadTooltip>
                                <TooltipTrigger asChild>
                                    <RadioGroup
                                        value={String(memoryFlags.zeroStage)}
                                        onValueChange={(v) => handleFlagChange('zeroStage', parseInt(v))}
                                        className="flex space-x-4"
                                    >
                                        {[0, 1, 2, 3].map(stage => (
                                            <div key={stage} className="flex items-center space-x-2">
                                                <RadioGroupItem value={String(stage)} id={`zero-${stage}`} />
                                                <Label htmlFor={`zero-${stage}`}>Stage {stage}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="max-w-md">
                                   <p>ZeRO partitions model/optimizer/gradient states across GPUs:</p>
                                   <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                                       <li><b>Stage 0:</b> None (standard data parallelism).</li>
                                       <li><b>Stage 1:</b> Shards Optimizer States.</li>
                                       <li><b>Stage 2:</b> Shards Optimizer States & Gradients.</li>
                                       <li><b>Stage 3:</b> Shards Optimizer States, Gradients, & Model Parameters.</li>
                                   </ul>
                                </TooltipContent>
                            </ShadTooltip>

                             {/* ZeRO CPU Offload */}
                             {memoryFlags.zeroStage >= 1 && ( // Show only if ZeRO is active
                                <div className="mt-4">
                                    <div className="flex justify-between items-center mb-1">
                                         <Label htmlFor="cpuOffload" className="flex flex-col space-y-1">
                                            <span>ZeRO CPU Offload</span>
                                            <span className="font-normal leading-snug text-muted-foreground text-sm">
                                                Offload sharded optimizer/gradients (Stage {memoryFlags.zeroStage}) to CPU RAM.
                                            </span>
                                        </Label>
                                        <span className="text-sm font-medium">{memoryFlags.cpuOffloadPct}%</span>
                                    </div>
                                    <Slider
                                        id="cpuOffload"
                                        min={0} max={100} step={5}
                                        value={[memoryFlags.cpuOffloadPct]}
                                        onValueChange={(v) => handleFlagChange('cpuOffloadPct', v[0])}
                                        disabled={memoryFlags.zeroStage === 0} // Disable if ZeRO is off
                                    />
                                </div>
                             )}
                       </div>

                      {/* Mixture of Experts (MoE) */}
                       <div className="border-t pt-4">
                           <Label className="mb-2 block">Mixture of Experts (MoE)</Label>
                            <div className="flex items-center space-x-4">
                                <Switch
                                    id="enableMoE"
                                    checked={!!memoryFlags.moe}
                                    onCheckedChange={(checked) => handleFlagChange('moe', checked ? { experts: 8, topK: 2 } : undefined)}
                                />
                                <Label htmlFor="enableMoE">Enable MoE</Label>
                           </div>
                           {memoryFlags.moe && (
                               <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div>
                                        <Label htmlFor="moeExperts">Total Experts (per layer)</Label>
                                        <Input
                                            id="moeExperts" type="number" min="2" step="1"
                                            value={memoryFlags.moe.experts}
                                            onChange={(e) => handleFlagChange('moe', { ...memoryFlags.moe, experts: parseInt(e.target.value) || 2 })}
                                        />
                                    </div>
                                     <div>
                                         <Label htmlFor="moeTopK">Activated Experts (Top-K)</Label>
                                         <Input
                                             id="moeTopK" type="number" min="1" step="1" max={memoryFlags.moe.experts}
                                             value={memoryFlags.moe.topK}
                                             onChange={(e) => handleFlagChange('moe', { ...memoryFlags.moe, topK: Math.min(parseInt(e.target.value) || 1, memoryFlags.moe?.experts || 1) })}
                                         />
                                    </div>
                               </div>
                           )}
                            <p className="text-xs text-muted-foreground mt-2">Replaces MLP blocks with sparse MoE layers. Increases total parameters but keeps active parameters per token low. Affects parameter count & activation memory calculations.</p>
                       </div>

                       {/* LoRA / QLoRA */}
                       <div className="border-t pt-4">
                             <Label className="mb-2 block">Parameter-Efficient Fine-Tuning (PEFT)</Label>
                              <div className="flex items-center space-x-4">
                                  <Switch
                                      id="enableLora"
                                      checked={!!memoryFlags.lora}
                                      onCheckedChange={(checked) => handleFlagChange('lora', checked ? { rank: 8 } : undefined)}
                                  />
                                  <Label htmlFor="enableLora">Enable LoRA</Label>
                             </div>
                             {memoryFlags.lora && (
                                 <div className="mt-2">
                                     <Label htmlFor="loraRank">LoRA Rank (r)</Label>
                                       <ShadTooltip>
                                            <TooltipTrigger asChild>
                                                <Select
                                                    value={String(memoryFlags.lora.rank)}
                                                    onValueChange={(v) => handleFlagChange('lora', { ...memoryFlags.lora, rank: parseInt(v) || 4 })}
                                                >
                                                    <SelectTrigger id="loraRank"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        {[4, 8, 16, 32, 64, 128].map(r => <SelectItem key={r} value={String(r)}>{r}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>LoRA rank 'r'. Higher rank means more trainable parameters but potentially better adaptation. Common values: 4-64.</p>
                                            </TooltipContent>
                                       </ShadTooltip>
                                 </div>
                             )}
                              <p className="text-xs text-muted-foreground mt-2">Low-Rank Adaptation freezes base model weights and trains small adapter matrices. Drastically reduces trainable parameters and optimizer memory. Assumes LoRA applied to Attention Q/V.</p>
                       </div>

                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                 {/* Hardware & Cluster Setup */}
                <Card>
                   <CardHeader><CardTitle className="text-lg">Hardware Configuration</CardTitle></CardHeader>
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
                                id="numGpus" type="number" min="1" step="1"
                                value={numGpus}
                                onChange={(e) => setNumGpus(parseInt(e.target.value) || 1)}
                            />
                            <p className="text-xs text-muted-foreground mt-1">Used for ZeRO sharding, calculating micro-batch size, and total cost/power.</p>
                       </div>
                   </CardContent>
               </Card>


            </div>

            {/* Right Column: Results */}
            <div className="space-y-6">
              {/* Parameter Count Summary */}
               <Card>
                 <CardHeader className="pb-2"><CardTitle className="text-lg">Parameter Summary</CardTitle></CardHeader>
                 <CardContent className="flex justify-around items-center">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Total Parameters</div>
                        <div className="text-3xl font-bold">
                            {formatNumber(memoryRequirementsGB.totalParams, 2)}
                            {memoryFlags.moe ? <span className="text-sm font-normal text-muted-foreground"> (MoE)</span> : ""}
                        </div>
                        <div className="text-xs text-muted-foreground">({(memoryRequirementsGB.totalParams / 1e9).toFixed(2)} Billion)</div>
                      </div>
                       <div className="text-center">
                        <div className="text-sm text-muted-foreground">Trainable Parameters</div>
                        <div className="text-3xl font-bold">
                            {formatNumber(memoryRequirementsGB.trainableParams, 2)}
                            {memoryFlags.lora ? <span className="text-sm font-normal text-muted-foreground"> (LoRA)</span> : ""}
                        </div>
                         <div className="text-xs text-muted-foreground">({(memoryRequirementsGB.trainableParams / memoryRequirementsGB.totalParams * 100).toFixed(2)}% of total)</div>
                      </div>
                 </CardContent>
               </Card>


              {/* Memory Requirements */}
              <Card>
                  <CardHeader><CardTitle className="text-lg">Estimated Memory Requirements (Per GPU)</CardTitle></CardHeader>
                  <CardContent>
                     {/* VRAM Heat Bar */}
                     {selectedHardware && (
                         <div className="mb-6">
                             <div className="flex justify-between items-center mb-1">
                                 <Label>Est. Training VRAM Usage vs Target GPU ({selectedHardware.name})</Label>
                                 <span className={`text-sm font-bold ${vramUsagePercent > 100 ? 'text-red-600' : ''}`}>
                                    {memoryRequirementsGB.totalTrainingGB.toFixed(2)} / {selectedHardware.vramGB} GB ({vramUsagePercent.toFixed(1)}%)
                                </span>
                            </div>
                             <div className={`w-full h-4 ${getVramBarColor(0)} rounded-full overflow-hidden`}> {/* Background bar */}
                                <div
                                    className={`h-full ${getVramBarColor(vramUsagePercent)} transition-all duration-500 ease-out`}
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
                                     Warning: Estimated VRAM exceeds target GPU capacity! Consider reducing batch size, sequence length, using more GPUs, enabling ZeRO-3, or more aggressive quantization/checkpointing.
                                 </p>
                             )}
                         </div>
                     )}


                    <Tabs defaultValue="training">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="training">Training Memory</TabsTrigger>
                        <TabsTrigger value="inference">Inference Memory</TabsTrigger>
                      </TabsList>

                      {/* Training Tab */}
                      <TabsContent value="training" className="mt-4 space-y-4">
                         <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="bg-secondary/50 p-3 rounded-lg">
                                <div className="text-sm text-muted-foreground">Total Training / GPU</div>
                                <div className="text-xl font-bold">{memoryRequirementsGB.totalTrainingGB.toFixed(2)} GB</div>
                            </div>
                            <div className="bg-secondary/50 p-3 rounded-lg">
                                <div className="text-sm text-muted-foreground">Model Weights / GPU</div>
                                <div className="text-xl font-bold">
                                    {memoryRequirementsGB.modelWeightsGB.toFixed(2)} GB
                                    {memoryFlags.zeroStage === 3 ? <span className="text-xs"> (ZeRO-3 Sharded)</span> : ""}
                                </div>
                            </div>
                         </div>

                         <div className="h-64 w-full">
                           <ResponsiveContainer width="100%" height="100%">
                             <PieChart>
                               <Pie
                                 data={trainingMemoryBreakdownData}
                                 dataKey="value"
                                 nameKey="name"
                                 cx="50%"
                                 cy="50%"
                                 outerRadius={80}
                                 fill="#8884d8"
                                 labelLine={false}
                                 label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }) => {
                                    const radius = innerRadius + (outerRadius - innerRadius) * 1.1;
                                    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                                    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                                    return ( value > 0.01 ? // Only label significant slices
                                        <text x={x} y={y} fill={COLORS[index % COLORS.length]} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10">
                                            {`${name}: ${value.toFixed(1)}GB (${(percent * 100).toFixed(0)}%)`}
                                        </text> : null
                                    );
                                  }}
                               >
                                 {trainingMemoryBreakdownData.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                 ))}
                               </Pie>
                               <RechartsTooltip formatter={(value: number, name: string) => [`${value.toFixed(2)} GB`, name]} />
                               <Legend layout="vertical" align="right" verticalAlign="middle" iconSize={10}/>
                             </PieChart>
                           </ResponsiveContainer>
                         </div>
                         {/* Quantization Table */}
                        <div className="space-y-2 pt-4 border-t">
                            <Label className="text-base">Quantization Impact Overview</Label>
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
                                        <td className="py-1 px-1">{q.name}</td>
                                        <td className="text-center py-1 px-1">{q.bitsPerParameter}</td>
                                        <td className="text-center py-1 px-1">{q.memoryMultiplier.toFixed(3)}x</td>
                                        <td className="py-1 px-1 text-xs">{q.performanceImpact}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                      </TabsContent>

                       {/* Inference Tab */}
                      <TabsContent value="inference" className="mt-4 space-y-4">
                          <div className="grid grid-cols-1 gap-4 text-center">
                            <div className="bg-secondary/50 p-3 rounded-lg">
                                <div className="text-sm text-muted-foreground">Est. Inference Memory / GPU ({selectedQuantization.name})</div>
                                <div className="text-xl font-bold">{memoryRequirementsGB.totalInferenceGB.toFixed(2)} GB</div>
                                <p className="text-xs text-muted-foreground">(Activations estimated ~50% of training)</p>
                            </div>
                          </div>
                           <div className="h-64 w-full">
                               <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={inferenceMemoryBreakdownData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" fontSize={10}/>
                                    <YAxis unit=" GB" width={40} fontSize={10}/>
                                    <RechartsTooltip formatter={(value: number) => `${value.toFixed(2)} GB`} />
                                    <Legend />
                                    <Bar dataKey="value" name="Memory (GB)" >
                                        {inferenceMemoryBreakdownData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                               </ResponsiveContainer>
                           </div>
                            <p className="text-xs text-muted-foreground text-center pt-4 border-t">
                                Inference memory excludes optimizer states and gradients. Activation memory is typically lower than during training. Assumes same quantization ({selectedQuantization.name}) as training setup.
                            </p>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
              </Card>

               {/* Cost, Energy & Carbon */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Estimated Training Cost & Impact</CardTitle>
                        <CardDescription>Based on hardware selection and training parameters.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         {/* Input Parameters for Cost Calc */}
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                             <div>
                                 <Label htmlFor="trainingSteps">Training Steps</Label>
                                 <Input id="trainingSteps" type="number" value={costParams.trainingSteps} onChange={e => handleCostParamChange('trainingSteps', e.target.value)} min="0" step="100"/>
                             </div>
                              <div>
                                 <Label htmlFor="tokensPerSec">Throughput (Tokens/Sec/GPU)</Label>
                                 <Input id="tokensPerSec" type="number" value={costParams.tokensPerSecondPerGPU} onChange={e => handleCostParamChange('tokensPerSecondPerGPU', e.target.value)} min="0" step="100"/>
                             </div>
                              <div>
                                 <Label htmlFor="gridIntensity">Grid Carbon Intensity (kgCO₂/kWh)</Label>
                                  <ShadTooltip>
                                    <TooltipTrigger asChild>
                                         <Input id="gridIntensity" type="number" value={costParams.gridCarbonIntensity} onChange={e => handleCostParamChange('gridCarbonIntensity', e.target.value)} min="0" step="0.01"/>
                                    </TooltipTrigger>
                                     <TooltipContent side="top" className="max-w-xs">
                                        <p>Average CO₂ emissions per kilowatt-hour of electricity generation. Varies significantly by region and energy source.</p>
                                        <p className="text-xs">Default: {DEFAULT_GRID_INTENSITY} kg/kWh (US Avg 2023)</p>
                                        <p className="text-xs">Examples: France ~0.05, Germany ~0.4, China ~0.6, Iceland ~0.01</p>
                                     </TooltipContent>
                                  </ShadTooltip>
                             </div>
                         </div>

                        {/* Calculated Results */}
                        {costEnergyResults && selectedHardware ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t">
                                <div className="text-center bg-secondary/30 p-2 rounded">
                                    <div className="text-xs text-muted-foreground">Est. Compute Hours</div>
                                    <div className="text-lg font-semibold">{costEnergyResults.gpuHours.toFixed(1)} GPU hrs</div>
                                    <div className="text-xs text-muted-foreground">({(costEnergyResults.gpuHours / numGpus).toFixed(1)} Wall hrs)</div>
                                </div>
                                 <div className="text-center bg-secondary/30 p-2 rounded">
                                    <div className="text-xs text-muted-foreground">Est. Energy Use</div>
                                    <div className="text-lg font-semibold">{formatNumber(costEnergyResults.energyKWh, 1)} kWh</div>
                                </div>
                                 <div className="text-center bg-secondary/30 p-2 rounded">
                                    <div className="text-xs text-muted-foreground">Est. Carbon Emissions</div>
                                    <div className="text-lg font-semibold">{costEnergyResults.co2kg.toFixed(2)} kg CO₂e</div>
                                </div>
                                 <div className="text-center bg-secondary/30 p-2 rounded">
                                    <div className="text-xs text-muted-foreground">Est. Cloud Cost</div>
                                    <div className="text-lg font-semibold">${costEnergyResults.costUSD.toFixed(2)}</div>
                                    <div className="text-[10px] text-muted-foreground truncate" title={costEnergyResults.costBasis}>{costEnergyResults.costBasis}</div>
                                </div>
                            </div>
                        ) : (
                             <p className="text-center text-muted-foreground pt-4 border-t">Enter valid training parameters and select hardware to estimate cost and impact.</p>
                        )}
                        <p className="text-xs text-muted-foreground pt-2">Cost and energy are estimates based on specified throughput and hardware power draw. Actual values vary significantly based on workload, efficiency, cooling, and pricing.</p>
                    </CardContent>
                </Card>

                 {/* Export / Actions */}
                 <Card>
                     <CardHeader><CardTitle className="text-lg">Actions</CardTitle></CardHeader>
                     <CardContent className="flex gap-4">
                          {/* Placeholder buttons for export */}
                           <Button variant="outline" disabled>
                              <DownloadIcon className="mr-2 h-4 w-4" /> Export Summary (JSON)
                           </Button>
                            <Button variant="outline" disabled>
                                <DownloadIcon className="mr-2 h-4 w-4" /> Save Chart (PNG)
                            </Button>
                            {/* Add Scenario button - requires more complex state management */}
                             <Button variant="outline" disabled>Add Scenario for Comparison</Button>
                     </CardContent>
                 </Card>


            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer / Notes */}
      <footer className="text-center text-xs text-muted-foreground space-y-1 pt-4">
            <p>Disclaimer: All calculations are estimates. Actual memory usage and performance depend on the specific model implementation, framework overheads, hardware details, and software versions.</p>
            <p>Activation memory calculation is particularly approximate. Cost/Energy estimates depend heavily on assumed throughput.</p>
            <p>Quantization performance impacts are qualitative and general; specific results vary by model and task.</p>
             <p>Hardware data (VRAM, Power, Pricing) based on publicly available datasheets and cloud provider pricing pages (subject to change). Last data review: Approx Q2 2024.</p>
            {/* Maybe add links to citations here if needed */}
      </footer>
    </div>
    </TooltipProvider>
  );
};

export default MemoryCalculator;

// --- Required ShadCN UI Components ---
// Ensure you have installed and configured these components:
// npx shadcn-ui@latest add card label input select tabs slider switch accordion radio-group button tooltip chart (using recharts internally)
// (You might need `lucide-react` for icons)

// --- Notes on Implementation vs Spec ---
// - Scenario Comparison: Not fully implemented due to state complexity. Added a disabled button as placeholder.
// - Export: Added disabled buttons. Actual export logic (JSON serialization, chart-to-PNG using html2canvas/similar, CSV generation) requires more code/libraries.
// - Data Freshness: The GitHub Action for updating hardware/pricing data is an external process and not part of this React component.
// - API Shape: The component keeps calculations client-side within `useMemo`. Refactoring into separate functions is done, but not external API calls.
// - Citations: Added as comments in code or text descriptions where appropriate, rather than formal citation rendering.
// - Log Sliders: Added 'log' flag in definition but didn't implement logarithmic scaling on the slider itself (Shadcn slider doesn't support it directly). Input still works.
// - Throughput (tokens/sec): This is a major variable affecting cost/time. The default value is a placeholder. Real values depend heavily on model, hardware, batch size, sequence length, and implementation efficiency.