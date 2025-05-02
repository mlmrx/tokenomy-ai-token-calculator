
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { HelpCircle, Languages, Share2, FileText, Mail } from "lucide-react";
import { Link } from "react-router-dom";

interface MainNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onToggleSidebar: () => void;
}

const MainNavigation = ({ activeTab, onTabChange, onToggleSidebar }: MainNavigationProps) => {
  return (
    <div className="flex justify-between items-center w-full px-4 py-2">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-auto">
        <TabsList className="grid grid-cols-3 w-auto">
          <TabsTrigger value="calculator">Token Calculator</TabsTrigger>
          <TabsTrigger value="speed">Speed Simulator</TabsTrigger>
          <TabsTrigger value="memory">Memory Calculator</TabsTrigger>
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
            <TooltipContent>
              <p>Change Language</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => window.location.href = "#share"}>
                <Share2 className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Share</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => window.location.href = "#export"}>
                <FileText className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Export Data</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => window.location.href = "#newsletter"}>
                <Mail className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Subscribe to Newsletter</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
                <HelpCircle className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Learn More</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default MainNavigation;
