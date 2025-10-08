import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, X, Sparkles, HelpCircle, MessageSquare, Lightbulb } from 'lucide-react';

const CreateCommunityPost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category_id: '',
    post_type: 'discussion',
    tags: [] as string[]
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (!user) {
      toast({ title: "Please sign in to create a post" });
      navigate('/auth');
      return;
    }
    fetchCategories();
  }, [user]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('community_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (!error && data) {
      setCategories(data);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim()) && formData.tags.length < 5) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim() || !formData.category_id) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setLoading(true);

    const slug = generateSlug(formData.title);
    const excerpt = formData.content.substring(0, 200) + (formData.content.length > 200 ? '...' : '');

    const { data, error } = await supabase
      .from('community_posts')
      .insert([{
        title: formData.title,
        content: formData.content,
        excerpt,
        slug,
        category_id: formData.category_id,
        post_type: formData.post_type as 'discussion' | 'question' | 'showcase' | 'announcement' | 'tutorial',
        tags: formData.tags,
        user_id: user?.id,
        status: 'published' as 'draft' | 'published' | 'archived'
      }])
      .select()
      .single();

    setLoading(false);

    if (error) {
      toast({ title: "Error creating post", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Post created successfully!", description: "Your post is now live" });
      navigate(`/community/post/${slug}`);
    }
  };

  const postTypes = [
    { value: 'discussion', label: 'Discussion', icon: MessageSquare, description: 'Start a conversation' },
    { value: 'question', label: 'Question', icon: HelpCircle, description: 'Ask for help' },
    { value: 'showcase', label: 'Showcase', icon: Sparkles, description: 'Share your work' },
    { value: 'tip', label: 'Tip', icon: Lightbulb, description: 'Share knowledge' }
  ];

  return (
    <>
      <Helmet>
        <title>Create Post - Community</title>
        <meta name="description" content="Share your thoughts with the community" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate('/community')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Community
          </Button>

          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-3xl">Create a Post</CardTitle>
              <CardDescription>
                Share your thoughts, ask questions, or showcase your work with the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="post-type">Post Type</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {postTypes.map(type => {
                      const Icon = type.icon;
                      return (
                        <Card
                          key={type.value}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            formData.post_type === type.value
                              ? 'ring-2 ring-primary bg-primary/5'
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, post_type: type.value }))}
                        >
                          <CardContent className="p-4 text-center">
                            <Icon className="h-6 w-6 mx-auto mb-2" />
                            <div className="font-medium text-sm">{type.label}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {type.description}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="What's on your mind?"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    maxLength={200}
                    required
                  />
                  <div className="text-xs text-muted-foreground text-right">
                    {formData.title.length}/200
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    placeholder="Share your thoughts in detail..."
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="min-h-[300px]"
                    required
                  />
                  <div className="text-xs text-muted-foreground text-right">
                    {formData.content.length} characters
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (Press Enter to add)</Label>
                  <Input
                    id="tags"
                    placeholder="Add up to 5 tags..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    disabled={formData.tags.length >= 5}
                  />
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                            onClick={() => handleRemoveTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {formData.tags.length}/5 tags
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Publish Post
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/community')}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CreateCommunityPost;
