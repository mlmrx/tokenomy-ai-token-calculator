
import React from 'react';
import { BarChart4, LineChart, Calculator, BarChart, Leaf, Search, Cpu, Trophy } from "lucide-react";

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
    {
      id: "energy",
      label: "Energy Estimator",
      icon: <Leaf className="h-5 w-5" />,
      gradientFrom: "from-green-500",
      gradientTo: "to-emerald-600",
    },
    {
      id: "detector",
      label: "Content Detector",
      icon: <Search className="h-5 w-5" />,
      gradientFrom: "from-cyan-500",
      gradientTo: "to-blue-500",
    },
    {
      id: "gpu-monitor",
      label: "GPU Monitor",
      icon: <Cpu className="h-5 w-5" />,
      gradientFrom: "from-rose-500",
      gradientTo: "to-pink-600",
    },
    {
      id: "token-leaderboard",
      label: "Token Leaderboard",
      icon: <Trophy className="h-5 w-5" />,
      gradientFrom: "from-yellow-500",
      gradientTo: "to-amber-600",
    },
  ];

  return (
    <nav className="flex justify-center w-full">
      <div className="flex items-center justify-center space-x-1 md:space-x-3 bg-gradient-to-r from-gray-900/5 to-gray-800/10 backdrop-blur-sm p-1.5 rounded-full shadow-lg border border-white/20">
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
        `
      }} />
    </nav>
  );
};

export default MainNavigation;
