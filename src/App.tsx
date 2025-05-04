
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "./contexts/AuthContext";

// Import pages
import Homepage from "./pages/Homepage";
import NotFound from "./pages/NotFound";
import EnergyEstimatorPage from "./pages/EnergyEstimatorPage";
import ContactPage from "./pages/ContactPage";
import FeaturesPage from "./pages/FeaturesPage";
import ToolsPage from "./pages/ToolsPage";

const App = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="tokenomy-theme">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/tools/energy" element={<EnergyEstimatorPage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster position="top-right" />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
