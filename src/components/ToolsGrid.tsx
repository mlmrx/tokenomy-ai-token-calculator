import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  Activity, 
  Zap, 
  BarChart, 
  Leaf, 
  Shield, 
  Monitor, 
  Trophy, 
  Brain,
  ArrowRight
} from "lucide-react";

const tools = [
  {
    id: "token-calculator",
    title: "Token Calculator",
    description: "Calculate AI token costs for ChatGPT, Claude, GPT-4, and 50+ LLM models",
    icon: Calculator,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    path: "/tools/token-calculator",
    keywords: ["cost calculator", "pricing", "tokens"]
  },
  {
    id: "token-observability",
    title: "Token Observability",
    description: "Monitor AI token usage and track LLM performance with real-time analytics",
    icon: Activity,
    color: "text-green-600",
    bgColor: "bg-green-50",
    path: "/tools/token-observability",
    keywords: ["monitoring", "analytics", "dashboard"]
  },
  {
    id: "token-speed-simulator",
    title: "Speed Simulator",
    description: "Simulate and compare AI token processing speeds across multiple LLM models",
    icon: Zap,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    path: "/tools/token-speed-simulator",
    keywords: ["performance", "speed test", "benchmark"]
  },
  {
    id: "memory-calculator",
    title: "Memory Calculator",
    description: "Calculate GPU memory requirements for AI model inference and training",
    icon: BarChart,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    path: "/tools/memory-calculator",
    keywords: ["GPU", "VRAM", "hardware"]
  },
  {
    id: "energy-usage-estimator",
    title: "Energy Estimator",
    description: "Calculate energy consumption and carbon footprint of AI models",
    icon: Leaf,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    path: "/tools/energy-usage-estimator",
    keywords: ["sustainability", "carbon", "green AI"]
  },
  {
    id: "ai-content-detector",
    title: "AI Content Detector",
    description: "Detect AI-generated content from ChatGPT, Claude, GPT-4, and other models",
    icon: Shield,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    path: "/tools/ai-content-detector",
    keywords: ["detection", "verification", "authenticity"]
  },
  {
    id: "gpu-monitoring",
    title: "GPU Monitor",
    description: "Monitor GPU performance and throughput for AI workloads in real-time",
    icon: Monitor,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    path: "/tools/gpu-monitoring",
    keywords: ["GPU monitoring", "throughput", "performance"]
  },
  {
    id: "token-leaderboard",
    title: "Token Leaderboard",
    description: "Compare AI providers' token processing capabilities and performance rankings",
    icon: Trophy,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50",
    path: "/tools/token-leaderboard",
    keywords: ["comparison", "ranking", "leaderboard"]
  },
  {
    id: "prompt-visualizer",
    title: "Prompt Visualizer",
    description: "Visualize AI prompt processing and neural network layers in real-time",
    icon: Brain,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    path: "/tools/prompt-visualizer",
    keywords: ["visualization", "neural network", "architecture"]
  }
];

const ToolsGrid = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Complete AI Token Management Suite
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Professional tools for calculating, monitoring, and optimizing AI token usage across all major LLM providers
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.id} to={tool.path} className="group">
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className={`w-12 h-12 rounded-lg ${tool.bgColor} flex items-center justify-center mb-4`}>
                      <Icon className={`h-6 w-6 ${tool.color}`} />
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {tool.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-1 mb-4">
                      {tool.keywords.map((keyword) => (
                        <Badge key={keyword} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center text-sm text-primary group-hover:text-primary-foreground transition-colors">
                      Try Tool
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ToolsGrid;