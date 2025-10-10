// Mock data for AI alternatives - can be replaced with API data

export interface HardwareOption {
  id: string;
  name: string;
  type: 'GPU' | 'TPU' | 'NPU' | 'ASIC' | 'CPU';
  vendor: string;
  memory: string;
  performance: string;
  powerConsumption: string;
  costPerHour: number;
  availability: 'High' | 'Medium' | 'Low';
  bestFor: string[];
  pros: string[];
  cons: string[];
}

export interface ModelOption {
  id: string;
  name: string;
  type: 'Self-Hosted' | 'Distilled' | 'Quantized' | 'Edge' | 'Cloud API';
  size: string;
  accuracy: string;
  speed: string;
  deployment: string;
  costSavings: string;
  hardwareReq: string;
  pros: string[];
  cons: string[];
}

export interface StrategyOption {
  id: string;
  name: string;
  category: 'Batch Processing' | 'Edge Inference' | 'Caching' | 'Load Balancing' | 'Routing';
  description: string;
  latencyReduction: string;
  costSavings: string;
  complexity: 'Low' | 'Medium' | 'High';
  bestFor: string[];
  implementation: string;
  pros: string[];
  cons: string[];
}

export const hardwareOptions: HardwareOption[] = [
  {
    id: 'nvidia-h100',
    name: 'NVIDIA H100',
    type: 'GPU',
    vendor: 'NVIDIA',
    memory: '80GB HBM3',
    performance: '3.0 PFLOPS (FP8)',
    powerConsumption: '700W',
    costPerHour: 4.20,
    availability: 'Low',
    bestFor: ['Large model training', 'High-throughput inference'],
    pros: ['Best performance', 'Latest architecture', 'Transformer Engine'],
    cons: ['Highest cost', 'Limited availability', 'High power consumption']
  },
  {
    id: 'google-tpu-v5',
    name: 'Google TPU v5',
    type: 'TPU',
    vendor: 'Google',
    memory: '16GB HBM',
    performance: '197 TFLOPS',
    powerConsumption: '200W',
    costPerHour: 1.80,
    availability: 'High',
    bestFor: ['TensorFlow models', 'Batch inference', 'Training at scale'],
    pros: ['Cost-efficient', 'Optimized for TensorFlow', 'Good availability'],
    cons: ['Limited framework support', 'GCP only', 'Learning curve']
  },
  {
    id: 'aws-inferentia2',
    name: 'AWS Inferentia2',
    type: 'ASIC',
    vendor: 'AWS',
    memory: '32GB',
    performance: '380 TOPS',
    powerConsumption: '210W',
    costPerHour: 0.71,
    availability: 'High',
    bestFor: ['Inference only', 'Transformer models', 'Cost optimization'],
    pros: ['70% cost reduction', 'Low latency', 'Easy integration'],
    cons: ['Inference only', 'AWS ecosystem lock-in', 'Limited model support']
  },
  {
    id: 'intel-gaudi2',
    name: 'Intel Gaudi2',
    type: 'ASIC',
    vendor: 'Intel',
    memory: '96GB HBM2e',
    performance: '2.0 PFLOPS',
    powerConsumption: '600W',
    costPerHour: 1.50,
    availability: 'Medium',
    bestFor: ['Training large models', 'NLP workloads', 'Open ecosystem'],
    pros: ['40% cheaper than H100', 'Open software stack', 'Good memory'],
    cons: ['Newer ecosystem', 'Limited availability', 'Framework maturity']
  },
  {
    id: 'amd-mi300x',
    name: 'AMD MI300X',
    type: 'GPU',
    vendor: 'AMD',
    memory: '192GB HBM3',
    performance: '2.6 PFLOPS',
    powerConsumption: '750W',
    costPerHour: 3.20,
    availability: 'Medium',
    bestFor: ['Large context windows', 'Memory-intensive models', 'ROCm stack'],
    pros: ['Highest memory capacity', 'Competitive performance', 'Lower cost than H100'],
    cons: ['Software ecosystem still maturing', 'Limited availability', 'High power']
  },
  {
    id: 'cpu-epyc',
    name: 'AMD EPYC 9654',
    type: 'CPU',
    vendor: 'AMD',
    memory: 'Up to 6TB DDR5',
    performance: '7.5 TFLOPS',
    powerConsumption: '360W',
    costPerHour: 0.45,
    availability: 'High',
    bestFor: ['Small models', 'Edge deployment', 'Budget constraints'],
    pros: ['Very low cost', 'High availability', 'Flexible deployment'],
    cons: ['Much slower', 'Not suitable for large models', 'Limited parallelism']
  }
];

