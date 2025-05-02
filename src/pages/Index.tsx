import { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Mic, 
  FileText, 
  X as XIcon,
  HelpCircle,
  AlertCircle,
  ListChecks,
  Zap
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ModelComparisonChart from '@/components/ModelComparisonChart';
import ProcessFlow from '@/components/ProcessFlow';
import TokenizationChart from '@/components/TokenizationChart';
import EnergyConsumptionTab from '@/components/EnergyConsumptionTab';
import ProcessFlowEnhanced from '@/components/ProcessFlowEnhanced';
import PromptOptimizer from '@/components/PromptOptimizer';
import { modelPricing, estimateTokens, calculateCost, getModelCategories, getTokenizationInfo } from '@/lib/modelData';
import { getModelTheme, getCompanyFromModel } from '@/lib/modelThemes';
import MainNavigation from '@/components/MainNavigation';
import LearnMoreSidebar from '@/components/LearnMoreSidebar';
import { TokenSpeedSimulator } from '@/features/TokenSpeedSimulator';
import MemoryCalculator from '@/components/MemoryCalculator';
import LoginDialog from '@/components/LoginDialog';
import NewsletterForm from '@/components/NewsletterForm';
import LanguageSelector from '@/components/LanguageSelector';
import ShareOptions from '@/components/ShareOptions';
import ExportData from '@/components/ExportData';
import Footer from '@/components/Footer';

// Create a TypeScript interface for the Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
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
  const [text, setText] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4");
  const [isRecording, setIsRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState<any>(null);
  const [tokenizationScheme, setTokenizationScheme] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("calculator");
  const [activeCalcTab, setActiveCalcTab] = useState("model-comparison");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const company = getCompanyFromModel(selectedModel);
  const modelTheme = getModelTheme(selectedModel);
  const categoryOptions = getModelCategories();

  // Placeholder for user login
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setUserName("User");
    toast({
      title: "Logged In",
      description: "You are now logged in.",
    });
  };

  // Example texts
  const exampleTexts = [
    "Write a detailed marketing email for a new AI-powered project management tool targeting startup founders.",
    "Explain quantum computing concepts to a high school student.",
    "Analyze the performance of the S&P 500 over the last decade and predict future trends.",
    "Create a comprehensive lesson plan about climate change for 8th grade students."
  ];

  const setExampleText = (text: string) => {
    setText(text);
  };

  const clearText = () => {
    setText("");
    setAnalyzeResult(null);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Simple check for text file types
    if (file.type !== 'text/plain') {
      toast({
        title: "Invalid File Type",
        description: "Please upload a text file (.txt)",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setText(content);
      
      toast({
        title: "File Uploaded",
        description: `Loaded ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
      });
    };
    reader.readAsText(file);
  };

  const startRecording = () => {
    if (!navigator.mediaDevices) {
      toast({
        title: "Not Supported",
        description: "Voice dictation is not supported in your browser.",
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
    
    // Use event listeners instead of direct property assignments
    recognition.addEventListener('start', () => {
      setIsRecording(true);
      toast({
        title: "Recording Started",
        description: "Speak now. Recording will automatically stop after you pause.",
      });
    });
    
    recognition.addEventListener('result', (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setText(prev => prev + " " + transcript);
    });
    
    recognition.addEventListener('error', (event) => {
      console.error('Speech recognition error', event);
      setIsRecording(false);
      toast({
        title: "Recognition Error",
        description: "An error occurred while recording speech.",
        variant: "destructive",
      });
    });
    
    recognition.addEventListener('end', () => {
      setIsRecording(false);
    });
    
    recognition.start();
  };

  const handleAnalyze = () => {
    if (!text.trim()) {
      toast({
        title: "Empty Text",
        description: "Please enter some text to analyze.",
        variant: "destructive"
      });
      return;
    }

    setAnalyzing(true);
    
    // Simulate analysis time
    setTimeout(() => {
      try {
        const tokens = estimateTokens(text);
        const inputCost = calculateCost(tokens, selectedModel);
        const outputCost = calculateCost(tokens, selectedModel, true);
        const tokenInfo = getTokenizationInfo(selectedModel);
        
        setTokenizationScheme(tokenInfo);
        setAnalyzeResult({
          text,
          model: selectedModel,
          tokens,
          costs: {
            input: inputCost,
            output: outputCost,
            total: inputCost + outputCost // Ensure total is calculated
          },
          chars: text.length,
          charsPerToken: text.length / tokens,
          timestamp: new Date().toISOString()
        });
        
        toast({
          title: "Analysis Complete",
          description: `${tokens} tokens analyzed for ${selectedModel}`,
        });
      } catch (error) {
        toast({
          title: "Analysis Error",
          description: "An error occurred during analysis.",
          variant: "destructive"
        });
      } finally {
        setAnalyzing(false);
      }
    }, 800);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Reset analysis state when switching tabs
    if (activeTab !== value && value === "calculator") {
      setAnalyzeResult(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LoginDialog 
        open={loginDialogOpen} 
        onOpenChange={setLoginDialogOpen}
        onLoginSuccess={handleLoginSuccess}
      />
      
      <LearnMoreSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <header className="bg-background border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto py-4 px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-500 to-pink-500 animate-pulse">
                TOKENOMY
              </h1>
              <p className="text-sm text-muted-foreground">Smart AI Token Management & Optimization</p>
            </div>
            
            <div className="flex items-center gap-2">
              {!isLoggedIn ? (
                <Button onClick={() => setLoginDialogOpen(true)} className="hover-scale">
                  Log In / Sign Up
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline">Welcome, {userName}</span>
                  <Button variant="outline" onClick={() => setIsLoggedIn(false)}>Logout</Button>
                </div>
              )}
            </div>
          </div>
          
          <MainNavigation 
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onToggleSidebar={() => setSidebarOpen(true)}
          />
        </div>
      </header>

      <main className="flex-1 container mx-auto py-6 px-4 md:px-6 section-appear">
        {activeTab === "calculator" && (
          <>
            <div className="mb-6">
              <Card className="w-full shadow-lg">
                <div className="p-4 md:p-6 relative token-bg-gradient rounded-t-lg" style={{
                  color: "white"
                }}>
                  <div className="flex flex-col items-center">
                    <h2 className="text-xl md:text-2xl font-bold mb-2">Token Calculator</h2>
                    <p className="text-sm md:text-base text-center opacity-90 mb-6">
                      Calculate tokens, costs, and analyze your content across different AI models
                    </p>
                    
                    <div className="w-full max-w-4xl mb-4">
                      <div className="relative mb-2">
                        <Textarea
                          value={text}
                          onChange={e => setText(e.target.value)}
                          placeholder="Enter your text here to analyze tokens and costs..."
                          className="min-h-[120px] bg-white/10 border-white/20 text-white placeholder:text-white/60 resize-y"
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="rounded-full bg-white/10 hover:bg-white/20 h-8 w-8"
                                  onClick={() => fileInputRef.current?.click()}
                                >
                                  <FileText size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-popover border border-border shadow-lg">
                                <p>Upload Text File (.txt format)</p>
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`rounded-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-white/10 hover:bg-white/20'} h-8 w-8`}
                                  onClick={startRecording}
                                >
                                  <Mic size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-popover border border-border shadow-lg">
                                <p>Start voice dictation (click again to stop)</p>
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="rounded-full bg-white/10 hover:bg-white/20 h-8 w-8"
                                  onClick={clearText}
                                >
                                  <XIcon size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-popover border border-border shadow-lg">
                                <p>Clear all text</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept=".txt"
                            className="hidden"
                          />
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 justify-center mb-4">
                        {exampleTexts.map((example, i) => (
                          <Button 
                            key={i} 
                            variant="outline"
                            size="sm"
                            onClick={() => setExampleText(example)}
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                          >
                            Example {i + 1}
                          </Button>
                        ))}
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={clearText}
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          <XIcon className="mr-1 h-4 w-4" /> Clear
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="absolute right-4 top-4 text-white hover:bg-white/20">
                        <HelpCircle className="h-5 w-5" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>How to Use the Token Calculator</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex items-start gap-2">
                          <ListChecks className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">Enter or paste your text</p>
                            <p className="text-sm text-muted-foreground">
                              Add the text you want to analyze by typing, pasting, uploading a file, or using voice dictation.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">Select an AI model</p>
                            <p className="text-sm text-muted-foreground">
                              Choose from various AI models to see token count and cost estimates specific to each.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <Zap className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">View the results</p>
                            <p className="text-sm text-muted-foreground">
                              See token count, cost breakdown, and other metrics across different visualization tabs.
                            </p>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="p-4 md:p-6">
                  <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-center">
                    <div className="w-full sm:w-auto">
                      <select
                        className="w-full sm:w-auto min-w-[200px] p-2 border rounded bg-background"
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                      >
                        {Object.keys(categoryOptions).map(category => (
                          <optgroup key={category} label={category}>
                            {categoryOptions[category].map((model: string) => (
                              <option key={model} value={model}>{model}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                    
                    <Button
                      onClick={handleAnalyze}
                      disabled={analyzing || !text.trim()}
                      className="w-full sm:w-auto"
                      style={{
                        backgroundColor: modelTheme.primary,
                        color: "white"
                      }}
                    >
                      {analyzing ? "Analyzing..." : "Calculate Tokens"}
                    </Button>
                  </div>
                  
                  {analyzeResult && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-muted rounded-lg p-4 text-center">
                          <div className="text-sm text-muted-foreground">Total Tokens</div>
                          <div className="text-2xl font-bold">{analyzeResult.tokens.toLocaleString()}</div>
                        </div>
                        <div className="bg-muted rounded-lg p-4 text-center">
                          <div className="text-sm text-muted-foreground">Characters</div>
                          <div className="text-2xl font-bold">{analyzeResult.chars.toLocaleString()}</div>
                        </div>
                        <div className="bg-muted rounded-lg p-4 text-center">
                          <div className="text-sm text-muted-foreground">Chars/Token</div>
                          <div className="text-2xl font-bold">{analyzeResult.charsPerToken.toFixed(1)}</div>
                        </div>
                        <div className="bg-muted rounded-lg p-4 text-center">
                          <div className="text-sm text-muted-foreground">Estimated Cost</div>
                          <div className="text-2xl font-bold">${analyzeResult.costs.total.toFixed(6)}</div>
                        </div>
                      </div>
                      
                      <Tabs defaultValue="model-comparison" value={activeCalcTab} onValueChange={setActiveCalcTab}>
                        <TabsList className="w-full justify-start overflow-x-auto">
                          <TabsTrigger value="model-comparison">Model Comparison</TabsTrigger>
                          <TabsTrigger value="tokenization">Tokenization</TabsTrigger>
                          <TabsTrigger value="process">Process Flow</TabsTrigger>
                          <TabsTrigger value="process-enhanced">Enhanced Flow</TabsTrigger>
                          <TabsTrigger value="energy">Energy Usage</TabsTrigger>
                        </TabsList>
                        <TabsContent value="model-comparison" className="pt-4">
                          <ModelComparisonChart selectedModel={selectedModel} />
                        </TabsContent>
                        <TabsContent value="tokenization" className="pt-4">
                          <TokenizationChart userInputs={[{
                            text: text,
                            tokens: analyzeResult.tokens,
                            chars: analyzeResult.chars,
                            inputCost: analyzeResult.costs.input,
                            outputCost: analyzeResult.costs.output
                          }]} />
                        </TabsContent>
                        <TabsContent value="process" className="pt-4">
                          <ProcessFlow text={text} tokens={analyzeResult.tokens} />
                        </TabsContent>
                        <TabsContent value="process-enhanced" className="pt-4">
                          <ProcessFlowEnhanced text={text} tokens={analyzeResult.tokens} />
                        </TabsContent>
                        <TabsContent value="energy" className="pt-4">
                          <EnergyConsumptionTab tokens={analyzeResult.tokens} selectedModel={selectedModel} />
                        </TabsContent>
                      </Tabs>
                      
                      {/* Suggested Prompt Optimization */}
                      <div className="border rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-2">Suggested Optimization</h3>
                        <PromptOptimizer text={text} tokens={analyzeResult.tokens} />
                      </div>
                      
                      <ExportData data={analyzeResult} />
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </>
        )}

        {activeTab === "speed" && (
          <div className="speed-bg-gradient p-6 rounded-lg text-white mb-6">
            <h2 className="text-2xl font-bold mb-2">Speed Simulator</h2>
            <p className="mb-6 opacity-90">Simulate token generation speed and visualize output in real-time</p>
            <div className="bg-white/10 p-6 rounded-lg">
              <TokenSpeedSimulator />
            </div>
          </div>
        )}
        
        {activeTab === "memory" && (
          <div className="memory-bg-gradient p-6 rounded-lg text-white mb-6">
            <h2 className="text-2xl font-bold mb-2">Memory Calculator</h2>
            <p className="mb-6 opacity-90">Calculate memory requirements for large language models</p>
            <div className="bg-white/10 p-6 rounded-lg">
              <MemoryCalculator />
            </div>
          </div>
        )}
        
        {/* Hidden utility components */}
        <div className="hidden">
          <NewsletterForm />
          <LanguageSelector />
          <ShareOptions />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
