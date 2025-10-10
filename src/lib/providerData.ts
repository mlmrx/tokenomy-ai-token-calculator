// Multi-provider cost comparison data
export interface ProviderModel {
  id: string;
  provider: string;
  model: string;
  inputCostPer1M: number;
  outputCostPer1M: number;
  contextWindow: number;
  speedTokensPerSec: number;
  qualityScore: number; // 1-10
  features: string[];
  bestFor: string[];
}

export const providerModels: ProviderModel[] = [
  // OpenAI
  {
    id: "gpt-4-turbo",
    provider: "OpenAI",
    model: "GPT-4 Turbo",
    inputCostPer1M: 10,
    outputCostPer1M: 30,
    contextWindow: 128000,
    speedTokensPerSec: 80,
    qualityScore: 9.5,
    features: ["Vision", "JSON mode", "Function calling"],
    bestFor: ["Complex reasoning", "Long context", "Code generation"]
  },
  {
    id: "gpt-4o",
    provider: "OpenAI",
    model: "GPT-4o",
    inputCostPer1M: 5,
    outputCostPer1M: 15,
    contextWindow: 128000,
    speedTokensPerSec: 120,
    qualityScore: 9.3,
    features: ["Vision", "Audio", "Real-time"],
    bestFor: ["Multimodal tasks", "Fast responses", "General purpose"]
  },
  {
    id: "gpt-3.5-turbo",
    provider: "OpenAI",
    model: "GPT-3.5 Turbo",
    inputCostPer1M: 0.5,
    outputCostPer1M: 1.5,
    contextWindow: 16385,
    speedTokensPerSec: 150,
    qualityScore: 7.5,
    features: ["Fast", "Cost-effective"],
    bestFor: ["Simple tasks", "High volume", "Chatbots"]
  },
  // Anthropic
  {
    id: "claude-opus",
    provider: "Anthropic",
    model: "Claude 3 Opus",
    inputCostPer1M: 15,
    outputCostPer1M: 75,
    contextWindow: 200000,
    speedTokensPerSec: 70,
    qualityScore: 9.7,
    features: ["Vision", "Long context", "High accuracy"],
    bestFor: ["Complex analysis", "Research", "Creative writing"]
  },
  {
    id: "claude-sonnet",
    provider: "Anthropic",
    model: "Claude 3.5 Sonnet",
    inputCostPer1M: 3,
    outputCostPer1M: 15,
    contextWindow: 200000,
    speedTokensPerSec: 100,
    qualityScore: 9.2,
    features: ["Balanced", "Vision", "Code"],
    bestFor: ["General purpose", "Balanced cost/quality", "Data analysis"]
  },
  {
    id: "claude-haiku",
    provider: "Anthropic",
    model: "Claude 3 Haiku",
    inputCostPer1M: 0.25,
    outputCostPer1M: 1.25,
    contextWindow: 200000,
    speedTokensPerSec: 180,
    qualityScore: 8.0,
    features: ["Fast", "Cost-effective", "Vision"],
    bestFor: ["High throughput", "Simple tasks", "Real-time apps"]
  },
  // Google
  {
    id: "gemini-pro",
    provider: "Google",
    model: "Gemini 1.5 Pro",
    inputCostPer1M: 7,
    outputCostPer1M: 21,
    contextWindow: 2000000,
    speedTokensPerSec: 90,
    qualityScore: 9.0,
    features: ["Huge context", "Multimodal", "Code"],
    bestFor: ["Document analysis", "Video understanding", "Research"]
  },
  {
    id: "gemini-flash",
    provider: "Google",
    model: "Gemini 1.5 Flash",
    inputCostPer1M: 0.35,
    outputCostPer1M: 1.05,
    contextWindow: 1000000,
    speedTokensPerSec: 140,
    qualityScore: 8.5,
    features: ["Fast", "Long context", "Multimodal"],
    bestFor: ["High volume", "Real-time", "Summarization"]
  },
  // Cohere
  {
    id: "command-r-plus",
    provider: "Cohere",
    model: "Command R+",
    inputCostPer1M: 3,
    outputCostPer1M: 15,
    contextWindow: 128000,
    speedTokensPerSec: 100,
    qualityScore: 8.8,
    features: ["RAG optimized", "Citations", "Multilingual"],
    bestFor: ["Search", "RAG", "Enterprise"]
  },
  {
    id: "command-r",
    provider: "Cohere",
    model: "Command R",
    inputCostPer1M: 0.5,
    outputCostPer1M: 1.5,
    contextWindow: 128000,
    speedTokensPerSec: 130,
    qualityScore: 8.2,
    features: ["RAG", "Fast", "Cost-effective"],
    bestFor: ["Retrieval", "Classification", "Summarization"]
  },
  // AWS Bedrock
  {
    id: "titan-express",
    provider: "AWS Bedrock",
    model: "Titan Text Express",
    inputCostPer1M: 0.2,
    outputCostPer1M: 0.6,
    contextWindow: 8192,
    speedTokensPerSec: 120,
    qualityScore: 7.0,
    features: ["AWS native", "Cost-effective"],
    bestFor: ["AWS ecosystem", "Simple tasks", "Summaries"]
  },
  // Azure OpenAI
  {
    id: "azure-gpt-4",
    provider: "Azure OpenAI",
    model: "GPT-4 (Azure)",
    inputCostPer1M: 10,
    outputCostPer1M: 30,
    contextWindow: 128000,
    speedTokensPerSec: 75,
    qualityScore: 9.5,
    features: ["Enterprise SLA", "Private deployment"],
    bestFor: ["Enterprise", "Compliance", "Private data"]
  }
];

export const providerCategories = [
  "All Providers",
  "OpenAI",
  "Anthropic",
  "Google",
  "Cohere",
  "AWS Bedrock",
  "Azure OpenAI"
];

export const useCaseProfiles = [
  {
    name: "Simple Chatbot",
    inputTokens: 100,
    outputTokens: 50,
    requestsPerDay: 10000,
    prioritySpeed: 8,
    priorityCost: 9,
    priorityQuality: 6
  },
  {
    name: "Complex Analysis",
    inputTokens: 4000,
    outputTokens: 1000,
    requestsPerDay: 500,
    prioritySpeed: 5,
    priorityCost: 6,
    priorityQuality: 10
  },
  {
    name: "Document Processing",
    inputTokens: 10000,
    outputTokens: 500,
    requestsPerDay: 2000,
    prioritySpeed: 7,
    priorityCost: 7,
    priorityQuality: 8
  },
  {
    name: "Code Generation",
    inputTokens: 500,
    outputTokens: 800,
    requestsPerDay: 5000,
    prioritySpeed: 7,
    priorityCost: 7,
    priorityQuality: 9
  }
];
