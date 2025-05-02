
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { 
  Calculator, 
  Zap, 
  Cpu, // Replaced Memory with Cpu which is available in lucide-react
  Languages, 
  Share2, 
  FileText, 
  Mail, 
  HelpCircle 
} from "lucide-react";

interface MainNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onToggleSidebar: () => void;
}

const MainNavigation = ({ activeTab, onTabChange, onToggleSidebar }: MainNavigationProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center w-full px-4 py-4 gap-4">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full md:w-auto">
        <TabsList className="grid grid-cols-3 w-full md:w-auto">
          <TabsTrigger value="calculator" className="flex items-center gap-2 px-4 py-2">
            <Calculator className="h-4 w-4" />
            <span className="hidden md:inline">Token Calculator</span>
          </TabsTrigger>
          <TabsTrigger value="speed" className="flex items-center gap-2 px-4 py-2">
            <Zap className="h-4 w-4" />
            <span className="hidden md:inline">Speed Simulator</span>
          </TabsTrigger>
          <TabsTrigger value="memory" className="flex items-center gap-2 px-4 py-2">
            <Cpu className="h-4 w-4" /> 
            <span className="hidden md:inline">Memory Calculator</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="flex items-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => window.location.href = "#language-selector"}>
                <Languages className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-popover border border-border shadow-lg">
              <p>Change Language</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => window.location.href = "#share"}>
                <Share2 className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-popover border border-border shadow-lg">
              <p>Share your calculations</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => window.location.href = "#export"}>
                <FileText className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-popover border border-border shadow-lg">
              <p>Export data to CSV/JSON</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => window.location.href = "#newsletter"}>
                <Mail className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-popover border border-border shadow-lg">
              <p>Subscribe to our newsletter</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
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
