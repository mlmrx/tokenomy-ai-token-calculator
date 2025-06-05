import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AINewsMarquee from "@/components/AINewsMarquee";
import Footer from "@/components/Footer";
import { ArrowRight, BarChart, Calculator, LineChart, Brain, Zap, Shield, Code, Leaf, Search, Cpu, Trophy, Eye, CheckCircle, Timer, ShieldCheck, Sparkles} from 'lucide-react';
import TokenStatsCarousel from "@/components/TokenStatsCarousel";

const Homepage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AINewsMarquee />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-4 md:py-4">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950/20 dark:to-purple-950/20 -z-10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(79,70,229,0.15),transparent_45%),radial-gradient(circle_at_70%_70%,rgba(99,102,241,0.15),transparent_45%)] -z-10"></div>
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center text-center space-y-6 md:space-y-8">
            <div className="space-y-6 max-w-3xl">
              <p className="text-xl md:text-1xl text-muted-foreground max-w-1xl mx-auto">
                Trillions of Trillions AI/ML Tokens!
              </p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">                
                Predict. Optimize. Ship AI with confidence.
              </h1>
              <p className="text-xl md:text-1xl text-muted-foreground max-w-1xl mx-auto">
                Tokenomy forecasts token count, dollars, latency & energy before an API call, so your team ships without surprise bills.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                size="lg" 
                className="text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-md"
                asChild
              >
                <Link to="/tools">
                  Try our tools - Free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/features">
                  Learn More
                </Link>
              </Button>
            </div>

                  {/* 4. Built for builders logos */}
      <section className="bg-white py-16">
        <h2 className="text-center text-xl font-semibold mb-8">Built for builders</h2>
        <div className="flex flex-wrap justify-center gap-6 text-lg font-medium">
          {['VS Code', 'LangChain', 'Python', 'JS/TS', 'GitHub Actions'].map(l => (
            <span key={l} className="px-4 py-2 bg-gray-100 rounded-full">{l}</span>
          ))}
        </div>
      </section>

            {/* Token Stats Carousel */}
            <TokenStatsCarousel />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-4 md:py-4 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Powerful Token Management Tools</h2>
            <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
              Optimize your AI interactions with our comprehensive suite of token analysis tools
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-2 hover:border-blue-200 dark:hover:border-blue-900 transition-colors">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Calculator className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Token Calculator</h3>
                  <p className="text-muted-foreground">
                    Calculate tokens, costs, and analyze your content across different AI models
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/tools?tab=calculator">Try Calculator</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2 hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                    <Eye className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Token Observability</h3>
                  <p className="text-muted-foreground">
                    Real-time monitoring and analytics for AI token usage
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/observability">View Observatory</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2 hover:border-purple-200 dark:hover:border-purple-900 transition-colors">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <LineChart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Speed Simulator</h3>
                  <p className="text-muted-foreground">
                    Simulate token processing speeds and optimize for faster AI response times
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/tools?tab=speed">Try Simulator</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2 hover:border-amber-200 dark:hover:border-amber-900 transition-colors">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                    <BarChart className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Memory Calculator</h3>
                  <p className="text-muted-foreground">
                    Estimate memory requirements and optimize token usage for complex AI tasks
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/tools?tab=memory">Try Memory Calculator</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* New Energy Usage Estimator Card */}
            <Card className="border-2 hover:border-green-200 dark:hover:border-green-900 transition-colors">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <Leaf className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Energy Usage Estimator</h3>
                  <p className="text-muted-foreground">
                    Calculate the environmental impact and energy consumption of your AI token usage
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/tools?tab=energy">Try Energy Estimator</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-cyan-200 dark:hover:border-cyan-900 transition-colors">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-full">
                    <Search className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-semibold">AI Content Detector</h3>
                  <p className="text-muted-foreground">
                    Detect AI-generated text and verify original content
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/tools?tab=detector">Try Detector</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-rose-200 dark:hover:border-rose-900 transition-colors">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-full">
                    <Cpu className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                  </div>
                  <h3 className="text-xl font-semibold">GPU Token Monitor</h3>
                  <p className="text-muted-foreground">
                    View token throughput statistics for individual GPUs
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/tools?tab=gpu-monitor">View Monitor</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-yellow-200 dark:hover:border-yellow-900 transition-colors">
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-full">
                    <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Token Leaderboard</h3>
                  <p className="text-muted-foreground">
                    View token Leaderboard
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/tools?tab=token-leaderboard">View Leaderboard</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Why Choose Us Section */}
      <section className="py-12 md:py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold">Why Choose Tokenomy?</h2>
            <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform offers unique advantages for AI developers and content creators
            </p>
          </div>
          
          <Tabs defaultValue="accuracy" className="max-w-3xl mx-auto">
            <TabsList className="w-full justify-center mb-6">
              <TabsTrigger value="accuracy">Accuracy</TabsTrigger>
              <TabsTrigger value="speed">Speed</TabsTrigger>
              <TabsTrigger value="cost">Cost</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
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
                    Get instant feedback on your token usage and processing speeds, allowing you to 
                    make quick adjustments and optimize for faster AI responses.
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
                    Reduce your AI expenditure by up to 40% with our intelligent token optimization 
                    strategies and model comparison tools.
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
                    Your data never leaves your browser. All calculations and simulations are performed 
                    client-side, ensuring maximum privacy and security.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 -z-10"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20 -z-10"></div>
        
        <div className="container px-4 md:px-6 mx-auto">
          <div className="max-w-3xl mx-auto text-center  space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Optimize Your AI Token Usage?</h2>
            <p className="text-xl opacity-90">
              Join thousands of developers and content creators who are saving time and money with Tokenomy's tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-1 justify-center">
              <Button 
                size="lg"
                className="bg-white text-indigo-700 hover:bg-gray-100"
                asChild
              >
                <Link to="/tools">
                  Start Now <ArrowRight className="ml-2 h-2 w-4" />
                </Link>
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white/10"
                asChild
              >
                <Link to="/contact">
                  Contact Us
                </Link>
              </Button>
            </div>
            <div className="text-sm opacity-80 pt-2">
              <p>No sign-up required to try our basic tools</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Code Example Section */}
      <section className="py-12 md:py-16 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">For Developers, By Developers</h2>
              <p className="text-lg text-muted-foreground mb-4">
                Tokenomy provides powerful APIs and libraries for integrating token optimization directly into your applications.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Code className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-semibold">Simple API Integration</h3>
                    <p className="text-muted-foreground">Connect to our powerful token analysis tools with just a few lines of code</p>
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
              <Button variant="outline" className="mt-6">View Documentation</Button>
            </div>
            
            <div className="bg-gray-900 text-gray-50 p-4 rounded-lg shadow-xl">
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
                <code className="text-gray-50"> {"{"} tokenAnalyzer {"}"} </code>
                <code className="text-blue-400">from</code>
                <code className="text-green-400"> 'tokenomy-js'</code>;<br/><br/>
                
                <code className="text-purple-400">const</code>
                <code className="text-gray-50"> analyzer = </code>
                <code className="text-blue-400">new</code>
                <code className="text-yellow-400"> tokenAnalyzer</code>
                <code className="text-gray-50">({"{"}</code><br/>
                <code className="text-gray-50">  model: </code>
                <code className="text-green-400">'gpt-4-turbo'</code>,<br/>
                <code className="text-gray-50">  options: {"{"} </code>
                <code className="text-gray-300">precision: </code>
                <code className="text-blue-400">true</code>,<br/>
                <code className="text-gray-50">            debug: </code>
                <code className="text-blue-400">false</code>
                <code className="text-gray-50"> {"}"}</code><br/>
                <code className="text-gray-50">{"}"})</code>;<br/><br/>
                
                <code className="text-green-400">// Analyze text and get token information</code><br/>
                <code className="text-purple-400">async function</code>
                <code className="text-yellow-300"> analyzePrompt</code>
                <code className="text-gray-50">(text) {"{"}</code><br/>
                <code className="text-gray-50">  const result = </code>
                <code className="text-blue-400">await</code>
                <code className="text-gray-50"> analyzer.calculate(text);</code><br/><br/>
                
                <code className="text-gray-50">  console.log(</code>
                <code className="text-green-400">`Token count: </code>
                <code className="text-gray-50">{"${result.tokens}"}</code>
                <code className="text-green-400">`</code>
                <code className="text-gray-50">);</code><br/>
                <code className="text-gray-50">  console.log(</code>
                <code className="text-green-400">`Estimated cost: </code>
                <code className="text-gray-50">{"${result.cost.toFixed(6)}"}</code>
                <code className="text-green-400">`</code>
                <code className="text-gray-50">);</code><br/>
                <code className="text-gray-50">  </code><br/>
                <code className="text-gray-50">  </code>
                <code className="text-blue-400">return</code>
                <code className="text-gray-50"> result;</code><br/>
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
