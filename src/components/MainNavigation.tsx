
import React from 'react';
import { Home, Calculator, LineChart, BarChart } from "lucide-react";
import { useLocation } from 'react-router-dom';

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
  const menuItems = [
    {
      id: "home",
      label: "Home",
      icon: <Home className="h-5 w-5" />,
      gradientFrom: "from-green-600",
      gradientTo: "to-teal-500",
    },
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
