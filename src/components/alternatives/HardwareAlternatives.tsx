import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { hardwareOptions } from "@/lib/alternativesData";
import ComparisonCard from "./ComparisonCard";
import { Badge } from "@/components/ui/badge";

const HardwareAlternatives: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>("all");

  const types = ["all", "GPU", "TPU", "ASIC", "CPU"];
  
  const filteredOptions = selectedType === "all" 
    ? hardwareOptions 
    : hardwareOptions.filter(opt => opt.type === selectedType);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hardware Alternatives</CardTitle>
          <CardDescription>
            Compare GPUs, TPUs, ASICs, and CPU-only solutions for AI workloads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            {types.map((type) => (
              <Badge
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedType(type)}
              >
                {type === "all" ? "All Hardware" : type}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOptions.map((option) => (
              <ComparisonCard
                key={option.id}
                title={option.name}
                description={option.vendor}
                badges={[
                  { label: option.type, variant: "default" },
                  { 
                    label: option.availability, 
                    variant: option.availability === "High" ? "default" : 
                            option.availability === "Medium" ? "secondary" : "destructive" 
                  }
                ]}
                metrics={[
                  { label: "Memory", value: option.memory },
                  { label: "Performance", value: option.performance },
                  { label: "Power", value: option.powerConsumption },
                  { label: "Cost/Hour", value: `$${option.costPerHour}`, highlight: true }
                ]}
                pros={option.pros}
                cons={option.cons}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Cost Comparison</CardTitle>
          <CardDescription>Monthly costs for 24/7 operation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Hardware</th>
                  <th className="text-right p-2">$/Hour</th>
                  <th className="text-right p-2">$/Day</th>
                  <th className="text-right p-2">$/Month</th>
                  <th className="text-right p-2">Savings vs H100</th>
                </tr>
              </thead>
              <tbody>
                {hardwareOptions.map((option) => {
                  const monthly = option.costPerHour * 24 * 30;
                  const h100Monthly = hardwareOptions[0].costPerHour * 24 * 30;
                  const savings = ((h100Monthly - monthly) / h100Monthly * 100).toFixed(0);
                  
                  return (
                    <tr key={option.id} className="border-b">
                      <td className="p-2 font-medium">{option.name}</td>
                      <td className="text-right p-2">${option.costPerHour.toFixed(2)}</td>
                      <td className="text-right p-2">${(option.costPerHour * 24).toFixed(2)}</td>
                      <td className="text-right p-2 font-semibold">${monthly.toFixed(2)}</td>
                      <td className="text-right p-2">
                        {option.id === 'nvidia-h100' ? (
                          <Badge variant="secondary">Baseline</Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-600">
                            {savings}% saved
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HardwareAlternatives;
