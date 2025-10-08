import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowUp, 
  ArrowDown, 
  MessageSquare, 
  Bookmark, 
  Share2,
  Eye,
  Clock,
  ArrowLeft,
  Send,
  CheckCircle2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  vote_score: number;
  upvote_count: number;
  downvote_count: number;
  is_solution: boolean;
  parent_id: string | null;
  profiles?: {
    username?: string;
    avatar_url?: string;
  };
  user_vote?: number;
  replies?: Comment[];
}

const CommunityPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [userVote, setUserVote] = useState<number | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPost();
      fetchComments();
      if (user) {
        checkUserVote();
        checkBookmark();
      }
    }
  }, [slug, user]);

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from('community_posts')
      .select(`
        *,
        category:community_categories(*),
        profiles:profiles(username, avatar_url)
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      toast({ title: "Error loading post", variant: "destructive" });
      navigate('/community');
    } else {
      setPost(data);
      incrementViewCount(data.id);
    }
    setLoading(false);
  };

  const incrementViewCount = async (postId: string) => {
    await supabase
      .from('community_posts')
      .update({ view_count: (post?.view_count || 0) + 1 })
      .eq('id', postId);
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('community_comments')
      .select(`
        *,
        profiles:profiles(username, avatar_url)
      `)
      .eq('post_id', post?.id)
      .order('created_at', { ascending: true });

    if (!error && data) {
      const organizedComments = organizeComments(data);
      setComments(organizedComments);
    }
  };

  const organizeComments = (flatComments: any[]): Comment[] => {
    const commentMap: { [key: string]: Comment } = {};
    const rootComments: Comment[] = [];

    flatComments.forEach(comment => {
      commentMap[comment.id] = { ...comment, replies: [] };
    });

    flatComments.forEach(comment => {
      if (comment.parent_id) {
        const parent = commentMap[comment.parent_id];
        if (parent) {
          parent.replies!.push(commentMap[comment.id]);
        }
      } else {
        rootComments.push(commentMap[comment.id]);
      }
    });

    return rootComments;
  };

  const checkUserVote = async () => {
    const { data } = await supabase
      .from('community_votes')
      .select('vote_type')
      .eq('post_id', post?.id)
      .eq('user_id', user?.id)
      .maybeSingle();

    if (data) setUserVote(data.vote_type);
  };

  const checkBookmark = async () => {
    const { data } = await supabase
      .from('community_bookmarks')
      .select('id')
      .eq('post_id', post?.id)
      .eq('user_id', user?.id)
      .maybeSingle();

    setIsBookmarked(!!data);
  };

  const handleVote = async (voteType: number) => {
    if (!user) {
      toast({ title: "Please sign in to vote" });
      navigate('/auth');
      return;
    }

    const sameVote = userVote === voteType;
    const newVoteType = sameVote ? null : voteType;

    if (userVote !== null) {
      await supabase
        .from('community_votes')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', user.id);
    }

    if (!sameVote) {
      await supabase
        .from('community_votes')
        .insert({
          post_id: post.id,
          user_id: user.id,
          vote_type: voteType
        });
    }

    setUserVote(newVoteType);
    fetchPost();
  };

  const handleBookmark = async () => {
    if (!user) {
      toast({ title: "Please sign in to bookmark" });
      navigate('/auth');
      return;
    }

    if (isBookmarked) {
      await supabase
        .from('community_bookmarks')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', user.id);
      setIsBookmarked(false);
      toast({ title: "Bookmark removed" });
    } else {
      await supabase
        .from('community_bookmarks')
        .insert({
          post_id: post.id,
          user_id: user.id
        });
      setIsBookmarked(true);
      toast({ title: "Post bookmarked" });
    }
  };

  const handleSubmitComment = async () => {
    if (!user) {
      toast({ title: "Please sign in to comment" });
      navigate('/auth');
      return;
    }

    if (!newComment.trim()) return;

    const { error } = await supabase
      .from('community_comments')
      .insert({
        post_id: post.id,
        user_id: user.id,
        content: newComment,
        parent_id: replyTo
      });

    if (error) {
      toast({ title: "Error posting comment", variant: "destructive" });
    } else {
      setNewComment('');
      setReplyTo(null);
      fetchComments();
      toast({ title: "Comment posted!" });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied to clipboard!" });
  };

  const CommentItem = ({ comment, depth = 0 }: { comment: Comment; depth?: number }) => (
    <div className={`${depth > 0 ? 'ml-8 mt-4' : 'mt-6'}`}>
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:text-primary"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <span className="text-sm font-semibold">{comment.vote_score}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:text-destructive"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.profiles?.avatar_url} />
                  <AvatarFallback>
                    {comment.profiles?.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {comment.profiles?.username || 'Anonymous'}
                  </span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                  {comment.is_solution && (
                    <>
                      <span>•</span>
                      <Badge variant="default" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Solution
                      </Badge>
                    </>
                  )}
                </div>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
                {comment.content}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyTo(comment.id)}
                className="h-8"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Reply
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {comment.replies?.map(reply => (
        <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <>
      <Helmet>
        <title>{post.title} - Community</title>
        <meta name="description" content={post.excerpt} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Button
            variant="ghost"
            onClick={() => navigate('/community')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Community
          </Button>

          <Card className="mb-6 bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      style={{ backgroundColor: post.category?.color }}
                      className="text-white"
                    >
                      {post.category?.name}
                    </Badge>
                    {post.tags?.map((tag: string) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                    {post.is_pinned && (
                      <Badge variant="default">Pinned</Badge>
                    )}
                  </div>
                  
                  <h1 className="text-4xl font-bold tracking-tight">{post.title}</h1>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={post.profiles?.avatar_url} />
                        <AvatarFallback>
                          {post.profiles?.username?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {post.profiles?.username || 'Anonymous'}
                      </span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {post.view_count} views
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 bg-muted/50 rounded-lg p-3">
                  <Button
                    variant={userVote === 1 ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleVote(1)}
                    className="h-10 w-10 p-0"
                  >
                    <ArrowUp className="h-5 w-5" />
                  </Button>
                  <span className="text-lg font-bold">{post.vote_score}</span>
                  <Button
                    variant={userVote === -1 ? "destructive" : "ghost"}
                    size="sm"
                    onClick={() => handleVote(-1)}
                    className="h-10 w-10 p-0"
                  >
                    <ArrowDown className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                {post.content}
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={handleBookmark}>
                  <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                  {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <div className="ml-auto flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {post.comment_count} comments
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <h2 className="text-2xl font-bold">
                {post.comment_count} Comments
              </h2>
            </CardHeader>
            <CardContent>
              {user ? (
                <div className="mb-8">
                  <Textarea
                    placeholder={replyTo ? "Write your reply..." : "Add a comment..."}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[120px] mb-3"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSubmitComment}>
                      <Send className="h-4 w-4 mr-2" />
                      {replyTo ? 'Post Reply' : 'Post Comment'}
                    </Button>
                    {replyTo && (
                      <Button variant="outline" onClick={() => setReplyTo(null)}>
                        Cancel Reply
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <Card className="mb-8 bg-muted/50">
                  <CardContent className="pt-6 text-center">
                    <p className="mb-4">Please sign in to comment</p>
                    <Button onClick={() => navigate('/auth')}>
                      Sign In
                    </Button>
                  </CardContent>
                </Card>
              )}

              {comments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                comments.map(comment => (
                  <CommentItem key={comment.id} comment={comment} />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CommunityPost;
