import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star, MessageSquare, ThumbsUp, ExternalLink, Github, Code2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface PeerReviewProps {
  moduleId: string;
}

interface Submission {
  id: string;
  user_id: string;
  title: string;
  description: string;
  code_content: string;
  demo_url: string | null;
  github_url: string | null;
  submitted_at: string;
  profiles: {
    username: string;
  };
}

interface Review {
  id: string;
  reviewer_id: string;
  rating: number;
  feedback: string;
  helpful_count: number;
  created_at: string;
  profiles: {
    username: string;
  };
}

export const PeerReview: React.FC<PeerReviewProps> = ({ moduleId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSubmissions();
  }, [moduleId]);

  const loadSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('project_submissions')
        .select(`
          *,
          profiles(username)
        `)
        .eq('module_id', moduleId)
        .eq('status', 'approved')
        .order('submitted_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
  };

  const loadReviews = async (submissionId: string) => {
    try {
      const { data, error } = await supabase
        .from('peer_reviews')
        .select(`
          *,
          profiles(username)
        `)
        .eq('submission_id', submissionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !selectedSubmission) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('peer_reviews')
        .insert({
          submission_id: selectedSubmission.id,
          reviewer_id: user.id,
          rating,
          feedback
        });

      if (error) throw error;

      toast({
        title: "Review submitted!",
        description: "Thank you for helping your peers learn",
      });

      setFeedback("");
      setRating(5);
      loadReviews(selectedSubmission.id);
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

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Community Projects</CardTitle>
          <CardDescription>
            Review and learn from projects submitted by other learners
          </CardDescription>
        </CardHeader>

        <CardContent>
          {submissions.length === 0 ? (
            <div className="text-center py-8">
              <Code2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">No projects available yet</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {submissions.map((submission) => (
                <Card key={submission.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{submission.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {submission.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>
                          {submission.profiles?.username?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span>{submission.profiles?.username || 'Anonymous'}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(submission.submitted_at), { addSuffix: true })}</span>
                    </div>

                    <div className="flex gap-2 mb-3">
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
                            Code
                          </a>
                        </Button>
                      )}
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            setSelectedSubmission(submission);
                            loadReviews(submission.id);
                          }}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          View & Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{submission.title}</DialogTitle>
                          <DialogDescription>{submission.description}</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                          <div>
                            <h4 className="font-semibold mb-2">Code</h4>
                            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                              <code>{submission.code_content}</code>
                            </pre>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-3">Reviews ({reviews.length})</h4>
                            <div className="space-y-3">
                              {reviews.map((review) => (
                                <Card key={review.id}>
                                  <CardContent className="pt-4">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                          <AvatarFallback>
                                            {review.profiles?.username?.[0]?.toUpperCase() || 'U'}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <p className="font-medium text-sm">
                                            {review.profiles?.username || 'Anonymous'}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                          <Star
                                            key={i}
                                            className={`h-4 w-4 ${
                                              i < review.rating
                                                ? 'fill-yellow-500 text-yellow-500'
                                                : 'text-muted-foreground'
                                            }`}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                    <p className="text-sm">{review.feedback}</p>
                                    <Button variant="ghost" size="sm" className="mt-2">
                                      <ThumbsUp className="h-4 w-4 mr-1" />
                                      Helpful ({review.helpful_count})
                                    </Button>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>

                          {user && user.id !== submission.user_id && (
                            <div>
                              <h4 className="font-semibold mb-3">Add Your Review</h4>
                              <div className="space-y-3">
                                <div>
                                  <label className="text-sm font-medium mb-2 block">Rating</label>
                                  <div className="flex gap-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <button
                                        key={i}
                                        type="button"
                                        onClick={() => setRating(i + 1)}
                                        className="focus:outline-none"
                                      >
                                        <Star
                                          className={`h-6 w-6 cursor-pointer transition-colors ${
                                            i < rating
                                              ? 'fill-yellow-500 text-yellow-500'
                                              : 'text-muted-foreground hover:text-yellow-500'
                                          }`}
                                        />
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <Textarea
                                  value={feedback}
                                  onChange={(e) => setFeedback(e.target.value)}
                                  placeholder="Share your thoughts on this project..."
                                  rows={3}
                                />

                                <Button 
                                  onClick={handleSubmitReview} 
                                  disabled={loading || !feedback}
                                >
                                  {loading ? "Submitting..." : "Submit Review"}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
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