export const modelOptions: ModelOption[] = [
  {
    id: 'llama-70b-self',
    name: 'Llama 3 70B (Self-Hosted)',
    type: 'Self-Hosted',
    size: '70B parameters',
    accuracy: 'High (comparable to GPT-4)',
    speed: 'Fast with proper hardware',
    deployment: 'On-premise or cloud VM',
    costSavings: '80-90% vs API',
    hardwareReq: 'A100 80GB x2 minimum',
    pros: ['Full control', 'No API rate limits', 'Data privacy', 'Long-term cost savings'],
    cons: ['Infrastructure management', 'Upfront investment', 'DevOps overhead']
  },
  {
    id: 'mistral-7b-distilled',
    name: 'Mistral 7B (Distilled)',
    type: 'Distilled',
    size: '7B parameters',
    accuracy: 'Good (90% of larger models)',
    speed: 'Very fast',
    deployment: 'Edge devices, mobile',
    costSavings: '95% vs large models',
    hardwareReq: 'RTX 3090 or similar',
    pros: ['Extremely efficient', 'Fast inference', 'Low cost', 'Edge deployment'],
    cons: ['Some accuracy trade-off', 'Limited capabilities', 'Domain-specific']
  },
  {
    id: 'gpt4-quantized',
    name: 'GPT-4 8-bit Quantized',
    type: 'Quantized',
    size: '~175B (quantized)',
    accuracy: 'Very high (minimal loss)',
    speed: 'Faster than FP16',
    deployment: 'Optimized cloud/on-prem',
    costSavings: '50-70% memory reduction',
    hardwareReq: 'H100 or A100 cluster',
    pros: ['Maintains quality', 'Reduced memory', 'Faster inference', 'Cost efficient'],
    cons: ['Quantization overhead', 'Some accuracy loss', 'Complex setup']
  },
  {
    id: 'phi3-mini',
    name: 'Phi-3 Mini',
    type: 'Edge',
    size: '3.8B parameters',
    accuracy: 'Good for size',
    speed: 'Very fast',
    deployment: 'Mobile, IoT, browser',
    costSavings: '99% vs cloud APIs',
    hardwareReq: '4GB RAM minimum',
    pros: ['Runs on device', 'No internet needed', 'Zero latency', 'Privacy'],
    cons: ['Limited capabilities', 'Smaller context', 'Device constraints']
  },
  {
    id: 'claude-api',
    name: 'Claude 3.5 Sonnet (API)',
    type: 'Cloud API',
    size: 'Unknown',
    accuracy: 'Highest available',
    speed: 'Fast (provider managed)',
    deployment: 'API calls only',
    costSavings: 'N/A (baseline)',
    hardwareReq: 'None',
    pros: ['No infrastructure', 'Always updated', 'Scalable', 'Easy to start'],
    cons: ['Ongoing costs', 'Rate limits', 'Data sharing', 'Vendor lock-in']
  },
  {
    id: 'llama-3b-edge',
    name: 'Llama 3.2 3B (Edge)',
    type: 'Edge',
    size: '3B parameters',
    accuracy: 'Moderate',
    speed: 'Very fast',
    deployment: 'Smartphones, edge servers',
    costSavings: '99% vs cloud',
    hardwareReq: '2GB RAM',
    pros: ['Ultra-portable', 'Offline capability', 'Low latency', 'Free inference'],
    cons: ['Limited reasoning', 'Smaller context', 'Basic tasks only']
  }
];

