
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Commonly used RegEx patterns for tokenization
export const patternsByLanguage = {
  english: {
    words: /\b\w+\b/g,
    punctuation: /[.,!?;:()[\]{}'"]/g,
    specialChars: /[^a-zA-Z0-9\s.,!?;:()[\]{}'"]/g,
    numbers: /\d+/g,
  },
  chinese: {
    characters: /[\u4e00-\u9fa5]/g, // Chinese characters
    punctuation: /[。，！？；：（）［］｛｝""'']/g,
  },
  japanese: {
    characters: /[\u3040-\u309F\u30A0-\u30FF\u4e00-\u9fa5]/g, // Hiragana, Katakana, and Kanji
    punctuation: /[。、！？；：（）［］｛｝「」]/g,
  }
};

/**
 * Get estimated token count multiplier based on the language detected in text
 */
export function detectLanguageMultiplier(text: string): number {
  // Check for significant presence (>15%) of CJK characters
  const cjkPattern = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/g;
  const cjkMatches = text.match(cjkPattern) || [];
  const cjkRatio = cjkMatches.length / (text.length || 1);

  // CJK languages typically have higher chars per token
  if (cjkRatio > 0.15) {
    return 1.5; // CJK languages have more chars per token (~1.5x chars compared to tokens)
  }

  // Check for significant presence of non-Latin scripts
  const nonLatinPattern = /[^\u0000-\u007F\s]/g;
  const nonLatinMatches = text.match(nonLatinPattern) || [];
  const nonLatinRatio = nonLatinMatches.length / (text.length || 1);

  // Non-Latin scripts often need specialized tokenization
  if (nonLatinRatio > 0.15) {
    return 1.2;
  }

  return 1.0; // Default for Latin script languages like English
}

/**
 * Get specific tokenization data about a model
 */
export function getTokenizationParams(model: string): { 
  charsPerToken: number;
  tokenMultiplier: number;
  overhead: number;
  scheme: string;
} {
  // Default values
  let charsPerToken = 4;
  let tokenMultiplier = 1.0;
  let overhead = 3;
  let scheme = 'Default';

  // OpenAI/cl100k_base models (GPT-3.5, GPT-4, etc)
  if (model.includes('gpt-') || model.includes('azure-gpt')) {
    charsPerToken = 4;
    tokenMultiplier = 1.0; 
    overhead = 3;
    scheme = 'cl100k_base';
  }
  // Claude models
  else if (model.includes('claude')) {
    charsPerToken = 3.8;
    tokenMultiplier = 1.05;
    overhead = 5;
    scheme = 'Claude';
  }
  // Llama models
  else if (model.includes('llama')) {
    charsPerToken = 4.2;
    tokenMultiplier = 0.98;
    overhead = 2;
    scheme = 'Llama';
  }
  // Google/SentencePiece models
  else if (model.includes('gemini')) {
    charsPerToken = 3.7;
    tokenMultiplier = 1.08;
    overhead = 4;
    scheme = 'SentencePiece';
  }
  // Microsoft/phi models
  else if (model.includes('phi')) {
    charsPerToken = 4.1;
    tokenMultiplier = 0.95;
    overhead = 2;
    scheme = 'phi3';
  }
  // Mistral models
  else if (model.includes('mistral')) {
    charsPerToken = 4.0;
    tokenMultiplier = 1.0;
    overhead = 3;
    scheme = 'Mistral';
  }
  // Titan/Amazon models
  else if (model.includes('titan')) {
    charsPerToken = 4.1;
    tokenMultiplier = 1.0;
    overhead = 2;
    scheme = 'Amazon';
  }
  // Grok models
  else if (model.includes('grok')) {
    charsPerToken = 4.0;
    tokenMultiplier = 1.02;
    overhead = 3;
    scheme = 'Grok';
  }
  // DeepSeek models
  else if (model.includes('deepseek')) {
    charsPerToken = 3.9;
    tokenMultiplier = 1.03;
    overhead = 2;
    scheme = 'DeepSeek';
  }
  // Qwen models
  else if (model.includes('qwen')) {
    charsPerToken = 3.8;
    tokenMultiplier = 1.05;
    overhead = 3;
    scheme = 'Qwen';
  }
  // ERNIE models
  else if (model.includes('ernie')) {
    charsPerToken = 3.9;
    tokenMultiplier = 1.02;
    overhead = 3;
    scheme = 'ERNIE';
  }

  return { charsPerToken, tokenMultiplier, overhead, scheme };
}
