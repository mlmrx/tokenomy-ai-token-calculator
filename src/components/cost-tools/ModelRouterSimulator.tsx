import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { providerModels } from "@/lib/providerData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitBranch, TrendingDown, Zap, Award, DollarSign } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface RoutingRule {
  condition: string;
  model: typeof providerModels[0];
  percentage: number;
}

const ModelRouterSimulator: React.FC = () => {
  const [requestsPerDay, setRequestsPerDay] = useState(10000);
  const [avgInputTokens, setAvgInputTokens] = useState(500);
  const [avgOutputTokens, setAvgOutputTokens] = useState(300);
  
  // Routing weights
  const [priorityCost, setPriorityCost] = useState(7);
  const [prioritySpeed, setPrioritySpeed] = useState(6);
  const [priorityQuality, setPriorityQuality] = useState(8);

  // Task distribution
  const [simpleTasksPercent, setSimpleTasksPercent] = useState(60);
  const [mediumTasksPercent, setMediumTasksPercent] = useState(30);
  const [complexTasksPercent, setComplexTasksPercent] = useState(10);

  const calculations = useMemo(() => {
    // Define model tiers
    const cheapModels = providerModels.filter(m => 
      m.inputCostPer1M <= 1 && m.qualityScore >= 7
    ).sort((a, b) => a.inputCostPer1M - b.inputCostPer1M);

    const balancedModels = providerModels.filter(m => 
      m.inputCostPer1M > 1 && m.inputCostPer1M <= 5 && m.qualityScore >= 8
    ).sort((a, b) => b.qualityScore - a.qualityScore);

    const premiumModels = providerModels.filter(m => 
      m.inputCostPer1M > 5 && m.qualityScore >= 9
    ).sort((a, b) => b.qualityScore - a.qualityScore);

    const simpleModel = cheapModels[0] || providerModels[0];
    const mediumModel = balancedModels[0] || providerModels[1];
    const complexModel = premiumModels[0] || providerModels[2];

    // Calculate costs for each approach
    
    // Single model (premium) approach
    const singleModelCost = (
      (avgInputTokens / 1_000_000) * complexModel.inputCostPer1M +
      (avgOutputTokens / 1_000_000) * complexModel.outputCostPer1M
    ) * requestsPerDay * 30;

    // Smart routing approach
    const simpleRequests = requestsPerDay * (simpleTasksPercent / 100);
    const mediumRequests = requestsPerDay * (mediumTasksPercent / 100);
    const complexRequests = requestsPerDay * (complexTasksPercent / 100);

    const simpleCost = (
      (avgInputTokens / 1_000_000) * simpleModel.inputCostPer1M +
      (avgOutputTokens / 1_000_000) * simpleModel.outputCostPer1M
    ) * simpleRequests * 30;

    const mediumCost = (
      (avgInputTokens / 1_000_000) * mediumModel.inputCostPer1M +
      (avgOutputTokens / 1_000_000) * mediumModel.outputCostPer1M
    ) * mediumRequests * 30;

    const complexCost = (
      (avgInputTokens / 1_000_000) * complexModel.inputCostPer1M +
      (avgOutputTokens / 1_000_000) * complexModel.outputCostPer1M
    ) * complexRequests * 30;

    const smartRoutingCost = simpleCost + mediumCost + complexCost;
    const savings = singleModelCost - smartRoutingCost;
    const savingsPercent = (savings / singleModelCost) * 100;

    // Calculate average metrics
    const avgQuality = (
      (simpleModel.qualityScore * simpleTasksPercent +
       mediumModel.qualityScore * mediumTasksPercent +
       complexModel.qualityScore * complexTasksPercent) / 100
    );

    const avgSpeed = (
      (simpleModel.speedTokensPerSec * simpleTasksPercent +
       mediumModel.speedTokensPerSec * mediumTasksPercent +
       complexModel.speedTokensPerSec * complexTasksPercent) / 100
    );

    return {
      singleModelCost,
      smartRoutingCost,
      savings,
      savingsPercent,
      simpleModel,
      mediumModel,
      complexModel,
      simpleCost,
      mediumCost,
      complexCost,
      avgQuality,
      avgSpeed,
      singleModelQuality: complexModel.qualityScore,
      singleModelSpeed: complexModel.speedTokensPerSec
    };
  }, [
    requestsPerDay,
    avgInputTokens,
    avgOutputTokens,
    simpleTasksPercent,
    mediumTasksPercent,
    complexTasksPercent
  ]);

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Configure Smart Routing
          </CardTitle>
          <CardDescription>
            Define your workload distribution to see how smart routing can reduce costs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label>Requests per Day</Label>
              <div className="text-2xl font-bold mt-1">{requestsPerDay.toLocaleString()}</div>
              <Slider
                value={[requestsPerDay]}
                onValueChange={([v]) => setRequestsPerDay(v)}
                min={1000}
                max={100000}
                step={1000}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Avg Input Tokens</Label>
              <div className="text-2xl font-bold mt-1">{avgInputTokens}</div>
              <Slider
                value={[avgInputTokens]}
                onValueChange={([v]) => setAvgInputTokens(v)}
                min={50}
                max={5000}
                step={50}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Avg Output Tokens</Label>
              <div className="text-2xl font-bold mt-1">{avgOutputTokens}</div>
              <Slider
                value={[avgOutputTokens]}
                onValueChange={([v]) => setAvgOutputTokens(v)}
                min={50}
                max={2000}
                step={50}
                className="mt-2"
              />
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h4 className="font-semibold">Task Distribution</h4>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Simple Tasks ({simpleTasksPercent}%)</Label>
                <Badge variant="secondary">Low complexity</Badge>
              </div>
              <Slider
                value={[simpleTasksPercent]}
                onValueChange={([v]) => {
                  const remaining = 100 - v;
                  setSimpleTasksPercent(v);
                  const ratio = mediumTasksPercent / (mediumTasksPercent + complexTasksPercent) || 0.5;
                  setMediumTasksPercent(Math.round(remaining * ratio));
                  setComplexTasksPercent(Math.round(remaining * (1 - ratio)));
                }}
                min={0}
                max={100}
                step={5}
                className="mt-2"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Medium Tasks ({mediumTasksPercent}%)</Label>
                <Badge variant="secondary">Medium complexity</Badge>
              </div>
              <Slider
                value={[mediumTasksPercent]}
                onValueChange={([v]) => {
                  const remaining = 100 - simpleTasksPercent - v;
                  setMediumTasksPercent(v);
                  setComplexTasksPercent(remaining);
                }}
                min={0}
                max={100 - simpleTasksPercent}
                step={5}
                className="mt-2"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Complex Tasks ({complexTasksPercent}%)</Label>
                <Badge variant="destructive">High complexity</Badge>
              </div>
              <Progress value={complexTasksPercent} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Single Model Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${calculations.singleModelCost.toFixed(0)}</div>
            <div className="text-sm text-muted-foreground">per month</div>
            <div className="mt-2 text-xs">
              <div>Using: {calculations.complexModel.model}</div>
              <div className="text-muted-foreground">For all requests</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Smart Routing Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ${calculations.smartRoutingCost.toFixed(0)}
            </div>
            <div className="text-sm text-muted-foreground">per month</div>
            <div className="mt-2 text-xs">
              <div>Using: 3 models</div>
              <div className="text-muted-foreground">Based on complexity</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-green-600" />
              Monthly Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ${calculations.savings.toFixed(0)}
            </div>
            <div className="text-sm text-muted-foreground">
              {calculations.savingsPercent.toFixed(1)}% reduction
            </div>
            <div className="text-xs text-green-600 mt-2 font-semibold">
              ${(calculations.savings * 12).toFixed(0)} annual savings
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Routing Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Smart Routing Strategy</CardTitle>
          <CardDescription>How requests are distributed across models</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Simple Tasks */}
            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-semibold">{calculations.simpleModel.model}</h4>
                    <p className="text-sm text-muted-foreground">{calculations.simpleModel.provider}</p>
                  </div>
                </div>
                <Badge variant="secondary">{simpleTasksPercent}% of traffic</Badge>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-3 text-sm">
                <div>
                  <div className="text-muted-foreground">Requests/day</div>
                  <div className="font-semibold">
                    {Math.round(requestsPerDay * (simpleTasksPercent / 100)).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Monthly cost</div>
                  <div className="font-semibold">${calculations.simpleCost.toFixed(0)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Quality</div>
                  <div className="font-semibold">{calculations.simpleModel.qualityScore}/10</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Speed</div>
                  <div className="font-semibold">{calculations.simpleModel.speedTokensPerSec} t/s</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Best for: Classification, simple Q&A, sentiment analysis
              </div>
            </div>

            {/* Medium Tasks */}
            <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-950/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-purple-600" />
                  <div>
                    <h4 className="font-semibold">{calculations.mediumModel.model}</h4>
                    <p className="text-sm text-muted-foreground">{calculations.mediumModel.provider}</p>
                  </div>
                </div>
                <Badge variant="secondary">{mediumTasksPercent}% of traffic</Badge>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-3 text-sm">
                <div>
                  <div className="text-muted-foreground">Requests/day</div>
                  <div className="font-semibold">
                    {Math.round(requestsPerDay * (mediumTasksPercent / 100)).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Monthly cost</div>
                  <div className="font-semibold">${calculations.mediumCost.toFixed(0)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Quality</div>
                  <div className="font-semibold">{calculations.mediumModel.qualityScore}/10</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Speed</div>
                  <div className="font-semibold">{calculations.mediumModel.speedTokensPerSec} t/s</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Best for: Content generation, code review, data analysis
              </div>
            </div>

            {/* Complex Tasks */}
            <div className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-950/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-amber-600" />
                  <div>
                    <h4 className="font-semibold">{calculations.complexModel.model}</h4>
                    <p className="text-sm text-muted-foreground">{calculations.complexModel.provider}</p>
                  </div>
                </div>
                <Badge variant="destructive">{complexTasksPercent}% of traffic</Badge>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-3 text-sm">
                <div>
                  <div className="text-muted-foreground">Requests/day</div>
                  <div className="font-semibold">
                    {Math.round(requestsPerDay * (complexTasksPercent / 100)).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Monthly cost</div>
                  <div className="font-semibold">${calculations.complexCost.toFixed(0)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Quality</div>
                  <div className="font-semibold">{calculations.complexModel.qualityScore}/10</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Speed</div>
                  <div className="font-semibold">{calculations.complexModel.speedTokensPerSec} t/s</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Best for: Complex reasoning, research, creative writing
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Guide */}
      <Card>
        <CardHeader>
          <CardTitle>How to Implement Smart Routing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">1. Task Classification</h4>
              <p className="text-sm text-muted-foreground">
                Use a lightweight classifier to categorize incoming requests by complexity. 
                Consider input length, question type, and required reasoning depth.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">2. Route to Appropriate Model</h4>
              <p className="text-sm text-muted-foreground">
                Based on classification, route to: Fast/cheap models for simple tasks, 
                balanced models for medium tasks, premium models for complex reasoning.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">3. Monitor & Optimize</h4>
              <p className="text-sm text-muted-foreground">
                Track quality metrics per route, adjust distribution based on results, 
                A/B test routing rules to maximize quality/cost ratio.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">4. Fallback Strategy</h4>
              <p className="text-sm text-muted-foreground">
                If a cheaper model fails or produces low-quality output, automatically 
                retry with a higher-tier model. This ensures quality while optimizing cost.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModelRouterSimulator;
