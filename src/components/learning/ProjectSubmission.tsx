import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, ExternalLink, Github, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ProjectSubmissionProps {
  moduleId: string;
}

interface Submission {
  id: string;
  title: string;
  description: string;
  code_content: string;
  demo_url: string | null;
  github_url: string | null;
  status: string;
  submitted_at: string;
}

export const ProjectSubmission: React.FC<ProjectSubmissionProps> = ({ moduleId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    code_content: "",
    demo_url: "",
    github_url: ""
  });

  useEffect(() => {
    if (user) {
      loadSubmissions();
    }
  }, [user, moduleId]);

  const loadSubmissions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('project_submissions')
        .select('*')
        .eq('module_id', moduleId)
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('project_submissions')
        .insert({
          user_id: user.id,
          module_id: moduleId,
          ...formData
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your project has been submitted for review",
      });

      setIsOpen(false);
      setFormData({
        title: "",
        description: "",
        code_content: "",
        demo_url: "",
        github_url: ""
      });
      loadSubmissions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const statusIcons = {
    pending: <Clock className="h-4 w-4" />,
    approved: <CheckCircle2 className="h-4 w-4" />,
    needs_improvement: <AlertCircle className="h-4 w-4" />
  };

  const statusColors = {
    pending: "bg-yellow-500",
    approved: "bg-green-500",
    needs_improvement: "bg-orange-500"
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Project Submissions</CardTitle>
              <CardDescription>
                Share your work and get feedback from the community
              </CardDescription>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button disabled={!user}>
                  <Upload className="h-4 w-4 mr-2" />
                  Submit Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Submit Your Project</DialogTitle>
                  <DialogDescription>
                    Share your completed project to get feedback from peers
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Project Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="My AI Chatbot"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Describe what your project does..."
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="code">Code</Label>
                    <Textarea
                      id="code"
                      value={formData.code_content}
                      onChange={(e) => setFormData({...formData, code_content: e.target.value})}
                      placeholder="Paste your code here..."
                      rows={6}
                      className="font-mono text-sm"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="demo">Demo URL (optional)</Label>
                    <Input
                      id="demo"
                      type="url"
                      value={formData.demo_url}
                      onChange={(e) => setFormData({...formData, demo_url: e.target.value})}
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="github">GitHub URL (optional)</Label>
                    <Input
                      id="github"
                      type="url"
                      value={formData.github_url}
                      onChange={(e) => setFormData({...formData, github_url: e.target.value})}
                      placeholder="https://github.com/..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? "Submitting..." : "Submit Project"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {submissions.length === 0 ? (
            <div className="text-center py-8">
              <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">No submissions yet</p>
              {!user && (
                <p className="text-sm text-muted-foreground mt-2">
                  Sign in to submit your projects
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <Card key={submission.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold mb-1">{submission.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {submission.description}
                        </p>
                      </div>
                      <Badge className={statusColors[submission.status as keyof typeof statusColors]}>
                        {statusIcons[submission.status as keyof typeof statusIcons]}
                        <span className="ml-1 capitalize">{submission.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      {submission.demo_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={submission.demo_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Demo
                          </a>
                        </Button>
                      )}
                      {submission.github_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={submission.github_url} target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4 mr-1" />
                            GitHub
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
