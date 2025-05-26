
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface MemoryRequirementsProps {
  calculations: {
    modelSizeGB: number;
    activationMemoryGB: number;
    gradientMemoryGB: number;
    optimizerMemoryGB: number;
    kvCacheMemoryGB: number;
    totalMemoryPerGPU: number;
    totalMemoryGB: number;
    memoryEfficiency: number;
  };
  hardwareConfig: {
    memoryPerGPU: number;
    numGPUs?: number;
  };
  modelParams: {
    numGPUs: number;
  };
}

const COLORS = {
  model: "#3b82f6",
  activations: "#10b981", 
  gradients: "#f59e0b",
  optimizer: "#ef4444",
  tempOverhead: "#8b5cf6"
};

const EstimatedMemoryRequirements: React.FC<MemoryRequirementsProps> = ({ 
  calculations, 
  hardwareConfig, 
  modelParams 
}) => {
  const totalGPUMemory = hardwareConfig.memoryPerGPU * modelParams.numGPUs;
  const memoryUtilization = (calculations.totalMemoryPerGPU / hardwareConfig.memoryPerGPU) * 100;
  const isOverCapacity = memoryUtilization > 100;

  // Prepare pie chart data for training breakdown
  const trainingBreakdownData = [
    { name: "Model Weights", value: calculations.modelSizeGB, color: COLORS.model },
    { name: "Activations", value: calculations.activationMemoryGB, color: COLORS.activations },
    { name: "Gradients", value: calculations.gradientMemoryGB, color: COLORS.gradients },
    { name: "Optimizer States", value: calculations.optimizerMemoryGB, color: COLORS.optimizer },
    { name: "Temp/Overhead", value: calculations.kvCacheMemoryGB, color: COLORS.tempOverhead }
  ].filter(item => item.value > 0);

  // Prepare bar chart data for inference estimate
  const inferenceData = [
    { name: "Activations", value: calculations.activationMemoryGB, color: COLORS.activations },
    { name: "Temp/Overhead", value: calculations.kvCacheMemoryGB, color: COLORS.tempOverhead }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name || label}</p>
          <p className="text-primary">
            {data.value.toFixed(2)} GB
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Estimated Memory Requirements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main memory indicator */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Est. Training VRAM / GPU</span>
            <span className="text-lg font-bold text-red-600">
              {calculations.totalMemoryPerGPU.toFixed(2)} GB / {hardwareConfig.memoryPerGPU} GB ({memoryUtilization.toFixed(0)}%)
            </span>
          </div>
          <Progress 
            value={Math.min(memoryUtilization, 100)} 
            className="h-4"
            style={{
              backgroundColor: isOverCapacity ? '#fee2e2' : '#f3f4f6'
            }}
          />
          {isOverCapacity && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Warning: Estimated VRAM exceeds target GPU capacity!</span>
            </div>
          )}
        </div>

        {/* Two-column layout for charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Training Breakdown */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold bg-gray-100 py-2 px-4 rounded">Training Breakdown</h3>
              <div className="mt-2">
                <div className="text-sm text-muted-foreground">Total / GPU</div>
                <div className="text-2xl font-bold">{calculations.totalMemoryPerGPU.toFixed(2)} GB</div>
              </div>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trainingBreakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {trainingBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="space-y-1">
              {trainingBreakdownData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}:</span>
                  </div>
                  <span className="font-medium">{item.value.toFixed(2)}GB</span>
                </div>
              ))}
            </div>
          </div>

          {/* Inference Estimate */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold bg-gray-100 py-2 px-4 rounded">Inference Estimate</h3>
              <div className="mt-2">
                <div className="text-sm text-muted-foreground">Est. Inference Memory / GPU (BF16)</div>
                <div className="text-2xl font-bold">{calculations.modelSizeGB.toFixed(2)} GB</div>
                <div className="text-xs text-muted-foreground">(Excl. Optimizer/Gradients; Activations vary by arch)</div>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={inferenceData}
                  layout="horizontal"
                  margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    domain={[0, 80]}
                    tickFormatter={(value) => `${value} GB`}
                  />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Bar 
                    dataKey="value" 
                    fill={(entry: any) => entry.color}
                    radius={[0, 4, 4, 0]}
                  >
                    {inferenceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EstimatedMemoryRequirements;
