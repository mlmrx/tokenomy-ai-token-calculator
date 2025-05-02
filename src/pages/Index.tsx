import { useState, useEffect, useRef } from 'react';
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Info, 
  CircleCheck, 
  Calculator, 
  ChartBar, 
  Upload, 
  Mic, 
  FileText, 
  X as XIcon,
  HelpCircle,
  AlertCircle,
  ListChecks,
  Zap
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import TokenizationChart from '@/components/TokenizationChart';
import ModelComparisonChart from '@/components/ModelComparisonChart';
import ProcessFlowEnhanced from '@/components/ProcessFlowEnhanced';
import EnergyConsumptionTab from '@/components/EnergyConsumptionTab';
import PromptOptimizer from '@/components/PromptOptimizer';
import { modelPricing, estimateTokens, calculateCost, getModelCategories, getTokenizationInfo } from '@/lib/modelData';
import { getModelTheme, getCompanyFromModel } from '@/lib/modelThemes';

// Create a TypeScript interface for the Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudioend: (ev: Event) => any;
  onaudiostart: (ev: Event) => any;
  onend: (ev: Event) => any;
  onerror: (ev: SpeechRecognitionErrorEvent) => any;
  onnomatch: (ev: SpeechRecognitionEvent) => any;
  onresult: (ev: SpeechRecognitionEvent) => any;
  onsoundend: (ev: Event) => any;
  onsoundstart: (ev: Event) => any;
  onspeechend: (ev: Event) => any;
  onspeechstart: (ev: Event) => any;
  onstatechange: (ev: Event) => any;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
  prototype: SpeechRecognition;
}

