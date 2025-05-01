
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
    
    // Create a simple visualization of the tokenization process
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
        <div class="bg-purple-200 text-purple-800 rounded p-2 mb-2 w-20">Input</div>
        <div class="text-xs">${text.length} chars</div>
      </div>
      <div class="border-t-2 border-purple-300 w-8"></div>
      <div class="text-center">
        <div class="bg-purple-300 text-purple-800 rounded p-2 mb-2 w-20">Tokenize</div>
      </div>
      <div class="border-t-2 border-purple-300 w-8"></div>
      <div class="text-center">
        <div class="bg-purple-400 text-purple-800 rounded p-2 mb-2 w-20">Count</div>
        <div class="text-xs">${tokens} tokens</div>
      </div>
    `;
    container.appendChild(flowDiv);
    
    // Token visualization
    const tokenDetails = document.createElement('div');
    tokenDetails.classList.add('mt-4');
    tokenDetails.innerHTML = `<h4 class="text-sm font-medium mb-2">Token Visualization:</h4>`;
    
    // Sample tokens (simplified)
    const words = text.split(/\s+/).filter(word => word.trim().length > 0);
    const sampleSize = Math.min(words.length, 5);
    
    const tokensList = document.createElement('div');
    tokensList.classList.add('grid', 'grid-cols-1', 'gap-2');
    
    for (let i = 0; i < sampleSize; i++) {
      const word = words[i];
      const tokenLi = document.createElement('div');
      tokenLi.classList.add('bg-purple-100', 'p-2', 'rounded', 'text-xs', 'flex', 'justify-between');
      tokenLi.innerHTML = `
        <span>Token ${i + 1}: "${word.substring(0, 10)}${word.length > 10 ? '...' : ''}"</span>
        <span class="text-purple-600">ID: ${1000 + i}</span>
      `;
      tokensList.appendChild(tokenLi);
    }
    
    if (words.length > sampleSize) {
      const moreLi = document.createElement('div');
      moreLi.classList.add('text-center', 'text-xs', 'text-gray-500', 'mt-1');
      moreLi.textContent = `... and ${words.length - sampleSize} more tokens`;
      tokensList.appendChild(moreLi);
    }
    
    tokenDetails.appendChild(tokensList);
    container.appendChild(tokenDetails);
    
  }, [tokens, text]);

  return (
    <Card className="p-4">
      <div ref={containerRef} className="min-h-[150px]">
        <div className="text-center text-gray-500 py-4">Enter text to visualize tokenization</div>
      </div>
    </Card>
  );
};

export default ProcessFlow;
