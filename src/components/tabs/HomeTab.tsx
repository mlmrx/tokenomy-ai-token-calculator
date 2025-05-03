
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Clock, Brain, ArrowRight, Zap, Lightbulb, BarChart, Sparkles } from "lucide-react";

interface HomeTabProps {
  onTabChange: (tab: string) => void;
}

const HomeTab: React.FC<HomeTabProps> = ({ onTabChange }) => {
  return (
    <div className="w-full max-w-6xl mx-auto mb-12 text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-500 to-pink-500 animate-pulse-subtle">
        Welcome to TOKENOMY
      </h1>
      <p className="text-xl max-w-3xl mx-auto mb-8 text-muted-foreground">
        Smart AI token management and optimization tools to help you build more efficient and cost-effective AI applications.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-103 border-t-4" style={{borderTopColor: '#4f46e5'}}>
          <div className="p-6 space-y-4">
            <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
              <Calculator className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold">Token Calculator</h3>
            <p className="text-sm text-muted-foreground">
              Calculate tokens, estimate costs, and optimize your prompts for various AI models.
            </p>
            <Button 
              onClick={() => onTabChange('calculator')}
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700"
            >
              Open Calculator <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
        
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-103 border-t-4" style={{borderTopColor: '#8b5cf6'}}>
          <div className="p-6 space-y-4">
            <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold">Speed Simulator</h3>
            <p className="text-sm text-muted-foreground">
              Simulate token generation speed and compare performance across different AI models.
            </p>
            <Button 
              onClick={() => onTabChange('speed')}
              className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
            >
              Open Simulator <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
        
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-103 border-t-4" style={{borderTopColor: '#d97706'}}>
          <div className="p-6 space-y-4">
            <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center mb-4">
              <Brain className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold">Memory Calculator</h3>
            <p className="text-sm text-muted-foreground">
              Optimize memory usage and calculate memory requirements for AI model inference.
            </p>
            <Button 
              onClick={() => onTabChange('memory')}
              className="w-full mt-4 bg-amber-600 hover:bg-amber-700"
            >
              Open Memory Tools <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
      
      {/* Features Section */}
      <div className="mt-16 mb-10">
        <h2 className="text-2xl font-bold mb-8">Why Choose Tokenomy?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-background/50 p-4 rounded-lg border border-border flex flex-col items-center">
            <div className="rounded-full bg-primary/10 p-3 mb-3">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-medium mb-1">Optimize Costs</h3>
            <p className="text-sm text-center text-muted-foreground">Reduce token usage and save on API costs</p>
          </div>
          
          <div className="bg-background/50 p-4 rounded-lg border border-border flex flex-col items-center">
            <div className="rounded-full bg-primary/10 p-3 mb-3">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-medium mb-1">Smart Analytics</h3>
            <p className="text-sm text-center text-muted-foreground">Get insights on token usage patterns</p>
          </div>
          
          <div className="bg-background/50 p-4 rounded-lg border border-border flex flex-col items-center">
            <div className="rounded-full bg-primary/10 p-3 mb-3">
              <BarChart className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-medium mb-1">Visual Reports</h3>
            <p className="text-sm text-center text-muted-foreground">Interactive charts and data visualization</p>
          </div>
          
          <div className="bg-background/50 p-4 rounded-lg border border-border flex flex-col items-center">
            <div className="rounded-full bg-primary/10 p-3 mb-3">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-medium mb-1">AI-Powered</h3>
            <p className="text-sm text-center text-muted-foreground">ML-based suggestions for optimization</p>
          </div>
        </div>
      </div>
      
      <div className="mt-12">
        <Button 
          size="lg" 
          onClick={() => onTabChange('calculator')}
          className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white px-8 shadow-lg"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default HomeTab;
