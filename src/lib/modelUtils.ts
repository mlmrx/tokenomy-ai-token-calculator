
// Helper functions for model data and utilities

// Get categories for different models
export function getModelCategories() {
  return {
    'OpenAI': ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
    'Anthropic': ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    'Google': ['gemini-pro', 'gemini-ultra'],
    'Meta': ['llama-3', 'llama-2'],
    'Microsoft': ['phi-3', 'phi-2'],
    'Mistral': ['mistral-large', 'mistral-medium', 'mistral-small'],
    'Amazon': ['titan', 'titan-express'],
    'X.AI': ['grok-1'],
    'Other': ['custom-model']
  };
}

// Simple token estimation function
export function estimateTokens(text: string): number {
  if (!text) return 0;
  // Simple approximation: ~4 characters per token for English text
  const charCount = text.length;
  let tokenEstimate = Math.ceil(charCount / 4);
  
  // Add a small overhead for special tokens
  tokenEstimate += 3;
  
  return tokenEstimate;
}

// Calculate cost based on token count
export function calculateCost(tokens: number, model: string, isOutput: boolean = false): number {
  // Default pricing in $ per 1,000 tokens
  const pricing: Record<string, { input: number, output: number }> = {
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
    'claude-3-opus': { input: 0.015, output: 0.075 },
    'claude-3-sonnet': { input: 0.003, output: 0.015 },
    'claude-3-haiku': { input: 0.00025, output: 0.00125 },
    'gemini-pro': { input: 0.00025, output: 0.0005 },
    'gemini-ultra': { input: 0.0025, output: 0.005 },
    'llama-3': { input: 0.0002, output: 0.0004 },
    'mistral-large': { input: 0.002, output: 0.006 },
    'default': { input: 0.001, output: 0.002 }
  };
  
  const modelPricing = pricing[model] || pricing['default'];
  const priceRate = isOutput ? modelPricing.output : modelPricing.input;
  
  return (tokens / 1000) * priceRate;
}

// Get info about tokenization for models
export function getTokenizationInfo(model: string) {
  const tokenizationSchemes: Record<string, { scheme: string; overhead: string }> = {
    'gpt-4': { scheme: 'BPE', overhead: '~2%' },
    'gpt-3.5-turbo': { scheme: 'BPE', overhead: '~2%' },
    'claude-3-opus': { scheme: 'Anthropic BPE', overhead: '~2-3%' },
    'gemini-pro': { scheme: 'SentencePiece', overhead: '~2%' },
    'llama-3': { scheme: 'BPE', overhead: '~2-3%' },
    'mistral-large': { scheme: 'BPE', overhead: '~2%' },
    'default': { scheme: 'BPE', overhead: '~2%' }
  };
  
  return tokenizationSchemes[model] || tokenizationSchemes['default'];
}
