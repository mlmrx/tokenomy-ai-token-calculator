
import React from 'react';
import { BarChart4, LineChart, Calculator, BarChart } from "lucide-react";
import { Link, useLocation } from 'react-router-dom';

interface MainNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onToggleSidebar: () => void;
  theme: "light" | "dark" | "system";
  onThemeChange: (theme: "light" | "dark" | "system") => void;
}

const MainNavigation: React.FC<MainNavigationProps> = ({
  activeTab,
  onTabChange,
  onToggleSidebar,
  theme,
  onThemeChange,
}) => {
  const location = useLocation();

  const menuItems = [
    {
      id: "calculator",
      label: "Token Calculator",
      icon: <Calculator className="h-5 w-5" />,
      gradientFrom: "from-blue-600",
      gradientTo: "to-indigo-500",
    },
    {
      id: "speed",
      label: "Speed Simulator",
      icon: <LineChart className="h-5 w-5" />,
      gradientFrom: "from-purple-600",
      gradientTo: "to-pink-500",
    },
    {
      id: "memory",
      label: "Memory Calculator",
      icon: <BarChart className="h-5 w-5" />,
      gradientFrom: "from-amber-500",
      gradientTo: "to-orange-600",
    },
  ];

  return (
    <nav className="flex flex-col items-center w-full mb-8">
      <div className="flex items-center justify-center space-x-1 md:space-x-3 bg-gradient-to-r from-gray-900/5 to-gray-800/10 backdrop-blur-sm p-1.5 rounded-full shadow-lg border border-white/20 mb-6">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex items-center justify-center px-3 py-2 md:px-5 md:py-2.5 rounded-full transition-all duration-300 ${
              activeTab === item.id
                ? `bg-gradient-to-r ${item.gradientFrom} ${item.gradientTo} text-white shadow-md scale-105`
                : "hover:bg-white/20 text-gray-700 hover:text-gray-900"
            }`}
          >
            <div className={`flex items-center gap-1.5 md:gap-2.5 ${activeTab === item.id ? "animate-pulse-subtle" : ""}`}>
              {item.icon}
              <span className={`hidden sm:inline font-medium ${activeTab === item.id ? "font-semibold" : "font-medium"}`}>
                {item.label}
              </span>
            </div>
          </button>
        ))}
      </div>
      
      {/* Add feature links navigation */}
      <div className="w-full max-w-4xl mb-4">
        <div className="flex flex-wrap justify-center gap-2">
          <Link 
            to="/features" 
            className={`px-4 py-1.5 text-sm rounded-full transition-all hover:bg-primary/10 ${location.pathname === '/features' ? 'bg-primary/10 font-medium' : ''}`}>
            Features
          </Link>
          <Link 
            to="/pricing" 
            className={`px-4 py-1.5 text-sm rounded-full transition-all hover:bg-primary/10 ${location.pathname === '/pricing' ? 'bg-primary/10 font-medium' : ''}`}>
            Pricing
          </Link>
          <Link 
            to="/?tab=calculator&subtab=model-comparison" 
            className={`px-4 py-1.5 text-sm rounded-full transition-all hover:bg-primary/10 ${activeTab === 'calculator' && location.pathname === '/' ? 'bg-primary/10 font-medium' : ''}`}>
            Model Comparison
          </Link>
          <Link 
            to="/?tab=calculator&subtab=visualization" 
            className={`px-4 py-1.5 text-sm rounded-full transition-all hover:bg-primary/10 ${activeTab === 'calculator' && location.pathname === '/' ? 'bg-primary/10 font-medium' : ''}`}>
            Visualizations
          </Link>
          <Link 
            to="/?tab=memory" 
            className={`px-4 py-1.5 text-sm rounded-full transition-all hover:bg-primary/10 ${activeTab === 'memory' && location.pathname === '/' ? 'bg-primary/10 font-medium' : ''}`}>
            Memory Calculator
          </Link>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s infinite ease-in-out;
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        `
      }} />
    </nav>
  );
};

export default MainNavigation;
