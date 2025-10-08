import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, TrendingUp, Award, Target, Filter, BarChart3, Zap } from "lucide-react";

export default function ModelBenchmarks() {
  const benchmarks = [
    {
      category: "Reasoning & Problem Solving",
      tests: [
        {
          name: "MMLU (Massive Multitask Language Understanding)",
          description: "57 tasks covering STEM, humanities, social sciences",
          models: [
            { name: "Claude 4 Opus", score: 92.8, rank: 1, change: "+2.1%" },
            { name: "GPT-5", score: 91.4, rank: 2, change: "+1.8%" },
            { name: "Gemini 2.5 Pro", score: 90.9, rank: 3, change: "+1.5%" },
            { name: "Llama 4 405B", score: 88.2, rank: 4, change: "+3.2%" },
            { name: "Claude 3.7 Sonnet", score: 87.5, rank: 5, change: "-0.3%" }
          ]
        },
        {
          name: "HumanEval (Code Generation)",
          description: "164 programming problems in Python",
          models: [
            { name: "GPT-5", score: 94.5, rank: 1, change: "+4.2%" },
            { name: "Claude 4 Opus", score: 93.2, rank: 2, change: "+3.8%" },
            { name: "Gemini 2.5 Pro", score: 91.7, rank: 3, change: "+2.9%" },
            { name: "Llama 4 405B", score: 87.3, rank: 4, change: "+5.1%" },
            { name: "Mistral Large 2", score: 85.9, rank: 5, change: "+3.4%" }
          ]
        }
      ]
    },
    {
      category: "Multimodal Understanding",
      tests: [
        {
          name: "MMMU (Multimodal Understanding)",
          description: "College-level multimodal questions across disciplines",
          models: [
            { name: "Claude 4 Opus", score: 89.2, rank: 1, change: "+5.3%" },
            { name: "Gemini 2.5 Pro", score: 87.8, rank: 2, change: "+4.7%" },
            { name: "GPT-5", score: 86.3, rank: 3, change: "+3.9%" },
            { name: "Claude 3.7 Sonnet", score: 79.5, rank: 4, change: "+1.2%" }
          ]
        },
        {
          name: "ChartQA (Chart Understanding)",
          description: "Visual reasoning over charts and graphs",
          models: [
            { name: "Claude 4 Opus", score: 91.4, rank: 1, change: "+6.2%" },
            { name: "Gemini 2.5 Pro", score: 89.7, rank: 2, change: "+5.1%" },
            { name: "GPT-5", score: 88.2, rank: 3, change: "+4.3%" }
          ]
        }
      ]
    },
    {
      category: "Speed & Efficiency",
      tests: [
        {
          name: "Tokens Per Second (TPS)",
          description: "Generation speed on standard prompts",
          models: [
            { name: "Gemini 2.5 Flash", score: 142, rank: 1, unit: "t/s" },
            { name: "GPT-5 Nano", score: 128, rank: 2, unit: "t/s" },
            { name: "Claude 3.5 Haiku", score: 115, rank: 3, unit: "t/s" },
            { name: "Llama 4 70B", score: 98, rank: 4, unit: "t/s" },
            { name: "GPT-5", score: 87, rank: 5, unit: "t/s" }
          ]
        },
        {
          name: "Time to First Token (TTFT)",
          description: "Latency to start generating response",
          models: [
            { name: "Gemini 2.5 Flash", score: 245, rank: 1, unit: "ms" },
            { name: "GPT-5 Nano", score: 289, rank: 2, unit: "ms" },
            { name: "Claude 3.5 Haiku", score: 312, rank: 3, unit: "ms" },
            { name: "GPT-5", score: 398, rank: 4, unit: "ms" },
            { name: "Claude 4 Opus", score: 445, rank: 5, unit: "ms" }
          ]
        }
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>AI Model Benchmarks 2025 - GPT-5, Claude 3.5 Opus, Gemini 2.0 Performance Comparison | Tokenomy</title>
        <meta name="description" content="Comprehensive AI model benchmarks comparing GPT-5, Claude 3.5 Opus, Gemini 2.0 Ultra, Llama 4, and Mistral Large 3. MMLU scores, reasoning capabilities, coding performance, context windows, and speed comparisons." />
        <meta name="keywords" content="AI model benchmarks 2025, GPT-5 benchmarks, Claude 3.5 Opus performance, Gemini 2.0 Ultra benchmarks, Llama 4 benchmarks, Mistral Large 3, MMLU scores, AI model comparison, LLM benchmarks, reasoning benchmarks, coding benchmarks, AI performance metrics, context window comparison, tokens per second" />
        <meta name="author" content="Tokenomy Research Team" />
        <link rel="canonical" href="https://tokenomy.dev/research/model-benchmarks" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="AI Model Benchmarks - Compare GPT-5, Claude, Gemini Performance" />
        <meta property="og:description" content="Detailed performance benchmarks and comparisons of leading AI models. MMLU scores, reasoning, coding, and speed metrics." />
        <meta property="og:url" content="https://tokenomy.dev/research/model-benchmarks" />
        <meta property="og:site_name" content="Tokenomy" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Model Benchmarks 2025 | Tokenomy" />
        <meta name="twitter:description" content="Compare GPT-5, Claude 3.5 Opus, Gemini 2.0 Ultra benchmarks. MMLU, reasoning, coding performance." />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Dataset",
            "name": "AI Model Performance Benchmarks",
            "description": "Comprehensive benchmarks and performance metrics for leading AI language models",
            "keywords": "AI benchmarks, model performance, MMLU, reasoning, coding, GPT-5, Claude, Gemini",
            "creator": {
              "@type": "Organization",
              "name": "Tokenomy Research Team"
            },
            "about": [
              {
                "@type": "Thing",
                "name": "Artificial Intelligence"
              },
              {
                "@type": "Thing",
                "name": "Machine Learning Benchmarks"
              },
              {
                "@type": "Thing",
                "name": "Large Language Models"
              }
            ],
            "measurementTechnique": "MMLU, HumanEval, reasoning tasks, context window tests"
          })}
        </script>
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            AI Model Benchmarks
          </h1>
          <p className="text-lg text-muted-foreground">
            Comprehensive performance comparison across leading AI models
          </p>
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-yellow-500/50 bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Reasoning Champion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Claude 4 Opus</div>
              <div className="text-sm text-muted-foreground">92.8% on MMLU</div>
            </CardContent>
          </Card>

          <Card className="border-blue-500/50 bg-gradient-to-br from-blue-500/5 to-cyan-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-blue-500" />
                Speed Leader
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Gemini 2.5 Flash</div>
              <div className="text-sm text-muted-foreground">142 tokens/sec</div>
            </CardContent>
          </Card>

          <Card className="border-purple-500/50 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5 text-purple-500" />
                Multimodal King
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Claude 4 Opus</div>
              <div className="text-sm text-muted-foreground">89.2% on MMMU</div>
            </CardContent>
          </Card>
        </div>

        {/* Benchmark Categories */}
        <Tabs defaultValue="reasoning" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reasoning">Reasoning & Code</TabsTrigger>
            <TabsTrigger value="multimodal">Multimodal</TabsTrigger>
            <TabsTrigger value="speed">Speed & Efficiency</TabsTrigger>
          </TabsList>

          <TabsContent value="reasoning" className="space-y-6">
            {benchmarks[0].tests.map((test, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{test.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{test.description}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Chart
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Rank</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                        <TableHead className="text-right">Change</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {test.models.map((model) => (
                        <TableRow key={model.name}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {model.rank === 1 && <Trophy className="h-4 w-4 text-yellow-500" />}
                              {model.rank === 2 && <Trophy className="h-4 w-4 text-gray-400" />}
                              {model.rank === 3 && <Trophy className="h-4 w-4 text-amber-600" />}
                              <span className="font-medium">#{model.rank}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{model.name}</TableCell>
                          <TableCell className="text-right font-bold">{model.score}%</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={model.change?.startsWith("+") ? "default" : "secondary"}>
                              {model.change}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="multimodal" className="space-y-6">
            {benchmarks[1].tests.map((test, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{test.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{test.description}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Chart
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Rank</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                        <TableHead className="text-right">Change</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {test.models.map((model) => (
                        <TableRow key={model.name}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {model.rank === 1 && <Trophy className="h-4 w-4 text-yellow-500" />}
                              {model.rank === 2 && <Trophy className="h-4 w-4 text-gray-400" />}
                              {model.rank === 3 && <Trophy className="h-4 w-4 text-amber-600" />}
                              <span className="font-medium">#{model.rank}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{model.name}</TableCell>
                          <TableCell className="text-right font-bold">{model.score}%</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={model.change?.startsWith("+") ? "default" : "secondary"}>
                              {model.change}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="speed" className="space-y-6">
            {benchmarks[2].tests.map((test, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{test.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{test.description}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Chart
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Rank</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead className="text-right">Performance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {test.models.map((model) => (
                        <TableRow key={model.name}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {model.rank === 1 && <Trophy className="h-4 w-4 text-yellow-500" />}
                              {model.rank === 2 && <Trophy className="h-4 w-4 text-gray-400" />}
                              {model.rank === 3 && <Trophy className="h-4 w-4 text-amber-600" />}
                              <span className="font-medium">#{model.rank}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{model.name}</TableCell>
                          <TableCell className="text-right font-bold">
                            {model.score} {model.unit}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
