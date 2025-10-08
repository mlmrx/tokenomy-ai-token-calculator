import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Newspaper, TrendingUp, Sparkles, Bookmark, ExternalLink, Filter, Calendar } from "lucide-react";

export default function AINewsHub() {
  const [searchQuery, setSearchQuery] = useState("");

  const newsCategories = [
    { id: "all", label: "All News", icon: Newspaper },
    { id: "models", label: "Model Releases", icon: Sparkles },
    { id: "research", label: "Research", icon: TrendingUp },
    { id: "industry", label: "Industry", icon: ExternalLink }
  ];

  const latestNews = [
    {
      id: 1,
      title: "Claude 4 Opus Achieves New SOTA on MultiModal Reasoning Benchmarks",
      source: "Anthropic",
      category: "models",
      date: "2025-10-07",
      summary: "Anthropic's Claude 4 Opus demonstrates exceptional performance across vision-language tasks, setting new records on MMMU and ChartQA benchmarks with 89.2% accuracy.",
      tags: ["Claude", "Multimodal", "SOTA", "Benchmarks"],
      trending: true,
      url: "#"
    },
    {
      id: 2,
      title: "DeepMind Unveils Gemini 2.5 Pro with 2M Context Window",
      source: "Google DeepMind",
      category: "models",
      date: "2025-10-06",
      summary: "Google's latest Gemini model introduces unprecedented 2 million token context length with native multimodal understanding and improved reasoning capabilities.",
      tags: ["Gemini", "Google", "Context Window", "Multimodal"],
      trending: true,
      url: "#"
    },
    {
      id: 3,
      title: "GPT-5 Now Available: OpenAI's Most Capable Model Yet",
      source: "OpenAI",
      category: "models",
      date: "2025-10-05",
      summary: "OpenAI releases GPT-5 with enhanced reasoning, expanded context to 200K tokens, and breakthrough performance on complex problem-solving tasks.",
      tags: ["GPT-5", "OpenAI", "Reasoning", "Language Model"],
      trending: true,
      url: "#"
    },
    {
      id: 4,
      title: "Meta's Llama 4 405B: Open Source Frontier Model",
      source: "Meta AI",
      category: "models",
      date: "2025-10-04",
      summary: "Meta releases Llama 4 405B parameters model under permissive license, challenging closed-source models with comparable performance.",
      tags: ["Llama", "Meta", "Open Source", "405B"],
      trending: true,
      url: "#"
    },
    {
      id: 5,
      title: "Mistral AI Announces Mistral Large 2 with Code Specialization",
      source: "Mistral AI",
      category: "models",
      date: "2025-10-03",
      summary: "European AI leader Mistral unveils its most capable model yet with enhanced code generation and multilingual capabilities.",
      tags: ["Mistral", "Code Generation", "European AI"],
      url: "#"
    },
    {
      id: 6,
      title: "Breakthrough in Robotics: Figure 02 Achieves Human-Level Dexterity",
      source: "Figure AI",
      category: "industry",
      date: "2025-10-02",
      summary: "Figure's humanoid robot demonstrates unprecedented fine motor control, opening new applications in manufacturing and healthcare.",
      tags: ["Robotics", "Dexterity", "Humanoid", "Manufacturing"],
      url: "#"
    },
    {
      id: 7,
      title: "Stanford Researchers Propose 'Constitutional AI 2.0' Framework",
      source: "Stanford University",
      category: "research",
      date: "2025-10-01",
      summary: "New research introduces advanced alignment techniques that allow AI systems to self-correct and improve safety guarantees.",
      tags: ["AI Safety", "Alignment", "Constitutional AI", "Research"],
      url: "#"
    },
    {
      id: 8,
      title: "NVIDIA Blackwell Architecture Powers 10x AI Training Speed",
      source: "NVIDIA",
      category: "industry",
      date: "2025-09-30",
      summary: "NVIDIA's next-gen Blackwell GPUs deliver unprecedented AI training performance with improved energy efficiency.",
      tags: ["NVIDIA", "GPU", "Training", "Hardware"],
      url: "#"
    },
    {
      id: 9,
      title: "Cohere Command R+ Excels at Retrieval-Augmented Generation",
      source: "Cohere",
      category: "models",
      date: "2025-09-29",
      summary: "Cohere's latest model shows exceptional performance on RAG tasks with 35+ language support and enterprise features.",
      tags: ["Cohere", "RAG", "Multilingual", "Enterprise"],
      url: "#"
    },
    {
      id: 10,
      title: "MIT Introduces Efficient Attention Mechanism Reducing Memory by 90%",
      source: "MIT CSAIL",
      category: "research",
      date: "2025-09-28",
      summary: "Breakthrough algorithm enables training of massive models on consumer hardware by dramatically reducing memory requirements.",
      tags: ["Attention", "Efficiency", "Memory", "Algorithm"],
      url: "#"
    }
  ];

  return (
    <>
      <Helmet>
        <title>AI News Hub 2025 - Latest GPT-5, Claude, Gemini Updates | Tokenomy</title>
        <meta name="description" content="Latest AI news and announcements from OpenAI GPT-5, Anthropic Claude 3.5 Opus, Google Gemini 2.0, Meta Llama 4, Mistral AI. Real-time updates on LLM releases, AI research breakthroughs, and industry developments." />
        <meta name="keywords" content="AI news 2025, GPT-5 news, Claude 3.5 Opus, Gemini 2.0 updates, Llama 4, Mistral AI news, OpenAI announcements, Anthropic updates, Google DeepMind news, AI research news, LLM updates, artificial intelligence news, machine learning news, AI breakthroughs" />
        <meta name="author" content="Tokenomy Research Team" />
        <link rel="canonical" href="https://tokenomy.dev/research/ai-news-hub" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="AI News Hub - Latest AI Updates & Announcements" />
        <meta property="og:description" content="Real-time AI news from OpenAI, Anthropic, Google DeepMind, Meta AI, and Mistral. Stay updated on GPT-5, Claude, Gemini, and Llama developments." />
        <meta property="og:url" content="https://tokenomy.dev/research/ai-news-hub" />
        <meta property="og:site_name" content="Tokenomy" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI News Hub 2025 | Tokenomy" />
        <meta name="twitter:description" content="Latest AI news: GPT-5, Claude 3.5 Opus, Gemini 2.0, Llama 4 updates and more." />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "AI News Hub",
            "description": "Latest news and updates from the artificial intelligence industry",
            "publisher": {
              "@type": "Organization",
              "name": "Tokenomy",
              "logo": {
                "@type": "ImageObject",
                "url": "https://tokenomy.dev/favicon.png"
              }
            },
            "mainEntity": {
              "@type": "ItemList",
              "itemListElement": latestNews.map((item, index) => ({
                "@type": "NewsArticle",
                "position": index + 1,
                "headline": item.title,
                "description": item.summary,
                "datePublished": item.date,
                "author": {
                  "@type": "Organization",
                  "name": item.source
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "Tokenomy"
                }
              }))
            }
          })}
        </script>
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            AI News Hub
          </h1>
          <p className="text-lg text-muted-foreground">
            Real-time coverage of AI model releases, research breakthroughs, and industry developments
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search AI news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Trending Banner */}
        <Card className="mb-6 border-primary/50 bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Trending Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {["Claude 4", "GPT-5", "Gemini 2.5", "Llama 4", "Figure 02"].map((trend) => (
                <Badge key={trend} variant="secondary" className="cursor-pointer hover:bg-primary/20">
                  {trend}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* News Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            {newsCategories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                <category.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{category.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {newsCategories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="space-y-4">
              {latestNews
                .filter((news) => category.id === "all" || news.category === category.id)
                .map((news) => (
                  <Card key={news.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {news.trending && (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                Trending
                              </Badge>
                            )}
                            <Badge variant="outline">{news.source}</Badge>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {news.date}
                            </span>
                          </div>
                          <CardTitle className="text-xl mb-2">{news.title}</CardTitle>
                          <p className="text-muted-foreground">{news.summary}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button size="sm" variant="ghost">
                            <Bookmark className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {news.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        Read More
                        <ExternalLink className="h-3 w-3" />
                      </Button>
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
