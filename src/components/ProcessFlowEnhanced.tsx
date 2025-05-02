
import { Card } from "@/components/ui/card";

interface ProcessFlowEnhancedProps {
  tokens: number;
  text: string;
  theme?: any; // Using any for theme to match existing code
}

const ProcessFlowEnhanced = ({ tokens, text, theme }: ProcessFlowEnhancedProps) => {
  if (!text) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-60 text-gray-400">
          <p>Enter text to visualize tokenization process</p>
        </div>
      </Card>
    );
  }

  // Get sample words for token visualization
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const sampleWords = words.slice(0, Math.min(words.length, 8));
  
  // Simulate tokenization based on word complexity
  const tokenizedSamples = sampleWords.map(word => {
    if (word.length <= 3) {
      // Short words usually tokenize as single tokens
      return [{ token: word, id: Math.floor(Math.random() * 5000) + 30000 }];
    } else if (word.length <= 7) {
      // Medium words might be 1-2 tokens
      if (Math.random() > 0.3) {
        return [{ token: word, id: Math.floor(Math.random() * 5000) + 30000 }];
      } else {
        const breakPoint = Math.floor(word.length / 2);
        return [
          { token: word.substring(0, breakPoint), id: Math.floor(Math.random() * 5000) + 30000 },
          { token: word.substring(breakPoint), id: Math.floor(Math.random() * 5000) + 30000 }
        ];
      }
    } else {
      // Longer words often split into multiple tokens
      const parts = [];
      let remainingWord = word;
      
      while (remainingWord.length > 0) {
        const partLength = Math.min(Math.floor(Math.random() * 4) + 2, remainingWord.length);
        parts.push({
          token: remainingWord.substring(0, partLength),
          id: Math.floor(Math.random() * 5000) + 30000
        });
        remainingWord = remainingWord.substring(partLength);
      }
      
      return parts;
    }
  });
  
  // Visualization colors based on theme
  const baseColor = theme ? theme.primary : '#7928ca';
  const accentColor = theme ? theme.accent : '#f3eaff';
  const borderColor = theme ? theme.border : '#d0b4f5';

  return (
    <Card className="p-6">
      <h3 className="text-center font-semibold mb-8" style={{ color: baseColor }}>
        Tokenization Flow Process
      </h3>
      
      {/* Flow diagram with animated stages */}
      <div className="relative mb-12">
        <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-1 bg-gray-200 z-0"></div>
        
        <div className="flex justify-between relative z-10">
          <div className="text-center">
            <div style={{ 
              backgroundColor: accentColor, 
              borderColor: borderColor 
            }} className="flex items-center justify-center w-16 h-16 rounded-full border-2 mx-auto mb-2 shadow-md animate-fade-in">
              <span className="text-sm font-bold" style={{ color: baseColor }}>Input</span>
            </div>
            <span className="text-xs block">{text.length} characters</span>
          </div>
          
          <div className="text-center">
            <div style={{ 
              backgroundColor: accentColor, 
              borderColor: borderColor 
            }} className="flex items-center justify-center w-16 h-16 rounded-full border-2 mx-auto mb-2 shadow-md animate-fade-in [animation-delay:200ms]">
              <span className="text-sm font-bold" style={{ color: baseColor }}>Tokenize</span>
            </div>
            <span className="text-xs block">Split text</span>
          </div>
          
          <div className="text-center">
            <div style={{ 
              backgroundColor: accentColor, 
              borderColor: borderColor 
            }} className="flex items-center justify-center w-16 h-16 rounded-full border-2 mx-auto mb-2 shadow-md animate-fade-in [animation-delay:400ms]">
              <span className="text-sm font-bold" style={{ color: baseColor }}>Encode</span>
            </div>
            <span className="text-xs block">Map to IDs</span>
          </div>
          
          <div className="text-center">
            <div style={{ 
              backgroundColor: accentColor, 
              borderColor: borderColor 
            }} className="flex items-center justify-center w-16 h-16 rounded-full border-2 mx-auto mb-2 shadow-md animate-fade-in [animation-delay:600ms]">
              <span className="text-sm font-bold" style={{ color: baseColor }}>Output</span>
            </div>
            <span className="text-xs block">{tokens} tokens</span>
          </div>
        </div>
      </div>

      {/* Token visualization */}
      <div className="mb-8">
        <h4 className="font-medium text-gray-700 mb-4">Token Visualization</h4>
        <div className="border rounded-lg p-4" style={{ borderColor: borderColor, backgroundColor: 'white' }}>
          <div className="mb-2">
            <span className="text-xs text-gray-500">Original text:</span>
            <p className="text-sm p-2 bg-gray-50 rounded mt-1">{sampleWords.join(' ')}</p>
          </div>
          
          <div className="mt-4">
            <span className="text-xs text-gray-500">Tokenized:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {tokenizedSamples.flatMap((wordTokens, wordIndex) => 
                wordTokens.map((token, tokenIndex) => (
                  <div 
                    key={`${wordIndex}-${tokenIndex}`}
                    className="flex flex-col items-center rounded-md p-2 animate-fade-in"
                    style={{ 
                      backgroundColor: accentColor,
                      borderLeft: `3px solid ${baseColor}`,
                      animationDelay: `${(wordIndex * 100) + (tokenIndex * 50)}ms`
                    }}
                  >
                    <span className="text-sm font-medium" style={{ color: baseColor }}>{token.token}</span>
                    <span className="text-xs text-gray-500 mt-1">ID: {token.id}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Explanation panel */}
      <div>
        <h4 className="font-medium text-gray-700 mb-3">How Tokenization Works</h4>
        <div 
          className="rounded-lg p-4 text-sm shadow-sm"
          style={{ backgroundColor: accentColor }}
        >
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              <span className="font-medium" style={{ color: baseColor }}>Text Preprocessing</span>: 
              <span className="text-gray-600"> The text is normalized, including handling whitespace and special characters.</span>
            </li>
            <li>
              <span className="font-medium" style={{ color: baseColor }}>Tokenization</span>: 
              <span className="text-gray-600"> The text is split into subword units based on the model's vocabulary.</span>
            </li>
            <li>
              <span className="font-medium" style={{ color: baseColor }}>Token Mapping</span>: 
              <span className="text-gray-600"> Each token is mapped to a unique ID in the model's vocabulary.</span>
            </li>
            <li>
              <span className="font-medium" style={{ color: baseColor }}>Token Counting</span>: 
              <span className="text-gray-600"> The total number of tokens determines the computational cost and pricing.</span>
            </li>
          </ol>
          
          <div className="mt-4 p-3 rounded bg-white text-xs text-gray-600">
            <p><span className="font-medium">Note:</span> Different AI models use different tokenization schemes. 
            Common words are usually single tokens, while longer or uncommon words may be split into multiple tokens.
            The visualization above is a simplified example of how tokenization might work.</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProcessFlowEnhanced;
