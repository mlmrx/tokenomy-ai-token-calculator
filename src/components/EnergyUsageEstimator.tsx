
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getModelCategories } from "@/lib/modelUtils";
import { Button } from "@/components/ui/button";
import { Leaf, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface EnergyEstimate {
  kwh: number;
  co2: number;
  treeDays: number;
  carMiles: number;
}

const EnergyUsageEstimator = () => {
  const [tokens, setTokens] = useState<number>(1000000); // Default 1M tokens
  const [model, setModel] = useState<string>("gpt-4");
  const [energyEstimate, setEnergyEstimate] = useState<EnergyEstimate>({
    kwh: 0,
    co2: 0,
    treeDays: 0,
    carMiles: 0,
  });
  
  const modelCategories = getModelCategories();
  const allModels = Object.values(modelCategories).flat();

  // Energy consumption rates in kWh per million tokens (estimated)
  const energyRates: Record<string, number> = {
    'gpt-4': 0.85,
    'gpt-4-turbo': 0.7,
    'gpt-3.5-turbo': 0.25,
    'claude-3-opus': 0.95,
    'claude-3-sonnet': 0.65,
    'claude-3-haiku': 0.3,
    'gemini-pro': 0.4,
    'gemini-ultra': 0.85,
    'llama-3': 0.45,
    'mistral-large': 0.75,
    'default': 0.5
  };
  
  // CO2 emissions in kg per kWh (global average)
  const CO2_PER_KWH = 0.475;
  
  // Equivalences
  const TREE_ABSORPTION = 0.06; // kg CO2 per day per tree
  const CAR_EMISSIONS = 0.25; // kg CO2 per mile
  
  useEffect(() => {
    calculateEnergyUsage();
  }, [tokens, model]);
  
  const calculateEnergyUsage = () => {
    // Get energy rate for selected model or use default
    const ratePerMillion = energyRates[model] || energyRates['default'];
    
    // Calculate energy in kWh
    const energyKwh = (tokens / 1000000) * ratePerMillion;
    
    // Calculate CO2 emissions
    const co2Emissions = energyKwh * CO2_PER_KWH;
    
    // Calculate equivalents
    const treeDays = co2Emissions / TREE_ABSORPTION;
    const carMiles = co2Emissions / CAR_EMISSIONS;
    
    setEnergyEstimate({
      kwh: energyKwh,
      co2: co2Emissions,
      treeDays: treeDays,
      carMiles: carMiles
    });
  };
  
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(2) + 'K';
    } else {
      return num.toFixed(2);
    }
  };
  
  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40">
        <div className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-green-600" />
          <CardTitle>Energy Usage Estimator</CardTitle>
        </div>
        <CardDescription>
          Calculate the environmental impact of AI token processing
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="token-count" className="text-sm font-medium">
              Token Count
            </label>
            <span className="text-sm text-muted-foreground">
              {formatNumber(tokens)} tokens
            </span>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <Slider 
                id="token-count"
                min={1000} 
                max={1000000000} 
                step={1000}
                value={[tokens]} 
                onValueChange={(value) => setTokens(value[0])}
              />
            </div>
            <div className="w-24">
              <Input
                type="number"
                value={tokens}
                onChange={(e) => setTokens(Number(e.target.value))}
                className="h-8"
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="model-select" className="text-sm font-medium">
            AI Model
          </label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger id="model-select">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(modelCategories).map(([category, models]) => (
                <React.Fragment key={category}>
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    {category}
                  </div>
                  {models.map((modelName) => (
                    <SelectItem key={modelName} value={modelName}>
                      {modelName}
                    </SelectItem>
                  ))}
                </React.Fragment>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="pt-4">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-1">
            Estimated Environmental Impact
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="w-80 p-4">
                  <p className="text-xs">
                    These calculations are estimates based on published research on AI model energy consumption.
                    Actual values may vary based on hardware efficiency, data center location, and other factors.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground">Energy</div>
              <div className="text-lg font-semibold text-green-700 dark:text-green-400">
                {energyEstimate.kwh.toFixed(3)} kWh
              </div>
            </div>
            
            <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground">CO₂ Emissions</div>
              <div className="text-lg font-semibold text-amber-700 dark:text-amber-400">
                {energyEstimate.co2.toFixed(3)} kg
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground">Tree Absorption</div>
              <div className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                {Math.round(energyEstimate.treeDays)} tree days
              </div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground">Car Equivalent</div>
              <div className="text-lg font-semibold text-purple-700 dark:text-purple-400">
                {energyEstimate.carMiles.toFixed(1)} miles
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4 pb-2 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="text-xs text-muted-foreground">
          Based on average data center energy consumption
        </div>
        <Button variant="ghost" size="sm" className="text-xs">
          Learn more
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EnergyUsageEstimator;
