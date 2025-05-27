
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import TokenCalculator from "../components/TokenCalculator";
import TokenSpeedSimulator from "../components/TokenSpeedSimulator";
import MemoryCalculator from "../components/MemoryCalculator";
import EnergyUsageEstimator from "../components/EnergyUsageEstimator";
import AIContentDetector from "../components/AIContentDetector";
import GpuMonitoring from "./GpuMonitoring";
import MainNavigation from "../components/MainNavigation";
import LearnMoreSidebar from "../components/LearnMoreSidebar";
import NewsletterPopup from "@/components/NewsletterPopup";

const Index = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("calculator");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNewsletterPopup, setShowNewsletterPopup] = useState(false);

  // Handle URL parameters for direct tool navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['calculator', 'speed', 'memory', 'energy', 'detector', 'gpu-monitor'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location]);

  // Show newsletter popup after 45 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNewsletterPopup(true);
    }, 45000);
    
    return () => clearTimeout(timer);
  }, []);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "calculator":
        return <TokenCalculator />;
      case "speed":
        return <TokenSpeedSimulator />;
      case "memory":
        return <MemoryCalculator />;
      case "energy":
        return <EnergyUsageEstimator />;
      case "detector":
        return <AIContentDetector />;
      case "gpu-monitor":
        return <GpuMonitoring />;
      default:
        return <TokenCalculator />;
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NewsletterPopup
        open={showNewsletterPopup}
        onOpenChange={setShowNewsletterPopup}
      />
      
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950/20 dark:to-purple-950/20 -z-10"></div>
        
        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Navigation */}
          <div className="mb-8">
            <MainNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onToggleSidebar={toggleSidebar}
              theme={theme}
              onThemeChange={setTheme}
            />
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {renderActiveComponent()}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <LearnMoreSidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
