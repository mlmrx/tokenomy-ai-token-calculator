
// Helper functions for model data and utilities

// Get categories for different models
export function getModelCategories() {
  return {
    'OpenAI': ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
    'Anthropic': ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku', 'claude-3-5-sonnet'],
    'Google': ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-ultra-2'],
    'Meta': ['llama-3-70b', 'llama-3-8b'],
    'Microsoft': ['azure-gpt-4o', 'phi-3-mini', 'phi-3-medium'],
    'Amazon': ['titan-text-express', 'titan-text-lite', 'titan-embedding'],
    'Mistral': ['mistral-large', 'mistral-medium', 'mistral-small'],
    'X.AI': ['grok-1', 'grok-1-mini'],
    'DeepSeek': ['deepseek-coder', 'deepseek-llm'],
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

// Calculate cost based on token count
export function calculateCost(tokens: number, model: string, isOutput: boolean = false): number {
  // Default pricing in $ per 1,000 tokens
  const pricing: Record<string, { input: number; output: number }> = {
    'gpt-4o': { input: 0.005, output: 0.015 },
    'gpt-4o-mini': { input: 0.0005, output: 0.0015 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
    'claude-3-opus': { input: 0.015, output: 0.075 },
    'claude-3-sonnet': { input: 0.003, output: 0.015 },
    'claude-3-haiku': { input: 0.00025, output: 0.00125 },
    'claude-3-5-sonnet': { input: 0.005, output: 0.015 },
    'gemini-1.5-pro': { input: 0.0025, output: 0.0075 },
    'gemini-1.5-flash': { input: 0.00035, output: 0.001 },
    'gemini-ultra-2': { input: 0.007, output: 0.021 },
    'llama-3-70b': { input: 0.0008, output: 0.0008 },
    'llama-3-8b': { input: 0.0001, output: 0.0002 },
    'phi-3-mini': { input: 0.0003, output: 0.0006 },
    'phi-3-medium': { input: 0.0004, output: 0.0008 },
    'titan-text-express': { input: 0.0002, output: 0.0006 },
    'titan-text-lite': { input: 0.0003, output: 0.0004 },
    'titan-embedding': { input: 0.0001, output: 0.0001 },
    'mistral-large': { input: 0.002, output: 0.006 },
    'mistral-medium': { input: 0.0004, output: 0.0012 },
    'mistral-small': { input: 0.0002, output: 0.0006 },
    'grok-1': { input: 0.0002, output: 0.0006 },
    'grok-1-mini': { input: 0.00015, output: 0.0004 },
    'deepseek-coder': { input: 0.0001, output: 0.0002 },
    'deepseek-llm': { input: 0.0002, output: 0.0006 },
    'qwen-max': { input: 0.0003, output: 0.0009 },
    'qwen-plus': { input: 0.0001, output: 0.0004 },
    'ernie-bot': { input: 0.0002, output: 0.0006 },
    'ernie-lite': { input: 0.0001, output: 0.0003 },
    'default': { input: 0.001, output: 0.002 }
  };
  
  const modelPricing = pricing[model] || pricing['default'];
  const priceRate = isOutput ? modelPricing.output : modelPricing.input;
  
  return (tokens / 1000) * priceRate;
}

// Get info about tokenization for models
export function getTokenizationInfo(model: string) {
  const tokenizationSchemes: Record<string, { scheme: string; overhead: string }> = {
    'gpt-4o': { scheme: 'BPE', overhead: '~2%' },
    'gpt-4o-mini': { scheme: 'BPE', overhead: '~2%' },
    'gpt-4': { scheme: 'BPE', overhead: '~2%' },
    'gpt-3.5-turbo': { scheme: 'BPE', overhead: '~2%' },
    'claude-3-opus': { scheme: 'Anthropic BPE', overhead: '~2-3%' },
    'claude-3-sonnet': { scheme: 'Anthropic BPE', overhead: '~2-3%' },
    'claude-3-haiku': { scheme: 'Anthropic BPE', overhead: '~2-3%' },
    'claude-3-5-sonnet': { scheme: 'Anthropic BPE', overhead: '~2-3%' },
    'gemini-1.5-pro': { scheme: 'SentencePiece', overhead: '~2%' },
    'gemini-1.5-flash': { scheme: 'SentencePiece', overhead: '~2%' },
    'gemini-ultra-2': { scheme: 'SentencePiece', overhead: '~2%' },
    'llama-3-70b': { scheme: 'BPE', overhead: '~2-3%' },
    'llama-3-8b': { scheme: 'BPE', overhead: '~2-3%' },
    'phi-3-mini': { scheme: 'BPE', overhead: '~2%' },
    'phi-3-medium': { scheme: 'BPE', overhead: '~2%' },
    'mistral-large': { scheme: 'BPE', overhead: '~2%' },
    'mistral-medium': { scheme: 'BPE', overhead: '~2%' },
    'mistral-small': { scheme: 'BPE', overhead: '~2%' },
    'grok-1': { scheme: 'BPE', overhead: '~2%' },
    'grok-1-mini': { scheme: 'BPE', overhead: '~2%' },
    'deepseek-coder': { scheme: 'BPE', overhead: '~2%' },
    'deepseek-llm': { scheme: 'BPE', overhead: '~2%' },
    'qwen-max': { scheme: 'BPE', overhead: '~2%' },
    'qwen-plus': { scheme: 'BPE', overhead: '~2%' },
    'ernie-bot': { scheme: 'BPE', overhead: '~2%' },
    'ernie-lite': { scheme: 'BPE', overhead: '~2%' },
    'default': { scheme: 'BPE', overhead: '~2%' }
  };
  
  return tokenizationSchemes[model] || tokenizationSchemes['default'];
}
