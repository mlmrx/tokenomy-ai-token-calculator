
// These pricing data are based on publicly available information as of May 2023
// Prices are in USD per 1K tokens

export const modelPricing: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 0.01, output: 0.03 },
  'gpt-4o-mini': { input: 0.005, output: 0.015 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
  'claude-3-opus': { input: 0.015, output: 0.075 },
  'claude-3-sonnet': { input: 0.008, output: 0.024 },
  'claude-3-haiku': { input: 0.00025, output: 0.00125 },
  'llama-3-70b': { input: 0.0002, output: 0.0003 },
  'llama-3-8b': { input: 0.0001, output: 0.0002 }
};

// Simple token estimator function (for demonstration purposes)
export const estimateTokens = (text: string): number => {
  if (!text) return 0;
  
  // English text averages roughly 4 characters per token
  // This is a simple approximation - real tokenization is more complex
  return Math.ceil(text.length / 4);
};

// Calculate cost based on token count and model
export const calculateCost = (tokenCount: number, model: string, isOutput: boolean = false): number => {
  if (!modelPricing[model]) return 0;
  
  const rate = isOutput ? modelPricing[model].output : modelPricing[model].input;
  return (tokenCount * rate) / 1000;
};
