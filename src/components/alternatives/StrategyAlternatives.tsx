import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { strategyOptions } from "@/lib/alternativesData";
import ComparisonCard from "./ComparisonCard";

const StrategyAlternatives: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["all", "Batch Processing", "Edge Inference", "Caching", "Load Balancing", "Routing"];
  
  const filteredOptions = selectedCategory === "all" 
    ? strategyOptions 
    : strategyOptions.filter(opt => opt.category === selectedCategory);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Inference Strategies</CardTitle>
          <CardDescription>
            Optimize your AI inference with smart deployment and routing strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(category)}
              >
                {category === "all" ? "All Strategies" : category}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOptions.map((option) => (
              <ComparisonCard
                key={option.id}
                title={option.name}
                description={option.description}
                badges={[
                  { label: option.category, variant: "default" },
                  { 
                    label: `${option.complexity} Complexity`, 
                    variant: option.complexity === "Low" ? "default" : 
                            option.complexity === "Medium" ? "secondary" : "destructive" 
                  }
                ]}
                metrics={[
                  { label: "Latency", value: option.latencyReduction },
                  { label: "Cost Savings", value: option.costSavings, highlight: true },
                  { label: "Implementation", value: option.implementation }
                ]}
                pros={option.pros}
                cons={option.cons}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strategy Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Strategy Impact Comparison</CardTitle>
          <CardDescription>Expected improvements by strategy type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Strategy</th>
                  <th className="text-center p-2">Latency</th>
                  <th className="text-center p-2">Cost</th>
                  <th className="text-center p-2">Complexity</th>
                  <th className="text-left p-2">Best Use Case</th>
                </tr>
              </thead>
              <tbody>
                {strategyOptions.map((option) => (
                  <tr key={option.id} className="border-b">
                    <td className="p-2 font-medium">{option.name}</td>
                    <td className="text-center p-2">
                      {option.latencyReduction === "N/A (adds latency)" ? (
                        <Badge variant="destructive">Slower</Badge>
                      ) : (
                        <Badge variant="default" className="bg-green-600">
                          {option.latencyReduction}
                        </Badge>
                      )}
                    </td>
                    <td className="text-center p-2">
                      <Badge variant="default" className="bg-blue-600">
                        {option.costSavings}
                      </Badge>
                    </td>
                    <td className="text-center p-2">
                      <Badge 
                        variant={
                          option.complexity === "Low" ? "default" :
                          option.complexity === "Medium" ? "secondary" : 
                          "destructive"
                        }
                      >
                        {option.complexity}
                      </Badge>
                    </td>
                    <td className="p-2 text-xs">{option.bestFor[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Quick implementation guide for each strategy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {strategyOptions.map((option, idx) => (
              <div key={option.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold">{idx + 1}. {option.name}</h4>
                  <Badge variant={
                    option.complexity === "Low" ? "default" :
                    option.complexity === "Medium" ? "secondary" : 
                    "destructive"
                  }>
                    {option.complexity}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {option.description}
                </p>
                <div className="text-xs bg-muted p-2 rounded">
                  <strong>Implementation:</strong> {option.implementation}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StrategyAlternatives;
