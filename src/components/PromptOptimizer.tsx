
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
      // Check for unclear instructions
      if (text.split(' ').length < 15 && !text.includes('?') && !text.includes(':')) {
        result.push("Add more specific instructions");
      }
      
      // Check for excessive politeness
      if (
        text.toLowerCase().includes("please") && 
        (text.toLowerCase().includes("thank you") || text.toLowerCase().includes("thanks"))
      ) {
        result.push("Remove unnecessary politeness");
      }
      
      // Check for context redundancy
      const contextPhrases = ["as an ai", "as a language model", "as an assistant", "you are an ai"];
      if (contextPhrases.some(phrase => text.toLowerCase().includes(phrase))) {
        result.push("Remove redundant AI context");
      }
      
      // Check for structure issues
      if (text.length > 200 && !text.includes('\n') && !text.includes('.')) {
        result.push("Add structure with paragraphs");
      }
      
      // Check for specificity issues
      const vagueWords = ["good", "nice", "better", "improve", "enhance", "thing", "stuff", "etc"];
      let vagueWordCount = 0;
      vagueWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) vagueWordCount += matches.length;
      });
      
      if (vagueWordCount > 2 && text.length > 100) {
        result.push("Replace vague terms with specifics");
      }
      
      // Check for complex prompt issues
      if (text.length > 500) {
        // Check if it has multiple unrelated questions
        const questions = text.match(/\?/g);
        if (questions && questions.length > 2) {
          result.push("Split into separate prompts");
        }
        
        // Check for logical organization
        if (!text.toLowerCase().includes("first") && 
            !text.toLowerCase().includes("then") && 
            !text.includes("1.") && 
            !text.includes("•")) {
          result.push("Use numbered lists or bullet points");
        }
      }
    }
    
    // Only show relevant suggestions based on content length
    if (result.length === 0) {
      if (text.length === 0) {
        result.push("Enter text for optimization tips");
      } else if (text.length < 10) {
        result.push("Add more detailed content");
      } else if (tokens > 1000) {
        result.push("Consider breaking into smaller prompts");
      } else if (text.length > 50 && !text.includes('\n') && text.length < 200) {
        result.push("Use clear, direct instructions");
      }
    }
    
    return result;
  }, [text, tokens]);
  
  // Create an optimized version of the prompt
  const optimizedPrompt = useMemo(() => {
    if (!text || text.length < 20) return "";
    
    let optimized = text;
    
    // Remove redundant phrases
    optimized = optimized.replace(/as an ai language model,?/gi, '');
    optimized = optimized.replace(/as an ai,?/gi, '');
    optimized = optimized.replace(/you are an ai,?/gi, '');
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
      
      {estimatedSavings > 5 && text && (
        <div className="text-[10px] mt-1 text-blue-600 font-medium">
          Potential savings: ~{estimatedSavings}%
        </div>
      )}
      
      {text && text !== optimizedPrompt && text.length > 100 && optimizedPrompt && (
        <div className="mt-1.5">
          <div className="text-[10px] font-medium text-blue-800">Optimized Sample:</div>
          <div className="text-[10px] bg-white border border-blue-100 rounded p-1 mt-0.5 whitespace-pre-wrap max-h-20 overflow-y-auto">
            {optimizedPrompt.length > 120 ? optimizedPrompt.substring(0, 120) + "..." : optimizedPrompt}
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptOptimizer;
