// Prices are USD per 1 K tokens (input vs. output)
export const modelPricing: Record<string, { input: number; output: number; tokenScheme?: string; overhead?: number }> = {
  // OpenAI
  "gpt-4o-2": { input: 0.005, output: 0.015, tokenScheme: "cl100k_base", overhead: 3 },
  "gpt-4o": { input: 0.005, output: 0.020, tokenScheme: "cl100k_base", overhead: 3 },
  "gpt-4o-mini": { input: 0.0006, output: 0.0024, tokenScheme: "cl100k_base", overhead: 3 },
  "gpt-4-turbo": { input: 0.0004, output: 0.0016, tokenScheme: "cl100k_base", overhead: 3 },
  "gpt-4": { input: 0.002, output: 0.008, tokenScheme: "cl100k_base", overhead: 3 },
  "gpt-3.5-turbo": { input: 0.0005, output: 0.0015, tokenScheme: "cl100k_base", overhead: 3 },

  // Anthropic
  "claude-3-opus": { input: 0.015, output: 0.075, tokenScheme: "Claude", overhead: 5 },
  "claude-3-sonnet": { input: 0.003, output: 0.015, tokenScheme: "Claude", overhead: 5 },
  "claude-3-haiku": { input: 0.00025, output: 0.00125, tokenScheme: "Claude", overhead: 5 },

  // Meta (Llama 3)
  "llama-3-70b": { input: 0.00072, output: 0.00072, tokenScheme: "Llama", overhead: 2 },
  "llama-3-8b": { input: 0.00006, output: 0.00014, tokenScheme: "Llama", overhead: 2 },

  // Google (Gemini)
  "gemini-1.5-pro": { input: 0.0003125, output: 0.00125, tokenScheme: "SentencePiece", overhead: 4 },
  "gemini-1.5-flash": { input: 0.0000188, output: 0.000075, tokenScheme: "SentencePiece", overhead: 4 },
  "gemini-ultra-2": { input: 0.00125, output: 0.01000, tokenScheme: "SentencePiece", overhead: 4 },

  // Microsoft (Azure OpenAI + Phi-3)
  "azure-gpt-4o": { input: 0.005, output: 0.015, tokenScheme: "cl100k_base", overhead: 3 },
  "azure-embedding-ada": { input: 0.00002, output: 0.00002, tokenScheme: "cl100k_base", overhead: 0 },
  "phi-3-mini": { input: 0.00013, output: 0.00052, tokenScheme: "phi3", overhead: 2 },
  "phi-3-medium": { input: 0.00017, output: 0.00068, tokenScheme: "phi3", overhead: 2 },

  // Amazon (Bedrock)
  "titan-text-express": { input: 0.0002, output: 0.0006, tokenScheme: "Amazon", overhead: 2 },
  "titan-text-lite": { input: 0.0003, output: 0.0004, tokenScheme: "Amazon", overhead: 2 },
  "titan-embedding": { input: 0.0001, output: 0.0001, tokenScheme: "Amazon", overhead: 0 },
  "claude-3-5-sonnet": { input: 0.003, output: 0.015, tokenScheme: "Claude", overhead: 5 },

  // Mistral
  "mistral-large": { input: 0.002, output: 0.006, tokenScheme: "Mistral", overhead: 3 },
  "mistral-medium": { input: 0.00027, output: 0.00081, tokenScheme: "Mistral", overhead: 3 },
  "mistral-small": { input: 0.00010, output: 0.00030, tokenScheme: "Mistral", overhead: 3 },
  
  // X.AI (Grok)
  "grok-1": { input: 0.0002, output: 0.0006, tokenScheme: "Grok", overhead: 3 },
  "grok-1-mini": { input: 0.00015, output: 0.0004, tokenScheme: "Grok", overhead: 2 },
  
  // DeepSeek
  "deepseek-coder": { input: 0.0001, output: 0.0002, tokenScheme: "DeepSeek", overhead: 2 },
  "deepseek-llm": { input: 0.0002, output: 0.0006, tokenScheme: "DeepSeek", overhead: 2 },
  
  // Alibaba
  "qwen-max": { input: 0.0003, output: 0.0009, tokenScheme: "Qwen", overhead: 3 },
  "qwen-plus": { input: 0.0001, output: 0.0004, tokenScheme: "Qwen", overhead: 3 },
  
  // Baidu
  "ernie-bot": { input: 0.0002, output: 0.0006, tokenScheme: "ERNIE", overhead: 3 },
  "ernie-lite": { input: 0.0001, output: 0.0003, tokenScheme: "ERNIE", overhead: 2 }
};

