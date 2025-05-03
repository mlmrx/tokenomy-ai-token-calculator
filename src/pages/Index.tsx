
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// Import components
import MainNavigation from "@/components/MainNavigation";
import AINewsMarquee from "@/components/AINewsMarquee";
import LoginDialog from "@/components/LoginDialog";
import LearnMoreSidebar from "@/components/LearnMoreSidebar";
import NewsletterPopup from "@/components/NewsletterPopup";
import Footer from "@/components/Footer";

// Import tab components
import HomeTab from "@/components/tabs/HomeTab";
import CalculatorTab from "@/components/tabs/CalculatorTab";
import SpeedTab from "@/components/tabs/SpeedTab";
import MemoryTab from "@/components/tabs/MemoryTab";

const Index = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("home");
  const [activeCalcTab, setActiveCalcTab] = useState("model-comparison");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [showNewsletterPopup, setShowNewsletterPopup] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const location = useLocation();
  const navigate = useNavigate();

  // Parse URL parameters on mount and when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    const subtabParam = params.get('subtab');
    
    if (tabParam) {
      setActiveTab(tabParam);
    }
    
    if (subtabParam) {
      setActiveCalcTab(subtabParam);
    }
  }, [location]);

  // Update URL when tabs change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (activeTab !== 'home') {
      params.set('tab', activeTab);
      
      if (activeTab === 'calculator') {
        params.set('subtab', activeCalcTab);
      } else {
        params.delete('subtab');
      }
      
      const newUrl = `/?${params.toString()}`;
      navigate(newUrl, { replace: true });
    } else {
      // For home tab, just show the root URL
      navigate('/', { replace: true });
    }
  }, [activeTab, activeCalcTab, navigate]);

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    // In a real app, this would also update the document or localStorage
  };
  
  // Placeholder for user login
  const handleLoginSuccess = (name: string, provider: string) => {
    setIsLoggedIn(true);
    setUserName(name || "User");
    toast({
      title: `Logged In via ${provider}`,
      description: `Welcome, ${name || "User"}!`,
    });
  };

  // Show newsletter popup after 15 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNewsletterPopup(true);
    }, 15000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleUrlUpdate = (params: URLSearchParams) => {
    const newUrl = `/?${params.toString()}`;
    navigate(newUrl, { replace: true });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LoginDialog 
        open={loginDialogOpen} 
        onOpenChange={setLoginDialogOpen}
        onLoginSuccess={handleLoginSuccess}
      />
      
      <LearnMoreSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <NewsletterPopup 
        open={showNewsletterPopup} 
        onOpenChange={setShowNewsletterPopup} 
      />
      
      <AINewsMarquee />
      
      <main className="flex-1 container mx-auto py-6 px-4 md:px-6 section-appear">
        <div className="mb-6 flex justify-center w-full">
          <MainNavigation 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
            theme={theme}
            onThemeChange={handleThemeChange} 
          />
        </div>

        {/* Render active tab */}
        {activeTab === "home" && <HomeTab onTabChange={setActiveTab} />}
        {activeTab === "calculator" && (
          <CalculatorTab 
            activeSubtab={activeCalcTab} 
            setActiveSubtab={setActiveCalcTab}
            onUrlUpdate={handleUrlUpdate} 
          />
        )}
        {activeTab === "speed" && <SpeedTab />}
        {activeTab === "memory" && <MemoryTab />}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
