
import React, { useState, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FileText, Mic, X as XIcon, HelpCircle, AlertCircle, ListChecks, Zap, Sparkles } from "lucide-react";
import { getCompanyFromModel, getModelTheme } from "@/lib/modelThemes";
import { getModelCategories, estimateTokens, calculateCost, getTokenizationInfo } from "@/lib/modelData";

// Example data for the sample texts
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

// Speech recognition type interfaces
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

interface CalculatorTabProps {
  activeSubtab: string;
  setActiveSubtab: (subtab: string) => void;
  onUrlUpdate: (params: URLSearchParams) => void;
}

const CalculatorTab: React.FC<CalculatorTabProps> = ({ activeSubtab, setActiveSubtab, onUrlUpdate }) => {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [isRecording, setIsRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState<any>(null);
  const [tokenizationScheme, setTokenizationScheme] = useState<any>(null);
  const [randomExamples, setRandomExamples] = useState<typeof examplesData>([]);
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const company = getCompanyFromModel(selectedModel);
  const modelTheme = getModelTheme(selectedModel);
  const categoryOptions = getModelCategories();

  // Select random examples on mount and when model changes
  React.useEffect(() => {
    const shuffled = [...examplesData].sort(() => 0.5 - Math.random());
    setRandomExamples(shuffled.slice(0, 3));
  }, [selectedModel]);

  // Initialize with default analysis for empty state
  React.useEffect(() => {
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

  // Implement file upload handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      return;
    }
    
    // Check file size (limit to 5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 5MB.",
        variant: "destructive",
      });
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    // Check file type
    if (file.type !== 'text/plain') {
      toast({
        title: "Invalid File Type",
        description: "Please select a text (.txt) file.",
        variant: "destructive",
      });
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setText(content);
      toast({
        title: "File Loaded",
        description: `${file.name} has been loaded successfully.`,
      });
    };
    
    reader.onerror = () => {
      toast({
        title: "Read Error",
        description: "Failed to read the file.",
        variant: "destructive",
      });
    };
    
    reader.readAsText(file);
    
    // Reset file input for future uploads
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
        const tokens = estimateTokens(contentToAnalyze || "");
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
    }, 400);
  };

  const handleSubtabChange = (subtab: string) => {
    setActiveSubtab(subtab);
    const params = new URLSearchParams();
    params.set('tab', 'calculator');
    params.set('subtab', subtab);
    onUrlUpdate(params);
  };

  return (
    <div className="mb-6">
      <Card className="w-full shadow-lg">
        <div className="p-4 md:p-6 relative token-bg-gradient rounded-t-lg" 
          style={{background: `linear-gradient(135deg, ${modelTheme.primary}aa 0%, ${modelTheme.secondary}dd 100%)`}}>
          <div className="flex flex-col items-center">
            <h2 className="text-xl md:text-2xl font-bold mb-2 text-white">AI Token Analysis</h2>
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
                {/* Control buttons for text input */}
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
                  // Re-analyze with new model if we have text
                  if (analyzeResult && analyzeResult.text) {
                    setTimeout(() => handleAnalyze(analyzeResult.text), 100);
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
          
          {/* Calculator subtabs */}
          <div className="w-full max-w-4xl mx-auto mb-4">
            <div className="flex flex-wrap justify-center gap-2">
              <Button 
                variant="ghost"
                onClick={() => handleSubtabChange("model-comparison")}
                className={`px-4 py-1.5 text-sm rounded-full transition-all hover:bg-primary/10 ${activeSubtab === "model-comparison" ? 'bg-primary/10 font-medium' : ''}`}
              >
                Model Comparison
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleSubtabChange("visualization")}
                className={`px-4 py-1.5 text-sm rounded-full transition-all hover:bg-primary/10 ${activeSubtab === "visualization" ? 'bg-primary/10 font-medium' : ''}`}
              >
                Visualizations
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleSubtabChange("tokenization")}
                className={`px-4 py-1.5 text-sm rounded-full transition-all hover:bg-primary/10 ${activeSubtab === "tokenization" ? 'bg-primary/10 font-medium' : ''}`}
              >
                Tokenization
              </Button>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Results display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Result cards will go here */}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CalculatorTab;