// First token latency in milliseconds (approximate values)
export const firstTokenLatency: Record<string, number> = {
  // OpenAI
  "gpt-4o-2": 250,
  "gpt-4o": 350,
  "gpt-4o-mini": 200,
  "gpt-4-turbo": 380,
  "gpt-4": 750,
  "gpt-3.5-turbo": 230,
  
  // Anthropic
  "claude-3-opus": 600,
  "claude-3-sonnet": 300,
  "claude-3-haiku": 200,
  "claude-3-5-sonnet": 220,
  
  // Meta
  "llama-3-70b": 550,
  "llama-3-8b": 220,
  
  // Google
  "gemini-1.5-pro": 350,
  "gemini-1.5-flash": 180,
  "gemini-ultra-2": 450,
  
  // Microsoft
  "azure-gpt-4o": 380,
  "phi-3-mini": 150,
  "phi-3-medium": 180,
  
  // Amazon
  "titan-text-express": 280,
  "titan-text-lite": 200,
  
  // Mistral
  "mistral-large": 400,
  "mistral-medium": 300,
  "mistral-small": 180,
  
  // X.AI
  "grok-1": 300,
  "grok-1-mini": 180,
  
  // DeepSeek
  "deepseek-coder": 280,
  "deepseek-llm": 320,
  
  // Alibaba
  "qwen-max": 500,
  "qwen-plus": 280,
  
  // Baidu
  "ernie-bot": 400,
  "ernie-lite": 250
};

// Tokens per second (approximate values)
export const tokensPerSecond: Record<string, number> = {
  // OpenAI
  "gpt-4o-2": 120,
  "gpt-4o": 90,
  "gpt-4o-mini": 60,
  "gpt-4-turbo": 27,
  "gpt-4": 15,
  "gpt-3.5-turbo": 40,
  
  // Anthropic
  "claude-3-opus": 20,
  "claude-3-sonnet": 32,
  "claude-3-haiku": 45,
  "claude-3-5-sonnet": 50,
  
  // Meta
  "llama-3-70b": 28,
  "llama-3-8b": 42,
  
  // Google
  "gemini-1.5-pro": 30,
  "gemini-1.5-flash": 60,
  "gemini-ultra-2": 25,
  
  // Microsoft
  "azure-gpt-4o": 85,
  "phi-3-mini": 70,
  "phi-3-medium": 50,
  
  // Amazon
  "titan-text-express": 30,
  "titan-text-lite": 40,
  
  // Mistral
  "mistral-large": 40,
  "mistral-medium": 50,
  "mistral-small": 60,
  
  // X.AI
  "grok-1": 33,
  "grok-1-mini": 45,
  
  // DeepSeek
  "deepseek-coder": 38,
  "deepseek-llm": 30,
  
  // Alibaba
  "qwen-max": 22,
  "qwen-plus": 40,
  
  // Baidu
  "ernie-bot": 28,
  "ernie-lite": 40
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

// Get model categories
export const getModelCategories = (): Record<string, string[]> => {
  return {
    'OpenAI': ['gpt-4o-2', 'gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
    'Anthropic': ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku', 'claude-3-5-sonnet'],
    'Meta': ['llama-3-70b', 'llama-3-8b'],
    'Google': ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-ultra-2'],
    'Microsoft': ['azure-gpt-4o', 'azure-embedding-ada', 'phi-3-mini', 'phi-3-medium'],
    'Amazon': ['titan-text-express', 'titan-text-lite', 'titan-embedding'],
    'Mistral': ['mistral-large', 'mistral-medium', 'mistral-small'],
    'X.AI': ['grok-1', 'grok-1-mini'],
    'DeepSeek': ['deepseek-coder', 'deepseek-llm'],
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

// Function to get list of popular or featured models
export const getFeaturedModels = (): string[] => {
  return [
    "gpt-4o",
    "claude-3-opus",
    "gemini-ultra-2",
    "llama-3-70b",
    "mistral-large"
  ];
};
