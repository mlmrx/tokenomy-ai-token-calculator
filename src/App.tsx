
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider"; 
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Homepage from "./pages/Homepage";
import Index from "./pages/Index";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import GpuMonitoring from "./pages/GpuMonitoring";
import TokenLeaderboard from "./pages/TokenLeaderboard";
import NotFound from "./pages/NotFound";
import NewsletterPopup from "@/components/NewsletterPopup";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

// Set favicon and title
const updateFavicon = () => {
  const link = document.querySelector("link[rel='icon']") || document.createElement('link');
  link.setAttribute('type', 'image/svg+xml');
  link.setAttribute('rel', 'icon');
  link.setAttribute('href', '/favicon.svg');
  document.head.appendChild(link);
  
  // Set document title
  document.title = "TOKENOMY - Smart AI Token Management & Optimization";
};

// Call the function once
updateFavicon();

const App = () => {
  const [showNewsletterPopup, setShowNewsletterPopup] = useState(false);

  // Show newsletter popup after 45 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNewsletterPopup(true);
    }, 45000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider defaultTheme="light" storageKey="tokenomy-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <BrowserRouter>
              <Toaster />
              <Sonner />
              <Header />
              <NewsletterPopup
                open={showNewsletterPopup}
                onOpenChange={setShowNewsletterPopup}
              />
              <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/tools" element={<Index />} />
                <Route path="/features" element={<Features />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/gpu-monitoring" element={<GpuMonitoring />} />
                <Route path="/token-leaderboard" element={<TokenLeaderboard />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
