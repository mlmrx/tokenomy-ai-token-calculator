
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface InferenceMemoryData {
  modelSizeGB: number;
  kvCacheMemoryGB: number;
  totalAvailableGB: number;
}

interface InferenceMemoryChartProps {
  data: InferenceMemoryData;
}

const InferenceMemoryChart: React.FC<InferenceMemoryChartProps> = ({ data }) => {
  const totalUsed = data.modelSizeGB + data.kvCacheMemoryGB;
  const utilization = (totalUsed / data.totalAvailableGB) * 100;
  
  const modelPercentage = (data.modelSizeGB / data.totalAvailableGB) * 100;
  const kvCachePercentage = (data.kvCacheMemoryGB / data.totalAvailableGB) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Inference Memory Usage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Model Parameters</span>
            <span className="font-medium">{data.modelSizeGB.toFixed(1)} GB</span>
          </div>
          <Progress value={modelPercentage} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>KV Cache</span>
            <span className="font-medium">{data.kvCacheMemoryGB.toFixed(1)} GB</span>
          </div>
          <Progress value={kvCachePercentage} className="h-2" />
        </div>
        
        <div className="border-t pt-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Usage</span>
            <span className="font-bold text-lg">
              {totalUsed.toFixed(1)} / {data.totalAvailableGB} GB
            </span>
          </div>
          <div className="mt-2">
            <Progress 
              value={utilization} 
              className={`h-3 ${utilization > 90 ? 'bg-red-100' : utilization > 70 ? 'bg-yellow-100' : 'bg-green-100'}`}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0%</span>
            <span className={`font-medium ${utilization > 90 ? 'text-red-600' : utilization > 70 ? 'text-yellow-600' : 'text-green-600'}`}>
              {utilization.toFixed(1)}%
            </span>
            <span>100%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InferenceMemoryChart;
