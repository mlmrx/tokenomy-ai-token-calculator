import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  Search, 
  Plus, 
  ArrowUp, 
  Eye, 
  Star,
  Users,
  Trophy,
  Sparkles
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  color: string;
  icon: string;
  post_count: number;
}

interface Post {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  post_type: string;
  view_count: number;
  comment_count: number;
  vote_score: number;
  upvote_count: number;
  is_pinned: boolean;
  tags: string[];
  created_at: string;
  user_id: string;
  category: Category;
  profiles?: {
    username?: string;
    avatar_url?: string;
  } | null;
}

const Community = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, [selectedCategory, sortBy, searchQuery]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('community_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(data || []);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    let query = supabase
      .from('community_posts')
      .select(`
        *,
        category:community_categories(*)
      `)
      .eq('status', 'published');

    if (selectedCategory && selectedCategory !== 'all') {
      query = query.eq('category.slug', selectedCategory);
    }

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
    }

    // Sorting
    switch (sortBy) {
      case 'popular':
        query = query.order('vote_score', { ascending: false });
        break;
      case 'discussed':
        query = query.order('comment_count', { ascending: false });
        break;
      case 'views':
        query = query.order('view_count', { ascending: false });
        break;
      default: // newest
        query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query.limit(20);

    if (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load community posts",
        variant: "destructive"
      });
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    updateSearchParams('search', query);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    updateSearchParams('category', category);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    updateSearchParams('sort', sort);
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'question': return '?';
      case 'tutorial': return '📚';
      case 'showcase': return '🎉';
      case 'announcement': return '📢';
      default: return '💬';
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'question': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'tutorial': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'showcase': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'announcement': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <>
      <Helmet>
        <title>Tokenomy Community - AI Token Optimization Discussion & Support</title>
        <meta name="description" content="Join the Tokenomy community to discuss AI token optimization, share insights, ask questions, and connect with other developers working on token efficiency." />
        <meta name="keywords" content="AI community, token optimization, machine learning, GPT tokens, AI development, community forum" />
        <link rel="canonical" href="https://tokenomy.app/community" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-12 md:py-16">
          <div className="absolute inset-0 animated-gradient -z-20"></div>
          <div className="absolute inset-0 glass-hero -z-10"></div>
          
          <div className="container px-4 md:px-6 mx-auto relative z-10">
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Users className="h-8 w-8 text-primary" />
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600">
                  Tokenomy Community
                </h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Connect with AI developers, share insights, and optimize token usage together
              </p>
              
              {user ? (
                <Link to="/community/new-post">
                  <Button size="lg" className="glass-button bg-white/20 text-gray-800 dark:text-white border-0">
                    <Plus className="mr-2 h-4 w-4" />
                    Start Discussion
                  </Button>
                </Link>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button size="lg" className="glass-button bg-white/20 text-gray-800 dark:text-white border-0" asChild>
                    <Link to="/auth">Join Community</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="glass-button border-white/30">
                    Browse Discussions
                  </Button>
                </div>
              )}

              {/* Community Stats */}
              <div className="glass-card p-6 max-w-3xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">2.5K+</div>
                    <div className="text-sm text-muted-foreground">Members</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">850+</div>
                    <div className="text-sm text-muted-foreground">Discussions</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">3.2K+</div>
                    <div className="text-sm text-muted-foreground">Solutions</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">98%</div>
                    <div className="text-sm text-muted-foreground">Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container px-4 md:px-6 mx-auto py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Categories */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <button
                      onClick={() => handleCategoryChange('all')}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === 'all' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-muted'
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryChange(category.slug)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === category.slug 
                            ? 'bg-primary text-primary-foreground' 
                            : 'hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{category.name}</span>
                          <Badge variant="secondary">{category.post_count}</Badge>
                        </div>
                      </button>
                    ))}
                  </CardContent>
                </Card>

                {/* Top Contributors */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      Top Contributors
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[1, 2, 3].map((rank) => (
                      <div key={rank} className="flex items-center gap-3">
                        <Badge variant={rank === 1 ? "default" : "secondary"}>
                          #{rank}
                        </Badge>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>U{rank}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium">User {rank}</div>
                          <div className="text-sm text-muted-foreground">{1000 - rank * 100} points</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Filters and Search */}
              <div className="glass-card p-6 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search discussions..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="discussed">Most Discussed</SelectItem>
                      <SelectItem value="views">Most Viewed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Posts List */}
              <div className="space-y-4">
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="glass-card">
                        <CardContent className="p-6">
                          <div className="animate-pulse">
                            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-muted rounded w-1/2"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : posts.length === 0 ? (
                  <Card className="glass-card">
                    <CardContent className="p-12 text-center">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No discussions found</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchQuery || selectedCategory !== 'all' 
                          ? 'Try adjusting your search or filters'
                          : 'Be the first to start a discussion!'
                        }
                      </p>
                      {user && (
                        <Link to="/community/new-post">
                          <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Start Discussion
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  posts.map((post) => (
                    <Card key={post.id} className="glass-card hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center gap-1 text-center min-w-[60px]">
                            <button className="p-2 hover:bg-muted rounded-full transition-colors">
                              <ArrowUp className="h-4 w-4" />
                            </button>
                            <span className="font-medium text-sm">{post.vote_score}</span>
                            <div className="text-xs text-muted-foreground">votes</div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={getPostTypeColor(post.post_type)}>
                                  {getPostTypeIcon(post.post_type)} {post.post_type}
                                </Badge>
                                {post.is_pinned && (
                                  <Badge variant="outline">
                                    📌 Pinned
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <Link 
                              to={`/community/post/${post.slug}`}
                              className="block hover:text-primary transition-colors"
                            >
                              <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                            </Link>
                            
                            {post.excerpt && (
                              <p className="text-muted-foreground mb-3 line-clamp-2">{post.excerpt}</p>
                            )}
                            
                            {post.tags && post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {post.tags.slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="h-4 w-4" />
                                  {post.comment_count} replies
                                </span>
                                <span className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  {post.view_count} views
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={post.profiles?.avatar_url} />
                                  <AvatarFallback>
                                    {post.profiles?.username?.[0]?.toUpperCase() || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{post.profiles?.username || 'User'}</span>
                                <span>•</span>
                                <span>{formatDistanceToNow(new Date(post.created_at))} ago</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Community;