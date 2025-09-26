import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  Chrome, 
  Github, 
  Twitter, 
  Users, 
  ArrowLeft,
  Sparkles
} from 'lucide-react';

const authProviders = [
  { id: "google", name: "Google", icon: Chrome },
  { id: "github", name: "GitHub", icon: Github },
  { id: "twitter", name: "Twitter", icon: Twitter }
] as const;

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [providerLoading, setProviderLoading] = useState<string | null>(null);
  
  const { user, signIn, signUp, signInWithProvider } = useAuth();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      const redirectTo = searchParams.get('redirect') || '/community';
      navigate(redirectTo);
    }
  }, [user, navigate, searchParams]);

  const handleProviderAuth = async (providerId: string) => {
    setProviderLoading(providerId);
    try {
      await signInWithProvider(providerId as "google" | "github" | "twitter");
      // Success handled by auth state listener
    } catch (error) {
      console.error("Provider auth error:", error);
      toast({
        title: "Authentication Error",
        description: "Failed to sign in with provider. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProviderLoading(null);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (activeTab === "signup" && !name.trim()) {
      toast({
        title: "Validation Error", 
        description: "Please enter your name.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      let result;
      
      if (activeTab === "login") {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password, name);
      }

      if (result.error) {
        toast({
          title: "Authentication Error",
          description: result.error.message || "An error occurred. Please try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: activeTab === "login" 
            ? "Successfully signed in!" 
            : "Account created! Please check your email to verify your account.",
        });
        
        // Redirect to community or specified page
        const redirectTo = searchParams.get('redirect') || '/community';
        navigate(redirectTo);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Authentication Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Join Tokenomy Community - Sign Up or Login</title>
        <meta name="description" content="Join the Tokenomy community to connect with AI developers, share insights, and optimize token usage. Sign up or login to access exclusive features." />
        <meta name="keywords" content="tokenomy login, AI community signup, token optimization, developer community" />
        <link rel="canonical" href="https://tokenomy.app/auth" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-12 md:py-16">
          <div className="absolute inset-0 animated-gradient -z-20"></div>
          <div className="absolute inset-0 glass-hero -z-10"></div>
          
          <div className="container px-4 md:px-6 mx-auto relative z-10">
            <div className="max-w-4xl mx-auto">
              {/* Back Navigation */}
              <div className="mb-8">
                <Link 
                  to="/" 
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left Side - Information */}
                <div className="text-center lg:text-left space-y-6">
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <Users className="h-8 w-8 text-primary" />
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600">
                      Join Our Community
                    </h1>
                  </div>
                  
                  <p className="text-xl text-muted-foreground">
                    Connect with 2,500+ AI developers sharing insights, solving problems, and optimizing token usage together.
                  </p>

                  {/* Community Benefits */}
                  <div className="glass-card p-6 space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Community Benefits
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        Ask questions & get expert answers
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        Share your optimization tips
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        Access exclusive tutorials
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        Connect with AI professionals
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        Early access to new features
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        Build your reputation
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
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
                  </div>
                </div>

                {/* Right Side - Auth Form */}
                <div className="w-full">
                  <Card className="glass-card border-0 shadow-2xl">
                    <CardHeader className="text-center">
                      <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        {activeTab === 'login' ? 'Welcome Back!' : 'Get Started'}
                      </CardTitle>
                      <p className="text-muted-foreground">
                        {activeTab === 'login' 
                          ? 'Sign in to access your community features'
                          : 'Create your account to join the community'
                        }
                      </p>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 glass-nav border-0">
                          <TabsTrigger value="login" className="glass-button border-0">
                            Sign In
                          </TabsTrigger>
                          <TabsTrigger value="signup" className="glass-button border-0">
                            Sign Up
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="login" className="space-y-4">
                          <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="glass-input"
                                required
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="password">Password</Label>
                              <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="glass-input"
                                required
                              />
                            </div>
                            
                            <Button 
                              type="submit" 
                              className="w-full glass-button bg-primary hover:bg-primary/90 text-white border-0"
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Signing In...
                                </>
                              ) : (
                                "Sign In"
                              )}
                            </Button>
                          </form>
                        </TabsContent>

                        <TabsContent value="signup" className="space-y-4">
                          <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Full Name</Label>
                              <Input
                                id="name"
                                type="text"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="glass-input"
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="signup-email">Email</Label>
                              <Input
                                id="signup-email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="glass-input"
                                required
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="signup-password">Password</Label>
                              <Input
                                id="signup-password"
                                type="password"
                                placeholder="Create a strong password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="glass-input"
                                required
                                minLength={6}
                              />
                            </div>
                            
                            <Button 
                              type="submit" 
                              className="w-full glass-button bg-primary hover:bg-primary/90 text-white border-0"
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Creating Account...
                                </>
                              ) : (
                                "Create Account"
                              )}
                            </Button>
                          </form>
                        </TabsContent>
                      </Tabs>

                      {/* Divider */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-muted" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                          </span>
                        </div>
                      </div>

                      {/* Social Login Buttons */}
                      <div className="space-y-3">
                        {authProviders.map(({ id, name, icon: Icon }) => (
                          <Button
                            key={id}
                            variant="outline"
                            className="w-full glass-button border-muted-foreground/20"
                            onClick={() => handleProviderAuth(id)}
                            disabled={providerLoading === id}
                          >
                            {providerLoading === id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Icon className="mr-2 h-4 w-4" />
                            )}
                            Continue with {name}
                          </Button>
                        ))}
                      </div>

                      <p className="text-xs text-muted-foreground text-center">
                        By continuing, you agree to our{' '}
                        <Link to="/terms" className="text-primary hover:underline">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy" className="text-primary hover:underline">
                          Privacy Policy
                        </Link>
                        .
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Auth;