export const strategyOptions: StrategyOption[] = [
  {
    id: 'batch-processing',
    name: 'Batch Processing',
    category: 'Batch Processing',
    description: 'Group multiple requests together to maximize GPU utilization',
    latencyReduction: 'N/A (adds latency)',
    costSavings: '60-80% per request',
    complexity: 'Low',
    bestFor: ['Non-real-time tasks', 'Background jobs', 'Bulk processing'],
    implementation: 'Queue system + scheduled batch inference',
    pros: ['Massive cost savings', 'Better GPU utilization', 'Simple to implement'],
    cons: ['Not for real-time', 'Increased latency', 'Requires queuing']
  },
  {
    id: 'edge-inference',
    name: 'Edge Inference',
    category: 'Edge Inference',
    description: 'Run models on user devices or edge servers',
    latencyReduction: '80-95%',
    costSavings: '90-99%',
    complexity: 'High',
    bestFor: ['Mobile apps', 'IoT devices', 'Privacy-sensitive apps'],
    implementation: 'Model optimization + device deployment',
    pros: ['Near-zero latency', 'No cloud costs', 'Privacy', 'Offline capability'],
    cons: ['Limited model size', 'Device constraints', 'Update complexity']
  },
  {
    id: 'smart-caching',
    name: 'Smart Caching',
    category: 'Caching',
    description: 'Cache frequent queries and responses with semantic matching',
    latencyReduction: '99% (cache hits)',
    costSavings: '70-90%',
    complexity: 'Medium',
    bestFor: ['Repetitive queries', 'FAQ systems', 'Common use cases'],
    implementation: 'Vector DB + similarity search',
    pros: ['Instant responses', 'Huge cost savings', 'Better UX'],
    cons: ['Cache management', 'Stale responses', 'Storage costs']
  },
  {
    id: 'model-routing',
    name: 'Intelligent Model Routing',
    category: 'Routing',
    description: 'Route requests to appropriate model based on complexity',
    latencyReduction: '30-50%',
    costSavings: '50-70%',
    complexity: 'High',
    bestFor: ['Mixed workloads', 'Cost optimization', 'Multi-model systems'],
    implementation: 'Router + complexity classifier + multiple models',
    pros: ['Optimal cost/quality', 'Flexible scaling', 'Better resource use'],
    cons: ['Complex setup', 'Router overhead', 'Model management']
  },
  {
    id: 'load-balancing',
    name: 'Load Balancing & Auto-scaling',
    category: 'Load Balancing',
    description: 'Distribute load across multiple instances with auto-scaling',
    latencyReduction: '40-60%',
    costSavings: '30-50%',
    complexity: 'Medium',
    bestFor: ['Variable traffic', 'High availability', 'Production systems'],
    implementation: 'Load balancer + orchestration (K8s)',
    pros: ['Better reliability', 'Cost efficiency', 'Handles spikes'],
    cons: ['Infrastructure complexity', 'Cold start delays', 'Orchestration needed']
  },
  {
    id: 'speculative-decoding',
    name: 'Speculative Decoding',
    category: 'Batch Processing',
    description: 'Use small model to predict, large model to verify',
    latencyReduction: '40-60%',
    costSavings: '30-50%',
    complexity: 'High',
    bestFor: ['Text generation', 'Real-time inference', 'Cost optimization'],
    implementation: 'Dual model setup + verification logic',
    pros: ['Faster generation', 'Maintains quality', 'Cost efficient'],
    cons: ['Complex implementation', 'Two models needed', 'Not always faster']
  }
];
