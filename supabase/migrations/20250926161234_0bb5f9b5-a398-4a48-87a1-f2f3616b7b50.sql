-- Community Feature Database Schema

-- Create enums for community system
CREATE TYPE post_type AS ENUM ('discussion', 'question', 'tutorial', 'showcase', 'announcement');
CREATE TYPE post_status AS ENUM ('draft', 'published', 'archived', 'featured');
CREATE TYPE user_badge AS ENUM ('contributor', 'expert', 'mentor', 'moderator', 'pioneer', 'helpful', 'solver', 'teacher');
CREATE TYPE notification_type AS ENUM ('mention', 'reply', 'vote', 'achievement', 'follow', 'post_featured');

-- Community categories table
CREATE TABLE community_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  slug VARCHAR(100) NOT NULL UNIQUE,
  color VARCHAR(7) NOT NULL DEFAULT '#6366f1',
  icon VARCHAR(50) DEFAULT 'Hash',
  post_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Community posts table
CREATE TABLE community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category_id UUID NOT NULL REFERENCES community_categories(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  slug VARCHAR(300) NOT NULL,
  post_type post_type NOT NULL DEFAULT 'discussion',
  status post_status NOT NULL DEFAULT 'published',
  view_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  vote_score INTEGER DEFAULT 0,
  upvote_count INTEGER DEFAULT 0,
  downvote_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(slug, created_at)
);

-- Community comments table
CREATE TABLE community_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  vote_score INTEGER DEFAULT 0,
  upvote_count INTEGER DEFAULT 0,
  downvote_count INTEGER DEFAULT 0,
  is_solution BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User votes table for posts and comments
CREATE TABLE community_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  vote_type INTEGER NOT NULL CHECK (vote_type IN (-1, 1)), -- -1 for downvote, 1 for upvote
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id),
  CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL))
);

-- User reputation and badges
CREATE TABLE user_reputation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_score INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  solution_count INTEGER DEFAULT 0,
  upvotes_received INTEGER DEFAULT 0,
  downvotes_received INTEGER DEFAULT 0,
  badges user_badge[] DEFAULT '{}',
  achievements JSONB DEFAULT '{}',
  streak_days INTEGER DEFAULT 0,
  last_active_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User follows/followers
CREATE TABLE community_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Community bookmarks
CREATE TABLE community_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Notifications table
CREATE TABLE community_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  actor_id UUID,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE community_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_categories
CREATE POLICY "Categories are viewable by everyone" ON community_categories FOR SELECT USING (true);

-- RLS Policies for community_posts
CREATE POLICY "Posts are viewable by everyone" ON community_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Users can create posts" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON community_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON community_posts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for community_comments
CREATE POLICY "Comments are viewable by everyone" ON community_comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON community_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON community_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON community_comments FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for community_votes
CREATE POLICY "Users can view all votes" ON community_votes FOR SELECT USING (true);
CREATE POLICY "Users can create their own votes" ON community_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own votes" ON community_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own votes" ON community_votes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_reputation
CREATE POLICY "Reputation is viewable by everyone" ON user_reputation FOR SELECT USING (true);
CREATE POLICY "Users can update their own reputation" ON user_reputation FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for community_follows
CREATE POLICY "Follows are viewable by everyone" ON community_follows FOR SELECT USING (true);
CREATE POLICY "Users can manage their own follows" ON community_follows FOR ALL USING (auth.uid() = follower_id);

-- RLS Policies for community_bookmarks
CREATE POLICY "Users can view their own bookmarks" ON community_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own bookmarks" ON community_bookmarks FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for community_notifications
CREATE POLICY "Users can view their own notifications" ON community_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON community_notifications FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_community_posts_category ON community_posts(category_id);
CREATE INDEX idx_community_posts_user ON community_posts(user_id);
CREATE INDEX idx_community_posts_status ON community_posts(status);
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX idx_community_comments_post ON community_comments(post_id);
CREATE INDEX idx_community_comments_user ON community_comments(user_id);
CREATE INDEX idx_community_votes_post ON community_votes(post_id);
CREATE INDEX idx_community_votes_comment ON community_votes(comment_id);
CREATE INDEX idx_community_notifications_user ON community_notifications(user_id);

