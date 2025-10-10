import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { batchingStrategies, costComparison, batchSizeOptimization } from "@/lib/batchProcessingData";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingDown, Clock, DollarSign, Layers } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const BatchProcessingOptimizer: React.FC = () => {
  const [inputTokens, setInputTokens] = useState(500);
  const [outputTokens, setOutputTokens] = useState(300);
  const [requestsPerDay, setRequestsPerDay] = useState(10000);
  const [costPer1MInput, setCostPer1MInput] = useState(3); // Claude Sonnet pricing
  const [costPer1MOutput, setCostPer1MOutput] = useState(15);
  const [currentApproach, setCurrentApproach] = useState<"real-time" | "batch">("real-time");
  const [maxAcceptableLatency, setMaxAcceptableLatency] = useState(5); // minutes

  const calculations = useMemo(() => {
    const costPerRequest = (
      (inputTokens / 1_000_000) * costPer1MInput +
      (outputTokens / 1_000_000) * costPer1MOutput
    );

    const realTimeCost = {
      perRequest: costPerRequest,
      daily: costPerRequest * requestsPerDay,
      monthly: costPerRequest * requestsPerDay * 30,
      yearly: costPerRequest * requestsPerDay * 365,
      overhead: costPerRequest * 0.1 // 10% API overhead
    };

    // Batch processing can reduce costs by 40-60% through:
    // - Combining multiple requests
    // - Reduced API call overhead
    // - Better rate limit management
    const batchSavings = 0.5; // 50% average savings
    
    const batchCost = {
      perRequest: costPerRequest * (1 - batchSavings),
      daily: costPerRequest * requestsPerDay * (1 - batchSavings),
      monthly: costPerRequest * requestsPerDay * 30 * (1 - batchSavings),
      yearly: costPerRequest * requestsPerDay * 365 * (1 - batchSavings),
      overhead: costPerRequest * 0.02 // 2% overhead with batching
    };

    const savings = {
      perRequest: realTimeCost.perRequest - batchCost.perRequest,
      daily: realTimeCost.daily - batchCost.daily,
      monthly: realTimeCost.monthly - batchCost.monthly,
      yearly: realTimeCost.yearly - batchCost.yearly,
      percentage: ((realTimeCost.monthly - batchCost.monthly) / realTimeCost.monthly * 100)
    };

    return { realTimeCost, batchCost, savings };
  }, [inputTokens, outputTokens, requestsPerDay, costPer1MInput, costPer1MOutput]);

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configure Your Workload</CardTitle>
          <CardDescription>Enter your current processing parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Avg Input Tokens per Request</Label>
              <Input
                type="number"
                value={inputTokens}
                onChange={(e) => setInputTokens(Number(e.target.value))}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Avg Output Tokens per Request</Label>
              <Input
                type="number"
                value={outputTokens}
                onChange={(e) => setOutputTokens(Number(e.target.value))}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Requests per Day</Label>
              <Input
                type="number"
                value={requestsPerDay}
                onChange={(e) => setRequestsPerDay(Number(e.target.value))}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Max Acceptable Latency (minutes)</Label>
              <Input
                type="number"
                value={maxAcceptableLatency}
                onChange={(e) => setMaxAcceptableLatency(Number(e.target.value))}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Cost per 1M Input Tokens ($)</Label>
              <Input
                type="number"
                step="0.1"
                value={costPer1MInput}
                onChange={(e) => setCostPer1MInput(Number(e.target.value))}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Cost per 1M Output Tokens ($)</Label>
              <Input
                type="number"
                step="0.1"
                value={costPer1MOutput}
                onChange={(e) => setCostPer1MOutput(Number(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Current Processing Approach</Label>
            <RadioGroup value={currentApproach} onValueChange={(v: any) => setCurrentApproach(v)} className="mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="real-time" id="real-time" />
                <Label htmlFor="real-time" className="font-normal cursor-pointer">
                  Real-time Processing (immediate responses)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="batch" id="batch" />
                <Label htmlFor="batch" className="font-normal cursor-pointer">
                  Batch Processing (scheduled, delayed)
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Cost Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              Real-time Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${calculations.realTimeCost.monthly.toFixed(0)}</div>
            <div className="text-sm text-muted-foreground">per month</div>
            <div className="text-xs text-muted-foreground mt-2">
              ${calculations.realTimeCost.daily.toFixed(2)}/day • ${calculations.realTimeCost.yearly.toFixed(0)}/year
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="h-4 w-4 text-green-600" />
              Batch Processing Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ${calculations.batchCost.monthly.toFixed(0)}
            </div>
            <div className="text-sm text-muted-foreground">per month</div>
            <div className="text-xs text-muted-foreground mt-2">
              ${calculations.batchCost.daily.toFixed(2)}/day • ${calculations.batchCost.yearly.toFixed(0)}/year
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-green-600" />
              Potential Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ${calculations.savings.monthly.toFixed(0)}
            </div>
            <div className="text-sm text-muted-foreground">per month ({calculations.savings.percentage.toFixed(0)}%)</div>
            <div className="text-xs text-green-600 mt-2 font-semibold">
              ${calculations.savings.yearly.toFixed(0)} annual savings
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Details */}
      <Card>
        <CardHeader>
          <CardTitle>Approach Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg mb-2">{costComparison.realTime.name}</h4>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm font-medium text-green-600 mb-1">Pros:</div>
                    <ul className="text-sm space-y-1">
                      {costComparison.realTime.pros.map((pro, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-red-600 mb-1">Cons:</div>
                    <ul className="text-sm space-y-1">
                      {costComparison.realTime.cons.map((con, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-red-600 mt-0.5">✗</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg mb-2">{costComparison.batch.name}</h4>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm font-medium text-green-600 mb-1">Pros:</div>
                    <ul className="text-sm space-y-1">
                      {costComparison.batch.pros.map((pro, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-red-600 mb-1">Cons:</div>
                    <ul className="text-sm space-y-1">
                      {costComparison.batch.cons.map((con, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-red-600 mt-0.5">✗</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Batching Strategies */}
      <Card>
        <CardHeader>
          <CardTitle>Batching Strategies</CardTitle>
          <CardDescription>Different approaches to batch processing optimization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {batchingStrategies.map(strategy => (
              <div key={strategy.name} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold">{strategy.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{strategy.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className="bg-green-600">{strategy.savings}</Badge>
                    <Badge variant={
                      strategy.complexity === "Low" ? "default" :
                      strategy.complexity === "Medium" ? "secondary" : "destructive"
                    }>
                      {strategy.complexity}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-sm">
                  <div>
                    <div className="font-medium mb-1">Best For:</div>
                    <ul className="space-y-1">
                      {strategy.bestFor.map((item, idx) => (
                        <li key={idx} className="text-muted-foreground">• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Considerations:</div>
                    <ul className="space-y-1">
                      {strategy.considerations.map((item, idx) => (
                        <li key={idx} className="text-muted-foreground">• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-3 p-2 bg-muted rounded text-xs font-mono">
                  {strategy.implementation}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Batch Size Optimization */}
      <Card>
        <CardHeader>
          <CardTitle>Batch Size Optimization</CardTitle>
          <CardDescription>Impact of batch size on cost and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch Size</TableHead>
                <TableHead>API Overhead</TableHead>
                <TableHead>Throughput</TableHead>
                <TableHead>Cost Efficiency</TableHead>
                <TableHead>Recommendation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batchSizeOptimization.map(opt => (
                <TableRow key={opt.batchSize}>
                  <TableCell className="font-medium">{opt.batchSize}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={parseInt(opt.overhead)} className="w-20" />
                      <span className="text-sm">{opt.overhead}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      opt.throughput === "Very High" || opt.throughput === "High" ? "default" : "secondary"
                    }>
                      {opt.throughput}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={opt.costEfficiency === "Excellent" ? "default" : "secondary"}>
                      {opt.costEfficiency}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {opt.recommendation}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default BatchProcessingOptimizer;
