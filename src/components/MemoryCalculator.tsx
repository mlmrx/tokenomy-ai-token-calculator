
import React from "react";
import { BarChart } from "lucide-react";
import EnhancedMemoryCalculator from "./memory-calculator/EnhancedMemoryCalculator";
import GlassmorphicTheme from "./GlassmorphicTheme";

const MemoryCalculator: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <GlassmorphicTheme variant="hero" className="p-6 rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <BarChart className="h-8 w-8 text-amber-600" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 bg-clip-text text-transparent">
                Memory Calculator
              </h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Calculate memory requirements for AI model inference and training across different configurations
            </p>
          </div>
        </div>
      </GlassmorphicTheme>
      
      <EnhancedMemoryCalculator />
    </div>
  );
};

export default MemoryCalculator;
