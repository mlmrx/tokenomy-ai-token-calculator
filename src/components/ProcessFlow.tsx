
import { useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";

interface ProcessFlowProps {
  tokens: number;
  text: string;
}

const ProcessFlow = ({ tokens, text }: ProcessFlowProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !text) return;
    
    // Create a visualization of the tokenization process
    const container = containerRef.current;
    container.innerHTML = '';
    
    if (tokens === 0) {
      container.innerHTML = '<div class="text-center text-gray-500 py-4">Enter text to visualize tokenization</div>';
      return;
    }
    
    // Flow diagram (simple visual)
    const flowDiv = document.createElement('div');
    flowDiv.classList.add('flex', 'justify-between', 'items-center', 'mb-4');
    flowDiv.innerHTML = `
      <div class="text-center">
        <div class="bg-purple-200 text-purple-800 rounded p-2 mb-2 w-24">Input Text</div>
        <div class="text-xs">${text.length} characters</div>
      </div>
      <div class="border-t-2 border-purple-300 w-8"></div>
      <div class="text-center">
        <div class="bg-purple-300 text-purple-800 rounded p-2 mb-2 w-24">Tokenize</div>
        <div class="text-xs">Split into tokens</div>
      </div>
      <div class="border-t-2 border-purple-300 w-8"></div>
      <div class="text-center">
        <div class="bg-purple-400 text-purple-800 rounded p-2 mb-2 w-24">Count</div>
        <div class="text-xs">${tokens} tokens</div>
      </div>
    `;
    container.appendChild(flowDiv);
    
    // Token visualization with improved representation
    const tokenDetails = document.createElement('div');
    tokenDetails.classList.add('mt-4');
    
    // Sample words from the text (a simple approximation of tokens)
    const words = text.split(/\b/).filter(word => word.trim().length > 0);
    const sampleSize = Math.min(words.length, 10);
    
    tokenDetails.innerHTML = `
      <h4 class="text-sm font-medium mb-2">Token Visualization:</h4>
      <div class="text-xs text-gray-500 mb-2">Note: This is a simplified visualization. Actual tokens may differ.</div>
      <div class="flex flex-wrap gap-2 mb-2">
        ${words.slice(0, sampleSize).map((word, i) => 
          `<div class="bg-purple-100 border border-purple-200 rounded px-2 py-1 text-xs flex items-center">
            <span class="mr-2">${word}</span>
            <span class="bg-purple-200 text-purple-800 rounded-full text-xs px-2">ID: ${1000 + i}</span>
          </div>`
        ).join('')}
        ${words.length > sampleSize ? 
          `<div class="text-xs flex items-center text-gray-500">+${words.length - sampleSize} more...</div>` : ''}
      </div>
    `;
    
    // Explanation of tokenization process
    const explanation = document.createElement('div');
    explanation.classList.add('mt-4', 'text-xs', 'text-gray-600', 'bg-purple-50', 'p-3', 'rounded');
    explanation.innerHTML = `
      <h4 class="font-medium mb-1">How Tokenization Works:</h4>
      <ol class="list-decimal pl-4 space-y-1">
        <li>Models break text into tokens, which can be words, subwords, or characters</li>
        <li>Common words like "the" or "and" are usually single tokens</li>
        <li>Longer or uncommon words may be split into multiple tokens</li>
        <li>Punctuation and special characters often form their own tokens</li>
        <li>Different models have different tokenization algorithms, but this tool provides estimates</li>
      </ol>
    `;
    
    container.appendChild(tokenDetails);
    container.appendChild(explanation);
    
  }, [tokens, text]);

  return (
    <Card className="p-4">
      <div ref={containerRef} className="min-h-[200px]">
        <div className="text-center text-gray-500 py-4">Enter text to visualize tokenization</div>
      </div>
    </Card>
  );
};

export default ProcessFlow;
