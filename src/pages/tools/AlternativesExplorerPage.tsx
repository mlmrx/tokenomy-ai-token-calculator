import React from "react";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Settings, Info } from "lucide-react";
import GlassmorphicTheme from "@/components/GlassmorphicTheme";
import HardwareAlternatives from "@/components/alternatives/HardwareAlternatives";
import ModelAlternatives from "@/components/alternatives/ModelAlternatives";
import StrategyAlternatives from "@/components/alternatives/StrategyAlternatives";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AlternativesExplorerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Helmet>
        <title>AI Alternatives Explorer - GPU, LLM & Inference Strategy Comparison Tool</title>
        <meta 
          name="description" 
          content="Compare GPU alternatives (TPU, NPU, ASIC, CPU), LLM deployment options (self-hosted, distilled, quantized), and inference strategies. Find cost-effective AI solutions."
        />
        <meta 
          name="keywords" 
          content="GPU alternatives, TPU vs GPU, AI inference optimization, self-hosted LLM, model quantization, edge AI, batch inference, AI cost reduction"
        />
      </Helmet>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <GlassmorphicTheme variant="hero" className="p-8 rounded-2xl">
          <div className="flex items-center gap-4 mb-4">
            <Lightbulb className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI Alternatives Explorer
              </h1>
              <p className="text-xl text-muted-foreground mt-2">
                Discover cost-effective alternatives to expensive GPUs, proprietary LLMs, and traditional inference strategies
              </p>
            </div>
          </div>
          
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              This tool helps you evaluate hardware, model, and strategy alternatives to reduce AI costs by 50-99% 
              while maintaining quality. Perfect for startups, enterprises, and developers optimizing AI deployments.
            </AlertDescription>
          </Alert>
        </GlassmorphicTheme>

        {/* API Configuration Notice */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Data Sources
            </CardTitle>
            <CardDescription>
              Current data is curated from public sources. Connect your cloud provider APIs for real-time pricing:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 border rounded-lg">
                <h4 className="font-semibold text-sm mb-1">AWS (Coming Soon)</h4>
                <p className="text-xs text-muted-foreground">EC2, Inferentia, Trainium pricing</p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-semibold text-sm mb-1">GCP (Coming Soon)</h4>
                <p className="text-xs text-muted-foreground">Compute Engine, TPU pricing</p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-semibold text-sm mb-1">Azure (Coming Soon)</h4>
                <p className="text-xs text-muted-foreground">VM, AI services pricing</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="hardware" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="hardware">Hardware Alternatives</TabsTrigger>
            <TabsTrigger value="models">Model Options</TabsTrigger>
            <TabsTrigger value="strategies">Inference Strategies</TabsTrigger>
          </TabsList>

          <TabsContent value="hardware" className="space-y-6">
            <HardwareAlternatives />
          </TabsContent>

          <TabsContent value="models" className="space-y-6">
            <ModelAlternatives />
          </TabsContent>

          <TabsContent value="strategies" className="space-y-6">
            <StrategyAlternatives />
          </TabsContent>
        </Tabs>

        {/* Total Savings Estimator */}
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <CardHeader>
            <CardTitle>Combined Savings Potential</CardTitle>
            <CardDescription>
              Stack multiple optimizations for maximum cost reduction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold">Example Stack: Startup</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Hardware: TPU instead of H100</span>
                    <span className="font-semibold text-green-600">-57% cost</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Model: Self-hosted Llama vs API</span>
                    <span className="font-semibold text-green-600">-85% cost</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Strategy: Batch + Caching</span>
                    <span className="font-semibold text-green-600">-75% requests</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-base font-bold">
                    <span>Total Potential Savings</span>
                    <span className="text-green-600">~95%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Example Stack: Enterprise</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Hardware: Mixed (Inferentia + GPU)</span>
                    <span className="font-semibold text-green-600">-40% cost</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Model: Quantized GPT-4</span>
                    <span className="font-semibold text-green-600">-60% memory</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Strategy: Smart routing + Load balancing</span>
                    <span className="font-semibold text-green-600">-50% cost</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-base font-bold">
                    <span>Total Potential Savings</span>
                    <span className="text-green-600">~75%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AlternativesExplorerPage;
