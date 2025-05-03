
import { useState } from "react";
import { Button } from "@/components/ui/button";
import LoginDialog from "@/components/LoginDialog";
import UserMenu from "@/components/UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/theme-provider";
import { Sun, Moon, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const { user, loading } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleLoginSuccess = (name: string, provider: string) => {
    console.log(`User ${name} logged in via ${provider}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <div className="grid gap-4 py-4">
                <p>Menu content goes here</p>
              </div>
            </SheetContent>
          </Sheet>
          
          <a href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">TOKENOMY</span>
          </a>
          
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Features
            </a>
            <a href="#" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Pricing
            </a>
            <a href="#" className="transition-colors hover:text-foreground/80 text-foreground/60">
              About
            </a>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {loading ? (
            <Button variant="ghost" disabled>
              Loading...
            </Button>
          ) : user ? (
            <UserMenu />
          ) : (
            <Button onClick={() => setLoginDialogOpen(true)}>Sign In</Button>
          )}
        </div>
      </div>
      
      <LoginDialog 
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
        onLoginSuccess={handleLoginSuccess}
      />
    </header>
  );
};

export default Header;
