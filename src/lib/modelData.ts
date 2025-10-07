// Prices are USD per 1 K tokens (input vs. output)
// Data last reviewed October 2025
export const modelPricing: Record<string, { input: number; output: number; tokenScheme?: string; overhead?: number }> = {
  // OpenAI (Latest 2025 models)
  "gpt-5": { input: 0.003, output: 0.012, tokenScheme: "o200k_base", overhead: 3 },
  "gpt-5-mini": { input: 0.0008, output: 0.0032, tokenScheme: "o200k_base", overhead: 3 },
  "gpt-5-nano": { input: 0.0003, output: 0.0012, tokenScheme: "o200k_base", overhead: 2 },
  "gpt-4.1": { input: 0.002, output: 0.008, tokenScheme: "cl100k_base", overhead: 3 },
  "gpt-4.1-mini": { input: 0.0005, output: 0.002, tokenScheme: "cl100k_base", overhead: 3 },
  "o3": { input: 0.01, output: 0.04, tokenScheme: "o200k_base", overhead: 4 },
  "o4-mini": { input: 0.002, output: 0.008, tokenScheme: "o200k_base", overhead: 3 },
  
  // Legacy OpenAI models
  "gpt-4o": { input: 0.005, output: 0.015, tokenScheme: "cl100k_base", overhead: 3 },
  "gpt-4o-mini": { input: 0.0005, output: 0.0015, tokenScheme: "cl100k_base", overhead: 3 },

  // Anthropic (Latest Claude 4 series)
  "claude-opus-4.1": { input: 0.015, output: 0.075, tokenScheme: "Claude", overhead: 5 },
  "claude-sonnet-4.5": { input: 0.003, output: 0.015, tokenScheme: "Claude", overhead: 5 },
  "claude-haiku-4": { input: 0.0002, output: 0.001, tokenScheme: "Claude", overhead: 4 },
  
  // Legacy Anthropic models
  "claude-3-opus": { input: 0.015, output: 0.075, tokenScheme: "Claude", overhead: 5 },
  "claude-3-sonnet": { input: 0.003, output: 0.015, tokenScheme: "Claude", overhead: 5 },
  "claude-3-haiku": { input: 0.00025, output: 0.00125, tokenScheme: "Claude", overhead: 5 },

  // Meta (Llama 4 and 3.3)
  "llama-4-maverick": { input: 0.0005, output: 0.0005, tokenScheme: "Llama", overhead: 2 },
  "llama-4-scout": { input: 0.0002, output: 0.0002, tokenScheme: "Llama", overhead: 2 },
  "llama-3.3-70b": { input: 0.0006, output: 0.0006, tokenScheme: "Llama", overhead: 2 },
  "llama-3-70b": { input: 0.0008, output: 0.0008, tokenScheme: "Llama", overhead: 2 },
  "llama-3-8b": { input: 0.0001, output: 0.0002, tokenScheme: "Llama", overhead: 2 },

  // Google (Gemini 2.5)
  "gemini-2.5-pro": { input: 0.00125, output: 0.01, tokenScheme: "SentencePiece", overhead: 4 },
  "gemini-2.5-flash": { input: 0.0002, output: 0.0006, tokenScheme: "SentencePiece", overhead: 3 },
  "gemini-2.5-flash-lite": { input: 0.00005, output: 0.00015, tokenScheme: "SentencePiece", overhead: 2 },
  
  // Legacy Google models
  "gemini-1.5-pro": { input: 0.0025, output: 0.0075, tokenScheme: "SentencePiece", overhead: 4 },
  "gemini-1.5-flash": { input: 0.00035, output: 0.001, tokenScheme: "SentencePiece", overhead: 4 },

  // Microsoft (Azure OpenAI + Phi-3)
  "azure-gpt-5": { input: 0.003, output: 0.012, tokenScheme: "o200k_base", overhead: 3 },
  "azure-gpt-4.1": { input: 0.002, output: 0.008, tokenScheme: "cl100k_base", overhead: 3 },
  "phi-3-mini": { input: 0.0003, output: 0.0006, tokenScheme: "phi3", overhead: 2 },
  "phi-3-medium": { input: 0.0004, output: 0.0008, tokenScheme: "phi3", overhead: 2 },

  // Amazon (Bedrock)
  "titan-text-express": { input: 0.0002, output: 0.0006, tokenScheme: "Amazon", overhead: 2 },
  "titan-text-lite": { input: 0.0003, output: 0.0004, tokenScheme: "Amazon", overhead: 2 },
  "titan-embedding": { input: 0.0001, output: 0.0001, tokenScheme: "Amazon", overhead: 0 },

  // Mistral (Latest 2025 models)
  "mistral-large-3": { input: 0.002, output: 0.006, tokenScheme: "Mistral", overhead: 3 },
  "mistral-medium-3": { input: 0.0004, output: 0.002, tokenScheme: "Mistral", overhead: 3 },
  "mistral-small-3": { input: 0.0002, output: 0.0008, tokenScheme: "Mistral", overhead: 2 },
  
  // X.AI (Grok)
  "grok-2": { input: 0.0002, output: 0.0006, tokenScheme: "Grok", overhead: 3 },
  "grok-2-mini": { input: 0.00015, output: 0.0004, tokenScheme: "Grok", overhead: 2 },
  
  // DeepSeek
  "deepseek-v3": { input: 0.00015, output: 0.0003, tokenScheme: "DeepSeek", overhead: 2 },
  "deepseek-coder-v2": { input: 0.0001, output: 0.0002, tokenScheme: "DeepSeek", overhead: 2 },
  
  // Alibaba
  "qwen-max": { input: 0.0003, output: 0.0009, tokenScheme: "Qwen", overhead: 3 },
  "qwen-plus": { input: 0.0001, output: 0.0004, tokenScheme: "Qwen", overhead: 3 },
  
  // Baidu
  "ernie-bot": { input: 0.0002, output: 0.0006, tokenScheme: "ERNIE", overhead: 3 },
  "ernie-lite": { input: 0.0001, output: 0.0003, tokenScheme: "ERNIE", overhead: 2 }
};

