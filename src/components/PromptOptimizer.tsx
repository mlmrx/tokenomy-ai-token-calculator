import React, { useMemo } from "react";
import { Info } from "lucide-react";

interface PromptOptimizerProps {
  text: string;
  tokens: number;
}

const PromptOptimizer = ({ text, tokens }: PromptOptimizerProps) => {
  // Generate optimization suggestions based on the input text
  const suggestions = useMemo(() => {
    const result: string[] = [];
    
    // Only analyze if we have text
    if (text.length > 0) {
      // Excessive politeness
      if (
        text.toLowerCase().includes("please") && 
        (text.toLowerCase().includes("thank you") || text.toLowerCase().includes("thanks"))
      ) {
        result.push("Remove unnecessary politeness phrases");
      }
      
      // Redundant context
      if (
        text.toLowerCase().includes("as an ai") || 
        text.toLowerCase().includes("as a language model") || 
        text.toLowerCase().includes("as an assistant")
      ) {
        result.push("Remove statements telling the AI what it is");
      }
      
      // Wordy introductions
      if (
        text.toLowerCase().includes("i want you to") || 
        text.toLowerCase().includes("i would like you to") ||
        text.toLowerCase().includes("i need you to")
      ) {
        result.push("Use direct instructions instead of 'I want you to...'");
      }
      
      // Long text blocks
      if (text.length > 500 && !text.includes('\n')) {
        result.push("Break long text into paragraphs");
      }
      
      // Ambiguous pronoun references
      const pronouns = ['it', 'they', 'them', 'this', 'that', 'these', 'those'];
      let pronounCount = 0;
      pronouns.forEach(pronoun => {
        const regex = new RegExp(`\\b${pronoun}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) pronounCount += matches.length;
      });
      
      if (pronounCount > 3 && text.length > 200) {
        result.push("Replace ambiguous pronouns with specific nouns");
      }
    }
    
    // Only show relevant suggestions based on content length
    if (result.length === 0) {
      if (text.length < 10) {
        result.push("Add more detailed content");
      } else if (tokens > 1000) {
        result.push("Consider breaking into smaller prompts");
      } else if (tokens > 500) {
        result.push("Use bullet points for complex requests");
      }
    }
    
    return result;
  }, [text, tokens]);
  
  // Create an optimized version of the prompt (simplified example)
  const optimizedPrompt = useMemo(() => {
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
  }, [text]);
  
  const estimatedSavings = text && optimizedPrompt ? Math.max(0, Math.round((text.length - optimizedPrompt.length) / text.length * 100)) : 0;
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md p-2 h-full">
      <div className="flex items-center mb-1">
        <Info className="h-3.5 w-3.5 text-blue-600 mr-1" /> 
        <h4 className="text-xs font-medium text-blue-800">Prompt Optimization Tips</h4>
      </div>
      
      {suggestions.length > 0 && (
        <ul className="text-xs text-gray-700 list-disc pl-4 mb-1 space-y-0.5">
          {suggestions.slice(0, 3).map((suggestion, index) => (
            <li key={index} className="text-[10px]">{suggestion}</li>
          ))}
        </ul>
      )}
      
      {estimatedSavings > 0 && text && (
        <div className="text-[10px] mt-1 text-blue-600 font-medium">
          Potential savings: ~{estimatedSavings}%
        </div>
      )}
      
      {text && text !== optimizedPrompt && text.length > 100 && (
        <div className="mt-1.5">
          <div className="text-[10px] font-medium text-blue-800">Optimized Sample:</div>
          <div className="text-[10px] bg-white border border-blue-100 rounded p-1 mt-0.5 whitespace-pre-wrap max-h-24 overflow-y-auto">
            {optimizedPrompt.length > 150 ? optimizedPrompt.substring(0, 150) + "..." : optimizedPrompt}
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptOptimizer;
