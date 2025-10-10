import React from "react";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Layers, Library, GitBranch, TrendingDown, Maximize2 } from "lucide-react";
import GlassmorphicTheme from "@/components/GlassmorphicTheme";
import MultiProviderComparator from "@/components/cost-tools/MultiProviderComparator";
import PromptLibrary from "@/components/cost-tools/PromptLibrary";
import BatchProcessingOptimizer from "@/components/cost-tools/BatchProcessingOptimizer";
import ModelRouterSimulator from "@/components/cost-tools/ModelRouterSimulator";
import CostTrackingDashboard from "@/components/cost-tools/CostTrackingDashboard";
import ContextWindowOptimizer from "@/components/cost-tools/ContextWindowOptimizer";

const CostOptimizationSuitePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Helmet>
        <title>AI Cost Optimization Suite - LLM Cost Reduction Tools</title>
        <meta name="description" content="Complete suite of AI cost optimization tools: multi-provider comparison, prompt library, batch processing, smart routing, budget tracking, and context optimization." />
      </Helmet>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <GlassmorphicTheme variant="hero" className="p-8 rounded-2xl">
          <div className="flex items-center gap-4 mb-4">
            <DollarSign className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Cost Optimization Suite
              </h1>
              <p className="text-xl text-muted-foreground mt-2">
                Comprehensive tools to reduce your AI/LLM costs by 50-95%
              </p>
            </div>
          </div>
        </GlassmorphicTheme>

        <Tabs defaultValue="comparator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="comparator" className="gap-1">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Comparator</span>
            </TabsTrigger>
            <TabsTrigger value="library" className="gap-1">
              <Library className="h-4 w-4" />
              <span className="hidden sm:inline">Prompts</span>
            </TabsTrigger>
            <TabsTrigger value="batch" className="gap-1">
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Batching</span>
            </TabsTrigger>
            <TabsTrigger value="router" className="gap-1">
              <GitBranch className="h-4 w-4" />
              <span className="hidden sm:inline">Routing</span>
            </TabsTrigger>
            <TabsTrigger value="tracking" className="gap-1">
              <TrendingDown className="h-4 w-4" />
              <span className="hidden sm:inline">Tracking</span>
            </TabsTrigger>
            <TabsTrigger value="context" className="gap-1">
              <Maximize2 className="h-4 w-4" />
              <span className="hidden sm:inline">Context</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comparator"><MultiProviderComparator /></TabsContent>
          <TabsContent value="library"><PromptLibrary /></TabsContent>
          <TabsContent value="batch"><BatchProcessingOptimizer /></TabsContent>
          <TabsContent value="router"><ModelRouterSimulator /></TabsContent>
          <TabsContent value="tracking"><CostTrackingDashboard /></TabsContent>
          <TabsContent value="context"><ContextWindowOptimizer /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CostOptimizationSuitePage;
