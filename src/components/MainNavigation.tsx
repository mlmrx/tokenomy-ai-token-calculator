
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";

interface MainNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onToggleSidebar: () => void;
}

const MainNavigation = ({ activeTab, onTabChange, onToggleSidebar }: MainNavigationProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center w-full px-4 py-4 gap-4">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full md:w-auto">
        <TabsList className="grid grid-cols-3 w-full md:w-auto bg-background border border-input shadow-sm">
          <TabsTrigger 
            value="calculator" 
            className="flex items-center gap-2 px-4 py-2 text-foreground transition-all"
          >
            <Calculator className="h-4 w-4" />
            <span className="hidden md:inline">Token Calculator</span>
          </TabsTrigger>
          <TabsTrigger 
            value="speed" 
            className="flex items-center gap-2 px-4 py-2 text-foreground transition-all"
          >
            <Zap className="h-4 w-4" />
            <span className="hidden md:inline">Speed Simulator</span>
          </TabsTrigger>
          <TabsTrigger 
            value="memory" 
            className="flex items-center gap-2 px-4 py-2 text-foreground transition-all"
          >
            <Cpu className="h-4 w-4" /> 
            <span className="hidden md:inline">Memory Calculator</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="flex items-center space-x-1">
        <TooltipProvider>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-accent">
                  <Menu className="h-5 w-5 text-foreground" />
                  <span className="sr-only md:not-sr-only md:ml-2">Menu</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-background border shadow-lg">
                  <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                    <li>
                      <NavigationMenuLink asChild>
                        <a 
                          href="#language-selector"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="flex items-center gap-2">
                            <Languages className="h-5 w-5" />
                            <div className="text-sm font-medium">Change Language</div>
                          </div>
                          <p className="line-clamp-2 text-xs text-muted-foreground">
                            Translate the app to your preferred language
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
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
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground hover:bg-accent" onClick={onToggleSidebar}>
                <HelpCircle className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-popover border border-border shadow-lg">
              <p>Learn more about {activeTab === "calculator" ? "token calculation" : 
                              activeTab === "speed" ? "speed simulation" : 
                              "memory calculation"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default MainNavigation;
