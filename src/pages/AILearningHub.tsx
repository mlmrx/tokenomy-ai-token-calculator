import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GraduationCap, 
  Sparkles, 
  Zap, 
  Brain, 
  Users, 
  Code, 
  TrendingUp,
  BookOpen,
  Video,
  FileText,
  Award,
  Target,
  Rocket,
  ChevronRight,
  CheckCircle2,
  Star
} from "lucide-react";

interface LearningPath {
  id: string;
  title: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  role: "technical" | "business" | "all";
  icon: React.ReactNode;
  modules: Module[];
  duration: string;
  color: string;
}

interface Module {
  title: string;
  description: string;
  type: "video" | "article" | "hands-on" | "quiz";
  duration: string;
  completed?: boolean;
}

const AILearningHub: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<"all" | "technical" | "business">("all");
  const [selectedLevel, setSelectedLevel] = useState<"all" | "beginner" | "intermediate" | "advanced">("all");

  const learningPaths: LearningPath[] = [
    {
      id: "ai-fundamentals",
      title: "AI Fundamentals",
      description: "Build a strong foundation in generative AI concepts, models, and applications",
      level: "beginner",
      role: "all",
      icon: <Brain className="h-6 w-6" />,
      duration: "4 weeks",
      color: "from-blue-500 to-cyan-500",
      modules: [
        {
          title: "Introduction to Generative AI",
          description: "Understand what generative AI is and how it differs from traditional AI",
          type: "video",
          duration: "45 min",
          completed: false
        },
        {
          title: "Large Language Models Explained",
          description: "Deep dive into LLMs, transformers, and how they work",
          type: "article",
          duration: "30 min",
          completed: false
        },
        {
          title: "Prompt Engineering Basics",
          description: "Learn how to craft effective prompts for AI models",
          type: "hands-on",
          duration: "1 hour",
          completed: false
        },
        {
          title: "Knowledge Check",
          description: "Test your understanding of AI fundamentals",
          type: "quiz",
          duration: "15 min",
          completed: false
        }
      ]
    },
    {
      id: "agent-design",
      title: "Designing & Customizing AI Agents at Scale",
      description: "Master the art of building, deploying, and managing AI agents in production",
      level: "advanced",
      role: "technical",
      icon: <Code className="h-6 w-6" />,
      duration: "6 weeks",
      color: "from-purple-500 to-pink-500",
      modules: [
        {
          title: "Agent Architecture Patterns",
          description: "Learn common patterns for building reliable AI agents",
          type: "video",
          duration: "1 hour",
          completed: false
        },
        {
          title: "Multi-Agent Systems",
          description: "Design systems where multiple agents collaborate",
          type: "article",
          duration: "45 min",
          completed: false
        },
        {
          title: "Building Your First Agent",
          description: "Hands-on lab to create a functional AI agent",
          type: "hands-on",
          duration: "2 hours",
          completed: false
        },
        {
          title: "Scaling Agent Deployments",
          description: "Best practices for deploying agents at enterprise scale",
          type: "video",
          duration: "1 hour",
          completed: false
        }
      ]
    },
    {
      id: "ai-workloads",
      title: "Managing AI Workloads",
      description: "Advanced expertise in optimizing, monitoring, and managing AI infrastructure",
      level: "advanced",
      role: "technical",
      icon: <Zap className="h-6 w-6" />,
      duration: "5 weeks",
      color: "from-orange-500 to-red-500",
      modules: [
        {
          title: "AI Infrastructure Optimization",
          description: "Optimize GPU usage and reduce costs in AI workloads",
          type: "video",
          duration: "50 min",
          completed: false
        },
        {
          title: "Token Usage & Cost Management",
          description: "Monitor and control AI API costs effectively",
          type: "hands-on",
          duration: "1.5 hours",
          completed: false
        },
        {
          title: "Performance Monitoring",
          description: "Set up comprehensive monitoring for AI systems",
          type: "article",
          duration: "40 min",
          completed: false
        },
        {
          title: "Scaling Best Practices",
          description: "Handle high-volume AI workloads efficiently",
          type: "video",
          duration: "1 hour",
          completed: false
        }
      ]
    },
    {
      id: "creative-productivity",
      title: "AI for Creativity & Productivity",
      description: "Unleash your creativity and boost productivity with generative AI tools",
      level: "beginner",
      role: "business",
      icon: <Sparkles className="h-6 w-6" />,
      duration: "3 weeks",
      color: "from-green-500 to-emerald-500",
      modules: [
        {
          title: "AI-Powered Content Creation",
          description: "Create compelling content with AI assistance",
          type: "video",
          duration: "35 min",
          completed: false
        },
        {
          title: "Automating Workflows with AI",
          description: "Streamline repetitive tasks using AI tools",
          type: "hands-on",
          duration: "1 hour",
          completed: false
        },
        {
          title: "Creative Use Cases",
          description: "Explore innovative applications of generative AI",
          type: "article",
          duration: "25 min",
          completed: false
        },
        {
          title: "Best Practices & Ethics",
          description: "Responsible AI use in creative work",
          type: "video",
          duration: "30 min",
          completed: false
        }
      ]
    },
    {
      id: "business-strategy",
      title: "AI Strategy for Business Leaders",
      description: "Develop organizational AI strategies and drive business transformation",
      level: "intermediate",
      role: "business",
      icon: <TrendingUp className="h-6 w-6" />,
      duration: "4 weeks",
      color: "from-indigo-500 to-blue-500",
      modules: [
        {
          title: "AI Business Value Assessment",
          description: "Identify high-impact AI opportunities in your organization",
          type: "video",
          duration: "45 min",
          completed: false
        },
        {
          title: "Building an AI Roadmap",
          description: "Create a strategic plan for AI adoption",
          type: "article",
          duration: "50 min",
          completed: false
        },
        {
          title: "ROI Calculation for AI Projects",
          description: "Measure and communicate AI business impact",
          type: "hands-on",
          duration: "1 hour",
          completed: false
        },
        {
          title: "Change Management for AI",
          description: "Lead successful AI transformation initiatives",
          type: "video",
          duration: "40 min",
          completed: false
        }
      ]
    },
    {
      id: "prompt-engineering",
      title: "Advanced Prompt Engineering",
      description: "Master advanced techniques for controlling and optimizing AI model outputs",
      level: "intermediate",
      role: "technical",
      icon: <Target className="h-6 w-6" />,
      duration: "4 weeks",
      color: "from-violet-500 to-purple-500",
      modules: [
        {
          title: "Prompt Design Patterns",
          description: "Learn proven patterns for effective prompts",
          type: "article",
          duration: "40 min",
          completed: false
        },
        {
          title: "Chain-of-Thought Prompting",
          description: "Guide AI through complex reasoning tasks",
          type: "hands-on",
          duration: "1.5 hours",
          completed: false
        },
        {
          title: "Few-Shot Learning Techniques",
          description: "Optimize model performance with examples",
          type: "video",
          duration: "45 min",
          completed: false
        },
        {
          title: "Prompt Optimization Lab",
          description: "Practice optimizing prompts for different use cases",
          type: "hands-on",
          duration: "2 hours",
          completed: false
        }
      ]
    }
  ];

  const filteredPaths = learningPaths.filter(path => {
    const roleMatch = selectedRole === "all" || path.role === "all" || path.role === selectedRole;
    const levelMatch = selectedLevel === "all" || path.level === selectedLevel;
    return roleMatch && levelMatch;
  });

  const getModuleIcon = (type: Module["type"]) => {
    switch (type) {
      case "video": return <Video className="h-4 w-4" />;
      case "article": return <FileText className="h-4 w-4" />;
      case "hands-on": return <Code className="h-4 w-4" />;
      case "quiz": return <Award className="h-4 w-4" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner": return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "intermediate": return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "advanced": return "bg-purple-500/10 text-purple-700 dark:text-purple-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <Helmet>
        <title>AI Learning Hub - Generative AI Training & Resources | Tokenomy</title>
        <meta name="description" content="Accelerate your AI learning with curated resources tailored for technical and business roles. Master AI agents, workload management, prompt engineering, and more." />
        <meta name="keywords" content="AI learning, generative AI training, AI courses, prompt engineering, AI agents, business AI strategy" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-blue-500/5" />
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Interactive Learning Platform</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI Learning Hub
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Accelerate your AI learning with resources tailored for technical and business roles to support AI skill development for individuals and organizations
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Card className="p-4 bg-card/50 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold">50+</div>
                  <div className="text-sm text-muted-foreground">Learning Modules</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-card/50 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold">10K+</div>
                  <div className="text-sm text-muted-foreground">Active Learners</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-card/50 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Star className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold">4.8/5</div>
                  <div className="text-sm text-muted-foreground">Average Rating</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-7xl mx-auto px-4 mb-12">
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <span className="font-semibold">Filter Learning Paths:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <div className="flex gap-2">
                <Button
                  variant={selectedRole === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRole("all")}
                >
                  All Roles
                </Button>
                <Button
                  variant={selectedRole === "technical" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRole("technical")}
                >
                  <Code className="h-4 w-4 mr-2" />
                  Technical
                </Button>
                <Button
                  variant={selectedRole === "business" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRole("business")}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Business
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={selectedLevel === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLevel("all")}
                >
                  All Levels
                </Button>
                <Button
                  variant={selectedLevel === "beginner" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLevel("beginner")}
                >
                  Beginner
                </Button>
                <Button
                  variant={selectedLevel === "intermediate" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLevel("intermediate")}
                >
                  Intermediate
                </Button>
                <Button
                  variant={selectedLevel === "advanced" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLevel("advanced")}
                >
                  Advanced
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Learning Paths Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPaths.map((path) => (
            <Card key={path.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${path.color}`} />
              
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${path.color}`}>
                    <div className="text-white">
                      {path.icon}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Badge className={getLevelColor(path.level)}>
                      {path.level}
                    </Badge>
                    {path.role !== "all" && (
                      <Badge variant="outline" className="text-xs">
                        {path.role === "technical" ? <Code className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />}
                        {path.role}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <CardTitle className="text-xl">{path.title}</CardTitle>
                <CardDescription className="text-sm">{path.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {path.modules.length} modules
                    </span>
                    <span>{path.duration}</span>
                  </div>
                  
                  <div className="space-y-2">
                    {path.modules.slice(0, 3).map((module, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <div className="mt-0.5 text-muted-foreground">
                          {getModuleIcon(module.type)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-foreground">{module.title}</div>
                          <div className="text-xs text-muted-foreground">{module.duration}</div>
                        </div>
                      </div>
                    ))}
                    {path.modules.length > 3 && (
                      <div className="text-xs text-muted-foreground pl-6">
                        +{path.modules.length - 3} more modules
                      </div>
                    )}
                  </div>
                  
                  <Button className="w-full group-hover:translate-x-1 transition-transform">
                    Start Learning
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {filteredPaths.length === 0 && (
          <Card className="p-12 text-center">
            <div className="text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No learning paths match your current filters.</p>
              <p className="text-sm mt-2">Try adjusting your role or level selection.</p>
            </div>
          </Card>
        )}
      </section>

      {/* Why Choose Section */}
      <section className="bg-muted/50 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our AI Learning Hub?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <div className="p-3 rounded-full bg-blue-500/10 w-fit mx-auto mb-4">
                <Rocket className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Accelerated Learning</h3>
              <p className="text-muted-foreground text-sm">
                Structured paths designed to get you productive with AI quickly, whether you're technical or business-focused
              </p>
            </Card>
            
            <Card className="text-center p-6">
              <div className="p-3 rounded-full bg-purple-500/10 w-fit mx-auto mb-4">
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Role-Specific Content</h3>
              <p className="text-muted-foreground text-sm">
                Curated learning experiences tailored for developers, data scientists, business leaders, and creatives
              </p>
            </Card>
            
            <Card className="text-center p-6">
              <div className="p-3 rounded-full bg-green-500/10 w-fit mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Hands-On Practice</h3>
              <p className="text-muted-foreground text-sm">
                Interactive labs and real-world projects to apply what you learn immediately in your work
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AILearningHub;