-- Insert default categories
INSERT INTO community_categories (name, description, slug, color, icon) VALUES
('General Discussion', 'General discussion about AI tokens and optimization', 'general', '#6366f1', 'MessageSquare'),
('Token Calculator', 'Questions and discussions about token calculations', 'token-calculator', '#3b82f6', 'Calculator'),
('Speed Optimization', 'Performance and speed optimization discussions', 'speed-optimization', '#8b5cf6', 'Zap'),
('Memory Management', 'Memory usage and optimization strategies', 'memory-management', '#f59e0b', 'HardDrive'),
('Energy Efficiency', 'Environmental impact and energy discussions', 'energy-efficiency', '#10b981', 'Leaf'),
('AI Models', 'Discussion about different AI models and comparisons', 'ai-models', '#ef4444', 'Brain'),
('Developer Tools', 'Tools, APIs, and integrations', 'developer-tools', '#06b6d4', 'Code'),
('Showcase', 'Show off your projects and implementations', 'showcase', '#f97316', 'Trophy'),
('Help & Support', 'Get help with technical issues', 'help-support', '#84cc16', 'HelpCircle');

-- Functions for updating counts and reputation
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts 
    SET comment_count = comment_count + 1 
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts 
    SET comment_count = comment_count - 1 
    WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_category_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_categories 
    SET post_count = post_count + 1 
    WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_categories 
    SET post_count = post_count - 1 
    WHERE id = OLD.category_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.post_id IS NOT NULL THEN
      UPDATE community_posts SET 
        upvote_count = upvote_count + CASE WHEN NEW.vote_type = 1 THEN 1 ELSE 0 END,
        downvote_count = downvote_count + CASE WHEN NEW.vote_type = -1 THEN 1 ELSE 0 END,
        vote_score = vote_score + NEW.vote_type
      WHERE id = NEW.post_id;
    END IF;
    
    IF NEW.comment_id IS NOT NULL THEN
      UPDATE community_comments SET 
        upvote_count = upvote_count + CASE WHEN NEW.vote_type = 1 THEN 1 ELSE 0 END,
        downvote_count = downvote_count + CASE WHEN NEW.vote_type = -1 THEN 1 ELSE 0 END,
        vote_score = vote_score + NEW.vote_type
      WHERE id = NEW.comment_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.post_id IS NOT NULL THEN
      UPDATE community_posts SET 
        upvote_count = upvote_count - CASE WHEN OLD.vote_type = 1 THEN 1 ELSE 0 END,
        downvote_count = downvote_count - CASE WHEN OLD.vote_type = -1 THEN 1 ELSE 0 END,
        vote_score = vote_score - OLD.vote_type
      WHERE id = OLD.post_id;
    END IF;
    
    IF OLD.comment_id IS NOT NULL THEN
      UPDATE community_comments SET 
        upvote_count = upvote_count - CASE WHEN OLD.vote_type = 1 THEN 1 ELSE 0 END,
        downvote_count = downvote_count - CASE WHEN OLD.vote_type = -1 THEN 1 ELSE 0 END,
        vote_score = vote_score - OLD.vote_type
      WHERE id = OLD.comment_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER update_comment_count_trigger
  AFTER INSERT OR DELETE ON community_comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();

CREATE TRIGGER update_post_count_trigger
  AFTER INSERT OR DELETE ON community_posts
  FOR EACH ROW EXECUTE FUNCTION update_category_post_count();

CREATE TRIGGER update_vote_count_trigger
  AFTER INSERT OR DELETE ON community_votes
  FOR EACH ROW EXECUTE FUNCTION update_vote_counts();