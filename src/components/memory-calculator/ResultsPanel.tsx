
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

interface ResultsPanelProps {
  calculations: any;
  costEnergy: any;
  hardwareConfig: any;
  modelParams: any;
  optimizationFlags: any;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({
  calculations,
  costEnergy,
  hardwareConfig,
  modelParams,
  optimizationFlags
}) => {
  const memoryUtilization = (calculations.totalMemoryPerGPU / hardwareConfig.memoryPerGPU) * 100;
  const gradientAccumulationSteps = Math.ceil(modelParams.batchSize / (modelParams.microBatchSizePerGPU * modelParams.numGPUs));
  const chinchillaOptimalTokens = calculations.parameterCount * 20; // Chinchilla scaling law approximation
  
  // Calculate active parameters for MoE
  const activeParams = optimizationFlags.moe.enabled 
    ? calculations.parameterCount * (optimizationFlags.moe.topK / optimizationFlags.moe.experts)
    : calculations.parameterCount;

  return (
    <div className="space-y-6">
      {/* Parameter & Training Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Parameter & Training Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {(calculations.parameterCount / 1e9).toFixed(2)} B {optimizationFlags.moe.enabled ? "(MoE)" : ""}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Parameters
                </div>
                <div className="text-xs text-muted-foreground">
                  ({(calculations.parameterCount / 1e9).toFixed(2)} B)
                </div>
              </div>

              <div>
                <div className="text-2xl font-bold text-green-600">
                  {(calculations.parameterCount / 1e9).toFixed(2)} B
                </div>
                <div className="text-sm text-muted-foreground">
                  Trainable Parameters
                </div>
                <div className="text-xs text-muted-foreground">
                  (100.00% of total)
                </div>
              </div>

              {optimizationFlags.moe.enabled && (
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {(activeParams / 1e9).toFixed(2)} B
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Active Parameters / Token (MoE)
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ({((activeParams / calculations.parameterCount) * 100).toFixed(2)}% of total)
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {gradientAccumulationSteps}
                </div>
                <div className="text-sm text-muted-foreground">
                  Gradient Accumulation Steps
                </div>
                <div className="text-xs text-muted-foreground">
                  Needed to reach Global Batch Size of {modelParams.batchSize} with {modelParams.microBatchSizePerGPU} micro-batch / GPU across {modelParams.numGPUs} GPU(s).
                </div>
              </div>

              <div>
                <div className="text-2xl font-bold text-indigo-600">
                  {(chinchillaOptimalTokens / 1e9).toFixed(2)} B
                </div>
                <div className="text-sm text-muted-foreground">
                  Chinchilla Optimal Tokens (Approx)
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Memory Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estimated Memory Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-semibold">
                  Est. Training VRAM / GPU
                </span>
                <div className="text-right">
                  <div className="text-xl font-bold">
                    {calculations.totalMemoryPerGPU.toFixed(2)} GB / {hardwareConfig.memoryPerGPU} GB
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ({memoryUtilization.toFixed(0)}%)
                  </div>
                </div>
              </div>
              
              <Progress value={Math.min(memoryUtilization, 100)} className="h-3" />
              
              {memoryUtilization > 100 && (
                <Alert className="mt-3">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Warning:</strong> Estimated VRAM exceeds target GPU capacity!
                  </AlertDescription>
                </Alert>
              )}
              
              {memoryUtilization > 95 && memoryUtilization <= 100 && (
                <Alert className="mt-3">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Memory usage is very high. Consider optimizations.
                  </AlertDescription>
                </Alert>
              )}
              
              {memoryUtilization <= 95 && (
                <Alert className="mt-3 border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Memory usage is within acceptable range.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Training Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Inference Estimate</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total / GPU</span>
                  <span className="font-medium">{calculations.totalMemoryPerGPU.toFixed(2)} GB</span>
                </div>
                <div className="flex justify-between">
                  <span>Model Weights / GPU</span>
                  <span className="font-medium">{(calculations.modelSizeGB / modelParams.numGPUs).toFixed(2)} GB</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Model Weights:</span>
                    <span>{calculations.modelSizeGB.toFixed(1)}GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Activations:</span>
                    <span>{calculations.activationMemoryGB.toFixed(1)}GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Optimizer States:</span>
                    <span>{calculations.optimizerMemoryGB.toFixed(1)}GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gradients:</span>
                    <span>{calculations.gradientMemoryGB.toFixed(1)}GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Temp/Overhead:</span>
                    <span>{calculations.kvCacheMemoryGB.toFixed(1)}GB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disk Storage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estimated Disk Sizes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-lg font-bold">{calculations.modelSizeGB.toFixed(2)} GB</div>
              <div className="text-sm text-muted-foreground">Model Weights</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-lg font-bold">{calculations.optimizerMemoryGB.toFixed(2)} GB</div>
              <div className="text-sm text-muted-foreground">Optimizer State</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-lg font-bold">{(calculations.modelSizeGB + calculations.optimizerMemoryGB).toFixed(2)} GB</div>
              <div className="text-sm text-muted-foreground">Full Checkpoint</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training Cost & Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estimated Training Cost & Impact</CardTitle>
          <p className="text-sm text-muted-foreground">
            Based on hardware selection and training parameters.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-xl font-bold">{costEnergy.trainingSteps.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Training Steps</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{costEnergy.tokensPerSecondPerGPU.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Tokens/Sec/GPU</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{costEnergy.gridCarbonIntensity}</div>
              <div className="text-sm text-muted-foreground">Grid Carbon Intensity</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {costEnergy.trainingTimeHours.toFixed(1)} hrs
              </div>
              <div className="text-sm text-muted-foreground">
                Wall Time
              </div>
              <div className="text-xs text-muted-foreground">
                ({(costEnergy.trainingTimeHours * modelParams.numGPUs / 1000).toFixed(1)} K GPU hrs)
              </div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {costEnergy.energyKWh.toFixed(0)} kWh
              </div>
              <div className="text-sm text-muted-foreground">Energy Use</div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-lg font-bold text-orange-600">
                {costEnergy.carbonKg.toFixed(2)} kg CO₂e
              </div>
              <div className="text-sm text-muted-foreground">CO₂ Emissions</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg md:col-span-2">
              <div className="text-lg font-bold text-purple-600">
                ${(costEnergy.totalCost / 1000).toFixed(2)} K
              </div>
              <div className="text-sm text-muted-foreground">Cloud Cost</div>
              <div className="text-xs text-muted-foreground">
                ${(costEnergy.totalCost / costEnergy.trainingTimeHours).toFixed(3)}/hr (AWS p5.48xlarge (8xH100-80) (AWS Pricing (us-east-1, On-Demand, ~2024)))
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              Cost and energy are rough estimates. Actual values depend heavily on workload, efficiency, cooling, specific instance pricing, and utilization.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsPanel;
