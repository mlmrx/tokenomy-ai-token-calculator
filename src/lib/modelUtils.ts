
// Helper functions for model data and utilities

// Get categories for different models (Updated Oct 2025)
export function getModelCategories() {
  return {
    'OpenAI': ['gpt-5', 'gpt-5-mini', 'gpt-5-nano', 'gpt-4.1', 'gpt-4.1-mini', 'o3', 'o4-mini', 'gpt-4o', 'gpt-4o-mini'],
    'Anthropic': ['claude-opus-4.1', 'claude-sonnet-4.5', 'claude-haiku-4', 'claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    'Google': ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    'Meta': ['llama-4-maverick', 'llama-4-scout', 'llama-3.3-70b', 'llama-3-70b', 'llama-3-8b'],
    'Microsoft': ['azure-gpt-5', 'azure-gpt-4.1', 'phi-3-mini', 'phi-3-medium'],
    'Amazon': ['titan-text-express', 'titan-text-lite', 'titan-embedding'],
    'Mistral': ['mistral-large-3', 'mistral-medium-3', 'mistral-small-3'],
    'X.AI': ['grok-2', 'grok-2-mini'],
    'DeepSeek': ['deepseek-v3', 'deepseek-coder-v2'],
    'Alibaba': ['qwen-max', 'qwen-plus'],
    'Baidu': ['ernie-bot', 'ernie-lite'],
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

// Calculate cost based on token count (Updated Oct 2025)
export function calculateCost(tokens: number, model: string, isOutput: boolean = false): number {
  // Default pricing in $ per 1,000 tokens
  const pricing: Record<string, { input: number; output: number }> = {
    'gpt-5': { input: 0.003, output: 0.012 },
    'gpt-5-mini': { input: 0.0008, output: 0.0032 },
    'gpt-5-nano': { input: 0.0003, output: 0.0012 },
    'gpt-4.1': { input: 0.002, output: 0.008 },
    'gpt-4.1-mini': { input: 0.0005, output: 0.002 },
    'o3': { input: 0.01, output: 0.04 },
    'o4-mini': { input: 0.002, output: 0.008 },
    'gpt-4o': { input: 0.005, output: 0.015 },
    'gpt-4o-mini': { input: 0.0005, output: 0.0015 },
    'claude-opus-4.1': { input: 0.015, output: 0.075 },
    'claude-sonnet-4.5': { input: 0.003, output: 0.015 },
    'claude-haiku-4': { input: 0.0002, output: 0.001 },
    'claude-3-opus': { input: 0.015, output: 0.075 },
    'claude-3-sonnet': { input: 0.003, output: 0.015 },
    'claude-3-haiku': { input: 0.00025, output: 0.00125 },
    'gemini-2.5-pro': { input: 0.00125, output: 0.01 },
    'gemini-2.5-flash': { input: 0.0002, output: 0.0006 },
    'gemini-2.5-flash-lite': { input: 0.00005, output: 0.00015 },
    'gemini-1.5-pro': { input: 0.0025, output: 0.0075 },
    'gemini-1.5-flash': { input: 0.00035, output: 0.001 },
    'llama-4-maverick': { input: 0.0005, output: 0.0005 },
    'llama-4-scout': { input: 0.0002, output: 0.0002 },
    'llama-3.3-70b': { input: 0.0006, output: 0.0006 },
    'llama-3-70b': { input: 0.0008, output: 0.0008 },
    'llama-3-8b': { input: 0.0001, output: 0.0002 },
    'phi-3-mini': { input: 0.0003, output: 0.0006 },
    'phi-3-medium': { input: 0.0004, output: 0.0008 },
    'titan-text-express': { input: 0.0002, output: 0.0006 },
    'titan-text-lite': { input: 0.0003, output: 0.0004 },
    'titan-embedding': { input: 0.0001, output: 0.0001 },
    'mistral-large-3': { input: 0.002, output: 0.006 },
    'mistral-medium-3': { input: 0.0004, output: 0.002 },
    'mistral-small-3': { input: 0.0002, output: 0.0008 },
    'grok-2': { input: 0.0002, output: 0.0006 },
    'grok-2-mini': { input: 0.00015, output: 0.0004 },
    'deepseek-v3': { input: 0.00015, output: 0.0003 },
    'deepseek-coder-v2': { input: 0.0001, output: 0.0002 },
    'qwen-max': { input: 0.0003, output: 0.0009 },
    'qwen-plus': { input: 0.0001, output: 0.0004 },
    'ernie-bot': { input: 0.0002, output: 0.0006 },
    'ernie-lite': { input: 0.0001, output: 0.0003 },
    'azure-gpt-5': { input: 0.003, output: 0.012 },
    'azure-gpt-4.1': { input: 0.002, output: 0.008 },
    'default': { input: 0.001, output: 0.002 }
  };
  
  const modelPricing = pricing[model] || pricing['default'];
  const priceRate = isOutput ? modelPricing.output : modelPricing.input;
  
  return (tokens / 1000) * priceRate;
}

// Get info about tokenization for models (Updated Oct 2025)
export function getTokenizationInfo(model: string) {
  const tokenizationSchemes: Record<string, { scheme: string; overhead: string }> = {
    'gpt-5': { scheme: 'o200k_base', overhead: '~2%' },
    'gpt-5-mini': { scheme: 'o200k_base', overhead: '~2%' },
    'gpt-5-nano': { scheme: 'o200k_base', overhead: '~2%' },
    'gpt-4.1': { scheme: 'cl100k_base', overhead: '~2%' },
    'gpt-4.1-mini': { scheme: 'cl100k_base', overhead: '~2%' },
    'o3': { scheme: 'o200k_base', overhead: '~2-3%' },
    'o4-mini': { scheme: 'o200k_base', overhead: '~2%' },
    'gpt-4o': { scheme: 'BPE', overhead: '~2%' },
    'gpt-4o-mini': { scheme: 'BPE', overhead: '~2%' },
    'claude-opus-4.1': { scheme: 'Anthropic BPE', overhead: '~2-3%' },
    'claude-sonnet-4.5': { scheme: 'Anthropic BPE', overhead: '~2-3%' },
    'claude-haiku-4': { scheme: 'Anthropic BPE', overhead: '~2%' },
    'claude-3-opus': { scheme: 'Anthropic BPE', overhead: '~2-3%' },
    'claude-3-sonnet': { scheme: 'Anthropic BPE', overhead: '~2-3%' },
    'claude-3-haiku': { scheme: 'Anthropic BPE', overhead: '~2-3%' },
    'gemini-2.5-pro': { scheme: 'SentencePiece', overhead: '~2%' },
    'gemini-2.5-flash': { scheme: 'SentencePiece', overhead: '~2%' },
    'gemini-2.5-flash-lite': { scheme: 'SentencePiece', overhead: '~1-2%' },
    'gemini-1.5-pro': { scheme: 'SentencePiece', overhead: '~2%' },
    'gemini-1.5-flash': { scheme: 'SentencePiece', overhead: '~2%' },
    'llama-4-maverick': { scheme: 'BPE', overhead: '~2%' },
    'llama-4-scout': { scheme: 'BPE', overhead: '~2%' },
    'llama-3.3-70b': { scheme: 'BPE', overhead: '~2-3%' },
    'llama-3-70b': { scheme: 'BPE', overhead: '~2-3%' },
    'llama-3-8b': { scheme: 'BPE', overhead: '~2-3%' },
    'phi-3-mini': { scheme: 'BPE', overhead: '~2%' },
    'phi-3-medium': { scheme: 'BPE', overhead: '~2%' },
    'mistral-large-3': { scheme: 'BPE', overhead: '~2%' },
    'mistral-medium-3': { scheme: 'BPE', overhead: '~2%' },
    'mistral-small-3': { scheme: 'BPE', overhead: '~2%' },
    'grok-2': { scheme: 'BPE', overhead: '~2%' },
    'grok-2-mini': { scheme: 'BPE', overhead: '~2%' },
    'deepseek-v3': { scheme: 'BPE', overhead: '~2%' },
    'deepseek-coder-v2': { scheme: 'BPE', overhead: '~2%' },
    'qwen-max': { scheme: 'BPE', overhead: '~2%' },
    'qwen-plus': { scheme: 'BPE', overhead: '~2%' },
    'ernie-bot': { scheme: 'BPE', overhead: '~2%' },
    'ernie-lite': { scheme: 'BPE', overhead: '~2%' },
    'azure-gpt-5': { scheme: 'o200k_base', overhead: '~2%' },
    'azure-gpt-4.1': { scheme: 'cl100k_base', overhead: '~2%' },
    'default': { scheme: 'BPE', overhead: '~2%' }
  };
  
  return tokenizationSchemes[model] || tokenizationSchemes['default'];
}

// Add any missing model data functions that might be needed
export function getModelData() {
  return getModelCategories();
}
