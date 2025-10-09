import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  ArrowRight, 
  Sparkles,
  Brain,
  Trophy,
  HelpCircle
} from 'lucide-react';

interface CommunityPreviewProps {
  className?: string;
}

const CommunityPreview: React.FC<CommunityPreviewProps> = ({ className }) => {
  const featuredDiscussions = [
    {
      id: 1,
      title: "Best practices for GPT-4 token optimization",
      category: "Tips & Tricks",
      replies: 24,
      author: "TokenPro",
      timeAgo: "2 hours ago",
      isHot: true
    },
    {
      id: 2,
      title: "How to reduce costs by 40% with smart prompting",
      category: "Cost Optimization",
      replies: 18,
      author: "AIOptimizer",
      timeAgo: "4 hours ago",
      isHot: true
    },
    {
      id: 3,
      title: "Memory calculator gave wrong estimates - help?",
      category: "Support",
      replies: 12,
      author: "DevCoder",
      timeAgo: "1 day ago",
      isHot: false
    }
  ];

  return (
    <section className={`py-12 md:py-16 relative ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-purple-50/40 to-blue-50/80 dark:from-indigo-950/80 dark:via-purple-950/40 dark:to-blue-950/80"></div>
      
      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="h-8 w-8 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Join Our Community
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Connect with 2,500+ AI developers sharing insights, solving problems, and optimizing token usage together.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Community Stats & CTA */}
          <div className="lg:col-span-1">
            <Card className="glass-card h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Community Highlights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="glass-feature p-4 rounded-lg">
                    <div className="text-2xl font-bold text-primary">2.5K+</div>
                    <div className="text-sm text-muted-foreground">Members</div>
                  </div>
                  <div className="glass-feature p-4 rounded-lg">
                    <div className="text-2xl font-bold text-primary">850+</div>
                    <div className="text-sm text-muted-foreground">Discussions</div>
                  </div>
                  <div className="glass-feature p-4 rounded-lg">
                    <div className="text-2xl font-bold text-primary">3.2K+</div>
                    <div className="text-sm text-muted-foreground">Solutions</div>
                  </div>
                  <div className="glass-feature p-4 rounded-lg">
                    <div className="text-2xl font-bold text-primary">24/7</div>
                    <div className="text-sm text-muted-foreground">Support</div>
                  </div>
                </div>

                {/* Top Categories */}
                <div className="space-y-3">
                  <h4 className="font-semibold">Popular Topics</h4>
                  {[
                    { name: "Token Optimization", icon: Brain, count: 120 },
                    { name: "Cost Reduction", icon: TrendingUp, count: 85 },
                    { name: "Help & Support", icon: HelpCircle, count: 76 }
                  ].map((topic, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <topic.icon className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{topic.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">{topic.count}</Badge>
                    </div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3 pt-4">
                  <Button asChild className="w-full glass-button bg-primary/80 hover:bg-primary text-white border-0">
                    <Link to="/community">
                      <Users className="mr-2 h-4 w-4" />
                      Browse Community
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full glass-button border-primary/30 text-foreground hover:text-accent-foreground">
                    <Link to="/auth">
                      Join Discussions <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Featured Discussions */}
          <div className="lg:col-span-2">
            <Card className="glass-card h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Latest Discussions
                  </CardTitle>
                  <Link to="/community" className="text-sm text-primary hover:underline">
                    View all →
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {featuredDiscussions.map((discussion) => (
                  <div key={discussion.id} className="glass-feature p-4 rounded-lg hover:shadow-md transition-all duration-300">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={discussion.category === 'Support' ? 'destructive' : 'default'}
                          className="text-xs"
                        >
                          {discussion.category}
                        </Badge>
                        {discussion.isHot && (
                          <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
                            🔥 Hot
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{discussion.timeAgo}</span>
                    </div>

                    <Link 
                      to={`/community`} 
                      className="block hover:text-primary transition-colors mb-3"
                    >
                      <h4 className="font-semibold text-base line-clamp-2">{discussion.title}</h4>
                    </Link>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {discussion.author[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{discussion.author}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MessageSquare className="h-4 w-4" />
                        {discussion.replies} replies
                      </div>
                    </div>
                  </div>
                ))}

                {/* Quick Stats */}
                <div className="glass-feature p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-primary">Active Community</h4>
                      <p className="text-sm text-muted-foreground">
                        Join 150+ daily active developers sharing knowledge
                      </p>
                    </div>
                    <Trophy className="h-8 w-8 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <div className="glass-card p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Ready to Join the Conversation?</h3>
            <p className="text-muted-foreground mb-6">
              Get answers to your questions, share your expertise, and connect with the token optimization community.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild className="glass-button bg-primary/80 hover:bg-primary text-white border-0">
                <Link to="/community">
                  Explore Community <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="glass-button border-primary/30 text-foreground hover:text-accent-foreground">
                <Link to="/auth">
                  Sign Up Free
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunityPreview;