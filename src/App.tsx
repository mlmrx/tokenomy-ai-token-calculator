
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "./contexts/AuthContext";
import { HelmetProvider } from "react-helmet-async";
import Header from "./components/Header";
import Homepage from "./pages/Homepage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import Index from "./pages/Index";
import GpuMonitoring from "./pages/GpuMonitoring";
import TokenLeaderboard from "./pages/TokenLeaderboard";
import TokenObservability from "./pages/TokenObservability";
import NotFound from "./pages/NotFound";

// Individual tool pages
import TokenCalculatorPage from "./pages/tools/TokenCalculatorPage";
import TokenObservabilityPage from "./pages/tools/TokenObservabilityPage";
import TokenSpeedSimulatorPage from "./pages/tools/TokenSpeedSimulatorPage";
import MemoryCalculatorPage from "./pages/tools/MemoryCalculatorPage";
import EnergyUsageEstimatorPage from "./pages/tools/EnergyUsageEstimatorPage";
import AIContentDetectorPage from "./pages/tools/AIContentDetectorPage";
import GpuMonitoringPage from "./pages/tools/GpuMonitoringPage";
import TokenLeaderboardPage from "./pages/tools/TokenLeaderboardPage";
import PromptVisualizerPage from "./pages/tools/PromptVisualizerPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <HelmetProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="min-h-screen bg-background">
                <Header />
                <Routes>
                  <Route path="/" element={<Homepage />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/tools" element={<Index />} />
                  
                  {/* Individual tool pages for SEO */}
                  <Route path="/tools/token-calculator" element={<TokenCalculatorPage />} />
                  <Route path="/tools/token-observability" element={<TokenObservabilityPage />} />
                  <Route path="/tools/token-speed-simulator" element={<TokenSpeedSimulatorPage />} />
                  <Route path="/tools/memory-calculator" element={<MemoryCalculatorPage />} />
                  <Route path="/tools/energy-usage-estimator" element={<EnergyUsageEstimatorPage />} />
                  <Route path="/tools/ai-content-detector" element={<AIContentDetectorPage />} />
                  <Route path="/tools/gpu-monitoring" element={<GpuMonitoringPage />} />
                  <Route path="/tools/token-leaderboard" element={<TokenLeaderboardPage />} />
                  <Route path="/tools/prompt-visualizer" element={<PromptVisualizerPage />} />
                  
                  {/* Legacy routes for backward compatibility */}
                  <Route path="/gpu-monitoring" element={<GpuMonitoring />} />
                  <Route path="/token-leaderboard" element={<TokenLeaderboard />} />
                  <Route path="/observability" element={<TokenObservability />} />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </HelmetProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
