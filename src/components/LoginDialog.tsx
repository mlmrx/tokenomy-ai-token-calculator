
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

// Auth providers
const authProviders = [
  { id: "google", name: "Google", icon: "https://cdn-icons-png.flaticon.com/128/2702/2702602.png" },
  { id: "github", name: "GitHub", icon: "https://cdn-icons-png.flaticon.com/128/2111/2111432.png" },
  { id: "twitter", name: "Twitter", icon: "https://cdn-icons-png.flaticon.com/128/4494/4494481.png" }
];

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginSuccess: (name: string, provider: string) => void;
}

const LoginDialog = ({ open, onOpenChange, onLoginSuccess }: LoginDialogProps) => {
  const { toast } = useToast();
  const { signIn, signUp, signInWithProvider } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleProviderAuth = async (providerId: string) => {
    setLoading(true);
    
    try {
      await signInWithProvider(providerId as "google" | "github" | "twitter");
      // Note: Success will be handled by the auth state listener in AuthContext
    } catch (error) {
      console.error("Error with provider auth:", error);
      toast({
        title: "Authentication Error",
        description: "There was a problem signing in with this provider.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate inputs
    if (!email.includes('@') || password.length < 6) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid email and password (min 6 characters).",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    
    try {
      if (activeTab === "login") {
        const { error } = await signIn(email, password);
        
        if (error) {
          toast({
            title: "Login Failed",
            description: error.message || "Check your credentials and try again.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        // If successful, AuthContext listener will update state and show success toast
        onOpenChange(false);
        const displayName = email.split('@')[0];
        onLoginSuccess(displayName, "Email");
      } else {
        // Sign up
        const { error } = await signUp(email, password, name);
        
        if (error) {
          toast({
            title: "Registration Failed",
            description: error.message || "Please check your information and try again.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        // If email confirmation is enabled in Supabase, show different message
        toast({
          title: "Registration Successful",
          description: "Your account has been created. Please check your email for confirmation.",
        });
        onOpenChange(false);
        setLoading(false);
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast({
        title: "Authentication Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{activeTab === "login" ? "Log In" : "Sign Up"}</DialogTitle>
          <DialogDescription>
            {activeTab === "login" 
              ? "Log in to your account to save and manage your calculations." 
              : "Create an account to save and manage your calculations."}
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Log In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  placeholder="example@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Logging In...
                  </>
                ) : "Log In"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  placeholder="Your Name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input 
                  id="signup-email" 
                  placeholder="example@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input 
                  id="signup-password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Creating Account...
                  </>
                ) : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {authProviders.map((provider) => (
            <Button
              key={provider.id}
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => handleProviderAuth(provider.id)}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <img 
                  src={provider.icon} 
                  alt={`${provider.name} icon`}
                  className="w-5 h-5"
                />
              )}
              {provider.name}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