// First token latency in milliseconds (approximate values - Oct 2025)
export const firstTokenLatency: Record<string, number> = {
  // OpenAI (Latest 2025)
  "gpt-5": 250,
  "gpt-5-mini": 150,
  "gpt-5-nano": 120,
  "gpt-4.1": 200,
  "gpt-4.1-mini": 150,
  "o3": 400,
  "o4-mini": 280,
  "gpt-4o": 300,
  "gpt-4o-mini": 180,
  
  // Anthropic (Claude 4)
  "claude-opus-4.1": 350,
  "claude-sonnet-4.5": 180,
  "claude-haiku-4": 120,
  "claude-3-opus": 550,
  "claude-3-sonnet": 270,
  "claude-3-haiku": 160,
  
  // Meta (Llama 4 & 3.3)
  "llama-4-maverick": 280,
  "llama-4-scout": 180,
  "llama-3.3-70b": 350,
  "llama-3-70b": 500,
  "llama-3-8b": 200,
  
  // Google (Gemini 2.5)
  "gemini-2.5-pro": 200,
  "gemini-2.5-flash": 100,
  "gemini-2.5-flash-lite": 80,
  "gemini-1.5-pro": 320,
  "gemini-1.5-flash": 150,
  
  // Microsoft
  "azure-gpt-5": 260,
  "azure-gpt-4.1": 210,
  "phi-3-mini": 130,
  "phi-3-medium": 160,
  
  // Amazon
  "titan-text-express": 250,
  "titan-text-lite": 180,
  
  // Mistral (2025)
  "mistral-large-3": 280,
  "mistral-medium-3": 200,
  "mistral-small-3": 140,
  
  // X.AI (Grok 2)
  "grok-2": 240,
  "grok-2-mini": 150,
  
  // DeepSeek
  "deepseek-v3": 220,
  "deepseek-coder-v2": 230,
  
  // Alibaba
  "qwen-max": 460,
  "qwen-plus": 250,
  
  // Baidu
  "ernie-bot": 380,
  "ernie-lite": 240
};

