
import { useState, useEffect } from 'react';
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, CircleCheck, Calculator, ChartBar } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import TokenizationChart from '@/components/TokenizationChart';
import ModelComparisonChart from '@/components/ModelComparisonChart';
import ProcessFlowEnhanced from '@/components/ProcessFlowEnhanced';
import EnergyConsumptionTab from '@/components/EnergyConsumptionTab';
import PromptOptimizer from '@/components/PromptOptimizer';
import { modelPricing, estimateTokens, calculateCost, getModelCategories } from '@/lib/modelData';
import { getModelTheme } from '@/lib/modelThemes';

const Index = () => {
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [tokens, setTokens] = useState(0);
  const [characters, setCharacters] = useState(0);
  const [inputCost, setInputCost] = useState(0);
  const [outputCost, setOutputCost] = useState(0);
  const [userInputs, setUserInputs] = useState<{ text: string; tokens: number; chars: number; inputCost: number; outputCost: number }[]>([]);
  const [activeTab, setActiveTab] = useState('calculate');
  const modelCategories = getModelCategories();
  const modelTheme = getModelTheme(selectedModel);

  const placeholders = [
    "Paste your AI prompt or message here to see how many tokens it eats.",
    "What's your LLM thinking today? Type or paste it here to find out the token cost. 💬",
    "Drop in your prompt, code snippet, or user input. We'll tokenize the truth.",
    "Writing your next email, ad copy, or blog intro? Let's see what it'll cost to run it through AI.",
    "Start typing your prompt...",
    "Feed the model. Enter human language sequence for token analysis. 🤖",
    "Paste a message, question, or story—then see how AI breaks it into tokens."
  ];

  const randomPlaceholder = useMemo(
    () => placeholders[Math.floor(Math.random() * placeholders.length)],
    []
  );
  
  // Calculate tokens and cost based on input text and selected model
  const calculateTokens = () => {
    const chars = text.length;
    const estimatedTokenCount = estimateTokens(text);
    const inputCostValue = calculateCost(estimatedTokenCount, selectedModel, false);
    const outputCostValue = calculateCost(estimatedTokenCount, selectedModel, true);

    setTokens(estimatedTokenCount);
    setCharacters(chars);
    setInputCost(inputCostValue);
    setOutputCost(outputCostValue);

    // Store user inputs for comparison (max 3)
    setUserInputs(prev => {
      const newInputs = [
        ...prev,
        { 
          text, 
          tokens: estimatedTokenCount, 
          chars, 
          inputCost: inputCostValue, 
          outputCost: outputCostValue 
        }
      ];
      return newInputs.slice(-3); // Keep only the last 3 inputs
    });

    toast({
      title: "Token calculation complete",
      description: `Estimated ${estimatedTokenCount} tokens at a cost of $${inputCostValue.toFixed(6)} for input`,
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
    setInputCost(0);
    setOutputCost(0);
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
    
    setActiveTab('recommendation');
  };

  // Calculate tokens on initial load and when text changes
  useEffect(() => {
    if (text) {
      const chars = text.length;
      const estimatedTokenCount = estimateTokens(text);
      setCharacters(chars);
      setTokens(estimatedTokenCount);
      const inputCostValue = calculateCost(estimatedTokenCount, selectedModel, false);
      const outputCostValue = calculateCost(estimatedTokenCount, selectedModel, true);
      setInputCost(inputCostValue);
      setOutputCost(outputCostValue);
    } else {
      setCharacters(0);
      setTokens(0);
      setInputCost(0);
      setOutputCost(0);
    }
  }, [text, selectedModel]);

  return (
    <div className="min-h-screen py-8 px-4" style={{
      background: `linear-gradient(to bottom, ${modelTheme.accent}, ${modelTheme.accent})`
    }}>
      <Card className="max-w-4xl mx-auto shadow-lg overflow-hidden border"
            style={{ borderColor: modelTheme.border }}>
        <div className="text-white p-4 flex justify-between items-center text-center"
             style={{ backgroundColor: modelTheme.primary }}>
          <div className="mx-auto">
            <h1 className="text-xl font-bold flex items-center justify-center">
              <Calculator className="h-5 w-5 mr-2" /> 
              Advanced AI Token Calculator
            </h1>
            <p className="text-sm opacity-90">Estimate tokens & costs for modern AI models</p>
          </div>
        </div>

        <div className="p-4 md:p-6 space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Textarea
                id="inputText"
                placeholder={randomPlaceholder}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[150px] resize-y focus:ring-2"
                style={{ 
                  borderColor: modelTheme.border,
                  backgroundColor: 'white'
                }}
              />
              {text && <PromptOptimizer text={text} tokens={tokens} />}
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select AI Model</label>
                <Select value={selectedModel} onValueChange={(value) => {
                  setSelectedModel(value);
                }}>
                  <SelectTrigger className="w-full" style={{ borderColor: modelTheme.border }}>
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(modelCategories).map(([category, models]) => (
                      <SelectGroup key={category}>
                        <SelectLabel>{category}</SelectLabel>
                        {models.map(model => (
                          <SelectItem key={model} value={model}>{model}</SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={generateExample} variant="outline" 
                  style={{ borderColor: modelTheme.border, color: modelTheme.primary }}
                  className="border hover:bg-opacity-10"
                >
                  Example
                </Button>
                <Button onClick={clearText} variant="outline"
                  style={{ borderColor: modelTheme.border, color: modelTheme.primary }}
                  className="border hover:bg-opacity-10"
                >
                  Clear
                </Button>
                <Button onClick={calculateTokens} className="col-span-2" 
                  style={{ backgroundColor: modelTheme.primary }}
                >
                  Calculate Tokens
                </Button>
              </div>
              
              <div className="p-4 rounded-md space-y-2"
                   style={{ backgroundColor: modelTheme.accent }}>
                <h3 className="font-medium" style={{ color: modelTheme.primary }}>Results</h3>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Tokens:</span>
                  <span className="font-bold" style={{ color: modelTheme.primary }}>{tokens}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Characters:</span>
                  <span className="font-bold" style={{ color: modelTheme.primary }}>{characters}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Input Cost:</span>
                  <span className="font-bold" style={{ color: modelTheme.primary }}>${inputCost.toFixed(6)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Output Cost:</span>
                  <span className="font-bold" style={{ color: modelTheme.primary }}>${outputCost.toFixed(6)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <Button onClick={() => setActiveTab('calculate')} variant="ghost" size="sm" 
                    className={activeTab === 'calculate' ? 'bg-opacity-10' : ''}
                    style={{ color: modelTheme.primary, backgroundColor: activeTab === 'calculate' ? `${modelTheme.accent}` : '' }}>
              Calculation
            </Button>
            <Button onClick={() => setActiveTab('process')} variant="ghost" size="sm" 
                    className={activeTab === 'process' ? 'bg-opacity-10' : ''}
                    style={{ color: modelTheme.primary, backgroundColor: activeTab === 'process' ? `${modelTheme.accent}` : '' }}>
              Process
            </Button>
            <Button onClick={() => setActiveTab('compare')} variant="ghost" size="sm" 
                    className={activeTab === 'compare' ? 'bg-opacity-10' : ''}
                    style={{ color: modelTheme.primary, backgroundColor: activeTab === 'compare' ? `${modelTheme.accent}` : '' }}>
              Compare
            </Button>
            <Button onClick={generateRecommendation} variant="ghost" size="sm" 
                    className={activeTab === 'recommendation' ? 'bg-opacity-10' : ''}
                    style={{ color: modelTheme.primary, backgroundColor: activeTab === 'recommendation' ? `${modelTheme.accent}` : '' }}>
              Recommendations
            </Button>
            <Button onClick={() => setActiveTab('analysis')} variant="ghost" size="sm" 
                    className={activeTab === 'analysis' ? 'bg-opacity-10' : ''}
                    style={{ color: modelTheme.primary, backgroundColor: activeTab === 'analysis' ? `${modelTheme.accent}` : '' }}>
              <ChartBar className="h-4 w-4 mr-1" /> Analysis
            </Button>
            <Button onClick={() => setActiveTab('model-compare')} variant="ghost" size="sm" 
                    className={activeTab === 'model-compare' ? 'bg-opacity-10' : ''}
                    style={{ color: modelTheme.primary, backgroundColor: activeTab === 'model-compare' ? `${modelTheme.accent}` : '' }}>
              Model Comparison
            </Button>
            <Button onClick={() => setActiveTab('energy')} variant="ghost" size="sm" 
                    className={activeTab === 'energy' ? 'bg-opacity-10' : ''}
                    style={{ color: modelTheme.primary, backgroundColor: activeTab === 'energy' ? `${modelTheme.accent}` : '' }}>
              Energy Usage
            </Button>
          </div>

          <div className="mt-4">
            {activeTab === 'calculate' && (
              <Card className="p-4" style={{ backgroundColor: modelTheme.accent }}>
                <h3 className="font-medium mb-2 text-center" style={{ color: modelTheme.primary }}>How We Calculate Tokens</h3>
                <p className="text-sm text-gray-700">
                  Token estimation is based on a sophisticated algorithm that considers:
                </p>
                <ul className="list-disc pl-5 mt-2 text-sm text-gray-700 space-y-1">
                  <li>Word length and complexity</li>
                  <li>Punctuation and special characters</li>
                  <li>Common subword patterns</li>
                  <li>Numeric characters</li>
                </ul>
                <p className="text-sm text-gray-500 mt-3">
                  <Info className="h-4 w-4 inline mr-1" /> 
                  While this estimate is more accurate than simple character counting, it's still an approximation. 
                  Different models tokenize text differently.
                </p>
              </Card>
            )}
            
            {activeTab === 'process' && (
              <ProcessFlowEnhanced tokens={tokens} text={text} />
            )}
            
            {activeTab === 'compare' && (
              <Card className="p-4" style={{ backgroundColor: modelTheme.accent }}>
                <h3 className="font-medium mb-2 text-center" style={{ color: modelTheme.primary }}>Compare Recent Inputs</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b" style={{ borderColor: modelTheme.border }}>
                        <th className="text-left py-2">Input</th>
                        <th className="text-right py-2">Tokens</th>
                        <th className="text-right py-2">Chars</th>
                        <th className="text-right py-2">Input Cost</th>
                        <th className="text-right py-2">Output Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userInputs.map((input, index) => (
                        <tr key={index} className="border-b" style={{ borderColor: `${modelTheme.border}50` }}>
                          <td className="truncate max-w-[120px] py-2">
                            {input.text.substring(0, 20)}...
                          </td>
                          <td className="text-right py-2">{input.tokens}</td>
                          <td className="text-right py-2">{input.chars}</td>
                          <td className="text-right py-2">${input.inputCost.toFixed(6)}</td>
                          <td className="text-right py-2">${input.outputCost.toFixed(6)}</td>
                        </tr>
                      ))}
                      {userInputs.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center py-4 text-gray-500">
                            No data yet. Calculate some inputs first.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
            
            {activeTab === 'recommendation' && (
              <Card className="p-4" style={{ backgroundColor: modelTheme.accent }}>
                <h3 className="font-medium mb-2 text-center" style={{ color: modelTheme.primary }}>Model Recommendations</h3>
                {tokens > 0 ? (
                  <div className="space-y-4">
                    <div className="bg-white rounded-md p-3 border" style={{ borderColor: modelTheme.border }}>
                      <h4 className="text-sm font-medium mb-2" style={{ color: modelTheme.primary }}>Based on your input ({tokens} tokens):</h4>
                      <div className="max-h-60 overflow-y-auto pr-2">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b" style={{ borderColor: `${modelTheme.border}50` }}>
                              <th className="text-left py-1">Model</th>
                              <th className="text-right py-1">Input Cost</th>
                              <th className="text-right py-1">Output Cost</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(modelPricing)
                              .sort((a, b) => (a[1].input * tokens) - (b[1].input * tokens))
                              .map(([model, pricing]) => {
                                const modelInputCost = (tokens * pricing.input) / 1000;
                                const modelOutputCost = (tokens * pricing.output) / 1000;
                                const isCurrentModel = model === selectedModel;
                                
                                return (
                                  <tr key={model} className={`border-b ${isCurrentModel ? 'bg-opacity-20' : ''}`} 
                                      style={{ 
                                        borderColor: `${modelTheme.border}50`,
                                        backgroundColor: isCurrentModel ? modelTheme.accent : ''
                                      }}>
                                    <td className="py-1">{model}</td>
                                    <td className="text-right py-1">${modelInputCost.toFixed(6)}</td>
                                    <td className="text-right py-1">${modelOutputCost.toFixed(6)}</td>
                                    <td className="text-right">
                                      {isCurrentModel && (
                                        <span className="text-xs px-2 py-0.5 rounded-full" 
                                              style={{ 
                                                backgroundColor: modelTheme.primary, 
                                                color: modelTheme.accent 
                                              }}>
                                          Current
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-md p-3 border" style={{ borderColor: modelTheme.border }}>
                      <h4 className="text-sm font-medium mb-2" style={{ color: modelTheme.primary }}>Recommendations:</h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <CircleCheck className="h-4 w-4 mt-0.5 text-green-600" />
                          <div>
                            <p className="text-sm font-medium">Best value for quality:</p>
                            <p className="text-xs text-gray-600">
                              {tokens < 100 
                                ? "For short inputs like yours, GPT-3.5 Turbo provides good quality at the lowest price point."
                                : tokens < 1000 
                                ? "For medium-length inputs like yours, GPT-4o-mini or Claude-3-haiku offer great quality-to-price ratio."
                                : "For long inputs like yours, consider Llama-3-70b for the best value or Claude-3-sonnet for high quality."}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <CircleCheck className="text-green-600 h-4 w-4 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Best for performance:</p>
                            <p className="text-xs text-gray-600">
                              {tokens < 500 
                                ? "GPT-4o provides the best overall performance for most tasks, though at a higher price."
                                : tokens < 4000 
                                ? "Claude-3-opus excels at long-form content and reasoning, though at a premium price."
                                : "For very long inputs, consider chunking your text or using models specializing in long context like Gemini-1.5-pro."}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <Info className="text-blue-600 h-4 w-4 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Cost optimization tips:</p>
                            <ul className="text-xs text-gray-600 list-disc pl-5 space-y-1 mt-1">
                              <li>For drafts and iterations, use cheaper models like Llama-3-8b</li>
                              <li>Use premium models only for final, polished outputs</li>
                              <li>Consider batching similar requests to reduce overhead</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    Enter some text and calculate tokens first
                  </div>
                )}
              </Card>
            )}
            
            {activeTab === 'analysis' && (
              <TokenizationChart userInputs={userInputs} />
            )}
            
            {activeTab === 'model-compare' && (
              <ModelComparisonChart modelPricing={modelPricing} />
            )}

            {activeTab === 'energy' && (
              <EnergyConsumptionTab tokens={tokens} selectedModel={selectedModel} />
            )}
          </div>
        </div>
      </Card>   
    </div>
  );
};

export default Index;
