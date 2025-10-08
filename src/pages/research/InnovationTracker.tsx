import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rocket, Lightbulb, Cpu, Eye, Zap, TrendingUp, ExternalLink, Star } from "lucide-react";

export default function InnovationTracker() {
  const innovations = [
    {
      id: 1,
      title: "Apple Intelligence: On-Device AI Revolution",
      company: "Apple",
      category: "Edge AI",
      date: "2025-10-05",
      status: "Production",
      description: "Apple's new AI system running entirely on-device with privacy-first design, featuring custom neural engine optimizations.",
      impact: "High",
      tags: ["Edge AI", "Privacy", "Hardware"],
      icon: Cpu
    },
    {
      id: 2,
      title: "Tesla Optimus Gen 3: Humanoid Robot for Manufacturing",
      company: "Tesla",
      category: "Robotics",
      date: "2025-10-01",
      status: "Beta",
      description: "Third-generation humanoid robot with improved dexterity and AI-powered task learning, deployed in Tesla factories.",
      impact: "High",
      tags: ["Humanoid", "Manufacturing", "Autonomy"],
      icon: Rocket
    },
    {
      id: 3,
      title: "Meta Ray-Ban AI Glasses: Real-Time Visual Intelligence",
      company: "Meta",
      category: "Wearables",
      date: "2025-09-28",
      status: "Production",
      description: "Smart glasses with GPT-5-powered visual AI for real-time object recognition, translation, and assistance.",
      impact: "Medium",
      tags: ["Wearables", "Computer Vision", "Consumer"],
      icon: Eye
    },
    {
      id: 4,
      title: "Nvidia ACE: AI Character Engine for Gaming",
      company: "NVIDIA",
      category: "Gaming AI",
      date: "2025-09-25",
      status: "Production",
      description: "Real-time AI-powered NPC characters with natural language understanding and dynamic personality.",
      impact: "Medium",
      tags: ["Gaming", "NPCs", "Real-time"],
      icon: Zap
    },
    {
      id: 5,
      title: "Amazon Q: Enterprise AI Assistant",
      company: "Amazon",
      category: "Enterprise",
      date: "2025-09-20",
      status: "Production",
      description: "Enterprise-focused AI assistant integrated with AWS services, featuring code generation and business intelligence.",
      impact: "High",
      tags: ["Enterprise", "Code Gen", "AWS"],
      icon: Lightbulb
    },
    {
      id: 6,
      title: "Boston Dynamics Spot: Enhanced Vision & Navigation",
      company: "Boston Dynamics",
      category: "Robotics",
      date: "2025-09-15",
      status: "Production",
      description: "Major update to Spot robot with GPT-powered scene understanding and autonomous mission planning.",
      impact: "Medium",
      tags: ["Robotics", "Navigation", "Industrial"],
      icon: Rocket
    }
  ];

  const startups = [
    {
      name: "Sakana AI",
      focus: "Bio-inspired AI",
      funding: "$125M Series A",
      location: "Tokyo, Japan",
      description: "Developing evolutionary algorithms and bio-inspired AI architectures for efficient learning.",
      founders: "Ex-Google Brain researchers"
    },
    {
      name: "Character.AI",
      focus: "Conversational AI",
      funding: "$150M Series A",
      location: "Menlo Park, CA",
      description: "Personalized AI characters for entertainment and companionship, processing 1B+ messages daily.",
      founders: "Noam Shazeer, Daniel De Freitas (Ex-Google)"
    },
    {
      name: "Adept AI",
      focus: "Action-oriented AI",
      funding: "$415M Series B",
      location: "San Francisco, CA",
      description: "AI that can use software tools and take actions on behalf of users.",
      founders: "David Luan (Ex-OpenAI)"
    },
    {
      name: "Covariant",
      focus: "Robotic AI",
      funding: "$222M Series C",
      location: "Berkeley, CA",
      description: "AI-powered robotic picking systems deployed in warehouses worldwide.",
      founders: "Pieter Abbeel (UC Berkeley)"
    }
  ];

  return (
    <>
      <Helmet>
        <title>AI Innovation Tracker 2025 - Latest Breakthroughs from Apple, Tesla, Meta, NVIDIA | Tokenomy</title>
        <meta name="description" content="Track latest AI and robotics innovations from Apple Intelligence, Tesla Optimus, Meta Ray-Ban AI Glasses, NVIDIA ACE, Amazon Q. Monitor emerging AI startups like Sakana AI, Character.AI, Adept AI, Covariant." />
        <meta name="keywords" content="AI innovation tracker, latest AI breakthroughs, Apple Intelligence, Tesla Optimus, Meta Ray-Ban AI, NVIDIA ACE, Amazon Q, Boston Dynamics Spot, AI startups 2025, Sakana AI, Character.AI, Adept AI, Covariant robotics, AI product launches, robotics innovations, edge AI, humanoid robots, enterprise AI" />
        <meta name="author" content="Tokenomy Research Team" />
        <link rel="canonical" href="https://tokenomy.dev/research/innovation-tracker" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="AI Innovation Tracker - Latest Product Launches & Breakthroughs" />
        <meta property="og:description" content="Real-time tracking of AI innovations from Apple, Tesla, Meta, NVIDIA and emerging AI startups. Stay updated on the latest AI and robotics breakthroughs." />
        <meta property="og:url" content="https://tokenomy.dev/research/innovation-tracker" />
        <meta property="og:site_name" content="Tokenomy" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Innovation Tracker 2025 | Tokenomy" />
        <meta name="twitter:description" content="Track latest AI breakthroughs from Apple Intelligence, Tesla Optimus, Meta, NVIDIA, and top AI startups." />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            "headline": "AI Innovation Tracker - Latest Product Launches and Breakthroughs",
            "description": "Comprehensive tracking of AI and robotics innovations from major tech companies and emerging startups",
            "keywords": "AI innovation, robotics, product launches, Apple Intelligence, Tesla Optimus, AI startups",
            "author": {
              "@type": "Organization",
              "name": "Tokenomy Research Team"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Tokenomy"
            },
            "about": [
              {
                "@type": "Thing",
                "name": "Artificial Intelligence"
              },
              {
                "@type": "Thing",
                "name": "Robotics"
              },
              {
                "@type": "Thing",
                "name": "Machine Learning"
              }
            ]
          })}
        </script>
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Innovation Tracker
          </h1>
          <p className="text-lg text-muted-foreground">
            Latest breakthroughs and product launches in AI and robotics
          </p>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products">Product Launches</TabsTrigger>
            <TabsTrigger value="startups">Emerging Startups</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            {innovations.map((innovation) => (
              <Card key={innovation.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <innovation.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{innovation.title}</CardTitle>
                          <div className="text-sm text-muted-foreground mt-1">
                            {innovation.company} • {innovation.date}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground mb-4">{innovation.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline">{innovation.category}</Badge>
                        <Badge variant={innovation.status === "Production" ? "default" : "secondary"}>
                          {innovation.status}
                        </Badge>
                        <Badge variant={innovation.impact === "High" ? "destructive" : "secondary"}>
                          {innovation.impact} Impact
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {innovation.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <ExternalLink className="h-3 w-3" />
                      Learn More
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Star className="h-3 w-3" />
                      Track Updates
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="startups" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {startups.map((startup) => (
                <Card key={startup.name} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-xl">{startup.name}</CardTitle>
                      <Badge variant="default" className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Hot
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline">{startup.focus}</Badge>
                        <span className="text-muted-foreground">• {startup.location}</span>
                      </div>
                      <div className="text-sm font-semibold text-primary">
                        {startup.funding}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {startup.description}
                    </p>
                    <div className="text-xs text-muted-foreground mb-4">
                      Founded by: {startup.founders}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <ExternalLink className="h-3 w-3" />
                        Visit Website
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