// Tokens per second (approximate values - Oct 2025)
export const tokensPerSecond: Record<string, number> = {
  // OpenAI (Latest 2025)
  "gpt-5": 180,
  "gpt-5-mini": 120,
  "gpt-5-nano": 100,
  "gpt-4.1": 140,
  "gpt-4.1-mini": 110,
  "o3": 50,
  "o4-mini": 80,
  "gpt-4o": 120,
  "gpt-4o-mini": 80,
  
  // Anthropic (Claude 4)
  "claude-opus-4.1": 45,
  "claude-sonnet-4.5": 85,
  "claude-haiku-4": 100,
  "claude-3-opus": 25,
  "claude-3-sonnet": 40,
  "claude-3-haiku": 55,
  
  // Meta (Llama 4 & 3.3)
  "llama-4-maverick": 55,
  "llama-4-scout": 70,
  "llama-3.3-70b": 45,
  "llama-3-70b": 30,
  "llama-3-8b": 45,
  
  // Google (Gemini 2.5)
  "gemini-2.5-pro": 90,
  "gemini-2.5-flash": 150,
  "gemini-2.5-flash-lite": 180,
  "gemini-1.5-pro": 35,
  "gemini-1.5-flash": 70,
  
  // Microsoft
  "azure-gpt-5": 170,
  "azure-gpt-4.1": 135,
  "phi-3-mini": 80,
  "phi-3-medium": 60,
  
  // Amazon
  "titan-text-express": 35,
  "titan-text-lite": 45,
  
  // Mistral (2025)
  "mistral-large-3": 65,
  "mistral-medium-3": 85,
  "mistral-small-3": 95,
  
  // X.AI (Grok 2)
  "grok-2": 55,
  "grok-2-mini": 70,
  
  // DeepSeek
  "deepseek-v3": 60,
  "deepseek-coder-v2": 55,
  
  // Alibaba
  "qwen-max": 26,
  "qwen-plus": 42,
  
  // Baidu
  "ernie-bot": 32,
  "ernie-lite": 45
};

// Enhanced token estimator function that considers model-specific tokenization
import { detectLanguageMultiplier, getTokenizationParams, patternsByLanguage } from "./utils";

/**
 * Enhanced token estimation function that considers:
 * 1. Model-specific tokenization schemes
 * 2. Language detection
 * 3. Special character handling
 * 4. Model-specific overhead
 * 
 * @param text The text to estimate tokens for
 * @param model The model to estimate tokens for (default: gpt-4)
 * @returns Estimated token count
 */
export const estimateTokens = (text: string, model: string = "gpt-4o"): number => {
  if (!text) return 0;
  
  // Get model-specific tokenization parameters
  const { charsPerToken, tokenMultiplier, overhead } = getTokenizationParams(model);
  
  // Detect language and adjust token estimation
  const languageMultiplier = detectLanguageMultiplier(text);
  
  // Base estimation for generic tokenization
  const trimmedText = text.trim();
  
  // Count words, taking into account that most common words are single tokens
  const words = trimmedText.split(/\s+/).filter(w => w.length > 0);
  
  // Count punctuation
  const punctuationMatches = trimmedText.match(patternsByLanguage.english.punctuation) || [];
  
  // Count special characters (emojis, mathematical symbols, etc)
  const specialCharMatches = trimmedText.match(patternsByLanguage.english.specialChars) || [];
  
  // Count numbers (often tokenized digit by digit)
  const numericMatches = trimmedText.match(patternsByLanguage.english.numbers) || [];
  const numericChars = numericMatches.join('').length;
  
  // Calculate word tokens with more accurate algorithm:
  // - Short words (1-2 chars): typically 1 token
  // - Medium words (3-6 chars): typically 1 token
  // - Longer words: may be split into multiple tokens
  const wordTokens = words.reduce((sum, word) => {
    // Very short words (1-2 chars) are usually 1 token
    if (word.length <= 2) return sum + 1;
    
    // Medium words (3-6 chars) are usually 1 token, unless they have unusual characters
    if (word.length <= 6) {
      const hasSpecialChars = /[^a-zA-Z0-9]/.test(word);
      return sum + (hasSpecialChars ? Math.ceil(word.length / 3) : 1);
    }
    
    // Longer words are often split into subword tokens, roughly 1 token per 4-5 chars
    return sum + Math.ceil(word.length / charsPerToken);
  }, 0);
  
  // Special characters often get their own tokens
  const specialCharTokens = specialCharMatches.length;
  
  // Punctuation usually gets its own token
  const punctuationTokens = punctuationMatches.length;
  
  // Numbers are typically tokenized per digit or in small groups
  const numericTokens = Math.ceil(numericChars / 2);
  
  // Sum all token components and apply model-specific multiplier
  let totalTokens = (wordTokens + specialCharTokens + punctuationTokens + numericTokens) * tokenMultiplier;
  
  // Apply language-specific multiplier
  totalTokens = totalTokens * languageMultiplier;
  
  // Add overhead for special tokens
  totalTokens += overhead;
  
  // Round up and ensure at least 1 token for non-empty text
  return Math.max(1, Math.ceil(totalTokens));
};

