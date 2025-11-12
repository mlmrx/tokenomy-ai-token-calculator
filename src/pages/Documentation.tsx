import { Helmet } from "react-helmet-async";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Book, Code, Database, Layout, Workflow, Cpu, Users, Settings, Package } from "lucide-react";

const Documentation = () => {
  const sections = [
    {
      id: "overview",
      title: "Overview",
      icon: Book,
      content: `Tokenomy is an AI Token Intelligence Platform that enables users to calculate costs, simulate performance, estimate resource requirements, and monitor production usage for 40+ AI language models across 11 providers.`,
      subsections: [
        { title: "System Architecture", content: "Hybrid client-server architecture where core calculation tools operate entirely client-side for privacy and performance, while observability and community features integrate with a Supabase backend." },
        { title: "Core Components", content: "Frontend Application, Core Tools (9 calculators/monitors), Enterprise Features (9 advanced capabilities), Backend Services (Database, Auth, Functions)" }
      ]
    },
    {
      id: "architecture",
      title: "Application Architecture",
      icon: Layout,
      content: `The application follows a provider hierarchy with carefully orchestrated bootstrap sequence.`,
      subsections: [
        { title: "Provider Stack", content: "QueryClientProvider → AuthProvider → HelmetProvider → ThemeProvider → TooltipProvider → Toaster + Sonner → BrowserRouter" },
        { title: "Routing System", content: "Dual-access pattern: tab navigation (/tools?tab=calculator) and SEO-friendly routes (/tools/token-calculator)" }
      ]
    },
    {
      id: "calculator-tools",
      title: "Calculator Tools Suite",
      icon: Code,
      content: `Nine primary calculation and monitoring tools operating entirely client-side.`,
      subsections: [
        { title: "Token Calculator", content: "Multi-model token estimation with real-time cost calculation across 40+ AI models" },
        { title: "Memory Calculator", content: "GPU memory requirements calculator for model deployment planning" },
        { title: "Token Speed Simulator", content: "Latency analysis and throughput simulation for different models" },
        { title: "Energy Usage Estimator", content: "Carbon footprint and energy consumption estimation" },
        { title: "AI Content Detector", content: "Multi-algorithm detection for AI-generated text" }
      ]
    },
    {
      id: "monitoring",
      title: "Monitoring & Observability",
      icon: Workflow,
      content: `Real-time monitoring dashboards and observability platform with backend integration.`,
      subsections: [
        { title: "GPU Monitoring Dashboard", content: "Real-time GPU throughput metrics and utilization tracking" },
        { title: "Token Leaderboard", content: "Provider comparison with performance benchmarks" },
        { title: "Token Observability Platform", content: "9-tab dashboard with telemetry, cost analytics, and integrations" },
        { title: "Integrations Manager", content: "Connect with OpenAI, Anthropic, Azure, and custom endpoints" }
      ]
    },
    {
      id: "enterprise",
      title: "Enterprise Features",
      icon: Cpu,
      content: `Advanced capabilities for production environments and large-scale deployments.`,
      subsections: [
        { title: "Advanced Telemetry", content: "Real-time token insights with ML-powered forecasting" },
        { title: "Token Flow Visualizer", content: "Sankey diagrams showing token flow through infrastructure" },
        { title: "SLO Monitoring", content: "Track P95 latency, success rate, and cost per 1M tokens" },
        { title: "Policy Governance", content: "YAML-based routing policies with dry-run testing" },
        { title: "Route Health Monitor", content: "Multi-region health monitoring with automatic failover" },
        { title: "Billing & Revenue", content: "Usage-based billing portal with tiered pricing support" }
      ]
    },
    {
      id: "model-data",
      title: "Model Data Library",
      icon: Database,
      content: `Core intelligence layer powering all calculation tools with 40+ AI models.`,
      subsections: [
        { title: "Pricing Data", content: "Input/output costs per 1K tokens for GPT, Claude, Gemini, Llama, and more" },
        { title: "Token Estimation", content: "Sophisticated heuristic-based tokenization with language detection" },
        { title: "Performance Metrics", content: "First token latency and tokens per second for each model" },
        { title: "Provider Themes", content: "Dynamic UI theming based on selected model's company" }
      ]
    },
    {
      id: "community",
      title: "Community Forum System",
      icon: Users,
      content: `Forum-style platform for user discussions and knowledge sharing.`,
      subsections: [
        { title: "Posts & Comments", content: "Create posts, comment threads, and upvoting system" },
        { title: "User Profiles", content: "User activity tracking and profile pages" },
        { title: "Authentication", content: "Supabase auth with email and OAuth providers" }
      ]
    },
    {
      id: "backend",
      title: "Backend & Database",
      icon: Database,
      content: `Supabase backend with PostgreSQL database and edge functions.`,
      subsections: [
        { title: "Database Schema", content: "Telemetry tables, cost tracking, observability metrics, policy engine" },
        { title: "Edge Functions", content: "telemetry-ingest, router-decide, invoice-run, cost-summary" },
        { title: "Authentication", content: "Row-level security policies and user management" }
      ]
    },
    {
      id: "deployment",
      title: "Configuration & Deployment",
      icon: Settings,
      content: `Build system, dependencies, and deployment configuration.`,
      subsections: [
        { title: "Tech Stack", content: "React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui components" },
        { title: "Dependencies", content: "Chart.js, Recharts, React Query, React Router, Supabase client" },
        { title: "Environment", content: "Supabase integration with environment variables and configuration" }
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>Documentation - Tokenomy AI Token Calculator</title>
        <meta name="description" content="Complete technical documentation for Tokenomy, the AI Token Intelligence Platform. Learn about architecture, tools, features, and implementation details." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/10 text-primary">
              <Package className="w-4 h-4" />
              <span className="text-sm font-medium">Product Documentation</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-pink-600">
              Tokenomy Documentation
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Complete technical overview of the AI Token Intelligence Platform. Explore architecture, 
              features, tools, and implementation details.
            </p>
          </div>

          {/* Documentation Content */}
          <div className="grid lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {/* Table of Contents - Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-20">
                <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">
                  Contents
                </h3>
                <ScrollArea className="h-[600px] pr-4">
                  <nav className="space-y-1">
                    {sections.map((section) => {
                      const Icon = section.icon;
                      return (
                        <a
                          key={section.id}
                          href={`#${section.id}`}
                          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors text-sm"
                        >
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          <span>{section.title}</span>
                        </a>
                      );
                    })}
                  </nav>
                </ScrollArea>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <Card key={section.id} id={section.id} className="p-8 scroll-mt-20">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold">{section.title}</h2>
                    </div>
                    
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {section.content}
                    </p>

                    <Separator className="my-6" />

                    <div className="space-y-6">
                      {section.subsections.map((subsection, index) => (
                        <div key={index} className="pl-4 border-l-2 border-primary/20">
                          <h3 className="font-semibold mb-2 text-lg">{subsection.title}</h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {subsection.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}

              {/* Additional Resources */}
              <Card className="p-8 bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20">
                <h2 className="text-2xl font-bold mb-4">Additional Resources</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <a
                    href="https://github.com/mlmrx/tokenomy-ai-token-calculator"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-lg border bg-background hover:bg-accent transition-colors"
                  >
                    <Code className="w-5 h-5 mb-2 text-primary" />
                    <h3 className="font-semibold mb-1">GitHub Repository</h3>
                    <p className="text-sm text-muted-foreground">View source code and contribute</p>
                  </a>
                  <a
                    href="https://deepwiki.com/mlmrx/tokenomy-ai-token-calculator"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-lg border bg-background hover:bg-accent transition-colors"
                  >
                    <Book className="w-5 h-5 mb-2 text-primary" />
                    <h3 className="font-semibold mb-1">DeepWiki Documentation</h3>
                    <p className="text-sm text-muted-foreground">Detailed technical reference</p>
                  </a>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Documentation;
