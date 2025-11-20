import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, ThumbsUp, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface DiscussionForumProps {
  learningPathId: string;
  moduleId?: string;
}

const DiscussionForum: React.FC<DiscussionForumProps> = ({ learningPathId, moduleId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDiscussionTitle, setNewDiscussionTitle] = useState("");
  const [newDiscussionContent, setNewDiscussionContent] = useState("");
  const [replyContent, setReplyContent] = useState<{[key: string]: string}>({});
  const [showReplyBox, setShowReplyBox] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    loadDiscussions();
  }, [learningPathId, moduleId]);

  const loadDiscussions = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('learning_discussions')
        .select(`
          *,
          profiles:user_id (username),
          discussion_replies (
            *,
            profiles:user_id (username)
          )
        `)
        .eq('learning_path_id', learningPathId)
        .order('created_at', { ascending: false });

      if (moduleId) {
        query = query.eq('module_id', moduleId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setDiscussions(data || []);
    } catch (error: any) {
      console.error('Error loading discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscussion = async () => {
    if (!user || !newDiscussionTitle.trim() || !newDiscussionContent.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both title and content",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('learning_discussions')
        .insert({
          user_id: user.id,
          learning_path_id: learningPathId,
          module_id: moduleId || null,
          title: newDiscussionTitle,
          content: newDiscussionContent
        });

      if (error) throw error;

      toast({
        title: "Discussion Created",
        description: "Your question has been posted"
      });

      setNewDiscussionTitle("");
      setNewDiscussionContent("");
      loadDiscussions();
    } catch (error: any) {
      console.error('Error creating discussion:', error);
      toast({
        title: "Error",
        description: "Failed to create discussion",
        variant: "destructive"
      });
    }
  };

  const handleReply = async (discussionId: string) => {
    if (!user || !replyContent[discussionId]?.trim()) return;

    try {
      const { error } = await supabase
        .from('discussion_replies')
        .insert({
          discussion_id: discussionId,
          user_id: user.id,
          content: replyContent[discussionId]
        });

      if (error) throw error;

      toast({
        title: "Reply Posted",
        description: "Your reply has been added"
      });

      setReplyContent({ ...replyContent, [discussionId]: "" });
      setShowReplyBox({ ...showReplyBox, [discussionId]: false });
      loadDiscussions();
    } catch (error: any) {
      console.error('Error posting reply:', error);
    }
  };

  const handleUpvote = async (discussionId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upvote discussions",
        variant: "destructive"
      });
      return;
    }

    try {
      const discussion = discussions.find(d => d.id === discussionId);
      await supabase
        .from('learning_discussions')
        .update({ upvotes: (discussion?.upvotes || 0) + 1 })
        .eq('id', discussionId);

      loadDiscussions();
    } catch (error: any) {
      console.error('Error upvoting:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create New Discussion */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Start a Discussion</CardTitle>
            <CardDescription>Ask questions or share insights with fellow learners</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Discussion title..."
              value={newDiscussionTitle}
              onChange={(e) => setNewDiscussionTitle(e.target.value)}
            />
            <Textarea
              placeholder="What would you like to discuss?"
              value={newDiscussionContent}
              onChange={(e) => setNewDiscussionContent(e.target.value)}
              rows={4}
            />
            <Button onClick={handleCreateDiscussion}>
              <Send className="h-4 w-4 mr-2" />
              Post Discussion
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Discussions List */}
      <div className="space-y-4">
        {discussions.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No discussions yet. Be the first to start one!</p>
          </Card>
        ) : (
          discussions.map((discussion) => (
            <Card key={discussion.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{discussion.title}</CardTitle>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>
                            {discussion.profiles?.username?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span>{discussion.profiles?.username || 'Anonymous'}</span>
                      </div>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUpvote(discussion.id)}
                    className="flex items-center gap-1"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>{discussion.upvotes || 0}</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{discussion.content}</p>

                {/* Replies */}
                {discussion.discussion_replies && discussion.discussion_replies.length > 0 && (
                  <div className="space-y-3 pl-6 border-l-2 border-muted">
                    {discussion.discussion_replies.map((reply: any) => (
                      <div key={reply.id} className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-xs">
                              {reply.profiles?.username?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{reply.profiles?.username || 'Anonymous'}</span>
                          {reply.is_instructor && (
                            <Badge variant="secondary" className="text-xs">Instructor</Badge>
                          )}
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">
                            {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Box */}
                {user && (
                  <>
                    {!showReplyBox[discussion.id] ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowReplyBox({ ...showReplyBox, [discussion.id]: true })}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Reply
                      </Button>
                    ) : (
                      <div className="space-y-2 pl-6 border-l-2 border-primary">
                        <Textarea
                          placeholder="Write your reply..."
                          value={replyContent[discussion.id] || ""}
                          onChange={(e) => setReplyContent({ ...replyContent, [discussion.id]: e.target.value })}
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleReply(discussion.id)}>
                            Post Reply
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowReplyBox({ ...showReplyBox, [discussion.id]: false })}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default DiscussionForum;