import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Trophy, 
  MessageSquare, 
  ThumbsUp, 
  Star,
  Award,
  Target,
  TrendingUp,
  Calendar,
  ArrowLeft,
  UserPlus,
  UserMinus
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const CommunityProfile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [reputation, setReputation] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    setLoading(true);

    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Fetch reputation
    const { data: reputationData } = await supabase
      .from('user_reputation')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Fetch posts
    const { data: postsData } = await supabase
      .from('community_posts')
      .select(`
        *,
        category:community_categories(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch comments
    const { data: commentsData } = await supabase
      .from('community_comments')
      .select(`
        *,
        post:community_posts(title, slug)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Check if following
    if (currentUser && currentUser.id !== userId) {
      const { data: followData } = await supabase
        .from('community_follows')
        .select('id')
        .eq('follower_id', currentUser.id)
        .eq('following_id', userId)
        .maybeSingle();
      
      setIsFollowing(!!followData);
    }

    setProfile(profileData);
    setReputation(reputationData);
    setPosts(postsData || []);
    setComments(commentsData || []);
    setLoading(false);
  };

  const handleFollow = async () => {
    if (!currentUser) {
      toast({ title: "Please sign in to follow users" });
      return;
    }

    if (isFollowing) {
      await supabase
        .from('community_follows')
        .delete()
        .eq('follower_id', currentUser.id)
        .eq('following_id', userId);
      setIsFollowing(false);
      toast({ title: "Unfollowed user" });
    } else {
      await supabase
        .from('community_follows')
        .insert({
          follower_id: currentUser.id,
          following_id: userId
        });
      setIsFollowing(true);
      toast({ title: "Now following user" });
    }
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'contributor': return <Star className="h-4 w-4" />;
      case 'helper': return <ThumbsUp className="h-4 w-4" />;
      case 'expert': return <Award className="h-4 w-4" />;
      case 'rising_star': return <TrendingUp className="h-4 w-4" />;
      default: return <Trophy className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">User not found</h2>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{profile.username} - Community Profile</title>
        <meta name="description" content={`View ${profile.username}'s profile and contributions`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardContent className="pt-6 text-center">
                  <Avatar className="h-32 w-32 mx-auto mb-4 ring-4 ring-primary/20">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="text-4xl">
                      {profile.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h1 className="text-2xl font-bold mb-2">{profile.username}</h1>
                  
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Trophy className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold text-primary">
                      {reputation?.total_score || 0}
                    </span>
                    <span className="text-sm text-muted-foreground">reputation</span>
                  </div>

                  {currentUser && currentUser.id !== userId && (
                    <Button
                      onClick={handleFollow}
                      variant={isFollowing ? "outline" : "default"}
                      className="w-full"
                    >
                      {isFollowing ? (
                        <>
                          <UserMinus className="h-4 w-4 mr-2" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                  )}

                  <div className="flex items-center justify-center gap-1 mt-4 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Member since {new Date(profile.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MessageSquare className="h-4 w-4" />
                      <span>Posts</span>
                    </div>
                    <span className="font-bold">{reputation?.post_count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MessageSquare className="h-4 w-4" />
                      <span>Comments</span>
                    </div>
                    <span className="font-bold">{reputation?.comment_count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Target className="h-4 w-4" />
                      <span>Solutions</span>
                    </div>
                    <span className="font-bold">{reputation?.solution_count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ThumbsUp className="h-4 w-4" />
                      <span>Upvotes Received</span>
                    </div>
                    <span className="font-bold">{reputation?.upvotes_received || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      <span>Streak</span>
                    </div>
                    <span className="font-bold">{reputation?.streak_days || 0} days</span>
                  </div>
                </CardContent>
              </Card>

              {reputation?.badges && reputation.badges.length > 0 && (
                <Card className="bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Badges</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {reputation.badges.map((badge: string) => (
                        <Badge key={badge} variant="secondary" className="gap-1">
                          {getBadgeIcon(badge)}
                          {badge.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Content Area */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="posts">
                    Posts ({posts.length})
                  </TabsTrigger>
                  <TabsTrigger value="comments">
                    Comments ({comments.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="posts" className="space-y-4 mt-6">
                  {posts.length === 0 ? (
                    <Card className="bg-card/50">
                      <CardContent className="py-12 text-center text-muted-foreground">
                        No posts yet
                      </CardContent>
                    </Card>
                  ) : (
                    posts.map(post => (
                      <Card key={post.id} className="bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all">
                        <CardContent className="pt-6">
                          <Link to={`/community/post/${post.slug}`}>
                            <div className="space-y-3">
                              <div className="flex items-start gap-3">
                                <Badge style={{ backgroundColor: post.category?.color }}>
                                  {post.category?.name}
                                </Badge>
                              </div>
                              <h3 className="text-xl font-semibold hover:text-primary transition-colors">
                                {post.title}
                              </h3>
                              <p className="text-muted-foreground line-clamp-2">
                                {post.excerpt}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <ThumbsUp className="h-4 w-4" />
                                  {post.vote_score}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageSquare className="h-4 w-4" />
                                  {post.comment_count}
                                </div>
                                <span>
                                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                          </Link>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="comments" className="space-y-4 mt-6">
                  {comments.length === 0 ? (
                    <Card className="bg-card/50">
                      <CardContent className="py-12 text-center text-muted-foreground">
                        No comments yet
                      </CardContent>
                    </Card>
                  ) : (
                    comments.map(comment => (
                      <Card key={comment.id} className="bg-card/80 backdrop-blur-sm">
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="text-sm text-muted-foreground">
                              Commented on{' '}
                              <Link
                                to={`/community/post/${comment.post?.slug}`}
                                className="text-primary hover:underline font-medium"
                              >
                                {comment.post?.title}
                              </Link>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="h-4 w-4" />
                                {comment.vote_score}
                              </div>
                              <span>
                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CommunityProfile;
