
import React from "react";
import { Card } from "@/components/ui/card";

interface ProcessFlowEnhancedProps {
  text: string;
  tokens: number;
}

const ProcessFlowEnhanced = ({ text, tokens }: ProcessFlowEnhancedProps) => {
  if (!text) {
    return (
      <Card className="p-6 text-center text-gray-500">
        Enter some text to visualize the tokenization process
      </Card>
    );
  }

  // Create a simple tokenization visualization
  const sampleTokens = generateSampleTokens(text);
  
  return (
    <Card className="p-4 space-y-6">
      <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4 text-center">
        <div className="w-full md:w-1/4 p-4 bg-indigo-100 rounded-lg">
          <h3 className="font-medium text-indigo-700">Input Text</h3>
          <p className="text-sm text-indigo-600 mt-1">{text.length} characters</p>
        </div>
        
        <div className="hidden md:block text-indigo-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
        </div>
        
        <div className="w-full md:w-1/4 p-4 bg-purple-100 rounded-lg">
          <h3 className="font-medium text-purple-700">Tokenization</h3>
          <p className="text-sm text-purple-600 mt-1">Text → Tokens</p>
        </div>
        
        <div className="hidden md:block text-purple-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
        </div>
        
        <div className="w-full md:w-1/4 p-4 bg-blue-100 rounded-lg">
          <h3 className="font-medium text-blue-700">Token ID Lookup</h3>
          <p className="text-sm text-blue-600 mt-1">Mapping to vocabulary</p>
        </div>
        
        <div className="hidden md:block text-blue-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
        </div>
        
        <div className="w-full md:w-1/4 p-4 bg-emerald-100 rounded-lg">
          <h3 className="font-medium text-emerald-700">Final Count</h3>
          <p className="text-sm text-emerald-600 mt-1">{tokens} tokens</p>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-700 mb-3">Token Visualization</h3>
        <div className="flex flex-wrap gap-1.5">
          {sampleTokens.map((token, i) => (
            <div 
              key={i} 
              className="relative px-3 py-1.5 rounded text-sm"
              style={{
                backgroundColor: getTokenColor(token, i),
                color: getTokenTextColor(token, i),
              }}
            >
              {token.value}
              <span className="absolute -top-1 -right-1 bg-gray-800 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                {token.id % 1000}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-700 mb-2">How Tokens are Formed</h3>
          <ul className="text-xs space-y-1.5 text-gray-600">
            <li className="flex items-start gap-1.5">
              <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5"></div>
              <span>Common words like "the", "and", "in" are usually single tokens</span>
            </li>
            <li className="flex items-start gap-1.5">
              <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5"></div>
              <span>Less common words often split into multiple subword tokens</span>
            </li>
            <li className="flex items-start gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5"></div>
              <span>Punctuation marks typically get their own tokens</span>
            </li>
            <li className="flex items-start gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5"></div>
              <span>Special characters and numbers often tokenized separately</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-700 mb-2">Token Patterns</h3>
          <div className="space-y-2 text-xs">
            <div>
              <span className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded">Tokenization</span>
              <span className="ml-2 text-gray-600">→ [Token, ization]</span>
            </div>
            <div>
              <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 rounded">AI</span>
              <span className="ml-2 text-gray-600">→ [AI] (single token)</span>
            </div>
            <div>
              <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded">1234</span>
              <span className="ml-2 text-gray-600">→ [1, 2, 3, 4] (separate tokens)</span>
            </div>
            <div>
              <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded">hello!</span>
              <span className="ml-2 text-gray-600">→ [hello, !] (word + punctuation)</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Helper function to create sample tokenization for visualization
const generateSampleTokens = (text: string): { value: string; id: number }[] => {
  const sampleTokens: { value: string; id: number }[] = [];
  
  // This is a simplified tokenization for display purposes
  // In reality, tokenization is much more complex
  
  // Split the text into words first
  const words = text.split(/(\s+|[.,!?;:()[\]{}""''`])/g).filter(word => word.trim() !== '');
  
  let tokenId = 1000; // Starting token ID
  const tokensToShow = Math.min(words.length, 30); // Limit to 30 tokens for display
  
  for (let i = 0; i < tokensToShow; i++) {
    const word = words[i];
    
    // For simplicity, we'll do some basic rules
    if (word.length > 6 && !word.match(/[.,!?;:()[\]{}""''`]/)) {
      // Split longer words (simplified approximation)
      const firstPart = word.substring(0, Math.ceil(word.length / 2));
      const secondPart = word.substring(Math.ceil(word.length / 2));
      
      sampleTokens.push({ value: firstPart, id: tokenId++ });
      sampleTokens.push({ value: secondPart, id: tokenId++ });
    } else {
      sampleTokens.push({ value: word, id: tokenId++ });
    }
  }
  
  return sampleTokens;
};

// Generate colors for tokens
const getTokenColor = (token: { value: string; id: number }, index: number): string => {
  const isPunctuation = /[.,!?;:()[\]{}""''`]/.test(token.value);
  const isNumber = /^\d+$/.test(token.value);
  const isWhitespace = /\s+/.test(token.value);
  
  if (isPunctuation) return "rgba(253, 186, 116, 0.7)"; // Orange
  if (isNumber) return "rgba(147, 197, 253, 0.7)"; // Blue
  if (isWhitespace) return "rgba(209, 213, 219, 0.7)"; // Gray
  
  // Use different colors for regular tokens
  const colorOptions = [
    "rgba(167, 139, 250, 0.7)", // Purple
    "rgba(147, 197, 253, 0.7)", // Blue
    "rgba(110, 231, 183, 0.7)", // Green
    "rgba(252, 165, 165, 0.7)", // Red
    "rgba(253, 224, 71, 0.7)"   // Yellow
  ];
  
  return colorOptions[index % colorOptions.length];
};

const getTokenTextColor = (token: { value: string; id: number }, index: number): string => {
  return "rgba(0, 0, 0, 0.75)";
};

export default ProcessFlowEnhanced;
