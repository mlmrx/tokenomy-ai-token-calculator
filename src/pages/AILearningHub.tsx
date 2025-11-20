import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Sparkles, 
  Zap, 
  Brain, 
  Users, 
  Code, 
  TrendingUp,
  BookOpen,
  Target,
  Rocket,
  ChevronRight,
  CheckCircle2,
  Star,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const AILearningHub: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedRole, setSelectedRole] = useState<"all" | "technical" | "business">("all");
  const [selectedLevel, setSelectedLevel] = useState<"all" | "beginner" | "intermediate" | "advanced">("all");
  const [learningPaths, setLearningPaths] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLearningPaths();
  }, [user]);

  const loadLearningPaths = async () => {
    try {
      setLoading(true);
      
      const { data: pathsData, error: pathsError } = await supabase
        .from('learning_paths')
        .select('*')
        .order('created_at');

      if (pathsError) throw pathsError;
      setLearningPaths(pathsData || []);

      if (user) {
        const { data: enrollmentData } = await supabase
          .from('user_enrollments')
          .select('learning_path_id')
          .eq('user_id', user.id);

        const enrolled = new Set(enrollmentData?.map(e => e.learning_path_id) || []);
        setEnrollments(enrolled);
      }
    } catch (error: any) {
      console.error('Error loading learning paths:', error);
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: {[key: string]: React.ReactNode} = {
      'Brain': <Brain className="h-6 w-6" />,
      'Code': <Code className="h-6 w-6" />,
      'Zap': <Zap className="h-6 w-6" />,
      'Sparkles': <Sparkles className="h-6 w-6" />,
      'TrendingUp': <TrendingUp className="h-6 w-6" />,
      'Target': <Target className="h-6 w-6" />
    };
    return icons[iconName] || <BookOpen className="h-6 w-6" />;
  };

  const filteredPaths = learningPaths.filter(path => {
    const roleMatch = selectedRole === "all" || path.role === "all" || path.role === selectedRole;
    const levelMatch = selectedLevel === "all" || path.level === selectedLevel;
    return roleMatch && levelMatch;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner": return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "intermediate": return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "advanced": return "bg-purple-500/10 text-purple-700 dark:text-purple-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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

          <div className="flex flex-wrap gap-4 justify-center mb-6">
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

          {user && (
            <Button size="lg" onClick={() => navigate('/learning/dashboard')}>
              View My Dashboard
            </Button>
          )}
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
              <div className={`h-2 bg-gradient-to-r ${path.color_gradient}`} />
              
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${path.color_gradient}`}>
                    <div className="text-white">
                      {getIconComponent(path.icon_name)}
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
                    <span>{path.duration}</span>
                    {enrollments.has(path.id) && (
                      <Badge className="bg-green-500">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Enrolled
                      </Badge>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full group-hover:translate-x-1 transition-transform"
                    onClick={() => navigate(`/learning/course/${path.id}`)}
                  >
                    {enrollments.has(path.id) ? 'Continue Learning' : 'Start Learning'}
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