import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { modelOptions } from "@/lib/alternativesData";
import ComparisonCard from "./ComparisonCard";

const ModelAlternatives: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>("all");

  const types = ["all", "Self-Hosted", "Distilled", "Quantized", "Edge", "Cloud API"];
  
  const filteredOptions = selectedType === "all" 
    ? modelOptions 
    : modelOptions.filter(opt => opt.type === selectedType);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Model Alternatives</CardTitle>
          <CardDescription>
            Compare different model deployment strategies and their trade-offs
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
                {type === "all" ? "All Models" : type}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOptions.map((option) => (
              <ComparisonCard
                key={option.id}
                title={option.name}
                description={option.deployment}
                badges={[
                  { label: option.type, variant: "default" },
                  { label: option.size, variant: "secondary" }
                ]}
                metrics={[
                  { label: "Accuracy", value: option.accuracy },
                  { label: "Speed", value: option.speed },
                  { label: "Cost Savings", value: option.costSavings, highlight: true },
                  { label: "Hardware", value: option.hardwareReq }
                ]}
                pros={option.pros}
                cons={option.cons}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Decision Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Model Selection Guide</CardTitle>
          <CardDescription>Choose the right approach for your use case</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">🚀 Need Maximum Quality?</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Use Cloud APIs (Claude, GPT-4) or self-host large models
              </p>
              <Badge>Best for: Complex reasoning, creative tasks</Badge>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">💰 Need Cost Optimization?</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Self-host open models or use distilled/quantized versions
              </p>
              <Badge>Best for: High volume, predictable workloads</Badge>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">⚡ Need Low Latency?</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Deploy edge models or use local inference
              </p>
              <Badge>Best for: Real-time apps, mobile, offline</Badge>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">🔒 Need Privacy?</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Self-host or use edge models - no data leaves your infrastructure
              </p>
              <Badge>Best for: Healthcare, finance, sensitive data</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModelAlternatives;
