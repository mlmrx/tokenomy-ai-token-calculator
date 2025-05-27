import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Calculator, 
  DollarSign, 
  Zap, 
  FileText, 
  Info, 
  Mic, 
  XIcon,
  Sparkles,
  HelpCircle,
  ListChecks,
  AlertCircle,
  LayoutDashboard,
  BarChart4,
  LineChart
} from "lucide-react";
import { estimateTokens, calculateCost, getModelCategories, getTokenizationInfo } from "@/lib/modelData";
import { getCompanyFromModel, getModelTheme } from "@/lib/modelThemes";
import { useToast } from "@/hooks/use-toast";
import TokenizationInfo from "./TokenizationInfo";
import ModelRecommendation from "./ModelRecommendation";
import ModelComparisonChart from "./ModelComparisonChart";
import TokenizationChart from "./TokenizationChart";
import InputComparisonChart from "./InputComparisonChart";
import VisualizationTab from "./VisualizationTab";
import ProcessFlowEnhanced from "./ProcessFlowEnhanced";
import EnergyConsumptionTab from "./EnergyConsumptionTab";
import ExportData from "./ExportData";

// Create a comprehensive TypeScript interface for the Web Speech API
interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  serviceURI: string;
  start(): void;
  stop(): void;
  abort(): void;
  addEventListener(type: 'start', listener: (event: Event) => void): void;
  addEventListener(type: 'end', listener: (event: Event) => void): void;
  addEventListener(type: 'result', listener: (event: SpeechRecognitionEvent) => void): void;
  addEventListener(type: 'error', listener: (event: SpeechRecognitionErrorEvent) => void): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
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

const examplesData = [
  {
    title: "Marketing Email",
    text: "Write a detailed marketing email for a new AI-powered project management tool targeting startup founders.\n\nInclude the following sections:\n- Attention-grabbing headline\n- Problem statement that resonates with the target audience\n- Introduction to your solution with key features\n- Benefits and ROI for startups\n- Social proof or testimonials from early adopters\n- Clear call to action with special offer",
    icon: "📧"
  },
  {
    title: "Educational Content",
    text: "Explain quantum computing concepts to a high school student.\n\nCover these key areas:\n- The basic principles of quantum mechanics relevant to computing\n- How quantum bits (qubits) differ from classical bits\n- Real-world applications of quantum computing\n- Current limitations and challenges in the field\n- Future prospects of quantum computing technology",
    icon: "🎓"
  },
  {
    title: "Financial Analysis",
    text: "Analyze the performance of the S&P 500 over the last decade and predict future trends.\n\nYour analysis should include:\n- Historical performance data with key milestones\n- Impact of major economic events\n- Sector-by-sector breakdown of performance\n- Identification of market patterns and cycles\n- Risk assessment for various investment strategies\n- Short and long-term predictions with supporting rationale",
    icon: "📈"
  },
  {
    title: "Lesson Plan",
    text: "Create a comprehensive lesson plan about climate change for 8th grade students.\n\nInclude these components:\n- Learning objectives aligned with science standards\n- Engaging warm-up activity (5-10 minutes)\n- Main presentation with key concepts and interactive elements\n- Student-centered activity or experiment\n- Discussion questions for critical thinking\n- Assessment strategy\n- Homework assignment\n- Resources for both teachers and students",
    icon: "📚"
  },
  {
    title: "Product Description",
    text: "Write a compelling product description for a new smart home security system with AI features.\n\nYour description should cover:\n- Headline that highlights the unique value proposition\n- Overview of the complete system components\n- Technical specifications and compatibility information\n- Key AI capabilities and how they enhance security\n- User experience and ease of installation\n- Privacy and data security measures\n- Pricing options and warranty information\n- Customer support details",
    icon: "🏠"
  },
  {
    title: "Creative Story",
    text: "Write a short sci-fi story about a world where AI has become indistinguishable from humans.\n\nInclude these elements in your narrative:\n- A compelling protagonist with a clear motivation\n- Setting in a believable but futuristic world\n- Conflict centered around AI-human relationships\n- Ethical dilemmas related to consciousness and rights\n- Unexpected plot twist that challenges assumptions\n- Resolution that leaves readers thinking\n- Dialogue that reveals character and advances the plot",
    icon: "✨"
  }
];

