
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Facebook, Mail, Globe } from "lucide-react";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginSuccess: () => void;
}

const LoginDialog = ({ open, onOpenChange, onLoginSuccess }: LoginDialogProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleAuth = (method: string) => {
    toast({
      title: "Authentication Request",
      description: `Attempted to authenticate with ${method}. This feature requires backend integration.`,
    });
    
    // Simulating successful login
    setTimeout(() => {
      onLoginSuccess();
      onOpenChange(false);
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "login") {
      handleAuth(`email (${email})`);
    } else {
      handleAuth(`new account registration (${email})`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{activeTab === "login" ? "Log In" : "Sign Up"}</DialogTitle>
          <DialogDescription>
            {activeTab === "login" 
              ? "Log in to your account to save and track your calculations."
              : "Create a new account to use all features."
            }
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Log in</Button>
            </form>
          </TabsContent>
          
          <TabsContent value="register">
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  placeholder="Your Name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="email-register">Email</Label>
                <Input 
                  id="email-register" 
                  type="email" 
                  placeholder="your@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="password-register">Password</Label>
                <Input 
                  id="password-register" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Create Account</Button>
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
        
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" onClick={() => handleAuth("Google")}>
            <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2" aria-hidden="true" fill="currentColor">
              <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
              <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
              <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
              <path d="M12.0004 24C15.2404 24 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24 12.0004 24Z" fill="#34A853" />
            </svg>
            Google
          </Button>
          <Button variant="outline" onClick={() => handleAuth("Microsoft")}>
            <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2" aria-hidden="true" fill="currentColor">
              <path d="M11.4008 2H2.19995V11.2H11.4008V2Z" fill="#F25022" />
              <path d="M11.4008 12.8H2.19995V22H11.4008V12.8Z" fill="#00A4EF" />
              <path d="M21.8008 2H12.5999V11.2H21.8008V2Z" fill="#7FBA00" />
              <path d="M21.8008 12.8H12.5999V22H21.8008V12.8Z" fill="#FFB900" />
            </svg>
            MS
          </Button>
          <Button variant="outline" onClick={() => handleAuth("Apple")}>
            <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2" aria-hidden="true" fill="currentColor">
              <path d="M14.94 5.19A4.18 4.18 0 0 0 16 2a4.3 4.3 0 0 0-2.87 1.32 4 4 0 0 0-1 2.86 3.31 3.31 0 0 0 2.81-1m2.83 4.92c0-2.98 2.38-4.91 2.38-4.91A5.35 5.35 0 0 0 12 7c-1.09 0-2.76-.74-3.78-.74C6.11 6.26 4 8.15 4 12c0 3.78 3.64 9 5.57 9,.91 0 2.13-1 3.43-1 1.16 0 2.14 1 3.33 1 1.9 0 5.67-4.85 5.67-9 0 0-3.23-1.89-3.23-4.89" />
            </svg>
            Apple
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
