
import React from 'react';
import { BarChart4, LineChart, Memory, Calculator } from "lucide-react";

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
    },
    {
      id: "speed",
      label: "Speed Simulator",
      icon: <LineChart className="h-5 w-5" />,
    },
    {
      id: "memory",
      label: "Memory Calculator",
      icon: <Memory className="h-5 w-5" />,
    },
  ];

  return (
    <nav className="flex justify-center w-full">
      <div className="flex items-center justify-center space-x-1 md:space-x-2 bg-background p-1 rounded-full shadow-sm border">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex items-center justify-center px-3 py-2 md:px-5 md:py-2 rounded-full transition-all duration-200 ${
              activeTab === item.id
                ? "bg-gradient-to-r from-purple-600 via-blue-500 to-pink-500 text-white shadow-md"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <div className="flex items-center gap-1 md:gap-2">
              {item.icon}
              <span className="hidden sm:inline font-medium">{item.label}</span>
            </div>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default MainNavigation;