// Calculate cost based on token count and model
export const calculateCost = (tokenCount: number, model: string, isOutput: boolean = false): number => {
  if (!modelPricing[model]) {
    console.error(`Model pricing not found for ${model}`);
    return 0;
  }
  
  const rate = isOutput ? modelPricing[model].output : modelPricing[model].input;
  return (tokenCount * rate) / 1000;
};

// Get model categories (Updated Oct 2025)
export const getModelCategories = (): Record<string, string[]> => {
  return {
    'OpenAI': ['gpt-5', 'gpt-5-mini', 'gpt-5-nano', 'gpt-4.1', 'gpt-4.1-mini', 'o3', 'o4-mini', 'gpt-4o', 'gpt-4o-mini'],
    'Anthropic': ['claude-opus-4.1', 'claude-sonnet-4.5', 'claude-haiku-4', 'claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    'Meta': ['llama-4-maverick', 'llama-4-scout', 'llama-3.3-70b', 'llama-3-70b', 'llama-3-8b'],
    'Google': ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    'Microsoft': ['azure-gpt-5', 'azure-gpt-4.1', 'phi-3-mini', 'phi-3-medium'],
    'Amazon': ['titan-text-express', 'titan-text-lite', 'titan-embedding'],
    'Mistral': ['mistral-large-3', 'mistral-medium-3', 'mistral-small-3'],
    'X.AI': ['grok-2', 'grok-2-mini'],
    'DeepSeek': ['deepseek-v3', 'deepseek-coder-v2'],
    'Alibaba': ['qwen-max', 'qwen-plus'],
    'Baidu': ['ernie-bot', 'ernie-lite']
  };
};

// Get token scheme information
export const getTokenizationInfo = (model: string): {
  scheme: string;
  overhead: number;
} => {
  const modelInfo = modelPricing[model];
  return {
    scheme: modelInfo?.tokenScheme || 'Unknown',
    overhead: modelInfo?.overhead || 0
  };
};

// Enhanced functions for speed simulator
export const calculateTotalTime = (outputTokens: number, model: string): number => {
  const firstToken = firstTokenLatency[model] / 1000; // convert to seconds
  const tps = tokensPerSecond[model] || 30; // default to 30 if not found
  const remainingTime = outputTokens / tps;
  return firstToken + remainingTime;
};

export const calculateTokensAtTime = (time: number, model: string, maxTokens: number): number => {
  const firstTokenDelay = firstTokenLatency[model] / 1000; // convert to seconds
  const tps = tokensPerSecond[model] || 30;
  
  if (time <= firstTokenDelay) {
    return 0;
  } else {
    const tokensGenerated = Math.floor((time - firstTokenDelay) * tps);
    return Math.min(tokensGenerated, maxTokens);
  }
};

// Function to get list of popular or featured models (Updated Oct 2025)
export const getFeaturedModels = (): string[] => {
  return [
    "gpt-5",
    "claude-opus-4.1",
    "claude-sonnet-4.5",
    "gemini-2.5-pro",
    "llama-4-maverick",
    "mistral-large-3"
  ];
};
