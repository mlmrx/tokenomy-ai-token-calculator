import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GraduationCap, 
  Trophy, 
  Target, 
  Clock,
  TrendingUp,
  Award,
  Calendar,
  BookOpen,
  CheckCircle2,
  Download,
  Loader2,
  PlayCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const LearningDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    totalModules: 0,
    completedModules: 0,
    totalLearningTime: 0,
    streak: 0
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    } else {
      navigate('/auth');
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load enrollments
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('user_enrollments')
        .select(`
          *,
          learning_paths (
            id,
            title,
            description,
            level,
            duration,
            color_gradient,
            icon_name
          )
        `)
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false });

      if (enrollmentError) throw enrollmentError;
      setEnrollments(enrollmentData || []);

      // Load certificates
      const { data: certData, error: certError } = await supabase
        .from('certificates')
        .select(`
          *,
          learning_paths (title, icon_name)
        `)
        .eq('user_id', user.id)
        .order('issued_at', { ascending: false });

      if (certError) throw certError;
      setCertificates(certData || []);

      // Load achievements
      const { data: achievementData, error: achievementError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false })
        .limit(10);

      if (achievementError) throw achievementError;
      setAchievements(achievementData || []);

      // Calculate stats
      const completedCount = enrollmentData?.filter(e => e.completed_at).length || 0;
      const inProgressCount = enrollmentData?.filter(e => !e.completed_at).length || 0;

      setStats({
        totalCourses: enrollmentData?.length || 0,
        completedCourses: completedCount,
        inProgressCourses: inProgressCount,
        totalModules: 0, // Would need to calculate from module_progress
        completedModules: 0,
        totalLearningTime: 0,
        streak: 0
      });

    } catch (error: any) {
      console.error('Error loading dashboard:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = (certificate: any) => {
    toast({
      title: "Certificate Download",
      description: "Certificate generation feature coming soon!"
    });
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
        <title>My Learning Dashboard | AI Learning Hub</title>
        <meta name="description" content="Track your learning progress and achievements" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 px-4 bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10">
        <div className="container">
          <div className="flex items-center gap-3 mb-6">
            <GraduationCap className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">My Learning Dashboard</h1>
              <p className="text-muted-foreground">Track your progress and achievements</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Target className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-3xl font-bold">{stats.totalCourses}</div>
                  <div className="text-sm text-muted-foreground">Enrolled Courses</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="text-3xl font-bold">{stats.completedCourses}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <PlayCircle className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <div className="text-3xl font-bold">{stats.inProgressCourses}</div>
                  <div className="text-sm text-muted-foreground">In Progress</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <div className="text-3xl font-bold">{certificates.length}</div>
                  <div className="text-sm text-muted-foreground">Certificates</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="container py-8">
        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-4">
            {enrollments.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start your learning journey by enrolling in a course
                </p>
                <Button onClick={() => navigate('/learning/ai-hub')}>
                  Explore Courses
                </Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {enrollments.map((enrollment) => {
                  const course = enrollment.learning_paths;
                  const isComplete = !!enrollment.completed_at;

                  return (
                    <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
                      <div className={`h-2 bg-gradient-to-r ${course.color_gradient}`} />
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg mb-2">{course.title}</CardTitle>
                            <CardDescription className="line-clamp-2">
                              {course.description}
                            </CardDescription>
                          </div>
                          {isComplete && (
                            <Badge className="bg-green-500 shrink-0">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Done
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-semibold">{enrollment.progress_percentage}%</span>
                            </div>
                            <Progress value={enrollment.progress_percentage} />
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{course.duration}</span>
                            </div>
                            <Badge variant="outline">{course.level}</Badge>
                          </div>

                          <Button 
                            className="w-full" 
                            onClick={() => navigate(`/learning/course/${course.id}`)}
                            variant={isComplete ? "outline" : "default"}
                          >
                            {isComplete ? 'Review Course' : 'Continue Learning'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates" className="space-y-4">
            {certificates.length === 0 ? (
              <Card className="p-12 text-center">
                <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No certificates yet</h3>
                <p className="text-muted-foreground">
                  Complete a course to earn your first certificate
                </p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates.map((certificate) => (
                  <Card key={certificate.id} className="overflow-hidden">
                    <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-6 text-center">
                      <Award className="h-16 w-16 mx-auto mb-4 text-yellow-600" />
                      <h3 className="font-bold mb-2">{certificate.learning_paths?.title}</h3>
                      <Badge variant="secondary" className="mb-2">
                        {certificate.certificate_number}
                      </Badge>
                    </div>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 inline mr-2" />
                          Issued {formatDistanceToNow(new Date(certificate.issued_at), { addSuffix: true })}
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleDownloadCertificate(certificate)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-4">
            {achievements.length === 0 ? (
              <Card className="p-12 text-center">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No achievements yet</h3>
                <p className="text-muted-foreground">
                  Complete modules and courses to unlock achievements
                </p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <Card key={achievement.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-full bg-primary/10">
                          <Trophy className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{achievement.achievement_name}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {achievement.achievement_description}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            Earned {formatDistanceToNow(new Date(achievement.earned_at), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LearningDashboard;