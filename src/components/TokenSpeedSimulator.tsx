
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart } from "lucide-react";
import EnhancedTokenSpeedSimulator from "./EnhancedTokenSpeedSimulator";
import GlassmorphicTheme from "./GlassmorphicTheme";

const TokenSpeedSimulator: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <GlassmorphicTheme variant="hero" className="p-6 rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <LineChart className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Token Speed Simulator
              </h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Simulate and optimize token processing speeds across different AI models and configurations
            </p>
          </div>
        </div>
      </GlassmorphicTheme>
      
      <Card className="border-2">
        <CardContent className="p-6">
          <EnhancedTokenSpeedSimulator />
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenSpeedSimulator;
