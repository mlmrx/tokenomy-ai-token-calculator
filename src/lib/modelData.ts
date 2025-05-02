
// Prices are USD per 1 K tokens (input vs. output)
export const modelPricing: Record<string, { input: number; output: number }> = {
  // OpenAI
  "gpt-4o":        { input: 0.005,     output: 0.020 },
  "gpt-4o-mini":   { input: 0.0006,    output: 0.0024 },
  "gpt-4-turbo":   { input: 0.0004,    output: 0.0016 },
  "gpt-4":         { input: 0.002,     output: 0.008 },
  "gpt-3.5-turbo": { input: 0.0005,    output: 0.0015 },

  // Anthropic
  "claude-3-opus":   { input: 0.015,     output: 0.075 },
  "claude-3-sonnet": { input: 0.003,     output: 0.015 },
  "claude-3-haiku":  { input: 0.00025,   output: 0.00125 },

  // Meta (Llama 3)
  "llama-3-70b": { input: 0.00072,  output: 0.00072 },
  "llama-3-8b":  { input: 0.00006,  output: 0.00014 },

  // Google (Gemini)
  "gemini-1.5-pro":   { input: 0.0003125, output: 0.00125 },
  "gemini-1.5-flash": { input: 0.0000188, output: 0.000075 },
  "gemini-ultra-2":   { input: 0.00125,   output: 0.01000 },

  // Microsoft (Azure OpenAI + Phi-3)
  "azure-gpt-4o":        { input: 0.005,    output: 0.015 },
  "azure-embedding-ada": { input: 0.00002,  output: 0.00002 },
  "phi-3-mini":          { input: 0.00013,  output: 0.00052 },
  "phi-3-medium":        { input: 0.00017,  output: 0.00068 },

  // Amazon (Bedrock)
  "titan-text-express": { input: 0.0002,  output: 0.0006 },
  "titan-text-lite":    { input: 0.0003,  output: 0.0004 },
  "titan-embedding":    { input: 0.0001,  output: 0.0001 },
  "claude-3-5-sonnet":  { input: 0.003,   output: 0.015 },

  // Mistral
  "mistral-large":  { input: 0.002,   output: 0.006 },
  "mistral-medium": { input: 0.00027, output: 0.00081 },
  "mistral-small":  { input: 0.00010, output: 0.00030 }
};

// Better token estimator function
export const estimateTokens = (text: string): number => {
  if (!text) return 0;
  
  // More accurate tokenization estimation:
  // 1. Average English word is about 4-5 characters
  // 2. Most tokenizers split by subwords
  // 3. Special characters and punctuation often count as separate tokens
  // 4. Numbers are often tokenized digit by digit
  
  // Count words
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  
  // Count non-alphanumeric characters that are likely to be separate tokens
  const specialChars = text.replace(/[a-zA-Z0-9\s]/g, '').length;
  
  // Count numeric digits (often tokenized separately)
  const numDigits = text.replace(/[^0-9]/g, '').length;
  
  // Base estimate: words + special characters + some digits
  // Word tokens: Most English words are 1-2 tokens
  const wordTokens = words.reduce((sum, word) => {
    if (word.length <= 2) return sum + 1;  // Short words are usually 1 token
    if (word.length <= 6) return sum + 1;  // Medium words are usually 1 token
    return sum + Math.ceil(word.length / 5); // Longer words may be multiple tokens
  }, 0);
  
  // Add special character tokens and numeric tokens
  const totalEstimate = wordTokens + specialChars * 0.5 + numDigits * 0.5;
  
  // Round up and ensure minimum of 1 token for non-empty text
  return Math.max(1, Math.ceil(totalEstimate));
};

// Calculate cost based on token count and model
export const calculateCost = (tokenCount: number, model: string, isOutput: boolean = false): number => {
  if (!modelPricing[model]) return 0;
  
  const rate = isOutput ? modelPricing[model].output : modelPricing[model].input;
  return (tokenCount * rate) / 1000;
};

// Get model categories
export const getModelCategories = (): Record<string, string[]> => {
  return {
    'OpenAI': ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
    'Anthropic': ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    'Meta': ['llama-3-70b', 'llama-3-8b'],
    'Google': ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-ultra-2'],
    'Microsoft': ['azure-gpt-4o', 'azure-embedding-ada', 'phi-3-mini', 'phi-3-medium'],
    'Amazon': ['titan-text-express', 'titan-text-lite', 'titan-embedding', 'claude-3-5-sonnet'],
    'Mistral': ['mistral-large', 'mistral-medium', 'mistral-small']
  };
};