const TokenCalculator: React.FC = () => {
  
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [isRecording, setIsRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState<any>(null);
  const [tokenizationScheme, setTokenizationScheme] = useState<any>(null);
  const [activeCalcTab, setActiveCalcTab] = useState("model-comparison");
  const [randomExamples, setRandomExamples] = useState<typeof examplesData>([]);
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const company = getCompanyFromModel(selectedModel);
  const modelTheme = getModelTheme(selectedModel);
  const categoryOptions = getModelCategories();

  // Select random examples on mount and when model changes
  useEffect(() => {
    const shuffled = [...examplesData].sort(() => 0.5 - Math.random());
    setRandomExamples(shuffled.slice(0, 3));
  }, [selectedModel]);

  // Initialize with default analysis for empty state
  useEffect(() => {
    if (!analyzeResult) {
      setAnalyzeResult({
        text: "",
        model: selectedModel,
        tokens: 0,
        costs: { input: 0, output: 0, total: 0 },
        chars: 0,
        charsPerToken: 0,
        timestamp: new Date().toISOString()
      });
    }
  }, [selectedModel]);

  const setExampleText = (text: string) => {
    setText(text);
  };

  const clearText = () => {
    setText("");
    setAnalyzeResult({
      text: "",
      model: selectedModel,
      tokens: 0,
      costs: { input: 0, output: 0, total: 0 },
      chars: 0,
      charsPerToken: 0,
      timestamp: new Date().toISOString()
    });
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
      
      // Auto-analyze when file is uploaded
      handleAnalyze(content);
    };
    reader.readAsText(file);
  };

  // Speech recognition function
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

  const handleAnalyze = (customText?: string) => {
    const contentToAnalyze = customText || text;
    
    if (!contentToAnalyze.trim() && !customText) {
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
        // Use the enhanced estimateTokens function with model parameter
        const tokens = estimateTokens(contentToAnalyze || "", selectedModel);
        const inputCost = calculateCost(tokens, selectedModel);
        const outputCost = calculateCost(tokens, selectedModel, true);
        const tokenInfo = getTokenizationInfo(selectedModel);
        
        const newAnalysis = {
          id: Date.now().toString(),
          text: contentToAnalyze || "",
          model: selectedModel,
          tokens,
          costs: {
            input: inputCost,
            output: outputCost,
            total: inputCost + outputCost
          },
          chars: contentToAnalyze?.length || 0,
          charsPerToken: contentToAnalyze?.length ? contentToAnalyze.length / tokens : 0,
          timestamp: new Date().toISOString()
        };
        
        setTokenizationScheme(tokenInfo);
        setAnalyzeResult(newAnalysis);
        
        // Add to recent analyses
        setRecentAnalyses(prev => [newAnalysis, ...prev.slice(0, 4)]);
        
        toast({
          title: "Analysis Complete",
          description: `${tokens.toLocaleString()} tokens analyzed for ${selectedModel}`,
        });
      } catch (error) {
        toast({
          title: "Analysis Error",
          description: "An error occurred during analysis.",
          variant: "destructive"
        });
        console.error("Token Analysis Error:", error);
      } finally {
        setAnalyzing(false);
      }
    }, 400);
  };

  return (
    <div className="space-y-6">
      <Card className="w-full shadow-lg">
        <div className="p-4 md:p-6 relative token-bg-gradient rounded-t-lg" 
          style={{background: `linear-gradient(135deg, ${modelTheme.primary}aa 0%, ${modelTheme.secondary}dd 100%)`}}>
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-500 to-pink-500 bg-clip-text text-transparent">AI Token Analysis</h2>
            <p className="text-sm md:text-base text-center text-white opacity-90 mb-6">
              Calculate tokens, costs, and analyze your content across different AI models
            </p>
            
            <div className="w-full max-w-5xl">
              <div className="relative">
                <Textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Enter your text here to analyze tokens and costs..."
                  className="min-h-[240px] bg-white/90 border-white/20 text-foreground placeholder:text-muted-foreground resize-y w-full"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".txt"
                  className="hidden"
                />
                {/* Updated control buttons with transparent background */}
                <div className="absolute bottom-3 right-3 flex gap-2 bg-white/30 backdrop-blur-sm p-1 rounded-md">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full bg-transparent hover:bg-white/30 active:bg-white/50 h-8 w-8 transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <FileText size={16} className="text-foreground" />
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
                          className={`rounded-full ${isRecording ? 'bg-red-500 hover:bg-red-600 active:bg-red-700' : 'bg-transparent hover:bg-white/30 active:bg-white/50'} h-8 w-8 transition-colors`}
                          onClick={startRecording}
                        >
                          <Mic size={16} className={isRecording ? "text-white" : "text-foreground"} />
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
                          className="rounded-full bg-transparent hover:bg-white/30 active:bg-white/50 h-8 w-8 transition-colors"
                          onClick={clearText}
                        >
                          <XIcon size={16} className="text-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-popover border border-border shadow-lg">
                        <p>Clear all text</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 justify-center mt-3">
                {randomExamples.map((example, i) => (
                  <Button 
                    key={i} 
                    variant="outline"
                    size="sm"
                    onClick={() => setExampleText(example.text)}
                    className="bg-white/80 border-white/20 text-foreground hover:bg-white/90 flex items-center gap-2"
                  >
                    <span>{example.icon}</span> {example.title}
                  </Button>
                ))}
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const shuffled = [...examplesData].sort(() => 0.5 - Math.random());
                    setRandomExamples(shuffled.slice(0, 3));
                  }}
                  className="bg-white/80 border-white/20 text-foreground hover:bg-white/90 flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" /> New Examples
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
            <div className="w-full sm:w-auto relative">
              <select
                className="w-full sm:w-auto min-w-[250px] p-2 pl-3 pr-10 border rounded-full bg-background text-foreground appearance-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary focus:outline-none transition-all shadow-sm hover:shadow-md cursor-pointer border-2"
                value={selectedModel}
                onChange={(e) => {
                  setSelectedModel(e.target.value);
                  // Automatically analyze with new model if we have text
                  if (text && text.trim()) {
                    // Use a slight timeout to ensure state updates first
                    setTimeout(() => handleAnalyze(text), 50);
                  }
                }}
                style={{borderColor: modelTheme.border}}
              >
                {Object.keys(categoryOptions).map(category => (
                  <optgroup key={category} label={category}>
                    {categoryOptions[category].map((model: string) => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            
            <Button
              onClick={() => handleAnalyze()}
              disabled={analyzing}
              className="w-full sm:w-auto text-white rounded-full shadow-md transition-all hover:shadow-lg hover:scale-[1.02]"
              style={{
                backgroundColor: modelTheme.primary,
                color: "white"
              }}
            >
              {analyzing ? "Analyzing..." : "Calculate Tokens"}
            </Button>
          </div>
          
          <div className="space-y-6">
            {/* These results should be visible by default */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-muted rounded-lg p-4 text-center">
                <div className="text-sm text-muted-foreground">Total Tokens</div>
                <div className="text-2xl font-bold text-foreground">{analyzeResult?.tokens.toLocaleString() || "0"}</div>
              </div>
              <div className="bg-muted rounded-lg p-4 text-center">
                <div className="text-sm text-muted-foreground">Characters</div>
                <div className="text-2xl font-bold text-foreground">{analyzeResult?.chars.toLocaleString() || "0"}</div>
              </div>
              <div className="bg-muted rounded-lg p-4 text-center">
                <div className="text-sm text-muted-foreground">Chars/Token</div>
                <div className="text-2xl font-bold text-foreground">{analyzeResult?.charsPerToken.toFixed(1) || "0.0"}</div>
              </div>
              <div className="bg-muted rounded-lg p-4 text-center" 
                style={{background: `rgba(${parseInt(modelTheme.primary.slice(1,3), 16)}, ${parseInt(modelTheme.primary.slice(3,5), 16)}, ${parseInt(modelTheme.primary.slice(5,7), 16)}, 0.1)`}}>
                <div className="text-sm text-muted-foreground">Estimated Cost</div>
                <div className="text-2xl font-bold text-foreground">${analyzeResult?.costs.total.toFixed(6) || "0.000000"}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <TokenizationInfo model={selectedModel} tokens={analyzeResult?.tokens || 0} />
              <ModelRecommendation text={text} tokens={analyzeResult?.tokens || 0} onSelectModel={setSelectedModel} />
            </div>
            
            <Tabs defaultValue="model-comparison" value={activeCalcTab} onValueChange={setActiveCalcTab}>
              <TabsList className="w-full justify-start overflow-x-auto bg-background border" 
                style={{borderColor: `${modelTheme.border}`}}>
                <TabsTrigger 
                  value="model-comparison" 
                  className="text-foreground flex items-center gap-2"
                  style={{
                    '--active-bg': `${modelTheme.primary}20`,
                    '--active-color': modelTheme.primary
                  } as React.CSSProperties}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Model Comparison</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="tokenization" 
                  className="text-foreground flex items-center gap-2"
                  style={{
                    '--active-bg': `${modelTheme.primary}20`,
                    '--active-color': modelTheme.primary
                  } as React.CSSProperties}
                >
                  <FileText className="h-4 w-4" />
                  <span>Tokenization</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="recent-inputs" 
                  className="text-foreground flex items-center gap-2"
                  style={{
                    '--active-bg': `${modelTheme.primary}20`,
                    '--active-color': modelTheme.primary
                  } as React.CSSProperties}
                >
                  <BarChart4 className="h-4 w-4" />
                  <span>Recent Inputs</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="visualization" 
                  className="text-foreground flex items-center gap-2"
                  style={{
                    '--active-bg': `${modelTheme.primary}20`,
                    '--active-color': modelTheme.primary
                  } as React.CSSProperties}
                >
                  <LineChart className="h-4 w-4" />
                  <span>Visualization</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="process" 
                  className="text-foreground flex items-center gap-2"
                  style={{
                    '--active-bg': `${modelTheme.primary}20`,
                    '--active-color': modelTheme.primary
                  } as React.CSSProperties}
                >
                  <Zap className="h-4 w-4" />
                  <span>Process Flow</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="energy" 
                  className="text-foreground flex items-center gap-2"
                  style={{
                    '--active-bg': `${modelTheme.primary}20`,
                    '--active-color': modelTheme.primary
                  } as React.CSSProperties}
                >
                  <AlertCircle className="h-4 w-4" />
                  <span>Energy Usage</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="model-comparison" className="pt-4">
                <ModelComparisonChart selectedModel={selectedModel} />
              </TabsContent>
              <TabsContent value="tokenization" className="pt-4">
                <TokenizationChart userInputs={[{
                  text: text || "",
                  tokens: analyzeResult?.tokens || 0,
                  chars: analyzeResult?.chars || 0,
                  inputCost: analyzeResult?.costs.input || 0,
                  outputCost: analyzeResult?.costs.output || 0
                }]} />
              </TabsContent>
              <TabsContent value="recent-inputs" className="pt-4">
                <InputComparisonChart recentInputs={recentAnalyses} />
              </TabsContent>
              <TabsContent value="visualization" className="pt-4">
                <VisualizationTab 
                  text={text || ""}
                  tokens={analyzeResult?.tokens || 0}
                  costs={analyzeResult?.costs || { input: 0, output: 0, total: 0 }}
                  model={selectedModel}
                />
              </TabsContent>
              <TabsContent value="process" className="pt-4">
                <ProcessFlowEnhanced text={text || ""} tokens={analyzeResult?.tokens || 0} />
              </TabsContent>
              <TabsContent value="energy" className="pt-4">
                <EnergyConsumptionTab tokens={analyzeResult?.tokens || 0} selectedModel={selectedModel} />
              </TabsContent>
            </Tabs>
            
            <div className="mt-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="text-lg font-semibold text-foreground">Export Results</h3>
                <ExportData 
                  data={analyzeResult || {}} 
                  colorTheme={modelTheme}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TokenCalculator;
