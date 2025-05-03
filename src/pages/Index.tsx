import { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Mic, 
  FileText, 
  X as XIcon,
  HelpCircle,
  AlertCircle,
  ListChecks,
  Zap,
  Sparkles,
  BarChart4,
  LineChart,
  LayoutDashboard,
  Calculator,
  ArrowRight,
  Clock,
  Brain,
  Lightbulb,
  BarChart,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Import model-related utilities
import { getCompanyFromModel, getModelTheme } from "@/lib/modelThemes";
import { getModelCategories, estimateTokens, calculateCost, getTokenizationInfo } from "@/lib/modelData";

// Import components
import MainNavigation from "@/components/MainNavigation";
import TokenizationInfo from "@/components/TokenizationInfo";
import ModelRecommendation from "@/components/ModelRecommendation";
import { TokenSpeedSimulator } from "@/features/TokenSpeedSimulator";
import MemoryCalculator from "@/components/MemoryCalculator";
import ExportData from "@/components/ExportData";
import ModelComparisonChart from "@/components/ModelComparisonChart";
import TokenizationChart from "@/components/TokenizationChart";
import InputComparisonChart from "@/components/InputComparisonChart";
import VisualizationTab from "@/components/VisualizationTab";
import ProcessFlowEnhanced from "@/components/ProcessFlowEnhanced";
import EnergyConsumptionTab from "@/components/EnergyConsumptionTab";
import AINewsMarquee from "@/components/AINewsMarquee";

// Import utility components
import LoginDialog from "@/components/LoginDialog";
import LearnMoreSidebar from "@/components/LearnMoreSidebar";
import NewsletterForm from "@/components/NewsletterForm";
import LanguageSelector from "@/components/LanguageSelector";
import ShareWidget from "@/components/ShareWidget";
import NewsletterPopup from "@/components/NewsletterPopup";
import Footer from "@/components/Footer";

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

const Index = () => {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [isRecording, setIsRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState<any>(null);
  const [tokenizationScheme, setTokenizationScheme] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [activeCalcTab, setActiveCalcTab] = useState("model-comparison");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [showNewsletterPopup, setShowNewsletterPopup] = useState(false);
  const [randomExamples, setRandomExamples] = useState<typeof examplesData>([]);
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const company = getCompanyFromModel(selectedModel);
  const modelTheme = getModelTheme(selectedModel);
  const categoryOptions = getModelCategories();

  // Parse URL parameters on mount and when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    const subtabParam = params.get('subtab');
    
    if (tabParam) {
      setActiveTab(tabParam);
    }
    
    if (subtabParam) {
      setActiveCalcTab(subtabParam);
    }
  }, [location]);

  // Update URL when tabs change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (activeTab !== 'home') {
      params.set('tab', activeTab);
      
      if (activeTab === 'calculator') {
        params.set('subtab', activeCalcTab);
      } else {
        params.delete('subtab');
      }
      
      const newUrl = `/?${params.toString()}`;
      navigate(newUrl, { replace: true });
    } else {
      // For home tab, just show the root URL
      navigate('/', { replace: true });
    }
  }, [activeTab, activeCalcTab, navigate]);

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    // In a real app, this would also update the document or localStorage
  };
  
  // Placeholder for user login
  const handleLoginSuccess = (name: string, provider: string) => {
    setIsLoggedIn(true);
    setUserName(name || "User");
    toast({
      title: `Logged In via ${provider}`,
      description: `Welcome, ${name || "User"}!`,
    });
  };

  // Select random examples on mount and when model changes
  useEffect(() => {
    const shuffled = [...examplesData].sort(() => 0.5 - Math.random());
    setRandomExamples(shuffled.slice(0, 3));
  }, [selectedModel]);

  // Show newsletter popup after 15 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNewsletterPopup(true);
    }, 15000);
    
    return () => clearTimeout(timer);
  }, []);

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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LoginDialog 
        open={loginDialogOpen} 
        onOpenChange={setLoginDialogOpen}
        onLoginSuccess={handleLoginSuccess}
      />
      
      <LearnMoreSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <NewsletterPopup 
        open={showNewsletterPopup} 
        onOpenChange={setShowNewsletterPopup} 
      />
      
      {/* AINewsMarquee is still needed here as it's before the main header in App.tsx */}
      <AINewsMarquee />
      
      <main className="flex-1 container mx-auto py-6 px-4 md:px-6 section-appear">
        {/* Add MainNavigation component here */}
        <div className="mb-6 flex justify-center w-full">
          <MainNavigation 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
            theme={theme}
            onThemeChange={handleThemeChange} 
          />
        </div>

        {/* Home Page Content */}
        {activeTab === "home" && (
          <>
            <div className="w-full max-w-6xl mx-auto mb-12 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-500 to-pink-500 animate-pulse-subtle">
                Welcome to TOKENOMY
              </h1>
              <p className="text-xl max-w-3xl mx-auto mb-8 text-muted-foreground">
                Smart AI token management and optimization tools to help you build more efficient and cost-effective AI applications.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-103 border-t-4" style={{borderTopColor: '#4f46e5'}}>
                  <div className="p-6 space-y-4">
                    <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                      <Calculator className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-semibold">Token Calculator</h3>
                    <p className="text-sm text-muted-foreground">
                      Calculate tokens, estimate costs, and optimize your prompts for various AI models.
                    </p>
                    <Button 
                      onClick={() => setActiveTab('calculator')}
                      className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700"
                    >
                      Open Calculator <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </Card>
                
                <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-103 border-t-4" style={{borderTopColor: '#8b5cf6'}}>
                  <div className="p-6 space-y-4">
                    <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                      <Clock className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold">Speed Simulator</h3>
                    <p className="text-sm text-muted-foreground">
                      Simulate token generation speed and compare performance across different AI models.
                    </p>
                    <Button 
                      onClick={() => setActiveTab('speed')}
                      className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
                    >
                      Open Simulator <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </Card>
                
                <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-103 border-t-4" style={{borderTopColor: '#d97706'}}>
                  <div className="p-6 space-y-4">
                    <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center mb-4">
                      <Brain className="h-6 w-6 text-amber-600" />
                    </div>
                    <h3 className="text-xl font-semibold">Memory Calculator</h3>
                    <p className="text-sm text-muted-foreground">
                      Optimize memory usage and calculate memory requirements for AI model inference.
                    </p>
                    <Button 
                      onClick={() => setActiveTab('memory')}
                      className="w-full mt-4 bg-amber-600 hover:bg-amber-700"
                    >
                      Open Memory Tools <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </div>
              
              {/* Features Section */}
              <div className="mt-16 mb-10">
                <h2 className="text-2xl font-bold mb-8">Why Choose Tokenomy?</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-background/50 p-4 rounded-lg border border-border flex flex-col items-center">
                    <div className="rounded-full bg-primary/10 p-3 mb-3">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium mb-1">Optimize Costs</h3>
                    <p className="text-sm text-center text-muted-foreground">Reduce token usage and save on API costs</p>
                  </div>
                  
                  <div className="bg-background/50 p-4 rounded-lg border border-border flex flex-col items-center">
                    <div className="rounded-full bg-primary/10 p-3 mb-3">
                      <Lightbulb className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium mb-1">Smart Analytics</h3>
                    <p className="text-sm text-center text-muted-foreground">Get insights on token usage patterns</p>
                  </div>
                  
                  <div className="bg-background/50 p-4 rounded-lg border border-border flex flex-col items-center">
                    <div className="rounded-full bg-primary/10 p-3 mb-3">
                      <BarChart className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium mb-1">Visual Reports</h3>
                    <p className="text-sm text-center text-muted-foreground">Interactive charts and data visualization</p>
                  </div>
                  
                  <div className="bg-background/50 p-4 rounded-lg border border-border flex flex-col items-center">
                    <div className="rounded-full bg-primary/10 p-3 mb-3">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium mb-1">AI-Powered</h3>
                    <p className="text-sm text-center text-muted-foreground">ML-based suggestions for optimization</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-12">
                <Button 
                  size="lg" 
                  onClick={() => setActiveTab('calculator')}
                  className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white px-8 shadow-lg"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </>
        )}

        {activeTab === "calculator" && (
          <>
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
                  
                  <div className="space-y-6">
                    {/* Results display */}
                    <div className="grid
