
import { Card } from "@/components/ui/card";
import { BarChart4, Zap, Database, Shield, FileText, Rocket, Search, Cpu, Trophy, Eye, Leaf, Calculator, LineChart } from "lucide-react";
import Footer from "@/components/Footer";

const features = [
  {
    title: "Token Calculator",
    description: "Precisely calculate tokens for any AI model. Understand and optimize your prompt usage for maximum efficiency.",
    icon: <Calculator className="h-12 w-12 text-blue-600" />,
    color: "bg-blue-50",
    animation: { delay: 0.1 }
  },
  {
    title: "Token Observability",
    description: "Real-time monitoring and analytics for AI token usage across all your applications and services.",
    icon: <Eye className="h-12 w-12 text-indigo-600" />,
    color: "bg-indigo-50",
    animation: { delay: 0.2 }
  },
  {
    title: "Speed Simulation",
    description: "Visualize model processing speeds. See how different AI models process your content in real-time.",
    icon: <LineChart className="h-12 w-12 text-purple-600" />,
    color: "bg-purple-50",
    animation: { delay: 0.3 }
  },
  {
    title: "Memory Calculator", 
    description: "Plan your AI system's memory requirements. Understand how tokens translate to computational resources.",
    icon: <BarChart4 className="h-12 w-12 text-amber-600" />,
    color: "bg-amber-50",
    animation: { delay: 0.4 }
  },
  {
    title: "Energy Estimator",
    description: "Calculate the environmental impact and energy consumption of your AI token usage for sustainable AI.",
    icon: <Leaf className="h-12 w-12 text-green-600" />,
    color: "bg-green-50",
    animation: { delay: 0.5 }
  },
  {
    title: "AI Content Detector",
    description: "Identify AI-generated text to verify authenticity and originality with advanced detection algorithms.",
    icon: <Search className="h-12 w-12 text-cyan-600" />,
    color: "bg-cyan-50",
    animation: { delay: 0.6 }
  },
  {
    title: "GPU Monitor",
    description: "Monitor GPU performance and token throughput statistics for optimized hardware utilization.",
    icon: <Cpu className="h-12 w-12 text-rose-600" />,
    color: "bg-rose-50",
    animation: { delay: 0.7 }
  },
  {
    title: "Token Leaderboard",
    description: "Compare token performance across models and providers with comprehensive leaderboard rankings.",
    icon: <Trophy className="h-12 w-12 text-yellow-600" />,
    color: "bg-yellow-50",
    animation: { delay: 0.8 }
  },
  {
    title: "Cost Optimization",
    description: "Get accurate cost estimates for all major AI providers. Make informed decisions about your AI investments.",
    icon: <Database className="h-12 w-12 text-emerald-600" />,
    color: "bg-emerald-50",
    animation: { delay: 0.9 }
  },
  {
    title: "Security Analysis",
    description: "Analyze your prompts for security vulnerabilities and ensure safe AI interactions.",
    icon: <Shield className="h-12 w-12 text-slate-600" />,
    color: "bg-slate-50",
    animation: { delay: 1.0 }
  },
  {
    title: "Tokenization Analysis",
    description: "See how different models tokenize your content. Understand the differences between various encoding schemes.",
    icon: <FileText className="h-12 w-12 text-orange-600" />,
    color: "bg-orange-50",
    animation: { delay: 1.1 }
  },
  {
    title: "Model Comparison",
    description: "Compare different AI models side-by-side. Find the perfect balance between performance and cost.",
    icon: <Rocket className="h-12 w-12 text-violet-600" />,
    color: "bg-violet-50",
    animation: { delay: 1.2 }
  }
];

const Features = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90">
      <section className="py-24 container mx-auto px-4">
        <div
          className="text-center mb-16 opacity-0 translate-y-5 animate-[fadeIn_0.6s_ease-out_forwards]"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            Powerful Token Management Features
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
            Tokenomy provides powerful tools to analyze, optimize, and manage your AI token usage across all major models.
          </p>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="group opacity-0 translate-y-4 animate-[fadeIn_0.5s_ease-out_forwards] hover:scale-103 transition-transform duration-200"
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              <Card className="p-6 h-full border border-border hover:border-primary/20 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="flex flex-col h-full">
                  <div className={`p-4 rounded-lg w-fit mb-5 ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </Card>
            </div>
          ))}
        </div>

        <div
          className="bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 rounded-2xl p-8 md:p-12 shadow-xl opacity-0 scale-95 animate-[fadeIn_0.5s_0.4s_ease-out_forwards,scaleIn_0.5s_0.4s_ease-out_forwards]"
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Interactive Visualizations</h2>
              <p className="text-lg mb-6 text-muted-foreground">
                See your token usage come to life with interactive charts and graphs. Understand patterns, costs, and optimization opportunities at a glance.
              </p>
              <ul className="space-y-3">
                {["Real-time token counting", "Dynamic cost projections", "Model comparison tools", "Token distribution analysis"].map((item, i) => (
                <li key={i} className="flex items-center">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/20 text-primary mr-3">✓</span>
                  {item}
                </li>
                ))}
              </ul>
            </div>
            <div className="bg-card rounded-xl p-6 shadow-lg border border-border/50 h-64 flex items-center justify-center">
              <div className="text-center">
                <p className="text-lg font-medium mb-2">Interactive Chart Visualization</p>
                <p className="text-sm text-muted-foreground">(Visual representation of token analytics)</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Features;
