import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, FileText, Star, Download, ExternalLink, BookOpen, TrendingUp } from "lucide-react";

export default function ResearchPapers() {
  const [searchQuery, setSearchQuery] = useState("");

  const papers = [
    {
      id: 1,
      title: "Constitutional AI: Harmlessness from AI Feedback",
      authors: "Bai, Y., Kadavath, S., Kundu, S., et al.",
      institution: "Anthropic",
      date: "2025-09",
      category: "AI Safety",
      citations: 1247,
      arxiv: "2509.xxxxx",
      summary: "Introduces a method for training AI systems to be harmless without human labels, using AI-generated feedback based on constitutional principles.",
      tags: ["AI Safety", "RLHF", "Alignment"],
      trending: true
    },
    {
      id: 2,
      title: "Gemini 2.5: A Multimodal Foundation Model with 2M Context",
      authors: "Team, G., Anil, R., Borgeaud, S., et al.",
      institution: "Google DeepMind",
      date: "2025-09",
      category: "Foundation Models",
      citations: 892,
      arxiv: "2509.xxxxx",
      summary: "Presents architectural innovations enabling efficient processing of 2 million tokens with native multimodal understanding.",
      tags: ["Multimodal", "Long Context", "Architecture"],
      trending: true
    },
    {
      id: 3,
      title: "Mixture-of-Experts at Scale: Training 1T+ Parameter Models",
      authors: "Lepikhin, D., Lee, H., Xu, Y., et al.",
      institution: "Google Brain",
      date: "2025-08",
      category: "Scaling",
      citations: 1534,
      arxiv: "2508.xxxxx",
      summary: "Demonstrates efficient training of trillion-parameter models using sparse mixture-of-experts architecture.",
      tags: ["MoE", "Scaling", "Efficiency"],
      trending: true
    },
    {
      id: 4,
      title: "FlashAttention-3: Efficient Attention with Hardware-Aware Design",
      authors: "Dao, T., Fu, D., Ermon, S., et al.",
      institution: "Stanford, Together AI",
      date: "2025-08",
      category: "Optimization",
      citations: 2103,
      arxiv: "2508.xxxxx",
      summary: "Third iteration of FlashAttention achieving 3x speedup through GPU-specific optimizations.",
      tags: ["Attention", "Optimization", "Hardware"],
      trending: false
    },
    {
      id: 5,
      title: "Robotic Foundation Models: Learning Universal Policies",
      authors: "Brohan, A., Brown, N., Carbajal, J., et al.",
      institution: "Google DeepMind, Stanford",
      date: "2025-07",
      category: "Robotics",
      citations: 876,
      arxiv: "2507.xxxxx",
      summary: "Introduces RT-X, a family of robotic transformer models trained on diverse manipulation tasks.",
      tags: ["Robotics", "Manipulation", "Transfer Learning"],
      trending: false
    },
    {
      id: 6,
      title: "Tool Learning with Large Language Models: A Survey",
      authors: "Qin, Y., Liang, S., Ye, Y., et al.",
      institution: "Tsinghua University",
      date: "2025-07",
      category: "Tool Use",
      citations: 654,
      arxiv: "2507.xxxxx",
      summary: "Comprehensive survey of methods enabling LLMs to use external tools and APIs.",
      tags: ["Tool Use", "Agents", "Survey"],
      trending: false
    },
    {
      id: 7,
      title: "Retrieval-Augmented Generation: Scaling to Billion-Document Collections",
      authors: "Lewis, P., Perez, E., Piktus, A., et al.",
      institution: "Meta AI, UCL",
      date: "2025-06",
      category: "RAG",
      citations: 1892,
      arxiv: "2506.xxxxx",
      summary: "Demonstrates efficient RAG systems that scale to billion-document collections with sub-second latency.",
      tags: ["RAG", "Retrieval", "Scaling"],
      trending: false
    },
    {
      id: 8,
      title: "Multimodal Chain-of-Thought Reasoning in Vision-Language Models",
      authors: "Zhang, Z., Zhang, A., Li, M., et al.",
      institution: "Microsoft Research",
      date: "2025-06",
      category: "Multimodal",
      citations: 743,
      arxiv: "2506.xxxxx",
      summary: "Extends chain-of-thought prompting to vision-language tasks with significant performance gains.",
      tags: ["Chain-of-Thought", "Multimodal", "Reasoning"],
      trending: false
    }
  ];

  const categories = [
    "All Papers",
    "Foundation Models",
    "AI Safety",
    "Robotics",
    "Optimization",
    "Multimodal"
  ];

  return (
    <>
      <Helmet>
        <title>AI Research Papers - Latest Publications | Tokenomy</title>
        <meta name="description" content="Curated collection of groundbreaking AI research papers. Stay updated with latest publications on LLMs, robotics, multimodal AI, and safety from top institutions." />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Research Papers
          </h1>
          <p className="text-lg text-muted-foreground">
            Curated collection of groundbreaking AI research from leading institutions
          </p>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search papers by title, author, or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Trending Topics */}
        <Card className="mb-6 border-primary/50 bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Trending Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {["Constitutional AI", "Long Context", "MoE", "Flash Attention", "Robotic Learning"].map((topic) => (
                <Badge key={topic} variant="secondary" className="cursor-pointer hover:bg-primary/20">
                  {topic}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Papers List */}
        <Tabs defaultValue="All Papers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="text-xs lg:text-sm">
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category} className="space-y-4">
              {papers
                .filter((paper) => category === "All Papers" || paper.category === category)
                .map((paper) => (
                  <Card key={paper.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {paper.trending && (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                Trending
                              </Badge>
                            )}
                            <Badge variant="outline">{paper.category}</Badge>
                            <Badge variant="secondary">{paper.date}</Badge>
                          </div>
                          <CardTitle className="text-xl mb-2">{paper.title}</CardTitle>
                          <div className="text-sm text-muted-foreground mb-2">
                            {paper.authors}
                          </div>
                          <div className="text-sm font-medium text-primary mb-3">
                            {paper.institution}
                          </div>
                          <p className="text-muted-foreground mb-3">{paper.summary}</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {paper.tags.map((tag) => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Star className="h-4 w-4" />
                            <span>{paper.citations} citations</span>
                            <span>•</span>
                            <span>arXiv:{paper.arxiv}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <ExternalLink className="h-3 w-3" />
                          View on arXiv
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <Download className="h-3 w-3" />
                          Download PDF
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <BookOpen className="h-3 w-3" />
                          Summary
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  );
}
