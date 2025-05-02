
import React, { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { 
  Calculator, 
  Zap, 
  Cpu,
  Languages, 
  Share2, 
  FileText, 
  Mail, 
  HelpCircle,
  Menu,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";
import { 
  NavigationMenu, 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuLink, 
  NavigationMenuList, 
  NavigationMenuTrigger 
} from "@/components/ui/navigation-menu";

interface MainNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onToggleSidebar: () => void;
  theme?: "light" | "dark" | "system";
  onThemeChange?: (theme: "light" | "dark" | "system") => void;
}

const MainNavigation = ({ 
  activeTab, 
  onTabChange, 
  onToggleSidebar,
  theme = "system",
  onThemeChange = () => {},
}: MainNavigationProps) => {
  const [mounted, setMounted] = useState(false);

  // Make sure theme switching only happens client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  const themeIcons = {
    light: <Sun className="h-4 w-4" />,
    dark: <Moon className="h-4 w-4" />,
    system: <Laptop className="h-4 w-4" />
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-center w-full px-4 py-4 gap-4">
      <div className="w-full md:w-auto flex justify-center">
        <div className="flex bg-background/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm">
          <Button 
            variant={activeTab === "calculator" ? "default" : "ghost"}
            onClick={() => onTabChange("calculator")} 
            className={`flex items-center gap-2 px-6 py-2 rounded-none transition-all ${activeTab === "calculator" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
          >
            <Calculator className="h-4 w-4" />
            <span className="hidden md:inline">Calculator</span>
          </Button>
          <Button 
            variant={activeTab === "speed" ? "default" : "ghost"}
            onClick={() => onTabChange("speed")} 
            className={`flex items-center gap-2 px-6 py-2 rounded-none transition-all ${activeTab === "speed" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
          >
            <Zap className="h-4 w-4" />
            <span className="hidden md:inline">Speed</span>
          </Button>
          <Button 
            variant={activeTab === "memory" ? "default" : "ghost"}
            onClick={() => onTabChange("memory")} 
            className={`flex items-center gap-2 px-6 py-2 rounded-none transition-all ${activeTab === "memory" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
          >
            <Cpu className="h-4 w-4" /> 
            <span className="hidden md:inline">Memory</span>
          </Button>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <TooltipProvider>
          {/* Language Selector */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground hover:bg-accent rounded-full" 
                onClick={() => window.location.hash = "#language-selector"}>
                <Languages className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Change Language</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Theme Selector */}
          {mounted && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-foreground hover:bg-accent rounded-full"
                  onClick={() => {
                    const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
                    onThemeChange(nextTheme);
                  }}
                >
                  {themeIcons[theme]}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Switch Theme ({theme})</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Share Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground hover:bg-accent rounded-full"
                onClick={() => window.location.hash = "#share"}>
                <Share2 className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Share App</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Help Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground hover:bg-accent rounded-full" onClick={onToggleSidebar}>
                <HelpCircle className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Help</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Menu Button */}
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-accent rounded-full">
                  <Menu className="h-5 w-5 text-foreground" />
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-background border shadow-lg">
                  <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                    <li>
                      <NavigationMenuLink asChild>
                        <a 
                          href="#share"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="flex items-center gap-2">
                            <Share2 className="h-5 w-5" />
                            <div className="text-sm font-medium">Share</div>
                          </div>
                          <p className="line-clamp-2 text-xs text-muted-foreground">
                            Share this tool with others via social media or email
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <a 
                          href="#export"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            <div className="text-sm font-medium">Export Data</div>
                          </div>
                          <p className="line-clamp-2 text-xs text-muted-foreground">
                            Export your calculations to CSV or JSON format
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <a 
                          href="#newsletter"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            <div className="text-sm font-medium">Newsletter</div>
                          </div>
                          <p className="line-clamp-2 text-xs text-muted-foreground">
                            Subscribe to our newsletter for updates and tips
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default MainNavigation;