// Declare global to extend Window interface
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

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
  const [isRecording, setIsRecording] = useState(false);
  const [recommendationModel, setRecommendationModel] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setText(content);
      toast({
        title: "File uploaded",
        description: `File ${file.name} has been loaded`,
      });
    };
    reader.readAsText(file);
  };

  // Handle voice input
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      toast({
        title: "Speech Recognition Error",
        description: "Failed to initialize speech recognition.",
        variant: "destructive",
      });
      return;
    }
    
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    
    setIsRecording(true);
    
    recognition.start();
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setText((prev) => prev + " " + transcript);
      setIsRecording(false);
      toast({
        title: "Voice input captured",
        description: "Your speech has been converted to text",
      });
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsRecording(false);
      toast({
        title: "Voice input error",
        description: `Error: ${event.error}`,
        variant: "destructive",
      });
    };
    
    recognition.onend = () => {
      setIsRecording(false);
    };
  };
  
  // Find best model recommendation based on all metrics
  const getBestModelRecommendation = () => {
    if (tokens === 0) return '';
    
    // Define weights for different factors
    const weights = {
      cost: 0.5,         // Lower cost is better
      quality: 0.3,      // Higher quality models get higher scores
      efficiency: 0.2    // More efficient models get higher scores
    };
    
    // Define quality score (subjective) for each company
    const qualityScores = {
      'OpenAI': 9,
      'Anthropic': 8.5,
      'Meta': 7,
      'Google': 8,
      'Microsoft': 8,
      'Amazon': 7.5,
      'Mistral': 7.5,
      'X.AI': 7,
      'DeepSeek': 6.5,
      'Alibaba': 7,
      'Baidu': 6.5,
      'default': 5
    };
    
    // Define efficiency score (tokens/sec) for each company (rough approximation)
    const efficiencyScores = {
      'OpenAI': 9,
      'Anthropic': 7,
      'Meta': 6,
      'Google': 8,
      'Microsoft': 8,
      'Amazon': 7,
      'Mistral': 7.5,
      'X.AI': 7,
      'DeepSeek': 6,
      'Alibaba': 6.5,
      'Baidu': 6,
      'default': 5
    };
    
    // Calculate scores for each model
    const modelScores = Object.keys(modelPricing).map(model => {
      const company = getCompanyFromModel(model);
      const inputCost = calculateCost(tokens, model, false);
      const outputCost = calculateCost(tokens, model, true);
      const totalCost = inputCost + outputCost;
      
      // Normalize cost (lower is better) - inverted and normalized to 0-10 scale
      const maxCost = 0.1; // Set a reasonable max cost for normalization
      const costScore = 10 * (1 - Math.min(totalCost / maxCost, 1));
      
      // Get quality and efficiency scores
      const qualityScore = qualityScores[company] || qualityScores.default;
      const efficiencyScore = efficiencyScores[company] || efficiencyScores.default;
      
      // Calculate weighted score
      const weightedScore = 
        weights.cost * costScore + 
        weights.quality * qualityScore + 
        weights.efficiency * efficiencyScore;
      
      return {
        model,
        company,
        weightedScore,
        costScore,
        qualityScore,
        efficiencyScore,
        totalCost
      };
    });
    
    // Sort by weighted score (highest first)
    modelScores.sort((a, b) => b.weightedScore - a.weightedScore);
    
    // Set recommendation
    if (modelScores.length > 0) {
      setRecommendationModel(modelScores[0].model);
      return modelScores[0].model;
    }
    
    return '';
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

      // Find best model recommendation
      getBestModelRecommendation();
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
        <div className="text-white p-4 text-center"
             style={{ backgroundColor: modelTheme.primary }}>
          <div className="mx-auto">
            <h1 className="text-xl font-bold flex items-center justify-center">
              <Calculator className="h-5 w-5 mr-2" /> 
              Advanced AI Token Calculator
            </h1>
            <p className="text-sm opacity-90">Estimate tokens & costs for modern AI models</p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="absolute right-4 top-4 text-white hover:bg-white/20">
                      <HelpCircle className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>How to Use This Tool</DialogTitle>
                      <DialogDescription>
                        Follow these steps to get the most out of the Token Calculator
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center font-medium shrink-0">1</div>
                        <div>
                          <h3 className="font-medium mb-1">Enter your text</h3>
                          <p className="text-sm text-gray-600">Type or paste your prompt text in the textarea. You can also upload a text file or use voice input.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center font-medium shrink-0">2</div>
                        <div>
                          <h3 className="font-medium mb-1">Select an AI model</h3>
                          <p className="text-sm text-gray-600">Choose from various AI models to see how they would process your text.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center font-medium shrink-0">3</div>
                        <div>
                          <h3 className="font-medium mb-1">Calculate tokens</h3>
                          <p className="text-sm text-gray-600">Click "Calculate Tokens" to estimate token count and cost for your input.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center font-medium shrink-0">4</div>
                        <div>
                          <h3 className="font-medium mb-1">Explore the tabs</h3>
                          <p className="text-sm text-gray-600">Check different tabs to see token visualization, model comparisons, and recommendations.</p>
                          <ul className="list-disc pl-5 mt-2 text-xs text-gray-600">
                            <li><span className="font-medium">Calculation</span> - Learn how tokens are calculated</li>
                            <li><span className="font-medium">Process</span> - Visualize the tokenization process</li>
                            <li><span className="font-medium">Compare</span> - Compare multiple inputs</li>
                            <li><span className="font-medium">Recommendations</span> - See model suggestions</li>
                            <li><span className="font-medium">Analysis</span> - View token analytics</li>
                            <li><span className="font-medium">Model Comparison</span> - Compare pricing across models</li>
                            <li><span className="font-medium">Energy Usage</span> - Estimate environmental impact</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center font-medium shrink-0">5</div>
                        <div>
                          <h3 className="font-medium mb-1">Optimize your prompts</h3>
                          <p className="text-sm text-gray-600">Use the prompt optimizer suggestions to reduce token usage and costs.</p>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </TooltipTrigger>
              <TooltipContent>
                <p>How to use this tool</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="p-4 md:p-6 space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="mb-2 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          onClick={() => fileInputRef.current?.click()}
                          variant="outline" 
                          size="sm"
                          style={{ borderColor: modelTheme.border, color: modelTheme.primary }}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload File
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Upload a text file as input</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    accept=".txt,.md,.json,.csv" 
                    className="hidden" 
                  />
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          onClick={handleVoiceInput} 
                          variant="outline"
                          size="sm"
                          style={{ 
                            borderColor: modelTheme.border, 
                            color: modelTheme.primary,
                            background: isRecording ? `${modelTheme.accent}` : ''
                          }}
                        >
                          <Mic className={`h-4 w-4 mr-2 ${isRecording ? 'animate-pulse text-red-500' : ''}`} />
                          {isRecording ? 'Recording...' : 'Voice Input'}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Use your microphone to dictate text</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          onClick={generateExample} 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          style={{ color: modelTheme.primary }}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Load an example text</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          onClick={clearText} 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8" 
                          style={{ color: modelTheme.primary }}
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Clear the text</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              
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
              
              <Button onClick={calculateTokens} className="w-full" 
                style={{ backgroundColor: modelTheme.primary }}
              >
                Calculate Tokens
              </Button>
              
              <div className="p-4 rounded-md space-y-3"
                   style={{ backgroundColor: modelTheme.accent }}>
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-lg" style={{ color: modelTheme.primary }}>Results</h3>
                  {recommendationModel && recommendationModel !== selectedModel && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs"
                            style={{ borderColor: modelTheme.border }}
                            onClick={() => setSelectedModel(recommendationModel)}
                          >
                            <Zap className="h-3 w-3 mr-1 text-yellow-500" />
                            Try recommended
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Switch to the recommended model: {recommendationModel}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                  <div className="bg-white p-3 rounded-lg shadow-sm flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Tokens</span>
                    <span className="text-xl font-bold" style={{ color: modelTheme.primary }}>{tokens}</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Characters</span>
                    <span className="text-xl font-bold" style={{ color: modelTheme.primary }}>{characters}</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Input Cost</span>
                    <span className="text-xl font-bold" style={{ color: modelTheme.primary }}>${inputCost.toFixed(6)}</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Output Cost</span>
                    <span className="text-xl font-bold" style={{ color: modelTheme.primary }}>${outputCost.toFixed(6)}</span>
                  </div>
                </div>
                
                {/* Token scheme information */}
                {tokens > 0 && (
                  <div className="bg-white p-3 rounded-lg shadow-sm mt-2">
                    <span className="text-xs text-gray-500 mb-1 block">Tokenization Info</span>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Scheme:</span> {getTokenizationInfo(selectedModel).scheme}
                      </div>
                      <div>
                        <span className="font-medium">Overhead:</span> {getTokenizationInfo(selectedModel).overhead} tokens
                      </div>
                      <div>
                        <span className="font-medium">Company:</span> {getCompanyFromModel(selectedModel)}
                      </div>
                      <div>
                        <span className="font-medium">Total:</span> {tokens + getTokenizationInfo(selectedModel).overhead} tokens
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 overflow-x-auto pb-2">
            <TooltipProvider>
              {[
                { id: 'calculate', label: 'Calculation', icon: Calculator },
                { id: 'process', label: 'Process', icon: ListChecks },
                { id: 'compare', label: 'Compare', icon: Info },
                { id: 'recommendation', label: 'Recommendations', icon: CircleCheck },
                { id: 'analysis', label: 'Analysis', icon: ChartBar },
                { id: 'model-compare', label: 'Model Comparison', icon: AlertCircle },
                { id: 'energy', label: 'Energy Usage', icon: Zap }
              ].map(tab => (
                <Tooltip key={tab.id}>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={() => setActiveTab(tab.id)} 
                      variant="ghost" 
                      size="sm"
                      className={activeTab === tab.id ? 'bg-opacity-10' : ''}
                      style={{ 
                        color: modelTheme.primary, 
                        backgroundColor: activeTab === tab.id ? `${modelTheme.accent}` : '' 
                      }}
                    >
                      <tab.icon className="h-4 w-4 mr-1" /> {tab.label}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View {tab.label.toLowerCase()} details</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
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
              <ProcessFlowEnhanced tokens={tokens} text={text} theme={modelTheme} />
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
                                const isRecommendedModel = model === recommendationModel;
                                
                                return (
                                  <tr key={model} className={`border-b`} 
                                      style={{ 
                                        borderColor: `${modelTheme.border}50`,
                                        backgroundColor: isCurrentModel ? modelTheme.accent : (isRecommendedModel ? 'rgba(255, 255, 200, 0.3)' : '')
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
                                      {isRecommendedModel && !isCurrentModel && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500 text-white">
                                          Recommended
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
