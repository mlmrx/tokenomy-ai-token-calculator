
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

// Mock auth providers
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
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleProviderAuth = (providerId: string) => {
    setLoading(true);
    
    // Simulate authentication delay
    setTimeout(() => {
      onLoginSuccess(`User via ${authProviders.find(p => p.id === providerId)?.name}`, 
                    authProviders.find(p => p.id === providerId)?.name || "");
      setLoading(false);
      onOpenChange(false);
      
      toast({
        title: "Authentication Successful",
        description: `You've been signed in via ${authProviders.find(p => p.id === providerId)?.name}.`,
      });
    }, 1500);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate
    if (!email.includes('@') || password.length < 6) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid email and password (min 6 characters).",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    
    // Simulate authentication delay
    setTimeout(() => {
      const displayName = activeTab === "signup" ? name : email.split('@')[0];
      onLoginSuccess(displayName, "Email");
      setLoading(false);
      onOpenChange(false);
      
      toast({
        title: activeTab === "signup" ? "Account Created" : "Welcome Back",
        description: activeTab === "signup" 
          ? "Your account has been created and you're now logged in." 
          : "You've been successfully logged in.",
      });
    }, 1500);
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
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging In..." : "Log In"}
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
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
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
              <img 
                src={provider.icon} 
                alt={`${provider.name} icon`}
                className="w-5 h-5"
              />
              {provider.name}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
