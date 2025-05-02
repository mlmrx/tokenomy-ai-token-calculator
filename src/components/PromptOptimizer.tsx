
import React from "react";
import { Info } from "lucide-react";

interface PromptOptimizerProps {
  text: string;
  tokens: number;
}

const PromptOptimizer = ({ text, tokens }: PromptOptimizerProps) => {
  // Generate optimization suggestions based on the input text
  const suggestions: string[] = [];
  
  // Check for common inefficient patterns
  if (text.length > 0) {
    // Excessive politeness
    if (
      text.toLowerCase().includes("please") && 
      (text.toLowerCase().includes("thank you") || text.toLowerCase().includes("thanks"))
    ) {
      suggestions.push("Remove unnecessary politeness phrases like 'please' and 'thank you'");
    }
    
    // Redundant context
    if (
      text.toLowerCase().includes("as an ai") || 
      text.toLowerCase().includes("as a language model") || 
      text.toLowerCase().includes("as an assistant")
    ) {
      suggestions.push("Remove statements telling the AI what it is ('As an AI...')");
    }
    
    // Wordy introductions
    if (
      text.toLowerCase().includes("i want you to") || 
      text.toLowerCase().includes("i would like you to") ||
      text.toLowerCase().includes("i need you to")
    ) {
      suggestions.push("Use direct instructions instead of 'I want you to...' phrases");
    }
    
    // Repeated instructions
    const sentences = text.split(/[.!?]+/);
    const normalizedSentences = sentences.map(s => s.toLowerCase().trim());
    const uniqueSentences = new Set(normalizedSentences);
    if (uniqueSentences.size < normalizedSentences.length * 0.8) {
      suggestions.push("Remove repeated or redundant instructions");
    }
    
    // Long text blocks
    if (text.length > 500 && !text.includes('\n')) {
      suggestions.push("Break long text into paragraphs for better organization");
    }
    
    // Ambiguous pronoun references
    const pronouns = ['it', 'they', 'them', 'this', 'that', 'these', 'those'];
    let pronounCount = 0;
    pronouns.forEach(pronoun => {
      const regex = new RegExp(`\\b${pronoun}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) pronounCount += matches.length;
    });
    
    if (pronounCount > 3) {
      suggestions.push("Replace ambiguous pronouns (it, they, them) with specific nouns");
    }
  }
  
  // Add general optimization suggestions if no specific issues or text is empty
  if (suggestions.length === 0) {
    // Default suggestions when no specific issues found
    suggestions.push(
      "Use clear, specific instructions",
      "Organize complex requests with bullet points or numbered lists",
      "Specify the desired format for the response"
    );
  }
  
  // Create an optimized version of the prompt (simplified example)
  const createOptimizedPrompt = () => {
    if (!text) return "";
    
    let optimized = text;
    
    // Remove redundant phrases
    optimized = optimized.replace(/as an ai language model,?/gi, '');
    optimized = optimized.replace(/i want you to |i would like you to |i need you to /gi, '');
    
    // Simplify excessive politeness
    if (optimized.toLowerCase().includes("please") && 
        (optimized.toLowerCase().includes("thank you") || optimized.toLowerCase().includes("thanks"))) {
      optimized = optimized.replace(/\s*thank you\.?|\s*thanks\.?/gi, '');
      // Keep one "please" if it exists
      const pleaseCount = (optimized.match(/please/gi) || []).length;
      if (pleaseCount > 1) {
        optimized = optimized.replace(/please/gi, function(match, index) {
          return index > optimized.indexOf("please") ? "" : match;
        });
      }
    }
    
    return optimized;
  };
  
  const optimizedPrompt = createOptimizedPrompt();
  const estimatedSavings = text && optimizedPrompt ? Math.max(0, Math.round((text.length - optimizedPrompt.length) / text.length * 100)) : 0;
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 h-full">
      <div className="flex items-center mb-2">
        <Info className="h-4 w-4 text-blue-600 mr-1" /> 
        <h4 className="text-sm font-medium text-blue-800">Prompt Optimization Suggestions</h4>
      </div>
      
      {suggestions.length > 0 && (
        <ul className="text-xs text-gray-700 list-disc pl-5 mb-2 space-y-0.5">
          {suggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
      )}
      
      {estimatedSavings > 0 && text && (
        <div className="text-xs mt-1.5 text-blue-600 font-medium">
          Potential token savings: approximately {estimatedSavings}%
        </div>
      )}
      
      {text && text !== optimizedPrompt && (
        <div className="mt-2">
          <div className="text-xs font-medium text-blue-800">Suggested Optimized Prompt:</div>
          <div className="text-xs bg-white border border-blue-100 rounded p-2 mt-1 whitespace-pre-wrap max-h-40 overflow-y-auto">
            {optimizedPrompt}
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptOptimizer;
