
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, X, CircleCheck } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import TokenizationChart from '@/components/TokenizationChart';
import ModelComparisonChart from '@/components/ModelComparisonChart';
import ProcessFlow from '@/components/ProcessFlow';
import { modelPricing } from '@/lib/modelData';

const Index = () => {
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [tokens, setTokens] = useState(0);
  const [characters, setCharacters] = useState(0);
  const [cost, setCost] = useState(0);
  const [userInputs, setUserInputs] = useState<{ text: string; tokens: number; chars: number; cost: number }[]>([]);
  const [activeTab, setActiveTab] = useState('calculate');

  // Function to estimate tokens based on character count
  // This is a simple approximation - real tokenization is more complex
  const estimateTokens = (text: string): number => {
    // Approximately 4 characters per token for English text
    return Math.ceil(text.length / 4);
  };

  // Calculate tokens and cost based on input text and selected model
  const calculateTokens = () => {
    const chars = text.length;
    const estimatedTokenCount = estimateTokens(text);
    const modelCost = modelPricing[selectedModel]?.input || 0;
    const calculatedCost = (estimatedTokenCount * modelCost) / 1000;

    setTokens(estimatedTokenCount);
    setCharacters(chars);
    setCost(calculatedCost);

    // Store user inputs for comparison (max 3)
    setUserInputs(prev => {
      const newInputs = [
        ...prev,
        { text, tokens: estimatedTokenCount, chars, cost: calculatedCost }
      ];
      return newInputs.slice(-3); // Keep only the last 3 inputs
    });

    toast({
      title: "Token calculation complete",
      description: `Estimated ${estimatedTokenCount} tokens at a cost of $${calculatedCost.toFixed(6)}`,
    });
  };

  // Generate example text
  const generateExample = () => {
    const examples = [
      "Global Leaders Convene for Climate Summit\n\nWhat are the key objectives of the climate summit?",
      "Tech Giant Unveils Revolutionary AI Assistant\n\nHow does this new AI assistant compare to existing technologies?",
      "Scientists Make Breakthrough in Cancer Research\n\nWhat implications does this breakthrough have for cancer treatment?",
      "Stock Markets Hit Record Highs Amid Economic Recovery\n\nWhat factors are driving the current economic recovery?",
      "Space Agency Announces Plans for Mars Colony\n\nWhat challenges need to be overcome for a successful Mars colony?"
    ];
    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    setText(randomExample);
    // Calculate immediately after setting example
    setTimeout(calculateTokens, 50);
  };

  // Clear text input
  const clearText = () => {
    setText('');
    setTokens(0);
    setCharacters(0);
    setCost(0);
  };

  // Generate model recommendations
  const generateRecommendation = () => {
    if (tokens === 0) {
      toast({
        title: "No text input",
        description: "Please enter some text first to get recommendations.",
        variant: "destructive",
      });
      return;
    }
    
    let bestModel = selectedModel;
    let bestCost = cost;
    
    for (const model in modelPricing) {
      const modelCost = (tokens * modelPricing[model].input) / 1000;
      if (modelCost < bestCost) {
        bestModel = model;
        bestCost = modelCost;
      }
    }

    setActiveTab('recommendation');

    // The recommendation will be generated in the recommendation tab
  };

  // Calculate tokens on initial load and when text changes
  useEffect(() => {
    if (text) {
      const chars = text.length;
      const estimatedTokenCount = estimateTokens(text);
      setCharacters(chars);
      setTokens(estimatedTokenCount);
      const modelCost = modelPricing[selectedModel]?.input || 0;
      setCost((estimatedTokenCount * modelCost) / 1000);
    } else {
      setCharacters(0);
      setTokens(0);
      setCost(0);
    }
  }, [text, selectedModel]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-purple-100 py-8 px-4">
      <Card className="max-w-md mx-auto shadow-lg border-purple-200 overflow-hidden">
        <div className="bg-purple-800 text-white p-4 text-center">
          <h1 className="text-xl font-bold">AI Token Calculator</h1>
          <p className="text-purple-200 text-sm">Calculate tokens, estimate costs for AI models</p>
        </div>

        <div className="p-4 space-y-4">
          <Textarea 
            placeholder="Enter your text here..." 
            value={text} 
            onChange={(e) => setText(e.target.value)}
            className="border-purple-300 focus:border-purple-500"
          />
          
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-full border-purple-300">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(modelPricing).map((model) => (
                <SelectItem key={model} value={model}>{model}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="grid grid-cols-4 gap-2">
            <Button onClick={generateExample} variant="secondary" className="bg-purple-200 hover:bg-purple-300 text-purple-800">Ex</Button>
            <Button onClick={clearText} variant="secondary" className="bg-purple-200 hover:bg-purple-300 text-purple-800">CLR</Button>
            <Button onClick={calculateTokens} className="bg-purple-700 hover:bg-purple-800">CALC</Button>
            <Button onClick={() => setActiveTab('process')} variant="secondary" className="bg-purple-200 hover:bg-purple-300 text-purple-800">PROC</Button>
            <Button onClick={() => setActiveTab('compare')} variant="secondary" className="bg-purple-200 hover:bg-purple-300 text-purple-800">CMP</Button>
            <Button onClick={generateRecommendation} variant="secondary" className="bg-purple-200 hover:bg-purple-300 text-purple-800">REC</Button>
            <Button onClick={() => setActiveTab('analysis')} variant="secondary" className="bg-purple-200 hover:bg-purple-300 text-purple-800">ANL</Button>
            <Button onClick={() => setActiveTab('model-compare')} variant="secondary" className="bg-purple-200 hover:bg-purple-300 text-purple-800">MOD</Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 mb-2">
              <TabsTrigger value="calculate" className="text-xs">Calc</TabsTrigger>
              <TabsTrigger value="process" className="text-xs">Process</TabsTrigger>
              <TabsTrigger value="compare" className="text-xs">Compare</TabsTrigger>
              <TabsTrigger value="recommendation" className="text-xs">Recommend</TabsTrigger>
              <TabsTrigger value="model-compare" className="text-xs">Models</TabsTrigger>
            </TabsList>
            
            <TabsContent value="calculate" className="bg-purple-50 p-4 rounded-md">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Tokens:</span>
                  <span className="text-purple-800 font-bold">{tokens}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Characters:</span>
                  <span className="text-purple-800 font-bold">{characters}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Cost:</span>
                  <span className="text-purple-800 font-bold">${cost.toFixed(6)}</span>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="process" className="bg-purple-50 p-4 rounded-md">
              <ProcessFlow tokens={tokens} text={text} />
            </TabsContent>
            
            <TabsContent value="compare" className="bg-purple-50 p-4 rounded-md">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left">Input</th>
                      <th className="text-right">Tokens</th>
                      <th className="text-right">Chars</th>
                      <th className="text-right">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userInputs.map((input, index) => (
                      <tr key={index}>
                        <td className="truncate max-w-[120px]">
                          {input.text.substring(0, 20)}...
                        </td>
                        <td className="text-right">{input.tokens}</td>
                        <td className="text-right">{input.chars}</td>
                        <td className="text-right">${input.cost.toFixed(6)}</td>
                      </tr>
                    ))}
                    {userInputs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-gray-500">
                          No data yet. Calculate some inputs first.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="recommendation" className="bg-purple-50 p-4 rounded-md">
              {tokens > 0 ? (
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CircleCheck className="text-green-600 h-4 w-4 mt-0.5" />
                    <div>
                      <p className="font-medium">Based on your input ({tokens} tokens):</p>
                      {Object.entries(modelPricing).map(([model, pricing]) => {
                        const modelCost = (tokens * pricing.input) / 1000;
                        return (
                          <p key={model} className={`${model === selectedModel ? 'font-bold' : ''}`}>
                            {model}: ${modelCost.toFixed(6)}
                            {model === selectedModel ? ' (current)' : ''}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Info className="text-blue-600 h-4 w-4 mt-0.5" />
                    <div>
                      <p className="font-medium">Recommendation:</p>
                      {tokens < 100 ? (
                        <p>Short input: Any model works, GPT-3.5 Turbo balances performance/cost</p>
                      ) : tokens < 1000 ? (
                        <p>Medium input: GPT-4o may provide better quality for complex tasks</p>
                      ) : (
                        <p>Long input: Consider Claude 3 Opus or GPT-4o for full context</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Enter some text and calculate tokens first
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="analysis" className="bg-purple-50 p-4 rounded-md">
              <TokenizationChart userInputs={userInputs} />
            </TabsContent>
            
            <TabsContent value="model-compare" className="bg-purple-50 p-4 rounded-md">
              <ModelComparisonChart modelPricing={modelPricing} />
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default Index;
