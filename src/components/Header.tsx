
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LoginDialog from "@/components/LoginDialog";
import UserMenu from "@/components/UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/theme-provider";
import { Sun, Moon, Menu, Linkedin, Github, Share2, Mail, Home, Lightbulb, CreditCard, Users, PhoneCall, ChevronDown, Calculator, Zap, MemoryStick, Leaf, FileSearch, Gauge, Trophy, Activity, Eye } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import NewsletterPopup from "@/components/NewsletterPopup";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const Header = () => {
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [showNewsletterPopup, setShowNewsletterPopup] = useState(false);
  const { user, loading } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

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
                <SheetClose asChild>
                  <Link to="/" className="px-4 py-2 hover:bg-accent rounded-md">Home</Link>
                </SheetClose>
                <div className="px-4 py-2 text-sm font-medium text-muted-foreground">Tools</div>
                <SheetClose asChild>
                  <Link to="/tools/token-calculator" className="px-8 py-2 hover:bg-accent rounded-md">Token Calculator</Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link to="/tools/token-speed-simulator" className="px-8 py-2 hover:bg-accent rounded-md">Token Speed Simulator</Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link to="/tools/memory-calculator" className="px-8 py-2 hover:bg-accent rounded-md">Memory Calculator</Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link to="/tools/energy-usage-estimator" className="px-8 py-2 hover:bg-accent rounded-md">Energy Usage Estimator</Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link to="/tools/ai-content-detector" className="px-8 py-2 hover:bg-accent rounded-md">AI Content Detector</Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link to="/tools/gpu-monitoring" className="px-8 py-2 hover:bg-accent rounded-md">GPU Monitoring</Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link to="/tools/token-leaderboard" className="px-8 py-2 hover:bg-accent rounded-md">Token Leaderboard</Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link to="/tools/token-observability" className="px-8 py-2 hover:bg-accent rounded-md">Token Observability</Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link to="/tools/prompt-visualizer" className="px-8 py-2 hover:bg-accent rounded-md">Prompt Visualizer</Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link to="/features" className="px-4 py-2 hover:bg-accent rounded-md">Features</Link>
                </SheetClose>
                <div className="px-4 py-2 text-sm font-medium text-muted-foreground">Know Us</div>
                <SheetClose asChild>
                  <Link to="/pricing" className="px-8 py-2 hover:bg-accent rounded-md">Pricing</Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link to="/about" className="px-8 py-2 hover:bg-accent rounded-md">About</Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link to="/contact" className="px-8 py-2 hover:bg-accent rounded-md">Contact</Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link to="/community" className="px-4 py-2 hover:bg-accent rounded-md text-primary font-medium">Join Community</Link>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
          
          <Link to="/" className="flex flex-col items-start">
            <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              TOKENOMY
            </h1>
           
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm ml-6">
            <Link to="/" className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-1">
              <Home size={16} />
              Home
            </Link>
            
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-auto py-0 text-sm transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-1 bg-transparent">
                    <CreditCard size={16} />
                    Tools
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-2 p-4 md:grid-cols-2">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/tools/token-calculator"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center gap-2">
                              <Calculator size={16} />
                              <span className="text-sm font-medium leading-none">Token Calculator</span>
                            </div>
                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                              Calculate token usage
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/tools/token-speed-simulator"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center gap-2">
                              <Zap size={16} />
                              <span className="text-sm font-medium leading-none">Speed Simulator</span>
                            </div>
                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                              Simulate token speed
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/tools/memory-calculator"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center gap-2">
                              <MemoryStick size={16} />
                              <span className="text-sm font-medium leading-none">Memory Calculator</span>
                            </div>
                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                              Calculate memory needs
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/tools/energy-usage-estimator"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center gap-2">
                              <Leaf size={16} />
                              <span className="text-sm font-medium leading-none">Energy Estimator</span>
                            </div>
                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                              Estimate energy usage
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/tools/ai-content-detector"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center gap-2">
                              <FileSearch size={16} />
                              <span className="text-sm font-medium leading-none">AI Content Detector</span>
                            </div>
                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                              Detect AI content
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/tools/gpu-monitoring"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center gap-2">
                              <Gauge size={16} />
                              <span className="text-sm font-medium leading-none">GPU Monitoring</span>
                            </div>
                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                              Monitor GPU usage
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/tools/token-leaderboard"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center gap-2">
                              <Trophy size={16} />
                              <span className="text-sm font-medium leading-none">Token Leaderboard</span>
                            </div>
                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                              Compare model performance
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/tools/token-observability"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center gap-2">
                              <Activity size={16} />
                              <span className="text-sm font-medium leading-none">Token Observability</span>
                            </div>
                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                              Monitor token metrics
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/tools/prompt-visualizer"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center gap-2">
                              <Eye size={16} />
                              <span className="text-sm font-medium leading-none">Prompt Visualizer</span>
                            </div>
                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                              Visualize prompts
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
            <Link to="/features" className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-1">
              <Lightbulb size={16} />
              Features
            </Link>
            
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-auto py-0 text-sm transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-1 bg-transparent">
                    <Users size={16} />
                    Know Us
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[200px] gap-2 p-4">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/pricing"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center gap-2">
                              <CreditCard size={16} />
                              <span className="text-sm font-medium leading-none">Pricing</span>
                            </div>
                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                              View our pricing plans
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/about"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center gap-2">
                              <Users size={16} />
                              <span className="text-sm font-medium leading-none">About</span>
                            </div>
                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                              Learn more about us
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/contact"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center gap-2">
                              <PhoneCall size={16} />
                              <span className="text-sm font-medium leading-none">Contact</span>
                            </div>
                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                              Get in touch with us
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
            <Link to="/community" className="transition-colors hover:text-primary text-primary font-medium flex items-center gap-1">
              <Users size={16} />
              Join Community
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Social media links & subscription from Index.tsx */}
          <div className="hidden sm:flex items-center gap-2 mr-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a href="https://www.linkedin.com/comm/mynetwork/discovery-see-all?usecase=PEOPLE_FOLLOWS&followMember=ml4u" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1.5 bg-[#0A66C2] text-white rounded-md hover:bg-opacity-80 transition-colors">
                    <Linkedin size={16} />
                  </a>
                </TooltipTrigger>
                <TooltipContent>Follow on LinkedIn</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <a href="https://twitter.com/Mahesh_Lambe?ref_src=twsrc%5Etfw" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1.5 bg-black text-white rounded-md hover:bg-opacity-80 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/></svg>
                  </a>
                </TooltipTrigger>
                <TooltipContent>Follow on X</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <a href="https://github.com/mlmrx" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1.5 bg-[#24292e] text-white rounded-md hover:bg-opacity-80 transition-colors">
                    <Github size={16} />
                  </a>
                </TooltipTrigger>
                <TooltipContent>Follow on GitHub</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <a href="https://www.tokenomy.ai" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                    <Share2 size={16} />
                  </a>
                </TooltipTrigger>
                <TooltipContent>Share Tokenomy</TooltipContent>
              </Tooltip>
              
              <Button 
                variant="outline"
                size="sm"
                className="flex items-center gap-1 border-purple-400 hover:bg-purple-100"
                onClick={() => setShowNewsletterPopup(true)}
              >
                <Mail size={14} className="text-purple-600" />
                <span className="text-xs">Subscribe</span>
              </Button>
            </TooltipProvider>
          </div>

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
            <Button 
              onClick={() => setLoginDialogOpen(true)} 
              className="hover-scale text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-purple-500 hover:from-indigo-600 hover:via-purple-600 hover:to-purple-600 shadow-md"
            >
              Log In / Sign Up
            </Button>
          )}
        </div>
      </div>
      
      <LoginDialog 
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
        onLoginSuccess={handleLoginSuccess}
      />
      
      <NewsletterPopup 
        open={showNewsletterPopup}
        onOpenChange={setShowNewsletterPopup}
      />
    </header>
  );
};

export default Header;
