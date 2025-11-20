import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  CheckCircle2,
  PlayCircle,
  FileText,
  Code,
  Award,
  Clock,
  Users,
  MessageSquare,
  ChevronRight,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ModuleContentViewer from "@/components/learning/ModuleContentViewer";
import QuizComponent from "@/components/learning/QuizComponent";
import DiscussionForum from "@/components/learning/DiscussionForum";
import { CodingSandbox } from "@/components/learning/CodingSandbox";
import { ProjectSubmission } from "@/components/learning/ProjectSubmission";
import { PeerReview } from "@/components/learning/PeerReview";

const LearningCoursePage: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [progress, setProgress] = useState<any[]>([]);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (courseId) {
      loadCourseData();
    }
  }, [courseId, user]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      
      // Load course details
      const { data: courseData, error: courseError } = await supabase
        .from('learning_paths')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Load modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .eq('learning_path_id', courseId)
        .order('order_index');

      if (modulesError) throw modulesError;
      setModules(modulesData || []);
      if (modulesData && modulesData.length > 0 && !selectedModule) {
        setSelectedModule(modulesData[0]);
      }

      if (user) {
        // Load user enrollment
        const { data: enrollmentData } = await supabase
          .from('user_enrollments')
          .select('*')
          .eq('user_id', user.id)
          .eq('learning_path_id', courseId)
          .maybeSingle();

        setEnrollment(enrollmentData);

        // Load progress
        const { data: progressData } = await supabase
          .from('module_progress')
          .select('*')
          .eq('user_id', user.id)
          .in('module_id', modulesData?.map(m => m.id) || []);

        setProgress(progressData || []);
        
        const completed = new Set(
          progressData?.filter(p => p.completed).map(p => p.module_id) || []
        );
        setCompletedModules(completed);
      }
    } catch (error: any) {
      console.error('Error loading course:', error);
      toast({
        title: "Error",
        description: "Failed to load course content",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to enroll in this course",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_enrollments')
        .insert({
          user_id: user.id,
          learning_path_id: courseId,
          progress_percentage: 0
        });

      if (error) throw error;

      toast({
        title: "Enrolled Successfully!",
        description: "You can now start learning"
      });

      loadCourseData();
    } catch (error: any) {
      console.error('Error enrolling:', error);
      toast({
        title: "Error",
        description: "Failed to enroll in course",
        variant: "destructive"
      });
    }
  };

  const handleModuleComplete = async (moduleId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('module_progress')
        .upsert({
          user_id: user.id,
          module_id: moduleId,
          completed: true,
          completed_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update local state
      setCompletedModules(prev => new Set([...prev, moduleId]));

      // Update enrollment progress
      const totalModules = modules.length;
      const completedCount = completedModules.size + 1;
      const progressPercentage = Math.round((completedCount / totalModules) * 100);

      await supabase
        .from('user_enrollments')
        .update({ 
          progress_percentage: progressPercentage,
          completed_at: progressPercentage === 100 ? new Date().toISOString() : null
        })
        .eq('user_id', user.id)
        .eq('learning_path_id', courseId);

      toast({
        title: "Module Completed!",
        description: "Great progress! Keep learning."
      });

      // Check if course is complete
      if (progressPercentage === 100) {
        await issueCertificate();
      }

      loadCourseData();
    } catch (error: any) {
      console.error('Error marking complete:', error);
    }
  };

  const issueCertificate = async () => {
    if (!user || !courseId) return;

    try {
      const certificateNumber = `CERT-${Date.now()}-${user.id.slice(0, 8)}`;
      
      const { error } = await supabase
        .from('certificates')
        .insert({
          user_id: user.id,
          learning_path_id: courseId,
          certificate_number: certificateNumber,
          verification_url: `/certificate/verify/${certificateNumber}`
        });

      if (error) throw error;

      // Award achievement
      await supabase.from('user_achievements').insert({
        user_id: user.id,
        achievement_type: 'course_completion',
        achievement_name: `Completed ${course?.title}`,
        achievement_description: `Successfully completed all modules in ${course?.title}`,
        metadata: { course_id: courseId, certificate_number: certificateNumber }
      });

      toast({
        title: "🎉 Certificate Earned!",
        description: "Congratulations! Your certificate is ready to download."
      });
    } catch (error: any) {
      console.error('Error issuing certificate:', error);
    }
  };

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'video': return <PlayCircle className="h-4 w-4" />;
      case 'article': return <FileText className="h-4 w-4" />;
      case 'hands-on': return <Code className="h-4 w-4" />;
      case 'quiz': return <Award className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Course not found</p>
          <Button className="mt-4" onClick={() => navigate('/learning/ai-hub')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </Card>
      </div>
    );
  }

  const progressPercentage = enrollment?.progress_percentage || 0;
  const isCompleted = progressPercentage === 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <Helmet>
        <title>{course.title} - AI Learning Hub | Tokenomy</title>
        <meta name="description" content={course.description} />
      </Helmet>

      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/learning/ai-hub')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
            {enrollment && (
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="text-muted-foreground">Progress: </span>
                  <span className="font-semibold">{progressPercentage}%</span>
                </div>
                {isCompleted && (
                  <Badge className="bg-green-500">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Module List */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Course Content</CardTitle>
                <CardDescription>
                  {modules.length} modules • {course.duration}
                </CardDescription>
                {enrollment && (
                  <Progress value={progressPercentage} className="mt-2" />
                )}
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-16rem)]">
                  <div className="space-y-2">
                    {modules.map((module, index) => {
                      const isModuleCompleted = completedModules.has(module.id);
                      const isSelected = selectedModule?.id === module.id;
                      
                      return (
                        <button
                          key={module.id}
                          onClick={() => setSelectedModule(module)}
                          className={`w-full text-left p-3 rounded-lg transition-all ${
                            isSelected 
                              ? 'bg-primary text-primary-foreground' 
                              : 'hover:bg-muted'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5">
                              {isModuleCompleted ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center text-xs ${
                                  isSelected ? 'border-primary-foreground' : 'border-muted-foreground'
                                }`}>
                                  {index + 1}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {getModuleIcon(module.type)}
                                <span className="text-sm font-medium truncate">
                                  {module.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs opacity-80">
                                <Clock className="h-3 w-3" />
                                {module.duration}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>

                {!enrollment && (
                  <Button className="w-full mt-4" onClick={handleEnroll}>
                    Enroll in Course
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="learn" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="learn">Learn</TabsTrigger>
                <TabsTrigger value="code">
                  <Code className="h-4 w-4 mr-2" />
                  Practice
                </TabsTrigger>
                <TabsTrigger value="projects">
                  <Award className="h-4 w-4 mr-2" />
                  Projects
                </TabsTrigger>
                <TabsTrigger value="reviews">
                  <Users className="h-4 w-4 mr-2" />
                  Peer Review
                </TabsTrigger>
                <TabsTrigger value="discuss">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Discussions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="learn" className="space-y-4">
                {selectedModule && (
                  <>
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                          {getModuleIcon(selectedModule.type)}
                          <Badge variant="outline">{selectedModule.type}</Badge>
                        </div>
                        <CardTitle>{selectedModule.title}</CardTitle>
                        <CardDescription>{selectedModule.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {selectedModule.type === 'quiz' ? (
                          <QuizComponent
                            module={selectedModule}
                            onComplete={() => handleModuleComplete(selectedModule.id)}
                            isCompleted={completedModules.has(selectedModule.id)}
                          />
                        ) : (
                          <ModuleContentViewer
                            module={selectedModule}
                            onComplete={() => handleModuleComplete(selectedModule.id)}
                            isCompleted={completedModules.has(selectedModule.id)}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>

              <TabsContent value="code">
                <CodingSandbox 
                  exerciseId={selectedModule?.id || ''} 
                  moduleId={selectedModule?.id || ''} 
                />
              </TabsContent>

              <TabsContent value="projects">
                <ProjectSubmission moduleId={selectedModule?.id || ''} />
              </TabsContent>

              <TabsContent value="reviews">
                <PeerReview moduleId={selectedModule?.id || ''} />
              </TabsContent>

              <TabsContent value="discuss">
                <DiscussionForum
                  learningPathId={courseId!}
                  moduleId={selectedModule?.id}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningCoursePage;