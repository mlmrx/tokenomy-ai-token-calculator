
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface MemoryBreakdownData {
  modelSizeGB: number;
  activationMemoryGB: number;
  gradientMemoryGB: number;
  optimizerMemoryGB: number;
  kvCacheMemoryGB: number;
}

interface MemoryBreakdownChartProps {
  data: MemoryBreakdownData;
}

const COLORS = {
  model: "#8884d8",
  activation: "#82ca9d",
  gradient: "#ffc658",
  optimizer: "#ff7300",
  kvCache: "#00c49f"
};

const MemoryBreakdownChart: React.FC<MemoryBreakdownChartProps> = ({ data }) => {
  const chartData = [
    { name: "Model Parameters", value: data.modelSizeGB, color: COLORS.model },
    { name: "Activations", value: data.activationMemoryGB, color: COLORS.activation },
    { name: "Gradients", value: data.gradientMemoryGB, color: COLORS.gradient },
    { name: "Optimizer States", value: data.optimizerMemoryGB, color: COLORS.optimizer },
    { name: "KV Cache", value: data.kvCacheMemoryGB, color: COLORS.kvCache }
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-primary">
            {data.value.toFixed(2)} GB ({((data.value / chartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Memory Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry) => (
                  <span style={{ color: entry.color }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MemoryBreakdownChart;
