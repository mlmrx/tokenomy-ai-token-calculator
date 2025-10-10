import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AINewsMarquee from "@/components/AINewsMarquee";
import Footer from "@/components/Footer";
import ToolsGrid from "@/components/ToolsGrid";
import {
  ArrowRight,
  BarChart,
  Calculator,
  LineChart,
  Brain,
  Zap,
  Shield,
  Code,
  Leaf,
  Search,
  Cpu,
  Trophy,
  Eye,
  CheckCircle,
  Timer,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import TokenStatsCarousel from "@/components/TokenStatsCarousel";
import CommunityPreview from "@/components/CommunityPreview";

const Homepage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AINewsMarquee />

      {/* Hero Section with Glassmorphic Background */}
      <section className="relative overflow-hidden py-4 md:py-4">
        {/* Animated Background */}
        <div className="absolute inset-0 animated-gradient -z-20"></div>
        <div className="absolute inset-0 glass-hero -z-10"></div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full floating blur-sm"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-400/20 rounded-full floating-delayed blur-sm"></div>
        <div className="absolute bottom-20 left-1/3 w-16 h-16 bg-blue-400/15 rounded-full floating blur-sm"></div>

        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <div className="flex flex-col items-center text-center space-y-6 md:space-y-8">
            <div className="space-y-6 max-w-4xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-indigo-500/10 border border-violet-500/20 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
                  The Complete AI Token Intelligence Platform
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 leading-tight">
                Plan, Optimize & Monitor
                <br />
                <span className="text-3xl md:text-4xl lg:text-5xl">From First Calculation to Production Scale</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                <strong className="text-foreground">Calculate costs</strong> ·{" "}
                <strong className="text-foreground">Simulate speeds</strong> ·{" "}
                <strong className="text-foreground">Estimate memory & energy</strong> ·{" "}
                <strong className="text-foreground">Monitor production</strong>
                <br />
                Comprehensive token intelligence tools built by AI practitioners, for modern AI teams.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 min-w-[200px]"
                asChild
              >
                <Link to="/tools">
                  <Calculator className="mr-2 h-5 w-5" />
                  Explore All Tools
                </Link>
              </Button>

              <Button
                size="lg"
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 min-w-[200px]"
                asChild
              >
                <Link to="/observability">
                  <Eye className="mr-2 h-5 w-5" />
                  See Live Demo
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="glass-button border-2 border-violet-500/30 hover:border-violet-500/50 hover:bg-violet-500/10 transition-all duration-300 min-w-[200px]"
                asChild
              >
                <Link to="/community">
                  <Users className="mr-2 h-5 w-5" />
                  Join Community
                </Link>
              </Button>
            </div>

            {/* Token Stats Carousel with Glass Effect */}
            <div className="glass-card p-4 w-full">
              <TokenStatsCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* SEO-Optimized Tools Grid */}
      <ToolsGrid />

      {/* Features Section */}
      <section className="py-4 md:py-4 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/50 to-purple-50/50 dark:from-gray-900/50 dark:via-indigo-950/20 dark:to-purple-950/20"></div>
        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Powerful Token Management Tools
            </h2>
            <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
              Optimize your AI interactions with our comprehensive suite of token analysis tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="glass-feature border-0 hover:border-blue-200/30 dark:hover:border-blue-900/30 transition-all duration-300">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full glass">
                    <Calculator className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Token Calculator</h3>
                  <p className="text-muted-foreground">
                    Calculate tokens, costs, and analyze your content across different AI models
                  </p>
                  <Button variant="outline" size="sm" className="glass-button border-0" asChild>
                    <Link to="/tools?tab=calculator">Try Calculator</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-feature border-0 hover:border-indigo-200/30 dark:hover:border-indigo-900/30 transition-all duration-300">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full glass">
                    <Eye className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Token Observability</h3>
                  <p className="text-muted-foreground">Real-time monitoring and analytics for AI token usage</p>
                  <Button variant="outline" size="sm" className="glass-button border-0" asChild>
                    <Link to="/observability">View Observatory</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-feature border-0 hover:border-purple-200/30 dark:hover:border-purple-900/30 transition-all duration-300">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full glass">
                    <LineChart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Speed Simulator</h3>
                  <p className="text-muted-foreground">
                    Simulate token processing speeds and optimize for faster AI response times
                  </p>
                  <Button variant="outline" size="sm" className="glass-button border-0" asChild>
                    <Link to="/tools?tab=speed">Try Simulator</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-feature border-0 hover:border-amber-200/30 dark:hover:border-amber-900/30 transition-all duration-300">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full glass">
                    <BarChart className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Memory Calculator</h3>
                  <p className="text-muted-foreground">
                    Estimate memory requirements and optimize token usage for complex AI tasks
                  </p>
                  <Button variant="outline" size="sm" className="glass-button border-0" asChild>
                    <Link to="/tools?tab=memory">Try Memory Calculator</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-feature border-0 hover:border-green-200/30 dark:hover:border-green-900/30 transition-all duration-300">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full glass">
                    <Leaf className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Energy Usage Estimator</h3>
                  <p className="text-muted-foreground">
                    Calculate the environmental impact and energy consumption of your AI token usage
                  </p>
                  <Button variant="outline" size="sm" className="glass-button border-0" asChild>
                    <Link to="/tools?tab=energy">Try Energy Estimator</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-feature border-0 hover:border-cyan-200/30 dark:hover:border-cyan-900/30 transition-all duration-300">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full glass">
                    <Search className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-semibold">AI Content Detector</h3>
                  <p className="text-muted-foreground">Detect AI-generated text and verify original content</p>
                  <Button variant="outline" size="sm" className="glass-button border-0" asChild>
                    <Link to="/tools?tab=detector">Try Detector</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-feature border-0 hover:border-rose-200/30 dark:hover:border-rose-900/30 transition-all duration-300">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-gradient-to-r from-rose-500/20 to-pink-500/20 rounded-full glass">
                    <Cpu className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                  </div>
                  <h3 className="text-xl font-semibold">GPU Token Monitor</h3>
                  <p className="text-muted-foreground">View token throughput statistics for individual GPUs</p>
                  <Button variant="outline" size="sm" className="glass-button border-0" asChild>
                    <Link to="/tools?tab=gpu-monitor">View Monitor</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-feature border-0 hover:border-yellow-200/30 dark:hover:border-yellow-900/30 transition-all duration-300">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-full glass">
                    <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Token Leaderboard</h3>
                  <p className="text-muted-foreground">View token Leaderboard</p>
                  <Button variant="outline" size="sm" className="glass-button border-0" asChild>
                    <Link to="/tools?tab=token-leaderboard">View Leaderboard</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-12 md:py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 via-indigo-50/40 to-purple-50/80 dark:from-gray-900/80 dark:via-indigo-950/40 dark:to-purple-950/80"></div>
        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Why Choose Tokenomy?
            </h2>
            <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform offers unique advantages for AI developers and content creators
            </p>
          </div>

          <div className="glass-card p-8 max-w-3xl mx-auto">
            <Tabs defaultValue="accuracy" className="w-full">
              <TabsList className="w-full justify-center mb-6 glass-nav border-0">
                <TabsTrigger value="accuracy" className="glass-button border-0">
                  Accuracy
                </TabsTrigger>
                <TabsTrigger value="speed" className="glass-button border-0">
                  Speed
                </TabsTrigger>
                <TabsTrigger value="cost" className="glass-button border-0">
                  Cost
                </TabsTrigger>
                <TabsTrigger value="security" className="glass-button border-0">
                  Security
                </TabsTrigger>
              </TabsList>

              <TabsContent value="accuracy" className="space-y-3">
                <div className="flex gap-4 items-start">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Precise Token Calculations</h3>
                    <p className="mt-2 text-muted-foreground">
                      Our algorithms provide the most accurate token count estimations across all major AI models,
                      helping you optimize your prompts with confidence.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="speed" className="space-y-3">
                <div className="flex gap-4 items-start">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Real-time Analysis</h3>
                    <p className="mt-2 text-muted-foreground">
                      Get instant feedback on your token usage and processing speeds, allowing you to make quick
                      adjustments and optimize for faster AI responses.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="cost" className="space-y-3">
                <div className="flex gap-4 items-start">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <Calculator className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Cost Optimization</h3>
                    <p className="mt-2 text-muted-foreground">
                      Reduce your AI expenditure by up to 40% with our intelligent token optimization strategies and
                      model comparison tools.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="security" className="space-y-3">
                <div className="flex gap-4 items-start">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Secure Analysis</h3>
                    <p className="mt-2 text-muted-foreground">
                      Your data never leaves your browser. All calculations and simulations are performed client-side,
                      ensuring maximum privacy and security.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Community Preview Section */}
      <CommunityPreview />

      {/* CTA Section */}
      <section className="py-12 relative overflow-hidden">
        <div className="absolute inset-0 animated-gradient -z-10"></div>
        <div className="absolute inset-0 glass-hero"></div>

        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Ready to Optimize Your AI Token Usage?</h2>
            <p className="text-xl text-gray/90">
              Join thousands of developers and content creators who are saving time and money with Tokenomy's tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-1 justify-center">
              <Button
                size="lg"
                className="glass-button text-gray-800 dark:text-white border-0 bg-white/30 hover:bg-white/40"
                asChild
              >
                <Link to="/tools">
                  Start Now <ArrowRight className="ml-2 h-2 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                className="glass-button bg-transparent border border-white/30 text-gray hover:bg-white/10"
                asChild
              >
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
            <div className="text-sm text-gray/80 pt-2">
              <p>No sign-up required to try our basic tools</p>
            </div>
          </div>
        </div>
      </section>

      {/* Code Example Section */}
      <section className="py-12 md:py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-gray-50/50 to-indigo-50/50 dark:from-gray-950/50 dark:via-gray-900/50 dark:to-indigo-950/50"></div>
        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                For Developers, By Developers
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                Tokenomy provides powerful APIs and libraries for integrating token optimization directly into your
                applications.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Code className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-semibold">Simple API Integration</h3>
                    <p className="text-muted-foreground">
                      Connect to our powerful token analysis tools with just a few lines of code
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Code className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-semibold">Cross-Platform Libraries</h3>
                    <p className="text-muted-foreground">Available for JavaScript, Python, Ruby, and more</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Code className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-semibold">Comprehensive Documentation</h3>
                    <p className="text-muted-foreground">Detailed guides and examples to get you started quickly</p>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="mt-6 glass-button border-0">
                View Documentation
              </Button>
            </div>

            <div className="enhanced-glass-card p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <p className="text-xs text-gray-400">example.js</p>
              </div>
              <pre className="text-sm overflow-auto font-mono">
                <code className="text-blue-400">import</code>
                <code className="text-gray-50">
                  {" "}
                  {"{"} tokenAnalyzer {"}"}{" "}
                </code>
                <code className="text-blue-400">from</code>
                <code className="text-green-400"> 'tokenomy-js'</code>;<br />
                <br />
                <code className="text-purple-400">const</code>
                <code className="text-gray-50"> analyzer = </code>
                <code className="text-blue-400">new</code>
                <code className="text-yellow-400"> tokenAnalyzer</code>
                <code className="text-gray-50">({"{"}</code>
                <br />
                <code className="text-gray-50"> model: </code>
                <code className="text-green-400">'gpt-4-turbo'</code>,<br />
                <code className="text-gray-50"> options: {"{"} </code>
                <code className="text-gray-300">precision: </code>
                <code className="text-blue-400">true</code>,<br />
                <code className="text-gray-50"> debug: </code>
                <code className="text-blue-400">false</code>
                <code className="text-gray-50"> {"}"}</code>
                <br />
                <code className="text-gray-50">{"}"})</code>;<br />
                <br />
                <code className="text-green-400">// Analyze text and get token information</code>
                <br />
                <code className="text-purple-400">async function</code>
                <code className="text-yellow-300"> analyzePrompt</code>
                <code className="text-gray-50">(text) {"{"}</code>
                <br />
                <code className="text-gray-50"> const result = </code>
                <code className="text-blue-400">await</code>
                <code className="text-gray-50"> analyzer.calculate(text);</code>
                <br />
                <br />
                <code className="text-gray-50"> console.log(</code>
                <code className="text-green-400">`Token count: </code>
                <code className="text-gray-50">{"${result.tokens}"}</code>
                <code className="text-green-400">`</code>
                <code className="text-gray-50">);</code>
                <br />
                <code className="text-gray-50"> console.log(</code>
                <code className="text-green-400">`Estimated cost: </code>
                <code className="text-gray-50">{"${result.cost.toFixed(6)}"}</code>
                <code className="text-green-400">`</code>
                <code className="text-gray-50">);</code>
                <br />
                <code className="text-gray-50"> </code>
                <br />
                <code className="text-gray-50"> </code>
                <code className="text-blue-400">return</code>
                <code className="text-gray-50"> result;</code>
                <br />
                <code className="text-gray-50">{"}"}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Homepage;
